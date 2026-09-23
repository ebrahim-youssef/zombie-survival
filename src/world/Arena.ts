import Phaser from "phaser";
import {
  CABIN_PALETTE, ENV_TEXTURES, ensureEnvironmentArt,
} from "../art/EnvironmentArt";
import type { Segment } from "../utils/geometry";

export type WindowId =
  | "north-east" | "south-east" | "south-west" | "north-west";
export interface ArenaWindow {
  id: WindowId;
  center: Phaser.Math.Vector2;
  outsideSpawn: Phaser.Math.Vector2;
}
export interface ArenaInteractionLayout {
  kudaWallBuy: Phaser.Math.Vector2;
  mr6WallBuy: Phaser.Math.Vector2;
  mysteryBox: Phaser.Math.Vector2;
}
interface ArenaOptions {
  centerX: number;
  centerY: number;
  halfWidth: number;
  halfHeight: number;
  windowGapRatio: number;
}
const DEFAULT_OPTIONS: ArenaOptions = {
  centerX: 900, centerY: 550, halfWidth: 730, halfHeight: 330,
  windowGapRatio: 0.18,
};

/**
 * Decorative four-window cabin with a trapezoid cutaway projection.
 * Window/shot segments and player clamping share the same four boundaries.
 * The warm wood panels / blue exterior / pixel props are original art.
 */
export class Arena {
  readonly center: Phaser.Math.Vector2;
  readonly halfWidth: number;
  readonly halfHeight: number;
  readonly windows: readonly ArenaWindow[];
  readonly wallSegments: readonly Segment[];
  readonly interactions: ArenaInteractionLayout;

  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly exterior: Phaser.GameObjects.Graphics;
  private readonly illumination: Phaser.GameObjects.Graphics;
  private readonly props: Phaser.GameObjects.GameObject[] = [];
  private readonly vertices: readonly Phaser.Math.Vector2[];

  constructor(
    private readonly scene: Phaser.Scene,
    options: Partial<ArenaOptions> = {},
  ) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    ensureEnvironmentArt(scene);

    this.center = new Phaser.Math.Vector2(config.centerX, config.centerY);
    this.halfWidth = config.halfWidth;
    this.halfHeight = config.halfHeight;
    this.vertices = [
      new Phaser.Math.Vector2(
        this.center.x - this.halfWidth * .49,
        this.center.y - this.halfHeight * .76,
      ),
      new Phaser.Math.Vector2(
        this.center.x + this.halfWidth * .49,
        this.center.y - this.halfHeight * .76,
      ),
      new Phaser.Math.Vector2(
        this.center.x + this.halfWidth,
        this.center.y + this.halfHeight * .96,
      ),
      new Phaser.Math.Vector2(
        this.center.x - this.halfWidth,
        this.center.y + this.halfHeight * .96,
      ),
    ];
      this.windows = this.createWindows();
    this.wallSegments = this.createWallSegments(config.windowGapRatio);
    this.interactions = this.createInteractionLayout();

    this.exterior = scene.add.graphics().setDepth(-55);
    this.graphics = scene.add.graphics().setDepth(-28);
    this.illumination = scene.add.graphics().setDepth(-15);
    this.drawExterior();
    this.drawFloor();
    this.drawWalls();
    this.placeScenery();
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
  constrainPlayer(
    player: Phaser.Physics.Arcade.Sprite,
    margin = 24,
  ): void {
    const top = this.vertices[0]!;
    const bottom = this.vertices[2]!;
    const y = Phaser.Math.Clamp(player.y, top.y + margin, bottom.y - margin);
    const half = Math.max(12, this.floorHalfWidthAtY(y) - margin);
    const x = Phaser.Math.Clamp(
      player.x, this.center.x - half, this.center.x + half,
    );
    player.setPosition(x, y);
  }
  private floorHalfWidthAtY(y: number): number {
    const topY = this.vertices[0]!.y;
    const bottomY = this.vertices[2]!.y;
    const t = Phaser.Math.Clamp((y - topY) / (bottomY - topY), 0, 1);
    return Phaser.Math.Linear(this.halfWidth * .49, this.halfWidth, t);
  }
  
  destroy(): void {
    for (const prop of this.props) prop.destroy();
    this.props.length = 0;
    this.exterior.destroy();
    this.illumination.destroy();
    this.graphics.destroy();
  }

  private createWindows(): readonly ArenaWindow[] {
    const [topLeft, topRight, bottomRight, bottomLeft] = this.vertices;
    if (!topLeft || !topRight || !bottomRight || !bottomLeft) {
      throw Error("Missing cabin corners.");
    }
    return [
      this.createWindow("north-east", topLeft, topRight),
      this.createWindow("south-east", topRight, bottomRight),
      this.createWindow("south-west", bottomRight, bottomLeft),
      this.createWindow("north-west", bottomLeft, topLeft),
    ];
  }
  
