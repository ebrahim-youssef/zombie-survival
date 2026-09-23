export const WAVE_CONFIG = {
  intermissionMs: 5000,
  consecutiveWindowLimit: 2,
  absoluteActiveZombieCap: 24,
} as const;

const EARLY_SOLO_COUNTS = [6, 8, 13, 18, 24, 27, 28, 28, 29] as const;

export function getZombieHealth(round: number): number {
  if (round < 1) throw new RangeError("Round must be >= 1.");
  if (round <= 9) return 100 * round + 50;
  return Math.floor(950 * Math.pow(1.1, round - 9));
}

export function getZombieCount(round: number): number {
  if (round < 1) throw new RangeError("Round must be >= 1.");
  if (round <= EARLY_SOLO_COUNTS.length) return EARLY_SOLO_COUNTS[round - 1]!;
  return 24 + Math.floor(0.5 * 0.18 * round ** 2);
}

export function getMaxAliveZombies(round: number): number {
  if (round < 1) throw new RangeError("Round must be >= 1.");
  return Math.min(
    WAVE_CONFIG.absoluteActiveZombieCap,
    Math.max(6, 6 + Math.floor(round * 0.75)),
  );
}
