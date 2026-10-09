// 斜め上から見た 3D 表示。キャラは紙人形の板（手足は関節で回転）、足元に丸影。
import * as THREE from "three";
import { CANVAS_SIZE } from "../detect";
import { ARENA_RADIUS, type Fighter, type World } from "../sim/world";
import type { CharacterBuild } from "./character";

const TILT = -0.26; // カメラ側へ約15°後傾
const PROJ_COLORS = [0xff7a1a, 0x8a4dff];

interface LimbVisual { pivot: THREE.Object3D; kind: "hand" | "foot"; nth: number }

class FighterVisual {
  root = new THREE.Group();
  body = new THREE.Group(); // 傾き・上下
  flip = new THREE.Group(); // 左右反転
  shadow: THREE.Mesh;
  guard: THREE.Mesh;
  rootRing: THREE.Mesh;
  limbs: LimbVisual[] = [];
  materials: THREE.MeshBasicMaterial[] = [];
  flipCur = 1;
  flipTarget = 1;

  constructor(build: CharacterBuild, disposables: { dispose(): void }[]) {
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
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.4, side: THREE.DoubleSide });
      disposables.push(tex, mat);
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

    const guardGeo = new THREE.CircleGeometry(1.0, 32);
    const guardMat = new THREE.MeshBasicMaterial({ color: 0x66c7ff, transparent: true, opacity: 0.35, depthWrite: false });
    this.guard = new THREE.Mesh(guardGeo, guardMat);
    this.guard.position.set(0, 0.9, 0.25);

    const ringGeo = new THREE.RingGeometry(0.7, 0.85, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd43b, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide });
    this.rootRing = new THREE.Mesh(ringGeo, ringMat);
    this.rootRing.rotation.x = -Math.PI / 2;
    this.rootRing.position.y = 0.02;
    disposables.push(shadowGeo, shadowMat, guardGeo, guardMat, ringGeo, ringMat);

    this.body.rotation.x = TILT;
    this.body.add(this.flip, this.guard);
    this.root.add(this.shadow, this.rootRing, this.body);
  }

  update(f: Fighter, t: number) {
    this.root.position.set(f.x, 0, f.z);
    if (f.fx > 0.08) this.flipTarget = 1;
    else if (f.fx < -0.08) this.flipTarget = -1;
    this.flipCur += (this.flipTarget - this.flipCur) * 0.25; // 向き変更は横反転を補間（紙がくるっと返る）
    this.flip.scale.x = Math.abs(this.flipCur) < 0.02 ? 0.02 : this.flipCur;

    const walking = f.moving && f.cfg.hasFeet;
    this.body.position.y = walking ? Math.abs(Math.sin(t * 12)) * 0.08 : 0;
    // 手なしの体当たりは前のめり
    this.body.rotation.z = !f.cfg.hasHands && f.attack === "active" ? -0.35 * this.flipTarget : 0;
    // 足なしで移動中は少し傾けて滑らせる
    if (!f.cfg.hasFeet && f.moving) this.body.rotation.z = -0.12 * this.flipTarget;

    for (const l of this.limbs) {
      let a: number;
      if (l.kind === "foot") {
        a = walking ? Math.sin(t * 12 + l.nth * Math.PI) * 0.45 : 0;
      } else if (f.attack === "windup") {
        a = 0.7;
      } else if (f.attack === "active") {
        a = -1.3;
      } else if (f.guarding) {
        a = -0.9;
      } else {
        a = Math.sin(t * 3 + l.nth * 1.7) * 0.15;
      }
      l.pivot.rotation.z = a;
    }
    const flash = f.hitFlash > 0;
    for (const m of this.materials) m.color.setRGB(1, flash ? 0.35 : 1, flash ? 0.35 : 1);
    this.guard.visible = f.guarding;
    this.rootRing.visible = f.rooted > 0;
  }
}

