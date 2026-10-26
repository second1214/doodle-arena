// 必殺パーツ＝シール（軽いハクスラ）。手に入れるたびに「できばえ（光り方）・威力・重さ・おまけ」がランダムに決まる。
// できばえ: ふつう / ✨キラ / 🌟ピカピカ。同じしゅるいのシールを かさねると ★が上がる（★5まで）。
// レア度（F〜SSS）は 敵の設定と 古い持ち物の 読みかえにだけ使う（画面には出さない）。
// パーツの数値は手に入れた時に確定して保存する（後で表を変えても、持っているパーツは変わらない）。
// 戦闘には「効果 ID の並び（重ねがけ込み）＋数値（威力倍率など）」だけを渡す。
import { EFFECTS, slotOf, type EffectId, type Slot } from "./sim/special";
import { MELEE_EFFECTS, type MeleeEffectId } from "./sim/melee";
import type { SpecialMod } from "./sim/world";

// SS・SSS は 合成で だけ 作れる（ドロップでは 出ない）
export type Rarity = "F" | "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";
export const RARITIES: Rarity[] = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"];
export const TOP_RARITY: Rarity = "SSS";
export const rarityIndex = (r: Rarity) => RARITIES.indexOf(r);

// 威力の幅・装備コストの倍率・おまけ効果の数（B は半分の確率で1つ）
export const RARITY_INFO: Record<Rarity, { roll: [number, number]; costMul: number; extras: number; color: string; shards: number }> = {
  F: { roll: [0.7, 0.85], costMul: 1.3, extras: 0, color: "#8a8f98", shards: 1 },
  E: { roll: [0.8, 0.95], costMul: 1.2, extras: 0, color: "#5c940d", shards: 2 },
  D: { roll: [0.9, 1.0], costMul: 1.1, extras: 0, color: "#1c7ed6", shards: 4 },
  C: { roll: [0.95, 1.1], costMul: 1.0, extras: 0, color: "#0c8599", shards: 8 },
  B: { roll: [1.05, 1.2], costMul: 0.9, extras: 0.5, color: "#7048e8", shards: 16 },
  A: { roll: [1.15, 1.3], costMul: 0.8, extras: 1, color: "#e8590c", shards: 32 },
  S: { roll: [1.25, 1.4], costMul: 0.7, extras: 2, color: "#e03131", shards: 64 },
  SS: { roll: [1.35, 1.5], costMul: 0.6, extras: 3, color: "#d6336c", shards: 128 },
  SSS: { roll: [1.45, 1.6], costMul: 0.5, extras: 4, color: "#ae3ec9", shards: 256 },
};

// パーツの種類: 効果パーツ（遠距離8・近接9）＋ 能力パーツ
export type StatKind = "power" | "pspeed" | "duration" | "windup" | "charge"
  | "bigger" | "lucky" | "carry" | "pierce";
export type PartKind = `r:${EffectId}` | `m:${MeleeEffectId}` | StatKind;
export type PartType = "ranged" | "melee" | "both";

interface KindInfo { name: string; type: PartType; baseCost: number; desc: string }
const STAT_KINDS: Record<StatKind, KindInfo> = {
  power: { name: "威力アップ", type: "both", baseCost: 4, desc: "必殺の威力が上がる" },
  pspeed: { name: "弾速アップ", type: "ranged", baseCost: 3, desc: "弾が速くなる" },
  duration: { name: "効き目延長", type: "both", baseCost: 3, desc: "拘束・グニャグニャ・足封じ・くしゃくしゃが長くなる" },
  windup: { name: "構え短縮", type: "melee", baseCost: 3, desc: "近接必殺の構えが短くなる" },
  charge: { name: "発動ポイント−1", type: "both", baseCost: 6, desc: "必殺に必要な命中が1回減る（2個目からは装備コスト2倍）" },
  // 新しい能力パーツ（両用）
  bigger: { name: "大きさアップ", type: "both", baseCost: 3, desc: "弾が大きく、近接は届く距離が少し長くなる" },
  lucky: { name: "ラッキー会心", type: "both", baseCost: 4, desc: "ときどき必殺の威力が2倍になる" },
  carry: { name: "ゲージのこし", type: "both", baseCost: 5, desc: "必殺を出してもゲージが少し残る（2個目からは装備コスト2倍）" },
  pierce: { name: "ガードやぶり", type: "both", baseCost: 5, desc: "防御されても必殺のダメージが通りやすい" },
};

