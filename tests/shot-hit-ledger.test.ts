import { describe, expect, it } from "vitest";
import { ShotHitLedger } from "../src/combat/ShotHitLedger";

describe("shotgun scoring ledger", () => {
  it("groups multiple pellets per zombie and prioritizes lethal result", () => {
    const ledger = new ShotHitLedger<string>();
    ledger.record("zombieA", 80, false);
    ledger.record("zombieA", 80, false);
    ledger.record("zombieA", 80, true);
    ledger.record("zombieB", 40, false);
    expect([...ledger.entries()]).toEqual([
      ["zombieA", { damage: 240, killed: true }],
      ["zombieB", { damage: 40, killed: false }],
    ]);
  });
});
