import Phaser from "phaser";
import {
  CABIN_PALETTE, ENV_TEXTURES, ensureEnvironmentArt,
} from "../art/EnvironmentArt";
import type { Segment } from "../utils/geometry";
import { WORLD_DEPTH, tallPropDepth } from "../art/worldLayers";
import {
  DEFAULT_ARENA_DIMENSIONS, cabinVertices, cabinHalfWidthAtY,
  windowEdgeRatio, windowGapFractions,
  type ArenaDimensions,
} from "./arenaGeometry";

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
type ArenaOptions = ArenaDimensions;
const DEFAULT_OPTIONS = DEFAULT_ARENA_DIMENSIONS;

/**
 * Original angled-adventure cabin with a wide, shallow-taper cutaway.
 * Window visuals, collision segments, and player bounds share one polygon.
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
  private readonly wallGraphics: Phaser.GameObjects.Graphics;
  private readonly frontWallGraphics: Phaser.GameObjects.Graphics;
  private readonly windowBackdrop: Phaser.GameObjects.Graphics;
  private readonly exterior: Phaser.GameObjects.Graphics;
  private readonly illumination: Phaser.GameObjects.Graphics;
  private readonly props: Phaser.GameObjects.GameObject[] = [];
  private readonly vertices: readonly Phaser.Math.Vector2[];
  private readonly dimensions: ArenaDimensions;

  constructor(
    private readonly scene: Phaser.Scene,
    options: Partial<ArenaOptions> = {},
  ) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    ensureEnvironmentArt(scene);

    this.dimensions = config;
    this.center = new Phaser.Math.Vector2(config.centerX, config.centerY);
    this.halfWidth = config.halfWidth;
    this.halfHeight = config.halfHeight;
    this.vertices = cabinVertices(config).map(p => new Phaser.Math.Vector2(p.x,p.y));
    this.windows = this.createWindows();
    this.wallSegments = this.createWallSegments();
    this.interactions = this.createInteractionLayout();

    this.exterior = scene.add.graphics().setDepth(WORLD_DEPTH.exterior);
    this.graphics = scene.add.graphics().setDepth(WORLD_DEPTH.floor);
    this.wallGraphics = scene.add.graphics().setDepth(WORLD_DEPTH.rearWall);
    this.frontWallGraphics = scene.add.graphics().setDepth(WORLD_DEPTH.foregroundWall);
    this.windowBackdrop = scene.add.graphics().setDepth(WORLD_DEPTH.windowBackdrop);
    this.illumination = scene.add.graphics().setDepth(WORLD_DEPTH.groundLight);

    this.drawExterior();
    this.drawFloor();
    this.drawWalls();
    this.placeScenery();
  }

  get spawnPoint(): Phaser.Math.Vector2 {
    return this.center.clone();
  }
  getCameraBounds(margin = 120): Phaser.Geom.Rectangle {
    const top = this.vertices[0]!;
    const bottom = this.vertices[2]!;
    return new Phaser.Geom.Rectangle(
      this.center.x - this.halfWidth - margin,
      top.y - margin,
      this.halfWidth * 2 + margin * 2,
      bottom.y - top.y + margin * 2,
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
    return cabinHalfWidthAtY(y,this.dimensions);
  }
  
  destroy(): void {
    for (const prop of this.props) prop.destroy();
    this.props.length = 0;
    this.exterior.destroy();
    this.illumination.destroy();
    this.graphics.destroy();
    this.wallGraphics.destroy();
    this.frontWallGraphics.destroy();
    this.windowBackdrop.destroy();
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
    const edgeIndex = {
      "north-east": 0, "south-east": 1,
      "south-west": 2, "north-west": 3,
    } as const;
    const t = windowEdgeRatio(edgeIndex[id]);
    const center = Phaser.Math.LinearXY(start, end, t);
    const outward = center.clone().subtract(this.center).normalize();
    return {
      id, center,
      outsideSpawn: center.clone().add(outward.scale(90)),
    };
  }
  private createWallSegments(): readonly Segment[] {
    const [topLeft, topRight, bottomRight, bottomLeft] = this.vertices;
    if (!topLeft || !topRight || !bottomRight || !bottomLeft) {
      throw Error("Missing cabin corners.");
    }
    return [
      ...this.splitWall(topLeft, topRight, 0),
      ...this.splitWall(topRight, bottomRight, 1),
      ...this.splitWall(bottomRight, bottomLeft, 2),
      ...this.splitWall(bottomLeft, topLeft, 3),
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
      mysteryBox: new Phaser.Math.Vector2(
        this.center.x + this.halfWidth * .29,
        this.center.y - this.halfHeight * .38,
      ),
    };
  }
  private splitWall(
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    edgeIndex: number,
  ): readonly [Segment, Segment] {
    const length = Phaser.Math.Distance.Between(start.x,start.y,end.x,end.y);
    const [low, high] = windowGapFractions(
      length, edgeIndex, this.dimensions.windowOpeningWidth,
    );
    return [
      { start: start.clone(), end: Phaser.Math.LinearXY(start, end, low) },
      { start: Phaser.Math.LinearXY(start, end, high), end: end.clone() },
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
    g.fillStyle(CABIN_PALETTE.plank, 1);
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
      const shade = row % 3 === 0 ? CABIN_PALETTE.plankLight
        : row % 3 === 1 ? CABIN_PALETTE.plank
        : CABIN_PALETTE.plankDark;
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

    g.lineStyle(22, CABIN_PALETTE.woodShadow, 1);
    g.strokePoints([...this.vertices], true, true);
    g.lineStyle(6, CABIN_PALETTE.woodEdge, 1);
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


  /** Render solid wall pieces on BOTH sides of the genuine physics gap. */
  private drawWalls(): void {
    const [tl,tr,br,bl]=this.vertices;
    if(!tl||!tr||!br||!bl)return;
    const edges:readonly (readonly [
      Phaser.Math.Vector2,Phaser.Math.Vector2
    ])[]=[[tl,tr],[tr,br],[br,bl],[bl,tl]];
    edges.forEach(([a,b],index)=>{
      const back=index!==2;
      const rise=index===0?88:back?92:22;
      const g=back?this.wallGraphics:this.frontWallGraphics;
      const wallColor=index===0?0x63412f:index===1?0x55372c:
        index===3?0x73432d:0x3e302c;
      const length=Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);
      const [low,high]=windowGapFractions(
        length,index,this.dimensions.windowOpeningWidth,
      );
      const leftEnd=Phaser.Math.LinearXY(a,b,low);
      const rightStart=Phaser.Math.LinearXY(a,b,high);
      for(const [from,to] of [[a,leftEnd],[rightStart,b]] as const){
        g.fillStyle(wallColor,1);
        g.fillPoints([
          from.clone(),to.clone(),
          new Phaser.Math.Vector2(to.x,to.y-rise),
          new Phaser.Math.Vector2(from.x,from.y-rise),
        ],true);
        g.lineStyle(back?12:8,CABIN_PALETTE.woodShadow,1);
        g.lineBetween(from.x,from.y-rise,to.x,to.y-rise);
        g.lineStyle(3,CABIN_PALETTE.woodEdge,.9);
        g.lineBetween(from.x,from.y-rise+4,to.x,to.y-rise+4);
      }
      for(let distance=35;distance<length-25;distance+=54){
        const fraction=distance/length;
        if(fraction>=low-.015&&fraction<=high+.015)continue;
        const at=Phaser.Math.LinearXY(a,b,fraction);
        g.lineStyle(2,0x362521,.74);
        g.lineBetween(at.x,at.y-rise+10,at.x,at.y-4);
        g.lineStyle(1,0xa16a40,.6);
        g.lineBetween(at.x+4,at.y-rise+10,at.x+4,at.y-6);
      }
      this.drawWindow(g,this.windows[index]!,a,b,back);
    });
  }

  private drawWindow(
    g: Phaser.GameObjects.Graphics,
    window: ArenaWindow,
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    back: boolean,
  ): void {
    const tangent = end.clone().subtract(start).normalize();
    const raise = back ? 56 : 31;
    const a = window.center.clone().add(tangent.clone().scale(-57));
    const b = window.center.clone().add(tangent.clone().scale(57));
    const au = a.clone().add(new Phaser.Math.Vector2(0, -raise));
    const bu = b.clone().add(new Phaser.Math.Vector2(0, -raise));
    // Night color belongs BEHIND the entering zombie. Only the wooden
    // frame/boards stay on the upper wall layer, so the opening is real.
    const glass=this.windowBackdrop;
    glass.fillStyle(CABIN_PALETTE.night,1);
    glass.fillPoints([a,b,bu,au],true);
    glass.fillStyle(CABIN_PALETTE.nightBlue,.52);
    glass.fillPoints([
      a.clone().add(tangent.clone().scale(6)),
      b.clone().add(tangent.clone().scale(-6)),
      bu.clone().add(tangent.clone().scale(-6)),
      au.clone().add(tangent.clone().scale(6)),
    ],true);
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

  /** Flat art never y-sorts. Only tall scenery may overlap actors. */
  private prop(
    texture: string, x: number, y: number,
    scale: number, offset = 0,
  ): Phaser.GameObjects.Image {
    const image = this.scene.add.image(x, y, texture)
      .setOrigin(.5, 1).setScale(scale);
    const flat = texture === ENV_TEXTURES.rug ||
      texture === ENV_TEXTURES.paper || texture === ENV_TEXTURES.debris;
    const depth = flat ? WORLD_DEPTH.groundDecal
      : texture === ENV_TEXTURES.sign ? WORLD_DEPTH.wallDecal
      : tallPropDepth(y) + offset * .001;
    image.setDepth(depth);
    this.props.push(image);
    return image;
  }

  /** QA introspection; no gameplay logic depends on this representation. */
  getRenderState():{
    halfWidth:number; halfHeight:number; rearWidthRatio:number;
    polygon:readonly {x:number;y:number}[];
    windowOpeningWidth:number;
    props:readonly {texture:string;depth:number;footY:number}[];
    windowBackdropDepth:number; rearWallDepth:number; foregroundWallDepth:number;
  }{
    return {
      halfWidth:this.halfWidth,halfHeight:this.halfHeight,
      rearWidthRatio:this.dimensions.rearWidthRatio,
      polygon:this.vertices.map(p=>({x:p.x,y:p.y})),
      windowOpeningWidth:this.dimensions.windowOpeningWidth,
      windowBackdropDepth:this.windowBackdrop.depth,
      rearWallDepth:this.wallGraphics.depth,
      foregroundWallDepth:this.frontWallGraphics.depth,
      props:this.props.filter(
        (p): p is Phaser.GameObjects.Image => p instanceof Phaser.GameObjects.Image,
      ).map(p=>({texture:p.texture.key,depth:p.depth,footY:p.y})),
    };
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
    // Preserve purposeful relative scenery composition as the room grows.
    const sx = this.halfWidth / 730;
    const sy = this.halfHeight / 330;
    this.prop(ENV_TEXTURES.rug, x + 278 * sx, y + 218 * sy, 2.0);
    this.prop(ENV_TEXTURES.shelf, x + 320 * sx, y - 148 * sy, 1.28);
    this.prop(ENV_TEXTURES.barrel, x - 355 * sx, y - 115 * sy, 1.33);
    this.prop(ENV_TEXTURES.lantern, x - 355 * sx, y - 161 * sy, 1.65, 2);
    this.glow(x - 355 * sx, y - 180 * sy, 140);
    this.prop(ENV_TEXTURES.crate, x - 330 * sx, y + 229 * sy, 1.3);
    this.prop(ENV_TEXTURES.crate, x - 384 * sx, y + 196 * sy, 1.0);
    this.prop(ENV_TEXTURES.crate, x + 412 * sx, y + 165 * sy, 1.33);
    this.prop(ENV_TEXTURES.lantern, x + 438 * sx, y + 119 * sy, 1.5, 3);
    this.glow(x + 438 * sx, y + 124 * sy, 132);
    this.glow(this.interactions.mysteryBox.x, this.interactions.mysteryBox.y, 150);
    this.prop(ENV_TEXTURES.crate, x - 477 * sx, y + 212 * sy, 1.15);
    this.prop(ENV_TEXTURES.crate, x + 510 * sx, y + 158 * sy, 1.15);
    this.prop(ENV_TEXTURES.paper, x - 260 * sx, y + 143 * sy, 1.18).setAngle(-12);
    this.prop(ENV_TEXTURES.paper, x + 95 * sx, y + 212 * sy, .86).setAngle(24);

    // Distinct rooms areas stay populated; ground clutter remains below actors.
    this.prop(ENV_TEXTURES.crate, x - 530 * sx, y - 30 * sy, .85);
    this.prop(ENV_TEXTURES.barrel, x + 550 * sx, y - 68 * sy, 1.05);
    this.prop(ENV_TEXTURES.paper, x - 65 * sx, y + 110 * sy, .78).setAngle(11);
    this.prop(ENV_TEXTURES.sign, x + 484 * sx, y + 61 * sy, 1.0);
    const sign = this.scene.add.text(
      x + 484 * sx, y + 8 * sy, "HOLD\nTHE\nLINE!", {
        align: "center",
        fontFamily: "monospace", fontStyle: "bold",
        fontSize: "11px", color: "#5d322b",
      },
    ).setOrigin(.5).setDepth(8 + (y + 61 * sy) / 100 + .2);
    this.props.push(sign);

    for (const [dx, dy, scale] of [
      [-450, -48, .7], [-279, 124, .92], [420, -50, .74],
      [-210, -172, .76], [328, 192, .58],
    ] as const) {
      this.prop(ENV_TEXTURES.debris, x + dx * sx, y + dy * sy, scale);
    }
  }
}
