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

- MR6.
- Kuda.
- KN-44.
- KRM-262.
- BRM.
- Drakon.
- typed weapon-definition registry.
- weapon-specific RPM, ammo, reload, damage, falloff and spread.
- shotgun 4-pellet hitscan.
- two-slot inventory.
- slot 1 starts with MR6.
- slot 2 starts empty.
- acquisition fills empty slot before replacing active slot.
- acquisition equips the new weapon.
- no duplicate owned weapons.
- 1/2 switching.
- mouse-wheel switching.
- switching cancels reload without refilling.
- HUD inventory slot state.

KRM reload remains a single full-mag timer in the MVP; per-shell reload can be added later without changing inventory ownership/state boundaries.

## Phase 6 — Economy/interactions

Status: **next**

- MR6 wall buy.
- Kuda wall buy.
- owned-wall-weapon ammo refills.
- Mystery Box.
- interaction prompts.
- insufficient-points feedback.
- use Phase 5 inventory acquisition API.

## Phase 7 — UI/audio/persistence

- complete HUD.
- menus.
- SFX.
- local high score/highest round/settings.

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
