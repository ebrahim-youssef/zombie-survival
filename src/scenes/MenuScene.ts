import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../game/constants";
import { LocalSettingsStore } from "../persistence/LocalSettingsStore";
import { SettingsPanel } from "../ui/SettingsPanel";

export class MenuScene extends Phaser.Scene {
  private settingsPanel: SettingsPanel | undefined;

  constructor() {
    super("menu");
  }

  create(): void {
    const data = new LocalSettingsStore().load();

    this.registry.set(
      "persistedGameData",
      data,
    );
    this.registry.set(
      "gameSettings",
      data.settings,
    );

    this.add
      .text(
        GAME_WIDTH / 2,
        145,
        "ZOMBIE SURVIVAL",
        {
          fontFamily: "monospace",
          fontSize: "52px",
          color: "#ede8dc",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        215,
        "Pseudo-isometric survival prototype",
        {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#b8ac86",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        263,
        "BEST SCORE " +
          data.highScore +
          "   •   HIGHEST ROUND " +
          data.highestRound,
        {
          fontFamily: "monospace",
          fontSize: "15px",
          color: "#9f9d91",
        },
      )
      .setOrigin(0.5);

    this.createButton(
      GAME_HEIGHT / 2 - 5,
      "PLAY",
      () => this.scene.start("game"),
    );

    this.createButton(
      GAME_HEIGHT / 2 + 60,
      "CONTROLS",
      () => this.toggleControls(),
    );

    this.createButton(
      GAME_HEIGHT / 2 + 125,
      "SETTINGS",
      () => this.openSettings(),
    );

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 42,
        "Phaser 3.90 • TypeScript • Local browser save",
        {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#74766f",
        },
      )
      .setOrigin(0.5);
  }

  private createButton(
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const button = this.add
      .text(
        GAME_WIDTH / 2,
        y,
        label,
        {
          fontFamily: "monospace",
          fontSize: "24px",
          color: "#f0d27a",
          backgroundColor: "#262822",
          padding: { x: 24, y: 10 },
        },
      )
      .setOrigin(0.5)
      .setInteractive({
        useHandCursor: true,
      });

    button.on(
      "pointerover",
      () => button.setColor("#ffffff"),
    );
    button.on(
      "pointerout",
      () => button.setColor("#f0d27a"),
    );
    button.on(
      "pointerdown",
      onClick,
    );
  }

  private toggleControls(): void {
    const existing =
      this.children.getByName(
        "controls-panel",
      );

    if (existing) {
      existing.destroy();
      return;
    }

    this.add
      .text(
        GAME_WIDTH / 2,
        640,
        "WASD / Arrows: Move   •   Mouse: Aim\n" +
          "Left Click: Fire   •   Right Click: Melee\n" +
          "R: Reload   •   E: Interact   •   1/2: Weapons   •   Esc: Pause",
        {
          align: "center",
          fontFamily: "monospace",
          fontSize: "15px",
          lineSpacing: 7,
          color: "#d8d3c7",
        },
      )
      .setName("controls-panel")
      .setOrigin(0.5);
  }

  private openSettings(): void {
    if (this.settingsPanel) return;

    this.settingsPanel = new SettingsPanel(
      this,
      () => {
        this.settingsPanel = undefined;
      },
    );
  }
}
