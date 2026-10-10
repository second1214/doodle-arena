// 持っている必殺パーツ（プレイヤー共通・ブラウザ内に保存）。ドロップ・分解・合成・振り直し。
import { ALL_KINDS, isKind, makePart, PITY, RARITIES, RARITY_INFO, rarityIndex, rollRarity, type Part, type PartKind, type Rarity } from "./items";

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

// ストーリーの勝利報酬: 1個（ボスは2個で、うち1個は1段上のレア度を保証。ラスボスはその1個が A 確定・4回に1回 S）。
// 持ち物がいっぱいなら、かけらに変える
export function dropParts(chapter: number, boss: boolean, rnd: () => number = Math.random, final = false): DropResult {
  const inv = loadInventory();
  const res: DropResult = { got: [], shardsInstead: 0 };
  const n = boss ? 2 : 1;
  for (let k = 0; k < n; k++) {
    let r = rollRarity(chapter, rnd);
    if (boss && k === 0) r = RARITIES[Math.min(RARITIES.length - 1, rarityIndex(r) + 1)];
    if (final && k === 0) r = rnd() < 0.25 ? "S" : "A";
    if (inv.sinceA + 1 >= PITY && rarityIndex(r) < rarityIndex("A")) r = "A";
    inv.sinceA = rarityIndex(r) >= rarityIndex("A") ? 0 : inv.sinceA + 1;
    // まだ持っていない種類は出やすく（2倍）＝種類が増えても新しいパーツに出会える
    const owned = new Set(inv.parts.map((x) => x.kind));
    const pool = ALL_KINDS.flatMap((k) => (owned.has(k) ? [k] : [k, k]));
    const p = makePart(pool[Math.floor(rnd() * pool.length)], r, rnd);
    if (inv.parts.length >= INVENTORY_CAP) { inv.shards += RARITY_INFO[r].shards; res.shardsInstead += RARITY_INFO[r].shards; }
    else { inv.parts.push(p); res.got.push(p); }
  }
  saveInventory(inv);
  return res;
}

export function dismantle(id: string): number {
  const inv = loadInventory();
  const p = inv.parts.find((x) => x.id === id);
  if (!p || p.locked) return 0; // 鍵つきは分解しない
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
  inv.parts[i] = { ...makePart(old.kind, old.rarity, rnd, old.id), ...(old.locked ? { locked: true } : {}) };
  saveInventory(inv);
  return inv.parts[i];
}

// 合成: ベース1個＋同じ種類・同じレア度の材料4個 → ベースが1段上のレア度になる（数値は引き直し。id・鍵はそのまま＝装備したままでよい）。
// 材料にできるのは、装備していない・鍵のかかっていないものだけ（同じパーツを重ねて付けて強くしているのを こわさない）
export const canBeMaterial = (p: Part, equipped: Set<string>) => !p.locked && !equipped.has(p.id);
export function combinable(kind: PartKind, rarity: Rarity, equipped: Set<string>): Part[] {
  return loadInventory().parts.filter((p) => p.kind === kind && p.rarity === rarity && canBeMaterial(p, equipped));
}
export function combineInto(baseId: string, materialIds: string[], equipped: Set<string>, rnd: () => number = Math.random): Part | null {
  const inv = loadInventory();
  const base = inv.parts.find((p) => p.id === baseId);
  if (!base || base.rarity === "S" || base.locked) return null;
  const mats = [...new Set(materialIds)].filter((id) => id !== baseId).map((id) => inv.parts.find((p) => p.id === id));
  if (mats.length !== COMBINE_COUNT - 1 || mats.some((m) => !m || m.kind !== base.kind || m.rarity !== base.rarity || !canBeMaterial(m, equipped))) return null;
  const use = new Set(materialIds);
  const np: Part = makePart(base.kind, RARITIES[rarityIndex(base.rarity) + 1], rnd, base.id);
  inv.parts = inv.parts.filter((p) => !use.has(p.id)).map((p) => (p.id === base.id ? np : p));
  saveInventory(inv);
  return np;
}

// まとめて合成の計画: 同じ種類・同じレア度ごとに、ベース＋材料4個の組を作れるだけ作る。
// ベースは 指定があればそれ、無ければ 装備中のもの→出来のよいもの の順。材料は 出来のわるいものから
export interface CombinePlan { kind: PartKind; rarity: Rarity; baseId: string; materialIds: string[]; candidates: string[] }
export function planCombines(parts: Part[], equipped: Set<string>, chosenBases: Record<string, string[]> = {}): CombinePlan[] {
  const groups = new Map<string, Part[]>();
  for (const p of parts) {
    if (p.rarity === "S" || p.locked) continue;
    const k = `${p.kind}|${p.rarity}`;
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const out: CombinePlan[] = [];
  for (const [key, list] of groups) {
    const used = new Set<string>();
    const byBase = [...list].sort((a, b) => Number(equipped.has(b.id)) - Number(equipped.has(a.id)) || b.roll - a.roll);
    const byMat = [...list].filter((p) => canBeMaterial(p, equipped)).sort((a, b) => a.roll - b.roll);
    const wanted = chosenBases[key] ?? [];
    // その部品をベースにしても 材料が4個そろうか
    const feasible = (id: string) => byMat.filter((m) => m.id !== id && !used.has(m.id)).length >= COMBINE_COUNT - 1;
    for (let n = 0; ; n++) {
      const candidates = byBase.filter((p) => !used.has(p.id) && feasible(p.id)).map((p) => p.id);
      if (!candidates.length) break;
      const base = wanted[n] && candidates.includes(wanted[n]) ? wanted[n] : candidates[0];
      const mats = byMat.filter((m) => m.id !== base && !used.has(m.id)).slice(0, COMBINE_COUNT - 1);
      used.add(base);
      mats.forEach((m) => used.add(m.id));
      out.push({ kind: list[0].kind, rarity: list[0].rarity, baseId: base, materialIds: mats.map((m) => m.id), candidates });
    }
  }
  return out;
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

// 決まったレア度のパーツを1つもらう（オンライン対戦の1日1回の報酬）
export function dropPartOfRarity(rarity: Rarity, rnd: () => number = Math.random): DropResult {
  const inv = loadInventory();
  const owned = new Set(inv.parts.map((x) => x.kind));
  const pool = ALL_KINDS.flatMap((k) => (owned.has(k) ? [k] : [k, k]));
  const p = makePart(pool[Math.floor(rnd() * pool.length)], rarity, rnd);
  if (inv.parts.length >= INVENTORY_CAP) { inv.shards += RARITY_INFO[rarity].shards; saveInventory(inv); return { got: [], shardsInstead: RARITY_INFO[rarity].shards }; }
  inv.parts.push(p);
  saveInventory(inv);
  return { got: [p], shardsInstead: 0 };
}

export function addShards(n: number) {
  const inv = loadInventory();
  inv.shards += n;
  saveInventory(inv);
}

