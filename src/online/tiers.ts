// オンラインの部屋（育ち具合で分ける）。もらったスキルポイントの合計で決まり、公開した時点で固定する
export const TIERS = [
  { name: "ルーキー", min: 0, color: "#69db7c" },
  { name: "ブロンズ", min: 9, color: "#e8a26a" },
  { name: "シルバー", min: 18, color: "#adb5bd" },
  { name: "ゴールド", min: 27, color: "#fcc419" },
  { name: "マスター", min: 36, color: "#b197fc" },
];
export function tierOf(growth: number): number {
  let t = 0;
  TIERS.forEach((x, i) => { if (growth >= x.min) t = i; });
  return t;
}
