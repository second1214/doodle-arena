// ひっさつの 試し撃ち: シールを 貼りかえるたびに、小さな 舞台で かかしへ 何度も 撃って 見せる（戦闘と同じ計算・絵は 簡単な 2D）。
// 戦闘画面と 行き来しなくても、組み合わせを 目で 確かめられる。
import { ARENA_RADIUS } from "./sim/consts";
import { createWorld, meleeSpecialRange, NO_INPUT, step, type FighterConfig, type Input, type World } from "./sim/world";
import { estimateDamage } from "./sim/estimate";

export type DummyMove = "stand" | "walk" | "run";
const MOVES: { id: DummyMove; label: string; name: string }[] = [
  { id: "stand", label: "🧍", name: "かかしは とまる" },
  { id: "walk", label: "🚶", name: "かかしは あるく" },
  { id: "run", label: "🏃", name: "かかしは にげる" },
];
const MAX_H = 136; // 試し撃ちの 高さ（スマホで 1画面に おさめる）
const VOLLEY_TICKS = 420; // 1回の 試し撃ちの 長さ（弾が 早く 消えたら 先に 次へ）
const DUMMY: FighterConfig = { name: "かかし", reach: 0.6, hasHands: true, hasFeet: true, special: [] };

interface Pop { x: number; y: number; text: string; age: number }

export class TestFire {
  readonly el = document.createElement("div");
  private canvas = document.createElement("canvas");
  private ctx = this.canvas.getContext("2d")!;
  private info = document.createElement("div");
  private est = document.createElement("div"); // 想定ダメージ（すぐ 出す）
  private cfg: FighterConfig | null = null;
  private w: World | null = null;
  private move: DummyMove = "stand";
  private raf = 0;
  private last = 0;
  private acc = 0;
  private pops: Pop[] = [];
  private dealt = 0;
  private hits = 0;
  private seed = 1;

