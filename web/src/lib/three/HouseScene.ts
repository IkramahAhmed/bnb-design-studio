import {
  ACESFilmicToneMapping,
  Line,
  LineSegments,
  Material,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Points,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { buildCornerBuilding, type CornerBuilding } from './CornerBuilding';
import { Environment } from './Environment';
import { IntroRegistry } from './IntroRegistry';
import { clamp, damp, easeOut, lerp, smooth } from './math';
import { createBuildingMaterials, type BuildingMaterials } from './materials';
import { createScratch, mixScenes, NIGHT, SCENES } from './scenes';

export interface HouseSceneOptions {
  canvas: HTMLCanvasElement;
  isMobile: boolean;
  reduceMotion: boolean;
  /** Fractional section index from the page scroll position. */
  getFraction: () => number;
  /** Called when the scene switches between a light and a dark look. */
  onTheme: (dark: boolean) => void;
  /** Called once, after the first frame has been drawn. */
  onReady: () => void;
  /** Called when the visitor starts or stops dragging the building around. */
  onDragChange: (dragging: boolean) => void;
}

// Pointer presses on these never start a drag.
const NO_DRAG = '.card,.btn,a,input,select,textarea,button,.proj,.nav,.dock,.rail,.form';

const CAMERA_DAMPING = 0.0009; // share of the camera gap left after one second
const NIGHT_DAMPING = 0.02;
const TURN_DAMPING = 0.001;
const IDLE_BEFORE_RETURN_MS = 4500;
const Y_AXIS = new Vector3(0, 1, 0);

/**
 * The 3D scene behind the page. Create one per canvas, call `start()`, and always call
 * `dispose()` when the page goes away so the GPU memory and event listeners are released.
 */
export class HouseScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(36, 1, 0.5, 250);
  private readonly environment: Environment;
  private readonly registry = new IntroRegistry();
  private readonly materials: BuildingMaterials = createBuildingMaterials();
  private readonly building: CornerBuilding;
  private readonly params = createScratch();

  private readonly camOffset = new Vector3();
  private readonly camTarget = new Vector3();
  private readonly pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0 };

  private width = 0;
  private height = 0;
  private position = 0; // smoothed fractional section index
  private nightGoal = 0;
  private night = 0;
  private yaw = 0;
  private yawGoal = 0;
  private dragging = false;
  private lastDragX = 0;
  private lastInput = 0;
  private lastDark: boolean | null = null;
  private introStart = 0;
  private introDone = false;
  private lastTime = 0;
  private frameId = 0;
  private disposed = false;
  private reported = false;

  constructor(private readonly opts: HouseSceneOptions) {
    const { canvas, isMobile } = opts;
    this.renderer = new WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputColorSpace = SRGBColorSpace;

    this.environment = new Environment(this.renderer, this.scene, isMobile);
    this.materials.glass.envMap = this.environment.reflections;
    this.materials.glass.envMapIntensity = 1.5;

    this.building = buildCornerBuilding(this.scene, this.registry, this.materials);
    this.environment.setWindowLights(this.building.windowLights);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.onResize();
  }

  /** Compile shaders, then begin the render loop and the assembly animation. */
  start(): void {
    this.renderer.compile(this.scene, this.camera);
    this.introStart = performance.now();
    if (this.opts.reduceMotion) {
      this.registry.update(Infinity);
      this.introDone = true;
    }
    this.frameId = requestAnimationFrame(this.frame);
  }

  setNight(on: boolean): void {
    this.nightGoal = on ? 1 : 0;
  }

  /** Turn the building by `radians` (the camera orbits it). */
  turn(radians: number): void {
    this.yawGoal += radians;
    this.lastInput = performance.now();
  }

  resetTurn(): void {
    this.yawGoal = 0;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.scene.traverse(disposeObject);
    this.environment.dispose();
    for (const material of Object.values(this.materials)) disposeMaterial(material);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private readonly frame = (time: number): void => {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.frame);
    const dt = Math.min((time - this.lastTime) / 1000 || 1 / 60, 0.05);
    this.lastTime = time;
    this.update(dt, time / 1000);
    this.renderer.render(this.scene, this.camera);
    if (!this.reported) {
      this.reported = true;
      this.opts.onReady();
    }
  };

  private update(dt: number, elapsed: number): void {
    const S = this.params;
    const last = SCENES.length - 1;

    // Blend the two scenes either side of the scroll position.
    this.position += (clamp(this.opts.getFraction(), 0, last) - this.position) * damp(CAMERA_DAMPING, dt);
    const i = Math.min(Math.floor(this.position), last - 1);
    mixScenes(S, SCENES[i], SCENES[i + 1], smooth(clamp(this.position - i)));
    this.applyNight(dt);

    const dark = S.dark > 0.5;
    if (dark !== this.lastDark) {
      this.lastDark = dark;
      this.opts.onTheme(dark);
    }

    // Assembly animation.
    const introSeconds = this.opts.reduceMotion ? Infinity : (performance.now() - this.introStart) / 1000;
    if (!this.introDone) {
      this.registry.update(introSeconds);
      this.introDone = introSeconds > this.registry.duration;
    }

    this.environment.update(S, this.night, dt, elapsed);
    this.materials.outline.color.copy(S.edge);
    this.materials.outline.opacity = dark ? 0.7 : 0.5;
    this.materials.glass.emissiveIntensity = S.glow * 0.95;
    this.building.roof.visible = S.roof > 0.03;

    this.updateCamera(dt, elapsed, clamp(introSeconds / this.registry.duration));
  }

  /** Night mode pulls whatever scene is showing towards a moonlit look. */
  private applyNight(dt: number): void {
    const S = this.params;
    this.night += (this.nightGoal - this.night) * damp(NIGHT_DAMPING, dt);
    const n = this.night;
    if (n <= 0.002) return;
    S.bg.lerp(NIGHT.bg, n * 0.92);
    S.sky.lerp(NIGHT.sky, n);
    S.ground.lerp(NIGHT.ground, n * 0.85);
    S.sun.lerp(NIGHT.sun, n);
    S.edge.lerp(NIGHT.edge, S.dark > 0.5 ? 0 : n * 0.9);
    S.sunI = lerp(S.sunI, 0.55, n);
    S.hemi = lerp(S.hemi, 0.3, n);
    S.fog = lerp(S.fog, 0.013, n);
    S.glow = Math.max(S.glow, n);
    S.dark = Math.max(S.dark, n);
  }

  private updateCamera(dt: number, elapsed: number, introProgress: number): void {
    const S = this.params;
    const { pointer, camOffset, camTarget, camera } = this;

    if (!this.dragging && performance.now() - this.lastInput > IDLE_BEFORE_RETURN_MS) {
      this.yawGoal *= 1 - Math.min(1, dt * 0.8);
    }
    this.yaw += (this.yawGoal - this.yaw) * damp(TURN_DAMPING, dt);
    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.04;
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.04;

    const portrait = this.width / this.height < 1;
    const zoom = (portrait ? 1.8 : 1) * (1 + (1 - easeOut(introProgress)) * 0.55);
    camTarget.set(S.tgt[0], S.tgt[1], S.tgt[2]);
    camOffset.set(S.pos[0] - S.tgt[0], S.pos[1] - S.tgt[1], S.pos[2] - S.tgt[2]).multiplyScalar(zoom);

    const sway = this.opts.reduceMotion ? 0 : Math.sin(elapsed * 0.22) * 0.05 + pointer.smoothX * 0.16;
    camOffset.applyAxisAngle(Y_AXIS, sway + this.yaw);
    camOffset.y -= pointer.smoothY * 1.6;
    camera.position.copy(camTarget).add(camOffset);
    camera.lookAt(camTarget);

    // Shift the picture sideways on wide screens so the building clears the text.
    const wide = this.width > 980;
    camera.setViewOffset(this.width, this.height, wide ? -this.width * 0.15 * S.shift : 0, wide ? 0 : this.height * 0.2, this.width, this.height);
  }

  private readonly onResize = (): void => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.fov = this.width / this.height < 0.8 ? 52 : 36;
  };

  private readonly onPointerDown = (e: PointerEvent): void => {
    if (e.target instanceof Element && e.target.closest(NO_DRAG)) return;
    this.dragging = true;
    this.lastDragX = e.clientX;
    this.opts.onDragChange(true);
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    this.pointer.x = e.clientX / this.width - 0.5;
    this.pointer.y = e.clientY / this.height - 0.5;
    if (!this.dragging) return;
    this.yawGoal += (e.clientX - this.lastDragX) * 0.007;
    this.lastDragX = e.clientX;
    this.lastInput = performance.now();
  };

  private readonly onPointerUp = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.opts.onDragChange(false);
  };
}

function disposeMaterial(material: unknown): void {
  if (material instanceof Material) {
    for (const value of Object.values(material)) if (value instanceof Texture) value.dispose();
    material.dispose();
  }
}

function disposeObject(object: Object3D): void {
  if (object instanceof Mesh || object instanceof Line || object instanceof LineSegments || object instanceof Points) {
    object.geometry.dispose();
    const material = object.material;
    for (const m of Array.isArray(material) ? material : [material]) disposeMaterial(m);
  }
}
