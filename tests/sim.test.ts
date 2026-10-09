import { describe, expect, it } from "vitest";
import { aiInput, createAi } from "../src/sim/ai";
import { composeSpecial, EFFECTS, type EffectId } from "../src/sim/special";
import { composeMelee, MELEE_EFFECTS } from "../src/sim/melee";
import { createWorld, hashWorld, MATCH_TICKS, MAX_PROJECTILES, step, type FighterConfig, type World } from "../src/sim/world";

const cfg = (name: string, special: EffectId[], extra: Partial<FighterConfig> = {}): FighterConfig => ({
  name, reach: 0.8, hasHands: true, hasFeet: true, special, ...extra,
});

function runAiMatch(a: FighterConfig, b: FighterConfig, seed: number, onTick?: (w: World) => void): World {
  const w = createWorld(a, b, seed);
  const ais = [createAi(), createAi()];
  while (w.winner === -1) {
    step(w, [aiInput(w, 0, ais[0]), aiInput(w, 1, ais[1])]);
    onTick?.(w);
  }
  return w;
}

// 組み合わせ: 最初からある効果（先頭 oldN 個）は全部の組み合わせ、後から足した効果は「2つずつ（同じ効果の重ねがけ込み）」＋全部のせ＋1つを3重
function combos<T>(ids: T[], oldN: number): T[][] {
  const out: T[][] = [];
  const old = ids.slice(0, oldN);
  for (let mask = 1; mask < 1 << old.length; mask++) out.push(old.filter((_, i) => mask & (1 << i)));
  for (let i = oldN; i < ids.length; i++) {
    for (let j = 0; j <= i; j++) out.push([ids[i], ids[j]]);
    out.push([ids[i], ids[i], ids[i]]);
  }
  out.push([...ids]);
  return out;
}

describe("戦闘シミュレーション", () => {
  it("同じシード・同じ構成なら毎 tick 同じ状態（決定性）", () => {
    const a = cfg("A", ["homing", "multi"]), b = cfg("B", ["meteor", "giant"], { hasHands: false });
    const h1: string[] = [], h2: string[] = [];
    runAiMatch(a, b, 42, (w) => h1.push(hashWorld(w)));
    runAiMatch(a, b, 42, (w) => h2.push(hashWorld(w)));
    expect(h1).toEqual(h2);
  });

  it("CPU 同士の試合は必ず決着する（時間切れ含む）", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const w = runAiMatch(cfg("A", ["fast"]), cfg("B", ["tiny", "restrain"]), seed);
      expect(w.winner).not.toBe(-1);
      expect(w.tick).toBeLessThanOrEqual(MATCH_TICKS);
    }
  });

  it("効果の適用結果は選んだ順番に依らない", () => {
    expect(composeSpecial(["tiny", "giant", "multi"])).toEqual(composeSpecial(["multi", "giant", "tiny"]));
  });

  it("全効果の組み合わせで数値が壊れない・弾数が上限を超えない", () => {
    const ids = EFFECTS.map((e) => e.id);
    const list = combos(ids, 8);
    list.forEach((sp, mask) => {
      runAiMatch(cfg("A", sp), cfg("B", sp, { hasFeet: false }), mask + 1, (w) => {
        expect(w.projectiles.length).toBeLessThanOrEqual(MAX_PROJECTILES);
        for (const f of w.fighters) {
          expect(Number.isFinite(f.x) && Number.isFinite(f.z) && Number.isFinite(f.hp)).toBe(true);
        }
      });
    });
  }, 300_000); // 数百通り×1試合ずつ回すので長め

  it("近接型: 全効果の組み合わせで数値が壊れず、必ず決着する", () => {
    const ids = MELEE_EFFECTS.map((e) => e.id);
    combos(ids, 9).forEach((m, k) => {
      const mask = k + 1;
      const w = runAiMatch(
        cfg("A", [], { specialType: "melee", melee: m }),
        cfg("B", [], { specialType: "melee", melee: m, hasFeet: mask % 2 === 0, hasHands: mask % 3 !== 0 }),
        mask,
        (w) => {
          for (const f of w.fighters) expect(Number.isFinite(f.x) && Number.isFinite(f.z) && Number.isFinite(f.hp)).toBe(true);
        },
      );
      expect(w.winner).not.toBe(-1);
    });
  }, 600_000);

  it("近接型: 効果の適用結果は選んだ順番に依らない", () => {
    expect(composeMelee(["tornado", "grab", "giantHands"])).toEqual(composeMelee(["giantHands", "grab", "tornado"]));
  });
});
