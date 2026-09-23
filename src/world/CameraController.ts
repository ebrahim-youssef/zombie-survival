import Phaser from "phaser";
import type { Arena } from "./Arena";

/**
 * The HUD and virtual controls currently share GameScene's main camera.
 * Keep camera zoom at 1 so UI artwork and input hit targets use identical
 * screen-space coordinates. Full-viewport resizing and 64x64 authored
 * frames at 1.5x keep mobile readability without letterboxing.
 *
 * A dedicated world/UI camera split is required before custom world zoom.
 */
export class CameraController {
  private readonly bounds:Phaser.Geom.Rectangle;
  constructor(
    private readonly camera:Phaser.Cameras.Scene2D.Camera,
    target:Phaser.GameObjects.GameObject & {x:number;y:number},
    arena:Arena,
  ){
    this.bounds=arena.getCameraBounds(220);
    this.camera.setBounds(
      this.bounds.x,this.bounds.y,this.bounds.width,this.bounds.height,
    );
    this.camera.startFollow(
      target,true,.12,.12,0,
      this.followYOffset(camera.width,camera.height),
    );
    this.camera.setRoundPixels(true);
    this.resize(camera.width,camera.height);
  }
  resize(width:number,height:number):void{
    this.camera.setSize(width,height);
    this.camera.setZoom(1);
    this.camera.followOffset.set(0,this.followYOffset(width,height));
    this.camera.setBounds(
      this.bounds.x,this.bounds.y,this.bounds.width,this.bounds.height,
    );
  }
  // Make the rear wall and side corners visible on large desktop screens.
  // Keep narrow touch viewports centered to avoid joystick interference.
  private followYOffset(width:number,height:number):number{
    return width>=1000&&height>=650?76:0;
  }
  destroy():void{this.camera.stopFollow();}
}
