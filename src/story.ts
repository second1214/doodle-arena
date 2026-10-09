// ストーリーモードのステージ。進むほど敵が強い（強化ポイント・反応の速さ・防御の上手さ・必殺）。
// 数値は設計レビューの難易度表による（docs/SPEC.md §18・§21）。各章の6番目がボス（手描きの専用キャラ）。
import type { Stroke } from "./detect";
import { SAMPLES } from "./samples";
import { NEW_SAMPLES } from "./newChars";
import type { AiLevel } from "./sim/ai";
import { hashStr, makePart, seededRnd, type Part, type PartKind, type Rarity } from "./items";
import type { Personality } from "./sim/world";

export interface Stage {
  id: string; // 保存用（変えない）
  no: number; // 通し番号（経験値の計算に使う）
  title: string;
  enemy: string; // 敵の名前
  strokes: () => Stroke[];
  personality: Personality;
  specialType: "ranged" | "melee";
  parts: [PartKind, Rarity][]; // 敵の必殺パーツ（数値はステージごとに毎回同じ）
  boostPoints: number; // 敵の強化ポイント（スキルツリーを prefer の枝の順に取る）
  prefer: string[];
  hp?: number; // 敵の体力の増減（簡単なステージは減らす）
  ai: AiLevel;
  boss?: boolean;
  final?: boolean; // ラスボス（A 確定・4回に1回 S）
}

export interface Chapter {
  no: number;
  title: string;
  stages: Stage[];
}

const EVEN = { boostPoints: 0, prefer: [] as string[] };

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
function ellipse(cx: number, cy: number, rx: number, ry: number, width = 9, color = "#222222"): Stroke {
  const pts: number[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    pts.push(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry));
  }
  return line(pts, width, color);
}

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

// 第2章のボス: インクの竜（横に長い体・背中のトゲ・しっぽ）
const DRAGON = (): Stroke[] => [
  ellipse(240, 290, 140, 62, 10, "#2b8a3e"),
  fill(240, 300, "#8ce99a"),
  circle(392, 222, 48, 10, "#2b8a3e"),
  fill(392, 222, "#8ce99a"),
  circle(408, 210, 8, 7, "#222222"),
  line([420, 240, 440, 246], 6, "#222222"),
  line([140, 240, 160, 192, 185, 234, 210, 186, 235, 232, 260, 184, 285, 232, 305, 190, 325, 238], 9, "#2b8a3e"),
  line([160, 340, 150, 420], 13, "#2b8a3e"),
  line([215, 350, 210, 430], 13, "#2b8a3e"),
  line([270, 350, 275, 430], 13, "#2b8a3e"),
  line([325, 340, 335, 420], 13, "#2b8a3e"),
  line([102, 300, 50, 270, 30, 220], 12, "#2b8a3e"),
];

// 第3章のボス: 消しゴム将軍（四角い体・兜・長い腕）
const ERASER = (): Stroke[] => [
  line([176, 170, 336, 170, 336, 370, 176, 370, 176, 170], 11, "#c2255c"),
  fill(256, 270, "#fcc2d7"),
  line([166, 172, 256, 96, 346, 172], 11, "#495057"),
  fill(256, 145, "#adb5bd"),
  circle(222, 230, 10, 8, "#222222"),
  circle(290, 230, 10, 8, "#222222"),
  line([220, 290, 292, 290], 9, "#222222"),
  line([176, 240, 110, 280, 60, 250, 30, 200], 13, "#c2255c"),
  line([336, 240, 402, 280, 452, 250, 482, 200], 13, "#c2255c"),
  line([215, 370, 205, 455], 13, "#c2255c"),
  line([297, 370, 307, 455], 13, "#c2255c"),
];

// 第4章のボス: クレヨン魔女（とんがり帽子・三角のドレス・ほうき）
const WITCH = (): Stroke[] => [
  line([186, 170, 256, 40, 326, 170, 186, 170], 10, "#5f3dc4"),
  fill(256, 140, "#9775fa"),
  circle(256, 205, 42, 9, "#222222"),
  fill(256, 205, "#ffe8cc"),
  circle(240, 200, 6, 6, "#222222"),
  circle(272, 200, 6, 6, "#222222"),
  line([226, 248, 166, 400, 346, 400, 286, 248, 226, 248], 10, "#5f3dc4"),
  fill(256, 340, "#b197fc"),
  line([236, 280, 160, 300, 90, 260], 11, "#5f3dc4"),
  line([60, 230, 120, 290], 8, "#a0522d"),
  line([276, 280, 350, 300, 410, 330], 11, "#5f3dc4"),
  line([226, 400, 220, 460], 11, "#5f3dc4"),
  line([286, 400, 292, 460], 11, "#5f3dc4"),
];

