import {describe,expect,it} from "vitest";
import {
  DEFAULT_ARENA_DIMENSIONS,cabinVertices,cabinHalfWidthAtY,
  floorPolygonArea,windowEdgeRatio,windowGapFractions,
} from "../src/world/arenaGeometry";
describe("three-quarter adventure room geometry",()=>{
  const c=DEFAULT_ARENA_DIMENSIONS,v=cabinVertices(c);
  it("is substantially larger than the old tight trapezoid",()=>{
    const oldHeight=330*(.76+.96),oldBackWidth=2*730*.49,oldFrontWidth=2*730;
    const oldArea=(oldBackWidth+oldFrontWidth)*oldHeight/2;
    expect(c.halfWidth).toBeGreaterThan(730);
    expect(c.halfHeight).toBeGreaterThan(330);
    expect(floorPolygonArea(v)).toBeGreaterThan(oldArea*1.5);
    expect(v[0].y).toBe(v[1].y);
    expect(v[2].y).toBe(v[3].y);
    expect(v[1].x-v[0].x).toBeCloseTo(2*c.halfWidth*.70);
  });
  it("uses modest wall taper and deterministic floor boundaries",()=>{
    expect(cabinHalfWidthAtY(v[0].y,c)).toBeCloseTo(c.halfWidth*.70);
    expect(cabinHalfWidthAtY(v[2].y,c)).toBe(c.halfWidth);
    expect(cabinHalfWidthAtY(c.centerY,c)).toBeGreaterThan(c.halfWidth*.70);
    expect(cabinHalfWidthAtY(v[0].y-200,c)).toBeCloseTo(c.halfWidth*.70);
  });
  it("aligns the four real window gaps with visible window midpoints",()=>{
    for(let i=0;i<4;i++){
      const a=v[i]!,b=v[(i+1)%4]!;
      const length=Math.hypot(a.x-b.x,a.y-b.y);
      const [lo,hi]=windowGapFractions(length,i,c.windowOpeningWidth);
      expect((lo+hi)/2).toBeCloseTo(windowEdgeRatio(i));
      expect((hi-lo)*length).toBeCloseTo(116);
      expect(lo).toBeGreaterThan(0);
      expect(hi).toBeLessThan(1);
    }
  });
});
