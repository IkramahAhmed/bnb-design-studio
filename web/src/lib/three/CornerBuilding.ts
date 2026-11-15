import { ConeGeometry, CylinderGeometry, Group, IcosahedronGeometry, BoxGeometry, Material, Mesh, Scene, Vector3 } from 'three';
import type { IntroRegistry } from './IntroRegistry';
import { PartFactory, type PartOptions } from './PartFactory';
import type { BuildingMaterials } from './materials';

/** Modelled from the client's SketchUp views: a corner retail building with a rooftop pergola. */
export interface CornerBuilding {
  root: Group;
  /** Pergola, canopy and rooftop boxes. Hidden in the plan view. */
  roof: Group;
  /** World positions just outside the storefronts, for the night-time window glow. */
  windowLights: [Vector3, Vector3];
}

const SCALE = 0.62;
const TURN = 0.45; // radians, so two faces of the building are visible from the opening camera
const CENTER = { x: -1.5, z: -11 }; // footprint centre, used to put the building at the origin
const GROUND = 0.15;

type Extra = Omit<PartOptions, 'parent' | 'delay'>;

export function buildCornerBuilding(scene: Scene, registry: IntroRegistry, m: BuildingMaterials): CornerBuilding {
  const root = new Group();
  root.scale.setScalar(SCALE);
  root.rotation.y = TURN;
  root.position.set(
    -SCALE * (CENTER.x * Math.cos(TURN) + CENTER.z * Math.sin(TURN)),
    0,
    -SCALE * (-CENTER.x * Math.sin(TURN) + CENTER.z * Math.cos(TURN)),
  );
  scene.add(root);

  const factory = new PartFactory(registry, m.outline);
  /** A box standing on `y0`, with its position given by its bottom-centre. */
  const part = (w: number, h: number, d: number, x: number, y0: number, z: number, mat: Material, delay?: number, o: Extra & { parent?: Group } = {}) =>
    factory.box(w, h, d, x, y0 + h / 2, z, mat, { parent: root, delay, ...o });

  addSite(root, registry, factory, m);
  addLowWing(root, registry, part, m);
  addTallBlock(part, m);
  const roof = addRoofPergola(root, registry, factory, part, m);
  addPalms(root, registry, m);
  addCar(root, registry, m);

  root.updateMatrixWorld(true);
  return {
    root,
    roof,
    windowLights: [root.localToWorld(new Vector3(-9, 3, 3.5)), root.localToWorld(new Vector3(4, 3, 3.5))],
  };
}

/** Adds a box standing on `y0` and returns it. `delay` is when it lands in the intro animation. */
type Part = (
  w: number, h: number, d: number,
  x: number, y0: number, z: number,
  mat: Material,
  delay?: number,
  o?: Extra & { parent?: Group },
) => Mesh;

function addSite(root: Group, registry: IntroRegistry, factory: PartFactory, m: BuildingMaterials): void {
  const flat: Extra = { edges: false, cast: false };

  const asphalt = factory.box(46, 0.15, 40, 3, 0.075, -6, m.asphalt, { parent: root, ...flat });
  registry.register(asphalt, 0, 'scale');

  const lot = new Group();
  root.add(lot);
  for (let i = 0; i < 6; i++) factory.box(5.4, 0.02, 0.18, 19, 0.17, -21 + i * 4, m.paintLine, { parent: lot, ...flat });
  factory.box(1.5, 0.02, 1.5, 17.5, 0.17, -5, m.paintBlue, { parent: lot, ...flat });
  for (let i = 0; i < 5; i++) factory.box(2.6, 0.02, 0.16, 18, 0.17, -4.6 + i * 0.5, m.paintLine, { parent: lot, ...flat });
  registry.register(lot, 0.25, 'scale');

  const sidewalk = factory.box(31, 0.08, 3.6, -1.5, 0.19, 1.8, m.concrete, { parent: root, edges: false });
  registry.register(sidewalk, 0.4, 'scale');
}

