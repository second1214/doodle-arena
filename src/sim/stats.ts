// 能力値（ポイント振り分け）。形の性能の上に重ねて効く。4 が標準（倍率 1）。
export interface Stats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  stamina: number;
}

export const STAT_KEYS: (keyof Stats)[] = ["attack", "defense", "speed", "hp", "stamina"];
export const STAT_LABELS: Record<keyof Stats, string> = { attack: "攻撃力", defense: "防御力", speed: "移動速度", hp: "体力", stamina: "スタミナ" };
export const STAT_BUDGET = 20; // 総ポイント（仮）
export const STAT_MAX = 10;
export const DEFAULT_STATS: Stats = { attack: 4, defense: 4, speed: 4, hp: 4, stamina: 4 };

export interface StatEffects {
  dealt: number; // 与えるダメージ倍率
  taken: number; // 受けるダメージ倍率
  speed: number; // 移動速度倍率
  maxHp: number;
  maxStamina: number;
  regen: number; // スタミナ回復倍率
}

export function statEffects(s: Stats = DEFAULT_STATS): StatEffects {
  const d = (k: keyof Stats) => (s[k] ?? 4) - 4;
  return {
    dealt: 1 + 0.06 * d("attack"), // 0.76〜1.36
    taken: 1 - 0.05 * d("defense"), // 1.2〜0.7
    speed: 1 + 0.07 * d("speed"), // 0.72〜1.42
    maxHp: 100 + 6 * d("hp"), // 76〜136
    maxStamina: 100 + 6 * d("stamina"), // 76〜136
    regen: 1 + 0.05 * d("stamina"),
  };
}

export const statTotal = (s: Stats) => STAT_KEYS.reduce((a, k) => a + s[k], 0);
