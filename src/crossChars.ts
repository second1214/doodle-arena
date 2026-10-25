// ゲームの 人気キャラに にた CPU キャラ（家族で あそぶ用。名前は 少し 変えてある）。CANVAS_SIZE=512 座標。
// 手・足・羽は 手足レイヤー（marks: 手ペン・足ペン・羽ペン）で 決めてある＝自動検知に まかせない。
import type { Stroke } from "./detect";
import type { CpuProfile } from "./newChars";

const line = (pts: number[], width = 8, color = "#222222"): Stroke => ({ color, width, points: pts });
const fill = (x: number, y: number, color: string): Stroke => ({ color, width: 0, points: [x, y], fill: true });
const poly = (pts: number[], color: string, inside: [number, number], width = 7, edge = "#222222"): Stroke[] => [line([...pts, pts[0], pts[1]], width, edge), fill(inside[0], inside[1], color)];
const rect = (x0: number, y0: number, x1: number, y1: number, color: string, width = 7, edge = "#222222"): Stroke[] => poly([x0, y0, x1, y0, x1, y1, x0, y1], color, [(x0 + x1) / 2, (y0 + y1) / 2], width, edge);
function ring(cx: number, cy: number, rx: number, ry = rx, n = 44): number[] {
  const pts: number[] = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; pts.push(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry)); }
  return pts;
}
const oval = (cx: number, cy: number, rx: number, ry: number, color: string, width = 7, edge = "#222222"): Stroke[] => [line(ring(cx, cy, rx, ry), width, edge), fill(cx, cy, color)];
const dot = (cx: number, cy: number, r: number, color = "#222222"): Stroke[] => [line(ring(cx, cy, r, r, 20), 4, color), fill(cx, cy, color)];
// 手足レイヤー（太い ペンで 雑に 塗る）
const mk = (kind: "hand" | "foot" | "wing", pts: number[], width = 44): Stroke => ({ color: kind, width, points: pts });

export interface CrossChar { strokes: () => Stroke[]; marks: () => Stroke[]; group: "ブロック" | "ふしぎ"; profile: CpuProfile }

// --- マインクラフト風（ブロック） ---
const steve = (skin: string, shirt: string, pants: string, armsForward = false): Stroke[] => [
  ...rect(206, 182, 306, 312, shirt),
  ...(armsForward
    ? [...rect(306, 190, 430, 226, skin), ...rect(306, 190, 340, 226, shirt), ...rect(300, 236, 420, 270, skin), ...rect(300, 236, 334, 270, shirt)]
    : [...rect(160, 184, 204, 304, skin), ...rect(160, 184, 204, 228, shirt), ...rect(308, 184, 352, 304, skin), ...rect(308, 184, 352, 228, shirt)]),
  ...rect(208, 312, 254, 452, pants), ...rect(258, 312, 304, 452, pants),
  ...rect(208, 432, 254, 452, "#555555"), ...rect(258, 432, 304, 452, "#555555"),
  ...rect(196, 62, 316, 182, skin),
];
const steveMarks = (armsForward = false): Stroke[] => armsForward
  ? [mk("hand", [316, 208, 426, 208], 40), mk("hand", [312, 253, 416, 253], 38), mk("foot", [231, 322, 231, 450], 46), mk("foot", [281, 322, 281, 450], 46)]
  : [mk("hand", [182, 194, 182, 300], 44), mk("hand", [330, 194, 330, 300], 44), mk("foot", [231, 322, 231, 450], 46), mk("foot", [281, 322, 281, 450], 46)];

