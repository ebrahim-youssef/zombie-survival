import Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/player";
import type { Player } from "../entities/Player";
import type { RunState } from "../game/RunState";
import type { InputFrame } from "../types/game";
import type { Arena } from "../world/Arena";
import type { ZombieController } from "../zombies/ZombieController";
import { WeaponController } from "../weapons/WeaponController";
import { MR6 } from "../weapons/weaponDefinitions";
import { CombatEffects } from "./CombatEffects";
import { castHitscan } from "./Hitscan";
import { MeleeController } from "./MeleeController";

export class CombatController {
  readonly weapon = new WeaponController(MR6);

  private readonly effects: CombatEffects;
  private readonly melee: MeleeController;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly arena: Arena,
    private readonly zombies: ZombieController,
    private readonly runState: RunState,
  ) {
    this.effects = new CombatEffects(scene);
    this.melee = new MeleeController(this.effects);
  }

  update(input: InputFrame, now: number): void {
    this.weapon.update(now);

    if (input.reloadPressed) {
      this.weapon.startReload(now);
    }

    const aimDirection = new Phaser.Math.Vector2(
      input.aimWorld.x - this.player.x,
      input.aimWorld.y - this.player.y,
    );

    if (input.meleePressed) {
      this.tryMelee(now, aimDirection);
    }

    const fired = this.weapon.tryFire(
      now,
      input.firePressed,
      input.fireHeld,
    );

    if (!fired) return;

    this.fireHitscan(aimDirection);
  }

  destroy(): void {
    this.weapon.cancelReload();
  }

  private tryMelee(
    now: number,
    aimDirection: Phaser.Math.Vector2,
  ): void {
    const origin = new Phaser.Math.Vector2(
      this.player.x,
      this.player.y,
    );

    const zombie = this.melee.tryAttack(
      now,
      origin,
      aimDirection,
      this.zombies.getAliveZombies(),
    );

    if (!zombie) return;

    const damage = zombie.takeDamage(
      PLAYER_CONFIG.meleeDamage,
    );

    if (damage.applied) {
      this.runState.awardZombieDamage(
        damage.killed,
        "melee",
      );
    }
  }

  private fireHitscan(aimDirection: Phaser.Math.Vector2): void {
    if (aimDirection.lengthSq() === 0) return;

    const definition = this.weapon.definition;
    const direction = this.applySpread(
      aimDirection,
      definition.spreadDegrees,
    );

    const muzzle = this.player.getMuzzlePosition(direction);
    const result = castHitscan(
      muzzle,
      direction,
      definition.tracerMaxDistance,
      this.arena.wallSegments,
      this.zombies.getAliveZombies(),
    );

    this.effects.showShot(
      muzzle,
      result.end,
      definition.tracerDurationMs,
    );

    if (!result.zombie) return;

    const damage = result.zombie.takeDamage(
      definition.damage,
    );

    if (damage.applied) {
      this.runState.awardZombieDamage(
        damage.killed,
        "gun",
      );
    }
  }

  private applySpread(
    direction: Phaser.Math.Vector2,
    spreadDegrees: number,
  ): Phaser.Math.Vector2 {
    const baseAngle = Math.atan2(direction.y, direction.x);
    const spreadRadians = Phaser.Math.DegToRad(spreadDegrees);
    const offset = Phaser.Math.FloatBetween(
      -spreadRadians,
      spreadRadians,
    );
    const angle = baseAngle + offset;

    return new Phaser.Math.Vector2(
      Math.cos(angle),
      Math.sin(angle),
    );
  }
}
