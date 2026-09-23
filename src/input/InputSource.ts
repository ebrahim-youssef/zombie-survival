import type { InputFrame } from "../types/game";

export interface InputSource {
  read(): InputFrame;
  destroy(): void;
}
