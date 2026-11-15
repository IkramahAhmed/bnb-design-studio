export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (x: number, min = 0, max = 1): number => Math.min(max, Math.max(min, x));

/** Smoothstep easing for blending between camera scenes. */
export const smooth = (t: number): number => t * t * (3 - 2 * t);

export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Frame-rate independent smoothing factor.
 * `rate` is the fraction of the gap left after one second (smaller = snappier).
 */
export const damp = (rate: number, dt: number): number => 1 - Math.pow(rate, dt);
