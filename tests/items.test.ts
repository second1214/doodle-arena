import { beforeEach, describe, expect, it } from "vitest";
import { ALL_KINDS, buildSpecial, equipCosts, makePart, RARITIES, RARITY_INFO, rollRarity, seededRnd, type Part } from "../src/items";
import { combine, dismantle, dropParts, loadInventory, migrateToParts, reroll, saveInventory } from "../src/inventory";
import { composeSpecial } from "../src/sim/special";
import { createWorld } from "../src/sim/world";

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

describe("パーツの数値", () => {
  it("レア度ごとに威力の幅とコストが決まる（S ほど強く軽い）", () => {
    const rnd = seededRnd(42);
    for (const r of RARITIES) for (let k = 0; k < 50; k++) {
      const p = makePart("r:giant", r, rnd);
      const info = RARITY_INFO[r];
      expect(p.roll).toBeGreaterThanOrEqual(info.roll[0]);
      expect(p.roll).toBeLessThanOrEqual(info.roll[1]);
      expect(Math.abs(p.cost - Math.round(6 * info.costMul))).toBeLessThanOrEqual(1);
      if (r === "A") expect(p.extras.length).toBe(1);
      if (r === "S") expect(p.extras.length).toBe(2);
      if (r <= "C" && "FEDC".includes(r)) expect(p.extras.length).toBe(0);
    }
  });

  it("同じ効果を2つ付けると重なる（巨大×2 で大きさ9倍）", () => {
    expect(composeSpecial(["giant", "giant"]).size).toBeCloseTo(composeSpecial([]).size * 9);
    expect(composeSpecial(["giant", "giant"]).tags).toEqual(["giant"]);
  });

  it("効果パーツの威力は (出来−1) を足し合わせ、型に合わないパーツは効かない", () => {
    const a: Part = { id: "a", kind: "r:giant", rarity: "S", roll: 1.3, cost: 4, extras: [] };
    const b: Part = { id: "b", kind: "r:homing", rarity: "F", roll: 0.8, cost: 7, extras: [{ stat: "pspeed", value: 0.1 }] };
    const m: Part = { id: "m", kind: "m:tornado", rarity: "C", roll: 1, cost: 8, extras: [] };
    const c1: Part = { id: "c1", kind: "charge", rarity: "C", roll: 1, cost: 6, extras: [] };
    const c2: Part = { ...c1, id: "c2" };
    const sp = buildSpecial([a, b, m, c1, c2], "ranged");
    expect(sp.special).toEqual(["giant", "homing"]);
    expect(sp.melee).toEqual([]);
    expect(sp.mod.power).toBeCloseTo(1.1);
    expect(sp.mod.speed).toBeCloseTo(1.1);
    expect(sp.chargeDelta).toBe(-2);
    expect(equipCosts([c1, c2])).toEqual([6, 12]); // 発動ポイント−1 は2個目からコスト2倍
    const w = createWorld({ name: "x", reach: 0.5, hasHands: true, hasFeet: true, special: sp.special, specialMod: sp.mod, boost: { chargeNeed: sp.chargeDelta } }, { name: "y", reach: 0.5, hasHands: true, hasFeet: true, special: [] }, 1);
    expect(w.fighters[0].spec.damage).toBeCloseTo(composeSpecial(["giant", "homing"]).damage * 1.1);
    expect(w.fighters[0].st.chargeNeed).toBe(3);
  });

  it("レア度の出やすさは章の表どおり（第1章は B 以上が出ない）", () => {
    const rnd = seededRnd(7);
    for (let k = 0; k < 500; k++) expect(["F", "E", "D", "C"]).toContain(rollRarity(1, rnd));
    expect(ALL_KINDS.length).toBe(22);
  });
});

describe("持ち物", () => {
  it("初回だけ今までの効果を C のパーツに移す", () => {
    const map = migrateToParts(["r:invisible", "m:wobble"])!;
    expect([...map.keys()].sort()).toEqual(["m:tornado", "m:wobble", "r:homing", "r:invisible"]);
    expect(loadInventory().parts.every((p) => p.rarity === "C" && p.roll === 1)).toBe(true);
    expect(migrateToParts(["r:giant"])).toBeNull();
  });

  it("ボスは2個落とし、1個は1段上。20回 A が出なければ A 確定", () => {
    saveInventory({ v: 1, parts: [], shards: 0, sinceA: 19 });
    const d = dropParts(1, false, seededRnd(3));
    expect(d.got[0].rarity).toBe("A");
    expect(loadInventory().sinceA).toBe(0);
    const b = dropParts(1, true, seededRnd(5));
    expect(b.got.length).toBe(2);
  });

  it("分解でかけら、かけらで振り直し、5個で合成", () => {
    const rnd = seededRnd(9);
    const parts = Array.from({ length: 6 }, () => makePart("power", "D", rnd));
    saveInventory({ v: 1, parts, shards: 0, sinceA: 0 });
    expect(dismantle(parts[0].id)).toBe(4);
    expect(reroll(parts[1].id)).toBeNull(); // かけら不足（8 必要）
    const np = combine("power", "D", new Set())!;
    expect(np.rarity).toBe("C");
    expect(loadInventory().parts.length).toBe(1);
  });
});
