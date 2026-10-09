// 戦闘シミュレーション（DOM・描画非依存）。30Hz 固定ステップ、乱数はシード固定。
// 空間は地面の平面(x, z)＋高さ h。数値はすべて調整前提の仮値。
import { Rng } from "./rng";
import { composeSpecial, type EffectId, type ProjSpec } from "./special";

export const TICK_HZ = 30;
export const DT = 1 / TICK_HZ;
export const ARENA_RADIUS = 9;
export const BODY_RADIUS = 0.6;
export const BODY_HEIGHT = 1.8;
export const MATCH_TICKS = 90 * TICK_HZ;
export const MAX_PROJECTILES = 128; // エンジン保護（ゲーム上の制限ではない）

const MAX_HP = 100;
const MAX_STAMINA = 100;
const STAMINA_REGEN = 0.45;
const REGEN_DELAY = 15; // 攻撃後しばらくスタミナが回復しない（連打防止）
const GUARD_DRAIN = 0.5;
const GUARD_CUT = 0.7; // 防御中は 7 割カット
const ATTACK_COST = 28;
// ノックバック: 初速（単位/秒）を tick ごとに減衰させる。のけぞり中は行動不能。
const KNOCK_DECAY = 0.82;
const MELEE_KNOCK = 7, TACKLE_KNOCK = 9;
const MELEE_STUN = 9, GUARD_STUN = 4, SPECIAL_STUN = 12;
const HITSTOP_LIGHT = 2, HITSTOP_HEAVY = 4;
const MOVE_SPEED = 4;
const SPECIAL_COOLDOWN = 8 * TICK_HZ;
const ACTIVE = 4;
const PUNCH_DAMAGE = 4;
const TACKLE_DAMAGE = 5;

export interface FighterConfig {
  name: string;
  reach: number; // 手の届く距離（単位）
  hasHands: boolean;
  hasFeet: boolean;
  special: EffectId[];
}

export interface Input {
  mx: number; // 画面右が +
  mz: number; // 画面手前が +
  attack: boolean; // 押した瞬間
  guard: boolean; // 押している間
  special: boolean; // 押した瞬間
}

export const NO_INPUT: Input = { mx: 0, mz: 0, attack: false, guard: false, special: false };

export type AttackPhase = "none" | "windup" | "active" | "recover";

export interface Fighter {
  cfg: FighterConfig;
  spec: ProjSpec;
  x: number; z: number;
  vx: number; vz: number;
  fx: number; fz: number; // 向き（相手方向の単位ベクトル）
  hp: number;
  stamina: number;
  guarding: boolean;
  guardBroken: number; // スタミナ切れで防御できない残り tick
  attack: AttackPhase;
  attackT: number;
  attackHit: boolean;
  specialCd: number;
  rooted: number;
  hitFlash: number;
  moving: boolean;
  kx: number; kz: number; // ノックバック速度
  stun: number; // のけぞり（行動不能）
  guardStun: boolean; // 防御で受けたのけぞり（防御は続けられる）
  regenDelay: number;
}

export interface Projectile {
  id: number;
  owner: number;
  spec: ProjSpec;
  x: number; z: number; h: number;
  dx: number; dz: number;
  age: number;
  hitsLeft: number;
  rehit: number;
  // 打ち上げ→落下用
  tx: number; tz: number; sx: number; sz: number;
}

export interface World {
  tick: number;
  rng: Rng;
  fighters: [Fighter, Fighter];
  projectiles: Projectile[];
  nextId: number;
  winner: -1 | 0 | 1 | 2; // -1=試合中, 0/1=勝者, 2=引き分け
  hitstop: number; // ヒットストップ（全体が止まる tick）
  events: BattleEvent[];
}

export interface BattleEvent {
  kind: "hit" | "guard" | "shoot" | "land" | "ko";
  x: number; z: number; h: number;
  amount: number;
  src: "melee" | "special";
  target: number; // 受けた側（shoot は撃った側）
  dx: number; dz: number; // 吹き飛ぶ向き
  size: number; // 弾の大きさ（melee は 0）
}

function makeFighter(cfg: FighterConfig, x: number): Fighter {
  return {
    cfg, spec: composeSpecial(cfg.special),
    x, z: 0, vx: 0, vz: 0, fx: x < 0 ? 1 : -1, fz: 0,
    hp: MAX_HP, stamina: MAX_STAMINA, guarding: false, guardBroken: 0,
    attack: "none", attackT: 0, attackHit: false, specialCd: 2 * TICK_HZ, rooted: 0, hitFlash: 0, moving: false,
    kx: 0, kz: 0, stun: 0, guardStun: false, regenDelay: 0,
  };
}

