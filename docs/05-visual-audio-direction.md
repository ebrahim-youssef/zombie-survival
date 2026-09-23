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

## Implemented angled full-body procedural sprite pass

- Characters use distinct front, three-quarter, side and back sprites.
- Full-body 48×64 silhouettes with oversized helmets/heads, jacket/torso,
  independent moving legs and boots, animated arms and equipment.
- Per-facing player idle/walk/fire/melee/reload/hurt/death visual states.
- Per-facing zombie idle/walk/attack/hurt/death visual states.
- Circle colliders remain centered at the feet independent of visual height.
- No whole-body sprite rotation: the art changes with the facing instead.
- The procedural frames are original gameplay art. Final artist-authored
  production sprite sheets are still a separate art acceptance task.
