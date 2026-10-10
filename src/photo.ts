// 写真の取り込み: 紙に描いた絵の写真から、線（Stroke）を作る。DOM 非依存（画素の配列だけを使う）。
// 手順: 正方形の小さな画像にする → まわりの紙の色（ぼかした色）より はっきり違う所を「インク」にする → 小さなゴミを消す
// → 細線化して骨だけにする → 骨をたどって線にし、太さはインクの幅、色はインクの平均色にする。
import { CANVAS_SIZE, edt, thin, type Stroke } from "./detect";

export interface Pixels { width: number; height: number; data: Uint8ClampedArray | Uint8Array } // RGBA

export const PHOTO_GRID = 256; // 処理する細かさ
const MAX_STROKES = 400;

// 正方形・積分画像でのぼかし（半径 r の平均）
function boxBlur(src: Float32Array, n: number, r: number): Float32Array {
  const I = new Float64Array((n + 1) * (n + 1));
  for (let y = 0; y < n; y++) {
    let row = 0;
    for (let x = 0; x < n; x++) { row += src[y * n + x]; I[(y + 1) * (n + 1) + x + 1] = I[y * (n + 1) + x + 1] + row; }
  }
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(n, y + r + 1);
    for (let x = 0; x < n; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(n, x + r + 1);
      const s = I[y1 * (n + 1) + x1] - I[y0 * (n + 1) + x1] - I[y1 * (n + 1) + x0] + I[y0 * (n + 1) + x0];
      out[y * n + x] = s / ((y1 - y0) * (x1 - x0));
    }
  }
  return out;
}

// インクの所（1）。sensitivity 0〜1（大きいほど うすい線も拾う）
export function inkMask(img: Pixels, sensitivity = 0.5): Uint8Array {
  const n = img.width; // 正方形が前提
  const ch = [0, 1, 2].map((c) => { const a = new Float32Array(n * n); for (let i = 0; i < n * n; i++) a[i] = img.data[i * 4 + c]; return a; });
  const bg = ch.map((a) => boxBlur(a, n, Math.max(4, Math.round(n / 10))));
  const thr = 90 - 70 * Math.max(0, Math.min(1, sensitivity)); // 色の差のしきい値（20〜90）
  const ink = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) {
    const dr = ch[0][i] - bg[0][i], dg = ch[1][i] - bg[1][i], db = ch[2][i] - bg[2][i];
    const lum = 0.3 * dr + 0.59 * dg + 0.11 * db;
    if (lum > 12) continue; // 紙より明るい所（光の反射など）は線ではない
    if (Math.hypot(dr, dg, db) > thr) ink[i] = 1;
  }
  // 小さなゴミ（点・紙の模様）を消す
  const seen = new Uint8Array(n * n);
  const minArea = Math.max(6, Math.round(n * n * 0.0002));
  for (let s = 0; s < n * n; s++) {
    if (!ink[s] || seen[s]) continue;
    const comp = [s];
    seen[s] = 1;
    for (let k = 0; k < comp.length; k++) {
      const i = comp[k], x = i % n, y = (i - x) / n;
      for (const j of [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1, y > 0 ? i - n : -1, y < n - 1 ? i + n : -1]) if (j >= 0 && ink[j] && !seen[j]) { seen[j] = 1; comp.push(j); }
    }
    if (comp.length < minArea) for (const i of comp) ink[i] = 0;
  }
  return ink;
}

// 点列を間引く（Ramer–Douglas–Peucker）
function simplify(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let far = -1, k = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = L ? Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L : Math.hypot(p[0] - a[0], p[1] - a[1]);
    if (d > far) { far = d; k = i; }
  }
  if (far <= eps) return [a, b];
  return [...simplify(pts.slice(0, k + 1), eps).slice(0, -1), ...simplify(pts.slice(k), eps)];
}

const hex = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");

