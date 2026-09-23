import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../game/constants";
import { SettingsPanel } from "../ui/SettingsPanel";

export class PauseScene extends Phaser.Scene {
  private settingsPanel: SettingsPanel | undefined;

  constructor() {
    super("pause");
  }

  create(): void {
    this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x080909,
        0.82,
      )
      .setScrollFactor(0);

    this.add
      .text(
        GAME_WIDTH / 2,
        175,
        "PAUSED",
        {
          fontFamily: "monospace",
          fontSize: "46px",
          color: "#ede8dc",
        },
      )
      .setOrigin(0.5);

    this.createButton(
      290,
      "RESUME",
      () => this.resumeGame(),
    );

    this.createButton(
      355,
      "SETTINGS",
      () => this.openSettings(),
    );

    this.createButton(
      420,
      "RESTART",
      () => this.restartGame(),
    );

    this.createButton(
      485,
      "MAIN MENU",
      () => this.goToMenu(),
    );

    this.input.keyboard?.once(
      "keydown-ESC",
      () => this.resumeGame(),
    );

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.settingsPanel?.destroy();
        this.settingsPanel = undefined;
      },
    );
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
          fontSize: "22px",
          color: "#f0d27a",
          backgroundColor: "#262822",
          padding: { x: 22, y: 10 },
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

  private openSettings(): void {
    if (this.settingsPanel) return;

    this.settingsPanel = new SettingsPanel(
      this,
      () => {
        this.settingsPanel = undefined;
      },
    );
  }

  private resumeGame(): void {
    if (this.settingsPanel) {
      this.settingsPanel.destroy();
      this.settingsPanel = undefined;
    }

    this.scene.stop();
    this.scene.resume("game");
  }

  private restartGame(): void {
    this.game.scene.stop("pause");
    this.game.scene.stop("game");
    this.game.scene.start("game");
  }

  private goToMenu(): void {
    this.game.scene.stop("pause");
    this.game.scene.stop("game");
    this.game.scene.start("menu");
  }
}
