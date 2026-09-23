import Phaser from "phaser";
import { ECONOMY_CONFIG } from "../config/economy";
import type { RunState } from "../game/RunState";
import type { InventoryController } from "../weapons/InventoryController";
import {
  getWeaponDefinition,
  type WeaponId,
} from "../weapons/weaponDefinitions";

type MysteryBoxState =
  | "idle"
  | "cycling"
  | "ready";

const MYSTERY_POOL: readonly WeaponId[] = [
  "kuda",
  "kn44",
  "krm262",
  "brm",
  "drakon",
];

export class MysteryBox {
  private state: MysteryBoxState = "idle";
  private cycleEndsAt = 0;
  private pickupExpiresAt = 0;
  private result: WeaponId | null = null;

  private readonly marker: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    readonly position: Phaser.Math.Vector2,
    private readonly inventory: InventoryController,
    private readonly runState: RunState,
  ) {
    this.marker = scene.add
      .rectangle(
        position.x,
        position.y,
        72,
        42,
        0x4f3822,
        1,
      )
      .setStrokeStyle(3, 0xd6ad55, 0.9)
      .setDepth(3);

    this.label = scene.add
      .text(
        position.x,
        position.y,
        "BOX",
        {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#f0d27a",
        },
      )
      .setOrigin(0.5)
      .setDepth(4);
  }

  update(now: number): void {
    if (
      this.state === "cycling" &&
      now >= this.cycleEndsAt
    ) {
      this.finishCycle(now);
      return;
    }

    if (
      this.state === "ready" &&
      now >= this.pickupExpiresAt
    ) {
      this.reset();
      return;
    }

    if (this.state === "cycling") {
      this.updateCyclingLabel(now);
    }
  }

  getPrompt(): string {
    switch (this.state) {
      case "idle":
        return "[E] Mystery Box — " + ECONOMY_CONFIG.mysteryBoxPrice;
      case "cycling":
        return "Mystery Box is cycling...";
      case "ready":
        return this.result
          ? "[E] Take " + getWeaponDefinition(this.result).name
          : "Mystery Box result unavailable";
    }
  }

  interact(now: number): string {
    if (this.state === "cycling") {
      return "Mystery Box is still cycling.";
    }

    if (this.state === "ready") {
      if (!this.result) {
        this.reset();
        return "Mystery Box reset.";
      }

      const weapon = getWeaponDefinition(this.result);
      this.inventory.acquire(this.result);

      const message = "Took " + weapon.name + ".";
      this.reset();
      return message;
    }

    const candidate = this.pickCandidate();

    if (!candidate) {
      return "No Mystery Box weapon available.";
    }

    if (!this.runState.trySpend(ECONOMY_CONFIG.mysteryBoxPrice)) {
      return "Not enough points.";
    }

    this.result = candidate;
    this.state = "cycling";
    this.cycleEndsAt =
      now + ECONOMY_CONFIG.mysteryBox.cycleDurationMs;

    this.marker.setFillStyle(0x6a4c27, 1);

    return "Mystery Box rolling...";
  }

  destroy(): void {
    this.marker.destroy();
    this.label.destroy();
  }

  private finishCycle(now: number): void {
    if (!this.result || this.inventory.owns(this.result)) {
      this.result = this.pickCandidate();
    }

    if (!this.result) {
      this.reset();
      return;
    }

    this.state = "ready";
    this.pickupExpiresAt =
      now + ECONOMY_CONFIG.mysteryBox.pickupTimeoutMs;

    this.marker.setFillStyle(0x80611f, 1);
    this.label.setText(
      getWeaponDefinition(this.result).name,
    );
  }

  private updateCyclingLabel(now: number): void {
    const candidates = this.availableCandidates();

    if (candidates.length === 0) {
      this.label.setText("...");
      return;
    }

    const interval =
      ECONOMY_CONFIG.mysteryBox.cycleLabelIntervalMs;

    const index =
      Math.floor(now / interval) % candidates.length;

    const id = candidates[index];

    this.label.setText(
      id ? getWeaponDefinition(id).name : "...",
    );
  }

  private pickCandidate(): WeaponId | null {
    const candidates = this.availableCandidates();

    if (candidates.length === 0) return null;

    const index = Phaser.Math.Between(
      0,
      candidates.length - 1,
    );

    return candidates[index] ?? null;
  }

  private availableCandidates(): WeaponId[] {
    return MYSTERY_POOL.filter(
      (id) => !this.inventory.owns(id),
    );
  }

  private reset(): void {
    this.state = "idle";
    this.result = null;
    this.cycleEndsAt = 0;
    this.pickupExpiresAt = 0;
    this.marker.setFillStyle(0x4f3822, 1);
    this.label.setText("BOX");
  }
}
