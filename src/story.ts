// ストーリーモードのステージ。進むほど敵が強い（強化ポイント・反応の速さ・防御の上手さ・必殺）。
// 数値は設計レビュー（docs/SPEC.md §18）の難易度表による。第2章以降は後の段階で足す。
import type { Stroke } from "./detect";
import { SAMPLES } from "./samples";
import type { AiLevel } from "./sim/ai";
import type { EffectId } from "./sim/special";
import type { MeleeEffectId } from "./sim/melee";
import type { Stats } from "./sim/stats";
import type { Personality } from "./sim/world";

export interface Stage {
  id: string; // 保存用（変えない）
  no: number; // 通し番号（経験値の計算に使う）
  title: string;
  enemy: string; // 敵の名前
  strokes: () => Stroke[];
  personality: Personality;
  specialType: "ranged" | "melee";
  special: EffectId[];
  melee: MeleeEffectId[];
  stats: Stats;
  ai: AiLevel;
  boss?: boolean;
}

export interface Chapter {
  no: number;
  title: string;
  stages: Stage[];
}

const S = (a: number, d: number, sp: number, hp: number, st: number): Stats => ({ attack: a, defense: d, speed: sp, hp, stamina: st });
const EVEN = S(4, 4, 4, 4, 4);

const line = (pts: number[], width = 9, color = "#222222"): Stroke => ({ color, width, points: pts });
function circle(cx: number, cy: number, r: number, width = 9, color = "#222222"): Stroke {
  const pts: number[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    pts.push(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r));
  }
  return line(pts, width, color);
}
const fill = (x: number, y: number, color: string): Stroke => ({ color, width: 0, points: [x, y], fill: true });

// 第1章のボス: らくがき大王（王冠をかぶった、大きな拳の丸いやつ）
const KING = (): Stroke[] => [
  circle(256, 270, 100, 10, "#5f3dc4"),
  fill(256, 300, "#b197fc"),
  line([176, 196, 186, 120, 222, 168, 256, 108, 290, 168, 326, 120, 336, 196], 10, "#f2c200"),
  circle(222, 255, 12, 8, "#222222"),
  circle(290, 255, 12, 8, "#222222"),
  line([226, 310, 256, 328, 286, 310], 8, "#222222"),
  line([160, 270, 100, 230, 70, 180], 14, "#5f3dc4"),
  circle(64, 166, 24, 10, "#5f3dc4"),
  line([352, 270, 412, 230, 442, 180], 14, "#5f3dc4"),
  circle(448, 166, 24, 10, "#5f3dc4"),
  line([215, 362, 200, 440, 170, 452], 12, "#5f3dc4"),
  line([297, 362, 312, 440, 342, 452], 12, "#5f3dc4"),
];

// 第1章: 反応が遅く（0.3〜0.43秒）、防御もあまりしない。ボスは少しだけ鋭い
const CH1_AI: AiLevel = { wait: [9, 5], defend: 0.3 };

export const CHAPTERS: Chapter[] = [
  {
    no: 1,
    title: "らくがき町",
    stages: [
      { id: "1-1", no: 1, title: "はじめの一歩", enemy: "棒人間", strokes: SAMPLES["棒人間"], personality: "aggressive", specialType: "ranged", special: [], melee: [], stats: EVEN, ai: CH1_AI },
      { id: "1-2", no: 2, title: "うねうね", enemy: "タコ", strokes: SAMPLES["タコ"], personality: "tricky", specialType: "ranged", special: [], melee: [], stats: EVEN, ai: CH1_AI },
      { id: "1-3", no: 3, title: "突進してくる", enemy: "短足ずんぐり", strokes: SAMPLES["短足ずんぐり"], personality: "aggressive", specialType: "melee", special: [], melee: ["dash"], stats: EVEN, ai: CH1_AI },
      { id: "1-4", no: 4, title: "トゲの雨", enemy: "トゲトゲ", strokes: SAMPLES["トゲトゲ"], personality: "sniper", specialType: "ranged", special: ["multi"], melee: [], stats: EVEN, ai: CH1_AI },
      { id: "1-5", no: 5, title: "ころころ注意", enemy: "まんまる", strokes: SAMPLES["まんまる（塗りつぶし）"], personality: "cautious", specialType: "ranged", special: ["homing"], melee: [], stats: EVEN, ai: CH1_AI },
      { id: "1-6", no: 6, title: "らくがき大王", enemy: "らくがき大王", strokes: KING, personality: "aggressive", specialType: "melee", special: [], melee: ["giantHands", "slam"], stats: S(5, 5, 4, 6, 4), ai: { wait: [8, 5], defend: 0.5 }, boss: true },
    ],
  },
];

// これから足す章（メニューに「準備中」で出す）
export const UPCOMING = ["第2章", "第3章", "第4章", "第5章"];

export const ALL_STAGES = CHAPTERS.flatMap((c) => c.stages);

// 1つ前のステージに勝っていれば挑戦できる
export function isUnlocked(stage: Stage, cleared: Record<string, number>): boolean {
  const i = ALL_STAGES.indexOf(stage);
  return i <= 0 || !!cleared[ALL_STAGES[i - 1].id];
}
