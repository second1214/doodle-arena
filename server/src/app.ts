// オンライン対戦のサーバー（Cloudflare Workers + D1）。ログインなし・個人情報なし。
// 公開キャラは「戦闘を再現するための計算し終えた数値」（スナップショット）として保存し、書き換えずに配る。
// 無料枠の節約: POST は text/plain で受け取り（ブラウザの事前確認の通信を起こさない）、DELETE は使わない。対戦の記録表は作らない。
import { EFFECTS } from "../../src/sim/special";
import { MELEE_EFFECTS } from "../../src/sim/melee";
import { BOOST_KEYS } from "../../src/sim/stats";
import { hasNgWord } from "../../src/online/ngwords";
import { TIERS, tierOf } from "../../src/online/tiers";
import { thumbStrokes, type Snapshot } from "../../src/online/snapshot";

// D1 のうち使う部分だけ（テストでは node:sqlite で同じ形を作る）
export interface Stmt {
  bind(...args: unknown[]): Stmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface Db { prepare(sql: string): Stmt }
export interface Env { DB: Db; ALLOWED_ORIGINS?: string }

export const LIMITS = {
  publishPerDay: 5, // 1つの回線から1日に公開できる回数
  charsPerOwner: 3, // 1つの端末が同時に公開しておけるキャラ数
  matchesPerDay: 300,
  badsPerDay: 10,
  hideAtBad: 3, // 別々の人からのバッドがこの数で自動非表示（消さずに隠すだけ）
  rankingDelayMs: 24 * 3600 * 1000, // 公開から24時間はランキングに出さない（その間にバッドが付く機会を作る）
  maxStrokes: 300,
  maxPoints: 16000, // 線の座標の数（x, y を別に数える＝8,000点）
  maxBody: 64_000, // 送られてくる中身の大きさ（バイト）
  candidates: 3, // ランダム対戦で出す相手の数
};

const RANGED = new Set<string>(EFFECTS.map((e) => e.id));
const MELEE = new Set<string>(MELEE_EFFECTS.map((e) => e.id));
const PERSONALITIES = new Set(["aggressive", "cautious", "sniper", "tricky"]);
const MOD_KEYS = ["power", "speed", "duration", "windup", "size", "crit", "carry", "pierce"];
const PARAM_KEYS = ["closeRadius", "alpha", "minAreaRatio", "minAspect", "footAngleDeg"];
const TRAIT_KEYS = ["walk", "top", "accel", "momentum", "rollGuardCut", "dmg", "cost", "knockGiven", "knockTaken", "hits", "selfDmg", "weight", "radius", "windupPerReach"];

const finite = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// 受け取ったスナップショットを検査して整える。改ざん対策はしない方針だが、戦闘計算やサーバーを壊す値（巨大・NaN・未知の効果）は弾く
export function cleanSnapshot(raw: unknown): { ok: true; snap: Snapshot } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "中身がありません" };
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 16) : "";
  if (!name) return { ok: false, error: "名前を つけてね" };
  if (hasNgWord(name)) return { ok: false, error: "その名前は つかえないよ" };
  if (!Array.isArray(r.strokes) || !r.strokes.length) return { ok: false, error: "絵が ありません" };
  if (r.strokes.length > LIMITS.maxStrokes) return { ok: false, error: "線が 多すぎます" };
  let points = 0;
  const strokes: Snapshot["strokes"] = [];
  for (const s of r.strokes as Record<string, unknown>[]) {
    if (!s || typeof s !== "object" || !Array.isArray(s.points)) return { ok: false, error: "絵の データが こわれています" };
    const color = typeof s.color === "string" && (/^#[0-9a-fA-F]{6}$/.test(s.color) || s.color === "erase") ? s.color : null;
    if (!color || !finite(s.width)) return { ok: false, error: "絵の データが こわれています" };
    const pts = (s.points as unknown[]).map((p) => (finite(p) ? Math.round(clamp(p, -64, 576)) : NaN));
    if (pts.some(Number.isNaN) || pts.length < 2 || pts.length % 2) return { ok: false, error: "絵の データが こわれています" };
    points += pts.length;
    strokes.push({ color, width: clamp(Math.round(s.width), 0, 40), points: pts, ...(s.fill === true ? { fill: true } : {}) });
  }
  if (points > LIMITS.maxPoints) return { ok: false, error: "絵が 大きすぎます" };
  const ids = (x: unknown, ok: Set<string>) => (Array.isArray(x) ? x.filter((i): i is string => typeof i === "string" && ok.has(i)).slice(0, 20) : []);
  const nums = (x: unknown, keys: readonly string[], lo: number, hi: number) => {
    const out: Record<string, number> = {};
    if (x && typeof x === "object") for (const k of keys) { const v = (x as Record<string, unknown>)[k]; if (finite(v)) out[k] = clamp(v, lo, hi); }
    return out;
  };
  const int = (x: unknown) => (finite(x) ? Math.round(x) : 0);
  const v = (r.ver && typeof r.ver === "object" ? r.ver : {}) as Record<string, unknown>;
  const limbs = r.limbs && typeof r.limbs === "object" ? (r.limbs as Record<string, unknown>) : null;
  const snap: Snapshot = {
    fmt: 1,
    ver: { shape: int(v.shape), detect: int(v.detect), sim: int(v.sim), tree: int(v.tree) },
    name,
    strokes,
    detectParams: nums(r.detectParams, PARAM_KEYS, -100, 100),
    personality: typeof r.personality === "string" && PERSONALITIES.has(r.personality) ? r.personality : "aggressive",
    specialType: r.specialType === "melee" ? "melee" : "ranged",
    special: ids(r.special, RANGED),
    melee: ids(r.melee, MELEE),
    specialMod: nums(r.specialMod, MOD_KEYS, -50, 50),
    boost: nums(r.boost, BOOST_KEYS, -500, 500),
    growth: finite(r.growth) ? clamp(Math.round(r.growth), 0, 999) : 0,
    limbs: limbs ? {
      reach: finite(limbs.reach) ? clamp(limbs.reach, 0, 10) : 0.5,
      hasHands: limbs.hasHands === true,
      hasFeet: limbs.hasFeet === true,
      traits: nums(limbs.traits, TRAIT_KEYS, -50, 50),
    } : undefined,
  };
  return { ok: true, snap };
}

