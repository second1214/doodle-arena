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
const dist4 = (a: number[], b: number[]) => dist2(a, b) + ((a[3] ?? 0) - (b[3] ?? 0)) ** 2;
const rgbAt = (img: Pixels, i: number) => [img.data[i * 4], img.data[i * 4 + 1], img.data[i * 4 + 2]];

// k-means（はじめの中心は「いちばん遠い色」を順に選ぶ＝毎回同じ結果）
function kmeans(samples: number[][], k: number, iters = 8): number[][] {
  if (!samples.length) return [];
  const c: number[][] = [samples[Math.floor(samples.length / 2)]];
  while (c.length < k) {
    let best = -1, far = -1;
    for (let i = 0; i < samples.length; i++) { const d = Math.min(...c.map((x) => dist4(x, samples[i]))); if (d > far) { far = d; best = i; } }
    if (far < 200) break; // もう同じような色しかない
    c.push(samples[best]);
  }
  for (let it = 0; it < iters; it++) {
    const D = samples[0].length;
    const sum = c.map(() => new Array(D + 1).fill(0));
    for (const s of samples) {
      let j = 0, bd = Infinity;
      c.forEach((x, q) => { const d = dist4(x, s); if (d < bd) { bd = d; j = q; } });
      for (let k = 0; k < D; k++) sum[j][k] += s[k];
      sum[j][D]++;
    }
    sum.forEach((v, q) => { if (v[D]) c[q] = v.slice(0, D).map((x) => x / v[D]); });
  }
  return c;
}

