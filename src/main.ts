import { CANVAS_SIZE, DEFAULT_PARAMS, detect, type DetectParams, type DetectResult, type Stroke } from "./detect";
import { cutParts, drawStroke, renderStrokes } from "./parts";
import { SAMPLES } from "./samples";
import { startBattle } from "./battle/battle";
import { Sfx } from "./battle/audio";
import { buildCharacter } from "./battle/character";
import { EFFECTS, specialCost, type EffectId } from "./sim/special";
import { MELEE_EFFECTS, meleeCost, type MeleeEffectId } from "./sim/melee";
import { describeShape, fighterShape } from "./shape";
import { PERSONAS } from "./sim/ai";
import { DEFAULT_STATS, STAT_BUDGET, STAT_KEYS, STAT_LABELS, STAT_MAX, statEffects, statTotal, type Stats } from "./sim/stats";
import type { Personality } from "./sim/world";
import { deleteCharacter, loadDraft, loadRoster, normalize, saveCharacter, saveDraft, thumbnail, type CharacterData } from "./roster";
import { applyStageResult, expToNext, exportCode, importCode, LEVEL_CAP, loadProfile, loadStory, requestPersist, type Reward } from "./progress";
import { ALL_STAGES, CHAPTERS, isUnlocked, UPCOMING, type Stage } from "./story";

const STORAGE_KEY = "doodle-arena:proto1";
const COLORS = ["#222222", "#e03131", "#1c7ed6", "#f2c200", "#2f9e44", "#ae3ec9", "#f08c00"];
const HAND_COLORS = ["#e8590c", "#f76707", "#d9480f", "#fd7e14", "#c2255c"];
const FOOT_COLORS = ["#1c7ed6", "#1971c2", "#3b5bdb", "#0c8599", "#5f3dc4"];
const TORSO_COLOR = "#9aa0a6";

type View = "draw" | "detect" | "anim" | "char" | "battle";
const SPECIAL_BUDGET = 20; // 必殺ポイント（仮）。全効果は付けられない

const canvas = document.getElementById("view") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const resultEl = document.getElementById("result")!;
const legendEl = document.getElementById("legend")!;
const drawTools = document.getElementById("drawTools")!;
const stageEl = document.querySelector(".stage") as HTMLElement;
const battleSetup = document.getElementById("battleSetup")!;
const charSetup = document.getElementById("charSetup")!;

