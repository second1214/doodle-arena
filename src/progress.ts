// プレイヤーの成長（レベル・経験値・スキルポイント）とストーリーの進み具合。ブラウザ内に保存する。
// 保存形式には版番号 v を付け、読み込み時に古い形から直す。
import { canTake, isValidTree, nodeById, spentOf } from "./tree";
const PROFILE_KEY = "doodle-arena:profile";
const STORY_KEY = "doodle-arena:story";

export const LEVEL_CAP = 40;

export interface Profile {
  v: 1;
  level: number;
  exp: number; // 今のレベルでたまった経験値
  points: number; // まだ使っていないスキルポイント
  nodes: string[]; // スキルツリーで取ったノード（プレイヤー共通）
}

export interface StoryProgress {
  v: 1;
  cleared: Record<string, number>; // ステージ id → 勝った回数
}

// 次のレベルまでに必要な経験値
export const expToNext = (level: number) => 80 + 25 * level; // 2026-10-09 少し緩和（旧 60+20×Lv）

function read<T>(key: string): T | null {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadProfile(): Profile {
  const p = read<Partial<Profile>>(PROFILE_KEY);
  const num = (x: unknown, d: number) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : d);
  const out: Profile = { v: 1, level: Math.min(LEVEL_CAP, Math.max(1, Math.floor(num(p?.level, 1)))), exp: num(p?.exp, 0), points: Math.floor(num(p?.points, 0)), nodes: [] };
  const nodes = Array.isArray(p?.nodes) ? p.nodes.filter((x): x is string => typeof x === "string") : [];
  // ツリーの形が変わって知らないノードや飛ばし取りがあれば、全部払い戻して振り直してもらう
  if (isValidTree(nodes)) out.nodes = nodes;
  else out.points += nodes.reduce((a, id) => a + (nodeById(id)?.cost ?? 1), 0);
  return out;
}

// これまでにもらったスキルポイントの合計（使った分＋残り）
export const totalPoints = (p: Profile) => p.points + spentOf(p.nodes);

export function takeNode(id: string): boolean {
  const p = loadProfile();
  const n = nodeById(id);
  if (!n || !canTake(id, p.nodes) || p.points < n.cost) return false;
  p.nodes.push(id);
  p.points -= n.cost;
  return saveProfile(p);
}

// 振り直し（無料）: 全部払い戻す
export function resetTree() {
  const p = loadProfile();
  p.points += spentOf(p.nodes);
  p.nodes = [];
  saveProfile(p);
}
export const saveProfile = (p: Profile) => write(PROFILE_KEY, p);

export function loadStory(): StoryProgress {
  const s = read<Partial<StoryProgress>>(STORY_KEY);
  const cleared: Record<string, number> = {};
  if (s?.cleared && typeof s.cleared === "object") for (const [k, v] of Object.entries(s.cleared)) if (typeof v === "number" && v > 0) cleared[k] = v;
  return { v: 1, cleared };
}
export const saveStory = (s: StoryProgress) => write(STORY_KEY, s);

export interface Reward {
  exp: number;
  levelsUp: number;
  points: number; // 今回もらったスキルポイント（レベルアップ＋ボス初撃破）
  firstClear: boolean;
}

// ステージの結果を反映する。経験値: 初勝利 40+12×番号、2回目以降の勝利は半分、負け・引き分けは 1/4。
export function applyStageResult(stageNo: number, stageId: string, boss: boolean, won: boolean): Reward {
  const profile = loadProfile();
  const story = loadStory();
  const base = 40 + 12 * stageNo;
  const firstClear = won && !story.cleared[stageId];
  const exp = won ? (firstClear ? base : Math.round(base / 2)) : Math.round(base / 4);
  if (won) story.cleared[stageId] = (story.cleared[stageId] ?? 0) + 1;
  let points = firstClear && boss ? 1 : 0;
  let levelsUp = 0;
  profile.exp += exp;
  while (profile.level < LEVEL_CAP && profile.exp >= expToNext(profile.level)) {
    profile.exp -= expToNext(profile.level);
    profile.level++;
    levelsUp++;
    points++;
  }
  if (profile.level >= LEVEL_CAP) profile.exp = 0;
  profile.points += points;
  saveProfile(profile);
  saveStory(story);
  return { exp, levelsUp, points, firstClear };
}

// --- 引き継ぎコード: このゲームの保存データ全部を1つの文字列にする（機種変更・データ消失への備え） ---
const PREFIX = "doodle-arena:";

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const res = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}
const canZip = typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

export async function exportCode(): Promise<string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) data[k] = localStorage.getItem(k) ?? "";
  }
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  // DA1 = 圧縮あり / DA0 = 圧縮なし（古いブラウザ）
  return canZip ? "DA1:" + toB64(await pipe(bytes, new CompressionStream("gzip"))) : "DA0:" + toB64(bytes);
}

// 読み込んだ件数を返す。壊れたコードは例外
export async function importCode(code: string): Promise<number> {
  const c = code.replace(/\s+/g, "");
  let bytes: Uint8Array;
  if (c.startsWith("DA1:")) {
    if (!canZip) throw new Error("このブラウザでは読み込めないコードです");
    bytes = await pipe(fromB64(c.slice(4)), new DecompressionStream("gzip"));
  } else if (c.startsWith("DA0:")) bytes = fromB64(c.slice(4));
  else throw new Error("引き継ぎコードではありません");
  const data = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  const entries = Object.entries(data).filter(([k, v]) => k.startsWith(PREFIX) && typeof v === "string") as [string, string][];
  if (!entries.length) throw new Error("中身が空のコードです");
  // 今のデータを消してから入れ替える
  const old: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) old.push(k);
  }
  for (const k of old) localStorage.removeItem(k);
  for (const [k, v] of entries) localStorage.setItem(k, v);
  return entries.length;
}

// ブラウザに「このサイトのデータを勝手に消さないで」と頼む（iPhone の7日消去などへの備え。断られても動く）
export function requestPersist() {
  try {
    void navigator.storage?.persist?.();
  } catch {
    /* 未対応 */
  }
}
