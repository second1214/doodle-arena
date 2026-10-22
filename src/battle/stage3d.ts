// ステージの見た目: 背景（昼・夜・夕やけ・おへや・海べ・どうくつ）と 地形（台・坂・はしご）。戦闘計算には影響しない。
import * as THREE from "three";
import { ARENA_RADIUS } from "../sim/consts";
import type { Arena, Backdrop, Ramp } from "../sim/arena";

interface Look {
  sky: [string, string, string]; // 上・まん中・下
  fog: number; fogNear: number; fogFar: number;
  hemi: [number, number, number]; // 空の色・地面の色・強さ
  sun: [number, number]; // 色・強さ
  top: number; side: number; rim: number; floor: number; grid: [number, number];
  block: number; blockTop: number;
}

const LOOKS: Record<Backdrop, Look> = {
  day: { sky: ["#bfe0ff", "#f3ecff", "#ffe9d6"], fog: 0xf3ecff, fogNear: 28, fogFar: 70, hemi: [0xffffff, 0xd9cfee, 1.25], sun: [0xffffff, 1.7], top: 0xfff6e8, side: 0xf2a65a, rim: 0xff8a5c, floor: 0xd9e8f5, grid: [0xe6d6c2, 0xefe2d2], block: 0xc9a27a, blockTop: 0xffe8c2 },
  night: { sky: ["#0b1035", "#2a2f6b", "#5a4a8a"], fog: 0x1b1f4a, fogNear: 24, fogFar: 60, hemi: [0x8fa0ff, 0x2a2450, 0.75], sun: [0xb8c8ff, 0.9], top: 0x8d8fb8, side: 0x4b4a7e, rim: 0x6c6bd0, floor: 0x1d2150, grid: [0x7d7fa8, 0x7476a0], block: 0x5b5f9a, blockTop: 0x9fa3d6 },
  sunset: { sky: ["#ff8a5c", "#ffb37a", "#ffe0b0"], fog: 0xffc597, fogNear: 26, fogFar: 64, hemi: [0xffd6b0, 0xb07a8a, 1.1], sun: [0xffb070, 1.8], top: 0xffe0c0, side: 0xd9774a, rim: 0xff7a4a, floor: 0xe9a98a, grid: [0xe8b894, 0xefc4a2], block: 0xc07a4a, blockTop: 0xffc490 },
  indoor: { sky: ["#f6e7cf", "#f6e7cf", "#e9d2b0"], fog: 0xf1dfc4, fogNear: 30, fogFar: 70, hemi: [0xfff3dd, 0xc9a07a, 1.25], sun: [0xfff0d0, 1.4], top: 0xd9a46a, side: 0xa86a3c, rim: 0x8c5a2b, floor: 0xb98352, grid: [0xc48f5c, 0xc99766], block: 0x7a9fd6, blockTop: 0xbcd4f5 },
  beach: { sky: ["#6ec6ff", "#bfe9ff", "#fff6da"], fog: 0xd8f0ff, fogNear: 30, fogFar: 80, hemi: [0xffffff, 0xf2d9a6, 1.3], sun: [0xffffff, 1.8], top: 0xffe9b0, side: 0xe6c27a, rim: 0xffd27a, floor: 0x3ab0e0, grid: [0xf0d79a, 0xf3dca6], block: 0x8f8a80, blockTop: 0xb5afa2 },
  cave: { sky: ["#1a1410", "#2b2119", "#3d2f22"], fog: 0x241b14, fogNear: 18, fogFar: 46, hemi: [0xffd9a0, 0x2a1d12, 0.8], sun: [0xffc37a, 1.1], top: 0x8a7a66, side: 0x5a4a38, rim: 0x6e5a42, floor: 0x1c1610, grid: [0x76675a, 0x7d6e60], block: 0x6b5b4b, blockTop: 0x9a8a74 },
};

export interface StageLights { hemi: THREE.HemisphereLight; sun: THREE.DirectionalLight }

