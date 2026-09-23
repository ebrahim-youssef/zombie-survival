import Phaser from "phaser";
import type { InputFrame } from "../types/game";
import type { InputSource } from "./InputSource";

interface MovementKeys {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
}

export class DesktopInput implements InputSource {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly movement: MovementKeys;
  private readonly reload: Phaser.Input.Keyboard.Key;
  private readonly interact: Phaser.Input.Keyboard.Key;
  private readonly slot1: Phaser.Input.Keyboard.Key;
  private readonly slot2: Phaser.Input.Keyboard.Key;
  private readonly escape: Phaser.Input.Keyboard.Key;
  private readonly moveVector = new Phaser.Math.Vector2();
  private readonly aimWorld = new Phaser.Math.Vector2();

  private previousLeftDown = false;
  private previousRightDown = false;
  private wheelDelta = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
  ) {
    const keyboard = scene.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.cursors = keyboard.createCursorKeys();
    this.movement = {
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.reload = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.interact = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.slot1 = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.slot2 = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.escape = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    scene.input.on(Phaser.Input.Events.POINTER_WHEEL, this.onWheel, this);
  }

  read(): InputFrame {
    const pointer = this.scene.input.activePointer;
    const leftDown = pointer.leftButtonDown();
    const rightDown = pointer.rightButtonDown();

    pointer.positionToCamera(this.camera, this.aimWorld);

    const moveX =
      Number(this.movement.d.isDown || this.cursors.right.isDown) -
      Number(this.movement.a.isDown || this.cursors.left.isDown);

    const moveY =
      Number(this.movement.s.isDown || this.cursors.down.isDown) -
      Number(this.movement.w.isDown || this.cursors.up.isDown);

    this.moveVector.set(moveX, moveY);

    const frame: InputFrame = {
      move: this.moveVector,
      aimWorld: this.aimWorld,
      fireHeld: leftDown,
      firePressed: leftDown && !this.previousLeftDown,
      meleePressed: rightDown && !this.previousRightDown,
      reloadPressed: Phaser.Input.Keyboard.JustDown(this.reload),
      interactPressed: Phaser.Input.Keyboard.JustDown(this.interact),
      slotPressed: Phaser.Input.Keyboard.JustDown(this.slot1)
        ? 1
        : Phaser.Input.Keyboard.JustDown(this.slot2)
          ? 2
          : 0,
      cycleWeapon: this.consumeWheel(),
      pausePressed: Phaser.Input.Keyboard.JustDown(this.escape),
    };

    this.previousLeftDown = leftDown;
    this.previousRightDown = rightDown;

    return frame;
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_WHEEL, this.onWheel, this);
  }

  private onWheel(
    _pointer: Phaser.Input.Pointer,
    _currentlyOver: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number,
  ): void {
    this.wheelDelta = Math.sign(deltaY);
  }

  private consumeWheel(): -1 | 0 | 1 {
    const direction =
      this.wheelDelta === 0
        ? 0
        : this.wheelDelta > 0
          ? 1
          : -1;

    this.wheelDelta = 0;
    return direction;
  }
}
