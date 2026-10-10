// 線画の描画と、検知結果に従ったパーツ切り出し（塗りつぶしは検知専用で、表示には元の線画を使う）。
import { CANVAS_SIZE, labelAt, type DetectResult, type Stroke } from "./detect";
import { imageCanvas } from "./imagestroke";

// 塗りつぶし: 押した点と似た色でつながった範囲を塗る（線のにじみ部分も1画素広げて塗り、白い縁を残さない）
function floodFill(c: CanvasRenderingContext2D, sx: number, sy: number, color: string) {
  const W = c.canvas.width, H = c.canvas.height;
  sx = Math.floor(sx); sy = Math.floor(sy);
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
  const img = c.getImageData(0, 0, W, H);
  const d = img.data;
  const o0 = (sy * W + sx) * 4;
  const r0 = d[o0], g0 = d[o0 + 1], b0 = d[o0 + 2], a0 = d[o0 + 3];
  const tmp = document.createElement("canvas").getContext("2d")!;
  tmp.fillStyle = color;
  tmp.fillRect(0, 0, 1, 1);
  const [cr, cg, cb] = tmp.getImageData(0, 0, 1, 1).data;
  const TOL = 60;
  const similar = (o: number) =>
    Math.abs(d[o + 3] - a0) <= TOL && (a0 < 20 || (Math.abs(d[o] - r0) + Math.abs(d[o + 1] - g0) + Math.abs(d[o + 2] - b0)) <= TOL * 2);
  const filled = new Uint8Array(W * H);
  const stack = [sy * W + sx];
  filled[stack[0]] = 1;
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % W, y = (i - x) / W;
    const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1];
    for (const j of nb) if (j >= 0 && !filled[j] && similar(j * 4)) { filled[j] = 1; stack.push(j); }
  }
  const paint = (i: number) => { const o = i * 4; d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = 255; };
  const edge: number[] = [];
  for (let i = 0; i < filled.length; i++) {
    if (!filled[i]) continue;
    paint(i);
    const x = i % W, y = (i - x) / W;
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && !filled[j]) edge.push(j);
  }
  // にじみ（線との境目の半透明）を、線の色が濃い場合は残し、薄い場合は塗る
  for (const j of edge) if (d[j * 4 + 3] < 200) paint(j);
  c.putImageData(img, 0, 0);
}

export function drawStroke(c: CanvasRenderingContext2D, st: Stroke) {
  const p = st.points;
  if (st.img) {
    const im = imageCanvas(st); // 写真（読みこみ中なら まだ描かない）
    if (im && p.length >= 4) c.drawImage(im, p[0], p[1], p[2], p[3]);
    return;
  }
  if (p.length < 2) return;
  if (st.fill) { floodFill(c, p[0], p[1], st.color); return; }
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
