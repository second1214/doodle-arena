// 漢字の読めない子ども向け: 画面の漢字に ふりがな（ルビ）を自動でふる。
// 辞書は「漢字（＋送りがな）:漢字の部分の読み」。送りがなで読みが変わる字（消える/消す など）は送りがな付きで登録する。
// 辞書に無い熟語は、辞書の言葉の組み合わせで読む。画面に出る漢字が辞書にあるかはテスト（tests/furigana.test.ts）で確かめる。
const DICT_TEXT = `
必殺:ひっさつ 通常:つうじょう 通常攻撃:つうじょうこうげき 手:て 足:あし 威力:いりょく 絵:え 移動:いどう 飛:と 見:み 読:よ 込:こ 大:おお 消:き 消し:け 消す:け 消さ:け 防御:ぼうぎょ 中:ちゅう 中に:なか 中の:なか 中は:なか
中だ:なか 中ま:なか 速:はや 描:か 弾:たま 引:ひ 出:で 出し:だ 出す:だ 出さ:だ 取:と 体力:たいりょく 直:なお 回避:かいひ 長:なが 吹:ふ 棒人間:ぼうにんげん 動:うご 使:つか 振:ふ
転:ころ 名無:なな 強:つよ 継:つ 代:か 手足:てあし 線:せん 構:かま 回復:かいふく 回:かい 回せ:まわ 回っ:まわ 回る:まわ 回す:まわ 相手:あいて 作:つく 分解:ぶんかい 全部消:ぜんぶけ
命中:めいちゅう 分:ぶん 分か:わ 分け:わ 門番:もんばん 防御中:ぼうぎょちゅう 勝:しょう 勝ち:か 勝つ:か 勝て:か 勝っ:か 自動:じどう 合成:ごうせい 付:つ 保存:ほぞん 攻撃:こうげき 当:あ
倍:ばい 文字:もじ 文:ぶん 鍵:かぎ 材料:ざいりょう 個:こ 開:ひら 用:よう 白:しろ 左:ひだり 写真:しゃしん 巨大:きょだい 体当:たいあ 大王:だいおう 章:しょう 竜:りゅう 将軍:しょうぐん 与:よ 与え:あた 溜:た 受:う 入:はい 入れ:い 名前:なまえ 合:あ 同:おな 押:お 突:つ 塗:ぬ
少:すこ 必要:ひつよう 遅:おそ 空:そら 殴:なぐ 片手:かたて 連打:れんだ 無:な 第:だい 王:おう 魔女:まじょ 白紙:はくし 防御成功:ぼうぎょせいこう 下:した 下げ:さ 物:もの 近接:きんせつ
装備:そうび 端末:たんまつ 画面:がめん 間:あいだ 止:と 上:うえ 上が:あ 上げ:あ 近:ちか 遠:とお 投:な 時間:じかん 技:わざ 消費:しょうひ 経験値:けいけんち 装備中:そうびちゅう 戦:たたか
検知:けんち 書:か 形:かたち 丸:まる 外:そと 外し:はず 外す:はず 外れ:はず 大技:おおわざ 今:いま 遠距離:えんきょり 編集中:へんしゅうちゅう 操作:そうさ 胴体:どうたい 所:ところ 何:なに 戻:もど
変:か 拘束:こうそく 足封:あしふう 短:みじか 届:とど 返:かえ 地面:じめん 前:まえ 胴長:どうなが 短足:たんそく 体:からだ 体あ:たい 軽:かる 本:ほん 重:おも 拳:こぶし 降:ふ 横:よこ
名人:めいじん 最大:さいだい 減:へ 割合:わりあい 先:さき 一度:いちど 上限:じょうげん 組:く 枝:えだ 敗:はい 今日:きょう 人:ひと 音:おと 流:なが 自由:じゆう 観戦:かんせん 設定:せってい 持:も
表示:ひょうじ 才能:さいのう 効:き 説明:せつめい 中心:ちゅうしん 順:じゅん 先端:せんたん 損:そん 共通:きょうつう 数値:すうち 度:ど 度に:たび 進:すす 具合:ぐあい 続:つづ 置:お 貼:は 育:そだ
自分:じぶん 素早:すばや 後:あと 後ろ:うし 太:ふと 補正:ほせい 終:お 全部:ぜんぶ 弾速:だんそく 近接必殺:きんせつひっさつ 個目:こめ 距離:きょり 会心:かいしん 何回:なんかい 小:ちい 痛:いた
追:お 足元:あしもと 時:とき 走:はし 内側:うちがわ 紙:かみ 弱:よわ 効果:こうか 状態異常:じょうたいいじょう 撃:う 生:い 全部手:ぜんぶて 揺:ゆ 町:まち 背中:せなか 隕石:いんせき 突進:とっしん
豆粒:まめつぶ 竜巻:たつまき 反動:はんどう 身:み 割:わり 一度押:いちどお 禁止:きんし 取得済:しゅとくず 山場:やまば 道:みち 両方:りょうほう 称号:しょうごう 準備中:じゅんびちゅう 選択:せんたく
替:か 本足:ほんあし 負:ま 抜:ぬ 多:おお 学校:がっこう 住所:じゅうしょ 電話番号:でんわばんごう 顔:かお 言葉:ことば 悪:わる 言:い 預:あず 個人情報:こじんじょうほう 回数制限:かいすうせいげん
内容:ないよう 非表示:ひひょうじ 予告:よこく 削除:さくじょ 敵:てき 倒:たお 好:す 強化:きょうか 全:ぜん 合計:ごうけい 種類:しゅるい 個集:こあつ 段上:だんうえ 別:べつ 遊:あそ 安心:あんしん
換:か 決:き 戦闘開始:せんとうかいし 左下:ひだりした 右下:みぎした 不要:ふよう 入力方向:にゅうりょくほうこう 方向:ほうこう 関節:かんせつ 細:ほそ 左半分:ひだりはんぶん 右:みぎ
左右対称:さゆうたいしょう 大丈夫:だいじょうぶ 調整:ちょうせい 初期値:しょきち 検知結果:けんちけっか 即反映:そくはんえい 良:よ 値:あたい 教:おし 目延長:めえんちょう 短縮:たんしゅく 発動:はつどう
回減:かいへ 残:のこ 通:とお 削:けず 落:お 行:い 踏:ふ 待:ま 跳:と 輪:わ 安全:あんぜん 逆:ぎゃく 手元:てもと 本体:ほんたい 追加:ついか 確率:かくりつ 貫:つらぬ 得意:とくい 背:せ 高:たか
王冠:おうかん 来:く 一歩:いっぽ 雨:あめ 注意:ちゅうい 森:もり 墨:すみ 砦:とりで 嵐:あらし 城:しろ 地:じ 果:は 光:ひかり 最後:さいご 最高速:さいこうそく 甘:あま 発:はつ 自慢:じまん 目:め
練習:れんしゅう 身軽:みがる 韋駄天:いだてん 満:まん 深呼吸:しんこきゅう 肺:はい 無尽蔵:むじんぞう 皮:かわ 盾:たて 鉄壁:てっぺき 標準:ひょうじゅん 大爆発:だいばくはつ 番長:ばんちょう 千手:せんじゅ
一撃:いちげき 指:ゆび 立体:りったい 失敗:しっぱい 可能性:かのうせい 円:えん 隙間:すきま 埋:う 最小:さいしょう 細長:ほそなが 角度:かくど 真下:ました 右上:みぎうえ 数字:すうじ 次:つぎ
使用:しよう 片方:かたほう 取得:しゅとく 全部戻:ぜんぶもど 最高:さいこう 済:ず 長押:ながお 件:けん 壊:こわ 中身:なかみ 三角:さんかく 勢:いきお 具:ぐ 触角:しょっかく 数:かず 一本足:いっぽんあし
槍:やり 横長:よこなが 車体:しゃたい 発車:はっしゃ 冷:つめ 刃:は 切:き 羽根:はね 枚:まい 意外:いがい 上向:うわむ 触手:しょくしゅ 猛攻:もうこう 慎重:しんちょう 守:まも 固:かた 反撃:はんげき
狙:ねら 狙撃:そげき 離:はな 多用:たよう 伸:の 視界:しかい 多段:ただん 高威力:こういりょく 高速:こうそく 追尾:ついび 打:う 落下:らっか 分裂弾:ぶんれつだん 罠:わな 明日:あした 勝利:しょうり
注目:ちゅうもく 的中:てきちゅう 日本中:にほんじゅう 結果:けっか 金:かね 保護者:ほごしゃ 方:ほう 利用規約:りようきやく 個人:こじん 無料:むりょう 運営:うんえい 広告:こうこく 課金:かきん
公開:こうかい 公開日:こうかいび 持ち主:もちぬし 持主:もちぬし 印:しるし 主:ぬし 性格:せいかく 対戦:たいせん 勝敗:しょうはい 番号:ばんごう 化:か 氏名:しめい 位置情報:いちじょうほう 秘密:ひみつ 乱数:らんすう 混:ま 元:もと 重複防止:ちょうふくぼうし 記録:きろく
日:ひ 順次消:じゅんじけ 保存先:ほぞんさき 米国:べいこく 配信:はいしん 性的:せいてき 暴力的:ぼうりょくてき 差別的:さべつてき 他:ほか 作品:さくひん 悪口:わるぐち 別々:べつべつ 運営者:うんえいしゃ
判断:はんだん 依頼:いらい 問:と 変更:へんこう 停止:ていし 終了:しゅうりょう 保証:ほしょう 知:し 一回:いっかい 再戦:さいせん 戦闘:せんとう 発射:はっしゃ
`;
const DICT = new Map<string, string>(DICT_TEXT.trim().split(/\s+/).map((e) => e.split(":") as [string, string]));
const KANJI = /[\u4e00-\u9fff々]/;
const KANJI_RUN = /[\u4e00-\u9fff々]+/g;

