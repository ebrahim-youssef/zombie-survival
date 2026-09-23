import Phaser from "phaser";
import { CombatController } from "../combat/CombatController";
import { Player } from "../entities/Player";
import { DesktopInput } from "../input/DesktopInput";
import { Crosshair } from "../ui/Crosshair";
import { HUD } from "../ui/HUD";
import { Arena } from "../world/Arena";
import { CameraController } from "../world/CameraController";

export class GameScene extends Phaser.Scene {
  private arena: Arena | undefined;
  private player: Player | undefined;
  private desktopInput: DesktopInput | undefined;
  private crosshair: Crosshair | undefined;
  private hud: HUD | undefined;
  private cameraController: CameraController | undefined;
  private combat: CombatController | undefined;

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
    this.hud = new HUD(this);
    this.combat = new CombatController(
      this,
      this.player,
      this.arena,
    );

    this.cameraController = new CameraController(
      this.cameras.main,
      this.player,
      this.arena,
    );

    this.input.mouse?.disableContextMenu();
    this.game.canvas.style.cursor = "none";

    this.hud.updateWeapon(this.combat.weapon.snapshot());

    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.shutdown,
      this,
    );
  }

  override update(time: number): void {
    if (
      !this.arena ||
      !this.player ||
      !this.desktopInput ||
      !this.crosshair ||
      !this.hud ||
      !this.combat
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

    this.combat.update(input, time);
    this.hud.updateWeapon(this.combat.weapon.snapshot());
  }

  private shutdown(): void {
    this.desktopInput?.destroy();
    this.crosshair?.destroy();
    this.hud?.destroy();
    this.combat?.destroy();
    this.cameraController?.destroy();
    this.arena?.destroy();

    this.game.canvas.style.cursor = "default";

    this.desktopInput = undefined;
    this.crosshair = undefined;
    this.hud = undefined;
    this.combat = undefined;
    this.cameraController = undefined;
    this.player = undefined;
    this.arena = undefined;
  }
}
