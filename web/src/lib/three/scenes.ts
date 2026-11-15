import { Color } from 'three';
import { lerp } from './math';

export type Vec3 = [number, number, number];

/** Everything that changes from one scroll scene to the next. */
export interface SceneParams {
  pos: Vec3; // camera position
  tgt: Vec3; // camera look-at target
  sunPos: Vec3;
  bg: Color; // horizon / fog colour
  ground: Color;
  edge: Color; // outline + grid colour
  sun: Color;
  sky: Color; // top of the sky dome
  sunI: number; // sun intensity
  hemi: number; // sky light intensity
  roof: number; // 0 hides the roof pergola (plan view)
  glow: number; // window light, 0..1
  grid: number; // ground grid opacity
  dark: number; // 1 = dark theme scene
  shift: number; // horizontal framing, so the building clears the text
  fog: number;
}

const c = (hex: string) => new Color(hex);

const BASE: SceneParams = {
  pos: [20, 9, 24],
  tgt: [0, 3, 0],
  sunPos: [14, 22, 16],
  bg: c('#eaf3ee'),
  ground: c('#dce5d9'),
  edge: c('#1b2a21'),
  sun: c('#fff2dc'),
  sky: c('#8fc5ee'),
  sunI: 3.1,
  hemi: 1,
  roof: 1,
  glow: 0,
  grid: 0.28,
  dark: 0,
  shift: 1,
  fog: 0.01,
};

const DARK: Partial<SceneParams> = { dark: 1, sunI: 1.3, hemi: 0.75, grid: 0.55, sky: c('#03100a') };

const scene = (overrides: Partial<SceneParams>): SceneParams => ({ ...BASE, ...overrides });

/** One entry per page section, in the same order as `SECTIONS` in content/site.ts. */
export const SCENES: readonly SceneParams[] = [
  // welcome
  scene({ pos: [34, 8.4, 17], tgt: [0, 3.4, 0], shift: 2.15, sun: c('#ffdfa8'), sunPos: [22, 12, 18], sunI: 3.7, sky: c('#7fb9ea'), bg: c('#f1ebe0') }),
  // about
  scene({ pos: [-17, 6.5, 20], tgt: [0, 3.5, 0], shift: -1 }),
  // architectural design
  scene({ pos: [28, 5, 13], tgt: [0, 3.8, 0], shift: 1.3 }),
  // structural
  scene({ ...DARK, pos: [19, 8.5, 18], tgt: [0, 3.4, 0], shift: -1, bg: c('#0a1710'), ground: c('#07130d'), edge: c('#7be8a2'), roof: 0.05, fog: 0.014 }),
  // MEP
  scene({ ...DARK, pos: [-24, 13, 22], tgt: [0, 3.2, 0], shift: 1.2, bg: c('#08131d'), ground: c('#050e16'), edge: c('#6fb7ff'), roof: 0.04, fog: 0.014 }),
  // permit sets (plan view)
  scene({ ...DARK, pos: [0, 58, 12], tgt: [0, 0, 1], shift: -1.1, bg: c('#0c2820'), ground: c('#09201a'), edge: c('#c4f5d0'), roof: 0, grid: 0.75, fog: 0.004 }),
  // approach
  scene({ pos: [31, 15, 31], tgt: [0, 2, 0], shift: 1, fog: 0.012 }),
  // portfolio
  scene({ pos: [-6, 10, 42], tgt: [0, -5.5, 0], shift: 0, fog: 0.012 }),
  // contact (dusk)
  scene({ dark: 1, pos: [30, 4.5, 15], tgt: [0, 4.2, 0], shift: 1.2, bg: c('#21170f'), ground: c('#1c130c'), edge: c('#ffd9b0'), sun: c('#ff8a4a'), sky: c('#4a2f60'), sunI: 3.2, sunPos: [26, 6, 10], hemi: 0.45, glow: 1, grid: 0.3, fog: 0.014 }),
];

/** Night mode: colours that every scene is blended towards. */
export const NIGHT = {
  bg: c('#0a1226'),
  sky: c('#02040d'),
  ground: c('#0b1310'),
  sun: c('#8aa6ff'),
  edge: c('#c9d6ff'),
} as const;

const NUMBERS = ['sunI', 'hemi', 'roof', 'glow', 'grid', 'dark', 'shift', 'fog'] as const;
const VECTORS = ['pos', 'tgt', 'sunPos'] as const;
const COLORS = ['bg', 'ground', 'edge', 'sun', 'sky'] as const;

/** A fresh, independent copy to use as per-frame scratch space. */
export function createScratch(): SceneParams {
  const s = scene({});
  for (const k of VECTORS) s[k] = [...s[k]];
  for (const k of COLORS) s[k] = s[k].clone();
  return s;
}

/** Blend scene `a` into scene `b` by `t`, writing into `out` without allocating. */
export function mixScenes(out: SceneParams, a: SceneParams, b: SceneParams, t: number): void {
  for (const k of NUMBERS) out[k] = lerp(a[k], b[k], t);
  for (const k of VECTORS) for (let i = 0; i < 3; i++) out[k][i] = lerp(a[k][i], b[k][i], t);
  for (const k of COLORS) out[k].copy(a[k]).lerp(b[k], t);
}
