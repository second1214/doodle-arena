import { describe, expect, it } from "vitest";
import { normalize } from "../src/roster";
import { statEffects } from "../src/sim/stats";
import { aiInput, createAi } from "../src/sim/ai";
import { createWorld, step, type FighterConfig } from "../src/sim/world";
import { autoTree, boostOf, canTake, isValidTree, NODES, TREE_TOTAL } from "../src/tree";

const cfg = (x: Partial<FighterConfig>): FighterConfig => ({ name: "x", reach: 0.5, hasHands: true, hasFeet: true, special: [], ...x });

describe("強化（スキルツリー）", () => {
  it("強化なしは標準の値", () => {
    const e = statEffects();
    expect([e.dealt, e.taken, e.speed, e.regen, e.special, e.punch]).toEqual([1, 1, 1, 1, 1, 1]);
    expect([e.maxHp, e.chargeNeed, e.dodgeCost, e.guardCut, e.guardCharge]).toEqual([100, 5, 22, 0.7, 0.5]);
  });

  it("7本の枝 × (小5＋大技1)、全部で56ポイント。枝は手前から順にしか取れない", () => {
    expect(NODES.length).toBe(42);
    expect(TREE_TOTAL).toBe(56);
    expect(canTake("atk1", [])).toBe(true);
    expect(canTake("atk2", [])).toBe(false);
    expect(canTake("atk2", ["atk1"])).toBe(true);
    expect(isValidTree(["atk1", "atk2"])).toBe(true);
    expect(isValidTree(["atk2"])).toBe(false);
    expect(isValidTree(["zzz1"])).toBe(false);
  });

  it("取ったノードの合計が試合に反映される（体力・必殺に必要な命中）", () => {
    const owned = ["hp1", "hp2", "hp3", "hp4", "hp5", "hp6", "sp1", "sp2", "sp3", "sp4", "sp5", "sp6"];
    const w = createWorld(cfg({ boost: boostOf(owned) }), cfg({}), 1);
    expect(w.fighters[0].maxHp).toBe(145);
    expect(w.fighters[0].st.chargeNeed).toBe(4);
    expect(w.fighters[0].st.special).toBeCloseTo(1.1);
    const ais = [createAi(), createAi()];
    while (w.winner === -1) step(w, [aiInput(w, 0, ais[0]), aiInput(w, 1, ais[1])]);
    expect(w.winner).not.toBe(-1);
  });

  it("敵用の自動振り分けは好みの枝を交互に手前から取る", () => {
    expect(autoTree(4, ["atk", "hp"])).toEqual(["atk1", "hp1", "atk2", "hp2"]);
    expect(autoTree(0, ["atk"])).toEqual([]);
  });
});

describe("保存データ", () => {
  it("壊れたデータは読み込み時に整える", () => {
    const c = normalize({ name: "" });
    expect(c.name).toBe("名無し");
    expect(c.specialType).toBe("ranged");
  });
});
