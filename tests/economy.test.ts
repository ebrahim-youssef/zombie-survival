import { describe, expect, it } from "vitest";
import { RunState } from "../src/game/RunState";

describe("RunState economy", () => {
  it("starts with 500 and never permits invalid or unaffordable purchases", () => {
    const run = new RunState();
    expect(run.points).toBe(500);
    expect(run.trySpend(950)).toBe(false);
    expect(run.trySpend(-1)).toBe(false);
    expect(run.trySpend(Number.NaN)).toBe(false);
    expect(run.trySpend(250)).toBe(true);
    expect(run.points).toBe(250);
  });

  it("awards exactly one event per hit / kill", () => {
    const run = new RunState();
    run.awardZombieDamage(false, "gun");
    run.awardZombieDamage(true, "gun");
    run.awardZombieDamage(true, "melee");
    expect(run.points).toBe(500 + 10 + 60 + 130);
    expect(run.kills).toBe(2);
    expect(run.consumePointAwards()).toEqual([10, 60, 130]);
    expect(run.consumePointAwards()).toEqual([]);
  });
});
