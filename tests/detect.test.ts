import { describe, expect, it } from "vitest";
import { detect, type Stroke } from "../src/detect";
import { SAMPLES } from "../src/samples";

const count = (strokes: Stroke[]) => {
  const r = detect(strokes);
  return {
    hands: r.limbs.filter((l) => l.kind === "hand").length,
    feet: r.limbs.filter((l) => l.kind === "foot").length,
  };
};

describe("突起検知", () => {
  it("何も描いていなければ手足なし", () => {
    expect(count([])).toEqual({ hands: 0, feet: 0 });
  });

  it("棒人間は手2本・足2本", () => {
    expect(count(SAMPLES["棒人間"]())).toEqual({ hands: 2, feet: 2 });
  });

  it("手足付きの輪郭画は手2本・足あり", () => {
    const c = count(SAMPLES["ふつうの生き物"]());
    expect(c.hands).toBe(2);
    expect(c.feet).toBeGreaterThanOrEqual(2);
  });

  it("塗りつぶしの丸は手足なし", () => {
    expect(count(SAMPLES["まんまる（塗りつぶし）"]())).toEqual({ hands: 0, feet: 0 });
  });

  it("トゲ20本は20本の手足になる（本数制限なし）", () => {
    const c = count(SAMPLES["トゲトゲ"]());
    expect(c.hands + c.feet).toBe(20);
  });

  it("同じ入力なら同じ結果（決定性）", () => {
    const a = detect(SAMPLES["タコ"]());
    const b = detect(SAMPLES["タコ"]());
    expect(Array.from(a.labels)).toEqual(Array.from(b.labels));
  });
});
