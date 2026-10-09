// 効果音（WebAudio で合成。音声ファイル不要）。ブラウザの制約で、ボタン操作の後にしか鳴らせない。
const MUTE_KEY = "doodle-arena:mute";

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
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

  punch() { this.noise(0.08, 0.9, 1200, 0.8); this.tone("sine", 180, 60, 0.12, 0.8); }
  guard() { this.tone("square", 1400, 900, 0.08, 0.15); this.noise(0.05, 0.3, 4000, 2); }
  shoot(size: number) { this.tone("sawtooth", 300 / (0.5 + size), 1200, 0.25, 0.18); this.noise(0.25, 0.4, 2500, 0.7); }
  specialHit(size: number) { this.noise(0.25, 1, 600, 0.6); this.tone("sine", 140 / (0.6 + size * 0.5), 40, 0.35, 1); }
  land(size: number) { this.noise(0.5, 1, 250, 0.5); this.tone("sine", 90 / (0.7 + size * 0.5), 30, 0.6, 1.2); }
  ready() { [660, 880, 1320].forEach((f, i) => this.tone("triangle", f, f, 0.12, 0.25, i * 0.07)); }
  bind() { this.tone("square", 500, 250, 0.2, 0.15); this.tone("square", 520, 260, 0.2, 0.12, 0.08); }
  ko() { this.noise(0.8, 1, 200, 0.4); this.tone("sine", 120, 30, 1.0, 1.2); [523, 659, 784].forEach((f) => this.tone("triangle", f, f, 0.8, 0.12, 0.35)); }
  beep(high = false) { this.tone("square", high ? 1046 : 523, high ? 1046 : 523, high ? 0.35 : 0.12, 0.2); }
}
