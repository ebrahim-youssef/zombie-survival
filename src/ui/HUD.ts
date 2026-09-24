import Phaser from "phaser";
import type { RunState } from "../game/RunState";
import type { InteractionSnapshot } from "../interactions/InteractionTypes";
import type { InventorySlotSnapshot } from "../weapons/InventoryController";
import type { WeaponSnapshot } from "../weapons/WeaponController";
import type { WaveSnapshot } from "../zombies/WaveController";

export class HUD {
  private readonly scene: Phaser.Scene;
  private readonly roundText: Phaser.GameObjects.Text;
  private readonly waveStateText: Phaser.GameObjects.Text;
  private readonly interactionText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly healthPointsText: Phaser.GameObjects.Text;
  private readonly healthTrack: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly inventoryText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const camera = scene.cameras.main;
    const ui = { fontFamily: "monospace" };

    this.roundText = scene.add.text(24, 22, "ROUND 1", {
      ...ui, fontSize: "20px", color: "#ede8dc",
    }).setScrollFactor(0).setDepth(2000);

    this.waveStateText = scene.add.text(24, 51, "", {
      ...ui, fontSize: "13px", color: "#b8ac86",
    }).setScrollFactor(0).setDepth(2000);

    this.interactionText = scene.add.text(
      camera.width / 2, camera.height - 105, "",
      { ...ui, align: "center", fontSize: "17px", color: "#f0d27a",
        backgroundColor: "#171817cc", padding: { x: 10, y: 6 } },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2200).setVisible(false);

    this.statusText = scene.add.text(
      camera.width / 2, camera.height - 145, "",
      { ...ui, align: "center", fontSize: "15px", color: "#ede8dc",
        backgroundColor: "#171817cc", padding: { x: 9, y: 5 } },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2200).setVisible(false);

    this.healthTrack = scene.add.rectangle(
      24, camera.height - 74, 210, 9, 0x303a32, 1,
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(2000);

    this.healthFill = scene.add.rectangle(
      24, camera.height - 74, 210, 9, 0x88a573, 1,
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(2001);

    this.healthPointsText = scene.add.text(24, camera.height - 48, "", {
      ...ui, fontSize: "18px", color: "#ede8dc",
    }).setScrollFactor(0).setDepth(2000);

    this.ammoText = scene.add.text(
      camera.width - 24, camera.height - 48, "",
      { ...ui, fontSize: "18px", color: "#ede8dc" },
    ).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);

    this.inventoryText = scene.add.text(
      camera.width / 2, camera.height - 45, "",
      { ...ui, align: "center", fontSize: "15px", color: "#d8d3c7" },
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2000);
  }

  resize(width:number,height:number,touch:boolean):void{
    const compact=width<1000||height<560;
    const padding=compact?10:24;
    this.roundText.setPosition(padding,compact?7:22).setFontSize(compact?16:20);
    this.waveStateText.setPosition(padding,compact?30:51).setFontSize(compact?10:13);
    if(touch){
      // Keep bottom corners clear for both joysticks and action buttons.
      this.healthTrack.setPosition(padding,54).setSize(145,7);
      this.healthFill.setPosition(padding,54).setSize(145,7);
      this.healthPointsText.setPosition(padding,65).setFontSize(compact?11:16);
      this.ammoText.setPosition(width-padding,65).setFontSize(compact?11:16);
      this.inventoryText.setPosition(width/2,88).setFontSize(compact?11:15);
      this.interactionText.setPosition(width/2,124).setFontSize(compact?12:17);
      this.statusText.setPosition(width/2,153).setFontSize(compact?11:15);
    }else{
      this.healthTrack.setPosition(padding,height-74).setSize(210,9);
      this.healthFill.setPosition(padding,height-74).setSize(210,9);
      this.healthPointsText.setPosition(padding,height-48).setFontSize(compact?13:18);
      this.ammoText.setPosition(width-padding,height-48).setFontSize(compact?13:18);
      this.inventoryText.setPosition(width/2,height-45).setFontSize(compact?11:15);
      this.interactionText.setPosition(width/2,height-105).setFontSize(compact?12:17);
      this.statusText.setPosition(width/2,height-145).setFontSize(compact?11:15);
    }
    this.waveStateText.setWordWrapWidth(Math.max(220,width*.65));
  }

