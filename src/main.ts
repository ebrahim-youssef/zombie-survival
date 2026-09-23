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
        };
      },
      forceGameOver:():void=>
        (game.scene.getScene("game") as GameScene).debugForceGameOver(),
    },
    configurable:false,
  });
}
