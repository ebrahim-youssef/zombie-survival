import Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/player";
import type { Zombie } from "../entities/Zombie";
import type { CombatEffects } from "./CombatEffects";
import { rayHurtboxIntersection } from "./hurtbox";
import { nearestRayHit, type Segment } from "../utils/geometry";

export class MeleeController {
  private lastAttackAt = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly effects: CombatEffects,
    private readonly walls: readonly Segment[],
  ) {}

  getLastAttackAt(): number {
    return this.lastAttackAt;
  }

  tryAttack(
    now: number,
    origin: Phaser.Math.Vector2,
    direction: Phaser.Math.Vector2,
    zombies: readonly Zombie[],
  ): Zombie | null {
    if (now - this.lastAttackAt < PLAYER_CONFIG.meleeCooldownMs) return null;
    if (direction.lengthSq() === 0) return null;
    this.lastAttackAt = now;
    this.effects.showMeleeCone(
      origin,
      direction,
      PLAYER_CONFIG.meleeRange,
      PLAYER_CONFIG.meleeArcDegrees,
    );

    const normalized = direction.clone().normalize();
    const minDot = Math.cos(
      Phaser.Math.DegToRad(PLAYER_CONFIG.meleeArcDegrees / 2),
    );
    let nearest: Zombie | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const zombie of zombies) {
      if (zombie.isDead) continue;
      const target=zombie.getAimPoint();
      const toZombie=target.clone().subtract(origin);
      const centerDistance=toZombie.length();
      if(centerDistance<=0)continue;
      // Aim cone uses the visible torso; range uses the *edge* of that
      // hurtbox instead of demanding the zombie's feet be inside 64px.
      if(toZombie.clone().scale(1/centerDistance).dot(normalized)<minDot)continue;
      const hit=rayHurtboxIntersection(
        origin,toZombie,PLAYER_CONFIG.meleeRange,zombie.hurtbox,
      );
      if(!hit)continue;
      const wall=nearestRayHit(origin,toZombie,centerDistance,this.walls);
      if(wall && wall.distance+0.1 < hit.distance)continue;
      if(hit.distance<nearestDistance){
        nearest=zombie;
        nearestDistance=hit.distance;
      }
    }
    return nearest;
  }
}