// --- 小道具 ---
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const today = (now: number) => new Date(now).toISOString().slice(0, 10);
function randomText(n: number): string {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
}
const rand01 = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; };

// 回線を伏せるための乱数（初回に作って保存）。総当たりで元の回線に戻せないよう、秘密の乱数を混ぜる
async function salt(db: Db): Promise<string> {
  const row = await db.prepare("SELECT v FROM meta WHERE k = 'salt'").first<{ v: string }>();
  if (row) return row.v;
  const s = randomText(32);
  await db.prepare("INSERT OR IGNORE INTO meta (k, v) VALUES ('salt', ?)").bind(s).run();
  return (await db.prepare("SELECT v FROM meta WHERE k = 'salt'").first<{ v: string }>())!.v;
}
async function stopped(db: Db): Promise<boolean> {
  return (await db.prepare("SELECT v FROM meta WHERE k = 'stop'").first<{ v: string }>())?.v === "1";
}

// 1日の回数制限。超えたら false。前の日のカウンタは時々まとめて消す
async function takeQuota(db: Db, key: string, limit: number, now: number): Promise<boolean> {
  const k = `${today(now)}:${key}`;
  const row = await db.prepare("SELECT n FROM quota WHERE k = ?").bind(k).first<{ n: number }>();
  if ((row?.n ?? 0) >= limit) return false;
  await db.prepare("INSERT INTO quota (k, n) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1").bind(k).run();
  if (rand01() < 0.01) await db.prepare("DELETE FROM quota WHERE k < ?").bind(today(now)).run();
  return true;
}

// レーティング: 公開キャラ（CPU が動かす）は人に挑まれる側なので、勝てば普通に上がり、負けた時の下がり幅は小さく（最大8）。下は800で止まる
export function defenderRating(r: number, challenger: number, defenderScore: number, games: number): number {
  const expect = 1 / (1 + Math.pow(10, (challenger - r) / 400));
  const k = games < 10 ? 32 : 16;
  let d = k * (defenderScore - expect);
  if (d < 0) d = Math.max(-8, d / 2);
  return Math.max(800, Math.round((r + d) * 10) / 10);
}

interface CharRow { id: string; name: string; snap: string; thumb: string; tier: number; growth: number; sim_ver: number; rating: number; wins: number; losses: number; draws: number; bad: number; hidden: number; created_at: number }
const listChar = (r: CharRow) => ({
  id: r.id, name: r.name, tier: r.tier, growth: r.growth, rating: Math.round(r.rating), wins: r.wins, losses: r.losses, draws: r.draws,
  games: r.wins + r.losses + r.draws, thumb: JSON.parse(r.thumb) as unknown,
});

// --- 受付 ---
function cors(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = (env.ALLOWED_ORIGINS ?? "https://second1214.github.io").split(",").map((s) => s.trim());
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return { "Access-Control-Allow-Origin": ok ? origin : allowed[0], "Access-Control-Allow-Methods": "GET, POST", "Access-Control-Max-Age": "86400", Vary: "Origin" };
}

// 端末から送られる本文（text/plain の JSON）。持ち主の合い言葉や端末の印も本文に入れる（ヘッダーを使うと事前確認の通信が起きるため）
async function body(req: Request): Promise<Record<string, unknown> | null> {
  const text = await req.text();
  if (text.length > LIMITS.maxBody) return null;
  try { const v = JSON.parse(text); return v && typeof v === "object" ? (v as Record<string, unknown>) : null; } catch { return null; }
}

