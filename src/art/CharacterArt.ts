import type Phaser from "phaser";
import type { FacingDirection } from "../types/game";
import { FACINGS, facingVector } from "./directions";
import { CHARACTER_PALETTE } from "./ArtManifest";

/**
 * Original soft-edged arcade character art. The design is composed on a
 * 32×32 logical grid and rasterized at 2× (64×64), then displayed at 1.5×.
 * On-screen size stays 96×96, matching the former 32px sprites at 3×.
 *
 * This is intentionally NOT a smooth vector game: rounded silhouettes,
 * layered 2–4px clusters and selective highlights retain pixel-art texture
 * without large, square Minecraft-like heads and box-shaped limbs.
 */
export type CharacterKind = "player" | "zombie";
export type CharacterAction =
  | "idle" | "walk" | "shoot" | "melee" | "reload"
  | "attack" | "hurt" | "death";

export const CHARACTER_LOGICAL_SIZE = 32;
export const CHARACTER_W = 64;
export const CHARACTER_H = 64;
export const CHARACTER_FEET_Y = 56;
export const CHARACTER_SCALE = 1.5;
export const CHARACTER_DISPLAY_SIZE = CHARACTER_W * CHARACTER_SCALE;

export const CHARACTER_FRAME_COUNTS: Record<
  CharacterKind, Partial<Record<CharacterAction, number>>
> = {
  player: { idle: 2, walk: 4, shoot: 2, melee: 2, reload: 2, hurt: 1, death: 3 },
  zombie: { idle: 2, walk: 4, attack: 2, hurt: 1, death: 3 },
};

export function characterTexture(
  kind: CharacterKind, facing: FacingDirection,
  action: CharacterAction, frame = 0,
): string {
  const count = CHARACTER_FRAME_COUNTS[kind][action] ?? 1;
  return `character-${kind}-${facing}-${action}-${frame % count}`;
}
export function characterFrameCount(
  kind: CharacterKind, action: CharacterAction,
): number {
  return CHARACTER_FRAME_COUNTS[kind][action] ?? 1;
}

type Brush = CanvasRenderingContext2D;
interface Palette {
  ink: string; skin: string; skinLight: string; skinDark: string;
  shirt: string; shirtLight: string; shirtShade: string;
  trousers: string; trouserLight: string; boots: string;
  hat: string; hatLight: string; hatShade: string;
  eye: string; wound: string; metal: string;
}
const PLAYER: Palette = CHARACTER_PALETTE.survivor;
const ZOMBIE: Palette = CHARACTER_PALETTE.zombie;

function ellipse(
  c: Brush, x: number, y: number, rx: number, ry: number,
  fill: string, stroke?: string, lineWidth = 1.5,
  rotate = 0,
): void {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rotate, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.lineWidth = lineWidth; c.strokeStyle = stroke; c.stroke();
  }
}
function blob(
  c: Brush, points: ReadonlyArray<readonly [number, number]>,
  fill: string, stroke?: string, lineWidth = 1.5,
): void {
  if (points.length < 2) return;
  c.beginPath();
  c.moveTo(points[0]![0], points[0]![1]);
  for (let i = 1; i < points.length; i += 1) {
    c.lineTo(points[i]![0], points[i]![1]);
  }
  c.closePath();
  c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(); }
}
function curve(
  c: Brush, from: readonly [number, number],
  via: readonly [number, number], to: readonly [number, number],
  width: number, color: string, outline?: string,
): void {
  const stroke = (paint: string, size: number): void => {
    c.beginPath();
    c.moveTo(...from);
    c.quadraticCurveTo(...via, ...to);
    c.strokeStyle = paint; c.lineWidth = size; c.stroke();
  };
  if (outline) stroke(outline, width + 2.4);
  stroke(color, width);
}
function dash(
  c: Brush, color: string, x: number, y: number,
  w: number, h: number,
): void {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), w, h);
}
function rounded(
  c: Brush, x: number, y: number, w: number, h: number,
  radius: number, fill: string, stroke?: string, lineWidth = 1.5,
): void {
  const r = Math.min(radius, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
  c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(); }
}

