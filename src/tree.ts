// スキルツリー（プレイヤー共通の成長）。世の中のスキルツリーの「わくわくする仕掛け」を取り入れた形（docs/SPEC.md §27）:
// - 中心から7本の枝。各枝は 小1 → 小2 → ★名前付きの山場（チェックポイント）→ 小4 → 分かれ道（2つのうち1つ）→ 小6 → ◆大技（強いけど損もある）
// - となり合う枝の山場を両方取ると、間に「組み合わせ技」が開く
// - 「らくがき才能」: 描いた絵の形に合うキャラにだけ効く強化
// - 枝を全部取ると称号（振り直し無料なので、全部のノードは最初から見える）
// ノード ID は保存に使うので変えない（変えるときは TREE_VERSION を上げる＝読み込み時に全部払い戻して振り直し）。
import { sumBoost, type Boost } from "./sim/stats";

export const TREE_VERSION = 2;

export type NodeKind = "small" | "notable" | "fork" | "keystone" | "bridge" | "talent";
// らくがき才能の条件（描いた絵の形）
export type ShapeWhen = "noFeet" | "noHands" | "multiHands" | "longArms";
export interface ShapeFlags { hasFeet: boolean; hasHands: boolean; hits: number; reach: number }

export interface TreeNode {
  id: string;
  kind: NodeKind;
  branch?: string; // 枝（組み合わせ技・才能は無し）
  tier: number; // 枝の中の段（1〜7）。分かれ道は 5
  name: string;
  desc: string;
  cost: number;
  boost: Partial<Boost>;
  requires: string[]; // ぜんぶ取っていること
  requiresAny?: string[]; // どれか1つ取っていること（分かれ道の次）
  excludes?: string; // これを取っていたら取れない（分かれ道のもう片方）
  between?: [string, string]; // 組み合わせ技: となり合う2本の枝
  when?: ShapeWhen; // らくがき才能: この形のキャラにだけ効く
}

interface Fork { name: string; desc: string; boost: Partial<Boost> }
export interface Branch {
  key: string;
  label: string;
  color: string;
  title: string; // 枝を全部取るともらえる称号
  small: { name: string; desc: string; boost: Partial<Boost> };
  notable: Fork;
  forks: [Fork, Fork];
  keystone: Fork;
}

