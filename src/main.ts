import { CANVAS_SIZE, DEFAULT_PARAMS, detect, type DetectParams, type DetectResult, type Stroke } from "./detect";
import { cutParts, drawStroke, renderStrokes } from "./parts";
import { SAMPLES } from "./samples";
import { furiganaOn, installFurigana, setFurigana } from "./furigana";
import { makeImageStroke, onImagesReady, preloadImages } from "./imagestroke";
import { shareText } from "./share";
import { beautify, fitShape, mirrorStroke, stabilize } from "./drawassist";
import { PHOTO_GRID, photoToColorStrokes, photoToStrokes, segmentSubject, type Pixels } from "./photo";
import { startBattle } from "./battle/battle";
import { Sfx } from "./battle/audio";
import { buildCharacter } from "./battle/character";
import { Preview3D } from "./battle/preview";
import { fighterShape, kidTraits } from "./shape";
import { PERSONAS } from "./sim/ai";
import { sumBoost, type Boost } from "./sim/stats";
import { ALL_KINDS, buildSpecial, equipCosts, extraText, fitsType, hashStr, kindIcon, kindInfo, mainText, makePart, seededRnd, RARITIES, RARITY_INFO, rarityIndex, SPECIAL_BUDGET, type BuiltSpecial, type Part, type PartKind } from "./items";
import { canBeMaterial, combineInto, COMBINE_COUNT, dismantle, dropParts, INVENTORY_CAP, loadInventory, migrateToParts, planCombines, reroll, rerollCost, toggleLock, type DropResult } from "./inventory";
import { autoTree, boostOf, BRANCHES, bridges, canTake, masteredBranches, nodeById, nodeId, randomTree, spentOf, talents, TREE_CAP, TREE_TOTAL, type ShapeFlags } from "./tree";
import type { Personality } from "./sim/world";
import { deleteCharacter, loadDraft, loadoutOf, loadRoster, normalize, saveCharacter, saveDraft, thumbnail, writeRoster, type CharacterData } from "./roster";
import { applyStageResult, expToNext, exportCode, importCode, LEVEL_CAP, loadProfile, loadStory, requestPersist, resetTree, takeNode, totalPoints, type Reward } from "./progress";
import { CPU_CHARS, CPU_GROUPS, cpuCharById, type CpuChar } from "./cpuChars";
import { initOnline } from "./online/screen";
import { AttractHeader } from "./battle/attract";
import { ALL_STAGES, CHAPTERS, chapterOf, enemyParts, isUnlocked, UPCOMING, type Stage } from "./story";

const STORAGE_KEY = "doodle-arena:proto1";
const COLORS = ["#222222", "#e03131", "#1c7ed6", "#f2c200", "#2f9e44", "#ae3ec9", "#f08c00"];
const HAND_COLORS = ["#e8590c", "#f76707", "#d9480f", "#fd7e14", "#c2255c"];
const FOOT_COLORS = ["#1c7ed6", "#1971c2", "#3b5bdb", "#0c8599", "#5f3dc4"];
const TORSO_COLOR = "#9aa0a6";

type View = "draw" | "detect" | "anim" | "char" | "battle";

const canvas = document.getElementById("view") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const resultEl = document.getElementById("result")!;
const legendEl = document.getElementById("legend")!;
const drawTools = document.getElementById("drawTools")!;
const stageEl = document.querySelector(".stage") as HTMLElement;
const battleSetup = document.getElementById("battleSetup")!;
const charSetup = document.getElementById("charSetup")!;

let strokes: Stroke[] = load();
// 手足レイヤー（手ペン・足ペンで塗った所）。絵とは別に保存する
const MARKS_KEY = "doodle-arena:proto1-marks";
const ASSIST_KEY = "doodle-arena:assist";
let marks: Stroke[] = readJson<Stroke[]>(MARKS_KEY, []);
let layer: "draw" | "limb" = "draw";
let markTool: "hand" | "foot" | "erase" = "hand";
const MARK_WIDTH = 30;
const MARK_COLORS = { hand: "#ff7a1a", foot: "#228be6" };
// 描き補正（①手ぶれ補正・②左右対称・③かたち補正）。手ぶれ補正とかたち補正は最初から入
const assist = { smooth: true, mirror: false, shape: true, ...readJson<Partial<{ smooth: boolean; mirror: boolean; shape: boolean }>>(ASSIST_KEY, {}) };
// 1つ戻す: 左右対称は2本で1回ぶん
const undoSizes: Record<"draw" | "limb", number[]> = { draw: [], limb: [] };
let beforeBeautify: Stroke[] | null = null; // ④きれいにする の直前（もう一度押すと戻す）
function readJson<T>(key: string, d: T): T {
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : d; } catch { return d; }
}
let params: DetectParams = { ...DEFAULT_PARAMS };
let color = COLORS[0];
let width = 9;
let erasing = false;
let filling = false; // 塗りつぶしツール
let committed: HTMLCanvasElement = document.createElement("canvas");
let committedFor: Stroke[] | null = null;
let committedLen = -1;
let view: View = "draw";
let current: Stroke | null = null;
let detected: { res: DetectResult; parts: HTMLCanvasElement[] } | null = null;

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
    localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
  } catch {
    /* 保存できない環境では無視 */
  }
  scheduleEditBar();
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

let detectText = ""; // 検知の結果の文（画面の文字はふりがなが混ざるので、こちらを使う）
function runDetect() {
  const res = detect(strokes, params, marks);
  detected = { res, parts: cutParts(strokes, res).canvases };
  const hands = res.limbs.filter((l) => l.kind === "hand").length;
  const feet = res.limbs.filter((l) => l.kind === "foot").length;
  const notes: string[] = [];
  if (strokes.length && hands === 0) notes.push("手なし→体当たりで攻撃");
  if (strokes.length && feet === 0) notes.push("足なし→転がって移動");
  detectText = strokes.length ? `${marks.some((m) => m.color !== "erase") ? "🖐 ぬった手足: " : ""}手 ${hands}本・足 ${feet}本${notes.length ? "（" + notes.join("／") + "）" : ""}` : "まだ何も描かれていません";
  resultEl.textContent = detectText;
}

function limbColor(res: DetectResult, k: number) {
  const l = res.limbs[k];
  const idx = res.limbs.slice(0, k).filter((m) => m.kind === l.kind).length;
  return l.kind === "hand" ? HAND_COLORS[idx % HAND_COLORS.length] : FOOT_COLORS[idx % FOOT_COLORS.length];
}

function render() {
  if (view === "battle" || view === "char") return;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (view === "draw") {
    if (renderPhoto()) return; // 写真の取り込み中（かこむ・きりぬき）
    // 確定した線は1枚の画像にまとめておく（塗りつぶしを描くたびに計算し直さない）
    if (committedFor !== strokes || committedLen !== strokes.length) {
      committed = renderStrokes(strokes);
      committedFor = strokes;
      committedLen = strokes.length;
    }
    if (layer === "limb") {
      // 絵を少し薄くして、その上に塗った手足を半透明で重ねる
      ctx.globalAlpha = 0.55;
      ctx.drawImage(committed, 0, 0);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(renderMarks(current ? [...marks, current, ...(assist.mirror ? [mirrorStroke(current)] : [])] : marks), 0, 0);
      ctx.globalAlpha = 1;
    } else {
      ctx.drawImage(committed, 0, 0);
      if (current) { drawStroke(ctx, current); if (assist.mirror) drawStroke(ctx, mirrorStroke(current)); }
    }
    if (assist.mirror) {
      ctx.save();
      ctx.strokeStyle = "rgba(120,120,160,.45)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_SIZE / 2, 0);
      ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
      ctx.stroke();
      ctx.restore();
    }
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

  // 動かす: 立体プレビュー（Preview3D）が描くので、ここでは何もしない
}

function renderMarks(list: Stroke[]): HTMLCanvasElement {
  return renderStrokes(list.map((m) => (m.color === "erase" ? m : { ...m, color: MARK_COLORS[m.color as "hand" | "foot"] ?? "#888888" })));
}

// 「動かす」: 戦闘と同じ膨らませた立体で動かす
const previewEl = document.getElementById("preview3d")!;
let preview: Preview3D | null = null;
function stopPreview() {
  preview?.dispose();
  preview = null;
}
function startPreview() {
  stopPreview();
  const mine = strokes.length ? strokes : SAMPLES["棒人間"]();
  try {
    preview = new Preview3D(previewEl, buildCharacter(editor.name || "あなた", mine, [], params, strokes.length ? marks : []));
    resultEl.textContent = detectText + "　👆 指でなぞると くるっと 回せるよ";
  } catch {
    resultEl.textContent = "立体の表示に失敗しました（この端末では 3D が使えない可能性があります）";
  }
}

function setView(v: View) {
  view = v;
  canvas.hidden = v === "anim";
  previewEl.hidden = v !== "anim";
  if (v !== "anim") stopPreview();
  document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
  drawTools.hidden = v !== "draw";
  legendEl.hidden = v !== "detect";
  const panel = v === "battle" || v === "char";
  stageEl.hidden = panel;
  battleSetup.hidden = v !== "battle";
  charSetup.hidden = v !== "char";
  if (v === "char") {
    resultEl.textContent = strokes.length ? "" : "まだ絵が ないので「棒人間」で 見せているよ（「かく」で 描いてね）";
    renderTraits();
    renderRoster();
    return;
  }
  if (v === "battle") {
    resultEl.textContent = strokes.length ? "" : "絵がまだ無いので、あなたのキャラは「棒人間」で戦います";
    document.getElementById("myCharName")!.textContent = `${editor.name || "名無し"}（${PERSONAS[editor.personality].label}・${editor.specialType === "melee" ? "近接" : "遠距離"}必殺）`;
    refreshCpuOptions();
    return;
  }
  if (v === "draw") {
    resultEl.textContent = "";
  } else {
    runDetect();
    if (v === "anim") startPreview();
  }
  render();
}

// --- 描画入力 ---
function toCanvas(e: PointerEvent): [number, number] {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * CANVAS_SIZE, ((e.clientY - r.top) / r.height) * CANVAS_SIZE];
}
// 描いている線の状態: 手ぶれ補正の点・補正前の点（かたち補正を取り消す用）・少し止まったかの見張り
let smoothPt: [number, number] = [0, 0];
let lastRaw: [number, number] = [0, 0];
let rawPoints: number[] = [];
let snapped: { at: [number, number] } | null = null;
let holdTimer = 0;
const HOLD_MS = 450;
function armHold() {
  clearTimeout(holdTimer);
  if (!current || layer !== "draw" || !assist.shape || current.color === "erase") return;
  holdTimer = window.setTimeout(() => {
    if (!current || snapped) return;
    const fit = fitShape([...rawPoints, ...lastRaw]);
    if (!fit) return;
    current.points = fit.points;
    snapped = { at: [...lastRaw] };
    resultEl.textContent = fit.kind === "line" ? "📏 まっすぐに したよ" : fit.kind === "circle" ? "⭕ まるに したよ" : "⬭ だ円に したよ";
    render();
  }, HOLD_MS);
}
// 1本ぶん（左右対称なら2本）を、今のレイヤーに足す
function commit(s: Stroke) {
  const list = layer === "limb" ? marks : strokes;
  list.push(s);
  if (assist.mirror) list.push(mirrorStroke(s));
  undoSizes[layer].push(assist.mirror ? 2 : 1);
  if (layer === "draw") beforeBeautify = null;
  syncBeautify();
  save();
  render();
  if (layer === "limb") runDetect(); // 塗った結果（手 ○本・足 ○本）をすぐ見せる
}
let photoDown = false;
canvas.addEventListener("pointerdown", (e) => {
  if (view !== "draw") return;
  const [x, y] = toCanvas(e);
  if (photo && photo.phase !== "done") { canvas.setPointerCapture(e.pointerId); photoDown = true; photoPointer("down", x, y); return; }
  if (filling && layer === "draw") {
    commit({ color, width: 0, points: [Math.round(x), Math.round(y)], fill: true });
    return;
  }
  canvas.setPointerCapture(e.pointerId);
  const pt = [Math.round(x), Math.round(y)];
  smoothPt = [x, y];
  lastRaw = [x, y];
  rawPoints = [...pt];
  snapped = null;
  current = layer === "limb"
    ? { color: markTool, width: markTool === "erase" ? MARK_WIDTH * 1.3 : MARK_WIDTH, points: pt }
    : { color: erasing ? "erase" : color, width: erasing ? width * 2 : width, points: pt };
  armHold();
  render();
});
canvas.addEventListener("pointermove", (e) => {
  if (photoDown) { const [x, y] = toCanvas(e); photoPointer("move", x, y); return; }
  if (!current) return;
  const [x, y] = toCanvas(e);
  if (snapped) {
    // 形に直した後も大きく動いたら、元の線に戻して描き続ける
    if (Math.hypot(x - snapped.at[0], y - snapped.at[1]) < 12) return;
    current.points = [...rawPoints];
    snapped = null;
    resultEl.textContent = "";
  }
  if (Math.hypot(x - lastRaw[0], y - lastRaw[1]) < 2) return;
  lastRaw = [x, y];
  rawPoints.push(Math.round(x), Math.round(y));
  const smoothOn = assist.smooth && layer === "draw";
  if (smoothOn) smoothPt = stabilize(smoothPt, [x, y]);
  const [px, py] = smoothOn ? smoothPt : [x, y];
  const p = current.points;
  if (Math.hypot(px - p[p.length - 2], py - p[p.length - 1]) >= 1.5) p.push(Math.round(px), Math.round(py));
  armHold();
  render();
});
const endStroke = () => {
  if (!current) return;
  clearTimeout(holdTimer);
  const s = current;
  current = null;
  // 手ぶれ補正で遅れた分、最後は指の位置まで伸ばす
  if (!snapped && assist.smooth && layer === "draw" && s.points.length >= 2) {
    const n = s.points.length;
    if (s.points[n - 2] !== Math.round(lastRaw[0]) || s.points[n - 1] !== Math.round(lastRaw[1])) s.points.push(Math.round(lastRaw[0]), Math.round(lastRaw[1]));
  }
  commit(s);
};
const photoUp = (e: PointerEvent) => { if (!photoDown) return; photoDown = false; const [x, y] = toCanvas(e); photoPointer("up", x, y); };
canvas.addEventListener("pointerup", photoUp);
canvas.addEventListener("pointercancel", photoUp);
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
const fillBtn = document.getElementById("fillTool")!;
fillBtn.addEventListener("click", () => {
  filling = !filling;
  if (filling) { erasing = false; eraserBtn.classList.remove("on"); }
  fillBtn.classList.toggle("on", filling);
});
eraserBtn.addEventListener("click", () => {
  filling = false;
  fillBtn.classList.remove("on");
  erasing = !erasing;
  eraserBtn.classList.toggle("on", erasing);
});
document.getElementById("undo")!.addEventListener("click", () => {
  const list = layer === "limb" ? marks : strokes;
  const n = Math.min(list.length, undoSizes[layer].pop() ?? 1);
  list.splice(list.length - n, n);
  if (layer === "draw") beforeBeautify = null;
  syncBeautify();
  save();
  render();
  if (layer === "limb") runDetect();
});

