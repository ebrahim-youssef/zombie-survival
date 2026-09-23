# 07 — MVP Acceptance Criteria

## Phase 1 — Arena + player

- [ ] Pseudo-isometric room renders.
- [ ] Four centered window entrances render.
- [ ] Player starts inside the room.
- [ ] WASD works.
- [ ] Arrow keys work.
- [ ] Eight movement directions work.
- [ ] Straight movement uses base speed.
- [ ] Diagonal movement magnitude is ~1.25× base speed.
- [ ] Movement does not change aim.
- [ ] Mouse aim works in world space.
- [ ] Player visual snaps to 8 aim directions.
- [ ] Player can strafe/backpedal.
- [ ] Player cannot leave the arena.
- [ ] Player cannot exit via zombie-only windows.
- [ ] Custom crosshair renders.
- [ ] Camera follow/bounds foundation works.

## Combat

- [ ] Hitscan shooting.
- [ ] MR6 semi-auto behavior.
- [ ] Automatic hold-fire.
- [ ] Wall/zombie nearest-hit resolution.
- [ ] Tracer + muzzle flash.
- [ ] Spread.
- [ ] Shotgun pellets.
- [ ] Ammo/reload.
- [ ] Reload cancellation.

## Inventory/economy

- [ ] Two slots.
- [ ] MR6 start.
- [ ] Empty slot filled before replacement.
- [ ] 1/2 and wheel switching.
- [ ] 500 starting points.
- [ ] +10 non-lethal hit.
- [ ] +60 normal kill.
- [ ] +130 melee kill.

## Zombies/waves

- [ ] Four-window spawning.
- [ ] Anti-streak window choice.
- [ ] Direct pursuit.
- [ ] Zombie collision/separation.
- [ ] Attack range/cooldown.
- [ ] BO3-style health/count progression.
- [ ] ~5-second intermission.

## Interactions

- [ ] MR6 wall buy.
- [ ] Kuda wall buy.
- [ ] Half-price refill for owned wall weapon.
- [ ] Mystery Box costs 950.
- [ ] Owned weapons excluded.
- [ ] Equal probability among remaining weapons.
- [ ] Reveal/pickup timeout.

## Player life cycle

- [ ] Zombie damage.
- [ ] Health regeneration.
- [ ] Damage feedback.
- [ ] Game over.
- [ ] Restart.

## Mobile/persistence/debug

- [ ] Touch movement/aim/fire/melee/reload/interact/switching.
- [ ] Highest round persists.
- [ ] High score persists.
- [ ] Settings persist.
- [ ] Debug colliders/rays/ranges/spawn points.
- [ ] Debug shortcuts.

## Performance

- [ ] Target 60 FPS on modest desktop hardware.
- [ ] No unbounded corpse/tracer/entity accumulation.

## Phase 9B device-acceptance regression checklist

Automated CI includes pure mobile targeting/layout tests, unit tests and
real Chromium smoke tests. The following regressions are browser-verified:
desktop restart, landscape/portrait viewport fill, touch-mode selection,
right-stick auto-fire, simultaneous move+aim/fire, release-to-stop-fire,
and touch Restart/Main Menu.

Manual checks below still require observation on physical hardware rather
than being inferred from headless Chromium.

### Desktop browsers
- [ ] Open the game, start and survive a few rounds.
- [ ] Restart using Enter, Space, and the button after losing.
- [ ] Main Menu button after losing works; no underlying gameplay click.
- [ ] Esc pause/resume retains the active wave and ammo countdown.
- [ ] Walking, shooting, melee and death use whole-body 8-way sprites;
      no overhead rotating block on turning.
- [ ] Visual feet align with zombie hitboxes and shadow.

### Android landscape and portrait
- [ ] Canvas occupies the usable visible viewport (no 16:9 letterbox).
- [ ] Browser toolbar hide/show and device rotation do not create blank bands.
- [ ] Canvas remains within safe areas/notch.
- [ ] Menus, HUD, joysticks and buttons remain reachable and do not overlap
      each other at actual device dimensions.
- [ ] Left stick movement + right stick aim and auto-fire work simultaneously.
- [ ] Right-stick release stops firing; ammo and rate limits remain correct.
- [ ] The assist respects the forward cone and does not aim through walls.
- [ ] Auto-aim + FIRE and manual mode work after changing Settings.
- [ ] Game-over restart and main-menu buttons respond to direct touch.

### iPhone Safari
- [ ] Reproduce all of the mobile checks above on Safari.
- [ ] Test Safari address-bar collapse/expand; verify no stale canvas sizing.
- [ ] Test home-indicator and notch safe-area padding.
- [ ] Verify background/foreground and focus loss release held virtual input.

### Performance/art
- [ ] Average gameplay is sufficiently smooth on a modest mobile device.
- [ ] No noticeable per-round buildup of zombie corpses/effects.
- [ ] Review the current 32×32 chunky procedural characters on real screens; replace
      with final artist-authored sprites before claiming final production art.

### Arcade visual regression / acceptance

Automated:
- [ ] `CharacterArt` exports 32 × 32 source frames at 3× display.
- [ ] Eight directional idle/walk and combat textures exist.
- [ ] Environment textures (lantern, barrel, shelf, rug, chest, wall
      signs, debris) register at scene start without browser errors.
- [ ] New HUD portrait and hearts register at scene start.
- [ ] Existing restart and mobile input smoke tests remain green.

Manual desktop and physical-device visual review:
- [ ] Readable whole-body survivor and green zombies at actual screen size.
- [ ] Broken windows still coincide with zombie spawn/entry points.
- [ ] Gun tracers, impact bursts and hitboxes still align after art change.
- [ ] Warm wooden arena dominates view, blue exterior remains distinct.
- [ ] Chest and buy markers are visually distinguishable and interactive.
- [ ] HUD panels leave room for all mobile controls; prompts remain visible.
- [ ] Underlying mechanics, wave scaling and wall-hit geometry unchanged.
