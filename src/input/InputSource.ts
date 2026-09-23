import type { InputFrame } from "../types/game";
export interface InputSource{
  read():InputFrame;
  reset():void;
  resize?(width:number,height:number):void;
  destroy():void;
}
