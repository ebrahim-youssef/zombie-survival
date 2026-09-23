export type WeaponId =
  | "mr6"
  | "kuda"
  | "kn44"
  | "krm262"
  | "brm"
  | "drakon";

export type WeaponClass =
  | "pistol"
  | "smg"
  | "assault-rifle"
  | "shotgun"
  | "lmg"
  | "sniper";

export type FireMode = "semi" | "auto" | "pump";

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  weaponClass: WeaponClass;
  fireMode: FireMode;
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

export const WEAPON_DEFINITIONS = {
  mr6: {
    id: "mr6",
    name: "MR6",
    weaponClass: "pistol",
    fireMode: "semi",
    rpm: 500,
    magazineSize: 8,
    startingReserveAmmo: 32,
    maxReserveAmmo: 80,
    loadedReloadMs: 1500,
    emptyReloadMs: 1850,
    maxDamage: 20,
    minDamage: 20,
    falloffStart: 2400,
    falloffEnd: 2400,
    spreadDegrees: 1.25,
    pelletCount: 1,
    tracerDurationMs: 55,
    tracerMaxDistance: 2400,
  },
  kuda: {
    id: "kuda",
    name: "Kuda",
    weaponClass: "smg",
    fireMode: "auto",
    rpm: 722,
    magazineSize: 30,
    startingReserveAmmo: 210,
    maxReserveAmmo: 210,
    loadedReloadMs: 1800,
    emptyReloadMs: 2300,
    maxDamage: 110,
    minDamage: 60,
    falloffStart: 260,
    falloffEnd: 650,
    spreadDegrees: 2.2,
    pelletCount: 1,
    tracerDurationMs: 50,
    tracerMaxDistance: 2400,
  },
  kn44: {
    id: "kn44",
    name: "KN-44",
    weaponClass: "assault-rifle",
    fireMode: "auto",
    rpm: 625,
    magazineSize: 30,
    startingReserveAmmo: 210,
    maxReserveAmmo: 210,
    loadedReloadMs: 2030,
    emptyReloadMs: 2800,
    maxDamage: 120,
    minDamage: 70,
    falloffStart: 340,
    falloffEnd: 780,
    spreadDegrees: 1.6,
    pelletCount: 1,
    tracerDurationMs: 52,
    tracerMaxDistance: 2400,
  },
  krm262: {
    id: "krm262",
    name: "KRM-262",
    weaponClass: "shotgun",
    fireMode: "pump",
    rpm: 60,
    magazineSize: 8,
    startingReserveAmmo: 48,
    maxReserveAmmo: 48,
    loadedReloadMs: 3200,
    emptyReloadMs: 3600,
    maxDamage: 225,
    minDamage: 40,
    falloffStart: 150,
    falloffEnd: 430,
    spreadDegrees: 7.5,
    pelletCount: 4,
    tracerDurationMs: 58,
    tracerMaxDistance: 1600,
  },
  brm: {
    id: "brm",
    name: "BRM",
    weaponClass: "lmg",
    fireMode: "auto",
    rpm: 517,
    magazineSize: 75,
    startingReserveAmmo: 375,
    maxReserveAmmo: 375,
    loadedReloadMs: 5200,
    emptyReloadMs: 7000,
    maxDamage: 200,
    minDamage: 80,
    falloffStart: 380,
    falloffEnd: 850,
    spreadDegrees: 2.4,
    pelletCount: 1,
    tracerDurationMs: 55,
    tracerMaxDistance: 2400,
  },
  drakon: {
    id: "drakon",
    name: "Drakon",
    weaponClass: "sniper",
    fireMode: "semi",
    rpm: 240,
    magazineSize: 20,
    startingReserveAmmo: 100,
    maxReserveAmmo: 100,
    loadedReloadMs: 2600,
    emptyReloadMs: 3300,
    maxDamage: 500,
    minDamage: 400,
    falloffStart: 500,
    falloffEnd: 1000,
    spreadDegrees: 0.6,
    pelletCount: 1,
    tracerDurationMs: 65,
    tracerMaxDistance: 2800,
  },
} as const satisfies Record<WeaponId, WeaponDefinition>;

export const MR6 = WEAPON_DEFINITIONS.mr6;

export function getWeaponDefinition(id: WeaponId): WeaponDefinition {
  return WEAPON_DEFINITIONS[id];
}

export function getDamageAtDistance(
  definition: WeaponDefinition,
  distance: number,
): number {
  if (distance <= definition.falloffStart) {
    return definition.maxDamage;
  }

  if (
    definition.falloffEnd <= definition.falloffStart ||
    distance >= definition.falloffEnd
  ) {
    return definition.minDamage;
  }

  const t =
    (distance - definition.falloffStart) /
    (definition.falloffEnd - definition.falloffStart);

  return Math.round(
    definition.maxDamage +
      (definition.minDamage - definition.maxDamage) * t,
  );
}
