import Phaser from "phaser";
import type { Segment } from "../utils/geometry";
import { nearestRayHit } from "../utils/geometry";

export interface HitscanResult {
  end: Phaser.Math.Vector2;
  wallHit: boolean;
}

export function castHitscan(
  origin: Phaser.Math.Vector2,
  direction: Phaser.Math.Vector2,
  maxDistance: number,
  wallSegments: readonly Segment[],
): HitscanResult {
  const normalized = direction.clone();

  if (normalized.lengthSq() === 0) {
    return {
      end: origin.clone(),
      wallHit: false,
    };
  }

  normalized.normalize();

  const wallHit = nearestRayHit(
    origin,
    normalized,
    maxDistance,
    wallSegments,
  );

  if (wallHit) {
    return {
      end: wallHit.point,
      wallHit: true,
    };
  }

  return {
    end: origin
      .clone()
      .add(normalized.scale(maxDistance)),
    wallHit: false,
  };
}
