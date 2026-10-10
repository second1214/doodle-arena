import { describe, expect, it } from "vitest";
import { normalize } from "../src/roster";
import { statEffects } from "../src/sim/stats";
import { aiInput, createAi } from "../src/sim/ai";
import { createWorld, step, type FighterConfig } from "../src/sim/world";
import { autoTree, boostOf, canTake, isRevealed, isValidTree, legacyCost, NODES, spentOf, TREE_CAP, TREE_TOTAL } from "../src/tree";

const cfg = (x: Partial<FighterConfig>): FighterConfig => ({ name: "x", reach: 0.5, hasHands: true, hasFeet: true, special: [], ...x });

describe("強化（スキルツリー）", () => {
  it("強化なしは標準の値", () => {
    const e = statEffects();
    expect([e.dealt, e.taken, e.speed, e.regen, e.special, e.punch]).toEqual([1, 1, 1, 1, 1, 1]);
    expect([e.maxHp, e.chargeNeed, e.dodgeCost, e.guardCut, e.guardCharge]).toEqual([100, 5, 22, 0.7, 0.5]);
  });

  it("7本の枝（小・★山場・分かれ道・◆大技）＋組み合わせ技7＋らくがき才能4。順につながっていないと取れない", () => {
    expect(NODES.filter((n) => n.kind === "bridge").length).toBe(7);
    expect(NODES.filter((n) => n.kind === "talent").length).toBe(4);
    expect(TREE_TOTAL).toBe(7 * 11 + 7 * 3 + 4);
    expect(canTake("atk-1", [])).toBe(true);
    expect(canTake("atk-2", [])).toBe(false);
    const toFork = ["atk-1", "atk-2", "atk-3", "atk-4"];
    expect(canTake("atk-5a", toFork)).toBe(true);
    expect(canTake("atk-5b", [...toFork, "atk-5a"])).toBe(false); // 分かれ道は片方だけ
    expect(canTake("atk-6", [...toFork, "atk-5b"])).toBe(true);
    expect(isValidTree([...toFork, "atk-5a", "atk-5b"])).toBe(false);
    expect(isValidTree(["atk2"])).toBe(false); // 古い形の ID は無効（払い戻し）
    expect(legacyCost("atk6")).toBe(3);
    // 組み合わせ技: となりの枝の★を両方
    const bridge = "x-atk-sp";
    expect(canTake(bridge, ["atk-1", "atk-2", "atk-3"])).toBe(false);
    expect(canTake(bridge, ["atk-1", "atk-2", "atk-3", "sp-1", "sp-2", "sp-3"])).toBe(true);
    expect(isRevealed("atk-3", [])).toBe(false);
    expect(isRevealed("atk-2", [])).toBe(true);
  });

  it("ツリーに使える上限: 多く取れるが全部は取れない。CPU の自動取得も上限まで", () => {
    expect(TREE_CAP).toBeGreaterThanOrEqual(TREE_TOTAL / 2);
    expect(TREE_CAP).toBeLessThan(TREE_TOTAL);
    const all = autoTree(999, ["atk", "sp", "tec", "spd", "sta", "hp", "def"]);
    expect(spentOf(all)).toBeLessThanOrEqual(TREE_CAP);
    expect(spentOf(all)).toBeGreaterThanOrEqual(TREE_CAP - 2);
  });

  it("取ったノードの合計が試合に反映される（体力・必殺に必要な命中）。才能は絵の形が合う時だけ", () => {
    const owned = ["hp-1", "hp-2", "hp-3", "hp-4", "hp-5a", "hp-6", "hp-7", "sp-1", "sp-2", "sp-3", "sp-4", "sp-5a", "sp-6", "sp-7", "t-roll"];
    const w = createWorld(cfg({ boost: boostOf(owned, { hasFeet: true, hasHands: true, hits: 1, reach: 0.5 }) }), cfg({}), 1);
    expect(w.fighters[0].maxHp).toBe(100 + 5 * 4 + 10 + 20 + 20);
    expect(w.fighters[0].st.chargeNeed).toBe(4);
    expect(boostOf(["t-roll"], { hasFeet: false, hasHands: true, hits: 1, reach: 0.5 }).speed).toBeCloseTo(0.12);
    expect(boostOf(["t-roll"], { hasFeet: true, hasHands: true, hits: 1, reach: 0.5 }).speed ?? 0).toBe(0);
    const ais = [createAi(), createAi()];
    while (w.winner === -1) step(w, [aiInput(w, 0, ais[0]), aiInput(w, 1, ais[1])]);
    expect(w.winner).not.toBe(-1);
  });

  it("敵用の自動振り分けは好みの枝を交互に手前から取る", () => {
    expect(autoTree(4, ["atk", "hp"])).toEqual(["atk-1", "hp-1", "atk-2", "hp-2"]);
    expect(autoTree(0, ["atk"])).toEqual([]);
    expect(isValidTree(autoTree(40, ["atk", "sp", "hp"]))).toBe(true);
  });
});

describe("保存データ", () => {
  it("壊れたデータは読み込み時に整える", () => {
    const c = normalize({ name: "" });
    expect(c.name).toBe("名無し");
    expect(c.specialType).toBe("ranged");
  });
});
