// ステージの地形（高低差）と背景。戦闘計算は地形（台・坂・はしご）だけを見る。背景は見た目専用。
// 地面の高さ = 台の上面・坂の高さの いちばん高い所（何も無ければ 0）。
// 段差が STEP より高い所へは歩いて入れない（かべ）。坂は少しずつ高くなるので歩いて登れる。はしごは かべに向かって進むと登る。
import { ARENA_RADIUS } from "./consts";

export interface Block { x0: number; x1: number; z0: number; z1: number; h: number } // 上面の高さ h の台
// 坂: axis の向きに h0（小さい方の端）→ h1（大きい方の端）へ まっすぐ高さが変わる
export interface Ramp { x0: number; x1: number; z0: number; z1: number; axis: "x" | "z"; h0: number; h1: number }
// はしご: 足元 (x, z) から、(nx, nz) の向きの かべを 高さ h まで登る
export interface Ladder { x: number; z: number; nx: number; nz: number; h: number }
// CPU の道しるべ: foot（下の入口）から top（上の出口）へ歩けば 高さ h の所へ上がれる
export interface Path { foot: [number, number]; top: [number, number]; h: number }

// 浅い 水たまり（プール）。地面の 高さは 0 のまま。中では 足が おそくなり、かみなり・こおりが 強く、ほのおは 消える
export interface Pool { x: number; z: number; r: number }

export type Backdrop = "day" | "night" | "sunset" | "indoor" | "beach" | "cave";

export interface Arena {
  id: string;
  name: string;
  backdrop: Backdrop;
  blocks: Block[];
  ramps: Ramp[];
  ladders: Ladder[];
  paths: Path[];
  pools?: Pool[];
}

export const STEP = 0.35; // 歩いて のぼれる 段差
export const LADDER_R = 0.6; // はしごに つかまれる 近さ

export function groundAt(a: Arena | undefined, x: number, z: number): number {
  if (!a) return 0;
  let g = 0;
  for (const b of a.blocks) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && b.h > g) g = b.h;
  for (const r of a.ramps) {
    if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
    const t = r.axis === "x" ? (x - r.x0) / (r.x1 - r.x0 || 1) : (z - r.z0) / (r.z1 - r.z0 || 1);
    const h = r.h0 + (r.h1 - r.h0) * t;
    if (h > g) g = h;
  }
  return g;
}

// 水の 中に 立っているか（とんでいる・台の 上は ちがう）
export function inWater(a: Arena | undefined, x: number, z: number, y: number): boolean {
  if (!a?.pools?.length || y > 0.05) return false;
  return a.pools.some((p) => Math.hypot(x - p.x, z - p.z) <= p.r);
}

// 近くの はしご（つかまれる距離にあり、まだ上まで登っていないもの）
export function ladderAt(a: Arena | undefined, x: number, z: number, y: number): Ladder | undefined {
  if (!a) return undefined;
  return a.ladders.find((l) => Math.hypot(x - l.x, z - l.z) <= LADDER_R && y < l.h - 0.05);
}

const box = (cx: number, cz: number, w: number, d: number, h: number): Block => ({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2, h });

