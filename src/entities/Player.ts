import Phaser from "phaser";
import { PLAYER_CONFIG } from "../config/player";
import type { FacingDirection } from "../types/game";
import { actorHurtbox } from "../combat/hurtbox";

const PLAYER_TEXTURE = "player-placeholder";
const DIAGONAL_COMPONENT = 1 / Math.sqrt(2);

export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: FacingDirection = "e";
  private currentHealth: number = PLAYER_CONFIG.maxHealth;
  private lastDamageAt = Number.NEGATIVE_INFINITY;
  private godMode = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    Player.ensureTexture(scene);
    super(scene, x, y, PLAYER_TEXTURE);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);
    this.setCollideWorldBounds(false);
    (this.body as Phaser.Physics.Arcade.Body).setCircle(11, 5, 5);
  }

  get hurtbox() { return actorHurtbox("player", this); }
  getAimAnchor(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.hurtbox.centerX, this.hurtbox.centerY);
  }
  get health(): number { return this.currentHealth; }
  get maxHealth(): number { return PLAYER_CONFIG.maxHealth; }
  get isDead(): boolean { return this.currentHealth <= 0; }
  get invulnerable(): boolean { return this.godMode; }

  setInvulnerable(enabled: boolean): void {
    this.godMode = enabled;
    if (enabled) this.currentHealth = this.maxHealth;
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
    if (this.isDead || this.currentHealth >= PLAYER_CONFIG.maxHealth) return;
    if (now - this.lastDamageAt < PLAYER_CONFIG.regenDelayMs) return;
    this.currentHealth = Math.min(
      PLAYER_CONFIG.maxHealth,
      this.currentHealth + PLAYER_CONFIG.regenPerSecond * (deltaMs / 1000),
    );
  }

  takeDamage(amount: number, now: number): number {
    if (this.godMode || amount <= 0 || this.isDead) return 0;
    const before = this.currentHealth;
    this.currentHealth = Math.max(0, before - amount);
    this.lastDamageAt = now;
    this.setTintFill(0xb94a48);
    this.scene.time.delayedCall(90, () => {
      if (this.active && !this.isDead) this.clearTint();
    });
    return before - this.currentHealth;
  }

  faceWorldPoint(worldPoint: Phaser.Math.Vector2): void {
    const dx = worldPoint.x - this.x;
    const dy = worldPoint.y - this.y;
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return;
    const snapped = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) *
      (Math.PI / 4);
    this.setRotation(snapped);
    this.facing = Player.angleToFacing(snapped);
  }

  beginAction(
    _action: "shoot" | "melee" | "reload" | "hurt",
    _now: number,
  ): void {
    // The original placeholder has no animation frames.
  }

  updateVisual(
    _now: number,
    _isMoving: boolean,
    _isReloading: boolean,
  ): void {
    this.setDepth(10);
  }

  getVisibleMuzzlePosition(
    direction: Phaser.Math.Vector2,
  ): Phaser.Math.Vector2 {
    return this.getMuzzlePosition(direction);
  }

  getMuzzlePosition(direction: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const normalized = direction.clone();
    if (normalized.lengthSq() === 0) normalized.set(1, 0);
    else normalized.normalize();
    return new Phaser.Math.Vector2(this.x, this.y)
      .add(normalized.scale(22));
  }

  private static angleToFacing(angle: number): FacingDirection {
    const normalized = Phaser.Math.Angle.Normalize(angle);
    const index = Math.round(normalized / (Math.PI / 4)) % 8;
    return (["e", "se", "s", "sw", "w", "nw", "n", "ne"] as const)[index]!;
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(PLAYER_TEXTURE)) return;
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

    // Original, simple top-down armored character. Right-facing base sprite;
    // eight aim facings use snapped sprite rotation until full art is supplied.
    graphics.fillStyle(0x1b211e, 1);
    graphics.fillRoundedRect(3, 7, 26, 19, 4);
    graphics.fillStyle(0x4b554c, 1);
    graphics.fillRoundedRect(7, 8, 18, 17, 3);
    graphics.fillStyle(0x747c66, 1);
    graphics.fillRect(9, 10, 11, 4);
    graphics.fillStyle(0x303c33, 1);
    graphics.fillCircle(14, 16, 7);
    graphics.fillStyle(0x9b9b83, 1);
    graphics.fillRect(17, 12, 7, 5);
    graphics.fillStyle(0x171b1b, 1);
    graphics.fillRect(19, 14, 11, 4);
    graphics.fillStyle(0xd1a855, 1);
    graphics.fillRect(27, 14, 4, 3);
    graphics.lineStyle(1, 0xc5c6a4, 0.7);
    graphics.strokeRoundedRect(7, 8, 18, 17, 3);
    graphics.generateTexture(PLAYER_TEXTURE, 32, 32);
    graphics.destroy();
  }
}