  private createWindow(
    id: WindowId, start: Phaser.Math.Vector2, end: Phaser.Math.Vector2,
  ): ArenaWindow {
    // Side windows sit closer to the rear of the cabin, matching the
    // approved three-quarter room composition.
    const t = id === "south-east" ? .38 : id === "north-west" ? .62 : .5;
    const center = Phaser.Math.LinearXY(start, end, t);
    const outward = center.clone().subtract(this.center).normalize();
    return {
      id, center,
      outsideSpawn: center.clone().add(outward.scale(90)),
    };
  }
  private createWallSegments(gapRatio: number): readonly Segment[] {
    const [topLeft, topRight, bottomRight, bottomLeft] = this.vertices;
    if (!topLeft || !topRight || !bottomRight || !bottomLeft) {
      throw Error("Missing cabin corners.");
    }
    return [
      ...this.splitWall(topLeft, topRight, gapRatio),
      ...this.splitWall(topRight, bottomRight, gapRatio, .38),
      ...this.splitWall(bottomRight, bottomLeft, gapRatio),
      ...this.splitWall(bottomLeft, topLeft, gapRatio, .62),
    ];
  }
  
  private createInteractionLayout(): ArenaInteractionLayout {
    return {
      kudaWallBuy: new Phaser.Math.Vector2(
        this.center.x, this.center.y - this.halfHeight * .68,
      ),
      mr6WallBuy: new Phaser.Math.Vector2(
        this.center.x, this.center.y + this.halfHeight * .83,
      ),
      mysteryBox: new Phaser.Math.Vector2(this.center.x + 205, this.center.y - 125),
    };
  }
  private splitWall(
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    gapRatio: number,
    midpoint = .5,
  ): readonly [Segment, Segment] {
    const halfGap = gapRatio / 2;
    return [
      { start: start.clone(), end: Phaser.Math.LinearXY(start, end, midpoint - halfGap) },
      { start: Phaser.Math.LinearXY(start, end, midpoint + halfGap), end: end.clone() },
    ];
  }

