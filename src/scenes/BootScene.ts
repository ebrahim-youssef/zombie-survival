import Phaser from "phaser";
import { LocalSettingsStore } from "../persistence/LocalSettingsStore";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create(): void {
    const store = new LocalSettingsStore();
    const data = store.load();

    this.registry.set(
      "persistedGameData",
      data,
    );
    this.registry.set(
      "gameSettings",
      data.settings,
    );

    this.scene.start("menu");
  }
}