function addLowWing(root: Group, registry: IntroRegistry, part: Part, m: BuildingMaterials): void {
  part(15, 4.6, 7, -7.5, GROUND, -3.5, m.stucco, 0.55);
  part(15.1, 0.9, 7.1, -7.5, GROUND, -3.5, m.stone, 0.65);
  part(15.3, 0.35, 7.3, -7.5, 4.75, -3.5, m.cream, 1.1);

  const storefront = (x: number, w: number, h: number, delay: number) => {
    part(w + 0.4, h + 0.3, 0.14, x, 0.8, 0.04, m.black, delay, { edges: false });
    part(w, h, 0.1, x, 0.95, 0.1, m.glass, delay, { edges: false, cast: false });
    part(0.08, h, 0.12, x, 0.95, 0.14, m.black, delay, { edges: false });
    part(w + 0.6, 0.45, 0.3, x, 0.95 + h + 0.15, 0.1, m.black, delay, { edges: false });
  };
  storefront(-12.4, 3.2, 3.0, 0.95);
  storefront(-8.2, 3.2, 3.0, 1.0);

  // perforated corner panels
  part(1.7, 4.3, 0.12, -3.2, GROUND + 0.4, 0.06, m.perforated, 1.05, { edges: false });
  part(1.7, 4.3, 0.12, -1.4, GROUND + 0.4, 0.06, m.perforated, 1.1, { edges: false });

  // glass railing around the roof terrace
  part(15, 1.1, 0.06, -7.5, 5.1, 0, m.glass, 1.2, { edges: false, cast: false });
  part(15, 0.07, 0.1, -7.5, 6.2, 0, m.black, 1.25, { edges: false });
  for (let i = 0; i < 7; i++) part(0.08, 1.1, 0.1, -14.5 + i * 2.4, 5.1, 0, m.black, 1.25, { edges: false });

  const shrubs = new Group();
  const shrubGeometry = (i: number) => new IcosahedronGeometry(0.75 + (i % 3) * 0.12, 1);
  for (let i = 0; i < 9; i++) {
    const shrub = new Mesh(shrubGeometry(i), m.shrub);
    shrub.position.set(-14 + i * 1.7, 5.7, -1.1);
    shrub.castShadow = true;
    shrubs.add(shrub);
  }
  root.add(shrubs);
  registry.register(shrubs, 2.4, 'scale');
}

function addTallBlock(part: Part, m: BuildingMaterials): void {
  part(12, 8.4, 22, 6, GROUND, -11, m.stucco, 0.8);
  part(12.1, 0.9, 22.1, 6, GROUND, -11, m.stone, 0.9);
  part(12.3, 0.3, 22.3, 6, 4.75, -11, m.cream, 1.15);
  part(12.3, 0.4, 22.3, 6, 8.55, -11, m.cream, 1.4);

  // entrance
  part(5, 3.9, 0.14, 3.7, 0.8, 0.04, m.black, 1.2, { edges: false });
  part(4.5, 3.5, 0.1, 3.7, 0.95, 0.1, m.glass, 1.2, { edges: false, cast: false });
  part(0.08, 3.5, 0.12, 2.6, 0.95, 0.14, m.black, 1.2, { edges: false });
  part(0.08, 3.5, 0.12, 4.8, 0.95, 0.14, m.black, 1.2, { edges: false });
  part(5.6, 0.5, 0.3, 3.7, 4.5, 0.1, m.black, 1.25, { edges: false });

  // service door, balcony window and balcony on the long side wall
  part(0.1, 2.2, 1.1, 12.05, GROUND, -9, m.black, 1.3, { edges: false });
  part(0.12, 1.9, 0.9, 12.05, 5.6, -6, m.black, 1.35, { edges: false });
  part(0.5, 0.06, 1.1, 12.3, 5.1, -6, m.cream, 1.35, { edges: false });
  part(0.05, 0.9, 1.1, 12.55, 5.15, -6, m.glass, 1.35, { edges: false, cast: false });
}

