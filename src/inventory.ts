// 持っている必殺シール（プレイヤー共通・ブラウザ内に保存）。ドロップ・かさねる（★アップ）・鍵。
// 前の形（レア度・かけら・分解・合成）は 読み込み時に シールへ 読みかえる。
import { ALL_KINDS, fromRarity, isKind, makeSticker, MAX_EXTRAS, MAX_STAR, partScore, PITY, recalc, rollShine, upgradePart, type Part, type PartKind, type Rarity, type Shine } from "./items";

const KEY = "doodle-arena:inventory";
export const INVENTORY_CAP = 300;

export interface Inventory {
  v: 2;
  parts: Part[];
  sincePika: number; // ピカピカが 出ていない回数（救済用）
}

function valid(p: Partial<Part>): p is Part {
  return typeof p?.id === "string" && typeof p.kind === "string" && isKind(p.kind) && typeof p.roll === "number" && typeof p.cost === "number" && Array.isArray(p.extras);
}

// 無ければ null（初回の移行判定に使う）
export function loadInventoryRaw(): Inventory | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const d = JSON.parse(s) as { parts?: Part[]; sincePika?: number };
    const parts = Array.isArray(d.parts) ? d.parts.filter(valid).map(upgradePart) : [];
    return { v: 2, parts, sincePika: Math.max(0, Number(d.sincePika) || 0) };
  } catch {
    return null;
  }
}
export const loadInventory = (): Inventory => loadInventoryRaw() ?? { v: 2, parts: [], sincePika: 0 };
export function saveInventory(inv: Inventory): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(inv));
    return true;
  } catch {
    return false;
  }
}

export interface DropResult { got: Part[]; fed: Part[]; lost: number }

// まだ持っていない しゅるいは 出やすく（2倍）＝しゅるいが 増えても 新しいシールに 出会える
function pickKind(inv: Inventory, rnd: () => number): PartKind {
  const owned = new Set(inv.parts.map((x) => x.kind));
  const pool = ALL_KINDS.flatMap((k) => (owned.has(k) ? [k] : [k, k]));
  return pool[Math.floor(rnd() * pool.length)];
}

// 持ち物に入れる。いっぱいなら 同じしゅるいの シールに 自動で かさねる（できなければ なくなる）
function store(inv: Inventory, p: Part, res: DropResult) {
  if (inv.parts.length < INVENTORY_CAP) { inv.parts.push(p); res.got.push(p); return; }
  const base = inv.parts.filter((x) => x.kind === p.kind && x.star < MAX_STAR).sort((a, b) => partScore(b) - partScore(a))[0];
  if (base) { stack(base, p, p.extras.length ? 0 : -1); res.fed.push(base); } else res.lost++;
}

// ストーリーの勝利報酬: 1枚（ボスは2枚で、うち1枚は できばえ1段上。ラスボスは その1枚が ピカピカ）
export function dropParts(chapter: number, boss: boolean, rnd: () => number = Math.random, final = false, count?: number): DropResult {
  const inv = loadInventory();
  const res: DropResult = { got: [], fed: [], lost: 0 };
  const n = count ?? (boss ? 2 : 1);
  for (let k = 0; k < n; k++) {
    let sh = rollShine(chapter, rnd);
    if (boss && k === 0) sh = Math.min(2, sh + 1) as Shine;
    if (final && k === 0) sh = 2;
    if (inv.sincePika + 1 >= PITY) sh = 2;
    inv.sincePika = sh === 2 ? 0 : inv.sincePika + 1;
    store(inv, makeSticker(pickKind(inv, rnd), sh, 1, rnd), res);
  }
  saveInventory(inv);
  return res;
}

// 決まったレア度相当の シールを1枚もらう（オンライン対戦の報酬）
export function dropPartOfRarity(rarity: Rarity, rnd: () => number = Math.random): DropResult {
  const inv = loadInventory();
  const res: DropResult = { got: [], fed: [], lost: 0 };
  store(inv, makeSticker(pickKind(inv, rnd), fromRarity(rarity).shine, 1, rnd), res);
  saveInventory(inv);
  return res;
}

