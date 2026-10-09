// 必殺技の弾の見た目。付いている効果ごとに見た目の特徴を重ねる（矛盾した組み合わせは見た目も混ざる）。
import * as THREE from "three";
import type { Projectile } from "../sim/world";
import type { Particles } from "./fx";

function tex(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// 顔つきの弾（黒縁・ハイライト）。手描きの絵柄に合わせる。
function ballTexture(color: string): THREE.CanvasTexture {
  return tex(128, (g, s) => {
    const r = s * 0.42;
    g.translate(s / 2, s / 2);
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fillStyle = color;
    g.fill();
    g.lineWidth = 7;
    g.strokeStyle = "#1a1a1a";
    g.stroke();
    g.beginPath();
    g.ellipse(-r * 0.35, -r * 0.4, r * 0.28, r * 0.17, -0.6, 0, Math.PI * 2);
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.fill();
    // 怒り目
    g.fillStyle = "#1a1a1a";
    for (const sx of [-1, 1]) {
      g.beginPath();
      g.ellipse(sx * r * 0.3, r * 0.05, r * 0.1, r * 0.16, 0, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(sx * r * 0.52, -r * 0.22);
      g.lineTo(sx * r * 0.12, -r * 0.08);
      g.stroke();
    }
  });
}

// のこぎり状の輪（多段ヒット）
function sawTexture(): THREE.CanvasTexture {
  return tex(128, (g, s) => {
    g.translate(s / 2, s / 2);
    g.beginPath();
    const n = 14;
    for (let i = 0; i <= n * 2; i++) {
      const r = i % 2 === 0 ? s * 0.48 : s * 0.38;
      const a = (i / (n * 2)) * Math.PI * 2;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.arc(0, 0, s * 0.3, 0, Math.PI * 2, true);
    g.fillStyle = "#e9ecef";
    g.fill("evenodd");
    g.lineWidth = 4;
    g.strokeStyle = "#1a1a1a";
    g.stroke();
  });
}

// 鎖の輪（拘束）
function chainTexture(): THREE.CanvasTexture {
  return tex(128, (g, s) => {
    g.translate(s / 2, s / 2);
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.save();
      g.rotate(a);
      g.translate(s * 0.4, 0);
      g.rotate(i % 2 ? 0 : Math.PI / 2);
      g.beginPath();
      g.ellipse(0, 0, s * 0.085, s * 0.05, 0, 0, Math.PI * 2);
      g.lineWidth = 9;
      g.strokeStyle = "#1a1a1a";
      g.stroke();
      g.lineWidth = 5;
      g.strokeStyle = "#ffd43b";
      g.stroke();
      g.restore();
    }
  });
}

// 落下地点の照準
function markerTexture(): THREE.CanvasTexture {
  return tex(128, (g, s) => {
    g.translate(s / 2, s / 2);
    g.lineWidth = 6;
    g.strokeStyle = "#ff3b3b";
    g.setLineDash([12, 8]);
    g.beginPath();
    g.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    g.beginPath();
    g.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 4; i++) {
      g.rotate(Math.PI / 2);
      g.beginPath();
      g.moveTo(s * 0.26, 0);
      g.lineTo(s * 0.48, 0);
      g.stroke();
    }
  });
}

export class SpecialTextures {
  balls: THREE.CanvasTexture[];
  saw = sawTexture();
  chain = chainTexture();
  marker = markerTexture();
  constructor(colors: string[]) {
    this.balls = colors.map((c) => ballTexture(c));
  }
  dispose() {
    for (const t of [...this.balls, this.saw, this.chain, this.marker]) t.dispose();
  }
}

const has = (p: Projectile, id: string) => p.spec.tags.includes(id as never);

export class ProjectileVisual {
  group = new THREE.Group();
  private ball: THREE.Sprite;
  private halo: THREE.Sprite;
  private shadow: THREE.Mesh;
  private saws: THREE.Sprite[] = [];
  private chains: THREE.Sprite[] = [];
  private marker: THREE.Mesh | null = null;
  private mats: THREE.Material[] = [];
  private prev = new THREE.Vector3();
  private hue = Math.random();

  constructor(
    p: Projectile,
    private color: number,
    t: SpecialTextures,
    glow: THREE.Texture,
    shadowGeo: THREE.BufferGeometry,
    private ownerSees: boolean, // 見えない弾を撃った本人には薄く見せる
  ) {
    const ballMat = new THREE.SpriteMaterial({ map: t.balls[p.owner], transparent: true, depthWrite: false });
    const haloMat = new THREE.SpriteMaterial({ map: glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false });
    this.mats.push(ballMat, haloMat, shadowMat);
    this.ball = new THREE.Sprite(ballMat);
    this.halo = new THREE.Sprite(haloMat);
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.group.add(this.shadow, this.halo, this.ball);

    if (has(p, "multi")) {
      for (let i = 0; i < 2; i++) {
        const m = new THREE.SpriteMaterial({ map: t.saw, transparent: true, depthWrite: false });
        this.mats.push(m);
        const s = new THREE.Sprite(m);
        this.saws.push(s);
        this.group.add(s);
      }
    }
    if (has(p, "restrain")) {
      for (let i = 0; i < 3; i++) {
        const m = new THREE.SpriteMaterial({ map: t.chain, transparent: true, depthWrite: false });
        this.mats.push(m);
        const s = new THREE.Sprite(m);
        this.chains.push(s);
        this.group.add(s);
      }
    }
    if (p.spec.meteor) {
      const m = new THREE.MeshBasicMaterial({ map: t.marker, transparent: true, depthWrite: false });
      this.mats.push(m);
      this.marker = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
      this.marker.rotation.x = -Math.PI / 2;
      this.marker.visible = false;
      this.group.add(this.marker);
    }
    this.prev.set(p.x, p.h, p.z);
  }

  update(p: Projectile, time: number, camera: THREE.Camera, glowFx: Particles, sparkFx: Particles) {
    const s = p.spec;
    const visible = s.visible || this.ownerSees;
    const ghost = !s.visible; // 本人にだけ見える半透明
    const pos = new THREE.Vector3(p.x, p.h, p.z);
    const vel = pos.clone().sub(this.prev);
    this.prev.copy(pos);

    this.group.visible = visible;
    if (!visible) {
      if (this.marker) this.marker.visible = false;
      return;
    }
    const size = s.size;
    let pulse = 1 + Math.sin(time * 18 + p.id) * 0.08;
    if (has(p, "giant")) pulse += Math.sin(time * 5 + p.id) * 0.06; // 巨大はゆっさゆっさ
    this.ball.position.copy(pos);
    this.halo.position.copy(pos);
    this.ball.scale.setScalar(size * 2.3 * pulse);
    this.halo.scale.setScalar(size * (has(p, "tiny") ? 9 : 5) * pulse);
    const ballMat = this.ball.material as THREE.SpriteMaterial;
    ballMat.opacity = ghost ? 0.3 : 1;
    (this.halo.material as THREE.SpriteMaterial).opacity = ghost ? 0 : 0.9;
    ballMat.rotation = has(p, "giant") ? Math.sin(time * 3) * 0.3 : Math.sin(time * 9 + p.id) * 0.15;

    // 高速: 進行方向へ伸ばす（画面上の向きに合わせて回す）
    if (has(p, "fast")) {
      const a = pos.clone().project(camera), b = pos.clone().add(vel).project(camera);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      ballMat.rotation = ang;
      this.ball.scale.x = size * 2.3 * 1.8;
      this.ball.scale.y = size * 2.3 * 0.75;
    }

    // 影は高いほど小さく薄く
    const hh = Math.max(0, p.h);
    this.shadow.position.set(p.x, 0.016, p.z);
    this.shadow.scale.setScalar(size * Math.max(0.5, 1.2 - hh / 10));
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = ghost ? 0 : Math.max(0.12, 0.35 - hh * 0.025);

    this.saws.forEach((sw, i) => {
      sw.position.copy(pos);
      sw.scale.setScalar(size * (3.2 + i * 0.7));
      (sw.material as THREE.SpriteMaterial).rotation = time * (i ? -14 : 18);
      (sw.material as THREE.SpriteMaterial).opacity = ghost ? 0.2 : 1;
    });
    this.chains.forEach((c, i) => {
      const a = time * 4 + (i / 3) * Math.PI * 2;
      c.position.set(p.x + Math.cos(a) * size * 1.6, p.h + Math.sin(a * 1.3) * size * 0.6, p.z + Math.sin(a) * size * 1.6);
      c.scale.setScalar(size * 1.4);
      (c.material as THREE.SpriteMaterial).rotation = a;
      (c.material as THREE.SpriteMaterial).opacity = ghost ? 0.2 : 1;
    });

    // 落下地点の照準（狙いが決まってから着地まで）
    if (this.marker) {
      const locked = p.age >= 45;
      this.marker.visible = !ghost && p.age >= 30;
      const mx = locked ? p.tx : p.x, mz = locked ? p.tz : p.z;
      this.marker.position.set(mx, 0.04, mz);
      this.marker.scale.setScalar(size * 2.5 + 1 + Math.sin(time * 14) * 0.15);
      this.marker.rotation.z = time * 2;
    }

    if (ghost) return;
    // 尾・粒子
    const col = new THREE.Color(this.color);
    if (has(p, "homing")) {
      this.hue = (this.hue + 0.02) % 1;
      col.setHSL(this.hue, 0.9, 0.6); // ゆらゆら追尾は虹色の尾
    }
    const n = has(p, "tiny") ? 3 : Math.min(5, 1 + Math.round(size * 2));
    glowFx.emit({ count: n, x: p.x, y: p.h, z: p.z, color: col, speed: 0.5, life: has(p, "tiny") || has(p, "fast") ? 0.5 : 0.35, size: Math.max(0.25, size * 1.8), grow: -size * 3 });
    if (s.meteor) {
      // 炎の尾（上昇中は下へ、落下中は上へ流れる）
      const falling = p.age > 45;
      glowFx.emit({ count: 3, x: p.x, y: p.h, z: p.z, color: 0xff6a00, speed: 1.5, dir: [0, falling ? 1 : -1, 0], spread: 0.4, life: 0.5, size: size * 2.2, grow: -size * 2 });
      if (falling) sparkFx.emit({ count: 1, x: p.x, y: p.h, z: p.z, color: 0xffd43b, speed: 2, dir: [0, 1, 0], spread: 0.6, life: 0.4, size: 0.18 });
    }
    if (has(p, "giant") && p.h < 1.2 && !s.meteor && Math.random() < 0.5) {
      sparkFx.emit({ count: 1, x: p.x, y: 0.1, z: p.z, color: 0xd8c7a0, speed: 1.5, up: 1.5, life: 0.5, size: 0.35, grow: 0.4 }); // 地面をこする砂ぼこり
    }
  }

  dispose() {
    for (const m of this.mats) m.dispose();
    this.marker?.geometry.dispose();
  }
}
