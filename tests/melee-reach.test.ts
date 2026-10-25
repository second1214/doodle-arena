import { it, expect } from "vitest";
import { createWorld, meleeSpecialRange, NO_INPUT, step } from "../src/sim/world";
import { MELEE_EFFECTS } from "../src/sim/melee";
it("近接の ひっさつは どれも、届く所まで 歩いてから 出せば 当たる（ためしうちと 同じ 動き）", () => {
  const miss: string[] = [];
  for (const e of MELEE_EFFECTS) {
    const w = createWorld({ name: "a", reach: 0.5, hasHands: true, hasFeet: true, special: [], specialType: "melee", melee: [e.id] }, { name: "b", reach: 0.6, hasHands: true, hasFeet: true, special: [] }, 1);
    const [me, op] = w.fighters; const r = meleeSpecialRange(me.cfg, me.mspec, op.cfg); me.x = -r * 0.4; op.x = r * 0.4; me.charge = me.st.chargeNeed;
    let hits = 0, fired = false;
    for (let t = 0; t < 300; t++) {
      const dx = op.x - me.x, d = Math.abs(dx) || 1;
      const inp = !fired && t >= 2 ? (d > r * 0.8 ? { ...NO_INPUT, mx: dx / d } : { ...NO_INPUT, special: true, mx: dx / d * 0.01 }) : NO_INPUT;
      step(w, [inp, NO_INPUT]); if (me.ms.phase !== "none") fired = true;
      op.hp = op.st.maxHp;
      hits += w.events.filter((x) => (x.kind === "hit" || x.kind === "guard") && x.target === 1 && x.amount > 0).length;
    }
    if (!hits) miss.push(e.id);
  }
  expect(miss).toEqual([]);
});
