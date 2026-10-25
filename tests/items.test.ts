import { beforeEach, describe, expect, it } from "vitest";
import { ALL_KINDS, buildSpecial, equipCosts, makePart, makeSticker, MAX_EXTRAS, MAX_STAR, RARITY_INFO, rollShine, seededRnd, SHINE_INFO, upgradePart, type Part } from "../src/items";
import { dropParts, loadInventory, migrateToParts, planStacks, saveInventory, stackAll, stackInto, toggleLock } from "../src/inventory";
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
  it("できばえ（ふつう・キラ・ピカピカ）ごとに 威力の幅と 重さが 決まり、★で 少し強く 軽くなる", () => {
    const rnd = seededRnd(42);
    for (const sh of [0, 1, 2] as const) for (let k = 0; k < 50; k++) {
      const p = makeSticker("r:giant", sh, 1, rnd);
      const info = SHINE_INFO[sh];
      expect(p.roll).toBeGreaterThanOrEqual(info.roll[0]);
      expect(p.roll).toBeLessThanOrEqual(info.roll[1]);
      expect(Math.abs(p.cost - Math.round(6 * info.costMul))).toBeLessThanOrEqual(1);
      if (sh === 1) expect(p.extras.length).toBe(1);
      if (sh === 2) expect(p.extras.length).toBeGreaterThanOrEqual(1);
      const five = makeSticker("r:giant", sh, 5, seededRnd(k + 1));
      const one = makeSticker("r:giant", sh, 1, seededRnd(k + 1));
      expect(five.roll).toBeCloseTo(one.roll + 0.2, 1);
      expect(five.cost).toBe(Math.max(1, one.cost - 2));
    }
  });

  it("古い レア度の パーツは シールに 読みかえる（個体差は 残す）", () => {
    const old = { id: "o", kind: "r:giant", rarity: "S", roll: 1.4, cost: 5, extras: [{ stat: "power", value: 0.1 }] } as unknown as Part;
    const p = upgradePart(old);
    expect(p.shine).toBe(2);
    expect(p.star).toBe(2);
    expect(p.q).toBe(1);
    expect(p.rarity).toBeUndefined();
    expect(p.extras.length).toBe(1);
    // 敵の設定（レア度）は おまけの数も 前と同じ
    expect(makePart("power", "C", seededRnd(1)).extras.length).toBe(RARITY_INFO.C.extras);
  });

  it("同じ効果を2つ付けると重なる（巨大×2 で大きさ9倍）", () => {
    expect(composeSpecial(["giant", "giant"]).size).toBeCloseTo(composeSpecial([]).size * 9);
    expect(composeSpecial(["giant", "giant"]).tags).toEqual(["giant"]);
  });

  it("効果パーツの威力は (出来−1) を足し合わせ、型に合わないパーツは効かない", () => {
    const base = { shine: 1, star: 1, q: 0, cj: 0 } as const;
    const a: Part = { ...base, id: "a", kind: "r:giant", roll: 1.3, cost: 4, extras: [] };
    const b: Part = { ...base, id: "b", kind: "r:homing", roll: 0.8, cost: 7, extras: [{ stat: "pspeed", value: 0.1 }] };
    const m: Part = { ...base, id: "m", kind: "m:tornado", roll: 1, cost: 8, extras: [] };
    const c1: Part = { ...base, id: "c1", kind: "charge", roll: 1, cost: 6, extras: [] };
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

  it("できばえの出やすさは章の表どおり（第1章は ピカピカが出ない）", () => {
    const rnd = seededRnd(7);
    for (let k = 0; k < 500; k++) expect(rollShine(1, rnd)).toBeLessThan(2);
    expect(ALL_KINDS.length).toBe(51);
  });
});

describe("持ち物", () => {
  it("初回だけ今までの効果を 標準の シール（キラ★1・威力1.0）に移す", () => {
    const map = migrateToParts(["r:invisible", "m:wobble"])!;
    expect([...map.keys()].sort()).toEqual(["m:tornado", "m:wobble", "r:homing", "r:invisible"]);
    expect(loadInventory().parts.every((p) => p.shine === 1 && p.star === 1 && p.roll === 1 && !p.extras.length)).toBe(true);
    expect(migrateToParts(["r:giant"])).toBeNull();
  });

  it("前の形（v1・レア度・かけら）の 持ち物を 読める", () => {
    localStorage.setItem("doodle-arena:inventory", JSON.stringify({ v: 1, shards: 99, sinceA: 3, parts: [{ id: "x", kind: "power", rarity: "B", roll: 1.1, cost: 4, extras: [] }] }));
    const inv = loadInventory();
    expect(inv.v).toBe(2);
    expect(inv.parts[0].shine).toBe(1);
    expect(inv.parts[0].star).toBe(2);
  });

  it("ボスは2枚落とし、1枚は できばえ1段上。20回 ピカピカが出なければ ピカピカ確定", () => {
    saveInventory({ v: 2, parts: [], sincePika: 19 });
    const d = dropParts(1, false, seededRnd(3));
    expect(d.got[0].shine).toBe(2);
    expect(loadInventory().sincePika).toBe(0);
    const b = dropParts(1, true, seededRnd(5));
    expect(b.got.length).toBe(2);
    expect(b.got[0].shine).toBeGreaterThanOrEqual(1);
  });

  it("同じしゅるいを かさねると ★が上がり、良い方の できばえに なり、おまけを 1つ もらえる", () => {
    const rnd = seededRnd(9);
    const base = makeSticker("power", 0, 1, rnd, "base", 0);
    const pika = makeSticker("power", 2, 1, rnd, "pika", 2);
    const other = makeSticker("r:giant", 0, 1, rnd, "other", 0);
    saveInventory({ v: 2, parts: [base, pika, other], sincePika: 0 });
    expect(stackInto("base", "other", new Set())).toBeNull(); // しゅるいが ちがう
    expect(stackInto("base", "pika", new Set(["pika"]))).toBeNull(); // はっている シールは のせない
    const made = stackInto("base", "pika", new Set(), 1)!;
    expect(made.star).toBe(2);
    expect(made.shine).toBe(2);
    expect(made.extras).toEqual([pika.extras[1]]);
    expect(loadInventory().parts.map((p) => p.id).sort()).toEqual(["base", "other"]);
  });

  it("★は5まで・おまけは3つまで。まとめて かさねるは 🔒・はっている シールを のせない", () => {
    const rnd = seededRnd(11);
    const list = Array.from({ length: 7 }, (_, i) => makeSticker("lucky", 1, 1, rnd, `l${i}`, 1));
    saveInventory({ v: 2, parts: list, sincePika: 0 });
    toggleLock("l6");
    const eq = new Set(["l0"]);
    const plan = planStacks(loadInventory().parts, eq);
    expect(plan.length).toBe(1);
    expect(plan[0].baseId).toBe("l0"); // はっている シールが ベース
    expect(plan[0].matIds.length).toBe(MAX_STAR - 1);
    expect(plan[0].matIds).not.toContain("l6");
    const [made] = stackAll(eq);
    expect(made.star).toBe(MAX_STAR);
    expect(made.extras.length).toBe(MAX_EXTRAS);
    expect(loadInventory().parts.length).toBe(3); // l0・のこり1・🔒の l6
  });
});