/** All frames are cached in the game's TextureManager, not rebuilt per tick. */
export function ensureCharacterArt(scene: Phaser.Scene): void {
  if (scene.textures.exists(characterTexture("player", "s", "idle"))) return;
  for (const kind of ["player", "zombie"] as const) {
    for (const facing of FACINGS) {
      for (const action of Object.keys(CHARACTER_FRAME_COUNTS[kind]) as CharacterAction[]) {
        const count = characterFrameCount(kind, action);
        for (let frame = 0; frame < count; frame += 1) {
          const canvas = document.createElement("canvas");
          canvas.width = CHARACTER_W;
          canvas.height = CHARACTER_H;
          const c = canvas.getContext("2d", { alpha: true });
          if (!c) throw new Error("Character art requires Canvas 2D.");
          c.lineCap = "round";
          c.lineJoin = "round";
          paintCharacter(c, kind, facing, action, frame);
          scene.textures.addCanvas(
            characterTexture(kind, facing, action, frame), canvas,
          );
        }
      }
    }
  }
}

/** View-facing variation is structural: eyes, helmet, head and weapon move. */
function paintCharacter(
  c: Brush, kind: CharacterKind, facing: FacingDirection,
  action: CharacterAction, frame: number,
): void {
  const p = kind === "player" ? PLAYER : ZOMBIE;
  const [vx, vy] = facingVector(facing);
  const back = vy < 0;
  const side = vy === 0 && vx !== 0;
  const lateral = vx === 0 ? 0 : Math.sign(vx);
  const step = action === "walk" ? [0, 3.2, 0, -3.2][frame % 4]! : 0;
  const bob = action === "walk" ? (frame % 2) * 1.1
    : action === "idle" ? frame * 0.65 : 0;
  const headLean = (kind === "zombie" ? -2.5 : 0) + lateral * 1.7;
  const attacking = action === "attack" || action === "melee";
  const actionReach = attacking ? (frame === 0 ? 3 : 8) : 0;
  const recoil = action === "shoot" && frame === 0 ? 3 : 0;
  const hurt = action === "hurt";
  const chestY = 34 + bob;

  // Every frame uses a soft grounded shadow. The foot position is y=56.
  ellipse(c, 32, 56.5, 19, 3.9, "rgba(8,17,18,.30)");

  if (action === "death" && frame >= 1) {
    paintCorpse(c, p, kind, lateral, frame);
    return;
  }

  // Animated bent legs and individually articulated rounded boots.
  const legA = step, legB = -step;
  curve(c, [26, 43 + bob], [24, 49 + bob], [24 - step * .5, 52 + legA],
    7.6, p.trousers, p.ink);
  curve(c, [37, 43 + bob], [40, 48 + bob], [40 + step * .5, 52 + legB],
    8.2, p.trousers, p.ink);
  curve(c, [25, 46 + bob], [24, 50 + bob], [24 - step * .5, 53 + legA],
    2.4, p.trouserLight);
  curve(c, [39, 46 + bob], [40, 49 + bob], [40 + step * .5, 52 + legB],
    2, p.trouserLight);
  ellipse(c, 22 - step * .5, 54 + legA, 7.1, 3.4, p.boots, p.ink, 1.7, -.13);
  ellipse(c, 41 + step * .5, 54 + legB, 7.3, 3.5, p.boots, p.ink, 1.7, .10);
  dash(c, p.trouserLight, 18 - step * .5, 52.6 + legA, 4, 1);
  dash(c, p.trouserLight, 38 + step * .5, 52.6 + legB, 4, 1);

  // Far-side arm is behind the vest and head, for a three-quarter depth cue.
  const farArmEnd: readonly [number, number] =
    kind === "zombie"
      ? [13 - actionReach - step * .3, 41 + bob]
      : [17 - step * .23, 42 + bob];
  curve(c, [20, chestY], [12, 36 + bob], farArmEnd,
    kind === "zombie" ? 8.6 : 8.2, p.shirtShade, p.ink);
  if (kind === "zombie") {
    ellipse(c, farArmEnd[0] - 2, farArmEnd[1], 5.5, 4.2,
      p.skinDark, p.ink, 1.4, -.25);
    dash(c, p.skinLight, farArmEnd[0] - 4, farArmEnd[1] - 2, 4, 2);
  }

  // Rounded and shaded short torso, unlike the old flat rectangular jacket.
  c.beginPath();
  c.moveTo(21, chestY - 3);
  c.bezierCurveTo(14, chestY - 1, 15.4, chestY + 9, 20, chestY + 12);
  c.quadraticCurveTo(32, chestY + 14, 43, chestY + 11);
  c.bezierCurveTo(48, chestY + 3, 48, chestY - 1, 41, chestY - 3);
  c.quadraticCurveTo(32, chestY - 7, 21, chestY - 3);
  c.closePath();
  c.fillStyle = p.shirt; c.fill();
  c.strokeStyle = p.ink; c.lineWidth = 2.2; c.stroke();
  ellipse(c, back ? 28 : 39, chestY + 2, 6, 8, p.shirtLight);
  ellipse(c, 24, chestY + 7, 4.6, 5.5, p.shirtShade);

  if (kind === "player") {
    rounded(c, 24, chestY + 2, 17, 9.5, 2.5, "#344940", p.ink, 1.3);
    rounded(c, 26, chestY + 4, 6, 5, 1, "#738568", p.ink, 1);
    rounded(c, 34, chestY + 4, 5, 5, 1, "#68785e", p.ink, 1);
    dash(c, "#d8bc77", 29, chestY + 9, 4, 1.6);
    curve(c, [21, chestY - 3], [34, chestY + 5],
      [43, chestY + 10], 1.8, "#b0a67b");
  } else {
    // Frayed white shirt and organic, asymmetrical wounds.
    blob(c, [[20, chestY + 6], [24, chestY + 8],
      [23, chestY + 13], [17, chestY + 11]], "#a39d91");
    blob(c, [[37, chestY + 2], [41, chestY + 1],
      [43, chestY + 7], [38, chestY + 9], [36, chestY + 5]], p.wound);
    dash(c, "#dfbd9c", 40, chestY + 4, 2, 2);
    curve(c, [23, chestY + 12], [28, chestY + 16],
      [35, chestY + 12], 2.2, "#656c66");
    dash(c, "#b6b7a3", 21, chestY + 4, 3, 1);
  }
  // High contrast waist/belt separates upper body from short legs.
  curve(c, [22, chestY + 12], [33, chestY + 14],
    [42, chestY + 11], 3, p.ink);

  const neckX = 32 + headLean;
  const neckY = 27 + bob;
  ellipse(c, neckX, neckY + 3, 7, 6, p.skinDark, p.ink, 1.5);

  // Oversized *contoured* head. The irregular bezier silhouette and
  // non-square cheeks match the approved softer arcade screenshot.
  const hx = 31 + headLean;
  const hy = (kind === "zombie" ? 17.9 : 17.5) + bob;
  c.save();
  c.translate(hx, hy);
  c.rotate(kind === "zombie" ? -.055 + lateral * .075 : lateral * .04);
  // Original three-quarter adventure proportion: a large but no longer
  // oversized face. Frame, feet and Stage 2 damage geometry stay unchanged.
  c.scale(.86, .86);
  c.beginPath();
  c.moveTo(-12, -5);
  c.bezierCurveTo(-15, -14, 6, -16, 13, -7);
  c.quadraticCurveTo(17, -1, 13, 8);
  c.quadraticCurveTo(8, 15, -3, 13);
  c.bezierCurveTo(-13, 12, -17, 1, -12, -5);
  c.closePath();
  c.fillStyle = p.skinDark; c.fill();
  c.lineWidth = 2.1; c.strokeStyle = p.ink; c.stroke();
  ellipse(c, -1.1, 1.9, 11.4, 10.7, p.skin);
  ellipse(c, back ? -5 : 5, -1.2, 5.1, 7.3,
    back ? p.skinDark : p.skinLight);
  if (!back) {
    // Rounded ear/cheek adds dimension. Rear views omit facial features.
    ellipse(c, lateral > 0 ? -12 : 12, 3, 2.7, 4.1, p.skinDark, p.ink, 1.2);
  }

  if (kind === "player") paintHelmet(c, p, back, side, lateral);
  else paintZombieScalp(c, p, back, lateral);

  if (!back) {
    if (side) {
      const x = lateral > 0 ? 5.5 : -6.0;
      ellipse(c, x, kind === "player" ? 1.65 : -0.4,
        2.4, 2.5, p.eye, p.ink, .7);
      if (kind === "zombie") ellipse(c, x + lateral * .3, -1, 1.3, 1.5, "#f5e9af");
      curve(c, [x - lateral * 2, kind === "player" ? -1 : -4],
        [x, kind === "player" ? -2 : -5.5],
        [x + lateral * 2.5, kind === "player" ? -.8 : -3.8], 1.3,
        kind === "zombie" ? p.skinDark : "#5f493d");
      if (kind === "zombie") {
        ellipse(c, x + lateral * .9, 7.1, 5.8, 3.7, "#2b2227", p.ink, 1);
        dash(c, "#f0e9cf", x - 1.5, 5.9, 2.4, 1.6);
        dash(c, p.wound, x + lateral * 2, 8.6, 3.1, 2);
      } else {
        curve(c, [x - lateral * 2, 7], [x, 7.8],
          [x + lateral * 3, 6.5], 1, "#754c3f");
        ellipse(c, x + lateral * 3, 4, 1.9, 1.5, p.skinLight);
      }
    } else {
      const farEyeScale = lateral === 0 ? 1 : .78;
      ellipse(c, -5 + lateral * 1.6, kind === "player" ? 1.8 : -1.2,
        2 * farEyeScale, 2.25, p.eye, p.ink, .65);
      ellipse(c, 4.6 + lateral * 1.8, kind === "player" ? 2 : -.8,
        2.25, 2.25,
        p.eye, p.ink, .65);
      if (kind === "zombie") {
        ellipse(c, -5 + lateral * 1.6, -1.9, 1, 1, "#fce8a3");
        ellipse(c, 4.6 + lateral * 1.8, -1.6, 1, 1, "#fce8a3");
        ellipse(c, 0.6, 7.1, 7.2, 4.8, "#282128", p.ink, 1.2);
        dash(c, "#f2ebcf", -4, 4.7, 3, 2);
        dash(c, "#f2ebcf", 1, 4.5, 3, 1.6);
        ellipse(c, 1, 9, 3.3, 1.4, "#a73739");
        dash(c, p.wound, -10, 7, 4, 2.2);
      } else {
        curve(c, [-8 + lateral, -.5], [-5 + lateral, -1.9],
          [-2 + lateral, -.4], 1.3, "#655144");
        curve(c, [2 + lateral, -.3], [4.6 + lateral, -1.4],
          [7 + lateral, .2], 1.2, "#655144");
        blob(c, [[-.8, 3.4], [1.1, 3.4], [2, 5.7], [-1, 5.7]],
          p.skinDark);
        curve(c, [-2.3, 7.5], [.4, 8.1], [3.6, 7.1],
          1, "#845443");
      }
    }
    if (hurt) {
      dash(c, p.wound, -9, 8, 4, 2);
      dash(c, "#f0ceb2", 5, 6, 3, 1);
    }
  } else {
    // Distinct back of helmet/hair; no floating frontal face when aiming away.
    ellipse(c, 0, 3, 8, 6, p.hatShade);
    curve(c, [-7, 4], [0, 11], [7, 4], 2, p.hatLight);
  }
  c.restore();

  // Near-side sleeve and organically jointed hand; different attack poses.
  const nearEnd: readonly [number, number] = kind === "zombie"
    ? [46 + actionReach + step * .2, 40 - actionReach * .36]
    : [42 + recoil, 41 - (action === "reload" ? -3 : 0)];
  curve(c, [42, chestY - 2], [50, 35 + bob],
    [nearEnd[0] - 2, nearEnd[1] - 2], 9, p.shirt, p.ink);
  curve(c, [44, chestY], [49, 35 + bob],
    [nearEnd[0] - 1, nearEnd[1] - 4], 2.5, p.shirtLight);
  ellipse(c, nearEnd[0], nearEnd[1], kind === "zombie" ? 5.5 : 4.2,
    4.2, kind === "zombie" ? p.skin : p.skinDark, p.ink, 1.4, -.25);
  if (kind === "zombie") {
    const claw = action === "attack" ? 2.8 : 1.7;
    for (let i = -1; i <= 1; i += 1) {
      curve(c,
        [nearEnd[0] + 1.6, nearEnd[1] + i * 1.5],
        [nearEnd[0] + 4.6, nearEnd[1] + i * 2.1 - 1],
        [nearEnd[0] + 4.2 + claw, nearEnd[1] + i * 3.3 - 1],
        1.45, p.skinLight, p.ink);
    }
  } else {
    // Gun drawn as a detailed dark metal silhouette, not a long solid bar.
    paintGun(c, facing, action, frame, p);
  }
  // Tiny deliberately blocky highlight clusters preserve pixel-art texture.
  dash(c, p.shirtLight, 22, chestY - 1, 3, 1.2);
  dash(c, p.trouserLight, 35, 50 + bob, 2.4, 1.4);
}

