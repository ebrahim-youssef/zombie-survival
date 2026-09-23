import type Phaser from "phaser";

export interface InputFrame {
  move: Phaser.Math.Vector2;
  aimWorld: Phaser.Math.Vector2;
  fireHeld: boolean;
  firePressed: boolean;
  meleePressed: boolean;
  reloadPressed: boolean;
  interactPressed: boolean;
  slotPressed: 0 | 1 | 2;
  cycleWeapon: -1 | 0 | 1;
  pausePressed: boolean;
}

export type FacingDirection =
  | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