// 並び順＝輪の順番（となり同士で組み合わせ技ができる）
export const BRANCHES: Branch[] = [
  { key: "atk", label: "攻撃", color: "#e8590c", title: "こうげきマスター",
    small: { name: "攻撃", desc: "与えるダメージ +4%", boost: { dealt: 0.04 } },
    notable: { name: "パンチ名人", desc: "通常攻撃の威力 +10%", boost: { punch: 0.1 } },
    forks: [{ name: "ちから自慢", desc: "通常攻撃の威力 +15%", boost: { punch: 0.15 } }, { name: "するどい目", desc: "与えるダメージ +6%・移動 +3%", boost: { dealt: 0.06, speed: 0.03 } }],
    keystone: { name: "重い拳", desc: "通常攻撃の威力 +25%／代わりに構えが少し遅い", boost: { punch: 0.25, windup: 2 } } },
  { key: "sp", label: "必殺", color: "#ae3ec9", title: "ひっさつマスター",
    small: { name: "必殺", desc: "必殺の威力 +5%", boost: { special: 0.05 } },
    notable: { name: "必殺の練習", desc: "必殺の威力 +8%", boost: { special: 0.08 } },
    forks: [{ name: "ためこみ", desc: "必殺の威力 +15%", boost: { special: 0.15 } }, { name: "まもって ためる", desc: "防御成功で溜まる必殺ゲージ +0.25・必殺の威力 +5%", boost: { guardCharge: 0.25, special: 0.05 } }],
    keystone: { name: "せっかち", desc: "必殺に必要な命中 −1回／代わりに必殺の威力 −15%", boost: { chargeNeed: -1, special: -0.15 } } },
  { key: "tec", label: "技", color: "#5c7cfa", title: "わざマスター",
    small: { name: "身のこなし", desc: "回避のスタミナ −3", boost: { dodgeCost: -3 } },
    notable: { name: "受け身", desc: "吹き飛ばされにくさ +10%", boost: { knock: -0.1 } },
    forks: [{ name: "みきり", desc: "防御中のスタミナ消費 −40%・防御中の移動 +15%", boost: { guardDrain: -0.4, guardMove: 0.15 } }, { name: "すりぬけ", desc: "回避のスタミナ −4・移動 +3%", boost: { dodgeCost: -4, speed: 0.03 } }],
    keystone: { name: "受け流し名人", desc: "防御成功で溜まる必殺ゲージ +0.5→+1／代わりに防御中のスタミナ消費 2倍", boost: { guardCharge: 0.5, guardDrain: 1 } } },
  { key: "spd", label: "移動", color: "#0c8599", title: "かけっこマスター",
    small: { name: "移動", desc: "移動の速さ +5%", boost: { speed: 0.05 } },
    notable: { name: "身軽", desc: "移動の速さ +5%", boost: { speed: 0.05 } },
    forks: [{ name: "はやあし", desc: "移動の速さ +8%", boost: { speed: 0.08 } }, { name: "かるいステップ", desc: "回避のスタミナ −5", boost: { dodgeCost: -5 } }],
    keystone: { name: "韋駄天", desc: "移動の速さ +15%／代わりに吹き飛ばされやすさ +20%", boost: { speed: 0.15, knock: 0.2 } } },
  { key: "sta", label: "スタミナ", color: "#f59f00", title: "スタミナマスター",
    small: { name: "スタミナ", desc: "スタミナ +5・回復 +4%", boost: { stamina: 5, regen: 0.04 } },
    notable: { name: "スタミナ満タン", desc: "スタミナ +8・回復 +5%", boost: { stamina: 8, regen: 0.05 } },
    forks: [{ name: "深呼吸", desc: "スタミナ回復 +15%", boost: { regen: 0.15 } }, { name: "おおきな肺", desc: "スタミナ +20", boost: { stamina: 20 } }],
    keystone: { name: "無尽蔵", desc: "スタミナ回復 +30%／代わりに最大スタミナ −10", boost: { regen: 0.3, stamina: -10 } } },
  { key: "hp", label: "体力", color: "#2f9e44", title: "たいりょくマスター",
    small: { name: "体力", desc: "体力 +5", boost: { hp: 5 } },
    notable: { name: "げんき", desc: "体力 +10", boost: { hp: 10 } },
    forks: [{ name: "でっかい体力", desc: "体力 +20", boost: { hp: 20 } }, { name: "ふんばり", desc: "吹き飛ばされにくさ +25%", boost: { knock: -0.25 } }],
    keystone: { name: "どっしり", desc: "体力 +20・吹き飛ばされにくさ +20%／代わりに移動 −5%", boost: { hp: 20, knock: -0.2, speed: -0.05 } } },
  { key: "def", label: "防御", color: "#1c7ed6", title: "まもりマスター",
    small: { name: "防御", desc: "受けるダメージ −4%", boost: { taken: 0.04 } },
    notable: { name: "かたい皮", desc: "受けるダメージ −5%", boost: { taken: 0.05 } },
    forks: [{ name: "てっぺき盾", desc: "防御で減らす割合 +8%", boost: { guardCut: 0.08 } }, { name: "ガードで げんき", desc: "防御成功で溜まる必殺ゲージ +0.25・防御中のスタミナ消費 −30%", boost: { guardCharge: 0.25, guardDrain: -0.3 } }],
    keystone: { name: "鉄壁", desc: "防御で8割カット（標準7割）／代わりに防御中の移動がさらに遅い", boost: { guardCut: 0.1, guardMove: -0.2 } } },
];

