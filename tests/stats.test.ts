import { describe, expect, it } from "vitest";
import { normalize } from "../src/roster";
import { DEFAULT_STATS, STAT_BUDGET, statEffects, statTotal } from "../src/sim/stats";
import { aiInput, createAi } from "../src/sim/ai";
import { createWorld, step, type FighterConfig } from "../src/sim/world";

describe("能力値と保存データ", () => {
  it("標準の能力値は倍率がすべて 1", () => {
    const e = statEffects(DEFAULT_STATS);
    expect([e.dealt, e.taken, e.speed, e.regen]).toEqual([1, 1, 1, 1]);
    expect(e.maxHp).toBe(100);
  });

  it("壊れた・予算超過のデータは読み込み時に整える", () => {
    const c = normalize({ name: "", stats: { attack: 99, defense: 10, speed: 10, hp: 10, stamina: 10 } as never });
    expect(c.name).toBe("名無し");
    expect(statTotal(c.stats)).toBeLessThanOrEqual(STAT_BUDGET);
    expect(c.stats.attack).toBeLessThanOrEqual(10);
    expect(c.specialType).toBe("ranged");
  });

  it("体力の能力値が試合の最大体力に反映される", () => {
    const cfg = (x: Partial<FighterConfig>): FighterConfig => ({ name: "x", reach: 0.5, hasHands: true, hasFeet: true, special: [], ...x });
    const w = createWorld(cfg({ stats: { attack: 2, defense: 2, speed: 2, hp: 10, stamina: 4 } }), cfg({}), 1);
    expect(w.fighters[0].maxHp).toBe(136);
    expect(w.fighters[0].hp).toBe(136);
    const ais = [createAi(), createAi()];
    while (w.winner === -1) step(w, [aiInput(w, 0, ais[0]), aiInput(w, 1, ais[1])]);
    expect(w.winner).not.toBe(-1);
  });
});
