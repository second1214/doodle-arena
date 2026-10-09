// 絵の形 → 性能（形の性能）。DOM 非依存。長さは絵の外接矩形の長辺 L で割るので、描いた大きさに依らない。
// 係数は SHAPE で外出し（調整はここだけ）。保存時は結果を凍結し SHAPE_VERSION を記録する想定。
import { CANVAS_SIZE, edt, rasterize, type DetectResult, type Stroke } from "./detect";

export const SHAPE_VERSION = 1;

export interface Traits {
  walk: number; // 歩く速さ（足あり）
  top: number; // 転がる最高速（足なし）
  accel: number; // 転がりの加速（毎 tick 目標速度へ近づく割合。足ありは即座）
  dmg: number; // 通常攻撃の威力倍率
  cost: number; // 通常攻撃のスタミナ消費倍率
  hits: number; // 1回の攻撃で当たる回数（手が多いほど増える）
  knockGiven: number; // 吹き飛ばす力
  knockTaken: number; // 吹き飛ばされやすさ
  selfDmg: number; // 体当たりの反動（与えたダメージに対する割合。体力1で止まる）
  radius: number; // 当たり判定の大きさ
  rollGuardCut: number; // 転がり中の防御の軽減率
  momentum: number; // 転がりの勢いによる体当たり強化（最大 +割合）
  windupPerReach: number; // 手の長さ 1 あたりの振りかぶり延長（tick）
  weight: number;
}

export const DEFAULT_TRAITS: Traits = {
  walk: 1, top: 1, accel: 0.08, dmg: 1, cost: 1, hits: 1, knockGiven: 1, knockTaken: 1,
  selfDmg: 0, radius: 1, rollGuardCut: 0.7, momentum: 0, windupPerReach: 1.5, weight: 1,
};

// 係数（プレイテストで調整する）
export const SHAPE = {
  tinyLimb: 0.12, // 長辺に対してこれ未満の手足は「飾り」扱い（性能に数えない）
  walkBase: 0.55, walkPerLeg: 1.5, // 足の長さ → 歩く速さ
  manyFeetSlow: 0.04, manyFeetSteady: 0.06, // 3本目以降の足 1本ごと
  knockBase: 0.8, knockPerLeg: 0.7, // 足が長いほど吹き飛ばされやすい
  rollTopBase: 1.15, rollTopRound: 0.35, // 丸いほどよく転がる
  rollAccelBase: 0.035, rollAccelSquare: 0.03, // 丸いほど転がり出しが鈍い（慣性）
  rollGuardCut: 0.4, momentum: 0.5,
  // 長い手の代償: 威力ダウン（スタミナ増は無し・振りかぶりの遅さは弱め）
  longHandDmg: 0.5, longHandCost: 0, longHandRef: 0.25, windupPerReach: 1.5, // スタミナ増は無し（ユーザー決定）
  multiCostPerHit: 0.12, // 手が多い: 1回増えるごとのスタミナ増
  tackleDmg: 1.5, tackleKnock: 1.4, selfDmg: 0.2, // 体当たり
  weightBase: 0.4, weightPerFill: 1.5, // 塗りの多さ → 重さ
  radiusBase: 0.75, radiusPerWidth: 0.5, // 横幅 → 当たり判定
};

// 1 を中心に、下は 0.6・上は 1.6 へなだらかに頭打ち（途中で切り落とさない）
export const soft = (x: number) => (x <= 1 ? 1 - 0.4 * Math.tanh((1 - x) / 0.4) : 1 + 0.6 * Math.tanh((x - 1) / 0.6));

export interface ShapeFeatures {
  hands: number; // 飾りでない手の本数
  feet: number;
  handMax: number; // 一番長い手 / L
  handEff: number; // 手の実効本数（長さの合計 / 一番長い1本）
  footMean: number; // 足の平均の長さ / L（短い突起も含む）
  footEff: number;
  fill: number; // シルエット面積 / L²
  widthFrac: number; // 横幅 / L
  round: number; // 丸さ（左右対称度 × 縦横比）
}

