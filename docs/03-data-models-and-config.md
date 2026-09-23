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

## Weapons

```ts
type WeaponId =
  | "mr6"
  | "kuda"
  | "kn44"
  | "krm262"
  | "brm"
  | "drakon";

interface WeaponDefinition {
  id: WeaponId;
  name: string;
  weaponClass:
    | "pistol"
    | "smg"
    | "assault-rifle"
    | "shotgun"
    | "lmg"
    | "sniper";
  fireMode: "semi" | "auto" | "pump";
  rpm: number;
  magazineSize: number;
  startingReserveAmmo: number;
  maxReserveAmmo: number;
  loadedReloadMs: number;
  emptyReloadMs: number;
  maxDamage: number;
  minDamage: number;
  falloffStart: number;
  falloffEnd: number;
  spreadDegrees: number;
  pelletCount: number;
  tracerDurationMs: number;
  tracerMaxDistance: number;
}
```

The 2D falloff distances are adaptations chosen for the room scale.

Runtime ammo and reload state live in `WeaponController`, separate from immutable weapon definitions.

## Inventory

Two slots only:

```text
Slot 1: MR6
Slot 2: empty
```

Rules:

- acquisition fills an empty slot first;
- if both are full, replace the equipped slot;
- acquisition equips the newly received weapon;
- an already-owned weapon is not duplicated;
- switching cancels an in-progress reload without transferring ammo;
- 1/2 selects slots;
- mouse wheel cycles between owned slots.

The acquisition API is implemented in Phase 5; wall buys and Mystery Box call it in Phase 6.

## Wave pure functions

- `getZombieHealth(round)`
- `getZombieCount(round)`
- `getMaxAliveZombies(round)`
- `getZombieMoveSpeed(round)`
- `getSpawnIntervalMs(round)`

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
