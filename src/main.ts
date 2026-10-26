import { CANVAS_SIZE, DEFAULT_PARAMS, detect, type DetectParams, type DetectResult, type Stroke } from "./detect";
import { fillIcons, kindGlyph } from "./icons";
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
import { ALL_KINDS, buildSpecial, equipCosts, extraText, fitsType, hashStr, kindIcon, kindInfo, mainText, makePart, MAX_EXTRAS, MAX_STAR, partScore, partSlot, seededRnd, SHINE_INFO, shineText, SLOT_LABEL, SPECIAL_BUDGET, starText, type Part, type PartKind } from "./items";
import { pathOf, type EffectId, type Slot } from "./sim/special";
import { TestFire } from "./testfire";
import { normalizeMelee, type MeleeEffectId } from "./sim/melee";
import { canStack, dropParts, INVENTORY_CAP, loadInventory, migrateToParts, planStacks, stackAll, stackInto, toggleLock, type DropResult } from "./inventory";
import { autoTree, boostOf, BRANCHES, bridges, canTake, masteredBranches, nodeById, nodeId, randomTree, spentOf, talents, TREE_CAP, TREE_TOTAL, type ShapeFlags } from "./tree";
import type { Personality } from "./sim/world";
import { deleteCharacter, loadDraft, loadoutOf, loadRoster, normalize, saveCharacter, saveDraft, thumbnail, writeRoster, type CharacterData } from "./roster";
import { applyStageResult, expToNext, exportCode, importCode, LEVEL_CAP, loadProfile, loadStory, requestPersist, resetTree, takeNode, totalPoints, type Reward } from "./progress";
import { CPU_CHARS, CPU_GROUPS, cpuCharById, type CpuChar } from "./cpuChars";
import { ARENA_LIST, arenaById } from "./sim/arena";
import { initOnline } from "./online/screen";
import { api } from "./online/client";
import { AttractHeader } from "./battle/attract";
import { ALL_STAGES, CHAPTERS, chapterOf, enemyParts, isUnlocked, UPCOMING, type Stage } from "./story";
import { CHALLENGES, challengeOpen, foeStages, UNLOCK_STAGE, type Challenge } from "./challenge";

const STORAGE_KEY = "doodle-arena:proto1";
// よく使う色（黒・白・灰・茶・はだ・赤・もも・だいだい・黄・黄緑・緑・水色・青・むらさき）。ほかの色は「🌈 すきな色」と「💧 スポイト」で
const COLORS = ["#222222", "#ffffff", "#868e96", "#8b5a2b", "#f5c6a0", "#e03131", "#f783ac", "#f08c00", "#f2c200", "#94d82d", "#2f9e44", "#4dabf7", "#1c7ed6", "#ae3ec9"];
const HAND_COLORS = ["#e8590c", "#f76707", "#d9480f", "#fd7e14", "#c2255c"];
const FOOT_COLORS = ["#1c7ed6", "#1971c2", "#3b5bdb", "#0c8599", "#5f3dc4"];
const TORSO_COLOR = "#9aa0a6";

type View = "draw" | "detect" | "anim" | "char" | "special" | "battle";

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
let markTool: "hand" | "foot" | "wing" | "erase" = "hand";
const MARK_WIDTH = 30;
const MARK_COLORS = { hand: "#ff7a1a", foot: "#228be6", wing: "#40c057" };
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
  const wings = res.limbs.filter((l) => l.kind === "wing").length;
  const notes: string[] = [];
  if (strokes.length && hands === 0) notes.push("手なし→体当たりで攻撃");
  if (strokes.length && feet === 0) notes.push("足なし→転がって移動");
  detectText = strokes.length ? `${marks.some((m) => m.color === "hand" || m.color === "foot") ? "🖐 ぬった手足: " : ""}手 ${hands}本・足 ${feet}本${wings ? `・羽 ${wings}まい（とべる🪽）` : ""}${notes.length ? "（" + notes.join("／") + "）" : ""}` : "まだ何も描かれていません";
  resultEl.textContent = detectText;
}

function limbColor(res: DetectResult, k: number) {
  const l = res.limbs[k];
  const idx = res.limbs.slice(0, k).filter((m) => m.kind === l.kind).length;
  if (l.kind === "wing") return "#40c057";
  return l.kind === "hand" ? HAND_COLORS[idx % HAND_COLORS.length] : FOOT_COLORS[idx % FOOT_COLORS.length];
}

function render() {
  if (view === "battle" || view === "char" || view === "special") return;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (view === "draw") {
    if (photo) syncPhotoVisibility(); // 描くたびに 取り込みの操作が 見えているか 確かめる
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
  return renderStrokes(list.map((m) => (m.color === "erase" ? m : { ...m, color: MARK_COLORS[m.color as "hand" | "foot" | "wing"] ?? "#888888" })));
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
  syncPhotoVisibility();
  legendEl.hidden = v !== "detect";
  const panel = v === "battle" || v === "char" || v === "special";
  stageEl.hidden = panel;
  battleSetup.hidden = v !== "battle";
  charSetup.hidden = v !== "char" && v !== "special";
  // キャラ: なまえ・とくちょう・たたかいかた・ほぞん / ひっさつ: 作業台だけ（1画面に おさめる）
  for (const el of charSetup.children) (el as HTMLElement).hidden = (el.id === "specialCard") !== (v === "special");
  document.getElementById("tuneBox")!.hidden = v !== "detect";
  if (v === "special") {
    resultEl.textContent = "";
    renderEffects();
    return;
  }
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
  if (picking && layer === "draw" && !(photo && photo.phase !== "done")) { pickColorAt(x, y); return; }
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
document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) => b.addEventListener("click", () => {
  // 写真の取り込み中は ほかのタブに 行かない（とちゅうの状態が わかりにくくなるため）
  if (photo && b.dataset.view !== "draw") { toast("📷 しゃしんの とりこみを おわらせてね（✅ これで OK か ↩ やめる）"); return; }
  setView(b.dataset.view as View);
}));

