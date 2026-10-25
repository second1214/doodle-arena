// 効果音。Kenney（kenney.nl・CC0）の 音声ファイル（public/sfx/）を 鳴らす。読みこめない時（オフライン・1ファイル版など）は
// WebAudio で 合成した 音に もどる。ブラウザの制約で、ボタン操作の後にしか鳴らせない。
const MUTE_KEY = "doodle-arena:mute";

// 場面ごとの 音（同じ場面に いくつか あれば 毎回 ランダムに えらぶ＝同じ音の くりかえしで 耳が つかれない）
const n5 = (base: string) => [0, 1, 2, 3, 4].map((k) => `${base}_00${k}`);
export const SOUND_FILES = {
  punch: n5("impactPunch_medium"),
  heavy: n5("impactPunch_heavy"),
  guard: n5("impactPlate_light"),
  thud: n5("impactSoft_heavy"),
  soft: n5("impactSoft_medium"),
  shoot: ["laser1", "laser4", "laser6"],
  ready: ["powerUp2"],
  bind: ["phaserDown1"],
  ko: ["impactBell_heavy_002"],
  koJingle: ["threeTone2"],
  tick: ["tick_002"],
  go: ["confirmation_002"],
} as const;
type SoundKey = keyof typeof SOUND_FILES;
const SFX_BASE = "sfx/";

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private bufs = new Map<string, AudioBuffer>();
  private loading = false;
  muted = false;

  constructor() {
    try { this.muted = localStorage.getItem(MUTE_KEY) === "1"; } catch { /* 保存できない環境 */ }
  }

  // ユーザー操作（ボタン押下）の中で呼ぶ
  unlock() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 0.5;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    void this.loadFiles();
  }

  // 音声ファイルを 先に 読んでおく（失敗した音は 合成音のまま）
  private async loadFiles() {
    const c = this.ctx;
    if (!c || this.loading) return;
    this.loading = true;
    const names = [...new Set(Object.values(SOUND_FILES).flat())];
    await Promise.all(names.map(async (n) => {
      try {
        const r = await fetch(`${SFX_BASE}${n}.mp3`);
        if (!r.ok) return;
        const data = await r.arrayBuffer();
        // 古い Safari は Promise を 返さないので コールバックで 受ける
        const buf = await new Promise<AudioBuffer>((ok, ng) => c.decodeAudioData(data, ok, ng));
        this.bufs.set(n, buf);
      } catch { /* 合成音のまま */ }
    }));
  }

  // ファイルの 音を 鳴らす（読めていなければ false → 呼んだ側が 合成音を 鳴らす）。rate: 再生の速さ（低いほど 低く 重い音）
  private play(key: SoundKey, vol = 1, rate = 1, delay = 0): boolean {
    const c = this.ctx, m = this.master;
    if (!c || !m) return false;
    const list = SOUND_FILES[key].filter((n) => this.bufs.has(n));
    if (!list.length) return false;
    const src = c.createBufferSource();
    src.buffer = this.bufs.get(list[Math.floor(Math.random() * list.length)])!;
    src.playbackRate.value = rate * (0.94 + Math.random() * 0.12);
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(g).connect(m);
    src.start(c.currentTime + delay);
    return true;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
    try { localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch { /* 無視 */ }
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0) {
    const c = this.ctx, m = this.master;
    if (!c || !m) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(m);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, freq: number, q = 1, delay = 0) {
    const c = this.ctx, m = this.master;
    if (!c || !m || !this.noiseBuf) return;
    const t = c.currentTime + delay;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(m);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  punch() { if (!this.play("punch", 0.9)) { this.noise(0.08, 0.9, 1200, 0.8); this.tone("sine", 180, 60, 0.12, 0.8); } }
  guard() { if (!this.play("guard", 0.7, 1.15)) { this.tone("square", 1400, 900, 0.08, 0.15); this.noise(0.05, 0.3, 4000, 2); } }
  shoot(size: number) { if (!this.play("shoot", 0.55, 1.25 / (0.7 + size * 0.6))) { this.tone("sawtooth", 300 / (0.5 + size), 1200, 0.25, 0.18); this.noise(0.25, 0.4, 2500, 0.7); } }
  specialHit(size: number) { if (!this.play("heavy", 1, 1 / (0.8 + size * 0.4))) { this.noise(0.25, 1, 600, 0.6); this.tone("sine", 140 / (0.6 + size * 0.5), 40, 0.35, 1); } }
  land(size: number) { if (!this.play("thud", 1, 0.8 / (0.7 + size * 0.5))) { this.noise(0.5, 1, 250, 0.5); this.tone("sine", 90 / (0.7 + size * 0.5), 30, 0.6, 1.2); } }
  ready() { if (!this.play("ready", 0.6)) [660, 880, 1320].forEach((f, i) => this.tone("triangle", f, f, 0.12, 0.25, i * 0.07)); }
  bind() { if (!this.play("bind", 0.6)) { this.tone("square", 500, 250, 0.2, 0.15); this.tone("square", 520, 260, 0.2, 0.12, 0.08); } }
  ko() {
    if (this.play("ko", 0.8)) { this.play("heavy", 1, 0.8); this.play("koJingle", 0.5, 1, 0.35); return; }
    this.noise(0.8, 1, 200, 0.4); this.tone("sine", 120, 30, 1.0, 1.2); [523, 659, 784].forEach((f) => this.tone("triangle", f, f, 0.8, 0.12, 0.35));
  }
  spin() { this.tone("sawtooth", 200, 900, 0.7, 0.12); this.noise(0.7, 0.3, 1500, 0.6); }
  boing() { this.tone("sine", 220, 660, 0.25, 0.5); this.tone("sine", 660, 330, 0.2, 0.3, 0.2); }
  grab() { if (!this.play("soft", 0.9)) { this.noise(0.06, 0.8, 900, 1); this.tone("square", 300, 200, 0.08, 0.15); } }
  whiff() { this.noise(0.15, 0.3, 3000, 0.5); }
  crumple() { for (let k = 0; k < 6; k++) this.noise(0.04, 0.6, 2500 + k * 300, 3, k * 0.03); }
  wah() { this.tone("triangle", 400, 200, 0.3, 0.25); this.tone("triangle", 300, 450, 0.3, 0.2, 0.25); }
  shove() { if (!this.play("thud", 0.7, 1.2)) { this.noise(0.1, 0.8, 500, 0.7); this.tone("sine", 120, 70, 0.15, 0.6); } }
  dodge() { this.noise(0.18, 0.35, 5000, 0.4); this.tone("sine", 900, 1500, 0.12, 0.08); }
  beep(high = false) { if (!this.play(high ? "go" : "tick", 0.8)) this.tone("square", high ? 1046 : 523, high ? 1046 : 523, high ? 0.35 : 0.12, 0.2); }
}
