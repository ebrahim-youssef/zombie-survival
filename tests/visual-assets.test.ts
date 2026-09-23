import { describe, expect, it } from "vitest";
import {
  characterFrameCount, CHARACTER_W, CHARACTER_H, CHARACTER_SCALE,
} from "../src/art/CharacterArt";
import { ENV_TEXTURES, CABIN_PALETTE, HUD_TEXTURES } from "../src/art/ArtManifest";


describe("original arcade art contracts",()=>{
  it("uses chunky native 32x32 character frames with 2x nearest-neighbour display",()=>{
    expect([CHARACTER_W,CHARACTER_H,CHARACTER_SCALE]).toEqual([32,32,3]);
    expect(characterFrameCount("player","walk")).toBe(4);
    expect(characterFrameCount("zombie","walk")).toBe(4);
  });
  it("keeps prop identifiers and the warm/cool palette stable",()=>{
    expect(Object.keys(ENV_TEXTURES).length).toBeGreaterThanOrEqual(9);
    expect(CABIN_PALETTE.gold).toBe(0xf5b740);
    expect(CABIN_PALETTE.night).toBe(0x08182b);
    expect(HUD_TEXTURES.heart).toBe("hud:heart");
  });
});
