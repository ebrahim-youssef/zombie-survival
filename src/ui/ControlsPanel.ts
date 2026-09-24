import Phaser from "phaser";
import {viewport} from "./responsive";

export class ControlsPanel{
  private readonly objects:Phaser.GameObjects.GameObject[]=[];
  constructor(
    private readonly scene:Phaser.Scene,
    private readonly onClose:()=>void,
  ){
    const {width:w,height:h,compact}=viewport(scene.scale.width,scene.scale.height);
    const cx=w/2,cy=h/2;
    const panel=scene.add.rectangle(
      cx,cy,Math.min(w-12,620),Math.min(h-12,420),0x111312,.99,
    ).setStrokeStyle(2,0xd6ad55,.85)
      .setScrollFactor(0).setDepth(5000).setInteractive();
    this.objects.push(panel);

    this.text(cx,cy-(compact?150:165),"CONTROLS",compact?22:30,"#f0d27a");
    const body=compact
      ? "MOVE  WASD / ARROWS / LEFT STICK\n"+
        "AIM   MOUSE / RIGHT STICK\n"+
        "FIRE  LMB / RIGHT STICK AUTO-FIRE\n"+
        "MELEE RMB / MELEE BUTTON\n"+
        "R     RELOAD    E  USE\n"+
        "1 / 2 WEAPON SLOTS    WHEEL  CYCLE\n"+
        "ESC / II  PAUSE"
      : "MOVE    WASD / ARROWS        AIM     MOUSE / RIGHT STICK\n"+
        "FIRE    LEFT CLICK / STICK    MELEE   RIGHT CLICK / BUTTON\n"+
        "RELOAD  R                     USE     E\n"+
        "WEAPONS 1 / 2                 CYCLE   MOUSE WHEEL\n"+
        "PAUSE   ESC / MOBILE II";
    this.text(cx,cy-(compact?18:12),body,compact?12:16,"#e6e1d4",1.7);
    this.button(cx,cy+(compact?151:165),"BACK",()=>this.close(),compact);
  }
  destroy():void{
    for(const object of this.objects)object.destroy();
    this.objects.length=0;
  }
  private text(
    x:number,y:number,value:string,size:number,color:string,
    lineSpacing=1.2,
  ):Phaser.GameObjects.Text{
    const text=this.scene.add.text(x,y,value,{
      fontFamily:"monospace",fontSize:size+"px",color,
      align:"center",
      lineSpacing:Math.round(size*(lineSpacing-1)),
      wordWrap:{width:Math.max(220,Math.min(570,this.scene.scale.width-32))},
    }).setOrigin(.5).setScrollFactor(0).setDepth(5001)
      .setName("pause-controls-panel");
    this.objects.push(text);
    return text;
  }
  private button(
    x:number,y:number,label:string,click:()=>void,compact:boolean,
  ):void{
    const text=this.scene.add.text(x,y,label,{
      fontFamily:"monospace",fontSize:(compact?13:17)+"px",
      color:"#f0d27a",backgroundColor:"#292b26",
      padding:{x:compact?10:16,y:compact?6:8},
    }).setOrigin(.5).setScrollFactor(0).setDepth(5002)
      .setInteractive({useHandCursor:true});
    text.on("pointerdown",click);
    text.on("pointerover",()=>text.setColor("#ffffff"));
    text.on("pointerout",()=>text.setColor("#f0d27a"));
    this.objects.push(text);
  }
  private close():void{
    this.destroy();
    this.onClose();
  }
}
