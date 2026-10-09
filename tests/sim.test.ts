import { describe, expect, it } from "vitest";
import { aiInput, createAi } from "../src/sim/ai";
import { composeSpecial, EFFECTS, type EffectId } from "../src/sim/special";
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
    for (let mask = 1; mask < 1 << ids.length; mask++) {
      const sp = ids.filter((_, i) => mask & (1 << i));
      runAiMatch(cfg("A", sp), cfg("B", sp, { hasFeet: false }), mask, (w) => {
        expect(w.projectiles.length).toBeLessThanOrEqual(MAX_PROJECTILES);
        for (const f of w.fighters) {
          expect(Number.isFinite(f.x) && Number.isFinite(f.z) && Number.isFinite(f.hp)).toBe(true);
        }
      });
    }
  });
});
