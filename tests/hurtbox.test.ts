import {describe,expect,it} from "vitest";
import {
  ACTOR_HITBOXES,actorHurtbox,footBodyOffsets,
  hurtboxAimPoint,rayHurtboxIntersection,
} from "../src/combat/hurtbox";
import {nearestAimTarget} from "../src/input/mobileAim";

describe("restored 32x32 placeholder hit geometry",()=>{
  const center={x:100,y:200};
  it("matches the original Phaser circle offsets",()=>{
    expect(footBodyOffsets(32,16,1,11))
      .toEqual({x:5,y:5,radius:11});
    expect(ACTOR_HITBOXES.player.footRadius).toBe(11);
    expect(ACTOR_HITBOXES.zombie.footRadius).toBe(11);
  });
  it("aims at the center of the compact placeholder sprite",()=>{
    const player=actorHurtbox("player",center);
    const zombie=actorHurtbox("zombie",center);
    expect(player).toEqual({centerX:100,centerY:200,radiusX:16,radiusY:16});
    expect(zombie).toEqual({centerX:100,centerY:200,radiusX:16,radiusY:16});
    expect(hurtboxAimPoint(zombie)).toEqual(center);
  });
  it("intersects the visible placeholder body",()=>{
    const box=actorHurtbox("zombie",center);
    expect(rayHurtboxIntersection({x:0,y:200},{x:1,y:0},200,box)?.distance)
      .toBeCloseTo(84);
    expect(rayHurtboxIntersection({x:0,y:170},{x:1,y:0},200,box))
      .toBeNull();
  });
  it("keeps mobile target selection on the same center geometry",()=>{
    const data=[
      {...hurtboxAimPoint(actorHurtbox("zombie",{x:150,y:200})),id:"near"},
      {...hurtboxAimPoint(actorHurtbox("zombie",{x:210,y:200})),id:"far"},
    ];
    expect(nearestAimTarget(
      {x:0,y:200},data,{x:1,y:0},500,24,v=>v.id!=="near",
    )?.id).toBe("far");
  });
});