export class BattleScene {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  private fighters: FighterVisual[];
  private projGeo = new THREE.SphereGeometry(1, 20, 14);
  private projMats = PROJ_COLORS.map((c) => new THREE.MeshBasicMaterial({ color: c }));
  private shadowGeo = new THREE.CircleGeometry(1, 24);
  private shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false });
  private proj = new Map<number, { ball: THREE.Mesh; shadow: THREE.Mesh }>();
  private bursts: { mesh: THREE.Mesh; life: number }[] = [];
  private burstGeo = new THREE.RingGeometry(0.25, 0.36, 24);
  private disposables: { dispose(): void }[] = [];

  constructor(private container: HTMLElement, builds: [CharacterBuild, CharacterBuild]) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color(0xcfe3f2);

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

    this.fighters = builds.map((b) => new FighterVisual(b, this.disposables));
    for (const f of this.fighters) this.scene.add(f.root);
    this.disposables.push(this.projGeo, ...this.projMats, this.shadowGeo, this.shadowMat, this.burstGeo);
    this.resize();
  }

  private camTarget = new THREE.Vector3();
  private camDist = 12;
  private camInit = false;

  resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // 2体の中間を追い、離れるほど引く（縦長画面でも2体が横に収まる距離）
  private updateCamera(w: World) {
    const [a, b] = w.fighters;
    const mid = new THREE.Vector3((a.x + b.x) / 2, 0, (a.z + b.z) / 2);
    const sep = Math.hypot(a.x - b.x, a.z - b.z);
    const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const need = Math.max(3.2, sep / 2 + 2.2);
    const dist = Math.max(8, need / Math.tan(hHalf));
    if (!this.camInit) { this.camTarget.copy(mid); this.camDist = dist; this.camInit = true; }
    this.camTarget.lerp(mid, 0.12);
    this.camDist += (dist - this.camDist) * 0.06;
    const dir = new THREE.Vector3(0, 15, 12).normalize();
    this.camera.position.copy(this.camTarget).addScaledVector(dir, this.camDist);
    this.camera.lookAt(this.camTarget.x, 0.7, this.camTarget.z);
  }

  render(w: World, t: number, events: World["events"]) {
    this.updateCamera(w);
    w.fighters.forEach((f, i) => this.fighters[i].update(f, t));

    const alive = new Set<number>();
    for (const p of w.projectiles) {
      alive.add(p.id);
      let v = this.proj.get(p.id);
      if (!v) {
        v = { ball: new THREE.Mesh(this.projGeo, this.projMats[p.owner]), shadow: new THREE.Mesh(this.shadowGeo, this.shadowMat) };
        v.shadow.rotation.x = -Math.PI / 2;
        this.scene.add(v.ball, v.shadow);
        this.proj.set(p.id, v);
      }
      v.ball.visible = v.shadow.visible = p.spec.visible;
      v.ball.position.set(p.x, p.h, p.z);
      v.ball.scale.setScalar(p.spec.size);
      v.shadow.position.set(p.x, 0.015, p.z);
      v.shadow.scale.setScalar(p.spec.size * Math.max(0.4, 1 - p.h / 12));
    }
    for (const [id, v] of this.proj) {
      if (alive.has(id)) continue;
      this.scene.remove(v.ball, v.shadow);
      this.proj.delete(id);
    }

    for (const e of events) {
      if (e.kind === "shoot") continue;
      const mat = new THREE.MeshBasicMaterial({ color: e.kind === "guard" ? 0x66c7ff : 0xffffff, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const m = new THREE.Mesh(this.burstGeo, mat);
      m.position.set(e.x, Math.max(0.6, e.h), e.z);
      m.lookAt(this.camera.position);
      this.scene.add(m);
      this.bursts.push({ mesh: m, life: 12 });
    }
    this.bursts = this.bursts.filter((b) => {
      b.life--;
      b.mesh.scale.setScalar(1 + (12 - b.life) * 0.12);
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = b.life / 12;
      if (b.life > 0) return true;
      this.scene.remove(b.mesh);
      (b.mesh.material as THREE.Material).dispose();
      return false;
    });

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
    for (const b of this.bursts) (b.mesh.material as THREE.Material).dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
