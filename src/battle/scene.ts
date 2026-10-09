// 斜め上から見た 3D 表示。キャラは紙人形の板（手足は関節で回転）、足元に丸影。
// 演出（火花・閃光・衝撃波・画面揺れ・ダメージ数字・KO）は見た目専用で、戦闘計算には影響しない。
import * as THREE from "three";
import { CANVAS_SIZE } from "../detect";
import { ARENA_RADIUS, BODY_RADIUS, meleeSpecialRange, type BattleEvent, type Fighter, type World } from "../sim/world";
import type { CharacterBuild } from "./character";
import { arcTexture, glowTexture, Particles, Popups, ringTexture, sparkTexture, starTexture, type Flash } from "./fx";
import { ProjectileVisual, SpecialTextures } from "./specialfx";
import { inflateCanvas } from "./inflate";

const TILT = -0.1; // 立体なので後傾は少しだけ
const PROJ_COLORS = [0xff7a1a, 0x9b5cff];
const HIT_COLOR = 0xffe08a;
const GUARD_COLOR = 0x5cc8ff;

interface LimbVisual { pivot: THREE.Object3D; kind: "hand" | "foot"; nth: number; length: number }

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
  materials: THREE.MeshStandardMaterial[] = [];
  flipCur = 0; // 向き（Y 軸回転）
  flipTarget = 1;
  squash = 0; // 被弾時のつぶれ
  koT = 0;
  roll = 0; // 転がりの回転角
  dizzy: THREE.Sprite; // 頭の上の「@_@」
  limbScale = 1;
  crumpleK = 0;
  rangeRing: THREE.Mesh; // 竜巻の届く範囲（見た目と当たり判定を一致させる）

  setGhost(on: boolean) {
    for (const m of this.materials) { m.transparent = on; m.opacity = on ? 0.45 : 1; m.depthWrite = !on; }
  }

  constructor(build: CharacterBuild, teamColor: number, tex: { arc: THREE.Texture; ring: THREE.Texture; glow: THREE.Texture }, disposables: { dispose(): void }[]) {
    const { parts, res, scale: k, originX } = build;
    const b = parts.bounds;
    const pad = 4;
    const x0 = Math.max(0, b.x0 - pad), y0 = Math.max(0, b.y0 - pad);
    const x1 = Math.min(CANVAS_SIZE, b.x1 + pad), y1 = Math.min(CANVAS_SIZE, b.y1 + pad);
    const W = x1 - x0, H = y1 - y0;
    const toLocal = (px: number, py: number) => new THREE.Vector3((px - originX) * k, (b.y1 - py) * k, 0);
    const center = toLocal(x0 + W / 2, y0 + H / 2);

    // パーツごとに描いた線・塗りを膨らませて立体にする
    const makeMesh = (src: HTMLCanvasElement) => {
      // 太らせる分の余白を周りに付けて切り出す（中心位置は変わらない）
      const PAD = 12;
      const c = document.createElement("canvas");
      c.width = W + PAD * 2; c.height = H + PAD * 2;
      c.getContext("2d")!.drawImage(src, x0, y0, W, H, PAD, PAD, W, H);
      const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0, side: THREE.DoubleSide });
      this.materials.push(mat);
      disposables.push(mat);
      const g = inflateCanvas(c, k, { maxCells: 96, grow: 1, smooth: 3 });
      if (!g) return new THREE.Object3D(); // そのパーツに描かれた部分が無い
      disposables.push(g);
      const m = new THREE.Mesh(g, mat);
      m.castShadow = true;
      return m;
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
      this.limbs.push({ pivot, kind: l.kind, nth: count[l.kind]++, length: l.length });
    });

    const shadowGeo = new THREE.CircleGeometry(0.75, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x5a4a7a, transparent: true, opacity: 0.1, depthWrite: false });
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

    // 目を回しているときの「@_@」
    const dc = document.createElement("canvas");
    dc.width = 128; dc.height = 64;
    const dg = dc.getContext("2d")!;
    dg.font = "bold 44px sans-serif"; dg.textAlign = "center"; dg.textBaseline = "middle";
    dg.lineWidth = 8; dg.strokeStyle = "#1a1a1a"; dg.strokeText("@_@", 64, 34);
    dg.fillStyle = "#ffe14d"; dg.fillText("@_@", 64, 34);
    const dt = new THREE.CanvasTexture(dc);
    dt.colorSpace = THREE.SRGBColorSpace;
    const dm = new THREE.SpriteMaterial({ map: dt, transparent: true, depthWrite: false });
    this.dizzy = new THREE.Sprite(dm);
    this.dizzy.scale.set(1.0, 0.5, 1);
    this.dizzy.position.set(0, 2.25, 0);
    this.dizzy.visible = false;
    disposables.push(dt, dm);

    // 必殺技を撃てる状態のオーラ
    const auraMat = new THREE.SpriteMaterial({ map: tex.glow, color: teamColor, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.aura = new THREE.Sprite(auraMat);
    this.aura.position.set(0, 0.95, -0.05);
    this.aura.visible = false;
    disposables.push(auraMat);

    const rrGeo = new THREE.RingGeometry(0.96, 1, 64);
    const rrMat = new THREE.MeshBasicMaterial({ color: teamColor, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
    this.rangeRing = new THREE.Mesh(rrGeo, rrMat);
    this.rangeRing.rotation.x = -Math.PI / 2;
    this.rangeRing.position.y = 0.025;
    this.rangeRing.visible = false;
    disposables.push(rrGeo, rrMat);

    this.body.rotation.x = TILT;
    this.root.add(this.aura, this.dizzy, this.rangeRing);
    this.flip.add(this.swing);
    this.spin.position.y = center.y;
    this.flip.position.y = -center.y;
    this.spin.add(this.flip);
    this.body.add(this.spin, this.guard);
    this.root.add(this.shadow, this.rootRing, this.body);
  }

  meleeReach = 0; // 近接必殺の届く中心間距離（相手の体の分を含む）
  update(f: Fighter, t: number, dt: number) {
    this.root.position.set(f.x, 0, f.z);
    if (f.fx > 0.08) this.flipTarget = 1;
    else if (f.fx < -0.08) this.flipTarget = -1;
    // 向き変更: 立体なのでその場でくるっと振り返る（裏から見ると絵は左右反転）
    const wantYaw = this.flipTarget > 0 ? 0 : Math.PI;
    this.flipCur += (wantYaw - this.flipCur) * 0.22;

    const T = f.cfg.traits;
    const weight = T?.weight ?? 1;
    // 被弾でつぶれて戻る（重いほど大きくつぶれる）
    this.squash = Math.max(0, this.squash - dt * 5);
    const sq = Math.sin(this.squash * Math.PI) * 0.25 * Math.min(1.5, weight);
    this.flip.scale.set(1 + sq, 1 - sq, 1 + sq);
    this.flip.rotation.y = this.flipCur;

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
    for (const m of this.materials) m.emissive.setRGB(blink ? 0.9 : 0, blink ? 0.1 : 0, blink ? 0.1 : 0);
    this.guard.visible = f.guarding;
    if (f.guarding) {
      this.guard.rotation.z += dt * 1.5;
      (this.guard.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * 10) * 0.08;
    }
    this.aura.visible = f.charge >= f.st.chargeNeed && f.hp > 0;
    if (this.aura.visible) {
      const k = 1 + Math.sin(t * 9) * 0.12;
      this.aura.scale.set(2.6 * k, 3.2 * k, 1);
      (this.aura.material as THREE.SpriteMaterial).opacity = 0.75 + Math.sin(t * 13) * 0.2;
    }
    // --- 近接必殺・状態異常 ---
    const ms = f.ms, sp = f.mspec;
    const inMelee = ms.phase === "windup" || ms.phase === "active";
    const wantScale = inMelee ? sp.limbScale : 1;
    this.limbScale += (wantScale - this.limbScale) * Math.min(1, dt * 12);
    let longest = -1, best = -1;
    this.limbs.forEach((l, k) => { if (l.kind === "hand" && l.length > best) { best = l.length; longest = k; } });
    this.limbs.forEach((l, k) => {
      const rubber = inMelee && k === longest ? sp.rubberScale : 1;
      const sc = this.limbScale * (k === longest ? 1 + (rubber - 1) * (ms.phase === "active" ? 1 : 0.3) : 1);
      l.pivot.scale.setScalar(sc);
      if (inMelee && l.kind === "hand") l.pivot.rotation.z = ms.phase === "windup" ? 0.9 : -1.5; // 構え→振り抜き
    });
    // 竜巻: 紙人形が縦軸で回る（真横で一瞬「線」になる）。届く範囲を地面に輪で示す
    const spinning = ms.phase === "active" && sp.spinTicks > 0;
    this.spin.rotation.y = spinning ? ms.spin : 0;
    this.rangeRing.visible = spinning && this.meleeReach > 0;
    if (this.rangeRing.visible) this.rangeRing.scale.setScalar(this.meleeReach - BODY_RADIUS);
    // 地面たたき: 構えで跳ぶ
    if (sp.slam && ms.phase === "windup") this.body.position.y = Math.sin(Math.min(1, ms.t / sp.windup) * Math.PI) * 1.2;
    // 紙くしゃくしゃ: 縮んで玉になり転がる
    this.crumpleK += ((f.crumple > 0 ? 1 : 0) - this.crumpleK) * Math.min(1, dt * 10);
    if (this.crumpleK > 0.01) {
      const k = 1 - 0.5 * this.crumpleK;
      this.spin.scale.set(k, k, 1);
      this.spin.rotation.z += Math.hypot(f.vx, f.vz) * dt * 3 * (f.vx >= 0 ? -1 : 1);
      this.roll = this.spin.rotation.z;
    } else this.spin.scale.set(1, 1, 1);
    this.dizzy.visible = f.wobble > 0 || f.dizzy > 0;
    if (this.dizzy.visible) {
      (this.dizzy.material as THREE.SpriteMaterial).rotation = Math.sin(t * 6) * 0.4;
      this.dizzy.position.x = Math.sin(t * 3) * 0.2;
    }
    // 足封じ: 足は動かさない
    if (f.legbind > 0) for (const l of this.limbs) if (l.kind === "foot") l.pivot.rotation.z = 0;

    this.rootRing.visible = f.rooted > 0 || f.legbind > 0;
    (this.rootRing.material as THREE.MeshBasicMaterial).color.set(f.legbind > 0 && f.rooted === 0 ? 0x8c5a2b : 0xffd43b);
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
  private sun!: THREE.DirectionalLight;
  private lookY = 0.9;
  private wobK = 0;
  private wobT = 0;

  constructor(private container: HTMLElement, builds: [CharacterBuild, CharacterBuild], private viewer: number) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.overlay = document.createElement("div");
    this.overlay.className = "b-pops";
    container.appendChild(this.overlay);
    this.popups = new Popups(this.overlay);
    // 画面の雰囲気: 机の上のおもちゃの舞台。空はやわらかいグラデーション、丸い台座、やわらかい光と影
    const sky = document.createElement("canvas");
    sky.width = 4; sky.height = 256;
    const sg = sky.getContext("2d")!;
    const grad = sg.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#bfe0ff");
    grad.addColorStop(0.55, "#f3ecff");
    grad.addColorStop(1, "#ffe9d6");
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 4, 256);
    const skyTex = new THREE.CanvasTexture(sky);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = skyTex;
    this.scene.fog = new THREE.Fog(0xf3ecff, 28, 70);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const hemi = new THREE.HemisphereLight(0xffffff, 0xd9cfee, 1.25);
    const sun = new THREE.DirectionalLight(0xffffff, 1.7);
    sun.position.set(-5, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -7; sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
    sun.shadow.bias = -0.0015;
    sun.shadow.radius = 4;
    this.sun = sun;
    this.scene.add(hemi, sun, sun.target);

    // 丸い台座（上面＋側面）
    const top = new THREE.Mesh(new THREE.CircleGeometry(ARENA_RADIUS, 96), new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.9 }));
    top.rotation.x = -Math.PI / 2;
    top.receiveShadow = true;
    const side = new THREE.Mesh(new THREE.CylinderGeometry(ARENA_RADIUS + 0.35, ARENA_RADIUS + 0.55, 0.9, 96, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2a65a, roughness: 0.7 }));
    side.position.y = -0.45;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(ARENA_RADIUS + 0.17, 0.2, 12, 96), new THREE.MeshStandardMaterial({ color: 0xff8a5c, roughness: 0.5 }));
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.02;
    // 方眼紙のような薄いマス目（描いた紙の上で戦う感じ）
    const grid = new THREE.GridHelper(ARENA_RADIUS * 2, 18, 0xe6d6c2, 0xefe2d2);
    grid.position.y = 0.004;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.7;
    const gridMask = new THREE.Mesh(new THREE.RingGeometry(ARENA_RADIUS, ARENA_RADIUS * 1.5, 96), new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.9 }));
    gridMask.rotation.x = -Math.PI / 2;
    gridMask.position.y = 0.006;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(ARENA_RADIUS + 40, 48), new THREE.MeshStandardMaterial({ color: 0xd9e8f5, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.9;
    floor.receiveShadow = true;
    this.scene.add(floor, side, top, grid, gridMask, rim);
    for (const m of [top, side, rim, gridMask, floor]) this.disposables.push(m.geometry, m.material as THREE.Material);
    this.disposables.push(grid, skyTex);

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
    const need = Math.max(2.0, sep / 2 + 1.5);
    let dist = Math.max(5, need / Math.tan(hHalf));
    // 打ち上げ弾が高く上がっている間は引いて、落ちてくるところまで見せる
    let high = 0;
    for (const p of w.projectiles) if (p.spec.meteor && (p.spec.visible || p.owner === this.viewer)) high = Math.max(high, p.h + p.spec.size);
    dist += high * 0.9;
    this.lookY += ((high > 1.5 ? high * 0.45 : 0.9) - this.lookY) * 0.08;
    if (w.winner !== -1) {
      this.koZoom = Math.min(1, this.koZoom + dt * 1.5);
      dist *= 1 - 0.15 * this.koZoom;
    } else this.koZoom = 0;
    if (!this.camInit) { this.camTarget.copy(mid); this.camDist = dist; this.camInit = true; }
    this.camTarget.lerp(mid, 0.12);
    this.camDist += (dist - this.camDist) * 0.06;
    const dir = new THREE.Vector3(0, 7, 12).normalize(); // 低めの斜め上から（立体感が見える角度）
    this.camera.position.copy(this.camTarget).addScaledVector(dir, this.camDist);
    this.camera.lookAt(this.camTarget.x, this.lookY, this.camTarget.z + 0.4); // 2体を画面のやや上寄りに（下はボタンが重なるため）
    this.sun.position.set(this.camTarget.x - 5, 12, this.camTarget.z + 7);
    this.sun.target.position.set(this.camTarget.x, 0, this.camTarget.z);
    // 自分がグニャグニャ・目回し中: カメラがゆらゆら傾き、ズームが呼吸のように揺れ、画面の色もずれる
    const me = this.viewer >= 0 ? w.fighters[this.viewer] : null;
    const wob = me ? Math.min(1, Math.max(me.wobble, me.dizzy * 0.6) / 30) : 0;
    this.wobK += (wob - this.wobK) * Math.min(1, dt * 4);
    if (this.wobK > 0.01) {
      this.wobT += dt;
      this.camera.rotateZ(Math.sin(this.wobT * 2.3) * 0.18 * this.wobK);
      this.camera.fov = 38 + Math.sin(this.wobT * 3.1) * 6 * this.wobK;
      this.camera.updateProjectionMatrix();
      this.renderer.domElement.style.filter = `hue-rotate(${Math.sin(this.wobT * 1.7) * 60 * this.wobK}deg) saturate(${1 + 0.6 * this.wobK}) blur(${0.6 * this.wobK}px)`;
    } else if (this.renderer.domElement.style.filter) {
      this.renderer.domElement.style.filter = "";
      this.camera.fov = 38;
      this.camera.updateProjectionMatrix();
    }
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
        if (e.heal && e.heal > 0.05) this.popups.add(`+${e.heal.toFixed(1)}`, pos.clone().setY(pos.y + 1.4), "heal");
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
      case "mstart": {
        const col = PROJ_COLORS[e.target];
        this.addFlash(this.tex.glow, col, new THREE.Vector3(e.x, 1, e.z), 0.6, 3.2, 0.3);
        this.addFlash(this.tex.ring, col, new THREE.Vector3(e.x, 0.05, e.z), 0.4, 3.5, 0.4, true);
        this.particles.emit({ count: 26, x: e.x, y: 1, z: e.z, color: col, speed: 7, spread: 1, life: 0.35, size: 0.25, drag: 5 });
        this.shake = Math.max(this.shake, 0.3);
        this.popups.add("必殺!", new THREE.Vector3(e.x, 2.7, e.z), "special");
        break;
      }
      case "mactive": {
        const tags = (e.tags ?? []) as string[];
        if (tags.includes("tornado")) this.popups.add("ギュイーン!", new THREE.Vector3(e.x, 2.9, e.z), "combo");
        if (tags.includes("rubber")) this.popups.add("ビヨーン!", new THREE.Vector3(e.x + e.dx, 2.4, e.z + e.dz), "combo");
        if (tags.includes("dash")) this.sparks.emit({ count: 12, x: e.x, y: 0.2, z: e.z, color: 0xd8c7a0, speed: 4, dir: [-e.dx, 0.3, -e.dz], spread: 0.5, life: 0.4, size: 0.3 });
        break;
      }
      case "grab": {
        this.addFlash(this.tex.star, 0xffffff, new THREE.Vector3(e.x + e.dx, 1.1, e.z + e.dz), 0.5, 2, 0.2);
        this.popups.add("ガシッ!", new THREE.Vector3(e.x + e.dx, 2.4, e.z + e.dz), "bind");
        break;
      }
      case "whiff":
        this.popups.add("スカッ", new THREE.Vector3(e.x, 2.3, e.z), "guard");
        break;
      case "slam": {
        // 輪の衝撃波（戦闘計算の輪と同じ速さで広がる。内側は安全）
        const col = PROJ_COLORS[e.target];
        this.addFlash(this.tex.ring, col, new THREE.Vector3(e.x, 0.06, e.z), 0.8, 9.6, 0.55, true);
        this.addFlash(this.tex.ring, 0xffffff, new THREE.Vector3(e.x, 0.07, e.z), 0.6, 8.6, 0.5, true);
        this.sparks.emit({ count: 30, x: e.x, y: 0.1, z: e.z, color: 0xd9c7a0, speed: 8, spread: 1, dir: [0, 0.2, 0], up: 2, life: 0.6, size: 0.3, gravity: 8 });
        this.shake = Math.max(this.shake, 0.7);
        this.popups.add("ドゴン!", new THREE.Vector3(e.x, 1.6, e.z), "thud big");
        break;
      }
      case "status": {
        const label = e.status === "wobble" ? "グニャ〜" : e.status === "legbind" ? "足封じ!" : "クシャッ!";
        this.popups.add(label, new THREE.Vector3(e.x, 2.9, e.z), "bind");
        if (e.status === "crumple") this.sparks.emit({ count: 14, x: e.x, y: 1, z: e.z, color: 0xffffff, speed: 4, spread: 1, life: 0.4, size: 0.25 });
        break;
      }
      case "shove": {
        this.addFlash(this.tex.ring, 0xffffff, new THREE.Vector3(e.x, 1, e.z), 0.4, 1.8, 0.2);
        this.sparks.emit({ count: 8, x: e.x, y: 1, z: e.z, color: 0xffffff, speed: 5, spread: 0.5, dir: [e.dx, 0.2, e.dz], life: 0.3, size: 0.22 });
        this.fighters[e.target].squash = 0.6;
        this.shake = Math.max(this.shake, 0.2);
        this.popups.add("ドンッ", new THREE.Vector3(e.x, 2.2, e.z), "guard");
        break;
      }
      case "dodge": {
        this.sparks.emit({ count: 6, x: e.x, y: 0.1, z: e.z, color: 0xd8c7a0, speed: 2, dir: [-e.dx, 0.4, -e.dz], spread: 0.5, life: 0.4, size: 0.3 });
        break;
      }
      case "evade":
        // 回避中 / 描いていない空白を攻撃が素通りした
        this.popups.add(e.gap ? "すり抜け" : "回避!", new THREE.Vector3(e.x, 2.3, e.z), "evade");
        break;
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
        // 決着: 何が起きたか分かるよう控えめに（閃光1つ・衝撃波1つ・「KO!」）
        this.addFlash(this.tex.star, 0xffffff, pos, 0.6, 2.4, 0.25);
        this.addFlash(this.tex.ring, 0xffd43b, new THREE.Vector3(e.x, 0.06, e.z), 0.6, 4, 0.5, true);
        this.sparks.emit({ count: 16, x: e.x, y: 1, z: e.z, color: 0xffd43b, speed: 6, spread: 0.8, dir: [e.dx, 0.5, e.dz], life: 0.6, size: 0.26, gravity: 6, drag: 2 });
        this.shake = Math.max(this.shake, 0.4);
        this.popups.add("KO!", pos.clone().setY(2.8), "ko");
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
      this.fighters[i].meleeReach = meleeSpecialRange(f.cfg, f.mspec, w.fighters[1 - i].cfg);
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
    // 回避の残像
    w.fighters.forEach((f, i) => {
      if (f.dodgeT > 0) this.particles.emit({ count: 2, x: f.x, y: 0.9, z: f.z, color: PROJ_COLORS[i], speed: 0.2, life: 0.25, size: 1.1, grow: -3 });
      this.fighters[i].setGhost(f.dodgeT > 0);
    });
    // 近接必殺の粒子（竜巻の渦・突進の残像）
    w.fighters.forEach((f, i) => {
      if (f.ms.phase !== "active") return;
      if (f.mspec.spinTicks > 0) {
        const a = f.ms.spin;
        for (let k = 0; k < 2; k++) {
          const r = 0.9 + k * 0.5;
          this.particles.emit({ count: 1, x: f.x + Math.cos(a + k * Math.PI) * r, y: 0.3 + Math.random() * 1.6, z: f.z + Math.sin(a + k * Math.PI) * r, color: k ? 0xffffff : PROJ_COLORS[i], speed: 1.5, up: 1.5, life: 0.4, size: 0.35 });
        }
      }
      if (f.mspec.dash > 0 && f.ms.dashLeft > 0) {
        this.particles.emit({ count: 3, x: f.x, y: 0.9, z: f.z, color: PROJ_COLORS[i], speed: 0.3, life: 0.35, size: 0.9, grow: -2 });
      }
    });

    // オーラの粒子
    w.fighters.forEach((f, i) => {
      if (f.charge >= f.st.chargeNeed && f.hp > 0 && Math.random() < 0.6) {
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
