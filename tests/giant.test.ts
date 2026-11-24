import { beforeEach, describe, expect, it } from "vitest";
import { detect, DEFAULT_PARAMS } from "../src/detect";
import { ALL_STAGES, enemyParts, type Stage } from "../src/story";
import { buildSpecial } from "../src/items";
import { createWorld, step, type FighterConfig, type Input } from "../src/sim/world";
import { buildHurt, fighterShape } from "../src/shape";
import { statEffects } from "../src/sim/stats";
import { giantBoost, giantOpen, giantUnlocked, loadGiant, recordGiant, saveGiant, titleBoost, titleLv, TITLES, titleSparkle, TITLE_MAX_LV } from "../src/giant";

const mem = new Map<string, string>();
beforeEach(() => {
  mem.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k),
    key: (i: number) => [...mem.keys()][i] ?? null, get length() { return mem.size; },
  };
});
const S = (id: string) => ALL_STAGES.find((s) => s.id === id)!;
function giantCfg(st: Stage, k: number): FighterConfig {
  const res = detect(st.strokes(), DEFAULT_PARAMS), sh = fighterShape(res), b = buildSpecial(enemyParts(st), st.specialType), hurt = buildHurt(st.strokes(), res)!;
  return { name: st.enemy, reach: sh.reach * k, hasHands: sh.hasHands, hasFeet: sh.hasFeet, special: b.special, melee: b.melee, specialMod: b.mod, specialType: st.specialType, boost: giantBoost(st),
    traits: { ...sh.traits, radius: sh.traits.radius * k }, hurt: undefined, size: k, personality: "aggressive" };
}
const NO: Input = { mx: 0, mz: 0, attack: false, guard: false, special: false };

describe("巨人モード", () => {
  it("スキップガエル先生を 倒すと ひらく。ステージは 前を 巨人モードで 倒すと 開く", () => {
    expect(giantOpen({ "12-5": 1 })).toBe(false);
    expect(giantOpen({ "12-6": 1 })).toBe(true);
    const g = loadGiant();
    expect(giantUnlocked(S("1-1"), g)).toBe(true);
    expect(giantUnlocked(S("1-2"), g)).toBe(false);
    recordGiant(S("1-1"), true);
    expect(giantUnlocked(S("1-2"), loadGiant())).toBe(true);
  });
  it("巨人は 必殺（そうてい 650）を 3回 当てても 倒れない体力。後半ほど 硬い", () => {
    const first = statEffects(giantBoost(S("1-1"))), last = statEffects(giantBoost(S("12-6")));
    expect(first.maxHp * (1 / first.taken)).toBeGreaterThan(650 * 3);
    expect(last.maxHp).toBeGreaterThan(first.maxHp * 2.5);
    expect(last.taken).toBeLessThan(first.taken);
    expect(last.dealt).toBeGreaterThan(first.dealt);
  });
  it("4倍の 巨人にも パンチが 当たる", () => {
    const giant = giantCfg(S("1-6"), 4);
    const me: FighterConfig = { name: "me", reach: 0.8, hasHands: true, hasFeet: true, special: [] };
    const w = createWorld(me, giant, 1);
    const [p, g] = w.fighters;
    p.x = g.x - 2.9; p.z = g.z; p.fx = 1; p.fz = 0;
    const hp0 = g.hp;
    for (let i = 0; i < 300; i++) step(w, [{ ...NO, attack: i % 20 === 0, mx: i % 20 < 2 ? 0.01 : 0 }, NO]);
    expect(g.hp).toBeLessThan(hp0);
  });
  it("称号: ボスを 倒すと もらえて、もう一度 倒すと Lv アップ（5まで）。はずすと 効かない", () => {
    expect(TITLES).toHaveLength(13);
    recordGiant(S("1-5"), true);
    expect(loadGiant().titles).toEqual({});
    for (let i = 0; i < 7; i++) recordGiant(S("12-6"), true);
    const g = loadGiant();
    expect(titleLv(g, "t13")).toBe(TITLE_MAX_LV);
    expect(titleBoost(g).dealt).toBeCloseTo(2);
    expect(titleSparkle(g)).toBe("gold");
    g.off.push("t13"); saveGiant(g);
    expect(titleBoost().dealt ?? 0).toBe(0);
    expect(titleSparkle()).toBeUndefined();
    // 負けは 記録しない
    expect(recordGiant(S("3-6"), false).title).toBeUndefined();
  });
  it("こわれ称号（攻撃力2倍・必殺2倍・移動2倍）は 後半の ボス", () => {
    const at = (id: string) => ALL_STAGES.findIndex((s) => s.id === TITLES.find((t) => t.id === id)!.from);
    for (const id of ["t11", "t12", "t13"]) expect(at(id)).toBeGreaterThan(ALL_STAGES.length * 0.75);
    expect(TITLES.find((t) => t.id === "t6")!.boost(1).flyDrain).toBe(-1); // 飛んでも スタミナが へらない
  });
});
