import Phaser from "phaser";

export class CombatEffects {
  constructor(private readonly scene: Phaser.Scene) {}

  showShot(
    origin: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    durationMs: number,
  ): void {
    const graphics = this.scene.add.graphics().setDepth(900);

    graphics.lineStyle(2, 0xf6d46b, 0.88);
    graphics.lineBetween(origin.x, origin.y, end.x, end.y);

    graphics.fillStyle(0xffefad, 0.95);
    graphics.fillCircle(origin.x, origin.y, 5);

    this.scene.time.delayedCall(durationMs, () => {
      graphics.destroy();
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
      Math.cos(baseAngle - halfArc),
      Math.sin(baseAngle - halfArc),
    ).scale(range);

    const right = new Phaser.Math.Vector2(
      Math.cos(baseAngle + halfArc),
      Math.sin(baseAngle + halfArc),
    ).scale(range);

    graphics.lineStyle(2, 0xe8e1ce, 0.65);
    graphics.lineBetween(
      origin.x,
      origin.y,
      origin.x + left.x,
      origin.y + left.y,
    );
    graphics.lineBetween(
      origin.x,
      origin.y,
      origin.x + right.x,
      origin.y + right.y,
    );
    graphics.lineBetween(
      origin.x + left.x,
      origin.y + left.y,
      origin.x + right.x,
      origin.y + right.y,
    );

    this.scene.time.delayedCall(durationMs, () => {
      graphics.destroy();
    });
  }
}
