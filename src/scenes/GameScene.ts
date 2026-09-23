import Phaser from "phaser";
import { AudioController } from "../audio/AudioController";
import { CombatController } from "../combat/CombatController";
import { Player } from "../entities/Player";
import { RunState } from "../game/RunState";
import { InteractionController } from "../interactions/InteractionController";
import { InputController } from "../input/InputController";
import { LocalSettingsStore } from "../persistence/LocalSettingsStore";
import { Crosshair } from "../ui/Crosshair";
import { HUD } from "../ui/HUD";
import { Arena } from "../world/Arena";
import { CameraController } from "../world/CameraController";
import { WaveController } from "../zombies/WaveController";
import { ZombieController } from "../zombies/ZombieController";

export class GameScene extends Phaser.Scene {
  private arena: Arena | undefined;
  private player: Player | undefined;
  private inputController: InputController | undefined;
  private crosshair: Crosshair | undefined;
  private hud: HUD | undefined;
  private cameraController: CameraController | undefined;
  private zombies: ZombieController | undefined;
  private waves: WaveController | undefined;
  private combat: CombatController | undefined;
  private interactions: InteractionController | undefined;
  private runState: RunState | undefined;
  private audio: AudioController | undefined;
  private gameOver = false;

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
    this.runState = new RunState();
    this.audio = new AudioController(this);

    this.inputController = new InputController(
      this,
      this.cameras.main,
      this.player,
    );
    this.crosshair = new Crosshair(this);
    this.hud = new HUD(this);

    this.zombies = new ZombieController(this, this.arena, this.player);
    this.waves = new WaveController(this.arena, this.zombies);
    this.combat = new CombatController(
      this,
      this.player,
      this.arena,
      this.zombies,
      this.runState,
    );
    this.interactions = new InteractionController(
      this.player,
      this.arena,
      this.combat.inventory,
      this.runState,
    );
    this.cameraController = new CameraController(
      this.cameras.main,
      this.player,
      this.arena,
    );

    this.input.mouse?.disableContextMenu();
    this.game.canvas.style.cursor = this.inputController.touchMode
      ? "default"
      : "none";

    // Touch controls need a higher depth than the HUD, while the HUD
    // remains readable without competing for touch pointer events.
    this.refreshHud(0);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  override update(time: number, delta: number): void {
    if (
      !this.arena ||
      !this.player ||
      !this.inputController ||
      !this.crosshair ||
      !this.hud ||
      !this.zombies ||
      !this.waves ||
      !this.combat ||
      !this.interactions ||
      !this.runState
    ) return;

    if (this.gameOver) return;

    const input = this.inputController.read();

    if (input.pausePressed) {
      this.inputController.reset();
      this.player.setVelocity(0, 0);
      this.scene.pause();
      this.scene.launch("pause");
      return;
    }

    this.player.applyMovement(input.move);
    this.player.faceWorldPoint(input.aimWorld);
    this.arena.constrainPlayer(this.player);
    this.crosshair.setWorldPosition(input.aimWorld);

    this.player.updateSurvival(time, delta);
    this.waves.update(time);
    const healthBeforeZombieUpdate = this.player.health;
    this.zombies.update(time);

    if (this.player.health < healthBeforeZombieUpdate) {
      this.cameras.main.shake(90, 0.0025);
      this.audio?.play("hurt");
    }

    if (this.player.isDead) {
      this.endGame(time);
      return;
    }

    this.combat.update(input, time);
    this.interactions.update(input, time);

    for (const award of this.runState.consumePointAwards()) {
      this.hud.showPointGain(award);
    }

    this.refreshHud(time);
  }

  private refreshHud(now: number): void {
    if (
      !this.player ||
      !this.combat ||
      !this.interactions ||
      !this.hud ||
      !this.runState ||
      !this.waves
    ) return;

    this.hud.updateStatus(
      this.player.health,
      this.player.maxHealth,
      this.runState,
    );
    this.hud.updateWeapon(
      this.combat.inventory.activeWeapon.snapshot(),
    );
    this.hud.updateInventory(this.combat.inventory.snapshot());
    this.hud.updateWave(this.waves.snapshot(now));
    this.hud.updateInteraction(this.interactions.snapshot());
  }

  private endGame(now: number): void {
    if (
      this.gameOver ||
      !this.player ||
      !this.zombies ||
      !this.waves ||
      !this.hud ||
      !this.runState
    ) return;

    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.player.setTint(0x6b3434);
    this.zombies.stopAll();
    this.inputController?.reset();

    const wave = this.waves.snapshot(now);
    const persisted = new LocalSettingsStore().recordRun(
      this.runState.points,
      wave.round,
    );
    this.registry.set("persistedGameData", persisted);
    this.hud.showGameOver(
      wave.round,
      this.runState.kills,
      this.runState.points,
      persisted.highScore,
      persisted.highestRound,
    );

    const restart = (): void => {
      if (this.scene.isActive()) this.scene.restart();
    };
    this.input.once(Phaser.Input.Events.POINTER_DOWN, restart);
    this.input.keyboard?.once("keydown-ENTER", restart);
  }

  private shutdown(): void {
    this.inputController?.destroy();
    this.crosshair?.destroy();
    this.hud?.destroy();
    this.interactions?.destroy();
    this.combat?.destroy();
    this.zombies?.destroy();
    this.cameraController?.destroy();
    this.arena?.destroy();
    this.audio?.destroy();
    this.game.canvas.style.cursor = "default";

    this.inputController = undefined;
    this.crosshair = undefined;
    this.hud = undefined;
    this.interactions = undefined;
    this.combat = undefined;
    this.waves = undefined;
    this.zombies = undefined;
    this.cameraController = undefined;
    this.runState = undefined;
    this.player = undefined;
    this.arena = undefined;
    this.audio = undefined;
    this.gameOver = false;
  }
}
