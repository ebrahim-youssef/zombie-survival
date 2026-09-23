import { ECONOMY_CONFIG } from "../config/economy";

export type AttackKind = "gun" | "melee";

export class RunState {
  points = ECONOMY_CONFIG.startingPoints;
  kills = 0;

  private readonly pendingPointAwards: number[] = [];

  awardZombieDamage(killed: boolean, attackKind: AttackKind): void {
    const amount = killed
      ? attackKind === "melee"
        ? ECONOMY_CONFIG.points.meleeKill
        : ECONOMY_CONFIG.points.normalKill
      : ECONOMY_CONFIG.points.nonLethalHit;

    this.points += amount;
    this.pendingPointAwards.push(amount);

    if (killed) {
      this.kills += 1;
    }
  }

  consumePointAwards(): number[] {
    if (this.pendingPointAwards.length === 0) return [];

    return this.pendingPointAwards.splice(
      0,
      this.pendingPointAwards.length,
    );
  }
}
