import { describe, expect, it } from "vitest";
import { detect, type Stroke } from "../src/detect";
import { beautify, fitShape, mirrorStroke } from "../src/drawassist";

const ring = (cx: number, cy: number, rx: number, ry: number, n = 40, wobble = 0): number[] => {
  const p: number[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, w = 1 + wobble * Math.sin(i * 7.3);
    p.push(Math.round(cx + Math.cos(a) * rx * w), Math.round(cy + Math.sin(a) * ry * w));
  }
  return p;
};
const L = (points: number[], width = 9): Stroke => ({ color: "#222222", width, points });

// 猫: 横長の胴・頭・耳・ずんぐりした4本足・しっぽ（自動検知では足が見つかりにくい形）
const CAT: Stroke[] = [
  L(ring(250, 280, 130, 70)), // 胴
  L(ring(110, 200, 55, 50)), // 頭
  L([75, 165, 80, 120, 105, 155]), L([120, 152, 145, 115, 152, 160]), // 耳
  L([160, 340, 158, 395, 185, 395, 188, 345]), L([210, 345, 210, 400, 236, 400, 236, 348]), // 前足
  L([290, 345, 290, 400, 316, 400, 316, 345]), L([335, 340, 338, 395, 362, 395, 360, 335]), // 後ろ足
  L([378, 270, 430, 230, 450, 170], 12), // しっぽ
];
const paint = (color: "hand" | "foot" | "erase", points: number[]): Stroke => ({ color, width: 30, points });

describe("手足レイヤー", () => {
  it("塗った所だけが手足になる（猫の4本足を足ペン、しっぽを手ペン）", () => {
    const marks = [
      paint("foot", [170, 360, 175, 395]), paint("foot", [222, 365, 222, 398]), paint("foot", [302, 365, 302, 398]), paint("foot", [348, 360, 350, 393]),
      paint("hand", [405, 250, 445, 180]),
    ];
    const r = detect(CAT, undefined, marks);
    expect(r.limbs.filter((l) => l.kind === "foot").length).toBe(4);
    expect(r.limbs.filter((l) => l.kind === "hand").length).toBe(1);
    for (const f of r.limbs.filter((l) => l.kind === "foot")) expect(f.tip[1]).toBeGreaterThan(f.pivot[1]); // 先端は下
  });

  it("後から塗った方が勝つ・消しゴムで消える・何も塗らなければ自動", () => {
    const a = detect(CAT, undefined, [paint("foot", [170, 360, 175, 395]), paint("hand", [170, 360, 175, 395])]);
    expect(a.limbs.map((l) => l.kind)).toEqual(["hand"]);
    const b = detect(CAT, undefined, [paint("foot", [170, 360, 175, 395]), { ...paint("erase", [170, 360, 175, 395]), width: 40 }]);
    expect(b.limbs.length).toBe(detect(CAT).limbs.length); // 塗りが残っていない → 自動検知
    expect(detect(CAT, undefined, []).limbs).toEqual(detect(CAT).limbs);
  });

  it("絵の外だけを塗っても手足にならない", () => {
    expect(detect(CAT, undefined, [paint("hand", [20, 480, 60, 500])]).limbs.length).toBe(0);
  });
});

describe("描き補正", () => {
  it("かたち補正: ガタガタの まる → まる、横長 → だ円、まっすぐ → 2点の線、くねくね → そのまま", () => {
    expect(fitShape(ring(200, 200, 80, 80, 40, 0.06))?.kind).toBe("circle");
    expect(fitShape(ring(200, 200, 120, 60, 40, 0.05))?.kind).toBe("ellipse");
    const line = fitShape([10, 10, 60, 13, 110, 9, 160, 12, 210, 10]);
    expect(line).toEqual({ kind: "line", points: [10, 10, 210, 10] });
    expect(fitShape([10, 10, 60, 90, 110, 10, 160, 90, 210, 10])).toBeNull();
  });

  it("左右対称: まん中で折り返す", () => {
    expect(mirrorStroke(L([100, 50, 200, 60])).points).toEqual([412, 50, 312, 60]);
  });

  it("きれいにする: 線の端のすき間をつなぐ（塗りつぶしがはみ出ない）", () => {
    // 少しすき間のある四角
    const gap: Stroke[] = [L([100, 100, 300, 100, 300, 300, 100, 300, 100, 112])];
    const out = beautify(gap)[0].points;
    const n = out.length;
    expect(Math.hypot(out[n - 2] - out[0], out[n - 1] - out[1])).toBeLessThan(3);
    // 遠い線どうしはつながない
    const far = beautify([L([10, 10, 100, 10]), L([10, 200, 100, 200])]);
    expect(far[0].points.length).toBeLessThanOrEqual(8);
  });
});
