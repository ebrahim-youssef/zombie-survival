export const WAVE_CONFIG = {
  intermissionMs: 5000,
  consecutiveWindowLimit: 2,
  absoluteActiveZombieCap: 24,
  baseSpawnIntervalMs: 1400,
  minimumSpawnIntervalMs: 350,
  spawnIntervalReductionPerRoundMs: 55,
  baseZombieSpeed: 82,
  zombieSpeedIncreasePerRound: 2.25,
  maxZombieSpeed: 135,
} as const;

const EARLY_SOLO_COUNTS = [6, 8, 13, 18, 24, 27, 28, 28, 29] as const;

export function getZombieHealth(round: number): number {
  assertRound(round);

  if (round <= 9) {
    return 100 * round + 50;
  }

  return Math.floor(950 * Math.pow(1.1, round - 9));
}

export function getZombieCount(round: number): number {
  assertRound(round);

  if (round <= EARLY_SOLO_COUNTS.length) {
    return EARLY_SOLO_COUNTS[round - 1]!;
  }

  return 24 + Math.floor(0.5 * 0.18 * round ** 2);
}

export function getMaxAliveZombies(round: number): number {
  assertRound(round);

  return Math.min(
    WAVE_CONFIG.absoluteActiveZombieCap,
    Math.max(6, 6 + Math.floor(round * 0.75)),
  );
}

/**
 * 2D adaptation: progressively shortens the delay between spawns while
 * retaining a floor so later rounds do not become a single-frame burst.
 */
export function getSpawnIntervalMs(round: number): number {
  assertRound(round);

  return Math.max(
    WAVE_CONFIG.minimumSpawnIntervalMs,
    WAVE_CONFIG.baseSpawnIntervalMs -
      (round - 1) * WAVE_CONFIG.spawnIntervalReductionPerRoundMs,
  );
}

/**
 * 2D adaptation: modestly increases pursuit speed per round.
 */
export function getZombieMoveSpeed(round: number): number {
  assertRound(round);

  return Math.min(
    WAVE_CONFIG.maxZombieSpeed,
    WAVE_CONFIG.baseZombieSpeed +
      (round - 1) * WAVE_CONFIG.zombieSpeedIncreasePerRound,
  );
}

function assertRound(round: number): void {
  if (!Number.isInteger(round) || round < 1) {
    throw new RangeError("Round must be an integer >= 1.");
  }
}