export function shapeFeatures(r: DetectResult): ShapeFeatures {
  const N = r.size;
  let x0 = N, y0 = N, x1 = 0, y1 = 0, sil = 0;
  for (let i = 0; i < N * N; i++) {
    if (!r.silhouette[i]) continue;
    sil++;
    const x = i % N, y = (i - x) / N;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (!sil) return { hands: 0, feet: 0, handMax: 0, handEff: 0, footMean: 0, footEff: 0, fill: 0.5, widthFrac: 1, round: 1 };
  const W = x1 - x0 + 1, H = y1 - y0 + 1, L = Math.max(W, H);
  const tiny = SHAPE.tinyLimb * L;
  const hands = r.limbs.filter((l) => l.kind === "hand" && l.length >= tiny);
  const feetAll = r.limbs.filter((l) => l.kind === "foot");
  const feet = feetAll.filter((l) => l.length >= tiny);
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
  const eff = (ls: { length: number }[]) => (ls.length ? sum(ls.map((l) => l.length)) / Math.max(...ls.map((l) => l.length)) : 0);
  // 左右対称度: 重心 x で鏡映したシルエットの重なり
  const cx = Math.round(r.centroid[0]);
  let inter = 0, uni = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const a = r.silhouette[y * N + x];
    const mx = 2 * cx - x;
    const b = mx >= 0 && mx < N ? r.silhouette[y * N + mx] : 0;
    if (a || b) uni++;
    if (a && b) inter++;
  }
  const aspect = H / W;
  return {
    hands: hands.length,
    feet: feet.length,
    handMax: hands.length ? Math.max(...hands.map((l) => l.length)) / L : 0,
    handEff: eff(hands),
    footMean: feetAll.length ? sum(feetAll.map((l) => l.length)) / feetAll.length / L : 0,
    footEff: eff(feetAll),
    fill: sil / (L * L),
    widthFrac: W / L,
    round: (uni ? inter / uni : 1) * Math.min(aspect, 1 / aspect),
  };
}

export function shapeTraits(f: ShapeFeatures): Traits {
  const S = SHAPE;
  const hasFeet = f.footEff > 0; // 短い足でも足は足（歩く）。足が無いと転がる
  const hasHands = f.hands > 0;
  const weight = soft(S.weightBase + S.weightPerFill * f.fill);
  const speedW = Math.pow(weight, -0.5); // 重いほど遅い
  const extraFeet = Math.max(0, f.footEff - 2);
  const walk = soft(S.walkBase + S.walkPerLeg * f.footMean) * soft(1 - S.manyFeetSlow * extraFeet) * speedW;
  const knockTaken = (soft(S.knockBase + S.knockPerLeg * f.footMean) / weight) * soft(1 - S.manyFeetSteady * extraFeet);
  const top = soft(S.rollTopBase + S.rollTopRound * f.round) * speedW;
  const accel = S.rollAccelBase + S.rollAccelSquare * (1 - f.round);
  const hits = hasHands ? Math.max(1, Math.round(Math.sqrt(f.handEff))) : 1;
  const longHand = f.handMax - S.longHandRef;
  const dmg = hasHands ? soft(1 - S.longHandDmg * longHand) : soft(S.tackleDmg * Math.sqrt(weight));
  const cost = hasHands ? soft((1 + S.multiCostPerHit * (hits - 1)) * (1 + S.longHandCost * longHand)) : 1;
  const knockGiven = hasHands ? 1 / Math.sqrt(hits) : soft(S.tackleKnock * weight);
  return {
    walk, top, accel, dmg, cost, hits, knockGiven, knockTaken,
    selfDmg: hasHands ? 0 : S.selfDmg,
    radius: soft(S.radiusBase + S.radiusPerWidth * f.widthFrac),
    rollGuardCut: hasFeet ? 0.7 : S.rollGuardCut,
    momentum: hasFeet ? 0 : S.momentum,
    windupPerReach: S.windupPerReach,
    weight,
  };
}

export const VISUAL_SIZE = 1.8; // 絵の長辺を何単位で表示するか（リーチの換算にも使う）

