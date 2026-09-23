import { describe, expect, it } from "vitest";
import {
  ACTOR_HITBOXES, actorHurtbox, footBodyOffsets,
  hurtboxAimPoint, rayHurtboxIntersection,
} from "../src/combat/hurtbox";
import { nearestAimTarget } from "../src/input/mobileAim";

describe("projected character bodies", () => {
  const feet = {x: 100, y: 200};
  it("keeps movement collision attached to the foot position when sprite raster changes", () => {
    expect(footBodyOffsets(64, 56, 1.5, 15))
      .toEqual({x: 22, y: 46, radius: 10});
    const {x, y, radius}=footBodyOffsets(64, 56, 1.5, ACTOR_HITBOXES.player.footRadius);
    expect(100 - 64 * .75 + (x+radius)*1.5).toBe(100);
    expect(200 - 56 * 1.5 + (y+radius)*1.5).toBe(200);
    expect(radius*1.5).toBe(ACTOR_HITBOXES.player.footRadius);
  });
  it("positions separate combat hurtboxes over the visible torso/head", () => {
    const player=actorHurtbox("player", feet);
    const zombie=actorHurtbox("zombie", feet);
    expect(player).toEqual({
      centerX:100,centerY:165,radiusX:22,radiusY:36,
    });
    expect(zombie).toEqual({
      centerX:100,centerY:165,radiusX:24,radiusY:38,
    });
    expect(hurtboxAimPoint(zombie)).toEqual({x:100,y:165});
    expect(zombie.centerY+zombie.radiusY).toBeGreaterThan(200);
  });
  it("a crosshair on the head hits even though the old foot circle would miss", () => {
    const b=actorHurtbox("zombie",feet);
    const hit=rayHurtboxIntersection(
      {x:0,y:145},{x:1,y:0},200,b,
    );
    expect(hit).not.toBeNull();
    expect(hit!.distance).toBeGreaterThan(78);
    expect(hit!.distance).toBeLessThan(100);
    const miss=rayHurtboxIntersection(
      {x:0,y:116},{x:1,y:0},200,b,
    );
    expect(miss).toBeNull();
  });
  it("rejects shots beyond max distance and degenerate aim",()=>{
    const box=actorHurtbox("zombie",feet);
    expect(rayHurtboxIntersection({x:0,y:165},{x:1,y:0},60,box)).toBeNull();
    expect(rayHurtboxIntersection({x:0,y:165},{x:0,y:0},900,box)).toBeNull();
    expect(rayHurtboxIntersection({x:100,y:165},{x:1,y:0},900,box))
      .toMatchObject({distance:0});
  });
  it("picks the near exposed zombie by projected body, not by its feet",()=>{
    const data=[
      {...hurtboxAimPoint(actorHurtbox("zombie",{x:150,y:200})),id:"near",isDead:false},
      {...hurtboxAimPoint(actorHurtbox("zombie",{x:210,y:200})),id:"far",isDead:false},
    ];
    const target=nearestAimTarget(
      {x:0,y:165},data,{x:1,y:0},500,24,
      value=>value.id!=="near",
    );
    expect(target?.id).toBe("far");
  });
});
