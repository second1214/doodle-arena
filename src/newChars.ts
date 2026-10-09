// 個性豊かな CPU キャラ（CANVAS_SIZE=512 座標）。src/samples.ts と同じ書き方。
// src/ にそのまま置ける形（import は型だけ＝実行時の依存なし）。
import type { Stroke } from "./detect";
import type { PartKind } from "./items";
import type { Personality } from "./sim/world";

const line = (pts: number[], width = 9, color = "#222222"): Stroke => ({ color, width, points: pts });
const fill = (x: number, y: number, color: string): Stroke => ({ color, width: 0, points: [x, y], fill: true });
function circle(cx: number, cy: number, r: number, width = 9, color = "#222222"): Stroke {
  const pts: number[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    pts.push(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r));
  }
  return line(pts, width, color);
}
function ellipse(cx: number, cy: number, rx: number, ry: number, width = 9, color = "#222222"): Stroke {
  const pts: number[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    pts.push(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry));
  }
  return line(pts, width, color);
}
const eyes = (x1: number, x2: number, y: number, r = 9): Stroke[] => [circle(x1, y, r, 7), circle(x2, y, r, 7)];

export const NEW_SAMPLES: Record<string, () => Stroke[]> = {
  // 足なし・三角 → 転がるが転がり出しが鈍い。のりが重り
  "おにぎりゴロン": () => [
    line([256, 100, 300, 150, 380, 330, 370, 375, 140, 375, 130, 330, 212, 150, 256, 100], 10, "#495057"),
    fill(256, 250, "#fffdf2"),
    line([205, 300, 307, 300, 307, 375, 205, 375, 205, 300], 8, "#1b1b1b"),
    fill(256, 340, "#1b1b1b"),
    ...eyes(228, 284, 240, 7),
    line([238, 272, 256, 282, 274, 272], 6),
  ],
  // 足がずらり（多い足＝どっしり安定・少し遅い）。触角が手
  "ムカデせんせい": () => {
    const s: Stroke[] = [ellipse(270, 250, 175, 42, 10, "#c92a2a"), fill(270, 250, "#ff8787")];
    for (let i = 0; i < 7; i++) {
      const x = 145 + i * 40;
      s.push(line([x, 285, x - 8, 345, x - 18, 370], 9, "#862e9c"));
    }
    s.push(circle(85, 235, 40, 10, "#c92a2a"), fill(85, 235, "#ffc9c9"));
    s.push(line([70, 200, 50, 140, 20, 110], 7, "#862e9c"), line([95, 198, 105, 135, 135, 105], 7, "#862e9c"));
    s.push(circle(72, 228, 6, 6), circle(98, 228, 6, 6), line([100, 160, 75, 165], 5)); // 眼鏡のつる
    return s;
  },
  // 横に大きい＋大きなハサミ2本＋足6本
  "よこあるきガニ": () => {
    const s: Stroke[] = [ellipse(256, 270, 150, 72, 10, "#e03131"), fill(256, 270, "#ffa8a8")];
    s.push(line([150, 225, 95, 150, 80, 100], 13, "#e03131"), line([60, 90, 80, 100, 100, 70], 13, "#e03131"));
    s.push(line([362, 225, 417, 150, 432, 100], 13, "#e03131"), line([412, 70, 432, 100, 452, 90], 13, "#e03131"));
    for (const [x, dx] of [[160, -55], [200, -40], [235, -20], [277, 20], [312, 40], [352, 55]] as const)
      s.push(line([x, 330, x + dx * 0.6, 375, x + dx, 420], 10, "#e03131"));
    s.push(line([220, 200, 215, 170], 6), line([292, 200, 297, 170], 6), circle(215, 165, 9, 7), circle(297, 165, 9, 7));
    return s;
  },
  // 一本足（長い1本足＝速いが軽い）。手なし→ベロで体当たり
  "かさおばけ": () => [
    line([96, 230, 120, 150, 180, 95, 256, 75, 332, 95, 392, 150, 416, 230, 376, 222, 336, 230, 296, 222, 256, 230, 216, 222, 176, 230, 136, 222, 96, 230], 10, "#5f3dc4"),
    fill(256, 160, "#b197fc"),
    circle(256, 150, 26, 8), fill(256, 150, "#ffffff"), circle(262, 152, 8, 6),
    line([256, 232, 256, 440], 12, "#795548"),
    line([226, 450, 286, 450], 14, "#795548"),
    line([250, 190, 262, 215, 254, 230], 10, "#f06595"),
  ],
  // 足なし（裾がひらひら）＋小さな手 → 浮いて転がる
  "ふわりおばけ": () => [
    line([160, 340, 160, 200, 180, 130, 256, 95, 332, 130, 352, 200, 352, 335, 326, 325, 299, 338, 272, 325, 245, 338, 218, 325, 191, 338, 160, 335], 9, "#74c0fc"),
    fill(256, 220, "#e7f5ff"),
    ...eyes(226, 286, 200, 10),
    ellipse(256, 250, 14, 18, 7),
    line([162, 230, 115, 250, 85, 240], 10, "#74c0fc"),
    line([350, 230, 397, 250, 427, 240], 10, "#74c0fc"),
  ],
  // ぎっしり塗り＝重い。手足なし＝重い体当たり
  "どっしりトーフ": () => [
    line([130, 140, 382, 140, 382, 392, 130, 392, 130, 140], 10, "#868e96"),
    fill(256, 266, "#fff3bf"),
    ...eyes(205, 307, 240, 10),
    line([225, 300, 256, 320, 287, 300], 8),
    line([145, 280, 175, 285], 8, "#ffa8a8"), line([337, 285, 367, 280], 8, "#ffa8a8"),
  ],
  // 左右非対称: 極端に長いえんぴつの槍＋小さな盾の手
  "えんぴつナイト": () => [
    circle(170, 250, 60, 10, "#1971c2"), fill(170, 250, "#a5d8ff"),
    ...eyes(150, 190, 240, 7),
    line([228, 245, 440, 175], 20, "#fab005"),
    line([440, 175, 495, 158], 12, "#5c3d2e"),
    line([112, 255, 70, 270], 10, "#1971c2"), circle(55, 275, 22, 9, "#495057"),
    line([150, 305, 135, 400, 115, 415], 10, "#1971c2"),
    line([192, 305, 205, 400, 225, 415], 10, "#1971c2"),
  ],
  // 背中だけトゲ（手がいっぱい＝連打）＋短い足4本
  "ハリネズミ": () => {
    const s: Stroke[] = [ellipse(250, 300, 140, 80, 10, "#7f5539"), fill(250, 300, "#ddb892")];
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (1.05 + (i / 8) * 0.75);
      s.push(line([250 + Math.cos(a) * 130, 300 + Math.sin(a) * 72, 250 + Math.cos(a) * 205, 300 + Math.sin(a) * 140], 9, "#582f0e"));
    }
    for (const x of [175, 220, 285, 330]) s.push(line([x, 375, x, 410], 14, "#7f5539"));
    s.push(circle(345, 290, 8, 7), circle(392, 305, 9, 8, "#222222"));
    return s;
  },
  // 体が小さく足がひょろ長い＝足は速いが、軽くて飛ばされやすい
  "ひょろグモ": () => {
    const s: Stroke[] = [circle(256, 250, 38, 9, "#212529"), fill(256, 250, "#495057"), ...eyes(242, 270, 245, 6)];
    for (const [px, kx, tx] of [[232, 190, 106], [244, 215, 156], [268, 297, 356], [280, 322, 406]] as const)
      s.push(line([px, 282, kx, 330, tx, 450], 6, "#212529"));
    s.push(line([225, 235, 180, 170, 150, 160], 6, "#212529"), line([287, 235, 332, 170, 362, 160], 6, "#212529"));
    return s;
  },
  // 乗り物: 横長・車輪（足なし＝走る＝転がる）。パンタグラフは飾り＝体当たり
  "がたごとでんしゃ": () => [
    line([60, 180, 452, 180, 452, 330, 60, 330, 60, 180], 10, "#2b8a3e"),
    fill(256, 300, "#69db7c"),
    line([90, 205, 150, 205, 150, 255, 90, 255, 90, 205], 7, "#1864ab"),
    line([190, 205, 250, 205, 250, 255, 190, 255, 190, 205], 7, "#1864ab"),
    line([290, 205, 350, 205, 350, 255, 290, 255, 290, 205], 7, "#1864ab"),
    line([390, 205, 430, 205, 430, 255, 390, 255, 390, 205], 7, "#1864ab"),
    ...[120, 200, 312, 392].flatMap((x) => [circle(x, 345, 24, 9, "#212529"), fill(x, 345, "#495057")]),
    line([236, 180, 256, 158, 276, 180], 7, "#495057"),
    line([226, 155, 286, 155], 7, "#495057"),
  ],
  // 食べ物: コーンの先が1本足（ぴょこぴょこ）
  "ソフトクリン": () => [
    line([180, 290, 332, 290, 256, 475, 180, 290], 10, "#e8590c"), fill(256, 340, "#ffc078"),
    line([215, 320, 290, 390], 6, "#d9480f"), line([297, 320, 222, 390], 6, "#d9480f"),
    ellipse(256, 265, 105, 40, 9, "#f783ac"), fill(256, 265, "#fff0f6"),
    ellipse(256, 210, 80, 35, 9, "#f783ac"), fill(256, 210, "#fff0f6"),
    ellipse(256, 162, 52, 28, 9, "#f783ac"), fill(256, 162, "#fff0f6"),
    line([256, 135, 266, 105, 248, 85], 9, "#f783ac"),
    ...eyes(232, 280, 205, 7),
  ],
  // 文房具: 刃が極端に長い2本の手・足なしで転がる
  "チョキチョキ": () => [
    line([248, 290, 170, 50], 24, "#adb5bd"),
    line([264, 290, 342, 50], 24, "#adb5bd"),
    circle(256, 285, 14, 8, "#495057"),
    circle(205, 375, 50, 14, "#e03131"),
    circle(307, 375, 50, 14, "#e03131"),
    line([236, 320, 250, 300], 14, "#e03131"), line([276, 320, 262, 300], 14, "#e03131"),
    ...eyes(190, 322, 372, 6),
  ],
  // 文字の形: ひらがな「ん」の曲がり角に顔（顔が胴体・線が手足になる）
  "もじの「ん」": () => [
    line([235, 70, 190, 220, 125, 430], 20, "#7048e8"),
    line([150, 360, 215, 285, 265, 290, 285, 340, 305, 410, 345, 430, 400, 380], 20, "#7048e8"),
    circle(215, 270, 42, 9, "#7048e8"), fill(215, 270, "#d0bfff"),
    ...eyes(200, 232, 262, 6),
  ],
  // 家電: 羽根3枚が手（連打・竜巻向き）＋スタンドの1本足（速いが軽い）
  "くるくるせんぷうき": () => {
    const s: Stroke[] = [];
    for (const deg of [-90, 30, 150]) {
      const a = (deg * Math.PI) / 180;
      const p = (r: number) => [Math.round(256 + Math.cos(a) * r), Math.round(190 + Math.sin(a) * r)];
      s.push(line([...p(40), ...p(150)], 26, "#1098ad"), line([...p(70), ...p(140)], 10, "#99e9f2"));
    }
    s.push(circle(256, 190, 40, 10, "#0b7285"), fill(256, 190, "#3bc9db"), ...eyes(242, 270, 185, 6));
    s.push(line([256, 232, 256, 440], 14, "#495057"));
    return s;
  },
  // 足なし＋上向きの触手がいっぱい（転がりながら連打）
  "イソギンチャク": () => {
    const s: Stroke[] = [ellipse(256, 380, 125, 65, 10, "#d6336c"), fill(256, 380, "#faa2c1")];
    for (let i = 0; i < 9; i++) {
      const x = 156 + i * 25;
      const pts: number[] = [];
      for (let t = 0; t <= 10; t++) pts.push(Math.round(x + (x - 256) * t * 0.06 + Math.sin(t * 0.9 + i) * 10), 325 - t * 20);
      s.push(line(pts, 11, "#f06595"));
    }
    s.push(...eyes(225, 287, 385, 8));
    return s;
  },
  // 細長いくねくね（胴より尻尾が長い＝誤認識も楽しむ枠）
  "にょろヘビ": () => {
    const pts: number[] = [];
    for (let t = 0; t <= 40; t++) pts.push(Math.round(110 + t * 8), Math.round(330 + Math.sin(t * 0.35) * 55));
    return [
      line(pts, 34, "#37b24d"),
      circle(90, 320, 48, 10, "#2b8a3e"), fill(90, 320, "#8ce99a"),
      circle(75, 305, 7, 6), circle(105, 305, 7, 6),
      line([45, 340, 15, 350, 5, 340], 5, "#e03131"),
    ];
  },
};