// 検知結果から戦闘用の形の情報をまとめる（DOM 非依存）
export function fighterShape(r: DetectResult) {
  const features = shapeFeatures(r);
  return {
    features,
    traits: shapeTraits(features),
    hasHands: features.hands > 0,
    hasFeet: features.footEff > 0,
    reach: Math.max(0.35, features.handMax * VISUAL_SIZE),
  };
}

// 形の性能を短い言葉で説明する（画面表示用）
export function describeShape(sh: ReturnType<typeof fighterShape>): string[] {
  const t = sh.traits;
  const out: string[] = [];
  const lv = (v: number, hi: string, lo: string) => (v >= 1.15 ? hi : v <= 0.87 ? lo : "");
  if (!sh.hasFeet) out.push(`転がる（最高速 ×${t.top.toFixed(2)}・止まりにくい・転がり中は防御が甘い）`);
  else { const w = lv(t.walk, "足が速い", "足が遅い"); out.push(`${w || "ふつうの足"}（×${t.walk.toFixed(2)}）`); }
  if (!sh.hasHands) out.push(`体当たり（威力 ×${t.dmg.toFixed(2)}・吹き飛ばし ×${t.knockGiven.toFixed(2)}・反動あり）`);
  else {
    out.push(`手の届く距離 ${sh.reach.toFixed(2)}（威力 ×${t.dmg.toFixed(2)}・スタミナ ×${t.cost.toFixed(2)}）`);
    if (t.hits > 1) out.push(`${t.hits}連打（1発は軽い）`);
  }
  const k = lv(t.knockTaken, "吹き飛ばされやすい", "どっしり");
  if (k) out.push(`${k}（×${t.knockTaken.toFixed(2)}）`);
  if (t.radius >= 1.15) out.push("横に大きい（当たりやすい）");
  return out;
}

// 当たり判定の地図（描いた線と塗りの部分だけが体。空白は素通り）。DOM 非依存で、同じ絵なら必ず同じ結果。
// 座標は見た目と同じ: 左右 u は絵の重心からの距離、高さ v は足元からの高さ（どちらも戦闘の単位）。
export interface Hurt {
  cs: number; // 1マスの大きさ（単位）
  gw: number; gh: number;
  ox: number; // 重心の位置（マス）
  dist: Float32Array; // 各マスから一番近い描いた部分までの距離（マス）
  handV: number; // 一番長い手の付け根の高さ（通常攻撃が当たる高さの目安）
}

const HURT_RES = 128;

export function buildHurt(strokes: Stroke[], r: DetectResult): Hurt | undefined {
  const m = rasterize(strokes, HURT_RES);
  let x0 = HURT_RES, y0 = HURT_RES, x1 = -1, y1 = -1;
  for (let i = 0; i < m.length; i++) {
    if (!m[i]) continue;
    const x = i % HURT_RES, y = (i - x) / HURT_RES;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return undefined;
  const px = CANVAS_SIZE / HURT_RES; // 1マスが何画素か
  const scale = VISUAL_SIZE / Math.max(40, (x1 - x0 + 1) * px, (y1 - y0 + 1) * px); // 見た目と同じ縮尺
  const gw = x1 - x0 + 1, gh = y1 - y0 + 1;
  const N = Math.max(gw, gh);
  const crop = new Uint8Array(N * N);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) crop[y * N + x] = m[(y + y0) * HURT_RES + x + x0];
  const d2 = edt(crop, N);
  const dist = new Float32Array(gw * gh);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) dist[y * gw + x] = Math.sqrt(d2[y * N + x]);
  const g = CANVAS_SIZE / r.size; // 検知の1マスが何画素か
  const cxPx = r.centroid[0] * g;
  const hands = r.limbs.filter((l) => l.kind === "hand").sort((a, b) => b.length - a.length);
  const bottomPx = (y1 + 1) * px;
  const handV = hands.length ? Math.max(0.2, (bottomPx - hands[0].pivot[1] * g) * scale) : (gh * px * scale) / 2;
  return { cs: px * scale, gw, gh, ox: cxPx / px - x0, dist, handV };
}
