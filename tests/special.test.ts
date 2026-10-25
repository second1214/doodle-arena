// 3枠（弾道・振る舞い・効果）の どの組み合わせでも、足した部品が 必ず 何かを 変えること（黙って 打ち消されない）
import { describe, expect, it } from "vitest";
import { slotOf, type EffectId } from "../src/sim/special";
import { createWorld, step, NO_INPUT, type FighterConfig, type World } from "../src/sim/world";

const PATHS: (EffectId | null)[] = [null, "homing", "meteor", "bounce", "boomerang", "wave", "cloud"];
const ACTS: EffectId[] = ["multi", "split", "drip", "trap", "vacuum", "blast"];
const FXS: EffectId[] = ["invisible", "giant", "tiny", "fast", "restrain", "drain", "freeze", "net", "thunder", "fire"];
const TICKS = 720;

const cfg = (name: string, special: EffectId[]): FighterConfig => ({ name, reach: 0.8, hasHands: true, hasFeet: true, special });
const r2 = (v: number) => Math.round(v * 100) / 100;
const flat = (o: object) => Object.entries(o).filter(([, v]) => typeof v === "number" || typeof v === "boolean").map(([k, v]) => `${k}=${typeof v === "number" ? r2(v) : v}`).join(",");

// 撃つ側は 1回だけ 必殺を撃つ。相手の 動き方: 止まる / 回って歩く / 近づく（罠を踏む）/ 横へ 逃げる（外れる）
const MOVES: ((t: number) => [number, number])[] = [
  () => [0, 0],
  (t) => [Math.cos(t * 0.03) * 0.5, Math.sin(t * 0.03) * 0.5],
  () => [-0.5, 0],
  (t) => [0, t < 300 ? 1 : -1],
];
// 横へ 逃げながら 回避ボタンも 押す（すいこみでも 当たらない時）
const DODGE = (t: number) => t % 20 === 5;
function trace(ids: EffectId[], move: number): string {
  const w: World = createWorld(cfg("A", ids), cfg("B", []), 1);
  const [me, op] = w.fighters;
  me.charge = me.st.chargeNeed;
  me.hp = Math.round(me.hp / 2); // すいとりが 効くように
  const out: string[] = [];
  for (let t = 0; t < TICKS && w.winner === -1; t++) {
    const [mx, mz] = MOVES[move](t);
    step(w, [{ ...NO_INPUT, special: t === 0 }, { ...NO_INPUT, mx, mz, dodge: move === 3 && DODGE(t) }]);
    const ps = w.projectiles.map((p) => `${r2(p.x)},${r2(p.z)},${r2(p.h)},${p.spec.visible},${r2(p.spec.size)}`).sort().join(";");
    const ev = w.events.map((e) => `${e.kind}:${r2(e.amount)}:${r2(e.size)}`).join(";");
    out.push(`${ps}|${ev}|${flat(op)}|${r2(me.hp)}`);
  }
  return out.join("\n");
}

const memo = new Map<string, string>();
const run = (ids: EffectId[], move: number) => {
  const key = [...ids].sort().join("+") + "@" + move;
  let v = memo.get(key);
  if (v === undefined) { v = trace(ids, move); memo.set(key, v); }
  return v;
};
// どれか 1つの 動き方で 違えば「変わった」（必要になるまで 計算しない）
const same = (a: EffectId[], b: EffectId[]) => MOVES.every((_, k) => run(a, k) === run(b, k));
const name = (ids: EffectId[]) => ids.join("+") || "まっすぐ";
const withPath = (p: EffectId | null, ...xs: EffectId[]) => (p ? [p, ...xs] : xs);

describe("必殺の3枠: 打ち消しが無い", () => {
  it("部品の枠分け", () => {
    for (const p of PATHS) if (p) expect(slotOf(p)).toBe("path");
    for (const a of ACTS) expect(slotOf(a)).toBe("act");
    for (const f of FXS) expect(slotOf(f)).toBe("fx");
  });

  it("どの弾道にも、振る舞いを 1つ・2つ（同じものの重ねがけ込み）足すと 必ず 変わる", () => {
    const bad: string[] = [];
    for (const p of PATHS) {
      for (let i = 0; i < ACTS.length; i++) {
        const one = withPath(p, ACTS[i]);
        if (same(one, withPath(p))) bad.push(name(one));
        for (let j = i; j < ACTS.length; j++) {
          const ids = withPath(p, ACTS[i], ACTS[j]);
          if (same(ids, one) || same(ids, withPath(p, ACTS[j]))) bad.push(name(ids));
        }
      }
    }
    expect(bad).toEqual([]);
  }, 120_000);

  it("効果は どの弾道・振る舞いと 組んでも 消えない", () => {
    const bad: string[] = [];
    for (const p of PATHS) for (const a of [null, ...ACTS]) {
      const base = withPath(p, ...(a ? [a] : []));
      for (const f of FXS) if (same([...base, f], base)) bad.push(name([...base, f]));
    }
    expect(bad).toEqual([]);
  }, 120_000);
});