function paintHelmet(
  c: Brush, p: Palette, back: boolean, side: boolean, lateral: number,
): void {
  c.beginPath();
  c.moveTo(-13.8, -5.4);
  c.bezierCurveTo(-12, -17, 7, -18, 13.4, -7);
  c.quadraticCurveTo(15, -1, 12, 1.3);
  c.quadraticCurveTo(-1, -1, -13, 1);
  c.closePath();
  c.fillStyle = p.hat; c.fill();
  c.strokeStyle = p.ink; c.lineWidth = 2.1; c.stroke();
  ellipse(c, -2.8, -9.3, 7.1, 2.7, p.hatLight, undefined, 0, -.08);
  curve(c, [-12, -2], [-2, -.9], [12, -2.3],
    3.5, p.hatShade, p.ink);
  if (!back) {
    // Long rounded helmet brim over the face, with separated ear guards.
    curve(c, [-12, -3.2], [1, -1.2],
      [13.5 + lateral, -3.4], 3.7, p.hat, p.ink);
    ellipse(c, side && lateral > 0 ? -10.8 : 10.8,
      3, 2.4, 4.6, p.hatShade, p.ink, 1.1);
    dash(c, "#d7b37b", -8, -4.6, 2, 1.3);
    dash(c, "#8d9b6e", 5, -9.6, 2.2, 1.2);
  } else {
    curve(c, [-10.3, 0], [0, 3], [10, 0],
      3, p.hatShade, p.ink);
    dash(c, "#b3b17d", -2, -12, 3, 1.6);
  }
}

