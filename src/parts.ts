// 線画の描画と、検知結果に従ったパーツ切り出し（塗りつぶしは検知専用で、表示には元の線画を使う）。
import { CANVAS_SIZE, labelAt, type DetectResult, type Stroke } from "./detect";

export function drawStroke(c: CanvasRenderingContext2D, st: Stroke) {
  const p = st.points;
  if (p.length < 2) return;
  c.save();
  c.lineCap = "round";
  c.lineJoin = "round";
  c.lineWidth = st.width;
  if (st.color === "erase") {
    c.globalCompositeOperation = "destination-out";
    c.strokeStyle = "#000";
    c.fillStyle = "#000";
  } else {
    c.strokeStyle = st.color;
    c.fillStyle = st.color;
  }
  if (p.length === 2) {
    c.beginPath();
    c.arc(p[0], p[1], st.width / 2, 0, Math.PI * 2);
    c.fill();
  } else {
    c.beginPath();
    c.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]);
    c.stroke();
  }
  c.restore();
}

export function renderStrokes(strokes: Stroke[]): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = off.height = CANVAS_SIZE;
  const c = off.getContext("2d")!;
  for (const st of strokes) drawStroke(c, st);
  return off;
}

export interface Parts {
  canvases: HTMLCanvasElement[]; // [0]=胴体, [1..]=手足（res.limbs と同順）
  bounds: { x0: number; y0: number; x1: number; y1: number }; // 絵の外接矩形（CANVAS_SIZE 座標）
}

export function cutParts(strokes: Stroke[], res: DetectResult): Parts {
  const base = renderStrokes(strokes);
  const src = base.getContext("2d")!.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const n = res.limbs.length + 1;
  const datas = Array.from({ length: n }, () => new ImageData(CANVAS_SIZE, CANVAS_SIZE));
  let x0 = CANVAS_SIZE, y0 = CANVAS_SIZE, x1 = 0, y1 = 0;
  for (let y = 0; y < CANVAS_SIZE; y++) {
    for (let x = 0; x < CANVAS_SIZE; x++) {
      const o = (y * CANVAS_SIZE + x) * 4;
      if (src.data[o + 3] === 0) continue;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      const part = labelAt(res, x, y) - 1;
      const d = datas[Math.max(0, part)].data;
      d[o] = src.data[o]; d[o + 1] = src.data[o + 1]; d[o + 2] = src.data[o + 2]; d[o + 3] = src.data[o + 3];
    }
  }
  if (x1 < x0) { x0 = y0 = 0; x1 = y1 = CANVAS_SIZE - 1; }
  const canvases = datas.map((data) => {
    const c = document.createElement("canvas");
    c.width = c.height = CANVAS_SIZE;
    c.getContext("2d")!.putImageData(data, 0, 0);
    return c;
  });
  return { canvases, bounds: { x0, y0, x1, y1 } };
}