// 写っているもの（1）と背景（0）に分ける。画素は「かこんだ四角」の中だけ（四角の外＝透明 alpha 0 は背景）。
// 四角のふちの色＝背景の見本、まん中の色＝写っているものの見本。それぞれ数色にまとめ、どちらの見本に近いかで分ける
// → ならす → まん中につながる塊だけ残す → 中の穴をうめる。tolerance 0〜1（大きいほど 背景を広く消す）
export function segmentSubject(img: Pixels, tolerance = 0.5): Uint8Array {
  const n = img.width, N = n * n;
  const valid = (i: number) => img.data[i * 4 + 3] > 0;
  let x0 = n, y0 = n, x1 = -1, y1 = -1;
  for (let i = 0; i < N; i++) if (valid(i)) { const x = i % n, y = (i - x) / n; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) return new Uint8Array(N);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const ring = Math.max(2, Math.round(Math.min(w, h) * 0.04));
  // 1点ずつの色ではなく「まわりの平均の色」と「もようの こさ（明るさのばらつき）」で見る。
  // 毛のしまもようは 1点ずつだと 明るい所は床、暗い所は黒い家具に まちがえるため
  const r = Math.max(2, Math.round(n / 64));
  const ch = [0, 1, 2].map((c) => { const a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = img.data[i * 4 + c]; return boxBlur(a, n, r); });
  const lum = new Float32Array(N), lum2 = new Float32Array(N);
  for (let i = 0; i < N; i++) { const l = 0.3 * img.data[i * 4] + 0.59 * img.data[i * 4 + 1] + 0.11 * img.data[i * 4 + 2]; lum[i] = l; lum2[i] = l * l; }
  const mL = boxBlur(lum, n, r), mL2 = boxBlur(lum2, n, r);
  const feat = (i: number) => [ch[0][i], ch[1][i], ch[2][i], 1.5 * Math.sqrt(Math.max(0, mL2[i] - mL[i] * mL[i]))];
  const bgS: number[][] = [], fgS: number[][] = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * n + x;
    if (!valid(i)) continue;
    if (x - x0 < ring || x1 - x < ring || y - y0 < ring || y1 - y < ring) bgS.push(feat(i));
    else if (((x - cx) / (w * 0.22)) ** 2 + ((y - cy) / (h * 0.22)) ** 2 <= 1) fgS.push(feat(i));
  }
  const bg = kmeans(bgS, 6);
  // 写っているものの見本から、背景とほぼ同じ色は除く（まん中に背景が少し入っていても大丈夫に）
  const fg = kmeans(fgS, 6).filter((c) => bg.every((b) => dist4(b, c) > 22 ** 2));
  if (!fg.length) { const all = new Uint8Array(N); for (let i = 0; i < N; i++) all[i] = valid(i) ? 1 : 0; return all; }
  const bias = 1.6 - 1.2 * Math.max(0, Math.min(1, tolerance)); // 背景との距離に掛ける（小さいほど背景になりやすい）
  const cut = (bg: number[][], fg: number[][]): Uint8Array => {
  const out = new Uint8Array(N);
  let m = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (!valid(i)) continue;
    const c = feat(i);
    const dB = Math.min(...bg.map((b) => dist4(b, c))), dF = Math.min(...fg.map((f) => dist4(f, c)));
    m[i] = dF < dB * bias * bias ? 1 : 0;
  }
  // ならす（まわり 5×5 の多数決を2回）
  for (let pass = 0; pass < 2; pass++) {
    const nm = new Uint8Array(N);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let on = 0, all = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < x0 || yy < y0 || xx > x1 || yy > y1) continue;
        all++; on += m[yy * n + xx];
      }
      nm[y * n + x] = on * 2 > all ? 1 : 0;
    }
    m = nm;
  }
  // まん中に いちばん近い塊を残す
  const label = new Int32Array(N).fill(-1);
  const comps: number[][] = [];
  for (let s0 = 0; s0 < N; s0++) {
    if (!m[s0] || label[s0] >= 0) continue;
    const comp = [s0];
    label[s0] = comps.length;
    for (let k = 0; k < comp.length; k++) {
      const i = comp[k], x = i % n, y = (i - x) / n;
      for (const j of [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1, y > 0 ? i - n : -1, y < n - 1 ? i + n : -1]) if (j >= 0 && m[j] && label[j] < 0) { label[j] = comps.length; comp.push(j); }
    }
    comps.push(comp);
  }
  if (!comps.length) return out;
  const score = (c: number[]) => { let d = 0; for (const i of c) { const x = i % n, y = (i - x) / n; d += Math.hypot((x - cx) / w, (y - cy) / h) < 0.25 ? 1 : 0; } return d * 10 + c.length * 0.01; };
  const keep = comps.reduce((a, b) => (score(b) > score(a) ? b : a));
  for (const i of keep) out[i] = 1;
  // 中の穴（四角のふちに つながらない背景）をうめる
  const reach = new Uint8Array(N);
  const st: number[] = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if ((x === x0 || x === x1 || y === y0 || y === y1) && !out[y * n + x]) { reach[y * n + x] = 1; st.push(y * n + x); }
  while (st.length) {
    const i = st.pop()!, x = i % n, y = (i - x) / n;
    for (const j of [x > x0 ? i - 1 : -1, x < x1 ? i + 1 : -1, y > y0 ? i - n : -1, y < y1 ? i + n : -1]) if (j >= 0 && !out[j] && !reach[j]) { reach[j] = 1; st.push(j); }
  }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!reach[y * n + x]) out[y * n + x] = 1;
  return out;
  };
  // はじめの切りぬき → その結果から 見本を とり直して もう2回（明るい顔・白い胸など、まん中に無かった色も入る）
  let res = cut(bg, fg);
  for (let it = 0; it < 2; it++) {
    const f2: number[][] = [], b2: number[][] = [];
    const stp = Math.max(1, Math.floor(Math.sqrt((w * h) / 6000)));
    for (let y = y0; y <= y1; y += stp) for (let x = x0; x <= x1; x += stp) { const i = y * n + x; if (valid(i)) (res[i] ? f2 : b2).push(feat(i)); }
    if (f2.length < 20 || b2.length < 20) break;
    const nb = kmeans(b2, 8);
    const nf = kmeans(f2, 8).filter((c) => nb.every((q) => dist4(q, c) > 18 ** 2));
    if (!nf.length) break;
    res = cut(nb, nf);
  }
  // ふちを ととのえる（細いすき間をふさぐ: ふくらませて→けずる）
  const grow = (src: Uint8Array, on: number) => {
    const dst = new Uint8Array(N);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let any = false;
      for (let dy = -2; dy <= 2 && !any; dy++) for (let dx = -2; dx <= 2 && !any; dx++) {
        const xx = x + dx, yy = y + dy;
        const v = xx < x0 || yy < y0 || xx > x1 || yy > y1 ? 0 : src[yy * n + xx];
        if (v === on) any = true;
      }
      dst[y * n + x] = on ? (any ? 1 : 0) : (any ? 0 : 1);
    }
    return dst;
  };
  return grow(grow(res, 1), 0);
}

const MAX_COLOR_STROKES = 520;