// --- 写真の取り込み: ① 指で四角く かこむ → ② きりぬきを ➕/➖ で なおす（いろごと）→ ③ 絵にする ---
const photoPanel = document.getElementById("photoPanel")!;
const photoSens = document.getElementById("photoSens") as HTMLInputElement;
const photoBg = document.getElementById("photoBg") as HTMLInputElement;
const photoNext = document.getElementById("photoNext") as HTMLButtonElement;
const photoBack = document.getElementById("photoBack") as HTMLButtonElement;
type PhotoPhase = "box" | "fix" | "done";
interface PhotoState {
  img: HTMLImageElement;
  full: HTMLCanvasElement; // 写真全体（キャンバスに収めた絵）
  rect: { x: number; y: number; w: number; h: number } | null; // かこんだ四角（写真の画素）
  drag: { x0: number; y0: number; x1: number; y1: number } | null; // かこんでいる途中（キャンバス座標）
  px: Pixels | null;
  mask: Uint8Array | null;
  phase: PhotoPhase;
  before: Stroke[];
  beforeMarks: Stroke[];
}
let photo: PhotoState | null = null;
let photoMode: "photo" | "color" | "line" = "photo"; // そのまま（写真を貼る）／ぬり絵ふう（色を まとめる）／線だけ（紙の絵）
let photoBrush: "add" | "del" = "add";

// 写真全体を キャンバスの大きさに収める（はみ出さないように 縮める）
const fitOf = (img: HTMLImageElement) => { const s = CANVAS_SIZE / Math.max(img.naturalWidth, img.naturalHeight); return { s, ox: (CANVAS_SIZE - img.naturalWidth * s) / 2, oy: (CANVAS_SIZE - img.naturalHeight * s) / 2 }; };
// かこんだ所を 正方形の小さな画素にする。四角の外は いろごと＝透明（背景あつかい）、線だけ＝紙の色（四すみの平均）
function cropPixels(img: HTMLImageElement, r: { x: number; y: number; w: number; h: number }, transparent: boolean): Pixels {
  const n = PHOTO_GRID;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  const s = n / Math.max(r.w, r.h);
  const dx = (n - r.w * s) / 2, dy = (n - r.h * s) / 2;
  g.drawImage(img, r.x, r.y, r.w, r.h, dx, dy, r.w * s, r.h * s);
  if (!transparent) {
    const d = g.getImageData(0, 0, n, n);
    const x0 = Math.ceil(dx) + 2, x1 = Math.floor(dx + r.w * s) - 3, y0 = Math.ceil(dy) + 2, y1 = Math.floor(dy + r.h * s) - 3;
    let cr = 0, cg = 0, cb = 0;
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) { const o = (y * n + x) * 4; cr += d.data[o]; cg += d.data[o + 1]; cb += d.data[o + 2]; }
    g.globalCompositeOperation = "destination-over";
    g.fillStyle = `rgb(${cr / 4},${cg / 4},${cb / 4})`;
    g.fillRect(0, 0, n, n);
  }
  return g.getImageData(0, 0, n, n);
}
const pxCanvas = (px: Pixels) => { const c = document.createElement("canvas"); c.width = c.height = px.width; c.getContext("2d")!.putImageData(px as ImageData, 0, 0); return c; };

const PHOTO_TEXT: Record<PhotoPhase, [string, string]> = {
  box: ["① とりこみたい ものを 指で 四角く かこんでね", "まわりを 少し あけて、ねこや キャラが ぜんぶ 入るように かこむと きれいに とれるよ。"],
  fix: ["② きりぬきを なおしてね", "明るく 見える所が とりこむ所。足りない所は ➕たす、よけいな所は ➖けす で 指で ぬってね。"],
  done: ["③ できあがり！", ""],
};
function syncPhoto() {
  if (!photo) return;
  const ph = photo.phase;
  document.getElementById("pmPhoto")!.classList.toggle("on", photoMode === "photo");
  document.getElementById("pmColor")!.classList.toggle("on", photoMode === "color");
  document.getElementById("pmLine")!.classList.toggle("on", photoMode === "line");
  document.getElementById("photoStep")!.textContent = PHOTO_TEXT[ph][0];
  document.getElementById("photoHint")!.textContent = ph === "done"
    ? (photoMode === "photo" ? "しゃしんを そのまま 貼ったよ。上から ペンで かきたしても いいよ。形を なおしたい時は「✏️ きりぬきを なおす」。"
      : photoMode === "color" ? "色の こまかさを かえられるよ。形を なおしたい時は「✏️ きりぬきを なおす」。" : "白い紙に こい線で かいた絵 むけ。うすい線が 消えたら 右へ。ゴミが 多かったら 左へ。")
    : PHOTO_TEXT[ph][1];
  document.getElementById("photoBrushRow")!.hidden = ph !== "fix";
  document.getElementById("photoBgRow")!.hidden = ph !== "fix";
  document.getElementById("photoSensRow")!.hidden = ph !== "done" || photoMode === "photo";
  document.getElementById("photoSensName")!.textContent = photoMode === "color" ? "こまかさ" : "うすい線も ひろう";
  document.getElementById("pbAdd")!.classList.toggle("on", photoBrush === "add");
  document.getElementById("pbDel")!.classList.toggle("on", photoBrush === "del");
  photoNext.hidden = ph === "box";
  photoNext.textContent = ph === "fix" ? "▶ 絵に する" : "✅ これで OK";
  photoBack.hidden = ph === "box";
  photoBack.textContent = ph === "done" && photoMode !== "line" ? "✏️ きりぬきを なおす" : "🔄 かこみなおす";
  document.getElementById("photoSensVal")!.textContent = `${Math.round(Number(photoSens.value) * 100)}`;
  document.getElementById("photoBgVal")!.textContent = `${Math.round(Number(photoBg.value) * 100)}`;
}
function setPhotoPhase(ph: PhotoPhase) {
  if (!photo) return;
  photo.phase = ph;
  if (ph === "box") { photo.rect = null; photo.px = null; photo.mask = null; resultEl.textContent = "👆 指で なぞって 四角く かこんでね"; }
  if (ph === "fix" && photo.rect) {
    photo.px = cropPixels(photo.img, photo.rect, true);
    if (!photo.mask) photo.mask = segmentSubject(photo.px, Number(photoBg.value));
    resultEl.textContent = "明るい所が とりこむ所だよ";
  }
  if (ph === "done") makePhotoStrokes();
  syncPhoto();
  render();
}
function makePhotoStrokes() {
  if (!photo?.rect) return;
  if (photoMode === "photo") {
    if (!photo.px) photo.px = cropPixels(photo.img, photo.rect, true);
    if (!photo.mask) photo.mask = segmentSubject(photo.px, Number(photoBg.value));
    const st = photoImageStroke(photo.img, photo.rect, photo.px.width, photo.mask);
    strokes = st ? [st] : [];
    resultEl.textContent = st ? "📷 しゃしんを そのまま 貼ったよ" : "うまく とれなかったよ。かこみなおすか、きりぬきを なおしてね";
    return;
  }
  if (photoMode === "color") {
    if (!photo.px) photo.px = cropPixels(photo.img, photo.rect, true);
    strokes = photoToColorStrokes(photo.px, Number(photoSens.value), Number(photoBg.value), photo.mask ?? undefined);
  } else {
    strokes = beautify(photoToStrokes(cropPixels(photo.img, photo.rect, false), Number(photoSens.value))); // かくかくした線を なめらかに・すき間を つなぐ
  }
  resultEl.textContent = strokes.length ? `📷 線を ${strokes.length}本 つくったよ` : "うまく とれなかったよ。かこみなおすか、きりぬきを なおしてね";
}
// 📷 そのまま: きりぬいた所を 写真のまま 1本の「写真の線」にする（中の穴は うめる）
function photoImageStroke(img: HTMLImageElement, r: { x: number; y: number; w: number; h: number }, n: number, mask0: Uint8Array): Stroke | null {
  const mask = fillHoles(mask0, n);
  let gx0 = n, gy0 = n, gx1 = -1, gy1 = -1;
  for (let i = 0; i < n * n; i++) if (mask[i]) { const x = i % n, y = (i - x) / n; gx0 = Math.min(gx0, x); gx1 = Math.max(gx1, x); gy0 = Math.min(gy0, y); gy1 = Math.max(gy1, y); }
  if (gx1 < 0) return null;
  const bw = gx1 - gx0 + 1, bh = gy1 - gy0 + 1;
  // 正方形の小さな画素（256）↔ 写真の画素
  const s = n / Math.max(r.w, r.h), dx = (n - r.w * s) / 2, dy = (n - r.h * s) / 2;
  const ix = r.x + (gx0 - dx) / s, iy = r.y + (gy0 - dy) / s, iw = bw / s, ih = bh / s;
  const side = 300, k = side / Math.max(iw, ih);
  const src = document.createElement("canvas");
  src.width = Math.max(1, Math.round(iw * k));
  src.height = Math.max(1, Math.round(ih * k));
  src.getContext("2d")!.drawImage(img, ix, iy, iw, ih, 0, 0, src.width, src.height);
  const m = new Uint8Array(bw * bh);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) m[y * bw + x] = mask[(y + gy0) * n + x + gx0];
  // キャンバスの中央に 大きく
  const margin = 40, fit = (CANVAS_SIZE - 2 * margin) / Math.max(bw, bh);
  const w = bw * fit, h = bh * fit;
  return makeImageStroke(src, m, bw, bh, [(CANVAS_SIZE - w) / 2, (CANVAS_SIZE - h) / 2, w, h]);
}
// きりぬきの中の穴（まわりに つながらない所）を うめる
function fillHoles(m: Uint8Array, n: number): Uint8Array {
  const out = new Uint8Array(n * n), st: number[] = [];
  for (let k = 0; k < n; k++) for (const i of [k, (n - 1) * n + k, k * n, k * n + n - 1]) if (!m[i] && !out[i]) { out[i] = 1; st.push(i); }
  while (st.length) {
    const i = st.pop()!, x = i % n, y = (i - x) / n;
    for (const j of [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1, y > 0 ? i - n : -1, y < n - 1 ? i + n : -1]) if (j >= 0 && !m[j] && !out[j]) { out[j] = 1; st.push(j); }
  }
  const res = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) res[i] = out[i] ? 0 : 1;
  return res;
}

