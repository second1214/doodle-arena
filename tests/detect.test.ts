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

describe("写真をそのまま貼った線", () => {
  it("写っている所（mask）は文字にして元にもどせる。手足の検知にも使われる", async () => {
    const { maskText, readMask, rasterize } = await import("../src/detect");
    // 32×32: 胴（まん中の四角）＋下に2本の足
    const w = 32, h = 32, m = new Uint8Array(w * h);
    for (let y = 6; y < 20; y++) for (let x = 6; x < 26; x++) m[y * w + x] = 1;
    for (let y = 20; y < 30; y++) for (const x0 of [8, 20]) for (let x = x0; x < x0 + 4; x++) m[y * w + x] = 1;
    const t = maskText(m, w, h);
    expect(Array.from(readMask(t)!.m)).toEqual(Array.from(m));
    const st: Stroke = { color: "#000000", width: 0, points: [56, 56, 400, 400], img: "data:image/jpeg;base64,AAAA", mask: t };
    const r = rasterize([st], 64);
    expect(r[Math.floor(64 * (56 + 200) / 512) * 64 + 32]).toBe(1); // まん中は写っている
    expect(r[2 * 64 + 2]).toBe(0);
    expect(detect([st]).limbs.filter((l) => l.kind === "foot").length).toBe(2);
  });
});