const palette = document.getElementById("palette")!;
const eraserBtn = document.getElementById("eraser")!;
const RECENT_KEY = "doodle-arena:recentColors";
let recentColors: string[] = readJson<string[]>(RECENT_KEY, []).filter((c) => /^#[0-9a-f]{6}$/i.test(c)).slice(0, 8);
let picking = false; // 💧 スポイト: 次に キャンバスを タップした所の色を とる
function setColor(c: string, remember = false) {
  color = c.toLowerCase();
  erasing = false;
  eraserBtn.classList.remove("on");
  if (remember && !COLORS.includes(color)) {
    recentColors = [color, ...recentColors.filter((x) => x !== color)].slice(0, 8);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recentColors)); } catch { /* 無視 */ }
  }
  renderPalette();
}
function renderPalette() {
  palette.innerHTML = "";
  const sw = (c: string) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch" + (c === color && !erasing ? " on" : "");
    b.style.background = c;
    b.setAttribute("aria-label", c);
    b.addEventListener("click", () => setColor(c));
    palette.appendChild(b);
  };
  for (const c of COLORS) sw(c);
  for (const c of recentColors) sw(c); // 前に えらんだ色
  // 🌈 すきな色（どんな色でも）
  const any = document.createElement("label");
  any.className = "swatch any" + (!COLORS.includes(color) && !erasing ? " on" : "");
  any.title = "すきな色";
  any.style.setProperty("--cur", color);
  any.innerHTML = `<span>🌈</span><input type="color" aria-label="すきな色">`;
  const inp = any.querySelector("input")!;
  inp.value = /^#[0-9a-f]{6}$/i.test(color) ? color : "#222222";
  inp.addEventListener("change", () => setColor(inp.value, true));
  palette.appendChild(any);
  // 💧 スポイト（絵や写真から 色を とる）
  const pk = document.createElement("button");
  pk.type = "button";
  pk.className = "swatch pick" + (picking ? " on" : "");
  pk.title = "スポイト: 絵や写真の 色を とる";
  pk.textContent = "💧";
  pk.addEventListener("click", () => { picking = !picking; renderPalette(); resultEl.textContent = picking ? "💧 色を とりたい所を タップしてね" : ""; });
  palette.appendChild(pk);
}
renderPalette();
// スポイト: いま 見えている絵（写真も）の その場所の色
function pickColorAt(x: number, y: number) {
  const c = renderStrokes(strokes).getContext("2d")!.getImageData(Math.max(0, Math.min(CANVAS_SIZE - 1, Math.round(x))), Math.max(0, Math.min(CANVAS_SIZE - 1, Math.round(y))), 1, 1).data;
  picking = false;
  if (c[3] < 20) { renderPalette(); resultEl.textContent = "そこには 色が ないよ"; return; }
  const hx = (v: number) => v.toString(16).padStart(2, "0");
  setColor(`#${hx(c[0])}${hx(c[1])}${hx(c[2])}`, true);
  resultEl.textContent = "💧 色を とったよ";
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
  renderPalette();
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
const photoBar = document.getElementById("photoBar")!;
// 写真の取り込み中に 何を見せるかは ここだけで決める（描く道具を かくし、取り込みの操作と 下の固定ボタンを 出す）
function syncPhotoVisibility() {
  const on = !!photo && view === "draw" && screen === "make";
  drawTools.hidden = view !== "draw" || !!photo;
  photoPanel.hidden = !on;
  photoBar.hidden = !on;
  document.body.classList.toggle("photo-on", on);
  if (on && photo) {
    const ph = photo.phase;
    document.getElementById("pbarStep")!.textContent = ph === "box" ? "① 指で 四角く かこんでね" : ph === "fix" ? "② きりぬきを なおす" : "③ できあがり";
    const nx = document.getElementById("pbarNext") as HTMLButtonElement;
    nx.hidden = ph === "box";
    nx.textContent = ph === "fix" ? "▶ 絵に する" : "✅ これで OK";
  }
}
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
  document.getElementById("photoAllRow")!.hidden = ph !== "box";
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
  syncPhotoVisibility(); // 重い処理の前に 出しておく（途中で失敗しても ボタンは押せる）
  scheduleEditBar();
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
  syncPhotoVisibility();
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
// 切りぬかない: かこんだ四角を まるごと（写真の形のまま）
document.getElementById("pbRect")!.addEventListener("click", () => {
  if (!photo?.px) return;
  const n = photo.px.width, m = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) m[i] = photo.px.data[i * 4 + 3] ? 1 : 0;
  photo.mask = m;
  render();
});
// 写真ぜんぶ: かこまずに 写真全体を使う
document.getElementById("photoAll")!.addEventListener("click", () => {
  if (!photo) return;
  photo.rect = { x: 0, y: 0, w: photo.img.naturalWidth, h: photo.img.naturalHeight };
  photo.mask = null;
  setPhotoPhase(photoMode !== "line" ? "fix" : "done");
});
const photoNextAction = () => { if (photo?.phase === "fix") setPhotoPhase("done"); else endPhoto(true); };
photoNext.addEventListener("click", photoNextAction);
document.getElementById("pbarNext")!.addEventListener("click", photoNextAction);
document.getElementById("pbarCancel")!.addEventListener("click", () => endPhoto(false));
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
    syncPhotoVisibility();
    setPhotoPhase("box");
    // 写真えらびの画面が とじきってから うごかす（すぐだと iPhone では 元の位置に もどされる）
    setTimeout(() => canvas.scrollIntoView({ block: "start" }), 400);
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
const markBtns = { hand: document.getElementById("mHand")!, foot: document.getElementById("mFoot")!, wing: document.getElementById("mWing")!, erase: document.getElementById("mErase")! };
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

// シール1枚（ダイカットの ステッカー）。光り方で できばえ（ふつう / キラ / ホログラム）、下の ★で かさねた数、左上で おまけ
const SLOT_COLOR: Record<Slot, string> = { path: "#4dabf7", act: "#b197fc", fx: "#fcc419" };
const SLOT_TINT: Record<Slot, string> = { path: "#a5d8ff", act: "#d0bfff", fx: "#ffec99" };
const shortName = (k: PartKind) => kindInfo(k).name.replace(/\((遠|近)\)$/, "");
interface StickerOpt { cost?: number; mark?: "x" | "plus" | "swap"; count?: number; off?: boolean; big?: boolean }
function sticker(p: Part, o: StickerOpt = {}): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `stk h${p.shine}${o.big ? " big" : ""}${o.off ? " off" : ""}`;
  b.style.setProperty("--sc", SLOT_TINT[partSlot(p.kind)]);
  b.style.setProperty("--rot", `${(hashStr(p.id) % 7) - 3}deg`);
  b.innerHTML = `<span class="face"><span class="ic"></span><span class="nm"></span></span>${p.shine ? `<span class="holo"></span><span class="spark"></span>` : ""}<span class="cost"></span>`;
  b.querySelector(".ic")!.innerHTML = kindGlyph(p.kind) || kindIcon(p.kind);
  b.querySelector(".nm")!.textContent = shortName(p.kind);
  b.querySelector(".cost")!.textContent = `${o.cost ?? p.cost}`;
  const add = (cls: string, text: string) => { const e = document.createElement("span"); e.className = cls; e.textContent = text; b.appendChild(e); };
  if (p.star > 1) add("stars", "★".repeat(p.star));
  if (p.extras.length) { add("ex", ""); b.querySelector(".ex")!.innerHTML = p.extras.map((e) => kindGlyph(e.stat, false) || kindIcon(e.stat)).join(""); }
  if (o.mark) add(`mark ${o.mark}`, o.mark === "x" ? "✖" : o.mark === "swap" ? "⇄" : "＋");
  if (o.count && o.count > 1) add("cnt", `×${o.count}`);
  b.setAttribute("aria-label", `${shortName(p.kind)} ${starText(p)} ${shineText(p)}`);
  return b;
}
// 文字の 一覧（ごほうびの 表示などで 使う。シール＋名前）
function partChip(p: Part): HTMLElement {
  const el = document.createElement("span");
  el.className = "pc";
  el.style.setProperty("--rc", SHINE_INFO[p.shine].color);
  const s = sticker(p);
  s.tabIndex = -1;
  const t = document.createElement("span");
  t.className = "pn";
  t.textContent = shortName(p.kind);
  el.append(s, t);
  return el;
}
const partsById = (ids: string[]): Part[] => {
  const inv = loadInventory();
  return ids.map((id) => inv.parts.find((p) => p.id === id)).filter((p): p is Part => !!p);
};
// 予算を超える分は後ろから効かない
function withinBudget(parts: Part[], type: "ranged" | "melee"): Part[] {
  const out: Part[] = [];
  for (const p of parts.filter((x) => fitsType(x, type))) {
    const cs = equipCosts([...out, p]);
    if (cs.reduce((a, c) => a + c, 0) <= SPECIAL_BUDGET) out.push(p);
  }
  return out;
}
// シールの 説明（1行。何が起きるか＋数値＋おまけ）
function stickerInfo(p: Part): string {
  const what = p.kind.includes(":") ? kindInfo(p.kind).desc : mainText(p);
  return [what, ...p.extras.map((e) => `${kindIcon(e.stat)}${extraText(e)}`)].join("　");
}

