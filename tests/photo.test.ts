import { describe, expect, it } from "vitest";
import { detect } from "../src/detect";
import { inkMask, photoToStrokes, PHOTO_GRID, type Pixels } from "../src/photo";

// 紙の写真のまね: 影でうす暗くなる紙に、黒ペンで まる（胴）＋ 2本の足＋ 2本の手、赤いクレヨンのほっぺ、紙の小さなゴミ
function fakePhoto(): Pixels {
  const n = PHOTO_GRID, data = new Uint8ClampedArray(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const shade = 235 - x * 0.25 - y * 0.15; // 影
    const i = (y * n + x) * 4;
    data[i] = shade; data[i + 1] = shade - 4; data[i + 2] = shade - 12; data[i + 3] = 255;
  }
  const dot = (x: number, y: number, r: number, c: [number, number, number]) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) {
      const xx = Math.round(x + dx), yy = Math.round(y + dy);
      if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
      const i = (yy * n + xx) * 4; data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2];
    }
  };
  const line = (ax: number, ay: number, bx: number, by: number, r: number, c: [number, number, number]) => {
    const L = Math.hypot(bx - ax, by - ay);
    for (let t = 0; t <= L; t += 0.5) dot(ax + ((bx - ax) * t) / L, ay + ((by - ay) * t) / L, r, c);
  };
  const ink: [number, number, number] = [40, 40, 50];
  for (let a = 0; a < Math.PI * 2; a += 0.01) dot(128 + Math.cos(a) * 50, 110 + Math.sin(a) * 50, 2, ink);
  line(110, 158, 100, 215, 2, ink); line(146, 158, 156, 215, 2, ink); // 足
  line(80, 105, 35, 80, 2, ink); line(176, 105, 221, 80, 2, ink); // 手
  dot(105, 120, 6, [230, 70, 60]); // ほっぺ
  dot(20, 240, 1, [120, 120, 120]); // ゴミ
  return { width: n, height: n, data };
}

describe("写真の取り込み", () => {
  it("影のある紙でも、線だけを拾う（ゴミは消える）", () => {
    const m = inkMask(fakePhoto());
    expect(m[110 * PHOTO_GRID + 78]).toBe(1); // まるの線
    expect(m[110 * PHOTO_GRID + 128]).toBe(0); // まるの中の紙
    expect(m[240 * PHOTO_GRID + 20]).toBe(0); // ゴミ
    expect(m[250 * PHOTO_GRID + 250]).toBe(0); // 影のある紙
  });

  it("線にして、手足も見つかる。黒い線は黒・クレヨンは その色", () => {
    const s = photoToStrokes(fakePhoto());
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThan(60);
    expect(s.some((x) => x.color === "#222222")).toBe(true);
    expect(s.some((x) => x.color !== "#222222" && parseInt(x.color.slice(1, 3), 16) > 150)).toBe(true);
    const r = detect(s);
    expect(r.limbs.filter((l) => l.kind === "foot").length).toBe(2);
    expect(r.limbs.filter((l) => l.kind === "hand").length).toBe(2);
  });

  it("白い紙だけなら 何も作らない", () => {
    const n = PHOTO_GRID, data = new Uint8ClampedArray(n * n * 4).fill(240);
    expect(photoToStrokes({ width: n, height: n, data })).toEqual([]);
  });
});
