import Phaser from "phaser";
import { GAME_BACKGROUND,GAME_HEIGHT,GAME_WIDTH } from "./constants";
import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { GameScene } from "../scenes/GameScene";
import { UIScene } from "../scenes/UIScene";
import { PauseScene } from "../scenes/PauseScene";
import { GameOverScene } from "../scenes/GameOverScene";

export function createGame():Phaser.Game{
  const root=document.getElementById("game-root");
  const width=Math.max(1,root?.clientWidth??window.innerWidth);
  const height=Math.max(1,root?.clientHeight??window.innerHeight);
  const game=new Phaser.Game({
    type:Phaser.AUTO,
    parent:"game-root",
    backgroundColor:GAME_BACKGROUND,
    pixelArt:true,
    roundPixels:true,
    width:width||GAME_WIDTH,
    height:height||GAME_HEIGHT,
    physics:{default:"arcade",arcade:{gravity:{x:0,y:0},debug:false}},
    scale:{
      mode:Phaser.Scale.RESIZE,
      autoCenter:Phaser.Scale.CENTER_BOTH,
      width,
      height,
    },
    scene:[BootScene,MenuScene,GameScene,UIScene,PauseScene,GameOverScene],
  });
  // Mobile browser chrome changes visual viewport independently of orientation.
  const refresh=():void=>game.scale.refresh();
  window.visualViewport?.addEventListener("resize",refresh);
  return game;
}
