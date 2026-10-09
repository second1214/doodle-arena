// 戦闘シミュレーション（DOM・描画非依存）。30Hz 固定ステップ、乱数はシード固定。
// 空間は地面の平面(x, z)＋高さ h。数値はすべて調整前提の仮値。
import { Rng } from "./rng";
import { composeSpecial, type EffectId, type ProjSpec } from "./special";
import { DEFAULT_TRAITS, type Hurt, type Traits } from "../shape";
import { composeMelee, type MeleeEffectId, type MeleeSpec } from "./melee";
import { BASE_CHARGE_NEED, BASE_DODGE_COST, statEffects, type Boost, type StatEffects } from "./stats";

export const TICK_HZ = 30;
export const DT = 1 / TICK_HZ;
export const ARENA_RADIUS = 9;
export const BODY_RADIUS = 0.6;
export const BODY_HEIGHT = 1.8;
export const MATCH_TICKS = 120 * TICK_HZ;
export const MAX_PROJECTILES = 128; // エンジン保護（ゲーム上の制限ではない）

// テンポ: 人が見てから反応できるよう、動作の長さを 1.6 倍・移動や弾を 0.75 倍にしている（ゆったりバトル）。
// CPU の反応の間（ai.ts）は据え置き。値は CPU 同士の対戦実験で決めた（docs/SPEC.md §17）。
const PACE = 1.6;
const slow = (ticks: number) => Math.max(1, Math.round(ticks * PACE));
const PROJ_PACE = 0.75; // 必殺の弾の速さ
const WINDUP_PACE = 1.25; // 通常攻撃の構えはさらに長く（見てから防げる 0.27 秒前後）

const MAX_HP = 100;
const MAX_STAMINA = 100;
const STAMINA_REGEN = 0.315; // 行動が遅くなった分、回復も遅くして攻撃回数の釣り合いを保つ
const REGEN_DELAY = slow(15); // 攻撃後しばらくスタミナが回復しない（連打防止）
const GUARD_DRAIN = 0.3;
const ATTACK_COST = 28;
// ノックバック: 初速（単位/秒）を tick ごとに減衰させる。のけぞり中は行動不能。
const KNOCK_DECAY = 0.85; // ゆっくり滑る（距離はほぼ同じ）
const MELEE_KNOCK = 7 * 0.85, TACKLE_KNOCK = 9 * 0.85;
const MELEE_STUN = slow(9), GUARD_STUN = slow(4), SPECIAL_STUN = slow(12);
const HITSTOP_LIGHT = 2, HITSTOP_HEAVY = 4;
const GUARD_HEAL = 0.3; // 防御成功: 防いだ分の3割を回復（1回最大2）
const GUARD_HEAL_MAX = 2;
// 突き飛ばし: スタミナを使わない。ダメージなし。防御の上からでも押し、少しの間防御できなくする
const SHOVE_WINDUP = slow(3), SHOVE_ACTIVE = slow(2), SHOVE_RECOVER = slow(9), SHOVE_COOLDOWN = slow(30), SHOVE_KNOCK = 11 * 0.85;
// 回避: 入力方向へ素早く移動し、その間は当たらない。方向が無ければ後ろへ
const DODGE_TICKS = slow(8), DODGE_RECOVER = slow(5), DODGE_SPEED = 13 * 0.75;
const MOVE_SPEED = 3;
// 必殺に必要な命中数（標準5・防御された攻撃も数える）、防御で減らす割合（標準7割）、回避のスタミナ（標準22）、
// 防御成功で防いだ側に溜まるゲージ（標準0.5・攻撃1回につき1度）は、強化で変わるのでキャラごとの st に持つ（stats.ts）
const SHOOT_SLOW = 15; // 必殺技を撃った直後に足が遅くなる tick
const RETREAT_SPEED = 0.75; // 相手から離れる方向へ歩くときの速度倍率（逃げ撃ち対策）
const PROJ_ARM = 3; // 必殺技の弾が出てから当たり始めるまでの tick（密着必中の防止）
const ACTIVE = slow(4);
const PUNCH_DAMAGE = 5;
const TACKLE_DAMAGE = 5;

export interface FighterConfig {
  name: string;
  reach: number; // 手の届く距離（単位）
  hasHands: boolean;
  hasFeet: boolean;
  special: EffectId[];
  specialType?: "ranged" | "melee"; // 必殺技の型（既定は遠距離）
  melee?: MeleeEffectId[]; // 近接型の効果
  traits?: Traits; // 絵の形による性能（無ければ標準）
  boost?: Partial<Boost>; // スキルツリーの強化（無ければ標準）
  specialMod?: Partial<SpecialMod>; // 必殺パーツの数値（無ければ標準）
  hurt?: Hurt; // 描いた部分だけの当たり判定（無ければ体の円）
  personality?: Personality; // CPU が動かすときの性格
}

export type Personality = "aggressive" | "cautious" | "sniper" | "tricky";

const tr = (c: FighterConfig) => c.traits ?? DEFAULT_TRAITS;
const rad = (c: FighterConfig) => BODY_RADIUS * tr(c).radius;
export const bodyRadius = rad;

const HURT_DEPTH = 0.35; // 膨らませた体の厚みの半分（目安）

// 世界の点 (wx, wh=高さ, wz) から半径 r の範囲に、f の「描いた部分」があるか。空白は素通り。
export function hurtHit(f: Fighter, wx: number, wh: number, wz: number, r: number): boolean {
  const H = f.cfg.hurt;
  if (!H) return Math.hypot(wx - f.x, wz - f.z) <= r + rad(f.cfg) && wh <= BODY_HEIGHT + r && wh >= -r;
  if (Math.abs(wz - f.z) > HURT_DEPTH + r) return false;
  const facing = f.fx >= 0 ? 1 : -1; // 左を向くと絵は左右反転（見た目と同じ）
  const u = (wx - f.x) * facing;
  const gx = u / H.cs + H.ox, gy = H.gh - wh / H.cs;
  const cx = Math.max(0, Math.min(H.gw - 1, Math.floor(gx)));
  const cy = Math.max(0, Math.min(H.gh - 1, Math.floor(gy)));
  const outside = Math.hypot(gx < 0 ? -gx : gx > H.gw ? gx - H.gw : 0, gy < 0 ? -gy : gy > H.gh ? gy - H.gh : 0);
  // 見た目は線を少し太らせて膨らませているので、その分（約 0.06）を足す
  return (H.dist[cy * H.gw + cx] + outside) * H.cs <= r + H.cs * 0.5 + 0.06;
}

