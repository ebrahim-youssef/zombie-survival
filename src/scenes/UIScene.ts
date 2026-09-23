import Phaser from "phaser";

/**
 * Reserved for UI that runs in parallel with GameScene.
 * HUD, pause, prompts and game-over UI will move here.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super("ui");
  }
}