// 効果パーツの一言説明（何が起きるかが分かるように）
const EFFECT_DESC: Record<string, string> = {
  "r:invisible": "弾が見えない", "r:giant": "弾がとても大きい（少し遅い）", "r:multi": "当たると何回も削る", "r:restrain": "当たると動けなくなる",
  "r:tiny": "小さいけど とても痛い", "r:fast": "弾がとても速い", "r:homing": "ゆらゆら追いかける", "r:meteor": "空から落ちてくる",
  "r:split": "とちゅうで3つに分かれる", "r:bounce": "かべで はね返る", "r:boomerang": "行って もどってくる", "r:trap": "地面に置いて 踏むのを待つ",
  "r:vacuum": "近くの相手を すいよせる", "r:drain": "当てた分 体力が回復", "r:freeze": "足元がこおって すべる", "r:blast": "消える時に ばくはつ",
  "m:giantHands": "手が大きくなって 遠くまで届く", "m:rubber": "いちばん長い手が のびる", "m:tornado": "回って まわりを何回も殴る", "m:dash": "前へ走りぬける",
  "m:slam": "跳んで地面をたたく（輪の内側は安全）", "m:grab": "つかんで投げる（防御できない）", "m:wobble": "相手の操作が グニャグニャ逆に", "m:legbind": "相手の足が使えなくなる",
  "m:crumple": "相手が紙くずになって転がる", "m:magnet": "相手を手元へ引きよせる", "m:vampire": "殴った分 体力が回復", "m:ice": "相手の足元がこおって すべる",
  "m:counter": "構え中に殴られたら 2倍で返す",
  "m:shockwave": "わざを 出すたびに 相手へ しょうげき波が 飛ぶ（重ねると 増える）", "m:rush": "わざを もう1回 くり出す（重ねると 何回も）", "m:echo": "当てた所に ざんぞうが のこって もう一度 当たる",
  "r:wave": "地面を はって進む（飛んでいる相手には 当たらない）", "r:net": "当たると 飛べなくなって 落ちる", "r:thunder": "当たると しびれて 攻撃できない",
  "r:rain": "相手の上に 雲を出して しずくを 落とす", "r:cloud": "相手の上の 雲から 落ちてくる", "r:drip": "6回に分けて 少しずつ 撃つ", "r:fire": "当たると しばらく やけどで へる",
  "m:uppercut": "上の相手にも届く。当てると 打ち上げる", "m:dive": "跳んで 相手へ 飛びこむ（空の相手にも）", "m:gust": "まわりを 吹き飛ばし、飛んでいる相手を 落とす", "m:flame": "殴ると しばらく やけど", "m:mushroom": "しばらく大きく強くなる（本体は弱い）", "m:bulldozer": "吹き飛ばさずに押しこむ（かべで追加ダメージ）",
};

export function kindInfo(kind: PartKind): KindInfo {
  if (kind.startsWith("r:")) {
    const e = EFFECTS.find((x) => x.id === kind.slice(2))!;
    return { name: `${e.name}(遠)`, type: "ranged", baseCost: e.cost, desc: EFFECT_DESC[kind] ?? "遠距離の必殺に付ける効果" };
  }
  if (kind.startsWith("m:")) {
    const e = MELEE_EFFECTS.find((x) => x.id === kind.slice(2))!;
    return { name: `${e.name}(近)`, type: "melee", baseCost: e.cost, desc: EFFECT_DESC[kind] ?? "近接の必殺に付ける効果" };
  }
  return STAT_KINDS[kind as StatKind];
}

