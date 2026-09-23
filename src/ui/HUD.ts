import Phaser from "phaser";
import { characterTexture } from "../art/CharacterArt";
import { ensureHudArt, HUD_TEXTURES } from "../art/HudArt";
import type { RunState } from "../game/RunState";
import type { InteractionSnapshot } from "../interactions/InteractionTypes";
import type { InventorySlotSnapshot } from "../weapons/InventoryController";
import type { WeaponSnapshot } from "../weapons/WeaponController";
import type { WaveSnapshot } from "../zombies/WaveController";

/**
 * Screen-space arcade HUD. The important information occupies the same
 * visual zones as the concept, but shifts above touch joysticks on phones.
 */
export class HUD {
  private readonly scene: Phaser.Scene;
  private readonly portraitFrame: Phaser.GameObjects.Image;
  private readonly portrait: Phaser.GameObjects.Image;
  private readonly hearts: Phaser.GameObjects.Image[] = [];
  private readonly healthTrack: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private readonly scoreLabel: Phaser.GameObjects.Text;
  private readonly scoreValue: Phaser.GameObjects.Text;
  private readonly roundText: Phaser.GameObjects.Text;
  private readonly waveStateText: Phaser.GameObjects.Text;
  private readonly ammoPanel: Phaser.GameObjects.Rectangle;
  private readonly gunIcon: Phaser.GameObjects.Image;
  private readonly ammoText: Phaser.GameObjects.Text;
  private readonly inventoryText: Phaser.GameObjects.Text;
  private readonly interactionText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly healthPointsText: Phaser.GameObjects.Text;
  private touch = false;
  private width: number;
  private height: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    ensureHudArt(scene);
    this.width = scene.scale.width;
    this.height = scene.scale.height;
    const ui = { fontFamily: "monospace", fontStyle: "bold" };
    this.portraitFrame = scene.add.image(40, 40, HUD_TEXTURES.portraitFrame)
      .setDepth(2010).setScrollFactor(0);
    this.portrait = scene.add.image(40, 42, characterTexture("player", "s", "idle"))
      .setDepth(2011).setScale(1.45).setScrollFactor(0);
    for (let i = 0; i < 3; i += 1) {
      this.hearts.push(
        scene.add.image(100 + i * 30, 24, HUD_TEXTURES.heart)
          .setScale(1.5).setDepth(2010).setScrollFactor(0),
      );
    }

