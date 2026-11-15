import { LineBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, type MeshStandardMaterialParameters } from 'three';
import { canvasTexture, speckle } from './textures';

const standard = (color: string, extra: MeshStandardMaterialParameters = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.85, ...extra });

/** A material whose colour comes from a painted texture instead of a flat tint. */
const textured = (
  repeat: [number, number],
  size: [number, number],
  paint: Parameters<typeof canvasTexture>[2],
  extra: MeshStandardMaterialParameters = {},
) => {
  const material = standard('#ffffff', extra);
  material.map = canvasTexture(size[0], size[1], paint, repeat[0], repeat[1]);
  return material;
};

export function createBuildingMaterials() {
  const stucco = textured([3, 2], [256, 256], (g, w, h) => {
    g.fillStyle = '#f5f4ef';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1500, 0.08);
  });

  const stone = textured([6, 1], [256, 128], (g, w, h) => {
    g.fillStyle = '#dac8a6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,95,60,.35)';
    for (let y = 0; y < h; y += 16) {
      g.fillRect(0, y, w, 2);
      for (let x = ((y / 16) % 2) * 20; x < w; x += 40) g.fillRect(x, y, 2, 16);
    }
    speckle(g, w, h, 600, 0.2);
  });

  const asphalt = textured(
    [10, 10],
    [256, 256],
    (g, w, h) => {
      g.fillStyle = '#4b4e53';
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 5000, 0.25);
    },
    { roughness: 1 },
  );

  const concrete = textured([8, 2], [256, 256], (g, w, h) => {
    g.fillStyle = '#c9cac6';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 2000, 0.2);
    g.strokeStyle = 'rgba(0,0,0,.2)';
    g.strokeRect(0, 0, w, h);
  });

  const perforated = textured([1, 1], [256, 512], (g, w, h) => {
    g.fillStyle = '#f7f6f2';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(30,28,25,.85)';
    for (let i = 0; i < 160; i++) {
      g.beginPath();
      g.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 9, 0, Math.PI * 2);
      g.fill();
    }
  });

  return {
    stucco,
    stone,
    asphalt,
    concrete,
    perforated,
    cream: standard('#e9dcc3'),
    black: standard('#1b1d1f', { roughness: 0.5, metalness: 0.3 }),
    slat: standard('#2a2d31', { roughness: 0.6 }),
    white: standard('#f6f6f3'),
    paintLine: standard('#f4f4f0'),
    paintBlue: standard('#2f6fd1'),
    carBody: standard('#8d9298', { metalness: 0.5, roughness: 0.4 }),
    tire: standard('#151515'),
    leaf: standard('#3f9b4a', { flatShading: true }),
    planter: standard('#f2f1ec'),
    trunk: standard('#6b5a43'),
    shrub: standard('#4a9a4c', { flatShading: true }),
    glass: new MeshPhysicalMaterial({
      color: '#7fb59a',
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.4,
      emissive: '#ffb15c',
      emissiveIntensity: 0,
    }),
    outline: new LineBasicMaterial({ color: '#1b2a21', transparent: true, opacity: 0.5 }),
  };
}

export type BuildingMaterials = ReturnType<typeof createBuildingMaterials>;