export type Piece = [text: string, reading: string | null];

// 漢字のかたまり run（後ろの文字 after は送りがなの判定に使う）を、読みの付いた部品に分ける。読めない字は reading=null
export function readRun(run: string, after = ""): Piece[] {
  const out: Piece[] = [];
  let p = 0;
  while (p < run.length) {
    let hit: Piece | null = null;
    for (let q = run.length; q > p && !hit; q--) {
      const sub = run.slice(p, q);
      if (q === run.length) for (let k = 3; k >= 1 && !hit; k--) { const r = DICT.get(sub + after.slice(0, k)); if (r && after.length >= k) hit = [sub, r]; }
      if (!hit) { const r = DICT.get(sub); if (r) hit = [sub, r]; }
    }
    if (!hit) hit = [run[p], null];
    out.push(hit);
    p += hit[0].length;
  }
  return out;
}

// 文を「ふつうの文字」と「漢字＋読み」の並びにする
export function segment(text: string): Piece[] {
  const out: Piece[] = [];
  let last = 0;
  for (const m of text.matchAll(KANJI_RUN)) {
    if (m.index! > last) out.push([text.slice(last, m.index), null]);
    out.push(...readRun(m[0], text.slice(m.index! + m[0].length)));
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push([text.slice(last), null]);
  return out;
}

// 漢字を ひらがなに（ルビを付けられない所: 選択肢・図の中の文字など）
export const toKana = (text: string) => segment(text).map(([t, r]) => r ?? t).join("");

// --- 画面への適用 ---
const SETTING_KEY = "doodle-arena:furigana";
export function furiganaOn(): boolean {
  try { return localStorage.getItem(SETTING_KEY) !== "off"; } catch { return true; }
}
export function setFurigana(on: boolean) {
  try { localStorage.setItem(SETTING_KEY, on ? "on" : "off"); } catch { /* 保存できなくても動く */ }
}

const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "RUBY", "RT", "RP", "TITLE"]);
// ルビを入れられない所は ひらがなにする
const KANA_ONLY = new Set(["OPTION", "text", "tspan", "title"]);

