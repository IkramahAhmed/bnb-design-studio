import {
  BoxGeometry,
  CylinderGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  Object3D,
} from 'three';
import type { IntroRegistry } from './IntroRegistry';

export interface PartOptions {
  parent: Object3D;
  /** Seconds into the intro when this part lands. Omit for parts that belong to an animated group. */
  delay?: number;
  /** Draw an architectural outline around the part (default true for boxes). */
  edges?: boolean;
  /** Cast a shadow (default true). */
  cast?: boolean;
}

/** Creates boxes and cylinders, wires them into a parent, and registers them for the intro animation. */
export class PartFactory {
  constructor(
    private readonly registry: IntroRegistry,
    private readonly outline: LineBasicMaterial,
  ) {}

  box(w: number, h: number, d: number, x: number, y: number, z: number, material: Material, o: PartOptions): Mesh {
    const mesh = new Mesh(new BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = o.cast !== false;
    mesh.receiveShadow = true;
    if (o.edges !== false) mesh.add(new LineSegments(new EdgesGeometry(mesh.geometry), this.outline));
    return this.attach(mesh, o);
  }

  cylinder(radius: number, height: number, x: number, y: number, z: number, material: Material, o: PartOptions): Mesh {
    const mesh = new Mesh(new CylinderGeometry(radius, radius, height, 16), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return this.attach(mesh, o);
  }

  private attach(mesh: Mesh, o: PartOptions): Mesh {
    o.parent.add(mesh);
    if (o.delay !== undefined) this.registry.register(mesh, o.delay);
    return mesh;
  }
}