let strokes: Stroke[] = load();
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
  detected = { res, parts: cutParts(strokes, res).canvases };
  const hands = res.limbs.filter((l) => l.kind === "hand").length;
  const feet = res.limbs.filter((l) => l.kind === "foot").length;
  const notes: string[] = [];
  if (strokes.length && hands === 0) notes.push("手なし→体当たりで攻撃");
  if (strokes.length && feet === 0) notes.push("足なし→転がって移動");
  resultEl.textContent = strokes.length ? `手 ${hands}本・足 ${feet}本${notes.length ? "（" + notes.join("／") + "）" : ""}` : "まだ何も描かれていません";
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
    // 確定した線は1枚の画像にまとめておく（塗りつぶしを描くたびに計算し直さない）
    if (committedFor !== strokes || committedLen !== strokes.length) {
      committed = renderStrokes(strokes);
      committedFor = strokes;
      committedLen = strokes.length;
    }
    ctx.drawImage(committed, 0, 0);
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
  const panel = v === "battle" || v === "char";
  stageEl.hidden = panel;
  battleSetup.hidden = v !== "battle";
  charSetup.hidden = v !== "char";
  if (v === "char") {
    resultEl.textContent = strokes.length ? "" : "絵がまだ無いので、特徴は「棒人間」で表示しています（描くタブで描いてください）";
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
  const [x, y] = toCanvas(e);
  if (filling) {
    strokes.push({ color, width: 0, points: [Math.round(x), Math.round(y)], fill: true });
    save();
    render();
    return;
  }
  canvas.setPointerCapture(e.pointerId);
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
  strokes.pop();
  save();
  render();
});
// 確認ダイアログが使えない環境もあるので、2回押しで全消去する。
const clearBtn = document.getElementById("clear")!;
let clearArmed = 0;
clearBtn.addEventListener("click", () => {
  if (strokes.length && !clearArmed) {
    clearBtn.textContent = "もう一度押すと消えます";
    clearArmed = window.setTimeout(() => { clearArmed = 0; clearBtn.textContent = "全部消す"; }, 2500);
    return;
  }
  clearTimeout(clearArmed);
  clearArmed = 0;
  clearBtn.textContent = "全部消す";
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

// --- キャラ（編集中のキャラ） ---
const draft = loadDraft();
const editor: CharacterData = normalize({ ...(draft ?? {}), name: draft?.name ?? "", special: draft?.special ?? ["homing"], melee: draft?.melee ?? ["tornado"] });
let editId: string | null = draft?.id && loadRoster().some((c) => c.id === draft.id) ? draft.id : null;
const persistDraft = () => saveDraft({ ...editor, id: editId ?? undefined, strokes: [] });

const nameInput = document.getElementById("charName") as HTMLInputElement;
nameInput.value = editor.name === "名無し" ? "" : editor.name;
nameInput.addEventListener("input", () => { editor.name = nameInput.value.slice(0, 16); persistDraft(); });

function renderTraits() {
  const mine = strokes.length ? strokes : SAMPLES["棒人間"]();
  const traitsEl = document.getElementById("myTraits")!;
  traitsEl.innerHTML = "";
  for (const line of describeShape(fighterShape(detect(mine, params)))) {
    const li = document.createElement("li");
    li.textContent = line;
    traitsEl.appendChild(li);
  }
}

// 能力値: 合計が予算を超えないようにスライダーを抑える
const statsEl = document.getElementById("stats")!;
const statInfo = document.getElementById("statInfo")!;
const STAT_NOTE: Record<keyof Stats, (v: number) => string> = {
  attack: (v) => `与えるダメージ ×${statEffects({ ...DEFAULT_STATS, attack: v }).dealt.toFixed(2)}`,
  defense: (v) => `受けるダメージ ×${statEffects({ ...DEFAULT_STATS, defense: v }).taken.toFixed(2)}`,
  speed: (v) => `移動 ×${statEffects({ ...DEFAULT_STATS, speed: v }).speed.toFixed(2)}`,
  hp: (v) => `体力 ${statEffects({ ...DEFAULT_STATS, hp: v }).maxHp}`,
  stamina: (v) => `スタミナ ${statEffects({ ...DEFAULT_STATS, stamina: v }).maxStamina}・回復 ×${statEffects({ ...DEFAULT_STATS, stamina: v }).regen.toFixed(2)}`,
};
const statInputs: Partial<Record<keyof Stats, { input: HTMLInputElement; val: HTMLElement; note: HTMLElement }>> = {};
for (const k of STAT_KEYS) {
  const row = document.createElement("div");
  row.className = "stat";
  const lab = document.createElement("label");
  lab.textContent = STAT_LABELS[k];
  lab.htmlFor = `stat-${k}`;
  const input = document.createElement("input");
  input.type = "range"; input.min = "0"; input.max = String(STAT_MAX); input.step = "1"; input.id = `stat-${k}`;
  const val = document.createElement("b");
  const note = document.createElement("small");
  input.addEventListener("input", () => {
    // 予算を超える分は、ほかの能力値（高いものから）を1ずつ下げて捻出する
    editor.stats[k] = Number(input.value);
    let over = statTotal(editor.stats) - STAT_BUDGET;
    while (over > 0) {
      const donor = STAT_KEYS.filter((o) => o !== k && editor.stats[o] > 0).sort((a, b) => editor.stats[b] - editor.stats[a])[0];
      if (!donor) { editor.stats[k] -= over; break; }
      editor.stats[donor]--;
      over--;
    }
    syncStats();
    persistDraft();
  });
  row.append(lab, input, val, note);
  statsEl.appendChild(row);
  statInputs[k] = { input, val, note };
}
function syncStats() {
  for (const k of STAT_KEYS) {
    const r = statInputs[k]!;
    r.input.value = String(editor.stats[k]);
    r.val.textContent = String(editor.stats[k]);
    r.note.textContent = STAT_NOTE[k](editor.stats[k]);
  }
  statInfo.textContent = `残り ${STAT_BUDGET - statTotal(editor.stats)} / ${STAT_BUDGET} ポイント`;
}

// 性格
const persSel = document.getElementById("personality") as HTMLSelectElement;
const persDesc = document.getElementById("personalityDesc")!;
for (const [k, p] of Object.entries(PERSONAS)) persSel.add(new Option(p.label, k));
persSel.addEventListener("change", () => { editor.personality = persSel.value as Personality; syncPersonality(); persistDraft(); });
function syncPersonality() {
  persSel.value = editor.personality;
  persDesc.textContent = PERSONAS[editor.personality].desc;
}

// 必殺技
document.querySelectorAll<HTMLButtonElement>("[data-stype]").forEach((b) =>
  b.addEventListener("click", () => {
    editor.specialType = b.dataset.stype as "ranged" | "melee";
    renderEffects();
    persistDraft();
  }),
);
const effectsEl = document.getElementById("effects")!;
const costInfo = document.getElementById("costInfo")!;
function renderEffects() {
  document.querySelectorAll("[data-stype]").forEach((o) => o.classList.toggle("on", (o as HTMLElement).dataset.stype === editor.specialType));
  effectsEl.innerHTML = "";
  const melee = editor.specialType === "melee";
  const list: { id: string; name: string; cost: number }[] = melee ? MELEE_EFFECTS : EFFECTS;
  const sel: string[] = melee ? editor.melee : editor.special;
  const used = melee ? meleeCost(editor.melee) : specialCost(editor.special);
  costInfo.textContent = `${used} / ${SPECIAL_BUDGET} ポイント`;
  for (const e of list) {
    const on = sel.includes(e.id);
    const fits = on || used + e.cost <= SPECIAL_BUDGET;
    const lab = document.createElement("label");
    lab.className = on ? "on" : fits ? "" : "off";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = on;
    box.disabled = !fits;
    box.addEventListener("change", () => {
      if (melee) editor.melee = box.checked ? [...editor.melee, e.id as MeleeEffectId] : editor.melee.filter((x) => x !== e.id);
      else editor.special = box.checked ? [...editor.special, e.id as EffectId] : editor.special.filter((x) => x !== e.id);
      renderEffects();
      persistDraft();
    });
    const txt = document.createElement("span");
    txt.innerHTML = `${e.name} <small>${e.cost}</small>`;
    lab.append(box, txt);
    effectsEl.appendChild(lab);
  }
}

function syncEditor() {
  nameInput.value = editor.name === "名無し" ? "" : editor.name;
  syncStats();
  syncPersonality();
  renderEffects();
}
syncEditor();

// 保存・新規・一覧
const saveMsg = document.getElementById("saveMsg")!;
document.getElementById("saveChar")!.addEventListener("click", () => {
  if (!strokes.length) { saveMsg.textContent = "絵が描かれていません。「描く」タブで描いてから保存してください。"; return; }
  const id = editId ?? normalize({}).id;
  const ok = saveCharacter({ ...editor, id, name: editor.name || "名無し", strokes: strokes.map((s) => ({ ...s, points: [...s.points] })) });
  editId = id;
  persistDraft();
  saveMsg.textContent = ok ? `「${editor.name || "名無し"}」を保存しました。` : "保存できませんでした（ブラウザの設定で保存が禁止されている可能性があります）。";
  renderRoster();
});
const newBtn = document.getElementById("newChar")!;
let newArmed = 0;
newBtn.addEventListener("click", () => {
  if (strokes.length && !newArmed) {
    newBtn.textContent = "もう一度押すと絵を消して新規";
    newArmed = window.setTimeout(() => { newArmed = 0; newBtn.textContent = "新しいキャラ"; }, 2500);
    return;
  }
  clearTimeout(newArmed);
  newArmed = 0;
  newBtn.textContent = "新しいキャラ";
  editId = null;
  Object.assign(editor, normalize({ name: "", special: ["homing"], melee: ["tornado"] }));
  editor.name = "";
  strokes = [];
  save();
  syncEditor();
  renderTraits();
  renderRoster();
  persistDraft();
  saveMsg.textContent = "新しいキャラを作ります。「描く」タブで絵を描いてください。";
});

function loadIntoEditor(c: CharacterData) {
  editId = c.id;
  Object.assign(editor, normalize(c));
  strokes = c.strokes.map((s) => ({ ...s, points: [...s.points] }));
  save();
  syncEditor();
  renderTraits();
  renderRoster();
  persistDraft();
  saveMsg.textContent = `「${c.name}」を読み込みました。`;
}

const rosterEl = document.getElementById("roster")!;
function renderRoster() {
  const list = loadRoster();
  rosterEl.innerHTML = "";
  if (!list.length) {
    const li = document.createElement("li");
    li.textContent = "まだありません。描いて「保存」を押すとここに並びます。";
    rosterEl.appendChild(li);
    return;
  }
  for (const c of list) {
    const li = document.createElement("li");
    li.classList.toggle("on", c.id === editId);
    const img = document.createElement("img");
    if (c.thumb) img.src = c.thumb;
    img.alt = "";
    const nm = document.createElement("span");
    nm.className = "nm";
    nm.textContent = c.name;
    const sub = document.createElement("span");
    sub.className = "sub";
    sub.textContent = `${PERSONAS[c.personality].label}・${c.specialType === "melee" ? "近接" : "遠距離"}必殺`;
    nm.appendChild(sub);
    const edit = document.createElement("button");
    edit.textContent = "編集";
    edit.addEventListener("click", () => loadIntoEditor(c));
    const del = document.createElement("button");
    del.textContent = "削除";
    let armed = 0;
    del.addEventListener("click", () => {
      if (!armed) { del.textContent = "本当に削除"; armed = window.setTimeout(() => { armed = 0; del.textContent = "削除"; }, 2500); return; }
      clearTimeout(armed);
      deleteCharacter(c.id);
      if (editId === c.id) editId = null;
      renderRoster();
    });
    li.append(img, nm, edit, del);
    rosterEl.appendChild(li);
  }
}

// --- 戦う ---
const cpuSel = document.getElementById("cpuChar") as HTMLSelectElement;
function refreshCpuOptions() {
  const keep = cpuSel.value;
  cpuSel.innerHTML = "";
  cpuSel.add(new Option("ランダム（CPU が作ったキャラ）", ""));
  const g1 = document.createElement("optgroup");
  g1.label = "CPU が作ったキャラ";
  for (const name of Object.keys(SAMPLES)) g1.appendChild(new Option(name, `sample:${name}`));
  cpuSel.appendChild(g1);
  const saved = loadRoster();
  if (saved.length) {
    const g2 = document.createElement("optgroup");
    g2.label = "保存したキャラ";
    for (const c of saved) g2.appendChild(new Option(c.name, `saved:${c.id}`));
    cpuSel.appendChild(g2);
  }
  cpuSel.value = [...cpuSel.options].some((o) => o.value === keep) ? keep : "";
}

// CPU の必殺技は型をランダムに選び、予算内でランダムに組む
function randomSpecial(): EffectId[] {
  const pool = [...EFFECTS].sort(() => Math.random() - 0.5);
  const out: EffectId[] = [];
  for (const e of pool) if (specialCost([...out, e.id]) <= SPECIAL_BUDGET) out.push(e.id);
  return out;
}
function randomMelee(): MeleeEffectId[] {
  const pool = [...MELEE_EFFECTS].sort(() => Math.random() - 0.5);
  const out: MeleeEffectId[] = [];
  for (const e of pool) if (meleeCost([...out, e.id]) <= SPECIAL_BUDGET) out.push(e.id);
  return out;
}
// CPU が作ったキャラ: 能力値と性格もランダム
function randomStats(): Stats {
  const st: Stats = { attack: 0, defense: 0, speed: 0, hp: 0, stamina: 0 };
  for (let n = 0; n < STAT_BUDGET; ) {
    const k = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)];
    if (st[k] < STAT_MAX) { st[k]++; n++; }
  }
  return st;
}
const PERS_KEYS = Object.keys(PERSONAS) as Personality[];