export function createWorld(a: FighterConfig, b: FighterConfig, seed: number): World {
  return {
    tick: 0, rng: new Rng(seed),
    fighters: [makeFighter(a, -4), makeFighter(b, 4)],
    projectiles: [], nextId: 1, winner: -1, hitstop: 0, events: [],
  };
}

// 通常攻撃が届く中心間距離（自分の体＋手の長さ＋相手の体）。手なしは体当たりの踏み込み分。
export function meleeRange(cfg: FighterConfig): number {
  return BODY_RADIUS * 2 + (cfg.hasHands ? cfg.reach : 0.35);
}

// 手が長いほど振りかぶりと戻りが遅い（リーチと隙の引き換え）
function windupTicks(cfg: FighterConfig) { return cfg.hasHands ? 3 + Math.round(cfg.reach * 3) : 5; }
function recoverTicks(cfg: FighterConfig) { return cfg.hasHands ? 6 + Math.round(cfg.reach * 3) : 9; }

export const maxHp = MAX_HP;
export const maxStamina = MAX_STAMINA;
export const specialCooldown = SPECIAL_COOLDOWN;

interface Hit {
  amount: number;
  src: "melee" | "special";
  dx: number; dz: number; // 吹き飛ばす向き（単位ベクトル）
  knock: number;
  stun: number;
  x: number; z: number; h: number;
  size: number;
}

function damage(w: World, ti: number, hit: Hit) {
  const target = w.fighters[ti];
  const guarded = target.guarding;
  const dmg = hit.amount * (guarded ? 1 - GUARD_CUT : 1);
  const wasAlive = target.hp > 0;
  target.hp = Math.max(0, target.hp - dmg);
  target.hitFlash = 6;
  const k = hit.knock * (guarded ? 0.3 : 1);
  target.kx += hit.dx * k; target.kz += hit.dz * k;
  target.stun = Math.max(target.stun, guarded ? GUARD_STUN : hit.stun);
  target.guardStun = guarded;
  if (!guarded && target.attack !== "none") { target.attack = "none"; target.attackT = 0; } // 殴られたら攻撃は潰れる
  w.hitstop = Math.max(w.hitstop, hit.src === "special" || dmg >= 8 ? HITSTOP_HEAVY : HITSTOP_LIGHT);
  w.events.push({ kind: guarded ? "guard" : "hit", x: hit.x, z: hit.z, h: hit.h, amount: dmg, src: hit.src, target: ti, dx: hit.dx, dz: hit.dz, size: hit.size });
  if (wasAlive && target.hp <= 0) {
    w.hitstop = 10;
    w.events.push({ kind: "ko", x: target.x, z: target.z, h: 1, amount: 0, src: hit.src, target: ti, dx: hit.dx, dz: hit.dz, size: 0 });
  }
}

// 同じ tick の通常攻撃は両者の行動処理が終わってから同時に当てる（同時に殴ったら相打ち）
let pendingMelee: [number, Hit][] = [];