  updateStatus(health: number, maxHealth: number, runState: RunState): void {
    this.healthPointsText.setText(
      "HP " + Math.ceil(health) + " / " + maxHealth +
      "   •   " + runState.points + " PTS   •   " + runState.kills + " KILLS",
    );
    const ratio = Phaser.Math.Clamp(health / maxHealth, 0, 1);
    this.healthFill.setScale(ratio, 1);
    this.healthFill.setFillStyle(
      ratio > 0.66 ? 0x88a573 : ratio > 0.33 ? 0xd6ad55 : 0xb94a48,
    );
  }

  updateWave(snapshot: WaveSnapshot): void {
    this.roundText.setText("ROUND " + snapshot.round);
    if (snapshot.phase === "intermission") {
      this.waveStateText.setText(
        "ROUND CLEAR • NEXT ROUND IN " +
        Math.ceil(snapshot.nextRoundInMs / 1000) + "s",
      );
      return;
    }
    this.waveStateText.setText(
      "SPAWNED " + snapshot.spawnedZombies + "/" + snapshot.totalZombies +
      " • ALIVE " + snapshot.aliveZombies + "/" + snapshot.maxAliveZombies,
    );
  }

  updateWeapon(snapshot: WeaponSnapshot): void {
    this.ammoText.setText(
      snapshot.name + "   " + snapshot.magazineAmmo + " / " +
      snapshot.reserveAmmo + (snapshot.isReloading ? "   RELOADING" : ""),
    );
  }

  updateInventory(
    slots: readonly [InventorySlotSnapshot, InventorySlotSnapshot],
  ): void {
    const labels = slots.map((slot) => {
      const text = slot.slot + ": " + (slot.name ?? "EMPTY");
      return slot.active ? "[" + text + "]" : text;
    });
    this.inventoryText.setText(labels.join("    "));
  }

  updateInteraction(snapshot: InteractionSnapshot): void {
    this.interactionText.setVisible(!!snapshot.prompt);
    if (snapshot.prompt) this.interactionText.setText(snapshot.prompt);
    this.statusText.setVisible(!!snapshot.status);
    if (snapshot.status) this.statusText.setText(snapshot.status);
  }

  showPointGain(amount: number): void {
    const popup = this.scene.add.text(
      28, this.scene.cameras.main.height - 120, "+" + amount,
      { fontFamily: "monospace", fontSize: "16px", color: "#f0d27a" },
    ).setScrollFactor(0).setDepth(2100);
    this.scene.tweens.add({
      targets: popup, y: popup.y - 18, alpha: 0, duration: 550,
      onComplete: () => popup.destroy(),
    });
  }

  showGameOver(
    round: number, kills: number, points: number,
    highScore: number, highestRound: number,
  ): void {
    const camera = this.scene.cameras.main;
    this.scene.add.rectangle(
      camera.width / 2, camera.height / 2, 620, 310, 0x080909, 0.92,
    ).setScrollFactor(0).setDepth(3000);
    this.scene.add.text(
      camera.width / 2, camera.height / 2,
      "GAME OVER\n\nROUND " + round + "   •   " + kills +
      " KILLS   •   " + points + " PTS\n\nBEST SCORE " +
      highScore + "   •   HIGHEST ROUND " + highestRound +
      "\n\nPress ENTER or click to restart",
      { align: "center", fontFamily: "monospace", fontSize: "21px",
        lineSpacing: 9, color: "#ede8dc" },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
  }

  destroy(): void {
    this.roundText.destroy();
    this.waveStateText.destroy();
    this.interactionText.destroy();
    this.statusText.destroy();
    this.healthTrack.destroy();
    this.healthFill.destroy();
    this.healthPointsText.destroy();
    this.ammoText.destroy();
    this.inventoryText.destroy();
  }
}
