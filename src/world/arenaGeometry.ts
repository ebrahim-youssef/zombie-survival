/** Original, three-quarter cabin room dimensions and collision geometry. */
export interface Point2 { readonly x:number; readonly y:number }
export interface ArenaDimensions {
  readonly centerX:number;
  readonly centerY:number;
  readonly halfWidth:number;
  readonly halfHeight:number;
  readonly rearWidthRatio:number;
  readonly windowOpeningWidth:number;
}

export const DEFAULT_ARENA_DIMENSIONS: ArenaDimensions={
  centerX:900,centerY:550,
  // Roughly 51% more walkable area while keeping the rear wall visible.
  halfWidth:820,halfHeight:390,
  // A modest angled top-down room, not an extreme perspective diamond.
  rearWidthRatio:.70,
  // Physics opening matches the visibly illustrated ~114px window.
  windowOpeningWidth:116,
};

/** Clockwise TL, TR, BR, BL. Physics and art must share these vertices. */
export function cabinVertices(
  config:ArenaDimensions=DEFAULT_ARENA_DIMENSIONS,
):readonly [Point2,Point2,Point2,Point2]{
  const {centerX:x,centerY:y,halfWidth:w,halfHeight:h,rearWidthRatio:r}=config;
  if(w<=0||h<=0||r<=0||r>1)throw new RangeError("Invalid cabin dimensions");
  return [
    {x:x-w*r,y:y-h*.76},
    {x:x+w*r,y:y-h*.76},
    {x:x+w,y:y+h*.96},
    {x:x-w,y:y+h*.96},
  ];
}
export function cabinHalfWidthAtY(
  worldY:number,
  config:ArenaDimensions=DEFAULT_ARENA_DIMENSIONS,
):number{
  const v=cabinVertices(config);
  const t=Math.min(1,Math.max(0,
    (worldY-v[0].y)/(v[2].y-v[0].y),
  ));
  return config.halfWidth*(config.rearWidthRatio+(1-config.rearWidthRatio)*t);
}
/** Window center interpolation shared by wall visuals, physics and spawner. */
export function windowEdgeRatio(edgeIndex:number):number{
  return edgeIndex===1?.38:edgeIndex===3?.62:.5;
}
export function windowGapFractions(
  length:number,edgeIndex:number,openingWidth:number,
):readonly [number,number]{
  if(length<=openingWidth||openingWidth<=0){
    throw new RangeError("Opening must be shorter than its wall");
  }
  const center=windowEdgeRatio(edgeIndex);
  const half=openingWidth/(2*length);
  if(center-half<=0||center+half>=1){
    throw new RangeError("Opening intersects room corner");
  }
  return [center-half,center+half];
}
export function floorPolygonArea(
  points:readonly Point2[],
):number{
  if(points.length<3)return 0;
  let doubled=0;
  for(let i=0;i<points.length;i++){
    const a=points[i]!,b=points[(i+1)%points.length]!;
    doubled+=a.x*b.y-a.y*b.x;
  }
  return Math.abs(doubled)/2;
}
