// 写真をそのまま貼る線（Stroke.img）の 読みこみと表示。
// 写真は JPEG（小さい）＋ 写っている所（mask）で持ち、表示する時に 写っている所だけを切りぬく（PNG より ずっと小さい）。
// 画像の読みこみは時間がかかるので、使う前に preloadImages で読んでおく。読めたら onImagesReady の相手に知らせる。
import { maskText, readMask, type Stroke } from "./detect";

const cache = new Map<string, HTMLCanvasElement>();
const loading = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

const key = (img: string, mask?: string) => `${img.length}:${img.slice(-40)}|${mask ?? ""}`;

function load(img: string, mask?: string): Promise<void> {
  const k = key(img, mask);
  if (cache.has(k)) return Promise.resolve();
  const busy = loading.get(k);
  if (busy) return busy;
  const p = new Promise<void>((resolve) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      const g = c.getContext("2d")!;
      g.drawImage(im, 0, 0);
      const mk = mask ? readMask(mask) : null;
      if (mk) {
        // 写っている所だけ残す
        const mc = document.createElement("canvas");
        mc.width = mk.w;
        mc.height = mk.h;
        const md = new ImageData(mk.w, mk.h);
        for (let i = 0; i < mk.m.length; i++) if (mk.m[i]) md.data[i * 4 + 3] = 255;
        mc.getContext("2d")!.putImageData(md, 0, 0);
        g.globalCompositeOperation = "destination-in";
        g.imageSmoothingEnabled = true;
        g.drawImage(mc, 0, 0, c.width, c.height);
      }
      cache.set(k, c);
      if (cache.size > 60) cache.delete(cache.keys().next().value!);
      loading.delete(k);
      resolve();
      for (const f of listeners) f();
    };
    im.onerror = () => { loading.delete(k); resolve(); };
    im.src = img;
  });
  loading.set(k, p);
  return p;
}

// 表示用の切りぬいた写真（まだ読めていなければ null。読み始めておく）
export function imageCanvas(s: Stroke): HTMLCanvasElement | null {
  if (!s.img) return null;
  const c = cache.get(key(s.img, s.mask));
  if (!c) void load(s.img, s.mask);
  return c ?? null;
}

export const preloadImages = (strokes: Stroke[]) => Promise.all(strokes.filter((s) => s.img).map((s) => load(s.img!, s.mask))).then(() => undefined);
export function onImagesReady(f: () => void) { listeners.add(f); }

// 写真の線を作る: src の中の 写っている所（mask: mw×mh、src と同じ縦横比）を、キャンバスの rect に貼る
export function makeImageStroke(src: HTMLCanvasElement, mask: Uint8Array, mw: number, mh: number, rect: [number, number, number, number]): Stroke {
  const big = 300, small = 72;
  const enc = (side: number, q: number) => {
    const s = side / Math.max(src.width, src.height);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(src.width * s));
    c.height = Math.max(1, Math.round(src.height * s));
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(src, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", q);
  };
  return { color: "#000000", width: 0, points: rect.map((v) => Math.round(v)), img: enc(big, 0.85), mask: maskText(mask, mw, mh), timg: enc(small, 0.7) };
}
