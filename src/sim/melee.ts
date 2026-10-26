// 近接型の必殺技。遠距離型と同じく「予算20ポイントで効果を選ぶ」。効果は部品で、適用順はフェーズで固定する
// （選んだ順に依らず同じ構成なら同じ挙動）。矛盾した組み合わせも止めない。数値は調整前提の仮値。
import type { Slot } from "./special";


export type MeleeEffectId = "tornado" | "wobble" | "legbind" | "giantHands" | "rubber" | "dash" | "grab" | "slam" | "crumple"
  | "magnet" | "vampire" | "ice" | "counter" | "mushroom" | "bulldozer"
  // 高さの ある 戦い用
  | "uppercut" | "dive" | "gust" | "flame"
  // 掛け算で 効く わざ（遠距離の 分裂・時間差・おき罠に あたる）
  | "shockwave" | "rush" | "echo";

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
 
  pull: number; // 出した瞬間に遠くの相手を手元へ引き寄せる強さ
  lifesteal: number; // 与えたダメージの何割を回復
  freezeTicks: number; // 足元が凍って滑る
  counter: boolean; // 構え中に殴られたら受け流して2倍で反撃
  bigTicks: number; // 出した後、自分が大きくなって攻撃1.5倍・被ダメ0.8倍
  push: number; // 吹き飛ばさずに押し込む（壁に挟むと追加ダメージ）
  vreach: number; // 届く 高さの差を 足す（上の相手に 届く）
  launch: number; // 当てた相手を 上へ 打ち上げる 速さ
  dive: boolean; // 跳び上がって 相手へ 飛びこむ
  netTicks: number; // 当てた相手が 飛べなくなる（かぜで 落とす）
  burnTicks: number; // やけど
  waves: number; // しょうげき波: わざを 出すたびに 相手へ 飛ぶ 弾の 数
  repeats: number; // れんぞくわざ: わざを もう 何回 くり出すか
  echo: number; // ざんぞう: 当てた所に 残って、あとで もう 何回 当たるか
  tags: MeleeEffectId[];
}

type Phase = "body" | "motion" | "hit" | "after";
const PHASE_ORDER: Phase[] = ["body", "motion", "hit", "after"];

export interface MeleeEffectDef {
  id: MeleeEffectId;
  name: string;
  cost: number;
  slot: Slot; // うごき（path）/ わざ（act）/ こうか（fx）。遠距離と同じ 3つの枠
  phase: Phase;
  apply: (s: MeleeSpec) => void;
}

export const BASE_MELEE: MeleeSpec = {
  windup: 3, active: 6, recover: 15, damage: 16, hits: 1, hitInterval: 4,
  range: 1.4, arc: Math.PI / 3, knock: 9, spinTicks: 0, dash: 0,
  grab: false, slam: false, wobbleTicks: 0, legbindTicks: 0, crumpleTicks: 0,
  limbScale: 1, rubberScale: 1, pull: 0, lifesteal: 0, freezeTicks: 0, counter: false, bigTicks: 0, push: 0,
  vreach: 0, launch: 0, dive: false, netTicks: 0, burnTicks: 0, waves: 0, repeats: 0, echo: 0, tags: [],
};

