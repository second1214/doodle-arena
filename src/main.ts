import { CANVAS_SIZE, DEFAULT_PARAMS, detect, labelAt, type DetectParams, type DetectResult, type Stroke } from "./detect";
import { SAMPLES } from "./samples";

const STORAGE_KEY = "doodle-arena:proto1";
const COLORS = ["#222222", "#e03131", "#1c7ed6", "#f2c200", "#2f9e44", "#ae3ec9", "#f08c00"];
const HAND_COLORS = ["#e8590c", "#f76707", "#d9480f", "#fd7e14", "#c2255c"];
const FOOT_COLORS = ["#1c7ed6", "#1971c2", "#3b5bdb", "#0c8599", "#5f3dc4"];
const TORSO_COLOR = "#9aa0a6";

type View = "draw" | "detect" | "anim";

const canvas = document.getElementById("view") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const resultEl = document.getElementById("result")!;
const legendEl = document.getElementById("legend")!;
const drawTools = document.getElementById("drawTools")!;

let strokes: Stroke[] = load();
let params: DetectParams = { ...DEFAULT_PARAMS };
let color = COLORS[0];
let width = 9;
let erasing = false;
let view: View = "draw";
let current: Stroke | null = null;
let detected: { res: DetectResult; parts: HTMLCanvasElement[] } | null = null;
let animStart = 0;
let animLoop = false;

function load(): Stroke[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? (JSON.parse(s) as Stroke[]) : [];
  } catch {
    return [];
  }
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(strokes));
  } catch {
    /* 保存できない環境では無視 */
  }
}

function drawStroke(c: CanvasRenderingContext2D, st: Stroke) {
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

function renderStrokes(): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = off.height = CANVAS_SIZE;
  const c = off.getContext("2d")!;
  for (const st of strokes) drawStroke(c, st);
  return off;
}

// 検知結果に従って、元の線画をパーツごとの画像に切り出す（塗りつぶしは検知専用で、表示には使わない）。
function cutParts(res: DetectResult): HTMLCanvasElement[] {
  const base = renderStrokes();
  const src = base.getContext("2d")!.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const n = res.limbs.length + 1;
  const datas = Array.from({ length: n }, () => new ImageData(CANVAS_SIZE, CANVAS_SIZE));
  for (let y = 0; y < CANVAS_SIZE; y++) {
    for (let x = 0; x < CANVAS_SIZE; x++) {
      const o = (y * CANVAS_SIZE + x) * 4;
      if (src.data[o + 3] === 0) continue;
      const part = labelAt(res, x, y) - 1; // 0=胴体, 1..=手足
      const d = datas[Math.max(0, part)].data;
      d[o] = src.data[o]; d[o + 1] = src.data[o + 1]; d[o + 2] = src.data[o + 2]; d[o + 3] = src.data[o + 3];
    }
  }
  return datas.map((data) => {
    const c = document.createElement("canvas");
    c.width = c.height = CANVAS_SIZE;
    c.getContext("2d")!.putImageData(data, 0, 0);
    return c;
  });
}

