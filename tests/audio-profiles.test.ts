import {describe,expect,it} from "vitest";
import {SFX_PROFILES,profileDurationMs,type SfxId} from "../src/audio/sfxProfiles";

describe("generated 8-bit SFX profiles",()=>{
  const ids:SfxId[]=[
    "shot","melee","hit","kill","hurt","purchase","error","box","ui",
  ];
  it("defines every game sound with a short bounded profile",()=>{
    expect(Object.keys(SFX_PROFILES).sort()).toEqual([...ids].sort());
    for(const id of ids){
      const profile=SFX_PROFILES[id];
      expect(profile.tones.length+profile.noise.length).toBeGreaterThan(0);
      expect(profileDurationMs(profile)).toBeGreaterThan(20);
      expect(profileDurationMs(profile)).toBeLessThanOrEqual(300);
      for(const step of profile.tones){
        expect(step.gain).toBeGreaterThan(0);
        expect(step.gain).toBeLessThanOrEqual(.12);
        expect(step.startHz).toBeGreaterThanOrEqual(20);
        expect(step.endHz).toBeGreaterThanOrEqual(20);
      }
    }
  });
  it("gives weapon/impact sounds a generated noise layer",()=>{
    for(const id of ["shot","melee","hit","kill","hurt"] as const){
      expect(SFX_PROFILES[id].noise.length).toBeGreaterThan(0);
    }
  });
});
