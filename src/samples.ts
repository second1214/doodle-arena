// 検知の挙動確認用サンプル絵（CANVAS_SIZE=512 座標）。
import type { Stroke } from "./detect";

const line = (pts: number[], width = 8, color = "#222222"): Stroke => ({ color, width, points: pts });

function circle(cx: number, cy: number, r: number, width = 8, color = "#222222", n = 40): Stroke {
  const pts: number[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return line(pts, width, color);
}

function ellipse(cx: number, cy: number, rx: number, ry: number, width = 8, color = "#222222"): Stroke {
  const pts: number[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    pts.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  return line(pts, width, color);
}

function scribbleFill(cx: number, cy: number, r: number, color: string): Stroke {
  const pts: number[] = [];
  for (let y = -r; y <= r; y += 10) {
    const w = Math.sqrt(Math.max(0, r * r - y * y));
    pts.push(cx - w, cy + y, cx + w, cy + y + 5);
  }
  return line(pts, 14, color);
}

export const SAMPLES: Record<string, () => Stroke[]> = {
  "ふつうの生き物": () => [
    ellipse(256, 230, 90, 110),
    line([175, 200, 110, 160, 90, 120]), // 左手
    line([175, 205, 120, 190, 80, 140]),
    line([337, 200, 400, 170, 430, 130]), // 右手
    line([337, 205, 395, 190, 440, 150]),
    line([220, 335, 210, 420, 190, 450]), // 左足
    line([245, 338, 240, 420, 220, 455]),
    line([270, 338, 275, 420, 295, 455]), // 右足
    line([295, 335, 305, 420, 325, 450]),
    circle(225, 200, 8, 6), circle(285, 200, 8, 6),
  ],
  "棒人間": () => [
    circle(256, 110, 45),
    line([256, 155, 256, 310]),
    line([256, 200, 180, 260]),
    line([256, 200, 332, 260]),
    line([256, 310, 200, 430]),
    line([256, 310, 312, 430]),
  ],
  "トゲトゲ": () => {
    const s: Stroke[] = [scribbleFill(256, 256, 90, "#c0392b")];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      s.push(line([256 + Math.cos(a) * 85, 256 + Math.sin(a) * 85, 256 + Math.cos(a) * 170, 256 + Math.sin(a) * 170], 10, "#c0392b"));
    }
    return s;
  },
  "タコ": () => {
    const s: Stroke[] = [scribbleFill(256, 190, 100, "#2e86de")];
    for (let i = 0; i < 8; i++) {
      const x = 170 + i * 25;
      const pts: number[] = [];
      for (let t = 0; t <= 10; t++) pts.push(x + Math.sin(t * 0.8 + i) * 15, 270 + t * 18);
      s.push(line(pts, 12, "#2e86de"));
    }
    return s;
  },
  "まんまる（塗りつぶし）": () => [scribbleFill(256, 256, 130, "#27ae60")],
  "文字 ABC": () => [
    line([90, 330, 130, 180, 170, 330]), line([105, 270, 155, 270]),
    line([210, 180, 210, 330]), line([210, 180, 260, 190, 265, 245, 210, 255, 270, 270, 265, 325, 210, 330]),
    line([400, 195, 360, 180, 320, 210, 315, 280, 345, 325, 400, 315]),
  ],
  "巨大な片手": () => [ellipse(150, 300, 70, 70), line([215, 280, 330, 230, 480, 200], 22)],
  "胴長ノッポ": () => [
    ellipse(256, 200, 50, 150), line([230, 345, 225, 470]), line([282, 345, 287, 470]),
    line([210, 150, 150, 200]), line([302, 150, 362, 200]),
  ],
  "短足ずんぐり": () => [
    ellipse(256, 240, 160, 110), line([200, 345, 195, 385], 14), line([312, 345, 317, 385], 14),
    line([100, 220, 40, 180]), line([412, 220, 472, 180]),
  ],
};
