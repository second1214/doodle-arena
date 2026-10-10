// 突起（手足）自動検知。DOM 非依存の純 TS（ブラウザ間で同じ結果になるよう Canvas を使わない）。
//
// 手順: ストロークを N×N に自前ラスタライズ → closing で線の隙間を閉じる → 外側を塗りつぶして
// 残りをシルエットに → 距離変換 → 半径 α·D の opening で胴体コア → シルエット−コアの塊のうち
// 細長いものを手足とする。塗りつぶしは検知専用で、表示は元の線画を切り出して使う。

export const CANVAS_SIZE = 512;

export interface Stroke {
  color: string; // "erase" は消しゴム
  width: number; // CANVAS_SIZE 座標系での太さ
  points: number[]; // [x0, y0, x1, y1, ...]（CANVAS_SIZE 座標系）。塗りつぶしは [x, y] の1点
  fill?: boolean; // 塗りつぶし（その点から、線で囲まれた範囲を塗る）
}

// 手足の検知のしかたの版。検知のアルゴリズムを変えたら上げる（オンラインで、古い版のキャラは保存した手足の結果を使う）
export const DETECT_VERSION = 2; // 2: 手足レイヤー（marks）で手足を自分で指定できる

export interface DetectParams {
  size: number; // 検知解像度
  closeRadius: number; // 線の隙間埋め（検知解像度 px）
  alpha: number; // 胴体コア半径 = alpha × 最大太さ
  minAreaRatio: number; // 手足とみなす最小面積（シルエット面積比）
  minAspect: number; // 手足とみなす細長さ（長さ/幅）
  footAngleDeg: number; // 真下から何度以内なら足
}

export const DEFAULT_PARAMS: DetectParams = {
  size: 256,
  closeRadius: 3,
  alpha: 0.45,
  minAreaRatio: 0.004,
  minAspect: 1.5,
  footAngleDeg: 50,
};

export type LimbKind = "hand" | "foot";

export interface Limb {
  kind: LimbKind;
  pivot: [number, number]; // 関節（検知解像度座標）
  tip: [number, number]; // 先端
  length: number;
  area: number;
}

export interface DetectResult {
  size: number;
  // 0=何もない, 1=胴体, 2+i=limbs[i]
  labels: Int16Array;
  limbs: Limb[];
  silhouette: Uint8Array;
  core: Uint8Array;
  centroid: [number, number];
}

const INF = 1e20;

export function rasterize(strokes: Stroke[], size: number): Uint8Array {
  const mask = new Uint8Array(size * size);
  const s = size / CANVAS_SIZE;
  for (const st of strokes) {
    if (st.fill) {
      floodMask(mask, size, Math.floor(st.points[0] * s), Math.floor(st.points[1] * s));
      continue;
    }
    const value = st.color === "erase" ? 0 : 1;
    const r = Math.max(0.75, (st.width * s) / 2);
    const p = st.points;
    if (p.length < 2) continue;
    const segs = p.length === 2 ? [[p[0], p[1], p[0], p[1]]] : [];
    for (let i = 0; i + 3 < p.length; i += 2) segs.push([p[i], p[i + 1], p[i + 2], p[i + 3]]);
    for (const [ax0, ay0, bx0, by0] of segs) {
      const ax = ax0 * s, ay = ay0 * s, bx = bx0 * s, by = by0 * s;
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - r));
      const x1 = Math.min(size - 1, Math.ceil(Math.max(ax, bx) + r));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by) - r));
      const y1 = Math.min(size - 1, Math.ceil(Math.max(ay, by) + r));
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const qx = ax + t * dx - px, qy = ay + t * dy - py;
          if (qx * qx + qy * qy <= r * r) mask[y * size + x] = value;
        }
      }
    }
  }
  return mask;
}

// 塗りつぶし: 空白の点から始めた場合、つながった空白を 1 にする（線の上なら形は変わらない）
function floodMask(mask: Uint8Array, size: number, sx: number, sy: number) {
  if (sx < 0 || sy < 0 || sx >= size || sy >= size || mask[sy * size + sx]) return;
  const stack = [sy * size + sx];
  mask[stack[0]] = 1;
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % size, y = (i - x) / size;
    if (x > 0 && !mask[i - 1]) { mask[i - 1] = 1; stack.push(i - 1); }
    if (x < size - 1 && !mask[i + 1]) { mask[i + 1] = 1; stack.push(i + 1); }
    if (y > 0 && !mask[i - size]) { mask[i - size] = 1; stack.push(i - size); }
    if (y < size - 1 && !mask[i + size]) { mask[i + size] = 1; stack.push(i + size); }
  }
}

