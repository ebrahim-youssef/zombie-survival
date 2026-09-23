import { describe, expect, it } from "vitest";
import { DEBUG_SHORTCUTS, resolveDebugShortcut } from "../src/debug/debugShortcuts";

const key = (
  code: string,
  flags: Partial<Pick<KeyboardEvent, "shiftKey" | "ctrlKey" | "altKey" | "metaKey" | "repeat">> = {},
) => ({
  code,
  shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, repeat: false,
  ...flags,
});

describe("plain number debug shortcuts", () => {
  it("maps physical digits 3–0 without Shift", () => {
    expect(Object.keys(DEBUG_SHORTCUTS)).toEqual([
      "Digit3", "Digit4", "Digit5", "Digit6",
      "Digit7", "Digit8", "Digit9", "Digit0",
    ]);
    expect(Object.keys(DEBUG_SHORTCUTS).map(code => resolveDebugShortcut(key(code))))
      .toEqual(["overlay", "hitboxes", "points", "ammo", "clear", "round", "god", "help"]);
  });
  it("does not affect weapons 1/2, browser F keys, repeats or modifier shortcuts", () => {
    for (const code of ["Digit1", "Digit2", "F1", "F3", "Numpad4", "Digit8"]) {
      const flags = code === "Digit8" ? { shiftKey: true } : {};
      expect(resolveDebugShortcut(key(code, flags))).toBeNull();
    }
    expect(resolveDebugShortcut(key("Digit4", { repeat: true }))).toBeNull();
    expect(resolveDebugShortcut(key("Digit5", { ctrlKey: true }))).toBeNull();
    expect(resolveDebugShortcut(key("Digit6", { altKey: true }))).toBeNull();
    expect(resolveDebugShortcut(key("Digit7", { metaKey: true }))).toBeNull();
  });
});
