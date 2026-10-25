// 必殺技（遠距離弾）の効果。部品は 3つの枠のどれかに入る（2026-10-25 改修）:
//   弾道（path）  … どう飛ぶか。1つだけ（無ければ まっすぐ）
//   振る舞い（act）… どう増える・どう働くか。生まれた子の弾は 親の性質を 全部 受け継ぐので、重ねると掛け算で増える
//   効果（fx）     … 当たったら何が起きるか・数値。全部 足し算
// どの部品も ほかの部品を 打ち消さない（tests/special.test.ts で全組み合わせを確かめる）。
// 適用順はフェーズで固定する（選んだ順に依らず、同じ構成なら毎回同じ挙動になる）。

export type EffectId = "invisible" | "giant" | "multi" | "restrain" | "tiny" | "fast" | "homing" | "meteor"
  // 新しい効果
  | "split" | "bounce" | "boomerang" | "trap" | "vacuum" | "drain" | "freeze" | "blast"
  // 高さの ある 戦い用
  | "wave" | "net" | "thunder" | "rain" | "fire"
  // 3枠化で 分けた部品（あめあられ = 雲から降る ＋ 時間差分割）
  | "cloud" | "drip";

export type Slot = "path" | "act" | "fx";

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
  ground: boolean; // 地面を はって進む（坂も のぼる。飛んでいる相手には 当たらない）
  netTicks: number; // 当たった相手が 飛べなくなる（落ちる）
  shockTicks: number; // しびれて 攻撃と必殺が 出せない
  cloud: boolean; // 弾道: 相手の上の 雲から 落ちてくる
  drip: number; // 時間差分割: 何回に分けて 少しずつ 撃つか（0 = 1回で撃つ）
  burnTicks: number; // やけど
  tags: EffectId[]; // 付いている効果（見た目用）
}

type Phase = "mul" | "add" | "motion" | "behavior";
const PHASE_ORDER: Phase[] = ["mul", "add", "motion", "behavior"];

// 多段ヒット: 8回当たるのはそのまま、1回の威力を 0.3→0.14 倍に（2026-10-09 測定で勝率81%→54%）
const MULTI_DMG = 0.14;
const MULTI_HITS = 7;

export interface EffectDef {
  id: EffectId;
  name: string;
  cost: number;
  slot: Slot;
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
  ground: false, netTicks: 0, shockTicks: 0, cloud: false, drip: 0, burnTicks: 0,
  tags: [],
};

