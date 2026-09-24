import type Phaser from "phaser";
import type {GameSettings} from "../persistence/LocalSettingsStore";
import {
  SFX_PROFILES,
  type NoiseStep,
  type SfxId,
  type ToneStep,
} from "./sfxProfiles";

export type {SfxId} from "./sfxProfiles";

/**
 * Original chip-style SFX synthesizer.
 * Every sound is generated at runtime with WebAudio oscillators/noise.
 */
export class AudioController{
  private context:AudioContext|null=null;
  private noiseBuffer:AudioBuffer|null=null;

  constructor(private readonly scene:Phaser.Scene){}

  play(id:SfxId):void{
    const settings=this.scene.registry.get("gameSettings") as GameSettings|undefined;
    const master=settings?.masterVolume??.65;
    if(master<=0)return;
    const context=this.getContext();
    if(!context)return;
    if(context.state==="suspended")void context.resume();

    const profile=SFX_PROFILES[id];
    const origin=context.currentTime+.002;
    for(const step of profile.tones)this.scheduleTone(context,origin,step,master);
    for(const step of profile.noise)this.scheduleNoise(context,origin,step,master);
  }

  destroy():void{
    this.noiseBuffer=null;
    if(this.context){
      void this.context.close();
      this.context=null;
    }
  }

  private scheduleTone(
    context:AudioContext,origin:number,step:ToneStep,master:number,
  ):void{
    const start=origin+step.delayMs/1000;
    const end=start+step.durationMs/1000;
    const osc=context.createOscillator();
    const gain=context.createGain();
    osc.type=step.type;
    osc.frequency.setValueAtTime(Math.max(20,step.startHz),start);
    if(step.endHz!==step.startHz){
      osc.frequency.exponentialRampToValueAtTime(Math.max(20,step.endHz),end);
    }
    const peak=Math.max(.0001,step.gain*master);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.linearRampToValueAtTime(peak,start+.004);
    gain.gain.exponentialRampToValueAtTime(.0001,end);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(end+.006);
  }

  private scheduleNoise(
    context:AudioContext,origin:number,step:NoiseStep,master:number,
  ):void{
    const start=origin+step.delayMs/1000;
    const end=start+step.durationMs/1000;
    const source=context.createBufferSource();
    source.buffer=this.getNoiseBuffer(context);
    const filter=context.createBiquadFilter();
    filter.type="bandpass";
    filter.frequency.setValueAtTime(step.filterHz,start);
    filter.Q.setValueAtTime(step.q,start);
    const gain=context.createGain();
    gain.gain.setValueAtTime(Math.max(.0001,step.gain*master),start);
    gain.gain.exponentialRampToValueAtTime(.0001,end);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(start,0,step.durationMs/1000);
  }

  private getNoiseBuffer(context:AudioContext):AudioBuffer{
    if(this.noiseBuffer)return this.noiseBuffer;
    const length=Math.ceil(context.sampleRate*.25);
    const buffer=context.createBuffer(1,length,context.sampleRate);
    const data=buffer.getChannelData(0);
    // Deterministic 16-bit LFSR-style noise: crunchy and repeatable.
    let state=0xACE1;
    for(let i=0;i<data.length;i++){
      const bit=((state>>0)^(state>>2)^(state>>3)^(state>>5))&1;
      state=(state>>1)|(bit<<15);
      data[i]=((state&0xff)/127.5-1)*.82;
    }
    this.noiseBuffer=buffer;
    return buffer;
  }

  private getContext():AudioContext|null{
    if(this.context)return this.context;
    try{
      this.context=new AudioContext();
      return this.context;
    }catch{
      return null;
    }
  }
}
