// 斜め上から見た 3D 表示。キャラは紙人形の板（手足は関節で回転）、足元に丸影。
// 演出（火花・閃光・衝撃波・画面揺れ・ダメージ数字・KO）は見た目専用で、戦闘計算には影響しない。
import * as THREE from "three";
import { CANVAS_SIZE } from "../detect";
import { ARENA_RADIUS, type BattleEvent, type Fighter, type World } from "../sim/world";
import type { CharacterBuild } from "./character";
import { arcTexture, glowTexture, Particles, Popups, ringTexture, sparkTexture, starTexture, type Flash } from "./fx";
import { ProjectileVisual, SpecialTextures } from "./specialfx";
import { specialCharge } from "../sim/world";

const TILT = -0.26; // カメラ側へ約15°後傾
const PROJ_COLORS = [0xff7a1a, 0x9b5cff];
const HIT_COLOR = 0xffe08a;
const GUARD_COLOR = 0x5cc8ff;

interface LimbVisual { pivot: THREE.Object3D; kind: "hand" | "foot"; nth: number }

class FighterVisual {
  root = new THREE.Group();
  body = new THREE.Group(); // 傾き・上下
  flip = new THREE.Group(); // 左右反転
  spin = new THREE.Group(); // 転がり（絵の中心で回す）
  shadow: THREE.Mesh;
  guard: THREE.Mesh;
  rootRing: THREE.Mesh;
  swing: THREE.Mesh;
  aura: THREE.Sprite;
  limbs: LimbVisual[] = [];
  materials: THREE.MeshBasicMaterial[] = [];
  flipCur = 1;
  flipTarget = 1;
  squash = 0; // 被弾時のつぶれ
  koT = 0;
  roll = 0; // 転がりの回転角

