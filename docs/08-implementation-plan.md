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

## Phase 7 — UI/audio/persistence
Status: **complete**

## Phase 8 — Mobile input
Status: **implementation complete; physical-device acceptance pending**

## Phase 9 — Polish/hardening
Status: **in progress; initial hardening slice implemented**

Implemented in this slice:
- scene-local gameplay clock; pauses no longer advance survival/wave/reload timers;
- browser throttling delta capped to avoid huge time jumps;
- shared game audio context rather than duplicate per-combat context;
- shotgun hits aggregated per target per shot for correct scoring;
- weapon spread interpreted as full cone width;
- generated procedural player/zombie sprite details (placeholder improvement);
- clear HP bar and red damage flash;
- dev-only range diagnostic visualization (now Shift+1): wall segments, spawn points,
  interaction/melee ranges, zombie hit/attack radii and recent hitscan rays;
- Shift+2 +950 points, Shift+3 refill, Shift+4 kill all, Shift+5 next round,
  Shift+6 god mode, Shift+7 actual independent Arcade Physics hitboxes;
- optional explicit staging build flag `VITE_ENABLE_DEBUG_TOOLS=true` and
  query flag `?debug=1`, keeping public production shortcuts disabled;
- automated tests for waves, inventory, firing/reload, economy, persistence,
  gameplay clock and multi-pellet scoring; GitHub CI gates on the test suite.

Still required for full Phase 9 acceptance:
- original production-quality sprite sheets and 8-way character animations;
- audio replacement/polish and performance profiling on modest devices;
- hands-on browser testing across desktop and physical mobile hardware;
- full MVP acceptance pass in docs/07 and bug fixes discovered from it.
The build/test pipeline is not a substitute for live gameplay acceptance.

## Quality gate
1. npm test.
2. npm run typecheck.
3. npm run build.
4. Manual desktop/mobile acceptance.
5. No recurring console errors or leaked effects.

## Phase 9B — device QA and character presentation

Status: **browser-verified implementation complete; physical-device acceptance pending**

Implemented:
- game-over controls moved to a dedicated DOM overlay, isolated from the
  paused gameplay/touch layer;
- Restart / Main Menu buttons plus Enter/Space/Esc keyboard handling;
- full-viewport `Scale.RESIZE` replaces 1280×720 FIT letterboxing;
- responsive HUD, menus and virtual controls for landscape/portrait;
- mobile right-stick auto-fire with wall-aware forward-cone aim assist;
- optional auto-aim + FIRE and fully manual mobile modes persisted in settings;
- reliable DOM Pointer Events + pointer capture for simultaneous touch controls;
- right-stick release clears firing state;
- 32×32 native chunky player/zombie frames at 3× nearest-neighbour scale;
- eight directional visual facings without rotating a top-down block;
- player idle/walk/shoot/melee/reload/hurt presentation states;
- zombie walk/attack/hurt/death presentation states;
- feet-centered physics bodies independent of the taller visual sprite.

Automated browser verification now covers:
- desktop game-over restart;
- mobile landscape canvas filling the viewport;
- portrait canvas filling the viewport;
- mobile touch mode activation;
- right-stick firing ammunition consumption;
- simultaneous movement + aim/fire;
- fire stopping after touch release;
- mobile Restart and Main Menu game-over interactions.

Still pending:
- physical Android Chrome acceptance;
- physical iPhone Safari acceptance including address-bar/safe-area behavior;
- visual review/tuning of the generated character frames on real devices;
- artist-authored final sprite sheets if the procedural preview is not accepted;
- final performance profiling and complete MVP acceptance checklist.

## Phase 9C — reference-aligned arcade cabin visual refinement

- Source character sprites remain native 32 × 32 and are displayed at an
  integer 3× scale for readable silhouettes in the responsive viewport.
- The world collision map and all four corresponding window gaps now use a
  projected cutaway trapezoid: straight rear wall, angled side walls and
  a low foreground ledge. Zombie entry targets and wall-ray segments stay
  linked to the new geometry.
- Side windows sit closer to the rear wall, with matching ray openings.
- Chest moved near the back-right furniture; warm lantern pools are tighter
  and brighter. More crates and scattered papers improve cabin occupancy.
- Gunshot visual muzzle flashes originate at the visible character rifle,
  while hitscan logic remains feet-centred to preserve hit registration.
- Automated Chromium capture publishes the current gameplay render as
  `cabin-art-preview` in GitHub Actions on every successful CI run.

These are original editable runtime-generated textures, not PNG files
extracted from the reference. The approved image remains an art direction
target, not a claim of pixel-perfect duplication.

## Staged QA changes following device and art feedback