// Felzenszwalb の距離変換。mask==1 の画素までの二乗距離を返す。
export function edt(mask: Uint8Array, size: number): Float64Array {
  const n = size;
  const out = new Float64Array(n * n);
  for (let i = 0; i < n * n; i++) out[i] = mask[i] ? 0 : INF;
  const f = new Float64Array(n), d = new Float64Array(n);
  const v = new Int32Array(n), z = new Float64Array(n + 1);
  const pass = (get: (i: number) => number, set: (i: number, x: number) => void) => {
    for (let i = 0; i < n; i++) f[i] = get(i);
    let k = 0;
    v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
    for (let i = 0; i < n; i++) set(i, d[i]);
  };
  for (let x = 0; x < n; x++) pass((i) => out[i * n + x], (i, val) => (out[i * n + x] = val));
  for (let y = 0; y < n; y++) pass((i) => out[y * n + i], (i, val) => (out[y * n + i] = val));
  return out;
}

function dilate(mask: Uint8Array, size: number, r: number): Uint8Array {
  const d = edt(mask, size);
  const out = new Uint8Array(mask.length);
  const r2 = r * r;
  for (let i = 0; i < out.length; i++) out[i] = d[i] <= r2 ? 1 : 0;
  return out;
}

function invert(mask: Uint8Array): Uint8Array {
  const out = new Uint8Array(mask.length);
  for (let i = 0; i < out.length; i++) out[i] = mask[i] ? 0 : 1;
  return out;
}

function closing(mask: Uint8Array, size: number, r: number): Uint8Array {
  if (r <= 0) return mask.slice();
  return invert(dilate(invert(dilate(mask, size, r)), size, r));
}

// 画像の外周からつながる空白を「外側」とし、それ以外（線と囲まれた内側）をシルエットにする。
function fillHoles(mask: Uint8Array, size: number): Uint8Array {
  const outside = new Uint8Array(mask.length);
  const stack: number[] = [];
  const push = (i: number) => {
    if (!mask[i] && !outside[i]) { outside[i] = 1; stack.push(i); }
  };
  for (let i = 0; i < size; i++) {
    push(i); push((size - 1) * size + i); push(i * size); push(i * size + size - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % size, y = (i - x) / size;
    if (x > 0) push(i - 1);
    if (x < size - 1) push(i + 1);
    if (y > 0) push(i - size);
    if (y < size - 1) push(i + size);
  }
  return invert(outside);
}

function components(mask: Uint8Array, size: number): number[][] {
  const seen = new Uint8Array(mask.length);
  const comps: number[][] = [];
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || seen[s]) continue;
    const comp: number[] = [];
    const stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      comp.push(i);
      const x = i % size, y = (i - x) / size;
      const nb = [x > 0 ? i - 1 : -1, x < size - 1 ? i + 1 : -1, y > 0 ? i - size : -1, y < size - 1 ? i + size : -1];
      for (const j of nb) if (j >= 0 && mask[j] && !seen[j]) { seen[j] = 1; stack.push(j); }
    }
    comps.push(comp);
  }
  return comps;
}

// 手足レイヤー: 絵の上を「手ペン」「足ペン」で雑に塗った線（color は "hand" / "foot" / "erase"）。
// 1本でも塗ってあれば自動検知の代わりに使う（絵の形と重なった所だけが手足になる）
export type MarkColor = "hand" | "foot" | "erase";
export const hasMarks = (marks?: Stroke[]) => !!marks?.some((m) => m.color === "hand" || m.color === "foot");

// 塗った範囲（後から塗った方が勝つ。消しゴムは両方消す）
function markMask(marks: Stroke[], kind: "hand" | "foot", size: number): Uint8Array {
  return rasterize(marks.map((m) => ({ ...m, fill: false, color: m.color === kind ? "#000000" : "erase" })), size);
}