export interface Input {
  mx: number; // 画面右が +
  mz: number; // 画面手前が +
  attack: boolean; // 押した瞬間
  guard: boolean; // 押している間
  special: boolean; // 押した瞬間
  shove?: boolean; // 突き飛ばし（押した瞬間・スタミナ消費なし）
  dodge?: boolean; // 回避（押した瞬間・スタミナ消費）
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
  charge: number; // 必殺技ゲージ（通常攻撃の命中数＋防御成功×0.5）
  specialSeq: number; // 必殺技を出した回数（防御でゲージを溜めるのを1回の必殺につき1度にする）
  guardedSeq: number; // 最後にゲージを溜めた相手の必殺の番号
  shootSlow: number;
  rooted: number;
  hitFlash: number;
  moving: boolean;
  kx: number; kz: number; // ノックバック速度
  stun: number; // のけぞり（行動不能）
  guardStun: boolean; // 防御で受けたのけぞり（防御は続けられる）
  regenDelay: number;
  preSpeed: number; // 攻撃を始める直前の速さ（転がりの勢い）
  swingHits: number; // この攻撃で当てた回数（手が多いと複数回）
  mspec: MeleeSpec;
  ms: MeleeState; // 近接必殺の進行
  wobble: number; // グニャグニャ＋あべこべ（残り tick）
  dizzy: number; // 竜巻の後に自分が目を回す（グニャグニャのみ）
  legbind: number; // 足封じ
  crumple: number; // 紙くしゃくしゃ（操作不能で転がる）
  feetNow: boolean; // 今この瞬間に足が使えるか（足封じで反転する）
  shoveT: number; // 突き飛ばしの残り tick（0 で無し）
  shoveCd: number;
  dodgeT: number; // 回避の残り tick（この間は無敵）
  dodgeRec: number; // 回避後の硬直
  dodgeX: number; dodgeZ: number;
  st: StatEffects; // 能力値から決まる倍率
  maxHp: number;
  maxStamina: number;
 
  ice: number; // 足元が凍って滑る（残り tick）
  big: number; // でっかくなる（残り tick）
}

export interface MeleeState {
  phase: AttackPhase;
  t: number;
  hitsDone: number;
  rehit: number;
  spin: number; // 竜巻の回転角
  dashLeft: number;
  dirX: number; dirZ: number;
  grabbed: boolean;
  slamR: number; // 地面たたきの輪の半径（0 で無し）
  slamHit: boolean;
  extraRecover: number;
  mult: number; // この1回の威力倍率（会心・カウンター）
  pulled: boolean; // じしゃくの手を使ったか
  pushHit: boolean; // ブルドーザーで壁に挟んだか
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
  mult: number; // 会心などの威力倍率
  bouncesLeft: number;
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
  spawn: Projectile[]; // この tick に生まれた弾（分裂）。弾の処理の後で足す
}

export interface BattleEvent {
  kind: "hit" | "guard" | "shoot" | "land" | "ko" | "ready" | "recoil" | "mstart" | "mactive" | "grab" | "whiff" | "slam" | "status" | "shove" | "dodge" | "evade";
  x: number; z: number; h: number;
  amount: number;
  src: "melee" | "special";
  target: number; // 受けた側（shoot は撃った側）
  dx: number; dz: number; // 吹き飛ぶ向き
  size: number; // 弾の大きさ（melee は 0）
  pid?: number; // 弾の id（必殺技のみ）
  tags?: (EffectId | MeleeEffectId)[]; // 必殺技の効果（見た目用）
  restrained?: boolean;
  status?: "wobble" | "legbind" | "crumple";
  heal?: number; // 防御成功で回復した量
  gap?: boolean; // 空白を素通りした（描いていない所に当たった）
}

const idleMelee = (): MeleeState => ({ phase: "none", t: 0, hitsDone: 0, rehit: 0, spin: 0, dashLeft: 0, dirX: 1, dirZ: 0, grabbed: false, slamR: 0, slamHit: false, extraRecover: 0, mult: 1, pulled: false, pushHit: false });

// 必殺パーツの数値: 威力の倍率・弾の速さの倍率・状態異常の時間の倍率・構えを縮める tick（いずれも標準 1 / 0）
// size=大きさの倍率 / crit=会心の確率 / carry=撃った後に残るゲージ / pierce=防御を貫く割合
export interface SpecialMod { power: number; speed: number; duration: number; windup: number; size?: number; crit?: number; carry?: number; pierce?: number }
function modProj(s: ProjSpec, m: Partial<SpecialMod> = {}): ProjSpec {
  const d = m.duration ?? 1;
  return { ...s, damage: s.damage * Math.max(0.05, m.power ?? 1), speed: s.speed * Math.max(0.05, m.speed ?? 1), restrainTicks: Math.round(s.restrainTicks * d),
    size: s.size * Math.max(0.05, m.size ?? 1), freezeTicks: Math.round(s.freezeTicks * d) }; // size/freeze
}
function modMelee(s: MeleeSpec, m: Partial<SpecialMod> = {}): MeleeSpec {
  const d = m.duration ?? 1;
  return {
    ...s, damage: s.damage * Math.max(0.05, m.power ?? 1), windup: Math.max(1, s.windup - Math.round(m.windup ?? 0)),
    wobbleTicks: Math.round(s.wobbleTicks * d), legbindTicks: Math.round(s.legbindTicks * d), crumpleTicks: Math.round(s.crumpleTicks * d),
    range: s.range * (1 + ((m.size ?? 1) - 1) * 0.6), freezeTicks: Math.round(s.freezeTicks * d), bigTicks: Math.round(s.bigTicks * d),
  };
}
function paceProj(s: ProjSpec): ProjSpec { return { ...s, speed: s.speed * PROJ_PACE }; }
function paceMelee(s: MeleeSpec): MeleeSpec { return { ...s, windup: slow(s.windup), active: slow(s.active), recover: slow(s.recover) }; }

