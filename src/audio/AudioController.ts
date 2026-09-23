import type Phaser from "phaser";
import type { GameSettings } from "../persistence/LocalSettingsStore";

export type SfxId =
  | "shot"
  | "melee"
  | "hit"
  | "kill"
  | "hurt"
  | "purchase"
  | "error"
  | "box"
  | "ui";

interface ToneDefinition {
  frequency: number;
  durationMs: number;
  gain: number;
  type: OscillatorType;
}

const TONES: Record<SfxId, ToneDefinition> = {
  shot: {
    frequency: 150,
    durationMs: 45,
    gain: 0.11,
    type: "square",
  },
  melee: {
    frequency: 95,
    durationMs: 70,
    gain: 0.09,
    type: "sawtooth",
  },
  hit: {
    frequency: 210,
    durationMs: 42,
    gain: 0.065,
    type: "triangle",
  },
  kill: {
    frequency: 120,
    durationMs: 90,
    gain: 0.09,
    type: "square",
  },
  hurt: {
    frequency: 75,
    durationMs: 120,
    gain: 0.1,
    type: "sawtooth",
  },
  purchase: {
    frequency: 460,
    durationMs: 90,
    gain: 0.07,
    type: "triangle",
  },
  error: {
    frequency: 130,
    durationMs: 100,
    gain: 0.07,
    type: "square",
  },
  box: {
    frequency: 330,
    durationMs: 100,
    gain: 0.055,
    type: "triangle",
  },
  ui: {
    frequency: 520,
    durationMs: 55,
    gain: 0.045,
    type: "sine",
  },
};

export class AudioController {
  private context: AudioContext | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
  ) {}

  play(id: SfxId): void {
    const settings = this.scene.registry.get(
      "gameSettings",
    ) as GameSettings | undefined;

    const masterVolume =
      settings?.masterVolume ?? 0.65;

    if (masterVolume <= 0) return;

    const context = this.getContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume();
    }

    const tone = TONES[id];
    const now = context.currentTime;
    const end =
      now + tone.durationMs / 1000;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(
      tone.frequency,
      now,
    );

    gain.gain.setValueAtTime(
      Math.max(
        0.0001,
        tone.gain * masterVolume,
      ),
      now,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      end,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(end);
  }

  destroy(): void {
    if (this.context) {
      void this.context.close();
      this.context = null;
    }
  }

  private getContext(): AudioContext | null {
    if (this.context) {
      return this.context;
    }

    try {
      this.context = new AudioContext();
      return this.context;
    } catch {
      return null;
    }
  }
}
