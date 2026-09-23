import Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/player";
import type { Player } from "../entities/Player";
import type { RunState } from "../game/RunState";
import type { InputFrame } from "../types/game";
import type { Arena } from "../world/Arena";
import type { ZombieController } from "../zombies/ZombieController";
import { InventoryController } from "../weapons/InventoryController";
import {
  getDamageAtDistance,
  type WeaponDefinition,
} from "../weapons/weaponDefinitions";
import { CombatEffects } from "./CombatEffects";
import { castHitscan } from "./Hitscan";
import { MeleeController } from "./MeleeController";

export class CombatController {
  readonly inventory = new InventoryController();

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
    this.handleWeaponSwitch(input);
    this.inventory.update(now);

    const weapon = this.inventory.activeWeapon;

    if (input.reloadPressed) {
      weapon.startReload(now);
    }

    const aimDirection = new Phaser.Math.Vector2(
      input.aimWorld.x - this.player.x,
      input.aimWorld.y - this.player.y,
    );

    if (input.meleePressed) {
      this.tryMelee(now, aimDirection);
    }

    const fired = weapon.tryFire(
      now,
      input.firePressed,
      input.fireHeld,
    );

    if (!fired) return;

    this.fireWeapon(
      aimDirection,
      weapon.definition,
    );
  }

  destroy(): void {
    this.inventory.destroy();
  }

  private handleWeaponSwitch(input: InputFrame): void {
    if (input.slotPressed === 1) {
      this.inventory.switchToDisplaySlot(1);
      return;
    }

    if (input.slotPressed === 2) {
      this.inventory.switchToDisplaySlot(2);
      return;
    }

    this.inventory.cycle(input.cycleWeapon);
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

  private fireWeapon(
    aimDirection: Phaser.Math.Vector2,
    definition: WeaponDefinition,
  ): void {
    if (aimDirection.lengthSq() === 0) return;

    const pelletCount = Math.max(
      1,
      definition.pelletCount,
    );

    for (let pellet = 0; pellet < pelletCount; pellet += 1) {
      this.firePellet(
        aimDirection,
        definition,
      );
    }
  }

  private firePellet(
    aimDirection: Phaser.Math.Vector2,
    definition: WeaponDefinition,
  ): void {
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

    const distance = Phaser.Math.Distance.Between(
      muzzle.x,
      muzzle.y,
      result.end.x,
      result.end.y,
    );

    const damage = result.zombie.takeDamage(
      getDamageAtDistance(
        definition,
        distance,
      ),
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
    const baseAngle = Math.atan2(
      direction.y,
      direction.x,
    );
    const spreadRadians =
      Phaser.Math.DegToRad(spreadDegrees);
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
