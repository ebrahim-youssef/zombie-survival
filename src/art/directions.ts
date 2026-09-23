import type {FacingDirection} from "../types/game";
export const FACINGS:readonly FacingDirection[]=[
  "e","se","s","sw","w","nw","n","ne",
];
export function facingFromVector(dx:number,dy:number):FacingDirection{
  if(Math.abs(dx)<.0001&&Math.abs(dy)<.0001)return "s";
  const angle=(Math.atan2(dy,dx)+Math.PI*2)%(Math.PI*2);
  const index=Math.round(angle/(Math.PI/4))%8;
  return FACINGS[index]!;
}
export function facingVector(dir:FacingDirection):readonly [number,number]{
  switch(dir){
    case"n":return [0,-1];case"ne":return [1,-1];
    case"e":return [1,0];case"se":return [1,1];
    case"s":return [0,1];case"sw":return [-1,1];
    case"w":return [-1,0];case"nw":return [-1,-1];
  }
}
