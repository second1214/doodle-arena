// オンライン画面: たたかう / ランキング / かんせん / こうかい / ルール。
// サーバーにつながらない・人が少ない時は、CPU の「門番」キャラで遊べる（空っぽにしない）。
import type { CharacterBuild } from "../battle/character";
import { buildCharacter } from "../battle/character";
import { DEFAULT_PARAMS, type DetectParams, type Stroke } from "../detect";
import { CPU_CHARS, type CpuChar } from "../cpuChars";
import { buildSpecial, equipCosts, hashStr, makePart, seededRnd, SPECIAL_BUDGET, type Part, type Rarity } from "../items";
import { addShards, dropPartOfRarity, type DropResult } from "../inventory";
import { frontierStage, gainExp, loadProfile, totalPoints } from "../progress";
import { thumbnail } from "../roster";
import { sumBoost } from "../sim/stats";
import { autoTree, boostOf } from "../tree";
import { api, buildFromSnapshot, makeSnapshot, OnlineError, tooNew, type ListChar } from "./client";
import { TIERS, tierOf } from "./tiers";
import type { Snapshot } from "./snapshot";

export interface OnlineDeps {
  choices: () => { value: string; label: string }[]; // 使うキャラの選択肢
  buildPlayer: (choice: string) => CharacterBuild;
  strokesOf: (choice: string) => { name: string; strokes: Stroke[] } | null; // 公開する絵（絵の無い「編集中」は null）
  params: () => DetectParams;
  runBattle: (o: {
    player: CharacterBuild; cpu: CharacterBuild; spectate: boolean; seed: number; cpuLine?: string; exitLabel?: string; fastButton?: boolean;
    onResult?: (winner: number) => string; onResultShown?: (el: HTMLElement) => void;
  }) => void;
  partChipHtml: (p: Part) => string;
  unlockSound: () => void;
}

const ROOM_RARITY: Rarity[] = ["D", "C", "B", "B", "A"]; // 部屋ごとの門番のパーツ・1日1回の報酬のレア度
const DAILY_FULL = 10; // 報酬の経験値が出る1日の対戦数
const RECENT_KEY = "doodle-arena:onlineRecent";
const DAILY_KEY = "doodle-arena:onlineDaily";
const SEEN_KEY = "doodle-arena:onlineSeen";
const MINE_KEY = "doodle-arena:onlineMine"; // 自分が公開したキャラの id（相手の候補から外す）
const myIds = () => readJson<string[]>(MINE_KEY, []);