function skyTexture(c: [string, string, string]): THREE.CanvasTexture {
  const sky = document.createElement("canvas");
  sky.width = 4; sky.height = 256;
  const sg = sky.getContext("2d")!;
  const grad = sg.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, c[0]); grad.addColorStop(0.55, c[1]); grad.addColorStop(1, c[2]);
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(sky);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// 坂（くさび形）
function rampGeometry(r: Ramp): THREE.BufferGeometry {
  const { x0, x1, z0, z1, h0, h1 } = r;
  // 低い端と 高い端の 4すみ（上面）＋ 下の 4すみ
  const top = r.axis === "x"
    ? [[x0, h0, z0], [x1, h1, z0], [x1, h1, z1], [x0, h0, z1]]
    : [[x0, h0, z0], [x1, h0, z0], [x1, h1, z1], [x0, h1, z1]];
  const bot = top.map(([x, , z]) => [x, 0, z]);
  const v = [...top, ...bot];
  const quads = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const pos: number[] = [];
  for (const [a, b, c, d] of quads) for (const k of [a, b, c, a, c, d]) pos.push(...v[k]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export function buildStage(scene: THREE.Scene, arena: Arena, disposables: { dispose(): void }[]): StageLights {
  const L = LOOKS[arena.backdrop] ?? LOOKS.day;
  const keep = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x; };
  scene.background = keep(skyTexture(L.sky));
  scene.fog = new THREE.Fog(L.fog, L.fogNear, L.fogFar);

  const hemi = new THREE.HemisphereLight(L.hemi[0], L.hemi[1], L.hemi[2]);
  const sun = new THREE.DirectionalLight(L.sun[0], L.sun[1]);
  sun.position.set(-5, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0015;
  sun.shadow.radius = 4;
  scene.add(hemi, sun, sun.target);

  const mat = (color: number, rough = 0.9) => keep(new THREE.MeshStandardMaterial({ color, roughness: rough }));
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => { keep(g); const x = new THREE.Mesh(g, m); scene.add(x); return x; };

  // 丸い台座（上面＋側面）＋ 方眼紙のような マス目
  const top = mesh(new THREE.CircleGeometry(ARENA_RADIUS, 96), mat(L.top));
  top.rotation.x = -Math.PI / 2;
  top.receiveShadow = true;
  mesh(new THREE.CylinderGeometry(ARENA_RADIUS + 0.35, ARENA_RADIUS + 0.55, 0.9, 96, 1, true), mat(L.side, 0.7)).position.y = -0.45;
  const rim = mesh(new THREE.TorusGeometry(ARENA_RADIUS + 0.17, 0.2, 12, 96), mat(L.rim, 0.5));
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.02;
  const grid = keep(new THREE.GridHelper(ARENA_RADIUS * 2, 18, L.grid[0], L.grid[1]));
  grid.position.y = 0.004;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.7;
  scene.add(grid);
  const mask = mesh(new THREE.RingGeometry(ARENA_RADIUS, ARENA_RADIUS * 1.5, 96), mat(L.top));
  mask.rotation.x = -Math.PI / 2;
  mask.position.y = 0.006;
  const floor = mesh(new THREE.CircleGeometry(ARENA_RADIUS + 40, 48), mat(L.floor, arena.backdrop === "beach" ? 0.35 : 1));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.9;
  floor.receiveShadow = true;

  // 地形: 台（上面は明るく）・坂・はしご
  const side = mat(L.block, 0.8), lid = mat(L.blockTop, 0.85);
  for (const b of arena.blocks) {
    const w = b.x1 - b.x0, d = b.z1 - b.z0;
    const m = mesh(new THREE.BoxGeometry(w, b.h, d), [side, side, lid, side, side, side] as unknown as THREE.Material);
    m.position.set((b.x0 + b.x1) / 2, b.h / 2, (b.z0 + b.z1) / 2);
    m.castShadow = m.receiveShadow = true;
    // 上面の ふち（どこが 台か 分かりやすく）
    const edge = keep(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, b.h, d)));
    const lines = new THREE.LineSegments(edge, keep(new THREE.LineBasicMaterial({ color: 0x3b2f2a, transparent: true, opacity: 0.45 })));
    lines.position.copy(m.position);
    scene.add(lines);
  }
  for (const r of arena.ramps) {
    const m = mesh(rampGeometry(r), lid);
    m.castShadow = m.receiveShadow = true;
  }
  const wood = mat(0xa0522d, 0.7);
  for (const l of arena.ladders) {
    const grp = new THREE.Group();
    const sx = -l.nz, sz = l.nx; // はしごの 横の向き
    for (const s of [-0.28, 0.28]) {
      const rail = mesh(new THREE.BoxGeometry(0.08, l.h + 0.3, 0.08), wood);
      rail.position.set(sx * s, (l.h + 0.3) / 2, sz * s);
      grp.add(rail);
    }
    for (let y = 0.3; y < l.h + 0.1; y += 0.38) {
      const rung = mesh(new THREE.BoxGeometry(Math.abs(sx) * 0.56 + 0.06, 0.06, Math.abs(sz) * 0.56 + 0.06), wood);
      rung.position.set(0, y, 0);
      grp.add(rung);
    }
    grp.position.set(l.x + l.nx * 0.3, 0, l.z + l.nz * 0.3);
    scene.add(grp);
  }

  // 背景の 飾り
  if (arena.backdrop === "night" || arena.backdrop === "cave") {
    const n = arena.backdrop === "night" ? 260 : 60;
    const pos: number[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, r = 30 + rnd() * 20, y = arena.backdrop === "night" ? 6 + rnd() * 30 : -0.5 + rnd() * 12;
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, keep(new THREE.PointsMaterial({ color: arena.backdrop === "night" ? 0xffffff : 0xffb347, size: arena.backdrop === "night" ? 0.35 : 0.5, fog: false })));
    scene.add(pts);
  }
  if (arena.backdrop === "night") {
    const moon = mesh(new THREE.SphereGeometry(2.2, 24, 16), keep(new THREE.MeshBasicMaterial({ color: 0xfff6c8, fog: false })));
    moon.position.set(-18, 20, -34);
  }
  if (arena.backdrop === "sunset") {
    const sunDisc = mesh(new THREE.CircleGeometry(4, 32), keep(new THREE.MeshBasicMaterial({ color: 0xff6a3d, fog: false })));
    sunDisc.position.set(10, 5, -45);
  }
  if (arena.backdrop === "beach") {
    // 遠くの 波の 白い線
    for (let k = 0; k < 4; k++) {
      const wave = mesh(new THREE.RingGeometry(ARENA_RADIUS + 3 + k * 4, ARENA_RADIUS + 3.25 + k * 4, 64), keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })));
      wave.rotation.x = -Math.PI / 2;
      wave.position.y = -0.88;
    }
    // ヤシの木
    const trunk = mat(0x8b5a2b), leaf = mat(0x2f9e44);
    for (const [x, z] of [[-14, -10], [15, -12], [-18, 4]]) {
      const t = mesh(new THREE.CylinderGeometry(0.25, 0.35, 6, 8), trunk);
      t.position.set(x, 2.1, z);
      for (let k = 0; k < 5; k++) {
        const lf = mesh(new THREE.ConeGeometry(0.5, 3, 6), leaf);
        lf.position.set(x + Math.cos(k * 1.3) * 1.2, 5.2, z + Math.sin(k * 1.3) * 1.2);
        lf.rotation.set(Math.sin(k * 1.3) * 1.2, 0, -Math.cos(k * 1.3) * 1.2);
      }
    }
  }
  if (arena.backdrop === "indoor") {
    // かべ（後ろと左右）と 窓
    const wall = mat(0xfff1d6, 1);
    const back = mesh(new THREE.PlaneGeometry(60, 24), wall);
    back.position.set(0, 10, -16);
    for (const s of [-1, 1]) {
      const w = mesh(new THREE.PlaneGeometry(40, 24), wall);
      w.position.set(s * 22, 10, 0);
      w.rotation.y = -s * Math.PI / 2;
    }
    const win = mesh(new THREE.PlaneGeometry(8, 5), keep(new THREE.MeshBasicMaterial({ color: 0x9fd4ff })));
    win.position.set(6, 9, -15.9);
    const frame = mesh(new THREE.PlaneGeometry(8.6, 5.6), mat(0xffffff));
    frame.position.set(6, 9, -15.95);
  }
  return { hemi, sun };
}
