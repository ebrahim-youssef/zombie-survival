import Phaser from "phaser";
import {SettingsPanel} from "../ui/SettingsPanel";
import {ControlsPanel} from "../ui/ControlsPanel";
import {viewport} from "../ui/responsive";

export class PauseScene extends Phaser.Scene{
  private settingsPanel:SettingsPanel|undefined;
  private controlsPanel:ControlsPanel|undefined;
  constructor(){super("pause");}
  create():void{
    this.build();
    this.input.keyboard?.on("keydown-ESC",this.escape,this);
    this.scale.on(Phaser.Scale.Events.RESIZE,this.onResize,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.input.keyboard?.off("keydown-ESC",this.escape,this);
      this.scale.off(Phaser.Scale.Events.RESIZE,this.onResize,this);
      this.settingsPanel?.destroy();this.settingsPanel=undefined;
      this.controlsPanel?.destroy();this.controlsPanel=undefined;
    });
  }
  private onResize():void{
    const hadSettings=!!this.settingsPanel;
    const hadControls=!!this.controlsPanel;
    this.settingsPanel?.destroy();this.settingsPanel=undefined;
    this.controlsPanel?.destroy();this.controlsPanel=undefined;
    this.cameras.main.setSize(this.scale.width,this.scale.height);
    this.children.removeAll(true);
    this.build();
    if(hadSettings)this.openSettings();
    else if(hadControls)this.openControls();
  }
  private build():void{
    const {width:w,height:h,compact}=viewport(this.scale.width,this.scale.height);
    const cx=w/2,cy=h/2;
    this.add.rectangle(cx,cy,w,h,0x090b0a,.89).setInteractive();
    this.add.text(cx,compact?cy-111:cy-187,"PAUSED",{
      fontFamily:"monospace",fontSize:(compact?30:46)+"px",color:"#ede8dc",
    }).setOrigin(.5);
    const gap=compact?42:58;
    const first=compact?cy-76:cy-108;
    this.button(cx,first,"RESUME",()=>this.resumeGame(),compact);
    this.button(cx,first+gap,"CONTROLS",()=>this.openControls(),compact);
    this.button(cx,first+gap*2,"SETTINGS",()=>this.openSettings(),compact);
    this.button(cx,first+gap*3,"RESTART",()=>this.restartGame(),compact);
    this.button(cx,first+gap*4,"MAIN MENU",()=>this.mainMenu(),compact);
  }
  private button(x:number,y:number,text:string,click:()=>void,compact:boolean):void{
    const b=this.add.text(x,y,text,{
      fontFamily:"monospace",fontSize:(compact?17:22)+"px",color:"#f0d27a",
      backgroundColor:"#262822",padding:{x:20,y:compact?6:10},
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    b.on("pointerdown",click);
    b.on("pointerover",()=>b.setColor("#fff"));
    b.on("pointerout",()=>b.setColor("#f0d27a"));
  }
  private escape():void{
    if(this.settingsPanel){
      this.settingsPanel.destroy();this.settingsPanel=undefined;
    }else if(this.controlsPanel){
      this.controlsPanel.destroy();this.controlsPanel=undefined;
    }else this.resumeGame();
  }
  private openControls():void{
    if(this.settingsPanel||this.controlsPanel)return;
    this.controlsPanel=new ControlsPanel(this,()=>{this.controlsPanel=undefined;});
  }
  private openSettings():void{
    if(this.settingsPanel||this.controlsPanel)return;
    this.settingsPanel=new SettingsPanel(this,()=>{this.settingsPanel=undefined;});
  }
  debugControlsVisible():boolean{return !!this.controlsPanel;}
  private resumeGame():void{
    this.settingsPanel?.destroy();this.settingsPanel=undefined;
    this.controlsPanel?.destroy();this.controlsPanel=undefined;
    this.scene.stop();
    this.scene.resume("game");
  }
  private restartGame():void{
    this.game.scene.stop("game");
    this.scene.start("game");
  }
  private mainMenu():void{
    this.game.scene.stop("game");
    this.scene.start("menu");
  }
}
