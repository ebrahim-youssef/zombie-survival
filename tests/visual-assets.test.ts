import { describe, expect, it } from "vitest";
import {
  characterFrameCount, CHARACTER_W, CHARACTER_H, CHARACTER_SCALE, CHARACTER_DISPLAY_SIZE,
} from "../src/art/CharacterArt";
import { ENV_TEXTURES, CABIN_PALETTE, HUD_TEXTURES } from "../src/art/ArtManifest";


describe("original arcade art contracts",()=>{
  it("rasterizes 32-unit designs at 64px with unchanged world silhouette",()=>{
    expect([CHARACTER_W,CHARACTER_H,CHARACTER_SCALE]).toEqual([64,64,1.5]);
    expect(CHARACTER_DISPLAY_SIZE).toBe(96);
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