// 細線化した骨（1画素の線）をたどって、点の並び（画素番号）の列にする。端から → 残り（輪）
function tracePaths(sk: Uint8Array, n: number): number[][] {
  const nb = (i: number) => {
    const x = i % n, y = (i - x) / n, out: number[] = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < n && ny < n && sk[ny * n + nx]) out.push(ny * n + nx);
    }
    return out;
  };
  const used = new Uint8Array(n * n);
  const paths: number[][] = [];
  const trace = (s: number) => {
    const path = [s];
    used[s] = 1;
    for (let cur = s; ;) {
      const next = nb(cur).find((j) => !used[j]);
      if (next === undefined) break;
      used[next] = 1;
      path.push(next);
      cur = next;
    }
    paths.push(path);
  };
  for (let i = 0; i < n * n; i++) if (sk[i] && !used[i] && nb(i).length === 1) trace(i);
  for (let i = 0; i < n * n; i++) if (sk[i] && !used[i]) trace(i);
  return paths;
}

// 写真（正方形の画素）→ 線。絵のある範囲を CANVAS_SIZE の中央に大きく置く
export function photoToStrokes(img: Pixels, sensitivity = 0.5): Stroke[] {
  const n = img.width;
  const ink = inkMask(img, sensitivity);
  let x0 = n, y0 = n, x1 = -1, y1 = -1;
  for (let i = 0; i < n * n; i++) if (ink[i]) { const x = i % n, y = (i - x) / n; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) return [];
  const margin = 40;
  const scale = (CANVAS_SIZE - 2 * margin) / Math.max(8, x1 - x0 + 1, y1 - y0 + 1);
  const ox = CANVAS_SIZE / 2 - ((x0 + x1 + 1) / 2) * scale, oy = CANVAS_SIZE / 2 - ((y0 + y1 + 1) / 2) * scale;

  // インクの太さ: 紙までの距離
  const paper = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) paper[i] = ink[i] ? 0 : 1;
  const d2 = edt(paper, n);
  const sk = thin(ink, n, n);

  const paths = tracePaths(sk, n);

  const strokes: { s: Stroke; len: number }[] = [];
  for (const path of paths) {
    let r = 0, cr = 0, cg = 0, cb = 0;
    for (const i of path) { r += Math.sqrt(d2[i]); cr += img.data[i * 4]; cg += img.data[i * 4 + 1]; cb += img.data[i * 4 + 2]; }
    const m = path.length;
    r /= m; cr /= m; cg /= m; cb /= m;
    if (m < 3 && r < 1.5) continue; // ほぼ点
    // 鉛筆やペンの暗い線は、くっきりした黒にそろえる
    const color = 0.3 * cr + 0.59 * cg + 0.11 * cb < 95 && Math.max(cr, cg, cb) - Math.min(cr, cg, cb) < 40 ? "#222222" : `#${hex(cr)}${hex(cg)}${hex(cb)}`;
    const pts = simplify(path.map((i): [number, number] => [i % n, Math.floor(i / n)]), 0.8);
    const points = pts.flatMap(([x, y]) => [Math.round(ox + (x + 0.5) * scale), Math.round(oy + (y + 0.5) * scale)]);
    const width = Math.max(3, Math.min(40, Math.round(2 * r * scale)));
    strokes.push({ s: { color, width, points: points.length >= 4 ? points : [points[0], points[1]] }, len: m });
  }
  // 多すぎる時は短い線から捨てる（公開できる線の数に収める）
  const kept = strokes.sort((a, b) => b.len - a.len).slice(0, MAX_STROKES).map((x) => x.s);
  // 色の線（ぬり）を先に、黒い線（ふちどり）を後に描く＝ふちが上に見える
  return [...kept.filter((s) => s.color !== "#222222"), ...kept.filter((s) => s.color === "#222222")];
}

// --- 🎨 いろごと（写真・色をぬった絵）: 背景を切りぬいて、色を数色にまとめ、ぬりつぶした絵にする ---
const dist2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const rgbAt = (img: Pixels, i: number) => [img.data[i * 4], img.data[i * 4 + 1], img.data[i * 4 + 2]];

