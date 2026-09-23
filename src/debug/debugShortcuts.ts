/**
 * Shift changes KeyboardEvent.key (e.g. Shift+1 => "!"), but code keeps
 * the physical key identity, regardless of keyboard layout.
 */
export const DEBUG_SHORTCUTS = {
  Digit1: "overlay",
  Digit2: "points",
  Digit3: "ammo",
  Digit4: "clear",
  Digit5: "round",
  Digit6: "god",
  Digit7: "hitboxes",
} as const;
export type DebugAction = typeof DEBUG_SHORTCUTS[keyof typeof DEBUG_SHORTCUTS];

export function resolveDebugShortcut(
  event: Pick<KeyboardEvent, "shiftKey" | "code" | "repeat">,
): DebugAction | null {
  if (!event.shiftKey || event.repeat) return null;
  if (!Object.prototype.hasOwnProperty.call(DEBUG_SHORTCUTS, event.code)) {
    return null;
  }
  return DEBUG_SHORTCUTS[event.code as keyof typeof DEBUG_SHORTCUTS];
}