// --- かさねる: 同じしゅるいの シールを 1枚 のせると ★が1つ上がる（★5まで）。
// できばえは 良い方に なり、のせた シールの おまけを 1つ もらえる（空きが あれば）。のせた シールは なくなる
export const canBeMaterial = (p: Part, equipped: Set<string>) => !p.locked && !equipped.has(p.id);
export const canStack = (base: Part, mat: Part, equipped: Set<string>) =>
  base.id !== mat.id && base.kind === mat.kind && base.star < MAX_STAR && canBeMaterial(mat, equipped);

function stack(base: Part, mat: Part, takeExtra: number) {
  base.star = Math.min(MAX_STAR, base.star + 1);
  if (mat.shine > base.shine) { base.shine = mat.shine; base.q = mat.q; }
  else if (mat.shine === base.shine) base.q = Math.max(base.q, mat.q);
  base.cj = Math.min(base.cj, mat.cj); // 軽い方
  const e = mat.extras[takeExtra];
  if (e && base.extras.length < MAX_EXTRAS) base.extras = [...base.extras, e];
  recalc(base);
}

export function stackInto(baseId: string, matId: string, equipped: Set<string>, takeExtra = -1): Part | null {
  const inv = loadInventory();
  const base = inv.parts.find((p) => p.id === baseId);
  const mat = inv.parts.find((p) => p.id === matId);
  if (!base || !mat || !canStack(base, mat, equipped)) return null;
  stack(base, mat, takeExtra);
  inv.parts = inv.parts.filter((p) => p.id !== mat.id);
  saveInventory(inv);
  return base;
}

// まとめて かさねる: しゅるいごとに いちばん良い（装備中なら それ）シールへ、のこりを 弱い順に かさねる。
// 装備中・🔒は 材料にしない。おまけは 空きが あれば いちばん 大きいものを もらう
export interface StackPlan { baseId: string; matIds: string[] }
export function planStacks(parts: Part[], equipped: Set<string>): StackPlan[] {
  const out: StackPlan[] = [];
  const kinds = [...new Set(parts.map((p) => p.kind))];
  for (const k of kinds) {
    const list = parts.filter((p) => p.kind === k);
    if (list.length < 2) continue;
    const base = [...list].sort((a, b) => Number(equipped.has(b.id)) - Number(equipped.has(a.id)) || partScore(b) - partScore(a))[0];
    const mats = list.filter((p) => p.id !== base.id && canBeMaterial(p, equipped)).sort((a, b) => partScore(a) - partScore(b)).slice(0, MAX_STAR - base.star);
    if (mats.length) out.push({ baseId: base.id, matIds: mats.map((m) => m.id) });
  }
  return out;
}
export function stackAll(equipped: Set<string>): Part[] {
  const inv = loadInventory();
  const made: Part[] = [];
  for (const pl of planStacks(inv.parts, equipped)) {
    const base = inv.parts.find((p) => p.id === pl.baseId)!;
    for (const id of pl.matIds) {
      const mat = inv.parts.find((p) => p.id === id)!;
      const best = mat.extras.reduce((bi, e, i, a) => (bi < 0 || e.value > a[bi].value ? i : bi), -1);
      stack(base, mat, best);
    }
    inv.parts = inv.parts.filter((p) => !pl.matIds.includes(p.id));
    made.push(base);
  }
  saveInventory(inv);
  return made;
}

// 鍵の付け外し
export function toggleLock(id: string): boolean {
  const inv = loadInventory();
  const p = inv.parts.find((x) => x.id === id);
  if (!p) return false;
  p.locked = !p.locked;
  saveInventory(inv);
  return !!p.locked;
}

// 初回だけ: 今までの必殺（効果の選択）を キラ★1 の標準シール（威力 1.0・おまけ無し）に置き換える。最初の手持ちとして 追尾(遠)・竜巻(近) も配る。
// 戻り値: 種類 → 作ったシール id（キャラの装備の置き換えに使う）
export function migrateToParts(usedKinds: PartKind[]): Map<PartKind, string> | null {
  if (loadInventoryRaw()) return null;
  const kinds = [...new Set<PartKind>(["r:homing", "m:tornado", ...usedKinds])];
  const map = new Map<PartKind, string>();
  const inv: Inventory = { v: 2, parts: [], sincePika: 0 };
  for (const k of kinds) {
    const p = makeSticker(k, 1, 1, () => 0.5, `start-${k.replace(":", "-")}`, 0);
    p.q = 0; p.cj = 0;
    recalc(p);
    inv.parts.push(p);
    map.set(k, p.id);
  }
  saveInventory(inv);
  return map;
}
