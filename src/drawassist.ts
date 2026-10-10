// 絵が苦手な人向けの描き補正（どれも描いた人の絵の形は残し、線だけを整える）。DOM 非依存。
// ① 手ぶれ補正: 描いている最中の点を少し遅れて追いかける（main.ts の入力側）
// ② 左右対称: 描いた線を左右反転してもう1本足す
// ③ かたち補正: 描き終わりに少し止めると、まっすぐな線・まる・だ円に直す
// ④ きれいにする: 全部の線をなめらかにし、線のすき間をつなぐ（塗りつぶしがはみ出にくくなる）
import { CANVAS_SIZE, type Stroke } from "./detect";

type Pt = [number, number];
const pairs = (p: number[]): Pt[] => { const o: Pt[] = []; for (let i = 0; i + 1 < p.length; i += 2) o.push([p[i], p[i + 1]]); return o; };
const flat = (ps: Pt[]) => ps.flatMap(([x, y]) => [Math.round(x), Math.round(y)]);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ① 手ぶれ補正の強さ（0〜1。小さいほど なめらか・遅れる）
export const STABILIZE = 0.35;
export const stabilize = (prev: Pt, raw: Pt, k = STABILIZE): Pt => [prev[0] + (raw[0] - prev[0]) * k, prev[1] + (raw[1] - prev[1]) * k];

// ② 左右反転（まん中の縦線で折り返す）
export function mirrorStroke(s: Stroke): Stroke {
  return { ...s, points: s.points.map((v, i) => (i % 2 === 0 ? CANVAS_SIZE - v : v)) };
}

// 線の長さに沿って等間隔に n 点取り直す（点の密度の偏りで形の判定がずれないように）
function resample(ps: Pt[], n: number): Pt[] {
  const seg: number[] = [0];
  for (let i = 1; i < ps.length; i++) seg.push(seg[i - 1] + dist(ps[i - 1], ps[i]));
  const L = seg[seg.length - 1];
  if (L <= 0) return [ps[0]];
  const out: Pt[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const t = (L * k) / (n - 1);
    while (j < seg.length - 1 && seg[j] < t) j++;
    const a = ps[j - 1], b = ps[j], u = seg[j] > seg[j - 1] ? (t - seg[j - 1]) / (seg[j] - seg[j - 1]) : 0;
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}

export type ShapeKind = "line" | "circle" | "ellipse";

// ③ かたち補正: まっすぐ・まる・だ円のどれかに近ければ、その形の点列を返す（どれでもなければ null）
export function fitShape(points: number[]): { kind: ShapeKind; points: number[] } | null {
  const ps = pairs(points);
  if (ps.length < 3) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, L = 0;
  ps.forEach((p, i) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); if (i) L += dist(ps[i - 1], p); });
  const D = Math.hypot(x1 - x0, y1 - y0);
  if (D < 16) return null;
  const A = ps[0], B = ps[ps.length - 1], AB = dist(A, B);

  // まっすぐ: 端から端の線からのずれが小さい
  if (AB > 0.8 * L) {
    let dev = 0;
    for (const p of ps) dev = Math.max(dev, Math.abs((B[0] - A[0]) * (A[1] - p[1]) - (A[0] - p[0]) * (B[1] - A[1])) / AB);
    if (dev < Math.max(4, 0.07 * AB)) return { kind: "line", points: flat([A, B]) };
    return null;
  }

  // まる・だ円: 始めと終わりが近い（閉じている）
  if (AB > 0.3 * D) return null;
  const q = resample(ps, 64);
  let cx = 0, cy = 0;
  for (const p of q) { cx += p[0]; cy += p[1]; }
  cx /= q.length; cy /= q.length;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of q) { sxx += (x - cx) ** 2; syy += (y - cy) ** 2; sxy += (x - cx) * (y - cy); }
  sxx /= q.length; syy /= q.length; sxy /= q.length;
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const c = Math.cos(th), s = Math.sin(th);
  let su = 0, sv = 0;
  for (const [x, y] of q) { const u = (x - cx) * c + (y - cy) * s, v = -(x - cx) * s + (y - cy) * c; su += u * u; sv += v * v; }
  let a = Math.sqrt((2 * su) / q.length), b = Math.sqrt((2 * sv) / q.length); // 一様に回るだ円なら 分散 = 半径²/2
  if (a < 4 || b < 4) return null;
  let err = 0;
  for (const [x, y] of q) { const u = (x - cx) * c + (y - cy) * s, v = -(x - cx) * s + (y - cy) * c; err += Math.abs(Math.hypot(u / a, v / b) - 1); }
  if (err / q.length > 0.14) return null;
  const round = Math.max(a, b) / Math.min(a, b) < 1.18;
  if (round) a = b = (a + b) / 2;
  const out: Pt[] = [];
  for (let k = 0; k <= 48; k++) {
    const t = (k / 48) * Math.PI * 2, u = a * Math.cos(t), v = b * Math.sin(t);
    out.push([cx + u * c - v * s, cy + u * s + v * c]);
  }
  return { kind: round ? "circle" : "ellipse", points: flat(out) };
}