// CPU としての個性（性格・必殺の型・持たせる既存パーツ・好む枝・口ぐせ）
export interface CpuProfile {
  intro: string;
  personality: Personality;
  specialType: "ranged" | "melee";
  parts: PartKind[];
  prefer: string[]; // スキルツリーの枝（atk/def/hp/sta/spd/sp/tec）
  catchphrase: string; // 登場時のひとこと（別案）
}

export const CPU_PROFILES: Record<string, CpuProfile> = {
  "おにぎりゴロン": { intro: "三角だから転がり出しはのんびり。勢いがつくと止まらない", personality: "aggressive", specialType: "melee", parts: ["m:dash", "power"], prefer: ["spd", "atk", "hp"], catchphrase: "具は ひみつだよ！" },
  "ムカデせんせい": { intro: "足がたくさんで押されても動じない。触角でつつく", personality: "cautious", specialType: "ranged", parts: ["r:multi", "r:homing"], prefer: ["def", "hp", "sta"], catchphrase: "はい、足の数を かぞえて！" },
  "よこあるきガニ": { intro: "横に大きくて当たりやすいが、ハサミでつかんで投げる", personality: "tricky", specialType: "melee", parts: ["m:grab", "windup"], prefer: ["tec", "def", "hp"], catchphrase: "チョキで まけないカニ" },
  "かさおばけ": { intro: "一本足でぴょんぴょん速い。手が無いのでベロごと体当たり", personality: "tricky", specialType: "melee", parts: ["m:wobble", "m:dash"], prefer: ["spd", "tec", "sp"], catchphrase: "うらめし〜 あめ〜" },
  "ふわりおばけ": { intro: "足が無くてふわふわ転がる。見えない弾でいたずら", personality: "sniper", specialType: "ranged", parts: ["r:invisible", "r:homing"], prefer: ["sp", "spd", "tec"], catchphrase: "ばあっ！ …びっくりした？" },
  "どっしりトーフ": { intro: "中までぎっしり。重くて飛ばされない、ぶつかると痛い", personality: "cautious", specialType: "melee", parts: ["m:slam", "power"], prefer: ["hp", "def", "atk"], catchphrase: "くずれないよ、もめんだから" },
  "えんぴつナイト": { intro: "えんぴつの槍がとても長い。遠くからチクッと突く", personality: "sniper", specialType: "melee", parts: ["m:rubber", "windup"], prefer: ["tec", "spd", "sta"], catchphrase: "とがらせて きた！" },
  "ハリネズミ": { intro: "背中のトゲが全部手＝3連打。短い足でのっしのっし", personality: "aggressive", specialType: "ranged", parts: ["r:multi", "r:fast"], prefer: ["atk", "sta", "spd"], catchphrase: "さわると チクチクだぞ" },
  "ひょろグモ": { intro: "長い足でスタスタ速い。でも軽くてすぐ飛ばされる", personality: "tricky", specialType: "ranged", parts: ["r:restrain", "r:tiny"], prefer: ["spd", "tec", "sp"], catchphrase: "あみに かかったね" },
  "がたごとでんしゃ": { intro: "横長の車体で走り出したら止まらない体当たり", personality: "aggressive", specialType: "melee", parts: ["m:dash", "m:legbind"], prefer: ["spd", "hp", "atk"], catchphrase: "発車しまーす！" },
  "ソフトクリン": { intro: "コーンの先が1本足、てっぺんのクルンが手。冷たい弾が空から降る", personality: "sniper", specialType: "ranged", parts: ["r:meteor", "r:giant"], prefer: ["sp", "sta", "spd"], catchphrase: "とけるまえに かつ！" },
  "チョキチョキ": { intro: "刃がとても長い。足が無いので転がって切りかかる", personality: "aggressive", specialType: "melee", parts: ["m:crumple", "windup"], prefer: ["atk", "tec", "spd"], catchphrase: "かみなら まかせて" },
  "もじの「ん」": { intro: "「ん」の線がそのまま長い手と足。しりとりで負けない", personality: "tricky", specialType: "ranged", parts: ["r:fast", "r:tiny"], prefer: ["tec", "sp", "spd"], catchphrase: "ん！（これで おわり）" },
  "くるくるせんぷうき": { intro: "羽根3枚が手（2連打）。スタンドの1本足で意外とすばやい", personality: "cautious", specialType: "melee", parts: ["m:tornado", "duration"], prefer: ["sta", "def", "tec"], catchphrase: "強・中・弱、どれにする？" },
  "イソギンチャク": { intro: "上向きの触手がいっぱい。転がりながら連打する", personality: "cautious", specialType: "ranged", parts: ["r:restrain", "r:multi"], prefer: ["def", "sta", "sp"], catchphrase: "ゆら〜り つかまえる" },
  "にょろヘビ": { intro: "くねくねの長い体。どこが手になるかは絵しだい", personality: "sniper", specialType: "ranged", parts: ["r:homing", "pspeed"], prefer: ["sp", "tec", "sta"], catchphrase: "しゅるしゅる〜" },
};
