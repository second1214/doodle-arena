// メイン画面のヘッダー: CPU キャラどうしの本物の戦闘を、動画のように流し続ける（見るだけ・音なし）。
// 決着したら少し間をおいて次の2体に入れ替える。メイン画面を離れたり、アプリが裏に回ったら止める（電池の節約）。
import { CPU_CHARS } from "../cpuChars";
import { buildGatekeeper } from "../online/screen";
import { aiInput, createAi, type AiState } from "../sim/ai";
import { createWorld, DT, step, type BattleEvent, type World } from "../sim/world";
import { BattleScene } from "./scene";

export class AttractHeader {
  private scene: BattleScene | null = null;
  private world: World | null = null;
  private ais: AiState[] = [];
  private raf = 0;
  private running = false;
  private acc = 0;
  private last = 0;
  private endAt = 0;
  private t0 = 0;
  private reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(private view: HTMLElement, private label: HTMLElement) {
    new ResizeObserver(() => this.scene?.resize()).observe(view);
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); else if (this.wanted) this.start(); });
  }
  private wanted = false;

  private newMatch() {
    this.scene?.dispose();
    const pool = CPU_CHARS.filter((c) => !c.bossStage);
    const a = pool[Math.floor(Math.random() * pool.length)];
    let b = pool[Math.floor(Math.random() * pool.length)];
    if (b === a) b = pool[(pool.indexOf(a) + 1) % pool.length];
    const tier = Math.floor(Math.random() * 3);
    try {
      const ba = buildGatekeeper(a, tier), bb = buildGatekeeper(b, tier);
      this.world = createWorld(ba.cfg, bb.cfg, (Math.random() * 0xffffffff) >>> 0);
      this.ais = [createAi(), createAi()];
      this.scene = new BattleScene(this.view, [ba, bb], -1);
      this.label.textContent = `${a.name} VS ${b.name}`;
    } catch {
      // 3D が使えない端末では、ヘッダーは絵なしの飾りだけにする
      this.scene = null;
      this.world = null;
      this.view.classList.add("nogl");
    }
    this.acc = 0;
    this.endAt = 0;
    this.t0 = performance.now();
  }

  start() {
    this.wanted = true;
    if (this.running) return;
    if (!this.world) this.newMatch();
    if (!this.world) return;
    this.running = true;
    this.last = performance.now();
    this.scene?.resize();
    this.raf = requestAnimationFrame(this.frame);
  }
  stop() { this.wanted = false; this.pause(); }
  private pause() { this.running = false; cancelAnimationFrame(this.raf); }

  private frame = (now: number) => {
    if (!this.running || !this.world || !this.scene) return;
    const w = this.world;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const events: BattleEvent[] = [];
    if (!this.reduced) {
      this.acc += dt;
      while (this.acc >= DT && w.winner === -1) {
        this.acc -= DT;
        step(w, [aiInput(w, 0, this.ais[0]), aiInput(w, 1, this.ais[1])]);
        events.push(...w.events);
      }
    }
    this.scene.render(w, (now - this.t0) / 1000, events);
    if (w.winner !== -1 && !this.endAt) this.endAt = now + 2200; // KO を見せてから次へ
    if (this.endAt && now >= this.endAt) this.newMatch();
    this.raf = requestAnimationFrame(this.frame);
  };
}