1. **Stage 1 — Debug accessibility (this commit):** no-modifier physical keys
   3–0; 3 toggles ranges, 4 real Arcade bodies; all other cheats are
   individually mapped and 0 displays help. Cloudflare/preview QA can be
   enabled with `?debug=1` without a special build variable. Real Chromium
   tests cover local and production Vite preview and confirm ordinary public
   visits do not automatically enable debugging.
2. **Stage 2 — Hitbox and aiming alignment (pending):** inspect the actual
   player/zombie physics circles versus the displayed 64px raster at 1.5×,
   and reconcile combat hitscan radius, projectile origin, touch targeting,
   melee and visible facing. Stage 1 overlays explicitly reveal the current
   difference; Stage 1 does not modify combat balancing.
3. **Stage 3 — Original Zelda-like angled cabin art direction (pending):**
   freeze an original color palette, sprite-proportion sheet, layers/
   occlusion rules (ground decals and rug strictly below all actors),
   perspective/world-projection conventions, and room expansion before
   editing the existing cabin rendering. No Nintendo game assets are reused.

## Stage 2 — Independent projected combat hitboxes

Stage 2 replaces the legacy `(zombie.x,zombie.y,radius11)` damage circle
with a separately configured, actor-aligned vertical body ellipse. Foot
collision remains deliberately small to prevent crowd/wall trapping.

- Player feet collision: **15px world radius** (10px native at 1.5×),
  correctly scaled Arcade offsets.
- Zombie feet collision: **15px world radius** (10px native at 1.5×),
  correctly scaled Arcade offsets.
- Player damage reference: ellipse center 35px above feet, radii 22×36.
- Zombie gun/melee hurtbox: ellipse center 35px above feet, radii 24×38.
- Desktop crosshair, shotgun pellets, hitscan and right-stick assist target
  the visible torso and head instead of the player's/zombie's foot origin.
- The gun ray and tracer start from the same on-screen barrel location.
- Mobile assist rejects dead/occluded targets; manual mode stays manual.
- Melee checks visible body edges rather than a single foot-center distance,
  while preserving its original cooldown and damage.
- Debug key 4 shows **foot circles** and separate **upper-body ellipses**.
- Unit tests cover geometry and targeting. Chromium QA uses the real
  MR6 firing/scoring path on a scripted stationary dummy.

The projected cutaway room, rug layering and Zelda-inspired palette
remain **Stage 3**. They are not changed by this collision/combat stage.

**Phaser 3.90 regression:** Arcade's circle radius and offsets use
source-texture pixels, while rendered sprite width/origin use world pixels.
The first Stage 2 build exposed a 42px body-center displacement via
Chromium. Corrected by deriving source radius/offsets from
`CHARACTER_W`, `CHARACTER_FEET_Y`, and `CHARACTER_SCALE`; browser
acceptance checks the actual Arcade Body.center against player feet.

## Stage 3 — Art contract and angled adventure-room rebuild

**3A — contract:** complete. `ArtManifest.ts` defines the material and
actor ramps, `worldLayers.ts` defines depth, and
`docs/11-art-direction-and-depth-rules.md` documents projection, pixel
rules and the invariant that rugs NEVER cover a standing character.

**3B — implementation:** widened the room to 820×390 half-dimensions
after screenshot review (~51% larger floor), and changed the
rear-to-front taper ratio 0.49→0.70, tied all four actual
wall collision gaps to an illustrated fixed-width 116px opening, and
preserved the single-room wave/economy gameplay. Background geometry,
wall faces and near cutaway ledge are now distinct Phaser display layers.

Inside actors use `actorDepth(feet.y)` and tall props use
`tallPropDepth(footY)`. The rug, paper and floor debris always use
`groundDecal` and lantern/chest ground glow always uses `groundLight`.
NPCs outside the windows render below the wall face and switch to
dynamic y-sorting once inside. Wall signage uses `wallDecal`.
Character colors reference the new canonical manifest. A modest
head-contour scale adjustment shifts the existing original characters
toward classic three-quarter adventure proportions.

QA: pure geometry/depth/color tests and Chromium screenshot test.
This is an original Zelda-*inspired* projection and palette, not a copy
of a copyrighted game. Manual visual approval of the redesigned cabin
and physical mobile testing remain pending.

**Viewport visual regression:** the original 990×470 proposal left the
back and side walls outside the 1280×720 gameplay screenshot. Final
820×390/0.70 geometry retains a larger arena but shows the back wall,
corner angles, windows and night exterior on desktop. A desktop follow
offset of 76px keeps the player lower in frame; compact touch stays
centered and zoom remains 1. Board stripe contrast was also reduced.
Chromium checks the wall/corners' actual screen positions on entry.
