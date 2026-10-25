// CPU の操作。性格ごとに行動の重みを変える（猛攻 / 慎重 / 狙撃 / トリッキー）。
// 反応の遅れ・迷いはシード固定の乱数で決めるので、同じシードなら同じ試合になる。
import { airborne, attackCostOf, grabRange, meleeRange, meleeSpecialRange, type Input, type Personality, type World } from "./world";
import { groundAt, STEP } from "./arena";

export type { Personality };

interface Persona {
  label: string;
  desc: string;
  attack: number; // 間合いで殴る確率
  backoff: number; // 殴った後に下がる確率
  backoffTicks: [number, number]; // 下がる時間（最小, 幅）
  guard: number; // 相手の振りかぶりに防御する確率
  react: number; // 見えている弾に反応する確率
  dodge: number; // 反応のうち回避ボタンを使う確率
  shove: number; // 守る相手を突き飛ばす確率
  keep: number; // 撃てる状態で保ちたい距離（遠距離型）
  strafeFlip: number; // 横移動の向きを変える確率
  feint: number; // 意味もなく回避する確率（トリッキー）
}

export const PERSONAS: Record<Personality, Persona> = {
  aggressive: { label: "猛攻", desc: "ひたすら前に出て殴る", attack: 0.8, backoff: 0.4, backoffTicks: [8, 18], guard: 0.25, react: 0.6, dodge: 0.3, shove: 0.5, keep: 2.5, strafeFlip: 0.1, feint: 0 },
  cautious: { label: "慎重", desc: "守りを固めて反撃を狙う", attack: 0.6, backoff: 0.8, backoffTicks: [15, 25], guard: 0.5, react: 0.85, dodge: 0.45, shove: 0.3, keep: 3, strafeFlip: 0.08, feint: 0 },
  sniper: { label: "狙撃", desc: "殴ったら離れ、溜まった必殺を遠くから撃つ", attack: 0.8, backoff: 0.8, backoffTicks: [12, 18], guard: 0.4, react: 0.85, dodge: 0.4, shove: 0.3, keep: 4.5, strafeFlip: 0.12, feint: 0 },
  tricky: { label: "トリッキー", desc: "横に揺さぶり、突き飛ばしと回避を多用する", attack: 0.75, backoff: 0.5, backoffTicks: [8, 20], guard: 0.35, react: 0.75, dodge: 0.55, shove: 0.8, keep: 3, strafeFlip: 0.25, feint: 0.025 },
};

// 強さ（ストーリーで敵ごとに変える）。wait: 反応の間 [最小 tick, 幅]。defend: 防御・回避・弾への反応の確率の倍率
export interface AiLevel { wait: [number, number]; defend: number }
export const DEFAULT_AI_LEVEL: AiLevel = { wait: [2, 4], defend: 1 };

export interface AiState {
  level: AiLevel;
  hold: Input;
  wait: number;
  strafe: number;
  backoff: number; // 攻撃の後しばらく距離を取る（張り付き防止）
  route: number; // 高い所の 相手へ 向かう 道しるべ（-1 で 無し）
  flyT: number; // 飛び続ける 残り（羽のある CPU）
}

export function createAi(level: AiLevel = DEFAULT_AI_LEVEL): AiState {
  return { level, hold: { mx: 0, mz: 0, attack: false, guard: false, special: false }, wait: 0, strafe: 1, backoff: 0, route: -1, flyT: 0 };
}