export function detect(strokes: Stroke[], params: DetectParams = DEFAULT_PARAMS, marks?: Stroke[]): DetectResult {
  const N = params.size;
  const total = N * N;
  const labels = new Int16Array(total);
  const empty: DetectResult = {
    size: N, labels, limbs: [], silhouette: new Uint8Array(total), core: new Uint8Array(total), centroid: [N / 2, N / 2],
  };

  const raw = rasterize(strokes, N);
  const sil = fillHoles(closing(raw, N, params.closeRadius), N);
  const silComps = components(sil, N).sort((a, b) => b.length - a.length);
  if (silComps.length === 0) return empty;

  // 最大の塊だけで検知し、離れた塊は胴体の飾りとして扱う。
  const main = new Uint8Array(total);
  for (const i of silComps[0]) main[i] = 1;
  for (let i = 0; i < total; i++) if (sil[i]) labels[i] = 1;

  let cx = 0, cy = 0;
  for (const i of silComps[0]) { cx += i % N; cy += Math.floor(i / N); }
  const centroid: [number, number] = [cx / silComps[0].length, cy / silComps[0].length];

  if (hasMarks(marks)) {
    const r = detectMarked(sil, labels, centroid, marks!, params);
    if (r) return r; // 消しゴムで全部消してあれば自動にもどる
  }

  const dt = edt(invert(main), N); // 背景までの二乗距離
  let maxD2 = 0;
  for (let i = 0; i < total; i++) if (main[i] && dt[i] > maxD2) maxD2 = dt[i];
  const r = params.alpha * Math.sqrt(maxD2);
  const seed = new Uint8Array(total);
  for (let i = 0; i < total; i++) seed[i] = main[i] && dt[i] >= r * r ? 1 : 0;
  const core = dilate(seed, N, r);
  for (let i = 0; i < total; i++) core[i] &= main[i];

  const resid = new Uint8Array(total);
  for (let i = 0; i < total; i++) resid[i] = main[i] && !core[i] ? 1 : 0;

  const limbs: Limb[] = [];
  const minArea = Math.max(4, params.minAreaRatio * silComps[0].length);
  const minBranchLen = Math.max(6, 2 * r);
  const cosFoot = Math.cos((params.footAngleDeg * Math.PI) / 180);
  const addLimb = (pixels: number[], pivot: [number, number], tip: [number, number]) => {
    const length = Math.hypot(tip[0] - pivot[0], tip[1] - pivot[1]);
    const isFoot = length > 0 && (tip[1] - pivot[1]) / length >= cosFoot && pivot[1] > centroid[1];
    const id = limbs.length + 2;
    for (const i of pixels) labels[i] = id;
    limbs.push({ kind: isFoot ? "foot" : "hand", pivot, tip, length, area: pixels.length });
  };

  for (const comp of components(resid, N)) {
    if (comp.length < minArea) continue;
    let px = 0, py = 0, nContact = 0;
    for (const i of comp) {
      const x = i % N, y = (i - x) / N;
      const touches =
        (x > 0 && core[i - 1]) || (x < N - 1 && core[i + 1]) || (y > 0 && core[i - N]) || (y < N - 1 && core[i + N]);
      if (touches) { px += x; py += y; nContact++; }
    }
    if (nContact === 0) continue;
    px /= nContact; py /= nContact;

    // 枝分かれした塊（棒人間の胴体＋手足など）は骨格で分ける。
    const split = splitBranches(comp, N, [px, py], minBranchLen);
    if (split) {
      for (const b of split) if (b.pixels.length >= minArea) addLimb(b.pixels, b.pivot, b.tip);
      continue;
    }

    let best = -1, tx = px, ty = py;
    for (const i of comp) {
      const x = i % N, y = (i - x) / N;
      const d2 = (x - px) ** 2 + (y - py) ** 2;
      if (d2 > best) { best = d2; tx = x; ty = y; }
    }
    const length = Math.sqrt(best);
    if (length <= 0) continue;
    const width = comp.length / length;
    if (length / width < params.minAspect) continue;
    addLimb(comp, [px, py], [tx, ty]);
  }

  return { size: N, labels, limbs, silhouette: sil, core, centroid };
}

