import Phaser from "phaser";
import type { Zombie } from "../entities/Zombie";
import type { Segment } from "../utils/geometry";
import {
  nearestRayHit,
  rayCircleIntersection,
} from "../utils/geometry";

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
    const hit = rayCircleIntersection(
      origin,
      normalized,
      maxDistance,
      new Phaser.Math.Vector2(zombie.x, zombie.y),
      zombie.hitRadius,
    );

    if (!hit) continue;
    if (hit.distance >= nearestZombieDistance) continue;

    nearestZombie = zombie;
    nearestZombieDistance = hit.distance;
    nearestZombiePoint = hit.point;
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
