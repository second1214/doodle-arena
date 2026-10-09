// 持っている必殺パーツ（プレイヤー共通・ブラウザ内に保存）。ドロップ・分解・合成・振り直し。
import { isKind, makePart, PITY, RARITIES, RARITY_INFO, rarityIndex, randomKind, rollRarity, type Part, type PartKind, type Rarity } from "./items";

const KEY = "doodle-arena:inventory";
export const INVENTORY_CAP = 300;
export const COMBINE_COUNT = 5;

export interface Inventory {
  v: 1;
  parts: Part[];
  shards: number; // かけら（分解でもらう・振り直しに使う）
  sinceA: number; // A 以上が出ていない回数（救済用）
}

function valid(p: Partial<Part>): p is Part {
  return typeof p?.id === "string" && typeof p.kind === "string" && isKind(p.kind) && RARITIES.includes(p.rarity as Rarity)
    && typeof p.roll === "number" && typeof p.cost === "number" && Array.isArray(p.extras);
}

// 無ければ null（初回の移行判定に使う）
export function loadInventoryRaw(): Inventory | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const d = JSON.parse(s) as Partial<Inventory>;
    return { v: 1, parts: Array.isArray(d.parts) ? d.parts.filter(valid) : [], shards: Math.max(0, Number(d.shards) || 0), sinceA: Math.max(0, Number(d.sinceA) || 0) };
  } catch {
    return null;
  }
}
export const loadInventory = (): Inventory => loadInventoryRaw() ?? { v: 1, parts: [], shards: 0, sinceA: 0 };
export function saveInventory(inv: Inventory): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(inv));
    return true;
  } catch {
    return false;
  }
}

export interface DropResult { got: Part[]; shardsInstead: number }

// ストーリーの勝利報酬: 1個（ボスは2個で、うち1個は1段上のレア度を保証）。持ち物がいっぱいなら、かけらに変える
export function dropParts(chapter: number, boss: boolean, rnd: () => number = Math.random): DropResult {
  const inv = loadInventory();
  const res: DropResult = { got: [], shardsInstead: 0 };
  const n = boss ? 2 : 1;
  for (let k = 0; k < n; k++) {
    let r = rollRarity(chapter, rnd);
    if (boss && k === 0) r = RARITIES[Math.min(RARITIES.length - 1, rarityIndex(r) + 1)];
    if (inv.sinceA + 1 >= PITY && rarityIndex(r) < rarityIndex("A")) r = "A";
    inv.sinceA = rarityIndex(r) >= rarityIndex("A") ? 0 : inv.sinceA + 1;
    const p = makePart(randomKind(rnd), r, rnd);
    if (inv.parts.length >= INVENTORY_CAP) { inv.shards += RARITY_INFO[r].shards; res.shardsInstead += RARITY_INFO[r].shards; }
    else { inv.parts.push(p); res.got.push(p); }
  }
  saveInventory(inv);
  return res;
}

export function dismantle(id: string): number {
  const inv = loadInventory();
  const p = inv.parts.find((x) => x.id === id);
  if (!p) return 0;
  inv.parts = inv.parts.filter((x) => x.id !== id);
  inv.shards += RARITY_INFO[p.rarity].shards;
  saveInventory(inv);
  return RARITY_INFO[p.rarity].shards;
}

export const rerollCost = (r: Rarity) => RARITY_INFO[r].shards * 2;

// 振り直し: 種類とレア度はそのまま、威力・コスト・おまけ効果を引き直す（装備したままでよい）
export function reroll(id: string, rnd: () => number = Math.random): Part | null {
  const inv = loadInventory();
  const i = inv.parts.findIndex((x) => x.id === id);
  if (i < 0 || inv.shards < rerollCost(inv.parts[i].rarity)) return null;
  const old = inv.parts[i];
  inv.shards -= rerollCost(old.rarity);
  inv.parts[i] = makePart(old.kind, old.rarity, rnd, old.id);
  saveInventory(inv);
  return inv.parts[i];
}

// 合成: 同じ種類・同じレア度を5個 → 1段上を1個（使うのは装備していないもの）
export function combinable(kind: PartKind, rarity: Rarity, equipped: Set<string>): Part[] {
  return loadInventory().parts.filter((p) => p.kind === kind && p.rarity === rarity && !equipped.has(p.id));
}
export function combine(kind: PartKind, rarity: Rarity, equipped: Set<string>, rnd: () => number = Math.random): Part | null {
  if (rarity === "S") return null;
  const pool = combinable(kind, rarity, equipped);
  if (pool.length < COMBINE_COUNT) return null;
  const use = new Set(pool.slice(0, COMBINE_COUNT).map((p) => p.id));
  const inv = loadInventory();
  inv.parts = inv.parts.filter((p) => !use.has(p.id));
  const np = makePart(kind, RARITIES[rarityIndex(rarity) + 1], rnd);
  inv.parts.push(np);
  saveInventory(inv);
  return np;
}

// 初回だけ: 今までの必殺（効果の選択）を C 相当のパーツに置き換える。最初の手持ちとして 追尾(遠)・竜巻(近) も配る。
// 戻り値: 種類 → 作ったパーツ id（キャラの装備の置き換えに使う）
export function migrateToParts(usedKinds: PartKind[]): Map<PartKind, string> | null {
  if (loadInventoryRaw()) return null;
  const kinds = [...new Set<PartKind>(["r:homing", "m:tornado", ...usedKinds])];
  const map = new Map<PartKind, string>();
  const inv: Inventory = { v: 1, parts: [], shards: 0, sinceA: 0 };
  for (const k of kinds) {
    // C の標準値（出来 1.0・基準コスト・おまけ無し）
    const p = makePart(k, "C", () => 0.5);
    p.roll = 1;
    p.id = `start-${k.replace(":", "-")}`;
    inv.parts.push(p);
    map.set(k, p.id);
  }
  saveInventory(inv);
  return map;
}
