import { describe, expect, it } from "vitest";
import { DEBUG_SHORTCUTS, resolveDebugShortcut } from "../src/debug/debugShortcuts";

describe("Shift + number debug shortcut dispatch", () => {
  it("maps exactly seven physical number-row keys", () => {
    expect(Object.keys(DEBUG_SHORTCUTS)).toEqual([
      "Digit1", "Digit2", "Digit3", "Digit4",
      "Digit5", "Digit6", "Digit7",
    ]);
    expect(
      Object.entries(DEBUG_SHORTCUTS).map(([code]) =>
        resolveDebugShortcut({ shiftKey: true, repeat: false, code }),
      ),
    ).toEqual([
      "overlay", "points", "ammo", "clear", "round", "god", "hitboxes",
    ]);
  });
  it("does not activate cheats without Shift, on key repeats or on F keys", () => {
    expect(resolveDebugShortcut({
      shiftKey: false, repeat: false, code: "Digit1",
    })).toBeNull();
    expect(resolveDebugShortcut({
      shiftKey: true, repeat: true, code: "Digit7",
    })).toBeNull();
    expect(resolveDebugShortcut({
      shiftKey: true, repeat: false, code: "F3",
    })).toBeNull();
    expect(resolveDebugShortcut({
      shiftKey: true, repeat: false, code: "Numpad7",
    })).toBeNull();
    expect(resolveDebugShortcut({
      shiftKey: true, repeat: false, code: "Digit8",
    })).toBeNull();
  });
});
