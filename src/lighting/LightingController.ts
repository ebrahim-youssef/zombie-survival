import Phaser from "phaser";

const GLOW_TEXTURE="lighting:soft-glow";

interface TrackedFlash {
  readonly object:Phaser.GameObjects.GameObject;
}

export interface LightingSnapshot{
  renderer:"webgl"|"canvas";
  lamp:{x:number;y:number;radius:number};
  activeMuzzleFlashes:number;
  totalMuzzleFlashes:number;
}

/**
 * Small lighting experiment isolated from arena/sprite art.
 *
 * WebGL: uses Phaser PointLight Game Objects (fast faux point lights).
 * Canvas fallback: additive radial Canvas texture with the same lifetime.
 */
export class LightingController{
  private readonly webgl:boolean;
  private readonly lampPosition:Phaser.Math.Vector2;
  private readonly lampRadius=210;
  private readonly lampObjects:Phaser.GameObjects.GameObject[]=[];
  private readonly flashes=new Set<TrackedFlash>();
  private totalMuzzleFlashes=0;

  constructor(
    private readonly scene:Phaser.Scene,
    x:number,
    y:number,
  ){
    this.webgl=scene.game.renderer.type===Phaser.WEBGL;
    this.lampPosition=new Phaser.Math.Vector2(x,y);
    this.ensureGlowTexture();
    this.createLamp();
  }

  muzzleFlash(position:Phaser.Math.Vector2):void{
    this.totalMuzzleFlashes+=1;
    const object=this.webgl
      ? this.scene.lights
          .addPointLight(position.x,position.y,0xffc35a,96,1.65,.10)
          .setDepth(905)
      : this.createGlow(position.x,position.y,96,.9,905);
    const tracked={object};
    this.flashes.add(tracked);
    this.scene.time.delayedCall(120,()=>{
      this.flashes.delete(tracked);
      if(object.active)object.destroy();
    });
  }

  snapshot():LightingSnapshot{
    return {
      renderer:this.webgl?"webgl":"canvas",
      lamp:{x:this.lampPosition.x,y:this.lampPosition.y,radius:this.lampRadius},
      activeMuzzleFlashes:this.flashes.size,
      totalMuzzleFlashes:this.totalMuzzleFlashes,
    };
  }

  destroy():void{
    for(const flash of this.flashes){
      if(flash.object.active)flash.object.destroy();
    }
    this.flashes.clear();
    for(const object of this.lampObjects){
      if(object.active)object.destroy();
    }
    this.lampObjects.length=0;
  }

  private createLamp():void{
    if(this.webgl){
      this.scene.lights.enable();
      const light=this.scene.lights.addPointLight(
        this.lampPosition.x,this.lampPosition.y,
        0xffb34f,this.lampRadius,1.15,.075,
      ).setDepth(6);
      this.lampObjects.push(light);
    }else{
      this.lampObjects.push(
        this.createGlow(
          this.lampPosition.x,this.lampPosition.y,
          this.lampRadius,.58,6,
        ),
      );
    }

    // Tiny neutral marker so the experiment has an actual lamp source.
    const shade=this.scene.add.circle(
      this.lampPosition.x,this.lampPosition.y-5,7,0xf1bd5b,1,
    ).setStrokeStyle(2,0x5a4631,.9).setDepth(7);
    const stand=this.scene.add.rectangle(
      this.lampPosition.x,this.lampPosition.y+6,3,16,0x68543a,1,
    ).setDepth(7);
    this.lampObjects.push(shade,stand);
  }

  private createGlow(
    x:number,y:number,radius:number,alpha:number,depth:number,
  ):Phaser.GameObjects.Image{
    return this.scene.add.image(x,y,GLOW_TEXTURE)
      .setDisplaySize(radius*2,radius*2)
      .setAlpha(alpha)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(depth);
  }

  private ensureGlowTexture():void{
    if(this.scene.textures.exists(GLOW_TEXTURE))return;
    const size=128;
    const canvas=document.createElement("canvas");
    canvas.width=size;canvas.height=size;
    const context=canvas.getContext("2d");
    if(!context)return;
    const gradient=context.createRadialGradient(
      size/2,size/2,0,size/2,size/2,size/2,
    );
    gradient.addColorStop(0,"rgba(255,238,170,.82)");
    gradient.addColorStop(.22,"rgba(255,190,82,.48)");
    gradient.addColorStop(.58,"rgba(255,132,50,.16)");
    gradient.addColorStop(1,"rgba(255,110,35,0)");
    context.fillStyle=gradient;
    context.fillRect(0,0,size,size);
    this.scene.textures.addCanvas(GLOW_TEXTURE,canvas);
  }
}