// 見た目用のアイコン（子どもにも分かるように）
const KIND_ICON: Record<string, string> = {
  "r:invisible": "👻", "r:giant": "🪨", "r:multi": "💫", "r:restrain": "⛓️", "r:tiny": "🫘", "r:fast": "⚡", "r:homing": "🐝", "r:meteor": "☄️",
  "m:giantHands": "🖐️", "m:rubber": "🥊", "m:tornado": "🌪️", "m:dash": "💨", "m:slam": "🔨", "m:grab": "🤲", "m:wobble": "😵‍💫", "m:legbind": "🦶", "m:crumple": "📄",
 
  "r:split": "🎆", "r:bounce": "🏓", "r:boomerang": "🪃", "r:trap": "🪤", "r:vacuum": "🌀", "r:drain": "🧛", "r:freeze": "🧊", "r:blast": "💣",
  "r:wave": "🌊", "r:net": "🕸️", "r:thunder": "🌩️", "r:rain": "🌧️", "r:cloud": "☁️", "r:drip": "⏱️", "r:fire": "🔥",
  "m:uppercut": "🆙", "m:dive": "🦅", "m:gust": "🌬️", "m:flame": "♨️",
  "m:shockwave": "💥", "m:rush": "👊", "m:echo": "👥",
  "m:magnet": "🧲", "m:vampire": "🦇", "m:ice": "⛸️", "m:counter": "🔄", "m:mushroom": "🍄", "m:bulldozer": "🚜",
  bigger: "🎈", lucky: "🍀", carry: "🔁", pierce: "🗡️",
  power: "💪", pspeed: "🏹", duration: "⏳", windup: "⏩", charge: "🔋",
};
export const kindIcon = (kind: PartKind) => KIND_ICON[kind] ?? "✨";

// シールが 入る 枠（遠距離: とびかた/ふるまい/こうか、近接: うごき/わざ/こうか）。能力パーツは こうか
export function partSlot(kind: PartKind): Slot {
  if (kind.startsWith("r:")) return slotOf(kind.slice(2) as EffectId);
  if (kind.startsWith("m:")) return MELEE_EFFECTS.find((x) => x.id === kind.slice(2))?.slot ?? "fx";
  return "fx";
}
export const SLOT_LABEL: Record<"ranged" | "melee", Record<Slot, [string, string]>> = {
  ranged: { path: ["🛤️", "とびかた"], act: ["🔀", "ふるまい"], fx: ["✨", "こうか"] },
  melee: { path: ["🏃", "うごき"], act: ["🖐️", "わざ"], fx: ["✨", "こうか"] },
};

export const ALL_KINDS: PartKind[] = [
  ...EFFECTS.map((e) => `r:${e.id}` as PartKind),
  ...MELEE_EFFECTS.map((e) => `m:${e.id}` as PartKind),
  ...(Object.keys(STAT_KINDS) as StatKind[]),
];
export const isKind = (k: string): k is PartKind => (ALL_KINDS as string[]).includes(k);

// おまけ効果（B 以上）
export type ExtraStat = "power" | "pspeed" | "duration" | "windup";
export interface Extra { stat: ExtraStat; value: number }
const EXTRA_BASE: Record<ExtraStat, number> = { power: 0.08, pspeed: 0.12, duration: 0.12, windup: 1 };
const EXTRA_KEYS = Object.keys(EXTRA_BASE) as ExtraStat[];

// できばえ（光り方）: 威力の幅と 重さ（装備コスト）の倍率
export type Shine = 0 | 1 | 2;
export const SHINE_INFO: Record<Shine, { name: string; icon: string; roll: [number, number]; costMul: number; color: string }> = {
  0: { name: "ふつう", icon: "", roll: [0.85, 1.0], costMul: 1.1, color: "#8a8f98" },
  1: { name: "キラ", icon: "✨", roll: [1.0, 1.15], costMul: 0.95, color: "#1c7ed6" },
  2: { name: "ピカピカ", icon: "🌟", roll: [1.15, 1.3], costMul: 0.8, color: "#e8590c" },
};
export const MAX_STAR = 5;
export const MAX_EXTRAS = 3;
const STAR_ROLL = 0.05; // ★1つで 威力 +5%（★3・★5 で 重さ −1）

