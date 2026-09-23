/**
 * A scene-local monotonic clock. Call advance() only while gameplay runs;
 * pausing the GameScene therefore freezes waves, reloads and HP regeneration.
 * Capping deltas prevents a sleeping browser tab from fast-forwarding the run.
 */
export class GameplayClock {
  private elapsedMs = 0;

  get now(): number {
    return this.elapsedMs;
  }

  advance(deltaMs: number): number {
    if (Number.isFinite(deltaMs) && deltaMs > 0) {
      this.elapsedMs += Math.min(deltaMs, 100);
    }
    return this.elapsedMs;
  }
}
