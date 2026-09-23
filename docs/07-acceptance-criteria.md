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
