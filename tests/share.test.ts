import { describe, expect, it } from "vitest";
import { shareText, storyLine, GAME_URL } from "../src/share";
import { CHAPTERS } from "../src/story";

describe("じまんの文", () => {
  it("ストーリーの いちばん先・倒したボス・ステータス・URL が入る", () => {
    const cleared = { "1-1": 1, "1-2": 2, "1-3": 1, "1-4": 1, "1-5": 1, "1-6": 1, "2-1": 1 };
    const t = shareText({ level: 12, spent: 18, cap: 60, titles: ["こうげきマスター"], cleared, chapters: CHAPTERS, partCount: 9, bestPart: "A ☄️メテオ(遠)", charName: "ねこまる" });
    expect(t).toContain("「ねこまる」");
    expect(t).toContain("第2章");
    expect(t).toContain("2-1");
    expect(t).toContain("(7/30)".replace("(", "（").replace(")", "）"));
    expect(t).toContain("らくがき大王");
    expect(t).toContain("Lv12・スキルツリー 18/60（こうげきマスター）");
    expect(t).toContain("A ☄️メテオ(遠)");
    expect(t).toContain(GAME_URL);
  });
  it("まだ何もクリアしていない・全部クリア", () => {
    expect(storyLine({}, CHAPTERS)).toContain("これから");
    const all = Object.fromEntries(CHAPTERS.flatMap((c) => c.stages.map((s) => [s.id, 1])));
    expect(storyLine(all, CHAPTERS)).toContain("ぜんぶ クリア");
  });
});
