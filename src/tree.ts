// スキルツリー（プレイヤー共通の成長）。中心から7本の枝。各枝は小さな強化5つ（各1ポイント）と、先端の大技1つ（3ポイント・代償付き）。
// 枝の中は手前から順に取る。ノード ID は保存に使うので変えない（変えるときは TREE_VERSION を上げて振り直し）。
import { sumBoost, type Boost } from "./sim/stats";

export const TREE_VERSION = 1;

export interface TreeNode {
  id: string;
  branch: string;
  tier: number; // 1〜5 小さな強化、6 大技
  name: string;
  desc: string;
  cost: number;
  boost: Partial<Boost>;
  big: boolean;
}

export interface Branch {
  key: string;
  label: string;
  color: string;
  small: { name: string; desc: string; boost: Partial<Boost> };
  big: { name: string; desc: string; boost: Partial<Boost> };
}

// 数値は設計レビューの案（docs/SPEC.md §19）。大技は必ず代償付き（上限ではなく損得で釣り合わせる）
export const BRANCHES: Branch[] = [
  { key: "atk", label: "攻撃", color: "#e8590c",
    small: { name: "攻撃", desc: "与えるダメージ +4%", boost: { dealt: 0.04 } },
    big: { name: "重い拳", desc: "通常攻撃の威力 +25%／代わりに構えが少し遅い", boost: { punch: 0.25, windup: 2 } } },
  { key: "def", label: "防御", color: "#1c7ed6",
    small: { name: "防御", desc: "受けるダメージ −4%", boost: { taken: 0.04 } },
    big: { name: "鉄壁", desc: "防御で8割カット（標準7割）／代わりに防御中の移動がさらに遅い", boost: { guardCut: 0.1, guardMove: -0.2 } } },
  { key: "hp", label: "体力", color: "#2f9e44",
    small: { name: "体力", desc: "体力 +5", boost: { hp: 5 } },
    big: { name: "どっしり", desc: "体力 +20・吹き飛ばされにくさ +20%／代わりに移動 −5%", boost: { hp: 20, knock: -0.2, speed: -0.05 } } },
  { key: "sta", label: "スタミナ", color: "#f59f00",
    small: { name: "スタミナ", desc: "スタミナ +5・回復 +4%", boost: { stamina: 5, regen: 0.04 } },
    big: { name: "無尽蔵", desc: "スタミナ回復 +30%／代わりに最大スタミナ −10", boost: { regen: 0.3, stamina: -10 } } },
  { key: "spd", label: "移動", color: "#0c8599",
    small: { name: "移動", desc: "移動の速さ +5%", boost: { speed: 0.05 } },
    big: { name: "韋駄天", desc: "移動の速さ +15%／代わりに吹き飛ばされやすさ +20%", boost: { speed: 0.15, knock: 0.2 } } },
  { key: "sp", label: "必殺", color: "#ae3ec9",
    small: { name: "必殺", desc: "必殺の威力 +5%", boost: { special: 0.05 } },
    big: { name: "せっかち", desc: "必殺に必要な命中 −1回／代わりに必殺の威力 −15%", boost: { chargeNeed: -1, special: -0.15 } } },
  { key: "tec", label: "技", color: "#5c7cfa",
    small: { name: "身のこなし", desc: "回避のスタミナ −3", boost: { dodgeCost: -3 } },
    big: { name: "受け流し名人", desc: "防御成功で溜まる必殺ゲージ +0.5→+1／代わりに防御中のスタミナ消費 2倍", boost: { guardCharge: 0.5, guardDrain: 1 } } },
];

export const SMALL_TIERS = 5;
export const BIG_COST = 3;

export const NODES: TreeNode[] = BRANCHES.flatMap((b) => [
  ...Array.from({ length: SMALL_TIERS }, (_, k) => ({ id: `${b.key}${k + 1}`, branch: b.key, tier: k + 1, name: `${b.small.name} ${k + 1}`, desc: b.small.desc, cost: 1, boost: b.small.boost, big: false })),
  { id: `${b.key}${SMALL_TIERS + 1}`, branch: b.key, tier: SMALL_TIERS + 1, name: b.big.name, desc: b.big.desc, cost: BIG_COST, boost: b.big.boost, big: true },
]);
const BY_ID = new Map(NODES.map((n) => [n.id, n]));
export const nodeById = (id: string) => BY_ID.get(id);
export const TREE_TOTAL = NODES.reduce((a, n) => a + n.cost, 0);

// 取れるか: 枝の中で1つ手前を取っている（1段目は中心につながっているので常に可）
export function canTake(id: string, owned: string[]): boolean {
  const n = BY_ID.get(id);
  if (!n || owned.includes(id)) return false;
  return n.tier === 1 || owned.includes(`${n.branch}${n.tier - 1}`);
}

export const spentOf = (owned: string[]) => owned.reduce((a, id) => a + (BY_ID.get(id)?.cost ?? 0), 0);

// 取ったノードの強化の合計（戦闘に渡すのはこの数値だけ）
export function boostOf(owned: string[]): Partial<Boost> {
  return sumBoost(owned.map((id) => BY_ID.get(id)?.boost ?? {}));
}

// 正しい並びか（保存データの検査）: 知らない ID・飛ばし取りがあれば false
export function isValidTree(owned: string[]): boolean {
  const seen: string[] = [];
  const sorted = [...owned].sort((a, b) => (BY_ID.get(a)?.tier ?? 0) - (BY_ID.get(b)?.tier ?? 0));
  for (const id of sorted) {
    if (!canTake(id, seen)) return false;
    seen.push(id);
  }
  return true;
}

// 敵や CPU 用: 好みの枝の順に、ポイントを使い切るまで手前から取る（決まった結果になる）
export function autoTree(points: number, prefer: string[]): string[] {
  const owned: string[] = [];
  let left = points;
  for (let guard = 0; guard < 200 && left > 0; guard++) {
    let took = false;
    for (const key of prefer) {
      const next = NODES.find((n) => n.branch === key && canTake(n.id, owned));
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
