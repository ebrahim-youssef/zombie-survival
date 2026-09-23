import Phaser from "phaser";
import { ENV_TEXTURES, ensureEnvironmentArt } from "../art/EnvironmentArt";
import { WORLD_DEPTH } from "../art/worldLayers";
import type { RunState } from "../game/RunState";
import type { InventoryController } from "../weapons/InventoryController";
import {
  getWeaponDefinition,
  type WeaponId,
} from "../weapons/weaponDefinitions";

export interface WallBuyPrices {
  weaponPrice: number;
  refillPrice: number;
}

export class WallBuy {
  private readonly marker: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    readonly position: Phaser.Math.Vector2,
    readonly weaponId: WeaponId,
    private readonly prices: WallBuyPrices,
    private readonly inventory: InventoryController,
    private readonly runState: RunState,
  ) {
    const weapon = getWeaponDefinition(weaponId);

    ensureEnvironmentArt(scene);
    const depth = WORLD_DEPTH.wallDecal;
    this.marker = scene.add.image(
      position.x, position.y,
      weaponId === "mr6" ? ENV_TEXTURES.wallBuyMr6 : ENV_TEXTURES.wallBuyKuda,
    ).setScale(1.05).setDepth(depth);

    this.label = scene.add
      .text(
        position.x,
        position.y + 28,
        weapon.name + "  " + prices.weaponPrice,
        {
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#f0d27a",
        },
      )
      .setOrigin(0.5)
      .setDepth(depth + .01);
  }

  getPrompt(): string {
    const weapon = getWeaponDefinition(
      this.weaponId,
    );

    if (this.inventory.owns(this.weaponId)) {
      return "[E] Refill " + weapon.name + " Ammo — " + this.prices.refillPrice;
    }

    return "[E] Buy " + weapon.name + " — " + this.prices.weaponPrice;
  }

  interact(): string {
    const weapon = getWeaponDefinition(
      this.weaponId,
    );

    if (this.inventory.owns(this.weaponId)) {
      const owned = this.inventory.getOwnedWeapon(
        this.weaponId,
      );

      if (owned?.isFullyStocked) {
        return weapon.name + " ammo is already full.";
      }

      if (!this.runState.trySpend(this.prices.refillPrice)) {
        return "Not enough points.";
      }

      const refilled = this.inventory.refillOwned(
        this.weaponId,
      );

      if (!refilled) {
        return weapon.name + " ammo is already full.";
      }

      return weapon.name + " ammo refilled.";
    }

    if (!this.runState.trySpend(this.prices.weaponPrice)) {
      return "Not enough points.";
    }

    this.inventory.acquire(this.weaponId);
    return "Bought " + weapon.name + ".";
  }

  destroy(): void {
    this.marker.destroy();
    this.label.destroy();
  }
}
