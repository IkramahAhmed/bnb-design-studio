import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

type Painter = (g: CanvasRenderingContext2D, w: number, h: number) => void;

/** Paint a small canvas and turn it into a tiling texture (no image files to download). */
export function canvasTexture(w: number, h: number, paint: Painter, repeatX = 1, repeatY = 1): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('2D canvas is not available');
  paint(g, w, h);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 4;
  return texture;
}

/** Sprinkle fine grain over a painted surface. */
export function speckle(g: CanvasRenderingContext2D, w: number, h: number, count: number, maxAlpha: number): void {
  for (let i = 0; i < count; i++) {
    const v = (Math.random() * 255) | 0;
    g.fillStyle = `rgba(${v},${v},${v},${Math.random() * maxAlpha})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}
