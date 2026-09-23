import Phaser from "phaser";
import type { RunState } from "../game/RunState";
import type { InteractionSnapshot } from "../interactions/InteractionTypes";
import type {
  InventorySlotSnapshot,
} from "../weapons/InventoryController";
import type { WeaponSnapshot } from "../weapons/WeaponController";
import type { WaveSnapshot } from "../zombies/WaveController";

export class HUD {
  private readonly scene: Phaser.Scene;
  private readonly roundText: Phaser.GameObjects.Text;
  private readonly waveStateText: Phaser.GameObjects.Text;
  private readonly interactionText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly healthPointsText: Phaser.GameObjects.Text;
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly inventoryText: Phaser.GameObjects.Text;
  private readonly phaseText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const camera = scene.cameras.main;

    this.roundText = scene.add
      .text(24, 22, "ROUND 1", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ede8dc",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.waveStateText = scene.add
      .text(24, 51, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#b8ac86",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.interactionText = scene.add
      .text(
        camera.width / 2,
        camera.height - 105,
        "",
        {
          align: "center",
          fontFamily: "monospace",
          fontSize: "17px",
          color: "#f0d27a",
          backgroundColor: "#171817cc",
          padding: { x: 10, y: 6 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2200)
      .setVisible(false);

    this.statusText = scene.add
      .text(
        camera.width / 2,
        camera.height - 145,
        "",
        {
          align: "center",
          fontFamily: "monospace",
          fontSize: "15px",
          color: "#ede8dc",
          backgroundColor: "#171817cc",
          padding: { x: 9, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2200)
      .setVisible(false);

    this.healthPointsText = scene.add
      .text(24, camera.height - 48, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ede8dc",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.ammoText = scene.add
      .text(
        camera.width - 24,
        camera.height - 48,
        "",
        {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#ede8dc",
        },
      )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(2000);

    this.inventoryText = scene.add
      .text(
        camera.width / 2,
        camera.height - 45,
        "",
        {
          align: "center",
          fontFamily: "monospace",
          fontSize: "15px",
          color: "#d8d3c7",
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(2000);

    this.phaseText = scene.add
      .text(
        camera.width / 2,
        22,
        "PHASE 6 • ECONOMY + INTERACTIONS",
        {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#b8ac86",
        },
      )
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
      "HP " +
        Math.ceil(health) +
        " / " +
        maxHealth +
        "   •   " +
        runState.points +
        " PTS   •   " +
        runState.kills +
        " KILLS",
    );
  }

  updateWave(snapshot: WaveSnapshot): void {
    this.roundText.setText("ROUND " + snapshot.round);

    if (snapshot.phase === "intermission") {
      const seconds = Math.ceil(
        snapshot.nextRoundInMs / 1000,
      );

      this.waveStateText.setText(
        "ROUND CLEAR • NEXT ROUND IN " + seconds + "s",
      );
      return;
    }

    this.waveStateText.setText(
      "SPAWNED " +
        snapshot.spawnedZombies +
        "/" +
        snapshot.totalZombies +
        " • ALIVE " +
        snapshot.aliveZombies +
        "/" +
        snapshot.maxAliveZombies,
    );
  }

  updateWeapon(snapshot: WeaponSnapshot): void {
    const reload = snapshot.isReloading
      ? "   RELOADING"
      : "";

    this.ammoText.setText(
      snapshot.name +
        "   " +
        snapshot.magazineAmmo +
        " / " +
        snapshot.reserveAmmo +
        reload,
    );
  }

  updateInventory(
    slots: readonly [
      InventorySlotSnapshot,
      InventorySlotSnapshot,
    ],
  ): void {
    const labels = slots.map((slot) => {
      const name = slot.name ?? "EMPTY";

      return slot.active
        ? "[" + slot.slot + ": " + name + "]"
        : slot.slot + ": " + name;
    });

    this.inventoryText.setText(labels.join("    "));
  }

  updateInteraction(
    snapshot: InteractionSnapshot,
  ): void {
    if (snapshot.prompt) {
      this.interactionText
        .setText(snapshot.prompt)
        .setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }

    if (snapshot.status) {
      this.statusText
        .setText(snapshot.status)
        .setVisible(true);
    } else {
      this.statusText.setVisible(false);
    }
  }

  showPointGain(amount: number): void {
    const popup = this.scene.add
      .text(
        28,
        this.scene.cameras.main.height - 78,
        "+" + amount,
        {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#f0d27a",
        },
      )
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
        "GAME OVER\n\nROUND " +
          round +
          "   •   " +
          kills +
          " KILLS   •   " +
          points +
          " PTS\n\nPress ENTER or click to restart",
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
    this.roundText.destroy();
    this.waveStateText.destroy();
    this.interactionText.destroy();
    this.statusText.destroy();
    this.healthPointsText.destroy();
    this.ammoText.destroy();
    this.inventoryText.destroy();
    this.phaseText.destroy();
  }
}
