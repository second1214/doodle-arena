// 背景の 飾り（Kenney・CC0 の 3D モデル。public/models/）。見た目だけで 戦闘計算には 影響しない。
// 舞台の まわり（後ろ半分と 横）に 置く。カメラの 手前には 置かない（キャラが かくれないように）。
// 読みこめない時（オフライン・1ファイル版など）は 飾り なしで そのまま 遊べる。
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Backdrop } from "../sim/arena";

const BASE = "models/";
const FLOOR_Y = -0.9; // 舞台の外の 地面の 高さ（stage3d.ts の floor）

// [ファイル（パック/名前）, 高さ（単位。キャラは 約1.8）]
type Item = [string, number];
const SETS: Record<Backdrop, Item[]> = {
  day: [["nature-kit/tree_default", 5], ["nature-kit/tree_oak", 6], ["nature-kit/tree_fat", 5], ["nature-kit/plant_bushLarge", 2], ["nature-kit/flower_redA", 1], ["nature-kit/flower_yellowA", 1], ["nature-kit/rock_tallB", 2.5], ["nature-kit/mushroom_redGroup", 1.2], ["nature-kit/tree_tall", 7]],
  sunset: [["nature-kit/tree_default_fall", 5], ["nature-kit/tree_oak_fall", 6], ["nature-kit/tree_cone_fall", 6], ["nature-kit/plant_bushLarge", 2], ["nature-kit/rock_tallA", 3], ["nature-kit/stump_round", 1], ["nature-kit/tent_detailedOpen", 3], ["nature-kit/campfire_logs", 1]],
  night: [["nature-kit/tree_pineTallA", 8], ["nature-kit/tree_pineRoundB", 6], ["nature-kit/tree_default_dark", 5], ["graveyard-kit/lightpost-single", 4], ["graveyard-kit/pumpkin-carved", 1.2], ["graveyard-kit/lantern-candle", 1.2], ["nature-kit/rock_tallC", 2.5], ["graveyard-kit/pine", 7]],
  beach: [["pirate-kit/palm-straight", 7], ["pirate-kit/palm-bend", 6], ["pirate-kit/rocks-sand-a", 1.5], ["pirate-kit/barrel", 1.4], ["pirate-kit/chest", 1.2], ["pirate-kit/palm-detailed-straight", 7], ["pirate-kit/rocks-sand-b", 1.5], ["pirate-kit/crate", 1.3]],
  indoor: [],
  cave: [["nature-kit/rock_tallA", 6], ["nature-kit/rock_tallE", 8], ["nature-kit/stone_tallB", 7], ["space-kit/rock_crystals", 2.5], ["space-kit/rock_crystalsLargeA", 4], ["nature-kit/mushroom_tanGroup", 1.4], ["nature-kit/rock_largeC", 3], ["nature-kit/campfire_stones", 1]],
};
// へや: かべに 沿って 家具を 決まった 場所に [ファイル, 高さ, x, z, 向き(ラジアン)]
const ROOM: [string, number, number, number, number][] = [
  ["furniture-kit/bookcaseOpen", 7, -9, -14.6, 0], ["furniture-kit/bookcaseClosedWide", 7, -4, -14.6, 0],
  ["furniture-kit/loungeSofa", 3.2, 6, -14, 0], ["furniture-kit/lampRoundFloor", 6, 11, -14.5, 0], ["furniture-kit/pottedPlant", 3.5, 1, -14.5, 0],
  ["furniture-kit/bear", 2.4, 3.5, -12.5, 0.3], ["furniture-kit/televisionVintage", 3, -18.5, -6, Math.PI / 2], ["furniture-kit/tableRound", 2.5, -17, 2, 0],
  ["furniture-kit/kitchenFridgeLarge", 7, 19, -9, -Math.PI / 2], ["furniture-kit/plantSmall2", 1.5, 17, -2, 0], ["furniture-kit/cardboardBoxOpen", 1.8, -13, -11, 0.4],
];

// 一度 読んだ モデルは とっておく（戦うたびに 読み直さない。小さいので 消さない）
const cache = new Map<string, Promise<THREE.Object3D | null>>();
const loader = new GLTFLoader();
function load(file: string): Promise<THREE.Object3D | null> {
  let p = cache.get(file);
  if (!p) {
    p = loader.loadAsync(`${BASE}${file}.glb`).then((g) => {
      g.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      return g.scene as THREE.Object3D;
    }).catch(() => null);
    cache.set(file, p);
  }
  return p;
}

// 決まった 乱数（毎回 同じ 並び）
function rng(seed: number) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

function place(group: THREE.Group, file: string, height: number, x: number, z: number, rot: number) {
  void load(file).then((src) => {
    if (!src) return;
    const o = src.clone(true);
    const box = new THREE.Box3().setFromObject(o);
    // 高さで そろえる。ただし 横に 広い 物（平たい 岩など）は 横幅でも おさえる（幅は 高さの 2.5倍まで）
    const h = Math.max(0.01, box.max.y - box.min.y), wd = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    const k = Math.min(height / h, (height * 2.5) / Math.max(0.01, wd));
    o.scale.setScalar(k);
    o.position.set(x, FLOOR_Y - box.min.y * k, z);
    o.rotation.y = rot;
    group.add(o);
  });
}

// 飾りを 入れた グループ（モデルは 読めしだい 足される）
export function buildDecor(backdrop: Backdrop): THREE.Group {
  const group = new THREE.Group();
  if (backdrop === "indoor") {
    for (const [f, h, x, z, r] of ROOM) place(group, f, h, x, z, r);
    return group;
  }
  const items = SETS[backdrop] ?? [];
  if (!items.length) return group;
  const rnd = rng(backdrop.length * 977 + 13);
  const N = 22;
  for (let k = 0; k < N; k++) {
    // 後ろ半分と 横（手前 = +z は さける）
    const a = -Math.PI - 0.35 + (k / (N - 1)) * (Math.PI + 0.7) + (rnd() - 0.5) * 0.12;
    const r = backdrop === "beach" ? 11 + rnd() * 4 : 12 + rnd() * 9; // 海べは 砂浜の 上だけ
    const [f, h] = items[Math.floor(rnd() * items.length)];
    place(group, f, h * (0.8 + rnd() * 0.4), Math.cos(a) * r, Math.sin(a) * r, rnd() * Math.PI * 2);
  }
  return group;
}

// 使う ファイルの 一覧（public/models に 入れる もの）
export const DECOR_FILES = [...new Set([...Object.values(SETS).flat().map((i) => i[0]), ...ROOM.map((i) => i[0])])];
