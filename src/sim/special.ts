// 必殺技（遠距離弾）の効果。各効果は弾の性質を書き換える部品で、適用順はフェーズで固定する
// （選んだ順に依らず、同じ構成なら毎回同じ挙動になる）。矛盾した組み合わせも止めない。
// 数値・コストは調整前提の仮値。

export type EffectId = "invisible" | "giant" | "multi" | "restrain" | "tiny" | "fast" | "homing" | "meteor";

export interface ProjSpec {
  speed: number; // 単位/秒
  size: number; // 半径
  damage: number;
  hits: number; // 当たれる回数
  hitInterval: number; // 同じ相手に再ヒットできるまでの tick
  visible: boolean;
  lifetime: number; // tick
  homing: number; // 旋回速度 rad/秒
  wobble: number; // 横揺れの振れ幅（単位/秒）
  meteor: boolean; // 打ち上げ→落下
  restrainTicks: number; // 当たった相手を動けなくする時間
}

type Phase = "mul" | "add" | "motion" | "behavior";
const PHASE_ORDER: Phase[] = ["mul", "add", "motion", "behavior"];

export interface EffectDef {
  id: EffectId;
  name: string;
  cost: number;
  phase: Phase;
  apply: (s: ProjSpec) => void;
}

export const BASE_SPEC: ProjSpec = {
  speed: 9,
  size: 0.35,
  damage: 12,
  hits: 1,
  hitInterval: 6,
  visible: true,
  lifetime: 120,
  homing: 0,
  wobble: 0,
  meteor: false,
  restrainTicks: 0,
};

export const EFFECTS: EffectDef[] = [
  { id: "invisible", name: "見えない弾", cost: 8, phase: "behavior", apply: (s) => { s.visible = false; } },
  { id: "giant", name: "巨大", cost: 6, phase: "mul", apply: (s) => { s.size *= 3; s.speed *= 0.75; } },
  { id: "multi", name: "多段ヒット", cost: 7, phase: "add", apply: (s) => { s.hits += 3; s.damage *= 0.45; } },
  { id: "restrain", name: "拘束", cost: 8, phase: "behavior", apply: (s) => { s.restrainTicks += 45; } },
  { id: "tiny", name: "豆粒（高威力）", cost: 6, phase: "mul", apply: (s) => { s.size *= 0.35; s.damage *= 2.2; } },
  { id: "fast", name: "高速", cost: 5, phase: "mul", apply: (s) => { s.speed *= 2.2; } },
  { id: "homing", name: "ゆらゆら追尾", cost: 7, phase: "motion", apply: (s) => { s.homing += 2.2; s.wobble += 4; } },
  { id: "meteor", name: "打ち上げ→落下", cost: 7, phase: "motion", apply: (s) => { s.meteor = true; } },
];

export function composeSpecial(ids: EffectId[]): ProjSpec {
  const s: ProjSpec = { ...BASE_SPEC };
  const chosen = EFFECTS.filter((e) => ids.includes(e.id));
  for (const phase of PHASE_ORDER) for (const e of chosen) if (e.phase === phase) e.apply(s);
  return s;
}

export function specialCost(ids: EffectId[]): number {
  return EFFECTS.filter((e) => ids.includes(e.id)).reduce((a, e) => a + e.cost, 0);
}
