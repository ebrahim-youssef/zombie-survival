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

## Device QA fixes / angled sprite preview

- Full-viewport RESIZE and responsive camera/HUD/menu/touch layouts.
- Game-over scene owns working Restart / Main Menu buttons and Enter / Space.
- Mobile stick auto-fire + visible zombie aim assist by default; manual and
  auto-aim + fire button modes available in Settings.
- Original procedural full-body angled 32×32 chunky native character frames and action
  animations for eight facings replace the old rotating top-down blocks.
- No copied Zelda or Call of Duty artwork is used.
- Physical mobile device/visual acceptance remains necessary.

## Arcade cabin art pass

The game now produces original 32 × 32 low-resolution player/zombie frames
at a crisp 3× world display scale, preserving the feet-based collision
layout and all eight movement/aim facings. This is an original visual
interpretation of the approved arcade-zombie screenshot, not copied
commercial sprite art.

The arena now uses a four-window projected trapezoid room with warm plank flooring,
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

## Character art refinement

The player and zombie have a new **soft-edged original arcade character pass**:
64×64 raster frames drawn on a 32×32 logical design grid and displayed at
1.5×. Their effective footprint stays **96×96 world pixels** so camera framing,
feet-based hitboxes and weapon reach are unchanged. Rounded head contours,
nonrectangular limbs, layered facial shading and more expressive action frames
replace the former large block shapes. The cabin, props and HUD stay as-is;
only the HUD portrait is scaled to fit its existing frame. On every CI run,
`cabin-art-preview` now contains both a gameplay screenshot and a character
close-up sheet for visual review.

## Stage 2 — Visual hitbox alignment

Movement uses small centered circular foot colliders (world radius 15), while
guns and melee use an upper-body ellipse aligned with the character's
64px raster displayed at 1.5×. The mobile auto-aim and barrel origin
now agree with the same combat geometry.

In a QA session press `4`: green/pink = movement circles at the feet,
lime/cyan = larger body hurtboxes covering the visible head and torso.
Press `3` to also reveal recent real raycasts. See the Stage 2 tests and
`docs/08-implementation-plan.md` for numerical dimensions.
