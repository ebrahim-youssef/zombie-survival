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
  centerX: 900, centerY: 550, halfWidth: 760, halfHeight: 390,
  windowGapRatio: 0.18,
};

/**
 * Decorative cutaway cabin, built on the existing four-window diamond
 * collision layout. This class deliberately does not move gameplay geometry.
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
      new Phaser.Math.Vector2(this.center.x, this.center.y - this.halfHeight),
      new Phaser.Math.Vector2(this.center.x + this.halfWidth, this.center.y),
      new Phaser.Math.Vector2(this.center.x, this.center.y + this.halfHeight),
      new Phaser.Math.Vector2(this.center.x - this.halfWidth, this.center.y),
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
    const safeX = this.halfWidth - margin;
    const safeY = this.halfHeight - margin;
    const dx = player.x - this.center.x;
    const dy = player.y - this.center.y;
    const radial = Math.abs(dx) / safeX + Math.abs(dy) / safeY;
    if (radial <= 1) return;
    const scale = 1 / radial;
    player.setPosition(this.center.x + dx * scale, this.center.y + dy * scale);
  }
  destroy(): void {
    for (const prop of this.props) prop.destroy();
    this.props.length = 0;
    this.exterior.destroy();
    this.illumination.destroy();
    this.graphics.destroy();
  }

  private createWindows(): readonly ArenaWindow[] {
    const [top, right, bottom, left] = this.vertices;
    if (!top || !right || !bottom || !left) throw Error("Missing cabin vertices.");
    return [
      this.createWindow("north-east", top, right),
      this.createWindow("south-east", right, bottom),
      this.createWindow("south-west", bottom, left),
      this.createWindow("north-west", left, top),
    ];
  }
  private createWindow(
    id: WindowId, start: Phaser.Math.Vector2, end: Phaser.Math.Vector2,
  ): ArenaWindow {
    const center = Phaser.Math.LinearXY(start, end, 0.5);
    const outward = center.clone().subtract(this.center).normalize();
    return {
      id, center,
      outsideSpawn: center.clone().add(outward.scale(90)),
    };
  }
  private createWallSegments(gapRatio: number): readonly Segment[] {
    const [top, right, bottom, left] = this.vertices;
    if (!top || !right || !bottom || !left) throw Error("Missing cabin vertices.");
    return [
      ...this.splitWall(top, right, gapRatio),
      ...this.splitWall(right, bottom, gapRatio),
      ...this.splitWall(bottom, left, gapRatio),
      ...this.splitWall(left, top, gapRatio),
    ];
  }
  private createInteractionLayout(): ArenaInteractionLayout {
    return {
      kudaWallBuy: new Phaser.Math.Vector2(
        this.center.x, this.center.y - this.halfHeight * .68,
      ),
      mr6WallBuy: new Phaser.Math.Vector2(
        this.center.x, this.center.y + this.halfHeight * .68,
      ),
      mysteryBox: new Phaser.Math.Vector2(this.center.x + 190, this.center.y + 10),
    };
  }
  private splitWall(
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    gapRatio: number,
  ): readonly [Segment, Segment] {
    const halfGap = gapRatio / 2;
    return [
      { start: start.clone(), end: Phaser.Math.LinearXY(start, end, .5 - halfGap) },
      { start: Phaser.Math.LinearXY(start, end, .5 + halfGap), end: end.clone() },
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
    g.fillStyle(CABIN_PALETTE.plankDark, 1);
    g.fillPoints([...this.vertices], true);
    const [top, right, bottom, left] = this.vertices;
    if (!top || !right || !bottom || !left) return;
    // Warm floor base, with dark-cutaway bevel on its perimeter.
    g.fillStyle(0x6e422d, 1);
    g.fillPoints([
      new Phaser.Math.Vector2(top.x, top.y + 9),
      new Phaser.Math.Vector2(right.x - 13, right.y),
      new Phaser.Math.Vector2(bottom.x, bottom.y - 10),
      new Phaser.Math.Vector2(left.x + 13, left.y),
    ], true);

    for (let row = 0, y = top.y + 18; y < bottom.y - 13; row += 1, y += 27) {
      const edge = Math.max(Math.abs(y - this.center.y), Math.abs(y + 25 - this.center.y));
      const span = this.halfWidth * (1 - edge / this.halfHeight) - 12;
      if (span < 16) continue;
      const l = this.center.x - span;
      const r = this.center.x + span;
      g.fillStyle(row % 3 === 0 ? 0x905334 : row % 3 === 1 ? 0x79462f : 0x8d5132, .72);
      g.fillRect(l, y + 2, span * 2, 19);
      g.lineStyle(2, 0x442920, .84);
      g.lineBetween(l, y + 23, r, y + 23);
      g.lineStyle(1, 0xb17743, .55);
      g.lineBetween(l + 4, y + 3, r - 4, y + 3);
      const boardLength = 102;
      for (let x = l + (row % 2) * (boardLength / 2) + boardLength;
        x < r - 8; x += boardLength) {
        g.lineStyle(2, 0x4b2d25, .8);
        g.lineBetween(x, y + 2, x, y + 22);
        g.fillStyle(0x35271f, .7);
        g.fillRect(x - 5, y + 8, 2, 2);
        g.fillRect(x - 5, y + 17, 2, 2);
      }
    }

    // Existing map shape stays authoritative for physics/ray collision.
    g.lineStyle(20, 0x251f21, 1);
    g.strokePoints([...this.vertices], true, true);
    g.lineStyle(6, 0xb27a4a, 1);
    g.strokePoints([...this.vertices], true, true);

    // Deterministic worn floor stains and discarded wood near corners.
    for (const [dx, dy] of [
      [-350, -112], [-460, 42], [375, 125], [-272, 194],
      [230, -180], [125, 236], [-120, -230],
    ] as const) {
      g.fillStyle(0x2d231f, .45);
      g.fillEllipse(this.center.x + dx, this.center.y + dy, 31, 11);
      g.lineStyle(3, 0x422d23, .8);
      g.lineBetween(
        this.center.x + dx - 16, this.center.y + dy - 5,
        this.center.x + dx + 10, this.center.y + dy + 7,
      );
    }
  }

  private drawWalls(): void {
    const [top, right, bottom, left] = this.vertices;
    if (!top || !right || !bottom || !left) return;
    const edges: readonly (readonly [Phaser.Math.Vector2, Phaser.Math.Vector2])[] = [
      [top, right], [right, bottom], [bottom, left], [left, top],
    ];
    edges.forEach(([a, b], index) => {
      const back = index === 0 || index === 3;
      const rise = back ? 78 : 22;
      const wallColor = index === 0 ? 0x5b382e : index === 3 ? 0x70412e : 0x3e302c;
      this.graphics.fillStyle(wallColor, 1);
      this.graphics.fillPoints([
        new Phaser.Math.Vector2(a.x, a.y),
        new Phaser.Math.Vector2(b.x, b.y),
        new Phaser.Math.Vector2(b.x, b.y - rise),
        new Phaser.Math.Vector2(a.x, a.y - rise),
      ], true);
      this.graphics.lineStyle(back ? 11 : 8, 0x231f23, 1);
      this.graphics.lineBetween(a.x, a.y - rise, b.x, b.y - rise);
      this.graphics.lineStyle(3, 0xa76b42, back ? .95 : .72);
      this.graphics.lineBetween(a.x, a.y - rise + 4, b.x, b.y - rise + 4);

      const length = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      for (let distance = 34; distance < length - 25; distance += 51) {
        const at = Phaser.Math.LinearXY(a, b, distance / length);
        this.graphics.lineStyle(2, 0x3c2826, .67);
        this.graphics.lineBetween(at.x, at.y - rise + 9, at.x, at.y - 4);
        this.graphics.lineStyle(1, 0x9b6840, .7);
        this.graphics.lineBetween(at.x + 3, at.y - rise + 10, at.x + 3, at.y - 7);
      }
      // Rendered slats match the original four collision-window locations.
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
      g.fillStyle(0xffc254, .026 + i * .012);
      g.fillEllipse(x, y, radius * i / 2, radius * i / 3);
    }
  }

  private placeScenery(): void {
    const { x, y } = this.center;
    this.prop(ENV_TEXTURES.rug, x + 278, y + 218, 2.0, -1);
    this.prop(ENV_TEXTURES.shelf, x + 320, y - 148, 1.28);
    this.prop(ENV_TEXTURES.barrel, x - 355, y - 115, 1.33);
    this.prop(ENV_TEXTURES.lantern, x - 355, y - 161, 1.24, 2);
    this.glow(x - 355, y - 180, 180);
    this.prop(ENV_TEXTURES.crate, x - 330, y + 229, 1.3);
    this.prop(ENV_TEXTURES.crate, x - 384, y + 196, 1.0);
    this.prop(ENV_TEXTURES.crate, x + 412, y + 165, 1.33);
    this.prop(ENV_TEXTURES.lantern, x + 438, y + 119, 1.1, 3);
    this.glow(x + 438, y + 124, 155);
    this.glow(this.interactions.mysteryBox.x, this.interactions.mysteryBox.y, 170);

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
