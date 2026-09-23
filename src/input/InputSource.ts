import type { InputFrame } from "../types/game";

export interface InputSource {
  read(): InputFrame;
  reset(): void;
  destroy(): void;
}
