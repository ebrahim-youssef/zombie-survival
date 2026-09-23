import type { WeaponDefinition } from "./weaponDefinitions";

export interface WeaponSnapshot {
  name: string;
  magazineAmmo: number;
  reserveAmmo: number;
  magazineSize: number;
  maxReserveAmmo: number;
  isReloading: boolean;
}

export class WeaponController {
  private magazineAmmo: number;
  private reserveAmmo: number;
  private reloadCompleteAt: number | null = null;
  private lastShotAt = Number.NEGATIVE_INFINITY;

  constructor(readonly definition: WeaponDefinition) {
    this.magazineAmmo = definition.magazineSize;
    this.reserveAmmo = definition.startingReserveAmmo;
  }

  get isReloading(): boolean {
    return this.reloadCompleteAt !== null;
  }

  update(now: number): void {
    if (
      this.reloadCompleteAt !== null &&
      now >= this.reloadCompleteAt
    ) {
      this.finishReload();
    }
  }

  tryFire(
    now: number,
    firePressed: boolean,
    fireHeld: boolean,
  ): boolean {
    this.update(now);

    if (this.isReloading) return false;

    const wantsToFire =
      this.definition.fireMode === "auto"
        ? fireHeld
        : firePressed;

    if (!wantsToFire) return false;

    if (this.magazineAmmo <= 0) {
      this.startReload(now);
      return false;
    }

    const shotIntervalMs = 60_000 / this.definition.rpm;
    if (now - this.lastShotAt < shotIntervalMs) return false;

    this.magazineAmmo -= 1;
    this.lastShotAt = now;

    if (this.magazineAmmo === 0 && this.reserveAmmo > 0) {
      this.startReload(now);
    }

    return true;
  }

  startReload(now: number): boolean {
    if (this.isReloading) return false;
    if (this.reserveAmmo <= 0) return false;
    if (this.magazineAmmo >= this.definition.magazineSize) return false;

    const duration =
      this.magazineAmmo === 0
        ? this.definition.emptyReloadMs
        : this.definition.loadedReloadMs;

    this.reloadCompleteAt = now + duration;
    return true;
  }

  cancelReload(): void {
    this.reloadCompleteAt = null;
  }

  refill(): void {
    this.magazineAmmo = this.definition.magazineSize;
    this.reserveAmmo = this.definition.maxReserveAmmo;
    this.reloadCompleteAt = null;
  }

  snapshot(): WeaponSnapshot {
    return {
      name: this.definition.name,
      magazineAmmo: this.magazineAmmo,
      reserveAmmo: this.reserveAmmo,
      magazineSize: this.definition.magazineSize,
      maxReserveAmmo: this.definition.maxReserveAmmo,
      isReloading: this.isReloading,
    };
  }

  private finishReload(): void {
    const needed =
      this.definition.magazineSize - this.magazineAmmo;
    const transferred = Math.min(needed, this.reserveAmmo);

    this.magazineAmmo += transferred;
    this.reserveAmmo -= transferred;
    this.reloadCompleteAt = null;
  }
}
