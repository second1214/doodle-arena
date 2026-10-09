// 描いた線・塗りを風船のように膨らませて立体にする（インフレート）。
// 描いた部分の「縁からの距離」を厚みにし、表と裏の2面を作って縁で閉じる。色は描いた色をそのまま使う。
import * as THREE from "three";
import { edt } from "../detect";

export interface InflateOptions {
  maxCells?: number; // 長辺を何マスで作るか（細かいほど滑らかだが重い）
  maxRadius?: number; // 厚みの丸みの最大半径（マス）。太い塗りは平たい座布団、細い線は丸い管になる
  depthScale?: number; // 厚みの倍率
  grow?: number; // 細い線を太らせるマス数（立体に見えるように。当たり判定にも同じ分を足している）
  smooth?: number; // 縁のギザギザをならす回数
}

// src: パーツ1枚分の画像（W×H、透明部分は描かれていない）。worldPerPx: 1 画素が何単位か。
// 戻り値の形は、画像の中心を原点に、右が +x・上が +y・手前が +z。
export function inflateCanvas(src: HTMLCanvasElement, worldPerPx: number, opt: InflateOptions = {}): THREE.BufferGeometry | null {
  const W = src.width, H = src.height;
  const maxCells = opt.maxCells ?? 96;
  const cellPx = Math.max(2, Math.ceil(Math.max(W, H) / maxCells));
  const gw = Math.ceil(W / cellPx), gh = Math.ceil(H / cellPx);
  const data = src.getContext("2d")!.getImageData(0, 0, W, H).data;

  // マスごとの「描かれているか」と平均色
  const N = Math.max(gw, gh) + 2; // edt は正方形用。周りに1マスの余白
  const mask = new Uint8Array(N * N);
  const col = new Float32Array(gw * gh * 3);
  let any = false;
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      let r = 0, g = 0, b = 0, n = 0, cnt = 0;
      for (let y = gy * cellPx; y < Math.min(H, (gy + 1) * cellPx); y++) {
        for (let x = gx * cellPx; x < Math.min(W, (gx + 1) * cellPx); x++) {
          const o = (y * W + x) * 4;
          cnt++;
          if (data[o + 3] > 100) { r += data[o]; g += data[o + 1]; b += data[o + 2]; n++; }
        }
      }
      if (n * 2 >= cnt) {
        mask[(gy + 1) * N + gx + 1] = 1;
        any = true;
      }
      const ci = (gy * gw + gx) * 3;
      // 描いた色（sRGB）を光の計算用（線形）に直す
      if (n) { col[ci] = Math.pow(r / n / 255, 2.2); col[ci + 1] = Math.pow(g / n / 255, 2.2); col[ci + 2] = Math.pow(b / n / 255, 2.2); }
    }
  }
  if (!any) return null;

  // 細い線を太らせる（周りのマスに色ごと広げる）
  for (let g = 0; g < (opt.grow ?? 1); g++) {
    const add: number[] = [];
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      if (mask[(gy + 1) * N + gx + 1]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh || !mask[(ny + 1) * N + nx + 1]) continue;
        const ci = (gy * gw + gx) * 3, ni = (ny * gw + nx) * 3;
        col[ci] = col[ni]; col[ci + 1] = col[ni + 1]; col[ci + 2] = col[ni + 2];
        add.push((gy + 1) * N + gx + 1);
        break;
      }
    }
    for (const i of add) mask[i] = 1;
  }

  // 縁からの距離 → 厚み（円の断面: 細い線は丸い管、太い塗りは縁が丸く中が平たい）
  const outside = new Uint8Array(N * N);
  for (let i = 0; i < outside.length; i++) outside[i] = mask[i] ? 0 : 1;
  const d2 = edt(outside, N);
  const R = opt.maxRadius ?? 10;
  const depthScale = opt.depthScale ?? 1;
  const cellW = cellPx * worldPerPx;
  const heightOfCell = (gx: number, gy: number) => {
    const i = (gy + 1) * N + gx + 1;
    if (gx < 0 || gy < 0 || gx >= gw || gy >= gh || !mask[i]) return -1;
    const d = Math.min(R, Math.sqrt(d2[i]) - 0.5);
    return Math.sqrt(Math.max(0, R * R - (R - d) * (R - d))) * cellW * 0.8 * depthScale + cellW * 0.15;
  };

  // 頂点はマスの角。周りの描かれたマスの厚みを平均（縁は 0 にして表と裏を閉じる）
  const vw = gw + 1, vh = gh + 1;
  const vid = new Int32Array(vw * vh).fill(-1);
  const pos: number[] = [];
  const colors: number[] = [];
  const front = new Float32Array(vw * vh);
  const ox = (W / 2) * worldPerPx, oy = (H / 2) * worldPerPx;
  let nv = 0;
  for (let vy = 0; vy < vh; vy++) {
    for (let vx = 0; vx < vw; vx++) {
      let s = 0, n = 0, out = 0, cr = 0, cg = 0, cb = 0;
      for (const [cx, cy] of [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]]) {
        const h = heightOfCell(cx, cy);
        if (h < 0) { out++; continue; }
        s += h; n++;
        const ci = (cy * gw + cx) * 3;
        cr += col[ci]; cg += col[ci + 1]; cb += col[ci + 2];
      }
      if (!n) continue;
      front[vy * vw + vx] = out ? 0 : s / n;
      vid[vy * vw + vx] = nv++;
      pos.push(vx * cellW - ox, oy - vy * cellW, 0);
      colors.push(cr / n, cg / n, cb / n);
    }
  }
  // 縁のギザギザをならす: 縁の頂点を、隣の縁の頂点の平均へ少しずつ寄せる
  const isEdge = (k: number) => front[k] === 0 && vid[k] >= 0;
  for (let it = 0; it < (opt.smooth ?? 3); it++) {
    const next = pos.slice();
    for (let vy = 0; vy < vh; vy++) for (let vx = 0; vx < vw; vx++) {
      const k = vy * vw + vx;
      if (!isEdge(k)) continue;
      let sx = 0, sy = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = vx + dx, ny = vy + dy;
        if (nx < 0 || ny < 0 || nx >= vw || ny >= vh) continue;
        const nk = ny * vw + nx;
        if (!isEdge(nk)) continue;
        sx += pos[vid[nk] * 3]; sy += pos[vid[nk] * 3 + 1]; n++;
      }
      if (n >= 2) {
        const v = vid[k];
        next[v * 3] = pos[v * 3] * 0.5 + (sx / n) * 0.5;
        next[v * 3 + 1] = pos[v * 3 + 1] * 0.5 + (sy / n) * 0.5;
      }
    }
    for (let q = 0; q < pos.length; q++) pos[q] = next[q];
  }

  // 表（+z）と裏（-z）の2組の頂点。縁は厚み 0 で重なる
  const total = nv;
  const P = new Float32Array(total * 2 * 3);
  const C = new Float32Array(total * 2 * 3);
  for (let vy = 0; vy < vh; vy++) {
    for (let vx = 0; vx < vw; vx++) {
      const k = vid[vy * vw + vx];
      if (k < 0) continue;
      const z = front[vy * vw + vx];
      P.set([pos[k * 3], pos[k * 3 + 1], z], k * 3);
      P.set([pos[k * 3], pos[k * 3 + 1], -z], (k + total) * 3);
      C.set(colors.slice(k * 3, k * 3 + 3), k * 3);
      C.set(colors.slice(k * 3, k * 3 + 3), (k + total) * 3);
    }
  }
  const idx: number[] = [];
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      if (!mask[(gy + 1) * N + gx + 1]) continue;
      const a = vid[gy * vw + gx], b = vid[gy * vw + gx + 1], c = vid[(gy + 1) * vw + gx], d = vid[(gy + 1) * vw + gx + 1];
      idx.push(a, c, b, b, c, d); // 表
      idx.push(a + total, b + total, c + total, b + total, d + total, c + total); // 裏
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(P, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(C, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}