// コストはバランス検証（ボット対戦）の結果を反映: 強すぎた豆粒・見えない・高速を上げ、弱かった追尾・打ち上げを下げた
// 測定用に外から書き換えられる基準コスト（取り込み時は数値を直書きでよい）
export const WAVE_COST = 4, NET_COST = 3, THUNDER_COST = 4, RAIN_COST = 7, FIRE_COST = 8, CLOUD_COST = 4, DRIP_COST = 3;
// 時間差分割で 1回分の 威力（6回で 1.08 倍 = 旧あめあられの しずくと同じ）
export const DRIP_DMG = 0.18;
const DRIP_COUNT = 6;
export const SPLIT_COST = 4, BOUNCE_COST = 2, BOOMERANG_COST = 3, TRAP_COST = 4, VACUUM_COST = 4, DRAIN_COST = 13, FREEZE_COST = 2, BLAST_COST = 15;
export const EFFECTS: EffectDef[] = [
  { id: "invisible", name: "見えない弾", cost: 11, slot: "fx", phase: "behavior", apply: (s) => { s.visible = false; } },
  { id: "giant", name: "巨大", cost: 6, slot: "fx", phase: "mul", apply: (s) => { s.size *= 3; s.speed *= 0.75; } },
  { id: "multi", name: "多段ヒット", cost: 7, slot: "act", phase: "add", apply: (s) => { s.hits += MULTI_HITS; s.damage *= MULTI_DMG; s.hitInterval = 3; s.grind = true; } },
  { id: "restrain", name: "拘束", cost: 7, slot: "fx", phase: "behavior", apply: (s) => { s.restrainTicks += 90; } },
  { id: "tiny", name: "豆粒（高威力）", cost: 12, slot: "fx", phase: "mul", apply: (s) => { s.size *= 0.35; s.damage *= 2.2; } },
  { id: "fast", name: "高速", cost: 9, slot: "fx", phase: "mul", apply: (s) => { s.speed *= 2.2; } },
  { id: "homing", name: "ゆらゆら追尾", cost: 5, slot: "path", phase: "motion", apply: (s) => { s.homing += 2.2; s.wobble += 4; } },
  { id: "meteor", name: "打ち上げ→落下", cost: 5, slot: "path", phase: "motion", apply: (s) => { s.meteor = true; } },
  // 新しい効果（コストは CPU 対戦の測定で決めた）
  { id: "split", name: "分裂弾", cost: SPLIT_COST, slot: "act", phase: "add", apply: (s) => { s.split += 1; } },
  { id: "bounce", name: "はね返り", cost: BOUNCE_COST, slot: "path", phase: "motion", apply: (s) => { s.bounces += 3; s.lifetime += 90; } },
  { id: "boomerang", name: "ブーメラン", cost: BOOMERANG_COST, slot: "path", phase: "motion", apply: (s) => { s.boomerang = true; s.lifetime += 60; } }, // 測定1回目は hits+1 で強すぎ（勝率79%）→ 行き帰りで1回だけ当たる
  { id: "trap", name: "おき罠", cost: TRAP_COST, slot: "act", phase: "behavior", apply: (s) => { if (s.trap) s.hits += 1; s.trap = true; s.lifetime += 240; } }, // 重ねると 長く残り、何回も 踏める,
  { id: "vacuum", name: "すいこみ", cost: VACUUM_COST, slot: "act", phase: "behavior", apply: (s) => { s.pull += 8; } }, // 測定1回目（引き6・威力0.8倍）は弱すぎ
  { id: "drain", name: "すいとり", cost: DRAIN_COST, slot: "fx", phase: "behavior", apply: (s) => { s.lifesteal += 0.6; } },
  { id: "freeze", name: "こおり", cost: FREEZE_COST, slot: "fx", phase: "behavior", apply: (s) => { s.freezeTicks += 90; } },
  { id: "blast", name: "ばくはつ", cost: BLAST_COST, slot: "act", phase: "behavior", apply: (s) => { s.blast += 2.2; } },
  // 高さの ある 戦い用（コストは CPU 対戦の 測定で 決めた）
  { id: "wave", name: "じめん波", cost: WAVE_COST, slot: "path", phase: "motion", apply: (s) => { s.ground = true; s.size *= 1.8; s.damage *= 1.15; s.speed *= 0.85; } },
  { id: "net", name: "あみ", cost: NET_COST, slot: "fx", phase: "behavior", apply: (s) => { s.netTicks += 150; s.size *= 1.4; s.damage *= 0.9; } },
  { id: "thunder", name: "かみなり", cost: THUNDER_COST, slot: "fx", phase: "behavior", apply: (s) => { s.shockTicks += 100; } },
  { id: "rain", name: "あめあられ", cost: RAIN_COST, slot: "path", phase: "add", apply: (s) => { s.cloud = true; s.drip += DRIP_COUNT; } }, // 旧パーツ: 雲から降る＋時間差分割 の セット
  { id: "cloud", name: "雲から降る", cost: CLOUD_COST, slot: "path", phase: "motion", apply: (s) => { s.cloud = true; } },
  { id: "drip", name: "時間差分割", cost: DRIP_COST, slot: "act", phase: "add", apply: (s) => { s.drip += DRIP_COUNT; } },
  { id: "fire", name: "ほのお", cost: FIRE_COST, slot: "fx", phase: "behavior", apply: (s) => { s.burnTicks += 150; } },
];

export const slotOf = (id: EffectId): Slot => EFFECTS.find((e) => e.id === id)?.slot ?? "fx";
// 弾道は 1つだけ。古いデータで 2つ以上 付いていたら この順で 1つ選ぶ（雲・あめあられは 同じ弾道として 共存できる）
const PATH_PRIORITY: EffectId[] = ["rain", "cloud", "meteor", "boomerang", "wave", "bounce", "homing"];
export function pathOf(ids: EffectId[]): EffectId | undefined {
  return PATH_PRIORITY.find((p) => ids.includes(p));
}
export function normalizeSpecial(ids: EffectId[]): EffectId[] {
  const path = pathOf(ids);
  const sky = path === "rain" || path === "cloud";
  return ids.filter((id) => slotOf(id) !== "path" || id === path || (sky && (id === "rain" || id === "cloud")));
}

// 同じ効果を複数付けたら、その数だけ重ねてかける（巨大×2 なら 9 倍の大きさ）。並び順には依らない
export function composeSpecial(raw: EffectId[]): ProjSpec {
  const ids = normalizeSpecial(raw);
  const s: ProjSpec = { ...BASE_SPEC };
  const chosen = EFFECTS.flatMap((e) => ids.filter((x) => x === e.id).map(() => e));
  for (const phase of PHASE_ORDER) for (const e of chosen) if (e.phase === phase) e.apply(s);
  s.tags = EFFECTS.filter((e) => ids.includes(e.id)).map((e) => e.id);
  return s;
}

export function specialCost(ids: EffectId[]): number {
  return ids.reduce((a, id) => a + (EFFECTS.find((e) => e.id === id)?.cost ?? 0), 0);
}
