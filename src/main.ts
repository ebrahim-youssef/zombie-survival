import "./styles.css";
import {createGame} from "./game/createGame";
import type {GameScene} from "./scenes/GameScene";

const game=createGame();
if(import.meta.env.DEV && new URLSearchParams(location.search).has("smoke")){
  // Only exposed by local Vite dev builds explicitly opened with ?smoke.
  Object.defineProperty(window,"__zombieSmoke",{
    value:{
      isActive:(name:string):boolean=>game.scene.isActive(name),
      viewport:():{width:number;height:number}=>({
        width:game.scale.width,height:game.scale.height,
      }),
      mobileState:()=> (game.scene.getScene("game") as GameScene).debugMobileState(),
      playerPosition:()=> (game.scene.getScene("game") as GameScene).debugPlayerPosition(),
      zoom:():number=>
        (game.scene.getScene("game") as GameScene).debugCameraZoom(),
      ammo:():number=>
        (game.scene.getScene("game") as GameScene).debugAmmo(),
      touchMode:():boolean=>
        (game.scene.getScene("game") as GameScene).debugUsesTouch(),
      getTextureCanvas:(key:string):HTMLCanvasElement=>{
        return game.textures.get(key).getSourceImage() as HTMLCanvasElement;
      },
      artComplexity:()=>{
        const inspect=(key:string)=>{
          const c=game.textures.get(key).getSourceImage() as HTMLCanvasElement;
          const ctx=c.getContext("2d");
          if(!ctx)throw Error("Missing 2D character texture canvas");
          return ctx.getImageData(0,0,c.width,c.height).data;
        };
        const front=inspect("character-player-s-idle-0");
        const east=inspect("character-player-e-idle-0");
        const zombie=inspect("character-zombie-s-walk-0");
        let translucent=0,diff=0,opaque=0;
        const colors=new Set<string>();
        for(let i=0;i<front.length;i+=4){
          const a=front[i+3]!;
          if(a>0&&a<255)translucent++;
          if(a===255){opaque++;colors.add(
            front[i]!+","+front[i+1]!+","+front[i+2]!
          );}
          if(front[i]!==east[i]||front[i+1]!==east[i+1]||
            front[i+2]!==east[i+2]||a!==east[i+3])diff++;
        }
        let zombieOpaque=0;
        for(let i=3;i<zombie.length;i+=4)if(zombie[i]===255)zombieOpaque++;
        return {translucent,diff,opaque,colors:colors.size,zombieOpaque};
      },
      artState:()=>{
        const dimensions=(key:string):{width:number;height:number}=>{
          const image=game.textures.get(key).getSourceImage() as HTMLCanvasElement;
          return {width:image.width,height:image.height};
        };
        return {
          player:dimensions("character-player-s-idle-0"),
          zombie:dimensions("character-zombie-s-walk-0"),
          chest:dimensions("cabin:mystery-chest"),
          lantern:dimensions("cabin:lantern"),
          heart:dimensions("hud:heart"),
          shelf:dimensions("cabin:shelf"),
          paper:dimensions("cabin:paper"),
        };
      },
      forceGameOver:():void=>
        (game.scene.getScene("game") as GameScene).debugForceGameOver(),
    },
    configurable:false,
  });
}
