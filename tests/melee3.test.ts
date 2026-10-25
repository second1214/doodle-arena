// 近接の 3枠（うごき・わざ・こうか）: どの組み合わせでも、足した部品が 必ず 何かを 変えること（黙って 打ち消されない）
import { describe, expect, it } from "vitest";
import { meleeSlotOf, type MeleeEffectId } from "../src/sim/melee";
import { createWorld, meleeSpecialRange, NO_INPUT, step, type FighterConfig, type Input } from "../src/sim/world";

const MOVES_: (MeleeEffectId | null)[] = [null, "tornado", "dash", "slam", "dive", "bulldozer"];
const ACTS: MeleeEffectId[] = ["giantHands", "rubber", "grab", "magnet", "counter", "uppercut", "gust", "mushroom"];
const FXS: MeleeEffectId[] = ["wobble", "legbind", "crumple", "vampire", "ice", "flame"];
const TICKS = 400;
const r2 = (v: number) => Math.round(v * 100) / 100;
const flat = (o: object) => Object.entries(o).filter(([, v]) => typeof v === "number" || typeof v === "boolean").map(([k, v]) => `${k}=${typeof v === "number" ? r2(v) : v}`).join(",");
const cfg = (melee: MeleeEffectId[]): FighterConfig => ({ name: "A", reach: 0.6, hasHands: true, hasFeet: true, special: [], specialType: "melee", melee });
const DUMMY: FighterConfig = { name: "B", reach: 0.6, hasHands: true, hasFeet: true, special: [] };
// 相手: 止まる / 回って歩く / 殴りかかる（カウンター用）/ 遠くで 止まる（引きよせ・のびる手用）
const SCEN: { gap: number; op: (t: number) => Input }[] = [
  { gap: 0.4, op: () => NO_INPUT },
  { gap: 0.4, op: (t) => ({ ...NO_INPUT, mx: Math.cos(t * 0.04) * 0.5, mz: Math.sin(t * 0.04) * 0.5 }) },
  { gap: 0.4, op: (t) => ({ ...NO_INPUT, attack: t % 12 === 4 }) },
  { gap: 1.6, op: () => NO_INPUT },
];

function trace(ids: MeleeEffectId[], k: number): string {
  const w = createWorld(cfg(ids), DUMMY, 1);
  const [me, op] = w.fighters;
  const r = meleeSpecialRange(me.cfg, me.mspec, op.cfg);
  me.x = -r * SCEN[k].gap; op.x = r * SCEN[k].gap;
  me.charge = me.st.chargeNeed;
  me.hp = Math.round(me.hp / 2);
  const out: string[] = [];
  for (let t = 0; t < TICKS && w.winner === -1; t++) {
    const dx = op.x - me.x, d = Math.abs(dx) || 1;
    // 遠い 時は 少し だけ 近づいてから 出す（引きよせ・のびる手は 近づかなくても 届く）
    const inp = t === 2 || (t > 2 && t < 40 && k !== 3 && d > meleeSpecialRange(me.cfg, me.mspec, op.cfg)) ? { ...NO_INPUT, special: t >= 2, mx: dx / d * (t === 2 ? 0.01 : 1) } : NO_INPUT;
    step(w, [inp, SCEN[k].op(t)]);
    out.push(`${flat(me)}|${flat(op)}|${w.events.map((e) => `${e.kind}:${r2(e.amount)}`).join(";")}`);
  }
  return out.join("\n");
}
const memo = new Map<string, string>();
const run = (ids: MeleeEffectId[], k: number) => { const key = [...ids].sort().join("+") + "@" + k; let v = memo.get(key); if (v === undefined) { v = trace(ids, k); memo.set(key, v); } return v; };
const same = (a: MeleeEffectId[], b: MeleeEffectId[]) => SCEN.every((_, k) => run(a, k) === run(b, k));
const name = (ids: MeleeEffectId[]) => ids.join("+") || "なぐる";
const withMove = (m: MeleeEffectId | null, ...xs: MeleeEffectId[]) => (m ? [m, ...xs] : xs);

describe("近接の3枠: 打ち消しが無い", () => {
  it("部品の枠分け", () => {
    for (const m of MOVES_) if (m) expect(meleeSlotOf(m)).toBe("path");
    for (const a of ACTS) expect(meleeSlotOf(a)).toBe("act");
    for (const f of FXS) expect(meleeSlotOf(f)).toBe("fx");
  });
  it("どの うごきにも、わざを 1つ・2つ（重ねがけ込み）足すと 必ず 変わる", () => {
    const bad: string[] = [];
    for (const m of MOVES_) for (let i = 0; i < ACTS.length; i++) {
      const one = withMove(m, ACTS[i]);
      if (same(one, withMove(m))) bad.push(name(one));
      for (let j = i; j < ACTS.length; j++) {
        const ids = withMove(m, ACTS[i], ACTS[j]);
        if (same(ids, one) || same(ids, withMove(m, ACTS[j]))) bad.push(name(ids));
      }
    }
    expect(bad).toEqual([]);
  }, 120_000);
  it("こうかは どの うごき・わざと 組んでも 消えない", () => {
    const bad: string[] = [];
    for (const m of MOVES_) for (const a of [null, ...ACTS]) {
      const base = withMove(m, ...(a ? [a] : []));
      for (const f of FXS) if (same([...base, f], base)) bad.push(name([...base, f]));
    }
    expect(bad).toEqual([]);
  }, 120_000);
});
