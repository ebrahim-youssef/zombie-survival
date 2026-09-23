import Phaser from "phaser";

export interface Segment {
  start: Phaser.Math.Vector2;
  end: Phaser.Math.Vector2;
}

export interface RayHit {
  point: Phaser.Math.Vector2;
  distance: number;
}

export interface CircleRayHit extends RayHit {}

function cross(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return ax * by - ay * bx;
}

export function raySegmentIntersection(
  origin: Phaser.Math.Vector2,
  direction: Phaser.Math.Vector2,
  maxDistance: number,
  segment: Segment,
): RayHit | null {
  if (maxDistance <= 0) return null;

  const directionLength = direction.length();
  if (directionLength === 0) return null;

  const rx = (direction.x / directionLength) * maxDistance;
  const ry = (direction.y / directionLength) * maxDistance;
  const sx = segment.end.x - segment.start.x;
  const sy = segment.end.y - segment.start.y;

  const denominator = cross(rx, ry, sx, sy);
  if (Math.abs(denominator) < 1e-8) return null;

  const qpx = segment.start.x - origin.x;
  const qpy = segment.start.y - origin.y;

  const t = cross(qpx, qpy, sx, sy) / denominator;
  const u = cross(qpx, qpy, rx, ry) / denominator;

  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return {
    point: new Phaser.Math.Vector2(
      origin.x + rx * t,
      origin.y + ry * t,
    ),
    distance: maxDistance * t,
  };
}

export function rayCircleIntersection(
  origin: Phaser.Math.Vector2,
  direction: Phaser.Math.Vector2,
  maxDistance: number,
  center: Phaser.Math.Vector2,
  radius: number,
): CircleRayHit | null {
  if (maxDistance <= 0 || radius <= 0) return null;

  const normalized = direction.clone();
  if (normalized.lengthSq() === 0) return null;
  normalized.normalize();

  const toCenter = center.clone().subtract(origin);
  const projection = toCenter.dot(normalized);

  if (projection < -radius) return null;

  const perpendicularSq =
    toCenter.lengthSq() - projection * projection;
  const radiusSq = radius * radius;

  if (perpendicularSq > radiusSq) return null;

  const halfChord = Math.sqrt(
    Math.max(0, radiusSq - perpendicularSq),
  );

  let distance = projection - halfChord;

  if (distance < 0) {
    distance = projection + halfChord;
  }

  if (distance < 0 || distance > maxDistance) return null;

  return {
    point: origin
      .clone()
      .add(normalized.scale(distance)),
    distance,
  };
}

export function nearestRayHit(
  origin: Phaser.Math.Vector2,
  direction: Phaser.Math.Vector2,
  maxDistance: number,
  segments: readonly Segment[],
): RayHit | null {
  let nearest: RayHit | null = null;

  for (const segment of segments) {
    const hit = raySegmentIntersection(
      origin,
      direction,
      maxDistance,
      segment,
    );

    if (!hit) continue;

    if (!nearest || hit.distance < nearest.distance) {
      nearest = hit;
    }
  }

  return nearest;
}