// ステージの一覧。flat は 今までの 平らな舞台（オンライン・自由バトルの 標準）
export const ARENAS: Record<string, Arena> = {
  flat: { id: "flat", name: "ひろば", backdrop: "day", blocks: [], ramps: [], ladders: [], paths: [] },
  // 夜の ひろば（平ら）
  night: { id: "night", name: "よるの ひろば", backdrop: "night", blocks: [], ramps: [], ladders: [], paths: [] },
  // 夕やけの おか: 右に 高い おか。左から 坂で のぼる
  hill: {
    id: "hill", name: "夕やけの おか", backdrop: "sunset",
    blocks: [box(4.2, 0, 4.2, 6, 1.6)],
    ramps: [{ x0: -0.2, x1: 2.1, z0: -1.5, z1: 1.5, axis: "x", h0: 0, h1: 1.6 }],
    ladders: [],
    paths: [{ foot: [-0.8, 0], top: [2.6, 0], h: 1.6 }],
  },
  // 海べ: まん中に 岩場。前後に はしご、横に 坂
  beach: {
    id: "beach", name: "なみうちぎわ", backdrop: "beach",
    blocks: [box(0, 0, 3.6, 3.2, 2)],
    ramps: [{ x0: -5.2, x1: -1.8, z0: -0.9, z1: 0.9, axis: "x", h0: 0, h1: 2 }],
    ladders: [{ x: 0, z: 2.0, nx: 0, nz: -1, h: 2 }, { x: 0, z: -2.0, nx: 0, nz: 1, h: 2 }],
    paths: [{ foot: [-5.8, 0], top: [-1.2, 0], h: 2 }, { foot: [0, 2.2], top: [0, 1.0], h: 2 }, { foot: [0, -2.2], top: [0, -1.0], h: 2 }],
  },
  // おへや: 左に つくえ（はしご）、右に 本だな（2だん。坂で のぼる）
  room: {
    id: "room", name: "こどもべや", backdrop: "indoor",
    blocks: [box(-4.6, 0, 3, 4, 2.2), box(4.4, -1.2, 3.2, 2.6, 1.1), box(5.2, 2.0, 2, 2.4, 2.2)],
    ramps: [{ x0: 1.2, x1: 2.8, z0: -2.2, z1: -0.2, axis: "x", h0: 0, h1: 1.1 }, { x0: 4.2, x1: 6.0, z0: 0.1, z1: 0.8, axis: "z", h0: 1.1, h1: 2.2 }],
    ladders: [{ x: -2.75, z: 0, nx: -1, nz: 0, h: 2.2 }],
    paths: [{ foot: [-2.4, 0], top: [-3.6, 0], h: 2.2 }, { foot: [0.7, -1.2], top: [3.6, -1.2], h: 1.1 }, { foot: [5.0, -0.5], top: [5.0, 1.6], h: 2.2 }],
  },
  // どうくつ（暗い）: 左右に 高台。はしごと 坂
  cave: {
    id: "cave", name: "ブロックの どうくつ", backdrop: "cave",
    blocks: [box(-5, -1, 3, 5, 1.8), box(5, 1, 3, 5, 1.8)],
    ramps: [{ x0: -3.5, x1: -1.5, z0: 0.6, z1: 2.2, axis: "x", h0: 1.8, h1: 0 }, { x0: 1.5, x1: 3.5, z0: -2.2, z1: -0.6, axis: "x", h0: 0, h1: 1.8 }],
    ladders: [{ x: -3.25, z: -2.4, nx: -1, nz: 0, h: 1.8 }, { x: 3.25, z: 2.4, nx: 1, nz: 0, h: 1.8 }],
    paths: [{ foot: [-1.0, 1.4], top: [-4.0, 1.4], h: 1.8 }, { foot: [1.0, -1.4], top: [4.0, -1.4], h: 1.8 }, { foot: [-2.9, -2.4], top: [-4.2, -2.4], h: 1.8 }, { foot: [2.9, 2.4], top: [4.2, 2.4], h: 1.8 }],
  },
  // みずあそび プール: まん中に 大きな プール、まわりに 小さな 水たまり。水の 中は 足が おそい
  pool: {
    id: "pool", name: "みずあそび プール", backdrop: "day",
    blocks: [], ramps: [], ladders: [], paths: [],
    pools: [{ x: 0, z: 0, r: 3 }, { x: -5.6, z: 4.2, r: 1.5 }, { x: 5.6, z: -4.2, r: 1.5 }],
  },
  // ほしぞらの とう（夜）: まん中に 高い 塔。左の 中だんから 坂、右から はしご
  sky: {
    id: "sky", name: "ほしぞらの とう", backdrop: "night",
    blocks: [box(0, 0, 2.6, 2.6, 2.6), box(-3.2, 0, 2.4, 3, 1.3), box(4.5, -3, 2.4, 2.4, 1.3)],
    ramps: [{ x0: -4.4, x1: -2.0, z0: 1.5, z1: 3.3, axis: "z", h0: 1.3, h1: 0 }, { x0: -2.0, x1: -1.3, z0: -0.6, z1: 0.6, axis: "x", h0: 1.3, h1: 2.6 }],
    ladders: [{ x: 1.55, z: 0, nx: -1, nz: 0, h: 2.6 }, { x: 4.5, z: -1.55, nx: 0, nz: -1, h: 1.3 }],
    paths: [{ foot: [-3.2, 3.8], top: [-3.2, 0.8], h: 1.3 }, { foot: [-2.6, 0], top: [-0.6, 0], h: 2.6 }, { foot: [1.9, 0], top: [0.6, 0], h: 2.6 }, { foot: [4.5, -1.2], top: [4.5, -2.6], h: 1.3 }],
  },
};

export const ARENA_LIST = Object.values(ARENAS);
export const arenaById = (id?: string) => (id ? ARENAS[id] : undefined) ?? ARENAS.flat;
export const isFlat = (a?: Arena) => !a || (!a.blocks.length && !a.ramps.length);

// 地形が 舞台の外に はみ出していないか（テスト用）
export function inside(a: Arena): boolean {
  const ok = (x: number, z: number) => Math.hypot(x, z) <= ARENA_RADIUS + 0.01;
  return a.blocks.every((b) => ok(b.x0, b.z0) && ok(b.x1, b.z1) && ok(b.x0, b.z1) && ok(b.x1, b.z0));
}
