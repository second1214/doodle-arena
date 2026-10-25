// 戦闘シミュレーション（DOM・描画非依存）。30Hz 固定ステップ、乱数はシード固定。
// 空間は地面の平面(x, z)＋高さ h。数値はすべて調整前提の仮値。
import { Rng } from "./rng";
import { BASE_SPEC, composeSpecial, DRIP_DMG, type EffectId, type ProjSpec } from "./special";
import { DEFAULT_TRAITS, type Hurt, type Traits } from "../shape";
import { composeMelee, type MeleeEffectId, type MeleeSpec } from "./melee";
import { BASE_CHARGE_NEED, BASE_DODGE_COST, statEffects, type Boost, type StatEffects } from "./stats";
import { ARENA_RADIUS, BODY_HEIGHT, BODY_RADIUS } from "./consts";
import { groundAt, inWater, ladderAt, STEP, type Arena } from "./arena";
export { ARENA_RADIUS, BODY_HEIGHT, BODY_RADIUS };

// 戦闘ルールの版。ルールを変えたら上げる（オンラインの公開キャラに記録し、古い版のキャラも戦えるようにする）
export const SIM_VERSION = 2; // 2: 高さ（地形・飛行）と 新しい必殺
export const TICK_HZ = 30;
export const DT = 1 / TICK_HZ;
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
const WATER_SPEED = 0.6; // 水の 中を 歩く 速さ
// 必殺に必要な命中数（標準5・防御された攻撃も数える）、防御で減らす割合（標準7割）、回避のスタミナ（標準22）、
// 防御成功で防いだ側に溜まるゲージ（標準0.5・攻撃1回につき1度）は、強化で変わるのでキャラごとの st に持つ（stats.ts）
const SHOOT_SLOW = 15; // 必殺技を撃った直後に足が遅くなる tick
const RETREAT_SPEED = 0.75; // 相手から離れる方向へ歩くときの速度倍率（逃げ撃ち対策）
const PROJ_ARM = 3;
const METEOR_TRACK = 3; // 打ち上げ→落下: 落下地点が相手を追う速さ（単位/秒。測定で勝率18%→50%） // 必殺技の弾が出てから当たり始めるまでの tick（密着必中の防止）
const ACTIVE = slow(4);
const PUNCH_DAMAGE = 5;
const TACKLE_DAMAGE = 5;
// 高さ: 重力・飛行（羽があるキャラだけ。飛んでいる間は スタミナが減り、なくなると落ちる）・はしご
const GRAVITY = 22;
const FLY_RISE = 4.5; // 上がる速さ（単位/秒）
const GLIDE_FALL = 1.8; // 羽を広げて ゆっくり落ちる速さ
const FLY_DRAIN = 0.5; // 飛んでいる間の スタミナ（1 tick）。満タンから 約7秒
const GLIDE_DRAIN = 0.22; // すべり降りる間
const FLY_RESUME = 25; // スタミナが 切れたら、着地して ここまで 戻るまで 飛べない
const MAX_ALT = 5; // 地面から ここまで 上がれる
const CEILING = 7.5;
const CLIMB_SPEED = 2.6;
const MELEE_VREACH = 1.1; // 通常攻撃・近接必殺が 届く 高さの差
const BURN_DMG = 0.05; // やけど（1 tick）

export interface FighterConfig {
  name: string;
  reach: number; // 手の届く距離（単位）
  hasHands: boolean;
  hasFeet: boolean;
  hasWings?: boolean; // 羽ペンで 塗った 羽がある（飛べる）
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
  wh -= f.y; // 世界の高さ → そのキャラの 足元からの 高さ
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
  fly?: boolean; // 飛ぶ（押している間 上がる。羽があるキャラだけ）
}

export const NO_INPUT: Input = { mx: 0, mz: 0, attack: false, guard: false, special: false };

export type AttackPhase = "none" | "windup" | "active" | "recover";

export interface Fighter {
  team: number; // 0 = 自分の チーム、1 = 相手の チーム（1対多の 試合では 相手が 何人か いる）
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
  rising: boolean; // 飛ぶボタンを 押して 上がっている
  st: StatEffects; // 能力値から決まる倍率
  maxHp: number;
  maxStamina: number;
 
  ice: number; // 足元が凍って滑る（残り tick）
  big: number; // でっかくなる（残り tick）
  y: number; // 足元の高さ
  vy: number; // 上下の速さ
  air: boolean; // 地面から はなれている
  flying: boolean; // 羽で 飛んでいる（上がる・すべり降りる）
  tired: boolean; // 飛びすぎて スタミナ切れ（着地して 回復するまで 飛べない）
  climb: number; // つかまっている はしご（-1 で 無し）
  net: number; // あみ: 飛べない（残り tick）
  burn: number; // やけど（残り tick）
  shock: number; // しびれ: 攻撃と必殺が 出せない（残り tick）
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
  sl: number; // 上下の傾き（横に 1 進むと 高さが sl 変わる）。撃った時に 相手の高さへ 向ける
  sh: number; // 打ち上げの はじめの高さ
  drop?: boolean; // 雲から 落ちる しずく（まっすぐ 下へ 落ちる）
  vh?: number; // しずくの 横の速さ（分裂した しずくが 広がる）
  emitter?: number; // 時間差分割・雲: あと何回 撃つか（それ自体は 当たらない）
  start?: number; // 雲が 降らせはじめた age
  parked?: number; // 地面に 止まって 待っている（この age で 消える）。おき罠・多段の着地
}

export interface World {
  tick: number;
  rng: Rng;
  fighters: Fighter[]; // [0] は 自分。1対1 なら [自分, 相手]
  projectiles: Projectile[];
  nextId: number;
  arena?: Arena; // 地形（無ければ 平らな舞台）
  winner: -1 | 0 | 1 | 2; // -1=試合中, 0/1=勝者, 2=引き分け
  hitstop: number; // ヒットストップ（全体が止まる tick）
  events: BattleEvent[];
  spawn: Projectile[]; // この tick に生まれた弾（分裂）。弾の処理の後で足す
}