// 手足レイヤーで指定した手足: 絵（シルエット）と塗った範囲が重なった塊を、それぞれ1本の手足にする。
// 関節は胴体と接している所の真ん中（離れていれば胴体の中心にいちばん近い所）、先端は関節からいちばん遠い所
function detectMarked(sil: Uint8Array, labels: Int16Array, centroid: [number, number], marks: Stroke[], params: DetectParams): DetectResult | null {
  const N = params.size, total = N * N;
  const limbs: Limb[] = [];
  const limbMask = new Uint8Array(total);
  let silArea = 0;
  for (let i = 0; i < total; i++) silArea += sil[i];
  const minArea = Math.max(4, params.minAreaRatio * silArea * 0.5);
  const found: { kind: LimbKind; comp: number[] }[] = [];
  const masks = (["hand", "foot"] as const).map((kind) => ({ kind, m: markMask(marks, kind, N) }));
  if (masks.every(({ m }) => !m.some((v) => v))) return null;
  for (const { kind, m } of masks) {
    for (let i = 0; i < total; i++) m[i] &= sil[i];
    for (const comp of components(m, N)) if (comp.length >= minArea) { found.push({ kind, comp }); for (const i of comp) limbMask[i] = 1; }
  }
  const core = new Uint8Array(total);
  for (let i = 0; i < total; i++) core[i] = sil[i] && !limbMask[i] ? 1 : 0;
  for (const { kind, comp } of found) {
    let px = 0, py = 0, n = 0;
    for (const i of comp) {
      const x = i % N, y = (i - x) / N;
      if ((x > 0 && core[i - 1]) || (x < N - 1 && core[i + 1]) || (y > 0 && core[i - N]) || (y < N - 1 && core[i + N])) { px += x; py += y; n++; }
    }
    if (n) { px /= n; py /= n; }
    else {
      let best = Infinity;
      for (const i of comp) { const x = i % N, y = (i - x) / N, d = (x - centroid[0]) ** 2 + (y - centroid[1]) ** 2; if (d < best) { best = d; px = x; py = y; } }
    }
    let far = -1, tx = px, ty = py;
    for (const i of comp) { const x = i % N, y = (i - x) / N, d = (x - px) ** 2 + (y - py) ** 2; if (d > far) { far = d; tx = x; ty = y; } }
    const id = limbs.length + 2;
    for (const i of comp) labels[i] = id;
    limbs.push({ kind, pivot: [px, py], tip: [tx, ty], length: Math.sqrt(far), area: comp.length });
  }
  return { size: N, labels, limbs, silhouette: sil, core, centroid };
}

const NB8 = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]; // 時計回り

// Zhang-Suen 細線化。
export function thin(mask: Uint8Array, w: number, h: number): Uint8Array {
  const m = mask.slice();
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y * w + x]);
  let changed = true;
  while (changed) {
    changed = false;
    for (let step = 0; step < 2; step++) {
      const del: number[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!m[y * w + x]) continue;
          // P2(上)から時計回り
          const q = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
          const b = q.reduce((s, v) => s + v, 0);
          if (b < 2 || b > 6) continue;
          let a = 0;
          for (let k = 0; k < 8; k++) if (!q[k] && q[(k + 1) % 8]) a++;
          if (a !== 1) continue;
          const [p2, , p4, , p6, , p8] = q;
          if (step === 0 ? p2 * p4 * p6 || p4 * p6 * p8 : p2 * p4 * p8 || p2 * p6 * p8) continue;
          del.push(y * w + x);
        }
      }
      for (const i of del) m[i] = 0;
      if (del.length) changed = true;
    }
  }
  return m;
}

interface Branch { pixels: number[]; pivot: [number, number]; tip: [number, number] }

