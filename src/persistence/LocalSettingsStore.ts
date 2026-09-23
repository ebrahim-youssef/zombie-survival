export type MobileAimMode="stick-auto-fire"|"auto-aim"|"manual";

export interface GameSettings{
  masterVolume:number;
  mouseSensitivity:number;
  damageNumbers:boolean;
  mobileAimMode:MobileAimMode;
}
export interface PersistedGameData{
  version:1;
  highScore:number;
  highestRound:number;
  settings:GameSettings;
}
const STORAGE_KEY="zombie-survival:data:v1";
export const DEFAULT_SETTINGS:GameSettings={
  masterVolume:.65,mouseSensitivity:1,damageNumbers:false,
  mobileAimMode:"stick-auto-fire",
};
export const DEFAULT_PERSISTED_DATA:PersistedGameData={
  version:1,highScore:0,highestRound:0,settings:DEFAULT_SETTINGS,
};
export function isMobileAimMode(value:unknown):value is MobileAimMode{
  return value==="stick-auto-fire"||value==="auto-aim"||value==="manual";
}
function numberInRange(value:unknown,min:number,max:number,fallback:number):number{
  return typeof value==="number"&&Number.isFinite(value)
    ?Math.max(min,Math.min(max,value)):fallback;
}
function nonnegativeInteger(value:unknown):number{
  return typeof value==="number"&&Number.isFinite(value)
    ?Math.max(0,Math.floor(value)):0;
}
function isRecord(value:unknown):value is Record<string,unknown>{
  return value!==null&&typeof value==="object"&&!Array.isArray(value);
}
function sanitizeSettings(input:unknown):GameSettings{
  const data=isRecord(input)?input:{};
  return {
    masterVolume:numberInRange(data.masterVolume,0,1,DEFAULT_SETTINGS.masterVolume),
    mouseSensitivity:numberInRange(data.mouseSensitivity,.25,2,DEFAULT_SETTINGS.mouseSensitivity),
    damageNumbers:typeof data.damageNumbers==="boolean"?data.damageNumbers:DEFAULT_SETTINGS.damageNumbers,
    mobileAimMode:isMobileAimMode(data.mobileAimMode)?data.mobileAimMode:DEFAULT_SETTINGS.mobileAimMode,
  };
}
export class LocalSettingsStore{
  load():PersistedGameData{
    try{
      const raw=window.localStorage.getItem(STORAGE_KEY);
      if(!raw)return this.defaults();
      const parsed:unknown=JSON.parse(raw);
      if(!isRecord(parsed))return this.defaults();
      return {version:1,highScore:nonnegativeInteger(parsed.highScore),
        highestRound:nonnegativeInteger(parsed.highestRound),
        settings:sanitizeSettings(parsed.settings)};
    }catch{return this.defaults();}
  }
  saveSettings(settings:GameSettings):PersistedGameData{
    const next={...this.load(),settings:sanitizeSettings(settings)};
    this.write(next);
    return next;
  }
  recordRun(score:number,round:number):PersistedGameData{
    const old=this.load();
    const next={...old,highScore:Math.max(old.highScore,nonnegativeInteger(score)),
      highestRound:Math.max(old.highestRound,nonnegativeInteger(round))};
    this.write(next);
    return next;
  }
  private defaults():PersistedGameData{
    return {...DEFAULT_PERSISTED_DATA,settings:{...DEFAULT_SETTINGS}};
  }
  private write(data:PersistedGameData):void{
    try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
    catch{/* Sandboxed / private browser */ }
  }
}