export interface BattleEvent {
  kind: "hit" | "guard" | "shoot" | "land" | "ko" | "ready" | "recoil" | "mstart" | "mactive" | "grab" | "whiff" | "slam" | "status" | "shove" | "dodge" | "evade" | "fly" | "tired";
  x: number; z: number; h: number;
  y?: number; // 見た目の高さの基準（h はここからの高さ）
  amount: number;
  src: "melee" | "special";
  target: number; // 受けた側（shoot は撃った側）
  dx: number; dz: number; // 吹き飛ぶ向き
  size: number; // 弾の大きさ（melee は 0）
  pid?: number; // 弾の id（必殺技のみ）
  tags?: (EffectId | MeleeEffectId)[]; // 必殺技の効果（見た目用）
  restrained?: boolean;
  status?: "wobble" | "legbind" | "crumple" | "net" | "burn" | "shock" | "launch" | "steam";
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
    netTicks: Math.round(s.netTicks * d), shockTicks: Math.round(s.shockTicks * d), burnTicks: Math.round(s.burnTicks * d),
    size: s.size * Math.max(0.05, m.size ?? 1), freezeTicks: Math.round(s.freezeTicks * d) }; // size/freeze
}
function modMelee(s: MeleeSpec, m: Partial<SpecialMod> = {}): MeleeSpec {
  const d = m.duration ?? 1;
  return {
    ...s, damage: s.damage * Math.max(0.05, m.power ?? 1), windup: Math.max(1, s.windup - Math.round(m.windup ?? 0)),
    wobbleTicks: Math.round(s.wobbleTicks * d), legbindTicks: Math.round(s.legbindTicks * d), crumpleTicks: Math.round(s.crumpleTicks * d),
    netTicks: Math.round(s.netTicks * d), burnTicks: Math.round(s.burnTicks * d),
    range: s.range * (1 + ((m.size ?? 1) - 1) * 0.6), freezeTicks: Math.round(s.freezeTicks * d), bigTicks: Math.round(s.bigTicks * d),
  };
}
function paceProj(s: ProjSpec): ProjSpec { return { ...s, speed: s.speed * PROJ_PACE }; }
function paceMelee(s: MeleeSpec): MeleeSpec { return { ...s, windup: slow(s.windup), active: slow(s.active), recover: slow(s.recover) }; }

function makeFighter(cfg: FighterConfig, x: number, team: number, z = 0): Fighter {
  const st = statEffects(cfg.boost);
  return {
    team, st, maxHp: st.maxHp, maxStamina: st.maxStamina,
    cfg, spec: paceProj(modProj(composeSpecial(cfg.special), cfg.specialMod)),
    x, z, vx: 0, vz: 0, fx: x < 0 ? 1 : -1, fz: 0,
    hp: st.maxHp, stamina: st.maxStamina, guarding: false, guardBroken: 0,
    attack: "none", attackT: 0, attackHit: false, charge: 0, specialSeq: 0, guardedSeq: 0, shootSlow: 0, rooted: 0, hitFlash: 0, moving: false,
    kx: 0, kz: 0, stun: 0, guardStun: false, regenDelay: 0, preSpeed: 0, swingHits: 0,
    mspec: paceMelee(modMelee(composeMelee(cfg.melee ?? []), cfg.specialMod)), ms: idleMelee(),
    wobble: 0, dizzy: 0, legbind: 0, crumple: 0, feetNow: cfg.hasFeet,
    shoveT: 0, shoveCd: 0, dodgeT: 0, dodgeRec: 0, dodgeX: 0, dodgeZ: 0,
    ice: 0, big: 0,
    y: 0, vy: 0, air: false, flying: false, rising: false, tired: false, climb: -1, net: 0, burn: 0, shock: 0,
  };
}

// more: 相手の チームに 足す キャラ（1対多。相手の まわりに ならべる）
export function createWorld(a: FighterConfig, b: FighterConfig, seed: number, arena?: Arena, more: FighterConfig[] = []): World {
  const fs: Fighter[] = [makeFighter(a, -4, 0), makeFighter(b, 4, 1), ...more.map((c, k) => makeFighter(c, 4.5, 1, (k % 2 ? 1 : -1) * 2.6 * (1 + Math.floor(k / 2))))];
  for (const f of fs) f.y = groundAt(arena, f.x, f.z);
  return {
    tick: 0, rng: new Rng(seed),
    fighters: fs, arena,
    projectiles: [], nextId: 1, winner: -1, hitstop: 0, events: [], spawn: [],
  };
}

// いちばん 近い 生きている 相手（1対1 なら もう片方）。全員 たおれていたら 相手の 1人目
export function foeOf(w: World, i: number): number {
  return foeNear(w, w.fighters[i].team, w.fighters[i].x, w.fighters[i].z);
}
export function foeNear(w: World, team: number, x: number, z: number): number {
  let best = -1, bd = Infinity, first = -1;
  w.fighters.forEach((f, k) => {
    if (f.team === team) return;
    if (first < 0) first = k;
    if (f.hp <= 0) return;
    const d = Math.hypot(f.x - x, f.z - z);
    if (d < bd) { bd = d; best = k; }
  });
  return best >= 0 ? best : first;
}

// 地面から はなれているか（飛ぶ・落ちる・はしご）
export const airborne = (w: World, f: Fighter) => f.y > groundAt(w.arena, f.x, f.z) + 0.3;

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
  by: number; // 当てた キャラ
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
  net?: number; burn?: number; shock?: number; launch?: number; // あみ・やけど・しびれ・打ち上げ（上向きの速さ）
}

