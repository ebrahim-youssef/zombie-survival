import Phaser from "phaser";
import type { Zombie } from "../entities/Zombie";
import { rayHurtboxIntersection } from "./hurtbox";
import type { Segment } from "../utils/geometry";
// Damage intersects the visible torso ellipse rather than a foot circle.
import { nearestRayHit } from "../utils/geometry";

export interface HitscanResult {
  end: Phaser.Math.Vector2;
  wallHit: boolean;
  zombie: Zombie | null;
}

export function castHitscan(
  origin: Phaser.Math.Vector2,
  direction: Phaser.Math.Vector2,
  maxDistance: number,
  wallSegments: readonly Segment[],
  zombies: readonly Zombie[],
): HitscanResult {
  const normalized = direction.clone();

  if (normalized.lengthSq() === 0) {
    return {
      end: origin.clone(),
      wallHit: false,
      zombie: null,
    };
  }

  normalized.normalize();

  const wallHit = nearestRayHit(
    origin,
    normalized,
    maxDistance,
    wallSegments,
  );

  const wallDistance =
    wallHit?.distance ?? Number.POSITIVE_INFINITY;

  let nearestZombie: Zombie | null = null;
  let nearestZombieDistance = Number.POSITIVE_INFINITY;
  let nearestZombiePoint: Phaser.Math.Vector2 | null = null;

  for (const zombie of zombies) {
    const hit = rayHurtboxIntersection(
      origin, normalized, maxDistance, zombie.hurtbox,
    );

    if (!hit) continue;
    if (hit.distance >= nearestZombieDistance) continue;

    nearestZombie = zombie;
    nearestZombieDistance = hit.distance;
    nearestZombiePoint = new Phaser.Math.Vector2(hit.point.x,hit.point.y);
  }

  if (
    nearestZombie &&
    nearestZombiePoint &&
    nearestZombieDistance < wallDistance
  ) {
    return {
      end: nearestZombiePoint,
      wallHit: false,
      zombie: nearestZombie,
    };
  }

  if (wallHit) {
    return {
      end: wallHit.point,
      wallHit: true,
      zombie: null,
    };
  }

  return {
    end: origin
      .clone()
      .add(normalized.scale(maxDistance)),
    wallHit: false,
    zombie: null,
  };
}
