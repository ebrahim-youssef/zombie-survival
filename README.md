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

## Dev diagnostics

While playing via `npm run dev`: F3 toggles collision/range/ray overlay,
F6 grants 950 points, F7 replenishes the equipped weapon, F8 clears zombies,
F9 skips to the next round, F10 toggles invulnerability. Not available in the
production build.

## Cloudflare Pages

Build command: `npm run build`  
Output directory: `dist`

## Verification scope

GitHub CI executes unit/regression tests, strict TS and a production Vite
build. Live gameplay on actual Android/iOS devices and production-grade
sprite/animation/audio assets are still outstanding; see
`docs/08-implementation-plan.md`.