// ① ② の時は、キャンバスに 写真を出す（描いた絵の代わりに）
function renderPhoto(): boolean {
  if (!photo || photo.phase === "done") return false;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (photo.phase === "box") {
    ctx.drawImage(photo.full, 0, 0);
    const d = photo.drag;
    if (d) {
      const x = Math.min(d.x0, d.x1), y = Math.min(d.y0, d.y1), w = Math.abs(d.x1 - d.x0), h = Math.abs(d.y1 - d.y0);
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(0, 0, CANVAS_SIZE, y); ctx.fillRect(0, y + h, CANVAS_SIZE, CANVAS_SIZE - y - h); ctx.fillRect(0, y, x, h); ctx.fillRect(x + w, y, CANVAS_SIZE - x - w, h);
      ctx.strokeStyle = "#ff7a59"; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.strokeRect(x, y, w, h); ctx.setLineDash([]);
    }
    return true;
  }
  // ② きりぬき: 写真の上に、とりこまない所を くらく かぶせる
  const px = photo.px!, m = photo.mask!, n = px.width;
  const ov = new ImageData(n, n);
  for (let i = 0; i < n * n; i++) {
    if (px.data[i * 4 + 3] === 0) continue;
    if (!m[i]) ov.data.set([20, 20, 40, 170], i * 4);
  }
  const oc = document.createElement("canvas");
  oc.width = oc.height = n;
  oc.getContext("2d")!.putImageData(ov, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(pxCanvas(px), 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.drawImage(oc, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  return true;
}
// 写真の時の指の動き: ① 四角を かこむ ／ ② ➕/➖ で ぬる
const PHOTO_BRUSH = 7; // 画素（256 の中）
function photoPointer(kind: "down" | "move" | "up", x: number, y: number) {
  if (!photo) return;
  if (photo.phase === "box") {
    if (kind === "down") photo.drag = { x0: x, y0: y, x1: x, y1: y };
    else if (photo.drag) { photo.drag.x1 = x; photo.drag.y1 = y; }
    if (kind === "up" && photo.drag) {
      const d = photo.drag;
      photo.drag = null;
      const { s, ox, oy } = fitOf(photo.img);
      const W = photo.img.naturalWidth, H = photo.img.naturalHeight;
      const ix0 = Math.max(0, (Math.min(d.x0, d.x1) - ox) / s), iy0 = Math.max(0, (Math.min(d.y0, d.y1) - oy) / s);
      const ix1 = Math.min(W, (Math.max(d.x0, d.x1) - ox) / s), iy1 = Math.min(H, (Math.max(d.y0, d.y1) - oy) / s);
      if (ix1 - ix0 < 20 / s || iy1 - iy0 < 20 / s) { resultEl.textContent = "もう少し 大きく かこんでね"; render(); return; }
      photo.rect = { x: ix0, y: iy0, w: ix1 - ix0, h: iy1 - iy0 };
      photo.mask = null;
      setPhotoPhase(photoMode !== "line" ? "fix" : "done");
      return;
    }
    render();
    return;
  }
  if (photo.phase === "fix" && kind !== "up" && photo.px && photo.mask) {
    const n = photo.px.width, k = n / CANVAS_SIZE, gx = x * k, gy = y * k;
    for (let yy = Math.floor(gy - PHOTO_BRUSH); yy <= gy + PHOTO_BRUSH; yy++) for (let xx = Math.floor(gx - PHOTO_BRUSH); xx <= gx + PHOTO_BRUSH; xx++) {
      if (xx < 0 || yy < 0 || xx >= n || yy >= n || (xx - gx) ** 2 + (yy - gy) ** 2 > PHOTO_BRUSH ** 2) continue;
      const i = yy * n + xx;
      if (photo.px.data[i * 4 + 3]) photo.mask[i] = photoBrush === "add" ? 1 : 0;
    }
    render();
  }
}
function endPhoto(keep: boolean) {
  if (!photo) return;
  if (!keep) { strokes = photo.before; marks = photo.beforeMarks; resultEl.textContent = "もとに もどしたよ"; }
  else {
    resultEl.textContent = "📷 とりこんだよ！「🖐 手足を きめる」で 手足も なおせるよ";
    if (photo.before.length) { lastCleared = { strokes: photo.before, marks: photo.beforeMarks, editor: { ...editor }, editId }; showRestore(); }
  }
  photo = null;
  photoPanel.hidden = true;
  resetEditHistory();
  save();
  render();
}
for (const [id, m] of [["pmPhoto", "photo"], ["pmColor", "color"], ["pmLine", "line"]] as const) {
  document.getElementById(id)!.addEventListener("click", () => {
    photoMode = m;
    if (!photo) return;
    if (!photo.rect) { syncPhoto(); return; }
    setPhotoPhase(m !== "line" ? (photo.mask ? "done" : "fix") : "done");
  });
}
document.getElementById("pbAdd")!.addEventListener("click", () => { photoBrush = "add"; syncPhoto(); });
document.getElementById("pbDel")!.addEventListener("click", () => { photoBrush = "del"; syncPhoto(); });
document.getElementById("pbAuto")!.addEventListener("click", () => { if (photo?.px) { photo.mask = segmentSubject(photo.px, Number(photoBg.value)); render(); } });
photoNext.addEventListener("click", () => { if (photo?.phase === "fix") setPhotoPhase("done"); else endPhoto(true); });
photoBack.addEventListener("click", () => {
  if (!photo) return;
  if (photo.phase === "done" && photoMode !== "line") setPhotoPhase("fix");
  else setPhotoPhase("box");
});
document.getElementById("photoCancel")!.addEventListener("click", () => endPhoto(false));
document.getElementById("photoInput")!.addEventListener("change", (e) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = ""; // 同じ写真を もう一度 えらんでも 動くように
  if (!file) return;
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(url);
    const full = document.createElement("canvas");
    full.width = full.height = CANVAS_SIZE;
    const { s, ox, oy } = fitOf(img);
    full.getContext("2d")!.drawImage(img, ox, oy, img.naturalWidth * s, img.naturalHeight * s);
    photo = { img, full, rect: null, drag: null, px: null, mask: null, phase: "box", before: photo?.before ?? strokes, beforeMarks: photo?.beforeMarks ?? marks };
    marks = [];
    setLayer("draw");
    photoPanel.hidden = false;
    setPhotoPhase("box");
    photoPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  img.onerror = () => { URL.revokeObjectURL(url); resultEl.textContent = "その写真は ひらけなかったよ"; };
  img.src = url;
});
let photoTimer = 0;
photoSens.addEventListener("input", () => { clearTimeout(photoTimer); photoTimer = window.setTimeout(() => { if (photo?.phase === "done") { makePhotoStrokes(); render(); } syncPhoto(); }, 150); });
photoBg.addEventListener("input", () => { clearTimeout(photoTimer); photoTimer = window.setTimeout(() => { if (photo?.px && photo.phase === "fix") { photo.mask = segmentSubject(photo.px, Number(photoBg.value)); render(); } syncPhoto(); }, 150); });

// --- レイヤー（絵 / 手足）と描き補正 ---
const layerDrawBtn = document.getElementById("layerDraw")!;
const layerLimbBtn = document.getElementById("layerLimb")!;
const paintTools = document.getElementById("paintTools")!;
const limbTools = document.getElementById("limbTools")!;
function setLayer(l: "draw" | "limb") {
  layer = l;
  layerDrawBtn.classList.toggle("on", l === "draw");
  layerLimbBtn.classList.toggle("on", l === "limb");
  paintTools.hidden = l !== "draw";
  limbTools.hidden = l !== "limb";
  clearBtn.textContent = l === "limb" ? "手足を全部消す" : "全部消す";
  if (l === "limb") { if (strokes.length) runDetect(); else resultEl.textContent = "先に「絵を かく」で 絵を 描いてね"; }
  else resultEl.textContent = "";
  render();
}
layerDrawBtn.addEventListener("click", () => setLayer("draw"));
layerLimbBtn.addEventListener("click", () => setLayer("limb"));
const markBtns = { hand: document.getElementById("mHand")!, foot: document.getElementById("mFoot")!, erase: document.getElementById("mErase")! };
for (const k of Object.keys(markBtns) as (keyof typeof markBtns)[]) {
  markBtns[k].addEventListener("click", () => {
    markTool = k;
    for (const j of Object.keys(markBtns) as (keyof typeof markBtns)[]) markBtns[j].classList.toggle("on", j === k);
  });
}
document.getElementById("mAuto")!.addEventListener("click", () => {
  marks = [];
  undoSizes.limb = [];
  save();
  render();
  runDetect();
  resultEl.textContent = "🤖 自動で 見つけるように もどしたよ　" + detectText;
});
const assistBtns = { smooth: document.getElementById("aSmooth")!, mirror: document.getElementById("aMirror")!, shape: document.getElementById("aShape")! };
const syncAssist = () => { for (const k of Object.keys(assistBtns) as (keyof typeof assistBtns)[]) assistBtns[k].classList.toggle("on", assist[k]); };
for (const k of Object.keys(assistBtns) as (keyof typeof assistBtns)[]) {
  assistBtns[k].addEventListener("click", () => {
    assist[k] = !assist[k];
    syncAssist();
    try { localStorage.setItem(ASSIST_KEY, JSON.stringify(assist)); } catch { /* 無視 */ }
    render();
  });
}
syncAssist();
const beautifyBtn = document.getElementById("beautify")!;
function syncBeautify() { beautifyBtn.textContent = beforeBeautify ? "↩ もとに もどす" : "✨ きれいにする"; }
beautifyBtn.addEventListener("click", () => {
  if (beforeBeautify) { strokes = beforeBeautify; beforeBeautify = null; resultEl.textContent = "もとに もどしたよ"; }
  else if (strokes.length) { beforeBeautify = strokes; strokes = beautify(strokes); resultEl.textContent = "✨ 線を なめらかにして、すき間を つないだよ（もう一度 おすと もとに もどる）"; }
  undoSizes.draw = [];
  syncBeautify();
  save();
  render();
});
// 確認ダイアログが使えない環境もあるので、2回押しで全消去する。
const clearBtn = document.getElementById("clear")!;
let clearArmed = 0;
clearBtn.addEventListener("click", () => {
  if ((layer === "limb" ? marks : strokes).length && !clearArmed) {
    clearBtn.textContent = "もう一度押すと消えます";
    clearArmed = window.setTimeout(() => { clearArmed = 0; clearBtn.textContent = layer === "limb" ? "手足を全部消す" : "全部消す"; }, 2500);
    return;
  }
  clearTimeout(clearArmed);
  clearArmed = 0;
  if (layer === "limb") {
    clearBtn.textContent = "手足を全部消す";
    marks = [];
    undoSizes.limb = [];
    save();
    render();
    runDetect();
    return;
  }
  clearBtn.textContent = "全部消す";
  if (strokes.length) { lastCleared = { strokes, marks, editor: { ...editor }, editId }; showRestore(); toast("🗑 けしたよ。「↩ さっきの 絵に もどす」で もどせるよ"); }
  strokes = [];
  marks = []; // 絵が無くなれば手足の塗りも意味がない
  undoSizes.draw = [];
  undoSizes.limb = [];
  beforeBeautify = null;
  syncBeautify();
  save();
  render();
});
const sampleSel = document.getElementById("sample") as HTMLSelectElement;
for (const name of Object.keys(SAMPLES)) sampleSel.add(new Option(name, name));
sampleSel.addEventListener("change", () => {
  const f = SAMPLES[sampleSel.value];
  if (f) {
    if (strokes.length) { lastCleared = { strokes, marks, editor: { ...editor }, editId }; showRestore(); }
    strokes = f();
    marks = [];
    undoSizes.draw = [];
    undoSizes.limb = [];
    beforeBeautify = null;
    syncBeautify();
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
    if (view === "anim") startPreview();
  }, 120);
}
document.getElementById("resetParams")!.addEventListener("click", () => {
  params = { ...DEFAULT_PARAMS };
  for (const i of sliderInputs) (i as HTMLInputElement & { sync?: () => void }).sync?.();
  scheduleRedetect();
});

// --- 必殺パーツへの移行（初回だけ）: 今までの効果選択を C 相当のパーツにして、そのまま装備する ---
(() => {
  const roster = loadRoster();
  const d = loadDraft();
  const kindsOf = (c: Partial<CharacterData>) => [...(c.special ?? []).map((id) => `r:${id}` as PartKind), ...(c.melee ?? []).map((id) => `m:${id}` as PartKind)];
  const map = migrateToParts([...roster.flatMap(kindsOf), ...(d ? kindsOf(d) : [])]);
  if (!map) return;
  const toParts = (c: Partial<CharacterData>) => [...new Set(kindsOf(c))].map((k) => map.get(k)).filter((x): x is string => !!x);
  const fill = (ids: string[], c: Partial<CharacterData>) => (ids.length ? ids : toParts(c));
  writeRoster(roster.map((c) => ({ ...c, partsR: fill(c.partsR, c), partsM: fill(c.partsM, c) })));
  const nd = normalize(d ?? {});
  const base = d ?? { special: ["homing"], melee: ["tornado"] };
  saveDraft({ ...(d ?? {}), parts: undefined, partsR: fill(nd.partsR, base), partsM: fill(nd.partsM, base) });
})();
// 新しいキャラに最初から付けるパーツ（配った 追尾(遠)・竜巻(近) が残っていれば）
const starterParts = () => ["start-r-homing", "start-m-tornado"].filter((id) => loadInventory().parts.some((p) => p.id === id));

// --- キャラ（編集中のキャラ） ---
const draft = loadDraft();
const editor: CharacterData = normalize({ ...(draft ?? {}), name: draft?.name ?? "", special: draft?.special ?? ["homing"], melee: draft?.melee ?? ["tornado"] });
let editId: string | null = draft?.id && loadRoster().some((c) => c.id === draft.id) ? draft.id : null;
const persistDraft = () => { saveDraft({ ...editor, id: editId ?? undefined, strokes: [], marks: [] }); scheduleEditBar(); };

const nameInput = document.getElementById("charName") as HTMLInputElement;
nameInput.value = editor.name === "名無し" ? "" : editor.name;
nameInput.addEventListener("input", () => { editor.name = nameInput.value.slice(0, 16); persistDraft(); });

function renderTraits() {
  const mine = strokes.length ? strokes : SAMPLES["棒人間"]();
  const traitsEl = document.getElementById("myTraits")!;
  traitsEl.innerHTML = "";
  for (const [icon, text] of kidTraits(fighterShape(detect(mine, params, strokes.length ? marks : [])))) {
    const b = document.createElement("span");
    const i = document.createElement("b");
    i.textContent = icon;
    b.append(i, text);
    traitsEl.appendChild(b);
  }
}

// たたかいかた（性格）: 絵文字の大きなカードから選ぶ
const KID_PERSONA: Record<Personality, [string, string, string]> = {
  aggressive: ["🔥", "ぐいぐい", "どんどん前に出て なぐる"],
  cautious: ["🛡️", "しんちょう", "まもって はんげき"],
  sniper: ["🎯", "とおくから", "なぐったら はなれて ひっさつ"],
  tricky: ["🌀", "トリッキー", "よこに ゆさぶって かわす"],
};
const persCards = document.getElementById("persCards")!;
for (const k of Object.keys(PERSONAS) as Personality[]) {
  const [icon, name, desc] = KID_PERSONA[k];
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.pers = k;
  b.setAttribute("role", "radio");
  b.innerHTML = `<b></b><span></span><small></small>`;
  b.querySelector("b")!.textContent = icon;
  b.querySelector("span")!.textContent = name;
  b.querySelector("small")!.textContent = desc;
  b.addEventListener("click", () => { editor.personality = k; syncPersonality(); persistDraft(); });
  persCards.appendChild(b);
}
function syncPersonality() {
  persCards.querySelectorAll<HTMLButtonElement>("button").forEach((b) => {
    const on = b.dataset.pers === editor.personality;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", String(on));
  });
}

// 必殺技: 持っているパーツを付け外しして組む（遠距離・近接で別々。ポイントも別々）
const stypeTabs = document.getElementById("stypeTabs")!;
const effectsEl = document.getElementById("effects")!;

// パーツ1つの札（レア度・名前・数値・コスト）
function partChip(p: Part, cost = p.cost, note = ""): HTMLElement {
  const el = document.createElement("span");
  el.className = "pc";
  el.style.setProperty("--rc", RARITY_INFO[p.rarity].color);
  const rk = document.createElement("b");
  rk.className = "rk";
  rk.textContent = p.rarity;
  const nm = document.createElement("span");
  nm.className = "pn";
  nm.textContent = `${kindIcon(p.kind)} ${kindInfo(p.kind).name}`;
  const sub = document.createElement("small");
  sub.textContent = [mainText(p), ...p.extras.map(extraText)].join("・") + (note ? `（${note}）` : "");
  const c = document.createElement("span");
  c.className = "pcost";
  c.textContent = `${cost}`;
  c.title = "装備コスト";
  el.append(rk, nm, sub, c);
  return el;
}
// 子ども向けの大きなパーツの札（キャラタブ用）
function partTile(p: Part, cost: number, note = ""): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "ptile";
  b.style.setProperty("--rc", RARITY_INFO[p.rarity].color);
  const name = kindInfo(p.kind).name;
  b.innerHTML = `<span class="rk"></span><span class="ct"></span><span class="ic"></span><span class="nm"></span><span class="pw"></span>`;
  b.querySelector(".rk")!.textContent = p.rarity;
  b.querySelector(".ct")!.textContent = `${cost}`;
  b.querySelector(".ic")!.textContent = kindIcon(p.kind);
  b.querySelector(".nm")!.textContent = name;
  // 効果パーツは「何が起きるか」を、能力パーツは数値を見せる
  const what = p.kind.includes(":") ? kindInfo(p.kind).desc : mainText(p);
  b.querySelector(".pw")!.textContent = note || what + (p.extras.length ? ` ＋${p.extras.length}` : "");
  b.title = `${name}・${[mainText(p), ...p.extras.map(extraText)].join("・")}・コスト${cost}`;
  return b;
}
const partsById = (ids: string[]): Part[] => {
  const inv = loadInventory();
  return ids.map((id) => inv.parts.find((p) => p.id === id)).filter((p): p is Part => !!p);
};
// 予算を超える分は後ろから効かない（振り直しでコストが上がった時など）
function withinBudget(parts: Part[], type: "ranged" | "melee"): Part[] {
  const out: Part[] = [];
  for (const p of parts.filter((x) => fitsType(x, type))) {
    const cs = equipCosts([...out, p]);
    if (cs.reduce((a, c) => a + c, 0) <= SPECIAL_BUDGET) out.push(p);
  }
  return out;
}
function specialSummary(b: BuiltSpecial, type: "ranged" | "melee"): string {
  const t = [`威力 ×${b.mod.power.toFixed(2)}`];
  if (type === "ranged" && b.mod.speed !== 1) t.push(`弾の速さ ×${b.mod.speed.toFixed(2)}`);
  if (b.mod.duration !== 1) t.push(`状態異常の時間 ×${b.mod.duration.toFixed(2)}`);
  if (type === "melee" && b.mod.windup) t.push(`構え −${b.mod.windup}`);
  if (b.chargeDelta) t.push(`必殺に必要な命中 ${b.chargeDelta}回`);
  return t.join("・");
}

const TYPE_LABEL = { ranged: ["🎯", "とおくの ひっさつ"], melee: ["👊", "ちかくの ひっさつ"] } as const;
const setLoadout = (type: "ranged" | "melee", ids: string[]) => { if (type === "ranged") editor.partsR = ids; else editor.partsM = ids; };

function renderEffects() {
  const inv = loadInventory();
  const fits = (type: "ranged" | "melee") => (id: string) => { const p = inv.parts.find((x) => x.id === id); return !!p && fitsType(p, type); };
  // 分解したパーツ・型に合わないパーツは外す
  editor.partsR = editor.partsR.filter(fits("ranged"));
  editor.partsM = editor.partsM.filter(fits("melee"));
  const type = editor.specialType;
  const usedOf = (t: "ranged" | "melee") => equipCosts(withinBudget(partsById(loadoutOf(editor, t)), t)).reduce((a, c) => a + c, 0);

  // 上: 2つの札（それぞれの のこりポイント）。えらんだ方を たたかいで つかう
  stypeTabs.innerHTML = "";
  for (const t of ["ranged", "melee"] as const) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `stab${t === type ? " on" : ""}`;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(t === type));
    b.innerHTML = `<b></b><span></span><small></small>`;
    b.querySelector("b")!.textContent = TYPE_LABEL[t][0];
    b.querySelector("span")!.textContent = TYPE_LABEL[t][1];
    b.querySelector("small")!.textContent = `⚡ ${usedOf(t)} / ${SPECIAL_BUDGET}${t === type ? "　⭐ つかう" : ""}`;
    b.addEventListener("click", () => { editor.specialType = t; renderEffects(); persistDraft(); });
    stypeTabs.appendChild(b);
  }

  const ids = loadoutOf(editor, type);
  const mine = partsById(ids);
  const active = withinBudget(mine, type);
  const costs = equipCosts(active);
  const used = costs.reduce((a, c) => a + c, 0);
  const other = new Set(loadoutOf(editor, type === "ranged" ? "melee" : "ranged"));
  effectsEl.innerHTML = "";
  const add = (cls: string, text: string, parent: HTMLElement = effectsEl) => { const d = document.createElement("div"); d.className = cls; d.textContent = text; parent.appendChild(d); return d; };

  add("kidhint", `⭐ たたかいでは ${TYPE_LABEL[type][0]} ${TYPE_LABEL[type][1]}を つかうよ`);
  // ポイントの つぶ（1つぶ = 1ポイント。パーツごとに 色を わける）
  const pips = document.createElement("div");
  pips.className = "pips";
  pips.setAttribute("aria-label", `ポイント ${used} / ${SPECIAL_BUDGET}`);
  let k = 0;
  active.forEach((p, i) => { for (let j = 0; j < costs[i] && k < SPECIAL_BUDGET; j++, k++) { const d = document.createElement("i"); d.style.background = RARITY_INFO[p.rarity].color; pips.appendChild(d); } });
  for (; k < SPECIAL_BUDGET; k++) pips.appendChild(document.createElement("i"));
  const left = document.createElement("b");
  left.textContent = `のこり ⚡${SPECIAL_BUDGET - used}`;
  pips.appendChild(left);
  effectsEl.appendChild(pips);

  const box = (title: string, empty: string) => {
    const wrap = document.createElement("div");
    wrap.className = "pbox";
    add("kidhint", title, wrap);
    const g = document.createElement("div");
    g.className = "tgrid";
    wrap.appendChild(g);
    effectsEl.appendChild(wrap);
    if (empty) add("empty", empty, g);
    return g;
  };
  const on = box("🎒 つけている（タップで はずす）", mine.length ? "" : "まだ なにも ついていないよ。下の パーツを タップしてね");
  for (const p of mine) {
    const i = active.indexOf(p);
    const t = partTile(p, i >= 0 ? costs[i] : p.cost, i < 0 ? "⚡が たりなくて きいてない" : "");
    t.classList.add("equipped");
    if (i < 0) t.classList.add("off");
    t.insertAdjacentHTML("beforeend", `<span class="badge x">✖</span>`);
    t.addEventListener("click", () => { setLoadout(type, ids.filter((id) => id !== p.id)); renderEffects(); persistDraft(); });
    on.appendChild(t);
  }

  const cand = inv.parts.filter((p) => fitsType(p, type) && !ids.includes(p.id))
    .sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity) || kindInfo(a.kind).name.localeCompare(kindInfo(b.kind).name));
  const have = box("🧰 もっている パーツ（タップで つける）", cand.length ? "" : "つけられる パーツが ないよ。ストーリーで かつと もらえる！");
  for (const p of cand) {
    const cost = equipCosts([...active, p]).at(-1)!;
    const short = used + cost > SPECIAL_BUDGET;
    const both = kindInfo(p.kind).type === "both";
    const t = partTile(p, cost, short ? `⚡が ${used + cost - SPECIAL_BUDGET} たりない` : "");
    t.disabled = short;
    t.insertAdjacentHTML("beforeend", `<span class="badge plus">＋</span>`);
    if (both) t.insertAdjacentHTML("beforeend", `<span class="tag">${other.has(p.id) ? `${TYPE_LABEL[type === "ranged" ? "melee" : "ranged"][0]}にも つけてる` : "🔁 どっちにも つかえる"}</span>`);
    t.addEventListener("click", () => { setLoadout(type, [...ids, p.id]); renderEffects(); persistDraft(); });
    have.appendChild(t);
  }
  add("ksub", `右上の ⚡は つけるのに いる ポイント。🎯と👊で べつべつに ${SPECIAL_BUDGET}ずつ つけられるよ。🔁の パーツは 1こで 両方に つけられる。おなじ パーツを かさねると こうかも かさなる！（いまの ひっさつ: ${specialSummary(buildSpecial(active, type), type)}）`);
}

