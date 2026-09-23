import Phaser from "phaser";
import type { Arena } from "./Arena";

/** World zoom is deliberately independent of the screen-space HUD. */
export class CameraController {
  private readonly bounds:Phaser.Geom.Rectangle;
  constructor(
    private readonly camera:Phaser.Cameras.Scene2D.Camera,
    target:Phaser.GameObjects.GameObject & {x:number;y:number},
    arena:Arena,
    private readonly touch:boolean,
  ){
    this.bounds=arena.getCameraBounds(220);
    this.camera.setBounds(this.bounds.x,this.bounds.y,this.bounds.width,this.bounds.height);
    this.camera.startFollow(target,true,.12,.12);
    this.camera.setRoundPixels(true);
    this.resize(camera.width,camera.height);
  }
  resize(width:number,height:number):void{
    this.camera.setSize(width,height);
    // Mobile uses the whole canvas at a readable character scale.
    // Unlike Scale.FIT, no black letterbox bars are introduced.
    const zoom=this.touch
      ?Math.min(1.42,Math.max(1.08,Math.min(width/680,height/305)))
      :Math.min(1.22,Math.max(1,Math.min(width/1280,height/720)));
    this.camera.setZoom(zoom);
    this.camera.setBounds(this.bounds.x,this.bounds.y,this.bounds.width,this.bounds.height);
  }
  destroy():void{this.camera.stopFollow();}
}