function paintZombieScalp(
  c: Brush, p: Palette, back: boolean, lateral: number,
): void {
  // Bald, broad uneven scalp rather than spiky hair: closer to the
  // approved reference's round green-faced cartoon zombies.
  c.beginPath();
  c.moveTo(-12.5, -5);
  c.bezierCurveTo(-13.5, -12.1, -8.2, -14.8, -.8, -14.4);
  c.bezierCurveTo(7, -15.2, 13.7, -10.5, 13.4, -3.1);
  c.quadraticCurveTo(8, -4.9, 3.1, -4.7);
  c.quadraticCurveTo(-4, -5.2, -12.5, -5);
  c.closePath();
  c.fillStyle = p.skinDark;
  c.fill();
  c.strokeStyle = p.ink; c.lineWidth = 1.35; c.stroke();
  ellipse(c, -2.1, -9, 8.3, 3.8, p.hat, undefined, 0, -.12);
  ellipse(c, 4.2, -12, 3.5, 1.2, p.skinLight);
  blob(c, [[-10, -10], [-8, -12], [-4, -11],
    [-3, -8], [-7, -7]], p.hatShade);
  if (!back) {
    ellipse(c, -9, 4, 2.2, 3, p.wound, undefined, 0, -.2);
    curve(c, [3, -10], [6 + lateral, -6], [9, -4],
      1.2, p.skinDark);
    dash(c, "#bdc598", -5, -9, 3, 1);
    dash(c, "#657248", 7, -7, 2, 2);
  }
}

