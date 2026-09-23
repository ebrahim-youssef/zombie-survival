import Phaser from "phaser";
import type { Segment } from "../utils/geometry";

export type WindowId =
  | "north-east"
  | "south-east"
  | "south-west"
  | "north-west";

export interface ArenaWindow {
  id: WindowId;
  center: Phaser.Math.Vector2;
  outsideSpawn: Phaser.Math.Vector2;
}

interface ArenaOptions {
  centerX: number;
  centerY: number;
  halfWidth: number;
  halfHeight: number;
  windowGapRatio: number;
}

const DEFAULT_OPTIONS: ArenaOptions = {
  centerX: 900,
  centerY: 550,
  halfWidth: 760,
  halfHeight: 390,
  windowGapRatio: 0.18,
};

export class Arena {
  readonly center: Phaser.Math.Vector2;
  readonly halfWidth: number;
  readonly halfHeight: number;
  readonly windows: readonly ArenaWindow[];
  readonly wallSegments: readonly Segment[];

  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly vertices: readonly Phaser.Math.Vector2[];

  constructor(
    private readonly scene: Phaser.Scene,
    options: Partial<ArenaOptions> = {},
  ) {
    const config = { ...DEFAULT_OPTIONS, ...options };

    this.center = new Phaser.Math.Vector2(config.centerX, config.centerY);
    this.halfWidth = config.halfWidth;
    this.halfHeight = config.halfHeight;

    this.vertices = [
      new Phaser.Math.Vector2(this.center.x, this.center.y - this.halfHeight),
      new Phaser.Math.Vector2(this.center.x + this.halfWidth, this.center.y),
      new Phaser.Math.Vector2(this.center.x, this.center.y + this.halfHeight),
      new Phaser.Math.Vector2(this.center.x - this.halfWidth, this.center.y),
    ];

    this.windows = this.createWindows();
    this.wallSegments = this.createWallSegments(config.windowGapRatio);
    this.graphics = this.scene.add.graphics().setDepth(-20);
    this.draw();
  }

  get spawnPoint(): Phaser.Math.Vector2 {
    return this.center.clone();
  }

  getCameraBounds(margin = 120): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.center.x - this.halfWidth - margin,
      this.center.y - this.halfHeight - margin,
      this.halfWidth * 2 + margin * 2,
      this.halfHeight * 2 + margin * 2,
    );
  }

  constrainPlayer(player: Phaser.Physics.Arcade.Sprite, margin = 24): void {
    const safeHalfWidth = this.halfWidth - margin;
    const safeHalfHeight = this.halfHeight - margin;

    const dx = player.x - this.center.x;
    const dy = player.y - this.center.y;
    const normalizedDistance =
      Math.abs(dx) / safeHalfWidth + Math.abs(dy) / safeHalfHeight;

    if (normalizedDistance <= 1) return;

    const scale = 1 / normalizedDistance;
    player.setPosition(this.center.x + dx * scale, this.center.y + dy * scale);
  }

  destroy(): void {
    this.graphics.destroy();
  }

  private createWindows(): readonly ArenaWindow[] {
    const [top, right, bottom, left] = this.vertices;

    if (!top || !right || !bottom || !left) {
      throw new Error("Arena vertices were not initialized correctly.");
    }

    return [
      this.createWindow("north-east", top, right),
      this.createWindow("south-east", right, bottom),
      this.createWindow("south-west", bottom, left),
      this.createWindow("north-west", left, top),
    ];
  }

  private createWindow(
    id: WindowId,
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
  ): ArenaWindow {
    const center = Phaser.Math.LinearXY(start, end, 0.5);
    const outward = center.clone().subtract(this.center).normalize();

    return {
      id,
      center,
      outsideSpawn: center.clone().add(outward.scale(90)),
    };
  }

  private createWallSegments(gapRatio: number): readonly Segment[] {
    const [top, right, bottom, left] = this.vertices;

    if (!top || !right || !bottom || !left) {
      throw new Error("Arena vertices were not initialized correctly.");
    }

    return [
      ...this.splitWall(top, right, gapRatio),
      ...this.splitWall(right, bottom, gapRatio),
      ...this.splitWall(bottom, left, gapRatio),
      ...this.splitWall(left, top, gapRatio),
    ];
  }

  private splitWall(
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    gapRatio: number,
  ): readonly [Segment, Segment] {
    const halfGap = gapRatio / 2;
    const firstEnd = Phaser.Math.LinearXY(start, end, 0.5 - halfGap);
    const secondStart = Phaser.Math.LinearXY(start, end, 0.5 + halfGap);

    return [
      { start: start.clone(), end: firstEnd },
      { start: secondStart, end: end.clone() },
    ];
  }

  private draw(): void {
    const [top, right, bottom, left] = this.vertices;
    if (!top || !right || !bottom || !left) return;

    this.graphics.fillStyle(0x2a2d27, 1);
    this.graphics.fillPoints([top, right, bottom, left], true);

    this.drawFloorGrid();

    this.graphics.lineStyle(12, 0x5b5a4f, 1);
    for (const wall of this.wallSegments) {
      this.graphics.lineBetween(
        wall.start.x,
        wall.start.y,
        wall.end.x,
        wall.end.y,
      );
    }

    for (const window of this.windows) {
      this.graphics.fillStyle(0xd6ad55, 1);
      this.graphics.fillCircle(window.center.x, window.center.y, 9);

      this.graphics.lineStyle(2, 0xd6ad55, 0.35);
      this.graphics.strokeCircle(
        window.outsideSpawn.x,
        window.outsideSpawn.y,
        14,
      );
    }
  }

  private drawFloorGrid(): void {
    const spacing = 64;
    this.graphics.lineStyle(1, 0x4a4c43, 0.26);

    for (
      let offset = -this.halfWidth;
      offset <= this.halfWidth;
      offset += spacing
    ) {
      const t = Phaser.Math.Clamp(
        (offset + this.halfWidth) / (this.halfWidth * 2),
        0,
        1,
      );
      const a = Phaser.Math.LinearXY(this.vertices[3]!, this.vertices[0]!, t);
      const b = Phaser.Math.LinearXY(this.vertices[2]!, this.vertices[1]!, t);
      this.graphics.lineBetween(a.x, a.y, b.x, b.y);
    }

    for (
      let offset = -this.halfWidth;
      offset <= this.halfWidth;
      offset += spacing
    ) {
      const t = Phaser.Math.Clamp(
        (offset + this.halfWidth) / (this.halfWidth * 2),
        0,
        1,
      );
      const a = Phaser.Math.LinearXY(this.vertices[0]!, this.vertices[1]!, t);
      const b = Phaser.Math.LinearXY(this.vertices[3]!, this.vertices[2]!, t);
      this.graphics.lineBetween(a.x, a.y, b.x, b.y);
    }
  }
}
