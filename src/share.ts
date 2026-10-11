// 拡散用の文（SNS などに貼る じまんの文）。ストーリーの進み具合とステータスから作る。DOM 非依存。
import type { Chapter } from "./story";

export const GAME_URL = "https://rakugaki-arena.pages.dev/";
export const HASHTAG = "#らくがきアリーナ";

export interface ShareInput {
  level: number;
  spent: number; // スキルツリーに使ったポイント
  cap: number; // ツリーの上限
  titles: string[]; // 枝を極めた称号
  cleared: Record<string, number>; // ストーリーのステージ id → 勝った回数
  chapters: Chapter[];
  bestPart?: string; // いちばんレアなパーツ（例: "S ☄️メテオ(遠)"）
  partCount: number;
  charName?: string; // 編集中のキャラの名前
}

// X（旧ツイッター）の 文字数の 数え方: 280 まで。日本語・絵文字は 1文字で 2、英数字は 1、URL は 長さに 関係なく 23
export const X_LIMIT = 280;
const URL_RE = /https?:\/\/\S+/g;
const light = (cp: number) => cp <= 4351 || (cp >= 8192 && cp <= 8205) || (cp >= 8208 && cp <= 8223) || (cp >= 8242 && cp <= 8247);
export function xLength(text: string): number {
  let n = 0;
  const rest = text.replace(URL_RE, () => { n += 23; return ""; });
  const seg = typeof Intl !== "undefined" && "Segmenter" in Intl ? [...new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(rest)].map((x) => x.segment) : Array.from(rest);
  for (const g of seg) {
    if (/\p{Extended_Pictographic}/u.test(g)) { n += 2; continue; }
    for (const ch of g) n += light(ch.codePointAt(0)!) ? 1 : 2;
  }
  return n;
}

// detail: 2=章と ステージの 名前まで / 1=章の 名前まで / 0=番号だけ。maxBoss: たおした ボスを 何体まで 書くか（新しい方から）
export function storyLine(cleared: Record<string, number>, chapters: Chapter[], detail = 2, maxBoss = 99): string {
  const stages = chapters.flatMap((c) => c.stages.map((s) => ({ c, s })));
  const done = stages.filter(({ s }) => cleared[s.id]);
  if (!done.length) return "📖 これから ぼうけん スタート！";
  const last = done.reduce((a, b) => (b.s.no > a.s.no ? b : a));
  const all = done.length === stages.length;
  const boss = stages.filter(({ s }) => s.boss && cleared[s.id]).map(({ s }) => s.enemy);
  const shown = boss.slice(-maxBoss);
  const where = `第${last.c.no}章${detail >= 1 ? `「${last.c.title}」` : ""}${detail >= 2 ? ` ${last.s.id}「${last.s.title}」` : ` ${last.s.id}`}`;
  return [
    all ? `📖 ストーリー ぜんぶ クリア！（${stages.length}ステージ）` : `📖 ${where}まで クリア（${done.length}/${stages.length}）`,
    ...(shown.length ? [`👑 たおした ボス ${boss.length > shown.length ? "…" : ""}${shown.join("・")}`] : []),
  ].join("\n");
}

const cut = (t: string, n: number) => (Array.from(t).length > n ? Array.from(t).slice(0, n).join("") + "…" : t);

// じまんの文。X に そのまま 貼れるように、長い時は 細かい所から けずって 280 に おさめる
export function shareText(i: ShareInput): string {
  const build = (o: { tag: boolean; detail: number; maxBoss: number; titles: number; best: boolean; parts: boolean; name: number }) => [
    "らくがきアリーナで あそんでるよ✏️",
    ...(i.charName && o.name ? [`🧑 キャラ「${cut(i.charName, o.name)}」`] : []),
    storyLine(i.cleared, i.chapters, o.detail, o.maxBoss),
    `⭐ Lv${i.level} ツリー${i.spent}/${i.cap}${i.titles.length && o.titles ? `（${i.titles.slice(0, o.titles).join("・")}${i.titles.length > o.titles ? "…" : ""}）` : ""}`,
    ...(o.parts ? [`🧩 パーツ${i.partCount}こ${i.bestPart && o.best ? `（さいこう ${i.bestPart}）` : ""}`] : []),
    ...(o.tag ? ["じぶんで かいた絵が たたかう ゲーム"] : []),
    GAME_URL,
    HASHTAG,
  ].join("\n");
  // けずる順（あとの方ほど たくさん けずる）
  const steps = [
    { tag: true, detail: 2, maxBoss: 99, titles: 99, best: true, parts: true, name: 20 },
    { tag: false, detail: 2, maxBoss: 99, titles: 99, best: true, parts: true, name: 20 },
    { tag: false, detail: 1, maxBoss: 3, titles: 99, best: true, parts: true, name: 20 },
    { tag: false, detail: 0, maxBoss: 2, titles: 2, best: true, parts: true, name: 16 },
    { tag: false, detail: 0, maxBoss: 1, titles: 1, best: false, parts: true, name: 12 },
    { tag: false, detail: 0, maxBoss: 0, titles: 0, best: false, parts: false, name: 10 },
  ];
  for (const o of steps) { const t = build(o); if (xLength(t) <= X_LIMIT) return t; }
  return build({ tag: false, detail: 0, maxBoss: 0, titles: 0, best: false, parts: false, name: 0 });
}
