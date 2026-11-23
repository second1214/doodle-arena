// 巨人モード（ストーリーの あと）。2026-11-23 ユーザー指示（docs/SPEC.md §40）。
// スキップガエル先生（12-6）を 倒すと ひらく。ストーリーを はじめから なぞるが、敵は 大きく（ふつう 4倍・変えられる）・すべての 能力が 大きく 上がる。
// 体力は「必殺（そうてい 650 ほど）を 3回 当てても 倒れない」くらいから。後半ほど 硬く・強くなるので 称号の 強化 ありき。
// ボスを 巨人モードで 倒すと 称号。称号は 持っている だけ つけられ、同じ 称号を また もらうと Lv が 上がって 強くなる。
// クリアの あとの お遊びなので 称号は 今までの バランスを こわして よい（オンラインには 持ちこまない）。
import { ALL_STAGES, stageBoost, type Stage } from "./story";
import { sumBoost, type Boost } from "./sim/stats";
import type { CharacterBuild } from "./battle/character";

const KEY = "doodle-arena:giant";
/** スキップガエル先生を 倒すと ひらく */
export const GIANT_UNLOCK = "12-6";
/** 巨人の 大きさ（倍）。設定で 2〜5 に 変えられる */
export const GIANT_SIZE_DEFAULT = 4;
export const GIANT_SIZES = [2, 3, 4, 5] as const;
export const TITLE_MAX_LV = 5;
/** 巨人モードの 試合の 長さ（秒）。体力が 多いので ふつう（120秒）より 長い */
export const GIANT_MATCH_SECONDS = 300;

export interface GiantSave {
  v: 1;
  cleared: Record<string, number>; // ステージ id → 巨人モードで 勝った 回数
  titles: Record<string, number>; // 称号 id → もらった 回数（Lv）
  off: string[]; // はずしている 称号
  size: number;
}

export function loadGiant(): GiantSave {
  let raw: Partial<GiantSave> | null = null;
  try { const s = localStorage.getItem(KEY); raw = s ? JSON.parse(s) : null; } catch { raw = null; }
  const nums = (o: unknown) => {
    const out: Record<string, number> = {};
    if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (typeof v === "number" && v > 0) out[k] = Math.floor(v);
    return out;
  };
  const size = typeof raw?.size === "number" && (GIANT_SIZES as readonly number[]).includes(raw.size) ? raw.size : GIANT_SIZE_DEFAULT;
  return { v: 1, cleared: nums(raw?.cleared), titles: nums(raw?.titles), off: Array.isArray(raw?.off) ? raw.off.filter((x): x is string => typeof x === "string") : [], size };
}
export function saveGiant(g: GiantSave): void {
  try { localStorage.setItem(KEY, JSON.stringify(g)); } catch { /* 保存できなくても 遊べる */ }
}

export const giantOpen = (storyCleared: Record<string, number>) => !!storyCleared[GIANT_UNLOCK];
/** ストーリーと 同じ じゅんばん: 1つ前の ステージに 巨人モードで 勝っていれば 挑戦できる */
export function giantUnlocked(st: Stage, g: GiantSave): boolean {
  const i = ALL_STAGES.indexOf(st);
  return i <= 0 || !!g.cleared[ALL_STAGES[i - 1].id];
}

/** 巨人の 強さ: ステージの 強さに 上のせ。i = ストーリーの 通し番号（0〜） */
export function giantExtra(i: number): Partial<Boost> {
  return {
    hp: 2000 + 90 * i, // 1章 2000 → 12章 8400 ほど
    taken: Math.min(0.5, 0.1 + 0.005 * i), // 受ける ダメージ −10% → −45%
    dealt: 0.8 + 0.03 * i, // 与える ダメージ ×1.8 → ×4
    special: 0.5,
    speed: 0.15,
    stamina: 150,
    regen: 0.5,
    knock: -0.85, // ほとんど 吹き飛ばない
  };
}
export function giantBoost(st: Stage): Partial<Boost> {
  return sumBoost([stageBoost(st), giantExtra(ALL_STAGES.indexOf(st))]);
}
/** 集団戦の なかま（巨人の 子分）: 少し 小さく・体力は 4分の1 */
export function giantCrewBoost(st: Stage, boss: Stage): Partial<Boost> {
  const e = giantExtra(ALL_STAGES.indexOf(boss));
  return sumBoost([stageBoost(st, boss.crewBoost), { ...e, hp: (e.hp ?? 0) / 4 }]);
}

/** キャラを 大きくする: 見た目は まるごと k 倍・手の 届く 距離も k 倍。
 * 当たり判定は 体の 円柱 ぜんぶ（描いた 線だけ だと、下の方は 細い 足だけで パンチが すき間を ぬけてしまう）。高さも k 倍 */
export function makeGiant(b: CharacterBuild, k: number): CharacterBuild {
  b.size = (b.size ?? 1) * k;
  const t = b.cfg.traits;
  if (t) b.cfg.traits = { ...t, radius: t.radius * k };
  b.cfg.reach *= k;
  b.cfg.hurt = undefined;
  b.cfg.size = k;
  // 巨人は 逃げずに 向かってくる（はなれて 撃つ 性格だと 広場の はしで 止まって しまう）
  b.cfg.personality = "aggressive";
  return b;
}

// ---------------- 称号 ----------------

