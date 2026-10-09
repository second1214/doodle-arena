import { describe, expect, it } from "vitest";
import { detect, type Stroke } from "../src/detect";
import { SAMPLES } from "../src/samples";
import { fighterShape } from "../src/shape";

const shapeOf = (s: Stroke[]) => fighterShape(detect(s));

describe("形の性能", () => {
  it("足なしは転がる・足ありは歩く", () => {
    expect(shapeOf(SAMPLES["まんまる（塗りつぶし）"]()).hasFeet).toBe(false);
    expect(shapeOf(SAMPLES["棒人間"]()).hasFeet).toBe(true);
  });

  it("トゲだらけは連打になる", () => {
    expect(shapeOf(SAMPLES["トゲトゲ"]()).traits.hits).toBeGreaterThan(1);
  });

  it("手が長いほど届くが威力は下がる（スタミナ消費は増えない）", () => {
    const long = shapeOf(SAMPLES["巨大な片手"]());
    const short = shapeOf(SAMPLES["棒人間"]());
    expect(long.reach).toBeGreaterThan(short.reach);
    expect(long.traits.dmg).toBeLessThan(short.traits.dmg);
    expect(long.traits.cost).toBeCloseTo(1, 5);
  });

  it("手なしは体当たりで反動あり", () => {
    const t = shapeOf(SAMPLES["まんまる（塗りつぶし）"]()).traits;
    expect(t.selfDmg).toBeGreaterThan(0);
  });

  it("描いた大きさに依らない（半分に縮めてもほぼ同じ）", () => {
    const big = SAMPLES["棒人間"]();
    const small = big.map((s) => ({ ...s, width: s.width / 2, points: s.points.map((v) => 128 + v / 2) }));
    const a = shapeOf(big).traits, b = shapeOf(small).traits;
    expect(Math.abs(a.walk - b.walk)).toBeLessThan(0.15);
    expect(a.hits).toBe(b.hits);
  });

  it("性能の倍率が極端な値にならない（掛け合わせても 0.35〜2.6）", () => {
    for (const f of Object.values(SAMPLES)) {
      const t = shapeOf(f()).traits;
      for (const v of [t.walk, t.top, t.dmg, t.knockTaken, t.radius]) {
        expect(v).toBeGreaterThan(0.35);
        expect(v).toBeLessThan(2.6);
      }
    }
  });
});
