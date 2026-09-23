# 08 — Implementation Plan

## Phase 0 — Scaffold

Status: **complete**

## Phase 1 — Arena + player

Status: **complete**

## Phase 2 — Combat foundation

Status: **complete**

## Phase 3 — Zombie vertical slice

Status: **complete**

## Phase 4 — Waves

Status: **complete**

## Phase 5 — Weapons + inventory

Status: **complete**

## Phase 6 — Economy/interactions

Status: **complete**

- MR6 bottom-wall interaction.
- MR6 full acquisition price: 500.
- MR6 owned-ammo refill: 250.
- Kuda top-wall interaction.
- Kuda full acquisition price: 1250.
- Kuda owned-ammo refill: 625.
- wall buys use the shared inventory acquisition API.
- owned ammo cannot be repurchased while already full.
- Mystery Box cost: 950.
- pool: Kuda, KN-44, KRM-262, BRM, Drakon.
- currently owned weapons excluded.
- equal random selection among remaining candidates.
- ~3.5-second cycling/reveal.
- ~10-second pickup timeout.
- E interaction for purchase/take.
- nearest interaction wins when ranges overlap.
- insufficient-points and result feedback.
- contextual HUD interaction prompt.

## Phase 7 — UI/audio/persistence

Status: **next**

- complete HUD pass.
- real pause menu.
- settings.
- SFX.
- local high score/highest round/settings persistence.

## Phase 8 — Mobile input

- virtual movement.
- aim.
- fire/melee/reload/interact/swap.
- safe-area responsive UI.

## Phase 9 — Polish/hardening

- original pixel-art assets.
- animations.
- feedback.
- performance.
- full acceptance pass.

## Quality gate per phase

1. Typecheck.
2. Production build.
3. No new console errors.
4. Manual phase acceptance pass.
5. Keep debug tooling working once introduced.
