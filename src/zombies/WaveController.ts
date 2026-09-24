import {
  getMaxAliveZombies,
  getSpawnIntervalMs,
  getZombieCount,
  getZombieHealth,
  getZombieMoveSpeed,
  WAVE_CONFIG,
} from "../config/waves";
import type { Arena, ArenaWindow, WindowId } from "../world/Arena";
import type { ZombieController } from "./ZombieController";

export type WavePhase = "active" | "intermission";

export interface WaveSnapshot {
  round: number;
  phase: WavePhase;
  totalZombies: number;
  spawnedZombies: number;
  aliveZombies: number;
  maxAliveZombies: number;
  nextRoundInMs: number;
}

export class WaveController {
  private round = 1;
  private phase: WavePhase = "active";
  private totalZombies = getZombieCount(1);
  private spawnedZombies = 0;
  private nextSpawnAt = 0;
  private intermissionEndsAt = 0;
  private lastWindowId: WindowId | null = null;
  private consecutiveWindowSpawns = 0;

  constructor(
    private readonly arena: Arena,
    private readonly zombies: ZombieController,
  ) {}

  update(now: number): void {
    if (this.phase === "intermission") {
      if (now >= this.intermissionEndsAt) {
        this.startRound(this.round + 1, now);
      }
      return;
    }

    this.spawnDueZombie(now);
    if (
      this.spawnedZombies >= this.totalZombies &&
      this.zombies.getAliveCount() === 0
    ) {
      this.phase = "intermission";
      this.intermissionEndsAt = now + WAVE_CONFIG.intermissionMs;
    }
  }

  snapshot(now: number): WaveSnapshot {
    return {
      round: this.round,
      phase: this.phase,
      totalZombies: this.totalZombies,
      spawnedZombies: this.spawnedZombies,
      aliveZombies: this.zombies.getAliveCount(),
      maxAliveZombies: getMaxAliveZombies(this.round),
      nextRoundInMs:
        this.phase === "intermission"
          ? Math.max(0, this.intermissionEndsAt - now)
          : 0,
    };
  }

  /** Dev-only: clear active zombies without scoring and begin the next round. */
  debugNextRound(now: number): void {
    this.zombies.clearAll();
    this.startRound(this.round + 1, now);
  }

  private spawnDueZombie(now: number): void {
    if (this.spawnedZombies >= this.totalZombies) return;
    if (this.zombies.getAliveCount() >= getMaxAliveZombies(this.round)) return;
    if (now < this.nextSpawnAt) return;

    const window = this.chooseSpawnWindow();
    this.zombies.spawn(
      window,
      getZombieHealth(this.round),
      getZombieMoveSpeed(this.round),
    );
    this.spawnedZombies += 1;
    this.nextSpawnAt = now + getSpawnIntervalMs(this.round);
  }

  private startRound(round: number, now: number): void {
    this.round = round;
    this.phase = "active";
    this.totalZombies = getZombieCount(round);
    this.spawnedZombies = 0;
    this.nextSpawnAt = now;
    this.intermissionEndsAt = 0;
    this.lastWindowId = null;
    this.consecutiveWindowSpawns = 0;
  }

  private chooseSpawnWindow(): ArenaWindow {
    const windows = this.arena.windows;
    if (windows.length === 0) {
      throw new Error("Arena must expose at least one zombie window.");
    }
    let candidates = windows;
    if (
      this.lastWindowId &&
      this.consecutiveWindowSpawns >= WAVE_CONFIG.consecutiveWindowLimit
    ) {
      const filtered = windows.filter(
        (window) => window.id !== this.lastWindowId,
      );
      if (filtered.length > 0) candidates = filtered;
    }

    const index = Math.floor(Math.random() * candidates.length);
    const selected = candidates[index];
    if (!selected) throw new Error("Failed to select a zombie spawn window.");

    if (selected.id === this.lastWindowId) {
      this.consecutiveWindowSpawns += 1;
    } else {
      this.lastWindowId = selected.id;
      this.consecutiveWindowSpawns = 1;
    }
    return selected;
  }
}
