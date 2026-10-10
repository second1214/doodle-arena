// 名前に使えない言葉（悪口・性的・差別・連絡先）。書き方の違い（ひらがな/カタカナ・全角/半角・大文字/小文字・記号や空白）をそろえてから調べる。
// リストは短く始め、見つけた言葉を管理者が足していく（docs/ONLINE_ADMIN.md）。
const WORDS = [
  // 悪口・いやがらせ
  "しね", "しんで", "ころす", "ころせ", "きもい", "きしょい", "うざい", "ばか", "あほ", "かす", "くず", "ぶす", "でぶ", "はげ", "ごみ", "きえろ", "いじめ",
  // 性的
  "えっち", "えろ", "せっくす", "ちんこ", "ちんぽ", "まんこ", "おっぱい", "ぱんつ", "うんこ", "うんち", "sex", "porn", "fuck", "shit", "dick", "pussy",
  // ローマ字
  "baka", "ahoo", "shine", "kimoi", "uzai", "kuzu", "busu", "debu", "unko", "unchi", "chinko", "manko", "ecchi",
  // 差別
  "がいじ", "かたわ", "ちょん", "しなじん", "にがー", "nigger", "nigga",
];

// ひらがなにそろえる（カタカナ→ひらがな、全角英数→半角、小文字、記号・空白・長音を取る）
export function normalizeName(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s　ー〜~・._\-!！?？*＊#＃@＠'"`、。,]/g, "");
}

export function hasNgWord(name: string): boolean {
  const raw = name.normalize("NFKC");
  // 連絡先らしいもの: 7桁以上の数字・メール・URL・LINE/ID
  if (/\d{7,}/.test(raw.replace(/[\s\-ー]/g, ""))) return true;
  if (/@|＠|https?:|www\.|\.com|\.jp|line\s*id|ｌｉｎｅ/i.test(raw)) return true;
  const n = normalizeName(name);
  return WORDS.some((w) => {
    const k = normalizeName(w);
    // 2文字以下の短い言葉は、名前の一部に入っているだけなら許す（「かすてら」「ばかり」「hero」などを弾かない）。名前そのもの・言葉で終わる時だけ弾く
    return k.length <= 2 ? n === k || n.endsWith(k) : n.includes(k);
  });
}
