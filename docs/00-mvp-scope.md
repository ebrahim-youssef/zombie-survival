# 00 — MVP Scope

## Goal

Build a browser-first, client-only, pseudo-isometric 2D zombie survival shooter that proves the full survival loop before expanding the map and systems.

## Stack

- Vite
- TypeScript (strict)
- Phaser 3.90
- Arcade Physics
- 1280×720 internal resolution
- Responsive scaling
- Desktop keyboard/mouse + mobile touch later
- Target 60 FPS

## Frozen MVP decisions

### Arena

- One pseudo-isometric room.
- Four walls.
- One centered zombie window per wall.
- Zombies spawn outside windows, cross them, then chase the player.
- Mystery Box in the room.
- MR6 wall buy on the bottom wall.
- Kuda wall buy on the top wall.
- Player cannot exit through zombie windows.

### Player

- 8-direction movement.
- Straight movement = base speed.
- Diagonal movement magnitude = base speed × 1.25.
- Movement and aim are independent.
- Body/weapon visually face one of 8 aim directions.
- Player can strafe and walk backward.

### Combat

- Left click: fire.
- Right click: melee.
- Hitscan/raycast shooting.
- Muzzle flash + short-lived tracer visual.
- First wall/zombie hit stops the ray.
- No penetration in MVP.
- Weapon-specific spread.
- Shotgun uses multiple pellet rays.

### Inventory

- Exactly two weapon slots.
- Start with MR6 in slot 1; slot 2 empty.
- New weapon fills an empty slot first.
- If inventory is full, new weapon replaces the equipped slot.

### Economy

- Start: 500 points.
- Mystery Box: 950.
- Non-lethal hit: +10.
- Normal gun kill: +60.
- Melee kill: +130.
- No negative score penalties beyond purchases.

### Weapons

Starting weapon:
- MR6.

Mystery Box pool:
- Kuda.
- KN-44.
- KRM-262.
- BRM.
- Drakon.

Owned weapons are excluded from Mystery Box candidates.

## Explicitly deferred

- Barricades/repair.
- Multiple rooms.
- Doors/purchasable areas.
- Perks.
- Pack-a-Punch.
- Power.
- Grenades.
- Power-up drops.
- Special zombies/bosses.
- Headshots.
- Penetration.
- Advanced pathfinding.
- Mystery Box relocation.
- Multiplayer.
