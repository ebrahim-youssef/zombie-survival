/**
 * Group multiple pellet impacts into one scoring event per target per shot.
 * Damage still accumulates on every impact; lethal scoring supersedes
 * non-lethal scoring when later pellets finish the same target.
 */
export class ShotHitLedger<T> {
  private readonly hits = new Map<T, { damage: number; killed: boolean }>();

  record(target: T, damage: number, killed: boolean): void {
    const previous = this.hits.get(target);
    this.hits.set(target, {
      damage: (previous?.damage ?? 0) + damage,
      killed: killed || (previous?.killed ?? false),
    });
  }

  entries(): IterableIterator<[T, { damage: number; killed: boolean }]> {
    return this.hits.entries();
  }
}
