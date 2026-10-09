// CPU の操作。性格ごとに行動の重みを変える（試作では「猛攻」のみ）。
// 反応の遅れ・迷いはシード固定の乱数で決めるので、同じシードなら同じ試合になる。
import { meleeRange, type Input, type World } from "./world";

export type Personality = "aggressive";

export interface AiState {
  hold: Input;
  wait: number;
  strafe: number;
}

export function createAi(): AiState {
  return { hold: { mx: 0, mz: 0, attack: false, guard: false, special: false }, wait: 0, strafe: 1 };
}

export function aiInput(w: World, i: 0 | 1, ai: AiState, _p: Personality = "aggressive"): Input {
  const rng = w.rng;
  // 押した瞬間だけ有効な入力は毎 tick 消す
  const out: Input = { ...ai.hold, attack: false, special: false };
  if (ai.wait > 0) { ai.wait--; return out; }
  ai.wait = 2 + Math.floor(rng.next() * 4); // 反応の間

  const me = w.fighters[i];
  const op = w.fighters[1 - i];
  const dx = op.x - me.x, dz = op.z - me.z;
  const dist = Math.hypot(dx, dz) || 1;
  const reach = meleeRange(me.cfg);

  // 見えている敵の弾が迫っているか（見えない弾には反応できない）
  const threat = w.projectiles.some(
    (p) => p.owner !== i && p.spec.visible && Math.hypot(p.x - me.x, p.z - me.z) < 2.5 + p.spec.size,
  );
  const opWinding = op.attack === "windup" && dist < reach + 1.2;

  let mx = 0, mz = 0;
  let guard = false;
  let attack = false;
  let special = false;

  if ((threat && rng.next() < 0.55) || (opWinding && rng.next() < 0.35)) {
    guard = me.stamina > 15;
  } else if (dist > reach * 0.9) {
    mx = dx / dist; mz = dz / dist;
    if (me.specialCd === 0 && dist > 3 && rng.next() < 0.35) special = true;
  } else {
    if (me.stamina >= 15 && rng.next() < 0.8) attack = true;
    if (rng.next() < 0.1) ai.strafe = -ai.strafe;
    mx = (-dz / dist) * 0.5 * ai.strafe; mz = (dx / dist) * 0.5 * ai.strafe;
  }
  ai.hold = { mx, mz, attack: false, guard, special: false };
  return { mx, mz, attack, guard, special };
}
