import Phaser from "phaser";

export class Crosshair {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(1000);
    this.draw();
  }

  setWorldPosition(point: Phaser.Math.Vector2): void {
    this.graphics.setPosition(Math.round(point.x), Math.round(point.y));
  }

  destroy(): void {
    this.graphics.destroy();
  }

  private draw(): void {
    this.graphics.clear();
    this.graphics.lineStyle(2, 0xf4df9a, 0.95);
    this.graphics.lineBetween(-12, 0, -5, 0);
    this.graphics.lineBetween(5, 0, 12, 0);
    this.graphics.lineBetween(0, -12, 0, -5);
    this.graphics.lineBetween(0, 5, 0, 12);

    this.graphics.fillStyle(0xf4df9a, 0.95);
    this.graphics.fillCircle(0, 0, 1.5);
  }
}
