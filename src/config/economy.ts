export const ECONOMY_CONFIG = {
  startingPoints: 500,
  points: {
    nonLethalHit: 10,
    normalKill: 60,
    meleeKill: 130,
  },
  mysteryBoxPrice: 950,
  wallBuys: {
    mr6: { weaponPrice: 500, refillPrice: 250 },
    kuda: { weaponPrice: 1250, refillPrice: 625 },
  },
  mysteryBox: {
    cycleDurationMs: 3500,
    cycleLabelIntervalMs: 150,
    pickupTimeoutMs: 10000,
    feedbackDurationMs: 1600,
  },
} as const;
