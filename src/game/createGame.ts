import Phaser from "phaser";
import {
  GAME_BACKGROUND,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "./constants";
import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { GameScene } from "../scenes/GameScene";
import { UIScene } from "../scenes/UIScene";
import { PauseScene } from "../scenes/PauseScene";

export function createGame(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    backgroundColor: GAME_BACKGROUND,
    pixelArt: true,
    roundPixels: true,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [
      BootScene,
      MenuScene,
      GameScene,
      UIScene,
      PauseScene,
    ],
  });
}