// 組み合わせ技: 輪でとなり合う2本の枝の山場（★）を両方取ると開く（Hades の「デュオ」のような、育て方の組み合わせのごほうび）
const BRIDGES: { a: string; b: string; name: string; desc: string; boost: Partial<Boost> }[] = [
  { a: "atk", b: "sp", name: "らくがき大爆発", desc: "与えるダメージ +5%・必殺の威力 +10%", boost: { dealt: 0.05, special: 0.1 } },
  { a: "sp", b: "tec", name: "ひらめき", desc: "防御成功で溜まる必殺ゲージ +0.5", boost: { guardCharge: 0.5 } },
  { a: "tec", b: "spd", name: "ニンジャ", desc: "回避のスタミナ −6・移動 +5%", boost: { dodgeCost: -6, speed: 0.05 } },
  { a: "spd", b: "sta", name: "マラソン", desc: "スタミナ回復 +15%・移動 +5%", boost: { regen: 0.15, speed: 0.05 } },
  { a: "sta", b: "hp", name: "タフガイ", desc: "体力 +15・スタミナ +10", boost: { hp: 15, stamina: 10 } },
  { a: "hp", b: "def", name: "かたいやつ", desc: "受けるダメージ −6%・吹き飛ばされにくさ +15%", boost: { taken: 0.06, knock: -0.15 } },
  { a: "def", b: "atk", name: "カウンターパンチ", desc: "防御で減らす割合 +5%・通常攻撃の威力 +10%", boost: { guardCut: 0.05, punch: 0.1 } },
];
export const BRIDGE_COST = 3;

// らくがき才能: 描いた絵の形に合うキャラにだけ効く（どの絵で戦うかで、ツリーの効き方が変わる）
const TALENTS: { id: string; when: ShapeWhen; name: string; desc: string; boost: Partial<Boost> }[] = [
  { id: "t-roll", when: "noFeet", name: "ころころ名人", desc: "足がないキャラだけ: 移動の速さ +12%", boost: { speed: 0.12 } },
  { id: "t-tackle", when: "noHands", name: "体当たり番長", desc: "手がないキャラだけ: 通常攻撃の威力 +20%・吹き飛ばされにくさ +10%", boost: { punch: 0.2, knock: -0.1 } },
  { id: "t-many", when: "multiHands", name: "千手", desc: "手がたくさんのキャラだけ: 通常攻撃の威力 +12%", boost: { punch: 0.12 } },
  { id: "t-long", when: "longArms", name: "のっぽの一撃", desc: "手が長いキャラだけ: 与えるダメージ +6%", boost: { dealt: 0.06 } },
];
export const TALENT_COST = 1;

export const nodeId = (branch: string, tier: number | string) => `${branch}-${tier}`;

export const NODES: TreeNode[] = [
  ...BRANCHES.flatMap((b): TreeNode[] => {
    const id = (t: number | string) => nodeId(b.key, t);
    const small = (t: number, req: Partial<TreeNode>): TreeNode => ({ id: id(t), kind: "small", branch: b.key, tier: t, name: `${b.small.name} ${t}`, desc: b.small.desc, cost: 1, boost: b.small.boost, requires: [], ...req });
    return [
      small(1, {}),
      small(2, { requires: [id(1)] }),
      { id: id(3), kind: "notable", branch: b.key, tier: 3, name: b.notable.name, desc: b.notable.desc, cost: 2, boost: b.notable.boost, requires: [id(2)] },
      small(4, { requires: [id(3)] }),
      { id: id("5a"), kind: "fork", branch: b.key, tier: 5, name: b.forks[0].name, desc: b.forks[0].desc, cost: 2, boost: b.forks[0].boost, requires: [id(4)], excludes: id("5b") },
      { id: id("5b"), kind: "fork", branch: b.key, tier: 5, name: b.forks[1].name, desc: b.forks[1].desc, cost: 2, boost: b.forks[1].boost, requires: [id(4)], excludes: id("5a") },
      small(6, { requires: [], requiresAny: [id("5a"), id("5b")] }),
      { id: id(7), kind: "keystone", branch: b.key, tier: 7, name: b.keystone.name, desc: b.keystone.desc, cost: 3, boost: b.keystone.boost, requires: [id(6)] },
    ];
  }),
  ...BRIDGES.map((x): TreeNode => ({ id: `x-${x.a}-${x.b}`, kind: "bridge", tier: 3, name: x.name, desc: `${x.desc}（${label(x.a)}と${label(x.b)}の ★を とると ひらく）`, cost: BRIDGE_COST, boost: x.boost, requires: [nodeId(x.a, 3), nodeId(x.b, 3)], between: [x.a, x.b] })),
  ...TALENTS.map((t): TreeNode => ({ id: t.id, kind: "talent", tier: 0, name: t.name, desc: t.desc, cost: TALENT_COST, boost: t.boost, requires: [], when: t.when })),
];
function label(key: string) { return BRANCHES.find((b) => b.key === key)?.label ?? key; }

