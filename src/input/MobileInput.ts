import Phaser from "phaser";
import type { Player } from "../entities/Player";
import type { Zombie } from "../entities/Zombie";
import type { Arena } from "../world/Arena";
import type { InputFrame } from "../types/game";
import type { MobileAimMode,GameSettings } from "../persistence/LocalSettingsStore";
import { DEFAULT_SETTINGS } from "../persistence/LocalSettingsStore";
import { mobileControlsLayout,type MobileControlsLayout } from "../ui/responsive";
import { nearestRayHit } from "../utils/geometry";
import { nearestAimTarget } from "./mobileAim";
import type { InputSource } from "./InputSource";

interface Stick {
  center:Phaser.Math.Vector2;radius:number;
  pointerId:number|null;engaged:boolean;
  base:Phaser.GameObjects.Arc;knob:Phaser.GameObjects.Arc;
  label:Phaser.GameObjects.Text;
}
interface Action{
  name:"fire"|"melee"|"reload"|"use"|"swap"|"pause";
  base:Phaser.GameObjects.Arc;label:Phaser.GameObjects.Text;
}
const TARGET_RANGE=780;
const ASSIST_CONE_HALF_DEGREES=23;
export class MobileInput implements InputSource{
  private readonly move=new Phaser.Math.Vector2();
  private readonly facing=new Phaser.Math.Vector2(1,0);
  private readonly aim=new Phaser.Math.Vector2();
  private readonly movementStick:Stick;
  private readonly aimStick:Stick;
  private readonly buttons:Action[]=[];
  private firePointerId:number|null=null;
  private fireDown=false;
  private pendingFire=false;
  private melee=false;
  private reload=false;
  private interact=false;
  private swap:-1|0|1=0;
  private pause=false;
  private layout:MobileControlsLayout;
  constructor(
    private readonly scene:Phaser.Scene,
    private readonly camera:Phaser.Cameras.Scene2D.Camera,
    private readonly player:Player,
    private readonly arena:Arena,
    private readonly getZombies:()=>readonly Zombie[],
  ){
    scene.input.addPointer(5);
    this.layout=mobileControlsLayout(camera.width,camera.height);
    this.movementStick=this.createStick("MOVE");
    this.aimStick=this.createStick("AIM");
    const specs=[
      ["fire","FIRE"],["melee","MELEE"],["reload","R"],
      ["use","USE"],["swap","SWAP"],["pause","II"],
    ] as const;
    for(const [name,label] of specs)this.buttons.push(this.createButton(name,label));
    this.resize(camera.width,camera.height);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE,this.onMove,this);
    scene.input.on(Phaser.Input.Events.POINTER_UP,this.onUp,this);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE,this.onUp,this);
    window.addEventListener("blur",this.onBlur);
  }
  read():InputFrame{
    const settings=this.scene.registry.get("gameSettings") as GameSettings|undefined;
    const mode:MobileAimMode=settings?.mobileAimMode??DEFAULT_SETTINGS.mobileAimMode;
    const stickFiring=this.aimStick.engaged&&mode==="stick-auto-fire";
    const wantsAssist=this.aimStick.engaged;
    const best=this.selectTarget(
      wantsAssist?this.facing:null,
      wantsAssist?ASSIST_CONE_HALF_DEGREES:180,
      mode==="auto-aim"||wantsAssist,
    );
    if(best && (mode==="auto-aim"||wantsAssist)){
      this.aim.set(best.x,best.y);
      // Auto-aim mode updates facing when a zombie is acquired.
      if(mode==="auto-aim"&&!wantsAssist){
        this.facing.set(best.x-this.player.x,best.y-this.player.y).normalize();
      }
    }else{
      this.aim.set(
        this.player.x+this.facing.x*500,
        this.player.y+this.facing.y*500,
      );
    }
    const frame:InputFrame={
      move:this.move,aimWorld:this.aim,
      // Auto-fire generates a fresh pressed event each frame so semi-auto
      // weapons repeat at their RPM while the right stick stays deflected.
      fireHeld:this.fireDown||stickFiring,
      firePressed:this.pendingFire||stickFiring,
      meleePressed:this.melee,reloadPressed:this.reload,
      interactPressed:this.interact,slotPressed:0,
      cycleWeapon:this.swap,pausePressed:this.pause,
    };
    this.pendingFire=false;
    this.melee=false;this.reload=false;this.interact=false;this.swap=0;this.pause=false;
    return frame;
  }
  reset():void{
    this.move.set(0,0);
    this.movementStick.pointerId=null;
    this.movementStick.engaged=false;
    this.aimStick.pointerId=null;
    this.aimStick.engaged=false;
    this.centerKnob(this.movementStick);
    this.centerKnob(this.aimStick);
    this.firePointerId=null;this.fireDown=false;this.pendingFire=false;
    this.melee=false;this.reload=false;this.interact=false;this.swap=0;this.pause=false;
  }
  resize(width:number,height:number):void{
    this.layout=mobileControlsLayout(width,height);
    this.placeStick(this.movementStick,this.layout.move);
    this.placeStick(this.aimStick,this.layout.aim);
    for(const item of this.buttons){
      const position=this.layout[item.name];
      item.base.setPosition(position.x,position.y);
      item.label.setPosition(position.x,position.y);
      item.base.setRadius(item.name==="pause"?22:
        item.name==="fire"?this.layout.actionRadius+4:this.layout.actionRadius);
      item.label.setFontSize(item.name==="melee"?"11px":"12px");
    }
  }
  destroy():void{
    this.reset();
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE,this.onMove,this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP,this.onUp,this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE,this.onUp,this);
    window.removeEventListener("blur",this.onBlur);
    for(const stick of [this.movementStick,this.aimStick]){
      stick.base.destroy();stick.knob.destroy();stick.label.destroy();
    }
    for(const button of this.buttons){button.base.destroy();button.label.destroy();}
  }
  private readonly onBlur=():void=>this.reset();
  private createStick(label:string):Stick{
    const base=this.scene.add.circle(0,0,48,0x111312,.52)
      .setStrokeStyle(2,0xd8d3c7,.62).setScrollFactor(0).setDepth(4000).setInteractive();
    const knob=this.scene.add.circle(0,0,23,0xd6ad55,.54)
      .setStrokeStyle(2,0xf0d27a,.8).setScrollFactor(0).setDepth(4001);
    const text=this.scene.add.text(0,0,label,{
      fontFamily:"monospace",fontSize:"10px",color:"#d8d3c7",
    }).setOrigin(.5).setScrollFactor(0).setDepth(4001).setAlpha(.9);
    const state:Stick={center:new Phaser.Math.Vector2(),radius:48,pointerId:null,
      engaged:false,base,knob,label:text};
    base.on("pointerdown",(pointer:Phaser.Input.Pointer)=>{
      if(state.pointerId!==null)return;
      state.pointerId=pointer.id;
      this.updateStick(state,pointer);
    });
    return state;
  }
  private placeStick(
    stick:Stick,
    layout:{x:number;y:number;radius:number},
  ):void{
    stick.center.set(layout.x,layout.y);stick.radius=layout.radius;
    stick.base.setPosition(layout.x,layout.y).setRadius(layout.radius);
    stick.label.setPosition(layout.x,layout.y+layout.radius+11);
    if(stick.pointerId===null)this.centerKnob(stick);
  }
  private centerKnob(stick:Stick):void{
    stick.knob.setPosition(stick.center.x,stick.center.y);
  }
  private createButton(name:Action["name"],label:string):Action{
    const base=this.scene.add.circle(0,0,26,0x252923,.83)
      .setStrokeStyle(2,0xd6ad55,.9).setScrollFactor(0).setDepth(4000)
      .setInteractive();
    const text=this.scene.add.text(0,0,label,{
      fontFamily:"monospace",fontSize:"12px",color:"#f0d27a",
    }).setOrigin(.5).setScrollFactor(0).setDepth(4001);
    base.on("pointerdown",(pointer:Phaser.Input.Pointer)=>{
      base.setAlpha(1);
      switch(name){
        case"fire":
          if(this.firePointerId===null){
            this.firePointerId=pointer.id;this.fireDown=true;this.pendingFire=true;
          }break;
        case"melee":this.melee=true;break;
        case"reload":this.reload=true;break;
        case"use":this.interact=true;break;
        case"swap":this.swap=1;break;
        case"pause":this.pause=true;break;
      }
    });
    base.on("pointerup",()=>base.setAlpha(.83));
    base.on("pointerout",()=>base.setAlpha(.83));
    return {name,base,label:text};
  }
  private onMove(pointer:Phaser.Input.Pointer):void{
    if(this.movementStick.pointerId===pointer.id){
      this.updateStick(this.movementStick,pointer);
    }else if(this.aimStick.pointerId===pointer.id){
      this.updateStick(this.aimStick,pointer);
    }
  }
  private onUp(pointer:Phaser.Input.Pointer):void{
    for(const stick of [this.movementStick,this.aimStick]){
      if(stick.pointerId!==pointer.id)continue;
      stick.pointerId=null;stick.engaged=false;this.centerKnob(stick);
      if(stick===this.movementStick)this.move.set(0,0);
    }
    if(this.firePointerId===pointer.id){
      this.firePointerId=null;this.fireDown=false;
    }
    for(const button of this.buttons)button.base.setAlpha(.83);
  }
  private updateStick(stick:Stick,pointer:Phaser.Input.Pointer):void{
    let dx=pointer.x-stick.center.x;
    let dy=pointer.y-stick.center.y;
    const length=Math.hypot(dx,dy);
    if(length>stick.radius){
      const ratio=stick.radius/length;dx*=ratio;dy*=ratio;
    }
    stick.knob.setPosition(stick.center.x+dx,stick.center.y+dy);
    if(length<stick.radius*.2){
      stick.engaged=false;
      if(stick===this.movementStick)this.move.set(0,0);
      return;
    }
    stick.engaged=true;
    if(stick===this.aimStick){
      this.facing.set(dx,dy).normalize();
    }else{
      const snapped=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4);
      this.move.set(Math.round(Math.cos(snapped)),Math.round(Math.sin(snapped)));
    }
  }
  private selectTarget(
    direction:Phaser.Math.Vector2|null,
    halfCone:number,
    enabled:boolean,
  ):Zombie|null{
    if(!enabled)return null;
    const origin=new Phaser.Math.Vector2(this.player.x,this.player.y);
    return nearestAimTarget(
      origin,this.getZombies(),direction,TARGET_RANGE,halfCone,
      (zombie)=>{
        const toTarget=new Phaser.Math.Vector2(zombie.x-origin.x,zombie.y-origin.y);
        const distance=toTarget.length();
        if(distance<1)return true;
        const hit=nearestRayHit(origin,toTarget,distance,this.arena.wallSegments);
        return !hit||hit.distance>=distance-zombie.hitRadius;
      },
    );
  }
}
