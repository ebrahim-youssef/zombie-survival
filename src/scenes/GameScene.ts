import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#171817");

    const graphics = this.add.graphics();
    graphics.fillStyle(0x292b26, 1);
    graphics.lineStyle(3, 0x676452, 1);

    const floor = [
      new Phaser.Geom.Point(GAME_WIDTH / 2, 115),
      new Phaser.Geom.Point(GAME_WIDTH - 170, GAME_HEIGHT / 2),
      new Phaser.Geom.Point(GAME_WIDTH / 2, GAME_HEIGHT - 115),
      new Phaser.Geom.Point(170, GAME_HEIGHT / 2),
    ];

    graphics.fillPoints(floor, true);
    graphics.strokePoints(floor, true, true);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 22, "PHASE 0 SCAFFOLD", {
      fontFamily: "monospace",
      fontSize: "30px",
      color: "#ede8dc",
    }).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 26,
      "Arena / player implementation is the next vertical slice.",
      { fontFamily: "monospace", fontSize: "16px", color: "#b8ac86" },
    ).setOrigin(0.5);

    this.add.text(34, 30, "ROUND 1", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ede8dc",
    });

    this.add.text(34, GAME_HEIGHT - 54, "HP 150   •   500 PTS", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ede8dc",
    });

    this.add.text(GAME_WIDTH - 34, GAME_HEIGHT - 54, "MR6   8 / 32", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ede8dc",
    }).setOrigin(1, 0);

    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("menu"));
    this.input.mouse?.disableContextMenu();
  }
}
