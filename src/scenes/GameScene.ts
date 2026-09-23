import Phaser from "phaser";
import { AudioController } from "../audio/AudioController";
import { CombatController } from "../combat/CombatController";
import { DebugController } from "../debug/DebugController";
import { Player } from "../entities/Player";
import { GameplayClock } from "../game/GameplayClock";
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
  private debug: DebugController | undefined;
  private damageFlash: Phaser.GameObjects.Rectangle | undefined;
  private clock = new GameplayClock();
  private gameOver = false;

  constructor() { super("game"); }

  create(): void {
    this.clock = new GameplayClock();
    this.cameras.main.setBackgroundColor("#141614");
    this.arena = new Arena(this);
    const bounds = this.arena.getCameraBounds(220);
    this.physics.world.setBounds(
      bounds.x, bounds.y, bounds.width, bounds.height,
    );
    const spawn = this.arena.spawnPoint;
    this.player = new Player(this, spawn.x, spawn.y);
    this.runState = new RunState();
    this.audio = new AudioController(this);
    this.inputController = new InputController(
      this,this.cameras.main,this.player,this.arena,
      ()=>this.zombies?.getAliveZombies()??[],
    );
    this.crosshair = new Crosshair(this);
    this.hud = new HUD(this);

    this.zombies = new ZombieController(this, this.arena, this.player);
    this.waves = new WaveController(this.arena, this.zombies);
    this.combat = new CombatController(
      this, this.player, this.arena, this.zombies, this.runState, this.audio,
    );
    this.interactions = new InteractionController(
      this.player, this.arena, this.combat.inventory, this.runState,
    );
    this.cameraController = new CameraController(
      this.cameras.main,this.player,this.arena,
      this.inputController.touchMode,
    );
    this.damageFlash = this.add.rectangle(
      this.cameras.main.width / 2, this.cameras.main.height / 2,
      this.cameras.main.width, this.cameras.main.height, 0xb53232,
    ).setScrollFactor(0).setDepth(1000).setAlpha(0);

    if (import.meta.env.DEV) {
      this.debug = new DebugController(
        this, this.arena, this.player,
        this.zombies, this.waves, this.combat, this.runState,
      );
    }

    this.input.mouse?.disableContextMenu();
    this.game.canvas.style.cursor = this.inputController.touchMode
      ? "default"
      : "none";
    this.resizeUI(this.scale.width,this.scale.height);
    this.refreshHud(0);
    this.scale.on(Phaser.Scale.Events.RESIZE,this.onResize,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,this.shutdown,this);
  }

  override update(_globalTime: number, delta: number): void {
    if (
      !this.arena || !this.player || !this.inputController ||
      !this.crosshair || !this.hud || !this.zombies || !this.waves ||
      !this.combat || !this.interactions || !this.runState
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

    const now = this.clock.advance(delta);
    const activeDelta = Number.isFinite(delta)
      ? Phaser.Math.Clamp(delta, 0, 100)
      : 0;

    this.player.applyMovement(input.move);
    this.player.faceWorldPoint(input.aimWorld);
    this.arena.constrainPlayer(this.player);
    this.crosshair.setWorldPosition(input.aimWorld);
    this.player.updateSurvival(now, activeDelta);
    this.waves.update(now);

    const hpBefore = this.player.health;
    this.zombies.update(now);
    if (this.player.health < hpBefore) {
      this.cameras.main.shake(90, 0.0025);
      this.audio?.play("hurt");
      if (this.damageFlash) {
        this.tweens.killTweensOf(this.damageFlash);
        this.damageFlash.setAlpha(0.23);
        this.tweens.add({
          targets: this.damageFlash,
          alpha: 0,
          duration: 300,
        });
      }
    }

    if (this.player.isDead) {
      this.endGame(now);
      return;
    }

    this.combat.update(input, now);
    this.player.updateVisual(
      now,
      input.move.x!==0||input.move.y!==0,
      this.combat.inventory.activeWeapon.isReloading,
    );
    this.interactions.update(input, now);
    for (const amount of this.runState.consumePointAwards()) {
      this.hud.showPointGain(amount);
    }
    this.debug?.update(now);
    this.refreshHud(now);
  }

  /** Dev-only browser smoke hook, absent from production entry points. */
  debugForceGameOver():void{
    if(!import.meta.env.DEV)return;
    this.endGame(this.clock.now);
  }

  debugUsesTouch():boolean{
    return this.inputController?.touchMode??false;
  }

  private refreshHud(now: number): void {
    if (
      !this.player || !this.combat || !this.interactions ||
      !this.hud || !this.runState || !this.waves
    ) return;
    this.hud.updateStatus(
      this.player.health, this.player.maxHealth, this.runState,
    );
    this.hud.updateWeapon(this.combat.inventory.activeWeapon.snapshot());
    this.hud.updateInventory(this.combat.inventory.snapshot());
    this.hud.updateWave(this.waves.snapshot(now));
    this.hud.updateInteraction(this.interactions.snapshot());
  }

  private endGame(now: number): void {
    if (
      this.gameOver || !this.player || !this.zombies ||
      !this.waves || !this.hud || !this.runState
    ) return;
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.player.setTint(0x6b3434);
    this.zombies.stopAll();
    this.inputController?.reset();

    const wave = this.waves.snapshot(now);
    const saved = new LocalSettingsStore().recordRun(
      this.runState.points, wave.round,
    );
    this.registry.set("persistedGameData", saved);
    // Dedicated overlay receives input while gameplay and touch buttons
    // are paused, fixing the blocked click/Enter restart regression.
    this.scene.pause();
    this.scene.launch("gameOver",{
      round:wave.round,kills:this.runState.kills,points:this.runState.points,
      highScore:saved.highScore,highestRound:saved.highestRound,
    });
  }

  private onResize():void{
    this.resizeUI(this.scale.width,this.scale.height);
  }

  private resizeUI(width:number,height:number):void{
    this.cameraController?.resize(width,height);
    this.inputController?.resize(width,height);
    this.hud?.resize(width,height,this.inputController?.touchMode??false);
    this.damageFlash?.setPosition(width/2,height/2).setSize(width,height);
  }

  private shutdown(): void {
    this.scale.off(Phaser.Scale.Events.RESIZE,this.onResize,this);
    this.debug?.destroy();
    this.inputController?.destroy();
    this.crosshair?.destroy();
    this.hud?.destroy();
    this.interactions?.destroy();
    this.combat?.destroy();
    // Phaser's Arcade Physics plugin already destroys its Groups and
    // Colliders before custom Scene SHUTDOWN listeners run. Destroying the
    // group again here throws (Group.children is already undefined) and
    // prevents Game Over -> Restart from creating the next GameScene.
    this.cameraController?.destroy();
    this.arena?.destroy();
    this.audio?.destroy();
    this.damageFlash?.destroy();
    this.game.canvas.style.cursor = "default";
    this.debug = undefined;
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
    this.damageFlash = undefined;
    this.gameOver = false;
  }
}