// k-means（はじめの中心は「いちばん遠い色」を順に選ぶ＝毎回同じ結果）
function kmeans(samples: number[][], k: number, iters = 8): number[][] {
  if (!samples.length) return [];
  const c: number[][] = [samples[Math.floor(samples.length / 2)]];
  while (c.length < k) {
    let best = -1, far = -1;
    for (let i = 0; i < samples.length; i++) { const d = Math.min(...c.map((x) => dist2(x, samples[i]))); if (d > far) { far = d; best = i; } }
    if (far < 200) break; // もう同じような色しかない
    c.push(samples[best]);
  }
  for (let it = 0; it < iters; it++) {
    const sum = c.map(() => [0, 0, 0, 0]);
    for (const s of samples) {
      let j = 0, bd = Infinity;
      c.forEach((x, q) => { const d = dist2(x, s); if (d < bd) { bd = d; j = q; } });
      sum[j][0] += s[0]; sum[j][1] += s[1]; sum[j][2] += s[2]; sum[j][3]++;
    }
    sum.forEach((v, q) => { if (v[3]) c[q] = [v[0] / v[3], v[1] / v[3], v[2] / v[3]]; });
  }
  return c;
}

// 背景（写真のふちとつながった、ふちの色に近い所）＝ 1
export function backgroundMask(img: Pixels, tolerance = 0.5): Uint8Array {
  const n = img.width;
  const border: number[][] = [];
  for (let k = 0; k < n; k++) for (const i of [k, (n - 1) * n + k, k * n, k * n + n - 1]) border.push(rgbAt(img, i));
  const bg = kmeans(border, 4);
  const T = (30 + 50 * tolerance) ** 2;
  const like = (i: number) => bg.some((b) => dist2(b, rgbAt(img, i)) < T);
  const mask = new Uint8Array(n * n);
  const stack: number[] = [];
  for (let k = 0; k < n; k++) for (const i of [k, (n - 1) * n + k, k * n, k * n + n - 1]) if (!mask[i] && like(i)) { mask[i] = 1; stack.push(i); }
  while (stack.length) {
    const i = stack.pop()!, x = i % n, y = (i - x) / n;
    for (const j of [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1, y > 0 ? i - n : -1, y < n - 1 ? i + n : -1]) if (j >= 0 && !mask[j] && like(j)) { mask[j] = 1; stack.push(j); }
  }
  return mask;
}

const MAX_COLOR_STROKES = 520;

