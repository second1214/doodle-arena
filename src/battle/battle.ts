// 戦闘画面（全画面）。入力（仮想スティック・ボタン・キーボード）→ 固定ステップの戦闘計算 → 3D 表示。
import { aiInput, createAi } from "../sim/ai";
import { DT, MATCH_TICKS, createWorld, maxHp, maxStamina, specialCooldown, step, TICK_HZ, type Input, type World } from "../sim/world";
import type { CharacterBuild } from "./character";
import { BattleScene } from "./scene";

export interface BattleOptions {
  player: CharacterBuild;
  cpu: CharacterBuild;
  spectate: boolean; // 自分のキャラも CPU が操作（観戦）
  seed: number;
  onExit: () => void;
}

const HTML = `
  <div class="b-hud">
    <div class="b-side"><div class="b-name" data-n="0"></div><div class="b-bar"><i data-hp="0"></i></div><div class="b-bar thin"><i data-st="0"></i></div></div>
    <div class="b-time" data-time></div>
    <div class="b-side right"><div class="b-name" data-n="1"></div><div class="b-bar"><i data-hp="1"></i></div><div class="b-bar thin"><i data-st="1"></i></div></div>
  </div>
  <div class="b-view"></div>
  <div class="b-controls">
    <div class="b-stick"><div class="b-knob"></div></div>
    <div class="b-buttons">
      <button class="b-btn special" data-act="special">必殺</button>
      <button class="b-btn guard" data-act="guard">防御</button>
      <button class="b-btn attack" data-act="attack">攻撃</button>
    </div>
  </div>
  <div class="b-result" hidden>
    <div class="b-result-text"></div>
    <div class="b-result-buttons"><button data-again>もう一回</button><button data-exit>戻る</button></div>
  </div>
  <button class="b-close" data-exit aria-label="戦闘をやめる">×</button>
`;

export function startBattle(opts: BattleOptions) {
  const el = document.createElement("div");
  el.className = "battle";
  el.innerHTML = HTML;
  document.body.appendChild(el);
  document.body.classList.add("in-battle");
  const q = <T extends HTMLElement>(s: string) => el.querySelector(s) as T;

  let world: World = createWorld(opts.player.cfg, opts.cpu.cfg, opts.seed);
  let ais = [createAi(), createAi()];
  const scene = new BattleScene(q(".b-view"), [opts.player, opts.cpu]);
  q("[data-n='0']").textContent = opts.player.cfg.name;
  q("[data-n='1']").textContent = opts.cpu.cfg.name;
  if (opts.spectate) q(".b-controls").classList.add("spectate");

  // --- 入力 ---
  const held = { guard: false };
  const pressed = { attack: false, special: false };
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
      else pressed[act as "attack" | "special"] = true;
    });
    const up = () => {
      b.classList.remove("down");
      if (act === "guard") held.guard = false;
    };
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
  });

  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (e.type === "keydown") {
      if (!keys.has(k)) {
        if (k === "j") pressed.attack = true;
        if (k === "l") pressed.special = true;
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
    const inp: Input = { mx, mz, attack: pressed.attack, guard: held.guard || keys.has("k"), special: pressed.special };
    pressed.attack = pressed.special = false;
    return inp;
  };

  // --- HUD ---
  const hpEls = [q("[data-hp='0']"), q("[data-hp='1']")];
  const stEls = [q("[data-st='0']"), q("[data-st='1']")];
  const timeEl = q("[data-time]");
  const specialBtn = q(".b-btn.special");
  const resultEl = q(".b-result");
  const updateHud = () => {
    world.fighters.forEach((f, i) => {
      hpEls[i].style.width = `${(f.hp / maxHp) * 100}%`;
      stEls[i].style.width = `${(f.stamina / maxStamina) * 100}%`;
    });
    timeEl.textContent = String(Math.ceil((MATCH_TICKS - world.tick) / TICK_HZ));
    const cd = world.fighters[0].specialCd;
    specialBtn.textContent = cd > 0 ? (cd / TICK_HZ).toFixed(1) : "必殺";
    specialBtn.style.setProperty("--cd", String(cd / specialCooldown));
  };

  // --- ループ ---
  let last = performance.now();
  let acc = 0;
  let raf = 0;
  let ended = false;
  let endAt = 0;
  const t0 = performance.now();
  const frame = (now: number) => {
    acc += Math.min(0.25, (now - last) / 1000);
    last = now;
    const events: World["events"] = [];
    while (acc >= DT) {
      acc -= DT;
      const p0 = opts.spectate ? aiInput(world, 0, ais[0]) : playerInput();
      const p1 = aiInput(world, 1, ais[1]);
      step(world, [p0, p1]);
      events.push(...world.events);
    }
    scene.render(world, (now - t0) / 1000, events);
    updateHud();
    if (world.winner !== -1 && !ended && !endAt) endAt = now + 1600; // KO の演出を見せてから結果を出す
    if (endAt && now >= endAt && !ended) {
      ended = true;
      const win = world.winner;
      const msg = win === 2 || win === -1 ? "引き分け" : opts.spectate
        ? `${world.fighters[win].cfg.name} の勝ち`
        : world.winner === 0 ? "勝ち！" : "負け…";
      q(".b-result-text").textContent = msg;
      resultEl.hidden = false;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const onResize = () => scene.resize();
  window.addEventListener("resize", onResize);

  const exit = () => {
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
    world = createWorld(opts.player.cfg, opts.cpu.cfg, (opts.seed = (opts.seed * 1664525 + 1013904223) >>> 0));
    ais = [createAi(), createAi()];
    ended = false;
    endAt = 0;
    scene.reset();
    resultEl.hidden = true;
  });
}
