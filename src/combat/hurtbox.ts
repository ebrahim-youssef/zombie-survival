/**
 * Stage 2: keep collision on the floor and damage over the visible torso.
 * World coordinates and screen projection are not conflated.
 * Pure geometry: usable by Node unit tests, Phaser and mobile aim.
 */
export interface XY { readonly x: number; readonly y: number }
export interface Hurtbox {
  readonly centerX: number;
  readonly centerY: number;
  readonly radiusX: number;
  readonly radiusY: number;
}
export type ActorKind = "player" | "zombie";

export const ACTOR_HITBOXES = {
  player: { footRadius: 15, upperOffsetY: -35, upperRadiusX: 22, upperRadiusY: 36 },
  zombie: { footRadius: 15, upperOffsetY: -35, upperRadiusX: 24, upperRadiusY: 38 },
} as const;

/** Feet remain at sprite's supplied origin, even after changing raster size. */
export function footBodyOffsets(
  sourceWidth: number,
  sourceFeetOriginY: number,
  displayScale: number,
  worldRadius: number,
): { x: number; y: number; radius: number } {
  // Phaser 3.90 Body.offset and Body.radius use SOURCE pixels; Phaser
  // multiplies body dimensions/offset by the sprite's transform.
  if (!(displayScale > 0) || !(worldRadius > 0)) {
    throw new RangeError("Invalid collider dimensions");
  }
  const radius = worldRadius / displayScale;
  if (!(sourceWidth > radius * 2) || !(sourceFeetOriginY >= radius)) {
    throw new RangeError("Foot collider exceeds source texture");
  }
  return {
    radius,
    x: sourceWidth / 2 - radius,
    y: sourceFeetOriginY - radius,
  };
}

export function actorHurtbox(kind: ActorKind, feet: XY): Hurtbox {
  const config = ACTOR_HITBOXES[kind];
  return {
    centerX: feet.x, centerY: feet.y + config.upperOffsetY,
    radiusX: config.upperRadiusX, radiusY: config.upperRadiusY,
  };
}
export function hurtboxAimPoint(box: Hurtbox): XY {
  return { x: box.centerX, y: box.centerY };
}
export interface RayHurtboxHit { readonly distance: number; readonly point: XY }
/** First intersection of a ray and an axis-aligned body ellipse. */
export function rayHurtboxIntersection(
  origin: XY,
  direction: XY,
  maxDistance: number,
  box: Hurtbox,
): RayHurtboxHit | null {
  if (!(maxDistance > 0) || !(box.radiusX > 0) || !(box.radiusY > 0)) return null;
  const length = Math.hypot(direction.x, direction.y);
  if (!(length > 0)) return null;
  const dx = direction.x / length, dy = direction.y / length;
  const ox = (origin.x - box.centerX) / box.radiusX;
  const oy = (origin.y - box.centerY) / box.radiusY;
  const rx = dx / box.radiusX, ry = dy / box.radiusY;
  const a = rx * rx + ry * ry;
  const b = 2 * (ox * rx + oy * ry);
  const c = ox * ox + oy * oy - 1;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  const entry = (-b - root) / (2 * a);
  const exit = (-b + root) / (2 * a);
  // From inside a hurtbox, damage starts immediately rather than escaping it.
  const distance = entry < 0 && exit >= 0 ? 0 : entry;
  if (distance < 0 || distance > maxDistance) return null;
  return {
    distance,
    point: { x: origin.x + dx * distance, y: origin.y + dy * distance },
  };
}