// 第5章のボス（ラスボス）: 白紙の王（大きな星形・たくさんの手）
const BLANK = (): Stroke[] => {
  const pts: number[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 70 : 165;
    pts.push(Math.round(256 + Math.cos(a) * r), Math.round(262 + Math.sin(a) * r));
  }
  return [
    line(pts, 12, "#212529"),
    fill(256, 262, "#f8f9fa"),
    circle(228, 250, 12, 8, "#212529"),
    circle(284, 250, 12, 8, "#212529"),
    line([232, 300, 256, 286, 280, 300], 8, "#212529"),
    line([190, 200, 120, 160], 9, "#212529"),
    line([322, 200, 392, 160], 9, "#212529"),
    line([190, 320, 110, 350], 9, "#212529"),
    line([322, 320, 402, 350], 9, "#212529"),
  ];
};

// ボスの絵（自由バトルでも使う）
export const BOSS_DRAWINGS: Record<string, () => Stroke[]> = { "らくがき大王": KING, "インクの竜": DRAGON, "消しゴム将軍": ERASER, "クレヨン魔女": WITCH, "白紙の王": BLANK };

// 第1章: 反応が遅く（0.3〜0.43秒）、防御もあまりしない。ボスは少しだけ鋭い
const CH1_AI: AiLevel = { wait: [9, 5], defend: 0.3 };
// 第2章以降: 章が進むほど反応が速く、防御が上手い
const CH2_AI: AiLevel = { wait: [7, 5], defend: 0.5 };
const CH3_AI: AiLevel = { wait: [5, 5], defend: 0.7 };
const CH4_AI: AiLevel = { wait: [4, 4], defend: 0.9 };
const CH5_AI: AiLevel = { wait: [3, 4], defend: 1 };
// 敵の強化ポイントの振り方（性格ごとの好みの枝）
const A = ["atk", "hp", "spd"]; // 猛攻
const C = ["def", "hp", "sta"]; // 慎重
const N = ["sp", "sta", "spd"]; // 狙撃
const T = ["tec", "spd", "sp"]; // トリッキー

