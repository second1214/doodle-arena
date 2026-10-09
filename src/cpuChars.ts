// 自由バトルで選べる CPU キャラ。1体ごとに「絵・名前・紹介・性格・必殺の型と固定パーツ・好む枝・ひとこと」をセットで持つ
// （ランダムにしない＝絵の個性と戦い方が結びつく）。ストーリーのボスは倒すと選べるようになる。
import type { Stroke } from "./detect";
import { SAMPLES } from "./samples";
import { NEW_SAMPLES, CPU_PROFILES, type CpuProfile } from "./newChars";
import { BOSS_DRAWINGS } from "./story";

export interface CpuChar extends CpuProfile {
  id: string;
  name: string;
  group: string;
  strokes: () => Stroke[];
  bossStage?: string; // このステージに勝つと選べる
}

// 前からいるキャラにも個性を付ける（検知を試すための絵「文字 ABC」はキャラ一覧から外す）
const OLD: [string, string, string, Omit<CpuProfile, "intro"> & { intro: string }][] = [
  ["棒人間", "ぼうにんげん", "らくがき", { intro: "線だけの体。軽くて素早い", personality: "aggressive", specialType: "ranged", parts: ["r:homing"], prefer: ["atk", "spd"], catchphrase: "ほそいけど まけないぞ" }],
  ["ふつうの生き物", "ふつうのこ", "らくがき", { intro: "手が2本ずつ。なんでもそこそこ", personality: "cautious", specialType: "ranged", parts: ["r:giant", "r:homing"], prefer: ["def", "hp"], catchphrase: "ふつうが いちばん" }],
  ["トゲトゲ", "トゲトゲ", "らくがき", { intro: "トゲが全部手。連打が得意", personality: "sniper", specialType: "ranged", parts: ["r:multi", "r:fast"], prefer: ["sp", "sta"], catchphrase: "チクチク いくよ" }],
  ["タコ", "タコすけ", "どうぶつ", { intro: "足がいっぱい。うねうね揺さぶる", personality: "tricky", specialType: "ranged", parts: ["r:restrain", "r:homing"], prefer: ["tec", "spd"], catchphrase: "すみを はくぞ〜" }],
  ["まんまる（塗りつぶし）", "まんまる", "らくがき", { intro: "手も足も無い。転がって体当たり", personality: "aggressive", specialType: "melee", parts: ["m:dash", "power"], prefer: ["spd", "hp"], catchphrase: "ころころ〜っと" }],
  ["巨大な片手", "かたてマン", "らくがき", { intro: "片手だけがとても長い", personality: "cautious", specialType: "melee", parts: ["m:rubber", "m:slam"], prefer: ["atk", "def"], catchphrase: "とどく とどく〜" }],
  ["胴長ノッポ", "ノッポ", "らくがき", { intro: "ひょろっと背が高い", personality: "sniper", specialType: "ranged", parts: ["r:meteor", "r:homing"], prefer: ["sp", "spd"], catchphrase: "うえから みてるよ" }],
  ["短足ずんぐり", "ずんぐり", "らくがき", { intro: "足が短くて重い。押しても動かない", personality: "cautious", specialType: "melee", parts: ["m:grab", "power"], prefer: ["hp", "def"], catchphrase: "どっこいしょ" }],
];

// 新しいキャラの仕分け
const GROUP: Record<string, string> = {
  "おにぎりゴロン": "たべもの", "どっしりトーフ": "たべもの", "ソフトクリン": "たべもの",
  "ムカデせんせい": "どうぶつ", "よこあるきガニ": "どうぶつ", "ハリネズミ": "どうぶつ", "ひょろグモ": "どうぶつ", "イソギンチャク": "どうぶつ", "にょろヘビ": "どうぶつ",
  "かさおばけ": "おばけ", "ふわりおばけ": "おばけ",
  "えんぴつナイト": "どうぐ", "がたごとでんしゃ": "どうぐ", "チョキチョキ": "どうぐ", "くるくるせんぷうき": "どうぐ", "もじの「ん」": "どうぐ",
};

// ストーリーのボス（倒すと自由バトルで選べる）
const BOSSES: [string, string, CpuProfile][] = [
  ["1-6", "らくがき大王", { intro: "第1章のボス。王冠と大きな拳", personality: "aggressive", specialType: "melee", parts: ["m:giantHands", "m:slam"], prefer: ["atk", "hp"], catchphrase: "わしが この町の 王じゃ！" }],
  ["2-6", "インクの竜", { intro: "第2章のボス。背中のトゲとしっぽ", personality: "aggressive", specialType: "melee", parts: ["m:tornado", "m:legbind"], prefer: ["hp", "atk", "sta"], catchphrase: "インクの うずに のまれろ" }],
  ["3-6", "消しゴム将軍", { intro: "第3章のボス。つかんで消しに来る", personality: "cautious", specialType: "melee", parts: ["m:giantHands", "m:grab"], prefer: ["def", "hp", "atk"], catchphrase: "まちがいは けしてやる" }],
  ["4-6", "クレヨン魔女", { intro: "第4章のボス。空から隕石を降らせる", personality: "sniper", specialType: "ranged", parts: ["r:meteor", "r:homing"], prefer: ["sp", "sta", "def"], catchphrase: "いろとりどりの のろいを" }],
  ["5-6", "白紙の王", { intro: "ラスボス。見えない弾が追いかけてくる", personality: "aggressive", specialType: "ranged", parts: ["r:invisible", "r:homing"], prefer: ["hp", "atk", "sp", "def"], catchphrase: "すべてを まっしろに" }],
];

export const CPU_CHARS: CpuChar[] = [
  ...OLD.map(([key, name, group, p]) => ({ ...p, id: `old:${key}`, name, group, strokes: SAMPLES[key] })),
  ...Object.entries(CPU_PROFILES).map(([name, p]) => ({ ...p, id: `new:${name}`, name, group: GROUP[name] ?? "らくがき", strokes: NEW_SAMPLES[name] })),
  ...BOSSES.map(([stage, name, p]) => ({ ...p, id: `boss:${stage}`, name, group: "ボス", strokes: BOSS_DRAWINGS[name], bossStage: stage })),
];
export const CPU_GROUPS = ["らくがき", "どうぶつ", "たべもの", "どうぐ", "おばけ", "ボス"];
export const cpuCharById = (id: string) => CPU_CHARS.find((c) => c.id === id);
