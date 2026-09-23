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
import type { Hurtbox } from "../combat/hurtbox";

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
  playerCombat: Hurtbox;
  firstZombieCombat: Hurtbox | null;
}

/**
 * Debug uses plain physical number keys 3–0 in explicitly enabled QA sessions.
 * Real Arcade Physics bodies are drawn independently from the older range
 * overlay, which intentionally draws gameplay-specific approximate ranges.
 */
export class DebugController {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly bodyGraphics: Phaser.GameObjects.Graphics;
  private readonly info: Phaser.GameObjects.Text;
  private overlayVisible = false;
  private hitboxesVisible = false;
  private helpVisible = false;
  private readonly badge: Phaser.GameObjects.Text;
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
    this.badge = scene.add.text(18, 80, "DEBUG MODE  •  [0] HELP", {
      fontFamily: "monospace", fontSize: "12px", color: "#e6bd68",
      backgroundColor: "#171817c9", padding: { x: 5, y: 3 },
    }).setScrollFactor(0).setDepth(3600);
    this.info = scene.add.text(18, 108, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#f6ce72",
      backgroundColor: "#171817e8",
      lineSpacing: 4,
      padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(3600).setVisible(false);

    // Capture at window level so the shortcuts work even when the Phaser
    // canvas has not been explicitly focused after loading on Cloudflare.
    window.addEventListener("keydown", this.onKeyDown, true);
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
      playerCombat: this.player.hurtbox,
      firstZombieCombat: this.zombies.getAliveZombies()[0]?.hurtbox ?? null,
    };
  }

  update(now: number): void {
    this.currentTime = now;
    if (this.overlayVisible) this.drawRanges(now);
    else this.graphics.clear();

    if (this.hitboxesVisible) this.drawHitboxes();
    else this.bodyGraphics.clear();

    this.info.setVisible(this.overlayVisible || this.hitboxesVisible || this.helpVisible);
    if (this.overlayVisible || this.hitboxesVisible || this.helpVisible) {
      this.info.setText(
        "3 RANGES | 4 HITBOXES | 5 +950 | 6 AMMO\n" +
        "7 KILL ALL | 8 NEXT | 9 GOD | 0 HELP\n" +
        "GREEN/PINK=FEET  LIME/CYAN=VISIBLE HURTBOX\n" +
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
    window.removeEventListener("keydown", this.onKeyDown, true);
    this.badge.destroy();
    this.graphics.destroy();
    this.bodyGraphics.destroy();
    this.info.destroy();
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.scene.sys.isActive()) return;
    const target = event.target;
    if (target instanceof HTMLElement &&
      (target.isContentEditable || target.matches("input,textarea,select"))) return;
    const action = resolveDebugShortcut(event);
    if (!action) return;
    event.preventDefault();
    this.perform(action);
  };

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
      case "help":
        this.helpVisible = !this.helpVisible;
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
    const playerBox=this.player.hurtbox;
    g.lineStyle(2,0xcaff70,.94);
    g.strokeEllipse(playerBox.centerX,playerBox.centerY,
      playerBox.radiusX*2,playerBox.radiusY*2);
    for (const zombie of this.zombies.getAliveZombies()) {
      this.strokeBody(zombie, 0xff659f);
      const box=zombie.hurtbox;
      g.lineStyle(2,0x7fd5ff,.94);
      g.strokeEllipse(box.centerX,box.centerY,
        box.radiusX*2,box.radiusY*2);
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
    const attackAnchor=this.player.getAimAnchor();
    g.strokeCircle(
      attackAnchor.x, attackAnchor.y, PLAYER_CONFIG.meleeRange,
    );
    const [vx, vy] = facingVector(this.player.facing);
    const angle = Math.atan2(vy, vx);
    const halfArc = Phaser.Math.DegToRad(
      PLAYER_CONFIG.meleeArcDegrees / 2,
    );
    for (const a of [angle - halfArc, angle + halfArc]) {
      g.lineBetween(
        attackAnchor.x, attackAnchor.y,
        attackAnchor.x + Math.cos(a) * PLAYER_CONFIG.meleeRange,
        attackAnchor.y + Math.sin(a) * PLAYER_CONFIG.meleeRange,
      );
    }
    for (const zombie of this.zombies.getAliveZombies()) {
      g.lineStyle(1, 0xc57773, .8);
      g.strokeEllipse(zombie.hurtbox.centerX,zombie.hurtbox.centerY,
        zombie.hurtbox.radiusX*2,zombie.hurtbox.radiusY*2);
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
