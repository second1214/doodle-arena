// ストーリーの あとの おたのしみ「チャレンジ」: 1対多（同時に 何人も）・プール（水場）の たたかい。
// 敵は ストーリーの ステージを ひながたに 使う（絵・ひっさつ・強さ）。人数が 多いほど 1人ずつの 体力を へらして 釣り合わせる。
import { ALL_STAGES, type Stage } from "./story";

export interface Challenge {
  id: string;
  no: number; // 経験値の 計算用（ストーリーの 続きの 番号）
  icon: string;
  title: string;
  foes: string[]; // ひながたの ステージ id（1人目が 主役）
  arena: string;
  hpEach: number; // 1人ずつの 体力の 増減（強化ポイントの hp と同じ 単位）
}

export const CHALLENGES: Challenge[] = [
  { id: "c1", no: 43, icon: "🌊", title: "プールで ばしゃばしゃ", foes: ["7-2"], arena: "pool", hpEach: 30 },
  { id: "c2", no: 44, icon: "👥", title: "トゲトゲ ふたご", foes: ["5-1", "3-1"], arena: "flat", hpEach: -15 },
  { id: "c3", no: 45, icon: "👥", title: "ブロックの 3にん", foes: ["6-1", "6-2", "6-4"], arena: "cave", hpEach: -66 },
  { id: "c4", no: 46, icon: "⚡", title: "プールの かみなり", foes: ["7-1", "7-2"], arena: "pool", hpEach: -40 },
  { id: "c5", no: 47, icon: "👑", title: "ボスが ふたり", foes: ["4-6", "5-6"], arena: "sky", hpEach: -30 },
  { id: "c6", no: 48, icon: "🏆", title: "さいごの プール", foes: ["7-6", "6-6", "7-5"], arena: "pool", hpEach: -75 },
];
// 自動対戦（ストーリーを 終えた くらいの 強さ）での 勝率の めやす: 88 / 67 / 58 / 50 / 33 / 29 %

export const UNLOCK_STAGE = "7-6"; // ストーリーの さいごを クリアすると ひらく
export const foeStages = (c: Challenge): Stage[] => c.foes.map((id) => ALL_STAGES.find((s) => s.id === id)!);
// 1つ前を クリアしたら 次が ひらく
export function challengeOpen(c: Challenge, cleared: Record<string, number>): boolean {
  const i = CHALLENGES.indexOf(c);
  return !!cleared[UNLOCK_STAGE] && (i === 0 || !!cleared[CHALLENGES[i - 1].id]);
}