export const CROSS: Record<string, CrossChar> = {
  "スティープ": {
    group: "ブロック",
    strokes: () => [
      ...steve("#c69c6d", "#2fb3c4", "#3949ab"),
      ...rect(196, 62, 316, 96, "#4a2f1b"), ...rect(196, 96, 214, 120, "#4a2f1b"), ...rect(298, 96, 316, 120, "#4a2f1b"),
      ...rect(216, 122, 238, 136, "#ffffff", 4), ...rect(228, 122, 238, 136, "#3b5bdb", 4),
      ...rect(274, 122, 296, 136, "#ffffff", 4), ...rect(274, 122, 284, 136, "#3b5bdb", 4),
      ...rect(238, 150, 274, 164, "#7a4a2a", 4),
    ],
    marks: () => steveMarks(),
    profile: { intro: "四角い ブロックの 世界の ゆうしゃ。なんでも そこそこ できる", personality: "cautious", specialType: "melee", parts: ["m:dash", "power"], prefer: ["atk", "def", "hp"], catchphrase: "ブロックで まもりを かためるぞ" },
  },
  "ゾンビー": {
    group: "ブロック",
    strokes: () => [
      ...steve("#5fa35a", "#2fb3c4", "#4c3fa0", true),
      ...rect(222, 112, 244, 132, "#1b1b1b", 4), ...rect(268, 112, 290, 132, "#1b1b1b", 4),
      ...rect(236, 150, 276, 162, "#2b4a28", 4),
    ],
    marks: () => steveMarks(true),
    profile: { intro: "夜に あらわれる。両手を 前に のばして のっしのっし", personality: "aggressive", specialType: "melee", parts: ["m:grab", "m:vampire"], prefer: ["hp", "atk", "sta"], catchphrase: "うぅ〜…… おなか すいた" },
  },
  "クリーバー": {
    group: "ブロック",
    strokes: () => [
      ...rect(216, 176, 296, 384, "#4caf50"),
      ...rect(226, 210, 246, 230, "#2e7d32", 3), ...rect(262, 260, 282, 280, "#2e7d32", 3), ...rect(232, 320, 252, 340, "#81c784", 3),
      ...rect(200, 384, 248, 446, "#43a047"), ...rect(264, 384, 312, 446, "#43a047"),
      ...rect(196, 60, 316, 176, "#4caf50"),
      ...rect(222, 92, 248, 118, "#111111", 3), ...rect(264, 92, 290, 118, "#111111", 3),
      ...poly([244, 118, 268, 118, 268, 140, 280, 140, 280, 168, 268, 168, 268, 156, 244, 156, 244, 168, 232, 168, 232, 140, 244, 140], "#111111", [256, 136], 3),
    ],
    marks: () => [mk("foot", [224, 392, 224, 444], 44), mk("foot", [288, 392, 288, 444], 44)],
    profile: { intro: "手が 無い。そっと 近づいて ドカン！と ばくはつ", personality: "aggressive", specialType: "ranged", parts: ["r:blast", "r:trap"], prefer: ["sp", "hp", "spd"], catchphrase: "シューーー……" },
  },
  "ホネルトン": {
    group: "ブロック",
    strokes: () => [
      ...rect(206, 56, 306, 156, "#d9d9d9"),
      ...rect(222, 92, 248, 112, "#333333", 3), ...rect(264, 92, 290, 112, "#333333", 3), ...rect(236, 132, 276, 142, "#555555", 3),
      ...rect(234, 156, 278, 300, "#cfcfcf"),
      line([238, 186, 274, 186], 5, "#7a7a7a"), line([238, 214, 274, 214], 5, "#7a7a7a"), line([238, 242, 274, 242], 5, "#7a7a7a"),
      line([234, 170, 200, 240, 214, 300], 16, "#bdbdbd"),
      line([278, 170, 330, 220, 372, 214], 16, "#bdbdbd"),
      line([372, 140, 404, 214, 372, 288], 8, "#8b5a2b"), line([372, 140, 372, 288], 3, "#eeeeee"),
      line([244, 300, 226, 452], 17, "#bdbdbd"), line([270, 300, 288, 452], 17, "#bdbdbd"),
    ],
    marks: () => [mk("hand", [228, 180, 202, 240, 214, 300], 34), mk("hand", [286, 176, 330, 220, 372, 214, 400, 214, 372, 150, 372, 280], 40), mk("foot", [241, 314, 226, 452], 22), mk("foot", [273, 314, 288, 452], 22)],
    profile: { intro: "ほねの 弓で 遠くから ねらう。体は かるい", personality: "sniper", specialType: "ranged", parts: ["r:fast", "r:tiny"], prefer: ["sp", "spd", "tec"], catchphrase: "カタカタ……ねらいは ばっちり" },
  },
  "エンダマン": {
    group: "ブロック",
    strokes: () => [
      ...rect(216, 26, 296, 100, "#1a1a1a"),
      line([224, 66, 246, 66], 10, "#d580ff"), line([266, 66, 288, 66], 10, "#d580ff"),
      ...rect(236, 100, 276, 250, "#1a1a1a"),
      line([232, 110, 200, 220, 196, 350], 18, "#1a1a1a"), line([280, 110, 312, 220, 316, 350], 18, "#1a1a1a"),
      line([244, 250, 226, 476], 18, "#1a1a1a"), line([268, 250, 286, 476], 18, "#1a1a1a"),
    ],
    marks: () => [mk("hand", [226, 120, 200, 220, 196, 350], 34), mk("hand", [286, 120, 312, 220, 316, 350], 34), mk("foot", [242, 266, 226, 476], 22), mk("foot", [270, 266, 286, 476], 22)],
    profile: { intro: "とても 背が高い。手も足も 長くて 見えない弾を 使う", personality: "tricky", specialType: "ranged", parts: ["r:invisible", "r:homing"], prefer: ["tec", "spd", "sp"], catchphrase: "……目を 合わせないでね" },
  },
  "エンダラゴン": {
    group: "ブロック",
    strokes: () => [
      ...poly([210, 270, 110, 90, 70, 150, 150, 260], "#3d3d4d", [150, 190]),
      ...poly([290, 270, 330, 70, 410, 120, 350, 268], "#3d3d4d", [340, 160]),
      line([110, 90, 130, 220], 4, "#b197fc"), line([330, 70, 330, 220], 4, "#b197fc"),
      ...oval(250, 310, 130, 52, "#2b2b36"),
      ...rect(368, 250, 452, 300, "#2b2b36"),
      line([406, 268, 430, 268], 10, "#d580ff"),
      line([122, 312, 60, 330, 20, 300], 22, "#2b2b36"),
      line([180, 350, 172, 430], 18, "#2b2b36"), line([230, 356, 226, 436], 18, "#2b2b36"), line([280, 356, 284, 436], 18, "#2b2b36"), line([326, 350, 336, 430], 18, "#2b2b36"),
    ],
    marks: () => [mk("wing", [196, 250, 120, 110, 90, 150, 150, 240], 54), mk("wing", [300, 250, 330, 100, 390, 130, 340, 240], 54), mk("foot", [176, 362, 172, 430], 30), mk("foot", [228, 368, 226, 436], 30), mk("foot", [282, 368, 284, 436], 30), mk("foot", [330, 362, 336, 430], 30)],
    profile: { intro: "ブロックの 世界の 竜の王。空から ほのおの 雨を ふらせる", personality: "sniper", specialType: "ranged", parts: ["r:rain", "r:fire"], prefer: ["sp", "hp", "fly"], catchphrase: "わが 空へ ようこそ" },
  },

  // --- ポケモン風（ふしぎ） ---
  "ヒカチュウ": {
    group: "ふしぎ",
    strokes: () => [
      line([190, 360, 110, 330, 150, 300, 70, 250, 120, 236, 60, 176], 24, "#e0a800"),
      ...poly([206, 120, 150, 18, 232, 104], "#ffd43b", [200, 90]), ...poly([162, 40, 150, 18, 180, 50], "#222222", [160, 34], 4),
      ...poly([306, 120, 362, 18, 280, 104], "#ffd43b", [312, 90]), ...poly([350, 40, 362, 18, 332, 50], "#222222", [352, 34], 4),
      ...oval(256, 320, 76, 96, "#ffd43b"),
      ...oval(256, 172, 82, 72, "#ffd43b"),
      ...dot(226, 164, 12), ...dot(286, 164, 12), ...dot(230, 160, 4, "#ffffff"), ...dot(290, 160, 4, "#ffffff"),
      ...dot(204, 200, 16, "#ff6b6b"), ...dot(308, 200, 16, "#ff6b6b"),
      line([244, 196, 256, 204, 268, 196], 5),
      line([196, 276, 160, 300], 18, "#ffd43b"), line([316, 276, 352, 300], 18, "#ffd43b"),
      ...oval(222, 418, 26, 16, "#ffd43b"), ...oval(290, 418, 26, 16, "#ffd43b"),
    ],
    marks: () => [mk("hand", [192, 278, 158, 302], 30), mk("hand", [320, 278, 354, 302], 30), mk("foot", [222, 408, 222, 432], 40), mk("foot", [290, 408, 290, 432], 40)],
    profile: { intro: "ほっぺの でんきで ビリビリ。当たると しびれて 動けない", personality: "tricky", specialType: "ranged", parts: ["r:thunder", "r:fast"], prefer: ["spd", "sp", "tec"], catchphrase: "ヒカッ ヒカチュウ！" },
  },
  "ヒトカケ": {
    group: "ふしぎ",
    strokes: () => [
      line([200, 360, 130, 380, 90, 330], 22, "#ff922b"),
      ...poly([90, 330, 60, 270, 92, 290, 100, 250, 120, 300], "#ff6b00", [96, 300], 5, "#e8590c"),
      ...oval(256, 320, 70, 92, "#ff922b"), ...oval(270, 335, 40, 62, "#ffe8a3", 4),
      ...oval(276, 170, 70, 62, "#ff922b"),
      ...dot(298, 160, 11), ...dot(301, 156, 4, "#ffffff"),
      line([300, 196, 336, 192], 5),
      line([204, 270, 166, 300], 18, "#ff922b"), line([316, 268, 356, 290], 18, "#ff922b"),
      ...oval(226, 414, 26, 18, "#ff922b"), ...oval(290, 414, 26, 18, "#ff922b"),
    ],
    marks: () => [mk("hand", [202, 272, 164, 302], 30), mk("hand", [318, 270, 358, 292], 30), mk("foot", [226, 404, 226, 430], 40), mk("foot", [290, 404, 290, 430], 40)],
    profile: { intro: "しっぽの ほのおが 元気の しるし。ほのおパンチで やけど", personality: "aggressive", specialType: "melee", parts: ["m:flame", "m:dash"], prefer: ["atk", "spd", "hp"], catchphrase: "カケッ！ もえてきた！" },
  },
  "ゼニカメ": {
    group: "ふしぎ",
    strokes: () => [
      line([180, 380, 140, 400, 130, 370, 150, 360], 14, "#74c0fc"),
      ...oval(240, 300, 96, 112, "#a0522d"), line(ring(240, 300, 80, 96), 4, "#ffd8a8"),
      ...oval(290, 305, 52, 88, "#ffe8a3"),
      ...oval(276, 150, 72, 66, "#74c0fc"),
      ...dot(300, 140, 13, "#7a4a2a"), ...dot(303, 136, 5, "#ffffff"),
      line([292, 186, 330, 184], 5),
      line([226, 250, 186, 290], 20, "#74c0fc"), line([330, 250, 368, 280], 20, "#74c0fc"),
      ...oval(222, 420, 28, 20, "#74c0fc"), ...oval(292, 420, 28, 20, "#74c0fc"),
    ],
    marks: () => [mk("hand", [222, 254, 184, 292], 32), mk("hand", [334, 254, 370, 282], 32), mk("foot", [222, 410, 222, 436], 42), mk("foot", [292, 410, 292, 436], 42)],
    profile: { intro: "こうらで かたい。地面を はう 水の 波を うつ", personality: "cautious", specialType: "ranged", parts: ["r:wave", "r:freeze"], prefer: ["def", "hp", "sp"], catchphrase: "ゼニゼニ〜 なみのり！" },
  },
  "フシギタネ": {
    group: "ふしぎ",
    strokes: () => [
      ...oval(236, 300, 120, 72, "#63c5a4"),
      ...dot(200, 290, 14, "#2f8a6a"), ...dot(250, 320, 10, "#2f8a6a"),
      ...poly([170, 236, 196, 150, 236, 120, 276, 150, 296, 236], "#4caf50", [236, 190]),
      line([236, 120, 236, 236], 4, "#2e7d32"),
      ...oval(356, 250, 70, 58, "#63c5a4"),
      ...dot(380, 240, 12, "#c92a2a"), ...dot(383, 236, 4, "#ffffff"),
      line([360, 280, 400, 276], 5),
      ...poly([316, 210, 300, 176, 334, 196], "#63c5a4", [318, 196], 5), ...poly([386, 200, 410, 168, 410, 210], "#63c5a4", [404, 196], 5),
      line([150, 350, 142, 420], 22, "#63c5a4"), line([200, 362, 196, 430], 22, "#63c5a4"), line([280, 362, 284, 430], 22, "#63c5a4"), line([322, 350, 332, 420], 22, "#63c5a4"),
    ],
    marks: () => [mk("foot", [150, 360, 142, 420], 34), mk("foot", [200, 372, 196, 430], 34), mk("foot", [280, 372, 284, 430], 34), mk("foot", [322, 360, 332, 420], 34)],
    profile: { intro: "せなかの たねから つるの あみ。手が 無いので 体あたり", personality: "cautious", specialType: "ranged", parts: ["r:net", "r:restrain"], prefer: ["def", "hp", "fly"], catchphrase: "フシギ〜 つるで つかまえる" },
  },
  "ホッポ": {
    group: "ふしぎ",
    strokes: () => [
      ...poly([210, 250, 70, 150, 90, 230, 60, 260, 150, 300], "#8b5a2b", [140, 240]),
      ...oval(256, 290, 92, 80, "#c08a5a"), ...oval(282, 304, 54, 56, "#ffe8cc", 4),
      ...oval(310, 186, 62, 58, "#c08a5a"),
      ...poly([300, 132, 290, 90, 318, 128], "#e8590c", [302, 118], 4), ...poly([316, 130, 332, 86, 330, 132], "#e8590c", [326, 118], 4),
      ...poly([366, 182, 410, 196, 366, 208], "#adb5bd", [380, 196], 4),
      ...dot(332, 176, 10), ...dot(335, 172, 3, "#ffffff"),
      line([240, 364, 236, 420, 220, 432], 9, "#f08c00"), line([278, 366, 284, 422, 300, 432], 9, "#f08c00"),
      line([170, 300, 130, 330, 110, 320], 18, "#8b5a2b"),
    ],
    marks: () => [mk("wing", [200, 250, 90, 160, 100, 230, 80, 255, 150, 290], 52), mk("foot", [240, 372, 236, 424], 28), mk("foot", [278, 374, 284, 424], 28)],
    profile: { intro: "羽で 空を とぶ 小鳥。かぜを おこして 空から おとす", personality: "tricky", specialType: "melee", parts: ["m:gust", "m:dive"], prefer: ["fly", "spd", "tec"], catchphrase: "ポッ ホッポー！" },
  },
  "カビコン": {
    group: "ふしぎ",
    strokes: () => [
      ...poly([150, 160, 168, 100, 200, 140], "#2b6777", [172, 136], 6), ...poly([362, 160, 344, 100, 312, 140], "#2b6777", [340, 136], 6),
      ...oval(256, 290, 150, 150, "#2b6777"),
      ...oval(256, 330, 104, 106, "#f3e3c3", 5),
      ...oval(256, 190, 74, 54, "#f3e3c3", 5),
      line([220, 182, 244, 182], 5), line([268, 182, 292, 182], 5), line([236, 214, 256, 222, 276, 214], 5),
      line([116, 280, 76, 330], 40, "#2b6777"), line([396, 280, 436, 330], 40, "#2b6777"),
      ...oval(190, 446, 46, 24, "#f3e3c3", 6), ...oval(322, 446, 46, 24, "#f3e3c3", 6),
    ],
    marks: () => [mk("hand", [112, 284, 74, 334], 50), mk("hand", [400, 284, 438, 334], 50), mk("foot", [190, 436, 190, 458], 56), mk("foot", [322, 436, 322, 458], 56)],
    profile: { intro: "とても 大きくて おもい。ねむそうだけど 地面を たたくと すごい", personality: "cautious", specialType: "melee", parts: ["m:slam", "m:mushroom"], prefer: ["hp", "def", "atk"], catchphrase: "ふわぁ〜……むにゃ" },
  },
  "リザードソ": {
    group: "ふしぎ",
    strokes: () => [
      ...poly([220, 210, 90, 70, 110, 160, 70, 190, 180, 250], "#1c7ed6", [140, 170]),
      ...poly([300, 200, 400, 60, 410, 150, 440, 170, 330, 250], "#1c7ed6", [380, 150]),
      line([196, 380, 120, 410, 80, 370], 24, "#ff922b"),
      ...poly([80, 370, 50, 300, 84, 320, 92, 280, 110, 330], "#ff6b00", [86, 330], 5, "#e8590c"),
      ...oval(256, 300, 82, 118, "#ff922b"), ...oval(268, 320, 46, 84, "#ffe8a3", 4),
      ...oval(290, 140, 56, 48, "#ff922b"),
      ...poly([262, 100, 252, 64, 280, 94], "#ff922b", [264, 88], 5), ...poly([300, 96, 312, 60, 320, 100], "#ff922b", [308, 88], 5),
      ...dot(312, 132, 9), ...dot(314, 129, 3, "#ffffff"),
      line([310, 166, 344, 160], 5),
      line([196, 260, 160, 300], 18, "#ff922b"), line([320, 258, 360, 290], 18, "#ff922b"),
      ...oval(226, 426, 30, 18, "#ff922b"), ...oval(292, 426, 30, 18, "#ff922b"),
    ],
    marks: () => [mk("wing", [210, 210, 110, 90, 110, 160, 90, 190, 180, 240], 54), mk("wing", [300, 205, 390, 80, 400, 150, 420, 170, 330, 240], 54), mk("hand", [194, 262, 158, 302], 30), mk("hand", [322, 260, 362, 292], 30), mk("foot", [226, 414, 226, 440], 42), mk("foot", [292, 414, 292, 440], 42)],
    profile: { intro: "羽で 空を とぶ ほのおの 竜。空から ダイブして やけど", personality: "aggressive", specialType: "melee", parts: ["m:dive", "m:flame"], prefer: ["fly", "atk", "hp"], catchphrase: "ガオォ！ 空は おれの もの" },
  },
  "ミュウスリー": {
    group: "ふしぎ",
    strokes: () => [
      line([220, 330, 150, 380, 110, 340, 120, 290, 150, 300], 26, "#9775fa"),
      ...oval(256, 300, 60, 100, "#e5dbff"), ...oval(262, 330, 36, 64, "#b197fc", 4),
      ...oval(266, 148, 52, 50, "#e5dbff"),
      ...poly([236, 112, 222, 70, 254, 104], "#e5dbff", [238, 96], 5), ...poly([280, 104, 300, 66, 300, 112], "#e5dbff", [292, 96], 5),
      line([266, 196, 256, 222], 12, "#e5dbff"),
      ...dot(284, 144, 8, "#7048e8"),
      line([214, 240, 170, 300, 160, 340], 16, "#e5dbff"), line([304, 240, 350, 290, 372, 300], 16, "#e5dbff"),
      ...dot(156, 350, 13, "#e5dbff"), ...dot(380, 302, 13, "#e5dbff"),
      line([236, 396, 228, 456], 22, "#e5dbff"), line([278, 396, 290, 456], 22, "#e5dbff"),
    ],
    marks: () => [mk("hand", [212, 246, 170, 300, 158, 350], 32), mk("hand", [306, 246, 350, 290, 382, 302], 32), mk("foot", [236, 404, 228, 458], 34), mk("foot", [278, 404, 290, 458], 34)],
    profile: { intro: "ふしぎな 島の さいごの ボス。ちょうのうりょくで すいよせて しびれさせる", personality: "sniper", specialType: "ranged", parts: ["r:vacuum", "r:thunder", "r:homing"], prefer: ["sp", "hp", "def", "fly"], catchphrase: "わたしは なぜ ここに いる……" },
  },
};

export const CROSS_GROUPS = ["ブロック", "ふしぎ"] as const;
export const crossStrokes = (name: string) => CROSS[name].strokes;
export const crossMarks = (name: string) => CROSS[name].marks;