const TYPE_LABEL = { ranged: ["🎯", "とおく"], melee: ["👊", "ちかく"] } as const;
const SLOTS: Slot[] = ["path", "act", "fx"];
const setLoadout = (type: "ranged" | "melee", ids: string[]) => { if (type === "ranged") editor.partsR = ids; else editor.partsM = ids; };
const testFire = new TestFire();
let traySlot: Slot = "path"; // 下の シール置き場で 見せる 枠
let infoId: string | null = null; // 説明を 出す シール（さいごに さわった）
let popId: string | null = null; // 貼った ばかりの シール（ぽんっと 出す）

// 貼る: とびかた（うごき）は 1まいだけなので、もう 貼ってあれば 入れかえる
function withSticker(ids: string[], p: Part): string[] {
  if (partSlot(p.kind) !== "path") return [...ids, p.id];
  const parts = partsById(ids);
  return [...parts.filter((x) => partSlot(x.kind) !== "path").map((x) => x.id), p.id];
}

// ひっさつの 作業台: ①ためしうち ②3つの 枠（タップで はがす）③シール置き場（タップで 貼る）。スマホで 1画面に おさめる
function renderEffects() {
  const inv = loadInventory();
  const fits = (type: "ranged" | "melee") => (id: string) => { const p = inv.parts.find((x) => x.id === id); return !!p && fitsType(p, type); };
  // なくなったシール・型に合わないシールは外す
  editor.partsR = editor.partsR.filter(fits("ranged"));
  editor.partsM = editor.partsM.filter(fits("melee"));
  const type = editor.specialType;
  const usedOf = (t: "ranged" | "melee") => equipCosts(withinBudget(partsById(loadoutOf(editor, t)), t)).reduce((a, c) => a + c, 0);

  // とおく / ちかく（えらんだ方を たたかいで つかう）
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
    b.querySelector("small")!.textContent = `⚡${usedOf(t)}`;
    b.addEventListener("click", () => { editor.specialType = t; renderEffects(); persistDraft(); });
    stypeTabs.appendChild(b);
  }

  const ids = loadoutOf(editor, type);
  const mine = partsById(ids);
  const active = withinBudget(mine, type);
  const costs = equipCosts(active);
  const used = costs.reduce((a, c) => a + c, 0);
  // 古いデータで とびかたが 2まい あれば、つかわれる 1まいの ほかは 効かない
  const usedPath = type === "ranged" ? pathOf(active.filter((p) => p.kind.startsWith("r:")).map((p) => p.kind.slice(2) as EffectId)) : undefined;
  const usedMoves = new Set(normalizeMelee(active.filter((p) => p.kind.startsWith("m:")).map((p) => p.kind.slice(2) as MeleeEffectId)));
  const pathOff = (p: Part) => partSlot(p.kind) === "path" && (type === "ranged"
    ? p.kind.slice(2) !== usedPath && !(usedPath === "rain" && p.kind === "r:cloud")
    : !usedMoves.has(p.kind.slice(2) as MeleeEffectId));
  const save = (next: string[]) => { setLoadout(type, next); renderEffects(); persistDraft(); };
  effectsEl.innerHTML = "";

  // おもさ（⚡）の めもり
  const wbar = document.createElement("div");
  wbar.className = "wbar";
  const pips = document.createElement("div");
  pips.className = "pips";
  pips.setAttribute("aria-label", `おもさ ${used} / ${SPECIAL_BUDGET}`);
  let k = 0;
  active.forEach((p, i) => { for (let j = 0; j < costs[i] && k < SPECIAL_BUDGET; j++, k++) { const d = document.createElement("i"); d.style.background = SLOT_COLOR[partSlot(p.kind)]; pips.appendChild(d); } });
  for (; k < SPECIAL_BUDGET; k++) pips.appendChild(document.createElement("i"));
  const left = document.createElement("span");
  left.className = "left";
  left.textContent = `⚡${SPECIAL_BUDGET - used}`;
  wbar.append(pips, left);

  // ためしうち（貼りかえるたびに 撃ちなおす）。読み込みの とちゅうでも 呼ばれるので、組み立ては 次の すきまに
  setTimeout(() => { try { testFire.set(buildPlayer("").cfg); } catch (e) { console.warn("testfire", e); } });

  // 3つの 枠
  const slots = document.createElement("div");
  slots.className = "slots";
  for (const slot of SLOTS) {
    const box = document.createElement("div");
    box.className = `slot${slot === traySlot ? " on" : ""}`;
    box.style.setProperty("--sc", SLOT_COLOR[slot]);
    const h = document.createElement("b");
    h.textContent = SLOT_LABEL[type][slot].join("");
    const pile = document.createElement("div");
    pile.className = "pile";
    const list = mine.filter((p) => partSlot(p.kind) === slot);
    for (const p of list) {
      const i = active.indexOf(p);
      const st = sticker(p, { cost: i >= 0 ? costs[i] : p.cost, mark: "x", off: i < 0 || pathOff(p) });
      if (p.id === popId) st.classList.add("pop");
      st.addEventListener("click", (e) => { e.stopPropagation(); infoId = p.id; save(ids.filter((id) => id !== p.id)); });
      pile.appendChild(st);
    }
    // 空きの 穴（とびかたは 1まいだけ）
    if (!list.length || slot !== "path") {
      const hole = document.createElement("span");
      hole.className = "hole";
      hole.textContent = "＋";
      pile.appendChild(hole);
    }
    box.append(h, pile);
    box.addEventListener("click", () => { traySlot = slot; renderEffects(); });
    slots.appendChild(box);
  }

  // シール置き場（えらんだ 枠の シールだけ。横に スクロール）
  const tray = document.createElement("div");
  tray.className = "tray";
  const seg = document.createElement("div");
  seg.className = "seg";
  const cand = inv.parts.filter((p) => fitsType(p, type) && !ids.includes(p.id))
    .sort((a, b) => partScore(b) - partScore(a) || kindInfo(a.kind).name.localeCompare(kindInfo(b.kind).name));
  for (const slot of SLOTS) {
    const b = document.createElement("button");
    b.type = "button";
    b.classList.toggle("on", slot === traySlot);
    b.textContent = `${SLOT_LABEL[type][slot].join("")} ${cand.filter((p) => partSlot(p.kind) === slot).length}`;
    b.addEventListener("click", () => { traySlot = slot; renderEffects(); });
    seg.appendChild(b);
  }
  const strip = document.createElement("div");
  strip.className = "strip";
  const list = cand.filter((p) => partSlot(p.kind) === traySlot);
  if (!list.length) { const e = document.createElement("div"); e.className = "empty"; e.textContent = "まだ ないよ。ストーリーで かつと もらえる！"; strip.appendChild(e); }
  for (const p of list) {
    const next = withSticker(ids, p);
    const nextUsed = equipCosts(partsById(next).filter((x) => fitsType(x, type))).reduce((a, c) => a + c, 0);
    const st = sticker(p, { cost: equipCosts([...active, p]).at(-1)!, mark: next.length <= ids.length ? "swap" : "plus" });
    st.disabled = nextUsed > SPECIAL_BUDGET;
    st.addEventListener("click", () => { infoId = p.id; popId = p.id; save(next); });
    strip.appendChild(st);
  }
  tray.append(seg, strip);

  // さいごに さわった シールの 説明（1行）
  const info = document.createElement("div");
  info.className = "sinfo";
  const ip = inv.parts.find((p) => p.id === infoId);
  if (ip) {
    const b = document.createElement("b");
    b.textContent = `${kindIcon(ip.kind)} ${shortName(ip.kind)} ${starText(ip)}`;
    info.append(b, document.createElement("br"), stickerInfo(ip));
  } else info.textContent = "👇 シールを タップすると はれるよ。はった シールを タップすると はがせるよ";
  effectsEl.append(wbar, testFire.el, slots, tray, info);
  popId = null;
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
  st.textContent = photo ? "📷 しゃしんを とりこみ中" : !strokes.length ? "まだ 絵が ないよ" : dirty ? "● まだ ほぞんしていない" : "✔ ほぞんずみ";
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
// じゆうバトルの ステージ（おまかせ ＋ 全部）
{
  const sel = document.getElementById("arenaSel") as HTMLSelectElement;
  sel.innerHTML = `<option value="random">🎲 おまかせ</option>` + ARENA_LIST.map((a) => `<option value="${a.id}">${a.name}</option>`).join("");
  sel.value = "flat";
}
const cpuUnlocked = (c: CpuChar) => !c.bossStage || !!loadStory().cleared[c.bossStage];
let cpuGroup = "";
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
  // なかまわけは 上の 札で 1つずつ（ながい 一覧に しない）
  const groups = [...CPU_GROUPS.filter((g) => CPU_CHARS.some((c) => c.group === g)), ...(saved.length ? ["じぶんの キャラ"] : [])];
  if (!groups.includes(cpuGroup)) cpuGroup = cpuCharById(cpuPick)?.group ?? (cpuPick.startsWith("saved:") ? "じぶんの キャラ" : groups[0]);
  const chips = document.createElement("div");
  chips.className = "chips";
  const dice = card("", "おまかせ", null);
  for (const gname of groups) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = gname;
    b.classList.toggle("on", gname === cpuGroup);
    b.addEventListener("click", () => { cpuGroup = gname; refreshCpuOptions(); });
    chips.appendChild(b);
  }
  const g = document.createElement("div");
  g.className = "cgrid";
  g.appendChild(dice);
  if (cpuGroup === "じぶんの キャラ") for (const c of saved) g.appendChild(card(`saved:${c.id}`, c.name, c.thumb ?? null));
  else for (const c of CPU_CHARS.filter((x) => x.group === cpuGroup)) g.appendChild(card(c.id, c.name, cpuThumb(c.id, c.strokes), !cpuUnlocked(c)));
  grid.append(chips, g);
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
  // CPU キャラを じぶんの キャラにする（絵・手足・羽・性格・必殺の型を うつす。必殺パーツは じぶんの 持ち物から つける）
  if (c && cpuUnlocked(c)) {
    const use = document.createElement("button");
    use.type = "button";
    use.className = "inline";
    use.textContent = "🎨 じぶんの キャラにする";
    use.addEventListener("click", () => adoptCpu(c));
    pick.appendChild(use);
  }
}

