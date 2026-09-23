import type Phaser from "phaser";
import type { Player } from "../entities/Player";
import type { Zombie } from "../entities/Zombie";
import type { Arena } from "../world/Arena";
import type { InputFrame } from "../types/game";
import { DesktopInput } from "./DesktopInput";
import type { InputSource } from "./InputSource";
import { MobileInput } from "./MobileInput";

export class InputController implements InputSource {
  private readonly source: InputSource;
  readonly touchMode:boolean;
  constructor(
    scene:Phaser.Scene,camera:Phaser.Cameras.Scene2D.Camera,
    player:Player,arena:Arena,getZombies:()=>readonly Zombie[],
  ){
    this.touchMode=InputController.shouldUseTouch();
    this.source=this.touchMode
      ?new MobileInput(scene,camera,player,arena,getZombies)
      :new DesktopInput(scene,camera);
  }
  debugMobileState():{engaged:boolean;pointerId:number|null;firing:boolean}|null{
    return this.source instanceof MobileInput ? this.source.debugState() : null;
  }
  read():InputFrame{return this.source.read();}
  reset():void{this.source.reset();}
  resize(width:number,height:number):void{this.source.resize?.(width,height);}
  destroy():void{this.source.destroy();}
  private static shouldUseTouch():boolean{
    return window.matchMedia("(pointer: coarse)").matches &&
      (navigator.maxTouchPoints>0||"ontouchstart" in window);
  }
}