function applyData(build: ReturnType<typeof buildCharacter>, c: CharacterData) {
  build.cfg.stats = c.stats;
  build.cfg.personality = c.personality;
  build.cfg.specialType = c.specialType;
  build.cfg.special = c.special;
  build.cfg.melee = c.melee;
}

// 自分のキャラ: "" = 編集中のキャラ（絵が無ければ棒人間）/ "saved:id" = 保存したキャラ
function buildPlayer(choice: string) {
  const saved = choice.startsWith("saved:") ? loadRoster().find((c) => c.id === choice.slice(6)) : undefined;
  if (saved) {
    const b = buildCharacter(saved.name, saved.strokes, saved.special, params);
    applyData(b, saved);
    return b;
  }
  const mine = strokes.length ? strokes : SAMPLES["棒人間"]();
  const b = buildCharacter(editor.name || "あなた", mine, editor.special, params);
  applyData(b, editor);
  return b;
}

const sfx = new Sfx();
document.getElementById("startBattle")!.addEventListener("click", () => {
  sfx.unlock(); // 効果音はボタン操作の中でしか有効にできない
  const player = buildPlayer("");

  const names = Object.keys(SAMPLES);
  const v = cpuSel.value || `sample:${names[Math.floor(Math.random() * names.length)]}`;
  let cpu: ReturnType<typeof buildCharacter>;
  const saved = v.startsWith("saved:") ? loadRoster().find((c) => c.id === v.slice(6)) : undefined;
  if (saved) {
    cpu = buildCharacter(saved.name, saved.strokes, saved.special, params);
    applyData(cpu, saved);
  } else {
    const name = v.slice(7);
    cpu = buildCharacter(`CPU（${name}）`, SAMPLES[name](), randomSpecial(), params);
    applyData(cpu, normalize({
      name, stats: randomStats(), personality: PERS_KEYS[Math.floor(Math.random() * PERS_KEYS.length)],
      specialType: Math.random() < 0.5 ? "melee" : "ranged", special: cpu.cfg.special, melee: randomMelee(),
    }));
  }
  runBattle({
    player,
    cpu,
    spectate: (document.getElementById("spectate") as HTMLInputElement).checked,
    seed: (Math.random() * 0xffffffff) >>> 0,
    sfx,
  });
});