function adoptCpu(c: CpuChar) {
  const list = loadRoster();
  const mk = c.marks?.() ?? [];
  const data = normalize({ name: c.name, strokes: c.strokes(), marks: mk, personality: c.personality, specialType: c.specialType, special: [], melee: [], partsR: [], partsM: [], thumb: cpuThumb(c.id, c.strokes), savedAt: Date.now() });
  list.unshift(data);
  if (!writeRoster(list)) { toast("ほぞん できませんでした（ブラウザの ほぞんが いっぱい？）"); return; }
  toast(`「${c.name}」を じぶんの キャラに したよ！ ストーリーや オンラインでも 使えるよ`);
  refreshCpuOptions();
}

// CPU キャラを戦闘用に組み立てる（パーツは C 相当で、キャラごとに毎回同じ数値。強化は自分と同じポイント数を好みの枝に）
function buildCpuChar(c: CpuChar) {
  const b = buildCharacter(c.name, c.strokes(), [], DEFAULT_PARAMS, c.marks?.() ?? []);
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
const shapeFlags = (b: ReturnType<typeof buildCharacter>): ShapeFlags => ({ hasFeet: b.cfg.hasFeet, hasHands: b.cfg.hasHands, hits: b.cfg.traits?.hits ?? 1, reach: b.cfg.reach, hasWings: b.cfg.hasWings });
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
  const ar = (document.getElementById("arenaSel") as HTMLSelectElement).value;
  runBattle({
    player,
    cpu,
    arena: arenaById(ar === "random" ? ARENA_LIST[Math.floor(Math.random() * ARENA_LIST.length)].id : ar),
    spectate: (document.getElementById("spectate") as HTMLInputElement).checked,
    seed: (Math.random() * 0xffffffff) >>> 0,
    sfx,
    cpuLine,
  });
});

