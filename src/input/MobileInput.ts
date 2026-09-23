import Phaser from "phaser";
import type { Player } from "../entities/Player";
import type { InputFrame } from "../types/game";
import type { InputSource } from "./InputSource";

interface StickState {
  center: Phaser.Math.Vector2;
  radius: number;
  pointerId: number | null;
  base: Phaser.GameObjects.Arc;
  knob: Phaser.GameObjects.Arc;
}

export class MobileInput implements InputSource {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];

  private readonly moveVector = new Phaser.Math.Vector2();
  private readonly aimDirection = new Phaser.Math.Vector2(1, 0);
  private readonly aimWorld = new Phaser.Math.Vector2();

  private readonly movementStick: StickState;
  private readonly aimStick: StickState;

  private fireHeld = false;
  private firePressed = false;
  private firePointerId: number | null = null;

  private meleePressed = false;
  private reloadPressed = false;
  private interactPressed = false;
  private cycleWeapon: -1 | 0 | 1 = 0;
  private pausePressed = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    private readonly player: Player,
  ) {
    scene.input.addPointer(5);

    const width = camera.width;
    const height = camera.height;

    this.movementStick = this.createStick(
      145,
      height - 145,
      76,
      "MOVE",
    );

    this.aimStick = this.createStick(
      width - 145,
      height - 145,
      74,
      "AIM",
    );

    this.createActionButton(
      width - 305,
      height - 130,
      45,
      "FIRE",
      (pointer) => {
        this.fireHeld = true;
        this.firePressed = true;
        this.firePointerId = pointer.id;
      },
    );

    this.createActionButton(
      width - 400,
      height - 88,
      34,
      "MELEE",
      () => {
        this.meleePressed = true;
      },
    );

    this.createActionButton(
      width - 305,
      height - 55,
      31,
      "R",
      () => {
        this.reloadPressed = true;
      },
    );

    this.createActionButton(
      width - 408,
      height - 178,
      35,
      "USE",
      () => {
        this.interactPressed = true;
      },
    );

    this.createActionButton(
      width - 302,
      height - 228,
      32,
      "SWAP",
      () => {
        this.cycleWeapon = 1;
      },
    );

    this.createActionButton(
      width - 48,
      48,
      28,
      "II",
      () => {
        this.pausePressed = true;
      },
    );

    scene.input.on(
      Phaser.Input.Events.POINTER_MOVE,
      this.onPointerMove,
      this,
    );

    scene.input.on(
      Phaser.Input.Events.POINTER_UP,
      this.onPointerUp,
      this,
    );
  }

  read(): InputFrame {
    this.aimWorld.set(
      this.player.x + this.aimDirection.x * 420,
      this.player.y + this.aimDirection.y * 420,
    );

    const frame: InputFrame = {
      move: this.moveVector,
      aimWorld: this.aimWorld,
      fireHeld: this.fireHeld,
      firePressed: this.firePressed,
      meleePressed: this.meleePressed,
      reloadPressed: this.reloadPressed,
      interactPressed: this.interactPressed,
      slotPressed: 0,
      cycleWeapon: this.cycleWeapon,
      pausePressed: this.pausePressed,
    };

    this.firePressed = false;
    this.meleePressed = false;
    this.reloadPressed = false;
    this.interactPressed = false;
    this.cycleWeapon = 0;
    this.pausePressed = false;

    return frame;
  }

  reset(): void {
    this.moveVector.set(0, 0);

    this.movementStick.pointerId = null;
    this.aimStick.pointerId = null;

    this.movementStick.knob.setPosition(
      this.movementStick.center.x,
      this.movementStick.center.y,
    );

    this.aimStick.knob.setPosition(
      this.aimStick.center.x,
      this.aimStick.center.y,
    );

    this.fireHeld = false;
    this.firePressed = false;
    this.firePointerId = null;

    this.meleePressed = false;
    this.reloadPressed = false;
    this.interactPressed = false;
    this.cycleWeapon = 0;
    this.pausePressed = false;
  }

  destroy(): void {
    this.reset();

    this.scene.input.off(
      Phaser.Input.Events.POINTER_MOVE,
      this.onPointerMove,
      this,
    );

    this.scene.input.off(
      Phaser.Input.Events.POINTER_UP,
      this.onPointerUp,
      this,
    );

    for (const object of this.objects) {
      object.destroy();
    }

    this.objects.length = 0;
  }

  private createStick(
    x: number,
    y: number,
    radius: number,
    label: string,
  ): StickState {
    const base = this.scene.add
      .circle(
        x,
        y,
        radius,
        0x111312,
        0.48,
      )
      .setStrokeStyle(
        3,
        0xd8d3c7,
        0.48,
      )
      .setScrollFactor(0)
      .setDepth(4000)
      .setInteractive();

    const knob = this.scene.add
      .circle(
        x,
        y,
        29,
        0xd6ad55,
        0.42,
      )
      .setStrokeStyle(
        2,
        0xf0d27a,
        0.65,
      )
      .setScrollFactor(0)
      .setDepth(4001);

    const text = this.scene.add
      .text(
        x,
        y + radius + 17,
        label,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#d8d3c7",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001)
      .setAlpha(0.72);

    const state: StickState = {
      center: new Phaser.Math.Vector2(x, y),
      radius,
      pointerId: null,
      base,
      knob,
    };

    base.on(
      Phaser.Input.Events.POINTER_DOWN,
      (pointer: Phaser.Input.Pointer) => {
        state.pointerId = pointer.id;
        this.updateStick(
          state,
          pointer,
          state === this.movementStick
            ? "move"
            : "aim",
        );
      },
    );

    this.objects.push(
      base,
      knob,
      text,
    );

    return state;
  }

  private createActionButton(
    x: number,
    y: number,
    radius: number,
    label: string,
    onDown: (
      pointer: Phaser.Input.Pointer,
    ) => void,
  ): void {
    const button = this.scene.add
      .circle(
        x,
        y,
        radius,
        0x262822,
        0.72,
      )
      .setStrokeStyle(
        2,
        0xd6ad55,
        0.8,
      )
      .setScrollFactor(0)
      .setDepth(4000)
      .setInteractive();

    const text = this.scene.add
      .text(
        x,
        y,
        label,
        {
          align: "center",
          fontFamily: "monospace",
          fontSize: label.length > 4 ? "11px" : "13px",
          color: "#f0d27a",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(4001);

    button.on(
      Phaser.Input.Events.POINTER_DOWN,
      (
        pointer: Phaser.Input.Pointer,
      ) => {
        button.setAlpha(1);
        onDown(pointer);
      },
    );

    button.on(
      Phaser.Input.Events.POINTER_UP,
      () => {
        button.setAlpha(0.72);
      },
    );

    button.on(
      Phaser.Input.Events.POINTER_OUT,
      () => {
        button.setAlpha(0.72);
      },
    );

    this.objects.push(
      button,
      text,
    );
  }

  private onPointerMove(
    pointer: Phaser.Input.Pointer,
  ): void {
    if (
      this.movementStick.pointerId ===
      pointer.id
    ) {
      this.updateStick(
        this.movementStick,
        pointer,
        "move",
      );
    }

    if (
      this.aimStick.pointerId ===
      pointer.id
    ) {
      this.updateStick(
        this.aimStick,
        pointer,
        "aim",
      );
    }
  }

  private onPointerUp(
    pointer: Phaser.Input.Pointer,
  ): void {
    if (
      this.movementStick.pointerId ===
      pointer.id
    ) {
      this.movementStick.pointerId = null;
      this.moveVector.set(0, 0);
      this.movementStick.knob.setPosition(
        this.movementStick.center.x,
        this.movementStick.center.y,
      );
    }

    if (
      this.aimStick.pointerId ===
      pointer.id
    ) {
      this.aimStick.pointerId = null;
      this.aimStick.knob.setPosition(
        this.aimStick.center.x,
        this.aimStick.center.y,
      );
    }

    if (
      this.firePointerId ===
      pointer.id
    ) {
      this.firePointerId = null;
      this.fireHeld = false;
    }
  }

  private updateStick(
    stick: StickState,
    pointer: Phaser.Input.Pointer,
    kind: "move" | "aim",
  ): void {
    const delta = new Phaser.Math.Vector2(
      pointer.x - stick.center.x,
      pointer.y - stick.center.y,
    );

    const distance = delta.length();

    if (distance > stick.radius) {
      delta
        .normalize()
        .scale(stick.radius);
    }

    stick.knob.setPosition(
      stick.center.x + delta.x,
      stick.center.y + delta.y,
    );

    const deadzone =
      stick.radius * 0.2;

    if (distance < deadzone) {
      if (kind === "move") {
        this.moveVector.set(0, 0);
      }

      return;
    }

    if (kind === "aim") {
      this.aimDirection
        .copy(delta)
        .normalize();
      return;
    }

    const angle = Math.atan2(
      delta.y,
      delta.x,
    );

    const snappedAngle =
      Math.round(
        angle / (Math.PI / 4),
      ) *
      (Math.PI / 4);

    this.moveVector.set(
      Math.round(
        Math.cos(snappedAngle),
      ),
      Math.round(
        Math.sin(snappedAngle),
      ),
    );
  }
}
