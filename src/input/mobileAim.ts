export interface AimPoint {x:number;y:number;isDead?:boolean}
export interface AimVector {x:number;y:number}
export function nearestAimTarget<T extends AimPoint>(
  origin:AimVector,
  targets:readonly T[],
  direction:AimVector|null,
  maxDistance:number,
  halfConeDegrees:number,
  isVisible:(target:T)=>boolean=()=>true,
):T|null{
  let best:T|null=null;
  let nearestSquared=maxDistance*maxDistance;
  const len=direction?Math.hypot(direction.x,direction.y):0;
  const minDot=Math.cos(halfConeDegrees*Math.PI/180);
  for(const target of targets){
    if(target.isDead)continue;
    const dx=target.x-origin.x,dy=target.y-origin.y;
    const d2=dx*dx+dy*dy;
    if(d2>nearestSquared || d2<1 || !isVisible(target))continue;
    if(direction && len>0){
      const dot=(dx*direction.x+dy*direction.y)/(Math.sqrt(d2)*len);
      if(dot<minDot)continue;
    }
    nearestSquared=d2;
    best=target;
  }
  return best;
}
