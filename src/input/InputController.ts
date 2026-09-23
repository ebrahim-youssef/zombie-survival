import type Phaser from "phaser";
import type { Player } from "../entities/Player";
import type { InputFrame } from "../types/game";
import { DesktopInput } from "./DesktopInput";
import type { InputSource } from "./InputSource";
import { MobileInput } from "./MobileInput";

export class InputController implements InputSource {
  private readonly source: InputSource;
  readonly touchMode: boolean;

  constructor(
    scene: Phaser.Scene,
    camera: Phaser.Cameras.Scene2D.Camera,
    player: Player,
  ) {
    this.touchMode = InputController.shouldUseTouch();
    this.source = this.touchMode
      ? new MobileInput(scene, camera, player)
      : new DesktopInput(scene, camera);
  }

  read(): InputFrame { return this.source.read(); }
  reset(): void { this.source.reset(); }
  destroy(): void { this.source.destroy(); }

  private static shouldUseTouch(): boolean {
    // A laptop with a touchscreen should retain mouse+keyboard controls
    // if its PRIMARY pointer is fine. Mobile primary pointers are coarse.
    return (
      window.matchMedia("(pointer: coarse)").matches &&
      (navigator.maxTouchPoints > 0 || "ontouchstart" in window)
    );
  }
}