export interface Part {
  id: string;
  kind: PartKind;
  shine: Shine;
  star: number; // 1〜5（同じしゅるいを かさねると 上がる）
  q: number; // できばえの幅の中の 位置（0〜1。手に入れた時に決まる）
  cj: number; // 重さの 個体差（−1〜+1）
  roll: number; // 威力の倍率（shine・q・star から計算。recalc）
  cost: number; // 装備コスト（shine・cj・star から計算）
  extras: Extra[];
  locked?: boolean; // 🔒 鍵（まちがえて かさねる材料にしない）
  rarity?: Rarity; // 古い形（読み込み時に shine・star へ移す）
}

const round2 = (v: number) => Math.round(v * 100) / 100;

export function recalc(p: Part): Part {
  const info = SHINE_INFO[p.shine];
  p.roll = round2(info.roll[0] + (info.roll[1] - info.roll[0]) * p.q + STAR_ROLL * (p.star - 1));
  p.cost = Math.max(1, Math.round(kindInfo(p.kind).baseCost * info.costMul) + p.cj - Math.floor((p.star - 1) / 2));
  return p;
}

function rollExtras(n: number, rnd: () => number): Extra[] {
  const extras: Extra[] = [];
  for (let k = 0; k < n; k++) {
    const stat = EXTRA_KEYS[Math.floor(rnd() * EXTRA_KEYS.length)];
    extras.push({ stat, value: stat === "windup" ? 1 : round2(EXTRA_BASE[stat] * (0.75 + rnd() * 0.5)) });
  }
  return extras;
}

// シールを1枚作る。rnd は 0〜1 の乱数（ドロップは Math.random、敵はシード固定）。extrasN を省くと できばえで決める
export function makeSticker(kind: PartKind, shine: Shine, star: number, rnd: () => number, id = newPartId(rnd), extrasN?: number): Part {
  const q = round2(rnd());
  const cj = Math.floor(rnd() * 3) - 1;
  const n = extrasN ?? (shine === 0 ? (rnd() < 0.3 ? 1 : 0) : shine === 1 ? 1 : rnd() < 0.5 ? 2 : 1);
  return recalc({ id, kind, shine, star: Math.max(1, Math.min(MAX_STAR, star)), q, cj, roll: 0, cost: 0, extras: rollExtras(n, rnd) });
}

// 古いレア度 → できばえ と ★（敵の設定・前の持ち物）
const FROM_RARITY: Record<Rarity, [Shine, number]> = { F: [0, 1], E: [0, 1], D: [0, 2], C: [1, 1], B: [1, 2], A: [1, 3], S: [2, 2], SS: [2, 4], SSS: [2, 5] };
export const fromRarity = (r: Rarity) => ({ shine: FROM_RARITY[r][0], star: FROM_RARITY[r][1] });

// レア度で 作る（敵・オンラインの門番。おまけの数は 前と同じにして 強さを変えない）
export function makePart(kind: PartKind, rarity: Rarity, rnd: () => number, id = newPartId(rnd)): Part {
  const { shine, star } = fromRarity(rarity);
  const ex = RARITY_INFO[rarity].extras;
  const p = makeSticker(kind, shine, star, rnd, id, ex >= 1 ? ex : rnd() < ex ? 1 : 0);
  return p;
}