function makeFighter(cfg: FighterConfig, x: number): Fighter {
  const st = statEffects(cfg.boost);
  return {
    st, maxHp: st.maxHp, maxStamina: st.maxStamina,
    cfg, spec: paceProj(modProj(composeSpecial(cfg.special), cfg.specialMod)),
    x, z: 0, vx: 0, vz: 0, fx: x < 0 ? 1 : -1, fz: 0,
    hp: st.maxHp, stamina: st.maxStamina, guarding: false, guardBroken: 0,
    attack: "none", attackT: 0, attackHit: false, charge: 0, specialSeq: 0, guardedSeq: 0, shootSlow: 0, rooted: 0, hitFlash: 0, moving: false,
    kx: 0, kz: 0, stun: 0, guardStun: false, regenDelay: 0, preSpeed: 0, swingHits: 0,
    mspec: paceMelee(modMelee(composeMelee(cfg.melee ?? []), cfg.specialMod)), ms: idleMelee(),
    wobble: 0, dizzy: 0, legbind: 0, crumple: 0, feetNow: cfg.hasFeet,
    shoveT: 0, shoveCd: 0, dodgeT: 0, dodgeRec: 0, dodgeX: 0, dodgeZ: 0,
    ice: 0, big: 0,
  };
}

export function createWorld(a: FighterConfig, b: FighterConfig, seed: number): World {
  return {
    tick: 0, rng: new Rng(seed),
    fighters: [makeFighter(a, -4), makeFighter(b, 4)],
    projectiles: [], nextId: 1, winner: -1, hitstop: 0, events: [], spawn: [],
  };
}

// 通常攻撃が届く中心間距離（自分の体＋手の長さ＋相手の体）。手なしは体当たりの踏み込み分。
export function meleeRange(cfg: FighterConfig, target?: FighterConfig): number {
  return rad(cfg) + (target ? rad(target) : BODY_RADIUS) + (cfg.hasHands ? cfg.reach : 0.35);
}

// 手が長いほど振りかぶりと戻りが遅い（リーチと隙の引き換え）
function windupTicks(cfg: FighterConfig) { return Math.round(WINDUP_PACE * slow(cfg.hasHands ? 3 + Math.round(cfg.reach * tr(cfg).windupPerReach) : 5)); }
function recoverTicks(cfg: FighterConfig) { return slow(cfg.hasHands ? 6 + Math.round(cfg.reach * tr(cfg).windupPerReach) : 9); }
// 手が多いと 1回の攻撃で 2tick おきに複数回当たる
function activeTicks(cfg: FighterConfig) { return ACTIVE + 2 * (tr(cfg).hits - 1); }
export function attackCostOf(cfg: FighterConfig) { return ATTACK_COST * tr(cfg).cost; }

export const baseMaxHp = MAX_HP;
export const baseMaxStamina = MAX_STAMINA;
export const specialCharge = BASE_CHARGE_NEED; // 標準の値（実際はキャラごとの st.chargeNeed）
export const attackCost = ATTACK_COST;
export const dodgeCost = BASE_DODGE_COST; // 標準の値（実際は st.dodgeCost）

interface Hit {
  amount: number;
  src: "melee" | "special";
  dx: number; dz: number; // 吹き飛ばす向き（単位ベクトル）
  knock: number;
  stun: number;
  x: number; z: number; h: number;
  size: number;
  pid?: number;
  tags?: (EffectId | MeleeEffectId)[];
  restrain?: number;
  firstOfSwing?: boolean; // 必殺ゲージは攻撃1回につき1だけ溜める
  ignoreGuard?: boolean; // つかみ
  wobble?: number; legbind?: number; crumple?: number; // 近接必殺の状態異常（防御で防げる）
  lifesteal?: number; freeze?: number; pierce?: number;
}

function damage(w: World, ti: number, hit: Hit) {
  const target = w.fighters[ti];
  if (target.dodgeT > 0) {
    // 回避中は当たらない
    w.events.push({ kind: "evade", x: target.x, z: target.z, h: 1.5, amount: 0, src: hit.src, target: ti, dx: 0, dz: 0, size: 0 });
    return;
  }
  // カウンター: 構え中に必殺以外で殴られたら受け流し、すぐ2倍で出す
  if (hit.src === "melee" && target.mspec.counter && target.ms.phase === "windup") {
    target.ms.phase = "active"; target.ms.t = 0; target.ms.mult *= 2; target.ms.dashLeft = target.mspec.dash;
    w.events.push({ kind: "evade", x: target.x, z: target.z, h: 1.5, amount: 0, src: "special", target: ti, dx: 0, dz: 0, size: 0, tags: ["counter"] });
    return;
  }
  const guarded = target.guarding && !hit.ignoreGuard;
  const rolling = !target.feetNow && Math.hypot(target.vx, target.vz) > MOVE_SPEED * 0.5;
  const atkF = w.fighters[1 - ti];
  const base = hit.amount * atkF.st.dealt * target.st.taken * (atkF.big > 0 ? 1.5 : 1) * (target.big > 0 ? 0.8 : 1); // 能力値（攻撃力・防御力）＋でっかくなる
  hit = { ...hit, amount: base };
  const dmg = base * (guarded ? 1 - (rolling ? tr(target.cfg).rollGuardCut : target.st.guardCut) * (1 - Math.min(1, hit.pierce ?? 0)) : 1); // pierce
  if ((hit.lifesteal ?? 0) > 0 && atkF.hp > 0) atkF.hp = Math.min(atkF.maxHp, atkF.hp + Math.min(target.hp, dmg) * hit.lifesteal!); // すいとり
  const wasAlive = target.hp > 0;
  target.hp = Math.max(0, target.hp - dmg);
  // 防御成功で少し回復（防いだ分の一部）
  const heal = guarded && target.hp > 0 ? Math.min(GUARD_HEAL_MAX, (hit.amount - dmg) * GUARD_HEAL) : 0;
  if (heal > 0) target.hp = Math.min(target.maxHp, target.hp + heal);
  target.hitFlash = 6;
  const k = hit.knock * tr(target.cfg).knockTaken * target.st.knockTaken * (guarded ? 0.3 : 1);
  target.kx += hit.dx * k; target.kz += hit.dz * k;
  target.stun = Math.max(target.stun, guarded ? GUARD_STUN : hit.stun);
  target.guardStun = guarded;
  if (!guarded && target.attack !== "none") { target.attack = "none"; target.attackT = 0; } // 殴られたら攻撃は潰れる
  if (!guarded && target.ms.phase === "windup") target.ms = idleMelee(); // 近接必殺の構え中に殴られたら潰れる
  // 近接必殺の状態異常（防御で防げる・時間は足さず長い方で上書き）
  if (!guarded) {
    const st = (kind: "wobble" | "legbind" | "crumple", ticks?: number) => {
      if (!ticks) return;
      if (kind === "crumple") {
        target.crumple = Math.max(target.crumple, ticks);
        target.vx = hit.dx * 8; target.vz = hit.dz * 8; // 紙の玉になって転がる
        target.kx = target.kz = 0;
      } else target[kind] = Math.max(target[kind], ticks);
      w.events.push({ kind: "status", x: target.x, z: target.z, h: 2, amount: ticks, src: "special", target: ti, dx: 0, dz: 0, size: 0, status: kind });
    };
    st("wobble", hit.wobble);
    st("legbind", hit.legbind);
    st("crumple", hit.crumple);
    if (hit.freeze) target.ice = Math.max(target.ice, hit.freeze); // こおり
  }
  w.hitstop = Math.max(w.hitstop, hit.src === "special" || dmg >= 8 ? HITSTOP_HEAVY : HITSTOP_LIGHT);
  const restrained = !guarded && (hit.restrain ?? 0) > 0;
  if (restrained) target.rooted = Math.max(target.rooted, hit.restrain!);
  w.events.push({ kind: guarded ? "guard" : "hit", x: hit.x, z: hit.z, h: hit.h, amount: dmg, src: hit.src, target: ti, dx: hit.dx, dz: hit.dz, size: hit.size, pid: hit.pid, tags: hit.tags, restrained, heal });
  // 通常攻撃が当たるたびに攻撃側の必殺技ゲージが溜まる（防御されても溜まる）
  const atk = w.fighters[1 - ti];
  if (hit.src === "melee" && hit.firstOfSwing) addCharge(w, 1 - ti, 1);
  // 防御に成功すると防いだ側も少し溜まる（通常攻撃は1回の攻撃につき1度、必殺は1回の必殺につき1度）
  if (guarded) {
    if (hit.src === "melee" && hit.firstOfSwing) addCharge(w, ti, target.st.guardCharge);
    else if (hit.src === "special" && target.guardedSeq !== atk.specialSeq) {
      target.guardedSeq = atk.specialSeq;
      addCharge(w, ti, target.st.guardCharge);
    }
  }
  if (wasAlive && target.hp <= 0) {
    w.hitstop = 8;
    w.events.push({ kind: "ko", x: target.x, z: target.z, h: 1, amount: 0, src: hit.src, target: ti, dx: hit.dx, dz: hit.dz, size: 0 });
  }
}

