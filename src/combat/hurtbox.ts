/**
 * Geometry for the restored original 32x32 placeholder sprites.
 * Player/Zombie world x/y is the center of the rotated top-down sprite.
 */
export interface XY { readonly x: number; readonly y: number }
export interface Hurtbox {
  readonly centerX: number; readonly centerY: number;
  readonly radiusX: number; readonly radiusY: number;
}
export type ActorKind = "player" | "zombie";
export const ACTOR_HITBOXES = {
  player: { footRadius: 11, upperOffsetY: 0, upperRadiusX: 16, upperRadiusY: 16 },
  zombie: { footRadius: 11, upperOffsetY: 0, upperRadiusX: 16, upperRadiusY: 16 },
} as const;

export function footBodyOffsets(
  sourceWidth:number, sourceOriginY:number,
  displayScale:number, worldRadius:number,
):{x:number;y:number;radius:number}{
  if(!(displayScale>0)||!(worldRadius>0))throw new RangeError("Invalid collider dimensions");
  const radius=worldRadius/displayScale;
  if(!(sourceWidth>radius*2)||!(sourceOriginY>=radius))
    throw new RangeError("Collider exceeds source texture");
  return {radius,x:sourceWidth/2-radius,y:sourceOriginY-radius};
}
export function actorHurtbox(kind:ActorKind,center:XY):Hurtbox{
  const c=ACTOR_HITBOXES[kind];
  return {
    centerX:center.x,centerY:center.y+c.upperOffsetY,
    radiusX:c.upperRadiusX,radiusY:c.upperRadiusY,
  };
}
export function hurtboxAimPoint(box:Hurtbox):XY{
  return {x:box.centerX,y:box.centerY};
}
export interface RayHurtboxHit{readonly distance:number;readonly point:XY}
export function rayHurtboxIntersection(
  origin:XY,direction:XY,maxDistance:number,box:Hurtbox,
):RayHurtboxHit|null{
  if(!(maxDistance>0)||!(box.radiusX>0)||!(box.radiusY>0))return null;
  const length=Math.hypot(direction.x,direction.y);
  if(!(length>0))return null;
  const dx=direction.x/length,dy=direction.y/length;
  const ox=(origin.x-box.centerX)/box.radiusX;
  const oy=(origin.y-box.centerY)/box.radiusY;
  const rx=dx/box.radiusX,ry=dy/box.radiusY;
  const a=rx*rx+ry*ry,b=2*(ox*rx+oy*ry),c=ox*ox+oy*oy-1;
  const disc=b*b-4*a*c;
  if(disc<0)return null;
  const root=Math.sqrt(disc);
  const entry=(-b-root)/(2*a),exit=(-b+root)/(2*a);
  const distance=entry<0&&exit>=0?0:entry;
  if(distance<0||distance>maxDistance)return null;
  return {distance,point:{x:origin.x+dx*distance,y:origin.y+dy*distance}};
}
