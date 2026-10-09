// 戦闘画面（全画面）。入力（仮想スティック・ボタン・キーボード）→ 固定ステップの戦闘計算 → 3D 表示＋効果音。
import { aiInput, createAi, type AiLevel } from "../sim/ai";
import { attackCostOf, DT, MATCH_TICKS, createWorld, step, TICK_HZ, type BattleEvent, type Input, type World } from "../sim/world";
import type { Sfx } from "./audio";
import type { CharacterBuild } from "./character";
import { BattleScene } from "./scene";

export interface BattleOptions {
  player: CharacterBuild;
  cpu: CharacterBuild;
  spectate: boolean; // 自分のキャラも CPU が操作（観戦）
  seed: number;
  sfx: Sfx;
  onExit: () => void;
  cpuLevel?: AiLevel; // 相手 CPU の強さ（ストーリー）
  exitLabel?: string; // 結果画面の「戻る」ボタンの文言
  // 決着のたびに呼ぶ（winner: 0=自分 1=相手 2=引き分け）。返した HTML を結果画面に足す（経験値など）
  onResult?: (winner: number) => string;
}

const pips = (i: number) => `<div class="b-charge" data-ch="${i}"></div>`; // 中身は必要な命中数ぶん（キャラごとに違う）

const HTML = `
  <div class="b-hud">
    <div class="b-side"><div class="b-name" data-n="0"></div><div class="b-bar"><i data-hp="0"></i><span data-hpn="0"></span></div><div class="b-bar thin"><i data-st="0"></i></div>${pips(0)}</div>
    <div class="b-time" data-time></div>
    <div class="b-side right"><div class="b-name" data-n="1"></div><div class="b-bar"><i data-hp="1"></i><span data-hpn="1"></span></div><div class="b-bar thin"><i data-st="1"></i></div>${pips(1)}</div>
  </div>
  <div class="b-view"></div>
  <div class="b-count" hidden></div>
  <div class="b-controls">
    <div class="b-stick"><div class="b-knob"></div></div>
    <div class="b-buttons">
      <button class="b-btn special" data-act="special">必殺</button>
      <button class="b-btn dodge" data-act="dodge">回避</button>
      <button class="b-btn shove" data-act="shove">突き<br>飛ばし</button>
      <button class="b-btn guard" data-act="guard">防御</button>
      <button class="b-btn attack" data-act="attack">攻撃</button>
    </div>
  </div>
  <div class="b-result" hidden>
    <div class="b-result-text"></div>
    <div class="b-reward"></div>
    <table class="b-stats"></table>
    <div class="b-result-buttons"><button data-again>もう一回</button><button data-exit>必殺を変えて再戦</button></div>
  </div>
  <button class="b-mute" aria-label="音のオン・オフ"></button>
  <button class="b-close" data-exit aria-label="戦闘をやめる">×</button>
`;

interface Stats { dealt: number; melee: number; shots: number; specialHits: number; guards: number }
const newStats = (): Stats => ({ dealt: 0, melee: 0, shots: 0, specialHits: 0, guards: 0 });

const COUNTDOWN_MS = 2400; // 3・2・1・GO