export const CHAPTERS: Chapter[] = [
  {
    no: 1,
    title: "らくがき町",
    stages: [
      { id: "1-1", no: 1, title: "はじめの一歩", enemy: "ぼうにんげん", strokes: SAMPLES["棒人間"], personality: "aggressive", specialType: "ranged", parts: [], ...EVEN, hp: -30, ai: CH1_AI },
      { id: "1-2", no: 2, title: "うねうね", enemy: "タコすけ", strokes: SAMPLES["タコ"], personality: "tricky", specialType: "ranged", parts: [], ...EVEN, hp: -30, ai: CH1_AI },
      { id: "1-3", no: 3, title: "突進してくる", enemy: "ずんぐり", strokes: SAMPLES["短足ずんぐり"], personality: "aggressive", specialType: "melee", parts: [["m:dash", "F"]], ...EVEN, hp: -30, ai: CH1_AI },
      { id: "1-4", no: 4, title: "トゲの雨", enemy: "トゲトゲ", strokes: SAMPLES["トゲトゲ"], personality: "sniper", specialType: "ranged", parts: [["r:multi", "E"]], ...EVEN, hp: -30, ai: CH1_AI },
      { id: "1-5", no: 5, title: "ころころ注意", enemy: "まんまる", strokes: SAMPLES["まんまる（塗りつぶし）"], personality: "cautious", specialType: "ranged", parts: [["r:homing", "E"]], ...EVEN, hp: -30, ai: CH1_AI },
      { id: "1-6", no: 6, title: "らくがき大王", enemy: "らくがき大王", strokes: KING, personality: "aggressive", specialType: "melee", parts: [["m:giantHands", "D"], ["m:slam", "D"]], boostPoints: 4, prefer: ["atk", "hp"], hp: -15, ai: { wait: [8, 5], defend: 0.5 }, boss: true },
    ],
  },
  {
    no: 2,
    title: "インクの森",
    stages: [
      { id: "2-1", no: 7, title: "はやい弾", enemy: "ムカデせんせい", strokes: NEW_SAMPLES["ムカデせんせい"], personality: "aggressive", specialType: "ranged", parts: [["r:fast", "E"]], boostPoints: 3, prefer: A, hp: -15, ai: CH2_AI },
      { id: "2-2", no: 8, title: "グニャグニャ文字", enemy: "もじの「ん」", strokes: NEW_SAMPLES["もじの「ん」"], personality: "tricky", specialType: "melee", parts: [["m:wobble", "E"]], boostPoints: 4, prefer: T, hp: -15, ai: CH2_AI },
      { id: "2-3", no: 9, title: "動けない", enemy: "ノッポ", strokes: SAMPLES["胴長ノッポ"], personality: "sniper", specialType: "ranged", parts: [["r:restrain", "D"]], boostPoints: 5, prefer: N, hp: -15, ai: CH2_AI },
      { id: "2-4", no: 10, title: "のびる拳", enemy: "かたてマン", strokes: SAMPLES["巨大な片手"], personality: "aggressive", specialType: "melee", parts: [["m:rubber", "D"]], boostPoints: 6, prefer: A, hp: -15, ai: CH2_AI },
      { id: "2-5", no: 11, title: "大きな墨", enemy: "イソギンチャク", strokes: NEW_SAMPLES["イソギンチャク"], personality: "cautious", specialType: "ranged", parts: [["r:giant", "D"], ["r:homing", "E"]], boostPoints: 7, prefer: C, hp: -15, ai: CH2_AI },
      { id: "2-6", no: 12, title: "インクの竜", enemy: "インクの竜", strokes: DRAGON, personality: "aggressive", specialType: "melee", parts: [["m:tornado", "C"], ["m:legbind", "C"]], boostPoints: 12, prefer: ["hp", "atk", "sta"], ai: { wait: [6, 5], defend: 0.7 }, boss: true },
    ],
  },
  {
    no: 3,
    title: "消しゴム砦",
    stages: [
      { id: "3-1", no: 13, title: "トゲの嵐", enemy: "トゲトゲ", strokes: SAMPLES["トゲトゲ"], personality: "sniper", specialType: "ranged", parts: [["r:multi", "C"], ["r:fast", "D"]], boostPoints: 9, prefer: N, ai: CH3_AI },
      { id: "3-2", no: 14, title: "つかまえた", enemy: "よこあるきガニ", strokes: NEW_SAMPLES["よこあるきガニ"], personality: "cautious", specialType: "melee", parts: [["m:grab", "C"], ["m:dash", "D"]], boostPoints: 10, prefer: C, ai: CH3_AI },
      { id: "3-3", no: 15, title: "空から降る", enemy: "まんまる", strokes: SAMPLES["まんまる（塗りつぶし）"], personality: "tricky", specialType: "ranged", parts: [["r:meteor", "C"], ["r:giant", "D"]], boostPoints: 11, prefer: T, ai: CH3_AI },
      { id: "3-4", no: 16, title: "くしゃくしゃ", enemy: "チョキチョキ", strokes: NEW_SAMPLES["チョキチョキ"], personality: "tricky", specialType: "melee", parts: [["m:crumple", "C"]], boostPoints: 12, prefer: T, ai: CH3_AI },
      { id: "3-5", no: 17, title: "見えない", enemy: "ふわりおばけ", strokes: NEW_SAMPLES["ふわりおばけ"], personality: "sniper", specialType: "ranged", parts: [["r:invisible", "D"]], boostPoints: 13, prefer: N, ai: CH3_AI },
      { id: "3-6", no: 18, title: "消しゴム将軍", enemy: "消しゴム将軍", strokes: ERASER, personality: "cautious", specialType: "melee", parts: [["m:giantHands", "B"], ["m:grab", "B"]], boostPoints: 18, prefer: ["def", "hp", "atk"], ai: { wait: [4, 5], defend: 0.9 }, boss: true },
    ],
  },
  {
    no: 4,
    title: "クレヨン城",
    stages: [
      { id: "4-1", no: 19, title: "ゴムのノッポ", enemy: "えんぴつナイト", strokes: NEW_SAMPLES["えんぴつナイト"], personality: "aggressive", specialType: "melee", parts: [["m:rubber", "B"], ["m:wobble", "C"]], boostPoints: 15, prefer: A, ai: CH4_AI },
      { id: "4-2", no: 20, title: "豆粒の文字", enemy: "ひょろグモ", strokes: NEW_SAMPLES["ひょろグモ"], personality: "sniper", specialType: "ranged", parts: [["r:tiny", "B"], ["r:homing", "C"]], boostPoints: 16, prefer: N, ai: CH4_AI },
      { id: "4-3", no: 21, title: "大王ふたたび", enemy: "らくがき大王", strokes: KING, personality: "aggressive", specialType: "melee", parts: [["m:giantHands", "B"], ["m:slam", "B"]], boostPoints: 17, prefer: ["atk", "hp"], ai: CH4_AI },
      { id: "4-4", no: 22, title: "からめとる", enemy: "タコすけ", strokes: SAMPLES["タコ"], personality: "tricky", specialType: "ranged", parts: [["r:multi", "B"], ["r:restrain", "C"]], boostPoints: 18, prefer: T, ai: CH4_AI },
      { id: "4-5", no: 23, title: "地ならし", enemy: "かたてマン", strokes: SAMPLES["巨大な片手"], personality: "cautious", specialType: "melee", parts: [["m:slam", "B"], ["m:legbind", "C"]], boostPoints: 19, prefer: C, ai: CH4_AI },
      { id: "4-6", no: 24, title: "クレヨン魔女", enemy: "クレヨン魔女", strokes: WITCH, personality: "sniper", specialType: "ranged", parts: [["r:meteor", "A"], ["r:homing", "A"]], boostPoints: 24, prefer: ["sp", "sta", "def"], ai: { wait: [3, 4], defend: 1 }, boss: true },
    ],
  },
  {
    no: 5,
    title: "白紙の果て",
    stages: [
      { id: "5-1", no: 25, title: "竜の竜巻", enemy: "インクの竜", strokes: DRAGON, personality: "aggressive", specialType: "melee", parts: [["m:tornado", "A"], ["m:legbind", "B"]], boostPoints: 21, prefer: A, ai: CH5_AI },
      { id: "5-2", no: 26, title: "将軍の投げ", enemy: "消しゴム将軍", strokes: ERASER, personality: "cautious", specialType: "melee", parts: [["m:grab", "A"], ["m:giantHands", "B"]], boostPoints: 22, prefer: C, ai: CH5_AI },
      { id: "5-3", no: 27, title: "見えない隕石", enemy: "クレヨン魔女", strokes: WITCH, personality: "sniper", specialType: "ranged", parts: [["r:meteor", "A"], ["r:invisible", "B"]], boostPoints: 23, prefer: N, ai: CH5_AI },
      { id: "5-4", no: 28, title: "トゲの光", enemy: "ハリネズミ", strokes: NEW_SAMPLES["ハリネズミ"], personality: "tricky", specialType: "ranged", parts: [["r:multi", "A"], ["r:fast", "A"]], boostPoints: 24, prefer: T, ai: CH5_AI },
      { id: "5-5", no: 29, title: "最後の門番", enemy: "がたごとでんしゃ", strokes: NEW_SAMPLES["がたごとでんしゃ"], personality: "aggressive", specialType: "melee", parts: [["m:crumple", "A"], ["m:dash", "B"]], boostPoints: 25, prefer: A, ai: CH5_AI },
      { id: "5-6", no: 30, title: "白紙の王", enemy: "白紙の王", strokes: BLANK, personality: "aggressive", specialType: "ranged", parts: [["r:invisible", "S"], ["r:homing", "A"]], boostPoints: 28, prefer: ["hp", "atk", "sp", "def"], ai: { wait: [2, 4], defend: 1.2 }, boss: true, final: true },
    ],
  },
];

// これから足す章（メニューに「準備中」で出す）
export const UPCOMING: string[] = [];

export const ALL_STAGES = CHAPTERS.flatMap((c) => c.stages);

// 1つ前のステージに勝っていれば挑戦できる
export function isUnlocked(stage: Stage, cleared: Record<string, number>): boolean {
  const i = ALL_STAGES.indexOf(stage);
  return i <= 0 || !!cleared[ALL_STAGES[i - 1].id];
}

export const chapterOf = (stage: Stage) => CHAPTERS.find((c) => c.stages.includes(stage))?.no ?? 1;

// 敵のパーツの実体（ステージ id から作るので毎回同じ数値）
export function enemyParts(stage: Stage): Part[] {
  return stage.parts.map(([kind, rarity], i) => makePart(kind, rarity, seededRnd(hashStr(`${stage.id}#${i}`)), `${stage.id}#${i}`));
}

