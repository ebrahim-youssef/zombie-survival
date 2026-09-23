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
