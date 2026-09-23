import Phaser from "phaser";
import type { GameSettings } from "../persistence/LocalSettingsStore";

/** Pixel-snapped short tracers, muzzle flashes and impact bursts. */
export class CombatEffects {
  constructor(private readonly scene: Phaser.Scene) {}

  showShot(
    origin: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    durationMs: number,
  ): void {
    const graphics = this.scene.add.graphics().setDepth(900);
    const distance = Phaser.Math.Distance.Between(origin.x, origin.y, end.x, end.y);
    const length = Math.min(125, distance);
    const angle = Phaser.Math.Angle.Between(origin.x, origin.y, end.x, end.y);
    const tipX = origin.x + Math.cos(angle) * length;
    const tipY = origin.y + Math.sin(angle) * length;
    graphics.lineStyle(2, 0xf5bf52, .88);
    graphics.lineBetween(origin.x, origin.y, tipX, tipY);
    graphics.lineStyle(1, 0xffe7a3, .94);
    graphics.lineBetween(origin.x, origin.y, origin.x + (tipX - origin.x) * .68,
      origin.y + (tipY - origin.y) * .68);
    // Squared star-shaped arcade muzzle flash.
    graphics.fillStyle(0xffbe45, 1);
    graphics.fillRect(origin.x - 7, origin.y - 2, 15, 4);
    graphics.fillRect(origin.x - 2, origin.y - 7, 4, 15);
    graphics.fillStyle(0xfff4bc, 1);
    graphics.fillRect(origin.x - 3, origin.y - 3, 7, 7);
    this.scene.time.delayedCall(durationMs, () => graphics.destroy());
  }

  showImpact(position: Phaser.Math.Vector2, killed: boolean): void {
    const g = this.scene.add.graphics().setDepth(910);
    const fragments = [
      [-12, -6, 5, 3], [-5, -10, 4, 5], [4, -8, 6, 3],
      [9, -2, 5, 4], [-10, 5, 4, 5], [0, 7, 6, 3],
      [7, 11, 3, 3], [-2, -1, 7, 6],
    ] as const;
    for (let i = 0; i < (killed ? fragments.length : 4); i += 1) {
      const [dx, dy, w, h] = fragments[i]!;
      g.fillStyle(i % 3 === 0 ? 0xe2543c : 0x9b3033, 1);
      g.fillRect(position.x + dx, position.y + dy, w, h);
    }
    this.scene.tweens.add({
      targets: g, alpha: 0, y: 8,
      duration: killed ? 300 : 160,
      onComplete: () => g.destroy(),
    });
  }

  showDamageNumber(
    position: Phaser.Math.Vector2,
    amount: number,
  ): void {
    const settings = this.scene.registry.get("gameSettings") as GameSettings | undefined;
    if (!settings?.damageNumbers) return;
    const label = this.scene.add.text(position.x, position.y - 27,
      String(Math.round(amount)), {
        fontFamily: "monospace", fontStyle: "bold",
        fontSize: "15px", color: "#ffe2a0",
        stroke: "#1c2021", strokeThickness: 3,
      },
    ).setOrigin(.5).setDepth(950);
    this.scene.tweens.add({
      targets: label, y: label.y - 22, alpha: 0, duration: 480,
      onComplete: () => label.destroy(),
    });
  }

  showMeleeCone(
    origin: Phaser.Math.Vector2,
    direction: Phaser.Math.Vector2,
    range: number,
    arcDegrees: number,
    durationMs = 90,
  ): void {
    if (direction.lengthSq() === 0) return;
    const graphics = this.scene.add.graphics().setDepth(850);
    const baseAngle = Math.atan2(direction.y, direction.x);
    const halfArc = Phaser.Math.DegToRad(arcDegrees / 2);
    const left = new Phaser.Math.Vector2(
      Math.cos(baseAngle - halfArc), Math.sin(baseAngle - halfArc),
    ).scale(range);
    const right = new Phaser.Math.Vector2(
      Math.cos(baseAngle + halfArc), Math.sin(baseAngle + halfArc),
    ).scale(range);
    graphics.lineStyle(3, 0xf7e2a7, .83);
    graphics.lineBetween(origin.x + left.x, origin.y + left.y,
      origin.x + right.x, origin.y + right.y);
    graphics.lineStyle(1, 0xf5b740, .48);
    graphics.lineBetween(origin.x, origin.y, origin.x + left.x, origin.y + left.y);
    graphics.lineBetween(origin.x, origin.y, origin.x + right.x, origin.y + right.y);
    this.scene.time.delayedCall(durationMs, () => graphics.destroy());
  }
}
