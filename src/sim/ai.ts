// CPU の操作。性格ごとに行動の重みを変える（試作では「猛攻」のみ）。
// 反応の遅れ・迷いはシード固定の乱数で決めるので、同じシードなら同じ試合になる。
import { attackCostOf, meleeRange, specialCharge, type Input, type World } from "./world";

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
  const ux = dx / dist, uz = dz / dist;
  const reach = meleeRange(me.cfg, op.cfg);

  // 見えている敵の弾で、自分に向かってくるもの（見えない弾には反応できない）
  const threat = w.projectiles.find((p) => {
    if (p.owner === i || !p.spec.visible) return false;
    const rx = me.x - p.x, rz = me.z - p.z;
    const d = Math.hypot(rx, rz);
    if (p.spec.meteor) return p.age >= 40 && Math.hypot(me.x - p.tx, me.z - p.tz) < p.spec.size + 1.5;
    return d < 4 + p.spec.size && rx * p.dx + rz * p.dz > 0;
  });
  const opWinding = op.attack === "windup" && dist < meleeRange(op.cfg, me.cfg) + 0.6;
  const ready = me.charge >= specialCharge;

  let mx = 0, mz = 0, guard = false, attack = false, special = false;

  if (threat && rng.next() < 0.7) {
    if (threat.spec.meteor) {
      // 落下地点から離れる
      const ex = me.x - threat.tx, ez = me.z - threat.tz, el = Math.hypot(ex, ez) || 1;
      mx = ex / el; mz = ez / el;
    } else if (rng.next() < 0.6) {
      // 弾の進行方向に対して横へ避ける
      const side = (me.x - threat.x) * -threat.dz + (me.z - threat.z) * threat.dx >= 0 ? 1 : -1;
      mx = -threat.dz * side; mz = threat.dx * side;
    } else {
      guard = me.stamina > 10;
    }
  } else if (opWinding && rng.next() < 0.35) {
    guard = me.stamina > 10;
  } else if (ready && (dist > 2.5 ? rng.next() < 0.6 : rng.next() < 0.2)) {
    special = true;
  } else if (dist > reach * 0.9) {
    // 逃げる相手には少し先を狙って回り込む
    const lead = op.vx * ux + op.vz * uz > 0.5 ? 0.6 : 0;
    const tx = op.x + op.vx * lead - me.x, tz = op.z + op.vz * lead - me.z, tl = Math.hypot(tx, tz) || 1;
    mx = tx / tl; mz = tz / tl;
    // 転がり型は慣性があるので、近づいたら早めにブレーキ（行き過ぎ防止）
    const closing = me.vx * ux + me.vz * uz;
    if (!me.cfg.hasFeet && dist < reach + 1.5 && closing > 3) { mx = -mx * 0.5; mz = -mz * 0.5; }
  } else {
    if (me.stamina >= attackCostOf(me.cfg) && rng.next() < 0.75) attack = true;
    if (rng.next() < 0.1) ai.strafe = -ai.strafe;
    mx = -uz * 0.5 * ai.strafe; mz = ux * 0.5 * ai.strafe;
    // 手が長いなら、相手の手が届かない間合いを保つ
    const opReach = meleeRange(op.cfg, me.cfg);
    if (reach > opReach + 0.3 && dist < opReach + 0.2) { mx -= ux * 0.8; mz -= uz * 0.8; }
  }
  ai.hold = { mx, mz, attack: false, guard, special: false };
  return { mx, mz, attack, guard, special };
}
