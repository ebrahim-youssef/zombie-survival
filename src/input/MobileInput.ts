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
  private pointerEvents=0;
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
    this.layout=mobileControlsLayout(camera.width,camera.height);
    this.movementStick=this.createStick("MOVE");
    this.aimStick=this.createStick("AIM");
    const specs=[
      ["fire","FIRE"],["melee","MELEE"],["reload","R"],
      ["use","USE"],["swap","SWAP"],["pause","II"],
    ] as const;
    for(const [name,label] of specs)this.buttons.push(this.createButton(name,label));
    this.resize(camera.width,camera.height);
    // Phaser GameObject hit-testing is not reliable enough for movable
    // controls with simultaneous touch points. Capture Pointer Events on
    // the canvas itself and perform explicit screen-space hit testing.
    // The canvas uses touch-action:none; pointer capture keeps dragging
    // associated with the initial finger even across other controls.
    const canvas=scene.game.canvas;
    canvas.addEventListener("pointerdown",this.onDomDown);
    canvas.addEventListener("pointermove",this.onDomMove);
    window.addEventListener("pointerup",this.onDomUp);
    window.addEventListener("pointercancel",this.onDomUp);
    window.addEventListener("blur",this.onBlur);
  }
  /** Dev smoke diagnostics for actual simulated touch input. */
  debugState():{engaged:boolean;pointerId:number|null;firing:boolean}{
    return {
      engaged:this.aimStick.engaged,
      pointerId:this.aimStick.pointerId,
      firing:this.aimStick.engaged&&
        ((this.scene.registry.get("gameSettings") as GameSettings|undefined)
          ?.mobileAimMode??DEFAULT_SETTINGS.mobileAimMode)==="stick-auto-fire",
    };
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
    if(this.movementStick.pointerId!==null||this.aimStick.pointerId!==null)this.reset();
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
    const canvas=this.scene.game.canvas;
    canvas.removeEventListener("pointerdown",this.onDomDown);
    canvas.removeEventListener("pointermove",this.onDomMove);
    window.removeEventListener("pointerup",this.onDomUp);
    window.removeEventListener("pointercancel",this.onDomUp);
    window.removeEventListener("blur",this.onBlur);
    for(const stick of [this.movementStick,this.aimStick]){
      stick.base.destroy();stick.knob.destroy();stick.label.destroy();
    }
    for(const button of this.buttons){button.base.destroy();button.label.destroy();}
  }
  private readonly onBlur=():void=>this.reset();
  private createStick(label:string):Stick{
    const base=this.scene.add.circle(0,0,48,0x111312,.52)
      .setStrokeStyle(2,0xd8d3c7,.62).setScrollFactor(0).setDepth(4000);
    const knob=this.scene.add.circle(0,0,23,0xd6ad55,.54)
      .setStrokeStyle(2,0xf0d27a,.8).setScrollFactor(0).setDepth(4001);
    const text=this.scene.add.text(0,0,label,{
      fontFamily:"monospace",fontSize:"10px",color:"#d8d3c7",
    }).setOrigin(.5).setScrollFactor(0).setDepth(4001).setAlpha(.9);
    const state:Stick={center:new Phaser.Math.Vector2(),radius:48,pointerId:null,
      engaged:false,base,knob,label:text};
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
      .setStrokeStyle(2,0xd6ad55,.9).setScrollFactor(0).setDepth(4000);
    const text=this.scene.add.text(0,0,label,{
      fontFamily:"monospace",fontSize:"12px",color:"#f0d27a",
    }).setOrigin(.5).setScrollFactor(0).setDepth(4001);
    return {name,base,label:text};
  }
  private readonly onDomDown=(event:PointerEvent):void=>{
    this.pointerEvents+=1;
    const {x,y}=this.screenPosition(event);
    // Buttons take priority if hit areas approach each other on small
    // landscape viewports; do not allow a finger to control two actions.
    for(const button of this.buttons){
      const pos=this.layout[button.name];
      const radius=button.name==="pause"?27:
        button.name==="fire"?this.layout.actionRadius+9:
        this.layout.actionRadius+6;
      if(Math.hypot(x-pos.x,y-pos.y)>radius)continue;
      button.base.setAlpha(1);
      switch(button.name){
        case"fire":
          if(this.firePointerId===null){
            this.firePointerId=event.pointerId;
            this.fireDown=true;
            this.pendingFire=true;
          }break;
        case"melee":this.melee=true;break;
        case"reload":this.reload=true;break;
        case"use":this.interact=true;break;
        case"swap":this.swap=1;break;
        case"pause":this.pause=true;break;
      }
      this.capturePointer(event);
      return;
    }
    for(const stick of [this.movementStick,this.aimStick]){
      if(stick.pointerId!==null)continue;
      if(Math.hypot(x-stick.center.x,y-stick.center.y)>stick.radius+8)continue;
      stick.pointerId=event.pointerId;
      this.updateStick(stick,x,y);
      this.capturePointer(event);
      return;
    }
  };
  private readonly onDomMove=(event:PointerEvent):void=>{
    const {x,y}=this.screenPosition(event);
    if(this.movementStick.pointerId===event.pointerId){
      this.updateStick(this.movementStick,x,y);
    }else if(this.aimStick.pointerId===event.pointerId){
      this.updateStick(this.aimStick,x,y);
    }
  };
  private readonly onDomUp=(event:PointerEvent):void=>{
    for(const stick of [this.movementStick,this.aimStick]){
      if(stick.pointerId!==event.pointerId)continue;
      stick.pointerId=null;
      stick.engaged=false;
      this.centerKnob(stick);
      if(stick===this.movementStick)this.move.set(0,0);
    }
    if(this.firePointerId===event.pointerId){
      this.firePointerId=null;
      this.fireDown=false;
    }
    for(const button of this.buttons)button.base.setAlpha(.83);
  };
  private screenPosition(event:PointerEvent):{x:number;y:number}{
    const rect=this.scene.game.canvas.getBoundingClientRect();
    return {
      x:(event.clientX-rect.left)*this.camera.width/Math.max(1,rect.width),
      y:(event.clientY-rect.top)*this.camera.height/Math.max(1,rect.height),
    };
  }
  private capturePointer(event:PointerEvent):void{
    if(event.cancelable)event.preventDefault();
    try{this.scene.game.canvas.setPointerCapture(event.pointerId);}
    catch{/* Pointer capture unavailable; global pointerup still clears. */}
  }
  private updateStick(stick:Stick,x:number,y:number):void{
    let dx=x-stick.center.x;
    let dy=y-stick.center.y;
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