function tint(part: HTMLCanvasElement, col: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = CANVAS_SIZE;
  const g = c.getContext("2d")!;
  g.drawImage(part, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = col;
  g.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  return c;
}

function runDetect() {
  const res = detect(strokes, params);
  detected = { res, parts: cutParts(res) };
  const hands = res.limbs.filter((l) => l.kind === "hand").length;
  const feet = res.limbs.filter((l) => l.kind === "foot").length;
  const notes: string[] = [];
  if (strokes.length && hands === 0) notes.push("手なし→体当たりで攻撃");
  if (strokes.length && feet === 0) notes.push("足なし→滑って移動");
  resultEl.textContent = strokes.length ? `手 ${hands}本・足 ${feet}本${notes.length ? "（" + notes.join("／") + "）" : ""}` : "まだ何も描かれていません";
}

function limbColor(res: DetectResult, k: number) {
  const l = res.limbs[k];
  const idx = res.limbs.slice(0, k).filter((m) => m.kind === l.kind).length;
  return l.kind === "hand" ? HAND_COLORS[idx % HAND_COLORS.length] : FOOT_COLORS[idx % FOOT_COLORS.length];
}

function render() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (view === "draw") {
    for (const st of strokes) drawStroke(ctx, st);
    if (current) drawStroke(ctx, current);
    return;
  }
  if (!detected) return;
  const { res, parts } = detected;
  const s = CANVAS_SIZE / res.size;

  if (view === "detect") {
    // 検知用シルエット（塗りつぶし）を薄く表示
    const sil = new ImageData(res.size, res.size);
    for (let i = 0; i < res.silhouette.length; i++) {
      if (!res.silhouette[i]) continue;
      const core = res.core[i];
      sil.data.set(core ? [190, 215, 240, 110] : [200, 200, 200, 90], i * 4);
    }
    const tmp = document.createElement("canvas");
    tmp.width = tmp.height = res.size;
    tmp.getContext("2d")!.putImageData(sil, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(tint(parts[0], TORSO_COLOR), 0, 0);
    res.limbs.forEach((l, k) => {
      const col = limbColor(res, k);
      ctx.drawImage(tint(parts[k + 1], col), 0, 0);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(l.pivot[0] * s, l.pivot[1] * s);
      ctx.lineTo(l.tip[0] * s, l.tip[1] * s);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(l.pivot[0] * s, l.pivot[1] * s, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(l.tip[0] * s, l.tip[1] * s, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  // 動かす: 紙人形アニメ（手足を関節で回転）＋左右移動と向き反転
  const t = (performance.now() - animStart) / 1000;
  const hasFeet = res.limbs.some((l) => l.kind === "foot");
  const walkX = Math.sin(t * 0.6) * 90;
  const flip = Math.max(-1, Math.min(1, Math.cos(t * 0.6) * 6)); // 向き変更時に横反転を補間
  const bob = hasFeet ? Math.abs(Math.sin(t * 8)) * -8 : 0;
  const cx = res.centroid[0] * s;

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(CANVAS_SIZE / 2 + walkX, CANVAS_SIZE - 40, 90, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(CANVAS_SIZE / 2 + walkX, bob);
  ctx.scale(flip * 0.8, 0.8);
  ctx.translate(-cx, 40);
  const drawLimb = (k: number) => {
    const l = res.limbs[k];
    const sameKind = res.limbs.slice(0, k).filter((m) => m.kind === l.kind).length;
    const ang = l.kind === "foot"
      ? Math.sin(t * 8 + sameKind * Math.PI) * 0.35
      : Math.sin(t * 5 + sameKind * 1.7) * 0.45;
    ctx.save();
    ctx.translate(l.pivot[0] * s, l.pivot[1] * s);
    ctx.rotate(ang);
    ctx.translate(-l.pivot[0] * s, -l.pivot[1] * s);
    ctx.drawImage(parts[k + 1], 0, 0);
    ctx.restore();
  };
  res.limbs.forEach((l, k) => l.kind === "foot" && drawLimb(k));
  ctx.drawImage(parts[0], 0, 0);
  res.limbs.forEach((l, k) => l.kind === "hand" && drawLimb(k));
  ctx.restore();
  if (!animLoop) {
    animLoop = true;
    requestAnimationFrame(() => { animLoop = false; render(); });
  }
}

function setView(v: View) {
  view = v;
  document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
  drawTools.hidden = v !== "draw";
  legendEl.hidden = v !== "detect";
  if (v === "draw") {
    resultEl.textContent = "";
  } else {
    runDetect();
    animStart = performance.now();
  }
  render();
}

// --- 描画入力 ---
function toCanvas(e: PointerEvent): [number, number] {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * CANVAS_SIZE, ((e.clientY - r.top) / r.height) * CANVAS_SIZE];
}
canvas.addEventListener("pointerdown", (e) => {
  if (view !== "draw") return;
  canvas.setPointerCapture(e.pointerId);
  const [x, y] = toCanvas(e);
  current = { color: erasing ? "erase" : color, width: erasing ? width * 2 : width, points: [Math.round(x), Math.round(y)] };
  render();
});
canvas.addEventListener("pointermove", (e) => {
  if (!current) return;
  const [x, y] = toCanvas(e);
  const p = current.points;
  if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) < 2) return;
  p.push(Math.round(x), Math.round(y));
  render();
});
const endStroke = () => {
  if (!current) return;
  strokes.push(current);
  current = null;
  save();
  render();
};
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);

// --- UI ---
document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view as View)));

