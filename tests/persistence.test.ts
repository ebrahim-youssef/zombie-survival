import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalSettingsStore } from "../src/persistence/LocalSettingsStore";

function mockStorage(initial: string | null = null): void {
  let value = initial;
  vi.stubGlobal("window", {
    localStorage: {
      getItem: () => value,
      setItem: (_key: string, input: string) => { value = input; },
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("local persistence", () => {
  it("falls back when saved data is corrupt", () => {
    mockStorage("{not-json");
    const data = new LocalSettingsStore().load();
    expect(data.version).toBe(1);
    expect(data.settings.masterVolume).toBe(0.65);
  });

  it("clamps settings and retains best records", () => {
    mockStorage();
    const store = new LocalSettingsStore();
    const saved = store.saveSettings({
      masterVolume: 4,
      mouseSensitivity: 0.01,
      damageNumbers: true,
    });
    expect(saved.settings).toEqual({
      masterVolume: 1,
      mouseSensitivity: 0.25,
      damageNumbers: true,
    });
    store.recordRun(800, 5);
    store.recordRun(300, 2);
    expect(store.load()).toMatchObject({
      highScore: 800,
      highestRound: 5,
    });
  });
});