// --- 画面の移動（メイン ⇄ 各画面）。端末やブラウザの「戻る」でも1つ前に戻る ---
type Screen = "home" | "story" | "make" | "free" | "transfer";
const SCREEN_TITLES: Record<Screen, string> = { home: "", story: "ストーリー", make: "キャラを作る", free: "自由バトル", transfer: "引き継ぎ" };
const homeEl = document.getElementById("home")!;
const storyEl = document.getElementById("storyScreen")!;
const transferEl = document.getElementById("transferScreen")!;
const workspaceEl = document.getElementById("workspace")!;
const topbar = document.getElementById("topbar")!;
const screenTitle = document.getElementById("screenTitle")!;
const makeTabs = document.getElementById("makeTabs")!;
let screen: Screen = "home";
let pushed = 0; // 自分で積んだ履歴の数（0 なら「戻る」はメインへ）
let battleHandle: { close: () => void } | null = null;

function show(s: Screen) {
  screen = s;
  homeEl.hidden = s !== "home";
  storyEl.hidden = s !== "story";
  transferEl.hidden = s !== "transfer";
  workspaceEl.hidden = s !== "make" && s !== "free";
  topbar.hidden = s === "home";
  screenTitle.textContent = SCREEN_TITLES[s];
  makeTabs.hidden = s !== "make";
  if (s === "home") renderProfile();
  else if (s === "story") renderStory();
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
}

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

