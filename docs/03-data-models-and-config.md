# 03 — Data Models and Config

All balancing values belong in typed configuration.

## Player

```ts
interface PlayerConfig {
  baseMoveSpeed: number;
  diagonalMultiplier: number;
  maxHealth: number;
  regenDelayMs: number;
  regenPerSecond: number;
  meleeDamage: number;
  meleeRange: number;
  meleeArcDegrees: number;
  meleeCooldownMs: number;
  interactionRange: number;
}
```

Initial target:

```ts
{
  baseMoveSpeed: 180,
  diagonalMultiplier: 1.25,
  maxHealth: 150,
  regenDelayMs: 2500,
  regenPerSecond: 100,
  meleeDamage: 150,
  meleeRange: 64,
  meleeArcDegrees: 70,
  meleeCooldownMs: 775,
  interactionRange: 72
}
```

## Weapons

```ts
type WeaponId = "mr6" | "kuda" | "kn44" | "krm262" | "brm" | "drakon";

interface WeaponDefinition {
  id: WeaponId;
  name: string;
  fireMode: "semi" | "auto" | "pump";
  rpm: number;
  magazineSize: number;
  maxReserveAmmo: number;
  loadedReloadMs: number;
  emptyReloadMs: number;
  minDamage: number;
  maxDamage: number;
  spreadDegrees: number;
  pelletCount: number;
  penetration: {
    zombies: number;
    walls: number;
  };
  wallPrice?: number;
}
```

Runtime ammo state must be separate from immutable definitions.

## Inventory

```ts
interface InventoryState {
  slots: [WeaponState | null, WeaponState | null];
  activeSlot: 0 | 1;
}
```

## Wave pure functions

- `getZombieHealth(round)`
- `getZombieCount(round)`
- `getMaxAliveZombies(round)`
- later: `getZombieMoveSpeed(round)`
- later: `getSpawnInterval(round)`

Pure scaling functions should be unit-testable without Phaser.

## Economy

```text
Starting points: 500
Non-lethal hit: +10
Normal kill: +60
Melee kill: +130
Mystery Box: 950
MR6: 500
Kuda: 1250
```

No gameplay magic numbers should be buried inside entity methods.
