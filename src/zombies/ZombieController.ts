import Phaser from "phaser";
import { Zombie } from "../entities/Zombie";
import type { Player } from "../entities/Player";
import type { Arena, ArenaWindow } from "../world/Arena";

export class ZombieController {
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly selfCollider: Phaser.Physics.Arcade.Collider;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly arena: Arena,
    private readonly player: Player,
  ) {
    this.group = scene.physics.add.group();

    this.selfCollider = scene.physics.add.collider(
      this.group,
      this.group,
    );
  }

  update(now: number): void {
    for (const child of this.group.getChildren()) {
      if (child instanceof Zombie) {
        child.updateBehavior(now, this.player);
      }
    }
  }

  spawn(
    window: ArenaWindow,
    health: number,
    moveSpeed: number,
  ): Zombie {
    const inward = this.arena.center
      .clone()
      .subtract(window.center)
      .normalize();

    const entryTarget = window.center
      .clone()
      .add(inward.scale(54));

    const zombie = new Zombie(
      this.scene,
      window.outsideSpawn.x,
      window.outsideSpawn.y,
      entryTarget,
      health,
      moveSpeed,
    );

    this.group.add(zombie);

    return zombie;
  }

  getAliveCount(): number {
    let count = 0;

    for (const child of this.group.getChildren()) {
      if (child instanceof Zombie && !child.isDead) {
        count += 1;
      }
    }

    return count;
  }

  getAliveZombies(): Zombie[] {
    const zombies: Zombie[] = [];

    for (const child of this.group.getChildren()) {
      if (child instanceof Zombie && !child.isDead) {
        zombies.push(child);
      }
    }

    return zombies;
  }

  stopAll(): void {
    for (const child of this.group.getChildren()) {
      if (child instanceof Zombie) {
        child.setVelocity(0, 0);
      }
    }
  }

  destroy(): void {
    this.selfCollider.destroy();
    this.group.clear(true, true);
  }
}