// 前の形（レア度つき）の パーツを シールに 読みかえる。威力・重さの 個体差は できるだけ 残す
export function upgradePart(p: Part): Part {
  if (p.shine !== undefined && p.star !== undefined) return p;
  const r: Rarity = p.rarity && RARITIES.includes(p.rarity) ? p.rarity : "C";
  const info = RARITY_INFO[r];
  const { shine, star } = fromRarity(r);
  const q = Math.max(0, Math.min(1, (p.roll - info.roll[0]) / (info.roll[1] - info.roll[0] || 1)));
  const cj = Math.max(-1, Math.min(1, Math.round((p.cost ?? 0) - Math.round(kindInfo(p.kind).baseCost * info.costMul))));
  const { rarity: _old, ...rest } = p;
  return recalc({ ...rest, shine, star, q: round2(q), cj, extras: Array.isArray(p.extras) ? p.extras : [] });
}

export const shineText = (p: Pick<Part, "shine">) => `${SHINE_INFO[p.shine].icon}${SHINE_INFO[p.shine].name}`;
export const starText = (p: Pick<Part, "star">) => "★".repeat(p.star) + "☆".repeat(MAX_STAR - p.star);
// 強さの ならびかえ用（できばえ → 威力 → おまけ）
export const partScore = (p: Part) => p.shine * 10 + p.roll + p.extras.length * 0.05;

export function newPartId(rnd: () => number = Math.random): string {
  return Date.now().toString(36) + Math.floor(rnd() * 1e9).toString(36);
}

// パーツの主な効果（表示用の一行）
export function mainText(p: Part): string {
  switch (p.kind) {
    case "power": return `必殺の威力 +${Math.round(25 * p.roll)}%`;
    case "pspeed": return `弾の速さ +${Math.round(30 * p.roll)}%`;
    case "duration": return `状態異常の時間 +${Math.round(30 * p.roll)}%`;
    case "windup": return `近接必殺の構え −${Math.max(1, Math.round(3 * p.roll))}コマ`;
    case "charge": return "必殺に必要な命中 −1回";
    case "bigger": return `大きさ +${Math.round(40 * p.roll)}%`;
    case "lucky": return `会心(威力2倍)の確率 +${Math.round(20 * p.roll)}%`;
    case "carry": return `撃った後のゲージ +${Math.round(p.roll * 10) / 10}`;
    case "pierce": return `防御を貫く +${Math.round(40 * p.roll)}%`;
    default: return `威力 ${Math.round(p.roll * 100)}%`;
  }
}
export function extraText(e: Extra): string {
  switch (e.stat) {
    case "power": return `威力 +${Math.round(e.value * 100)}%`;
    case "pspeed": return `弾速 +${Math.round(e.value * 100)}%`;
    case "duration": return `時間 +${Math.round(e.value * 100)}%`;
    case "windup": return `構え −${e.value}`;
  }
}

export const fitsType = (p: Part, type: "ranged" | "melee") => {
  const t = kindInfo(p.kind).type;
  return t === "both" || t === type;
};

// 装備した時のコスト（発動ポイント−1 は2個目から2倍）
// 発動ポイント−1 とゲージのこしは、2個目からコスト2倍（重ねると必殺が撃ち放題になるため。測定: ゲージのこし×4 で勝率75%）
export function equipCosts(parts: Part[]): number[] {
  const seen = { charge: 0, carry: 0 };
  return parts.map((p) => (p.kind === "charge" || p.kind === "carry") && seen[p.kind]++ > 0 ? p.cost * 2 : p.cost);
}
export const SPECIAL_BUDGET = 20;

export interface BuiltSpecial {
  special: EffectId[];
  melee: MeleeEffectId[];
  mod: SpecialMod;
  chargeDelta: number; // 必殺に必要な命中の増減
  cost: number;
}

