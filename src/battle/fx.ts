// 演出用の部品: 加算合成のパーティクル、発光テクスチャ、ダメージ数字。
import * as THREE from "three";

// --- 生成テクスチャ ---
function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function glowTexture(): THREE.CanvasTexture {
  return canvasTexture(64, (g, s) => {
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.8)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
  });
}

// 漫画風の「バシッ」星（黄色＋黒縁）。手描きの絵柄に合わせる。
export function starTexture(): THREE.CanvasTexture {
  return canvasTexture(128, (g, s) => {
    g.translate(s / 2, s / 2);
    g.beginPath();
    const n = 9;
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? s * (0.42 + ((i * 7) % 5) * 0.012) : s * 0.2;
      const a = (i / (n * 2)) * Math.PI * 2;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    g.lineJoin = "round";
    g.lineWidth = 7;
    g.strokeStyle = "#1a1a1a";
    g.fillStyle = "#ffe14d";
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(0, 0, s * 0.11, 0, Math.PI * 2);
    g.fillStyle = "#fff";
    g.fill();
  });
}

// 黒縁つきの輪（衝撃波）。色は material.color で乗算する。
export function ringTexture(): THREE.CanvasTexture {
  return canvasTexture(128, (g, s) => {
    g.translate(s / 2, s / 2);
    g.lineWidth = 9;
    g.strokeStyle = "#ffffff";
    g.beginPath();
    g.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 2.5;
    g.strokeStyle = "#1a1a1a";
    for (const r of [0.42 - 0.04, 0.42 + 0.04]) {
      g.beginPath();
      g.arc(0, 0, s * r, 0, Math.PI * 2);
      g.stroke();
    }
  });
}

// 火花（黒縁の丸）。通常合成なので明るい地面でも見える。
export function sparkTexture(): THREE.CanvasTexture {
  return canvasTexture(64, (g, s) => {
    g.beginPath();
    g.arc(s / 2, s / 2, s * 0.36, 0, Math.PI * 2);
    g.fillStyle = "#ffffff";
    g.fill();
    g.lineWidth = 5;
    g.strokeStyle = "#1a1a1a";
    g.stroke();
  });
}

export function arcTexture(): THREE.CanvasTexture {
  return canvasTexture(128, (g, s) => {
    g.translate(s / 2, s / 2);
    for (let i = 0; i < 10; i++) {
      g.strokeStyle = `rgba(255,255,255,${0.1 + i * 0.09})`;
      g.lineWidth = 3 + i * 1.2;
      g.beginPath();
      g.arc(0, 0, s * 0.38, -Math.PI * 0.75 + i * 0.09, -Math.PI * 0.75 + 0.9 + i * 0.09);
      g.stroke();
    }
  });
}

// --- パーティクル（Points 1つにまとめて描く） ---
interface P {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; max: number;
  size: number; grow: number;
  r: number; g: number; b: number;
  gravity: number; drag: number;
}

export interface EmitOpts {
  count: number;
  x: number; y: number; z: number;
  color: THREE.ColorRepresentation;
  speed: number; // 初速
  spread?: number; // 0..1 方向のばらつき（1=全方向）
  dir?: [number, number, number]; // 主方向
  life?: number; // 秒
  size?: number;
  grow?: number; // 秒あたりのサイズ変化
  gravity?: number;
  drag?: number;
  up?: number; // 上向き初速の加算
}

export class Particles {
  private cap: number;
  private ps: P[] = [];
  private geo = new THREE.BufferGeometry();
  private pos: Float32Array;
  private col: Float32Array;
  private siz: Float32Array;
  private alp: Float32Array;
  points: THREE.Points;
  private mat: THREE.ShaderMaterial;

