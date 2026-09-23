import { describe, expect, it } from "vitest";
import { GameplayClock } from "../src/game/GameplayClock";

describe("scene-local gameplay clock", () => {
  it("does not advance when the paused scene is not updated", () => {
    const clock = new GameplayClock();
    expect(clock.advance(40)).toBe(40);
    expect(clock.now).toBe(40);
    expect(clock.now).toBe(40);
    expect(clock.advance(16)).toBe(56);
  });

  it("caps tab-throttling spikes and ignores invalid deltas", () => {
    const clock = new GameplayClock();
    expect(clock.advance(5_000)).toBe(100);
    expect(clock.advance(-3)).toBe(100);
    expect(clock.advance(Number.NaN)).toBe(100);
    expect(clock.advance(10)).toBe(110);
  });
});
