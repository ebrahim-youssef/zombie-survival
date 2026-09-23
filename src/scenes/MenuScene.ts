import Phaser from "phaser";
import {LocalSettingsStore} from "../persistence/LocalSettingsStore";
import {SettingsPanel} from "../ui/SettingsPanel";
import {viewport} from "../ui/responsive";

export class MenuScene extends Phaser.Scene{
  private settingsPanel:SettingsPanel|undefined;
  private controlsVisible=false;
  constructor(){super("menu");}
  create():void{
    this.controlsVisible=false;
    this.build();
    this.scale.on(Phaser.Scale.Events.RESIZE,this.onResize,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.scale.off(Phaser.Scale.Events.RESIZE,this.onResize,this);
      this.settingsPanel?.destroy();
      this.settingsPanel=undefined;
    });
  }
  private onResize():void{
    const settingsOpen=!!this.settingsPanel;
    this.settingsPanel?.destroy();this.settingsPanel=undefined;
    this.cameras.main.setSize(this.scale.width,this.scale.height);
    this.children.removeAll(true);
    this.build();
    if(settingsOpen)this.openSettings();
  }
  private build():void{
    const data=new LocalSettingsStore().load();
    this.registry.set("persistedGameData",data);
    this.registry.set("gameSettings",data.settings);
    const {width:w,height:h,compact}=viewport(this.scale.width,this.scale.height);
    const cx=w/2,cy=h/2;
    const titleSize=Math.max(22,Math.min(52,w/13,h*.13));
    this.add.text(cx,compact?Math.max(43,h*.16):h*.20,"ZOMBIE SURVIVAL",{
      fontFamily:"monospace",fontSize:titleSize+"px",color:"#ede8dc",
    }).setOrigin(.5);
    this.add.text(cx,compact?h*.27:h*.30,
      "PSEUDO-ISOMETRIC ZOMBIE SURVIVAL",{
        fontFamily:"monospace",fontSize:(compact?12:17)+"px",color:"#b8ac86",
      }).setOrigin(.5);
    this.add.text(cx,compact?h*.36:h*.36,
      "BEST "+data.highScore+"   •   HIGHEST ROUND "+data.highestRound,{
        fontFamily:"monospace",fontSize:(compact?11:15)+"px",color:"#a9ab9d",
      }).setOrigin(.5);
    const step=compact?Math.min(48,h*.155):65;
    const start=cy-(compact?4:0);
    this.button(cx,start,"PLAY",()=>this.scene.start("game"),compact);
    this.button(cx,start+step,"CONTROLS",()=>this.toggleControls(),compact);
    this.button(cx,start+step*2,"SETTINGS",()=>this.openSettings(),compact);
    if(this.controlsVisible){
      this.add.text(cx,Math.min(h-13,start+step*2+step*.95),
        compact?"MOVE: WASD/LEFT STICK • AIM: MOUSE/RIGHT STICK • FIRE: LMB/STICK\nR RELOAD • E USE • 1/2 SWAP • ESC PAUSE"
          :"MOVE: WASD / ARROWS   AIM: MOUSE / RIGHT STICK\nLMB / STICK: FIRE   RMB: MELEE   R: RELOAD   E: USE   ESC: PAUSE",
        {fontFamily:"monospace",fontSize:(compact?10:14)+"px",
          color:"#c7c5b9",align:"center",
          wordWrap:{width:Math.max(220,w-30)}},
      ).setName("controls-panel").setOrigin(.5);
    }
  }
  private button(x:number,y:number,label:string,click:()=>void,compact:boolean):void{
    const t=this.add.text(x,y,label,{
      fontFamily:"monospace",fontSize:(compact?17:24)+"px",
      color:"#f0d27a",backgroundColor:"#262822",
      padding:{x:20,y:compact?6:10},
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    t.on("pointerdown",click);
    t.on("pointerover",()=>t.setColor("#ffffff"));
    t.on("pointerout",()=>t.setColor("#f0d27a"));
  }
  private toggleControls():void{
    if(this.settingsPanel)return;
    this.controlsVisible=!this.controlsVisible;
    this.children.removeAll(true);
    this.build();
  }
  private openSettings():void{
    if(this.settingsPanel)return;
    this.settingsPanel=new SettingsPanel(this,()=>{this.settingsPanel=undefined;});
  }
}
