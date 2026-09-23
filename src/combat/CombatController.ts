import Phaser from "phaser";
import type { AudioController } from "../audio/AudioController";
import { PLAYER_CONFIG } from "../config/player";
import type { Player } from "../entities/Player";
import type { Zombie } from "../entities/Zombie";
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
import { ShotHitLedger } from "./ShotHitLedger";

export interface DebugRay {
  start: Phaser.Math.Vector2;
  end: Phaser.Math.Vector2;
  expiresAt: number;
}

export class CombatController {
  readonly inventory = new InventoryController();
  private readonly effects: CombatEffects;
  private readonly melee: MeleeController;
  private readonly debugRays: DebugRay[] = [];
  private captureDebugRays = false;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly arena: Arena,
    private readonly zombies: ZombieController,
    private readonly runState: RunState,
    private readonly audio: AudioController,
  ) {
    this.effects = new CombatEffects(scene);
    this.melee = new MeleeController(this.effects);
  }

  setDebugRayCapture(enabled: boolean): void {
    this.captureDebugRays = import.meta.env.DEV && enabled;
    if (!enabled) this.debugRays.length = 0;
  }

  getDebugRays(now: number): readonly DebugRay[] {
    for (let i = this.debugRays.length - 1; i >= 0; i -= 1) {
      if (this.debugRays[i]!.expiresAt <= now) {
        this.debugRays.splice(i, 1);
      }
    }
    return this.debugRays;
  }

  update(input: InputFrame, now: number): void {
    this.handleWeaponSwitch(input);
    this.inventory.update(now);

    const weapon = this.inventory.activeWeapon;
    if (input.reloadPressed && weapon.startReload(now)) {
      this.audio.play("ui");
      this.player.beginAction("reload",now);
    }

    const aimDirection = new Phaser.Math.Vector2(
      input.aimWorld.x - this.player.x,
      input.aimWorld.y - this.player.y,
    );

    if (input.meleePressed) this.tryMelee(now, aimDirection);

    if (!weapon.tryFire(now, input.firePressed, input.fireHeld)) return;

    this.audio.play("shot");
    this.player.beginAction("shoot",now);
    this.fireWeapon(aimDirection, weapon.definition, now);
  }

  destroy(): void {
    this.inventory.destroy();
    this.debugRays.length = 0;
  }

  private handleWeaponSwitch(input: InputFrame): void {
    let switched: boolean;

    if (input.slotPressed === 1) {
      switched = this.inventory.switchToDisplaySlot(1);
    } else if (input.slotPressed === 2) {
      switched = this.inventory.switchToDisplaySlot(2);
    } else {
      switched = this.inventory.cycle(input.cycleWeapon);
    }

    if (switched) this.audio.play("ui");
  }

  private tryMelee(now: number, aimDirection: Phaser.Math.Vector2): void {
    const origin = new Phaser.Math.Vector2(this.player.x, this.player.y);
    const previousAttack = this.melee.getLastAttackAt();
    const zombie = this.melee.tryAttack(
      now,
      origin,
      aimDirection,
      this.zombies.getAliveZombies(),
    );
    // The cone may legitimately miss. A cooldown-rejected press must be silent.
    if (this.melee.getLastAttackAt() === previousAttack) return;
    this.player.beginAction("melee",now);
    this.audio.play("melee");
    if (!zombie) return;

    const result = zombie.takeDamage(PLAYER_CONFIG.meleeDamage);
    if (!result.applied) return;

    this.effects.showImpact(new Phaser.Math.Vector2(zombie.x, zombie.y), result.killed);
    this.effects.showDamageNumber(
      new Phaser.Math.Vector2(zombie.x, zombie.y),
      PLAYER_CONFIG.meleeDamage,
    );
    this.audio.play(result.killed ? "kill" : "hit");
    this.runState.awardZombieDamage(result.killed, "melee");
  }

  private fireWeapon(
    aimDirection: Phaser.Math.Vector2,
    definition: WeaponDefinition,
    now: number,
  ): void {
    if (aimDirection.lengthSq() === 0) return;

    const ledger = new ShotHitLedger<Zombie>();
    const zombies = this.zombies.getAliveZombies();
    for (let pellet = 0; pellet < definition.pelletCount; pellet += 1) {
      this.firePellet(aimDirection, definition, zombies, ledger, now);
    }

    for (const [zombie, outcome] of ledger.entries()) {
      this.effects.showImpact(new Phaser.Math.Vector2(zombie.x, zombie.y), outcome.killed);
      this.effects.showDamageNumber(
        new Phaser.Math.Vector2(zombie.x, zombie.y),
        outcome.damage,
      );
      this.audio.play(outcome.killed ? "kill" : "hit");
      this.runState.awardZombieDamage(outcome.killed, "gun");
    }
  }

  private firePellet(
    aimDirection: Phaser.Math.Vector2,
    definition: WeaponDefinition,
    zombies: readonly Zombie[],
    ledger: ShotHitLedger<Zombie>,
    now: number,
  ): void {
    const direction = this.applySpread(aimDirection, definition.spreadDegrees);
    const muzzle = this.player.getMuzzlePosition(direction);
    const result = castHitscan(
      muzzle,
      direction,
      definition.tracerMaxDistance,
      this.arena.wallSegments,
      zombies.filter((zombie) => !zombie.isDead),
    );

    // Only the presentation is offset to the visible 3/4 rifle;
    // world hitscan still originates from the agreed physics footprint.
    this.effects.showShot(
      this.player.getVisibleMuzzlePosition(direction),
      result.end,
      definition.tracerDurationMs,
    );

    if (this.captureDebugRays) {
      this.debugRays.push({
        start: muzzle,
        end: result.end,
        expiresAt: now + 350,
      });
      if (this.debugRays.length > 32) this.debugRays.shift();
    }

    if (!result.zombie) return;
    const distance = Phaser.Math.Distance.Between(
      muzzle.x,
      muzzle.y,
      result.end.x,
      result.end.y,
    );
    const amount = getDamageAtDistance(definition, distance);
    const damage = result.zombie.takeDamage(amount);
    if (damage.applied) {
      ledger.record(result.zombie, amount, damage.killed);
    }
  }

  private applySpread(
    direction: Phaser.Math.Vector2,
    spreadDegrees: number,
  ): Phaser.Math.Vector2 {
    const baseAngle = Math.atan2(direction.y, direction.x);
    // spreadDegrees is the entire cone width; offset by half on either side.
    const halfSpread = Phaser.Math.DegToRad(spreadDegrees / 2);
    const angle = baseAngle + Phaser.Math.FloatBetween(
      -halfSpread,
      halfSpread,
    );
    return new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
  }
}
