// 拡散用の文（SNS などに貼る じまんの文）。ストーリーの進み具合とステータスから作る。DOM 非依存。
import type { Chapter } from "./story";

export const GAME_URL = "https://second1214.github.io/doodle-arena/";
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

export function storyLine(cleared: Record<string, number>, chapters: Chapter[]): string {
  const stages = chapters.flatMap((c) => c.stages.map((s) => ({ c, s })));
  const done = stages.filter(({ s }) => cleared[s.id]);
  if (!done.length) return "📖 ストーリー: これから ぼうけん スタート！";
  const last = done.reduce((a, b) => (b.s.no > a.s.no ? b : a));
  const all = done.length === stages.length;
  const boss = stages.filter(({ s }) => s.boss && cleared[s.id]).map(({ s }) => s.enemy);
  return [
    all ? `📖 ストーリー: ぜんぶ クリア！（${stages.length}ステージ）` : `📖 ストーリー: 第${last.c.no}章「${last.c.title}」${last.s.id}「${last.s.title}」まで クリア（${done.length}/${stages.length}）`,
    ...(boss.length ? [`👑 たおした ボス: ${boss.join("・")}`] : []),
  ].join("\n");
}

export function shareText(i: ShareInput): string {
  return [
    "らくがきアリーナで あそんでるよ！✏️⚔️",
    ...(i.charName ? [`🧑 わたしの キャラ: 「${i.charName}」`] : []),
    storyLine(i.cleared, i.chapters),
    `⭐ Lv${i.level}・スキルツリー ${i.spent}/${i.cap}${i.titles.length ? `（${i.titles.join("・")}）` : ""}`,
    `🧩 ひっさつパーツ ${i.partCount}こ${i.bestPart ? `（いちばん レア: ${i.bestPart}）` : ""}`,
    "",
    `じぶんで かいた絵が たたかう ゲーム`,
    GAME_URL,
    HASHTAG,
  ].join("\n");
}
