import { ECONOMY_CONFIG } from "../config/economy";

export type AttackKind = "gun" | "melee";

export class RunState {
  points: number = ECONOMY_CONFIG.startingPoints;
  kills: number = 0;

  private readonly pendingPointAwards: number[] = [];

  canAfford(cost: number): boolean {
    return cost >= 0 && this.points >= cost;
  }

  trySpend(cost: number): boolean {
    if (!Number.isFinite(cost) || cost < 0) return false;
    if (!this.canAfford(cost)) return false;

    this.points -= cost;
    return true;
  }

  awardZombieDamage(killed: boolean, attackKind: AttackKind): void {
    const amount = killed
      ? attackKind === "melee"
        ? ECONOMY_CONFIG.points.meleeKill
        : ECONOMY_CONFIG.points.normalKill
      : ECONOMY_CONFIG.points.nonLethalHit;

    this.points += amount;
    this.pendingPointAwards.push(amount);

    if (killed) this.kills += 1;
  }

  consumePointAwards(): number[] {
    if (this.pendingPointAwards.length === 0) return [];

    return this.pendingPointAwards.splice(
      0,
      this.pendingPointAwards.length,
    );
  }
}
