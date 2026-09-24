# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 9 — hardening pass in progress**

- Vite 8, strict TypeScript 7, Phaser 3.90 and Arcade Physics.
- Zombie waves, six weapons, two-slot inventory, wall buys and Mystery Box.
- Keyboard/mouse and mobile touch input through one `InputFrame`.
- Pausing freezes gameplay timers using a scene-local clock.
- Shotgun pellet scoring is aggregated per zombie/shot.
- Health bar and enhanced damage feedback.
- Improved procedural player/zombie placeholder sprites.
- Development-only debug overlay and testing shortcuts.
- Automated tests for weapon/inventory/economy/waves/clock/persistence/scoring.

## Setup

Node 22.16.0 (`.node-version`):

```sh
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

## Dev diagnostics — QA Stage 1

For **local development**, start the game normally with `npm run dev`.
For **deployed Cloudflare Pages builds**, append `?debug=1` to the
deployed game URL, then start a run. This opt-in works without configuring
Cloudflare build environment variables. Without `?debug=1`, regular
production page visits have **no debug shortcuts**.

The shortcuts use the physical **number row 3–0 with no modifiers**:

| Key | Action |
| --- | --- |
| 3 | Toggle wall/range/spawn and hitscan-ray overlay |
| 4 | Toggle actual player/zombie **Arcade Physics hitboxes** |
| 5 | Add 950 points |
| 6 | Refill equipped weapon |
| 7 | Kill all currently alive zombies |
| 8 | Skip to next round |
| 9 | Toggle god mode |
| 0 | Toggle the shortcut help panel |

1 and 2 continue to switch weapons normally; F keys and Shift combinations
have no debugging behavior. The debug badge confirms that QA mode is enabled.
Colors for **4**: green = actual player collider, pink = actual zombie
colliders, cyan = separate zombie raycast circles, yellow = wall ray segments.
The differences between actual collision shapes and sprite art are
intentional diagnostics for **QA Stage 2**, which will repair alignment.
Debug sessions do not save high-score or highest-round records.

## Cloudflare Pages

Build command: `npm run build`  
Output directory: `dist`

## Verification scope

GitHub CI now executes:
- unit/regression tests;
- strict TypeScript validation;
- production Vite build;
- Chromium browser smoke tests for desktop restart flow;
- mobile landscape/portrait viewport filling;
- right-stick auto-fire;
- simultaneous movement + aiming touch input;
- touch release stopping fire.

These browser tests materially cover the regressions found during device QA,
but they do **not** replace testing on physical Android/iOS hardware.
Final artist-authored sprites/audio and physical-device acceptance remain
outstanding; see `docs/08-implementation-plan.md`.


## Visual rollback — original placeholder baseline

The experimental directional character art, cabin props, Zelda-like palette,
layer system and generated HUD sprites have been removed.

The active visual baseline is intentionally the **first pseudo-isometric
prototype**:
- original grey diamond arena and diagonal grid;
- four simple wall gaps/windows;
- original rotating 32×32 player placeholder;
- original rotating 32×32 zombie placeholder;
- simple rectangular Mystery Box and wall-buy markers;
- text/rectangle HUD.

Gameplay systems added later remain: mobile controls, debug keys, restart,
weapons/economy/waves, pause-safe timers, Cloudflare QA mode and the
current shooting/melee logic. Placeholder combat hitboxes were resized
back to the compact 32×32 actors so the later hitbox fix remains valid.

Reference visual commit: `8b08f5570ed5` (before directional sprite work).
Production-quality art is deferred until a new direction is approved.
