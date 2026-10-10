// 保存したキャラ（この端末のブラウザ内に保存。オンライン化は試作4）。
import type { Stroke } from "./detect";
import { renderStrokes } from "./parts";
import { SHAPE_VERSION } from "./shape";
import type { MeleeEffectId } from "./sim/melee";
import type { EffectId } from "./sim/special";
import { DEFAULT_STATS, STAT_BUDGET, STAT_KEYS, STAT_MAX, type Stats } from "./sim/stats";
import type { Personality } from "./sim/world";

export interface CharacterData {
  id: string;
  name: string;
  strokes: Stroke[];
  marks?: Stroke[]; // 手足レイヤー（手ペン・足ペンで塗った所。無ければ自動で見つける）
  stats: Stats;
  personality: Personality;
  specialType: "ranged" | "melee";
  special: EffectId[];
  melee: MeleeEffectId[];
  // 装備している必殺パーツの id（持ち物 inventory の中を指す）。遠距離と近接で別々に組み、ポイントも別々。
  // 両方に使える共通パーツは、同じ1個を両方に付けられる
  partsR: string[];
  partsM: string[];
  parts?: string[]; // 古い形（遠近で1つの並び）。読み込み時に partsR・partsM へ写す
  thumb?: string; // 一覧用の小さな画像（data URL）
  savedAt: number;
  shapeVersion: number; // 形の性能の計算式の版（将来の変更に備えて記録）
}

const KEY = "doodle-arena:roster";
const DRAFT_KEY = "doodle-arena:draft";

export function loadRoster(): CharacterData[] {
  try {
    const s = localStorage.getItem(KEY);
    const list = s ? (JSON.parse(s) as CharacterData[]) : [];
    return Array.isArray(list) ? list.map(normalize) : [];
  } catch {
    return [];
  }
}

export function writeRoster(list: CharacterData[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false; // 保存できない環境（プライベートモード等）
  }
}

// 古い・壊れたデータでも読めるように整える。能力値は上限と総ポイントを守る
const ids = (x: unknown): string[] => (Array.isArray(x) ? x.filter((i): i is string => typeof i === "string") : []);
export const loadoutOf = (c: Pick<CharacterData, "partsR" | "partsM">, type: "ranged" | "melee") => (type === "ranged" ? c.partsR : c.partsM);

export function normalize(c: Partial<CharacterData>): CharacterData {
  const stats = { ...DEFAULT_STATS, ...(c.stats ?? {}) };
  for (const k of STAT_KEYS) stats[k] = Math.max(0, Math.min(STAT_MAX, Math.round(Number(stats[k]) || 0)));
  let total = STAT_KEYS.reduce((a, k) => a + stats[k], 0);
  for (const k of STAT_KEYS) while (total > STAT_BUDGET && stats[k] > 0) { stats[k]--; total--; }
  return {
    id: c.id ?? newId(),
    name: (c.name ?? "").slice(0, 16) || "名無し",
    strokes: Array.isArray(c.strokes) ? c.strokes : [],
    marks: Array.isArray(c.marks) ? c.marks : [],
    stats,
    personality: c.personality ?? "aggressive",
    specialType: c.specialType === "melee" ? "melee" : "ranged",
    special: c.special ?? [],
    melee: c.melee ?? [],
    partsR: ids(c.partsR ?? c.parts),
    partsM: ids(c.partsM ?? c.parts),
    thumb: c.thumb,
    savedAt: c.savedAt ?? Date.now(),
    shapeVersion: c.shapeVersion ?? SHAPE_VERSION,
  };
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function thumbnail(strokes: Stroke[]): string {
  const big = renderStrokes(strokes);
  const c = document.createElement("canvas");
  c.width = c.height = 88;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, 88, 88);
  g.drawImage(big, 0, 0, 88, 88);
  return c.toDataURL("image/png");
}

// 同じ id なら上書き、無ければ先頭に追加
export function saveCharacter(c: CharacterData): boolean {
  const list = loadRoster().filter((x) => x.id !== c.id);
  list.unshift({ ...c, thumb: thumbnail(c.strokes), savedAt: Date.now(), shapeVersion: SHAPE_VERSION });
  return writeRoster(list);
}

export function deleteCharacter(id: string): boolean {
  return writeRoster(loadRoster().filter((x) => x.id !== id));
}

export function loadDraft(): Partial<CharacterData> | null {
  try {
    const s = localStorage.getItem(DRAFT_KEY);
    return s ? (JSON.parse(s) as Partial<CharacterData>) : null;
  } catch {
    return null;
  }
}

export function saveDraft(c: Partial<CharacterData>) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(c));
  } catch {
    /* 無視 */
  }
}
