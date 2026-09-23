import {describe,it,expect} from "vitest";
import {nearestAimTarget} from "../src/input/mobileAim";
import {mobileControlsLayout,viewport} from "../src/ui/responsive";

describe("mobile aim selection",()=>{
  const origin={x:0,y:0};
  const zombies=[
    {x:100,y:0,isDead:false},
    {x:80,y:80,isDead:false},
    {x:150,y:0,isDead:false},
    {x:20,y:0,isDead:true},
  ];
  it("snaps to closest live zombie within the right-stick cone",()=>{
    expect(nearestAimTarget(origin,zombies,{x:1,y:0},250,23)).toBe(zombies[0]);
  });
  it("filters dead, obstructed, and distant targets",()=>{
    expect(nearestAimTarget(origin,zombies,null,1000,180,z=>z.x!==100)).toBe(zombies[1]);
    expect(nearestAimTarget(origin,zombies,{x:-1,y:0},200,23)).toBeNull();
    expect(nearestAimTarget(origin,zombies,null,50,180)).toBeNull();
  });
});
describe("responsive screen layouts",()=>{
  it("uses every viewport pixel without 16:9 letterboxing",()=>{
    expect(viewport(844,390)).toMatchObject({width:844,height:390,compact:true,portrait:false});
    expect(viewport(390,844).portrait).toBe(true);
  });
  it("keeps landscape sticks and actions inside small phones",()=>{
    const l=mobileControlsLayout(844,390);
    for(const point of [l.move,l.aim,l.fire,l.melee,l.reload,l.use,l.swap,l.pause]){
      expect(point.x).toBeGreaterThan(0);
      expect(point.x).toBeLessThan(844);
      expect(point.y).toBeGreaterThan(0);
      expect(point.y).toBeLessThan(390);
    }
  });
  it("supports portrait layout without cropping",()=>{
    const l=mobileControlsLayout(390,844);
    expect(l.move.x).toBeLessThan(l.aim.x);
    expect(l.fire.y).toBeLessThan(844);
  });
});