function addCharge(w: World, i: number, n: number) {
  const f = w.fighters[i];
  const need = f.st.chargeNeed;
  if (f.charge >= need || n <= 0) return;
  f.charge = Math.min(need, f.charge + n);
  if (f.charge === need) w.events.push({ kind: "ready", x: f.x, z: f.z, h: 1, amount: 0, src: "melee", target: i, dx: 0, dz: 0, size: 0 });
}

// 同じ tick の通常攻撃は両者の行動処理が終わってから同時に当てる（同時に殴ったら相打ち）
let pendingMelee: [number, Hit][] = [];

function stepFighter(w: World, i: 0 | 1, rawInp: Input) {
  const me = w.fighters[i];
  const op = w.fighters[1 - i];
  const ddx = op.x - me.x, ddz = op.z - me.z;
  const dist = Math.hypot(ddx, ddz) || 1;
  me.fx = ddx / dist; me.fz = ddz / dist;

  if (me.hitFlash > 0) me.hitFlash--;
  if (me.guardBroken > 0) me.guardBroken--;
  if (me.shootSlow > 0) me.shootSlow--;
  if (me.regenDelay > 0) me.regenDelay--;
  if (me.wobble > 0) me.wobble--;
  if (me.dizzy > 0) me.dizzy--;
  if (me.legbind > 0) me.legbind--;
  if (me.shoveCd > 0) me.shoveCd--;
  if (me.dodgeRec > 0) me.dodgeRec--;
  if (me.ice > 0) me.ice--;
  if (me.big > 0) me.big--;
  me.feetNow = me.legbind > 0 ? !me.cfg.hasFeet : me.cfg.hasFeet; // 足封じ: 足なしキャラには逆に足が生える
  const stunned = me.stun > 0;
  if (stunned) me.stun--;

  // 紙くしゃくしゃ: 操作できず玉になって転がる（壁で跳ね返る）
  if (me.crumple > 0) {
    me.crumple--;
    me.guarding = false;
    me.attack = "none";
    me.ms = idleMelee();
    me.vx *= 0.985; me.vz *= 0.985;
    const r = Math.hypot(me.x, me.z), lim = ARENA_RADIUS - rad(me.cfg) - 0.05;
    if (r >= lim) {
      const nx = me.x / r, nz = me.z / r, dot = me.vx * nx + me.vz * nz;
      if (dot > 0) { me.vx -= 2 * dot * nx; me.vz -= 2 * dot * nz; }
    }
    me.moving = true;
    return;
  }

  // グニャグニャ: 操作の向きがうねる＋あべこべ（目を回しているだけならうねりのみ）
  const inp = { ...rawInp };
  if (me.wobble > 0 || me.dizzy > 0) {
    const ang = Math.sin(w.tick * 0.15 + i * 1.7) * 0.6;
    const c = Math.cos(ang), sn = Math.sin(ang);
    let mx = inp.mx * c - inp.mz * sn, mz = inp.mx * sn + inp.mz * c;
    if (me.wobble > 0) { mx = -mx; mz = -mz; }
    inp.mx = mx; inp.mz = mz;
  }

  const rooted = me.rooted > 0 || stunned;
  if (me.rooted > 0) me.rooted--;

  // 回避中: 入力方向へ素早く移動（無敵）。他の行動はできない
  if (me.dodgeT > 0) {
    me.dodgeT--;
    const sp = DODGE_SPEED * (0.4 + 0.6 * (me.dodgeT / DODGE_TICKS));
    me.vx = me.dodgeX * sp; me.vz = me.dodgeZ * sp;
    me.guarding = false;
    me.moving = true;
    if (me.dodgeT === 0) me.dodgeRec = DODGE_RECOVER;
    return;
  }

  const busy = me.attack !== "none" || me.ms.phase !== "none" || me.shoveT > 0 || me.dodgeRec > 0;

  // 防御
  me.guarding = me.rooted === 0 && (!stunned || me.guardStun) && inp.guard && me.guardBroken === 0 && !busy;
  if (me.guarding) {
    me.stamina -= GUARD_DRAIN * me.st.guardDrain;
    if (me.stamina <= 0) { me.stamina = 0; me.guarding = false; me.guardBroken = TICK_HZ; }
  } else if (me.regenDelay === 0 && !busy) {
    me.stamina = Math.min(me.maxStamina, me.stamina + STAMINA_REGEN * me.st.regen);
  }

  // 移動
  let mx = inp.mx, mz = inp.mz;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }
  let speed = MOVE_SPEED * me.st.speed * (me.feetNow ? tr(me.cfg).walk : tr(me.cfg).top) * (me.guarding ? me.st.guardMove : 1);
  if (me.shootSlow > 0) speed *= 0.3;
  if (mx * me.fx + mz * me.fz < -0.3) speed *= RETREAT_SPEED; // 相手から離れる向き
  if (rooted || me.attack === "active" || me.attack === "windup") speed *= rooted ? 0 : 0.3;
  const mp = me.ms.phase;
  if (mp === "windup") speed *= 0.3;
  else if (mp === "active") speed *= me.mspec.spinTicks > 0 ? 0.75 : 0;
  else if (mp === "recover") speed = 0; // 近接必殺の戻りは無防備
  const tvx = mx * speed, tvz = mz * speed;
  if (me.ice > 0) { me.vx += (tvx - me.vx) * 0.04; me.vz += (tvz - me.vz) * 0.04; } // 凍った足元: ほとんど止まれない
  else if (me.feetNow) { me.vx = tvx; me.vz = tvz; }
  else { const a = tr(me.cfg).accel; me.vx += (tvx - me.vx) * a; me.vz += (tvz - me.vz) * a; } // 足なし: 転がる（慣性）
  me.moving = Math.hypot(me.vx, me.vz) > 0.3;
  if (me.attack === "none") me.preSpeed = Math.hypot(me.vx, me.vz);

  // 通常攻撃（手を振る / 手なしは体当たり）
  if (inp.attack && !rooted && !busy && me.stamina >= attackCostOf(me.cfg)) {
    me.attack = "windup"; me.attackT = 0; me.attackHit = false; me.swingHits = 0; me.stamina -= attackCostOf(me.cfg); me.regenDelay = REGEN_DELAY;
  }
  if (me.attack !== "none") {
    me.attackT++;
    if (me.attack === "windup" && me.attackT >= windupTicks(me.cfg) + me.st.windup) { me.attack = "active"; me.attackT = 0; }
    else if (me.attack === "active" && me.attackT >= activeTicks(me.cfg)) { me.attack = "recover"; me.attackT = 0; }
    else if (me.attack === "recover" && me.attackT >= recoverTicks(me.cfg)) { me.attack = "none"; me.attackT = 0; }
  }
  if (me.attack === "active") {
    const T = tr(me.cfg);
    if (!me.cfg.hasHands) {
      // 体当たり: 踏み込む（転がっていれば勢いを保つ）
      const lunge = Math.max(6, me.preSpeed);
      me.vx = me.fx * lunge; me.vz = me.fz * lunge;
    }
    const reach = meleeRange(me.cfg, op.cfg);
    // 当たり: 相手に描いた部分があれば、手の届く先（手の高さ付近の縦の幅）がそこに触れたら当たり。空白は素通り
    let touch = dist <= reach;
    if (touch && op.cfg.hurt) {
      const tipD = rad(me.cfg) + (me.cfg.hasHands ? me.cfg.reach : 0.35);
      const hx = me.x + me.fx * tipD, hz = me.z + me.fz * tipD;
      const hv = me.cfg.hasHands ? (me.cfg.hurt?.handV ?? 1) : 0.9;
      const span = me.cfg.hasHands ? 0.45 : 0.7;
      touch = false;
      for (const dv of [-span, -span / 2, 0, span / 2, span]) {
        // 届く先から手前までの線上を調べる（相手の体の手前側に触れれば当たり）
        for (const back of [0, 0.25, 0.5]) {
          if (hurtHit(op, hx - me.fx * back, hv + dv, hz - me.fz * back, 0.18)) { touch = true; break; }
        }
        if (touch) break;
      }
      if (!touch && !me.attackHit && me.swingHits === 0 && me.attackT === activeTicks(me.cfg) - 1) {
        w.events.push({ kind: "evade", x: op.x, z: op.z, h: 1.2, amount: 0, src: "melee", target: 1 - i, dx: 0, dz: 0, size: 0, gap: true });
      }
    }
    // 手が多いと 2tick おきに複数回当たる（合計威力は回数の 0.25 乗）
    if (me.swingHits < T.hits && me.attackT >= me.swingHits * 2 && touch) {
      const mom = 1 + T.momentum * Math.min(1, me.preSpeed / (MOVE_SPEED * T.top));
      const total = (me.cfg.hasHands ? PUNCH_DAMAGE : TACKLE_DAMAGE) * T.dmg * Math.pow(T.hits, 0.25) * mom * me.st.punch;
      const amount = total / T.hits;
      if (T.selfDmg > 0) {
        const self = Math.min(me.hp - 1, amount * T.selfDmg); // 体当たりの反動（自滅はしない）
        if (self > 0) {
          me.hp -= self;
          w.events.push({ kind: "recoil", x: me.x, z: me.z, h: 1, amount: self, src: "melee", target: i, dx: -me.fx, dz: -me.fz, size: 0 });
        }
      }
      pendingMelee.push([1 - i, {
        amount, src: "melee",
        dx: me.fx, dz: me.fz, knock: ((me.cfg.hasHands ? MELEE_KNOCK : TACKLE_KNOCK) * T.knockGiven * mom) / T.hits,
        stun: MELEE_STUN, x: (me.x + op.x) / 2, z: (me.z + op.z) / 2, h: 1.0, size: 0,
        firstOfSwing: me.swingHits === 0,
      }]);
      me.swingHits++;
      me.attackHit = true;
    }
  }

  // 回避（スタミナ消費）: 入力方向へ。方向が無ければ相手と反対へ
  if (inp.dodge && !rooted && !busy && me.stamina >= me.st.dodgeCost) {
    let dx = inp.mx, dz = inp.mz;
    const l = Math.hypot(dx, dz);
    if (l < 0.2) { dx = -me.fx; dz = -me.fz; } else { dx /= l; dz /= l; }
    me.stamina -= me.st.dodgeCost;
    me.regenDelay = REGEN_DELAY;
    me.dodgeT = DODGE_TICKS; me.dodgeX = dx; me.dodgeZ = dz;
    me.guarding = false;
    w.events.push({ kind: "dodge", x: me.x, z: me.z, h: 1, amount: 0, src: "melee", target: i, dx, dz, size: 0 });
    return;
  }

  // 突き飛ばし（スタミナ消費なし・ダメージなし）
  if (inp.shove && !rooted && !busy && me.shoveCd === 0) {
    me.shoveT = SHOVE_WINDUP + SHOVE_ACTIVE + SHOVE_RECOVER;
    me.shoveCd = SHOVE_COOLDOWN;
    me.guarding = false;
  }
  if (me.shoveT > 0) {
    me.shoveT--;
    const elapsed = SHOVE_WINDUP + SHOVE_ACTIVE + SHOVE_RECOVER - me.shoveT;
    if (elapsed === SHOVE_WINDUP + 1) {
      const range = rad(me.cfg) + rad(op.cfg) + 0.4 + (me.cfg.hasHands ? me.cfg.reach * 0.5 : 0);
      if (dist <= range && op.dodgeT === 0) {
        const k = SHOVE_KNOCK * tr(op.cfg).knockTaken * op.st.knockTaken;
        op.kx += me.fx * k; op.kz += me.fz * k;
        op.stun = Math.max(op.stun, 6);
        op.guardStun = false;
        if (op.guarding) { op.guarding = false; op.guardBroken = Math.max(op.guardBroken, 12); } // 防御を崩す
        if (op.attack !== "none") { op.attack = "none"; op.attackT = 0; }
        if (op.ms.phase === "windup") op.ms = idleMelee();
        w.hitstop = Math.max(w.hitstop, HITSTOP_LIGHT);
        w.events.push({ kind: "shove", x: (me.x + op.x) / 2, z: (me.z + op.z) / 2, h: 1, amount: 0, src: "melee", target: 1 - i, dx: me.fx, dz: me.fz, size: 0 });
      }
    }
  }

  // 必殺技: ゲージ満タンで、防御中・攻撃中でないとき
  const canSpecial = inp.special && !rooted && !me.guarding && !busy && me.charge >= me.st.chargeNeed;
  if (canSpecial) me.specialSeq++;
  // 会心（w.rng のみ使用＝決定的）とゲージ残し
  const mod = me.cfg.specialMod ?? {};
  const crit = canSpecial && (mod.crit ?? 0) > 0 && w.rng.next() < mod.crit! ? 2 : 1;
  const carry = Math.max(0, mod.carry ?? 0);
  if (canSpecial && me.cfg.specialType === "melee") {
    me.charge = Math.min(me.st.chargeNeed, carry); // carry
    me.ms = { ...idleMelee(), phase: "windup", dirX: me.fx, dirZ: me.fz, mult: crit };
    w.events.push({ kind: "mstart", x: me.x, z: me.z, h: 1, amount: 0, src: "special", target: i, dx: me.fx, dz: me.fz, size: 0, tags: me.mspec.tags });
  } else if (canSpecial && w.projectiles.length < MAX_PROJECTILES) {
    me.charge = Math.min(me.st.chargeNeed, carry); // carry
    me.shootSlow = SHOOT_SLOW;
    const s = me.spec;
    w.projectiles.push({
      id: w.nextId++, owner: i, spec: s,
      x: me.x + me.fx * 0.8, z: me.z + me.fz * 0.8, h: 1.0,
      dx: me.fx, dz: me.fz, age: 0, hitsLeft: s.hits, rehit: 0,
      tx: op.x, tz: op.z, sx: me.x, sz: me.z, mult: crit, bouncesLeft: s.bounces,
    });
    w.events.push({ kind: "shoot", x: me.x, z: me.z, h: 1, amount: 0, src: "special", target: i, dx: me.fx, dz: me.fz, size: s.size, tags: s.tags });
  }
  stepMelee(w, i, dist);
}