// --- 画面の移動（メイン ⇄ 各画面）。端末やブラウザの「戻る」でも1つ前に戻る ---
type Screen = "home" | "story" | "make" | "free" | "transfer" | "tree" | "parts" | "online";
const SCREEN_TITLES: Record<Screen, string> = { home: "", story: "📖 ストーリー", make: "✏️ キャラを つくる", free: "⚔️ じゆうバトル", transfer: "📦 ひきつぎ", tree: "🌳 スキルツリー", parts: "🧩 シール", online: "🌐 オンライン" };
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
  // キャラを作る画面から出たら、写真の取り込みは やめる（前の絵に もどす。とちゅうの絵で 戦わないように）
  if (photo && s !== "make") { endPhoto(false); toast("📷 しゃしんの とりこみは やめたよ"); }
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
  document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((b) => b.classList.toggle("on", b.dataset.nav === s));
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
  document.getElementById("treeHint")!.textContent = usable > 0 ? `🔴 ${usable}` : spentOf(p.nodes) >= TREE_CAP ? "👑" : "";
}

// --- じまんの文（拡散用）: ストーリーの進み具合とステータスから作って、コピー／共有 ---
function makeShareText(): string {
  const p = loadProfile();
  const parts = loadInventory().parts;
  const best = parts.reduce<Part | null>((a, b) => (!a || partScore(b) > partScore(a) ? b : a), null);
  return shareText({
    level: p.level, spent: spentOf(p.nodes), cap: TREE_CAP, titles: masteredBranches(p.nodes).map((b) => b.title),
    cleared: loadStory().cleared, chapters: CHAPTERS, partCount: parts.length,
    bestPart: best ? `${shineText(best)}${starText(best)} ${kindIcon(best.kind)}${kindInfo(best.kind).name}` : undefined,
    charName: strokes.length && editor.name ? editor.name : undefined,
  });
}
fillIcons(); // ボタン・タブの 絵（data-icon）
const toastEl = document.getElementById("toast")!;
let toastTimer = 0;
// 画面の下に しばらく出る お知らせ（どの画面でも見える）
function toast(text: string) {
  toastEl.textContent = text;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toastEl.hidden = true; }, 2600);
}
// じまんの文の窓（押すたびに 新しく作って 画面のまん中に出す。開くだけで、とじるのは「とじる」か 外側を おした時だけ）
let shareModal: HTMLElement | null = null;
function openShare() {
  if (shareModal) return; // 2回 続けて 押されても 1つだけ
  let text = "";
  try { text = makeShareText(); } catch (e) { text = `文を つくれなかったよ（${(e as Error).message}）`; }
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  shareModal = modal;
  const close = () => { modal.remove(); shareModal = null; };
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  const box = document.createElement("div");
  box.className = "modal-box";
  box.setAttribute("data-noruby", "");
  const h = document.createElement("div");
  h.className = "kidhint";
  h.textContent = "📣 SNSよう じまんの ぶん";
  const how = document.createElement("div");
  how.className = "note";
  how.textContent = "①「📋 コピー」を おす → ② X・LINE・インスタ などを ひらく → ③ はりつける（文は なおしても いいよ）";
  const ta = document.createElement("textarea");
  ta.className = "sharetext";
  ta.rows = 8;
  ta.value = text;
  const msg = document.createElement("div");
  msg.className = "sharemsg";
  msg.hidden = true;
  const row = document.createElement("div");
  row.className = "row";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "primary inline";
  copy.textContent = "📋 コピー";
  const done = (ok: boolean, t: string) => {
    msg.hidden = false;
    msg.className = `sharemsg${ok ? "" : " ng"}`;
    msg.textContent = t;
    ta.classList.toggle("copied", ok);
    if (ok) copy.textContent = "✅ コピーしたよ！";
    toast(t);
  };
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(ta.value);
    } catch {
      // コピーの許可が無いブラウザ: 文を選んで 昔のやり方でコピー
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      if (!document.execCommand("copy")) { done(false, "コピー できなかったよ。文を ながおしして「コピー」を えらんでね"); return; }
    }
    done(true, "📋 クリップボードに コピーしたよ！ SNS に はりつけてね");
  });
  row.appendChild(copy);
  if (typeof navigator.share === "function") {
    const send = document.createElement("button");
    send.type = "button";
    send.textContent = "📤 おくる";
    send.addEventListener("click", () => { navigator.share({ text: ta.value }).catch(() => { /* やめた時など */ }); });
    row.appendChild(send);
  }
  const cl = document.createElement("button");
  cl.type = "button";
  cl.textContent = "とじる";
  cl.addEventListener("click", close);
  row.appendChild(cl);
  box.append(h, how, ta, row, msg);
  modal.appendChild(box);
  document.body.appendChild(modal);
}
document.getElementById("shareBtn")!.addEventListener("click", openShare);

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
    // となりでない 2本（空の枝を 足して 間が あいた）は まん中寄りに
    const adjacent = Math.abs(ka - kb) === 1 || Math.abs(ka - kb) === BRANCHES.length - 1;
    const r = adjacent ? 128 : 30;
    pos.set(n.id, [Math.cos(ang) * r, Math.sin(ang) * r]);
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
    nodeInfo.textContent = "👆 まるを タップすると 説明が でるよ（まんなかから 外へ じゅんばんに とれる。振り直しは むりょう）";
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

// --- シール アルバム: しゅるいごとに いちばん良い 1まいを 見せる（同じ しゅるいが あれば ×N）。タップで 大きく 見て、かさねる・🔒 ---
let partFilter: "all" | "ranged" | "melee" | "both" = "all";
document.querySelectorAll<HTMLButtonElement>("[data-pf]").forEach((b) => b.addEventListener("click", () => {
  partFilter = b.dataset.pf as typeof partFilter;
  document.querySelectorAll("[data-pf]").forEach((o) => o.classList.toggle("on", o === b));
  renderParts();
}));
// どれかのキャラ（編集中・保存済み）が付けているシール
const equippedIds = () => new Set([editor, ...loadRoster()].flatMap((c) => [...c.partsR, ...c.partsM]));
const TYPE_ORDER = { ranged: 0, melee: 1, both: 2 };
const bestFirst = (a: Part, b: Part) => partScore(b) - partScore(a) || b.star - a.star;

function renderParts() {
  const inv = loadInventory();
  document.getElementById("invCount")!.textContent = String(inv.parts.length);
  document.getElementById("invCap")!.textContent = String(INVENTORY_CAP);
  const plans = planStacks(inv.parts, equippedIds());
  // かさねられる 時だけ 出す: 重なった シールの 絵 ＋「まとめて かさねる」
  const bulk = document.getElementById("bulkCombine") as HTMLButtonElement;
  bulk.hidden = !plans.length;
  bulk.innerHTML = `<span class="mini"></span><span>🧩 まとめて かさねる</span>`;
  const mini = bulk.querySelector(".mini")!;
  for (const pl of plans.slice(0, 4)) { const bp = inv.parts.find((p) => p.id === pl.baseId); if (bp) { const st = sticker(bp), sp = document.createElement("span"); sp.className = st.className; sp.style.cssText = st.style.cssText; sp.innerHTML = st.innerHTML; mini.appendChild(sp); } }
  const listEl = document.getElementById("partList")!;
  listEl.innerHTML = "";
  const shown = inv.parts.filter((p) => partFilter === "all" || kindInfo(p.kind).type === partFilter);
  const kinds = [...new Set(shown.map((p) => p.kind))]
    .sort((a, b) => TYPE_ORDER[kindInfo(a).type] - TYPE_ORDER[kindInfo(b).type] || SLOTS.indexOf(partSlot(a)) - SLOTS.indexOf(partSlot(b)) || kindInfo(a).name.localeCompare(kindInfo(b).name));
  if (!kinds.length) listEl.textContent = "まだ ないよ。ストーリーで かつと もらえる！";
  for (const k of kinds) {
    const list = shown.filter((p) => p.kind === k).sort(bestFirst);
    const st = sticker(list[0], { count: list.length });
    st.addEventListener("click", () => openSheet(k));
    listEl.appendChild(st);
  }
}

