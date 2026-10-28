// ストーリーモードのステージ。進むほど敵が強い（強化ポイント・反応の速さ・防御の上手さ・必殺）。
// 数値は設計レビューの難易度表による（docs/SPEC.md §18・§21）。各章の6番目がボス（手描きの専用キャラ）。
import type { Stroke } from "./detect";
import { SAMPLES } from "./samples";
import { NEW_SAMPLES } from "./newChars";
import { crossMarks, crossStrokes } from "./crossChars";
import type { AiLevel } from "./sim/ai";
import { hashStr, makePart, seededRnd, type Part, type PartKind, type Rarity } from "./items";
import type { Personality } from "./sim/world";
import { autoTree, boostOf, TREE_CAP } from "./tree";
import { sumBoost, type Boost } from "./sim/stats";

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
  arena?: string; // ステージ（地形と背景。src/sim/arena.ts。無ければ 平らな ひろば）
  marks?: () => Stroke[]; // 敵の 手足レイヤー（羽など）
  crew?: string[]; // いっしょに 出てくる なかま（ステージ id。その ステージの 絵・シール・強化で 出る）＝1対多の 集団戦
  crewBoost?: Partial<Boost>; // 集団戦の なかま 1人ずつに 足す 強化（体力・ダメージを 下げて 数で せめる）
  crewAi?: AiLevel; // 集団戦の なかまの 強さ（無ければ ai と同じ）
  drops?: number; // 勝った時に もらえる シールの 数（ふつう 1・ボス 2）
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
const CH6_AI: AiLevel = { wait: [3, 3], defend: 1.05 };
const CH7_AI: AiLevel = { wait: [2, 3], defend: 1.1 };
const CH9_AI: AiLevel = { wait: [1, 3], defend: 1.25 };
const CH10_AI: AiLevel = { wait: [1, 2], defend: 1.3 };
// 新しい章の 敵（絵と 手足レイヤーを いっしょに）
const X = (name: string) => ({ enemy: name, strokes: crossStrokes(name), marks: crossMarks(name) });
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
      { id: "2-5", no: 11, title: "大きな墨", enemy: "イソギンチャク", strokes: NEW_SAMPLES["イソギンチャク"], personality: "cautious", specialType: "ranged", parts: [["r:giant", "D"], ["r:homing", "E"]], boostPoints: 7, prefer: C, hp: -15, ai: CH2_AI, arena: "beach" },
      { id: "2-6", no: 12, title: "インクの竜", enemy: "インクの竜", strokes: DRAGON, personality: "aggressive", specialType: "melee", parts: [["m:tornado", "C"], ["m:legbind", "C"]], boostPoints: 12, prefer: ["hp", "atk", "sta"], ai: { wait: [6, 5], defend: 0.7 }, boss: true, arena: "hill" },
    ],
  },
  {
    no: 3,
    title: "消しゴム砦",
    stages: [
      { id: "3-1", no: 13, title: "トゲの嵐", enemy: "トゲトゲ", strokes: SAMPLES["トゲトゲ"], personality: "sniper", specialType: "ranged", parts: [["r:multi", "C"], ["r:split", "D"]], boostPoints: 9, prefer: N, ai: CH3_AI },
      { id: "3-2", no: 14, title: "つかまえた", enemy: "よこあるきガニ", strokes: NEW_SAMPLES["よこあるきガニ"], personality: "cautious", specialType: "melee", parts: [["m:grab", "C"], ["m:dash", "D"]], boostPoints: 10, prefer: C, ai: CH3_AI },
      { id: "3-3", no: 15, title: "空から降る", enemy: "まんまる", strokes: SAMPLES["まんまる（塗りつぶし）"], personality: "tricky", specialType: "ranged", parts: [["r:meteor", "C"], ["r:giant", "D"]], boostPoints: 11, prefer: T, ai: CH3_AI },
      { id: "3-4", no: 16, title: "くしゃくしゃ", enemy: "チョキチョキ", strokes: NEW_SAMPLES["チョキチョキ"], personality: "tricky", specialType: "melee", parts: [["m:crumple", "C"]], boostPoints: 12, prefer: T, ai: CH3_AI },
      { id: "3-5", no: 17, title: "見えない", enemy: "ふわりおばけ", strokes: NEW_SAMPLES["ふわりおばけ"], personality: "sniper", specialType: "ranged", parts: [["r:invisible", "D"]], boostPoints: 13, prefer: N, ai: CH3_AI, arena: "night" },
      { id: "3-6", no: 18, title: "消しゴム将軍", enemy: "消しゴム将軍", strokes: ERASER, personality: "cautious", specialType: "melee", parts: [["m:giantHands", "B"], ["m:grab", "B"]], boostPoints: 18, prefer: ["def", "hp", "atk"], ai: { wait: [4, 5], defend: 0.9 }, boss: true, arena: "room" },
    ],
  },
  {
    no: 4,
    title: "クレヨン城",
    stages: [
      { id: "4-1", no: 19, title: "大王ふたたび", enemy: "らくがき大王", strokes: KING, personality: "aggressive", specialType: "melee", parts: [["m:giantHands", "B"], ["m:slam", "B"]], boostPoints: 15, prefer: ["atk", "hp"], ai: CH4_AI },
      { id: "4-2", no: 20, title: "からめとる", enemy: "タコすけ", strokes: SAMPLES["タコ"], personality: "tricky", specialType: "ranged", parts: [["r:multi", "B"], ["r:restrain", "C"]], boostPoints: 16, prefer: T, ai: CH4_AI },
      { id: "4-3", no: 21, title: "地ならし", enemy: "かたてマン", strokes: SAMPLES["巨大な片手"], personality: "cautious", specialType: "melee", parts: [["m:slam", "B"], ["m:legbind", "C"]], boostPoints: 17, prefer: C, ai: CH4_AI },
      { id: "4-4", no: 22, title: "豆粒の文字", enemy: "ひょろグモ", strokes: NEW_SAMPLES["ひょろグモ"], personality: "sniper", specialType: "ranged", parts: [["r:tiny", "C"], ["r:homing", "C"]], boostPoints: 18, prefer: N, ai: CH4_AI },
      { id: "4-5", no: 23, title: "ゴムのノッポ", enemy: "えんぴつナイト", strokes: NEW_SAMPLES["えんぴつナイト"], personality: "aggressive", specialType: "melee", parts: [["m:rubber", "C"], ["m:wobble", "D"]], boostPoints: 19, prefer: A, ai: CH4_AI },
      { id: "4-6", no: 24, title: "クレヨン魔女", enemy: "クレヨン魔女", strokes: WITCH, personality: "sniper", specialType: "ranged", parts: [["r:meteor", "B"], ["r:split", "B"], ["r:fire", "F"]], boostPoints: 18, prefer: ["sp", "sta", "def"], ai: { wait: [3, 4], defend: 1 }, boss: true, arena: "night" },
    ],
  },
  {
    no: 5,
    title: "白紙の果て",
    stages: [
      { id: "5-1", no: 25, title: "トゲの光", enemy: "ハリネズミ", strokes: NEW_SAMPLES["ハリネズミ"], personality: "tricky", specialType: "ranged", parts: [["r:multi", "A"], ["r:fast", "A"], ["r:split", "B"]], boostPoints: 21, prefer: T, ai: CH5_AI },
      { id: "5-2", no: 26, title: "最後の門番", enemy: "がたごとでんしゃ", strokes: NEW_SAMPLES["がたごとでんしゃ"], personality: "aggressive", specialType: "melee", parts: [["m:crumple", "A"], ["m:dash", "B"]], boostPoints: 22, prefer: A, ai: CH5_AI },
      { id: "5-3", no: 27, title: "竜の竜巻", enemy: "インクの竜", strokes: DRAGON, personality: "aggressive", specialType: "melee", parts: [["m:tornado", "A"], ["m:legbind", "B"]], boostPoints: 23, prefer: A, ai: CH5_AI },
      { id: "5-4", no: 28, title: "見えない隕石", enemy: "クレヨン魔女", strokes: WITCH, personality: "sniper", specialType: "ranged", parts: [["r:meteor", "A"], ["r:invisible", "B"]], boostPoints: 24, prefer: N, ai: CH5_AI },
      { id: "5-5", no: 29, title: "将軍の投げ", enemy: "消しゴム将軍", strokes: ERASER, personality: "cautious", specialType: "melee", parts: [["m:grab", "C"], ["m:giantHands", "B"]], boostPoints: 25, prefer: C, ai: CH5_AI },
      { id: "5-6", no: 30, title: "白紙の王", enemy: "白紙の王", strokes: BLANK, personality: "aggressive", specialType: "ranged", parts: [["r:invisible", "S"], ["r:homing", "A"], ["r:freeze", "F"]], boostPoints: 28, prefer: ["hp", "atk", "sp", "def"], ai: { wait: [2, 4], defend: 1.2 }, boss: true, final: true },
    ],
  },
  {
    no: 6,
    title: "ブロックの せかい",
    stages: [
      { id: "6-1", no: 31, title: "四角い ゆうしゃ", ...X("スティープ"), personality: "cautious", specialType: "melee", parts: [["m:dash", "A"], ["power", "B"]], boostPoints: 26, prefer: ["atk", "def", "hp"], ai: CH6_AI, arena: "hill" },
      { id: "6-2", no: 32, title: "夜の ゾンビ", ...X("ゾンビー"), personality: "aggressive", specialType: "melee", parts: [["m:grab", "A"], ["m:vampire", "B"]], boostPoints: 27, prefer: ["hp", "atk", "sta"], ai: CH6_AI, arena: "night" },
      { id: "6-3", no: 33, title: "シューーー…", ...X("クリーバー"), personality: "aggressive", specialType: "ranged", parts: [["r:blast", "A"], ["r:trap", "B"]], boostPoints: 28, prefer: ["sp", "hp", "spd"], ai: CH6_AI, arena: "cave" },
      { id: "6-4", no: 34, title: "ほねの 弓", ...X("ホネルトン"), personality: "sniper", specialType: "ranged", parts: [["r:fast", "A"], ["r:tiny", "A"]], boostPoints: 29, prefer: ["sp", "spd", "tec"], ai: CH6_AI, arena: "room" },
      { id: "6-5", no: 35, title: "目を 合わせるな", ...X("エンダマン"), personality: "tricky", specialType: "ranged", parts: [["r:invisible", "A"], ["r:homing", "A"]], boostPoints: 30, prefer: ["tec", "spd", "sp"], ai: CH6_AI, arena: "sky" },
      { id: "6-6", no: 36, title: "エンダラゴン", ...X("エンダラゴン"), personality: "sniper", specialType: "ranged", parts: [["r:rain", "S"], ["r:giant", "B"], ["r:fire", "A"]], boostPoints: 34, prefer: ["sp", "hp", "fly", "def"], ai: { wait: [2, 3], defend: 1.15 }, boss: true, arena: "sky" },
    ],
  },
  {
    no: 7,
    title: "ふしぎな しま",
    stages: [
      { id: "7-1", no: 37, title: "ビリビリ", ...X("ヒカチュウ"), personality: "tricky", specialType: "ranged", parts: [["r:cloud", "A"], ["r:drip", "A"], ["r:thunder", "A"]], boostPoints: 31, prefer: ["spd", "sp", "tec"], ai: CH7_AI, arena: "hill" },
      { id: "7-2", no: 38, title: "なみのり", ...X("ゼニカメ"), personality: "cautious", specialType: "ranged", parts: [["r:wave", "A"], ["r:split", "A"], ["r:freeze", "B"]], boostPoints: 32, prefer: ["def", "hp", "sp"], ai: CH7_AI, arena: "beach" },
      { id: "7-3", no: 39, title: "空から くる", ...X("ホッポ"), personality: "tricky", specialType: "melee", parts: [["m:gust", "A"], ["m:dive", "A"]], boostPoints: 33, prefer: ["fly", "spd", "tec"], ai: CH7_AI, arena: "beach" },
      { id: "7-4", no: 40, title: "ねむる 山", ...X("カビコン"), personality: "cautious", specialType: "melee", parts: [["m:slam", "A"], ["m:mushroom", "A"]], boostPoints: 34, prefer: ["hp", "def", "atk"], ai: CH7_AI, arena: "cave" },
      { id: "7-5", no: 41, title: "ほのおの 竜", ...X("リザードソ"), personality: "aggressive", specialType: "melee", parts: [["m:dive", "A"], ["m:flame", "A"]], boostPoints: 35, prefer: ["fly", "atk", "hp"], ai: CH7_AI, arena: "sky" },
      { id: "7-6", no: 42, title: "ミュウスリー", ...X("ミュウスリー"), personality: "sniper", specialType: "ranged", parts: [["r:vacuum", "S"], ["r:thunder", "A"], ["r:homing", "A"], ["r:drip", "A"]], boostPoints: 38, prefer: ["sp", "hp", "def", "fly"], ai: { wait: [2, 3], defend: 1.25 }, boss: true, final: true, arena: "room" },
    ],
  },
  {
    no: 8,
    title: "ゆめかわ タウン",
    stages: [
      { id: "8-1", no: 43, title: "ふわふわ ひこう", ...X("シナモン"), personality: "tricky", specialType: "melee", parts: [["m:dive", "A"], ["m:ice", "A"]], boostPoints: 36, prefer: ["fly", "spd", "tec"], ai: CH7_AI, arena: "sky" },
      { id: "8-2", no: 44, title: "おしくらまんじゅう", ...X("ポムプリン"), personality: "cautious", specialType: "melee", parts: [["m:bulldozer", "C"], ["m:legbind", "D"]], boostPoints: 34, prefer: ["hp", "def", "atk"], ai: CH7_AI, arena: "room" },
      { id: "8-3", no: 45, title: "やさしい すいとり", ...X("マイメロン"), personality: "aggressive", specialType: "ranged", parts: [["r:homing", "A"], ["r:drain", "A"]], boostPoints: 38, prefer: ["hp", "sp", "def"], ai: CH7_AI, arena: "hill" },
      { id: "8-4", no: 46, title: "さかなの おじさん", ...X("ハンギョドム"), personality: "cautious", specialType: "ranged", parts: [["r:wave", "S"], ["r:drip", "A"], ["r:freeze", "B"]], boostPoints: 39, prefer: ["def", "hp", "sp"], ai: CH7_AI, arena: "pool" },
      { id: "8-5", no: 47, title: "いたずら ペンギン", ...X("バツまる"), personality: "aggressive", specialType: "melee", parts: [["m:grab", "A"], ["m:crumple", "A"]], boostPoints: 40, prefer: ["atk", "spd", "hp"], ai: CH7_AI, arena: "night" },
      { id: "8-6", no: 48, title: "いたずらの 女王", ...X("クロミー"), personality: "tricky", specialType: "ranged", parts: [["r:boomerang", "S"], ["r:split", "S"], ["r:net", "A"], ["r:fire", "A"]], boostPoints: 50, hp: 15, prefer: ["hp", "sp", "tec", "spd"], ai: { wait: [2, 3], defend: 1.25 }, boss: true, final: true, arena: "night" },
    ],
  },
  {
    no: 9,
    title: "キノコ王国",
    stages: [
      { id: "9-1", no: 49, title: "ジャンプの 名人", ...X("マリヨ"), personality: "aggressive", specialType: "ranged", parts: [["r:bounce", "S"], ["r:fire", "S"], ["r:split", "A"]], boostPoints: 46, prefer: ["atk", "spd", "hp"], ai: CH9_AI, arena: "hill" },
      { id: "9-2", no: 50, title: "したで パクッ", ...X("ヨッシ"), personality: "aggressive", specialType: "melee", parts: [["m:dash", "SS"], ["m:grab", "SS"], ["m:rush", "S"]], boostPoints: 47, prefer: ["atk", "spd", "hp"], ai: CH9_AI },
      { id: "9-3", no: 51, title: "こうらが はねる", ...X("ノコノッコ"), personality: "sniper", specialType: "ranged", parts: [["r:bounce", "SS"], ["r:giant", "S"], ["r:multi", "A"]], boostPoints: 48, prefer: ["def", "sp", "hp"], ai: CH9_AI, arena: "room" },
      { id: "9-4", no: 52, title: "どかんの 花", ...X("パックンフラワ"), personality: "cautious", specialType: "melee", parts: [["m:slam", "S"], ["m:grab", "SS"], ["m:vampire", "S"]], boostPoints: 49, prefer: ["hp", "atk", "def"], ai: CH9_AI, arena: "pool" },
      { id: "9-5", no: 53, title: "見ないで〜", ...X("テレザ"), personality: "tricky", specialType: "ranged", parts: [["r:homing", "SSS"], ["r:invisible", "SS"], ["r:drain", "SS"]], boostPoints: 50, prefer: ["tec", "sp", "spd"], ai: CH9_AI, arena: "night" },
      { id: "9-6", no: 54, title: "大まおう グッパ", ...X("グッパ"), personality: "aggressive", specialType: "melee", parts: [["m:slam", "SSS"], ["m:shockwave", "SSS"], ["m:rush", "SS"], ["m:flame", "SS"]], boostPoints: 52, hp: 12, prefer: ["hp", "atk", "def", "sta"], ai: { wait: [1, 3], defend: 1.25 }, boss: true, final: true, arena: "cave" },
    ],
  },
  {
    no: 10,
    title: "ネザーと ふかい やみ",
    stages: [
      { id: "10-1", no: 55, title: "金が すき", ...X("ピグリム"), personality: "aggressive", specialType: "melee", parts: [["m:dash", "SS"], ["m:rush", "S"], ["m:echo", "S"]], boostPoints: 52, prefer: ["atk", "spd", "hp"], ai: CH10_AI, arena: "cave" },
      { id: "10-2", no: 56, title: "ほのおの 棒", ...X("ブレイザー"), personality: "sniper", specialType: "ranged", parts: [["r:fast", "SS"], ["r:fire", "SS"], ["r:drip", "S"]], boostPoints: 53, prefer: ["sp", "spd", "tec"], ai: CH10_AI, arena: "sky" },
      { id: "10-3", no: 57, title: "空から ほのおの玉", ...X("ガストン"), personality: "sniper", specialType: "ranged", parts: [["r:meteor", "SS"], ["r:blast", "S"], ["r:giant", "S"]], boostPoints: 54, prefer: ["sp", "hp", "def"], ai: CH10_AI, arena: "night" },
      { id: "10-4", no: 58, title: "もどってきた 目", ...X("エンダマン"), personality: "tricky", specialType: "ranged", parts: [["r:homing", "SSS"], ["r:invisible", "SS"], ["r:split", "S"]], boostPoints: 55, prefer: ["tec", "spd", "sp"], ai: CH10_AI, arena: "room" },
      { id: "10-5", no: 59, title: "やみの 番人", ...X("ウォーダン"), personality: "cautious", specialType: "melee", parts: [["m:slam", "SS"], ["m:shockwave", "SS"], ["m:grab", "SS"]], boostPoints: 50, hp: 10, prefer: ["hp", "def", "atk", "sta"], ai: CH10_AI, boss: true, arena: "cave" },
      { id: "10-6", no: 60, title: "3つの ドクロ", ...X("ウィザ"), personality: "sniper", specialType: "ranged", parts: [["r:homing", "SSS"], ["r:blast", "SSS"], ["r:split", "SS"], ["r:fire", "SS"]], boostPoints: 56, hp: 20, prefer: ["sp", "hp", "def", "tec"], ai: { wait: [1, 2], defend: 1.35 }, boss: true, final: true, arena: "night" },
    ],
  },
  {
    no: 11,
    title: "キノコ王国の なかま",
    stages: [
      { id: "11-1", no: 61, title: "むれで くる", ...X("クリボン"), personality: "aggressive", specialType: "melee", parts: [["m:dash", "SS"], ["m:echo", "SS"], ["m:rush", "SS"]], boostPoints: 57, prefer: ["atk", "hp", "spd"], ai: CH10_AI, arena: "hill" },
      { id: "11-2", no: 62, title: "みどりの 弟", ...X("ルイジ"), personality: "cautious", specialType: "ranged", parts: [["r:homing", "SSS"], ["r:fire", "SS"], ["r:split", "S"]], boostPoints: 56, prefer: ["def", "spd", "sp"], ai: CH10_AI, arena: "night" },
      { id: "11-3", no: 63, title: "名人 ふたたび", ...X("マリヨ"), personality: "aggressive", specialType: "ranged", parts: [["r:bounce", "SSS"], ["r:fire", "SSS"], ["r:split", "SS"]], boostPoints: 60, hp: 10, prefer: ["atk", "spd", "hp"], ai: CH10_AI, arena: "beach" },
      { id: "11-4", no: 64, title: "ちいさな ゆうしゃ", ...X("キノピヨ"), personality: "tricky", specialType: "melee", parts: [["m:dash", "SS"], ["m:rush", "S"], ["m:echo", "S"]], boostPoints: 50, prefer: ["spd", "tec", "sta"], ai: CH9_AI, arena: "room" },
      { id: "11-5", no: 65, title: "大まおう ふたたび", ...X("グッパ"), personality: "aggressive", specialType: "melee", parts: [["m:slam", "SSS"], ["m:shockwave", "SSS"], ["m:flame", "SS"]], boostPoints: 56, hp: 10, prefer: ["hp", "atk", "def", "sta"], ai: CH10_AI, arena: "cave" },
      { id: "11-6", no: 66, title: "ひめの さいごの しれん", ...X("ピーナひめ"), personality: "cautious", specialType: "ranged", parts: [["r:homing", "SS"], ["r:drain", "SS"], ["r:freeze", "S"], ["r:split", "S"]], boostPoints: 50, prefer: ["hp", "def", "sp", "tec"], ai: { wait: [1, 3], defend: 1.25 }, boss: true, final: true, arena: "sky" },
    ],
  },
  {
    no: 12,
    title: "ダンス スクール",
    stages: [
      { id: "12-1", no: 67, title: "コリコリ ステップ", ...X("ナンコツ"), personality: "cautious", specialType: "melee", parts: [["m:slam", "SS"], ["m:counter", "SS"], ["m:grab", "S"]], boostPoints: 120, prefer: ["def", "hp", "atk"], ai: CH10_AI, arena: "room" },
      { id: "12-2", no: 68, title: "もちもち 3れんぱつ", ...X("ダンゴ"), personality: "cautious", specialType: "ranged", parts: [["r:homing", "A"], ["r:split", "A"], ["r:giant", "A"]], boostPoints: 120, hp: -100, prefer: ["hp", "sp", "def"], ai: CH9_AI, arena: "hill" },
      { id: "12-3", no: 69, title: "あまい わな", ...X("リンゴアメ"), personality: "tricky", specialType: "ranged", parts: [["r:boomerang", "SS"], ["r:restrain", "SS"], ["r:split", "S"]], boostPoints: 120, prefer: ["tec", "sp", "spd"], ai: CH10_AI, arena: "night" },
      { id: "12-4", no: 70, title: "2度づけ きんし", ...X("クシカツ"), personality: "sniper", specialType: "ranged", parts: [["r:fast", "SS"], ["r:multi", "SS"], ["r:split", "S"]], boostPoints: 120, hp: -80, prefer: ["sp", "spd", "tec"], ai: CH10_AI, arena: "beach" },
      { id: "12-5", no: 71, title: "ほねほね ダンス", ...X("ホネチキン"), personality: "aggressive", specialType: "melee", parts: [["m:dash", "SS"], ["m:rush", "SS"], ["m:echo", "S"]], boostPoints: 120, prefer: ["atk", "spd", "hp"], ai: CH10_AI, arena: "sky" },
      { id: "12-6", no: 72, title: "先生と みんなで 発表会", ...X("スキップガエル先生"), personality: "aggressive", specialType: "melee", parts: [["m:slam", "S"], ["m:shockwave", "S"], ["m:rush", "S"]], boostPoints: 120, hp: -140, prefer: ["atk", "hp", "spd", "def"], ai: CH10_AI, boss: true, final: true, crew: ["12-1", "12-2", "12-3", "12-4", "12-5"], crewBoost: { hp: -120, dealt: -0.6 }, crewAi: { wait: [6, 5], defend: 0.8 }, drops: 15 },
    ],
  },
];

