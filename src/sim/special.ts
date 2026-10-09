// 必殺技（遠距離弾）の効果。各効果は弾の性質を書き換える部品で、適用順はフェーズで固定する
// （選んだ順に依らず、同じ構成なら毎回同じ挙動になる）。矛盾した組み合わせも止めない。
// 数値・コストは調整前提の仮値。

export type EffectId = "invisible" | "giant" | "multi" | "restrain" | "tiny" | "fast" | "homing" | "meteor"
  // 新しい効果
  | "split" | "bounce" | "boomerang" | "trap" | "vacuum" | "drain" | "freeze" | "blast";

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
  grind: boolean; // 当たっている間は減速して削り続ける（多段ヒット）
  // 新しい性質（すべて 0/false が標準）
  split: number; // 20tick 後に3つに分かれる世代数（重ねると孫まで割れる）
  bounces: number; // 場外の壁で跳ね返る回数
  boomerang: boolean; // 行って戻ってくる（帰りも当たる）
  trap: boolean; // 少し飛んで地面に止まり、踏まれるのを待つ
  pull: number; // 近くの相手を吸い寄せる強さ
  lifesteal: number; // 与えたダメージの何割を撃った側が回復するか
  freezeTicks: number; // 当たった相手の足元が凍って滑る時間
  blast: number; // 消える時に爆発する半径
  tags: EffectId[]; // 付いている効果（見た目用）
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
  grind: false,
  split: 0, bounces: 0, boomerang: false, trap: false, pull: 0, lifesteal: 0, freezeTicks: 0, blast: 0,
  tags: [],
};

// コストはバランス検証（ボット対戦）の結果を反映: 強すぎた豆粒・見えない・高速を上げ、弱かった追尾・打ち上げを下げた
// 測定用に外から書き換えられる基準コスト（取り込み時は数値を直書きでよい）
export const SPLIT_COST = 4, BOUNCE_COST = 2, BOOMERANG_COST = 3, TRAP_COST = 4, VACUUM_COST = 4, DRAIN_COST = 13, FREEZE_COST = 2, BLAST_COST = 15;
export const EFFECTS: EffectDef[] = [
  { id: "invisible", name: "見えない弾", cost: 11, phase: "behavior", apply: (s) => { s.visible = false; } },
  { id: "giant", name: "巨大", cost: 6, phase: "mul", apply: (s) => { s.size *= 3; s.speed *= 0.75; } },
  { id: "multi", name: "多段ヒット", cost: 7, phase: "add", apply: (s) => { s.hits += 7; s.damage *= 0.3; s.hitInterval = 3; s.grind = true; } },
  { id: "restrain", name: "拘束", cost: 7, phase: "behavior", apply: (s) => { s.restrainTicks += 90; } },
  { id: "tiny", name: "豆粒（高威力）", cost: 12, phase: "mul", apply: (s) => { s.size *= 0.35; s.damage *= 2.2; } },
  { id: "fast", name: "高速", cost: 9, phase: "mul", apply: (s) => { s.speed *= 2.2; } },
  { id: "homing", name: "ゆらゆら追尾", cost: 5, phase: "motion", apply: (s) => { s.homing += 2.2; s.wobble += 4; } },
  { id: "meteor", name: "打ち上げ→落下", cost: 5, phase: "motion", apply: (s) => { s.meteor = true; } },
  // 新しい効果（コストは CPU 対戦の測定で決めた）
  { id: "split", name: "分裂弾", cost: SPLIT_COST, phase: "add", apply: (s) => { s.split += 1; } },
  { id: "bounce", name: "はね返り", cost: BOUNCE_COST, phase: "motion", apply: (s) => { s.bounces += 3; s.lifetime += 90; } },
  { id: "boomerang", name: "ブーメラン", cost: BOOMERANG_COST, phase: "motion", apply: (s) => { s.boomerang = true; s.lifetime += 60; } }, // 測定1回目は hits+1 で強すぎ（勝率79%）→ 行き帰りで1回だけ当たる
  { id: "trap", name: "おき罠", cost: TRAP_COST, phase: "behavior", apply: (s) => { s.trap = true; s.lifetime += 240; } },
  { id: "vacuum", name: "すいこみ", cost: VACUUM_COST, phase: "behavior", apply: (s) => { s.pull += 8; } }, // 測定1回目（引き6・威力0.8倍）は弱すぎ
  { id: "drain", name: "すいとり", cost: DRAIN_COST, phase: "behavior", apply: (s) => { s.lifesteal += 0.6; } },
  { id: "freeze", name: "こおり", cost: FREEZE_COST, phase: "behavior", apply: (s) => { s.freezeTicks += 90; } },
  { id: "blast", name: "ばくはつ", cost: BLAST_COST, phase: "behavior", apply: (s) => { s.blast += 2.2; } },
];

// 同じ効果を複数付けたら、その数だけ重ねてかける（巨大×2 なら 9 倍の大きさ）。並び順には依らない
export function composeSpecial(ids: EffectId[]): ProjSpec {
  const s: ProjSpec = { ...BASE_SPEC };
  const chosen = EFFECTS.flatMap((e) => ids.filter((x) => x === e.id).map(() => e));
  for (const phase of PHASE_ORDER) for (const e of chosen) if (e.phase === phase) e.apply(s);
  s.tags = EFFECTS.filter((e) => ids.includes(e.id)).map((e) => e.id);
  return s;
}

export function specialCost(ids: EffectId[]): number {
  return ids.reduce((a, id) => a + (EFFECTS.find((e) => e.id === id)?.cost ?? 0), 0);
}