function stepFighter(w: World, i: 0 | 1, inp: Input) {
  const me = w.fighters[i];
  const op = w.fighters[1 - i];
  const ddx = op.x - me.x, ddz = op.z - me.z;
  const dist = Math.hypot(ddx, ddz) || 1;
  me.fx = ddx / dist; me.fz = ddz / dist;

  if (me.hitFlash > 0) me.hitFlash--;
  if (me.guardBroken > 0) me.guardBroken--;
  if (me.specialCd > 0) me.specialCd--;
  if (me.regenDelay > 0) me.regenDelay--;
  const stunned = me.stun > 0;
  if (stunned) me.stun--;
  const rooted = me.rooted > 0 || stunned;
  if (me.rooted > 0) me.rooted--;

  // 防御
  me.guarding = me.rooted === 0 && (!stunned || me.guardStun) && inp.guard && me.guardBroken === 0 && me.attack === "none";
  if (me.guarding) {
    me.stamina -= GUARD_DRAIN;
    if (me.stamina <= 0) { me.stamina = 0; me.guarding = false; me.guardBroken = TICK_HZ; }
  } else if (me.regenDelay === 0 && me.attack === "none") {
    me.stamina = Math.min(MAX_STAMINA, me.stamina + STAMINA_REGEN);
  }

  // 移動
  let mx = inp.mx, mz = inp.mz;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }
  let speed = MOVE_SPEED * (me.guarding ? 0.5 : 1);
  if (rooted || me.attack === "active" || me.attack === "windup") speed *= rooted ? 0 : 0.3;
  const tvx = mx * speed, tvz = mz * speed;
  if (me.cfg.hasFeet) { me.vx = tvx; me.vz = tvz; }
  else { me.vx += (tvx - me.vx) * 0.08; me.vz += (tvz - me.vz) * 0.08; } // 足なし: 滑る
  me.moving = Math.hypot(me.vx, me.vz) > 0.3;

  // 通常攻撃（手を振る / 手なしは体当たり）
  if (inp.attack && !rooted && me.attack === "none" && me.stamina >= ATTACK_COST) {
    me.attack = "windup"; me.attackT = 0; me.attackHit = false; me.stamina -= ATTACK_COST; me.regenDelay = REGEN_DELAY;
  }
  if (me.attack !== "none") {
    me.attackT++;
    if (me.attack === "windup" && me.attackT >= windupTicks(me.cfg)) { me.attack = "active"; me.attackT = 0; }
    else if (me.attack === "active" && me.attackT >= ACTIVE) { me.attack = "recover"; me.attackT = 0; }
    else if (me.attack === "recover" && me.attackT >= recoverTicks(me.cfg)) { me.attack = "none"; me.attackT = 0; }
  }
  if (me.attack === "active") {
    if (!me.cfg.hasHands) { me.vx = me.fx * 6; me.vz = me.fz * 6; }
    const reach = meleeRange(me.cfg);
    if (!me.attackHit && dist <= reach) {
      me.attackHit = true;
      pendingMelee.push([1 - i, {
        amount: me.cfg.hasHands ? PUNCH_DAMAGE : TACKLE_DAMAGE, src: "melee",
        dx: me.fx, dz: me.fz, knock: me.cfg.hasHands ? MELEE_KNOCK : TACKLE_KNOCK, stun: MELEE_STUN,
        x: (me.x + op.x) / 2, z: (me.z + op.z) / 2, h: 1.0, size: 0,
      }]);
    }
  }

  // 必殺技
  if (inp.special && !rooted && me.specialCd === 0 && w.projectiles.length < MAX_PROJECTILES) {
    me.specialCd = SPECIAL_COOLDOWN;
    const s = me.spec;
    w.projectiles.push({
      id: w.nextId++, owner: i, spec: s,
      x: me.x + me.fx * 0.8, z: me.z + me.fz * 0.8, h: 1.0,
      dx: me.fx, dz: me.fz, age: 0, hitsLeft: s.hits, rehit: 0,
      tx: op.x, tz: op.z, sx: me.x, sz: me.z,
    });
    w.events.push({ kind: "shoot", x: me.x, z: me.z, h: 1, amount: 0, src: "special", target: i, dx: me.fx, dz: me.fz, size: s.size });
  }
}