function syncEditor() {
  nameInput.value = editor.name === "名無し" ? "" : editor.name;
  syncPersonality();
  renderEffects();
}
syncEditor();

// 保存・新規・一覧
const saveMsg = document.getElementById("saveMsg")!;
function saveCurrent(): boolean {
  if (!strokes.length) { saveMsg.textContent = "まだ絵が ないよ。「かく」で 描いてから ほぞんしてね"; toast("まだ絵が ないよ"); return false; }
  const id = editId ?? normalize({}).id;
  const ok = saveCharacter({ ...editor, id, name: editor.name || "名無し", strokes: strokes.map((s) => ({ ...s, points: [...s.points] })), marks: marks.map((s) => ({ ...s, points: [...s.points] })) });
  editId = id;
  persistDraft();
  saveMsg.textContent = ok ? `「${editor.name || "名無し"}」を ほぞんしたよ！` : "ほぞんできなかった…（ブラウザの設定で保存が禁止されているかもしれません）";
  toast(ok ? `💾「${editor.name || "名無し"}」を ほぞんしたよ` : "ほぞんできなかった…");
  renderRoster();
  return ok;
}
document.getElementById("saveChar")!.addEventListener("click", () => saveCurrent());
document.getElementById("ebSave")!.addEventListener("click", () => saveCurrent());

// --- 今つくっているキャラ: ほぞんしたか（上の帯に出す）。絵が消える前に 必ず たずねる ---
const sigOf = (c: { strokes: Stroke[]; marks?: Stroke[]; name: string; personality: string; specialType: string; partsR: string[]; partsM: string[] }) =>
  JSON.stringify([c.strokes, c.marks ?? [], c.name, c.personality, c.specialType, c.partsR, c.partsM]);
function isDirty(): boolean {
  const saved = editId ? loadRoster().find((c) => c.id === editId) : undefined;
  if (!saved) return strokes.length > 0;
  return sigOf({ ...editor, strokes, marks }) !== sigOf({ ...saved, name: saved.name });
}
let editBarTimer = 0;
function scheduleEditBar() { cancelAnimationFrame(editBarTimer); editBarTimer = requestAnimationFrame(refreshEditBar); }
function refreshEditBar() {
  const th = document.getElementById("ebThumb") as HTMLImageElement | null;
  if (!th) return;
  th.src = thumbnail(strokes);
  document.getElementById("ebName")!.textContent = `✏️ ${editor.name || "名無し"}`;
  const st = document.getElementById("ebState")!;
  const dirty = isDirty();
  st.className = dirty ? "dirty" : "clean";
  st.textContent = !strokes.length ? "まだ 絵が ないよ" : dirty ? "● まだ ほぞんしていない" : "✔ ほぞんずみ";
}
// たずねる窓（ほぞんしてから／ほぞんしないで／やめる）
function askBeforeLeave(what: string, proceed: () => void) {
  if (!isDirty()) { proceed(); return; }
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const box = document.createElement("div");
  box.className = "modal-box";
  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  const h = document.createElement("div");
  h.className = "kidhint";
  h.textContent = `「${editor.name || "名無し"}」は まだ ほぞんしていないよ`;
  const pv = document.createElement("div");
  pv.className = "pv";
  const im = document.createElement("img");
  im.src = thumbnail(strokes);
  im.alt = "";
  const t = document.createElement("div");
  t.className = "note";
  t.textContent = `${what}と、いまの 絵は 画面から きえるよ。ほぞんしておけば「ほぞんした キャラ」から いつでも よびだせるよ。`;
  pv.append(im, t);
  const col = document.createElement("div");
  col.className = "col";
  const mk = (label: string, cls: string, f: () => void) => { const b = document.createElement("button"); b.type = "button"; b.className = cls; b.textContent = label; b.addEventListener("click", () => { close(); f(); }); col.appendChild(b); };
  mk(`💾 ほぞんしてから ${what}`, "primary", () => { if (saveCurrent()) proceed(); });
  mk(`🗑 ほぞんしないで ${what}`, "", () => { lastCleared = { strokes, marks, editor: { ...editor }, editId }; proceed(); toast("「↩ さっきの絵に もどす」で もどせるよ"); showRestore(); });
  mk("やめる（いまの 絵の まま）", "", () => {});
  box.append(h, pv, col);
  modal.appendChild(box);
  document.body.appendChild(modal);
}
// ほぞんしないで 消した絵を 1つだけ 取っておく（まちがえた時に もどせる）
let lastCleared: { strokes: Stroke[]; marks: Stroke[]; editor: CharacterData; editId: string | null } | null = null;
function showRestore() {
  const b = document.getElementById("restoreBtn");
  if (b) b.hidden = !lastCleared;
}

