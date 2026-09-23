import Phaser from "phaser";
import type {FacingDirection} from "../types/game";
import {FACINGS,facingVector} from "./directions";

/**
 * Self-contained first full-body, three-quarter pixel character pass.
 * Generated once as texture frames. Not top-down head/rect placeholders:
 * the head, torso, individual legs/boots, arms and equipment have depth.
 * These frames can be replaced later with artist-authored PNG sheets
 * without changing the entity animation/state interfaces.
 */
export type CharacterKind="player"|"zombie";
export type CharacterAction=
  "idle"|"walk"|"shoot"|"melee"|"reload"|"attack"|"hurt"|"death";
export const CHARACTER_W=48;
export const CHARACTER_H=64;
export const CHARACTER_FEET_Y=56;
const FRAME_COUNTS:Record<CharacterKind,Partial<Record<CharacterAction,number>>>={
  player:{idle:2,walk:4,shoot:2,melee:2,reload:2,hurt:1,death:3},
  zombie:{idle:2,walk:4,attack:2,hurt:1,death:3},
};
interface Palette{
  outline:number;legs:number;legsLight:number;boots:number;
  clothes:number;clothesLight:number;vest:number;shoulder:number;
  head:number;headShadow:number;hair:number;eye:number;trim:number;
}
const PALETTES:Record<CharacterKind,Palette>={
  player:{
    outline:0x171e19,legs:0x38483c,legsLight:0x526852,boots:0x202820,
    clothes:0x4d584d,clothesLight:0x687963,vest:0x3d4b3c,shoulder:0x6c7868,
    head:0xc2a87e,headShadow:0x987e60,hair:0x32392e,eye:0x1b211c,trim:0xd1a04b,
  },
  zombie:{
    outline:0x1f261e,legs:0x49483b,legsLight:0x615b48,boots:0x292b21,
    clothes:0x5c634e,clothesLight:0x78806a,vest:0x504a3a,shoulder:0x85826b,
    head:0x91a17b,headShadow:0x677953,hair:0x494b3a,eye:0xb84a3b,trim:0x783e37,
  },
};
export function characterTexture(
  kind:CharacterKind,facing:FacingDirection,action:CharacterAction,frame=0,
):string{
  const count=FRAME_COUNTS[kind][action]??1;
  return "character-"+kind+"-"+facing+"-"+action+"-"+(frame%count);
}
export function characterFrameCount(kind:CharacterKind,action:CharacterAction):number{
  return FRAME_COUNTS[kind][action]??1;
}
export function ensureCharacterArt(scene:Phaser.Scene):void{
  if(scene.textures.exists(characterTexture("player","s","idle",0)))return;
  const art=scene.make.graphics({x:0,y:0},false);
  for(const kind of ["player","zombie"] as const){
    for(const dir of FACINGS){
      const states=FRAME_COUNTS[kind];
      for(const action of Object.keys(states) as CharacterAction[]){
        const count=states[action]??1;
        for(let frame=0;frame<count;frame++){
          art.clear();
          drawCharacter(art,PALETTES[kind],kind,dir,action,frame);
          art.generateTexture(characterTexture(kind,dir,action,frame),
            CHARACTER_W,CHARACTER_H);
        }
      }
    }
  }
  art.destroy();
}
function px(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,color:number):void{
  g.fillStyle(color,1);g.fillRect(Math.round(x),Math.round(y),w,h);
}
function drawCharacter(
  g:Phaser.GameObjects.Graphics,p:Palette,kind:CharacterKind,
  dir:FacingDirection,action:CharacterAction,frame:number,
):void{
  const [vx,vy]=facingVector(dir);
  const back=dir==="n"||dir==="ne"||dir==="nw";
  const front=dir==="s"||dir==="se"||dir==="sw";
  const side=dir==="e"||dir==="w";
  const signed= vx===0?0:vx>0?1:-1;
  const motion=action==="walk" ? [0,3,0,-3][frame%4]! : 0;
  const bob=action==="walk"&&(frame%2===1)?1:action==="idle"&&frame%2?1:0;
  const lean=kind==="zombie"?signed*2:0;

  // Footprint shadow establishes a ground plane distinct from the sprite.
  g.fillStyle(0x101714,.33);g.fillEllipse(24,56,32,8);
  if(action==="death" && frame>=1){
    // The entire character falls into a low horizontal corpse silhouette.
    px(g,5,49,37,8,p.outline);
    px(g,8,47,24,7,p.clothes);
    px(g,28,45,11,11,p.headShadow);
    px(g,30,44,8,8,p.head);
    px(g,8,51,9,3,p.boots);
    px(g,18,52,8,3,p.legs);
    if(kind==="zombie")px(g,22,50,4,2,p.trim);
    return;
  }

  const deathSlump=action==="death"?4:0;
  // Independently moving lower legs and boots; no overhead stick shape.
  const legLeft=motion;
  const legRight=-motion;
  px(g,12,39+deathSlump+bob,11,5,p.outline);
  px(g,25,39+deathSlump+bob,11,5,p.outline);
  px(g,13,42+legLeft+deathSlump,9,13,p.legs);
  px(g,26,42+legRight+deathSlump,9,13,p.legs);
  px(g,14,44+legLeft+deathSlump,2,9,p.legsLight);
  px(g,27,44+legRight+deathSlump,2,9,p.legsLight);
  px(g,10,53+legLeft+deathSlump,13,4,p.boots);
  px(g,26,53+legRight+deathSlump,13,4,p.boots);

  // Arms behind the jacket on the far side (strong three-quarter cue).
  const lSwing=action==="walk"?-motion:0;
  const rSwing=action==="walk"?motion:0;
  px(g,6+lean,29+bob+lSwing,9,14,p.outline);
  px(g,7+lean,30+bob+lSwing,7,12,p.clothesLight);
  px(g,34+lean,28+bob+rSwing,9,16,p.outline);
  px(g,35+lean,30+bob+rSwing,7,13,p.clothes);

  // Thick upper torso with belt, shoulder protection and readable outline.
  px(g,13+lean,25+bob+deathSlump,23,19,p.outline);
  px(g,15+lean,27+bob+deathSlump,19,15,p.clothes);
  px(g,16+lean,29+bob+deathSlump,7,11,p.vest);
  px(g,24+lean,28+bob+deathSlump,8,10,p.clothesLight);
  px(g,13+lean,29+bob+deathSlump,5,8,p.shoulder);
  px(g,32+lean,29+bob+deathSlump,5,8,p.shoulder);
  px(g,16+lean,39+bob+deathSlump,18,3,p.outline);
  px(g,22+lean,39+bob+deathSlump,5,3,p.trim);

  // Full, oversized character head, shown from the side/back or 3/4,
  // never just a circular overhead helmet.
  const headX=14 + (side?signed*3:signed*2) + lean;
  const headY=9+bob+deathSlump;
  px(g,headX-2,headY+3,24,20,p.outline);
  px(g,headX,headY+5,20,16,p.headShadow);
  px(g,headX+2,headY+7,17,13,p.head);
  px(g,headX-1,headY+1,21,10,p.hair);
  px(g,headX+2,headY+2,14,3,p.shoulder);
  px(g,headX,headY+12,3,4,p.hair); // ear/backward side shape
  if(back){
    px(g,headX+2,headY+12,15,7,p.hair);
    px(g,headX+5,headY+18,9,3,p.headShadow);
  }else if(side){
    const eyeX=signed>0?headX+16:headX+2;
    px(g,eyeX,headY+13,2,3,p.eye);
    px(g,eyeX+(signed>0?2:-3),headY+17,4,3,p.headShadow);
  }else if(front){
    px(g,headX+4+signed,headY+13,2,3,p.eye);
    px(g,headX+13+signed,headY+13,2,3,p.eye);
    px(g,headX+8+signed,headY+19,5,2,p.headShadow);
  }
  if(kind==="player"){
    // Helmet rim, cheek guards and reinforced vest plates.
    px(g,headX-2,headY+10,23,3,p.shoulder);
    px(g,headX+2,headY+2,4,3,p.trim);
    px(g,headX,headY+17,3,5,p.vest);
    px(g,headX+17,headY+17,3,5,p.vest);
    px(g,18+lean,29+bob,12,7,0x354339);
    px(g,20+lean,30+bob,7,2,p.shoulder);
    drawWeapon(g,dir,action,frame);
  }else{
    // Asymmetric torn clothes and visible zombie skin/teeth.
    px(g,27+lean,31+bob,6,6,p.headShadow);
    px(g,15+lean,36+bob,3,5,p.trim);
    px(g,headX+9,headY+19,7,3,p.headShadow);
    px(g,headX+10,headY+20,2,2,0xd1c69c);
    if(action==="attack"){
      const extension=frame%2?3:0;
      if(vx!==0){
        px(g,signed>0?37+extension:2-extension,29+vy*3,9,5,p.head);
        px(g,signed>0?44+extension:0,28+vy*3,4,6,p.headShadow);
      }else{
        px(g,9,34+vy*7+extension,7,12,p.head);
        px(g,33,34+vy*7+extension,7,12,p.head);
      }
    }
  }
  if(action==="hurt"||action==="death"){
    px(g,headX+6,headY+18,5,3,p.trim);
    px(g,18,35+bob,7,3,p.trim);
  }
}
function drawWeapon(
  g:Phaser.GameObjects.Graphics,dir:FacingDirection,
  action:CharacterAction,frame:number,
):void{
  const [vx,vy]=facingVector(dir);
  const len=Math.hypot(vx,vy)||1;
  const dx=vx/len,dy=vy/len;
  const originX=25,originY=35;
  const reach=action==="melee"?24:19;
  const endX=Math.round(originX+dx*reach),endY=Math.round(originY+dy*reach*.75);
  g.lineStyle(5,0x212720,1);
  g.lineBetween(originX,originY,endX,endY);
  g.lineStyle(2,0x909785,1);
  g.lineBetween(originX+dx*4,originY+dy*3,endX-dx*3,endY-dy*2);
  g.fillStyle(0x1d221d,1);g.fillCircle(originX,originY,4);
  if(action==="shoot"&&frame===0){
    g.fillStyle(0xf5c65b,1);g.fillCircle(endX+dx*3,endY+dy*3,4);
    g.lineStyle(2,0xffeaa3,1);
    g.lineBetween(endX+dx*3,endY+dy*3,endX+dx*8,endY+dy*6);
  }
  if(action==="melee"){
    // Broad bright slash at the end of the weapon.
    g.lineStyle(3,0xe7dfc2,.9);
    g.lineBetween(endX-dy*9,endY+dx*9,endX+dy*9,endY-dx*9);
  }
  if(action==="reload"){
    px(g,17,39+frame*2,5,8,0x151c1b);
  }
}
