// CPU の操作。性格ごとに行動の重みを変える（試作では「猛攻」のみ）。
// 反応の遅れ・迷いはシード固定の乱数で決めるので、同じシードなら同じ試合になる。
import { attackCostOf, dodgeCost, meleeRange, meleeSpecialRange, specialCharge, type Input, type World } from "./world";

export type Personality = "aggressive";

export interface AiState {
  hold: Input;
  wait: number;
  strafe: number;
  backoff: number; // 攻撃の後しばらく距離を取る（張り付き防止）
}

export function createAi(): AiState {
  return { hold: { mx: 0, mz: 0, attack: false, guard: false, special: false }, wait: 0, strafe: 1, backoff: 0 };
}

export function aiInput(w: World, i: 0 | 1, ai: AiState, _p: Personality = "aggressive"): Input {
  const rng = w.rng;
  // 押した瞬間だけ有効な入力は毎 tick 消す
  const out: Input = { ...ai.hold, attack: false, special: false, shove: false, dodge: false };
  if (ai.backoff > 0) ai.backoff--;
  if (ai.wait > 0) { ai.wait--; return out; }
  const me = w.fighters[i];
  // 反応の間（グニャグニャ中は鈍る）
  ai.wait = 2 + Math.floor(rng.next() * 4) + (me.wobble > 0 || me.dizzy > 0 ? 2 + Math.floor(rng.next() * 3) : 0);

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
  const melee = me.cfg.specialType === "melee";
  const mReach = meleeSpecialRange(me.cfg, me.mspec, op.cfg);
  // 相手が近接必殺を構えている / 撃てる状態で近い → 下がるか守る
  const opMeleeThreat = op.cfg.specialType === "melee" && (op.ms.phase === "windup" || (op.charge >= specialCharge && dist < meleeSpecialRange(op.cfg, op.mspec, me.cfg) + 0.5));

  let mx = 0, mz = 0, guard = false, attack = false, special = false, shove = false, dodge = false;
  const canDodge = me.stamina >= dodgeCost + 10;

  if (threat && rng.next() < 0.7) {
    if (canDodge && rng.next() < 0.35) {
      // 回避ボタンで弾の進行方向の横へ
      const side = (me.x - threat.x) * -threat.dz + (me.z - threat.z) * threat.dx >= 0 ? 1 : -1;
      mx = -threat.dz * side; mz = threat.dx * side;
      dodge = true;
    } else if (threat.spec.meteor) {
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
  } else if (opMeleeThreat && rng.next() < 0.4) {
    if (op.ms.phase === "windup" && canDodge && rng.next() < 0.5) dodge = true; // 後ろへ回避
    else if (rng.next() < 0.5) guard = me.stamina > 10;
    else { mx = -ux; mz = -uz; }
  } else if (op.guarding && dist < reach + 0.3 && me.shoveCd === 0 && rng.next() < 0.5) {
    shove = true; // 守りを固める相手は突き飛ばして崩す
  } else if (ready && melee) {
    // 近接型: 届く距離まで寄ってから撃つ（突進や地面たたきは少し遠めでも撃つ）
    const want = me.mspec.dash > 0 ? mReach + 3 : me.mspec.slam ? 4 : mReach;
    if (dist <= want && rng.next() < 0.7) special = true;
    else { mx = ux; mz = uz; }
  } else if (ready && (dist > 2.5 ? rng.next() < 0.6 : rng.next() < 0.2)) {
    special = true;
  } else if (ai.backoff > 0) {
    // 攻撃の後は少し下がって横に回る（張り付かない）
    if (rng.next() < 0.15) ai.strafe = -ai.strafe;
    const away = dist < reach + 1.5 ? -0.8 : 0.1;
    mx = ux * away - uz * 0.7 * ai.strafe; mz = uz * away + ux * 0.7 * ai.strafe;
  } else if (dist > reach * 0.9) {
    // 逃げる相手には少し先を狙って回り込む
    const lead = op.vx * ux + op.vz * uz > 0.5 ? 0.6 : 0;
    const tx = op.x + op.vx * lead - me.x, tz = op.z + op.vz * lead - me.z, tl = Math.hypot(tx, tz) || 1;
    mx = tx / tl; mz = tz / tl;
    // 転がり型は慣性があるので、近づいたら早めにブレーキ（行き過ぎ防止）
    const closing = me.vx * ux + me.vz * uz;
    if (!me.cfg.hasFeet && dist < reach + 1.5 && closing > 3) { mx = -mx * 0.5; mz = -mz * 0.5; }
  } else {
    if (me.stamina >= attackCostOf(me.cfg) && rng.next() < 0.75) {
      attack = true;
      if (rng.next() < 0.6) ai.backoff = 12 + Math.floor(rng.next() * 25);
    } else if (me.stamina < attackCostOf(me.cfg)) ai.backoff = 20 + Math.floor(rng.next() * 20); // 息切れしたら下がる
    if (rng.next() < 0.1) ai.strafe = -ai.strafe;
    mx = -uz * 0.5 * ai.strafe; mz = ux * 0.5 * ai.strafe;
    // 手が長いなら、相手の手が届かない間合いを保つ
    const opReach = meleeRange(op.cfg, me.cfg);
    if (reach > opReach + 0.3 && dist < opReach + 0.2) { mx -= ux * 0.8; mz -= uz * 0.8; }
  }
  ai.hold = { mx, mz, attack: false, guard, special: false };
  return { mx, mz, attack, guard, special, shove, dodge };
}