export interface Title {
  id: string;
  from: string; // この ボスを 巨人モードで 倒すと もらえる（ステージ id）
  name: string;
  icon: string;
  /** Lv ごとの 効果の 説明 */
  desc: (lv: number) => string;
  boost: (lv: number) => Partial<Boost>;
  /** キラキラ（キャラの まわりに 光の つぶ）の 色 */
  sparkle?: string;
}
const pct = (v: number) => `${Math.round(v * 100)}%`;
export const TITLES: readonly Title[] = [
  { id: "t1", from: "1-6", name: "らくがき見習い", icon: "🖍️", desc: (l) => `体力 +${150 * l}`, boost: (l) => ({ hp: 150 * l }) },
  { id: "t2", from: "2-6", name: "インクの いぶき", icon: "🐉", desc: (l) => `スタミナ +${40 * l}・回復 +${pct(0.3 * l)}`, boost: (l) => ({ stamina: 40 * l, regen: 0.3 * l }) },
  { id: "t3", from: "3-6", name: "けしゴムの よろい", icon: "🛡️", desc: (l) => `受ける ダメージ −${pct(0.06 + 0.06 * l)}`, boost: (l) => ({ taken: 0.06 + 0.06 * l }) },
  { id: "t4", from: "4-6", name: "にじいろの まほう", icon: "🌈", sparkle: "rainbow", desc: (l) => `キャラが キラキラ・必殺 +${pct(0.1 + 0.1 * l)}`, boost: (l) => ({ special: 0.1 + 0.1 * l }) },
  { id: "t5", from: "5-6", name: "白紙の かぜ", icon: "💨", desc: (l) => `移動 +${pct(0.2 + 0.1 * l)}`, boost: (l) => ({ speed: 0.2 + 0.1 * l }) },
  { id: "t6", from: "6-6", name: "そらの 王者", icon: "🪽", desc: (l) => `飛んでも スタミナが へらない・飛ぶ速さ +${pct(0.2 + 0.15 * l)}`, boost: (l) => ({ flyDrain: -1, flySpeed: 0.2 + 0.15 * l }) },
  { id: "t7", from: "7-6", name: "エスパーの ひらめき", icon: "🔮", desc: (l) => `必殺に いる 命中 −${l >= 5 ? 3 : l >= 3 ? 2 : 1}`, boost: (l) => ({ chargeNeed: -(l >= 5 ? 3 : l >= 3 ? 2 : 1) }) },
  { id: "t8", from: "8-6", name: "いたずら上手", icon: "😈", desc: (l) => `回避に スタミナ いらない・防御で ゲージ +${(0.5 * l).toFixed(1)}`, boost: (l) => ({ dodgeCost: -22, guardCharge: 0.5 * l }) },
  { id: "t9", from: "9-6", name: "まおうの こぶし", icon: "🔥", desc: (l) => `パンチ ×${(2 + 0.25 * (l - 1)).toFixed(2)}`, boost: (l) => ({ punch: 1 + 0.25 * (l - 1) }) },
  { id: "t10", from: "10-5", name: "やみの 番人", icon: "🗿", desc: (l) => `体力 +${400 * l}・ほとんど 吹き飛ばない`, boost: (l) => ({ hp: 400 * l, knock: -0.8 }) },
  { id: "t11", from: "10-6", name: "3つの ドクロ", icon: "💀", desc: (l) => `必殺 ×${(2 + 0.25 * (l - 1)).toFixed(2)}`, boost: (l) => ({ special: 1 + 0.25 * (l - 1) }) },
  { id: "t12", from: "11-6", name: "ひめの ごかご", icon: "👑", desc: (l) => `移動 ×2・スタミナ回復 +${pct(0.5 * l)}・受ける ダメージ −${pct(0.05 * l)}`, boost: (l) => ({ speed: 1, regen: 0.5 * l, taken: 0.05 * l }) },
  { id: "t13", from: "12-6", name: "ダンスの 王者", icon: "🐸", sparkle: "gold", desc: (l) => `攻撃力 ×${(2 + 0.25 * (l - 1)).toFixed(2)}・金色に キラキラ`, boost: (l) => ({ dealt: 1 + 0.25 * (l - 1) }) },
];
export const titleFrom = (stageId: string) => TITLES.find((t) => t.from === stageId);
export const titleLv = (g: GiantSave, id: string) => Math.min(TITLE_MAX_LV, g.titles[id] ?? 0);
export const equippedTitles = (g: GiantSave) => TITLES.filter((t) => titleLv(g, t.id) > 0 && !g.off.includes(t.id));

/** つけている 称号の 強化の 合計（ストーリー・チャレンジ・巨人モードで 効く。オンラインには 持ちこまない） */
export function titleBoost(g: GiantSave = loadGiant()): Partial<Boost> {
  return sumBoost(equippedTitles(g).map((t) => t.boost(titleLv(g, t.id))));
}
/** キラキラの 色（金が いちばん 上） */
export function titleSparkle(g: GiantSave = loadGiant()): string | undefined {
  const on = equippedTitles(g);
  return on.find((t) => t.sparkle === "gold")?.sparkle ?? on.find((t) => t.sparkle)?.sparkle;
}

/** 巨人モードの 勝ち負けを 記録。ボスなら 称号（もう 持っていれば Lv が 上がる）。もらった 称号と Lv を かえす */
export function recordGiant(st: Stage, won: boolean): { firstClear: boolean; title?: Title; lv?: number } {
  const g = loadGiant();
  if (!won) return { firstClear: false };
  const firstClear = !g.cleared[st.id];
  g.cleared[st.id] = (g.cleared[st.id] ?? 0) + 1;
  const t = titleFrom(st.id);
  let lv: number | undefined;
  if (t) { g.titles[t.id] = Math.min(TITLE_MAX_LV, (g.titles[t.id] ?? 0) + 1); lv = g.titles[t.id]; }
  saveGiant(g);
  return { firstClear, title: t, lv };
}
