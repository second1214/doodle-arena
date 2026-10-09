// 描いた絵から、戦闘用のキャラ（性能＋見た目パーツ）を組み立てる。
import { CANVAS_SIZE, DEFAULT_PARAMS, detect, type DetectParams, type DetectResult, type Stroke } from "../detect";
import { cutParts, type Parts } from "../parts";
import type { FighterConfig } from "../sim/world";
import type { EffectId } from "../sim/special";

export const VISUAL_SIZE = 1.8; // 絵の長辺を何単位で表示するか

export interface CharacterBuild {
  res: DetectResult;
  parts: Parts;
  scale: number; // CANVAS_SIZE の 1px が何単位か
  originX: number; // 足元中心（CANVAS_SIZE 座標の x）
  cfg: FighterConfig;
}

export function buildCharacter(name: string, strokes: Stroke[], special: EffectId[], params: DetectParams = DEFAULT_PARAMS): CharacterBuild {
  const res = detect(strokes, params);
  const parts = cutParts(strokes, res);
  const b = parts.bounds;
  const scale = VISUAL_SIZE / Math.max(40, b.x1 - b.x0, b.y1 - b.y0);
  const g = CANVAS_SIZE / res.size;
  const hands = res.limbs.filter((l) => l.kind === "hand");
  const longest = hands.reduce((m, l) => Math.max(m, l.length), 0) * g;
  return {
    res,
    parts,
    scale,
    originX: res.centroid[0] * g,
    cfg: {
      name,
      reach: Math.max(0.35, longest * scale),
      hasHands: hands.length > 0,
      hasFeet: res.limbs.some((l) => l.kind === "foot"),
      special,
    },
  };
}