const palette = document.getElementById("palette")!;
const eraserBtn = document.getElementById("eraser")!;
for (const c of COLORS) {
  const b = document.createElement("button");
  b.className = "swatch" + (c === color ? " on" : "");
  b.style.background = c;
  b.setAttribute("aria-label", c);
  b.addEventListener("click", () => {
    color = c;
    erasing = false;
    eraserBtn.classList.remove("on");
    palette.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("on", s === b));
  });
  palette.appendChild(b);
}
document.querySelectorAll<HTMLButtonElement>("[data-width]").forEach((b) =>
  b.addEventListener("click", () => {
    width = Number(b.dataset.width);
    document.querySelectorAll("[data-width]").forEach((o) => o.classList.toggle("on", o === b));
  }),
);
eraserBtn.addEventListener("click", () => {
  erasing = !erasing;
  eraserBtn.classList.toggle("on", erasing);
});
document.getElementById("undo")!.addEventListener("click", () => {
  strokes.pop();
  save();
  render();
});
document.getElementById("clear")!.addEventListener("click", () => {
  if (strokes.length && !confirm("全部消しますか？")) return;
  strokes = [];
  save();
  render();
});
const sampleSel = document.getElementById("sample") as HTMLSelectElement;
for (const name of Object.keys(SAMPLES)) sampleSel.add(new Option(name, name));
sampleSel.addEventListener("change", () => {
  const f = SAMPLES[sampleSel.value];
  if (f) {
    strokes = f();
    save();
    render();
  }
  sampleSel.value = "";
});

// --- 検知パラメータ ---
const SLIDERS: { key: keyof DetectParams; label: string; min: number; max: number; step: number; fmt: (v: number) => string }[] = [
  { key: "closeRadius", label: "線の隙間をどこまで埋めるか", min: 0, max: 8, step: 1, fmt: (v) => `${v}` },
  { key: "alpha", label: "胴体とみなす太さ（小さいほど胴体が大きい）", min: 0.15, max: 0.85, step: 0.05, fmt: (v) => v.toFixed(2) },
  { key: "minAreaRatio", label: "手足とみなす最小の大きさ", min: 0.001, max: 0.03, step: 0.001, fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { key: "minAspect", label: "手足とみなす細長さ", min: 1, max: 3, step: 0.1, fmt: (v) => v.toFixed(1) },
  { key: "footAngleDeg", label: "足とみなす角度（真下から）", min: 10, max: 90, step: 5, fmt: (v) => `${v}°` },
];
const slidersEl = document.getElementById("sliders")!;
const sliderInputs: HTMLInputElement[] = [];
for (const sd of SLIDERS) {
  const lab = document.createElement("label");
  lab.className = "slider";
  const name = document.createElement("span");
  name.textContent = sd.label;
  const val = document.createElement("span");
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(sd.min);
  input.max = String(sd.max);
  input.step = String(sd.step);
  const sync = () => { input.value = String(params[sd.key]); val.textContent = sd.fmt(params[sd.key]); };
  sync();
  input.addEventListener("input", () => {
    params = { ...params, [sd.key]: Number(input.value) };
    val.textContent = sd.fmt(params[sd.key]);
    scheduleRedetect();
  });
  (input as HTMLInputElement & { sync?: () => void }).sync = sync;
  sliderInputs.push(input);
  lab.append(name, val, input);
  slidersEl.appendChild(lab);
}
let redetectTimer = 0;
function scheduleRedetect() {
  if (view === "draw") return;
  clearTimeout(redetectTimer);
  redetectTimer = window.setTimeout(() => {
    runDetect();
    if (view === "detect") render();
  }, 120);
}
document.getElementById("resetParams")!.addEventListener("click", () => {
  params = { ...DEFAULT_PARAMS };
  for (const i of sliderInputs) (i as HTMLInputElement & { sync?: () => void }).sync?.();
  scheduleRedetect();
});

render();
