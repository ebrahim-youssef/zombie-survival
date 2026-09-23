import Phaser from "phaser";
import {ZOMBIE_CONFIG} from "../config/zombie";
import {ensureCharacterArt,characterTexture,characterFrameCount,CHARACTER_FEET_Y,CHARACTER_H,CHARACTER_SCALE} from "../art/CharacterArt";
import {facingFromVector} from "../art/directions";
import type {FacingDirection} from "../types/game";
import type {Player} from "./Player";

export interface ZombieDamageResult{applied:boolean;killed:boolean;}
export class Zombie extends Phaser.Physics.Arcade.Sprite{
  readonly hitRadius=ZOMBIE_CONFIG.colliderRadius;
  private readonly entryTarget:Phaser.Math.Vector2;
  private enteredRoom=false;
  private dead=false;
  private lastAttackAt=Number.NEGATIVE_INFINITY;
  private health:number;
  private facing:FacingDirection="s";
  private visualTexture="";
  private hitFrames=0;
  private lastPresentationAt=0;
  constructor(
    scene:Phaser.Scene,x:number,y:number,
    entryTarget:Phaser.Math.Vector2,maxHealth:number,
    private readonly moveSpeed:number,
  ){
    ensureCharacterArt(scene);
    super(scene,x,y,characterTexture("zombie","s","idle"));
    this.entryTarget=entryTarget.clone();
    this.health=maxHealth;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(.5,CHARACTER_FEET_Y/CHARACTER_H);
    this.setScale(CHARACTER_SCALE);
    this.setDepth(8+y/100);
    (this.body as Phaser.Physics.Arcade.Body).setCircle(
      ZOMBIE_CONFIG.colliderRadius,21,45,
    );
    (this.body as Phaser.Physics.Arcade.Body).setBounce(0);
  }
  get isDead():boolean{return this.dead;}
  updateBehavior(now:number,player:Player):void{
    if(this.dead||player.isDead){this.setVelocity(0,0);return;}
    if(!this.enteredRoom){
      const distance=Phaser.Math.Distance.Between(
        this.x,this.y,this.entryTarget.x,this.entryTarget.y,
      );
      if(distance<=ZOMBIE_CONFIG.entryThreshold){
        this.enteredRoom=true;
      }else{
        this.moveToward(this.entryTarget.x,this.entryTarget.y);
        this.present(now,"walk");
        return;
      }
    }
    const distance=Phaser.Math.Distance.Between(this.x,this.y,player.x,player.y);
    if(distance<=ZOMBIE_CONFIG.attackRange){
      this.setVelocity(0,0);
      this.facing=facingFromVector(player.x-this.x,player.y-this.y);
      if(now-this.lastAttackAt>=ZOMBIE_CONFIG.attackCooldownMs){
        this.lastAttackAt=now;
        player.takeDamage(ZOMBIE_CONFIG.attackDamage,now);
      }
      this.present(now,"attack");
      return;
    }
    this.moveToward(player.x,player.y);
    this.present(now,"walk");
  }
  takeDamage(amount:number):ZombieDamageResult{
    if(this.dead||amount<=0)return {applied:false,killed:false};
    this.health=Math.max(0,this.health-amount);
    if(this.health<=0){
      this.die();return {applied:true,killed:true};
    }
    this.hitFrames=6;
    this.setTintFill(0xd8c6a0);
    this.scene.time.delayedCall(80,()=>{
      if(this.active&&!this.dead)this.clearTint();
    });
    return {applied:true,killed:false};
  }
  private moveToward(x:number,y:number):void{
    const angle=Phaser.Math.Angle.Between(this.x,this.y,x,y);
    this.setVelocity(Math.cos(angle)*this.moveSpeed,Math.sin(angle)*this.moveSpeed);
    this.facing=facingFromVector(x-this.x,y-this.y);
  }
  private present(now:number,state:"walk"|"attack"):void{
    if(this.hitFrames>0&&now>this.lastPresentationAt){
      this.hitFrames-=1;
      state="walk"; // overridden with the dedicated hurt sprite below
    }
    const action=this.hitFrames>0?"hurt":state;
    const speed=action==="walk"?175:action==="attack"?230:80;
    const frame=Math.floor(now/speed)%characterFrameCount("zombie",action);
    const key=characterTexture("zombie",this.facing,action,frame);
    if(key!==this.visualTexture){
      this.setTexture(key);this.visualTexture=key;
    }
    this.lastPresentationAt=now;
    this.setDepth(8+this.y/100);
  }
  private die():void{
    this.dead=true;
    this.setVelocity(0,0);
    this.disableBody(false,false);
    this.setTexture(characterTexture("zombie",this.facing,"death",0));
    this.scene.time.delayedCall(125,()=>{
      if(this.active)this.setTexture(characterTexture("zombie",this.facing,"death",1));
    });
    this.scene.time.delayedCall(250,()=>{
      if(this.active)this.setTexture(characterTexture("zombie",this.facing,"death",2));
    });
    this.scene.tweens.add({
      targets:this,alpha:0,duration:ZOMBIE_CONFIG.corpseFadeMs,
      delay:ZOMBIE_CONFIG.corpseHoldMs,
      onComplete:()=>this.destroy(),
    });
  }
}