// detail 0〜1（大きいほど こまかい）・tolerance 0〜1（大きいほど 背景を広く消す）
export function photoToColorStrokes(img: Pixels, detail = 0.5, tolerance = 0.5): Stroke[] {
  const n = img.width;
  const bg = backgroundMask(img, tolerance);
  let subject = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) subject[i] = bg[i] ? 0 : 1;
  // 小さなゴミを消す（いちばん大きい塊の 3% 未満）
  const comps: number[][] = [];
  const seen = new Uint8Array(n * n);
  for (let s = 0; s < n * n; s++) {
    if (!subject[s] || seen[s]) continue;
    const comp = [s];
    seen[s] = 1;
    for (let k = 0; k < comp.length; k++) {
      const i = comp[k], x = i % n, y = (i - x) / n;
      for (const j of [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1, y > 0 ? i - n : -1, y < n - 1 ? i + n : -1]) if (j >= 0 && subject[j] && !seen[j]) { seen[j] = 1; comp.push(j); }
    }
    comps.push(comp);
  }
  const biggest = Math.max(0, ...comps.map((c) => c.length));
  for (const c of comps) if (c.length < biggest * 0.03) for (const i of c) subject[i] = 0;
  let area = 0;
  for (let i = 0; i < n * n; i++) area += subject[i];
  // 背景が見つからない（写真いっぱいに写っている）・ほとんど背景 → 全部を使う
  if (area < n * n * 0.01 || area > n * n * 0.97) { subject = new Uint8Array(n * n).fill(1); area = n * n; }

  let x0 = n, y0 = n, x1 = -1, y1 = -1;
  for (let i = 0; i < n * n; i++) if (subject[i]) { const x = i % n, y = (i - x) / n; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) return [];
  const long = Math.max(8, x1 - x0 + 1, y1 - y0 + 1);
  const margin = 40;
  const scale = (CANVAS_SIZE - 2 * margin) / long;
  const ox = CANVAS_SIZE / 2 - ((x0 + x1 + 1) / 2) * scale, oy = CANVAS_SIZE / 2 - ((y0 + y1 + 1) / 2) * scale;
  const toC = (x: number, y: number) => [Math.round(ox + x * scale), Math.round(oy + y * scale)];

  // 色を まとめる（写っているものの色だけで）
  const samples: number[][] = [];
  const step = Math.max(1, Math.floor(Math.sqrt(area / 3000)));
  for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) if (subject[y * n + x]) samples.push(rgbAt(img, y * n + x));
  const pal = kmeans(samples, 6);
  const near = (rgb: number[]) => { let j = 0, bd = Infinity; pal.forEach((c, q) => { const d = dist2(c, rgb); if (d < bd) { bd = d; j = q; } }); return j; };

  for (let rows = Math.round(36 + 54 * Math.max(0, Math.min(1, detail))); rows >= 16; rows = Math.round(rows * 0.85)) {
    const cell = long / rows;
    const byColor = pal.map(() => [] as Stroke[]);
    const width = Math.max(4, Math.round(cell * scale * 1.3));
    for (let ry = 0; ry * cell <= y1 - y0; ry++) {
      const y = Math.min(y1, Math.round(y0 + (ry + 0.5) * cell));
      let run = -1, sx = 0;
      const flush = (ex: number) => {
        if (run < 0) return;
        const [ax, ay] = toC(sx, y + 0.5), [bx] = toC(ex, y + 0.5);
        const c = pal[run];
        byColor[run].push({ color: `#${hex(c[0])}${hex(c[1])}${hex(c[2])}`, width, points: bx - ax > 1 ? [ax, ay, bx, ay] : [ax, ay] });
      };
      for (let cx = 0; cx * cell <= x1 - x0 + cell; cx++) {
        const x = Math.round(x0 + (cx + 0.5) * cell);
        const inside = x <= x1 && subject[y * n + x];
        // 1マスの中の平均の色
        let k = -1;
        if (inside) {
          const acc = [0, 0, 0]; let m = 0;
          const h = Math.max(0, Math.floor(cell / 2));
          for (let dy = -h; dy <= h; dy++) for (let dx = -h; dx <= h; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= n || yy >= n || !subject[yy * n + xx]) continue;
            const c = rgbAt(img, yy * n + xx); acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; m++;
          }
          k = near(m ? acc.map((v) => v / m) : rgbAt(img, y * n + x));
        }
        if (k !== run) { flush(Math.round(x0 + cx * cell)); run = k; sx = Math.round(x0 + cx * cell); }
      }
      flush(Math.min(x1, Math.round(x0 + (Math.ceil((x1 - x0 + cell) / cell)) * cell)));
    }
    // ふちどり（写っているものの外側の線）
    const edge = new Uint8Array(n * n);
    for (let i = 0; i < n * n; i++) {
      if (!subject[i]) continue;
      const x = i % n, y = (i - x) / n;
      if (x === 0 || y === 0 || x === n - 1 || y === n - 1 || !subject[i - 1] || !subject[i + 1] || !subject[i - n] || !subject[i + n]) edge[i] = 1;
    }
    const outline = tracePaths(thin(edge, n, n), n)
      .filter((pth) => pth.length >= 6)
      .map((pth): Stroke => ({ color: "#222222", width: Math.max(4, Math.round(width * 0.45)), points: simplify(pth.map((i): [number, number] => [i % n, Math.floor(i / n)]), 1).flatMap(([x, y]) => toC(x + 0.5, y + 0.5)) }));
    // 広い色から先にぬる → ふちどりを最後に
    const order = byColor.map((list, q) => ({ list, q })).sort((a, b) => b.list.length - a.list.length);
    const out = [...order.flatMap((o) => o.list), ...outline];
    if (out.length <= MAX_COLOR_STROKES) return out;
  }
  return [];
}
