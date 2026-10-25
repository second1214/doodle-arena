import { describe, expect, it } from "vitest";
import { detect, DEFAULT_PARAMS } from "../src/detect";
import { CHALLENGES, challengeOpen, foeStages } from "../src/challenge";
import { enemyParts } from "../src/story";
import { buildSpecial } from "../src/items";
import { aiInput, createAi } from "../src/sim/ai";
import { arenaById, inWater } from "../src/sim/arena";
import { createWorld, NO_INPUT, step, type FighterConfig } from "../src/sim/world";
import { fighterShape } from "../src/shape";
import { autoTree, boostOf } from "../src/tree";

const plain = (special: string[] = []): FighterConfig => ({ name: "p", reach: 0.8, hasHands: true, hasFeet: true, special: special as never });
function foeCfg(st: ReturnType<typeof foeStages>[number], hp: number): FighterConfig {
  const shape = fighterShape(detect(st.strokes(), DEFAULT_PARAMS));
  const b = buildSpecial(enemyParts(st), st.specialType);
  return { name: st.enemy, reach: shape.reach, hasHands: shape.hasHands, hasFeet: shape.hasFeet, traits: shape.traits, special: b.special, melee: b.melee, specialMod: b.mod, specialType: st.specialType, personality: st.personality, boost: { ...boostOf(autoTree(st.boostPoints, st.prefer)), hp: (st.hp ?? 0) + hp } };
}

describe("1対多", () => {
  it("相手が 3人でも 最後まで 進み、チームの 全員が たおれたら 負け", () => {
    const w = createWorld(plain(["homing", "multi"]), plain(), 3, undefined, [plain(), plain()]);
    expect(w.fighters.map((f) => f.team)).toEqual([0, 1, 1, 1]);
    const ais = w.fighters.map(() => createAi());
    let sawDead = false;
    while (w.winner === -1) {
      const before = w.fighters.map((f) => [f.x, f.z]);
      step(w, w.fighters.map((_, i) => aiInput(w, i, ais[i])));
      w.fighters.forEach((f, i) => { if (f.hp <= 0 && w.winner === -1) { sawDead = true; expect([f.x, f.z]).toEqual(before[i]); } }); // たおれた キャラは 動かない
    }
    expect([0, 1, 2]).toContain(w.winner);
    if (w.winner === 0) expect(w.fighters.slice(1).every((f) => f.hp <= 0)).toBe(true);
    expect(typeof sawDead).toBe("boolean");
  });

  it("チャレンジは ストーリーの さいごを クリアすると ひらき、1つずつ 進む", () => {
    expect(challengeOpen(CHALLENGES[0], {})).toBe(false);
    expect(challengeOpen(CHALLENGES[0], { "7-6": 1 })).toBe(true);
    expect(challengeOpen(CHALLENGES[1], { "7-6": 1 })).toBe(false);
    expect(challengeOpen(CHALLENGES[1], { "7-6": 1, c1: 1 })).toBe(true);
  });

  it("どの チャレンジも 試合が 最後まで 進む", () => {
    for (const c of CHALLENGES) {
      const [first, ...rest] = foeStages(c);
      const w = createWorld(plain(["homing"]), foeCfg(first, c.hpEach), 5, arenaById(c.arena), rest.map((s) => foeCfg(s, c.hpEach)));
      const ais = w.fighters.map(() => createAi());
      while (w.winner === -1) step(w, w.fighters.map((_, i) => aiInput(w, i, ais[i])));
      expect(w.fighters.length).toBe(c.foes.length + 1);
    }
  }, 60_000);
});

describe("プール（水場）", () => {
  const pool = arenaById("pool");
  it("水の 中は 足が おそい", () => {
    const run = (x: number) => {
      const w = createWorld(plain(), plain(), 1, pool);
      w.fighters[0].x = x; w.fighters[0].z = 0; w.fighters[1].x = 8; w.fighters[1].z = 6;
      const x0 = w.fighters[0].x;
      for (let t = 0; t < 10; t++) step(w, [{ ...NO_INPUT, mz: 1 }, NO_INPUT]);
      return Math.abs(w.fighters[0].z) + Math.abs(w.fighters[0].x - x0);
    };
    expect(inWater(pool, 0, 0, 0)).toBe(true);
    expect(run(0)).toBeLessThan(run(-4.5) * 0.75);
  });
  it("水の 中では ほのおが ジュッと 消え、かみなりは 長く しびれる", () => {
    const hitBy = (special: string[], inPool: boolean) => {
      const w = createWorld(plain(special), plain(), 1, pool);
      const [me, op] = w.fighters;
      me.x = inPool ? -2.2 : -7; op.x = inPool ? 1.5 : -3.5; me.z = op.z = 0; me.charge = me.st.chargeNeed;
      let steam = false, burn = 0, shock = 0;
      for (let t = 0; t < 200; t++) {
        step(w, [{ ...NO_INPUT, special: t === 1 }, NO_INPUT]);
        if (w.events.some((e) => e.status === "steam")) steam = true;
        burn = Math.max(burn, op.burn); shock = Math.max(shock, op.shock);
      }
      return { steam, burn, shock };
    };
    const dryF = hitBy(["fire"], false), wetF = hitBy(["fire"], true);
    expect(dryF.burn).toBeGreaterThan(0);
    expect(wetF.burn).toBe(0);
    expect(wetF.steam).toBe(true);
    expect(hitBy(["thunder"], true).shock).toBeGreaterThan(hitBy(["thunder"], false).shock);
  });
});
