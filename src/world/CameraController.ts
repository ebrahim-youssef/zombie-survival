import Phaser from "phaser";
import type { Arena } from "./Arena";

export class CameraController {
  constructor(
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    target: Phaser.GameObjects.GameObject & { x: number; y: number },
    arena: Arena,
  ) {
    const bounds = arena.getCameraBounds(160);

    this.camera.setBounds(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );

    this.camera.startFollow(target, true, 0.09, 0.09);
    this.camera.setRoundPixels(true);
  }

  destroy(): void {
    this.camera.stopFollow();
  }
}