  private drawExterior(): void {
    const g = this.exterior;
    const x = this.center.x - this.halfWidth - 300;
    const y = this.center.y - this.halfHeight - 290;
    const w = this.halfWidth * 2 + 600;
    const h = this.halfHeight * 2 + 580;
    g.fillStyle(CABIN_PALETTE.night, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(CABIN_PALETTE.nightBlue, .46);
    g.fillRect(x, y, w, 290);
    // Sparse cyan moonlight and distant tree silhouettes beyond windows.
    for (let i = 0; i < 64; i += 1) {
      const sx = x + ((i * 227 + 31) % w);
      const sy = y + ((i * 79 + 19) % 235);
      g.fillStyle(i % 3 === 0 ? 0xb2c2b5 : 0x607d9e, i % 4 === 0 ? .65 : .3);
      g.fillRect(sx, sy, i % 7 === 0 ? 3 : 1, i % 7 === 0 ? 2 : 1);
    }
    g.fillStyle(0x091827, 1);
    for (let i = 0; i < 19; i += 1) {
      const px = x + i * (w / 18);
      const py = y + 150 + (i % 4) * 21;
      g.fillRect(px, py, 12, 185);
      g.fillTriangle(px - 28, py + 83, px + 34, py + 83, px + 4, py - 40);
      g.fillTriangle(px - 36, py + 117, px + 38, py + 117, px + 4, py + 8);
    }
    // Cold outer perimeter fencing.
    g.lineStyle(5, 0x152b3f, .7);
    g.lineBetween(x + 20, y + 218, x + w - 20, y + 218);
    g.lineBetween(x + 20, y + 280, x + w - 20, y + 280);
    for (let i = 0; i < w; i += 55) {
      g.lineBetween(x + i, y + 192, x + i, y + 292);
    }
  }

  private drawFloor(): void {
    const g = this.graphics;
    const [tl, tr, br, bl] = this.vertices;
    if (!tl || !tr || !br || !bl) return;

    g.fillStyle(CABIN_PALETTE.plankDark, 1);
    g.fillPoints([...this.vertices], true);
    // Uncluttered warm cabin floor, narrowing toward the rear wall.
    g.fillStyle(0x76442c, 1);
    g.fillPoints([
      new Phaser.Math.Vector2(tl.x + 7, tl.y + 8),
      new Phaser.Math.Vector2(tr.x - 7, tr.y + 8),
      new Phaser.Math.Vector2(br.x - 11, br.y - 9),
      new Phaser.Math.Vector2(bl.x + 11, bl.y - 9),
    ], true);

    for (let row = 0, y = tl.y + 12; y < br.y - 20; row += 1, y += 27) {
      const topSpan = this.floorHalfWidthAtY(y) - 13;
      const bottomSpan = this.floorHalfWidthAtY(y + 23) - 13;
      if (topSpan < 20) continue;
      const shade = row % 3 === 0 ? 0x905536
        : row % 3 === 1 ? 0x845032 : 0x995c36;
      g.fillStyle(shade, .82);
      g.fillPoints([
        new Phaser.Math.Vector2(this.center.x - topSpan, y + 1),
        new Phaser.Math.Vector2(this.center.x + topSpan, y + 1),
        new Phaser.Math.Vector2(this.center.x + bottomSpan, y + 22),
        new Phaser.Math.Vector2(this.center.x - bottomSpan, y + 22),
      ], true);
      g.lineStyle(2, 0x462a22, .85);
      g.lineBetween(
        this.center.x - bottomSpan, y + 23,
        this.center.x + bottomSpan, y + 23,
      );
      g.lineStyle(1, 0xbc804e, .46);
      g.lineBetween(
        this.center.x - topSpan + 5, y + 4,
        this.center.x + topSpan - 5, y + 4,
      );

      const left = this.center.x - topSpan + 12;
      const right = this.center.x + topSpan - 12;
      for (
        let seam = left + ((row % 2) * 51 + 100);
        seam < right; seam += 102
      ) {
        g.lineStyle(2, 0x4a2f27, .84);
        g.lineBetween(seam, y + 2, seam, y + 21);
        g.fillStyle(0x3b2924, .75);
        g.fillRect(seam - 5, y + 8, 2, 2);
        g.fillRect(seam - 5, y + 17, 2, 2);
      }
    }

    g.lineStyle(22, 0x242127, 1);
    g.strokePoints([...this.vertices], true, true);
    g.lineStyle(6, 0xae7648, 1);
    g.strokePoints([...this.vertices], true, true);
    for (const [dx, dy] of [
      [-320, -60], [-445, 90], [340, 124],
      [-244, 192], [215, -154], [100, 237],
    ] as const) {
      g.fillStyle(0x2f221f, .38);
      g.fillEllipse(this.center.x + dx, this.center.y + dy, 24, 8);
      g.lineStyle(3, 0x4e3227, .8);
      g.lineBetween(
        this.center.x + dx - 15, this.center.y + dy - 4,
        this.center.x + dx + 11, this.center.y + dy + 6,
      );
    }
  }

  
  private drawWalls(): void {
    const [tl, tr, br, bl] = this.vertices;
    if (!tl || !tr || !br || !bl) return;
    const edges: readonly (readonly [Phaser.Math.Vector2, Phaser.Math.Vector2])[] = [
      [tl, tr], [tr, br], [br, bl], [bl, tl],
    ];
    edges.forEach(([a, b], index) => {
      // Three tall readable walls, with a low cutaway foreground ledge.
      const back = index !== 2;
      const rise = index === 0 ? 88 : back ? 92 : 22;
      const wallColor = index === 0 ? 0x63412f
        : index === 1 ? 0x55372c : index === 3 ? 0x73432d : 0x3e302c;
      this.graphics.fillStyle(wallColor, 1);
      this.graphics.fillPoints([
        a.clone(), b.clone(),
        new Phaser.Math.Vector2(b.x, b.y - rise),
        new Phaser.Math.Vector2(a.x, a.y - rise),
      ], true);
      this.graphics.lineStyle(back ? 12 : 8, 0x221d21, 1);
      this.graphics.lineBetween(a.x, a.y - rise, b.x, b.y - rise);
      this.graphics.lineStyle(3, 0xb78350, .9);
      this.graphics.lineBetween(a.x, a.y - rise + 4, b.x, b.y - rise + 4);
      const length = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      for (let offset = 35; offset < length - 25; offset += 54) {
        const at = Phaser.Math.LinearXY(a, b, offset / length);
        this.graphics.lineStyle(2, 0x362521, .74);
        this.graphics.lineBetween(
          at.x, at.y - rise + 10, at.x, at.y - 4,
        );
        this.graphics.lineStyle(1, 0xa16a40, .6);
        this.graphics.lineBetween(
          at.x + 4, at.y - rise + 10, at.x + 4, at.y - 6,
        );
      }
      this.drawWindow(this.windows[index]!, a, b, back);
    });
  }

  
  private drawWindow(
    window: ArenaWindow,
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    back: boolean,
  ): void {
    const g = this.graphics;
    const tangent = end.clone().subtract(start).normalize();
    const raise = back ? 56 : 31;
    const a = window.center.clone().add(tangent.clone().scale(-57));
    const b = window.center.clone().add(tangent.clone().scale(57));
    const au = a.clone().add(new Phaser.Math.Vector2(0, -raise));
    const bu = b.clone().add(new Phaser.Math.Vector2(0, -raise));
    g.fillStyle(0x142638, 1);
    g.fillPoints([a, b, bu, au], true);
    g.fillStyle(0x274363, .83);
    g.fillPoints([
      a.clone().add(tangent.clone().scale(6)),
      b.clone().add(tangent.clone().scale(-6)),
      bu.clone().add(tangent.clone().scale(-6)),
      au.clone().add(tangent.clone().scale(6)),
    ], true);
    g.lineStyle(10, 0x352420, 1);
    g.lineBetween(au.x, au.y, bu.x, bu.y);
    g.lineBetween(a.x, a.y, au.x, au.y);
    g.lineBetween(b.x, b.y, bu.x, bu.y);
    g.lineBetween(a.x, a.y, b.x, b.y);
    g.lineStyle(3, 0xb58152, 1);
    g.lineBetween(au.x, au.y + 3, bu.x, bu.y + 3);
    g.lineBetween(a.x, a.y - 3, b.x, b.y - 3);
    // Broken panes: cold-blue angular fragments rather than a solid wall.
    const mid = window.center.clone().add(new Phaser.Math.Vector2(0, -raise * .52));
    g.lineStyle(2, 0x86b0bd, .8);
    g.lineBetween(mid.x - 20, mid.y - 14, mid.x - 3, mid.y + 8);
    g.lineBetween(mid.x - 3, mid.y + 8, mid.x + 24, mid.y - 8);
    g.lineBetween(mid.x + 24, mid.y - 8, mid.x + 34, mid.y + 5);
    // Jagged, loosely boarded window while keeping an open central gap.
    g.lineStyle(10, 0x33251f, 1);
    g.lineBetween(
      mid.x - tangent.x * 55, mid.y - tangent.y * 55 - 7,
      mid.x + tangent.x * 55, mid.y + tangent.y * 55 + 7,
    );
    g.lineStyle(5, 0xa06a42, 1);
    g.lineBetween(
      mid.x - tangent.x * 54, mid.y - tangent.y * 54 - 9,
      mid.x + tangent.x * 54, mid.y + tangent.y * 54 + 5,
    );
  }

  private prop(
    texture: string, x: number, y: number,
    scale: number, offset = 0,
  ): Phaser.GameObjects.Image {
    const image = this.scene.add.image(x, y, texture)
      .setOrigin(.5, 1)
      .setScale(scale)
      .setDepth(8 + y / 100 + offset);
    this.props.push(image);
    return image;
  }

  private glow(x: number, y: number, radius: number): void {
    const g = this.illumination;
    for (let i = 4; i >= 1; i -= 1) {
      g.fillStyle(0xffb741, .021 + i * .018);
      g.fillEllipse(x, y, radius * i / 2, radius * i / 3);
    }
  }

  private placeScenery(): void {
    const { x, y } = this.center;
    this.prop(ENV_TEXTURES.rug, x + 278, y + 218, 2.0, -1);
    this.prop(ENV_TEXTURES.shelf, x + 320, y - 148, 1.28);
    this.prop(ENV_TEXTURES.barrel, x - 355, y - 115, 1.33);
    this.prop(ENV_TEXTURES.lantern, x - 355, y - 161, 1.65, 2);
    this.glow(x - 355, y - 180, 140);
    this.prop(ENV_TEXTURES.crate, x - 330, y + 229, 1.3);
    this.prop(ENV_TEXTURES.crate, x - 384, y + 196, 1.0);
    this.prop(ENV_TEXTURES.crate, x + 412, y + 165, 1.33);
    this.prop(ENV_TEXTURES.lantern, x + 438, y + 119, 1.5, 3);
    this.glow(x + 438, y + 124, 132);
    this.glow(this.interactions.mysteryBox.x, this.interactions.mysteryBox.y, 150);
    this.prop(ENV_TEXTURES.crate, x - 477, y + 212, 1.15);
    this.prop(ENV_TEXTURES.crate, x + 510, y + 158, 1.15);
    this.prop(ENV_TEXTURES.paper, x - 260, y + 143, 1.18, -2).setAngle(-12);
    this.prop(ENV_TEXTURES.paper, x + 95, y + 212, .86, -2).setAngle(24);

    this.prop(ENV_TEXTURES.sign, x + 484, y + 61, 1.0);
    const sign = this.scene.add.text(
      x + 484, y + 8, "HOLD\nTHE\nLINE!", {
        align: "center",
        fontFamily: "monospace", fontStyle: "bold",
        fontSize: "11px", color: "#5d322b",
      },
    ).setOrigin(.5).setDepth(8 + (y + 61) / 100 + .2);
    this.props.push(sign);

    for (const [dx, dy, scale] of [
      [-450, -48, .7], [-279, 124, .92], [420, -50, .74],
      [-210, -172, .76], [328, 192, .58],
    ] as const) {
      this.prop(ENV_TEXTURES.debris, x + dx, y + dy, scale, -2);
    }
  }
}