function startNew() {
  editId = null;
  Object.assign(editor, normalize({ name: "", parts: starterParts() }));
  editor.name = "";
  strokes = [];
  marks = [];
  resetEditHistory();
  save();
  syncEditor();
  renderTraits();
  renderRoster();
  persistDraft();
  render();
  saveMsg.textContent = "あたらしい キャラを つくろう！「かく」で 絵を 描いてね";
  toast("✏️ あたらしい キャラを つくるよ");
}
const newAction = () => askBeforeLeave("あたらしく つくる", startNew);
document.getElementById("newChar")!.addEventListener("click", newAction);
document.getElementById("ebNew")!.addEventListener("click", newAction);
document.getElementById("restoreBtn")?.addEventListener("click", () => {
  if (!lastCleared) return;
  const r = lastCleared;
  askBeforeLeave("さっきの 絵に もどす", () => doRestore(r));
});
function doRestore(r: NonNullable<typeof lastCleared>) {
  if (lastCleared === r) lastCleared = null;
  strokes = r.strokes;
  marks = r.marks;
  Object.assign(editor, r.editor);
  editId = r.editId;
  resetEditHistory();
  save();
  syncEditor();
  renderTraits();
  renderRoster();
  persistDraft();
  render();
  showRestore();
  toast("↩ さっきの 絵に もどしたよ");
}

function resetEditHistory() {
  undoSizes.draw = [];
  undoSizes.limb = [];
  beforeBeautify = null;
  syncBeautify();
}

function loadIntoEditor(c: CharacterData) {
  editId = c.id;
  Object.assign(editor, normalize(c));
  strokes = c.strokes.map((s) => ({ ...s, points: [...s.points] }));
  marks = (c.marks ?? []).map((s) => ({ ...s, points: [...s.points] }));
  resetEditHistory();
  save();
  syncEditor();
  renderTraits();
  renderRoster();
  persistDraft();
  saveMsg.textContent = `「${c.name}」を よびだしたよ`;
}

const rosterEl = document.getElementById("roster")!;
function renderRoster() {
  const list = loadRoster();
  rosterEl.innerHTML = "";
  if (!list.length) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "まだ ないよ。絵を描いて「ほぞんする」を おすと ここに ならぶ";
    rosterEl.appendChild(e);
    return;
  }
  for (const c of list) {
    const card = document.createElement("div");
    card.classList.toggle("on", c.id === editId);
    const img = document.createElement("img");
    if (c.thumb) img.src = c.thumb;
    img.alt = "";
    const nm = document.createElement("span");
    nm.className = "nm";
    nm.textContent = c.name;
    const row = document.createElement("div");
    row.className = "row";
    const edit = document.createElement("button");
    edit.textContent = "なおす";
    edit.addEventListener("click", () => askBeforeLeave(`「${c.name}」を よびだす`, () => loadIntoEditor(c)));
    const del = document.createElement("button");
    del.textContent = "けす";
    let armed = 0;
    del.addEventListener("click", () => {
      if (!armed) { del.textContent = "ほんとに？"; armed = window.setTimeout(() => { armed = 0; del.textContent = "けす"; }, 2500); return; }
      clearTimeout(armed);
      deleteCharacter(c.id);
      if (editId === c.id) editId = null;
      renderRoster();
    });
    row.append(edit, del);
    card.append(img, nm, row);
    rosterEl.appendChild(card);
  }
}

// --- 戦う ---
// 相手選び: 絵のカードから選ぶ（CPU キャラ・倒したボス・自分の保存キャラ）。"" はおまかせ
let cpuPick = "";
const cpuThumbs = new Map<string, string>();
function cpuThumb(id: string, strokesOf: () => Stroke[]) {
  if (!cpuThumbs.has(id)) cpuThumbs.set(id, thumbnail(strokesOf()));
  return cpuThumbs.get(id)!;
}
const cpuUnlocked = (c: CpuChar) => !c.bossStage || !!loadStory().cleared[c.bossStage];
function refreshCpuOptions() {
  const grid = document.getElementById("cpuGrid")!;
  grid.innerHTML = "";
  const saved = loadRoster();
  if (cpuPick.startsWith("saved:") && !saved.some((c) => `saved:${c.id}` === cpuPick)) cpuPick = "";
  const card = (id: string, name: string, img: string | null, locked = false) => {
    const b = document.createElement("button");
    b.type = "button";
    b.classList.toggle("on", id === cpuPick);
    b.disabled = locked;
    const pic = img ? Object.assign(document.createElement("img"), { src: img, alt: "" }) : Object.assign(document.createElement("b"), { className: "dice", textContent: "🎲" });
    const nm = document.createElement("span");
    nm.textContent = locked ? "？？？" : name;
    b.append(pic, nm);
    b.addEventListener("click", () => { cpuPick = id; refreshCpuOptions(); });
    return b;
  };
  const section = (title: string) => {
    const h = document.createElement("div");
    h.className = "cgroup";
    h.textContent = title;
    const g = document.createElement("div");
    g.className = "cgrid";
    grid.append(h, g);
    return g;
  };
  section("おまかせ").appendChild(card("", "おまかせ", null));
  for (const group of CPU_GROUPS) {
    const list = CPU_CHARS.filter((c) => c.group === group);
    if (!list.length) continue;
    const g = section(group === "ボス" ? "ボス（ストーリーで たおすと えらべる）" : group);
    for (const c of list) g.appendChild(card(c.id, c.name, cpuThumb(c.id, c.strokes), !cpuUnlocked(c)));
  }
  if (saved.length) {
    const g = section("じぶんの キャラ");
    for (const c of saved) g.appendChild(card(`saved:${c.id}`, c.name, c.thumb ?? null));
  }
  // 選んだ相手の紹介
  const pick = document.getElementById("cpuPick")!;
  pick.innerHTML = "";
  const c = cpuCharById(cpuPick);
  const sv = saved.find((x) => `saved:${x.id}` === cpuPick);
  const pic = c ? Object.assign(document.createElement("img"), { src: cpuThumb(c.id, c.strokes), alt: "" })
    : sv?.thumb ? Object.assign(document.createElement("img"), { src: sv.thumb, alt: "" })
    : Object.assign(document.createElement("span"), { className: "dice", textContent: "🎲" });
  const nm = document.createElement("b");
  const sub = document.createElement("small");
  if (c) { nm.textContent = c.name; sub.textContent = `${c.intro}（${KID_PERSONA[c.personality][0]} ${KID_PERSONA[c.personality][1]}・${c.parts.map((k) => kindIcon(k)).join("")}）`; }
  else if (sv) { nm.textContent = sv.name; sub.textContent = "じぶんで つくった キャラ"; }
  else { nm.textContent = "おまかせ"; sub.textContent = "だれが でてくるかは おたのしみ"; }
  pick.append(pic, nm, sub);
}

// CPU キャラを戦闘用に組み立てる（パーツは C 相当で、キャラごとに毎回同じ数値。強化は自分と同じポイント数を好みの枝に）
function buildCpuChar(c: CpuChar) {
  const b = buildCharacter(c.name, c.strokes(), [], DEFAULT_PARAMS);
  const parts = c.parts.map((k, i) => makePart(k, "C", seededRnd(hashStr(`${c.id}#${i}`)), `${c.id}#${i}`));
  applyData(b, c, parts, boostOf(autoTree(totalPoints(loadProfile()), c.prefer)));
  return b;
}

// CPU の必殺技: C 相当のパーツをランダムに予算内で組む
function randomParts(type: "ranged" | "melee"): Part[] {
  const out: Part[] = [];
  const kinds = ALL_KINDS.filter((k) => { const t = kindInfo(k).type; return t === "both" || t === type; }).sort(() => Math.random() - 0.5);
  for (const k of kinds) {
    const p = makePart(k, "C", Math.random);
    if (equipCosts([...out, p]).reduce((a, c) => a + c, 0) <= SPECIAL_BUDGET) out.push(p);
  }
  return out;
}
const PERS_KEYS = Object.keys(PERSONAS) as Personality[];

// parts: 必殺パーツ（予算内で型に合うものが効く）。boost: スキルツリーの強化（自分のツリー / 敵用のツリー）
function applyData(build: ReturnType<typeof buildCharacter>, c: { personality: Personality; specialType: "ranged" | "melee" }, parts: Part[], boost: Partial<Boost>) {
  const sp = buildSpecial(withinBudget(parts, c.specialType), c.specialType);
  build.cfg.boost = sp.chargeDelta ? sumBoost([boost, { chargeNeed: sp.chargeDelta }]) : boost;
  build.cfg.personality = c.personality;
  build.cfg.specialType = c.specialType;
  build.cfg.special = sp.special;
  build.cfg.melee = sp.melee;
  build.cfg.specialMod = sp.mod;
}

// 自分のキャラ: "" = 編集中のキャラ（絵が無ければ棒人間）/ "saved:id" = 保存したキャラ
// 自分の強化はプレイヤー共通のスキルツリー（どのキャラで戦っても同じ）
// らくがき才能は、戦うキャラの絵の形に合う時だけ効く
const shapeFlags = (b: ReturnType<typeof buildCharacter>): ShapeFlags => ({ hasFeet: b.cfg.hasFeet, hasHands: b.cfg.hasHands, hits: b.cfg.traits?.hits ?? 1, reach: b.cfg.reach });
const myBoost = (b: ReturnType<typeof buildCharacter>) => boostOf(loadProfile().nodes, shapeFlags(b));

function buildPlayer(choice: string) {
  const saved = choice.startsWith("saved:") ? loadRoster().find((c) => c.id === choice.slice(6)) : undefined;
  if (saved) {
    const b = buildCharacter(saved.name, saved.strokes, [], params, saved.marks);
    applyData(b, saved, partsById(loadoutOf(saved, saved.specialType)), myBoost(b));
    return b;
  }
  const mine = strokes.length ? strokes : SAMPLES["棒人間"]();
  const b = buildCharacter(editor.name || "あなた", mine, [], params, strokes.length ? marks : []);
  applyData(b, editor, partsById(loadoutOf(editor, editor.specialType)), myBoost(b));
  return b;
}

const sfx = new Sfx();
document.getElementById("startBattle")!.addEventListener("click", () => {
  sfx.unlock(); // 効果音はボタン操作の中でしか有効にできない
  const player = buildPlayer("");

  let v = cpuPick;
  if (!v) { const pool = CPU_CHARS.filter(cpuUnlocked); v = pool[Math.floor(Math.random() * pool.length)].id; }
  let cpu: ReturnType<typeof buildCharacter>;
  let cpuLine: string | undefined;
  const saved = v.startsWith("saved:") ? loadRoster().find((c) => `saved:${c.id}` === v) : undefined;
  if (saved) {
    cpu = buildCharacter(saved.name, saved.strokes, [], params, saved.marks);
    applyData(cpu, saved, partsById(loadoutOf(saved, saved.specialType)), myBoost(cpu)); // 自分の保存キャラ同士 → 同じ強化
  } else {
    const c = cpuCharById(v)!;
    cpu = buildCpuChar(c);
    cpuLine = c.catchphrase;
  }
  runBattle({
    player,
    cpu,
    spectate: (document.getElementById("spectate") as HTMLInputElement).checked,
    seed: (Math.random() * 0xffffffff) >>> 0,
    sfx,
    cpuLine,
  });
});

// --- 画面の移動（メイン ⇄ 各画面）。端末やブラウザの「戻る」でも1つ前に戻る ---
type Screen = "home" | "story" | "make" | "free" | "transfer" | "tree" | "parts" | "online";
const SCREEN_TITLES: Record<Screen, string> = { home: "", story: "📖 ストーリー", make: "✏️ キャラを つくる", free: "⚔️ じゆうバトル", transfer: "📦 ひきつぎ", tree: "🌳 スキルツリー", parts: "🧩 ひっさつパーツ", online: "🌐 オンライン" };
const onlineEl = document.getElementById("onlineScreen")!;
const partsEl = document.getElementById("partsScreen")!;
const treeEl = document.getElementById("treeScreen")!;
const homeEl = document.getElementById("home")!;
const storyEl = document.getElementById("storyScreen")!;
const transferEl = document.getElementById("transferScreen")!;
const workspaceEl = document.getElementById("workspace")!;
const topbar = document.getElementById("topbar")!;
const screenTitle = document.getElementById("screenTitle")!;
const makeTabs = document.getElementById("makeTabs")!;
let screen: Screen = "home";
const attract = new AttractHeader(document.getElementById("heroView")!, document.getElementById("heroLabel")!);
let pushed = 0; // 自分で積んだ履歴の数（0 なら「戻る」はメインへ）
let battleHandle: { close: () => void } | null = null;

