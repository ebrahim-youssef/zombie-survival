import Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/player";
import type { Zombie } from "../entities/Zombie";
import type { CombatEffects } from "./CombatEffects";

export class MeleeController {
  private lastAttackAt = Number.NEGATIVE_INFINITY;

  constructor(private readonly effects: CombatEffects) {}

  tryAttack(
    now: number,
    origin: Phaser.Math.Vector2,
    direction: Phaser.Math.Vector2,
    zombies: readonly Zombie[],
  ): Zombie | null {
    if (
      now - this.lastAttackAt <
      PLAYER_CONFIG.meleeCooldownMs
    ) {
      return null;
    }

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
      Phaser.Math.DegToRad(
        PLAYER_CONFIG.meleeArcDegrees / 2,
      ),
    );

    let nearest: Zombie | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const zombie of zombies) {
      if (zombie.isDead) continue;

      const toZombie = new Phaser.Math.Vector2(
        zombie.x - origin.x,
        zombie.y - origin.y,
      );

      const distance = toZombie.length();

      if (
        distance <= 0 ||
        distance > PLAYER_CONFIG.meleeRange
      ) {
        continue;
      }

      const dot = toZombie
        .clone()
        .normalize()
        .dot(normalized);

      if (dot < minDot) continue;

      if (distance < nearestDistance) {
        nearest = zombie;
        nearestDistance = distance;
      }
    }

    return nearest;
  }
}