function openModal(build: (box: HTMLElement, close: () => void) => void) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const close = () => { modal.remove(); renderParts(); renderEffects(); };
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  const box = document.createElement("div");
  box.className = "modal-box";
  modal.appendChild(box);
  document.body.appendChild(modal);
  build(box, close);
}
const bestExtra = (m: Part) => m.extras.reduce((bi, e, i, a) => (bi < 0 || e.value > a[bi].value ? i : bi), -1);

// 1しゅるいの シール: 大きく 見せる・🔒・ここに かさねる（同じ しゅるいの ほかの シールを のせて ★アップ）
function openSheet(kind: PartKind) {
  let focus: string | null = null;
  openModal((box, close) => {
    const draw = () => {
      const inv = loadInventory();
      const eq = equippedIds();
      const list = inv.parts.filter((p) => p.kind === kind).sort(bestFirst);
      if (!list.length) { close(); return; }
      const cur = list.find((p) => p.id === focus) ?? list[0];
      box.innerHTML = "";
      const sheet = document.createElement("div");
      sheet.className = "sheet";
      const big = sticker(cur, { big: true });
      big.tabIndex = -1;
      const name = document.createElement("b");
      name.textContent = `${shortName(kind)} ${starText(cur)}`;
      const desc = document.createElement("div");
      desc.className = "desc";
      desc.textContent = stickerInfo(cur);
      const users = [editor, ...loadRoster().filter((c) => c.id !== editId)].flatMap((c) => [
        ...(c.partsR.includes(cur.id) ? [`${c.name || "へんしゅう中"}🎯`] : []), ...(c.partsM.includes(cur.id) ? [`${c.name || "へんしゅう中"}👊`] : []),
      ]);
      const who = document.createElement("div");
      who.className = "note";
      who.textContent = users.length ? `🧑 ${users.join("・")}` : "";
      const row = document.createElement("div");
      row.className = "row";
      const mats = list.filter((m) => canStack(cur, m, eq)).sort((a, b) => partScore(a) - partScore(b)).slice(0, MAX_STAR - cur.star);
      const st = document.createElement("button");
      st.className = "primary inline";
      st.textContent = cur.star >= MAX_STAR ? "★5 まんたん！" : `🧩 かさねる ★${cur.star}→★${cur.star + mats.length}`;
      st.disabled = !mats.length;
      st.addEventListener("click", () => {
        for (const m of mats) stackInto(cur.id, m.id, equippedIds(), cur.extras.length < MAX_EXTRAS ? bestExtra(m) : -1);
        focus = cur.id;
        toast(`🧩 ${starText(loadInventory().parts.find((p) => p.id === cur.id)!)}`);
        draw();
      });
      const lk = document.createElement("button");
      lk.textContent = cur.locked ? "🔒" : "🔓";
      lk.setAttribute("aria-label", cur.locked ? "鍵を はずす" : "鍵を かける（かさねる 材料に しない）");
      lk.addEventListener("click", () => { toggleLock(cur.id); focus = cur.id; draw(); });
      const ok = document.createElement("button");
      ok.textContent = "✖";
      ok.setAttribute("aria-label", "とじる");
      ok.addEventListener("click", close);
      row.append(st, lk, ok);
      sheet.append(big, name, desc, who, row);
      // 同じ しゅるいの ほかの シール（タップで 見る）
      if (list.length > 1) {
        const same = document.createElement("div");
        same.className = "same";
        for (const p of list) {
          const s2 = sticker(p, { off: p.id === cur.id });
          s2.addEventListener("click", () => { focus = p.id; draw(); });
          same.appendChild(s2);
        }
        sheet.appendChild(same);
      }
      box.appendChild(sheet);
    };
    draw();
  });
}
// まとめて かさねる: しゅるいごとに いちばん良い シールへ（はっている・🔒は のせない）
document.getElementById("bulkCombine")!.addEventListener("click", () => {
  const made = stackAll(equippedIds());
  if (made.length) toast(`🪄 ${made.map((m) => `${kindIcon(m.kind)}${"★".repeat(m.star)}`).join(" ")}`);
  renderParts();
  renderEffects();
});

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
// 章は 1つずつ 見せる（上の 札で えらぶ）。はじめは まだ クリアしていない ステージの 章
let storyCh = -1;
function renderStory() {
  refreshStoryChars();
  const { cleared } = loadStory();
  chaptersEl.innerHTML = "";
  if (storyCh < 0) {
    const i = CHAPTERS.findIndex((ch) => ch.stages.some((st) => !cleared[st.id] && isUnlocked(st, cleared)));
    storyCh = i < 0 ? CHAPTERS.length - 1 : i;
  }
  const chips = document.createElement("div");
  chips.className = "chips";
  CHAPTERS.forEach((ch, i) => {
    const b = document.createElement("button");
    b.type = "button";
    const done = ch.stages.every((st) => cleared[st.id]);
    const open = isUnlocked(ch.stages[0], cleared);
    b.textContent = `${done ? "👑" : open ? "" : "🔒"}${ch.no}`;
    b.setAttribute("aria-label", `第${ch.no}章 ${ch.title}`);
    b.classList.toggle("on", i === storyCh);
    b.classList.toggle("lock", !open);
    b.addEventListener("click", () => { storyCh = i; renderStory(); });
    chips.appendChild(b);
  });
  // 🏆 チャレンジ（ストーリーの あと）
  const chOpen = !!cleared[UNLOCK_STAGE];
  const cb = document.createElement("button");
  cb.type = "button";
  cb.textContent = chOpen ? "🏆" : "🔒🏆";
  cb.setAttribute("aria-label", "チャレンジ");
  cb.classList.toggle("on", storyCh === CHAPTERS.length);
  cb.classList.toggle("lock", !chOpen);
  cb.addEventListener("click", () => { storyCh = CHAPTERS.length; renderStory(); });
  chips.appendChild(cb);
  for (const t of UPCOMING) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lock";
    b.disabled = true;
    b.textContent = "🚧";
    b.title = `${t} 準備中`;
    chips.appendChild(b);
  }
  chaptersEl.appendChild(chips);
  if (storyCh === CHAPTERS.length) { renderChallenges(cleared); return; }
  for (const ch of [CHAPTERS[storyCh]]) {
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
}