function addRoofPergola(root: Group, registry: IntroRegistry, factory: PartFactory, part: Part, m: BuildingMaterials): Group {
  const roof = new Group();
  root.add(roof);
  const ROOF_Y = 8.95;

  const columns: Array<[number, number]> = [[0.6, -0.9], [11.4, -0.9], [0.6, -9], [11.4, -9]];
  columns.forEach(([x, z], i) => factory.cylinder(0.22, 3.4, x, ROOF_Y + 1.7, z, m.white, { parent: roof, delay: 1.6 + i * 0.05 }));

  const screen = new Group();
  roof.add(screen);
  for (let i = 0; i < 23; i++) factory.box(0.14, 3.2, 0.14, 0.5 + i * 0.5, 10.55, -0.5, m.slat, { parent: screen, edges: false });
  for (let i = 0; i < 16; i++) factory.box(0.14, 3.2, 0.14, 11.5, 10.55, -1 - i * 0.55, m.slat, { parent: screen, edges: false });
  registry.register(screen, 1.9);

  const louvers = new Group();
  roof.add(louvers);
  for (let i = 0; i < 16; i++) factory.box(11.6, 0.07, 0.26, 6, 12.15, -3.2 - i * 0.4, m.white, { parent: louvers, edges: false });
  registry.register(louvers, 2.1);

  const canopy = part(14, 0.2, 4.2, 5.5, 12.3, -0.2, m.white, 2.2, { parent: roof });
  canopy.rotation.z = 0.04;
  part(3.4, 2.4, 3.4, 8.5, ROOF_Y, -17.5, m.stucco, 2.3, { parent: roof });
  part(2.6, 2.0, 2.6, 3.5, ROOF_Y, -14, m.stucco, 2.35, { parent: roof });
  return roof;
}

function addPalms(root: Group, registry: IntroRegistry, m: BuildingMaterials): void {
  const planterGeometry = new CylinderGeometry(0.85, 0.75, 0.95, 24);
  const trunkGeometry = new CylinderGeometry(0.07, 0.1, 1.9, 8);
  const frondGeometry = new ConeGeometry(0.22, 1.5, 6);

  const palm = (x: number, z: number, delay: number) => {
    const group = new Group();
    group.position.set(x, GROUND, z);
    const planter = new Mesh(planterGeometry, m.planter);
    planter.position.y = 0.48;
    planter.castShadow = true;
    const trunk = new Mesh(trunkGeometry, m.trunk);
    trunk.position.y = 1.7;
    group.add(planter, trunk);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const frond = new Mesh(frondGeometry, m.leaf);
      frond.position.set(Math.cos(angle) * 0.55, 2.65, Math.sin(angle) * 0.55);
      frond.rotation.set(Math.sin(angle) * 1.15, 0, -Math.cos(angle) * 1.15);
      frond.castShadow = true;
      group.add(frond);
    }
    root.add(group);
    registry.register(group, delay, 'scale');
  };
  palm(-5.6, 2, 2.5);
  palm(-3.9, 2, 2.55);
  palm(-14.2, 2, 2.6);
}

function addCar(root: Group, registry: IntroRegistry, m: BuildingMaterials): void {
  const car = new Group();
  car.position.set(19, GROUND + 0.35, -11.5);

  const body = new Mesh(new BoxGeometry(4.6, 0.75, 1.9), m.carBody);
  body.position.y = 0.45;
  body.castShadow = true;
  const cabin = new Mesh(new BoxGeometry(2.4, 0.7, 1.65), m.glass);
  cabin.position.set(-0.2, 1.1, 0);
  car.add(body, cabin);

  const wheelGeometry = new CylinderGeometry(0.4, 0.4, 0.3, 16);
  for (const [x, z] of [[-1.5, 0.95], [1.5, 0.95], [-1.5, -0.95], [1.5, -0.95]] as const) {
    const wheel = new Mesh(wheelGeometry, m.tire);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.1, z);
    car.add(wheel);
  }
  root.add(car);
  registry.register(car, 2.9);
}
