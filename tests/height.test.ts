import { describe, expect, it } from "vitest";
import { ARENAS, ARENA_LIST, groundAt, inside } from "../src/sim/arena";
import { createWorld, NO_INPUT, step, type FighterConfig, type Input, type World } from "../src/sim/world";

const cfg = (name: string, extra: Partial<FighterConfig> = {}): FighterConfig => ({ name, reach: 0.8, hasHands: true, hasFeet: true, special: [], ...extra });
const run = (w: World, n: number, inp: (w: World) => Input, op: Input = NO_INPUT) => { for (let k = 0; k < n && w.winner === -1; k++) step(w, [inp(w), op]); };
const toward = (tx: number, tz: number, extra: Partial<Input> = {}) => (w: World): Input => {
  const f = w.fighters[0], dx = tx - f.x, dz = tz - f.z, l = Math.hypot(dx, dz) || 1;
  return { ...NO_INPUT, mx: l < 0.05 ? 0 : dx / l, mz: l < 0.05 ? 0 : dz / l, ...extra };
};

describe("高低差のある ステージ", () => {
  it("どのステージも 地形が 舞台の中に おさまる", () => {
    for (const a of ARENA_LIST) expect(inside(a), a.id).toBe(true);
  });

  it("坂を 歩いて のぼれる（夕やけの おか）", () => {
    const w = createWorld(cfg("A"), cfg("B"), 1, ARENAS.hill);
    w.fighters[0].x = -2; w.fighters[0].z = 0;
    w.fighters[1].x = 0; w.fighters[1].z = 7;
    run(w, 120, toward(4, 0));
    expect(w.fighters[0].y).toBeCloseTo(1.6, 1);
    expect(w.fighters[0].x).toBeGreaterThan(2.5);
  });

  it("高い段差は かべ（歩いて 入れない）", () => {
    const w = createWorld(cfg("A"), cfg("B"), 1, ARENAS.beach);
    w.fighters[0].x = 0; w.fighters[0].z = 4;
    w.fighters[1].x = 6; w.fighters[1].z = 4;
    // はしごの 無い 横から 岩へ 向かう
    w.fighters[0].x = 3.5; w.fighters[0].z = 0;
    run(w, 90, toward(0, 0));
    expect(w.fighters[0].y).toBe(0);
    expect(w.fighters[0].x).toBeGreaterThan(1.8);
  });

  it("はしごに 向かって進むと 登って 上に のる", () => {
    const w = createWorld(cfg("A"), cfg("B"), 1, ARENAS.beach);
    w.fighters[0].x = 0; w.fighters[0].z = 3;
    w.fighters[1].x = 6; w.fighters[1].z = 4;
    run(w, 150, toward(0, -1));
    expect(w.fighters[0].y).toBeCloseTo(2, 1);
    expect(groundAt(ARENAS.beach, w.fighters[0].x, w.fighters[0].z)).toBe(2);
  });

  it("台から 降りると 落ちて 地面に 立つ", () => {
    const w = createWorld(cfg("A"), cfg("B"), 1, ARENAS.beach);
    w.fighters[0].x = 0; w.fighters[0].z = 0; w.fighters[0].y = 2;
    w.fighters[1].x = 6; w.fighters[1].z = 4;
    run(w, 90, toward(4, 0));
    expect(w.fighters[0].y).toBe(0);
  });
});

describe("飛ぶ", () => {
  it("羽が無いと 飛べない", () => {
    const w = createWorld(cfg("A"), cfg("B"), 1);
    run(w, 30, () => ({ ...NO_INPUT, fly: true }));
    expect(w.fighters[0].y).toBe(0);
  });

  it("羽があると 上がり、スタミナが へる。切れると 落ちて しばらく 飛べない", () => {
    const w = createWorld(cfg("A", { hasWings: true }), cfg("B"), 1);
    run(w, 30, () => ({ ...NO_INPUT, fly: true }));
    expect(w.fighters[0].y).toBeGreaterThan(2);
    expect(w.fighters[0].stamina).toBeLessThan(90);
    let k = 0;
    while (!w.fighters[0].tired && k++ < 400) step(w, [{ ...NO_INPUT, fly: true }, NO_INPUT]);
    expect(w.fighters[0].tired).toBe(true);
    run(w, 40, () => ({ ...NO_INPUT, fly: true }));
    expect(w.fighters[0].y).toBe(0);
    expect(w.fighters[0].tired).toBe(true);
  });

  it("はなすと ゆっくり すべり降りる（重力より おそい）", () => {
    const w = createWorld(cfg("A", { hasWings: true }), cfg("B"), 1);
    run(w, 25, () => ({ ...NO_INPUT, fly: true }));
    const y0 = w.fighters[0].y;
    run(w, 10, () => NO_INPUT);
    expect(y0 - w.fighters[0].y).toBeLessThan(0.8);
    expect(w.fighters[0].y).toBeGreaterThan(0);
  });

  it("飛んでいる相手には 必殺の弾が 上に向かって 当たる", () => {
    const w = createWorld(cfg("A", { special: [] }), cfg("B", { hasWings: true }), 3);
    w.fighters[0].charge = 99;
    // 相手は 上がって とどまる（少し上がったら すべる→また上がる）
    const op = (w: World): Input => ({ ...NO_INPUT, fly: w.fighters[1].y < 3 });
    for (let k = 0; k < 40; k++) step(w, [NO_INPUT, op(w)]);
    expect(w.fighters[1].y).toBeGreaterThan(2);
    step(w, [{ ...NO_INPUT, special: true }, op(w)]);
    const hp0 = w.fighters[1].hp;
    for (let k = 0; k < 60; k++) step(w, [NO_INPUT, op(w)]);
    expect(w.fighters[1].hp).toBeLessThan(hp0);
  });

  it("あみが 当たると 飛べなくなって 落ちる", () => {
    const w = createWorld(cfg("A", { special: ["net"] }), cfg("B", { hasWings: true }), 3);
    w.fighters[0].charge = 99;
    for (let k = 0; k < 40; k++) step(w, [NO_INPUT, { ...NO_INPUT, fly: w.fighters[1].y < 3 }]);
    step(w, [{ ...NO_INPUT, special: true }, { ...NO_INPUT, fly: w.fighters[1].y < 3 }]);
    for (let k = 0; k < 90; k++) step(w, [NO_INPUT, { ...NO_INPUT, fly: w.fighters[1].y < 3 }]);
    expect(w.fighters[1].net).toBeGreaterThan(0);
    expect(w.fighters[1].y).toBe(0);
  });

  it("近接の 通常攻撃は 高さが ちがうと 届かない", () => {
    const w = createWorld(cfg("A"), cfg("B", { hasWings: true }), 3);
    w.fighters[0].x = -0.8; w.fighters[1].x = 0.8;
    for (let k = 0; k < 40; k++) step(w, [NO_INPUT, { ...NO_INPUT, fly: w.fighters[1].y < 3.5 }]);
    const hp0 = w.fighters[1].hp;
    for (let k = 0; k < 40; k++) step(w, [{ ...NO_INPUT, attack: k % 20 === 0 }, { ...NO_INPUT, fly: w.fighters[1].y < 3.5 }]);
    expect(w.fighters[1].hp).toBe(hp0);
  });
});