// 装備したパーツ → 戦闘に渡す数値。効果パーツの威力は (出来−1) を足し合わせる（F は威力を下げ、S は上げる）
export function buildSpecial(parts: Part[], type: "ranged" | "melee"): BuiltSpecial {
  const use = parts.filter((p) => fitsType(p, type));
  const out: BuiltSpecial = { special: [], melee: [], mod: { power: 1, speed: 1, duration: 1, windup: 0, size: 1, crit: 0, carry: 0, pierce: 0 }, chargeDelta: 0, cost: equipCosts(use).reduce((a, c) => a + c, 0) };
  for (const p of use) {
    if (p.kind.startsWith("r:")) { out.special.push(p.kind.slice(2) as EffectId); out.mod.power += p.roll - 1; }
    else if (p.kind.startsWith("m:")) { out.melee.push(p.kind.slice(2) as MeleeEffectId); out.mod.power += p.roll - 1; }
    else if (p.kind === "power") out.mod.power += 0.25 * p.roll;
    else if (p.kind === "pspeed") out.mod.speed += 0.3 * p.roll;
    else if (p.kind === "duration") out.mod.duration += 0.3 * p.roll;
    else if (p.kind === "windup") out.mod.windup += Math.max(1, Math.round(3 * p.roll));
    else if (p.kind === "charge") out.chargeDelta -= 1;
    else if (p.kind === "bigger") out.mod.size! += 0.4 * p.roll; // 重ねがけは足し算
    else if (p.kind === "lucky") out.mod.crit! += 0.2 * p.roll; // 1 を超えたら毎回会心（上限なし・コストで釣り合わせる）
    else if (p.kind === "carry") out.mod.carry! += p.roll; // 必要数以上なら撃ち放題（壊れ方の一つ）
    else if (p.kind === "pierce") out.mod.pierce! += 0.4 * p.roll; // 1 で防御が無意味に
    for (const e of p.extras) {
      if (e.stat === "power") out.mod.power += e.value;
      else if (e.stat === "pspeed") out.mod.speed += e.value;
      else if (e.stat === "duration") out.mod.duration += e.value;
      else out.mod.windup += e.value;
    }
  }
  out.mod = { power: round2(out.mod.power), speed: round2(out.mod.speed), duration: round2(out.mod.duration), windup: out.mod.windup,
    size: round2(out.mod.size!), crit: round2(out.mod.crit!), carry: round2(out.mod.carry!), pierce: round2(out.mod.pierce!) };
  return out;
}

// --- ドロップ ---
// 章ごとのレア度の出やすさ（F/E/D/C/B/A/S の %）
export const DROP_TABLE: number[][] = [
  [45, 35, 15, 5, 0, 0, 0],
  [20, 35, 30, 12, 3, 0, 0],
  [5, 20, 35, 28, 10, 2, 0],
  [0, 8, 25, 35, 24, 7, 1],
  [0, 0, 12, 33, 35, 16, 4],
  [0, 0, 5, 25, 38, 25, 7], // 第6章
  [0, 0, 0, 18, 40, 32, 10], // 第7章
];
export const PITY = 20; // ピカピカが この回数 出なければ 次は ピカピカ確定

// 章ごとの できばえの出やすさ（ふつう / キラ / ピカピカ の %）
export const SHINE_TABLE: number[][] = [
  [85, 15, 0],
  [70, 28, 2],
  [55, 40, 5],
  [45, 45, 10],
  [35, 50, 15],
  [30, 50, 20], // 第6章
  [25, 50, 25], // 第7章
];
export function rollShine(chapter: number, rnd: () => number): Shine {
  const row = SHINE_TABLE[Math.max(0, Math.min(SHINE_TABLE.length - 1, chapter - 1))];
  let x = rnd() * 100;
  for (let i = 0; i < row.length; i++) { x -= row[i]; if (x < 0) return i as Shine; }
  return 0;
}

export function rollRarity(chapter: number, rnd: () => number): Rarity {
  const row = DROP_TABLE[Math.max(0, Math.min(DROP_TABLE.length - 1, chapter - 1))];
  let x = rnd() * 100;
  for (let i = 0; i < row.length; i++) { x -= row[i]; if (x < 0) return RARITIES[i]; }
  return "C";
}
export const randomKind = (rnd: () => number) => ALL_KINDS[Math.floor(rnd() * ALL_KINDS.length)];

// 敵用: 決まった種類・レア度のパーツを、シードから毎回同じ数値で作る
export function seededRnd(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export function hashStr(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
