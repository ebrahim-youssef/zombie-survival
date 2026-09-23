# 05 — Visual and Audio Direction

## Visual target

- Pixel art.
- 16–32-bit feel.
- Prefer ~32×32 logical character sprites.
- Pseudo-isometric environment.
- Dark/gritty COD Zombies atmosphere.
- Readable arcade influence inspired by games such as Metal Slug.

## Palette

Environment:
- charcoal;
- gunmetal;
- dirty concrete;
- muted olive;
- muted brown.

Accents:
- warm amber/gold for interactions;
- restrained red for damage;
- off-white for HUD text.

## Player

- Fully armored from head to toe.
- Strong silhouette.
- Weapon readable from body.
- 8 visual facing directions.

Animation set:
- idle;
- walk;
- shoot;
- reload;
- melee.

## Zombie

One standard zombie for MVP.

Animation set:
- walk;
- attack;
- hit;
- death.

Death:
- death animation;
- corpse stays ~2–3 s;
- fade/remove.

## Weapons

Distinct sprites for:

- MR6.
- Kuda.
- KN-44.
- KRM-262.
- BRM.
- Drakon.

Silhouette matters more than exact firearm detail.

## Crosshair

- Custom.
- High contrast.
- Small.
- Readable on dark/light floor.
- Native cursor hidden during gameplay.

## Effects

Required:
- muzzle flash;
- short tracer;
- zombie hit reaction;
- subtle wall impact effect;
- subtle player damage overlay/camera shake.

## Audio

MVP uses SFX only; no music required.

Core SFX:
- gunshot families;
- reload;
- empty magazine;
- melee;
- zombie hit/death/attack;
- player hurt;
- purchase success/fail;
- Mystery Box;
- UI confirm/back.

Use original/generated/permissively licensed audio only.

## Superseded first angled sprite prototype (48×64)

- Characters use distinct front, three-quarter, side and back sprites.
- Full-body 48×64 silhouettes with oversized helmets/heads, jacket/torso,
  independent moving legs and boots, animated arms and equipment.
- Per-facing player idle/walk/fire/melee/reload/hurt/death visual states.
- Per-facing zombie idle/walk/attack/hurt/death visual states.
- Circle colliders remain centered at the feet independent of visual height.
- No whole-body sprite rotation: the art changes with the facing instead.
- The procedural frames are original gameplay art. Final artist-authored
  production sprite sheets are still a separate art acceptance task.

## Approved visual reference — original chunky arcade cabin

The user-approved screenshot is the visual direction for this game.
Match its priorities: warm golden lantern-lit wooden cabin; deep-blue
night outside; readable broken window entrances; compact full-body
cartoon survivor and zombies; prominent golden mystery chest; weapon
wall-buy signs; clutter, shelf, rug and tasteful pixel debris; high-
contrast pixel portrait/hearts/score/round/ammo HUD.

Implementation:
- All character source frames are **exactly 32 × 32** and display at
  3× nearest-neighbour scale; no 48 × 64 source sprites remain.
- Original eight-facing survivor (helmet, tan face, dark rifle, olive
  outfit) and cartoon green-faced zombies (large head, white torn
  shirt, blue trousers, glowing eyes and dark-red mouths).
- Original 32px frame families for idle/walk/combat/hurt/death.
- Feet-aligned circular hitboxes remain independent of tall sprites.
- Four original procedural asset palettes/props are generated once
  per game session; no copyrighted commercial sprite sheets.
- Warm plank floor with distinct seams/nails; timber wall faces,
  illustrated boarded broken windows and moonlit silhouettes.
- Props: barrel, lantern, rug, shelf/books/potted plant, wooden
  crates, hand-marked poster and glowing mystery chest.
- Screen-space HUD adapts for small touch viewports so joysticks
  never share the lower corners with ammo/HP panels.

The visual reference contains more hand-authored texture detail and
lighting than this first original implementation. Compare in a
real browser and iterate on production art only after accepting the
playable composition; do not claim pixel-identical replication.