function paintGun(
  c: Brush, facing: FacingDirection,
  action: CharacterAction, frame: number,
  p: Palette,
): void {
  const [vx, vy] = facingVector(facing);
  const length = Math.hypot(vx, vy) || 1;
  const dx = vx / length;
  const dy = vy / length;
  // Weapon sits in front of the character's chest, angled by facing.
  const sx = 31, sy = 39;
  const reach = action === "melee" ? 27 : 21;
  const recoil = action === "shoot" && frame === 0 ? 2.5 : 0;
  const vertical = action === "reload" ? 5 : 0;
  const ex = sx + dx * (reach - recoil);
  const ey = sy + dy * (reach - recoil) * .71 + vertical;
  curve(c, [sx - dx * 4, sy - dy * 4],
    [sx + dx * 7, sy + dy * 7],
    [ex, ey], 7.4, "#1e2729", p.ink);
  curve(c, [sx + dx * 3, sy + dy * 3 - 1],
    [sx + dx * 10, sy + dy * 9 - 1],
    [ex - dx * 3, ey - dy * 2],
    2.3, p.metal);
  const nx = -dy, ny = dx;
  blob(c, [
    [sx - dx * 6 + nx * 2, sy - dy * 4 + ny * 2],
    [sx + nx * 6, sy + ny * 6],
    [sx + dx * 7 + nx * 6, sy + dy * 6 + ny * 6],
    [sx + dx * 7 - nx * 3, sy + dy * 6 - ny * 3],
  ], "#31383a", p.ink, 1.2);
  curve(c, [sx + dx * 3, sy + dy * 3 + 2],
    [sx - dx * 2 + nx * 4, sy + ny * 5],
    [sx + nx * 5, sy + ny * 8],
    2.5, "#2e3737", p.ink);
  ellipse(c, sx + nx * 3, sy + ny * 3, 3.4, 2.4, p.skin, p.ink, 1);
  if (action === "shoot" && frame === 0) {
    ellipse(c, ex + dx * 4, ey + dy * 4, 4.9, 3.4, "#ffc855");
    ellipse(c, ex + dx * 5.4, ey + dy * 4.8,
      2.2, 1.9, "#fff3ac");
  }
  if (action === "melee") {
    curve(c,
      [ex - dy * 7, ey + dx * 7],
      [ex + dx * 8, ey + dy * 5],
      [ex + dy * 7, ey - dx * 7],
      2.8, "#f5dfb2");
  }
  if (action === "reload") dash(c, "#d4bb7e", sx - 4, sy + 9 + frame, 3, 5);
}

function paintCorpse(
  c: Brush, p: Palette, kind: CharacterKind,
  lateral: number, frame: number,
): void {
  c.save();
  c.translate(31, 53);
  c.rotate((lateral === 0 ? 1 : lateral) * (frame === 1 ? .15 : .25));
  ellipse(c, -6, 0, 19, 5, "rgba(5,15,14,.25)");
  curve(c, [-20, 1], [-9, 0], [11, -4], 9, p.trousers, p.ink);
  ellipse(c, -23, 2, 6.5, 3.8, p.boots, p.ink);
  ellipse(c, -9, -6, 13, 5.5, p.shirt, p.ink, 1.6, -.12);
  curve(c, [-5, -9], [5, -12], [18, -9], 6.4, p.shirtShade, p.ink);
  ellipse(c, 19, -9, 10.3, 7.5, p.skin, p.ink, 2);
  ellipse(c, 20, -15, 9.7, 4.3,
    kind === "player" ? p.hat : p.hatShade, p.ink, 1.2);
  if (kind === "zombie") {
    ellipse(c, 24, -7, 2.6, 2, "#61262a");
    dash(c, "#efeac1", 25, -8, 3, 1.4);
  }
  c.restore();
}