// チャレンジ: 1対多・プール。絵が かさなった 札（何人と たたかうか 見て わかる）
function renderChallenges(cleared: Record<string, number>) {
  const sec = document.createElement("div");
  sec.className = "chapter";
  const h = document.createElement("h2");
  h.textContent = cleared[UNLOCK_STAGE] ? "🏆 チャレンジ" : "🏆 チャレンジ（ストーリーを ぜんぶ クリアすると ひらく）";
  const grid = document.createElement("div");
  grid.className = "stages challenges";
  for (const c of CHALLENGES) {
    const b = document.createElement("button");
    b.disabled = !challengeOpen(c, cleared);
    const pics = document.createElement("span");
    pics.className = "foes";
    for (const st of foeStages(c)) {
      if (!thumbs.has(st.id)) thumbs.set(st.id, thumbnail(st.strokes()));
      const img = document.createElement("img");
      img.src = thumbs.get(st.id)!;
      img.alt = "";
      pics.appendChild(img);
    }
    const no = document.createElement("span");
    no.className = "no";
    no.textContent = `${c.icon} ${"👤".repeat(c.foes.length)}`;
    const t = document.createElement("span");
    t.textContent = b.disabled ? "？？？" : c.title;
    b.append(pics, no, t);
    if (cleared[c.id]) { const star = document.createElement("span"); star.className = "clear"; star.textContent = "★"; b.appendChild(star); }
    b.addEventListener("click", () => startChallenge(c));
    grid.appendChild(b);
  }
  sec.append(h, grid);
  chaptersEl.appendChild(sec);
}

function startChallenge(c: Challenge) {
  sfx.unlock();
  const player = buildPlayer(storyCharSel.value);
  const foes = foeStages(c).map((st) => {
    const b = buildCharacter(st.enemy, st.strokes(), [], DEFAULT_PARAMS, st.marks?.() ?? []);
    applyData(b, st, enemyParts(st), sumBoost([boostOf(autoTree(st.boostPoints, st.prefer)), { hp: (st.hp ?? 0) + c.hpEach }]));
    return b;
  });
  const [cpu, ...more] = foes;
  runBattle({
    player, cpu, more,
    arena: arenaById(c.arena),
    spectate: false,
    seed: (Math.random() * 0xffffffff) >>> 0,
    sfx,
    cpuLevel: foeStages(c)[0].ai,
    exitLabel: "チャレンジへ",
    onResult: (winner) => {
      const r = applyStageResult(c.no, c.id, true, winner === 0);
      return rewardHtml(r, null, winner === 0 ? dropParts(7, true) : null);
    },
  });
}

function rewardHtml(r: Reward, stage: Stage | null, drop: DropResult | null): string {
  const p = loadProfile();
  let h = `<div class="exp">経験値 +${r.exp}</div>`;
  if (r.levelsUp) h += `<div class="up">レベルアップ！ Lv ${p.level}</div>`;
  if (r.points) h += `<div>スキルポイント +${r.points}（メイン画面の「スキルツリー」で使えます）</div>`;
  if (r.firstClear && stage) {
    const next = ALL_STAGES[ALL_STAGES.indexOf(stage) + 1];
    h += `<div>${next ? `次のステージ「${next.enemy}」が開きました` : "ここまでクリア！ 続きの章は準備中です"}</div>`;
  }
  if (drop?.got.length) h += `<div class="drop"><div>シールを手に入れた！</div>${drop.got.map((p) => partChip(p).outerHTML).join("")}</div>`;
  if (drop?.fed.length) h += `<div>持ち物が いっぱいなので、同じ シールに かさねたよ（${drop.fed.map((p) => `${kindIcon(p.kind)}${starText(p)}`).join(" ")}）</div>`;
  if (drop?.lost) h += `<div>持ち物が いっぱいで、シールを ${drop.lost}まい もらえなかった…（かさねて へらそう）</div>`;
  return h;
}

