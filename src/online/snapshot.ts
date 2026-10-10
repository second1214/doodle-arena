// オンラインで公開するキャラの中身（スナップショット）。戦闘を再現するのに要る「計算し終えた数値」だけを入れ、サーバーは書き換えずに配る。
// 手足の検知は読み込む側でもやり直すので、検知の調整値と版を入れ、版が違う時は保存した手足の結果を使う。
import type { Stroke } from "../detect";

export interface Snapshot {
  fmt: 1;
  ver: { shape: number; detect: number; sim: number; tree: number };
  name: string;
  strokes: { color: string; width: number; points: number[]; fill?: boolean }[];
  detectParams: Record<string, number>;
  personality: string;
  specialType: "ranged" | "melee";
  special: string[];
  melee: string[];
  specialMod: Record<string, number>; // 予算内に絞った後の必殺の数値
  boost: Record<string, number>; // スキルツリーの合計＋発動ポイントの増減
  growth: number; // もらったスキルポイントの合計（部屋の決定に使う）
  limbs?: { reach: number; hasHands: boolean; hasFeet: boolean; traits: Record<string, number> }; // 予備: 公開した時の手足の結果
}

// 一覧用の小さな絵: 線の点を間引いて合計 ~700 個の数に抑える（ランキング20体分でも軽い）
export function thumbStrokes(strokes: Stroke[] | Snapshot["strokes"], budget = 700): Snapshot["strokes"] {
  const total = strokes.reduce((a, s) => a + s.points.length, 0);
  const step = Math.max(1, Math.ceil(total / budget));
  return strokes.map((s) => {
    if (s.fill || s.points.length <= 4) return { ...s, points: [...s.points] };
    const pts: number[] = [];
    for (let i = 0; i < s.points.length; i += 2 * step) pts.push(s.points[i], s.points[i + 1]);
    const n = s.points.length;
    if (pts[pts.length - 2] !== s.points[n - 2] || pts[pts.length - 1] !== s.points[n - 1]) pts.push(s.points[n - 2], s.points[n - 1]);
    return { ...s, points: pts };
  });
}