function damage(w: World, ti: number, hit: Hit) {
  const target = w.fighters[ti];
  if (target.dodgeT > 0) {
    // 回避中は当たらない
    w.events.push({ kind: "evade", x: target.x, z: target.z, h: 1.5, amount: 0, src: hit.src, target: ti, dx: 0, dz: 0, size: 0 });
    return;
  }
  // 打ちおとし（対空）: 飛んでいる相手には 強化の分だけ 多く与える
  const antiAir = airborne(w, target) ? w.fighters[hit.by].st.antiAir : 1;
  hit = { ...hit, amount: hit.amount * antiAir };
  // カウンター: 構え中に必殺以外で殴られたら受け流し、すぐ2倍で出す
  if (hit.src === "melee" && target.mspec.counter && target.ms.phase === "windup") {
    target.ms.phase = "active"; target.ms.t = 0; target.ms.mult *= 2; target.ms.dashLeft = target.mspec.dash;
    w.events.push({ kind: "evade", x: target.x, z: target.z, h: 1.5, amount: 0, src: "special", target: ti, dx: 0, dz: 0, size: 0, tags: ["counter"] });
    return;
  }
  const guarded = target.guarding && !hit.ignoreGuard;
  const rolling = !target.feetNow && Math.hypot(target.vx, target.vz) > MOVE_SPEED * 0.5;
  const atkF = w.fighters[hit.by];
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
    // 水の 中: こおりは 長く、かみなりは 水を つたって 長く しびれ、ほのおは ジュッと 消える（画面に 出す）
    const wet = inWater(w.arena, target.x, target.z, target.y);
    if (hit.freeze) target.ice = Math.max(target.ice, Math.round(hit.freeze * (wet ? 1.5 : 1))); // こおり
    if (wet && hit.shock) hit = { ...hit, shock: Math.round(hit.shock * 1.6) };
    if (wet && hit.burn) { hit = { ...hit, burn: 0 }; w.events.push({ kind: "status", x: target.x, z: target.z, h: 2, amount: 0, src: "special", target: ti, dx: 0, dz: 0, size: 0, status: "steam" }); }
    const st2 = (kind: "net" | "burn" | "shock", ticks?: number) => {
      if (!ticks) return;
      target[kind] = Math.max(target[kind], ticks);
      w.events.push({ kind: "status", x: target.x, z: target.z, h: 2, amount: ticks, src: "special", target: ti, dx: 0, dz: 0, size: 0, status: kind });
    };
    st2("net", hit.net);
    st2("burn", hit.burn);
    st2("shock", hit.shock);
    if (hit.net) { target.flying = false; target.climb = -1; } // あみ: 飛べずに 落ちる
    if (hit.launch && target.crumple === 0) {
      target.vy = Math.max(target.vy, hit.launch); target.climb = -1; target.flying = false; target.air = true;
      w.events.push({ kind: "status", x: target.x, z: target.z, h: 2, amount: 0, src: "special", target: ti, dx: 0, dz: 0, size: 0, status: "launch" });
    }
  }
  w.hitstop = Math.max(w.hitstop, hit.src === "special" || dmg >= 8 ? HITSTOP_HEAVY : HITSTOP_LIGHT);
  const restrained = !guarded && (hit.restrain ?? 0) > 0;
  if (restrained) target.rooted = Math.max(target.rooted, hit.restrain!);
  w.events.push({ kind: guarded ? "guard" : "hit", x: hit.x, z: hit.z, h: hit.h - target.y, y: target.y, amount: dmg, src: hit.src, target: ti, dx: hit.dx, dz: hit.dz, size: hit.size, pid: hit.pid, tags: hit.tags, restrained, heal });
  // 通常攻撃が当たるたびに攻撃側の必殺技ゲージが溜まる（防御されても溜まる）
  const atk = w.fighters[hit.by];
  if (hit.src === "melee" && hit.firstOfSwing) addCharge(w, hit.by, 1);
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

