import { Object3D, Vector3 } from 'three';
import { clamp } from './math';

/** `drop`: fall in from above and settle. `scale`: grow from nothing. */
export type IntroMode = 'drop' | 'scale';

interface Entry {
  object: Object3D;
  delay: number;
  mode: IntroMode;
  basePosition: Vector3;
  baseScale: Vector3;
}

const HIDDEN_SCALE = 0.0001;
const PART_DURATION = 1.5; // seconds each part takes to land
const DROP_HEIGHT = 20;

/** Plays the "building assembles itself" animation. Parts register once and are driven by elapsed time. */
export class IntroRegistry {
  private readonly entries: Entry[] = [];

  /** Total time (seconds) until the last registered part has landed. */
  get duration(): number {
    return this.entries.reduce((max, e) => Math.max(max, e.delay), 0) + PART_DURATION;
  }

  register(object: Object3D, delay: number, mode: IntroMode = 'drop'): void {
    this.entries.push({ object, delay, mode, basePosition: object.position.clone(), baseScale: object.scale.clone() });
    object.scale.setScalar(HIDDEN_SCALE);
  }

  /** `elapsed` is seconds since the intro began. Pass `Infinity` to jump to the finished state. */
  update(elapsed: number): void {
    for (const { object, delay, mode, basePosition, baseScale } of this.entries) {
      const p = clamp((elapsed - delay) / PART_DURATION);
      if (p <= 0) {
        object.scale.setScalar(HIDDEN_SCALE);
        continue;
      }
      const eased = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); // fast start, soft landing
      if (mode === 'scale') {
        object.scale.copy(baseScale).multiplyScalar(Math.max(eased, HIDDEN_SCALE));
      } else {
        object.scale.copy(baseScale);
        object.position.y = basePosition.y + (1 - eased) * DROP_HEIGHT;
      }
    }
  }
}