function startStage(stage: Stage) {
  sfx.unlock();
  const player = buildPlayer(storyCharSel.value);
  const cpu = buildCharacter(stage.enemy, stage.strokes(), [], DEFAULT_PARAMS, stage.marks?.() ?? []);
  applyData(cpu, stage, enemyParts(stage), sumBoost([boostOf(autoTree(stage.boostPoints, stage.prefer)), { hp: stage.hp ?? 0 }]));
  runBattle({
    player,
    cpu,
    arena: arenaById(stage.arena),
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
const importArea = document.getElementById("importCode") as HTMLInputElement;
document.getElementById("moveKeyBtn")!.addEventListener("click", async () => {
  const show = document.getElementById("moveKeyShow")!;
  transferMsg.textContent = "番号を つくっているよ…";
  try {
    const key = await makeMoveKey();
    show.textContent = showKey(key);
    show.hidden = false;
    transferMsg.textContent = "🔢 この 8文字を、うつした先の「② うけとる」に 入れてね（1回だけ・24時間で 消えるよ）";
  } catch (e) { show.hidden = true; transferMsg.textContent = `番号を つくれなかったよ（${(e as Error).message}）。インターネットに つないで もう一度 おしてね`; }
});
const importBtn = document.getElementById("importBtn")!;
let importArmed = 0;
importBtn.addEventListener("click", async () => {
  if (!importArea.value.trim()) { transferMsg.textContent = "ひっこし番号（8文字）を 入れてね"; return; }
  if (!importArmed) {
    importBtn.textContent = "もう一度 おすと 今の データと 入れかわるよ";
    importArmed = window.setTimeout(() => { importArmed = 0; importBtn.textContent = "🚚 うけとる"; }, 3000);
    return;
  }
  clearTimeout(importArmed);
  importArmed = 0;
  importBtn.textContent = "🚚 うけとる";
  try {
    const n = await importAny(importArea.value);
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

// --- 引っこし: 前のアドレス（github.io）→ 新しいアドレス（rakugaki-arena.pages.dev）。
// ブラウザの保存はアドレスごとに別なので、データ（キャラ・レベルなど）は 引き継ぎコードで 運ぶ ---
const NEW_HOME = "https://rakugaki-arena.pages.dev";
const OLD_HOME = "https://second1214.github.io";
// 8文字の ひっこし番号（例: K7QM-3XPA）か、引き継ぎコードそのものか
const moveKeyOf = (text: string) => { const k = text.toUpperCase().replace(/[^A-Z0-9]/g, ""); return /^[A-HJ-NP-Z2-9]{8}$/.test(k) ? k : null; };
const showKey = (k: string) => `${k.slice(0, 4)}-${k.slice(4)}`;
// 番号なら サーバーから 受けとって、コードなら そのまま 読みこむ
async function importAny(text: string): Promise<number> {
  const key = moveKeyOf(text);
  if (key && !/DA[01]:/.test(text)) return importCode((await api.moveGet(key)).code);
  return importCode(text);
}
// 引き継ぎコードを サーバーに あずけて 8文字の番号を もらう
async function makeMoveKey(): Promise<string> { return (await api.moveUp(await exportCode())).key; }

function setupMove() {
  const bar = document.getElementById("moveBar")!;
  const btn = (label: string, cls: string, f: () => void) => { const b = document.createElement("button"); b.type = "button"; b.className = cls; b.textContent = label; b.addEventListener("click", f); return b; };
  if (location.origin === OLD_HOME) {
    // 前のアドレス: データを ひっこし番号で 新しいアドレスへ
    const t = document.createElement("div");
    t.textContent = "🏠 らくがきアリーナは あたらしい アドレスに ひっこしたよ: rakugaki-arena.pages.dev";
    bar.append(t, btn("🚚 データを もって ひっこす（ひっこし番号）", "primary", async () => {
      const codeP = exportCode();
      // データは サーバーに あずけて 8文字の「ひっこし番号」で わたす（新しい アドレスが 自動で うけとる）
      try {
        const key = (await api.moveUp(await codeP)).key;
        toast(`🚚 ひっこし番号 ${showKey(key)}（あたらしい アドレスで 自動で うけとるよ）`);
        setTimeout(() => { location.href = `${NEW_HOME}/#movekey=${key}`; }, 1500);
      } catch (e) { toast(`ひっこし番号を つくれなかったよ（${(e as Error).message}）。インターネットに つないで もう一度 おしてね`); }
    }));
    bar.hidden = false;
    return;
  }
  const empty = !loadRoster().length && loadProfile().level <= 1 && !Object.keys(loadStory().cleared).length;
  // リンクで わたされた データ（#move=コード ／ #movekey=番号）: 聞いてから うつす
  if (location.hash.startsWith("#move=") || location.hash.startsWith("#movekey=")) {
    const isKey = location.hash.startsWith("#movekey=");
    const val = decodeURIComponent(location.hash.slice(isKey ? 9 : 6));
    history.replaceState(null, "", location.pathname + location.search);
    const doMove = async () => {
      try { const n = isKey ? await importAny(val) : await importCode(val); toast(`🚚 ${n}こ うつしたよ！`); setTimeout(() => location.reload(), 900); }
      catch (e) { toast(`うつせなかったよ（${(e as Error).message}）`); }
    };
    if (empty) { void doMove(); return; }
    const modal = document.createElement("div");
    modal.className = "modal";
    const box = document.createElement("div");
    box.className = "modal-box";
    const h = document.createElement("div");
    h.className = "kidhint";
    h.textContent = "🚚 前の アドレスの データを うつす？";
    const n = document.createElement("div");
    n.className = "note";
    n.textContent = "ここに もう データが あるよ。うつすと、ここの データは 前の アドレスの データに いれかわるよ。";
    const col = document.createElement("div");
    col.className = "col";
    col.append(btn("🚚 うつす（いれかえる）", "primary", () => { modal.remove(); void doMove(); }), btn("やめる（ここの データの まま）", "", () => modal.remove()));
    box.append(h, n, col);
    modal.appendChild(box);
    document.body.appendChild(modal);
    return;
  }
  // 新しいアドレス: まだ データが 無い時（または 前のアドレスから 来た時）は、はりつけて うつせる
  if (location.origin === NEW_HOME && (empty || new URLSearchParams(location.search).has("from"))) {
    const t = document.createElement("div");
    t.textContent = "🚚 前の アドレス（github.io）で あそんでいた？ そこで「データを もって ひっこす」を おすと 出る 8文字の「ひっこし番号」を ここに 入れてね";
    const ta = document.createElement("input");
    ta.className = "text big";
    ta.maxLength = 12;
    ta.autocomplete = "off";
    ta.placeholder = "れい: K7QM-3XPA";
    bar.append(t, ta, btn("🚚 データを うつす", "primary", async () => {
      try {
        const n = await importAny(ta.value);
        toast(`🚚 ${n}こ うつしたよ！`);
        setTimeout(() => { location.href = `${NEW_HOME}/`; }, 900);
      } catch (e) { toast((e as Error).message === "引き継ぎコードではありません" ? "8文字の ひっこし番号を 入れてね（前の アドレスで「🚚 データを もって ひっこす」を おすと 出るよ）" : `うつせなかったよ（${(e as Error).message}）`); }
    }), btn("とじる", "", () => { bar.hidden = true; }));
    bar.hidden = false;
  }
}
setupMove();

// 版（古い版が のこっていないか 確かめる用）
const BUILD = typeof __BUILD__ === "string" ? __BUILD__ : "テスト";
document.getElementById("buildInfo")!.textContent = `ばん: ${BUILD}`;
// 公開中の版と くらべて、古ければ 読みこみなおす（iPhone の ホーム画面アプリは 古い版のまま 動きつづけることがあるため）。
// 開いた時と、アプリに もどってきた時に 調べる。読みこみなおしは 1回だけ（同じ版で くりかえさない）
async function checkVersion() {
  if (location.protocol === "file:") return;
  try {
    const r = await fetch(`./version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return;
    const { build } = (await r.json()) as { build?: string };
    if (!build || build === BUILD) return;
    const tried = sessionStorage.getItem("doodle-arena:reloadFor");
    if (tried === build) { toast(`あたらしい ばん（${build}）が あるよ。アプリを とじて ひらきなおしてね`); return; }
    sessionStorage.setItem("doodle-arena:reloadFor", build);
    location.reload();
  } catch { /* オフラインなど: そのまま遊べる */ }
}
void checkVersion();

// 遊んだ人の数を 数える: 1日に1回だけ「あそんだよ」をサーバーに送る（中身は 端末ごとの ばらばらの番号を 伏せた値だけ）
function sayHello() {
  const day = new Date().toISOString().slice(0, 10); // サーバーと同じ 世界時の 日付
  const k = "doodle-arena:helloDay";
  try { if (localStorage.getItem(k) === day) return; } catch { return; }
  void api.hello().then(() => { try { localStorage.setItem(k, day); } catch { /* 次の日に また送る */ } }).catch(() => { /* 届かなくても 遊ぶのには 関係ない */ });
}
sayHello();
document.addEventListener("visibilitychange", () => { if (!document.hidden) void checkVersion(); });
// iPhone で 何か失敗したら 画面に出す（原因を スクリーンショットで 知るため）
window.addEventListener("error", (e) => toast(`⚠ エラー: ${(e as ErrorEvent).message ?? ""}`.slice(0, 120)));
window.addEventListener("unhandledrejection", (e) => toast(`⚠ エラー: ${String((e as PromiseRejectionEvent).reason ?? "")}`.slice(0, 120)));
// iPhone でも ボタンを 押した時の へこむ見た目を 出す
document.addEventListener("touchstart", () => {}, { passive: true });

// 漢字に ふりがな（メイン画面の下のボタンで なし にできる）
installFurigana();
const furiBtn = document.getElementById("furigana")!;
furiBtn.textContent = furiganaOn() ? "あ ふりがな: あり" : "あ ふりがな: なし";
furiBtn.addEventListener("click", () => { setFurigana(!furiganaOn()); location.reload(); });
render();
