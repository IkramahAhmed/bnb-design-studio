import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DirectionalLight,
  FogExp2,
  GridHelper,
  HemisphereLight,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  WebGLRenderer,
  type Vector3,
} from 'three';
import { clamp } from './math';
import type { SceneParams } from './scenes';

const GRADIENT_VERTEX = 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';

/** Sky colour fades from `bot` at the horizon to `top` overhead. */
const SKY_FRAGMENT = `uniform vec3 top;uniform vec3 bot;varying vec3 vP;
void main(){float h=normalize(vP).y;gl_FragColor=vec4(mix(bot,top,smoothstep(0.0,0.6,h)),1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

/** Soft studio sky used only for reflections in glass. */
const REFLECTION_FRAGMENT = `uniform vec3 top;uniform vec3 bot;varying vec3 vP;
void main(){float h=clamp(normalize(vP).y*.5+.5,0.,1.);gl_FragColor=vec4(mix(bot,top,pow(h,.8)),1.);
#include <colorspace_fragment>
}`;

const PARTICLE_COUNT = { desktop: 260, mobile: 120 };
const STAR_COUNT = { desktop: 520, mobile: 220 };
const PARTICLE_CEILING = 22;
const LAMP_INTENSITY = 45;

/** Everything around the building: ground, sky, stars, dust, lights and reflections. */
export class Environment {
  /** Reflection map for glass. */
  readonly reflections: Texture;
  private readonly scene: Scene;
  private readonly hemi = new HemisphereLight('#ffffff', '#9fb59f', 1);
  private readonly sun = new DirectionalLight('#fff2dc', 3);
  private readonly lamps = [new PointLight('#ffb15c', 0, 18, 2), new PointLight('#ffb15c', 0, 18, 2)];
  private readonly groundMaterial = new MeshStandardMaterial({ color: '#dce5d9', roughness: 1 });
  private readonly grid = new GridHelper(120, 60, '#1b2a21', '#1b2a21');
  private readonly sky: ShaderMaterial;
  private readonly stars: PointsMaterial;
  private readonly dust: PointsMaterial;
  private readonly dustPositions: Float32Array;
  private readonly dustSpeeds: Float32Array;
  private readonly dustGeometry = new BufferGeometry();
  private readonly tint = new Color();

  constructor(renderer: WebGLRenderer, scene: Scene, isMobile: boolean) {
    this.scene = scene;
    scene.background = new Color('#e9efe7');
    scene.fog = new FogExp2('#e9efe7', 0.01);

    const shadowSize = isMobile ? 1024 : 2048;
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(shadowSize, shadowSize);
    Object.assign(this.sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.05;
    this.sun.shadow.radius = 4;

    const ground = new Mesh(new CircleGeometry(90, 64), this.groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    this.grid.position.y = 0.02;
    const gridMaterial = this.grid.material as LineBasicMaterial;
    gridMaterial.transparent = true;
    gridMaterial.depthWrite = false;

    this.sky = new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { top: { value: new Color('#8fc5ee') }, bot: { value: new Color('#eaf3ee') } },
      vertexShader: GRADIENT_VERTEX,
      fragmentShader: SKY_FRAGMENT,
    });
    const skyDome = new Mesh(new SphereGeometry(190, 32, 16), this.sky);
    skyDome.renderOrder = -10;
    skyDome.frustumCulled = false;

    this.stars = new PointsMaterial({ size: 1.8, sizeAttenuation: false, color: '#ffffff', transparent: true, opacity: 0, fog: false, depthWrite: false });
    this.dust = new PointsMaterial({ size: 0.14, color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false });

    const dustCount = isMobile ? PARTICLE_COUNT.mobile : PARTICLE_COUNT.desktop;
    this.dustPositions = new Float32Array(dustCount * 3);
    this.dustSpeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      this.dustPositions[i * 3] = (Math.random() - 0.5) * 70;
      this.dustPositions[i * 3 + 1] = Math.random() * PARTICLE_CEILING;
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      this.dustSpeeds[i] = 0.15 + Math.random() * 0.4;
    }
    this.dustGeometry.setAttribute('position', new BufferAttribute(this.dustPositions, 3));

    scene.add(
      this.hemi,
      this.sun,
      this.sun.target,
      ...this.lamps,
      ground,
      this.grid,
      skyDome,
      new Points(this.createStarGeometry(isMobile ? STAR_COUNT.mobile : STAR_COUNT.desktop), this.stars),
      new Points(this.dustGeometry, this.dust),
    );

    this.reflections = this.createReflections(renderer);
  }

  setWindowLights([a, b]: [Vector3, Vector3]): void {
    this.lamps[0].position.copy(a);
    this.lamps[1].position.copy(b);
  }

  /** Apply the blended scene settings for this frame. `glass` opacity and outline are handled by the caller. */
  update(S: SceneParams, nightAmount: number, dt: number, elapsed: number): void {
    const scene = this.scene;
    (scene.background as Color).copy(S.bg);
    const fog = scene.fog as FogExp2;
    fog.color.copy(S.bg);
    fog.density = S.fog;

    this.groundMaterial.color.copy(S.ground);
    this.hemi.intensity = S.hemi;
    this.sun.color.copy(S.sun);
    this.sun.intensity = S.sunI;
    this.sun.position.set(S.sunPos[0], S.sunPos[1], S.sunPos[2]);

    const gridMaterial = this.grid.material as LineBasicMaterial;
    gridMaterial.color.copy(S.edge);
    gridMaterial.opacity = S.grid;

    this.sky.uniforms.top.value.copy(S.sky);
    this.sky.uniforms.bot.value.copy(S.bg);
    this.stars.opacity = clamp(Math.max(nightAmount, S.glow * 0.85));
    for (const lamp of this.lamps) lamp.intensity = S.glow * LAMP_INTENSITY;

    this.dust.color.copy(S.edge).lerp(this.tint.set('#ffffff'), 0.5);
    this.dust.opacity = 0.25 + S.dark * 0.35;
    this.driftDust(dt, elapsed);
  }

  dispose(): void {
    this.reflections.dispose();
  }

  private driftDust(dt: number, elapsed: number): void {
    const p = this.dustPositions;
    for (let i = 0; i < this.dustSpeeds.length; i++) {
      const y = p[i * 3 + 1] + this.dustSpeeds[i] * dt;
      p[i * 3 + 1] = y > PARTICLE_CEILING ? 0 : y;
      p[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.004;
    }
    this.dustGeometry.attributes.position.needsUpdate = true;
  }

  private createStarGeometry(count: number): BufferGeometry {
    const positions = new Float32Array(count * 3);
    const radius = 170;
    for (let i = 0; i < count; i++) {
      const azimuth = Math.random() * Math.PI * 2;
      const elevation = 0.12 + Math.random() * 1.3;
      positions[i * 3] = Math.cos(azimuth) * Math.cos(elevation) * radius;
      positions[i * 3 + 1] = Math.sin(elevation) * radius;
      positions[i * 3 + 2] = Math.sin(azimuth) * Math.cos(elevation) * radius;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }

  private createReflections(renderer: WebGLRenderer): Texture {
    const studio = new Scene();
    studio.add(
      new Mesh(
        new SphereGeometry(50, 32, 16),
        new ShaderMaterial({
          side: BackSide,
          uniforms: { top: { value: new Color('#6fb0e6') }, bot: { value: new Color('#ffffff') } },
          vertexShader: GRADIENT_VERTEX,
          fragmentShader: REFLECTION_FRAGMENT,
        }),
      ),
    );
    const generator = new PMREMGenerator(renderer);
    const texture = generator.fromScene(studio, 0.04).texture;
    generator.dispose();
    return texture;
  }
}
