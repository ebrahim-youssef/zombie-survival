import Phaser from "phaser";
import { ZOMBIE_CONFIG } from "../config/zombie";
import type { Player } from "./Player";

const ZOMBIE_TEXTURE = "zombie-placeholder";

export interface ZombieDamageResult {
  applied: boolean;
  killed: boolean;
}

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  readonly hitRadius = ZOMBIE_CONFIG.colliderRadius;

  private readonly entryTarget: Phaser.Math.Vector2;
  private enteredRoom = false;
  private dead = false;
  private lastAttackAt = Number.NEGATIVE_INFINITY;
  private health: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    entryTarget: Phaser.Math.Vector2,
    maxHealth: number,
    private readonly moveSpeed: number,
  ) {
    Zombie.ensureTexture(scene);
    super(scene, x, y, ZOMBIE_TEXTURE);

    this.entryTarget = entryTarget.clone();
    this.health = maxHealth;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(9);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(
      ZOMBIE_CONFIG.colliderRadius,
      5,
      5,
    );
    body.setBounce(0);
  }

  get isDead(): boolean {
    return this.dead;
  }

  updateBehavior(now: number, player: Player): void {
    if (this.dead || player.isDead) {
      this.setVelocity(0, 0);
      return;
    }

    if (!this.enteredRoom) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.entryTarget.x,
        this.entryTarget.y,
      );

      if (distance <= ZOMBIE_CONFIG.entryThreshold) {
        this.enteredRoom = true;
      } else {
        this.moveToward(
          this.entryTarget.x,
          this.entryTarget.y,
        );
        return;
      }
    }

    const playerDistance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    if (playerDistance <= ZOMBIE_CONFIG.attackRange) {
      this.setVelocity(0, 0);

      if (
        now - this.lastAttackAt >=
        ZOMBIE_CONFIG.attackCooldownMs
      ) {
        this.lastAttackAt = now;
        player.takeDamage(
          ZOMBIE_CONFIG.attackDamage,
          now,
        );
      }

      return;
    }

    this.moveToward(player.x, player.y);
  }

  takeDamage(amount: number): ZombieDamageResult {
    if (this.dead || amount <= 0) {
      return { applied: false, killed: false };
    }

    this.health = Math.max(0, this.health - amount);

    if (this.health <= 0) {
      this.die();
      return { applied: true, killed: true };
    }

    this.setTintFill(0xd8c6a0);
    this.scene.time.delayedCall(70, () => {
      if (this.active && !this.dead) {
        this.clearTint();
      }
    });

    return { applied: true, killed: false };
  }

  private moveToward(x: number, y: number): void {
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      x,
      y,
    );

    this.setVelocity(
      Math.cos(angle) * this.moveSpeed,
      Math.sin(angle) * this.moveSpeed,
    );

    this.setRotation(angle);
  }

  private die(): void {
    this.dead = true;
    this.setVelocity(0, 0);
    this.disableBody(false, false);
    this.setTint(0x6d5f52);
    this.setRotation(this.rotation + Phaser.Math.FloatBetween(-0.8, 0.8));

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: ZOMBIE_CONFIG.corpseFadeMs,
      delay: ZOMBIE_CONFIG.corpseHoldMs,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(ZOMBIE_TEXTURE)) return;

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(0x5e6848, 1);
    graphics.fillRoundedRect(6, 7, 20, 18, 4);

    graphics.fillStyle(0x89906d, 1);
    graphics.fillCircle(15, 15, 7);

    graphics.fillStyle(0x8f3f37, 1);
    graphics.fillCircle(13, 14, 1.5);
    graphics.fillCircle(18, 14, 1.5);

    graphics.lineStyle(2, 0x262b21, 0.95);
    graphics.strokeRoundedRect(6, 7, 20, 18, 4);

    graphics.generateTexture(ZOMBIE_TEXTURE, 32, 32);
    graphics.destroy();
  }
}
