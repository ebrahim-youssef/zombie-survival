import {describe,expect,it} from "vitest";
import {facingFromVector,FACINGS} from "../src/art/directions";
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