  constructor() {
    this.el.className = "tfire";
    const seg = document.createElement("div");
    seg.className = "tf-ctl";
    for (const m of MOVES) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = m.label;
      b.setAttribute("aria-label", m.name);
      b.title = m.name;
      b.classList.toggle("on", m.id === this.move);
      b.addEventListener("click", () => {
        this.move = m.id;
        seg.querySelectorAll("button").forEach((o) => o.classList.toggle("on", o === b));
        this.restart();
      });
      seg.appendChild(b);
    }
    this.info.className = "tf-info";
    this.est.className = "tf-est";
    this.el.append(this.canvas, seg, this.est, this.info);
  }

  // 撃つ キャラの 設定（シールを 貼りかえたら 呼ぶ）
  set(cfg: FighterConfig) {
    this.cfg = cfg;
    // 想定ダメージ: かかし（とまる・あるく・にげる）に 1回 撃った 合計を 先に 計算して すぐ 出す（戦闘と 同じ 計算）
    try {
      const e = estimateDamage(cfg, 1);
      this.est.innerHTML = `<b>💥 そうてい ${Math.round(e.avg)}</b><small>とまる ${Math.round(e.stand)}・あるく ${Math.round(e.walk)}・にげる ${Math.round(e.run)}</small>`;
    } catch { this.est.textContent = ""; }
    this.info.textContent = "";
    this.restart();
  }

  private restart() {
    if (!this.cfg) return;
    const w = createWorld(this.cfg, DUMMY, this.seed++);
    const [me, op] = w.fighters;
    // 近接は 近くから（届く距離の すぐ外）
    // 近接は 届く 距離の 少し 内側から（届かなければ 歩いて 近づいてから 出す）
    if (this.cfg.specialType === "melee") { const r = meleeSpecialRange(me.cfg, me.mspec, op.cfg); me.x = -r * 0.4; op.x = r * 0.4; }
    this.fired = false;
    me.charge = me.st.chargeNeed;
    this.w = w;
    this.dealt = 0;
    this.hits = 0;
    this.pops = [];
    if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.frame); }
  }

  private frame = (now: number) => {
    this.raf = 0;
    if (!this.el.isConnected) return; // 画面から 外れたら 止める（set で また動く）
    this.raf = requestAnimationFrame(this.frame);
    if (document.hidden || !this.w) return;
    this.acc = Math.min(0.1, this.acc + (now - this.last) / 1000);
    this.last = now;
    while (this.acc >= 1 / 60) { this.acc -= 1 / 60; this.tick(); }
    this.draw();
  };

  private tick() {
    const w = this.w!;
    const t = w.tick;
    const me = w.fighters[0], op = w.fighters[1];
    const a = t * 0.04;
    const mv = this.move === "walk" ? { mx: Math.cos(a) * 0.5, mz: Math.sin(a) * 0.5 }
      : this.move === "run" ? { mx: 0, mz: Math.sin(t * 0.02) > 0 ? 1 : -1, dodge: t % 40 === 20 } : {};
    // 撃つ側: 遠距離は すぐ撃つ。近接は 届く所まで 歩いてから 出す
    let mine: Input = NO_INPUT;
    if (!this.fired && t >= 2) {
      const dx = op.x - me.x, dz = op.z - me.z, d = Math.hypot(dx, dz) || 1;
      const melee = this.cfg!.specialType === "melee";
      if (melee && d > meleeSpecialRange(me.cfg, me.mspec, op.cfg) * 0.8) mine = { ...NO_INPUT, mx: dx / d, mz: dz / d };
      else mine = { ...NO_INPUT, special: true, mx: dx / d * 0.01, mz: dz / d * 0.01 };
    }
    step(w, [mine, { ...NO_INPUT, ...mv }]);
    if (me.ms.phase !== "none" || w.projectiles.length) this.fired = true;
    op.hp = op.st.maxHp; // かかしは 倒れない
    for (const e of w.events) {
      if ((e.kind === "hit" || e.kind === "guard") && e.target === 1 && e.amount > 0) {
        this.hits++;
        this.dealt += e.amount;
        this.pops.push({ x: e.x, y: (e.y ?? 0) + 2.2, text: `${Math.round(e.amount)}`, age: 0 });
      }
    }
    // 弾も 近接の わざも 終わったら、少し 待って もう一度
    const busy = w.projectiles.length > 0 || me.ms.phase !== "none";
    if ((this.fired && !busy && t > this.quietSince + 45) || t > VOLLEY_TICKS || w.winner !== -1) this.restartKeepMove();
    if (busy) this.quietSince = t;
  }
  private quietSince = 0;
  private fired = false;
  private restartKeepMove() {
    this.info.textContent = this.hits ? `💥 ${this.hits}かい・${Math.round(this.dealt)}` : "💨 はずれ";
    this.quietSince = 0;
    this.restart();
  }

  private draw() {
    const c = this.canvas, g = this.ctx, w = this.w!;
    const W = this.el.clientWidth || 320;
    // 舞台が 横いっぱいに なる 大きさ（上は 雲の 高さの分 あける）
    const s = Math.min(W / (ARENA_RADIUS * 2.15), MAX_H / (ARENA_RADIUS * 0.9 + 5.5 * 0.75));
    const H = Math.round(ARENA_RADIUS * 2 * 0.45 * s + 5.5 * 0.75 * s);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== W * dpr || c.height !== H * dpr) { c.width = W * dpr; c.height = H * dpr; c.style.height = `${H}px`; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this.el);
    g.fillStyle = css.getPropertyValue("--tf-bg").trim() || "#f3ecff";
    g.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H - ARENA_RADIUS * 0.45 * s - 2;
    const P = (x: number, z: number, h: number) => [cx + x * s, cy + z * s * 0.45 - h * s * 0.75] as const;
    // 舞台
    g.fillStyle = css.getPropertyValue("--tf-floor").trim() || "#e4dcf5";
    g.beginPath(); g.ellipse(cx, cy, ARENA_RADIUS * s, ARENA_RADIUS * s * 0.45, 0, 0, Math.PI * 2); g.fill();
    // 影 → 体・弾（奥から順）
    const items: { z: number; draw: () => void }[] = [];
    const shadow = (x: number, z: number, r: number) => {
      const [sx, sy] = P(x, z, 0);
      g.fillStyle = "rgba(0,0,0,.15)";
      g.beginPath(); g.ellipse(sx, sy, r * s, r * s * 0.45, 0, 0, Math.PI * 2); g.fill();
    };
    w.fighters.forEach((f, i) => items.push({ z: f.z, draw: () => {
      shadow(f.x, f.z, 0.5);
      const [sx, sy] = P(f.x, f.z, f.y + 0.9);
      g.fillStyle = i === 0 ? "#ff8fb8" : "#ffc078";
      g.beginPath(); g.arc(sx, sy, s * 0.75, 0, Math.PI * 2); g.fill();
      g.font = `${Math.round(s * 1.2)}px system-ui`;
      g.textAlign = "center"; g.textBaseline = "middle";
      g.globalAlpha = f.dodgeT > 0 ? 0.5 : 1;
      g.fillText(i === 0 ? "😀" : "🎃", sx, sy);
      g.globalAlpha = 1;
    } }));
    for (const p of w.projectiles) {
      if (p.emitter !== undefined && !p.spec.cloud) continue;
      items.push({ z: p.z, draw: () => {
        shadow(p.x, p.z, Math.max(0.15, p.spec.size));
        const [sx, sy] = P(p.x, p.z, p.h);
        if (p.emitter !== undefined) {
          // 雲（明るい 背景でも 見えるよう 灰色の 丸を 重ねる）
          g.fillStyle = "#adb5bd";
          for (const [ox, oy, r] of [[-0.6, 0.1, 0.5], [0, -0.15, 0.65], [0.6, 0.1, 0.5]]) { g.beginPath(); g.arc(sx + ox * s, sy + oy * s, r * s, 0, Math.PI * 2); g.fill(); }
          return;
        }
        g.globalAlpha = p.spec.visible ? 1 : 0.35;
        g.fillStyle = p.parked !== undefined ? "#e8590c" : "#ff4f9a";
        g.beginPath(); g.arc(sx, sy, Math.max(2.5, p.spec.size * s), 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1;
      } });
    }
    items.sort((a, b) => a.z - b.z).forEach((it) => it.draw());
    // ダメージの 数字
    g.font = `900 ${Math.round(s * 0.9)}px system-ui`;
    g.textAlign = "center";
    for (const p of this.pops) {
      p.age++;
      const [sx, sy] = P(p.x, 0, p.y + p.age * 0.02);
      g.globalAlpha = Math.max(0, 1 - p.age / 50);
      g.fillStyle = "#e03131";
      g.fillText(p.text, sx, sy);
    }
    g.globalAlpha = 1;
    this.pops = this.pops.filter((p) => p.age < 50);
  }
}