function rewardHtml(r: Reward, stage: Stage): string {
  const p = loadProfile();
  let h = `<div class="exp">経験値 +${r.exp}</div>`;
  if (r.levelsUp) h += `<div class="up">レベルアップ！ Lv ${p.level}</div>`;
  if (r.points) h += `<div>スキルポイント +${r.points}（スキルツリーは準備中・ためておけます）</div>`;
  if (r.firstClear) {
    const next = ALL_STAGES[ALL_STAGES.indexOf(stage) + 1];
    h += `<div>${next ? `次のステージ「${next.enemy}」が開きました` : "ここまでクリア！ 続きの章は準備中です"}</div>`;
  }
  return h;
}

function startStage(stage: Stage) {
  sfx.unlock();
  const player = buildPlayer(storyCharSel.value);
  const cpu = buildCharacter(stage.enemy, stage.strokes(), stage.special, DEFAULT_PARAMS);
  // 敵の能力値は標準の総ポイントを超えることがあるので、整えずにそのまま使う
  applyData(cpu, { stats: stage.stats, personality: stage.personality, specialType: stage.specialType, special: stage.special, melee: stage.melee } as CharacterData);
  runBattle({
    player,
    cpu,
    spectate: false,
    seed: (Math.random() * 0xffffffff) >>> 0,
    sfx,
    cpuLevel: stage.ai,
    exitLabel: "ステージ選択へ",
    onResult: (winner) => rewardHtml(applyStageResult(stage.no, stage.id, !!stage.boss, winner === 0), stage),
  });
}

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
render();
