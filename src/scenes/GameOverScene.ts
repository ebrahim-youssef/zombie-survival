import Phaser from "phaser";
import { viewport } from "../ui/responsive";

export interface GameOverData {
  round:number;kills:number;points:number;
  highScore:number;highestRound:number;
}

/**
 * Owns game-over input. The paused GameScene (including mobile controls)
 * cannot intercept touches or keys from this overlay.
 */
export class GameOverScene extends Phaser.Scene {
  private finished=false;
  private resultData:GameOverData={round:1,kills:0,points:0,highScore:0,highestRound:0};
  constructor(){super("gameOver");}
  init(data:GameOverData):void{
    this.resultData=data;
    this.finished=false;
  }
  create():void{
    this.build();
    this.input.keyboard?.on("keydown-ENTER",this.restart,this);
    this.input.keyboard?.on("keydown-SPACE",this.restart,this);
    this.input.keyboard?.on("keydown-ESC",this.mainMenu,this);
    this.scale.on(Phaser.Scale.Events.RESIZE,this.onResize,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.scale.off(Phaser.Scale.Events.RESIZE,this.onResize,this);
      this.input.keyboard?.off("keydown-ENTER",this.restart,this);
      this.input.keyboard?.off("keydown-SPACE",this.restart,this);
      this.input.keyboard?.off("keydown-ESC",this.mainMenu,this);
    });
  }
  private onResize():void{
    this.cameras.main.setSize(this.scale.width,this.scale.height);
    this.children.removeAll(true);
    this.build();
  }
  private build():void{
    const {width:w,height:h,compact}=viewport(this.scale.width,this.scale.height);
    this.add.rectangle(w/2,h/2,w,h,0x080909,.93).setInteractive();
    const contentY=h/2;
    const small=h<470;
    const titleSize=small?Math.max(24,h*.085):42;
    const labelSize=small?Math.max(12,h*.037):19;
    const gap=small?40:64;
    this.add.text(w/2,contentY-(small?93:170),"GAME OVER",{
      fontFamily:"monospace",fontSize:titleSize+"px",color:"#e1a55f",
    }).setOrigin(.5);
    this.add.text(w/2,contentY-(small?39:91),
      "ROUND "+this.resultData.round+"    KILLS "+this.resultData.kills+"    POINTS "+this.resultData.points+
      "\nBEST "+this.resultData.highScore+"    HIGHEST ROUND "+this.resultData.highestRound,{
        fontFamily:"monospace",fontSize:labelSize+"px",
        align:"center",color:"#eae6d8",lineSpacing:7,
        wordWrap:{width:Math.max(230,w-26),useAdvancedWrap:true},
      }).setOrigin(.5);
    const by=contentY+(small?18:14);
    this.button(w/2,by,"RESTART",()=>this.restart(),compact);
    this.button(w/2,by+gap,"MAIN MENU",()=>this.mainMenu(),compact);
    this.add.text(w/2,Math.min(h-15,by+gap+(small?27:48)),
      "ENTER / SPACE: RESTART",{
        fontFamily:"monospace",fontSize:(small?11:14)+"px",color:"#b8ac86",
      }).setOrigin(.5);
  }
  private button(x:number,y:number,label:string,onClick:()=>void,compact:boolean):void{
    const button=this.add.text(x,y,label,{
      fontFamily:"monospace",fontSize:(compact?18:24)+"px",
      color:"#f0d27a",backgroundColor:"#30312b",
      padding:{x:22,y:compact?7:12},
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    button.on("pointerdown",(pointer:Phaser.Input.Pointer)=>{
      pointer.event.preventDefault();
      onClick();
    });
    button.on("pointerover",()=>button.setColor("#ffffff"));
    button.on("pointerout",()=>button.setColor("#f0d27a"));
  }
  private restart():void{
    if(this.finished)return;
    this.finished=true;
    this.game.scene.stop("game");
    this.scene.start("game");
  }
  private mainMenu():void{
    if(this.finished)return;
    this.finished=true;
    this.game.scene.stop("game");
    this.scene.start("menu");
  }
}
