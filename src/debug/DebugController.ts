import Phaser from "phaser";
import { facingVector } from "../art/directions";
import { PLAYER_CONFIG } from "../config/player";
import { ZOMBIE_CONFIG } from "../config/zombie";
import type { Player } from "../entities/Player";
import type { Zombie } from "../entities/Zombie";
import type { RunState } from "../game/RunState";
import type { Arena } from "../world/Arena";
import type { CombatController } from "../combat/CombatController";
import type { WaveController } from "../zombies/WaveController";
import type { ZombieController } from "../zombies/ZombieController";
import { resolveDebugShortcut, type DebugAction } from "./debugShortcuts";

export interface DebugSnapshot {
  overlay: boolean;
  hitboxes: boolean;
  god: boolean;
  points: number;
  round: number;
  zombieHitboxes: number;
  playerBody: {
    x: number;
    y: number;
    radius: number;
    isCircle: boolean;
  } | null;
}

/**
 * Debug keyboard shortcuts use Shift + the physical number row (1–7).
 * Real Arcade Physics bodies are drawn independently from the older range
 * overlay, which intentionally draws gameplay-specific approximate ranges.
 */
export class DebugController {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly bodyGraphics: Phaser.GameObjects.Graphics;
  private readonly info: Phaser.GameObjects.Text;
  private overlayVisible = false;
  private hitboxesVisible = false;
  private currentTime = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly arena: Arena,
    private readonly player: Player,
    private readonly zombies: ZombieController,
    private readonly waves: WaveController,
    private readonly combat: CombatController,
    private readonly runState: RunState,
  ) {
    this.graphics = scene.add.graphics().setDepth(3500);
    this.bodyGraphics = scene.add.graphics().setDepth(3501);
    this.info = scene.add.text(18, 102, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#f6ce72",
      backgroundColor: "#171817e8",
      lineSpacing: 4,
      padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(3600).setVisible(false);

    scene.input.keyboard?.on("keydown", this.onKeyDown, this);
  }

  snapshot(): DebugSnapshot {
    const body = this.physicsBody(this.player);
    return {
      overlay: this.overlayVisible,
      hitboxes: this.hitboxesVisible,
      god: this.player.invulnerable,
      points: this.runState.points,
      round: this.waves.snapshot(this.currentTime).round,
      zombieHitboxes: this.zombies.getAliveZombies()
        .filter(zombie => this.physicsBody(zombie) !== null).length,
      playerBody: body ? {
        x: body.center.x,
        y: body.center.y,
        radius: body.isCircle ? body.radius : body.halfWidth,
        isCircle: body.isCircle,
      } : null,
    };
  }

  update(now: number): void {
    this.currentTime = now;
    if (this.overlayVisible) this.drawRanges(now);
    else this.graphics.clear();

    if (this.hitboxesVisible) this.drawHitboxes();
    else this.bodyGraphics.clear();

    this.info.setVisible(this.overlayVisible || this.hitboxesVisible);
    if (this.overlayVisible || this.hitboxesVisible) {
      this.info.setText(
        "SHIFT+1 RANGES | SHIFT+2 +950 | SHIFT+3 AMMO | SHIFT+4 KILL ALL\n" +
        "SHIFT+5 NEXT | SHIFT+6 GOD | SHIFT+7 REAL HITBOXES\n" +
        "RANGES " + (this.overlayVisible ? "ON" : "OFF") +
        " | HITBOXES " + (this.hitboxesVisible ? "ON" : "OFF") +
        " | GOD " + (this.player.invulnerable ? "ON" : "OFF") +
        " | ZOMBIES " + this.zombies.getAliveCount() +
        " | ROUND " + this.waves.snapshot(now).round,
      );
    }
  }

  destroy(): void {
    this.combat.setDebugRayCapture(false);
    this.scene.input.keyboard?.off("keydown", this.onKeyDown, this);
    this.graphics.destroy();
    this.bodyGraphics.destroy();
    this.info.destroy();
  }

  private onKeyDown(event: KeyboardEvent): void {
    const action = resolveDebugShortcut(event);
    if (!action) return;
    event.preventDefault();
    this.perform(action);
  }

  private perform(action: DebugAction): void {
    switch (action) {
      case "overlay":
        this.overlayVisible = !this.overlayVisible;
        this.combat.setDebugRayCapture(this.overlayVisible);
        if (!this.overlayVisible) this.graphics.clear();
        break;
      case "points":
        this.runState.points += 950;
        break;
      case "ammo":
        this.combat.inventory.activeWeapon.refill();
        break;
      case "clear":
        for (const zombie of this.zombies.getAliveZombies()) {
          zombie.takeDamage(Number.MAX_SAFE_INTEGER);
        }
        break;
      case "round":
        this.waves.debugNextRound(this.currentTime);
        break;
      case "god":
        this.player.setInvulnerable(!this.player.invulnerable);
        break;
      case "hitboxes":
        this.hitboxesVisible = !this.hitboxesVisible;
        if (!this.hitboxesVisible) this.bodyGraphics.clear();
        break;
    }
    // Allow a tester to see the effect immediately without requiring
    // an additional frame of simulation.
    this.update(this.currentTime);
  }

  private physicsBody(
    sprite: Player | Zombie,
  ): Phaser.Physics.Arcade.Body | null {
    const body = sprite.body;
    return body instanceof Phaser.Physics.Arcade.Body && body.enable
      ? body : null;
  }

  private strokeBody(sprite: Player | Zombie, color: number): void {
    const body = this.physicsBody(sprite);
    if (body === null) return;
    this.bodyGraphics.lineStyle(2, color, 1);
    if (body.isCircle) {
      this.bodyGraphics.strokeCircle(
        body.center.x, body.center.y, body.radius,
      );
    } else {
      this.bodyGraphics.strokeRect(
        body.x, body.y, body.width, body.height,
      );
    }
    this.bodyGraphics.fillStyle(color, 1);
    this.bodyGraphics.fillCircle(body.center.x, body.center.y, 2);
  }

  private drawHitboxes(): void {
    const g = this.bodyGraphics;
    g.clear();
    // Yellow lines are raycast walls with intentional window gaps.
    // They are not static Arcade Physics bodies.
    g.lineStyle(2, 0xf6c34c, .7);
    for (const segment of this.arena.wallSegments) {
      g.lineBetween(
        segment.start.x, segment.start.y,
        segment.end.x, segment.end.y,
      );
    }
    this.strokeBody(this.player, 0x39ecb1);
    for (const zombie of this.zombies.getAliveZombies()) {
      this.strokeBody(zombie, 0xff659f);
    }
  }

  private drawRanges(now: number): void {
    const g = this.graphics;
    g.clear();
    g.lineStyle(2, 0xe1bd56, .9);
    for (const segment of this.arena.wallSegments) {
      g.lineBetween(
        segment.start.x, segment.start.y,
        segment.end.x, segment.end.y,
      );
    }
    g.lineStyle(1, 0x7ebebe, .8);
    for (const window of this.arena.windows) {
      g.strokeCircle(window.center.x, window.center.y, 13);
      g.strokeCircle(
        window.outsideSpawn.x, window.outsideSpawn.y, 14,
      );
    }
    g.lineStyle(1, 0xf1cf76, .8);
    for (const position of Object.values(this.arena.interactions)) {
      g.strokeCircle(
        position.x, position.y, PLAYER_CONFIG.interactionRange,
      );
    }
    g.lineStyle(2, 0x7ec2e2, .9);
    g.strokeCircle(
      this.player.x, this.player.y, PLAYER_CONFIG.meleeRange,
    );
    const [vx, vy] = facingVector(this.player.facing);
    const angle = Math.atan2(vy, vx);
    const halfArc = Phaser.Math.DegToRad(
      PLAYER_CONFIG.meleeArcDegrees / 2,
    );
    for (const a of [angle - halfArc, angle + halfArc]) {
      g.lineBetween(
        this.player.x, this.player.y,
        this.player.x + Math.cos(a) * PLAYER_CONFIG.meleeRange,
        this.player.y + Math.sin(a) * PLAYER_CONFIG.meleeRange,
      );
    }
    for (const zombie of this.zombies.getAliveZombies()) {
      g.lineStyle(1, 0xc57773, .8);
      g.strokeCircle(zombie.x, zombie.y, zombie.hitRadius);
      g.lineStyle(1, 0xc57773, .3);
      g.strokeCircle(
        zombie.x, zombie.y, ZOMBIE_CONFIG.attackRange,
      );
    }
    g.lineStyle(2, 0xf5ebcf, .95);
    for (const ray of this.combat.getDebugRays(now)) {
      g.lineBetween(
        ray.start.x, ray.start.y,
        ray.end.x, ray.end.y,
      );
    }
  }
}
