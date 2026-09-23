import Phaser from "phaser";

export interface GameOverData{
  round:number;kills:number;points:number;
  highScore:number;highestRound:number;
}

/**
 * DOM controls avoid the Phaser canvas pointer-routing problems that left
 * game-over restart unresponsive, particularly with mobile controls.
 * The game scene is already paused before this scene launches.
 */
export class GameOverScene extends Phaser.Scene{
  private finished=false;
  private resultData:GameOverData={
    round:1,kills:0,points:0,highScore:0,highestRound:0,
  };
  private overlay:HTMLDivElement|null=null;
  constructor(){super("gameOver");}
  init(data:GameOverData):void{
    this.resultData=data;this.finished=false;
  }
  create():void{
    const parent=document.getElementById("game-root");
    if(!parent){
      throw new Error("Game root missing for game-over controls.");
    }
    const layer=document.createElement("div");
    layer.className="gameover-overlay";
    layer.setAttribute("role","dialog");
    layer.setAttribute("aria-label","Game over");
    layer.setAttribute("aria-modal","true");
    layer.tabIndex=-1;
    layer.style.cssText=[
      "position:absolute","inset:0","z-index:100",
      "display:flex","align-items:center","justify-content:center",
      "background:#080909ed","color:#ede8dc","font-family:monospace",
      "pointer-events:auto","padding:10px","overflow:auto",
      "box-sizing:border-box",
    ].join(";");
    const panel=document.createElement("div");
    panel.style.cssText=[
      "display:flex","flex-direction:column","align-items:center",
      "justify-content:center","gap:clamp(8px,2vh,17px)",
      "width:min(95%,540px)","max-height:100%","text-align:center",
    ].join(";");
    const title=document.createElement("h1");
    title.textContent="GAME OVER";
    title.style.cssText=[
      "color:#e1a55f","font-size:clamp(24px,5vw,44px)",
      "line-height:1","margin:0 0 5px",
    ].join(";");
    const info=document.createElement("p");
    const r=this.resultData;
    info.textContent=
      "ROUND "+r.round+"  •  KILLS "+r.kills+"  •  POINTS "+r.points;
    info.style.cssText=[
      "font-size:clamp(12px,2.6vw,20px)","line-height:1.4","margin:0",
    ].join(";");
    const records=document.createElement("p");
    records.textContent=
      "BEST "+r.highScore+"  •  HIGHEST ROUND "+r.highestRound;
    records.style.cssText=[
      "font-size:clamp(11px,2vw,16px)","color:#b8ac86","margin:0 0 2px",
    ].join(";");
    const restart=this.createButton("RESTART",()=>this.restart());
    const main=this.createButton("MAIN MENU",()=>this.mainMenu());
    const hint=document.createElement("p");
    hint.textContent="ENTER / SPACE: RESTART";
    hint.style.cssText=[
      "font-size:clamp(11px,2vw,14px)","margin:0",
      "color:#a49d88",
    ].join(";");
    panel.append(title,info,records,restart,main,hint);
    layer.appendChild(panel);
    parent.appendChild(layer);
    this.overlay=layer;
    document.addEventListener("keydown",this.onKeyDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.cleanup());
    layer.focus();
  }
  private createButton(label:string,action:()=>void):HTMLButtonElement{
    const button=document.createElement("button");
    button.type="button";
    button.textContent=label;
    button.style.cssText=[
      "min-width:min(250px,75vw)","min-height:42px",
      "padding:8px 22px","border:2px solid #d6ad55",
      "border-radius:6px","color:#f0d27a",
      "background:#30312b","font-family:monospace",
      "font-size:clamp(15px,2.6vw,21px)",
      "font-weight:bold","cursor:pointer","touch-action:manipulation",
    ].join(";");
    button.addEventListener("click",action);
    return button;
  }
  private readonly onKeyDown=(event:KeyboardEvent):void=>{
    if(event.key==="Enter"||event.code==="Space"){
      event.preventDefault();this.restart();
    }else if(event.key==="Escape"){
      event.preventDefault();this.mainMenu();
    }
  };
  private restart():void{
    if(this.finished)return;
    this.finished=true;
    this.cleanup();
    this.game.scene.stop("gameOver");
    this.game.scene.stop("game");
    this.game.scene.start("game");
  }
  private mainMenu():void{
    if(this.finished)return;
    this.finished=true;
    this.cleanup();
    this.game.scene.stop("gameOver");
    this.game.scene.stop("game");
    this.game.scene.start("menu");
  }
  private cleanup():void{
    document.removeEventListener("keydown",this.onKeyDown);
    this.overlay?.remove();this.overlay=null;
  }
}
