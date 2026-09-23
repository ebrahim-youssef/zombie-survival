# 02 — Technical Architecture

## Principles

- Keep the MVP simple.
- TypeScript strict mode.
- Data-driven tuning.
- No ECS.
- No React.
- No backend.
- No general-purpose global state library.
- Input source must be independent from gameplay logic.
- Pseudo-isometric presentation does not change Cartesian gameplay coordinates.

## Target structure

```text
src/
├── game/
├── scenes/
├── entities/
├── combat/
├── weapons/
├── zombies/
├── interactions/
├── input/
├── ui/
├── world/
├── audio/
├── config/
├── persistence/
├── debug/
├── types/
└── utils/
```

## Scene responsibilities

### BootScene
- Load/register assets.
- Read persisted settings.
- Enter menu.

### MenuScene
- Play.
- Controls.
- Settings.

### GameScene
- Own gameplay world lifetime.
- Arena.
- Player.
- Zombies.
- Combat.
- Waves.
- Interactions.

### UIScene
- HUD.
- Crosshair if moved to screen-space later.
- Prompts.
- Pause.
- Game over.

## Input boundary

Gameplay consumes a device-neutral frame:

```ts
interface InputFrame {
  move: Phaser.Math.Vector2;
  aimWorld: Phaser.Math.Vector2;
  fireHeld: boolean;
  firePressed: boolean;
  meleePressed: boolean;
  reloadPressed: boolean;
  interactPressed: boolean;
  slotPressed: 0 | 1 | 2;
  cycleWeapon: -1 | 0 | 1;
  pausePressed: boolean;
}
```

Desktop and touch adapters both produce this shape.

## Camera

Camera logic lives behind `CameraController`.

Phase 1 can already follow the player, while later phases can add:

- larger worlds;
- multiple rooms;
- room-specific bounds;
- room transitions.

## Persistence

Use localStorage only for:

- high score;
- highest round;
- settings.

Do not persist active runs.

## Performance rules

- Hitscan only when firing.
- Avoid per-frame allocations in hot paths where practical.
- Cap active zombies.
- Recycle/destroy temporary effects.
- Keep debug rendering off by default.
- Avoid dynamic lights/shaders in MVP.
