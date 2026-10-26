import { describe, expect, it } from "vitest";
import { volleyDamage, estimateDamage } from "../src/sim/estimate";
import type { FighterConfig } from "../src/sim/world";
import type { MeleeEffectId } from "../src/sim/melee";

const melee = (m: MeleeEffectId[]): FighterConfig => ({ name: "me", reach: 0.8, hasHands: true, hasFeet: true, special: [], melee: m, specialType: "melee" });

describe("近接の 掛け算わざ（しょうげき波・れんぞくわざ・ざんぞう）", () => {
  it("れんぞくわざで わざが もう1回（重ねると もっと）", () => {
    const a = volleyDamage(melee(["tornado"]), "stand", 11), b = volleyDamage(melee(["tornado", "rush"]), "stand", 11), c = volleyDamage(melee(["tornado", "rush", "rush"]), "stand", 11);
    expect(b.hits).toBeGreaterThan(a.hits);
    expect(c.hits).toBeGreaterThan(b.hits);
  });
  it("しょうげき波は 届かない 相手にも 飛んでいく（吹き飛ばさないので わざ本体も 続けて 当たる）", () => {
    const a = volleyDamage(melee(["tornado"]), "stand", 11), b = volleyDamage(melee(["tornado", "shockwave"]), "stand", 11);
    expect(b.hits).toBeGreaterThan(a.hits);
    expect(b.dealt).toBeGreaterThan(a.dealt);
  });
  it("ざんぞうは 当てた所で もう一度 当たる", () => {
    const a = volleyDamage(melee(["tornado"]), "stand", 11), b = volleyDamage(melee(["tornado", "echo"]), "stand", 11);
    expect(b.hits).toBeGreaterThan(a.hits);
  });
  it("想定ダメージは 毎回 同じ（決まった シード）", () => {
    expect(estimateDamage(melee(["dash", "rush", "echo"]))).toEqual(estimateDamage(melee(["dash", "rush", "echo"])));
  });
});
