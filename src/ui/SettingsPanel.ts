import Phaser from "phaser";
import {
  LocalSettingsStore,type GameSettings,type MobileAimMode,
} from "../persistence/LocalSettingsStore";
import {viewport} from "./responsive";

const AIM_MODES:readonly MobileAimMode[]=["stick-auto-fire","auto-aim","manual"];
const AIM_LABELS:Record<MobileAimMode,string>={
  "stick-auto-fire":"STICK AUTO-FIRE + ASSIST",
  "auto-aim":"AUTO-AIM + FIRE BUTTON",
  "manual":"MANUAL AIM + FIRE",
};
export class SettingsPanel{
  private readonly objects:Phaser.GameObjects.GameObject[]=[];
  private readonly store=new LocalSettingsStore();
  private settings:GameSettings;
  private readonly volumeText:Phaser.GameObjects.Text;
  private readonly damageText:Phaser.GameObjects.Text;
  private readonly aimText:Phaser.GameObjects.Text;
  constructor(
    private readonly scene:Phaser.Scene,
    private readonly onClose:()=>void,
  ){
    this.settings={...this.store.load().settings};
    const {width:w,height:h,compact}=viewport(scene.scale.width,scene.scale.height);
    const cx=w/2,cy=h/2;
    const panelHeight=Math.min(355,h-14);
    const xGap=Math.min(115,w*.23);
    const row=(offset:number)=>cy+offset*(panelHeight/355);
    const backdrop=scene.add.rectangle(cx,cy,Math.min(w-10,530),panelHeight,0x111312,.99)
      .setStrokeStyle(2,0xd6ad55,.85).setScrollFactor(0).setDepth(5000).setInteractive();
    this.objects.push(backdrop);
    this.text(cx,row(-145),"SETTINGS",compact?22:30,"#f0d27a");
    this.volumeText=this.text(cx,row(-98),"",compact?13:18);
    this.button(cx-xGap,row(-59),"VOL −",()=>this.adjustVolume(-.1),compact);
    this.button(cx+xGap,row(-59),"VOL +",()=>this.adjustVolume(.1),compact);
    this.damageText=this.text(cx,row(-17),"",compact?12:17);
    this.button(cx,row(21),"TOGGLE DAMAGE NUMBERS",()=>{
      this.settings.damageNumbers=!this.settings.damageNumbers;this.save();
    },compact);
    this.aimText=this.text(cx,row(65),"",compact?12:17);
    this.button(cx,row(103),"CHANGE MOBILE AIM",()=>{
      const current=AIM_MODES.indexOf(this.settings.mobileAimMode);
      this.settings.mobileAimMode=AIM_MODES[(current+1)%AIM_MODES.length]!;
      this.save();
    },compact);
    this.button(cx,row(147),"BACK",()=>this.close(),compact);
    this.refresh();
  }
  destroy():void{
    for(const object of this.objects)object.destroy();
    this.objects.length=0;
  }
  private text(x:number,y:number,text:string,size:number,color="#eae6d8"):Phaser.GameObjects.Text{
    const t=this.scene.add.text(x,y,text,{
      fontFamily:"monospace",fontSize:size+"px",color,
      align:"center",wordWrap:{width:Math.max(180,this.scene.scale.width-35)},
    }).setOrigin(.5).setScrollFactor(0).setDepth(5001);
    this.objects.push(t);return t;
  }
  private button(x:number,y:number,label:string,click:()=>void,compact:boolean):void{
    const t=this.scene.add.text(x,y,label,{
      fontFamily:"monospace",fontSize:(compact?12:16)+"px",
      color:"#f0d27a",backgroundColor:"#292b26",
      padding:{x:compact?8:15,y:compact?5:8},
    }).setOrigin(.5).setScrollFactor(0).setDepth(5002).setInteractive({useHandCursor:true});
    t.on("pointerdown",click);
    t.on("pointerover",()=>t.setColor("#ffffff"));
    t.on("pointerout",()=>t.setColor("#f0d27a"));
    this.objects.push(t);
  }
  private adjustVolume(delta:number):void{
    this.settings.masterVolume=Phaser.Math.Clamp(
      Math.round((this.settings.masterVolume+delta)*10)/10,0,1,
    );
    this.save();
  }
  private save():void{
    const data=this.store.saveSettings(this.settings);
    this.settings={...data.settings};
    this.scene.registry.set("gameSettings",data.settings);
    this.scene.registry.set("persistedGameData",data);
    this.refresh();
  }
  private refresh():void{
    this.volumeText.setText("MASTER VOLUME: "+Math.round(this.settings.masterVolume*100)+"%");
    this.damageText.setText("DAMAGE NUMBERS: "+(this.settings.damageNumbers?"ON":"OFF"));
    this.aimText.setText("MOBILE: "+AIM_LABELS[this.settings.mobileAimMode]);
  }
  private close():void{this.destroy();this.onClose();}
}
