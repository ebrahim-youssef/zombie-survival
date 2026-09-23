import { WeaponController } from "./WeaponController";
import {
  getWeaponDefinition,
  MR6,
  type WeaponId,
} from "./weaponDefinitions";

export interface InventorySlotSnapshot {
  slot: 1 | 2;
  weaponId: WeaponId | null;
  name: string | null;
  active: boolean;
}

export type AcquireResult =
  | { kind: "already-owned"; slot: 0 | 1 }
  | { kind: "filled-empty"; slot: 0 | 1 }
  | { kind: "replaced-active"; slot: 0 | 1 };

export class InventoryController {
  private readonly slots: [
    WeaponController | null,
    WeaponController | null,
  ] = [
    new WeaponController(MR6),
    null,
  ];

  private activeSlot: 0 | 1 = 0;

  get activeWeapon(): WeaponController {
    const weapon = this.slots[this.activeSlot];

    if (!weapon) {
      throw new Error("Active inventory slot cannot be empty.");
    }

    return weapon;
  }

  update(now: number): void {
    for (const weapon of this.slots) {
      weapon?.update(now);
    }
  }

  owns(id: WeaponId): boolean {
    return this.slots.some(
      (weapon) => weapon?.definition.id === id,
    );
  }

  getOwnedWeaponIds(): WeaponId[] {
    const ids: WeaponId[] = [];

    for (const weapon of this.slots) {
      if (weapon) {
        ids.push(weapon.definition.id);
      }
    }

    return ids;
  }

  acquire(id: WeaponId): AcquireResult {
    const existingIndex = this.slots.findIndex(
      (weapon) => weapon?.definition.id === id,
    );

    if (existingIndex === 0 || existingIndex === 1) {
      this.switchTo(existingIndex);
      return {
        kind: "already-owned",
        slot: existingIndex,
      };
    }

    const emptyIndex = this.slots.findIndex(
      (weapon) => weapon === null,
    );

    const targetSlot: 0 | 1 =
      emptyIndex === 0 || emptyIndex === 1
        ? emptyIndex
        : this.activeSlot;

    const replacedExisting =
      this.slots[targetSlot] !== null;

    this.slots[this.activeSlot]?.cancelReload();

    const definition = getWeaponDefinition(id);

    this.slots[targetSlot] = new WeaponController(
      definition,
      definition.maxReserveAmmo,
    );
    this.activeSlot = targetSlot;

    return {
      kind: replacedExisting
        ? "replaced-active"
        : "filled-empty",
      slot: targetSlot,
    };
  }

  switchTo(slot: 0 | 1): boolean {
    const target = this.slots[slot];

    if (!target || slot === this.activeSlot) {
      return false;
    }

    this.activeWeapon.cancelReload();
    this.activeSlot = slot;
    return true;
  }

  switchToDisplaySlot(slot: 1 | 2): boolean {
    return this.switchTo(slot - 1 as 0 | 1);
  }

  cycle(direction: -1 | 0 | 1): boolean {
    if (direction === 0) return false;

    const otherSlot: 0 | 1 =
      this.activeSlot === 0 ? 1 : 0;

    return this.switchTo(otherSlot);
  }

  refillOwned(id: WeaponId): boolean {
    const weapon = this.slots.find(
      (candidate) => candidate?.definition.id === id,
    );

    if (!weapon) return false;

    weapon.refill();
    return true;
  }

  snapshot(): readonly [
    InventorySlotSnapshot,
    InventorySlotSnapshot,
  ] {
    return [
      this.slotSnapshot(0),
      this.slotSnapshot(1),
    ];
  }

  destroy(): void {
    for (const weapon of this.slots) {
      weapon?.cancelReload();
    }
  }

  private slotSnapshot(
    slot: 0 | 1,
  ): InventorySlotSnapshot {
    const weapon = this.slots[slot];

    return {
      slot: slot === 0 ? 1 : 2,
      weaponId: weapon?.definition.id ?? null,
      name: weapon?.definition.name ?? null,
      active: slot === this.activeSlot,
    };
  }
}
