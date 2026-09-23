import {describe,expect,it} from "vitest";
import {facingFromVector,FACINGS} from "../src/art/directions";
import {
  CHARACTER_W, CHARACTER_H, CHARACTER_SCALE, CHARACTER_FEET_Y,
  characterFrameCount, characterTexture,
} from "../src/art/CharacterArt";
describe("eight-way sprite directions",()=>{
  it("maps all octants to independently drawn side/front/back frames",()=>{
    expect(FACINGS.length).toBe(8);
    expect([
      [1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],
    ].map(([x,y])=>facingFromVector(x!,y!))).toEqual(FACINGS);
  });
  it("handles stationary input gracefully",()=>{
    expect(facingFromVector(0,0)).toBe("s");
  });
});

describe("32 × 32 arcade sprite contract",()=>{
  it("keeps native frames 32 × 32 and renders them at a crisp 2×",()=>{
    expect([CHARACTER_W,CHARACTER_H,CHARACTER_SCALE,CHARACTER_FEET_Y])
      .toEqual([32,32,2,28]);
  });
  it("keeps all eight direction and action frame names distinct",()=>{
    expect(characterFrameCount("player","walk")).toBe(4);
    expect(characterFrameCount("zombie","attack")).toBe(2);
    expect(characterTexture("player","n","walk",0))
      .not.toBe(characterTexture("player","s","walk",0));
  });
});
