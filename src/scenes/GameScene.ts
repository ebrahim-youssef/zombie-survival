import Phaser from "phaser";
import { AudioController } from "../audio/AudioController";
import { CombatController } from "../combat/CombatController";
import { DebugController } from "../debug/DebugController";
import { isDebugSession } from "../debug/isDebugSession";
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
    );
    this.damageFlash = this.add.rectangle(
      this.cameras.main.width / 2, this.cameras.main.height / 2,
      this.cameras.main.width, this.cameras.main.height, 0xb53232,
    ).setScrollFactor(0).setDepth(1000).setAlpha(0);

    // In any deployed build, append ?debug=1 for a QA session.
    // Normal public page visits never instantiate developer controls.
    if (isDebugSession()) {
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
  debugShortcutsState():ReturnType<DebugController["snapshot"]>|null{
    return this.debug?.snapshot()??null;
  }

  debugForceGameOver():void{
    if(!import.meta.env.DEV)return;
    this.endGame(this.clock.now);
  }

  debugUsesTouch():boolean{
    return this.inputController?.touchMode??false;
  }

  debugMobileState():{engaged:boolean;pointerId:number|null;firing:boolean}|null{
    return this.inputController?.debugMobileState()??null;
  }
  debugPlayerPosition():{x:number;y:number}|null{
    return this.player ? {x:this.player.x,y:this.player.y} : null;
  }
  debugCameraZoom():number{
    return this.cameras.main.zoom;
  }
  /**
   * Browser-only test: fire the real MR6 at a stationary enemy whose body is
   * 35px above the foot origin. Verifies the actual weapon/health/score path.
   */
  debugFireAtAlignedTarget():{
    killed:boolean;ammoUsed:number;pointsGained:number;
    playerFootY:number;playerCombatY:number;physicsFootY:number;
    targetFootY:number;targetCombatY:number;targetPhysicsFootY:number;
    muzzleY:number;visualWidth:number;
  }|null{
    if(!import.meta.env.DEV||!this.player||!this.arena||
       !this.zombies||!this.combat||!this.runState)return null;
    const player=this.player;
    const target=this.zombies.spawn(this.arena.windows[0]!,10,0);
    target.setPosition(player.x+150,player.y);
    const body=target.body;
    if(body instanceof Phaser.Physics.Arcade.Body){
      body.reset(target.x,target.y);
      // Phaser Body.reset leaves the raw top-left until next physics step.
      body.updateFromGameObject();
    }
    const targetPhysicsFootY=body instanceof Phaser.Physics.Arcade.Body
      ?body.center.y:NaN;
    const aimed=target.getAimPoint();
    const anchor=player.getAimAnchor();
    const barrel=player.getMuzzlePosition(aimed.clone().subtract(anchor));
    const beforeAmmo=this.combat.inventory.activeWeapon.snapshot().magazineAmmo;
    const beforePoints=this.runState.points;
    this.combat.update({
      move:new Phaser.Math.Vector2(),aimWorld:aimed,
      fireHeld:true,firePressed:true,
      meleePressed:false,reloadPressed:false,interactPressed:false,
      slotPressed:0,cycleWeapon:0,pausePressed:false,
    },this.clock.now+750);
    const playerBody=player.body;
    return {
      killed:target.isDead,
      ammoUsed:beforeAmmo-this.combat.inventory.activeWeapon.snapshot().magazineAmmo,
      pointsGained:this.runState.points-beforePoints,
      playerFootY:player.y,
      playerCombatY:player.hurtbox.centerY,
      physicsFootY:playerBody instanceof Phaser.Physics.Arcade.Body
        ?playerBody.center.y:NaN,
      targetFootY:target.y,
      targetCombatY:target.hurtbox.centerY,
      targetPhysicsFootY,
      muzzleY:barrel.y,
      visualWidth:player.displayWidth,
    };
  }

  /** Browser-only regression for the real 150-damage melee pipeline. */
  debugMeleeAtAlignedTarget():{killed:boolean;pointsGained:number}|null{
    if(!import.meta.env.DEV||!this.player||!this.arena||
      !this.zombies||!this.combat||!this.runState)return null;
    const zombie=this.zombies.spawn(this.arena.windows[0]!,100,0);
    zombie.setPosition(this.player.x+55,this.player.y);
    const body=zombie.body;
    if(body instanceof Phaser.Physics.Arcade.Body){
      body.reset(zombie.x,zombie.y);
      body.updateFromGameObject();
    }
    const before=this.runState.points;
    this.combat.update({
      move:new Phaser.Math.Vector2(),aimWorld:zombie.getAimPoint(),
      fireHeld:false,firePressed:false,meleePressed:true,
      reloadPressed:false,interactPressed:false,slotPressed:0,
      cycleWeapon:0,pausePressed:false,
    },this.clock.now+1500);
    return {killed:zombie.isDead,pointsGained:this.runState.points-before};
  }

  debugPerformanceState():{
    gameObjects:number;
    tweens:number;
    aliveZombies:number;
    round:number;
    actualFps:number;
    loopDelta:number;
    gameplayMs:number;
  }|null{
    if(!this.zombies||!this.waves)return null;
    return {
      gameObjects:this.children.length,
      tweens:this.tweens.getTweens().length,
      aliveZombies:this.zombies.getAliveCount(),
      round:this.waves.snapshot(this.clock.now).round,
      actualFps:this.game.loop.actualFps,
      loopDelta:this.game.loop.delta,
      gameplayMs:this.clock.now,
    };
  }

  debugInteractionState():{
    points:number;
    prompt:string|null;
    status:string|null;
    inventory:ReturnType<import("../weapons/InventoryController").InventoryController["snapshot"]>;
    active:ReturnType<import("../weapons/WeaponController").WeaponController["snapshot"]>;
  }|null{
    if(!this.runState||!this.interactions||!this.combat)return null;
    const snap=this.interactions.snapshot();
    return {
      points:this.runState.points,
      prompt:snap.prompt,
      status:snap.status,
      inventory:this.combat.inventory.snapshot(),
      active:this.combat.inventory.activeWeapon.snapshot(),
    };
  }

  debugMoveToInteraction(
    target:"mr6"|"kuda"|"box",
  ):boolean{
    if(!import.meta.env.DEV||!this.player||!this.arena)return false;
    const point=target==="mr6"
      ?this.arena.interactions.mr6WallBuy
      :target==="kuda"
        ?this.arena.interactions.kudaWallBuy
        :this.arena.interactions.mysteryBox;
    this.player.setPosition(point.x,point.y);
    const body=this.player.body;
    if(body instanceof Phaser.Physics.Arcade.Body){
      body.reset(point.x,point.y);
      body.updateFromGameObject();
    }
    return true;
  }

  debugAddPoints(amount:number):number{
    if(!import.meta.env.DEV||!this.runState||!Number.isFinite(amount))return -1;
    this.runState.points=Math.max(0,Math.floor(this.runState.points+amount));
    return this.runState.points;
  }

  debugAdvanceInteraction(ms:number):void{
    if(!import.meta.env.DEV||!this.interactions||!(ms>=0))return;
    this.interactions.update({
      move:new Phaser.Math.Vector2(),
      aimWorld:new Phaser.Math.Vector2(),
      fireHeld:false,firePressed:false,meleePressed:false,
      reloadPressed:false,interactPressed:false,slotPressed:0,
      cycleWeapon:0,pausePressed:false,
    },this.clock.now+ms);
  }

  debugTimingState():{
    now:number;
    weapon:ReturnType<import("../weapons/WeaponController").WeaponController["snapshot"]>;
    wave:ReturnType<WaveController["snapshot"]>;
  }|null{
    if(!this.combat||!this.waves)return null;
    return {
      now:this.clock.now,
      weapon:this.combat.inventory.activeWeapon.snapshot(),
      wave:this.waves.snapshot(this.clock.now),
    };
  }

  debugAmmo():number{
    return this.combat?.inventory.activeWeapon.snapshot().magazineAmmo??-1;
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
    // QA cheats must not overwrite local records from ordinary play.
    const store = new LocalSettingsStore();
    const saved = isDebugSession()
      ? store.load()
      : store.recordRun(this.runState.points, wave.round);
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
