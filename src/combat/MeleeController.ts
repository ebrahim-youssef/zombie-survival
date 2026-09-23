import Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/player";
import type { CombatEffects } from "./CombatEffects";

export class MeleeController {
  private lastAttackAt = Number.NEGATIVE_INFINITY;

  constructor(private readonly effects: CombatEffects) {}

  tryAttack(
    now: number,
    origin: Phaser.Math.Vector2,
    direction: Phaser.Math.Vector2,
  ): boolean {
    if (
      now - this.lastAttackAt <
      PLAYER_CONFIG.meleeCooldownMs
    ) {
      return false;
    }

    if (direction.lengthSq() === 0) return false;

    this.lastAttackAt = now;
    this.effects.showMeleeCone(
      origin,
      direction,
      PLAYER_CONFIG.meleeRange,
      PLAYER_CONFIG.meleeArcDegrees,
    );

    return true;
  }
}
