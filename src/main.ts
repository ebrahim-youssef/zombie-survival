import "./styles.css";
import {createGame} from "./game/createGame";
import type {GameScene} from "./scenes/GameScene";

const game=createGame();
if(new URLSearchParams(location.search).get("debug")==="1"){
  // Explicit browser QA hook. Exists in deployed builds only when testing
  // is requested with ?debug=1; avoid exposing it on normal page loads.
  Object.defineProperty(window,"__zombieDebug",{
    value:{
      scene:(name:string):boolean=>game.scene.isActive(name),
      state:()=> (game.scene.getScene("game") as GameScene).debugShortcutsState(),
    },
    configurable:false,
  });
}
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
      debugState:()=> (game.scene.getScene("game") as GameScene).debugShortcutsState(),
      alignedShot:()=> (game.scene.getScene("game") as GameScene).debugFireAtAlignedTarget(),
      alignedMelee:()=> (game.scene.getScene("game") as GameScene).debugMeleeAtAlignedTarget(),
      lightingState:()=> (game.scene.getScene("game") as GameScene).debugLightingState(),
      performanceState:()=> (game.scene.getScene("game") as GameScene).debugPerformanceState(),
      interactionState:()=> (game.scene.getScene("game") as GameScene).debugInteractionState(),
      moveToInteraction:(target:"mr6"|"kuda"|"box")=>
        (game.scene.getScene("game") as GameScene).debugMoveToInteraction(target),
      addPoints:(amount:number)=>
        (game.scene.getScene("game") as GameScene).debugAddPoints(amount),
      advanceInteraction:(ms:number)=>
        (game.scene.getScene("game") as GameScene).debugAdvanceInteraction(ms),
      timingState:()=> (game.scene.getScene("game") as GameScene).debugTimingState(),
      ammo:():number=>
        (game.scene.getScene("game") as GameScene).debugAmmo(),
      touchMode:():boolean=>
        (game.scene.getScene("game") as GameScene).debugUsesTouch(),
      placeholderState:()=>{
        const dimensions=(key:string):{width:number;height:number}|null=>{
          if(!game.textures.exists(key))return null;
          const image=game.textures.get(key).getSourceImage() as HTMLCanvasElement;
          return {width:image.width,height:image.height};
        };
        return {
          player:dimensions("player-placeholder"),
          zombie:dimensions("zombie-placeholder"),
        };
      },
      pauseControlsVisible:():boolean=>{
        const scene=game.scene.getScene("pause") as import("./scenes/PauseScene").PauseScene;
        return scene.debugControlsVisible();
      },
      forceGameOver:():void=>
        (game.scene.getScene("game") as GameScene).debugForceGameOver(),
    },
    configurable:false,
  });
}
