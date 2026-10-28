import { describe, expect, it } from "vitest";
import { shareText, storyLine, xLength, X_LIMIT, GAME_URL } from "../src/share";
import { CHAPTERS } from "../src/story";

describe("じまんの文", () => {
  it("ストーリーの いちばん先・倒したボス・ステータス・URL が入る", () => {
    const cleared = { "1-1": 1, "1-2": 2, "1-3": 1, "1-4": 1, "1-5": 1, "1-6": 1, "2-1": 1 };
    const t = shareText({ level: 12, spent: 18, cap: 60, titles: ["こうげきマスター"], cleared, chapters: CHAPTERS, partCount: 9, bestPart: "A ☄️メテオ(遠)", charName: "ねこまる" });
    expect(t).toContain("「ねこまる」");
    expect(t).toContain("第2章");
    expect(t).toContain("2-1");
    expect(t).toContain("（7/72）");
    expect(t).toContain("らくがき大王");
    expect(t).toContain("Lv12 ツリー18/60（こうげきマスター）");
    expect(t).toContain("A ☄️メテオ(遠)");
    expect(t).toContain(GAME_URL);
  });
  it("まだ何もクリアしていない・全部クリア", () => {
    expect(storyLine({}, CHAPTERS)).toContain("これから");
    const all = Object.fromEntries(CHAPTERS.flatMap((c) => c.stages.map((s) => [s.id, 1])));
    expect(storyLine(all, CHAPTERS)).toContain("ぜんぶ クリア");
  });
});

describe("X の 文字数（280）に おさまる", () => {
  it("数え方: 日本語・絵文字は 2、英数字は 1、URL は 23", () => {
    expect(xLength("abc")).toBe(3);
    expect(xLength("あいう")).toBe(6);
    expect(xLength("✏️⚔️")).toBe(4);
    expect(xLength(GAME_URL)).toBe(23);
  });
  it("いちばん 長くなる時（ぜんぶ クリア・称号 ぜんぶ・長い名前）でも 280 以内", () => {
    const all = Object.fromEntries(CHAPTERS.flatMap((c) => c.stages.map((s) => [s.id, 1])));
    const titles = ["こうげきマスター", "まもりマスター", "すばやさマスター", "ひっさつマスター", "たいりょくマスター"];
    for (const cleared of [all, Object.fromEntries(Object.entries(all).slice(0, -1))]) {
      const t = shareText({ level: 60, spent: 60, cap: 60, titles, cleared, chapters: CHAPTERS, partCount: 999, bestPart: "S ☄️メテオ(遠)", charName: "ながいながいなまえのねこまるちゃんだよーーー" });
      expect(xLength(t)).toBeLessThanOrEqual(X_LIMIT);
      expect(t).toContain(GAME_URL);
      expect(t).toContain("Lv60");
    }
  });
});
