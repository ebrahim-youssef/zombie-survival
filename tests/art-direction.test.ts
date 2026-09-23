import {describe,it,expect} from "vitest";
import {CABIN_PALETTE,CHARACTER_PALETTE} from "../src/art/ArtManifest";
import {WORLD_DEPTH,actorDepth,tallPropDepth,surfaceDepth} from "../src/art/worldLayers";
describe("three-quarter art rendering contract",()=>{
  it("defines a restrained warm/cool palette and separate readable actors",()=>{
    expect(CABIN_PALETTE.plank).toBe(0x90623f);
    expect(CABIN_PALETTE.night).toBe(0x101e30);
    expect(CABIN_PALETTE.gold).toBe(0xf5b740);
    expect(CHARACTER_PALETTE.survivor.shirt)
      .not.toBe(CHARACTER_PALETTE.zombie.shirt);
  });
  it("keeps flat ground material below ALL actors regardless of world y",()=>{
    for(const y of [-500,0,200,700,1200,2000]){
      expect(surfaceDepth("decal")).toBeLessThan(actorDepth(y));
      expect(surfaceDepth("light")).toBeLessThan(actorDepth(y));
      expect(tallPropDepth(y)).toBeGreaterThan(actorDepth(y));
      expect(tallPropDepth(y-5)).toBeLessThan(actorDepth(y));
      expect(actorDepth(y)).toBeLessThan(WORLD_DEPTH.foregroundWall);
      expect(WORLD_DEPTH.windowBackdrop).toBeLessThan(WORLD_DEPTH.outsideActor);
      expect(WORLD_DEPTH.outsideActor).toBeLessThan(WORLD_DEPTH.rearWall);
    }
  });
  it("sorts living actors by feet and excludes background occlusion",()=>{
    expect(actorDepth(850)).toBeGreaterThan(actorDepth(620));
    expect(WORLD_DEPTH.groundDecal).toBeLessThan(WORLD_DEPTH.outsideActor);
    expect(WORLD_DEPTH.rearWall).toBeLessThan(actorDepth(-500));
    expect(WORLD_DEPTH.combatEffects).toBeLessThan(WORLD_DEPTH.hud);
  });
});