function stepFighter(w: World, i: number, rawInp: Input) {
  const me = w.fighters[i];
  const oi = foeOf(w, i);
  const op = w.fighters[oi];
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
  if (me.net > 0) me.net--;
  if (me.shock > 0) me.shock--;
  if (me.burn > 0 && me.hp > 0) {
    me.burn--;
    me.hp = Math.max(0, me.hp - BURN_DMG * op.st.dealt * me.st.taken);
    if (me.hp <= 0) w.events.push({ kind: "ko", x: me.x, z: me.z, h: 1, amount: 0, src: "special", target: i, dx: 0, dz: 0, size: 0 });
  }
  me.feetNow = me.legbind > 0 ? !me.cfg.hasFeet : me.cfg.hasFeet; // 足封じ: 足なしキャラには逆に足が生える
  const stunned = me.stun > 0;
  if (stunned) me.stun--;

  // 紙くしゃくしゃ: 操作できず玉になって転がる（壁で跳ね返る）
  if (me.crumple > 0) {
    me.crumple--;
    me.guarding = false;
    me.flying = me.rising = false; me.climb = -1;
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

  // 飛ぶ（羽があるキャラ）: 押している間 上がり、はなすと ゆっくり すべり降りる。飛んでいる間は スタミナが減る
  const g = groundAt(w.arena, me.x, me.z);
  const inAir = me.y > g + 0.05;
  if (!inAir && me.tired && me.stamina >= FLY_RESUME) me.tired = false;
  const canFly = !!me.cfg.hasWings && me.net === 0 && !me.tired && !rooted && me.climb < 0;
  const wasFlying = me.flying;
  me.flying = canFly && (!!inp.fly || inAir);
  me.rising = me.flying && !!inp.fly;
  if (me.flying && (inAir || me.rising)) {
    me.stamina -= (me.rising ? FLY_DRAIN : GLIDE_DRAIN) * me.st.flyDrain;
    me.regenDelay = Math.max(me.regenDelay, 4);
    if (me.stamina <= 0) {
      me.stamina = 0; me.flying = me.rising = false; me.tired = true;
      w.events.push({ kind: "tired", x: me.x, z: me.z, h: 2, amount: 0, src: "melee", target: i, dx: 0, dz: 0, size: 0 });
    }
  }
  if (me.rising && !wasFlying) w.events.push({ kind: "fly", x: me.x, z: me.z, h: 0.5, amount: 0, src: "melee", target: i, dx: 0, dz: 0, size: 0 });
  // はしご: かべに向かって進むと つかまって登る（反対へ 進むと はなす）
  if (me.climb >= 0) {
    const l = w.arena!.ladders[me.climb];
    if (inp.mx * l.nx + inp.mz * l.nz < -0.4 || me.flying) me.climb = -1;
    else { me.vx = me.vz = 0; me.guarding = false; me.moving = true; return; }
  } else if (!inAir && !me.flying && !rooted && me.attack === "none" && me.ms.phase === "none") {
    const l = ladderAt(w.arena, me.x, me.z, me.y);
    if (l && inp.mx * l.nx + inp.mz * l.nz > 0.4) { me.climb = w.arena!.ladders.indexOf(l); me.vx = me.vz = 0; me.moving = true; return; }
  }

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
  } else if (me.regenDelay === 0 && !busy && !me.flying) {
    me.stamina = Math.min(me.maxStamina, me.stamina + STAMINA_REGEN * me.st.regen);
  }

  // 移動
  let mx = inp.mx, mz = inp.mz;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }
  const flyingNow = me.flying && inAir;
  let speed = MOVE_SPEED * me.st.speed * (flyingNow ? me.st.flySpeed : me.feetNow ? tr(me.cfg).walk : tr(me.cfg).top) * (me.guarding ? me.st.guardMove : 1);
  if (me.shootSlow > 0) speed *= 0.3;
  if (!inAir && inWater(w.arena, me.x, me.z, me.y)) speed *= WATER_SPEED; // 水の 中は 足が おそい
  if (mx * me.fx + mz * me.fz < -0.3) speed *= RETREAT_SPEED; // 相手から離れる向き
  if (rooted || me.attack === "active" || me.attack === "windup") speed *= rooted ? 0 : 0.3;
  const mp = me.ms.phase;
  if (mp === "windup") speed *= 0.3;
  else if (mp === "active") speed *= me.mspec.spinTicks > 0 ? 0.75 : 0;
  else if (mp === "recover") speed = 0; // 近接必殺の戻りは無防備
  const tvx = mx * speed, tvz = mz * speed;
  if (me.ice > 0 && !inAir) { me.vx += (tvx - me.vx) * 0.04; me.vz += (tvz - me.vz) * 0.04; } // 凍った足元: ほとんど止まれない
  else if (flyingNow) { me.vx += (tvx - me.vx) * 0.3; me.vz += (tvz - me.vz) * 0.3; } // 空中: 少し ふわっと
  else if (me.feetNow) { me.vx = tvx; me.vz = tvz; }
  else { const a = tr(me.cfg).accel; me.vx += (tvx - me.vx) * a; me.vz += (tvz - me.vz) * a; } // 足なし: 転がる（慣性）
  me.moving = Math.hypot(me.vx, me.vz) > 0.3;
  if (me.attack === "none") me.preSpeed = Math.hypot(me.vx, me.vz);

  // 通常攻撃（手を振る / 手なしは体当たり）
  if (inp.attack && !rooted && !busy && me.shock === 0 && me.stamina >= attackCostOf(me.cfg)) {
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
    let touch = dist <= reach && Math.abs(op.y - me.y) <= MELEE_VREACH;
    if (touch && op.cfg.hurt) {
      const tipD = rad(me.cfg) + (me.cfg.hasHands ? me.cfg.reach : 0.35);
      const hx = me.x + me.fx * tipD, hz = me.z + me.fz * tipD;
      const hv = me.cfg.hasHands ? (me.cfg.hurt?.handV ?? 1) : 0.9;
      const span = me.cfg.hasHands ? 0.45 : 0.7;
      touch = false;
      for (const dv of [-span, -span / 2, 0, span / 2, span]) {
        // 届く先から手前までの線上を調べる（相手の体の手前側に触れれば当たり）
        for (const back of [0, 0.25, 0.5]) {
          if (hurtHit(op, hx - me.fx * back, me.y + hv + dv, hz - me.fz * back, 0.18)) { touch = true; break; }
        }
        if (touch) break;
      }
      if (!touch && !me.attackHit && me.swingHits === 0 && me.attackT === activeTicks(me.cfg) - 1) {
        w.events.push({ kind: "evade", x: op.x, z: op.z, h: 1.2, amount: 0, src: "melee", target: oi, dx: 0, dz: 0, size: 0, gap: true });
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
      pendingMelee.push([oi, {
        by: i,
        amount, src: "melee",
        dx: me.fx, dz: me.fz, knock: ((me.cfg.hasHands ? MELEE_KNOCK : TACKLE_KNOCK) * T.knockGiven * mom) / T.hits,
        stun: MELEE_STUN, x: (me.x + op.x) / 2, z: (me.z + op.z) / 2, h: op.y + 1.0, size: 0,
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
      if (dist <= range && op.dodgeT === 0 && Math.abs(op.y - me.y) <= MELEE_VREACH) {
        const k = SHOVE_KNOCK * tr(op.cfg).knockTaken * op.st.knockTaken;
        op.kx += me.fx * k; op.kz += me.fz * k;
        op.stun = Math.max(op.stun, 6);
        op.guardStun = false;
        if (op.guarding) { op.guarding = false; op.guardBroken = Math.max(op.guardBroken, 12); } // 防御を崩す
        if (op.attack !== "none") { op.attack = "none"; op.attackT = 0; }
        if (op.ms.phase === "windup") op.ms = idleMelee();
        w.hitstop = Math.max(w.hitstop, HITSTOP_LIGHT);
        w.events.push({ kind: "shove", x: (me.x + op.x) / 2, z: (me.z + op.z) / 2, h: 1, amount: 0, src: "melee", target: oi, dx: me.fx, dz: me.fz, size: 0 });
      }
    }
  }

  // 必殺技: ゲージ満タンで、防御中・攻撃中でないとき
  const canSpecial = inp.special && !rooted && !me.guarding && !busy && me.shock === 0 && me.charge >= me.st.chargeNeed;
  if (canSpecial) me.specialSeq++;
  // 会心（w.rng のみ使用＝決定的）とゲージ残し
  const mod = me.cfg.specialMod ?? {};
  const crit = canSpecial && (mod.crit ?? 0) > 0 && w.rng.next() < mod.crit! ? 2 : 1;
  const carry = Math.max(0, mod.carry ?? 0);
  if (canSpecial && me.cfg.specialType === "melee") {
    me.charge = Math.min(me.st.chargeNeed, carry); // carry
    me.ms = { ...idleMelee(), phase: "windup", dirX: me.fx, dirZ: me.fz, mult: crit };
    if (me.mspec.dive) { me.vy = Math.max(me.vy, 7); me.air = true; } // ダイブ: 跳び上がる
    w.events.push({ kind: "mstart", x: me.x, z: me.z, h: 1, amount: 0, src: "special", target: i, dx: me.fx, dz: me.fz, size: 0, tags: me.mspec.tags });
  } else if (canSpecial && w.projectiles.length < MAX_PROJECTILES) {
    me.charge = Math.min(me.st.chargeNeed, carry); // carry
    me.shootSlow = SHOOT_SLOW;
    const s = me.spec;
    const shot = launch(w, i, s, crit);
    // 雲・時間差分割は「撃つ係」を置き、そこから 弾を 何回かに分けて 出す
    if (s.cloud || s.drip > 0) shot.emitter = s.cloud ? Math.max(1, s.drip) : s.drip;
    w.projectiles.push(shot);
    w.events.push({ kind: "shoot", x: me.x, z: me.z, h: 1, amount: 0, src: "special", target: i, dx: me.fx, dz: me.fz, size: s.size, tags: s.tags });
  }
  stepMelee(w, i, dist);
}

// 撃つ人の 手元から 相手へ向けた 弾を 1つ作る
function launch(w: World, i: number, s: ProjSpec, mult: number): Projectile {
  const me = w.fighters[i], op = w.fighters[foeOf(w, i)];
  const dist = Math.max(1, Math.hypot(op.x - me.x, op.z - me.z));
  return {
    id: w.nextId++, owner: i, spec: s,
    x: me.x + me.fx * 0.8, z: me.z + me.fz * 0.8, h: me.y + 1.0,
    dx: me.fx, dz: me.fz, age: 0, hitsLeft: s.hits, rehit: 0,
    tx: op.x, tz: op.z, sx: me.x, sz: me.z, mult, bouncesLeft: s.bounces,
    // 相手の高さへ 向けて撃つ（飛んでいる相手・台の上の相手にも 届く）
    sl: Math.max(-3, Math.min(3, (op.y - me.y) / dist)), sh: me.y + 1.0,
  };
}

const room = (w: World) => w.projectiles.length + w.spawn.length < MAX_PROJECTILES;
const DRIP_EVERY = 10; // 時間差分割の 間かく（tick）
const DROP_SPLIT_AGE = 3; // しずくが 割れる時（落ちはじめ すぐ）

// 撃つ係（雲・時間差分割）。子の弾は 時間差分割の回数だけを 取り除き、ほかの性質は 全部 受け継ぐ
function stepEmitter(w: World, p: Projectile): boolean {
  const s = p.spec;
  const target = w.fighters[foeOf(w, p.owner)];
  const me = w.fighters[p.owner];
  p.age++;
  const per = s.drip > 0 ? DRIP_DMG : 1;
  const child: ProjSpec = { ...s, drip: 0, damage: s.damage * per };
  if (s.cloud) {
    // 相手の上の 雲になり、ときどき しずくを 落とす（雲そのものは 当たらない）
    const ox = target.x - p.x, oz = target.z - p.z, ol = Math.hypot(ox, oz);
    const sp = Math.min(ol, s.speed * DT);
    if (ol > 0.01) { p.x += (ox / ol) * sp; p.z += (oz / ol) * sp; p.dx = ox / ol; p.dz = oz / ol; }
    p.h += (Math.max(target.y, groundAt(w.arena, p.x, p.z)) + 4.5 - p.h) * 0.1;
    // 相手の 真上に 着いてから（遅くても 60tick で）降らせはじめる
    if (p.start === undefined && (ol < 0.6 || p.age >= 60)) p.start = p.age;
    if (p.start !== undefined && (p.age - p.start) % DRIP_EVERY === 0 && p.emitter! > 0 && room(w)) {
      p.emitter!--;
      const jit = s.drip > 0 ? 1.6 : 0;
      const jx = (w.rng.next() - 0.5) * jit, jz = (w.rng.next() - 0.5) * jit;
      w.spawn.push({ ...p, id: w.nextId++, spec: { ...child, size: s.size * (0.3 / BASE_SPEC.size) }, x: p.x + jx, z: p.z + jz, age: 0, hitsLeft: child.hits, rehit: 0, drop: true, vh: 0, emitter: undefined });
    }
    return p.emitter! > 0;
  }
  // 手元から 間かくを あけて 1発ずつ 撃つ
  p.x = me.x; p.z = me.z; p.h = me.y + 1;
  if ((p.age - 1) % DRIP_EVERY === 0 && p.emitter! > 0 && room(w)) {
    p.emitter!--;
    w.spawn.push(launch(w, p.owner, child, p.mult));
  }
  return p.emitter! > 0;
}

// つかみ投げが掴める中心間距離（体が触れる距離）
const GRAB_REACH = 0.8; // つかみ投げの手の届く余裕（0.5→0.8。CPU が寄ってから撃つ改善と合わせて勝率7%→43%）
export function grabRange(cfg: FighterConfig, target: FighterConfig): number { return rad(cfg) + rad(target) + GRAB_REACH; }

// 近接必殺: 届く距離は「体の縁 ＋ 手（無ければ体）の長さ × 倍率」。描いた手が長いほど届く
export function meleeSpecialRange(cfg: FighterConfig, spec: MeleeSpec, target?: FighterConfig): number {
  const limb = cfg.hasHands ? Math.max(0.4, cfg.reach) : 0.5;
  return rad(cfg) + (target ? rad(target) : BODY_RADIUS) + limb * spec.range;
}

function stepMelee(w: World, i: number, dist: number) {
  const me = w.fighters[i];
  const op = w.fighters[foeOf(w, i)];
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
      if (s.pull > 0 && op.dodgeT === 0 && dist <= meleeSpecialRange(me.cfg, s, op.cfg) * 2.5 && Math.abs(op.y - me.y) <= MELEE_VREACH + 1) {
        const k = 14 * s.pull * tr(op.cfg).knockTaken;
        op.kx -= ((op.x - me.x) / dist) * k; op.kz -= ((op.z - me.z) / dist) * k;
        op.guarding = false; op.guardBroken = Math.max(op.guardBroken, 8);
        ms.pulled = true;
      }
      if (s.grab) {
        // 体が触れる距離でしか掴めない。外したら大きな隙
        if (dist <= grabRange(me.cfg, op.cfg) && op.crumple === 0 && Math.abs(op.y - me.y) <= MELEE_VREACH + s.vreach) { ms.grabbed = true; ev("grab"); }
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
      // ダイブ: 相手の いる方へ（高さも）飛びこむ
      const dd = s.dive ? [(op.x - me.x) / dist, (op.z - me.z) / dist] : dir;
      me.x += dd[0] * step; me.z += dd[1] * step;
      if (s.dive) { me.y += Math.max(-0.6, Math.min(0.6, op.y + 0.3 - me.y)); me.vy = 0; }
      ms.dashLeft -= step;
    }
    // つかみ: 掴んだ相手を手元に固定し、終わりに投げる
    if (ms.grabbed) {
      const hold = rad(me.cfg) + rad(op.cfg) + 0.1;
      op.x = me.x + dir[0] * hold; op.z = me.z + dir[1] * hold; op.y = Math.max(op.y, me.y); op.vy = 0;
      op.vx = op.vz = op.kx = op.kz = 0;
      op.stun = Math.max(op.stun, 3);
      op.guardStun = false;
    }
    // 地面たたき: 輪が広がる。輪の内側は安全
    if (ms.slamR > 0) {
      ms.slamR += 0.28;
      if (!ms.slamHit && Math.abs(dist - ms.slamR) < 0.5 && !airborne(w, op) && Math.abs(op.y - me.y) < 0.6) { // 地面を 伝わる（飛んでいる相手・別の高さには 届かない）
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
      if (dist <= reach && Math.abs(op.y - me.y) <= MELEE_VREACH + s.vreach && Math.acos(Math.max(-1, Math.min(1, facing))) <= s.arc) {
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
  const oi = foeOf(w, i);
  damage(w, oi, {
    by: i, amount: amount * w.fighters[i].st.special * w.fighters[i].ms.mult, src: "special", dx, dz, knock, stun: SPECIAL_STUN, x, z, h: w.fighters[oi].y + 1, size: 0, tags: s.tags,
    ignoreGuard, wobble: s.wobbleTicks, legbind: s.legbindTicks, crumple: s.crumpleTicks,
    net: s.netTicks, burn: s.burnTicks, launch: s.launch,
    lifesteal: s.lifesteal, freeze: s.freezeTicks, pierce: w.fighters[i].cfg.specialMod?.pierce ?? 0,
  });
}

// 弾が消える時の後始末（ばくはつ）。元の処理は stepProjectileCore
function stepProjectile(w: World, p: Projectile): boolean {
  if (p.emitter !== undefined) return stepEmitter(w, p);
  const alive = stepProjectileCore(w, p);
  const s = p.spec;
  if (!alive && s.blast > 0) {
    const ti = foeNear(w, w.fighters[p.owner].team, p.x, p.z);
    const target = w.fighters[ti];
    const ox = target.x - p.x, oz = target.z - p.z, ol = Math.hypot(ox, oz) || 1;
    w.events.push({ kind: "land", x: p.x, z: p.z, h: Math.max(0, p.h - groundAt(w.arena, p.x, p.z)), y: groundAt(w.arena, p.x, p.z), amount: 0, src: "special", target: p.owner, dx: 0, dz: 0, size: s.blast, tags: s.tags });
    if (ol <= s.blast + rad(target.cfg) && Math.abs(target.y + 0.9 - p.h) <= s.blast + 1) {
      damage(w, ti, {
        by: p.owner, amount: s.damage * 0.7 * p.mult * w.fighters[p.owner].st.special, src: "special", dx: ox / ol, dz: oz / ol, knock: 8, stun: SPECIAL_STUN,
        x: target.x, z: target.z, h: target.y + 1, size: s.blast, pid: p.id, tags: s.tags, lifesteal: s.lifesteal, freeze: s.freezeTicks, pierce: w.fighters[p.owner].cfg.specialMod?.pierce ?? 0,
        net: s.netTicks, shock: s.shockTicks, burn: s.burnTicks,
      });
    }
  }
  return alive;
}

// 上下の向きを 相手の高さへ 少しずつ 向ける（追尾）
function steerPitch(p: Projectile, target: Fighter, rate: number) {
  const hd = Math.max(0.5, Math.hypot(target.x - p.x, target.z - p.z));
  const want = (target.y + 1.0 - p.h) / hd;
  p.sl += Math.max(-rate, Math.min(rate, want - p.sl));
}

function stepProjectileCore(w: World, p: Projectile): boolean {
  const s = p.spec;
  const target = w.fighters[foeNear(w, w.fighters[p.owner].team, p.x, p.z)]; // 弾に いちばん 近い 相手
  p.age++;
  if (p.rehit > 0) p.rehit--;
  // すいこみ: 近くの相手を弾へ引き寄せる
  if (s.pull > 0 && target.dodgeT === 0) {
    const ox = p.x - target.x, oz = p.z - target.z, ol = Math.hypot(ox, oz);
    if (ol < 3.5 && ol > 0.3) { const k = s.pull * 0.075 * tr(target.cfg).knockTaken; target.kx += (ox / ol) * k; target.kz += (oz / ol) * k; }
  }
  const overlapping = Math.hypot(target.x - p.x, target.z - p.z) <= s.size + rad(target.cfg) && hurtHit(target, p.x, p.h, p.z, s.size);
  const moveScale = s.grind && overlapping ? 0.15 : 1; // 多段ヒットは相手に食い込んで削る
  // 地面に 止まって 待つ（おき罠・多段の着地）
  if (p.parked !== undefined) {
    p.h = groundAt(w.arena, p.x, p.z) + 0.3;
    if (p.age > p.parked) return false;
    return hitCheck(w, p, target);
  }
  // 雲から 落ちる しずく: まっすぐ 下へ 落ちる（分裂していれば 横へ 広がる）
  if (p.drop) {
    if (s.split > 0 && p.age === DROP_SPLIT_AGE) {
      const base = w.rng.next() * Math.PI * 2;
      for (let k = 0; k < 3 && room(w); k++) {
        const a = base + (k * Math.PI * 2) / 3;
        const cs: ProjSpec = { ...s, split: s.split - 1, damage: s.damage * 0.5 };
        w.spawn.push({ ...p, id: w.nextId++, spec: cs, dx: Math.cos(a), dz: Math.sin(a), vh: 2.5, age: 0, hitsLeft: cs.hits, rehit: 0 });
      }
      return false;
    }
    const v = (p.vh ?? 0) * DT * moveScale;
    p.x += p.dx * v; p.z += p.dz * v;
    p.h -= s.speed * DT * moveScale;
    const gnd = groundAt(w.arena, p.x, p.z);
    if (p.h <= gnd) {
      if (!park(p, s)) return false;
      p.drop = false;
    }
    return hitCheck(w, p, target);
  }
  // 分裂: 20tick で 3つに割れる（子は1世代少ない・威力半分）。打ち上げは 落ち始めに 割れる
  if (s.split > 0 && p.age === 20 && !s.meteor) {
    const cur = Math.atan2(p.dz, p.dx);
    for (const a of [-0.45, 0, 0.45]) {
      if (!room(w)) break;
      const cs: ProjSpec = { ...s, split: s.split - 1, damage: s.damage * 0.5 };
      w.spawn.push({ ...p, id: w.nextId++, spec: cs, dx: Math.cos(cur + a), dz: Math.sin(cur + a), age: 0, hitsLeft: cs.hits, rehit: 0 });
    }
    return false;
  }
  // ブーメラン＋おき罠: 行く とちゅうで 罠を 1つ 落として、本体は そのまま 戻ってくる
  if (s.boomerang && s.trap && p.age === 18 && room(w)) {
    const tp: Projectile = { ...p, id: w.nextId++, h: groundAt(w.arena, p.x, p.z) + 0.3, rehit: 0 };
    park(tp, s);
    w.spawn.push(tp);
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
    p.sl += Math.max(-0.1, Math.min(0.1, (me.y + 1 - p.h) / Math.max(0.5, Math.hypot(me.x - p.x, me.z - p.z)) - p.sl));
    if (p.age > 45 && Math.hypot(me.x - p.x, me.z - p.z) < 0.9) return false;
  }

  if (s.meteor) {
    // 0〜30tick: 上昇 / 30〜45: 滞空 / 45で狙い確定 / 以降: 落下（落ちる先の 地面の高さまで）
    const RISE = 30, HOVER = 15, FALL = Math.max(8, Math.round(24 * 9 / Math.max(1, s.speed)));
    const top = p.sh + 7;
    if (p.age <= RISE) {
      p.h = p.sh + (p.age / RISE) * 7;
    } else if (p.age <= RISE + HOVER) {
      if (p.age === RISE + HOVER) {
        p.tx = target.x; p.tz = target.z; p.sx = p.x; p.sz = p.z;
        // 分裂: 落ち始めに 割れて、相手の まわりへ 散らばって 落ちる（重ねた世代の分だけ まとめて割る）
        if (s.split > 0) {
          const n = Math.min(27, 3 ** s.split), ring = 1.2 + 0.5 * s.split, base = w.rng.next() * Math.PI * 2;
          // 相手の まわりに 散らばる分 よけにくいので、1つの 威力は まっすぐの 分裂より 低め（0.35 倍）
          const cs: ProjSpec = { ...s, split: 0, damage: s.damage * 0.35 ** s.split };
          for (let k = 0; k < n && room(w); k++) {
            const a = base + (k * Math.PI * 2) / n, r = k === 0 && n === 3 ? 0 : ring;
            w.spawn.push({ ...p, id: w.nextId++, spec: cs, tx: target.x + Math.cos(a) * r, tz: target.z + Math.sin(a) * r, hitsLeft: cs.hits, rehit: 0 });
          }
          return false;
        }
      }
    } else {
      // 落ちながら相手を追いかける（落下地点を毎 tick 相手の方へずらす。速さ METEOR_TRACK 単位/秒、追尾付きならさらに速い）
      const track = (METEOR_TRACK + s.homing * 0.5) * DT;
      const ex = target.x - p.tx, ez = target.z - p.tz, el = Math.hypot(ex, ez);
      if (el > 1e-6) { const k = Math.min(1, track / el); p.tx += ex * k; p.tz += ez * k; }
      const t = Math.min(1, (p.age - RISE - HOVER) / FALL);
      p.x = p.sx + (p.tx - p.sx) * t;
      p.z = p.sz + (p.tz - p.sz) * t;
      const gnd = groundAt(w.arena, p.x, p.z);
      p.h = top * (1 - t) + gnd * t;
      if (t >= 1 && p.age === RISE + HOVER + FALL) {
        w.events.push({ kind: "land", x: p.x, z: p.z, h: 0, y: gnd, amount: 0, src: "special", target: p.owner, dx: 0, dz: 0, size: s.size, tags: s.tags });
      }
      if (t >= 1 && p.age === RISE + HOVER + FALL && park(p, s)) return hitCheck(w, p, target); // おき罠・多段は 着地して 残る
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
      if (!s.meteor) steerPitch(p, target, s.homing * DT * 0.8);
    }
    // おき罠: 少し飛んだら 地面に止まって待つ。はね返りなら 地面を ころがって 跳ね終わってから 止まる。ブーメランは 手元で 止まる
    const trapNow = s.trap && !s.meteor && !s.boomerang && p.age > (s.split > 0 ? 22 : 18); // 分裂は 割れてから 止まる
    const rolling = trapNow && p.bouncesLeft > 0 && p.age < 240;
    if (trapNow && !rolling) {
      park(p, s);
      return hitCheck(w, p, target);
    } else if (!s.meteor) {
      const side = Math.sin(p.age * 0.25) * s.wobble * DT;
      const k = moveScale * (rolling ? 0.4 : 1);
      const nx = p.x + (p.dx * s.speed * DT - p.dz * side) * k;
      const nz = p.z + (p.dz * s.speed * DT + p.dx * side) * k;
      if (rolling) p.h = groundAt(w.arena, nx, nz) + 0.3;
      else if (s.ground) {
        // じめん波: 地面に そって進む。段差の かべに ぶつかると 消える
        const gn = groundAt(w.arena, nx, nz);
        if (gn > p.h - 0.4 + STEP) return false;
        p.h = gn + 0.4;
      } else p.h += p.sl * Math.hypot(nx - p.x, nz - p.z);
      p.x = nx; p.z = nz;
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
  // 地形（台・坂）に ぶつかったら 消える（地面より 下に 入った）
  if (!s.meteor && w.arena && p.h < groundAt(w.arena, p.x, p.z) - 0.05) return false;
  // 打ち上げ＋おき罠: 落ちてくる間は 当たらず、着地して 罠になる
  if (!(s.meteor && s.trap) && !hitCheck(w, p, target)) return false;
  if (p.age > s.lifetime + (s.meteor ? 45 : 0)) return false;
  if (Math.hypot(p.x, p.z) > ARENA_RADIUS + 4) return false;
  if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isFinite(p.h)) return false;
  return true;
}

// 地面に止めて 待たせる（おき罠は 長く、多段は 少しだけ 削り続ける）。止まらないなら false
function park(p: Projectile, s: ProjSpec): boolean {
  if (!s.trap && !s.grind) return false;
  p.parked = s.trap ? Math.max(p.age + 60, s.lifetime) : p.age + 40;
  p.vh = 0;
  return true;
}

// 当たり判定（地面の円＋高さ）。弾が 消えるなら false
function hitCheck(w: World, p: Projectile, target: Fighter): boolean {
  const s = p.spec;
  if (s.ground && airborne(w, target)) return true; // じめん波は 飛んでいる相手に 当たらない
  const near = Math.hypot(target.x - p.x, target.z - p.z) <= s.size + rad(target.cfg) + 0.6 && hurtHit(target, p.x, p.h, p.z, s.size);
  const rel = p.h - target.y;
  if (near && target.dodgeT === 0 && p.age > PROJ_ARM && rel - s.size <= BODY_HEIGHT && rel + s.size >= 0 && p.rehit === 0) {
    // 吹き飛ぶ向き: 落下弾は着弾点から外向き、それ以外は弾の進行方向
    let kdx = p.dx, kdz = p.dz;
    if (s.meteor || p.drop) {
      const ox = target.x - p.x, oz = target.z - p.z, ol = Math.hypot(ox, oz);
      if (ol > 0.01) { kdx = ox / ol; kdz = oz / ol; }
    }
    const restrain = s.restrainTicks > 0 && !target.guarding;
    damage(w, w.fighters.indexOf(target), {
      by: p.owner,
      amount: s.damage * p.mult * w.fighters[p.owner].st.special, src: "special", dx: kdx, dz: kdz,
      lifesteal: s.lifesteal, freeze: s.freezeTicks, pierce: w.fighters[p.owner].cfg.specialMod?.pierce ?? 0,
      net: s.netTicks, shock: s.shockTicks, burn: s.burnTicks,
      knock: restrain || s.grind ? 0.5 : p.drop ? 1.5 : 4 + s.damage * 0.35 + s.size * 2, stun: SPECIAL_STUN,
      x: p.x, z: p.z, h: p.h, size: s.size, pid: p.id, tags: s.tags, restrain: s.restrainTicks,
    });
    p.hitsLeft--;
    p.rehit = s.hitInterval;
    if (p.hitsLeft <= 0) return false;
  }
  return true;
}

export function step(w: World, inputs: Input[]) {
  w.events = []; // 決着後も必ず空にする（前の tick のイベントを繰り返し配らない）
  if (w.winner !== -1) return;
  if (w.hitstop > 0) { w.hitstop--; return; } // ヒットストップ中は全体が止まる（試合時間も進まない）
  w.tick++;
  // 処理順で先手が有利にならないよう、tick ごとに順番を入れ替える（たおれた キャラは 動かない）
  const n = w.fighters.length;
  pendingMelee = [];
  for (let k = 0; k < n; k++) {
    const i = (k + w.tick) % n;
    if (w.fighters[i].hp > 0 || n === 2) stepFighter(w, i, inputs[i] ?? NO_INPUT);
  }
  for (const [ti, hit] of pendingMelee) damage(w, ti, hit);
  for (const f of w.fighters) {
    if (f.hp <= 0 && n > 2) continue;
    moveH(w, f, (f.vx + f.kx) * DT, (f.vz + f.kz) * DT);
    f.kx *= KNOCK_DECAY; f.kz *= KNOCK_DECAY;
    if (Math.abs(f.kx) < 0.05) f.kx = 0;
    if (Math.abs(f.kz) < 0.05) f.kz = 0;
    const r = Math.hypot(f.x, f.z);
    const lim = ARENA_RADIUS - BODY_RADIUS;
    if (r > lim) { f.x *= lim / r; f.z *= lim / r; }
    moveV(w, f);
  }
  // 体同士の押し合い（同じくらいの 高さに いる時だけ）
  for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
    const a = w.fighters[p], b = w.fighters[q];
    if (n > 2 && (a.hp <= 0 || b.hp <= 0)) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
    const RR = rad(a.cfg) + rad(b.cfg);
    if (d > 0 && d < RR && Math.abs(a.y - b.y) < BODY_HEIGHT * 0.8) {
      const push = (RR - d) / 2;
      a.x -= (dx / d) * push; a.z -= (dz / d) * push;
      b.x += (dx / d) * push; b.z += (dz / d) * push;
    }
  }
  w.spawn = [];
  w.projectiles = w.projectiles.filter((p) => stepProjectile(w, p));
  if (w.spawn.length) w.projectiles.push(...w.spawn); // 分裂で生まれた弾は次の tick から動く

  // 見た目の 高さの基準（イベントの h は ここからの高さ）
  for (const e of w.events) if (e.y === undefined) e.y = w.fighters[e.target]?.y ?? 0;

  // 決着: チームの 全員が たおれたら 負け。時間切れは チームの 体力の 合計で くらべる
  const teamHp = (t: number) => w.fighters.reduce((a, f) => a + (f.team === t ? Math.max(0, f.hp) : 0), 0);
  const alive = (t: number) => w.fighters.some((f) => f.team === t && f.hp > 0);
  const [a0, a1] = [alive(0), alive(1)];
  if (!a0 || !a1) w.winner = !a0 && !a1 ? 2 : !a0 ? 1 : 0;
  else if (w.tick >= MATCH_TICKS) { const [ha, hb] = [teamHp(0), teamHp(1)]; w.winner = ha === hb ? 2 : ha > hb ? 0 : 1; }
}

// 横の移動: 歩いて 入れない 段差（かべ）の手前で 止まる。片方の向きだけ 通れるなら そちらへ すべる
function moveH(w: World, f: Fighter, dx: number, dz: number) {
  if (!w.arena) { f.x += dx; f.z += dz; return; }
  const ok = (x: number, z: number) => groundAt(w.arena, x, z) <= f.y + STEP;
  if (ok(f.x + dx, f.z + dz)) { f.x += dx; f.z += dz; }
  else if (ok(f.x + dx, f.z)) { f.x += dx; f.kz = 0; }
  else if (ok(f.x, f.z + dz)) { f.z += dz; f.kx = 0; }
  else { f.kx = f.kz = 0; }
}

// 上下の移動: はしご・飛ぶ・すべり降りる・落ちる。地面に めりこんだら 上に のせる
function moveV(w: World, f: Fighter) {
  const g = groundAt(w.arena, f.x, f.z);
  if (f.climb >= 0 && w.arena) {
    const l = w.arena.ladders[f.climb];
    f.x = l.x; f.z = l.z; f.vy = 0;
    f.y = Math.max(f.y, g) + CLIMB_SPEED * DT;
    if (f.y >= l.h) { f.y = l.h; f.x = l.x + l.nx * 0.9; f.z = l.z + l.nz * 0.9; f.climb = -1; }
    f.air = false;
    return;
  }
  if (f.flying && f.rising) f.vy += (FLY_RISE - f.vy) * 0.3;
  else if (f.flying && f.y > g + 0.01) f.vy = Math.max(f.vy - GRAVITY * DT, -GLIDE_FALL);
  else if (f.y > g + 0.01 || f.vy > 0) f.vy -= GRAVITY * DT;
  f.y += f.vy * DT;
  const cap = Math.min(CEILING, g + MAX_ALT);
  if (f.y > cap) { f.y = cap; if (f.vy > 0) f.vy = 0; }
  if (f.y <= g) { f.y = g; f.vy = 0; }
  else if (!f.flying && f.vy <= 0 && !f.air && f.y - g <= STEP) { f.y = g; f.vy = 0; } // 坂を 下りる時は 地面に そって
  f.air = f.y > g + 0.05;
}

// 状態の要約（決定性の確認用）
export function hashWorld(w: World): string {
  const r = (v: number) => Math.round(v * 1000);
  return JSON.stringify([
    w.tick, w.winner, w.rng.state(),
    w.fighters.map((f) => [r(f.x), r(f.z), r(f.y), r(f.hp), r(f.stamina), f.attack, f.rooted, f.stun, f.charge, f.ms.phase, f.wobble, f.legbind, f.crumple, f.shoveT, f.dodgeT, f.ice, f.big, f.net, f.burn, f.shock, f.climb]),
    w.projectiles.map((p) => [p.id, r(p.x), r(p.z), r(p.h), p.hitsLeft]),
  ]);
}