// 近接必殺: 届く距離は「体の縁 ＋ 手（無ければ体）の長さ × 倍率」。描いた手が長いほど届く
export function meleeSpecialRange(cfg: FighterConfig, spec: MeleeSpec, target?: FighterConfig): number {
  const limb = cfg.hasHands ? Math.max(0.4, cfg.reach) : 0.5;
  return rad(cfg) + (target ? rad(target) : BODY_RADIUS) + limb * spec.range;
}

function stepMelee(w: World, i: 0 | 1, dist: number) {
  const me = w.fighters[i];
  const op = w.fighters[1 - i];
  const ms = me.ms;
  const s = me.mspec;
  if (ms.phase === "none") return;
  ms.t++;
  if (ms.rehit > 0) ms.rehit--;
  const ev = (kind: BattleEvent["kind"], extra: Partial<BattleEvent> = {}) =>
    w.events.push({ kind, x: me.x, z: me.z, h: 1, amount: 0, src: "special", target: i, dx: ms.dirX, dz: ms.dirZ, size: 0, tags: s.tags, ...extra });

  if (ms.phase === "windup") {
    if (ms.t >= s.windup) {
      ms.phase = "active"; ms.t = 0;
      ms.dashLeft = s.dash;
      ev("mactive");
      if (s.slam) { ms.slamR = 0.4; ev("slam"); }
      if (s.bigTicks > 0) me.big = Math.max(me.big, s.bigTicks); // でっかくなる
      // じしゃくの手: 届く距離の2.5倍以内なら手元へ引き寄せる（防御中も・回避中は無効）
      if (s.pull > 0 && op.dodgeT === 0 && dist <= meleeSpecialRange(me.cfg, s, op.cfg) * 2.5) {
        const k = 14 * s.pull * tr(op.cfg).knockTaken;
        op.kx -= ((op.x - me.x) / dist) * k; op.kz -= ((op.z - me.z) / dist) * k;
        op.guarding = false; op.guardBroken = Math.max(op.guardBroken, 8);
        ms.pulled = true;
      }
      if (s.grab) {
        // 体が触れる距離でしか掴めない。外したら大きな隙
        if (dist <= rad(me.cfg) + rad(op.cfg) + 0.5 && op.crumple === 0) { ms.grabbed = true; ev("grab"); }
        else { ms.extraRecover = TICK_HZ; ev("whiff"); }
      }
    }
    return;
  }

  if (ms.phase === "active") {
    if (s.spinTicks > 0) ms.spin += 0.55;
    const dir = s.spinTicks > 0 ? [Math.cos(ms.spin), Math.sin(ms.spin)] : [ms.dirX, ms.dirZ];
    // 突進: 竜巻中ならその瞬間の回転の向きへ走る（変な方向へ飛ぶドリル）
    if (ms.dashLeft > 0) {
      const step = Math.min(ms.dashLeft, 18 * DT);
      me.x += dir[0] * step; me.z += dir[1] * step;
      ms.dashLeft -= step;
    }
    // つかみ: 掴んだ相手を手元に固定し、終わりに投げる
    if (ms.grabbed) {
      const hold = rad(me.cfg) + rad(op.cfg) + 0.1;
      op.x = me.x + dir[0] * hold; op.z = me.z + dir[1] * hold;
      op.vx = op.vz = op.kx = op.kz = 0;
      op.stun = Math.max(op.stun, 3);
      op.guardStun = false;
    }
    // 地面たたき: 輪が広がる。輪の内側は安全
    if (ms.slamR > 0) {
      ms.slamR += 0.28;
      if (!ms.slamHit && Math.abs(dist - ms.slamR) < 0.5) {
        ms.slamHit = true;
        hitWith(w, i, op.x, op.z, me.fx, me.fz, s.damage, s.knock, false);
      }
      if (ms.slamR > 4.5) ms.slamR = 0;
    }
    // ブルドーザー: 吹き飛ばさずに前へ押し込む。壁に挟んだら1回だけ追加ダメージ
    if (s.push > 0 && dist <= meleeSpecialRange(me.cfg, s, op.cfg) + 0.3 && op.dodgeT === 0) {
      const v = 7 * s.push * DT;
      me.x += ms.dirX * v; me.z += ms.dirZ * v; op.x += ms.dirX * v; op.z += ms.dirZ * v;
      op.kx = op.kz = 0; op.vx = op.vz = 0; op.stun = Math.max(op.stun, 2); op.guardStun = op.guarding;
      if (!ms.pushHit && Math.hypot(op.x, op.z) >= ARENA_RADIUS - BODY_RADIUS - 0.15) {
        ms.pushHit = true;
        hitWith(w, i, op.x, op.z, ms.dirX, ms.dirZ, s.damage, 0, false);
      }
    }
    // 通常の当たり（つかみ・地面たたき以外）: 向きの幅の中で届く距離なら
    if (!s.grab && !s.slam && ms.hitsDone < s.hits && ms.rehit === 0) {
      const reach = meleeSpecialRange(me.cfg, s, op.cfg);
      const fx = (op.x - me.x) / dist, fz = (op.z - me.z) / dist;
      const facing = s.spinTicks > 0 ? 1 : fx * ms.dirX + fz * ms.dirZ;
      if (dist <= reach && Math.acos(Math.max(-1, Math.min(1, facing))) <= s.arc) {
        const per = s.hits > 1 ? (s.damage * 1.3) / s.hits : s.damage;
        // 竜巻は吹き飛ばさず渦に引き込む（2発目以降も当たり続ける）
        if (s.spinTicks > 0) hitWith(w, i, op.x, op.z, -fx, -fz, per, 1.5, false);
        else hitWith(w, i, op.x, op.z, fx, fz, per, s.knock / Math.sqrt(s.hits), false);
        ms.hitsDone++;
        ms.rehit = s.hitInterval;
      }
    }
    if (ms.t >= s.active + (s.dash > 0 ? 8 : 0)) {
      if (ms.grabbed) {
        // 投げる（竜巻なら回転の終わった向きへ）
        ms.grabbed = false;
        hitWith(w, i, op.x, op.z, dir[0], dir[1], s.damage, s.knock * 1.6, true);
      }
      ms.phase = "recover"; ms.t = 0;
      if (s.spinTicks > 0) me.dizzy = Math.max(me.dizzy, Math.round(s.spinTicks * 0.5)); // 回った分だけ目を回す
    }
    return;
  }

  if (ms.phase === "recover" && ms.t >= s.recover + ms.extraRecover) me.ms = idleMelee();
}

