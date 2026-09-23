export interface GameSettings {
  masterVolume: number;
  mouseSensitivity: number;
  damageNumbers: boolean;
}

export interface PersistedGameData {
  version: 1;
  highScore: number;
  highestRound: number;
  settings: GameSettings;
}

const STORAGE_KEY = "zombie-survival:data:v1";

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.65,
  mouseSensitivity: 1,
  damageNumbers: false,
};

export const DEFAULT_PERSISTED_DATA: PersistedGameData = {
  version: 1,
  highScore: 0,
  highestRound: 0,
  settings: DEFAULT_SETTINGS,
};

export class LocalSettingsStore {
  load(): PersistedGameData {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return this.cloneDefaults();
      }

      const parsed: unknown = JSON.parse(raw);

      if (!this.isRecord(parsed)) {
        return this.cloneDefaults();
      }

      const settingsValue = this.isRecord(parsed.settings)
        ? parsed.settings
        : {};

      return {
        version: 1,
        highScore: this.toNonNegativeInteger(
          parsed.highScore,
        ),
        highestRound: this.toNonNegativeInteger(
          parsed.highestRound,
        ),
        settings: {
          masterVolume: this.clampNumber(
            settingsValue.masterVolume,
            0,
            1,
            DEFAULT_SETTINGS.masterVolume,
          ),
          mouseSensitivity: this.clampNumber(
            settingsValue.mouseSensitivity,
            0.25,
            2,
            DEFAULT_SETTINGS.mouseSensitivity,
          ),
          damageNumbers:
            typeof settingsValue.damageNumbers === "boolean"
              ? settingsValue.damageNumbers
              : DEFAULT_SETTINGS.damageNumbers,
        },
      };
    } catch {
      return this.cloneDefaults();
    }
  }

  saveSettings(
    settings: GameSettings,
  ): PersistedGameData {
    const current = this.load();
    const next: PersistedGameData = {
      ...current,
      settings: {
        masterVolume: this.clampNumber(
          settings.masterVolume,
          0,
          1,
          DEFAULT_SETTINGS.masterVolume,
        ),
        mouseSensitivity: this.clampNumber(
          settings.mouseSensitivity,
          0.25,
          2,
          DEFAULT_SETTINGS.mouseSensitivity,
        ),
        damageNumbers: settings.damageNumbers,
      },
    };

    this.write(next);
    return next;
  }

  recordRun(
    score: number,
    round: number,
  ): PersistedGameData {
    const current = this.load();

    const next: PersistedGameData = {
      ...current,
      highScore: Math.max(
        current.highScore,
        this.toNonNegativeInteger(score),
      ),
      highestRound: Math.max(
        current.highestRound,
        this.toNonNegativeInteger(round),
      ),
    };

    this.write(next);
    return next;
  }

  private write(data: PersistedGameData): void {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data),
      );
    } catch {
      // Storage can be unavailable in private/sandboxed contexts.
    }
  }

  private cloneDefaults(): PersistedGameData {
    return {
      ...DEFAULT_PERSISTED_DATA,
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  private isRecord(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === "object" &&
      value !== null
    );
  }

  private toNonNegativeInteger(
    value: unknown,
  ): number {
    return typeof value === "number" &&
      Number.isFinite(value)
      ? Math.max(0, Math.floor(value))
      : 0;
  }

  private clampNumber(
    value: unknown,
    min: number,
    max: number,
    fallback: number,
  ): number {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value)
    ) {
      return fallback;
    }

    return Math.min(max, Math.max(min, value));
  }
}
