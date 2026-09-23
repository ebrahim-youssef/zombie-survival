import { describe, expect, it } from "vitest";
import { InventoryController } from "../src/weapons/InventoryController";
import { WeaponController } from "../src/weapons/WeaponController";
import {
  getDamageAtDistance,
  WEAPON_DEFINITIONS,
} from "../src/weapons/weaponDefinitions";

describe("weapon reloads and cadence", () => {
  it("MR6 is semi-auto, rate-limited and starts with 8/32", () => {
    const w = new WeaponController(WEAPON_DEFINITIONS.mr6);
    expect(w.snapshot()).toMatchObject({
      magazineAmmo: 8,
      reserveAmmo: 32,
      isReloading: false,
    });
    expect(w.tryFire(0, false, true)).toBe(false);
    expect(w.tryFire(0, true, true)).toBe(true);
    expect(w.tryFire(60, true, true)).toBe(false);
    expect(w.tryFire(120, true, true)).toBe(true);
    expect(w.snapshot().magazineAmmo).toBe(6);
  });

  it("reload cancel does not transfer reserve", () => {
    const w = new WeaponController(WEAPON_DEFINITIONS.mr6);
    w.tryFire(0, true, true);
    expect(w.startReload(150)).toBe(true);
    expect(w.isReloading).toBe(true);
    w.cancelReload();
    w.update(5000);
    expect(w.snapshot()).toMatchObject({
      magazineAmmo: 7,
      reserveAmmo: 32,
      isReloading: false,
    });
  });

  it("auto-reloads an empty magazine after the appropriate delay", () => {
    const w = new WeaponController(WEAPON_DEFINITIONS.mr6);
    for (let i = 0; i < 8; i += 1) {
      expect(w.tryFire(i * 120, true, true)).toBe(true);
    }
    expect(w.isReloading).toBe(true);
    w.update(840 + WEAPON_DEFINITIONS.mr6.emptyReloadMs - 1);
    expect(w.snapshot().magazineAmmo).toBe(0);
    w.update(840 + WEAPON_DEFINITIONS.mr6.emptyReloadMs);
    expect(w.snapshot()).toMatchObject({
      magazineAmmo: 8,
      reserveAmmo: 24,
      isReloading: false,
    });
  });
});

describe("two-slot inventory", () => {
  it("fills empty slot, switches and replaces equipped when full", () => {
    const i = new InventoryController();
    expect(i.snapshot().map((x) => x.weaponId)).toEqual(["mr6", null]);
    expect(i.acquire("kuda")).toEqual({ kind: "filled-empty", slot: 1 });
    expect(i.activeWeapon.definition.id).toBe("kuda");
    expect(i.switchToDisplaySlot(1)).toBe(true);
    expect(i.acquire("brm")).toEqual({ kind: "replaced-active", slot: 0 });
    expect(i.snapshot().map((x) => x.weaponId)).toEqual(["brm", "kuda"]);
    expect(i.acquire("kuda")).toEqual({ kind: "already-owned", slot: 1 });
    expect(i.getOwnedWeaponIds()).toEqual(["brm", "kuda"]);
  });

  it("switching cancels current weapon reload", () => {
    const i = new InventoryController();
    i.acquire("kuda");
    i.switchToDisplaySlot(1);
    const old = i.activeWeapon;
    old.tryFire(0, false, true); // semi MR6 requires press
    old.tryFire(0, true, true);
    old.startReload(100);
    expect(old.isReloading).toBe(true);
    i.switchToDisplaySlot(2);
    expect(old.isReloading).toBe(false);
    expect(old.snapshot().magazineAmmo).toBe(7);
  });

  it("preserves falloff weapon identities", () => {
    expect(getDamageAtDistance(WEAPON_DEFINITIONS.mr6, 1_000)).toBe(20);
    expect(getDamageAtDistance(WEAPON_DEFINITIONS.kuda, 260)).toBe(110);
    expect(getDamageAtDistance(WEAPON_DEFINITIONS.kuda, 650)).toBe(60);
    expect(getDamageAtDistance(WEAPON_DEFINITIONS.drakon, 800)).toBeLessThan(500);
  });
});