const BY_ID = new Map(NODES.map((n) => [n.id, n]));
export const nodeById = (id: string) => BY_ID.get(id);
export const TREE_TOTAL = NODES.filter((n) => n.kind !== "fork").reduce((a, n) => a + n.cost, 0) + BRANCHES.length * 2; // 分かれ道は片方だけ
// ツリーに使えるポイントの上限（全部の約6割）。多く取れるが全部は取れない＝どこを伸ばすかで個性が出る
export const TREE_CAP = 60;
export const talents = () => NODES.filter((n) => n.kind === "talent");
export const bridges = () => NODES.filter((n) => n.kind === "bridge");

// 取れるか（つながり・分かれ道のもう片方を取っていない）
export function canTake(id: string, owned: string[]): boolean {
  const n = BY_ID.get(id);
  if (!n || owned.includes(id)) return false;
  if (n.excludes && owned.includes(n.excludes)) return false;
  if (!n.requires.every((r) => owned.includes(r))) return false;
  if (n.requiresAny && !n.requiresAny.some((r) => owned.includes(r))) return false;
  return true;
}

export const spentOf = (owned: string[]) => owned.reduce((a, id) => a + (BY_ID.get(id)?.cost ?? 0), 0);

// 古い形（TREE_VERSION 1: atk1〜atk6 の6段、6段目が3ポイント）の払い戻し額
export function legacyCost(id: string): number {
  const m = id.match(/^(atk|def|hp|sta|spd|sp|tec)([1-6])$/);
  return m ? (m[2] === "6" ? 3 : 1) : 1;
}

export function shapeMatches(when: ShapeWhen | undefined, f?: ShapeFlags): boolean {
  if (!when) return true;
  if (!f) return false;
  if (when === "noFeet") return !f.hasFeet;
  if (when === "noHands") return !f.hasHands;
  if (when === "multiHands") return f.hasHands && f.hits > 1;
  return f.hasHands && f.reach >= 0.7;
}

// 取ったノードの強化の合計（戦闘に渡すのはこの数値だけ）。らくがき才能は、戦うキャラの形が合う時だけ足す
export function boostOf(owned: string[], shape?: ShapeFlags): Partial<Boost> {
  return sumBoost(owned.map((id) => BY_ID.get(id)).filter((n): n is TreeNode => !!n && shapeMatches(n.when, shape)).map((n) => n.boost));
}

// 正しい組み合わせか（保存データの検査）: 知らない ID・つながっていない・分かれ道の両取りがあれば false
export function isValidTree(owned: string[]): boolean {
  if (new Set(owned).size !== owned.length) return false;
  const rest = [...owned];
  const got: string[] = [];
  while (rest.length) {
    const i = rest.findIndex((id) => canTake(id, got));
    if (i < 0) return false;
    got.push(rest.splice(i, 1)[0]);
  }
  return true;
}

// 枝を全部（分かれ道は片方）取ったか → 称号
export function masteredBranches(owned: string[]): Branch[] {
  return BRANCHES.filter((b) => owned.includes(nodeId(b.key, 7)));
}

// 敵や CPU 用: 好みの枝の順に、ポイントを使い切るまで手前から取る（分かれ道は前の方。組み合わせ技も届けば取る＝決まった結果）
export function autoTree(points: number, prefer: string[]): string[] {
  const owned: string[] = [];
  let left = Math.min(points, TREE_CAP);
  for (let guard = 0; guard < 300 && left > 0; guard++) {
    let took = false;
    for (const key of prefer) {
      const next = NODES.find((n) => n.branch === key && canTake(n.id, owned)) ?? bridges().find((n) => n.between?.includes(key) && canTake(n.id, owned));
      if (next && next.cost <= left) {
        owned.push(next.id);
        left -= next.cost;
        took = true;
        if (left <= 0) break;
      }
    }
    if (!took) break;
  }
  return owned;
}

// 自由バトルの CPU 用: 枝の好みをランダムに決めて autoTree
export function randomTree(points: number, rnd: () => number = Math.random): string[] {
  const keys = BRANCHES.map((b) => b.key).sort(() => rnd() - 0.5).slice(0, 2 + Math.floor(rnd() * 3));
  return autoTree(points, keys);
}
