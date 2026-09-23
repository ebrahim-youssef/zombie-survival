import Phaser from "phaser";
import {PLAYER_CONFIG} from "../config/player";
import type {FacingDirection} from "../types/game";
import {ensureCharacterArt,characterTexture,characterFrameCount,CHARACTER_FEET_Y,CHARACTER_H,CHARACTER_W,CHARACTER_SCALE} from "../art/CharacterArt";
import {facingFromVector} from "../art/directions";
import { actorDepth } from "../art/worldLayers";
import { ACTOR_HITBOXES, actorHurtbox, footBodyOffsets } from "../combat/hurtbox";

const DIAGONAL_COMPONENT=1/Math.sqrt(2);
type PlayerAction="shoot"|"melee"|"reload"|"hurt";
export class Player extends Phaser.Physics.Arcade.Sprite{
  facing:FacingDirection="s";
  private currentHealth:number=PLAYER_CONFIG.maxHealth;
  private lastDamageAt=Number.NEGATIVE_INFINITY;
  private godMode=false;
  private action:PlayerAction|null=null;
  private actionUntil=0;
  private currentTexture="";
  constructor(scene:Phaser.Scene,x:number,y:number){
    ensureCharacterArt(scene);
    super(scene,x,y,characterTexture("player","s","idle"));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(.5,CHARACTER_FEET_Y/CHARACTER_H);
    this.setScale(CHARACTER_SCALE);
    this.setDepth(actorDepth(y));
    this.setCollideWorldBounds(false);
    // Hitbox remains on the floor/feet, regardless of tall visual sprite.
    // Arcade offsets are SOURCE pixels, not scaled world distances.
    const sourceCircle=footBodyOffsets(
      CHARACTER_W,CHARACTER_FEET_Y,CHARACTER_SCALE,
      ACTOR_HITBOXES.player.footRadius,
    );
    const physicsBody=this.body as Phaser.Physics.Arcade.Body;
    physicsBody.setCircle(
      sourceCircle.radius,sourceCircle.x,sourceCircle.y,
    );
    physicsBody.updateFromGameObject();
  }
  get hurtbox(){return actorHurtbox("player",this);}
  getAimAnchor():Phaser.Math.Vector2{
    return new Phaser.Math.Vector2(this.hurtbox.centerX,this.hurtbox.centerY);
  }
  get health():number{return this.currentHealth;}
  get maxHealth():number{return PLAYER_CONFIG.maxHealth;}
  get isDead():boolean{return this.currentHealth<=0;}
  get invulnerable():boolean{return this.godMode;}
  setInvulnerable(enabled:boolean):void{
    this.godMode=enabled;
    if(enabled)this.currentHealth=this.maxHealth;
  }
  applyMovement(move:Phaser.Math.Vector2):void{
    if(this.isDead||(move.x===0&&move.y===0)){
      this.setVelocity(0,0);return;
    }
    if(move.x!==0&&move.y!==0){
      const speed=PLAYER_CONFIG.baseMoveSpeed*PLAYER_CONFIG.diagonalMultiplier;
      this.setVelocity(Math.sign(move.x)*speed*DIAGONAL_COMPONENT,
        Math.sign(move.y)*speed*DIAGONAL_COMPONENT);
    }else{
      this.setVelocity(Math.sign(move.x)*PLAYER_CONFIG.baseMoveSpeed,
        Math.sign(move.y)*PLAYER_CONFIG.baseMoveSpeed);
    }
  }
  updateSurvival(now:number,deltaMs:number):void{
    if(this.isDead||this.currentHealth>=PLAYER_CONFIG.maxHealth)return;
    if(now-this.lastDamageAt<PLAYER_CONFIG.regenDelayMs)return;
    this.currentHealth=Math.min(PLAYER_CONFIG.maxHealth,
      this.currentHealth+PLAYER_CONFIG.regenPerSecond*(deltaMs/1000));
  }
  takeDamage(amount:number,now:number):number{
    if(this.godMode||amount<=0||this.isDead)return 0;
    const before=this.currentHealth;
    this.currentHealth=Math.max(0,before-amount);
    this.lastDamageAt=now;
    this.beginAction("hurt",now);
    this.setTintFill(0xb94a48);
    this.scene.time.delayedCall(100,()=>{
      if(this.active&&!this.isDead)this.clearTint();
    });
    return before-this.currentHealth;
  }
  faceWorldPoint(point:Phaser.Math.Vector2):void{
    const anchor=this.getAimAnchor();
    this.facing=facingFromVector(point.x-anchor.x,point.y-anchor.y);
  }
  beginAction(action:PlayerAction,now:number):void{
    if(this.isDead)return;
    this.action=action;
    this.actionUntil=now+({
      shoot:115,melee:175,reload:220,hurt:150,
    } as const)[action];
  }
  updateVisual(now:number,isMoving:boolean,isReloading:boolean):void{
    if(this.isDead)return;
    if(this.action&&now>=this.actionUntil)this.action=null;
    const state=this.action??(isReloading?"reload":isMoving?"walk":"idle");
    const rate=state==="walk"?155:state==="idle"?400:110;
    const frame=Math.floor(now/rate)%characterFrameCount("player",state);
    const key=characterTexture("player",this.facing,state,frame);
    if(this.currentTexture!==key){
      this.setTexture(key);
      this.currentTexture=key;
    }
    this.setDepth(actorDepth(this.y));
  }
  /** Visual gun-barrel offset; hitscan remains feet-centred for balance. */
  getVisibleMuzzlePosition(direction:Phaser.Math.Vector2):Phaser.Math.Vector2{
    const unit=direction.clone();
    if(unit.lengthSq()===0)unit.set(1,0);
    else unit.normalize();
    return new Phaser.Math.Vector2(
      this.x+unit.x*31,
      this.y-24+unit.y*19,
    );
  }
  /** Gameplay and visual tracers must originate at the same barrel tip. */
  getMuzzlePosition(direction:Phaser.Math.Vector2):Phaser.Math.Vector2{
    return this.getVisibleMuzzlePosition(direction);
  }
}