export async function handle(req: Request, env: Env, now = Date.now()): Promise<Response> {
  const headers = { ...cors(req, env), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "").replace(/^\/api\/v1/, "");
  const db = env.DB;
  try {
    if (path === "/health") return json({ ok: true, stop: await stopped(db), tiers: TIERS.map((t) => t.name) });
    const ipHash = async () => sha256(`${await salt(db)}:${today(now)}:${req.headers.get("CF-Connecting-IP") ?? "0.0.0.0"}`);

    // キャラを公開
    if (path === "/chars" && req.method === "POST") {
      const b = await body(req);
      if (!b) return json({ error: "データが こわれているか 大きすぎます" }, 400);
      const owner = typeof b.owner === "string" ? b.owner : "";
      if (owner.length < 16) return json({ error: "持ち主の合い言葉が ありません" }, 400);
      const c = cleanSnapshot(b.snap);
      if (!c.ok) return json({ error: c.error }, 400);
      const ownerHash = await sha256(`owner:${owner}`);
      const mine = await db.prepare("SELECT COUNT(*) AS n FROM chars WHERE owner_hash = ?").bind(ownerHash).first<{ n: number }>();
      if ((mine?.n ?? 0) >= LIMITS.charsPerOwner) return json({ error: `公開できるのは ${LIMITS.charsPerOwner}体までだよ。ほかのキャラを 取り下げてね` }, 409);
      if (!(await takeQuota(db, `publish:${await ipHash()}`, LIMITS.publishPerDay, now))) return json({ error: "今日は もう公開できないよ。また明日ね" }, 429);
      const id = randomText(10);
      const tier = tierOf(c.snap.growth);
      await db.prepare("INSERT INTO chars (id, owner_hash, name, snap, thumb, tier, growth, sim_ver, rnd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, ownerHash, c.snap.name, JSON.stringify(c.snap), JSON.stringify(thumbStrokes(c.snap.strokes)), tier, c.snap.growth, c.snap.ver.sim, rand01(), now).run();
      return json({ id, tier });
    }

    // 自分の公開キャラ（成績つき）
    if (path === "/mine" && req.method === "POST") {
      const b = await body(req);
      const ownerHash = await sha256(`owner:${typeof b?.owner === "string" ? b.owner : ""}`);
      const { results } = await db.prepare("SELECT * FROM chars WHERE owner_hash = ? ORDER BY created_at DESC").bind(ownerHash).all<CharRow>();
      return json({ chars: results.map((r) => ({ ...listChar(r), hidden: !!r.hidden })) });
    }

    // 緊急停止中は、ほかの人のキャラを配らない（ゲーム側は CPU だけで遊べる）
    const isStopped = await stopped(db);

    // ランダムな相手の候補（同じ部屋から。足りなければ近い部屋）。索引の上の乱数の位置から読むので、全部を読まない
    if (path === "/chars/random" && req.method === "GET") {
      if (isStopped) return json({ chars: [], stop: true });
      const tier = clamp(Number(url.searchParams.get("tier")) || 0, 0, TIERS.length - 1);
      const not = new Set((url.searchParams.get("not") ?? "").split(",").filter(Boolean).slice(0, 30));
      const out = new Map<string, CharRow>();
      for (const t of [tier, tier - 1, tier + 1]) {
        if (t < 0 || t >= TIERS.length) continue;
        for (let tries = 0; tries < 3 && out.size < LIMITS.candidates; tries++) {
          const at = rand01();
          let { results } = await db.prepare("SELECT * FROM chars WHERE tier = ? AND hidden = 0 AND rnd >= ? ORDER BY rnd LIMIT 8").bind(t, at).all<CharRow>();
          if (results.length < 8) results = results.concat((await db.prepare("SELECT * FROM chars WHERE tier = ? AND hidden = 0 ORDER BY rnd LIMIT 8").bind(t).all<CharRow>()).results);
          for (const r of results) if (!not.has(r.id) && !out.has(r.id) && out.size < LIMITS.candidates) out.set(r.id, r);
          if (!results.length) break;
        }
        if (out.size >= LIMITS.candidates) break;
      }
      return json({ chars: [...out.values()].map(listChar) });
    }

    // ランキング（公開から24時間たったキャラだけ）
    if (path === "/ranking" && req.method === "GET") {
      if (isStopped) return json({ chars: [], stop: true });
      const tier = clamp(Number(url.searchParams.get("tier")) || 0, 0, TIERS.length - 1);
      const { results } = await db.prepare("SELECT * FROM chars WHERE tier = ? AND hidden = 0 AND created_at <= ? ORDER BY rating DESC, created_at ASC LIMIT 20")
        .bind(tier, now - LIMITS.rankingDelayMs).all<CharRow>();
      return json({ tier, chars: results.map(listChar) });
    }

    // 1体の全部（戦うとき）
    const one = path.match(/^\/chars\/([a-z0-9]{6,20})$/);
    if (one && req.method === "GET") {
      const r = await db.prepare("SELECT * FROM chars WHERE id = ? AND hidden = 0").bind(one[1]).first<CharRow>();
      if (!r || isStopped) return json({ error: "見つかりません" }, 404);
      return json({ char: { ...listChar(r), snap: JSON.parse(r.snap) as Snapshot } });
    }

    // 取り下げ（持ち主だけ）
    const del = path.match(/^\/chars\/([a-z0-9]{6,20})\/delete$/);
    if (del && req.method === "POST") {
      const b = await body(req);
      const ownerHash = await sha256(`owner:${typeof b?.owner === "string" ? b.owner : ""}`);
      const r = await db.prepare("SELECT owner_hash FROM chars WHERE id = ?").bind(del[1]).first<{ owner_hash: string }>();
      if (!r) return json({ error: "見つかりません" }, 404);
      if (r.owner_hash !== ownerHash) return json({ error: "自分のキャラだけ 取り下げられるよ" }, 403);
      await db.prepare("DELETE FROM chars WHERE id = ?").bind(del[1]).run();
      await db.prepare("DELETE FROM bads WHERE char_id = ?").bind(del[1]).run();
      return json({ ok: true });
    }

    // 対戦結果（挑んだ人から見た勝ち負け）。動くのは挑まれた公開キャラのレーティングと戦績だけ
    if (path === "/matches" && req.method === "POST") {
      const b = await body(req);
      const score = b?.result === "win" ? 1 : b?.result === "lose" ? 0 : b?.result === "draw" ? 0.5 : -1;
      if (!b || typeof b.opponentId !== "string" || score < 0) return json({ error: "データが こわれています" }, 400);
      if (!(await takeQuota(db, `match:${await ipHash()}`, LIMITS.matchesPerDay, now))) return json({ error: "今日は たくさん遊んだね。また明日" }, 429);
      const opp = await db.prepare("SELECT * FROM chars WHERE id = ?").bind(b.opponentId).first<CharRow>();
      if (!opp) return json({ error: "見つかりません" }, 404);
      const challenger = finite(b.challengerRating) ? clamp(b.challengerRating, 0, 3000) : 1000;
      const newRating = defenderRating(opp.rating, challenger, 1 - score, opp.wins + opp.losses + opp.draws);
      const col = score === 1 ? "losses" : score === 0 ? "wins" : "draws"; // 公開キャラから見た結果
      await db.prepare(`UPDATE chars SET rating = ?, ${col} = ${col} + 1 WHERE id = ?`).bind(newRating, opp.id).run();
      return json({ rating: Math.round(newRating) });
    }

    // バッド評価（同じ端末から1回・同じ日の同じ回線から1回）。別々の人から一定数で自動非表示
    const bad = path.match(/^\/chars\/([a-z0-9]{6,20})\/bad$/);
    if (bad && req.method === "POST") {
      const b = await body(req);
      const device = typeof b?.device === "string" ? b.device : "";
      if (device.length < 16) return json({ error: "端末の印が ありません" }, 400);
      const ip = await ipHash();
      if (!(await takeQuota(db, `bad:${ip}`, LIMITS.badsPerDay, now))) return json({ error: "今日は もう押せないよ" }, 429);
      const r = await db.prepare("SELECT id FROM chars WHERE id = ?").bind(bad[1]).first();
      if (!r) return json({ error: "見つかりません" }, 404);
      const dv = await sha256(`device:${device}`);
      const already = await db.prepare("SELECT 1 AS x FROM bads WHERE char_id = ? AND (voter = ? OR voter = ?)").bind(bad[1], dv, `ip:${ip}`).first();
      if (already) return json({ ok: true, already: true });
      await db.prepare("INSERT INTO bads (char_id, voter) VALUES (?, ?)").bind(bad[1], dv).run();
      await db.prepare("INSERT OR IGNORE INTO bads (char_id, voter) VALUES (?, ?)").bind(bad[1], `ip:${ip}`).run();
      await db.prepare("UPDATE chars SET bad = bad + 1, hidden = CASE WHEN bad + 1 >= ? THEN 1 ELSE hidden END WHERE id = ?").bind(LIMITS.hideAtBad, bad[1]).run();
      return json({ ok: true });
    }

    return json({ error: "ありません" }, 404);
  } catch (e) {
    return json({ error: "サーバーで エラーが おきました", detail: String((e as Error).message ?? e).slice(0, 200) }, 500);
  }
}

export default { fetch: (req: Request, env: Env) => handle(req, env) };
