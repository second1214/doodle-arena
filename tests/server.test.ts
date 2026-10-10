import { beforeEach, describe, expect, it } from "vitest";
import { handle, LIMITS, defenderRating, type Db, type Env } from "../server/src/app";
import { hasNgWord } from "../src/online/ngwords";

// D1 の代わり: Node の SQLite で同じ使い方（prepare → bind → first/all/run）を真似る
async function memoryDb(): Promise<Db> {
  const mods = ["node:sqlite", "node:fs"];
  const { DatabaseSync } = await import(/* @vite-ignore */ mods[0]);
  const { readFileSync } = await import(/* @vite-ignore */ mods[1]);
  const sql = new DatabaseSync(":memory:");
  sql.exec(readFileSync(new URL("../server/migrations/0001_init.sql", import.meta.url), "utf8"));
  return {
    prepare(q: string) {
      let args: unknown[] = [];
      const st = {
        bind: (...a: unknown[]) => { args = a; return st; },
        first: async () => (sql.prepare(q).get(...args) ?? null),
        all: async () => ({ results: sql.prepare(q).all(...args) }),
        run: async () => sql.prepare(q).run(...args),
      };
      return st as never;
    },
  };
}

const ORIGIN = "https://second1214.github.io";
let env: Env;
let clock = Date.UTC(2026, 9, 10, 12);
const call = async (method: string, path: string, body?: unknown, ip = "1.2.3.4") => {
  const res = await handle(new Request(`https://api.test/api/v1${path}`, {
    method, headers: { Origin: ORIGIN, "CF-Connecting-IP": ip, "Content-Type": "text/plain" }, body: body === undefined ? undefined : JSON.stringify(body),
  }), env, clock);
  return { status: res.status, body: await res.json() as any, headers: res.headers };
};
const snap = (name = "テストくん", growth = 5) => ({
  name, growth, ver: { shape: 1, detect: 1, sim: 1, tree: 1 },
  strokes: [{ color: "#222222", width: 9, points: [100, 100, 200, 200, 300, 120] }, { color: "#ff0000", width: 0, points: [150, 150], fill: true }],
  detectParams: { alpha: 0.5 }, personality: "tricky", specialType: "ranged", special: ["homing", "zzz"], melee: [], specialMod: { power: 1.2, speed: NaN }, boost: { hp: 10, bogus: 5 },
});
const OWNER = "owner-token-abcdefghijk";

beforeEach(async () => { env = { DB: await memoryDb() }; clock = Date.UTC(2026, 9, 10, 12); });

