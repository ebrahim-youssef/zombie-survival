import { describe, expect, it } from "vitest";
import {
  getMaxAliveZombies,
  getSpawnIntervalMs,
  getZombieCount,
  getZombieHealth,
  getZombieMoveSpeed,
} from "../src/config/waves";

describe("wave balance", () => {
  it("keeps frozen BO3-inspired HP and solo counts", () => {
    expect([1, 2, 5, 9, 10].map(getZombieHealth))
      .toEqual([150, 250, 550, 950, 1045]);
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20].map(getZombieCount))
      .toEqual([6, 8, 13, 18, 24, 27, 28, 28, 29, 33, 60]);
  });

  it("caps alive count, spawn rate and speed", () => {
    expect(getMaxAliveZombies(1)).toBe(6);
    expect(getMaxAliveZombies(30)).toBe(24);
    expect(getSpawnIntervalMs(1)).toBe(1400);
    expect(getSpawnIntervalMs(100)).toBe(350);
    expect(getZombieMoveSpeed(1)).toBe(82);
    expect(getZombieMoveSpeed(100)).toBe(135);
  });

  it("rejects invalid rounds", () => {
    expect(() => getZombieHealth(0)).toThrow(RangeError);
    expect(() => getZombieCount(2.2)).toThrow(RangeError);
  });
});
