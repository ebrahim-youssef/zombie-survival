/**
 * The debug number row is reserved for QA. These deliberately use
 * KeyboardEvent.code so keyboard layouts do not affect physical 3..0.
 */
export const DEBUG_SHORTCUTS = {
  Digit3: "overlay",
  Digit4: "hitboxes",
  Digit5: "points",
  Digit6: "ammo",
  Digit7: "clear",
  Digit8: "round",
  Digit9: "god",
  Digit0: "help",
} as const;
export type DebugAction = typeof DEBUG_SHORTCUTS[keyof typeof DEBUG_SHORTCUTS];

export function resolveDebugShortcut(
  event: Pick<KeyboardEvent, "code" | "repeat" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey">,
): DebugAction | null {
  if (event.repeat || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return null;
  }
  if (!Object.prototype.hasOwnProperty.call(DEBUG_SHORTCUTS, event.code)) return null;
  return DEBUG_SHORTCUTS[event.code as keyof typeof DEBUG_SHORTCUTS];
}