function hitWith(w: World, i: number, x: number, z: number, dx: number, dz: number, amount: number, knock: number, ignoreGuard: boolean) {
  const s = w.fighters[i].mspec;
  damage(w, 1 - i, {
    amount: amount * w.fighters[i].st.special * w.fighters[i].ms.mult, src: "special", dx, dz, knock, stun: SPECIAL_STUN, x, z, h: 1, size: 0, tags: s.tags,
    ignoreGuard, wobble: s.wobbleTicks, legbind: s.legbindTicks, crumple: s.crumpleTicks,
    lifesteal: s.lifesteal, freeze: s.freezeTicks, pierce: w.fighters[i].cfg.specialMod?.pierce ?? 0,
  });
}

// 弾が消える時の後始末（ばくはつ）。元の処理は stepProjectileCore
function stepProjectile(w: World, p: Projectile): boolean {
  const alive = stepProjectileCore(w, p);
  const s = p.spec;
  if (!alive && s.blast > 0) {
    const target = w.fighters[1 - p.owner];
    const ox = target.x - p.x, oz = target.z - p.z, ol = Math.hypot(ox, oz) || 1;
    w.events.push({ kind: "land", x: p.x, z: p.z, h: 0, amount: 0, src: "special", target: p.owner, dx: 0, dz: 0, size: s.blast, tags: s.tags });
    if (ol <= s.blast + rad(target.cfg)) {
      damage(w, 1 - p.owner, {
        amount: s.damage * 0.7 * p.mult * w.fighters[p.owner].st.special, src: "special", dx: ox / ol, dz: oz / ol, knock: 8, stun: SPECIAL_STUN,
        x: target.x, z: target.z, h: 1, size: s.blast, pid: p.id, tags: s.tags, lifesteal: s.lifesteal, freeze: s.freezeTicks, pierce: w.fighters[p.owner].cfg.specialMod?.pierce ?? 0,
      });
    }
  }
  return alive;
}

