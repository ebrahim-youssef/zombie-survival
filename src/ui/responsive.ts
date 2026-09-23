/** CSS pixels == Phaser game units when Scale.RESIZE is used. */
export interface Viewport {
  width: number;
  height: number;
  compact: boolean;
  portrait: boolean;
}
export function viewport(width: number, height: number): Viewport {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  return {width:w,height:h,compact:w<1000||h<560,portrait:h>w};
}
export interface StickLayout {x:number;y:number;radius:number}
export interface MobileControlsLayout {
  move:StickLayout; aim:StickLayout;
  fire:{x:number;y:number};melee:{x:number;y:number};
  reload:{x:number;y:number};use:{x:number;y:number};
  swap:{x:number;y:number};pause:{x:number;y:number};
  actionRadius:number;
}
export function mobileControlsLayout(width:number,height:number):MobileControlsLayout{
  const {width:w,height:h,portrait}=viewport(width,height);
  if(portrait){
    const r=Math.min(60,Math.max(42,w*.15));
    return {
      move:{x:r+18,y:h-r-26,radius:r},
      aim:{x:w-r-18,y:h-r-26,radius:r},
      fire:{x:w*.5,y:h-r-20},melee:{x:w*.68,y:h-2.6*r},
      reload:{x:w*.32,y:h-2.6*r},use:{x:w*.5,y:h-3.35*r},
      swap:{x:w*.79,y:h-3.6*r},pause:{x:w-34,y:32},
      actionRadius:Math.min(30,r*.55),
    };
  }
  const r=Math.min(68,Math.max(41,h*.15));
  return {
    move:{x:r+18,y:h-r-18,radius:r},
    aim:{x:w-r-18,y:h-r-18,radius:r},
    fire:{x:w-2.94*r,y:h-1.60*r},
    melee:{x:w-3.95*r,y:h-.85*r},
    reload:{x:w-4.85*r,y:h-2.15*r},
    use:{x:w-3.30*r,y:h-2.95*r},
    swap:{x:w-4.67*r,y:h-3.40*r},
    pause:{x:w-32,y:32},
    actionRadius:Math.min(33,r*.53),
  };
}
