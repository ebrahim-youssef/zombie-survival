import Phaser from "phaser";
import type { FacingDirection } from "../types/game";
import { FACINGS, facingVector } from "./directions";

/**
 * Original 32 × 32 arcade character art. All action/direction frames are
 * generated once, with pixel-snapped shapes. No licensed game assets.
 * Characters are displayed at 2× with a separate feet-centred hit circle.
 */
export type CharacterKind = "player" | "zombie";
export type CharacterAction =
  | "idle" | "walk" | "shoot" | "melee" | "reload"
  | "attack" | "hurt" | "death";
export const CHARACTER_W = 32;
export const CHARACTER_H = 32;
export const CHARACTER_FEET_Y = 28;
export const CHARACTER_SCALE = 3;
export const CHARACTER_FRAME_COUNTS: Record<
  CharacterKind,
  Partial<Record<CharacterAction, number>>
> = {
  player: { idle: 2, walk: 4, shoot: 2, melee: 2, reload: 2, hurt: 1, death: 3 },
  zombie: { idle: 2, walk: 4, attack: 2, hurt: 1, death: 3 },
};

interface Colors {
  outline: number;
  boot: number;
  trouser: number;
  trouserLight: number;
  sleeve: number;
  shirt: number;
  shirtLight: number;
  skin: number;
  skinShadow: number;
  hat: number;
  hatLight: number;
  eye: number;
  mouth: number;
  accent: number;
}
const COLORS: Record<CharacterKind, Colors> = {
  player: {
    outline: 0x171e22, boot: 0x21282b, trouser: 0x3e544b,
    trouserLight: 0x627363, sleeve: 0x344e48, shirt: 0x3c594e,
    shirtLight: 0x607768, skin: 0xe3af79, skinShadow: 0xb47d55,
    hat: 0x455844, hatLight: 0x81916b, eye: 0x161d1f,
    mouth: 0x67483a, accent: 0xd5ac5f,
  },
  zombie: {
    outline: 0x202a2a, boot: 0x283145, trouser: 0x3c5368,
    trouserLight: 0x627488, sleeve: 0x8e9a91, shirt: 0xb6bbac,
    shirtLight: 0xd3cfb5, skin: 0x8d9c63, skinShadow: 0x566d49,
    hat: 0x71824f, hatLight: 0xaab97a, eye: 0xeddf95,
    mouth: 0x7d2428, accent: 0xb0433a,
  },
};

export function characterTexture(
  kind: CharacterKind,
  facing: FacingDirection,
  action: CharacterAction,
  frame = 0,
): string {
  const count = CHARACTER_FRAME_COUNTS[kind][action] ?? 1;
  return `character-${kind}-${facing}-${action}-${frame % count}`;
}
export function characterFrameCount(
  kind: CharacterKind,
  action: CharacterAction,
): number {
  return CHARACTER_FRAME_COUNTS[kind][action] ?? 1;
}

export function ensureCharacterArt(scene: Phaser.Scene): void {
  if (scene.textures.exists(characterTexture("player", "s", "idle"))) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  for (const kind of ["player", "zombie"] as const) {
    for (const direction of FACINGS) {
      const actions = CHARACTER_FRAME_COUNTS[kind];
      for (const action of Object.keys(actions) as CharacterAction[]) {
        const count = actions[action] ?? 1;
        for (let frame = 0; frame < count; frame += 1) {
          g.clear();
          paintCharacter(g, COLORS[kind], kind, direction, action, frame);
          g.generateTexture(
            characterTexture(kind, direction, action, frame),
            CHARACTER_W,
            CHARACTER_H,
          );
        }
      }
    }
  }
  g.destroy();
}

function block(
  g: Phaser.GameObjects.Graphics, color: number,
  x: number, y: number, width: number, height: number,
): void {
  g.fillStyle(color, 1);
  g.fillRect(Math.round(x), Math.round(y), width, height);
}