export function startBattle(opts: BattleOptions) {
  const { sfx } = opts;
  const el = document.createElement("div");
  el.className = "battle";
  el.innerHTML = HTML;
  document.body.appendChild(el);
  document.body.classList.add("in-battle");
  const q = <T extends HTMLElement>(s: string) => el.querySelector(s) as T;

  let world: World = createWorld(opts.player.cfg, opts.cpu.cfg, opts.seed);
  let ais = [createAi(), createAi(opts.cpuLevel)];
  let stats = [newStats(), newStats()];
  const scene = new BattleScene(q(".b-view"), [opts.player, opts.cpu], opts.spectate ? -1 : 0);
  if (opts.exitLabel) q(".b-result-buttons [data-exit]").textContent = opts.exitLabel;
  q("[data-n='0']").textContent = opts.player.cfg.name;
  q("[data-n='1']").textContent = opts.cpu.cfg.name;
  if (opts.spectate) q(".b-controls").classList.add("spectate");

  const muteBtn = q(".b-mute");
  const syncMute = () => { muteBtn.textContent = sfx.muted ? "音オフ" : "音オン"; };
  syncMute();
  muteBtn.addEventListener("click", () => { sfx.unlock(); sfx.setMuted(!sfx.muted); syncMute(); });

  // --- 入力 ---
  const held = { guard: false };
  const pressed = { attack: false, special: false, shove: false, dodge: false };
  const stick = { x: 0, z: 0 };
  const keys = new Set<string>();

  const stickEl = q(".b-stick"), knob = q(".b-knob");
  let stickId = -1, sx = 0, sy = 0;
  const STICK_R = 48;
  stickEl.addEventListener("pointerdown", (e) => {
    stickId = e.pointerId;
    stickEl.setPointerCapture(e.pointerId);
    const r = stickEl.getBoundingClientRect();
    sx = r.left + r.width / 2; sy = r.top + r.height / 2;
    moveStick(e);
  });
  const moveStick = (e: PointerEvent) => {
    if (e.pointerId !== stickId) return;
    let dx = e.clientX - sx, dy = e.clientY - sy;
    const l = Math.hypot(dx, dy);
    if (l > STICK_R) { dx *= STICK_R / l; dy *= STICK_R / l; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    stick.x = dx / STICK_R; stick.z = dy / STICK_R;
  };
  stickEl.addEventListener("pointermove", moveStick);
  const endStick = (e: PointerEvent) => {
    if (e.pointerId !== stickId) return;
    stickId = -1; stick.x = stick.z = 0;
    knob.style.transform = "";
  };
  stickEl.addEventListener("pointerup", endStick);
  stickEl.addEventListener("pointercancel", endStick);

  el.querySelectorAll<HTMLButtonElement>(".b-btn").forEach((b) => {
    const act = b.dataset.act!;
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      b.classList.add("down");
      if (act === "guard") held.guard = true;
      else pressed[act as "attack" | "special" | "shove" | "dodge"] = true;
    });
    const up = () => {
      b.classList.remove("down");
      if (act === "guard") held.guard = false;
    };
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
  });

  // 戦闘開始ボタンにフォーカスが残っていると、スペース（回避）で押し直されて戦闘が重なるので外す
  (document.activeElement as HTMLElement | null)?.blur();
  const GAME_KEYS = new Set(["w", "a", "s", "d", "j", "k", "l", "h", "i", " ", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (GAME_KEYS.has(k)) e.preventDefault(); // ページのスクロールやボタンの押下に使わせない
    if (e.type === "keydown") {
      if (!keys.has(k)) {
        if (k === "j") pressed.attack = true;
        if (k === "l") pressed.special = true;
        if (k === "h") pressed.shove = true;
        if (k === " " || k === "i") pressed.dodge = true;
      }
      keys.add(k);
    } else keys.delete(k);
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);

  const playerInput = (): Input => {
    let mx = stick.x, mz = stick.z;
    if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
    if (keys.has("d") || keys.has("arrowright")) mx += 1;
    if (keys.has("w") || keys.has("arrowup")) mz -= 1;
    if (keys.has("s") || keys.has("arrowdown")) mz += 1;
    const inp: Input = { mx, mz, attack: pressed.attack, guard: held.guard || keys.has("k"), special: pressed.special, shove: pressed.shove, dodge: pressed.dodge };
    pressed.attack = pressed.special = pressed.shove = pressed.dodge = false;
    return inp;
  };

  // --- HUD ---
  const hpEls = [q("[data-hp='0']"), q("[data-hp='1']")];
  const hpNums = [q("[data-hpn='0']"), q("[data-hpn='1']")];
  const stEls = [q("[data-st='0']"), q("[data-st='1']")];
  const chEls = [q("[data-ch='0']"), q("[data-ch='1']")];
  chEls.forEach((c, i) => { c.innerHTML = "<i></i>".repeat(world.fighters[i].st.chargeNeed); });
  const timeEl = q("[data-time]");
  const specialBtn = q(".b-btn.special");
  const attackBtn = q(".b-btn.attack");
  const dodgeBtn = q(".b-btn.dodge");
  const shoveBtn = q(".b-btn.shove");
  const resultEl = q(".b-result");
  const countEl = q(".b-count");
  const updateHud = () => {
    world.fighters.forEach((f, i) => {
      hpEls[i].style.width = `${(f.hp / f.maxHp) * 100}%`;
      hpNums[i].textContent = `${Math.ceil(f.hp)}`;
      stEls[i].style.width = `${(f.stamina / f.maxStamina) * 100}%`;
      stEls[i].parentElement!.classList.toggle("low", f.stamina < attackCostOf(f.cfg));
      chEls[i].querySelectorAll("i").forEach((p, k) => { p.classList.toggle("on", k + 1 <= f.charge); p.classList.toggle("half", k < f.charge && k + 1 > f.charge); });
      chEls[i].classList.toggle("full", f.charge >= f.st.chargeNeed);
    });
    timeEl.textContent = String(Math.ceil((MATCH_TICKS - world.tick) / TICK_HZ));
    const me = world.fighters[0];
    const need = me.st.chargeNeed;
    const ready = me.charge >= need;
    specialBtn.textContent = ready ? "必殺!" : `${me.charge}/${need}`;
    specialBtn.classList.toggle("ready", ready);
    specialBtn.style.setProperty("--cd", String(1 - me.charge / need));
    attackBtn.classList.toggle("low", me.stamina < attackCostOf(me.cfg)); // スタミナ不足で攻撃できない
    dodgeBtn.classList.toggle("low", me.stamina < me.st.dodgeCost);
    shoveBtn.classList.toggle("low", me.shoveCd > 0);
  };

  // --- 効果音と戦績 ---
  const onEvent = (e: BattleEvent) => {
    const atk = 1 - e.target;
    switch (e.kind) {
      case "hit":
        stats[atk].dealt += e.amount;
        if (e.src === "melee") { stats[atk].melee++; sfx.punch(); }
        else { stats[atk].specialHits++; sfx.specialHit(e.size); }
        if (e.restrained) sfx.bind();
        break;
      case "guard":
        stats[e.target].guards++;
        stats[atk].dealt += e.amount;
        if (e.src === "melee") stats[atk].melee++; else stats[atk].specialHits++;
        sfx.guard();
        break;
      case "shoot": stats[e.target].shots++; sfx.shoot(e.size); break;
      case "land": sfx.land(e.size); break;
      case "ready": sfx.ready(); break;
      case "ko": sfx.ko(); break;
      case "mstart": stats[e.target].shots++; sfx.shoot(0.5); break;
      case "mactive": {
        const tags = (e.tags ?? []) as string[];
        if (tags.includes("tornado")) sfx.spin();
        if (tags.includes("rubber")) sfx.boing();
        break;
      }
      case "grab": sfx.grab(); break;
      case "shove": sfx.shove(); break;
      case "dodge": sfx.dodge(); break;
      case "evade": sfx.whiff(); break;
      case "whiff": sfx.whiff(); break;
      case "slam": sfx.land(1); break;
      case "status": if (e.status === "crumple") sfx.crumple(); else if (e.status === "wobble") sfx.wah(); else sfx.bind(); break;
    }
  };

  // --- ループ ---
  let last = performance.now();
  let acc = 0;
  let raf = 0;
  let ended = false;
  let endAt = 0;
  let startAt = 0;
  let lastCount = -1;
  const t0 = performance.now();
  const beginCountdown = (now: number) => { startAt = now + COUNTDOWN_MS; lastCount = -1; countEl.hidden = false; };
  beginCountdown(t0);

  const frame = (now: number) => {
    const dtSec = Math.min(0.25, (now - last) / 1000);
    last = now;
    const events: BattleEvent[] = [];
    if (now < startAt) {
      // 3・2・1（その間は動かない）
      const n = Math.ceil((startAt - now) / (COUNTDOWN_MS / 3));
      if (n !== lastCount) { lastCount = n; countEl.textContent = String(n); countEl.className = "b-count pop-in"; sfx.beep(); }
    } else {
      if (lastCount !== 0) {
        lastCount = 0;
        countEl.textContent = "GO!";
        countEl.className = "b-count pop-in go";
        sfx.beep(true);
        setTimeout(() => { countEl.hidden = true; }, 600);
      }
      acc += dtSec;
      while (acc >= DT) {
        acc -= DT;
        const p0 = opts.spectate ? aiInput(world, 0, ais[0]) : playerInput();
        const p1 = aiInput(world, 1, ais[1]);
        step(world, [p0, p1]);
        events.push(...world.events);
      }
    }
    for (const e of events) onEvent(e);
    scene.render(world, (now - t0) / 1000, events);
    updateHud();
    if (world.winner !== -1 && !ended && !endAt) endAt = now + 1600; // KO の演出を見せてから結果を出す
    if (endAt && now >= endAt && !ended) {
      ended = true;
      const win = world.winner;
      const msg = win === 2 || win === -1 ? "引き分け" : opts.spectate
        ? `${world.fighters[win].cfg.name} の勝ち`
        : win === 0 ? "勝ち！" : "負け…";
      q(".b-result-text").textContent = msg;
      const n = (i: number) => world.fighters[i].cfg.name;
      const row = (label: string, f: (s: Stats) => string | number) =>
        `<tr><td>${f(stats[0])}</td><th>${label}</th><td>${f(stats[1])}</td></tr>`;
      q(".b-stats").innerHTML =
        `<tr><td class="nm">${n(0)}</td><th></th><td class="nm">${n(1)}</td></tr>` +
        row("与ダメージ", (s) => Math.round(s.dealt)) +
        row("通常攻撃 命中", (s) => s.melee) +
        row("必殺 命中/発射", (s) => `${s.specialHits}/${s.shots}`) +
        row("ガード", (s) => s.guards);
      q(".b-reward").innerHTML = opts.onResult ? opts.onResult(win === -1 ? 2 : win) : "";
      resultEl.hidden = false;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const onResize = () => scene.resize();
  window.addEventListener("resize", onResize);

  let closed = false;
  const exit = () => {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("keyup", onKey);
    window.removeEventListener("resize", onResize);
    scene.dispose();
    el.remove();
    document.body.classList.remove("in-battle");
    opts.onExit();
  };
  el.querySelectorAll("[data-exit]").forEach((b) => b.addEventListener("click", exit));
  q("[data-again]").addEventListener("click", () => {
    sfx.unlock();
    world = createWorld(opts.player.cfg, opts.cpu.cfg, (opts.seed = (opts.seed * 1664525 + 1013904223) >>> 0));
    ais = [createAi(), createAi(opts.cpuLevel)];
    stats = [newStats(), newStats()];
    ended = false;
    endAt = 0;
    acc = 0;
    scene.reset();
    resultEl.hidden = true;
    beginCountdown(performance.now());
  });
  return { close: exit }; // 端末の「戻る」で閉じるとき用
}