function show(s: Screen) {
  screen = s;
  homeEl.hidden = s !== "home";
  storyEl.hidden = s !== "story";
  transferEl.hidden = s !== "transfer";
  treeEl.hidden = s !== "tree";
  partsEl.hidden = s !== "parts";
  onlineEl.hidden = s !== "online";
  workspaceEl.hidden = s !== "make" && s !== "free";
  topbar.hidden = s === "home";
  screenTitle.textContent = SCREEN_TITLES[s];
  makeTabs.hidden = s !== "make";
  if (s !== "make") stopPreview();
  if (s === "home") attract.start(); else attract.stop();
  if (s === "home") renderProfile();
  else if (s === "story") renderStory();
  else if (s === "tree") renderTree();
  else if (s === "parts") renderParts();
  else if (s === "online") onlineScreen.open();
  else if (s === "make") setView(view === "battle" ? "draw" : view);
  else if (s === "free") setView("battle");
  window.scrollTo(0, 0);
}
function go(s: Screen) {
  try { history.pushState({ screen: s }, ""); pushed++; } catch { /* 履歴が使えない環境でも画面は切り替える */ }
  show(s);
}
window.addEventListener("popstate", (e) => {
  pushed = Math.max(0, pushed - 1);
  if (battleHandle) {
    // 戦闘中に「戻る」→ 戦闘を閉じる（閉じた後の画面は onExit が出す）
    const h = battleHandle;
    battleHandle = null;
    h.close();
    return;
  }
  show(((e.state as { screen?: Screen } | null)?.screen) ?? "home");
});
document.getElementById("backBtn")!.addEventListener("click", () => {
  if (pushed > 0) history.back();
  else show("home");
});
document.querySelectorAll<HTMLButtonElement>("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go as Screen)));

// 戦闘も履歴に1つ積む（「戻る」で戦闘を閉じられるように）
function runBattle(o: Omit<Parameters<typeof startBattle>[0], "onExit">) {
  try { history.pushState({ screen, battle: true }, ""); pushed++; } catch { /* 無視 */ }
  battleHandle = startBattle({
    ...o,
    onExit: () => {
      if (battleHandle) {
        battleHandle = null;
        if (pushed > 0) { history.back(); return; } // popstate で今の画面を出し直す
      }
      show(screen);
    },
  });
}

// --- メイン画面: レベルと経験値 ---
function renderProfile() {
  const p = loadProfile();
  document.getElementById("pLevel")!.textContent = String(p.level);
  const need = expToNext(p.level);
  const max = p.level >= LEVEL_CAP;
  (document.getElementById("pExpBar") as HTMLElement).style.width = max ? "100%" : `${((100 * p.exp) / need).toFixed(1)}%`;
  document.getElementById("pExp")!.textContent = max ? "最大レベル" : `経験値 ${p.exp} / ${need}（次のレベルまで ${need - p.exp}）`;
  document.getElementById("pPoints")!.textContent = String(p.points);
  const usable = Math.min(p.points, TREE_CAP - spentOf(p.nodes));
  document.getElementById("treeHint")!.textContent = usable > 0 ? `ポイント ${usable} を使えます` : spentOf(p.nodes) >= TREE_CAP ? "上限まで育った！" : "ポイントで強くなる";
}

// --- じまんの文（拡散用）: ストーリーの進み具合とステータスから作って、コピー／共有 ---
const shareBox = document.getElementById("shareBox")!;
const shareTa = document.getElementById("shareText") as HTMLTextAreaElement;
const shareMsg = document.getElementById("shareMsg")!;
const shareSend = document.getElementById("shareSend") as HTMLButtonElement;
shareSend.hidden = typeof navigator.share !== "function";
function makeShareText(): string {
  const p = loadProfile();
  const parts = loadInventory().parts;
  const best = parts.reduce<Part | null>((a, b) => (!a || rarityIndex(b.rarity) > rarityIndex(a.rarity) ? b : a), null);
  return shareText({
    level: p.level, spent: spentOf(p.nodes), cap: TREE_CAP, titles: masteredBranches(p.nodes).map((b) => b.title),
    cleared: loadStory().cleared, chapters: CHAPTERS, partCount: parts.length,
    bestPart: best ? `${best.rarity} ${kindIcon(best.kind)}${kindInfo(best.kind).name}` : undefined,
    charName: strokes.length && editor.name ? editor.name : undefined,
  });
}
const shareCopyBtn = document.getElementById("shareCopy")!;
const toastEl = document.getElementById("toast")!;
let toastTimer = 0;
// 画面の下に しばらく出る お知らせ（どの画面でも見える）
function toast(text: string) {
  toastEl.textContent = text;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toastEl.hidden = true; }, 2600);
}
function shareResult(ok: boolean, text: string) {
  shareMsg.hidden = false;
  shareMsg.className = `sharemsg${ok ? "" : " ng"}`;
  shareMsg.textContent = text;
  shareBox.classList.toggle("copied", ok);
  if (ok) {
    shareCopyBtn.textContent = "✅ コピーしたよ！";
    setTimeout(() => { shareCopyBtn.textContent = "📋 コピー"; }, 2600);
  }
  toast(text);
}
document.getElementById("shareBtn")!.addEventListener("click", () => {
  shareBox.hidden = !shareBox.hidden;
  if (!shareBox.hidden) {
    try { shareTa.value = makeShareText(); } catch (e) { shareTa.value = `文を つくれなかったよ（${(e as Error).message}）`; }
    shareMsg.hidden = true;
    shareBox.classList.remove("copied");
    shareBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});
shareCopyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareTa.value);
  } catch {
    // コピーの許可が無いブラウザ: 文を選んで 昔のやり方でコピー
    shareTa.select();
    if (!document.execCommand("copy")) { shareResult(false, "コピー できなかったよ。文を ながおしして「コピー」を えらんでね"); return; }
  }
  shareResult(true, "📋 クリップボードに コピーしたよ！ SNS に はりつけてね");
});
shareSend.addEventListener("click", () => { navigator.share({ text: shareTa.value }).catch(() => { /* やめた時など */ }); });

// --- スキルツリー: 中心から7本の枝。丸をタップ → 説明 → 取得 ---
const SVG_NS = "http://www.w3.org/2000/svg";
const treeSvg = document.getElementById("treeSvg") as unknown as SVGSVGElement;
const nodeInfo = document.getElementById("nodeInfo")!;
let selectedNode: string | null = null;

// 強化の合計を読める文にする
const pct = (v: number) => `${v > 0 ? "+" : "−"}${Math.round(Math.abs(v) * 100)}%`;
const num = (v: number) => `${v > 0 ? "+" : "−"}${Math.abs(v)}`;
const BOOST_TEXT: [keyof Boost, (v: number) => string][] = [
  ["dealt", (v) => `与えるダメージ ${pct(v)}`],
  ["taken", (v) => `受けるダメージ ${pct(-v)}`],
  ["hp", (v) => `体力 ${num(v)}`],
  ["stamina", (v) => `最大スタミナ ${num(v)}`],
  ["regen", (v) => `スタミナ回復 ${pct(v)}`],
  ["speed", (v) => `移動の速さ ${pct(v)}`],
  ["special", (v) => `必殺の威力 ${pct(v)}`],
  ["chargeNeed", (v) => `必殺に必要な命中 ${num(v)}回`],
  ["punch", (v) => `通常攻撃の威力 ${pct(v)}`],
  ["windup", (v) => `通常攻撃の構え ${num(v)}コマ（遅くなる）`],
  ["dodgeCost", (v) => `回避のスタミナ ${num(v)}`],
  ["guardCut", (v) => `防御で減らす割合 ${pct(v)}`],
  ["guardMove", (v) => `防御中の移動 ${pct(v / 0.5)}`],
  ["knock", (v) => `吹き飛ばされやすさ ${pct(v)}`],
  ["guardCharge", (v) => `防御成功で溜まるゲージ ${num(v)}`],
  ["guardDrain", (v) => `防御中のスタミナ消費 ${pct(v)}`],
];
function boostLines(b: Partial<Boost>): string[] {
  return BOOST_TEXT.filter(([k]) => Math.abs(b[k] ?? 0) > 1e-9).map(([k, f]) => f(+(b[k]!).toFixed(4)));
}

function renderTree() {
  const p = loadProfile();
  document.getElementById("tPoints")!.textContent = String(p.points);
  document.getElementById("tSpent")!.textContent = `使用 ${spentOf(p.nodes)} ／ 上限 ${TREE_CAP}（全部で ${TREE_TOTAL}・ぜんぶは取れないよ）`;
  treeSvg.innerHTML = "";
  const el = (tag: string, attrs: Record<string, string | number>, parent: Element = treeSvg) => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    parent.appendChild(e);
    return e;
  };
  const R = [0, 50, 76, 104, 130, 158, 184, 214]; // 段ごとの中心からの距離
  const links = el("g", {});
  const nodes = el("g", {});
  const angOf = (k: number) => -Math.PI / 2 + (k * Math.PI * 2) / BRANCHES.length;
  const pos = new Map<string, [number, number]>();
  BRANCHES.forEach((br, k) => {
    const a = angOf(k);
    const at = (r: number, side = 0): [number, number] => [Math.cos(a) * r - Math.sin(a) * side, Math.sin(a) * r + Math.cos(a) * side];
    for (let t = 1; t <= 7; t++) {
      if (t === 5) { pos.set(nodeId(br.key, "5a"), at(R[5], -15)); pos.set(nodeId(br.key, "5b"), at(R[5], 15)); }
      else pos.set(nodeId(br.key, t), at(R[t]));
    }
    const [lx, ly] = at(R[7] + 30);
    el("text", { x: lx, y: ly, style: `fill:${br.color}` }, nodes).textContent = br.label;
  });
  // 組み合わせ技は、となり合う2本の枝の★の間
  for (const n of bridges()) {
    const [a, b] = n.between!;
    const ka = BRANCHES.findIndex((x) => x.key === a), kb = BRANCHES.findIndex((x) => x.key === b);
    let ang = (angOf(ka) + angOf(kb)) / 2;
    if (Math.abs(angOf(ka) - angOf(kb)) > Math.PI) ang += Math.PI; // 輪の最後と最初
    pos.set(n.id, [Math.cos(ang) * 128, Math.sin(ang) * 128]);
  }
  const colorOf = (id: string) => BRANCHES.find((b) => b.key === nodeById(id)?.branch)?.color ?? "#f08c00";
  // つながりの線
  for (const [id, [x, y]] of pos) {
    const n = nodeById(id)!;
    const from = [...n.requires, ...(n.requiresAny ?? [])];
    const owned = p.nodes.includes(id);
    if (!from.length) {
      const l = el("line", { x1: 0, y1: 0, x2: x, y2: y, class: "lnk" }, links);
      if (owned) l.setAttribute("style", `stroke:${colorOf(id)}`);
      continue;
    }
    for (const f of from) {
      const q = pos.get(f);
      if (!q) continue;
      const l = el("line", { x1: q[0], y1: q[1], x2: x, y2: y, class: n.kind === "bridge" ? "lnk bridge" : "lnk" }, links);
      if (owned && p.nodes.includes(f)) l.setAttribute("style", `stroke:${colorOf(id)}`);
    }
  }
  // ノード
  for (const [id, [x, y]] of pos) {
    const n = nodeById(id)!;
    const owned = p.nodes.includes(id);
    const can = canTake(id, p.nodes);
    const col = colorOf(id);
    const r = n.kind === "keystone" ? 17 : n.kind === "notable" || n.kind === "bridge" ? 13 : n.kind === "fork" ? 11 : 9;
    const locked = n.kind === "fork" && n.excludes && p.nodes.includes(n.excludes);
    const shape = n.kind === "bridge"
      ? el("rect", { x: x - r, y: y - r, width: r * 2, height: r * 2, rx: 4, transform: `rotate(45 ${x} ${y})`, class: `nd ${owned ? "own" : can ? "can" : "lock"}${selectedNode === id ? " sel" : ""}` }, nodes)
      : el("circle", { cx: x, cy: y, r, class: `nd ${owned ? "own" : can ? "can" : "lock"}${selectedNode === id ? " sel" : ""}${locked ? " off" : ""}` }, nodes);
    if (owned) shape.setAttribute("style", `fill:${col};stroke:${col}`);
    else if (can) shape.setAttribute("style", `stroke:${col}`);
    const mark = n.kind === "keystone" ? "◆" : n.kind === "notable" ? "★" : n.kind === "bridge" ? "✦" : n.kind === "fork" ? "⑂" : "";
    if (mark) el("text", { x, y, class: `mk${owned ? " on" : ""}` }, nodes).textContent = mark;
    const hit = el("circle", { cx: x, cy: y, r: r + 4, class: "hit", role: "button", tabindex: 0, "aria-label": `${n.name}（${n.desc}）${owned ? "取得済み" : ""}` }, nodes);
    const pick = () => { selectedNode = id; renderTree(); };
    hit.addEventListener("click", pick);
    hit.addEventListener("keydown", (e) => { if ((e as KeyboardEvent).key === "Enter") pick(); });
  }
  el("circle", { cx: 0, cy: 0, r: 26, class: "core" }, nodes);
  el("text", { x: 0, y: 0, class: "core-t" }, nodes).textContent = `Lv${p.level}`;

  // らくがき才能（絵の形に合うキャラだけに効く）
  const tl = document.getElementById("talents")!;
  tl.innerHTML = "";
  for (const n of talents()) {
    const owned = p.nodes.includes(n.id);
    const b = document.createElement("button");
    b.type = "button";
    b.className = `talent${owned ? " own" : ""}${selectedNode === n.id ? " sel" : ""}`;
    b.innerHTML = `<b></b><small></small>`;
    b.querySelector("b")!.textContent = `${owned ? "✔ " : ""}${n.name}`;
    b.querySelector("small")!.textContent = n.desc.split(":")[0];
    b.addEventListener("click", () => { selectedNode = n.id; renderTree(); });
    tl.appendChild(b);
  }

  // 選んだノードの説明
  nodeInfo.innerHTML = "";
  if (selectedNode) {
    const n = nodeById(selectedNode)!;
    const owned = p.nodes.includes(n.id);
    const can = canTake(n.id, p.nodes);
    const kind = { small: "", notable: "★ 山場", fork: "⑂ 分かれ道（どちらか1つ）", keystone: "◆ 大技", bridge: "✦ 組み合わせ技", talent: "🎨 らくがき才能" }[n.kind];
    const h = document.createElement("div");
    h.innerHTML = `<b></b>　<span class="cost"></span><div></div>`;
    h.querySelector("b")!.textContent = n.name;
    h.querySelector(".cost")!.textContent = `${n.cost} ポイント${kind ? `・${kind}` : ""}`;
    h.querySelector("div")!.textContent = n.desc;
    nodeInfo.appendChild(h);
    const row = document.createElement("div");
    row.className = "row";
    if (owned) row.textContent = "取得済み";
    else if (n.excludes && p.nodes.includes(n.excludes)) row.textContent = "もう片方を えらんだよ（振り直しで えらびなおせる）";
    else if (!can) row.textContent = n.kind === "bridge" ? "となりの枝の ★を 両方 とると ひらくよ" : "1つ内側を先に取ってください";
    else if (spentOf(p.nodes) + n.cost > TREE_CAP) row.textContent = `上限（${TREE_CAP}）を こえるので 取れません。振り直して ほかの組み合わせも ためしてね`;
    else {
      const btn = document.createElement("button");
      btn.className = "primary inline";
      btn.textContent = p.points >= n.cost ? "取得する" : `ポイントが足りません（あと ${n.cost - p.points}）`;
      btn.disabled = p.points < n.cost;
      btn.addEventListener("click", () => { if (takeNode(n.id)) renderTree(); });
      row.appendChild(btn);
    }
    nodeInfo.appendChild(row);
  } else {
    nodeInfo.textContent = "丸をタップすると説明が出ます。中心から外へ順に取れます。★は山場、⑂は2つから1つえらぶ分かれ道、◆は強いけど損もある大技、✦は となりの枝の★を両方とると ひらく組み合わせ技。振り直しは無料なので、全部 見て ためしてね。";
  }

  // 称号（枝を全部とる）
  const titles = masteredBranches(p.nodes);
  document.getElementById("treeTitles")!.textContent = titles.length ? `🏅 称号: ${titles.map((b) => b.title).join("・")}` : "🏅 枝を ぜんぶ とると 称号が もらえるよ";

  const total = document.getElementById("treeTotal")!;
  total.innerHTML = "";
  const lines = boostLines(boostOf(p.nodes));
  for (const t of lines.length ? lines : ["まだ何も取っていません（ストーリーで勝つとポイントがもらえます）"]) {
    const li = document.createElement("li");
    li.textContent = t;
    total.appendChild(li);
  }
  for (const n of talents().filter((x) => p.nodes.includes(x.id))) {
    const li = document.createElement("li");
    li.textContent = `🎨 ${n.desc}`;
    total.appendChild(li);
  }
}
const resetBtn = document.getElementById("treeReset")!;
let resetArmed = 0;
resetBtn.addEventListener("click", () => {
  if (!loadProfile().nodes.length) return;
  if (!resetArmed) {
    resetBtn.textContent = "もう一度で全部戻す";
    resetArmed = window.setTimeout(() => { resetArmed = 0; resetBtn.textContent = "振り直し"; }, 2500);
    return;
  }
  clearTimeout(resetArmed);
  resetArmed = 0;
  resetBtn.textContent = "振り直し";
  resetTree();
  selectedNode = null;
  renderTree();
});

