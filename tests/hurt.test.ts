import { describe, expect, it } from "vitest";
import { detect, type Stroke } from "../src/detect";
import { SAMPLES } from "../src/samples";
import { buildHurt } from "../src/shape";
import { createWorld, hurtHit, type FighterConfig } from "../src/sim/world";

const withHurt = (strokes: Stroke[]): FighterConfig => ({
  name: "x", reach: 0.5, hasHands: true, hasFeet: true, special: [], hurt: buildHurt(strokes, detect(strokes)),
});

describe("描いた部分だけの当たり判定", () => {
  it("輪郭だけの丸は、線の上は当たり・内側の空白は素通り", () => {
    const ring: Stroke[] = [{ color: "#222", width: 10, points: Array.from({ length: 41 }, (_, k) => [256 + Math.cos(k / 40 * Math.PI * 2) * 200, 256 + Math.sin(k / 40 * Math.PI * 2) * 200]).flat() }];
    const w = createWorld(withHurt(ring), withHurt(ring), 1);
    const f = w.fighters[0];
    const H = f.cfg.hurt!;
    const centerV = (H.gh * H.cs) / 2;
    expect(hurtHit(f, f.x, centerV, f.z, 0.05)).toBe(false); // 真ん中は空白
    const edgeU = (H.gw - H.ox - 1.5) * H.cs; // 右端の線
    expect(hurtHit(f, f.x + edgeU * (f.fx >= 0 ? 1 : -1), centerV, f.z, 0.05)).toBe(true);
  });

  it("塗りつぶした丸は真ん中も当たる", () => {
    const w = createWorld(withHurt(SAMPLES["まんまる（塗りつぶし）"]()), withHurt(SAMPLES["棒人間"]()), 1);
    const f = w.fighters[0];
    const H = f.cfg.hurt!;
    expect(hurtHit(f, f.x, (H.gh * H.cs) / 2, f.z, 0.05)).toBe(true);
  });

  it("奥行きが離れていれば当たらない", () => {
    const w = createWorld(withHurt(SAMPLES["まんまる（塗りつぶし）"]()), withHurt(SAMPLES["棒人間"]()), 1);
    const f = w.fighters[0];
    expect(hurtHit(f, f.x, 0.9, f.z + 2, 0.1)).toBe(false);
  });
});