// detail 0〜1（大きいほど こまかい）・tolerance 0〜1（大きいほど 背景を広く消す）
// mask: 写っているもの（1）を指で なおした結果。無ければ 自動で切りぬく
export function photoToColorStrokes(img: Pixels, detail = 0.5, tolerance = 0.5, mask?: Uint8Array): Stroke[] {
  const n = img.width;
  const subject = mask ?? segmentSubject(img, tolerance);
  let area = 0;
  for (let i = 0; i < n * n; i++) area += subject[i];
  if (area < 16) return [];

  let x0 = n, y0 = n, x1 = -1, y1 = -1;
  for (let i = 0; i < n * n; i++) if (subject[i]) { const x = i % n, y = (i - x) / n; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) return [];
  const long = Math.max(8, x1 - x0 + 1, y1 - y0 + 1);
  const margin = 40;
  const scale = (CANVAS_SIZE - 2 * margin) / long;
  const ox = CANVAS_SIZE / 2 - ((x0 + x1 + 1) / 2) * scale, oy = CANVAS_SIZE / 2 - ((y0 + y1 + 1) / 2) * scale;
  const toC = (x: number, y: number) => [Math.round(ox + x * scale), Math.round(oy + y * scale)];

  // 中の穴（きりぬきの すき間）をうめる＝外側だけを ふちどる
  {
    const out = new Uint8Array(n * n), st: number[] = [];
    for (let k = 0; k < n; k++) for (const i of [k, (n - 1) * n + k, k * n, k * n + n - 1]) if (!subject[i] && !out[i]) { out[i] = 1; st.push(i); }
    while (st.length) {
      const i = st.pop()!, x = i % n, y = (i - x) / n;
      for (const j of [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1, y > 0 ? i - n : -1, y < n - 1 ? i + n : -1]) if (j >= 0 && !subject[j] && !out[j]) { out[j] = 1; st.push(j); }
    }
    for (let i = 0; i < n * n; i++) if (!out[i]) subject[i] = 1;
  }

  for (let rows = Math.round(36 + 54 * Math.max(0, Math.min(1, detail))); rows >= 16; rows = Math.round(rows * 0.85)) {
    const cell = long / rows;
    // 1マスごとの平均の色（しまもようは まぜて なか間の色に）
    type Cell = { y: number; xs: number; xe: number; rgb: number[] | null };
    const grid: Cell[][] = [];
    for (let ry = 0; ry * cell <= y1 - y0; ry++) {
      const y = Math.min(y1, Math.round(y0 + (ry + 0.5) * cell));
      const row: Cell[] = [];
      for (let cx = 0; cx * cell <= x1 - x0; cx++) {
        const x = Math.min(x1, Math.round(x0 + (cx + 0.5) * cell));
        let rgb: number[] | null = null;
        if (subject[y * n + x]) {
          const acc = [0, 0, 0]; let m = 0;
          const h = Math.max(0, Math.floor(cell / 2));
          for (let dy = -h; dy <= h; dy++) for (let dx = -h; dx <= h; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= n || yy >= n || !subject[yy * n + xx]) continue;
            const c = rgbAt(img, yy * n + xx); acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; m++;
          }
          rgb = m ? acc.map((v) => v / m) : rgbAt(img, y * n + x);
        }
        row.push({ y, xs: Math.round(x0 + cx * cell), xe: Math.round(x0 + (cx + 1) * cell), rgb });
      }
      grid.push(row);
    }
    // マスの色を 6色に まとめる → 少し明るく・あざやかに（写真の色は 絵にすると くすんで見える）
    const raw = kmeans(grid.flat().filter((c) => c.rgb).map((c) => c.rgb!), 6);
    // 明るさを 広げる（いちばん暗い色→60、いちばん明るい色→235。かげで暗く写っても 絵らしい色に）＋ あざやかに
    const lums = raw.map((c) => (c[0] + c[1] + c[2]) / 3);
    const lo = Math.min(...lums), hi = Math.max(...lums);
    const pal = raw.map((c, q) => {
      const l = Math.max(1, lums[q]);
      const t = hi - lo > 8 ? 60 + ((lums[q] - lo) / (hi - lo)) * 175 : Math.min(235, l * 1.25 + 20);
      return c.slice(0, 3).map((v) => Math.max(0, Math.min(255, (t + (v - l) * 1.35 * (t / l)))));
    });
    const near = (rgb: number[]) => { let j = 0, bd = Infinity; raw.forEach((c, q) => { const d = dist2(c, rgb); if (d < bd) { bd = d; j = q; } }); return j; };
    const byColor = pal.map(() => [] as Stroke[]);
    const width = Math.max(4, Math.round(cell * scale * 1.3));
    for (const row of grid) {
      let run = -1, sx = 0, ex = 0;
      const flush = () => {
        if (run < 0) return;
        const [ax, ay] = toC(sx, row[0].y + 0.5), [bx] = toC(ex, row[0].y + 0.5);
        const c = pal[run];
        byColor[run].push({ color: `#${hex(c[0])}${hex(c[1])}${hex(c[2])}`, width, points: bx - ax > 1 ? [ax, ay, bx, ay] : [ax, ay] });
      };
      for (const c of row) {
        const k = c.rgb ? near(c.rgb) : -1;
        if (k !== run) { flush(); run = k; sx = c.xs; }
        ex = c.xe;
      }
      flush();
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
