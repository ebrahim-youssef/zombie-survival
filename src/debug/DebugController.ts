import Phaser from "phaser";
import {facingVector} from "../art/directions";
import { PLAYER_CONFIG } from "../config/player";
import { ZOMBIE_CONFIG } from "../config/zombie";
import type { Player } from "../entities/Player";
import type { RunState } from "../game/RunState";
import type { Arena } from "../world/Arena";
import type { CombatController } from "../combat/CombatController";
import type { WaveController } from "../zombies/WaveController";
import type { ZombieController } from "../zombies/ZombieController";

/** Dev-only diagnostic overlay. Never constructed by production GameScene. */
export class DebugController {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly info: Phaser.GameObjects.Text;
  private visible = false;
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
    this.info = scene.add.text(18, 102,
      "F3 DEBUG | F6 +950 | F7 AMMO | F8 KILL ALL | F9 NEXT | F10 GOD",
      { fontFamily: "monospace", fontSize: "14px", color: "#f6ce72",
        backgroundColor: "#171817dd", padding: { x: 8, y: 6 } },
    ).setScrollFactor(0).setDepth(3600).setVisible(false);

    scene.input.keyboard?.on("keydown-F3", this.toggle, this);
    scene.input.keyboard?.on("keydown-F6", this.addPoints, this);
    scene.input.keyboard?.on("keydown-F7", this.refillAmmo, this);
    scene.input.keyboard?.on("keydown-F8", this.clearZombies, this);
    scene.input.keyboard?.on("keydown-F9", this.nextRound, this);
    scene.input.keyboard?.on("keydown-F10", this.toggleGod, this);
  }

  update(now: number): void {
    this.currentTime = now;
    if (!this.visible) return;
    this.graphics.clear();

    this.graphics.lineStyle(2, 0xe1bd56, 0.9);
    for (const segment of this.arena.wallSegments) {
      this.graphics.lineBetween(
        segment.start.x, segment.start.y, segment.end.x, segment.end.y,
      );
    }

    this.graphics.lineStyle(1, 0x7ebebe, 0.8);
    for (const window of this.arena.windows) {
      this.graphics.strokeCircle(window.center.x, window.center.y, 13);
      this.graphics.strokeCircle(window.outsideSpawn.x, window.outsideSpawn.y, 14);
    }

    this.graphics.lineStyle(1, 0xf1cf76, 0.8);
    for (const position of Object.values(this.arena.interactions)) {
      this.graphics.strokeCircle(
        position.x, position.y, PLAYER_CONFIG.interactionRange,
      );
    }

    this.graphics.lineStyle(2, 0x7ec2e2, 0.9);
    this.graphics.strokeCircle(
      this.player.x, this.player.y, PLAYER_CONFIG.meleeRange,
    );
    const [vx,vy]=facingVector(this.player.facing);
    const angle=Math.atan2(vy,vx);
    const halfArc = Phaser.Math.DegToRad(PLAYER_CONFIG.meleeArcDegrees / 2);
    for (const a of [angle - halfArc, angle + halfArc]) {
      this.graphics.lineBetween(
        this.player.x, this.player.y,
        this.player.x + Math.cos(a) * PLAYER_CONFIG.meleeRange,
        this.player.y + Math.sin(a) * PLAYER_CONFIG.meleeRange,
      );
    }

    for (const zombie of this.zombies.getAliveZombies()) {
      this.graphics.lineStyle(1, 0xc57773, 0.8);
      this.graphics.strokeCircle(zombie.x, zombie.y, zombie.hitRadius);
      this.graphics.lineStyle(1, 0xc57773, 0.3);
      this.graphics.strokeCircle(zombie.x, zombie.y, ZOMBIE_CONFIG.attackRange);
    }

    this.graphics.lineStyle(2, 0xf5ebcf, 0.95);
    for (const ray of this.combat.getDebugRays(now)) {
      this.graphics.lineBetween(
        ray.start.x, ray.start.y, ray.end.x, ray.end.y,
      );
    }

    this.info.setText(
      "F3 DEBUG | F6 +950 | F7 AMMO | F8 KILL ALL | F9 NEXT | F10 GOD\n" +
      "GOD: " + (this.player.invulnerable ? "ON" : "OFF") +
      " | ZOMBIES: " + this.zombies.getAliveCount() +
      " | ROUND: " + this.waves.snapshot(now).round,
    );
  }

  destroy(): void {
    this.combat.setDebugRayCapture(false);
    this.scene.input.keyboard?.off("keydown-F3", this.toggle, this);
    this.scene.input.keyboard?.off("keydown-F6", this.addPoints, this);
    this.scene.input.keyboard?.off("keydown-F7", this.refillAmmo, this);
    this.scene.input.keyboard?.off("keydown-F8", this.clearZombies, this);
    this.scene.input.keyboard?.off("keydown-F9", this.nextRound, this);
    this.scene.input.keyboard?.off("keydown-F10", this.toggleGod, this);
    this.graphics.destroy();
    this.info.destroy();
  }

  private toggle(): void {
    this.visible = !this.visible;
    this.info.setVisible(this.visible);
    this.combat.setDebugRayCapture(this.visible);
    if (!this.visible) this.graphics.clear();
  }

  private addPoints(): void {
    this.runState.points += 950;
  }

  private refillAmmo(): void {
    this.combat.inventory.activeWeapon.refill();
  }

  private clearZombies(): void {
    for (const zombie of this.zombies.getAliveZombies()) {
      zombie.takeDamage(Number.MAX_SAFE_INTEGER);
    }
  }

  private nextRound(): void {
    this.waves.debugNextRound(this.currentTime);
  }

  private toggleGod(): void {
    this.player.setInvulnerable(!this.player.invulnerable);
  }
}
