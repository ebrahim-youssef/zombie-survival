# 04 — BO3 Reference and Balancing

## Policy

Use two layers:

1. **Reference values** from classic/BO3 Zombies where known.
2. **2D adaptations** where the original FPS values do not map cleanly to this game.

Never label an adaptation as an exact BO3 engine value.

## Zombie HP

Use:

```ts
if (round <= 9) {
  health = 100 * round + 50;
} else {
  health = floor(950 * 1.1 ** (round - 9));
}
```

Examples:

| Round | HP |
|---:|---:|
| 1 | 150 |
| 2 | 250 |
| 5 | 550 |
| 9 | 950 |
| 10 | 1045 |
| 20 | 2710 |
| 30 | ~7030 |

## Solo zombie count

```text
R1–R9: 6, 8, 13, 18, 24, 27, 28, 28, 29
R10+: 24 + floor(0.5 * 0.18 * round²)
```

## Scoring

| Event | Points |
|---|---:|
| Non-lethal hit | 10 |
| Lethal body shot | 60 |
| Lethal melee | 130 |

Headshots are deferred.

## Weapon set

### MR6
- semi-auto pistol;
- 8-round magazine;
- starting weapon.

### Kuda
- SMG;
- automatic;
- wall buy + Mystery Box;
- wall price 1250.

### KN-44
- assault rifle;
- automatic;
- medium-range profile.

### KRM-262
- pump shotgun;
- multiple pellet rays;
- strong short-range damage.

### BRM
- LMG;
- high magazine capacity;
- long reload.

### Drakon
- semi-auto sniper;
- high damage;
- narrow spread;
- no piercing in MVP.

## 2D adaptation rule

Source-game metres and FPS aiming behavior should not be copied literally.

Adjust:

- falloff ranges;
- spread;
- movement pressure;
- spawn intervals;
- simultaneous active-zombie cap

to fit the top-down room while retaining weapon identity.

## Research references

- Call of Duty Wiki — Zombies, points, Mystery Box and weapon pages.
- Jack Hanke — *The Math of COD Zombies*.

Exact citations can be expanded later if this repository becomes public-facing documentation.