function stepProjectile(w: World, p: Projectile): boolean {
  const s = p.spec;
  const target = w.fighters[1 - p.owner];
  p.age++;
  if (p.rehit > 0) p.rehit--;

  if (s.meteor) {
    // 0〜30tick: 上昇 / 30〜45: 滞空 / 45で狙い確定 / 以降: 落下
    const RISE = 30, HOVER = 15, FALL = Math.max(8, Math.round(24 * 9 / Math.max(1, s.speed)));
    if (p.age <= RISE) {
      p.h = 1 + (p.age / RISE) * 7;
    } else if (p.age <= RISE + HOVER) {
      if (p.age === RISE + HOVER) { p.tx = target.x; p.tz = target.z; p.sx = p.x; p.sz = p.z; }
    } else {
      const t = Math.min(1, (p.age - RISE - HOVER) / FALL);
      p.x = p.sx + (p.tx - p.sx) * t;
      p.z = p.sz + (p.tz - p.sz) * t;
      p.h = 8 * (1 - t);
      if (t >= 1 && p.age === RISE + HOVER + FALL) {
        w.events.push({ kind: "land", x: p.x, z: p.z, h: 0, amount: 0, src: "special", target: p.owner, dx: 0, dz: 0, size: s.size });
      }
      if (t >= 1 && p.hitsLeft === s.hits) return false; // 外れたら着地で消える
    }
  }
  if (!s.meteor || p.age > 30 + 15) {
    if (s.homing > 0) {
      const want = Math.atan2(target.z - p.z, target.x - p.x);
      const cur = Math.atan2(p.dz, p.dx);
      let diff = want - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const turn = Math.max(-s.homing * DT, Math.min(s.homing * DT, diff));
      p.dx = Math.cos(cur + turn); p.dz = Math.sin(cur + turn);
    }
    if (!s.meteor) {
      const side = Math.sin(p.age * 0.25) * s.wobble * DT;
      p.x += p.dx * s.speed * DT - p.dz * side;
      p.z += p.dz * s.speed * DT + p.dx * side;
    }
  }

  // 当たり判定（地面の円＋高さ）
  const near = Math.hypot(target.x - p.x, target.z - p.z) <= s.size + BODY_RADIUS;
  if (near && p.h - s.size <= BODY_HEIGHT && p.h + s.size >= 0 && p.rehit === 0) {
    // 吹き飛ぶ向き: 落下弾は着弾点から外向き、それ以外は弾の進行方向
    let kdx = p.dx, kdz = p.dz;
    if (s.meteor) {
      const ox = target.x - p.x, oz = target.z - p.z, ol = Math.hypot(ox, oz);
      if (ol > 0.01) { kdx = ox / ol; kdz = oz / ol; }
    }
    const restrain = s.restrainTicks > 0 && !target.guarding;
    damage(w, 1 - p.owner, {
      amount: s.damage, src: "special", dx: kdx, dz: kdz,
      knock: restrain ? 0 : 4 + s.damage * 0.35 + s.size * 2, stun: SPECIAL_STUN,
      x: p.x, z: p.z, h: p.h, size: s.size,
    });
    if (restrain) target.rooted = Math.max(target.rooted, s.restrainTicks);
    p.hitsLeft--;
    p.rehit = s.hitInterval;
    if (p.hitsLeft <= 0) return false;
  }
  if (p.age > s.lifetime + (s.meteor ? 45 : 0)) return false;
  if (Math.hypot(p.x, p.z) > ARENA_RADIUS + 4) return false;
  if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isFinite(p.h)) return false;
  return true;
}

export function step(w: World, inputs: [Input, Input]) {
  if (w.winner !== -1) return;
  w.events = [];
  if (w.hitstop > 0) { w.hitstop--; return; } // ヒットストップ中は全体が止まる（試合時間も進まない）
  w.tick++;
  // 処理順で先手が有利にならないよう、tick ごとに順番を入れ替える
  const first = (w.tick & 1) as 0 | 1;
  const second = (1 - first) as 0 | 1;
  pendingMelee = [];
  stepFighter(w, first, inputs[first]);
  stepFighter(w, second, inputs[second]);
  for (const [ti, hit] of pendingMelee) damage(w, ti, hit);
  for (const f of w.fighters) {
    f.x += (f.vx + f.kx) * DT; f.z += (f.vz + f.kz) * DT;
    f.kx *= KNOCK_DECAY; f.kz *= KNOCK_DECAY;
    if (Math.abs(f.kx) < 0.05) f.kx = 0;
    if (Math.abs(f.kz) < 0.05) f.kz = 0;
    const r = Math.hypot(f.x, f.z);
    const lim = ARENA_RADIUS - BODY_RADIUS;
    if (r > lim) { f.x *= lim / r; f.z *= lim / r; }
  }
  // 体同士の押し合い
  const [a, b] = w.fighters;
  const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
  if (d > 0 && d < BODY_RADIUS * 2) {
    const push = (BODY_RADIUS * 2 - d) / 2;
    a.x -= (dx / d) * push; a.z -= (dz / d) * push;
    b.x += (dx / d) * push; b.z += (dz / d) * push;
  }
  w.projectiles = w.projectiles.filter((p) => stepProjectile(w, p));

  const [ha, hb] = [a.hp, b.hp];
  if (ha <= 0 || hb <= 0) w.winner = ha <= 0 && hb <= 0 ? 2 : ha <= 0 ? 1 : 0;
  else if (w.tick >= MATCH_TICKS) w.winner = ha === hb ? 2 : ha > hb ? 0 : 1;
}

// 状態の要約（決定性の確認用）
export function hashWorld(w: World): string {
  const r = (v: number) => Math.round(v * 1000);
  return JSON.stringify([
    w.tick, w.winner, w.rng.state(),
    w.fighters.map((f) => [r(f.x), r(f.z), r(f.hp), r(f.stamina), f.attack, f.rooted, f.stun]),
    w.projectiles.map((p) => [p.id, r(p.x), r(p.z), r(p.h), p.hitsLeft]),
  ]);
}
