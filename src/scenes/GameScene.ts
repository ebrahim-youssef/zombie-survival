import Phaser from "phaser";
import { Player } from "../entities/Player";
import { DesktopInput } from "../input/DesktopInput";
import { Crosshair } from "../ui/Crosshair";
import { Arena } from "../world/Arena";
import { CameraController } from "../world/CameraController";

export class GameScene extends Phaser.Scene {
  private arena: Arena | undefined;
  private player: Player | undefined;
  private desktopInput: DesktopInput | undefined;
  private crosshair: Crosshair | undefined;
  private cameraController: CameraController | undefined;

  constructor() {
    super("game");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#141614");

    this.arena = new Arena(this);

    const worldBounds = this.arena.getCameraBounds(220);
    this.physics.world.setBounds(
      worldBounds.x,
      worldBounds.y,
      worldBounds.width,
      worldBounds.height,
    );

    const spawn = this.arena.spawnPoint;
    this.player = new Player(this, spawn.x, spawn.y);
    this.desktopInput = new DesktopInput(this, this.cameras.main);
    this.crosshair = new Crosshair(this);

    this.cameraController = new CameraController(
      this.cameras.main,
      this.player,
      this.arena,
    );

    this.input.mouse?.disableContextMenu();
    this.game.canvas.style.cursor = "none";

    this.createHudPlaceholder();

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.shutdown,
      this,
    );
  }

  update(): void {
    if (
      !this.arena ||
      !this.player ||
      !this.desktopInput ||
      !this.crosshair
    ) {
      return;
    }

    const input = this.desktopInput.read();

    if (input.pausePressed) {
      this.scene.start("menu");
      return;
    }

    this.player.applyMovement(input.move);
    this.player.faceWorldPoint(input.aimWorld);
    this.arena.constrainPlayer(this.player);
    this.crosshair.setWorldPosition(input.aimWorld);
  }

  private createHudPlaceholder(): void {
    const camera = this.cameras.main;

    this.add
      .text(24, 22, "ROUND 1", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ede8dc",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.add
      .text(24, camera.height - 48, "HP 150   •   500 PTS", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ede8dc",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.add
      .text(camera.width - 24, camera.height - 48, "MR6   8 / 32", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ede8dc",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(2000);

    this.add
      .text(camera.width / 2, 22, "PHASE 1 • MOVE + AIM", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#b8ac86",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(2000);
  }

  private shutdown(): void {
    this.desktopInput?.destroy();
    this.crosshair?.destroy();
    this.cameraController?.destroy();
    this.arena?.destroy();

    this.game.canvas.style.cursor = "default";

    this.desktopInput = undefined;
    this.crosshair = undefined;
    this.cameraController = undefined;
    this.player = undefined;
    this.arena = undefined;
  }
}