    this.healthTrack = scene.add.rectangle(100, 55, 129, 9, 0x14191d, .96)
      .setStrokeStyle(2, 0xbaa77d, 1).setOrigin(0, 0)
      .setScrollFactor(0).setDepth(2010);
    this.healthFill = scene.add.rectangle(101, 56, 126, 7, 0x84c45d, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(2011);
    this.healthPointsText = scene.add.text(100, 68, "", {
      ...ui, fontSize: "11px", color: "#e0d4af",
    }).setScrollFactor(0).setDepth(2011);

    this.scoreLabel = scene.add.text(0, 12, "SCORE", {
      ...ui, fontSize: "15px", color: "#faf3e6",
      stroke: "#15191e", strokeThickness: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2010);
    this.scoreValue = scene.add.text(0, 35, "000500", {
      ...ui, fontSize: "29px", color: "#ffc858",
      stroke: "#15191e", strokeThickness: 5,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2010);
    this.roundText = scene.add.text(0, 75, "ROUND 1", {
      ...ui, fontSize: "18px", color: "#f1f2e7",
      stroke: "#15191e", strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2010);
    this.waveStateText = scene.add.text(0, 105, "", {
      fontFamily: "monospace", fontSize: "11px", color: "#e0cc99",
      backgroundColor: "#151a1d88", padding: { x: 4, y: 2 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2010);

    this.ammoPanel = scene.add.rectangle(14, this.height - 60, 212, 52, 0x141b20, .94)
      .setStrokeStyle(3, 0xd1bb91, 1).setOrigin(0, 0)
      .setScrollFactor(0).setDepth(2000);
    this.gunIcon = scene.add.image(27, this.height - 45, HUD_TEXTURES.gun)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(2001);
    this.ammoText = scene.add.text(100, this.height - 45, "", {
      ...ui, fontSize: "16px", color: "#ffefcc",
    }).setScrollFactor(0).setDepth(2002);
    this.inventoryText = scene.add.text(0, this.height - 39, "", {
      fontFamily: "monospace", fontSize: "13px", color: "#e5cf9f",
      backgroundColor: "#12181dc7", padding: { x: 7, y: 5 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2001);

    this.interactionText = scene.add.text(this.width / 2, 110, "", {
      fontFamily: "monospace", fontSize: "15px", color: "#ffe2a0",
      stroke: "#251910", strokeThickness: 3,
      backgroundColor: "#241e18e8", padding: { x: 10, y: 5 },
    }).setOrigin(.5).setScrollFactor(0).setDepth(2200).setVisible(false);
    this.statusText = scene.add.text(this.width / 2, 143, "", {
      fontFamily: "monospace", fontSize: "13px", color: "#f1efe8",
      backgroundColor: "#241e18e8", padding: { x: 8, y: 4 },
    }).setOrigin(.5).setScrollFactor(0).setDepth(2200).setVisible(false);
  }

  resize(width: number, height: number, touch: boolean): void {
    this.touch = touch;
    this.width = width;
    this.height = height;
    const compact = width < 1000 || height < 560;
    const margin = compact ? 10 : 22;
    const s = compact ? .74 : 1;
    this.portraitFrame.setPosition(margin + 28 * s, margin + 28 * s).setScale(s);
    this.portrait.setPosition(margin + 28 * s, margin + 30 * s)
      .setScale(1.45 * s);
    for (let i = 0; i < this.hearts.length; i += 1) {
      this.hearts[i]!.setPosition(margin + 72 * s + i * 28 * s, margin + 13 * s)
        .setScale(1.5 * s);
    }
    this.healthTrack.setPosition(margin + 67 * s, margin + 40 * s)
      .setSize(125 * s, 8 * s);
    this.healthFill.setPosition(margin + 68 * s, margin + 41 * s)
      .setSize(122 * s, 6 * s);
    this.healthPointsText.setPosition(margin + 67 * s, margin + 54 * s)
      .setFontSize(compact ? 9 : 11);

    // Keep the top-right pause touch button free.
    const right = width - (touch ? 70 : margin);
    this.scoreLabel.setPosition(right, compact ? 8 : 12)
      .setFontSize(compact ? 11 : 15);
    this.scoreValue.setPosition(right, compact ? 23 : 34)
      .setFontSize(compact ? 19 : 29);
    this.roundText.setPosition(right, compact ? 47 : 74)
      .setFontSize(compact ? 13 : 18);
    this.waveStateText.setPosition(right, compact ? 66 : 105)
      .setFontSize(compact ? 9 : 11)
      .setWordWrapWidth(Math.max(100, width * .4));

    if (touch) {
      // No ammo panel below the mobile joystick: put it between corner stats.
      const panelWidth = compact ? 150 : 205;
      const panelX = Math.max(margin, Math.round(width / 2 - panelWidth / 2));
      this.ammoPanel.setPosition(panelX, compact ? 8 : 12)
        .setSize(panelWidth, compact ? 41 : 53);
      this.gunIcon.setPosition(panelX + 8, compact ? 15 : 20)
        .setScale(compact ? .48 : .7);
      this.ammoText.setPosition(panelX + (compact ? 47 : 70), compact ? 17 : 25)
        .setFontSize(compact ? 12 : 16);
      this.inventoryText.setPosition(width / 2, compact ? 54 : 78)
        .setOrigin(.5, 0).setFontSize(compact ? 10 : 13);
      this.interactionText.setPosition(width / 2, compact ? 97 : 127);
      this.statusText.setPosition(width / 2, compact ? 120 : 156);
    } else {
      this.ammoPanel.setPosition(margin, height - (compact ? 49 : 63))
        .setSize(compact ? 167 : 212, compact ? 40 : 52);
      this.gunIcon.setPosition(margin + 9, height - (compact ? 42 : 48))
        .setScale(compact ? .62 : 1);
      this.ammoText.setPosition(margin + (compact ? 72 : 87),
        height - (compact ? 39 : 46)).setFontSize(compact ? 13 : 16);
      this.inventoryText.setPosition(width - margin, height - (compact ? 42 : 39))
        .setOrigin(1, 0).setFontSize(compact ? 11 : 13);
      this.interactionText.setPosition(width / 2, height - (compact ? 75 : 112));
      this.statusText.setPosition(width / 2, height - (compact ? 111 : 145));
    }
    this.interactionText.setFontSize(compact ? 12 : 15)
      .setWordWrapWidth(Math.max(180, width * .65));
    this.statusText.setFontSize(compact ? 11 : 13)
      .setWordWrapWidth(Math.max(180, width * .65));
  }

  updateStatus(health: number, maxHealth: number, state: RunState): void {
    const ratio = Phaser.Math.Clamp(health / maxHealth, 0, 1);
    this.scoreValue.setText(Math.floor(state.points).toString().padStart(6, "0"));
    this.healthPointsText.setText(`HP ${Math.ceil(health)} / ${maxHealth}`);
    this.healthFill.setScale(ratio, 1);
    this.healthFill.setFillStyle(
      ratio > .66 ? 0x8cce62 : ratio > .33 ? 0xf1b84d : 0xdb5051,
    );
    for (let i = 0; i < this.hearts.length; i += 1) {
      this.hearts[i]!.setTexture(
        health > i * (maxHealth / 3) ? HUD_TEXTURES.heart : HUD_TEXTURES.heartEmpty,
      );
    }
  }

  updateWave(snapshot: WaveSnapshot): void {
    this.roundText.setText(`ROUND ${snapshot.round}`);
    this.waveStateText.setText(
      snapshot.phase === "intermission"
        ? `ROUND CLEAR • NEXT IN ${Math.ceil(snapshot.nextRoundInMs / 1000)}s`
        : `ZOMBIES ${snapshot.aliveZombies} / ${snapshot.totalZombies}`,
    );
  }

  updateWeapon(weapon: WeaponSnapshot): void {
    const text = `${weapon.magazineAmmo} / ${weapon.reserveAmmo}`;
    this.ammoText.setText(weapon.isReloading ? `${text}\nRELOADING` : text);
  }

  updateInventory(slots: readonly [
    InventorySlotSnapshot, InventorySlotSnapshot,
  ]): void {
    const current = slots.map(slot =>
      (slot.active ? "▶" : " ") + slot.slot + " " + (slot.name ?? "EMPTY"),
    );
    this.inventoryText.setText(current.join("   "));
  }

  updateInteraction(data: InteractionSnapshot): void {
    this.interactionText.setVisible(!!data.prompt);
    if (data.prompt) this.interactionText.setText(data.prompt);
    this.statusText.setVisible(!!data.status);
    if (data.status) this.statusText.setText(data.status);
  }

  showPointGain(amount: number): void {
    const label = this.scene.add.text(
      this.width - (this.touch ? 170 : 175), this.touch ? 100 : 134,
      `+${amount}`, {
        fontFamily: "monospace", fontSize: "15px",
        fontStyle: "bold", color: "#ffe084", stroke: "#161c22",
        strokeThickness: 3,
      },
    ).setScrollFactor(0).setDepth(2210);
    this.scene.tweens.add({
      targets: label, alpha: 0, y: label.y - 26,
      duration: 550, onComplete: () => label.destroy(),
    });
  }

  /** Legacy fallback; the dedicated GameOverScene owns live game-over UI. */
  showGameOver(
    round: number, kills: number, points: number,
    highScore: number, highestRound: number,
  ): void {
    this.scene.add.text(this.width / 2, this.height / 2,
      `GAME OVER • ROUND ${round}\n${kills} KILLS • ${points} PTS\n` +
      `BEST ${highScore} • ROUND ${highestRound}`, {
        align: "center", fontFamily: "monospace",
        fontSize: "22px", color: "#f5e5b0",
        backgroundColor: "#151a1fea", padding: { x: 24, y: 20 },
      },
    ).setOrigin(.5).setScrollFactor(0).setDepth(3001);
  }

  destroy(): void {
    const objects: Phaser.GameObjects.GameObject[] = [
      this.portraitFrame, this.portrait, ...this.hearts,
      this.healthTrack, this.healthFill, this.healthPointsText,
      this.scoreLabel, this.scoreValue, this.roundText, this.waveStateText,
      this.ammoPanel, this.gunIcon, this.ammoText, this.inventoryText,
      this.interactionText, this.statusText,
    ];
    for (const object of objects) object.destroy();
  }
}