// 敵を 全体的に 強く（2026-10）: 章が 進むほど 強化ポイント・シールの レア度・反応の速さを 上乗せ。9章からは 最初から 強い 値で 書く
const RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"] as const;
for (const c of CHAPTERS) {
  if (c.no >= 9) continue;
  for (const st of c.stages) {
    st.boostPoints = Math.min(60, st.boostPoints + 2 + c.no * 2);
    if (c.no === 1) st.hp = Math.max(st.hp ?? 0, -20);
    if (c.no >= 2) {
      st.parts = st.parts.map(([k, r]) => [k, RANKS[Math.min(RANKS.length - 1, RANKS.indexOf(r) + 1)]]);
      st.ai = { wait: [Math.max(1, st.ai.wait[0] - 1), st.ai.wait[1]], defend: st.ai.defend + 0.1 };
    }
    if (st.boss) st.hp = (st.hp ?? 0) + 3 + c.no;
  }
}

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

// 敵の 強化: スキルツリー 1周は TREE_CAP。こえた 分は 2周目として 同じ 好みの 枝を もう1回 取る（12章は 120＝2周 ぜんぶ）
export function stageBoost(st: Stage, extra: Partial<Boost> = {}): Partial<Boost> {
  const laps: Partial<Boost>[] = [];
  for (let left = st.boostPoints; left > 0; left -= TREE_CAP) laps.push(boostOf(autoTree(Math.min(left, TREE_CAP), st.prefer)));
  return sumBoost([...laps, { hp: st.hp ?? 0 }, extra]);
}

// 集団戦の なかま（ボスの 後ろに ならぶ）
export const crewOf = (st: Stage): Stage[] => (st.crew ?? []).map((id) => ALL_STAGES.find((s) => s.id === id)).filter((s): s is Stage => !!s);