// --- 必殺パーツ（持ち物）: 一覧・ならびかえ・キャラに付け外し・鍵・分解・振り直し・合成 ---
let partFilter: "all" | "ranged" | "melee" | "both" = "all";
let selectedPart: string | null = null;
const PART_SORT_KEY = "doodle-arena:partSort";
const partSortSel = document.getElementById("partSort") as HTMLSelectElement;
try { partSortSel.value = localStorage.getItem(PART_SORT_KEY) || "kind"; } catch { /* 無視 */ }
partSortSel.addEventListener("change", () => { try { localStorage.setItem(PART_SORT_KEY, partSortSel.value); } catch { /* 無視 */ } renderParts(); });
const equipCharSel = document.getElementById("equipChar") as HTMLSelectElement;
equipCharSel.addEventListener("change", () => renderParts());
document.querySelectorAll<HTMLButtonElement>("[data-pf]").forEach((b) => b.addEventListener("click", () => {
  partFilter = b.dataset.pf as typeof partFilter;
  document.querySelectorAll("[data-pf]").forEach((o) => o.classList.toggle("on", o === b));
  renderParts();
}));
// どれかのキャラ（編集中・保存済み）が付けているパーツ
const equippedIds = () => new Set([editor, ...loadRoster()].flatMap((c) => [...c.partsR, ...c.partsM]));

// 付けかえるキャラ: "" = 編集中、"saved:id" = 保存したキャラ
type CharRef = string;
function charOf(ref: CharRef): (Pick<CharacterData, "name" | "partsR" | "partsM">) | undefined {
  if (!ref) return { name: editor.name || "編集中のキャラ", partsR: editor.partsR, partsM: editor.partsM };
  return loadRoster().find((c) => `saved:${c.id}` === ref);
}
function setCharLoadout(ref: CharRef, type: "ranged" | "melee", ids: string[]) {
  const key = type === "ranged" ? "partsR" : "partsM";
  const id = ref.startsWith("saved:") ? ref.slice(6) : null;
  if (id) writeRoster(loadRoster().map((c) => (c.id === id ? { ...c, [key]: ids } : c)));
  // 編集中のキャラ（保存したキャラを呼び出し中なら そちらも同じに）
  if (!id || id === editId) { setLoadout(type, ids); persistDraft(); renderEffects(); }
}
function refreshEquipChars() {
  const keep = equipCharSel.value;
  equipCharSel.innerHTML = "";
  equipCharSel.add(new Option(`編集中のキャラ（${editor.name || "名無し"}）`, ""));
  for (const c of loadRoster()) if (c.id !== editId) equipCharSel.add(new Option(c.name, `saved:${c.id}`));
  equipCharSel.value = [...equipCharSel.options].some((o) => o.value === keep) ? keep : "";
}

const TYPE_ORDER = { ranged: 0, melee: 1, both: 2 };
function sortParts(list: Part[], order: string, all: Part[]): Part[] {
  const name = (p: Part) => kindInfo(p.kind).name;
  const byRare = (a: Part, b: Part) => rarityIndex(b.rarity) - rarityIndex(a.rarity) || b.roll - a.roll;
  if (order === "rare") return list.sort((a, b) => byRare(a, b) || name(a).localeCompare(name(b)));
  if (order === "cost") return list.sort((a, b) => a.cost - b.cost || byRare(a, b));
  if (order === "new") return list.sort((a, b) => all.indexOf(b) - all.indexOf(a));
  return list.sort((a, b) => TYPE_ORDER[kindInfo(a.kind).type] - TYPE_ORDER[kindInfo(b.kind).type] || name(a).localeCompare(name(b)) || byRare(a, b));
}
const partNote = (p: Part, eq: Set<string>) => [p.locked ? "🔒" : "", eq.has(p.id) ? "装備中" : ""].filter(Boolean).join("・");

function renderParts() {
  refreshEquipChars();
  const inv = loadInventory();
  document.getElementById("invCount")!.textContent = String(inv.parts.length);
  document.getElementById("invCap")!.textContent = String(INVENTORY_CAP);
  document.getElementById("shards")!.textContent = String(inv.shards);
  const eq = equippedIds();
  const plans = planCombines(inv.parts, eq);
  const bulk = document.getElementById("bulkCombine") as HTMLButtonElement;
  bulk.disabled = !plans.length;
  bulk.textContent = plans.length ? `🔨 まとめて ごうせい（${plans.length}）` : "🔨 まとめて ごうせい";
  bulk.title = plans.length ? "" : "同じ しゅるい・同じ レア度が 5こ（材料4こ＋ベース）そろうと できるよ";
  const listEl = document.getElementById("partList")!;
  listEl.innerHTML = "";
  const shown = sortParts(inv.parts.filter((p) => partFilter === "all" || kindInfo(p.kind).type === partFilter), partSortSel.value, inv.parts);
  if (!shown.length) listEl.textContent = "ありません。ストーリーで勝つと手に入ります。";
  let lastType = "";
  for (const p of shown) {
    // しゅるい ごと: 🎯/👊/🔁 の見出し
    const t = kindInfo(p.kind).type;
    if (partSortSel.value === "kind" && t !== lastType) {
      lastType = t;
      const h = document.createElement("div");
      h.className = "kidhint";
      h.textContent = t === "ranged" ? "🎯 とおくの ひっさつ" : t === "melee" ? "👊 ちかくの ひっさつ" : "🔁 どっちにも つかえる";
      listEl.appendChild(h);
    }
    const b = document.createElement("button");
    b.type = "button";
    b.classList.toggle("sel", p.id === selectedPart);
    b.appendChild(partChip(p, p.cost, partNote(p, eq)));
    b.addEventListener("click", () => { selectedPart = p.id; renderParts(); });
    listEl.appendChild(b);
  }

  // 選んだパーツの操作
  const info = document.getElementById("partInfo")!;
  info.innerHTML = "";
  const p = inv.parts.find((x) => x.id === selectedPart);
  if (!p) { info.textContent = "パーツを タップすると、キャラに つける・はずす・🔒鍵・振り直し・分解・合成が できます。"; return; }
  info.appendChild(partChip(p, p.cost, partNote(p, eq)));
  const desc = document.createElement("div");
  desc.className = "note";
  desc.textContent = kindInfo(p.kind).desc;
  info.appendChild(desc);

  // キャラに つける・はずす
  const ref = equipCharSel.value;
  const ch = charOf(ref);
  const users = [editor, ...loadRoster().filter((c) => c.id !== editId)].flatMap((c) => [
    ...(c.partsR.includes(p.id) ? [`${c.name || "編集中"}🎯`] : []), ...(c.partsM.includes(p.id) ? [`${c.name || "編集中"}👊`] : []),
  ]);
  if (ch) {
    const er = document.createElement("div");
    er.className = "row";
    for (const t of ["ranged", "melee"] as const) {
      if (!fitsType(p, t)) continue;
      const ids = t === "ranged" ? ch.partsR : ch.partsM;
      const on = ids.includes(p.id);
      const active = withinBudget(partsById(ids), t);
      const used = equipCosts(active).reduce((a, c) => a + c, 0);
      const add = equipCosts([...active, p]).at(-1)!;
      const b = document.createElement("button");
      b.className = on ? "" : "primary inline";
      const icon = t === "ranged" ? "🎯" : "👊";
      b.textContent = on ? `${icon} はずす（⚡${used}/${SPECIAL_BUDGET}）` : used + add > SPECIAL_BUDGET ? `${icon} ⚡が たりない（${used}+${add}/${SPECIAL_BUDGET}）` : `${icon} つける（⚡${used}+${add}/${SPECIAL_BUDGET}）`;
      b.disabled = !on && used + add > SPECIAL_BUDGET;
      b.addEventListener("click", () => { setCharLoadout(ref, t, on ? ids.filter((x) => x !== p.id) : [...ids, p.id]); renderParts(); });
      er.appendChild(b);
    }
    const who = document.createElement("div");
    who.className = "note";
    who.textContent = `「${ch.name || "名無し"}」に つける・はずす（上の「つけかえる キャラ」で かえられる）${users.length ? `　いま つけている: ${users.join("・")}` : ""}`;
    info.append(who, er);
  }

  const row = document.createElement("div");
  row.className = "row";
  const msg = document.createElement("div");
  msg.className = "note";

  const lk = document.createElement("button");
  lk.textContent = p.locked ? "🔓 鍵を はずす" : "🔒 鍵を かける";
  lk.addEventListener("click", () => { toggleLock(p.id); renderParts(); });

  const rr = document.createElement("button");
  rr.textContent = `振り直し（かけら ${rerollCost(p.rarity)}）`;
  rr.disabled = inv.shards < rerollCost(p.rarity);
  rr.addEventListener("click", () => { if (reroll(p.id)) renderParts(); });

  const dm = document.createElement("button");
  dm.textContent = `分解（かけら +${RARITY_INFO[p.rarity].shards}）`;
  dm.disabled = eq.has(p.id) || !!p.locked;
  let armed = 0;
  dm.addEventListener("click", () => {
    if (!armed) { dm.textContent = "もう一度で分解"; armed = window.setTimeout(() => { armed = 0; renderParts(); }, 2500); return; }
    clearTimeout(armed);
    dismantle(p.id);
    selectedPart = null;
    renderParts();
  });

  const key = `${p.kind}|${p.rarity}`;
  const mats = inv.parts.filter((x) => x.kind === p.kind && x.rarity === p.rarity && x.id !== p.id && canBeMaterial(x, eq)).length;
  const cb = document.createElement("button");
  cb.textContent = p.rarity === "S" ? "合成（S は最高）" : `🔨 これを ベースに 合成（材料 ${mats}/${COMBINE_COUNT - 1}）`;
  cb.disabled = p.rarity === "S" || !!p.locked || mats < COMBINE_COUNT - 1;
  cb.addEventListener("click", () => openCombine(key, { [key]: [p.id] }));
  row.append(lk, rr, dm, cb);
  info.append(row, msg);
  const notes: string[] = [];
  if (p.locked) notes.push("🔒 鍵つき: 分解・合成（材料にも ベースにも）しません。");
  if (eq.has(p.id)) notes.push("装備中: 分解・合成の材料には 使いません（ベースには できます）。");
  msg.textContent = notes.join("");
}