  constructor(build: CharacterBuild, teamColor: number, tex: { arc: THREE.Texture; ring: THREE.Texture; glow: THREE.Texture }, disposables: { dispose(): void }[]) {
    const { parts, res, scale: k, originX } = build;
    const b = parts.bounds;
    const pad = 4;
    const x0 = Math.max(0, b.x0 - pad), y0 = Math.max(0, b.y0 - pad);
    const x1 = Math.min(CANVAS_SIZE, b.x1 + pad), y1 = Math.min(CANVAS_SIZE, b.y1 + pad);
    const W = x1 - x0, H = y1 - y0;
    const toLocal = (px: number, py: number) => new THREE.Vector3((px - originX) * k, (b.y1 - py) * k, 0);
    const center = toLocal(x0 + W / 2, y0 + H / 2);
    const geo = new THREE.PlaneGeometry(W * k, H * k);
    disposables.push(geo);

    const makeMesh = (src: HTMLCanvasElement) => {
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      c.getContext("2d")!.drawImage(src, x0, y0, W, H, 0, 0, W, H);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.4, side: THREE.DoubleSide });
      disposables.push(t, mat);
      this.materials.push(mat);
      return new THREE.Mesh(geo, mat);
    };

    const torso = makeMesh(parts.canvases[0]);
    torso.position.copy(center);
    this.flip.add(torso);
    const g = CANVAS_SIZE / res.size;
    const count = { hand: 0, foot: 0 };
    res.limbs.forEach((l, i) => {
      const pivot = new THREE.Object3D();
      const p = toLocal(l.pivot[0] * g, l.pivot[1] * g);
      pivot.position.copy(p);
      pivot.position.z = l.kind === "hand" ? 0.004 : -0.004; // 足は胴体の奥、手は手前
      const mesh = makeMesh(parts.canvases[i + 1]);
      mesh.position.copy(center).sub(p);
      pivot.add(mesh);
      this.flip.add(pivot);
      this.limbs.push({ pivot, kind: l.kind, nth: count[l.kind]++ });
    });

    const shadowGeo = new THREE.CircleGeometry(0.75, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.01;
    this.shadow.scale.set(1, 0.7, 1);
    // 足元の色の輪（自分=橙 / 相手=紫）で、同じ絵同士でも見分けられるようにする
    const teamGeo = new THREE.RingGeometry(0.62, 0.78, 40);
    const teamMat = new THREE.MeshBasicMaterial({ color: teamColor, transparent: true, opacity: 0.85, depthWrite: false });
    const team = new THREE.Mesh(teamGeo, teamMat);
    team.rotation.x = -Math.PI / 2;
    team.position.y = 0.012;
    team.scale.set(1, 0.7, 1);
    this.shadow.add(team);
    team.rotation.x = 0;
    team.position.set(0, 0, 0.001);
    team.scale.set(1, 1, 1);
    disposables.push(teamGeo, teamMat);

    const guardGeo = new THREE.CircleGeometry(1.0, 6);
    const guardMat = new THREE.MeshBasicMaterial({ color: GUARD_COLOR, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending });
    this.guard = new THREE.Mesh(guardGeo, guardMat);
    this.guard.position.set(0, 0.9, 0.3);

    const ringGeo = new THREE.PlaneGeometry(2, 2);
    const ringMat = new THREE.MeshBasicMaterial({ map: tex.ring, color: 0xffd43b, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.rootRing = new THREE.Mesh(ringGeo, ringMat);
    this.rootRing.rotation.x = -Math.PI / 2;
    this.rootRing.position.y = 0.03;

    const swingGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const swingMat = new THREE.MeshBasicMaterial({ map: tex.arc, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    this.swing = new THREE.Mesh(swingGeo, swingMat);
    this.swing.position.set(0.55, 0.95, 0.05);
    this.swing.visible = false;
    disposables.push(shadowGeo, shadowMat, guardGeo, guardMat, ringGeo, ringMat, swingGeo, swingMat);

    // 必殺技を撃てる状態のオーラ
    const auraMat = new THREE.SpriteMaterial({ map: tex.glow, color: teamColor, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.aura = new THREE.Sprite(auraMat);
    this.aura.position.set(0, 0.95, -0.05);
    this.aura.visible = false;
    disposables.push(auraMat);

    this.body.rotation.x = TILT;
    this.root.add(this.aura);
    this.flip.add(this.swing);
    this.spin.position.y = center.y;
    this.flip.position.y = -center.y;
    this.spin.add(this.flip);
    this.body.add(this.spin, this.guard);
    this.root.add(this.shadow, this.rootRing, this.body);
  }

  update(f: Fighter, t: number, dt: number) {
    this.root.position.set(f.x, 0, f.z);
    if (f.fx > 0.08) this.flipTarget = 1;
    else if (f.fx < -0.08) this.flipTarget = -1;
    this.flipCur += (this.flipTarget - this.flipCur) * 0.25; // 向き変更は横反転を補間（紙がくるっと返る）
    const sx = Math.abs(this.flipCur) < 0.02 ? 0.02 : this.flipCur;

    const T = f.cfg.traits;
    const weight = T?.weight ?? 1;
    // 被弾でつぶれて戻る（重いほど大きくつぶれる）
    this.squash = Math.max(0, this.squash - dt * 5);
    const sq = Math.sin(this.squash * Math.PI) * 0.25 * Math.min(1.5, weight);
    this.flip.scale.set(sx * (1 + sq), 1 - sq, 1);

    const walking = f.moving && f.cfg.hasFeet && f.stun === 0;
    // 脚が長いほどゆったり大股、短足はちょこちょこ
    const cadence = 15 - 5 * Math.min(1.6, T?.walk ?? 1);
    this.body.position.y = walking ? Math.abs(Math.sin(t * cadence)) * 0.08 * Math.sqrt(weight) : 0;
    // 足なしは転がる: 進んだ距離だけ回る。止まったら近い向きに起き上がる
    const speed = Math.hypot(f.vx, f.vz);
    if (!f.cfg.hasFeet && f.hp > 0) {
      if (speed > 0.6) this.roll -= ((f.vx >= 0 ? 1 : -1) * speed * dt) / 0.9;
      else {
        const target = Math.round(this.roll / (Math.PI * 2)) * Math.PI * 2;
        this.roll += (target - this.roll) * Math.min(1, dt * 6);
      }
    }
    // 被弾中は体を細かく震わせる（黒い線の絵でも当たったと分かる）
    this.body.position.x = f.hitFlash > 0 ? (Math.random() * 2 - 1) * 0.07 : 0;
    let lean = 0;
    if (!f.cfg.hasHands && f.attack === "active") lean = -0.35; // 体当たりは前のめり
    else if (!f.cfg.hasFeet && f.moving) lean = -0.12; // 足なしは傾いて滑る
    if (f.stun > 0 && !f.guardStun) lean = 0.35; // のけぞり
    if (f.hp <= 0) {
      this.koT = Math.min(1, this.koT + dt * 2.5);
      lean = 1.45 * this.koT; // 倒れる
      this.body.position.y = Math.sin(this.koT * Math.PI) * 0.6;
    }
    this.body.rotation.z = lean * this.flipTarget;
    this.spin.rotation.z = this.roll;
    // 軽いキャラは吹き飛ぶとき回る
    if (f.cfg.hasFeet && Math.hypot(f.kx, f.kz) > 3 && weight < 0.85) this.body.rotation.z += Math.hypot(f.kx, f.kz) * 0.05 * (f.kx >= 0 ? -1 : 1);

    for (const l of this.limbs) {
      let a: number;
      if (f.hp <= 0) a = 0.6;
      else if (l.kind === "foot") a = walking ? Math.sin(t * cadence + l.nth * Math.PI) * 0.45 : 0;
      else if (f.stun > 0 && !f.guardStun) a = Math.sin(t * 30 + l.nth) * 0.5;
      else if (f.attack === "windup") a = 0.8;
      else if (f.attack === "active") {
        // 手が多いと順番に振る（連打）
        const hits = T?.hits ?? 1;
        const turn = hits > 1 ? Math.floor(f.attackT / 2) % hits : 0;
        a = hits > 1 ? (l.nth % hits === turn ? -1.4 : 0.6) : -1.4;
      }
      else if (f.guarding) a = -0.9;
      else a = Math.sin(t * 3 + l.nth * 1.7) * 0.15;
      l.pivot.rotation.z = a;
    }
    this.swing.visible = f.attack === "active" && f.cfg.hasHands;
    if (this.swing.visible) this.swing.rotation.z = -0.4 - f.attackT * 0.35;

    const flash = f.hitFlash > 0;
    const blink = flash && f.hitFlash % 2 === 0;
    for (const m of this.materials) m.color.setRGB(1, blink ? 0.25 : 1, blink ? 0.25 : 1);
    this.guard.visible = f.guarding;
    if (f.guarding) {
      this.guard.rotation.z += dt * 1.5;
      (this.guard.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * 10) * 0.08;
    }
    this.aura.visible = f.charge >= specialCharge && f.hp > 0;
    if (this.aura.visible) {
      const k = 1 + Math.sin(t * 9) * 0.12;
      this.aura.scale.set(2.6 * k, 3.2 * k, 1);
      (this.aura.material as THREE.SpriteMaterial).opacity = 0.75 + Math.sin(t * 13) * 0.2;
    }
    this.rootRing.visible = f.rooted > 0;
    if (this.rootRing.visible) {
      this.rootRing.rotation.z += dt * 4;
      this.rootRing.scale.setScalar(0.8 + Math.sin(t * 8) * 0.08);
    }
  }
}

export class BattleScene {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  private overlay: HTMLDivElement;
  private fighters: FighterVisual[];
  private tex = { glow: glowTexture(), star: starTexture(), ring: ringTexture(), arc: arcTexture(), spark: sparkTexture() };
  private particles: Particles; // 光（加算）
  private sparks: Particles; // 火花・砂ぼこり（通常合成・黒縁）
  private popups: Popups;
  private specialTex = new SpecialTextures(["#ff9a3c", "#b07cff"]);
  private shadowGeo = new THREE.CircleGeometry(1, 24);
  private proj = new Map<number, ProjectileVisual>();
  private combo = new Map<number, number>(); // 多段ヒットの連続数（弾ごと）
  private flashes: Flash[] = [];
  private flashGeo = new THREE.PlaneGeometry(1, 1);
  private disposables: { dispose(): void }[] = [];
  private shake = 0;
  private lastT = 0;
  private camTarget = new THREE.Vector3();
  private camDist = 12;
  private camInit = false;
  private koZoom = 0;
  private lookY = 0.4;

  constructor(private container: HTMLElement, builds: [CharacterBuild, CharacterBuild], private viewer: number) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.overlay = document.createElement("div");
    this.overlay.className = "b-pops";
    container.appendChild(this.overlay);
    this.popups = new Popups(this.overlay);
    this.scene.background = new THREE.Color(0xcfe3f2);
    this.scene.fog = new THREE.Fog(0xcfe3f2, 30, 60);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(ARENA_RADIUS, 72), new THREE.MeshBasicMaterial({ color: 0xe9dcc0 }));
    ground.rotation.x = -Math.PI / 2;
    const edge = new THREE.Mesh(new THREE.RingGeometry(ARENA_RADIUS, ARENA_RADIUS + 0.35, 72), new THREE.MeshBasicMaterial({ color: 0x8c6d46 }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = 0.005;
    const grid = new THREE.PolarGridHelper(ARENA_RADIUS, 8, 4, 64, 0xd6c6a3, 0xd6c6a3);
    grid.position.y = 0.003;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(ARENA_RADIUS + 30, 32), new THREE.MeshBasicMaterial({ color: 0xa9c8a0 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    this.scene.add(floor, ground, edge, grid);
    this.disposables.push(ground.geometry, ground.material as THREE.Material, edge.geometry, edge.material as THREE.Material, floor.geometry, floor.material as THREE.Material, grid);

    this.fighters = builds.map((b, i) => new FighterVisual(b, PROJ_COLORS[i], this.tex, this.disposables));
    for (const f of this.fighters) this.scene.add(f.root);
    this.particles = new Particles(this.tex.glow, true);
    this.sparks = new Particles(this.tex.spark, false);
    this.scene.add(this.sparks.points, this.particles.points);
    this.disposables.push(this.specialTex, this.shadowGeo, this.flashGeo, this.particles, this.sparks,
      this.tex.glow, this.tex.star, this.tex.ring, this.tex.arc, this.tex.spark);
    this.resize();
  }

  resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.particles.setScale(h);
    this.sparks.setScale(h);
  }

  // 2体の中間を追い、離れるほど引く（縦長画面でも2体が横に収まる距離）。KO 時は寄る。
  private updateCamera(w: World, dt: number) {
    const [a, b] = w.fighters;
    const mid = new THREE.Vector3((a.x + b.x) / 2, 0, (a.z + b.z) / 2);
    const sep = Math.hypot(a.x - b.x, a.z - b.z);
    const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const need = Math.max(2.4, sep / 2 + 1.8);
    let dist = Math.max(6, need / Math.tan(hHalf));
    // 打ち上げ弾が高く上がっている間は引いて、落ちてくるところまで見せる
    let high = 0;
    for (const p of w.projectiles) if (p.spec.meteor && (p.spec.visible || p.owner === this.viewer)) high = Math.max(high, p.h + p.spec.size);
    dist += high * 0.9;
    this.lookY += ((high > 1.5 ? high * 0.45 : 0.4) - this.lookY) * 0.08;
    if (w.winner !== -1) {
      this.koZoom = Math.min(1, this.koZoom + dt * 1.5);
      dist *= 1 - 0.3 * this.koZoom;
    } else this.koZoom = 0;
    if (!this.camInit) { this.camTarget.copy(mid); this.camDist = dist; this.camInit = true; }
    this.camTarget.lerp(mid, 0.12);
    this.camDist += (dist - this.camDist) * 0.06;
    const dir = new THREE.Vector3(0, 15, 12).normalize();
    this.camera.position.copy(this.camTarget).addScaledVector(dir, this.camDist);
    this.camera.lookAt(this.camTarget.x, this.lookY, this.camTarget.z + 0.9); // 2体を画面のやや上寄りに（下はボタンが重なるため）
    // 画面揺れ
    if (this.shake > 0) {
      const s = this.shake * this.shake;
      this.camera.position.x += (Math.random() * 2 - 1) * s;
      this.camera.position.y += (Math.random() * 2 - 1) * s;
      this.shake = Math.max(0, this.shake - dt * 2.2);
    }
  }

  private addFlash(tex: THREE.Texture, color: THREE.ColorRepresentation, pos: THREE.Vector3, from: number, to: number, life: number, flat = false, spin = 0) {
    const additive = tex === this.tex.glow;
    const mat = new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide });
    const m = new THREE.Mesh(this.flashGeo, mat);
    m.position.copy(pos);
    if (flat) m.rotation.x = -Math.PI / 2;
    else m.quaternion.copy(this.camera.quaternion);
    m.rotateZ(Math.random() * Math.PI);
    m.scale.setScalar(from);
    this.scene.add(m);
    this.flashes.push({ mesh: m, life, max: life, from, to, spin });
    void spin;
  }

  private onEvent(e: BattleEvent) {
    const pos = new THREE.Vector3(e.x, Math.max(0.5, e.h), e.z);
    const kick: [number, number, number] = [e.dx, 0.35, e.dz];
    switch (e.kind) {
      case "hit": {
        const big = e.src === "special";
        const tags = e.tags ?? [];
        const col = big ? PROJ_COLORS[1 - e.target] : HIT_COLOR;
        const multi = tags.includes("multi");
        const n = multi && e.pid ? (this.combo.get(e.pid) ?? 0) + 1 : 1;
        if (multi && e.pid) this.combo.set(e.pid, n);
        const scale = multi ? 0.7 : 1;
        this.addFlash(this.tex.star, 0xffffff, pos, 0.6 * scale, (big ? 2.6 + e.size : 1.7) * scale, 0.2);
        this.addFlash(this.tex.ring, col, pos, 0.3, (big ? 3.2 : 1.8) * scale, 0.3);
        this.sparks.emit({ count: big ? (multi ? 10 : 30) : 14, x: e.x, y: pos.y, z: e.z, color: col, speed: big ? 9 : 7, spread: 0.55, dir: kick, life: 0.45, size: big ? 0.32 : 0.26, gravity: 9, drag: 2.5 });
        this.particles.emit({ count: 8, x: e.x, y: pos.y, z: e.z, color: 0xffffff, speed: 3, life: 0.25, size: 0.6, grow: -1.5 });
        if (big && !multi) this.addFlash(this.tex.ring, col, new THREE.Vector3(e.x, 0.05, e.z), 0.5, 4 + e.size * 3, 0.45, true);
        if (tags.includes("tiny") && big) this.addFlash(this.tex.glow, 0xffffff, pos, 0.5, 4, 0.15); // 豆粒は鋭く光る
        this.shake = Math.max(this.shake, big ? (multi ? 0.3 : 0.55 + e.size * 0.2) : 0.32);
        this.fighters[e.target].squash = 1;
        const top = pos.clone().setY(pos.y + 0.9);
        this.popups.add(String(Math.max(1, Math.round(e.amount))), top.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0, 0)), big ? "big" : "");
        if (multi && n >= 2) this.popups.add(`${n} HIT!`, top.clone().setY(top.y + 0.7), "combo");
        if (e.restrained) this.popups.add("拘束!", top.clone().setY(top.y + 0.5), "bind");
        break;
      }
      case "guard": {
        this.addFlash(this.tex.ring, GUARD_COLOR, pos, 0.5, 2.0, 0.25);
        this.sparks.emit({ count: 12, x: e.x, y: pos.y, z: e.z, color: GUARD_COLOR, speed: 5, spread: 0.7, dir: [-e.dx, 0.3, -e.dz], life: 0.35, size: 0.22, drag: 4 });
        this.shake = Math.max(this.shake, 0.15);
        this.popups.add("ガード", pos.clone().setY(pos.y + 0.9), "guard");
        break;
      }
      case "shoot": {
        const col = PROJ_COLORS[e.target];
        const p = new THREE.Vector3(e.x + e.dx * 0.8, 1, e.z + e.dz * 0.8);
        this.addFlash(this.tex.glow, col, p, 0.5, 3 + e.size * 2, 0.3);
        this.addFlash(this.tex.star, 0xffffff, p, 0.4, 1.8 + e.size, 0.18);
        this.addFlash(this.tex.ring, col, new THREE.Vector3(e.x, 0.05, e.z), 0.4, 4, 0.45, true);
        // 集中線のように放射状に散る
        this.particles.emit({ count: 30, x: p.x, y: 1, z: p.z, color: col, speed: 8, spread: 1, life: 0.35, size: 0.25, drag: 5 });
        this.sparks.emit({ count: 16, x: p.x, y: 1, z: p.z, color: 0xffffff, speed: 6, spread: 0.6, dir: [e.dx, 0.3, e.dz], life: 0.4, size: 0.22 });
        this.shake = Math.max(this.shake, 0.35);
        this.fighters[e.target].squash = 0.6;
        const invisible = (e.tags ?? []).includes("invisible");
        this.popups.add(invisible ? "必殺…？" : "必殺!", new THREE.Vector3(e.x, 2.7, e.z), "special");
        break;
      }
      case "recoil": {
        // 体当たりの反動: 自分も赤く光って少し跳ね返る
        this.fighters[e.target].squash = 0.7;
        this.sparks.emit({ count: 8, x: e.x, y: 1, z: e.z, color: 0xff6b6b, speed: 4, spread: 0.6, dir: [e.dx, 0.4, e.dz], life: 0.35, size: 0.22 });
        this.popups.add(`反動 ${Math.max(1, Math.round(e.amount))}`, new THREE.Vector3(e.x, 2.3, e.z), "recoil");
        break;
      }
      case "ready": {
        const col = PROJ_COLORS[e.target];
        this.addFlash(this.tex.glow, col, new THREE.Vector3(e.x, 1, e.z), 1, 4, 0.4);
        this.addFlash(this.tex.ring, col, new THREE.Vector3(e.x, 0.05, e.z), 0.5, 3.5, 0.5, true);
        this.particles.emit({ count: 30, x: e.x, y: 0.2, z: e.z, color: col, speed: 2, dir: [0, 1, 0], spread: 0.4, up: 3, life: 0.8, size: 0.3 });
        this.popups.add("必殺OK!", new THREE.Vector3(e.x, 2.6, e.z), "ready");
        break;
      }
      case "land": {
        // 打ち上げ弾の着地: 大きさに比例して衝撃を大きく
        const col = PROJ_COLORS[e.target];
        const k = 1 + e.size * 1.5;
        this.addFlash(this.tex.ring, col, new THREE.Vector3(e.x, 0.06, e.z), 0.5, (4 + e.size * 4) * 1.2, 0.6, true);
        this.addFlash(this.tex.ring, 0xffffff, new THREE.Vector3(e.x, 0.07, e.z), 0.3, (2.5 + e.size * 3) * 1.2, 0.4, true);
        this.addFlash(this.tex.glow, 0xffffff, new THREE.Vector3(e.x, 0.4, e.z), 1, 3 + e.size * 4, 0.25);
        this.addFlash(this.tex.star, 0xffffff, new THREE.Vector3(e.x, 0.6 + e.size, e.z), 0.5, 2 + e.size * 2, 0.25);
        this.sparks.emit({ count: Math.round(16 * k), x: e.x, y: 0.1, z: e.z, color: 0xd9c7a0, speed: 6 * k, spread: 1, dir: [0, 1, 0], up: 3, life: 0.7, size: 0.3 + e.size * 0.1, gravity: 6, drag: 2 });
        this.sparks.emit({ count: Math.round(8 * k), x: e.x, y: 0.2, z: e.z, color: 0x8c6d46, speed: 4 * k, spread: 1, up: 6, life: 0.9, size: 0.2, gravity: 14, drag: 0.5 }); // 土くれ
        this.particles.emit({ count: 20, x: e.x, y: 0.3, z: e.z, color: 0xff6a00, speed: 5 * k, spread: 1, life: 0.5, size: 0.5 });
        this.shake = Math.min(1.2, Math.max(this.shake, 0.5 + e.size * 0.5));
        this.popups.add("ドスン!", new THREE.Vector3(e.x, 1.2 + e.size * 1.5, e.z), e.size > 0.6 ? "thud big" : "thud");
        break;
      }
      case "ko": {
        this.addFlash(this.tex.star, 0xffffff, pos, 1, 6, 0.4);
        this.addFlash(this.tex.ring, 0xffd43b, new THREE.Vector3(e.x, 0.06, e.z), 1, 9, 0.8, true);
        this.sparks.emit({ count: 60, x: e.x, y: 1, z: e.z, color: 0xffd43b, speed: 10, spread: 1, life: 0.9, size: 0.3, gravity: 5, drag: 1.5 });
        this.shake = 1;
        this.popups.add("KO!", pos.clone().setY(2.6), "ko");
        break;
      }
    }
  }

  render(w: World, t: number, events: BattleEvent[]) {
    const dt = this.lastT ? Math.min(0.1, t - this.lastT) : 1 / 60;
    this.lastT = t;
    for (const e of events) this.onEvent(e);
    this.updateCamera(w, dt);
    w.fighters.forEach((f, i) => {
      this.fighters[i].update(f, t, dt);
      // 吹き飛び中の砂ぼこり・のけぞり中の星
      if (Math.hypot(f.kx, f.kz) > 2) this.sparks.emit({ count: 2, x: f.x, y: 0.1, z: f.z, color: 0xd8c7a0, speed: 1, up: 1, life: 0.5, size: 0.3, grow: 0.5 });
      if (f.stun > 0 && !f.guardStun && Math.random() < 0.5) {
        const a = t * 8;
        this.sparks.emit({ count: 1, x: f.x + Math.cos(a) * 0.5, y: 2.1, z: f.z + Math.sin(a) * 0.5, color: 0xffe14d, speed: 0.1, life: 0.3, size: 0.22 });
      }
    });

    const alive = new Set<number>();
    for (const p of w.projectiles) {
      alive.add(p.id);
      let v = this.proj.get(p.id);
      if (!v) {
        v = new ProjectileVisual(p, PROJ_COLORS[p.owner], this.specialTex, this.tex.glow, this.shadowGeo, p.owner === this.viewer);
        this.scene.add(v.group);
        this.proj.set(p.id, v);
      }
      v.update(p, t, this.camera, this.particles, this.sparks);
    }
    for (const [id, v] of this.proj) {
      if (alive.has(id)) continue;
      this.scene.remove(v.group);
      v.dispose();
      this.proj.delete(id);
      this.combo.delete(id);
    }
    // オーラの粒子
    w.fighters.forEach((f, i) => {
      if (f.charge >= specialCharge && f.hp > 0 && Math.random() < 0.6) {
        const a = Math.random() * Math.PI * 2;
        this.particles.emit({ count: 1, x: f.x + Math.cos(a) * 0.55, y: 0.1, z: f.z + Math.sin(a) * 0.4, color: PROJ_COLORS[i], speed: 0.3, up: 2.2, life: 0.7, size: 0.28, drag: 0.5 });
      }
    });

    this.flashes = this.flashes.filter((f) => {
      f.life -= dt;
      const k = 1 - Math.max(0, f.life) / f.max;
      f.mesh.scale.setScalar(f.from + (f.to - f.from) * (1 - (1 - k) * (1 - k)));
      (f.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - k);
      if (f.life > 0) return true;
      this.scene.remove(f.mesh);
      (f.mesh.material as THREE.Material).dispose();
      return false;
    });

    this.particles.update(dt);
    this.sparks.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.popups.update(dt, this.camera, this.container.clientWidth, this.container.clientHeight);
  }

  reset() {
    this.popups.clear();
    for (const f of this.fighters) f.koT = 0;
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
    for (const f of this.flashes) (f.mesh.material as THREE.Material).dispose();
    for (const v of this.proj.values()) v.dispose();
    this.popups.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.overlay.remove();
  }
}
