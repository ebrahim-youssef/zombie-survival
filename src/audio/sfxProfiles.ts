export type SfxId =
  | "shot"
  | "melee"
  | "hit"
  | "kill"
  | "hurt"
  | "purchase"
  | "error"
  | "box"
  | "ui";

export interface ToneStep {
  readonly startHz:number;
  readonly endHz:number;
  readonly durationMs:number;
  readonly delayMs:number;
  readonly gain:number;
  readonly type:"square"|"triangle"|"sawtooth";
}
export interface NoiseStep {
  readonly durationMs:number;
  readonly delayMs:number;
  readonly gain:number;
  readonly filterHz:number;
  readonly q:number;
}
export interface SfxProfile {
  readonly tones:readonly ToneStep[];
  readonly noise:readonly NoiseStep[];
}

const tone=(
  startHz:number,endHz:number,durationMs:number,gain:number,
  type:ToneStep["type"]="square",delayMs=0,
):ToneStep=>({startHz,endHz,durationMs,gain,type,delayMs});
const noise=(
  durationMs:number,gain:number,filterHz:number,q=1,delayMs=0,
):NoiseStep=>({durationMs,gain,filterHz,q,delayMs});

/**
 * Original runtime-generated 8-bit/arcade SFX.
 * No external samples or copyrighted sound assets are used.
 */
export const SFX_PROFILES:Readonly<Record<SfxId,SfxProfile>>={
  shot:{
    tones:[
      tone(190,72,58,.115,"square"),
      tone(95,52,72,.055,"triangle",5),
    ],
    noise:[noise(48,.09,1500,.65)],
  },
  melee:{
    tones:[
      tone(118,54,95,.085,"sawtooth"),
      tone(72,42,115,.05,"triangle",15),
    ],
    noise:[noise(72,.055,620,.8,5)],
  },
  hit:{
    tones:[tone(330,145,62,.065,"square")],
    noise:[noise(45,.04,1200,1.2)],
  },
  kill:{
    tones:[
      tone(210,118,95,.08,"square"),
      tone(132,76,125,.06,"triangle",38),
    ],
    noise:[noise(70,.045,520,.7,10)],
  },
  hurt:{
    tones:[
      tone(120,48,165,.10,"sawtooth"),
      tone(82,38,150,.05,"square",18),
    ],
    noise:[noise(110,.05,360,.9)],
  },
  purchase:{
    tones:[
      tone(420,420,55,.052,"square"),
      tone(560,560,60,.052,"square",54),
      tone(740,740,85,.058,"triangle",112),
    ],
    noise:[],
  },
  error:{
    tones:[
      tone(155,128,82,.055,"square"),
      tone(118,92,105,.055,"square",88),
    ],
    noise:[],
  },
  box:{
    tones:[
      tone(245,245,58,.045,"square"),
      tone(330,330,58,.045,"square",58),
      tone(440,440,58,.045,"square",116),
      tone(590,590,90,.052,"triangle",174),
    ],
    noise:[noise(70,.025,1700,1,145)],
  },
  ui:{
    tones:[tone(650,540,48,.038,"square")],
    noise:[],
  },
};

export function profileDurationMs(profile:SfxProfile):number{
  let end=0;
  for(const step of profile.tones){
    end=Math.max(end,step.delayMs+step.durationMs);
  }
  for(const step of profile.noise){
    end=Math.max(end,step.delayMs+step.durationMs);
  }
  return end;
}
