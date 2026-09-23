import Phaser from "phaser";
import { ECONOMY_CONFIG } from "../config/economy";
import { PLAYER_CONFIG } from "../config/player";
import type { Player } from "../entities/Player";
import type { RunState } from "../game/RunState";
import type { InputFrame } from "../types/game";
import type { InventoryController } from "../weapons/InventoryController";
import type { Arena } from "../world/Arena";
import type { InteractionSnapshot } from "./InteractionTypes";
import { MysteryBox } from "./MysteryBox";
import { WallBuy } from "./WallBuy";

type NearbyInteraction =
  | {
      kind: "wall";
      distance: number;
      target: WallBuy;
    }
  | {
      kind: "box";
      distance: number;
      target: MysteryBox;
    };

export class InteractionController {
  private readonly wallBuys: readonly WallBuy[];
  private readonly mysteryBox: MysteryBox;

  private prompt: string | null = null;
  private status: string | null = null;
  private statusExpiresAt = 0;

  constructor(
    private readonly player: Player,
    arena: Arena,
    inventory: InventoryController,
    runState: RunState,
  ) {
    this.wallBuys = [
      new WallBuy(
        player.scene,
        arena.interactions.mr6WallBuy,
        "mr6",
        ECONOMY_CONFIG.wallBuys.mr6,
        inventory,
        runState,
      ),
      new WallBuy(
        player.scene,
        arena.interactions.kudaWallBuy,
        "kuda",
        ECONOMY_CONFIG.wallBuys.kuda,
        inventory,
        runState,
      ),
    ];

    this.mysteryBox = new MysteryBox(
      player.scene,
      arena.interactions.mysteryBox,
      inventory,
      runState,
    );
  }

  update(input: InputFrame, now: number): void {
    this.mysteryBox.update(now);

    if (this.status && now >= this.statusExpiresAt) {
      this.status = null;
      this.statusExpiresAt = 0;
    }

    const nearby = this.findNearest();

    if (!nearby) {
      this.prompt = null;
      return;
    }

    this.prompt = nearby.target.getPrompt();

    if (!input.interactPressed) return;

    const message =
      nearby.kind === "wall"
        ? nearby.target.interact()
        : nearby.target.interact(now);

    this.setStatus(message, now);
  }

  snapshot(): InteractionSnapshot {
    return {
      prompt: this.prompt,
      status: this.status,
    };
  }

  destroy(): void {
    for (const wallBuy of this.wallBuys) {
      wallBuy.destroy();
    }

    this.mysteryBox.destroy();
  }

  private findNearest(): NearbyInteraction | null {
    let nearest: NearbyInteraction | null = null;

    for (const wallBuy of this.wallBuys) {
      const distance = this.distanceTo(wallBuy.position);

      if (
        distance <= PLAYER_CONFIG.interactionRange &&
        (!nearest || distance < nearest.distance)
      ) {
        nearest = {
          kind: "wall",
          distance,
          target: wallBuy,
        };
      }
    }

    const boxDistance = this.distanceTo(
      this.mysteryBox.position,
    );

    if (
      boxDistance <= PLAYER_CONFIG.interactionRange &&
      (!nearest || boxDistance < nearest.distance)
    ) {
      nearest = {
        kind: "box",
        distance: boxDistance,
        target: this.mysteryBox,
      };
    }

    return nearest;
  }

  private distanceTo(point: Phaser.Math.Vector2): number {
    return Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      point.x,
      point.y,
    );
  }

  private setStatus(message: string, now: number): void {
    this.status = message;
    this.statusExpiresAt =
      now + ECONOMY_CONFIG.mysteryBox.feedbackDurationMs;
  }
}