function fix(node: Text) {
  const v = node.nodeValue;
  if (!v || !KANJI.test(v)) return;
  const parent = node.parentElement;
  // 付け終わった所（.furi）の中は二度と見ない。辞書に無い漢字は そのまま残るので、見直すと 付け直しが終わらなくなる（固まる）
  if (!parent || parent.closest(".furi,ruby,script,style,textarea,[data-noruby]")) return;
  if (KANA_ONLY.has(parent.tagName) || parent instanceof SVGElement) {
    const k = toKana(v);
    if (k !== v) node.nodeValue = k; // 同じ文を入れ直すと また見張りが動いて 終わらない
    return;
  }
  if (SKIP.has(parent.tagName)) return;
  const pieces = segment(v);
  if (!pieces.some(([, r]) => r)) return; // 読める漢字が無ければ 何もしない
  // 1つの span にまとめる（並べ方が grid / flex の箱の中でも、文がばらばらの項目にならないように）
  const frag = document.createElement("span");
  for (const [t, r] of pieces) {
    if (!r) { frag.appendChild(document.createTextNode(t)); continue; }
    const ruby = document.createElement("ruby");
    ruby.append(t);
    const rt = document.createElement("rt");
    rt.textContent = r;
    ruby.appendChild(rt);
    frag.appendChild(ruby);
  }
  frag.className = "furi";
  parent.replaceChild(frag, node);
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) { fix(root as Text); return; }
  if (root.nodeType !== Node.ELEMENT_NODE || SKIP.has((root as Element).tagName)) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const list: Text[] = [];
  for (let n = tw.nextNode(); n; n = tw.nextNode()) list.push(n as Text);
  for (const t of list) fix(t);
}

// 画面全体を見張り、文字が書きかわるたびに ふりがなを付ける
export function installFurigana(root: HTMLElement = document.body) {
  if (!furiganaOn()) return;
  walk(root);
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "characterData") fix(m.target as Text);
      else m.addedNodes.forEach(walk);
    }
  }).observe(root, { childList: true, characterData: true, subtree: true });
}