describe("オンラインのサーバー", () => {
  it("公開→1体読み込み。知らない効果・壊れた数値は捨て、部屋は成長で決まる", async () => {
    const r = await call("POST", "/chars", { owner: OWNER, snap: snap("テストくん", 20) });
    expect(r.status).toBe(200);
    expect(r.body.tier).toBe(2); // 18〜26 はシルバー
    expect(r.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
    const g = await call("GET", `/chars/${r.body.id}`);
    expect(g.body.char.snap.special).toEqual(["homing"]);
    expect(g.body.char.snap.specialMod).toEqual({ power: 1.2 });
    expect(g.body.char.snap.boost).toEqual({ hp: 10 });
    expect(g.body.char.thumb.length).toBe(2);
  });

  it("手足レイヤー（手ペン・足ペン）も一緒に公開でき、壊れた塗りは弾く", async () => {
    const marks = [{ color: "foot", width: 30, points: [150, 300, 150, 340] }, { color: "erase", width: 39, points: [10, 10] }];
    const r = await call("POST", "/chars", { owner: OWNER, snap: { ...snap(), marks } });
    expect(r.status).toBe(200);
    expect((await call("GET", `/chars/${r.body.id}`)).body.char.snap.marks).toEqual(marks);
    const bad = await call("POST", "/chars", { owner: OWNER, snap: { ...snap(), marks: [{ color: "#ff0000", width: 30, points: [1, 2] }] } });
    expect(bad.status).toBe(400);
  });

  it("写真をそのまま貼った線も公開でき、一覧には小さい写真を使う。こわれた写真は弾く", async () => {
    const photo = { color: "#000000", width: 0, points: [40, 40, 400, 420], img: "data:image/jpeg;base64,/9j/AAAA", mask: "2x2:0,4", timg: "data:image/jpeg;base64,/9j/BB" };
    const r = await call("POST", "/chars", { owner: OWNER, snap: { ...snap(), strokes: [photo] } });
    expect(r.status).toBe(200);
    const g = await call("GET", `/chars/${r.body.id}`);
    expect(g.body.char.snap.strokes[0].img).toBe(photo.img);
    expect(g.body.char.thumb[0].img).toBe(photo.timg);
    const bad = await call("POST", "/chars", { owner: OWNER, snap: { ...snap(), strokes: [{ ...photo, img: "javascript:alert(1)" }] } });
    expect(bad.status).toBe(400);
  });

  it("名前の禁止語・連絡先は弾く（書き方の違いもそろえて調べる）", async () => {
    for (const bad of ["シネ", "ｂａｋａ", "ば か", "090-1234-5678", "line id abc", "a@b.jp"]) expect(hasNgWord(bad)).toBe(true);
    for (const ok of ["ゆうしゃ", "かすてら", "ばかりマン", "スーパーhero", "はげしいドラゴン", "せんぷうき"]) expect(hasNgWord(ok)).toBe(false);
    const r = await call("POST", "/chars", { owner: OWNER, snap: snap("きもい") });
    expect(r.status).toBe(400);
  });

  it("1端末3体まで・1回線1日5回まで", async () => {
    for (let i = 0; i < 3; i++) expect((await call("POST", "/chars", { owner: OWNER, snap: snap(`a${i}`) })).status).toBe(200);
    expect((await call("POST", "/chars", { owner: OWNER, snap: snap("a4") })).status).toBe(409);
    for (let i = 0; i < 2; i++) expect((await call("POST", "/chars", { owner: `${OWNER}${i}x`, snap: snap(`b${i}`) })).status).toBe(200);
    expect((await call("POST", "/chars", { owner: `${OWNER}zz`, snap: snap("b9") })).status).toBe(429);
    clock += 24 * 3600 * 1000; // 次の日はまた公開できる
    expect((await call("POST", "/chars", { owner: `${OWNER}zz`, snap: snap("b9") })).status).toBe(200);
  });

  it("ランキングは公開から24時間たってから。ランダムは同じ部屋から候補を出す", async () => {
    const a = await call("POST", "/chars", { owner: OWNER, snap: snap("a", 5) });
    await call("POST", "/chars", { owner: OWNER + "2", snap: snap("b", 5) });
    expect((await call("GET", "/ranking?tier=0")).body.chars.length).toBe(0);
    clock += LIMITS.rankingDelayMs + 1;
    expect((await call("GET", "/ranking?tier=0")).body.chars.length).toBe(2);
    const rnd = await call("GET", `/chars/random?tier=0&not=${a.body.id}`);
    expect(rnd.body.chars.map((c: any) => c.name)).toEqual(["b"]);
  });

  it("対戦結果: 公開キャラは勝てば上がり、負けても最大8しか下がらない（下限800）", async () => {
    const a = await call("POST", "/chars", { owner: OWNER, snap: snap("a") });
    const w = await call("POST", "/matches", { opponentId: a.body.id, result: "lose", challengerRating: 1000 });
    expect(w.body.rating).toBe(1016);
    const l = await call("POST", "/matches", { opponentId: a.body.id, result: "win", challengerRating: 1000 });
    expect(l.body.rating).toBeGreaterThanOrEqual(1008);
    expect(defenderRating(801, 1000, 0, 50)).toBe(800);
    const mine = await call("POST", "/mine", { owner: OWNER });
    expect(mine.body.chars[0]).toMatchObject({ wins: 1, losses: 1 });
  });

  it("バッド: 同じ人は1回。別々の3人で自動非表示。取り下げは持ち主だけ", async () => {
    const a = await call("POST", "/chars", { owner: OWNER, snap: snap("a") });
    const id = a.body.id;
    await call("POST", `/chars/${id}/bad`, { device: "device-aaaaaaaaaaaaaaaa" }, "9.9.9.1");
    expect((await call("POST", `/chars/${id}/bad`, { device: "device-aaaaaaaaaaaaaaaa" }, "9.9.9.1")).body.already).toBe(true);
    expect((await call("POST", `/chars/${id}/bad`, { device: "device-bbbbbbbbbbbbbbbb" }, "9.9.9.1")).body.already).toBe(true); // 同じ回線
    await call("POST", `/chars/${id}/bad`, { device: "device-cccccccccccccccc" }, "9.9.9.2");
    expect((await call("GET", `/chars/${id}`)).status).toBe(200);
    await call("POST", `/chars/${id}/bad`, { device: "device-dddddddddddddddd" }, "9.9.9.3");
    expect((await call("GET", `/chars/${id}`)).status).toBe(404); // 隠れた
    expect((await call("POST", `/chars/${id}/delete`, { owner: "someone-elseeeeeeeee" })).status).toBe(403);
    expect((await call("POST", `/chars/${id}/delete`, { owner: OWNER })).status).toBe(200);
  });

  it("緊急停止中はほかの人のキャラを配らない", async () => {
    await call("POST", "/chars", { owner: OWNER, snap: snap("a") });
    await env.DB.prepare("INSERT INTO meta (k, v) VALUES ('stop', '1')").run();
    expect((await call("GET", "/chars/random?tier=0")).body).toMatchObject({ chars: [], stop: true });
    expect((await call("GET", "/health")).body.stop).toBe(true);
  });
});