export function aiInput(w: World, i: 0 | 1, ai: AiState): Input {
  const rng = w.rng;
  // 押した瞬間だけ有効な入力は毎 tick 消す
  const out: Input = { ...ai.hold, attack: false, special: false, shove: false, dodge: false };
  if (ai.backoff > 0) ai.backoff--;
  if (ai.wait > 0) { ai.wait--; return out; }
  const me = w.fighters[i];
  // 反応の間（グニャグニャ中は鈍る）
  ai.wait = ai.level.wait[0] + Math.floor(rng.next() * ai.level.wait[1]) + (me.wobble > 0 || me.dizzy > 0 ? 2 + Math.floor(rng.next() * 3) : 0);

  const op = w.fighters[1 - i];
  const base = PERSONAS[me.cfg.personality ?? "aggressive"];
  const D = ai.level.defend;
  const P = D === 1 ? base : { ...base, guard: Math.min(1, base.guard * D), react: Math.min(1, base.react * D), dodge: Math.min(1, base.dodge * D) };
  const dx = op.x - me.x, dz = op.z - me.z;
  const dist = Math.hypot(dx, dz) || 1;
  const ux = dx / dist, uz = dz / dist;
  const reach = meleeRange(me.cfg, op.cfg);

  // 見えている敵の弾で、自分に向かってくるもの（見えない弾には反応できない）
  const threat = w.projectiles.find((p) => {
    if (p.owner === i || !p.spec.visible || p.emitter !== undefined) return false;
    const rx = me.x - p.x, rz = me.z - p.z;
    const d = Math.hypot(rx, rz);
    if (p.spec.meteor) return p.age >= 40 && Math.hypot(me.x - p.tx, me.z - p.tz) < p.spec.size + 1.5;
    return d < 4 + p.spec.size && rx * p.dx + rz * p.dz > 0;
  });
  const opWinding = op.attack === "windup" && dist < meleeRange(op.cfg, me.cfg) + 0.6;
  const ready = me.charge >= me.st.chargeNeed;
  const melee = me.cfg.specialType === "melee";
  const mReach = meleeSpecialRange(me.cfg, me.mspec, op.cfg);
  // 相手が近接必殺を構えている / 撃てる状態で近い → 下がるか守る
  const opMeleeThreat = op.cfg.specialType === "melee" && (op.ms.phase === "windup" || (op.charge >= op.st.chargeNeed && dist < meleeSpecialRange(op.cfg, op.mspec, me.cfg) + 0.5));

  let mx = 0, mz = 0, guard = false, attack = false, special = false, shove = false, dodge = false;
  const canDodge = me.stamina >= me.st.dodgeCost + 10;

  if (canDodge && rng.next() < P.feint) {
    // トリッキー: 意味もなく横へ跳ぶ
    mx = -uz * ai.strafe; mz = ux * ai.strafe;
    dodge = true;
  } else if (threat && rng.next() < P.react) {
    if (canDodge && rng.next() < P.dodge) {
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
  } else if (opWinding && rng.next() < P.guard) {
    guard = me.stamina > 10;
  } else if (opMeleeThreat && rng.next() < Math.min(1, 0.4 * D)) {
    if (op.ms.phase === "windup" && canDodge && rng.next() < 0.5) dodge = true; // 後ろへ回避
    else if (rng.next() < 0.5) guard = me.stamina > 10;
    else { mx = -ux; mz = -uz; }
  } else if (op.guarding && dist < reach + 0.3 && me.shoveCd === 0 && rng.next() < P.shove) {
    shove = true; // 守りを固める相手は突き飛ばして崩す
  } else if (ready && melee) {
    // 近接型: 届く距離まで寄ってから撃つ（突進や地面たたきは少し遠めでも撃つ）
    // つかみ投げは体が触れる距離まで寄ってから（構えの間に逃げられないよう少し手前で）。防御で固める相手には特に狙う
    const grab = me.mspec.grab && me.mspec.dash === 0;
    const want = grab ? grabRange(me.cfg, op.cfg) - 0.25 : me.mspec.dash > 0 ? mReach + 3 : me.mspec.slam ? 4 : mReach;
    if (dist <= want && rng.next() < (grab && op.guarding ? 0.95 : 0.7)) special = true;
    else { mx = ux; mz = uz; }
  } else if (ready && dist < P.keep - 0.5 && P.keep > 3) {
    // 狙撃: 撃つ前に距離を取る
    mx = -ux; mz = -uz;
  } else if (ready && (dist > 2.5 ? rng.next() < 0.6 : rng.next() < 0.2)) {
    special = true;
  } else if (ai.backoff > 0) {
    // 攻撃の後は少し下がって横に回る（張り付かない）
    if (rng.next() < P.strafeFlip * 1.5) ai.strafe = -ai.strafe;
    const away = dist < reach + 1.5 + (P.keep > 3 ? 1.5 : 0) ? -0.8 : 0.1;
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
    if (me.stamina >= attackCostOf(me.cfg) && rng.next() < P.attack) {
      attack = true;
      if (rng.next() < P.backoff) ai.backoff = P.backoffTicks[0] + Math.floor(rng.next() * P.backoffTicks[1]);
    } else if (me.stamina < attackCostOf(me.cfg)) ai.backoff = 20 + Math.floor(rng.next() * 20); // 息切れしたら下がる
    if (rng.next() < P.strafeFlip) ai.strafe = -ai.strafe;
    mx = -uz * 0.5 * ai.strafe; mz = ux * 0.5 * ai.strafe;
    // 手が長いなら、相手の手が届かない間合いを保つ
    const opReach = meleeRange(op.cfg, me.cfg);
    if (reach > opReach + 0.3 && dist < opReach + 0.2) { mx -= ux * 0.8; mz -= uz * 0.8; }
  }
  // --- 高さ: 高い所の 相手へは 坂・はしご（道しるべ）で 向かう。羽があれば 飛ぶ ---
  const A = w.arena;
  const myG = groundAt(A, me.x, me.z), opG = groundAt(A, op.x, op.z);
  const opHigh = opG > me.y + STEP + 0.1; // 相手の 立っている所が 高い
  const opFly = airborne(w, op) && op.y > me.y + 1.1; // 相手が 上を 飛んでいる
  const canFly = !!me.cfg.hasWings && !me.tired && me.net === 0;
  let fly = false;
  if (ai.flyT > 0) ai.flyT--;
  if (canFly) {
    // 飛ぶ: 上の相手を 追う・弾を よける。スタミナが 少なくなったら 降りる
    if ((opHigh || opFly) && me.stamina > 45) ai.flyT = Math.max(ai.flyT, 25);
    if (threat && !dodge && me.stamina > 40 && rng.next() < 0.25) ai.flyT = Math.max(ai.flyT, 15);
    if ((opWinding || opMeleeThreat) && me.stamina > 40 && rng.next() < 0.3) ai.flyT = Math.max(ai.flyT, 12); // 殴られそう → 上へ にげる
    if (ready && !melee && me.stamina > 55 && rng.next() < 0.15) ai.flyT = Math.max(ai.flyT, 20); // 空から 撃つ
    if (me.stamina < 30) ai.flyT = 0;
    fly = ai.flyT > 0 && me.y < Math.max(op.y + 0.6, myG + 1.2);
    if (ai.flyT === 0 && me.y > myG + 0.3 && !opFly && me.stamina > 15) fly = false; // すべり降りる
  }
  const moving = !dodge && !special && !(threat && (mx !== 0 || mz !== 0));
  if (A && opHigh && !(canFly && ai.flyT > 0) && moving) {
    // 道しるべ: 今の高さから 行けて、相手の高さに いちばん近い所へ 上がれるもの
    if (ai.route >= 0) {
      const p = A.paths[ai.route];
      if (!p || me.y >= p.h - 0.1 || Math.abs(groundAt(A, p.foot[0], p.foot[1]) - myG) > p.h) ai.route = -1;
    }
    if (ai.route < 0) {
      let best = Infinity;
      A.paths.forEach((p, k) => {
        if (p.h <= me.y + 0.3 || Math.abs(groundAt(A, p.foot[0], p.foot[1]) - me.y) > STEP + 0.15) return;
        const cost = Math.hypot(p.foot[0] - me.x, p.foot[1] - me.z) + Math.hypot(p.top[0] - op.x, p.top[1] - op.z) + Math.abs(p.h - opG) * 3;
        if (cost < best) { best = cost; ai.route = k; }
      });
    }
    if (ai.route >= 0) {
      const p = A.paths[ai.route];
      const atFoot = Math.hypot(p.foot[0] - me.x, p.foot[1] - me.z) < 0.6 || myG > groundAt(A, p.foot[0], p.foot[1]) + 0.1;
      const [tx, tz] = atFoot ? p.top : p.foot;
      const l = Math.hypot(tx - me.x, tz - me.z) || 1;
      mx = (tx - me.x) / l; mz = (tz - me.z) / l;
      guard = false;
    }
  } else ai.route = -1;
  // 上を 飛んでいる 相手に 手が届かない: 撃てるなら 撃つ。だめなら 真下で 待つ（降りてきたら 殴る）
  if (opFly && !(canFly && ai.flyT > 0) && moving) {
    if (ready && !melee && rng.next() < 0.5) special = true;
    attack = false;
  }
  ai.hold = { mx, mz, attack: false, guard, special: false, fly };
  return { mx, mz, attack, guard, special, shove, dodge, fly };
}
