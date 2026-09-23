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
      ammo:():number=>
        (game.scene.getScene("game") as GameScene).debugAmmo(),
      touchMode:():boolean=>
        (game.scene.getScene("game") as GameScene).debugUsesTouch(),
      forceGameOver:():void=>
        (game.scene.getScene("game") as GameScene).debugForceGameOver(),
    },
    configurable:false,
  });
}
