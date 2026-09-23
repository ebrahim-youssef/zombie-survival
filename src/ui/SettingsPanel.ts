import Phaser from "phaser";
import {
  LocalSettingsStore,
  type GameSettings,
} from "../persistence/LocalSettingsStore";

export class SettingsPanel {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private readonly store = new LocalSettingsStore();
  private settings: GameSettings;
  private volumeText: Phaser.GameObjects.Text;
  private damageText: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onClose: () => void,
  ) {
    const data = this.store.load();
    this.settings = { ...data.settings };

    const camera = scene.cameras.main;

    const backdrop = scene.add
      .rectangle(
        camera.width / 2,
        camera.height / 2,
        560,
        390,
        0x111312,
        0.97,
      )
      .setStrokeStyle(2, 0xd6ad55, 0.8)
      .setScrollFactor(0)
      .setDepth(5000);

    const title = scene.add
      .text(
        camera.width / 2,
        camera.height / 2 - 145,
        "SETTINGS",
        {
          fontFamily: "monospace",
          fontSize: "30px",
          color: "#ede8dc",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(5001);

    this.volumeText = scene.add
      .text(
        camera.width / 2,
        camera.height / 2 - 65,
        "",
        {
          fontFamily: "monospace",
          fontSize: "20px",
          color: "#ede8dc",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(5001);

    this.damageText = scene.add
      .text(
        camera.width / 2,
        camera.height / 2 + 35,
        "",
        {
          fontFamily: "monospace",
          fontSize: "20px",
          color: "#ede8dc",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(5001);

    this.objects.push(
      backdrop,
      title,
      this.volumeText,
      this.damageText,
    );

    this.createButton(
      camera.width / 2 - 105,
      camera.height / 2 - 15,
      "VOL -",
      () => this.adjustVolume(-0.1),
    );

    this.createButton(
      camera.width / 2 + 105,
      camera.height / 2 - 15,
      "VOL +",
      () => this.adjustVolume(0.1),
    );

    this.createButton(
      camera.width / 2,
      camera.height / 2 + 90,
      "TOGGLE DAMAGE NUMBERS",
      () => {
        this.settings.damageNumbers =
          !this.settings.damageNumbers;
        this.save();
      },
    );

    this.createButton(
      camera.width / 2,
      camera.height / 2 + 145,
      "BACK",
      () => this.close(),
    );

    this.refreshLabels();
  }

  destroy(): void {
    for (const object of this.objects) {
      object.destroy();
    }

    this.objects.length = 0;
  }

  private adjustVolume(delta: number): void {
    this.settings.masterVolume =
      Phaser.Math.Clamp(
        Math.round(
          (this.settings.masterVolume + delta) * 10,
        ) / 10,
        0,
        1,
      );

    this.save();
  }

  private save(): void {
    const data = this.store.saveSettings(
      this.settings,
    );

    this.settings = { ...data.settings };

    this.scene.registry.set(
      "gameSettings",
      data.settings,
    );
    this.scene.registry.set(
      "persistedGameData",
      data,
    );

    this.refreshLabels();
  }

  private refreshLabels(): void {
    this.volumeText.setText(
      "MASTER VOLUME: " +
        Math.round(
          this.settings.masterVolume * 100,
        ) +
        "%",
    );

    this.damageText.setText(
      "DAMAGE NUMBERS: " +
        (this.settings.damageNumbers ? "ON" : "OFF"),
    );
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const button = this.scene.add
      .text(
        x,
        y,
        label,
        {
          fontFamily: "monospace",
          fontSize: "17px",
          color: "#f0d27a",
          backgroundColor: "#292b26",
          padding: { x: 14, y: 9 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(5001)
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
    button.on("pointerdown", onClick);

    this.objects.push(button);
  }

  private close(): void {
    this.destroy();
    this.onClose();
  }
}
