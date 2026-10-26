// 絵の アイコン（game-icons.net・CC BY 3.0）。シール・ボタン・タブに 使う。文の 中（おしらせ・じまんの文）は 絵文字の まま。
import { ICON_PATHS } from "./iconPaths";

// 形に 白い ふちどり（シールらしく）＋色。size は CSS で 決める
export function icon(name: string, color = "currentColor", outline = true): string {
  const d = ICON_PATHS[name];
  if (!d) return "";
  const edge = outline ? ` stroke="#fff" stroke-width="34" stroke-linejoin="round" paint-order="stroke"` : "";
  return `<svg class="gi" viewBox="-16 -16 544 544" aria-hidden="true"><path d="${d}" fill="${color}"${edge}/></svg>`;
}

// シールの しゅるい → [アイコン, 色]
export const KIND_GLYPH: Record<string, [string, string]> = {
  "r:invisible": ["floating-ghost", "#868e96"], "r:giant": ["falling-boulder", "#8d6e63"], "r:multi": ["stars-stack", "#f59f00"], "r:restrain": ["crossed-chains", "#495057"],
  "r:tiny": ["bullets", "#e8590c"], "r:fast": ["fast-arrow", "#1c7ed6"], "r:homing": ["bee", "#f08c00"], "r:meteor": ["burning-meteor", "#e03131"],
  "m:giantHands": ["open-palm", "#e8590c"], "m:rubber": ["boxing-glove", "#e03131"], "m:tornado": ["tornado", "#5c7cfa"], "m:dash": ["sprint", "#0ca678"],
  "m:slam": ["hammer-drop", "#795548"], "m:grab": ["grab", "#d6336c"], "m:wobble": ["knocked-out-stars", "#ae3ec9"], "m:legbind": ["foot-trip", "#8d6e63"], "m:crumple": ["paper-bag-crumpled", "#adb5bd"],
  "r:split": ["split-arrows", "#f76707"], "r:bounce": ["bouncing-spring", "#20c997"], "r:boomerang": ["boomerang", "#a0522d"], "r:trap": ["wolf-trap", "#5f3dc4"],
  "r:vacuum": ["vortex", "#7048e8"], "r:drain": ["heart-drop", "#c2255c"], "r:freeze": ["ice-cubes", "#4dabf7"], "r:blast": ["unlit-bomb", "#343a40"],
  "r:wave": ["big-wave", "#1971c2"], "r:net": ["spider-web", "#495057"], "r:thunder": ["thunder-struck", "#fab005"], "r:rain": ["raining", "#339af0"],
  "r:cloud": ["fluffy-cloud", "#74c0fc"], "r:drip": ["droplets", "#228be6"], "r:fire": ["fire", "#f03e3e"],
  "m:uppercut": ["punch-blast", "#f76707"], "m:dive": ["eagle-emblem", "#5f3dc4"], "m:gust": ["whirlwind", "#38d9a9"], "m:flame": ["fire-punch", "#e8590c"],
  "m:magnet": ["magnet", "#e03131"], "m:vampire": ["bat", "#862e9c"], "m:ice": ["ice-skate", "#339af0"], "m:counter": ["return-arrow", "#1098ad"],
  "m:shockwave": ["sonic-boom", "#1c7ed6"], "m:rush": ["fist", "#e8590c"], "m:echo": ["shadow-follower", "#7048e8"],
  "m:mushroom": ["spotted-mushroom", "#e03131"], "m:bulldozer": ["bulldozer", "#f59f00"],
  bigger: ["balloons", "#f06595"], lucky: ["clover", "#2f9e44"], carry: ["cycle", "#0c8599"], pierce: ["piercing-sword", "#495057"],
  power: ["muscle-up", "#e8590c"], pspeed: ["bow-arrow", "#a0522d"], duration: ["hourglass", "#b08900"], windup: ["fast-forward-button", "#1c7ed6"], charge: ["battery-plus", "#2f9e44"],
};
export const kindGlyph = (kind: string, outline = true) => {
  const g = KIND_GLYPH[kind];
  return g ? icon(g[0], g[1], outline) : "";
};

// 画面の ボタン・タブ（data-icon="名前" を 付けた所を 絵に する）
export function fillIcons(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-icon]").forEach((el) => {
    const svg = icon(el.dataset.icon!, el.dataset.iconColor ?? "currentColor", el.dataset.iconOutline !== "0");
    if (svg) el.innerHTML = svg;
  });
}
