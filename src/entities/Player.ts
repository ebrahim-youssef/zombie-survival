import Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/player";
import type { FacingDirection } from "../types/game";

const PLAYER_TEXTURE = "player-placeholder";
const DIAGONAL_COMPONENT = 1 / Math.sqrt(2);

export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: FacingDirection = "e";

  private currentHealth: number = PLAYER_CONFIG.maxHealth;
  private lastDamageAt = Number.NEGATIVE_INFINITY;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    Player.ensureTexture(scene);
    super(scene, x, y, PLAYER_TEXTURE);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setCollideWorldBounds(false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(11, 5, 5);
  }

  get health(): number {
    return this.currentHealth;
  }

  get maxHealth(): number {
    return PLAYER_CONFIG.maxHealth;
  }

  get isDead(): boolean {
    return this.currentHealth <= 0;
  }

  applyMovement(move: Phaser.Math.Vector2): void {
    if (this.isDead || (move.x === 0 && move.y === 0)) {
      this.setVelocity(0, 0);
      return;
    }

    const isDiagonal = move.x !== 0 && move.y !== 0;

    if (isDiagonal) {
      const diagonalSpeed =
        PLAYER_CONFIG.baseMoveSpeed * PLAYER_CONFIG.diagonalMultiplier;

      this.setVelocity(
        Math.sign(move.x) * diagonalSpeed * DIAGONAL_COMPONENT,
        Math.sign(move.y) * diagonalSpeed * DIAGONAL_COMPONENT,
      );
      return;
    }

    this.setVelocity(
      Math.sign(move.x) * PLAYER_CONFIG.baseMoveSpeed,
      Math.sign(move.y) * PLAYER_CONFIG.baseMoveSpeed,
    );
  }

  updateSurvival(now: number, deltaMs: number): void {
    if (this.isDead || this.currentHealth >= PLAYER_CONFIG.maxHealth) {
      return;
    }

    if (now - this.lastDamageAt < PLAYER_CONFIG.regenDelayMs) {
      return;
    }

    const regen =
      PLAYER_CONFIG.regenPerSecond * (deltaMs / 1000);

    this.currentHealth = Math.min(
      PLAYER_CONFIG.maxHealth,
      this.currentHealth + regen,
    );
  }

  takeDamage(amount: number, now: number): number {
    if (amount <= 0 || this.isDead) return 0;

    const before = this.currentHealth;
    this.currentHealth = Math.max(0, before - amount);
    this.lastDamageAt = now;

    this.setTintFill(0xb94a48);
    this.scene.time.delayedCall(90, () => {
      if (this.active && !this.isDead) {
        this.clearTint();
      }
    });

    return before - this.currentHealth;
  }

  faceWorldPoint(worldPoint: Phaser.Math.Vector2): void {
    const dx = worldPoint.x - this.x;
    const dy = worldPoint.y - this.y;

    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return;

    const angle = Math.atan2(dy, dx);
    const step = Math.PI / 4;
    const snapped = Math.round(angle / step) * step;

    this.setRotation(snapped);
    this.facing = Player.angleToFacing(snapped);
  }

  getMuzzlePosition(direction: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const normalized = direction.clone();

    if (normalized.lengthSq() === 0) {
      normalized.set(1, 0);
    } else {
      normalized.normalize();
    }

    return new Phaser.Math.Vector2(this.x, this.y)
      .add(normalized.scale(22));
  }

  private static angleToFacing(angle: number): FacingDirection {
    const normalized = Phaser.Math.Angle.Normalize(angle);
    const index = Math.round(normalized / (Math.PI / 4)) % 8;

    return (
      ["e", "se", "s", "sw", "w", "nw", "n", "ne"] as const
    )[index]!;
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(PLAYER_TEXTURE)) return;

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(0x575f58, 1);
    graphics.fillRoundedRect(6, 7, 20, 18, 4);

    graphics.fillStyle(0x252a27, 1);
    graphics.fillCircle(15, 16, 7);

    graphics.fillStyle(0xd6ad55, 1);
    graphics.fillRect(18, 13, 13, 6);

    graphics.lineStyle(2, 0xe8e1ce, 0.9);
    graphics.strokeRoundedRect(6, 7, 20, 18, 4);

    graphics.generateTexture(PLAYER_TEXTURE, 32, 32);
    graphics.destroy();
  }
}
