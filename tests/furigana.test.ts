import { describe, expect, it } from "vitest";
import { readRun, segment, toKana } from "../src/furigana";

// 画面に出る文字（index.html と src の文字列）にある漢字を全部集める
async function visibleKanji(): Promise<{ run: string; after: string; where: string }[]> {
  const mod = "node:fs", pmod = "node:path";
  const fs: any = await import(/* @vite-ignore */ mod);
  const path: any = await import(/* @vite-ignore */ pmod);
  const files: string[] = ["index.html"];
  const walk = (d: string) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith(".ts") && !p.endsWith("furigana.ts")) files.push(p); } };
  walk("src");
  walk("server/src"); // サーバーから届く文（エラーなど）も画面に出る
  const out: { run: string; after: string; where: string }[] = [];
  for (const f of files) {
    let s = fs.readFileSync(f, "utf8");
    let texts: string[];
    if (f.endsWith(".ts")) {
      s = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
      texts = [...s.matchAll(/"([^"\n]*)"|`([^`]*)`|'([^'\n]*)'/g)].map((m) => m[1] ?? m[2] ?? m[3] ?? "");
    } else texts = [s.replace(/<!--[\s\S]*?-->/g, "").replace(/<style>[\s\S]*?<\/style>/g, "")];
    for (const t of texts) for (const m of t.matchAll(/[一-鿿々]+/g)) out.push({ run: m[0], after: t.slice(m.index! + m[0].length, m.index! + m[0].length + 3), where: f });
  }
  return out;
}

describe("ふりがな", () => {
  it("送りがなで読みが変わる字", () => {
    expect(toKana("消える")).toBe("きえる");
    expect(toKana("全部消す")).toBe("ぜんぶけす");
    expect(toKana("手を外して")).toBe("てをはずして");
    expect(toKana("外へ")).toBe("そとへ");
    expect(toKana("体あたり")).toBe("たいあたり");
    expect(toKana("必殺技の威力")).toBe("ひっさつわざのいりょく");
  });

  it("漢字のところだけに読みが付く", () => {
    expect(segment("敵を倒して強くなる")).toEqual([["敵", "てき"], ["を", null], ["倒", "たお"], ["して", null], ["強", "つよ"], ["くなる", null]]);
  });

  it("画面に出る漢字は全部 読める（辞書に足りない字があれば、ここで分かる）", async () => {
    const missing = new Set<string>();
    for (const { run, after, where } of await visibleKanji()) for (const [t, r] of readRun(run, after)) if (!r) missing.add(`${t}（${run}${after} @${where}）`);
    expect([...missing]).toEqual([]);
  });
});