// なめらかにする（Chaikin を2回。両端は動かさない）
function smooth(ps: Pt[]): Pt[] {
  let cur = ps;
  for (let it = 0; it < 2; it++) {
    if (cur.length < 3) return cur;
    const out: Pt[] = [cur[0]];
    for (let i = 0; i + 1 < cur.length; i++) {
      const [a, b] = [cur[i], cur[i + 1]];
      out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    out.push(cur[cur.length - 1]);
    cur = out;
  }
  // 近すぎる点を間引く
  const thin: Pt[] = [cur[0]];
  for (let i = 1; i < cur.length - 1; i++) if (dist(cur[i], thin[thin.length - 1]) >= 2) thin.push(cur[i]);
  thin.push(cur[cur.length - 1]);
  return thin;
}

// 線分 ab 上で p にいちばん近い点
function nearestOnSeg(p: Pt, a: Pt, b: Pt): Pt {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
  return [a[0] + t * dx, a[1] + t * dy];
}

const isLine = (s: Stroke) => !s.fill && s.color !== "erase" && s.points.length >= 4;

// ④ きれいにする: 線をなめらかにして、線の端を近くの線（自分の反対の端も）へつなぐ
export function beautify(strokes: Stroke[]): Stroke[] {
  const out = strokes.map((s) => (isLine(s) ? { ...s, points: flat(smooth(pairs(s.points))) } : { ...s, points: [...s.points] }));
  const lines = out.map((s, i) => ({ s, i, ps: isLine(s) ? pairs(s.points) : [] })).filter((x) => x.ps.length >= 2);
  for (const me of lines) {
    const gap = Math.max(14, me.s.width * 1.6);
    for (const end of [0, 1] as const) {
      const p = end ? me.ps[me.ps.length - 1] : me.ps[0];
      let best: Pt | null = null, bd = gap;
      for (const o of lines) {
        // 自分の線は、反対の端の近く（輪を閉じる）だけを見る
        const segs = o === me ? (end ? [[0, 1]] : [[me.ps.length - 2, me.ps.length - 1]]) : o.ps.slice(1).map((_, k) => [k, k + 1]);
        if (o === me && me.ps.length < 6) continue;
        for (const [k, k2] of segs) {
          const n = nearestOnSeg(p, o.ps[k], o.ps[k2]);
          const d = dist(p, n);
          if (d > 1 && d < bd) { bd = d; best = n; }
        }
      }
      // 線の上にすでに乗っている端（交差している）はつながっているのでそのまま
      if (!best || bd <= me.s.width * 0.5) continue;
      if (end) me.ps.push(best); else me.ps.unshift(best);
    }
    out[me.i] = { ...me.s, points: flat(me.ps) };
  }
  return out;
}
