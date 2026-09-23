/**
 * Single source of truth for Phaser display-list depth.
 * A rug, blood decal, scattered paper or shadow must NEVER y-sort over
 * an actor. Tall props are allowed to occlude actors by their foot anchor.
 */
export const WORLD_DEPTH = {
  exterior: -80,
  floor: -60,
  groundDecal: -55,
  groundLight: -50,
  outsideActor: -45,
  rearWall: -40,
  wallDecal: -35,
  actorBase: 100,
  foregroundWall: 800,
  combatEffects: 900,
  hud: 2000,
  debug: 3500,
} as const;

/** Deterministic shared depth for player, zombies and props with volume. */
export function actorDepth(worldFootY: number): number {
  return WORLD_DEPTH.actorBase + worldFootY / 1000;
}
export function tallPropDepth(worldFootY: number): number {
  return actorDepth(worldFootY) + 0.001;
}
export type WorldSurface = "floor" | "decal" | "light" | "wall" | "wallDecal";
export function surfaceDepth(kind: WorldSurface): number {
  switch (kind) {
    case "floor": return WORLD_DEPTH.floor;
    case "decal": return WORLD_DEPTH.groundDecal;
    case "light": return WORLD_DEPTH.groundLight;
    case "wall": return WORLD_DEPTH.rearWall;
    case "wallDecal": return WORLD_DEPTH.wallDecal;
  }
}