// --- 合成の確認（まとめて・1組）: 何がなくなり何ができるかを見せ、ベースを えらび直せる ---
let combineModal: HTMLElement | null = null;
function openCombine(onlyKey?: string, chosen: Record<string, string[]> = {}) {
  combineModal?.remove();
  const off = new Set<number>(); // やめておく組（番号）
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  combineModal = modal;
  const close = () => { modal.remove(); combineModal = null; };
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  const box = document.createElement("div");
  box.className = "modal-box";
  modal.appendChild(box);
  document.body.appendChild(modal);
  const draw = () => {
    const inv = loadInventory();
    const eq = equippedIds();
    const byId = new Map(inv.parts.map((p) => [p.id, p]));
    const plans = planCombines(inv.parts, eq, chosen).filter((pl) => !onlyKey || `${pl.kind}|${pl.rarity}` === onlyKey);
    box.innerHTML = "";
    const h = document.createElement("div");
    h.className = "kidhint";
    h.textContent = onlyKey ? "🔨 合成の かくにん" : `🔨 まとめて ごうせい（${plans.length}組）`;
    const warn = document.createElement("div");
    warn.className = "warn";
    warn.textContent = "⚠ ベース いがいの 材料4こは なくなるよ。ベースは 1段上の レア度に なって 数値が 引き直しに なる。装備中と 🔒の パーツは 材料に しないよ。おなじ パーツを かさねて つけている時は、ベースと 材料を よく みてね。";
    box.append(h, warn);
    if (!plans.length) { const e = document.createElement("div"); e.className = "note"; e.textContent = "合成できる 組が ないよ。"; box.appendChild(e); }
    plans.forEach((pl, n) => {
      const key = `${pl.kind}|${pl.rarity}`;
      const nth = plans.slice(0, n).filter((x) => `${x.kind}|${x.rarity}` === key).length;
      const base = byId.get(pl.baseId)!;
      const div = document.createElement("div");
      div.className = `cplan${off.has(n) ? " off" : ""}`;
      const head = document.createElement("label");
      head.className = "head";
      const cbx = document.createElement("input");
      cbx.type = "checkbox";
      cbx.checked = !off.has(n);
      cbx.addEventListener("change", () => { if (cbx.checked) off.delete(n); else off.add(n); draw(); });
      const next = RARITIES[rarityIndex(pl.rarity) + 1];
      head.append(cbx, `${kindIcon(pl.kind)} ${kindInfo(pl.kind).name}　${pl.rarity} ×${COMBINE_COUNT} → ${next}`);
      const sel = document.createElement("select");
      for (const id of pl.candidates) {
        const c = byId.get(id)!;
        const o = new Option(`ベース: 出来 ${Math.round(c.roll * 100)}%・⚡${c.cost}${c.extras.length ? `・おまけ${c.extras.length}` : ""}${eq.has(id) ? "・装備中" : ""}`, id);
        sel.add(o);
      }
      sel.value = pl.baseId;
      sel.addEventListener("change", () => { const arr = [...(chosen[key] ?? [])]; arr[nth] = sel.value; chosen[key] = arr; draw(); });
      const mats = document.createElement("div");
      mats.className = "mats";
      mats.textContent = `なくなる 材料: ${pl.materialIds.map((id) => { const m = byId.get(id)!; return `出来${Math.round(m.roll * 100)}%${m.extras.length ? `+${m.extras.length}` : ""}`; }).join("・")}`;
      div.append(head, partChip(base, base.cost, eq.has(base.id) ? "ベース・装備中" : "ベース"), sel, mats);
      box.appendChild(div);
    });
    const act = plans.filter((_, n) => !off.has(n));
    const row = document.createElement("div");
    row.className = "row";
    const ok = document.createElement("button");
    ok.className = "primary inline";
    ok.textContent = `🔨 ${act.length}組 合成する`;
    ok.disabled = !act.length;
    ok.addEventListener("click", () => {
      const eqNow = equippedIds();
      const made = act.map((pl) => combineInto(pl.baseId, pl.materialIds, eqNow)).filter((x): x is Part => !!x);
      close();
      if (made.length) { selectedPart = made[0].id; toast(`🔨 ${made.map((m) => `${m.rarity} ${kindIcon(m.kind)}`).join(" ")} が できたよ！`); }
      renderParts();
    });
    const cancel = document.createElement("button");
    cancel.textContent = "やめる";
    cancel.addEventListener("click", close);
    row.append(ok, cancel);
    box.appendChild(row);
  };
  draw();
}
document.getElementById("bulkCombine")!.addEventListener("click", () => openCombine());

// --- ストーリー ---
const storyCharSel = document.getElementById("storyChar") as HTMLSelectElement;
const chaptersEl = document.getElementById("chapters")!;
const thumbs = new Map<string, string>();
function refreshStoryChars() {
  const keep = storyCharSel.value;
  storyCharSel.innerHTML = "";
  storyCharSel.add(new Option(`編集中のキャラ（${editor.name || (strokes.length ? "名無し" : "棒人間")}）`, ""));
  for (const c of loadRoster()) storyCharSel.add(new Option(c.name, `saved:${c.id}`));
  storyCharSel.value = [...storyCharSel.options].some((o) => o.value === keep) ? keep : "";
}
function renderStory() {
  refreshStoryChars();
  const { cleared } = loadStory();
  chaptersEl.innerHTML = "";
  for (const ch of CHAPTERS) {
    const sec = document.createElement("div");
    sec.className = "chapter";
    const h = document.createElement("h2");
    h.textContent = `第${ch.no}章　${ch.title}`;
    const grid = document.createElement("div");
    grid.className = "stages";
    ch.stages.forEach((st, k) => {
      const b = document.createElement("button");
      b.className = st.boss ? "boss" : "";
      b.disabled = !isUnlocked(st, cleared);
      if (!thumbs.has(st.id)) thumbs.set(st.id, thumbnail(st.strokes()));
      const img = document.createElement("img");
      img.src = thumbs.get(st.id)!;
      img.alt = "";
      const no = document.createElement("span");
      no.className = "no";
      no.textContent = `${ch.no}-${k + 1}${st.boss ? " ボス" : ""}`;
      const t = document.createElement("span");
      t.textContent = b.disabled ? "？？？" : st.enemy;
      b.append(img, no, t);
      if (cleared[st.id]) {
        const star = document.createElement("span");
        star.className = "clear";
        star.textContent = "★";
        star.setAttribute("aria-label", "クリア済み");
        b.appendChild(star);
      }
      b.addEventListener("click", () => startStage(st));
      grid.appendChild(b);
    });
    sec.append(h, grid);
    chaptersEl.appendChild(sec);
  }
  for (const t of UPCOMING) {
    const sec = document.createElement("div");
    sec.className = "chapter locked";
    sec.innerHTML = `<h2>${t}　準備中</h2>`;
    chaptersEl.appendChild(sec);
  }
}

function rewardHtml(r: Reward, stage: Stage, drop: DropResult | null): string {
  const p = loadProfile();
  let h = `<div class="exp">経験値 +${r.exp}</div>`;
  if (r.levelsUp) h += `<div class="up">レベルアップ！ Lv ${p.level}</div>`;
  if (r.points) h += `<div>スキルポイント +${r.points}（メイン画面の「スキルツリー」で使えます）</div>`;
  if (r.firstClear) {
    const next = ALL_STAGES[ALL_STAGES.indexOf(stage) + 1];
    h += `<div>${next ? `次のステージ「${next.enemy}」が開きました` : "ここまでクリア！ 続きの章は準備中です"}</div>`;
  }
  if (drop?.got.length) h += `<div class="drop"><div>パーツを手に入れた！</div>${drop.got.map((p) => partChip(p).outerHTML).join("")}</div>`;
  if (drop?.shardsInstead) h += `<div>持ち物がいっぱいなので、かけら +${drop.shardsInstead}</div>`;
  return h;
}

function startStage(stage: Stage) {
  sfx.unlock();
  const player = buildPlayer(storyCharSel.value);
  const cpu = buildCharacter(stage.enemy, stage.strokes(), [], DEFAULT_PARAMS);
  applyData(cpu, stage, enemyParts(stage), sumBoost([boostOf(autoTree(stage.boostPoints, stage.prefer)), { hp: stage.hp ?? 0 }]));
  runBattle({
    player,
    cpu,
    spectate: false,
    seed: (Math.random() * 0xffffffff) >>> 0,
    sfx,
    cpuLevel: stage.ai,
    exitLabel: "ステージ選択へ",
    onResult: (winner) => {
      const r = applyStageResult(stage.no, stage.id, !!stage.boss, winner === 0);
      return rewardHtml(r, stage, winner === 0 ? dropParts(chapterOf(stage), !!stage.boss, Math.random, !!stage.final) : null);
    },
  });
}

// --- オンライン ---
// 使うキャラの選択肢（ストーリーと同じ: 編集中のキャラ＋保存したキャラ）
function playerChoices() {
  return [
    { value: "", label: `編集中のキャラ（${editor.name || (strokes.length ? "名無し" : "棒人間")}）` },
    ...loadRoster().map((c) => ({ value: `saved:${c.id}`, label: c.name })),
  ];
}
const onlineScreen = initOnline(onlineEl, {
  choices: playerChoices,
  buildPlayer,
  strokesOf: (choice) => {
    const saved = choice.startsWith("saved:") ? loadRoster().find((c) => c.id === choice.slice(6)) : undefined;
    if (saved) return saved.strokes.length ? { name: saved.name, strokes: saved.strokes } : null;
    return strokes.length ? { name: editor.name || "名無し", strokes } : null;
  },
  params: () => params,
  runBattle: (o) => runBattle({ ...o, sfx }),
  partChipHtml: (p) => partChip(p).outerHTML,
  unlockSound: () => sfx.unlock(),
});

// --- 引き継ぎ ---
const transferMsg = document.getElementById("transferMsg")!;
const exportArea = document.getElementById("exportCode") as HTMLTextAreaElement;
const importArea = document.getElementById("importCode") as HTMLTextAreaElement;
document.getElementById("exportBtn")!.addEventListener("click", async () => {
  try {
    exportArea.value = await exportCode();
    exportArea.hidden = false;
    document.getElementById("exportActions")!.hidden = false;
    exportArea.select();
    transferMsg.textContent = `引き継ぎコードを作りました（${exportArea.value.length.toLocaleString()} 文字）。コピーするかファイルに保存してください。`;
  } catch {
    transferMsg.textContent = "コードを作れませんでした。";
  }
});
document.getElementById("copyCode")!.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(exportArea.value);
    transferMsg.textContent = "コピーしました。";
  } catch {
    exportArea.select();
    transferMsg.textContent = "自動でコピーできませんでした。選択された文字を長押しでコピーしてください。";
  }
});
document.getElementById("downloadCode")!.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([exportArea.value], { type: "text/plain" }));
  a.download = `rakugaki-arena-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
document.getElementById("importFile")!.addEventListener("change", async (e) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  importArea.value = (await f.text()).trim();
  transferMsg.textContent = "ファイルを読み込みました。「読み込む」を押すと入れ替わります。";
});
const importBtn = document.getElementById("importBtn")!;
let importArmed = 0;
importBtn.addEventListener("click", async () => {
  if (!importArea.value.trim()) { transferMsg.textContent = "引き継ぎコードを貼り付けてください。"; return; }
  if (!importArmed) {
    importBtn.textContent = "もう一度押すと今のデータと入れ替え";
    importArmed = window.setTimeout(() => { importArmed = 0; importBtn.textContent = "読み込む"; }, 3000);
    return;
  }
  clearTimeout(importArmed);
  importArmed = 0;
  importBtn.textContent = "読み込む";
  try {
    const n = await importCode(importArea.value);
    transferMsg.textContent = `読み込みました（${n} 件）。画面を読み込み直します…`;
    setTimeout(() => location.reload(), 900);
  } catch (err) {
    transferMsg.textContent = `読み込めませんでした: ${(err as Error).message || "コードが壊れています"}`;
  }
});

requestPersist();
try { history.replaceState({ screen: "home" }, ""); } catch { /* 無視 */ }
show("home");

// 写真入りの絵: 読みこめたら 描きなおす（最初に まとめて 読んでおく）
onImagesReady(() => { committedFor = null; render(); scheduleEditBar(); });
void preloadImages([...strokes, ...loadRoster().flatMap((c) => c.strokes)]);
scheduleEditBar();

// 漢字に ふりがな（メイン画面の下のボタンで なし にできる）
installFurigana();
const furiBtn = document.getElementById("furigana")!;
furiBtn.textContent = furiganaOn() ? "あ ふりがな: あり" : "あ ふりがな: なし";
furiBtn.addEventListener("click", () => { setFurigana(!furiganaOn()); location.reload(); });
render();