function paintCharacter(
  g: Phaser.GameObjects.Graphics,
  p: Colors, kind: CharacterKind, direction: FacingDirection,
  action: CharacterAction, frame: number,
): void {
  const [vx, vy] = facingVector(direction);
  const right = vx > 0;
  const left = vx < 0;
  const rear = vy < 0;
  const side = vx !== 0 && vy === 0;
  const stride = action === "walk" ? [0, 2, 0, -2][frame % 4]! : 0;
  const bob = action === "idle" ? frame % 2 : action === "walk" ? (frame % 2) : 0;
  const hit = action === "hurt";
  const slump = action === "death" ? 2 : 0;

  g.fillStyle(0x0c141a, 0.28);
  g.fillEllipse(16, 28, 23, 5);

  if (action === "death" && frame >= 1) {
    block(g, p.outline, 2, 23, 28, 6);
    block(g, p.shirt, 5, 23, 13, 5);
    block(g, p.skinShadow, 19, 21, 10, 8);
    block(g, p.skin, 21, 22, 7, 5);
    block(g, p.hat, 20, 19, 9, 3);
    if (kind === "zombie") block(g, p.accent, 15, 27, 5, 2);
    return;
  }

  // Two separately articulated feet make the shamble readable at 32px.
  const leftLeg = stride;
  const rightLeg = -stride;
  block(g, p.outline, 8, 22 + leftLeg, 7, 7);
  block(g, p.outline, 18, 22 + rightLeg, 7, 7);
  block(g, p.trouser, 9, 22 + leftLeg, 5, 5);
  block(g, p.trouserLight, 10, 23 + leftLeg, 2, 3);
  block(g, p.trouser, 19, 22 + rightLeg, 5, 5);
  block(g, p.trouserLight, 20, 23 + rightLeg, 2, 3);
  block(g, p.boot, 7, 27 + leftLeg, 8, 3);
  block(g, p.boot, 18, 27 + rightLeg, 8, 3);

  // Silhouette: arms out from a short jacket and an oversized head.
  const reach = kind === "zombie" && action === "attack" ? 3 + frame * 2 : 0;
  block(g, p.outline, 3 - reach, 14 + bob + slump, 8, 9);
  block(g, p.sleeve, 4 - reach, 15 + bob + slump, 6, 7);
  block(g, p.outline, 22 + reach, 14 + bob + slump, 8, 9);
  block(g, p.sleeve, 23 + reach, 15 + bob + slump, 6, 7);
  if (kind === "zombie") {
    block(g, p.skin, 2 - reach, 19 + bob + slump, 4, 4);
    block(g, p.skin, 27 + reach, 19 + bob + slump, 4, 4);
  }

  block(g, p.outline, 8, 13 + bob + slump, 17, 12);
  block(g, p.shirt, 9, 14 + bob + slump, 15, 10);
  block(g, p.shirtLight, rear ? 10 : 18, 15 + bob + slump, 5, 7);
  block(g, p.outline, 10, 23 + bob + slump, 14, 2);

  if (kind === "player") {
    block(g, 0x273e37, 12, 15 + bob, 9, 7);
    block(g, 0x718877, 12, 16 + bob, 3, 4);
    block(g, p.accent, 15, 22 + bob, 3, 2);
  } else {
    block(g, p.accent, 18, 17 + bob, 4, 4);
    block(g, p.skinShadow, 10, 19 + bob, 2, 4);
    block(g, 0x616963, 21, 19 + bob, 3, 5);
  }

  const shift = side ? (right ? 2 : -2) : (right ? 1 : left ? -1 : 0);
  const hx = 8 + shift;
  const hy = 2 + bob + slump;

  // Large squarish head with readable three-quarter face/helmet.
  block(g, p.outline, hx - 1, hy + 2, 18, 13);
  block(g, p.skinShadow, hx, hy + 4, 16, 11);
  block(g, p.skin, hx + 2, hy + 5, 13, 9);
  block(g, p.hat, hx - 1, hy, 18, 6);
  block(g, p.hatLight, hx + 2, hy + 1, 11, 2);
  block(g, p.outline, hx - 2, hy + 5, 20, 2);

  if (rear) {
    block(g, p.hat, hx + 2, hy + 7, 13, 8);
    block(g, p.hatLight, hx + 4, hy + 8, 7, 2);
  } else if (side) {
    const eyeX = right ? hx + 12 : hx + 2;
    block(g, p.eye, eyeX, hy + 9, 2, 2);
    block(g, p.mouth, right ? hx + 12 : hx + 2, hy + 13, 4, 2);
    if (kind === "zombie") {
      block(g, 0x211918, right ? hx + 11 : hx + 1, hy + 11, 5, 4);
      block(g, p.accent, right ? hx + 12 : hx + 2, hy + 13, 4, 2);
    }
  } else {
    block(g, p.eye, hx + 4 + shift, hy + 9, 2, 2);
    block(g, p.eye, hx + 11 + shift, hy + 9, 2, 2);
    block(g, kind === "zombie" ? 0x291c19 : p.mouth, hx + 6, hy + 12, 7, 3);
    if (kind === "zombie") {
      block(g, p.accent, hx + 7, hy + 12, 5, 3);
      block(g, 0xf1e4c5, hx + 7, hy + 12, 2, 1);
      block(g, 0xf1e4c5, hx + 11, hy + 12, 2, 1);
    }
  }

  if (kind === "player") paintWeapon(g, direction, action, frame);
  if (hit) {
    block(g, p.accent, 6, 17, 3, 2);
    block(g, p.accent, 25, 21, 4, 2);
  }
}

function paintWeapon(
  g: Phaser.GameObjects.Graphics,
  direction: FacingDirection,
  action: CharacterAction,
  frame: number,
): void {
  const [vx, vy] = facingVector(direction);
  const length = Math.hypot(vx, vy) || 1;
  const x = vx / length;
  const y = vy / length;
  const reach = action === "melee" ? 13 : 10;
  const sx = 16, sy = 20;
  const ex = Math.round(sx + x * reach);
  const ey = Math.round(sy + y * reach * 0.65);
  g.lineStyle(4, 0x121b1d, 1);
  g.lineBetween(sx, sy, ex, ey);
  g.lineStyle(1, 0x87938b, 1);
  g.lineBetween(sx + x * 2, sy + y, ex, ey);
  block(g, 0x1a2324, sx - 2, sy - 1, 5, 4);
  if (action === "shoot" && frame === 0) {
    block(g, 0xffca4e, ex - 2, ey - 2, 5, 5);
    block(g, 0xfff1ab, ex, ey - 1, 3, 3);
  }
  if (action === "melee" && frame === 0) {
    g.lineStyle(2, 0xf4e4bb, 1);
    g.lineBetween(ex - y * 5, ey + x * 5, ex + y * 5, ey - x * 5);
  }
  if (action === "reload") block(g, 0x101a20, sx - 1, sy + 2 + frame, 3, 6);
}
