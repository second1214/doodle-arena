// 「動かす」タブの立体プレビュー。戦闘と同じ膨らませたキャラを、小さな台の上で歩かせ・振り返らせ・ときどき殴らせる。
// 指でなぞると台ごと回して、横や後ろからも見られる。戦闘計算は使わない（見た目だけ）。
import * as THREE from "three";
import { createWorld, type Fighter } from "../sim/world";
import type { CharacterBuild } from "./character";
import { arcTexture, glowTexture, ringTexture } from "./fx";
import { FighterVisual } from "./scene";

export class Preview3D {
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  private stage = new THREE.Group();
  private visual: FighterVisual;
  private fighter: Fighter;
  private disposables: { dispose(): void }[] = [];
  private raf = 0;
  private t0 = performance.now();
  private last = 0;
  private yaw = 0.35; // 台の回転（指でなぞると変わる）
  private drag: { x: number; yaw: number } | null = null;
  private ro: ResizeObserver;

  constructor(private container: HTMLElement, build: CharacterBuild) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color(0xf3ecff);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xd9cfee, 1.3);
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(-3, 8, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -4; sun.shadow.camera.right = 4; sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4;
    sun.shadow.radius = 4;
    this.scene.add(hemi, sun);

    // 小さな丸い台（戦闘の舞台と同じ色）
    const top = new THREE.Mesh(new THREE.CircleGeometry(2.4, 64), new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.9 }));
    top.rotation.x = -Math.PI / 2;
    top.receiveShadow = true;
    const side = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.7, 0.5, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2a65a, roughness: 0.7 }));
    side.position.y = -0.25;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.48, 0.12, 10, 64), new THREE.MeshStandardMaterial({ color: 0xff8a5c, roughness: 0.5 }));
    rim.rotation.x = -Math.PI / 2;
    this.stage.add(top, side, rim);
    for (const m of [top, side, rim]) this.disposables.push(m.geometry, m.material as THREE.Material);

    const tex = { glow: glowTexture(), ring: ringTexture(), arc: arcTexture() };
    this.disposables.push(tex.glow, tex.ring, tex.arc);
    this.visual = new FighterVisual(build, 0xff7a1a, tex, this.disposables);
    this.stage.add(this.visual.root);
    this.scene.add(this.stage);

    // 見た目を動かすための仮の状態（戦闘の初期状態をそのまま使う）
    this.fighter = createWorld(build.cfg, { ...build.cfg, name: "x" }, 1).fighters[0];

    this.camera.position.set(0, 2.4, 5.6);
    this.camera.lookAt(0, 0.8, 0);

    const el = this.renderer.domElement;
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", (e) => { this.drag = { x: e.clientX, yaw: this.yaw }; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => { if (this.drag) this.yaw = this.drag.yaw + (e.clientX - this.drag.x) * 0.01; });
    const end = () => { this.drag = null; };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  private resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private frame = (now: number) => {
    const t = (now - this.t0) / 1000;
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0);
    this.last = now;
    const f = this.fighter;
    // 左右に歩いて振り返る。4秒ごとに止まって1回殴る
    const cyc = t % 8;
    const punching = cyc > 3.4 && cyc < 4.2;
    const x = Math.sin(t * 0.5) * 0.9;
    const vx = Math.cos(t * 0.5) * 0.45;
    f.x = x; f.z = 0;
    f.vx = punching ? 0 : vx; f.vz = 0;
    f.fx = vx >= 0 ? 1 : -1; f.fz = 0;
    f.moving = !punching;
    if (punching) {
      const p = cyc - 3.4;
      f.attack = p < 0.3 ? "windup" : p < 0.5 ? "active" : "recover";
      f.attackT = Math.floor((p < 0.3 ? p : p - 0.3) * 30);
    } else { f.attack = "none"; f.attackT = 0; }
    this.visual.update(f, t, dt);
    if (!this.drag) this.yaw += dt * 0.15; // ゆっくり回る
    this.stage.rotation.y = this.yaw;
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.frame);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