  constructor(texture: THREE.Texture, additive: boolean, cap = 1500) {
    this.cap = cap;
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 3);
    this.siz = new Float32Array(cap);
    this.alp = new Float32Array(cap);
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    this.geo.setAttribute("psize", new THREE.BufferAttribute(this.siz, 1));
    this.geo.setAttribute("alpha", new THREE.BufferAttribute(this.alp, 1));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture }, scale: { value: 400 } },
      vertexShader: `
        attribute float psize; attribute float alpha; attribute vec3 color;
        varying float vA; varying vec3 vC; uniform float scale;
        void main() {
          vA = alpha; vC = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = psize * scale / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D map; varying float vA; varying vec3 vC;
        void main() {
          vec4 t = texture2D(map, gl_PointCoord);
          if (t.a < 0.05) discard;
          gl_FragColor = vec4(vC * t.rgb, t.a * vA);
        }`,
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
  }

  setScale(viewportHeight: number) {
    this.mat.uniforms.scale.value = viewportHeight * 0.9;
  }

  emit(o: EmitOpts) {
    const c = new THREE.Color(o.color);
    const spread = o.spread ?? 1;
    const [dx, dy, dz] = o.dir ?? [0, 1, 0];
    for (let i = 0; i < o.count && this.ps.length < this.cap; i++) {
      // 主方向 + ランダム方向を spread で混ぜる
      const rx = Math.random() * 2 - 1, ry = Math.random() * 2 - 1, rz = Math.random() * 2 - 1;
      let vx = dx * (1 - spread) + rx * spread;
      let vy = dy * (1 - spread) + ry * spread;
      let vz = dz * (1 - spread) + rz * spread;
      const l = Math.hypot(vx, vy, vz) || 1;
      const sp = o.speed * (0.5 + Math.random() * 0.7);
      vx = (vx / l) * sp; vy = (vy / l) * sp + (o.up ?? 0); vz = (vz / l) * sp;
      const life = (o.life ?? 0.5) * (0.6 + Math.random() * 0.6);
      this.ps.push({
        x: o.x, y: o.y, z: o.z, vx, vy, vz, life, max: life,
        size: (o.size ?? 0.3) * (0.7 + Math.random() * 0.6), grow: o.grow ?? 0,
        r: c.r, g: c.g, b: c.b, gravity: o.gravity ?? 0, drag: o.drag ?? 2,
      });
    }
  }

  update(dt: number) {
    let n = 0;
    const keep: P[] = [];
    for (const p of this.ps) {
      p.life -= dt;
      if (p.life <= 0) continue;
      const d = Math.exp(-p.drag * dt);
      p.vx *= d; p.vy = p.vy * d - p.gravity * dt; p.vz *= d;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.y < 0.02) { p.y = 0.02; p.vy = Math.abs(p.vy) * 0.3; }
      p.size = Math.max(0, p.size + p.grow * dt);
      keep.push(p);
      const t = p.life / p.max;
      this.pos[n * 3] = p.x; this.pos[n * 3 + 1] = p.y; this.pos[n * 3 + 2] = p.z;
      this.col[n * 3] = p.r; this.col[n * 3 + 1] = p.g; this.col[n * 3 + 2] = p.b;
      this.siz[n] = p.size;
      this.alp[n] = Math.min(1, t * 1.6);
      n++;
    }
    this.ps = keep;
    this.geo.setDrawRange(0, n);
    for (const k of ["position", "color", "psize", "alpha"]) (this.geo.getAttribute(k) as THREE.BufferAttribute).needsUpdate = true;
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}

// --- 一瞬だけ出る板（閃光・衝撃波・斬撃の軌跡） ---
export interface Flash {
  mesh: THREE.Mesh;
  life: number;
  max: number;
  from: number; // 開始スケール
  to: number; // 終了スケール
  spin: number;
}

// --- ダメージ数字（DOM、3D 位置に追従） ---
export class Popups {
  private items: { el: HTMLElement; pos: THREE.Vector3; t: number }[] = [];
  constructor(private layer: HTMLElement) {}

  add(text: string, pos: THREE.Vector3, cls: string) {
    const el = document.createElement("div");
    el.className = `pop ${cls}`;
    el.textContent = text;
    this.layer.appendChild(el);
    this.items.push({ el, pos: pos.clone(), t: 0 });
  }

  update(dt: number, camera: THREE.Camera, w: number, h: number) {
    this.items = this.items.filter((it) => {
      it.t += dt;
      if (it.t > 0.9) { it.el.remove(); return false; }
      const v = it.pos.clone().project(camera);
      it.el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h - it.t * 60}px) translate(-50%, -50%)`;
      it.el.style.opacity = String(Math.min(1, (0.9 - it.t) * 4));
      return true;
    });
  }

  clear() {
    for (const it of this.items) it.el.remove();
    this.items = [];
  }
}
