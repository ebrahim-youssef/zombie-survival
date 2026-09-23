import Phaser from "phaser";
import type { RunState } from "../game/RunState";
import type { WeaponSnapshot } from "../weapons/WeaponController";

export class HUD {
  private readonly scene: Phaser.Scene;
  private readonly healthPointsText: Phaser.GameObjects.Text;
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly phaseText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const camera = scene.cameras.main;

    scene.add
      .text(24, 22, "ROUND 1", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ede8dc",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.healthPointsText = scene.add
      .text(24, camera.height - 48, "", {
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
      .text(camera.width / 2, 22, "PHASE 3 • ZOMBIE SLICE", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#b8ac86",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(2000);
  }

  updateStatus(
    health: number,
    maxHealth: number,
    runState: RunState,
  ): void {
    this.healthPointsText.setText(
      `HP ${Math.ceil(health)} / ${maxHealth}   •   ${runState.points} PTS   •   ${runState.kills} KILLS`,
    );
  }

  updateWeapon(snapshot: WeaponSnapshot): void {
    const reload = snapshot.isReloading ? "   RELOADING" : "";

    this.ammoText.setText(
      `${snapshot.name}   ${snapshot.magazineAmmo} / ${snapshot.reserveAmmo}${reload}`,
    );
  }

  showPointGain(amount: number): void {
    const popup = this.scene.add
      .text(28, this.scene.cameras.main.height - 78, `+${amount}`, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#f0d27a",
      })
      .setScrollFactor(0)
      .setDepth(2100);

    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 18,
      alpha: 0,
      duration: 550,
      onComplete: () => {
        popup.destroy();
      },
    });
  }

  showGameOver(
    round: number,
    kills: number,
    points: number,
  ): void {
    const camera = this.scene.cameras.main;

    this.scene.add
      .rectangle(
        camera.width / 2,
        camera.height / 2,
        540,
        260,
        0x080909,
        0.9,
      )
      .setScrollFactor(0)
      .setDepth(3000);

    this.scene.add
      .text(
        camera.width / 2,
        camera.height / 2,
        `GAME OVER\n\nROUND ${round}   •   ${kills} KILLS   •   ${points} PTS\n\nPress ENTER or click to restart`,
        {
          align: "center",
          fontFamily: "monospace",
          fontSize: "22px",
          lineSpacing: 10,
          color: "#ede8dc",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3001);
  }

  destroy(): void {
    this.healthPointsText.destroy();
    this.ammoText.destroy();
    this.phaseText.destroy();
  }
}