// 塊の骨格に分岐点があれば、分岐点から先端までの枝を手足に、それ以外（関節側の幹・分岐点）を胴体に分ける。
// 分岐が無ければ null（塊全体を1本の手足として扱う）。
function splitBranches(comp: number[], N: number, pivot: [number, number], minBranchLen: number): Branch[] | null {
  let x0 = N, y0 = N, x1 = 0, y1 = 0;
  for (const i of comp) {
    const x = i % N, y = (i - x) / N;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const local = new Uint8Array(w * h);
  for (const i of comp) local[(Math.floor(i / N) - y0) * w + (i % N) - x0] = 1;
  const sk = thin(local, w, h);

  const nbs = (i: number): number[] => {
    const x = i % w, y = (i - x) / w;
    return NB8.map(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < w && ny < h ? ny * w + nx : -1;
    });
  };
  // 周囲8画素を一周したときの「骨格の塊」の数。1=端点, 2=線の途中, 3以上=分岐点。
  // 単純な隣接数だと斜めの階段で誤って分岐扱いになるため、こちらで判定する。
  const crossing = (i: number) => {
    const v = nbs(i).map((j) => (j >= 0 && sk[j] ? 1 : 0));
    let runs = 0;
    for (let k = 0; k < 8; k++) if (v[k] && !v[(k + 1) % 8]) runs++;
    return runs;
  };

  type Seg = { pixels: number[]; ends: number[]; joints: Set<number> };
  const analyze = () => {
    const junction = new Uint8Array(w * h);
    // 分岐点の周囲1画素も分岐域に含める（斜め隣接で枝同士がつながったままになるのを防ぐ）。
    for (let i = 0; i < sk.length; i++) {
      if (!sk[i] || crossing(i) < 3) continue;
      junction[i] = 1;
      for (const j of nbs(i)) if (j >= 0 && sk[j]) junction[j] = 1;
    }
    const seen = new Uint8Array(w * h);
    const segs: Seg[] = [];
    for (let s = 0; s < sk.length; s++) {
      if (!sk[s] || junction[s] || seen[s]) continue;
      const seg: Seg = { pixels: [], ends: [], joints: new Set() };
      const stack = [s];
      seen[s] = 1;
      while (stack.length) {
        const i = stack.pop()!;
        seg.pixels.push(i);
        if (crossing(i) <= 1) seg.ends.push(i);
        for (const j of nbs(i)) {
          if (j < 0 || !sk[j]) continue;
          if (junction[j]) seg.joints.add(j);
          else if (!seen[j]) { seen[j] = 1; stack.push(j); }
        }
      }
      segs.push(seg);
    }
    return { junction, segs };
  };

  // 短いヒゲ（細線化のノイズ）を刈り込む。
  for (let pass = 0; pass < 3; pass++) {
    let pruned = false;
    for (const seg of analyze().segs) {
      if (seg.ends.length && seg.joints.size && seg.pixels.length < minBranchLen) {
        for (const i of seg.pixels) sk[i] = 0;
        pruned = true;
      }
    }
    if (!pruned) break;
  }
  const { junction, segs } = analyze();
  if (!junction.some((v) => v)) return null;

  // 関節に最も近い骨格点を含む区間は幹（胴体）側。
  const lpx = pivot[0] - x0, lpy = pivot[1] - y0;
  let root = -1, best = Infinity;
  for (let i = 0; i < sk.length; i++) {
    if (!sk[i]) continue;
    const d = (i % w - lpx) ** 2 + (Math.floor(i / w) - lpy) ** 2;
    if (d < best) { best = d; root = i; }
  }

  const owner = new Int32Array(w * h).fill(-1); // 骨格点の所属: -2=胴体, k=枝k
  for (let i = 0; i < sk.length; i++) if (sk[i]) owner[i] = -2;
  const xy = (i: number): [number, number] => [(i % w) + x0, Math.floor(i / w) + y0];
  const out: Branch[] = [];
  for (const seg of segs) {
    if (!seg.ends.length || !seg.joints.size || seg.pixels.includes(root)) continue;
    let jx = 0, jy = 0;
    for (const j of seg.joints) { jx += j % w; jy += Math.floor(j / w); }
    jx /= seg.joints.size; jy /= seg.joints.size;
    let tip = seg.ends[0], far = -1;
    for (const e of seg.ends) {
      const d = (e % w - jx) ** 2 + (Math.floor(e / w) - jy) ** 2;
      if (d > far) { far = d; tip = e; }
    }
    for (const i of seg.pixels) owner[i] = out.length;
    out.push({ pixels: [], pivot: [jx + x0, jy + y0], tip: xy(tip) });
  }
  if (out.length === 0) return null;

  // 塊の各画素を最寄りの骨格点の所属に塗り分ける（塊内 BFS）。
  const assign = new Int32Array(w * h).fill(-3);
  const queue: number[] = [];
  for (let i = 0; i < sk.length; i++) if (sk[i]) { assign[i] = owner[i]; queue.push(i); }
  for (let qi = 0; qi < queue.length; qi++) {
    const i = queue[qi];
    for (const j of nbs(i)) if (j >= 0 && local[j] && assign[j] === -3) { assign[j] = assign[i]; queue.push(j); }
  }
  const toGlobal = (i: number) => (Math.floor(i / w) + y0) * N + (i % w) + x0;
  for (let i = 0; i < assign.length; i++) if (local[i] && assign[i] >= 0) out[assign[i]].pixels.push(toGlobal(i));
  return out;
}

// CANVAS_SIZE 座標の画素がどのパーツに属するか（線の縁がシルエット外に落ちた場合は近傍を探す）。
export function labelAt(res: DetectResult, x: number, y: number): number {
  const s = res.size / CANVAS_SIZE;
  const gx = Math.floor(x * s), gy = Math.floor(y * s);
  let fallback = 0;
  for (let r = 0; r <= 2; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= res.size || ny >= res.size) continue;
        const l = res.labels[ny * res.size + nx];
        if (l > 1) return l;
        if (l === 1) fallback = 1;
      }
    }
    if (fallback) return fallback;
  }
  return 1;
}
