import { ACTOR_HITBOXES } from "../combat/hurtbox";

export const ZOMBIE_CONFIG = {
  // Actual Arcade collision radius is shared with the debug overlay
  // and sourced from ACTOR_HITBOXES.zombie (not the upper-body hurtbox).
  colliderRadius: ACTOR_HITBOXES.zombie.footRadius,
  attackRange: 38,
  attackDamage: 50,
  attackCooldownMs: 1000,
  entryThreshold: 12,
  corpseHoldMs: 1800,
  corpseFadeMs: 550,
} as const;
