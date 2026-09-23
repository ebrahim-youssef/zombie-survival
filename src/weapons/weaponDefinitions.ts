export type WeaponId =
  | "mr6"
  | "kuda"
  | "kn44"
  | "krm262"
  | "brm"
  | "drakon";

export type FireMode = "semi" | "auto" | "pump";

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  fireMode: FireMode;
  rpm: number;

  magazineSize: number;
  startingReserveAmmo: number;
  maxReserveAmmo: number;

  loadedReloadMs: number;
  emptyReloadMs: number;

  damage: number;
  spreadDegrees: number;
  pelletCount: number;

  tracerDurationMs: number;
  tracerMaxDistance: number;
}

export const MR6: WeaponDefinition = {
  id: "mr6",
  name: "MR6",
  fireMode: "semi",
  rpm: 500,

  magazineSize: 8,
  startingReserveAmmo: 32,
  maxReserveAmmo: 80,

  loadedReloadMs: 1500,
  emptyReloadMs: 1850,

  damage: 20,
  spreadDegrees: 1.25,
  pelletCount: 1,

  tracerDurationMs: 55,
  tracerMaxDistance: 2400,
};