function stepProjectileCore(w: World, p: Projectile): boolean {
  const s = p.spec;
  const target = w.fighters[1 - p.owner];
  p.age++;
  if (p.rehit > 0) p.rehit--;
  // 分裂: 20tick で 3つに割れる（子は1世代少ない・威力半分）
  if (s.split > 0 && p.age === 20) {
    const cur = Math.atan2(p.dz, p.dx);
    for (const a of [-0.45, 0, 0.45]) {
      if (w.projectiles.length + w.spawn.length >= MAX_PROJECTILES) break;
      const cs: ProjSpec = { ...s, split: s.split - 1, damage: s.damage * 0.5 };
      w.spawn.push({ ...p, id: w.nextId++, spec: cs, dx: Math.cos(cur + a), dz: Math.sin(cur + a), age: 0, hitsLeft: cs.hits, rehit: 0 });
    }
    return false;
  }
  // すいこみ: 近くの相手を弾へ引き寄せる
  if (s.pull > 0 && target.dodgeT === 0) {
    const ox = p.x - target.x, oz = p.z - target.z, ol = Math.hypot(ox, oz);
    if (ol < 3.5 && ol > 0.3) { const k = s.pull * 0.075 * tr(target.cfg).knockTaken; target.kx += (ox / ol) * k; target.kz += (oz / ol) * k; }
  }
  // ブーメラン: 35tick 後から持ち主へ向きを変え、手元に戻ったら消える
  if (s.boomerang && p.age >= 35) {
    const me = w.fighters[p.owner];
    const want = Math.atan2(me.z - p.z, me.x - p.x), cur = Math.atan2(p.dz, p.dx);
    let diff = want - cur;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turn = Math.max(-5 * DT, Math.min(5 * DT, diff));
    p.dx = Math.cos(cur + turn); p.dz = Math.sin(cur + turn);
    if (p.age > 45 && Math.hypot(me.x - p.x, me.z - p.z) < 0.9) return false;
  }
  const overlapping = Math.hypot(target.x - p.x, target.z - p.z) <= s.size + rad(target.cfg) && hurtHit(target, p.x, p.h, p.z, s.size);
  const moveScale = s.grind && overlapping ? 0.15 : 1; // 多段ヒットは相手に食い込んで削る

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
        w.events.push({ kind: "land", x: p.x, z: p.z, h: 0, amount: 0, src: "special", target: p.owner, dx: 0, dz: 0, size: s.size, tags: s.tags });
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
    if (s.trap && !s.meteor && p.age > 18) {
      p.h = 0.3; // おき罠: 地面に止まって待つ
    } else if (!s.meteor) {
      const side = Math.sin(p.age * 0.25) * s.wobble * DT;
      p.x += (p.dx * s.speed * DT - p.dz * side) * moveScale;
      p.z += (p.dz * s.speed * DT + p.dx * side) * moveScale;
    }
  }

  // はね返り: 場外の壁で跳ね返る
  if (p.bouncesLeft > 0 && !s.meteor) {
    const r = Math.hypot(p.x, p.z), lim = ARENA_RADIUS - s.size;
    if (r > lim) {
      const nx = p.x / r, nz = p.z / r, dot = p.dx * nx + p.dz * nz;
      if (dot > 0) { p.dx -= 2 * dot * nx; p.dz -= 2 * dot * nz; p.bouncesLeft--; p.rehit = 0; }
      p.x = nx * lim; p.z = nz * lim;
    }
  }
  // 当たり判定（地面の円＋高さ）
  const near = Math.hypot(target.x - p.x, target.z - p.z) <= s.size + rad(target.cfg) + 0.6 && hurtHit(target, p.x, p.h, p.z, s.size);
  if (near && target.dodgeT === 0 && p.age > PROJ_ARM && p.h - s.size <= BODY_HEIGHT && p.h + s.size >= 0 && p.rehit === 0) {
    // 吹き飛ぶ向き: 落下弾は着弾点から外向き、それ以外は弾の進行方向
    let kdx = p.dx, kdz = p.dz;
    if (s.meteor) {
      const ox = target.x - p.x, oz = target.z - p.z, ol = Math.hypot(ox, oz);
      if (ol > 0.01) { kdx = ox / ol; kdz = oz / ol; }
    }
    const restrain = s.restrainTicks > 0 && !target.guarding;
    damage(w, 1 - p.owner, {
      amount: s.damage * p.mult * w.fighters[p.owner].st.special, src: "special", dx: kdx, dz: kdz,
      lifesteal: s.lifesteal, freeze: s.freezeTicks, pierce: w.fighters[p.owner].cfg.specialMod?.pierce ?? 0,
      knock: restrain || s.grind ? 0.5 : 4 + s.damage * 0.35 + s.size * 2, stun: SPECIAL_STUN,
      x: p.x, z: p.z, h: p.h, size: s.size, pid: p.id, tags: s.tags, restrain: s.restrainTicks,
    });
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
  w.events = []; // 決着後も必ず空にする（前の tick のイベントを繰り返し配らない）
  if (w.winner !== -1) return;
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
  const RR = rad(a.cfg) + rad(b.cfg);
  if (d > 0 && d < RR) {
    const push = (RR - d) / 2;
    a.x -= (dx / d) * push; a.z -= (dz / d) * push;
    b.x += (dx / d) * push; b.z += (dz / d) * push;
  }
  w.spawn = [];
  w.projectiles = w.projectiles.filter((p) => stepProjectile(w, p));
  if (w.spawn.length) w.projectiles.push(...w.spawn); // 分裂で生まれた弾は次の tick から動く

  const [ha, hb] = [a.hp, b.hp];
  if (ha <= 0 || hb <= 0) w.winner = ha <= 0 && hb <= 0 ? 2 : ha <= 0 ? 1 : 0;
  else if (w.tick >= MATCH_TICKS) w.winner = ha === hb ? 2 : ha > hb ? 0 : 1;
}

// 状態の要約（決定性の確認用）
export function hashWorld(w: World): string {
  const r = (v: number) => Math.round(v * 1000);
  return JSON.stringify([
    w.tick, w.winner, w.rng.state(),
    w.fighters.map((f) => [r(f.x), r(f.z), r(f.hp), r(f.stamina), f.attack, f.rooted, f.stun, f.charge, f.ms.phase, f.wobble, f.legbind, f.crumple, f.shoveT, f.dodgeT, f.ice, f.big]),
    w.projectiles.map((p) => [p.id, r(p.x), r(p.z), r(p.h), p.hitsLeft]),
  ]);
}
