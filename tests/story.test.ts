import { beforeEach, describe, expect, it } from "vitest";
import { detect, DEFAULT_PARAMS } from "../src/detect";
import { ALL_STAGES, enemyParts, isUnlocked } from "../src/story";
import { buildSpecial, seededRnd } from "../src/items";
import { applyStageResult, expToNext, exportCode, importCode, loadProfile } from "../src/progress";
import { createWorld, hashWorld, step } from "../src/sim/world";
import { aiInput, createAi } from "../src/sim/ai";
import { fighterShape } from "../src/shape";
import { autoTree, boostOf } from "../src/tree";

// node には localStorage が無いので、最小の代わりを置く
class MemStorage {
  m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
beforeEach(() => { (globalThis as { localStorage?: unknown }).localStorage = new MemStorage(); });

describe("経験値とレベル", () => {
  it("初勝利・2回目・負けで経験値が変わり、レベルが上がるとポイントが増える", () => {
    const r1 = applyStageResult(1, "1-1", false, true);
    expect(r1).toMatchObject({ exp: 52, firstClear: true });
    expect(loadProfile()).toMatchObject({ level: 1, exp: 52, points: 0 }); // Lv2 まで 60
    const r2 = applyStageResult(1, "1-1", false, true);
    expect(r2.exp).toBe(26); // 2回目は半分 → 78 で Lv2（必要60）
    expect(loadProfile()).toMatchObject({ level: 2, exp: 78 - expToNext(1), points: 1 });
    const r3 = applyStageResult(2, "1-2", false, false);
    expect(r3.exp).toBe(16); // 負けは 1/4
    expect(loadProfile()).toMatchObject({ level: 2, exp: 18 + 16, points: 1 });
  });
  it("ボスの初撃破はポイント +1（2回目以降は無し）", () => {
    const r = applyStageResult(6, "1-6", true, true);
    expect(r.points).toBe(1 + r.levelsUp);
    const again = applyStageResult(6, "1-6", true, true);
    expect(again.points).toBe(again.levelsUp); // 2回目はレベルアップ分だけ
  });
  it("ステージは前を倒すと開く", () => {
    expect(isUnlocked(ALL_STAGES[0], {})).toBe(true);
    expect(isUnlocked(ALL_STAGES[1], {})).toBe(false);
    expect(isUnlocked(ALL_STAGES[1], { "1-1": 1 })).toBe(true);
  });
});

describe("引き継ぎコード", () => {
  it("書き出して読み込むと同じデータに戻る", async () => {
    applyStageResult(3, "1-3", false, true);
    localStorage.setItem("doodle-arena:roster", "[1,2,3]");
    localStorage.setItem("other-app", "x");
    const code = await exportCode();
    localStorage.clear();
    localStorage.setItem("doodle-arena:roster", "[]");
    expect(await importCode(code)).toBe(3);
    expect(localStorage.getItem("doodle-arena:roster")).toBe("[1,2,3]");
    expect(loadProfile()).toMatchObject({ level: 2, exp: 76 - expToNext(1) });
    expect(localStorage.getItem("other-app")).toBeNull();
    await expect(importCode("hello")).rejects.toThrow();
  });
});

describe("ストーリーの敵", () => {
  it("どの敵も絵から体が検知でき、試合が最後まで進む", () => {
    for (const st of ALL_STAGES) {
      const res = detect(st.strokes(), DEFAULT_PARAMS);
      const shape = fighterShape(res);
      const cfg = { name: st.enemy, reach: shape.reach, hasHands: shape.hasHands, hasFeet: shape.hasFeet, ...(() => { const b = buildSpecial(enemyParts(st), st.specialType); return { special: b.special, melee: b.melee, specialMod: b.mod }; })(), specialType: st.specialType, boost: { ...boostOf(autoTree(st.boostPoints, st.prefer)), hp: st.hp ?? 0 }, personality: st.personality, traits: shape.traits };
      const w = createWorld({ name: "p", reach: 0.8, hasHands: true, hasFeet: true, special: [] }, cfg, 7);
      const ais = [createAi(), createAi(st.ai)];
      while (w.winner === -1) step(w, [aiInput(w, 0, ais[0]), aiInput(w, 1, ais[1])]);
      expect(w.winner).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("自由バトルの CPU キャラ", () => {
  it("全員が絵から体を作れ、固定のパーツで試合が最後まで進む（同じシードなら同じ結果）", async () => {
    const { CPU_CHARS } = await import("../src/cpuChars");
    const { makePart, hashStr } = await import("../src/items");
    expect(CPU_CHARS.length).toBeGreaterThanOrEqual(29);
    for (const c of CPU_CHARS) {
      const shape = fighterShape(detect(c.strokes(), DEFAULT_PARAMS));
      const parts = c.parts.map((k, i) => makePart(k, "C", seededRnd(hashStr(`${c.id}#${i}`)), `${c.id}#${i}`));
      const b = buildSpecial(parts, c.specialType);
      const cfg = { name: c.name, reach: shape.reach, hasHands: shape.hasHands, hasFeet: shape.hasFeet, traits: shape.traits, special: b.special, melee: b.melee, specialMod: b.mod, specialType: c.specialType, personality: c.personality, boost: boostOf(autoTree(10, c.prefer)) };
      const play = () => {
        const w = createWorld(cfg, { name: "p", reach: 0.8, hasHands: true, hasFeet: true, special: ["homing"] }, 11);
        const ais = [createAi(), createAi()];
        while (w.winner === -1) step(w, [aiInput(w, 0, ais[0]), aiInput(w, 1, ais[1])]);
        return hashWorld(w);
      };
      expect(play()).toBe(play());
    }
  }, 120_000);
});
