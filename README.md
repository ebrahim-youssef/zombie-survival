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

## Device QA fixes / angled sprite preview

- Full-viewport RESIZE and responsive camera/HUD/menu/touch layouts.
- Game-over scene owns working Restart / Main Menu buttons and Enter / Space.
- Mobile stick auto-fire + visible zombie aim assist by default; manual and
  auto-aim + fire button modes available in Settings.
- Original procedural full-body angled 48×64 character frames and action
  animations for eight facings replace the old rotating top-down blocks.
- No copied Zelda or Call of Duty artwork is used.
- Physical mobile device/visual acceptance remains necessary.

## Arcade cabin art pass

The game now produces original 32 × 32 low-resolution player/zombie frames
at a crisp 2× world display scale, preserving the feet-based collision
layout and all eight movement/aim facings. This is an original visual
interpretation of the approved arcade-zombie screenshot, not copied
commercial sprite art.

The arena's grey diamond grid has been redrawn as warm plank flooring,
timber cabin walls, four shattered windows, moonlit blue exterior,
bookshelves, lanterns, barrels, crates, carpet, and aged wall décor.
Wall purchases have stencilled gun plates; the Mystery Box is now a
glowing illustrated chest. The HUD has a portrait, pixel hearts, an
amber score, red-round presentation, and an illustrated ammo panel.

No image-generation service or runtime network dependency is needed:
original pixel textures are generated deterministically in
`src/art/CharacterArt.ts`, `EnvironmentArt.ts`, and `HudArt.ts`.
The provided screenshot is **a visual target**; the interactive map
still uses the agreed four-window arena geometry rather than being a
one-to-one recreation of the reference room.