const readJson = <T>(k: string, d: T): T => { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : d; } catch { return d; } };
const writeJson = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 保存できない環境 */ } };
const todayStr = () => new Date().toISOString().slice(0, 10);
function daily(): { day: string; matches: number; partGiven: boolean; shards: number } {
  const d = readJson(DAILY_KEY, { day: "", matches: 0, partGiven: false, shards: 0 });
  return d.day === todayStr() ? d : { day: todayStr(), matches: 0, partGiven: false, shards: 0 };
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// 相手の候補: サーバーの公開キャラ、足りなければ CPU の門番
type Opp = { kind: "human"; c: ListChar } | { kind: "cpu"; c: CpuChar; tier: number };

// 門番: CPU キャラを部屋の強さで作り直す（部屋の真ん中くらいのポイントを好みの枝へ、パーツはその部屋のレア度）
export function buildGatekeeper(c: CpuChar, tier: number): CharacterBuild {
  const b = buildCharacter(c.name, c.strokes(), [], DEFAULT_PARAMS);
  const parts: Part[] = [];
  c.parts.forEach((k, i) => {
    const p = makePart(k, ROOM_RARITY[tier], seededRnd(hashStr(`${c.id}#${tier}#${i}`)), `${c.id}#${tier}#${i}`);
    if (equipCosts([...parts, p]).reduce((a, x) => a + x, 0) <= SPECIAL_BUDGET) parts.push(p);
  });
  const sp = buildSpecial(parts, c.specialType);
  const points = Math.min(44, TIERS[tier].min + 4);
  b.cfg.personality = c.personality;
  b.cfg.specialType = c.specialType;
  b.cfg.special = sp.special;
  b.cfg.melee = sp.melee;
  b.cfg.specialMod = sp.mod;
  b.cfg.boost = sumBoost([boostOf(autoTree(points, c.prefer)), { chargeNeed: sp.chargeDelta }]);
  return b;
}

const thumbCache = new Map<string, string>();
function thumbOf(key: string, strokes: () => Stroke[]): string {
  if (!thumbCache.has(key)) thumbCache.set(key, thumbnail(strokes()));
  return thumbCache.get(key)!;
}
const oppThumb = (o: Opp) => (o.kind === "human" ? thumbOf(`h:${o.c.id}`, () => o.c.thumb as Stroke[]) : thumbOf(`c:${o.c.id}`, o.c.strokes));
const oppName = (o: Opp) => o.c.name;

export function initOnline(root: HTMLElement, deps: OnlineDeps) {
  let tab: "fight" | "rank" | "watch" | "publish" | "rules" = "fight";
  let online: "unknown" | "on" | "off" | "stop" = "unknown";
  let choice = "";
  let candidates: Opp[] = [];
  let rankTier = -1;
  let watchTier = -1;
  let agreed = false;

  root.innerHTML = `
    <div class="ostatus" id="oStatus"></div>
    <div class="onews" id="oNews" hidden></div>
    <div class="seg otabs" role="tablist">
      <button type="button" data-otab="fight" class="on"><b>⚔️</b>たたかう</button>
      <button type="button" data-otab="rank"><b>🏆</b>ランキング</button>
      <button type="button" data-otab="watch"><b>👀</b>かんせん</button>
      <button type="button" data-otab="publish"><b>📮</b>こうかい</button>
      <button type="button" data-otab="rules"><b>📜</b>ルール</button>
    </div>
    <div id="oBody"></div>`;
  const body = root.querySelector<HTMLElement>("#oBody")!;
  const statusEl = root.querySelector<HTMLElement>("#oStatus")!;
  const newsEl = root.querySelector<HTMLElement>("#oNews")!;
  root.querySelectorAll<HTMLButtonElement>("[data-otab]").forEach((b) => b.addEventListener("click", () => {
    tab = b.dataset.otab as typeof tab;
    root.querySelectorAll("[data-otab]").forEach((x) => x.classList.toggle("on", x === b));
    render();
  }));

  const myTier = () => tierOf(totalPoints(loadProfile()));
  function renderStatus() {
    const t = myTier();
    const st = online === "on" ? "🟢 オンライン" : online === "off" ? "⚪ オフライン（門番と たたかえるよ）" : online === "stop" ? "🟠 おやすみ中（門番と たたかえるよ）" : "…つないでいます";
    statusEl.innerHTML = `<span class="room" style="--tc:${TIERS[t].color}">${TIERS[t].name}の へや</span><small>${st}</small>`;
  }

  // 公開したキャラの「るすのあいだに」: 前に見た時からの戦績の差を出し、守り切った分だけかけらをもらう（1日20まで）
  async function checkNews() {
    try {
      const { chars } = await api.mine();
      writeJson(MINE_KEY, chars.map((c) => c.id));
      const seen = readJson<Record<string, { w: number; l: number }>>(SEEN_KEY, {});
      const lines: string[] = [];
      let defended = 0;
      for (const c of chars) {
        const s = seen[c.id];
        if (s) {
          const w = c.wins - s.w, l = c.losses - s.l;
          if (w + l > 0) lines.push(`${esc(c.name)}が るすのあいだに ${w + l}回 たたかったよ！ ${w}回 まもった！`);
          defended += Math.max(0, w);
        }
        seen[c.id] = { w: c.wins, l: c.losses };
        if (c.hidden) lines.push(`${esc(c.name)}は 👎が多かったので かくれています`);
      }
      writeJson(SEEN_KEY, seen);
      if (defended > 0) {
        const d = daily();
        const give = Math.min(defended * 2, 20 - d.shards);
        if (give > 0) { addShards(give); d.shards += give; writeJson(DAILY_KEY, d); lines.push(`まもったごほうびに かけら +${give}`); }
      }
      newsEl.hidden = !lines.length;
      newsEl.innerHTML = lines.map((l) => `<div>📣 ${l}</div>`).join("");
    } catch { /* オフラインなら何もしない */ }
  }

  async function refreshOnline() {
    try { const h = await api.health(); online = h.stop ? "stop" : "on"; }
    catch { online = "off"; }
    renderStatus();
  }

  // --- たたかう ---
  async function loadCandidates() {
    const recent = readJson<string[]>(RECENT_KEY, []);
    const out: Opp[] = [];
    if (online === "on") {
      try {
        const { chars } = await api.candidates(myTier(), [...myIds(), ...recent]);
        for (const c of chars) out.push({ kind: "human", c });
      } catch (e) { if (e instanceof OnlineError && e.status === 0) online = "off"; }
    }
    // 足りない分は門番（同じ部屋）
    const pool = CPU_CHARS.filter((c) => !c.bossStage).sort(() => Math.random() - 0.5);
    for (const c of pool) { if (out.length >= 3) break; out.push({ kind: "cpu", c, tier: myTier() }); }
    candidates = out;
  }

  function oppCard(o: Opp, onPick: () => void): HTMLElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ocard";
    const badge = o.kind === "cpu" ? `<span class="tag cpu">門番</span>` : o.c.games < 10 ? `<span class="tag new">おためし</span>` : "";
    const stat = o.kind === "human" ? `★${o.c.rating}・${o.c.wins}勝${o.c.losses}敗` : `${TIERS[o.tier].name}の 門番`;
    b.innerHTML = `${badge}<img alt=""><b></b><small>${stat}</small>`;
    b.querySelector("img")!.src = oppThumb(o);
    b.querySelector("b")!.textContent = oppName(o);
    b.addEventListener("click", onPick);
    return b;
  }

  async function opponentBuild(o: Opp): Promise<{ build: CharacterBuild; snap?: Snapshot }> {
    if (o.kind === "cpu") return { build: buildGatekeeper(o.c, o.tier) };
    const { char } = await api.get(o.c.id);
    if (tooNew(char.snap)) throw new OnlineError("このキャラと たたかうには ゲームを さいしんに してね（ページを よみこみなおす）", 0);
    return { build: buildFromSnapshot(char.snap), snap: char.snap };
  }

  async function fight(o: Opp) {
    deps.unlockSound();
    let opp: { build: CharacterBuild };
    try { opp = await opponentBuild(o); }
    catch (e) { alertBox((e as Error).message); return; }
    if (o.kind === "human") writeJson(RECENT_KEY, [o.c.id, ...readJson<string[]>(RECENT_KEY, []).filter((x) => x !== o.c.id)].slice(0, 10));
    const player = deps.buildPlayer(choice);
    deps.runBattle({
      player, cpu: opp.build, spectate: false, seed: (Math.random() * 0xffffffff) >>> 0, exitLabel: "オンラインへ",
      onResult: (winner) => rewardForMatch(o, winner),
      onResultShown: (el) => attachBad(el, o),
    });
  }

  // 対戦の報酬: 経験値は「いちばん先のステージを もう一度かった時」の半分（=初クリアの1/4）。負け・引き分けはその1/4。1日10戦まで。
  // パーツはその日の初勝利で1つ（部屋のレア度。マスターは4回に1回 S）。公開キャラなら結果をサーバーへ（相手のレーティングが動く）
  function rewardForMatch(o: Opp, winner: number): string {
    const won = winner === 0;
    const res = won ? "win" : winner === 1 ? "lose" : "draw";
    if (o.kind === "human") api.report(o.c.id, res, 1000).catch(() => { /* オフラインなら記録しない */ });
    const d = daily();
    d.matches++;
    const base = 40 + 12 * frontierStage();
    let html = "";
    if (d.matches <= DAILY_FULL) {
      const exp = Math.round(won ? base / 4 : base / 16);
      const g = gainExp(exp);
      html += `<div class="exp">経験値 +${exp}</div>`;
      if (g.levelsUp) html += `<div class="up">レベルアップ！ Lv ${loadProfile().level}</div>`;
    } else html += `<div>今日の ごほうびは おわり（また明日）</div>`;
    if (won && !d.partGiven) {
      d.partGiven = true;
      const t = myTier();
      const r: Rarity = t === 4 && Math.random() < 0.25 ? "S" : ROOM_RARITY[t];
      const drop: DropResult = dropPartOfRarity(r);
      if (drop.got.length) html += `<div class="drop"><div>今日の はじめての勝利！ パーツを手に入れた</div>${drop.got.map(deps.partChipHtml).join("")}</div>`;
    }
    writeJson(DAILY_KEY, d);
    if (o.kind === "human") html += `<button type="button" class="badbtn" data-bad>👎 よくない絵・名前を しらせる</button>`;
    return html;
  }

  function attachBad(el: HTMLElement, o: Opp) {
    const btn = el.querySelector<HTMLButtonElement>("[data-bad]");
    if (!btn || o.kind !== "human") return;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try { await api.bad(o.c.id); btn.textContent = "しらせたよ。ありがとう"; }
      catch (e) { btn.textContent = (e as Error).message; }
    });
  }

  function alertBox(msg: string) {
    const n = body.querySelector<HTMLElement>(".omsg");
    if (n) n.textContent = msg;
  }

  function choiceSelect(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "field";
    wrap.innerHTML = `<label class="label" for="oChar">つかう キャラ</label><select id="oChar"></select>`;
    const sel = wrap.querySelector("select")!;
    for (const c of deps.choices()) sel.add(new Option(c.label, c.value));
    if ([...sel.options].some((o) => o.value === choice)) sel.value = choice; else choice = sel.value;
    sel.addEventListener("change", () => { choice = sel.value; });
    return wrap;
  }

  async function renderFight() {
    body.innerHTML = "";
    body.appendChild(choiceSelect());
    const h = document.createElement("div");
    h.className = "kidhint";
    h.textContent = "あいてを えらんでね（同じへやか ひとつ上のへやの キャラ）";
    const grid = document.createElement("div");
    grid.className = "ogrid";
    grid.textContent = "さがしています…";
    const more = document.createElement("button");
    more.textContent = "🔄 ほかの あいて";
    const msg = document.createElement("div");
    msg.className = "note omsg";
    body.append(h, grid, more, msg);
    const fill = async () => {
      grid.textContent = "さがしています…";
      await loadCandidates();
      grid.innerHTML = "";
      for (const o of candidates) grid.appendChild(oppCard(o, () => fight(o)));
      if (candidates.every((o) => o.kind === "cpu")) msg.textContent = online === "on" ? "このへやには まだ だれも いないよ。門番と たたかって、じぶんのキャラも こうかいしてみよう！" : "";
    };
    more.addEventListener("click", fill);
    await fill();
  }

  // --- ランキング・かんせん（部屋を選ぶ） ---
  function roomSeg(current: number, onPick: (t: number) => void): HTMLElement {
    const seg = document.createElement("div");
    seg.className = "seg rooms";
    TIERS.forEach((t, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t.name;
      b.style.setProperty("--tc", t.color);
      b.classList.toggle("on", i === current);
      b.addEventListener("click", () => onPick(i));
      seg.appendChild(b);
    });
    return seg;
  }

  async function renderRank() {
    if (rankTier < 0) rankTier = myTier();
    body.innerHTML = "";
    body.appendChild(roomSeg(rankTier, (t) => { rankTier = t; renderRank(); }));
    const list = document.createElement("div");
    list.className = "olist";
    list.textContent = "よみこみ中…";
    const msg = document.createElement("div");
    msg.className = "note omsg";
    body.append(list, msg);
    let chars: ListChar[] = [];
    try { chars = (await api.ranking(rankTier)).chars; }
    catch (e) { list.textContent = (e as Error).message; return; }
    list.innerHTML = "";
    if (!chars.length) { list.textContent = "まだ ランキングに のっている キャラが いないよ（こうかいして 24時間たつと のるよ）"; return; }
    const canFight = rankTier === myTier() || rankTier === myTier() + 1;
    chars.forEach((c, i) => {
      const row = document.createElement("div");
      row.className = "orow";
      row.innerHTML = `<b class="no">${i + 1}</b><img alt=""><span class="nm"></span><small>★${c.rating}・${c.wins}勝${c.losses}敗</small><span class="acts"></span>`;
      row.querySelector("img")!.src = thumbOf(`h:${c.id}`, () => c.thumb as Stroke[]);
      row.querySelector(".nm")!.textContent = c.name;
      const acts = row.querySelector(".acts")!;
      const o: Opp = { kind: "human", c };
      if (myIds().includes(c.id)) { const m = document.createElement("small"); m.textContent = "じぶん"; acts.appendChild(m); }
      else if (canFight) { const f = document.createElement("button"); f.textContent = "たたかう"; f.addEventListener("click", () => fight(o)); acts.appendChild(f); }
      const bad = document.createElement("button");
      bad.textContent = "👎";
      bad.title = "よくない絵・名前を しらせる";
      bad.addEventListener("click", async () => { bad.disabled = true; try { await api.bad(c.id); msg.textContent = "しらせたよ。ありがとう"; } catch (e) { msg.textContent = (e as Error).message; } });
      acts.appendChild(bad);
      list.appendChild(row);
    });
    if (!canFight) msg.textContent = "たたかえるのは 自分のへやと ひとつ上のへや だけだよ";
  }

  // かんせん: 「今日の注目カード」＝その部屋の1位と2位。どっちが勝つか予想して、当たれば経験値 +10
  async function renderWatch() {
    if (watchTier < 0) watchTier = myTier();
    body.innerHTML = "";
    body.appendChild(roomSeg(watchTier, (t) => { watchTier = t; renderWatch(); }));
    const box = document.createElement("div");
    box.className = "owatch";
    box.textContent = "よみこみ中…";
    const msg = document.createElement("div");
    msg.className = "note omsg";
    body.append(box, msg);
    let pair: Opp[] = [];
    try {
      const { chars } = await api.ranking(watchTier);
      pair = chars.filter((c) => !myIds().includes(c.id)).slice(0, 2).map((c) => ({ kind: "human", c }) as Opp);
    } catch { /* オフラインなら門番どうし */ }
    const pool = CPU_CHARS.filter((c) => !c.bossStage).sort(() => Math.random() - 0.5);
    while (pair.length < 2) pair.push({ kind: "cpu", c: pool[pair.length], tier: watchTier });
    box.innerHTML = `<div class="kidhint">${pair.every((p) => p.kind === "human") ? "今日の 注目カード！" : "門番どうしの たたかい"}　どっちが かつ？</div><div class="ovs"></div>`;
    const vs = box.querySelector(".ovs")!;
    pair.forEach((o, i) => {
      const card = oppCard(o, () => watch(pair, i));
      vs.appendChild(card);
      if (i === 0) { const v = document.createElement("b"); v.className = "vs"; v.textContent = "VS"; vs.appendChild(v); }
    });
  }

  async function watch(pair: Opp[], guess: number) {
    deps.unlockSound();
    let a: CharacterBuild, b: CharacterBuild;
    try { a = (await opponentBuild(pair[0])).build; b = (await opponentBuild(pair[1])).build; }
    catch (e) { alertBox((e as Error).message); return; }
    deps.runBattle({
      player: a, cpu: b, spectate: true, seed: (Math.random() * 0xffffffff) >>> 0, exitLabel: "オンラインへ", fastButton: true,
      onResult: (winner) => {
        if (winner === 2) return `<div>引き分け！ よそうは はずれ</div>`;
        if (winner === guess) { gainExp(10); return `<div class="exp">よそう的中！ 経験値 +10</div>`; }
        return `<div>よそうは はずれ… つぎは あたるかも</div>`;
      },
    });
  }

  // --- こうかい ---
  async function renderPublish() {
    body.innerHTML = `
      <div class="kcard warn">
        <div class="kh">📮 こうかいする まえに</div>
        <div>この絵と名前は、日本中の しらない人が 見るよ。</div>
        <ul class="traits">
          <li>名前・学校・住所・電話番号・顔は かかないでね</li>
          <li>いやな言葉・えっちな絵・ひとを悪く言う絵は ダメ</li>
          <li>ほかのアニメや ゲームの キャラは ダメ</li>
          <li>👎 が多いと かくれるよ。いつでも 取り下げられるよ</li>
        </ul>
        <label class="check"><input type="checkbox" id="oAgree"${agreed ? " checked" : ""}> わかった（<a href="#" data-rules>ルールを よむ</a>）</label>
      </div>
      <div class="kidhint">こうかいする キャラ（${TIERS[myTier()].name}の へやに 入るよ）</div>
      <div class="olist" id="oPubList"></div>
      <div class="note omsg"></div>
      <div class="kidhint">こうかい中の キャラ</div>
      <div class="olist" id="oMine">よみこみ中…</div>`;
    const agree = body.querySelector<HTMLInputElement>("#oAgree")!;
    body.querySelector("[data-rules]")!.addEventListener("click", (e) => { e.preventDefault(); root.querySelector<HTMLButtonElement>("[data-otab=rules]")!.click(); });
    const list = body.querySelector<HTMLElement>("#oPubList")!;
    const msg = body.querySelector<HTMLElement>(".omsg")!;
    const buttons: HTMLButtonElement[] = [];
    for (const ch of deps.choices()) {
      const src = deps.strokesOf(ch.value);
      const row = document.createElement("div");
      row.className = "orow";
      row.innerHTML = `<img alt=""><span class="nm"></span><span class="acts"></span>`;
      if (src) row.querySelector("img")!.src = thumbOf(`p:${ch.value}:${src.strokes.length}`, () => src.strokes);
      row.querySelector(".nm")!.textContent = ch.label;
      const btn = document.createElement("button");
      btn.className = "primary inline";
      btn.textContent = "こうかい";
      btn.disabled = !agreed || !src;
      if (!src) btn.title = "絵が ないよ";
      btn.addEventListener("click", async () => {
        if (!src) return;
        btn.disabled = true;
        msg.textContent = "こうかい中…";
        try {
          const build = deps.buildPlayer(ch.value);
          const snap = makeSnapshot(build, src.name, src.strokes, deps.params(), totalPoints(loadProfile()));
          const r = await api.publish(snap);
          writeJson(MINE_KEY, [...myIds(), r.id]);
          msg.textContent = `「${src.name}」を ${TIERS[r.tier].name}の へやに こうかいしたよ！ ほかの人が たたかうと ここに 結果が とどくよ`;
          loadMine();
        } catch (e) { msg.textContent = (e as Error).message; }
        btn.disabled = !agreed;
      });
      buttons.push(btn);
      row.querySelector(".acts")!.appendChild(btn);
      list.appendChild(row);
    }
    agree.addEventListener("change", () => { agreed = agree.checked; buttons.forEach((b, i) => { b.disabled = !agreed || !deps.strokesOf(deps.choices()[i].value); }); });
    const mineEl = body.querySelector<HTMLElement>("#oMine")!;
    const loadMine = async () => {
      try {
        const { chars } = await api.mine();
        mineEl.innerHTML = chars.length ? "" : "まだ ないよ";
        for (const c of chars) {
          const row = document.createElement("div");
          row.className = "orow";
          row.innerHTML = `<img alt=""><span class="nm"></span><small></small><span class="acts"></span>`;
          row.querySelector("img")!.src = thumbOf(`h:${c.id}`, () => c.thumb as Stroke[]);
          row.querySelector(".nm")!.textContent = c.name;
          row.querySelector("small")!.textContent = `${TIERS[c.tier].name}・★${c.rating}・${c.wins}勝${c.losses}敗${c.hidden ? "・👎で かくれ中" : ""}`;
          const del = document.createElement("button");
          del.textContent = "取り下げ";
          let armed = 0;
          del.addEventListener("click", async () => {
            if (!armed) { del.textContent = "ほんとに？"; armed = window.setTimeout(() => { armed = 0; del.textContent = "取り下げ"; }, 2500); return; }
            clearTimeout(armed);
            try { await api.remove(c.id); loadMine(); } catch (e) { msg.textContent = (e as Error).message; }
          });
          row.querySelector(".acts")!.appendChild(del);
          mineEl.appendChild(row);
        }
      } catch (e) { mineEl.textContent = (e as Error).message; }
    };
    loadMine();
  }

  function renderRules() {
    body.innerHTML = `
      <div class="kcard">
        <div class="kh">📜 みんなで あそぶ ルール</div>
        <div>みんなが 見るよ。名前・学校・住所・電話番号・顔は かかないでね。いやな言葉、えっちな絵、ひとを悪く言う絵、ほかのアニメやゲームのキャラは ダメ。いやな絵を 見たら 👎 を おしてね。消したくなったら「こうかい」から 取り下げられるよ。お金は かからないよ。</div>
      </div>
      <div class="kcard rules">
        <div class="kh">保護者の方へ（利用規約・プライバシー）</div>
        <ol>
          <li>このゲームは個人が無料で運営しています。広告や課金はありません。</li>
          <li>サーバーに預かるのは、公開したキャラの線データ・名前・性格と技の数値・対戦の勝敗、端末ごとのランダムな番号（ハッシュ化して保存）だけです。氏名・メールアドレス・位置情報などの個人情報は預かりません。ゲームの進み具合は端末の中だけに保存されます。</li>
          <li>IP アドレスは、秘密の乱数を混ぜた元に戻せない形（ハッシュ）にし、回数制限と 👎 の重複防止のためだけに使います。回数制限の記録はその日のうちに使い終え、順次消します。</li>
          <li>保存先は Cloudflare, Inc.（米国）の Cloudflare Workers と D1 です。ゲームの画面は GitHub Pages（GitHub, Inc.）から配信し、文字の形は Google Fonts から読み込みます。</li>
          <li>個人情報、性的・暴力的・差別的な内容、他の作品のキャラクター、悪口などは禁止です。</li>
          <li>👎 が別々の3人から付くと自動で非表示になります。運営者の判断で、予告なく非表示・削除することがあります。</li>
          <li>削除の依頼・問い合わせは <a href="https://github.com/second1214/doodle-arena/issues" target="_blank" rel="noopener">GitHub の Issues</a> へ。キャラの名前と、おおよその公開日を書いてください。個人情報は書かないでください。</li>
          <li>サービスは予告なく変更・停止・終了することがあり、内容の保証はしません。</li>
          <li>このルールを変える時は、このページでお知らせします。</li>
        </ol>
      </div>`;
  }

  async function render() {
    renderStatus();
    if (tab === "fight") await renderFight();
    else if (tab === "rank") await renderRank();
    else if (tab === "watch") await renderWatch();
    else if (tab === "publish") await renderPublish();
    else renderRules();
  }

  return {
    async open() {
      renderStatus();
      await refreshOnline();
      checkNews();
      await render();
    },
  };
}
