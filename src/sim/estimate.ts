// 必殺の 想定ダメージ: かかし（とまる・あるく・にげる）に 1回 撃った時の 合計ダメージを、戦闘と 同じ 計算で 先に 求める。
// ためしうちの 表示と、シールの 強さの 調整（測定）に 使う。DOM 非依存・決まった シードなので 毎回 同じ 値。
import { createWorld, meleeSpecialRange, NO_INPUT, step, type FighterConfig, type Input } from "./world";

export type DummyMove = "stand" | "walk" | "run";
export const DUMMY: FighterConfig = { name: "かかし", reach: 0.6, hasHands: true, hasFeet: true, special: [] };
const MAX_TICKS = 420;

export function dummyInput(move: DummyMove, t: number): Partial<Input> {
  const a = t * 0.04;
  return move === "walk" ? { mx: Math.cos(a) * 0.5, mz: Math.sin(a) * 0.5 }
    : move === "run" ? { mx: 0, mz: Math.sin(t * 0.02) > 0 ? 1 : -1, dodge: t % 40 === 20 } : {};
}

// 1回 撃って 終わるまでの ダメージ（かかしは 倒れない）
export function volleyDamage(cfg: FighterConfig, move: DummyMove, seed = 1): { dealt: number; hits: number } {
  const w = createWorld(cfg, DUMMY, seed);
  const [me, op] = w.fighters;
  const melee = cfg.specialType === "melee";
  if (melee) { const r = meleeSpecialRange(me.cfg, me.mspec, op.cfg); me.x = -r * 0.4; op.x = r * 0.4; }
  me.charge = me.st.chargeNeed;
  let fired = false, quiet = 0, dealt = 0, hits = 0;
  for (let t = 0; t < MAX_TICKS && w.winner === -1; t++) {
    let mine: Input = NO_INPUT;
    if (!fired && w.tick >= 2) {
      const dx = op.x - me.x, dz = op.z - me.z, d = Math.hypot(dx, dz) || 1;
      if (melee && d > meleeSpecialRange(me.cfg, me.mspec, op.cfg) * 0.8) mine = { ...NO_INPUT, mx: dx / d, mz: dz / d };
      else mine = { ...NO_INPUT, special: true, mx: (dx / d) * 0.01, mz: (dz / d) * 0.01 };
    }
    step(w, [mine, { ...NO_INPUT, ...dummyInput(move, w.tick) }]);
    if (me.ms.phase !== "none" || w.projectiles.length) fired = true;
    op.hp = op.st.maxHp;
    for (const e of w.events) if ((e.kind === "hit" || e.kind === "guard") && e.target === 1 && e.amount > 0) { dealt += e.amount; hits++; }
    const busy = w.projectiles.length > 0 || me.ms.phase !== "none";
    if (busy) quiet = 0; else if (fired && ++quiet > 45) break;
  }
  return { dealt, hits };
}

// 3つの うごきの 平均（表示用）。seeds 回ずつ 撃って ならす
export function estimateDamage(cfg: FighterConfig, seeds = 2) {
  const res = { stand: 0, walk: 0, run: 0, avg: 0 };
  for (const m of ["stand", "walk", "run"] as const) {
    let s = 0;
    for (let k = 0; k < seeds; k++) s += volleyDamage(cfg, m, 11 + k).dealt;
    res[m] = s / seeds;
  }
  res.avg = (res.stand + res.walk + res.run) / 3;
  return res;
}
