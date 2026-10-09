// 強化（スキルツリーで取ったノードの合計）。形の性能の上に重ねて効く。すべて 0 が標準。
// 戦闘計算はこの数値だけを見る（ツリーの定義やノード ID は見ない＝同じ数値なら同じ試合になる）。
export interface Boost {
  dealt: number; // 与えるダメージ +割合（0.04 = +4%）
  taken: number; // 受けるダメージ −割合
  speed: number; // 移動速度 +割合
  hp: number; // 最大体力 +
  stamina: number; // 最大スタミナ +
  regen: number; // スタミナ回復 +割合
  special: number; // 必殺の威力 +割合
  punch: number; // 通常攻撃の威力 +割合
  windup: number; // 通常攻撃の構え +tick
  chargeNeed: number; // 必殺に必要な命中数 +回
  dodgeCost: number; // 回避のスタミナ +
  guardCut: number; // 防御で減らす割合 +
  guardMove: number; // 防御中の移動倍率 +
  knock: number; // 吹き飛ばされやすさ +割合
  guardCharge: number; // 防御成功で溜まるゲージ +
  guardDrain: number; // 防御中のスタミナ消費 +割合
}

export const BOOST_KEYS = ["dealt", "taken", "speed", "hp", "stamina", "regen", "special", "punch", "windup", "chargeNeed", "dodgeCost", "guardCut", "guardMove", "knock", "guardCharge", "guardDrain"] as const;

export function sumBoost(list: Partial<Boost>[]): Partial<Boost> {
  const out: Partial<Boost> = {};
  for (const b of list) for (const k of BOOST_KEYS) if (b[k]) out[k] = (out[k] ?? 0) + b[k]!;
  return out;
}

export interface StatEffects {
  dealt: number; // 与えるダメージ倍率
  taken: number; // 受けるダメージ倍率
  speed: number; // 移動速度倍率
  maxHp: number;
  maxStamina: number;
  regen: number; // スタミナ回復倍率
  special: number; // 必殺の威力倍率
  punch: number; // 通常攻撃の威力倍率
  windup: number; // 通常攻撃の構えに足す tick
  chargeNeed: number; // 必殺に必要な命中数
  dodgeCost: number; // 回避のスタミナ
  guardCut: number; // 防御で減らす割合
  guardMove: number; // 防御中の移動倍率
  knockTaken: number; // 吹き飛ばされやすさ倍率
  guardCharge: number; // 防御成功で溜まるゲージ
  guardDrain: number; // 防御中のスタミナ消費倍率
}

export const BASE_CHARGE_NEED = 5;
export const BASE_DODGE_COST = 22;

// ゲーム上の上限は設けない。下の min/max はエンジン保護（0 割り・回復するダメージ・撃てない必殺を防ぐ）だけ
export function statEffects(b: Partial<Boost> = {}): StatEffects {
  const v = (k: keyof Boost) => b[k] ?? 0;
  return {
    dealt: Math.max(0.05, 1 + v("dealt")),
    taken: Math.max(0.05, 1 - v("taken")),
    speed: Math.max(0.1, 1 + v("speed")),
    maxHp: Math.max(1, 100 + v("hp")),
    maxStamina: Math.max(10, 100 + v("stamina")),
    regen: Math.max(0.05, 1 + v("regen")),
    special: Math.max(0.05, 1 + v("special")),
    punch: Math.max(0.05, 1 + v("punch")),
    windup: Math.max(0, Math.round(v("windup"))),
    chargeNeed: Math.max(1, Math.round(BASE_CHARGE_NEED + v("chargeNeed"))),
    dodgeCost: Math.max(0, BASE_DODGE_COST + v("dodgeCost")),
    guardCut: Math.min(1, Math.max(0, 0.7 + v("guardCut"))),
    guardMove: Math.max(0, 0.5 + v("guardMove")),
    knockTaken: Math.max(0.05, 1 + v("knock")),
    guardCharge: Math.max(0, 0.5 + v("guardCharge")),
    guardDrain: Math.max(0, 1 + v("guardDrain")),
  };
}

// --- 旧: 能力値の振り分け（スキルツリーに置き換えた。古い保存データを読むためだけに残す） ---
export interface Stats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  stamina: number;
}
export const STAT_KEYS: (keyof Stats)[] = ["attack", "defense", "speed", "hp", "stamina"];
export const STAT_BUDGET = 20;
export const STAT_MAX = 10;
export const DEFAULT_STATS: Stats = { attack: 4, defense: 4, speed: 4, hp: 4, stamina: 4 };
