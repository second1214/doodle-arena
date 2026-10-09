// 近接型の必殺技。遠距離型と同じく「予算20ポイントで効果を選ぶ」。効果は部品で、適用順はフェーズで固定する
// （選んだ順に依らず同じ構成なら同じ挙動）。矛盾した組み合わせも止めない。数値は調整前提の仮値。

export type MeleeEffectId = "tornado" | "wobble" | "legbind" | "giantHands" | "rubber" | "dash" | "grab" | "slam" | "crumple";

export interface MeleeSpec {
  windup: number; // 構え（tick。殴られると潰れる）
  active: number; // 攻撃中（tick）
  recover: number; // 戻り（無防備）
  damage: number; // 合計威力の目安
  hits: number; // 当たる回数
  hitInterval: number;
  range: number; // 体の縁から先の届く距離の倍率（手足の長さに掛ける）
  arc: number; // 当たる向きの幅（ラジアン。π で全方向）
  knock: number;
  spinTicks: number; // 竜巻で回る時間（active を延ばす）
  dash: number; // 突進する距離
  grab: boolean; // 防御を無視して掴んで投げる
  slam: boolean; // 地面たたきの衝撃波（輪の内側は安全）
  wobbleTicks: number; // 視界グニャグニャ＋あべこべ
  legbindTicks: number; // 足封じ
  crumpleTicks: number; // 紙くしゃくしゃ
  limbScale: number; // 手足の見た目の拡大（巨大な手）
  rubberScale: number; // 一番長い手の伸び（ゴム）
  tags: MeleeEffectId[];
}

type Phase = "body" | "motion" | "hit" | "after";
const PHASE_ORDER: Phase[] = ["body", "motion", "hit", "after"];

export interface MeleeEffectDef {
  id: MeleeEffectId;
  name: string;
  cost: number;
  phase: Phase;
  apply: (s: MeleeSpec) => void;
}

export const BASE_MELEE: MeleeSpec = {
  windup: 3, active: 6, recover: 15, damage: 16, hits: 1, hitInterval: 4,
  range: 1.4, arc: Math.PI / 3, knock: 9, spinTicks: 0, dash: 0,
  grab: false, slam: false, wobbleTicks: 0, legbindTicks: 0, crumpleTicks: 0,
  limbScale: 1, rubberScale: 1, tags: [],
};

export const MELEE_EFFECTS: MeleeEffectDef[] = [
  { id: "giantHands", name: "巨大な手", cost: 6, phase: "body", apply: (s) => { s.limbScale *= 3; s.range *= 2.2; s.windup += 6; } },
  { id: "rubber", name: "ゴム伸びパンチ", cost: 4, phase: "body", apply: (s) => { s.rubberScale *= 4; s.range *= 3.5; s.arc *= 0.3; s.recover += 8; } },
  { id: "tornado", name: "竜巻スピン", cost: 8, phase: "motion", apply: (s) => { s.spinTicks += 45; s.arc = Math.PI; s.hits = Math.max(s.hits, 6); s.hitInterval = 6; } },
  { id: "dash", name: "突進すり抜け", cost: 5, phase: "motion", apply: (s) => { s.dash += 5; s.arc = Math.PI; } },
  { id: "slam", name: "地面たたき", cost: 5, phase: "motion", apply: (s) => { s.slam = true; s.windup += 6; } },
  { id: "grab", name: "つかみ投げ", cost: 9, phase: "hit", apply: (s) => { s.grab = true; s.knock *= 1.8; } },
  { id: "wobble", name: "グニャグニャ視界", cost: 7, phase: "after", apply: (s) => { s.wobbleTicks += 120; } },
  { id: "legbind", name: "足封じ", cost: 6, phase: "after", apply: (s) => { s.legbindTicks += 120; } },
  { id: "crumple", name: "紙くしゃくしゃ", cost: 9, phase: "after", apply: (s) => { s.crumpleTicks += 60; } },
];

export function composeMelee(ids: MeleeEffectId[]): MeleeSpec {
  const s: MeleeSpec = { ...BASE_MELEE };
  const chosen = MELEE_EFFECTS.flatMap((e) => ids.filter((x) => x === e.id).map(() => e)); // 同じ効果は重ねてかける
  for (const phase of PHASE_ORDER) for (const e of chosen) if (e.phase === phase) e.apply(s);
  s.active += s.spinTicks;
  // 多段のときは合計が威力の目安に近くなるよう1回ごとを割る
  s.tags = MELEE_EFFECTS.filter((e) => ids.includes(e.id)).map((e) => e.id);
  return s;
}

export function meleeCost(ids: MeleeEffectId[]): number {
  return ids.reduce((a, id) => a + (MELEE_EFFECTS.find((e) => e.id === id)?.cost ?? 0), 0);
}