// 測定用の基準コスト
export const SHOCKWAVE_COST = 9, RUSH_COST = 10, ECHO_COST = 8;
// しょうげき波 1発・ざんぞう 1回・れんぞくの 2回目以降の 威力（わざの 威力に かける）
export const WAVE_DMG = 0.35, ECHO_DMG = 0.4, RUSH_DMG = 0.6;
export const UPPERCUT_COST = 4, DIVE_COST = 5, GUST_COST = 4, FLAME_COST = 7;
export const MAGNET_COST = 6, VAMPIRE_COST = 14, ICE_COST = 4, COUNTER_COST = 1, MUSHROOM_COST = 1, BULLDOZER_COST = 6;
export const MELEE_EFFECTS: MeleeEffectDef[] = [
  { id: "giantHands", name: "巨大な手", cost: 6, slot: "act", phase: "body", apply: (s) => { s.limbScale *= 3; s.range *= 2.2; s.windup += 6; } },
  { id: "rubber", name: "ゴム伸びパンチ", cost: 4, slot: "act", phase: "body", apply: (s) => { s.rubberScale *= 4; s.range *= 3.5; s.arc *= 0.3; s.recover += 8; } },
  { id: "tornado", name: "竜巻スピン", cost: 8, slot: "path", phase: "motion", apply: (s) => { s.spinTicks += 45; s.arc = Math.PI; s.hits = Math.max(s.hits, 6); s.hitInterval = 6; } },
  { id: "dash", name: "突進すり抜け", cost: 5, slot: "path", phase: "motion", apply: (s) => { s.dash += 5; s.arc = Math.PI; } },
  { id: "slam", name: "地面たたき", cost: 5, slot: "path", phase: "motion", apply: (s) => { s.slam = true; s.windup += 6; } },
  { id: "grab", name: "つかみ投げ", cost: 7, slot: "act", phase: "hit", apply: (s) => { if (s.grab) s.damage *= 1.15; s.grab = true; s.knock *= 1.8; } }, // 重ねると 投げも 強く（押しこみで ふっとばしが 0 でも 変わる）,
  { id: "wobble", name: "グニャグニャ視界", cost: 7, slot: "fx", phase: "after", apply: (s) => { s.wobbleTicks += 120; } },
  { id: "legbind", name: "足封じ", cost: 6, slot: "fx", phase: "after", apply: (s) => { s.legbindTicks += 120; } },
  { id: "crumple", name: "紙くしゃくしゃ", cost: 9, slot: "fx", phase: "after", apply: (s) => { s.crumpleTicks += 60; } },
 
  { id: "magnet", name: "じしゃくの手", cost: MAGNET_COST, slot: "act", phase: "motion", apply: (s) => { s.pull += 1; s.active += 4; } },
  { id: "vampire", name: "すいとりパンチ", cost: VAMPIRE_COST, slot: "fx", phase: "after", apply: (s) => { s.lifesteal += 0.6; } },
  { id: "ice", name: "こおりタッチ", cost: ICE_COST, slot: "fx", phase: "after", apply: (s) => { s.freezeTicks += 120; } },
  { id: "counter", name: "カウンター", cost: COUNTER_COST, slot: "act", phase: "hit", apply: (s) => { s.counter = true; s.windup += 22; } },
  { id: "mushroom", name: "でっかくなる", cost: MUSHROOM_COST, slot: "act", phase: "after", apply: (s) => { s.bigTicks += 180; s.damage *= 0.5; } },
  // 高さの ある 戦い用（コストは CPU 対戦の 測定で 決めた）
  { id: "uppercut", name: "アッパー", cost: UPPERCUT_COST, slot: "act", phase: "hit", apply: (s) => { s.vreach += 2.6; s.launch += 9; s.arc = Math.max(s.arc, Math.PI / 2); } },
  { id: "dive", name: "ダイブ", cost: DIVE_COST, slot: "path", phase: "motion", apply: (s) => { s.dive = true; s.dash += 4; s.vreach += 3; s.arc = Math.PI; s.windup += 2; } },
  { id: "gust", name: "かぜおこし", cost: GUST_COST, slot: "act", phase: "hit", apply: (s) => { s.arc = Math.PI; s.knock *= 1.9; s.vreach += 1.8; s.netTicks += 120; s.damage *= 0.9; } },
  { id: "flame", name: "ほのおパンチ", cost: FLAME_COST, slot: "fx", phase: "after", apply: (s) => { s.burnTicks += 150; } },
  // 掛け算で 効く わざ（重ねると 増える。うごき・ほかの わざと かけ合わさる）
  { id: "shockwave", name: "しょうげき波", cost: SHOCKWAVE_COST, slot: "act", phase: "after", apply: (s) => { s.waves += 1; } },
  { id: "rush", name: "れんぞくわざ", cost: RUSH_COST, slot: "act", phase: "after", apply: (s) => { s.repeats += 1; } },
  { id: "echo", name: "ざんぞう", cost: ECHO_COST, slot: "act", phase: "after", apply: (s) => { s.echo += 1; } },
  { id: "bulldozer", name: "ブルドーザー", cost: BULLDOZER_COST, slot: "path", phase: "motion", apply: (s) => { s.push += 1; s.active += 20; s.knock = 0; s.damage *= 0.6; } }, // 測定1回目は1回平均50ダメで強すぎ
];

// うごきは 1つだけ。古いデータで 2つ以上 付いていたら この順で 1つ選ぶ
const MOVE_PRIORITY: MeleeEffectId[] = ["dive", "tornado", "dash", "slam", "bulldozer"];
export const meleeSlotOf = (id: MeleeEffectId): Slot => MELEE_EFFECTS.find((e) => e.id === id)?.slot ?? "fx";
export function normalizeMelee(ids: MeleeEffectId[]): MeleeEffectId[] {
  const move = MOVE_PRIORITY.find((m) => ids.includes(m));
  return ids.filter((id) => meleeSlotOf(id) !== "path" || id === move);
}

export function composeMelee(raw: MeleeEffectId[]): MeleeSpec {
  const ids = normalizeMelee(raw);
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
