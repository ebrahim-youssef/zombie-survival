# 01 — Game Design Specification

## Core loop

```text
Start Round
  ↓
Spawn zombies through four windows
  ↓
Player moves, aims, shoots and melees
  ↓
Hits/kills award points
  ↓
Spend points on wall buys / Mystery Box
  ↓
Kill all zombies
  ↓
5-second intermission
  ↓
Next Round
```

The run ends when player health reaches zero.

## Movement

- WASD and arrows.
- Instant velocity response.
- Straight speed uses `baseMoveSpeed`.
- Diagonal movement magnitude is intentionally `baseMoveSpeed * 1.25`.
- Aim direction never follows movement automatically.

## Shooting

Each shot:

1. Validate weapon/fire state.
2. Consume ammo.
3. Trigger muzzle flash/SFX.
4. Calculate aim direction.
5. Apply weapon spread.
6. Cast one or more hitscan rays.
7. Resolve the nearest wall or zombie hit.
8. Apply damage.
9. Draw a tracer for ~40–70 ms.

Missed rays extend beyond the visible camera until their configured maximum distance.

## Reload

- R reloads.
- Empty magazine auto-starts reload if reserve exists.
- No firing during reload.
- Weapon switching cancels reload.
- Cancelled reload does not refill ammo.

## Inventory

```text
Slot 1: MR6
Slot 2: Empty
```

Acquisition rule:

```text
empty slot exists → fill it
otherwise         → replace active slot
```

## Melee

- Right click.
- Small forward cone.
- Approximate range: one player sprite width.
- Closest zombie only.
- Base knife damage: 150.
- Visual slash/lunge only; no physical movement.
- Cooldown target: ~750–800 ms.

## Zombies

State flow:

```text
SpawnOutside → ApproachWindow → CrossWindow → ChasePlayer → Attack
```

After entering the room, zombies use direct steering toward the player. No A* in MVP.

## Waves

Classic BO3-era health progression:

```ts
round <= 9
  ? 100 * round + 50
  : floor(950 * 1.1 ** (round - 9))
```

Solo zombie counts:

```text
R1–R9: 6, 8, 13, 18, 24, 27, 28, 28, 29
R10+: 24 + floor(0.5 * 0.18 * round²)
```

Intermission: ~5 seconds.

## Player survivability

Prototype target:

```text
Max HP: 150
Zombie damage: 50
```

Health regenerates after a short no-damage delay.

## Mystery Box

- Cost: 950.
- E to interact.
- Animated cycling/reveal sequence.
- Pool: Kuda, KN-44, KRM-262, BRM, Drakon.
- Owned weapons excluded.
- Equal weight among remaining weapons.
- No Teddy Bear/relocation.

## Wall buys

MR6:
- Full price: 500.
- Refill: 250.

Kuda:
- Full price: 1250.
- Refill: 625.

If already owned, half-price purchase refills magazine + reserve.

## Death

Show:

- round reached;
- kills;
- points;
- Restart;
- Main Menu.
