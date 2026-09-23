# 06 — Controls, UI and Mobile

## Desktop

| Action | Control |
|---|---|
| Move | WASD / Arrows |
| Aim | Mouse |
| Fire | Left click |
| Melee | Right click |
| Reload | R |
| Interact | E |
| Slot 1/2 | 1 / 2 |
| Cycle | Mouse wheel |
| Pause | Esc |

Disable browser context menu on the game canvas.

## HUD

Top-left:
- round.

Bottom-left:
- HP bar + number;
- points;
- floating point gain.

Bottom-right:
- weapon;
- magazine/reserve.

Bottom-center:
- two inventory slots;
- active-slot highlight.

## Interaction prompts

Only show inside interaction range.

Examples:

```text
[E] Mystery Box — 950
[E] Buy Kuda — 1250
[E] Refill Kuda Ammo — 625
[E] Take Drakon
```

## Menus

Main:
- Play.
- Controls.
- Settings.

Pause:
- Resume.
- Controls.
- Settings.
- Restart.
- Main Menu.

Settings:
- Master Volume.
- Aim/mouse sensitivity where meaningful.
- Damage Numbers toggle.

## Mobile

Use the same `InputFrame` abstraction.

Recommended layout:
- left virtual stick: movement;
- right drag/aim stick: aim;
- fire;
- melee;
- reload;
- interact;
- weapon swap;
- pause.

Respect safe areas and prevent browser scrolling/zoom gestures during gameplay where possible.

## Responsive gameplay (Phase 9B)

Phaser uses `Scale.RESIZE` to fill the actual safe-area-adjusted browser
viewport rather than preserving a 1280×720 FIT rectangle. The world camera
has its own mobile zoom and follow bounds; the HUD, menus and virtual
controls are screen-space and relayout on resize/orientation changes.

On touch-first devices, the selected mobile control mode is persisted:

| Mode | Aim | Fire |
|---|---|---|
| Stick auto-fire + assist (default) | Right stick, snaps to closest visible zombie inside a narrow forward cone | Automatically while stick is deflected; semi-autos repeat respecting RPM |
| Auto-aim + button | Nearest visible zombie within range | FIRE button |
| Manual | Right stick | FIRE button |

Auto-aim never targets dead zombies or targets blocked by the arena wall
segments. Releasing the right stick in default mode stops auto-firing.
Left-stick movement is always independent of aim.

Portrait is supported without 16:9 letterboxing; landscape is recommended
because it affords more room for the action buttons.

## Game-over interactions

Game-over UI lives in an independent topmost Scene while gameplay is
paused, so the mobile joystick and in-game controls cannot steal taps.
Restart and Main Menu are large interactive buttons. Enter/Space restart
and Esc returns to the menu on desktop.

## UI / camera zoom invariant

All gameplay, UI, and touch controls currently render through the same
Phaser camera. Until a separate UI camera is implemented, keep
`GameScene.cameras.main.zoom === 1`. Otherwise, `setScrollFactor(0)`
still inherits camera **zoom**, causing the displayed joystick centers and
the actual DOM screen-space hit targets to diverge (or clip off-screen).
`Scale.RESIZE` keeps the canvas viewport-filling; the 48×64 full-body
sprites are larger/readable at one game pixel per CSS pixel.
