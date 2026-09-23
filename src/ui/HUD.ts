import Phaser from "phaser";
import type { WeaponSnapshot } from "../weapons/WeaponController";

export class HUD {
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly phaseText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const camera = scene.cameras.main;

    scene.add
      .text(24, 22, "ROUND 1", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ede8dc",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    scene.add
      .text(24, camera.height - 48, "HP 150   •   500 PTS", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ede8dc",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.ammoText = scene.add
      .text(camera.width - 24, camera.height - 48, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ede8dc",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(2000);

    this.phaseText = scene.add
      .text(camera.width / 2, 22, "PHASE 2 • COMBAT FOUNDATION", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#b8ac86",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(2000);
  }

  updateWeapon(snapshot: WeaponSnapshot): void {
    const reload = snapshot.isReloading ? "   RELOADING" : "";

    this.ammoText.setText(
      `${snapshot.name}   ${snapshot.magazineAmmo} / ${snapshot.reserveAmmo}${reload}`,
    );
  }

  destroy(): void {
    this.ammoText.destroy();
    this.phaseText.destroy();
  }
}
