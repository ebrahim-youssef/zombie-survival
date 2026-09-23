import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    this.add.text(GAME_WIDTH / 2, 190, "ZOMBIE SURVIVAL", {
      fontFamily: "monospace",
      fontSize: "52px",
      color: "#ede8dc",
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 265, "Pseudo-isometric survival prototype", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#b8ac86",
    }).setOrigin(0.5);

    this.createButton(GAME_HEIGHT / 2 + 20, "PLAY", () => this.scene.start("game"));
    this.createButton(GAME_HEIGHT / 2 + 90, "CONTROLS", () => this.toggleControls());

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 52, "MVP scaffold • Phaser 3.90 • TypeScript", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#74766f",
    }).setOrigin(0.5);
  }

  private createButton(y: number, label: string, onClick: () => void): void {
    const button = this.add.text(GAME_WIDTH / 2, y, label, {
      fontFamily: "monospace",
      fontSize: "26px",
      color: "#f0d27a",
      backgroundColor: "#262822",
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setColor("#ffffff"));
    button.on("pointerout", () => button.setColor("#f0d27a"));
    button.on("pointerdown", onClick);
  }

  private toggleControls(): void {
    const existing = this.children.getByName("controls-panel");
    if (existing) {
      existing.destroy();
      return;
    }

    this.add.text(
      GAME_WIDTH / 2,
      585,
      "WASD / Arrows: Move   •   Mouse: Aim\n" +
        "Left Click: Fire   •   Right Click: Melee\n" +
        "R: Reload   •   E: Interact   •   1/2: Weapons   •   Esc: Pause",
      {
        align: "center",
        fontFamily: "monospace",
        fontSize: "16px",
        lineSpacing: 8,
        color: "#d8d3c7",
      },
    ).setName("controls-panel").setOrigin(0.5);
  }
}
