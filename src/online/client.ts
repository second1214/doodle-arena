// オンライン対戦の通信（ゲーム側）。サーバーにつながらない時は例外を投げ、画面は「オフライン」表示にする（ほかの遊びはそのまま動く）。
// 送るときは text/plain（ブラウザの事前確認の通信を起こさず、無料枠を節約する）。
import { buildCharacter, type CharacterBuild } from "../battle/character";
import { DEFAULT_PARAMS, DETECT_VERSION, type DetectParams, type Stroke } from "../detect";
import { SHAPE_VERSION, DEFAULT_TRAITS, type Traits } from "../shape";
import { SIM_VERSION, type FighterConfig, type Personality } from "../sim/world";
import type { EffectId } from "../sim/special";
import type { MeleeEffectId } from "../sim/melee";
import { TREE_VERSION } from "../tree";
import type { Snapshot } from "./snapshot";

export const API_BASE = "https://doodle-arena-api.rakugaki000.workers.dev/api/v1";

// 端末の印（バッド評価の重複防止）と、持ち主の合い言葉（自分の公開キャラの取り下げ用）。どちらも端末の中だけ
function token(key: string): string {
  try {
    let v = localStorage.getItem(key);
    if (!v) {
      const a = new Uint8Array(18);
      crypto.getRandomValues(a);
      v = [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(key, v);
    }
    return v;
  } catch {
    return "nostorage-" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
}
export const deviceId = () => token("doodle-arena:device");
export const ownerToken = () => token("doodle-arena:owner");

export interface ListChar {
  id: string; name: string; tier: number; growth: number; rating: number; wins: number; losses: number; draws: number; games: number;
  thumb: Snapshot["strokes"]; hidden?: boolean;
}

async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(API_BASE + path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "text/plain;charset=UTF-8" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new OnlineError(data.error ?? `エラー（${res.status}）`, res.status);
    return data;
  } catch (e) {
    if (e instanceof OnlineError) throw e;
    throw new OnlineError("サーバーに つながりません（オフライン）", 0);
  } finally {
    clearTimeout(timer);
  }
}
export class OnlineError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export const api = {
  health: () => request<{ ok: boolean; stop: boolean }>("GET", "/health"),
  publish: (snap: Snapshot) => request<{ id: string; tier: number }>("POST", "/chars", { owner: ownerToken(), snap }),
  mine: () => request<{ chars: ListChar[] }>("POST", "/mine", { owner: ownerToken() }),
  candidates: (tier: number, not: string[]) => request<{ chars: ListChar[]; stop?: boolean }>("GET", `/chars/random?tier=${tier}&not=${encodeURIComponent(not.slice(0, 30).join(","))}`),
  ranking: (tier: number) => request<{ chars: ListChar[]; stop?: boolean }>("GET", `/ranking?tier=${tier}`),
  get: (id: string) => request<{ char: ListChar & { snap: Snapshot } }>("GET", `/chars/${id}`),
  remove: (id: string) => request<{ ok: boolean }>("POST", `/chars/${id}/delete`, { owner: ownerToken() }),
  report: (opponentId: string, result: "win" | "lose" | "draw", challengerRating: number) => request<{ rating: number }>("POST", "/matches", { opponentId, result, challengerRating }),
  bad: (id: string) => request<{ ok: boolean; already?: boolean }>("POST", `/chars/${id}/bad`, { device: deviceId() }),
};

// 戦う準備のできたキャラ（applyData 後）から、公開用のスナップショットを作る
export function makeSnapshot(build: CharacterBuild, name: string, strokes: Stroke[], params: DetectParams, growth: number): Snapshot {
  const c = build.cfg;
  return {
    fmt: 1,
    ver: { shape: SHAPE_VERSION, detect: DETECT_VERSION, sim: SIM_VERSION, tree: TREE_VERSION },
    name,
    strokes: strokes.map((s) => ({ color: s.color, width: s.width, points: [...s.points], ...(s.fill ? { fill: true } : {}), ...(s.img ? { img: s.img, mask: s.mask, timg: s.timg } : {}) })),
    ...(build.marks.length ? { marks: build.marks.map((m) => ({ color: m.color, width: m.width, points: [...m.points] })) } : {}),
    detectParams: { ...params } as unknown as Record<string, number>,
    personality: c.personality ?? "aggressive",
    specialType: c.specialType ?? "ranged",
    special: [...c.special],
    melee: [...(c.melee ?? [])],
    specialMod: { ...(c.specialMod ?? {}) } as Record<string, number>,
    boost: { ...(c.boost ?? {}) } as Record<string, number>,
    growth,
    limbs: { reach: c.reach, hasHands: c.hasHands, hasFeet: c.hasFeet, traits: { ...(c.traits ?? DEFAULT_TRAITS) } as unknown as Record<string, number> },
  };
}

// 受け取ったスナップショットから戦うキャラを作る。検知や形の計算の版が違う時は、公開した時の手足の結果を使う（作った人と同じ強さで戦う）
export function buildFromSnapshot(s: Snapshot): CharacterBuild {
  const params = { ...DEFAULT_PARAMS, ...(s.detectParams as Partial<DetectParams>) };
  const b = buildCharacter(s.name, s.strokes as Stroke[], [], params, (s.marks ?? []) as Stroke[]);
  const cfg: FighterConfig = b.cfg;
  if (s.limbs && (s.ver.detect !== DETECT_VERSION || s.ver.shape !== SHAPE_VERSION)) {
    cfg.reach = s.limbs.reach;
    cfg.hasHands = s.limbs.hasHands;
    cfg.hasFeet = s.limbs.hasFeet;
    cfg.traits = { ...DEFAULT_TRAITS, ...(s.limbs.traits as Partial<Traits>) };
  }
  cfg.personality = s.personality as Personality;
  cfg.specialType = s.specialType;
  cfg.special = s.special as EffectId[];
  cfg.melee = s.melee as MeleeEffectId[];
  cfg.specialMod = s.specialMod;
  cfg.boost = s.boost;
  return b;
}

// 新しすぎて（この端末のゲームが古くて）正しく戦えないキャラか
export const tooNew = (s: Snapshot) => s.ver.sim > SIM_VERSION || s.ver.detect > DETECT_VERSION || s.ver.shape > SHAPE_VERSION;
