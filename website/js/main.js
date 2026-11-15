import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
/* Build: npm run build  ->  website/js/app.js (this file is the source) */
/* ---------- helpers ---------- */
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = t => t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const isMobile = matchMedia('(max-width: 800px)').matches || /Mobi|Android/i.test(navigator.userAgent);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

/* ---------- UI: smooth scroll, nav, reveal ---------- */
let lenis = null;
function initScroll() {
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  }
  $$('[data-go]').forEach(a => a.addEventListener('click', e => {
    const el = $(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));
}

const panels = $$('.panel[data-scene]');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('in');
}), { threshold: 0.18 });
panels.forEach((p, i) => { if (i > 0) io.observe(p); });

/* rail + HUD */
const rail = $('#rail');
panels.forEach((p, i) => {
  const li = document.createElement('li');
  li.title = p.dataset.name;
  li.addEventListener('click', () => lenis ? lenis.scrollTo(p, { duration: 1.6 }) : p.scrollIntoView({ behavior: 'smooth' }));
  rail.appendChild(li);
});
const railItems = $$('li', rail);
let activeIdx = -1;
function setActive(i) {
  if (i === activeIdx) return;
  activeIdx = i;
  railItems.forEach((li, k) => li.classList.toggle('on', k === i));
  $('#hudNum').textContent = String(i + 1).padStart(2, '0');
  $('#hudName').textContent = panels[i].dataset.name;
}

/* tilt cards */
$$('.tilt').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  });
  c.addEventListener('mouseleave', () => { c.style.transform = ''; });
});

/* contact form (front-end only; mail delivery is wired at launch) */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (!f.name.value.trim() || !/\S+@\S+\.\S+/.test(f.email.value)) {
    $('#formOk').textContent = 'Please add your name and a valid email.';
    return;
  }
  $('#formOk').textContent = 'Thank you. We will be in touch shortly.';
  f.reset();
});

/* ---------- Scene definitions ---------- */
const C = h => new THREE.Color(h);
const DEF = {
  pos: [20, 9, 24], tgt: [0, 3, 0],
  bg: C('#eaf3ee'), ground: C('#dce5d9'), edge: C('#1b2a21'), sun: C('#fff2dc'), sky: C('#8fc5ee'),
  sunI: 3.1, sunPos: [14, 22, 16], hemi: 1.0,
  shell: 1, roof: 1, frame: 0, mep: 0, dims: 0, glow: 0, grid: 0.28, dark: 0, shift: 1, fog: 0.010
};
const sc = o => ({ ...DEF, ...o });
const DARK = { dark: 1, sunI: 1.3, hemi: 0.75, grid: 0.55, sky: C('#03100a') };
const SCENES = [
  sc({ pos: [34, 8.4, 17], tgt: [0, 3.4, 0], shift: 2.15, sun: C('#ffdfa8'), sunPos: [22, 12, 18], sunI: 3.7, sky: C('#7fb9ea'), bg: C('#f1ebe0') }),                                             // welcome
  sc({ pos: [-17, 6.5, 20], tgt: [0, 3.5, 0], shift: -1 }),                                               // about
  sc({ pos: [28, 5, 13], tgt: [0, 3.8, 0], shift: 1.3 }),                                                  // architectural
  sc({ ...DARK, pos: [19, 8.5, 18], tgt: [0, 3.4, 0], shift: -1, bg: C('#0a1710'), ground: C('#07130d'), edge: C('#7be8a2'), shell: 0.07, roof: 0.05, frame: 1, fog: 0.014 }), // structural
  sc({ ...DARK, pos: [-24, 13, 22], tgt: [0, 3.2, 0], shift: 1.2, bg: C('#08131d'), ground: C('#050e16'), edge: C('#6fb7ff'), shell: 0.09, roof: 0.04, frame: 0.2, mep: 1, fog: 0.014 }), // mep
  sc({ ...DARK, pos: [0, 58, 12], tgt: [0, 0, 1], shift: -1.1, bg: C('#0c2820'), ground: C('#09201a'), edge: C('#c4f5d0'), roof: 0, dims: 1, grid: 0.75, fog: 0.004 }), // permit
  sc({ pos: [31, 15, 31], tgt: [0, 2, 0], shift: 1, fog: 0.012 }),                                        // approach
  sc({ pos: [-6, 10, 42], tgt: [0, -5.5, 0], shift: 0, fog: 0.012 }),                                     // portfolio
  sc({ dark: 1, pos: [30, 4.5, 15], tgt: [0, 4.2, 0], shift: 1.2, bg: C('#21170f'), ground: C('#1c130c'), edge: C('#ffd9b0'), sun: C('#ff8a4a'), sky: C('#4a2f60'), sunI: 3.2, sunPos: [26, 6, 10], hemi: 0.45, glow: 1, grid: 0.3, fog: 0.014 }) // contact
];

function mixScene(a, b, t) {
  const o = {};
  for (const k in a) {
    const x = a[k], y = b[k];
    if (typeof x === 'number') o[k] = lerp(x, y, t);
    else if (Array.isArray(x)) o[k] = x.map((v, i) => lerp(v, y[i], t));
    else o[k] = x.clone().lerp(y, t);
  }
  return o;
}

setActive(0);

/* ---------- Night mode, drag-to-turn, dock ---------- */
const NIGHT_BG = C('#0a1226'), NIGHT_SKY = C('#02040d'), NIGHT_GR = C('#0b1310'), NIGHT_SUN = C('#8aa6ff'), NIGHT_EDGE = C('#c9d6ff');
let night = 0, nightK = 0, yaw = 0, yawT = 0, dragging = false, lastX = 0, lastInput = 0;
const NO_DRAG = '.card,.btn,a,input,select,textarea,button,.proj,.nav,.dock,.rail,.form';
addEventListener('pointerdown', e => {
  if (e.target.closest(NO_DRAG)) return;
  dragging = true; lastX = e.clientX; document.body.classList.add('dragging');
  const h = $('#dragHint'); if (h) h.classList.add('gone');
});
addEventListener('pointermove', e => {
  if (!dragging) return;
  yawT += (e.clientX - lastX) * 0.007; lastX = e.clientX; lastInput = performance.now();
});
['pointerup', 'pointercancel'].forEach(ev => addEventListener(ev, () => { dragging = false; document.body.classList.remove('dragging'); }));
const nightBtn = $('#btnNight');
nightBtn.addEventListener('click', () => {
  night = night ? 0 : 1;
  nightBtn.classList.toggle('on', !!night);
  nightBtn.textContent = night ? 'Day' : 'Night';
});
$('#btnL').addEventListener('click', () => { yawT -= 0.7; lastInput = performance.now(); });
$('#btnR').addEventListener('click', () => { yawT += 0.7; lastInput = performance.now(); });
$('#btnReset').addEventListener('click', () => { yawT = 0; });

/* ---------- 3D ---------- */
const loader = $('#loader');
const ldBar = $('#ldBar'), ldPct = $('#ldPct');
document.body.classList.add('booting', 'lock');

function finishBoot() {
  loader.classList.add('done');
  document.body.classList.remove('lock', 'booting');
  panels[0].classList.add('in');
}

function boot() {
  initScroll();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('#stage'), antialias: !isMobile, powerPreference: 'high-performance' });
  } catch (err) {
    console.warn('WebGL unavailable', err);
    ldBar.style.width = '100%';
    setTimeout(finishBoot, 300);
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = C('#e9efe7');
  scene.fog = new THREE.FogExp2('#e9efe7', 0.01);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 250);

  /* lights */
  const hemi = new THREE.HemisphereLight('#ffffff', '#9fb59f', 1.0);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff2dc', 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  const sc2 = sun.shadow.camera; sc2.left = -26; sc2.right = 26; sc2.top = 26; sc2.bottom = -26; sc2.near = 1; sc2.far = 90;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05; sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  /* ground + grid */
  const groundMat = new THREE.MeshStandardMaterial({ color: '#dce5d9', roughness: 1 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(90, 64), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const grid = new THREE.GridHelper(120, 60, '#1b2a21', '#1b2a21');
  grid.position.y = 0.02; grid.material.transparent = true; grid.material.opacity = 0.28; grid.material.depthWrite = false;
  scene.add(grid);

  /* materials */
  const wallMat = new THREE.MeshStandardMaterial({ color: '#f5f5f1', roughness: 0.85, transparent: true });
  const slabMat = new THREE.MeshStandardMaterial({ color: '#d4d6d1', roughness: 0.9, transparent: true });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#b98a5a', roughness: 0.65, transparent: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#343a36', roughness: 0.8, transparent: true });
  const brandMat = new THREE.MeshStandardMaterial({ color: '#1b6b25', roughness: 0.6, transparent: true });
  const doorMat = new THREE.MeshStandardMaterial({ color: '#c4161c', roughness: 0.5, transparent: true });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#2b2f2c', roughness: 0.7, transparent: true });
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a3b2e', roughness: 0.9 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#7fb59a', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.4, emissive: '#ffb15c', emissiveIntensity: 0 });
  const waterMat = new THREE.MeshStandardMaterial({ color: '#43b8c0', roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 });
  const edgeMat = new THREE.LineBasicMaterial({ color: '#1b2a21', transparent: true, opacity: 0.5 });
  const frameMat = new THREE.MeshStandardMaterial({ color: '#1b6b25', roughness: 0.5, emissive: '#0f5a1a', emissiveIntensity: 0.7, transparent: true, opacity: 0 });
  const shellMats = [wallMat, slabMat, woodMat, brandMat, darkMat, doorMat];

  /* procedural textures: real-looking wood, concrete, plaster */
  function tex(w, h, draw, rx, ry) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
    return t;
  }
  const speckle = (g, w, h, n, a) => { for (let i = 0; i < n; i++) { const v = Math.random() * 255 | 0; g.fillStyle = `rgba(${v},${v},${v},${Math.random() * a})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } };
  woodMat.color.set('#ffffff');
  woodMat.map = tex(128, 256, (g, w, h) => {
    g.fillStyle = '#c08a58'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 110; i++) {
      g.strokeStyle = `rgba(${70 + Math.random() * 40 | 0},${35 + Math.random() * 30 | 0},15,${0.08 + Math.random() * 0.2})`;
      g.lineWidth = 1 + Math.random() * 2.2; const x = Math.random() * w;
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 7, h * 0.3, x - 7, h * 0.65, x + 2, h); g.stroke();
    }
  }, 1, 1);
  slabMat.color.set('#ffffff');
  slabMat.map = tex(256, 256, (g, w, h) => { g.fillStyle = '#cfd1cc'; g.fillRect(0, 0, w, h); speckle(g, w, h, 2400, 0.22); }, 3, 1);
  wallMat.color.set('#ffffff');
  wallMat.map = tex(256, 256, (g, w, h) => { g.fillStyle = '#f6f5f0'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1200, 0.07); }, 2, 1);

  /* intro registry */
  const house = new THREE.Group(); scene.add(house);
  const intro = [];
  const shellMeshes = [];
  const reg = (obj, delay, mode = 'drop') => {
    obj.userData.base = obj.position.clone();
    obj.userData.baseScale = obj.scale.clone();
    intro.push({ obj, delay, mode });
    return obj;
  };
  function box(w, h, d, x, y, z, mat, o = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false;
    if (o.edges !== false) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeMat));
    (o.parent || house).add(m);
    if (o.delay !== undefined) reg(m, o.delay);
    if (o.shell) shellMeshes.push(m);
    return m;
  }
  function cyl(r, h, x, y, z, mat, o = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    (o.parent || house).add(m);
    if (o.delay !== undefined) reg(m, o.delay);
    return m;
  }

  /* --- the building (front faces +z) --- */
  box(20, 0.4, 14, 0, 0.2, 0.5, slabMat, { delay: 0.0, shell: true });                         // plinth
  box(12, 3, 7, -1.5, 1.9, -0.5, wallMat, { delay: 0.45, shell: true });                       // ground floor
  box(9, 2.4, 0.08, -3, 1.9, 3.03, glassMat, { delay: 0.8, edges: true, cast: false });        // glass front
  for (let i = 0; i <= 6; i++) box(0.08, 2.4, 0.12, -7.5 + i * 1.5, 1.9, 3.06, darkMat, { delay: 0.85, edges: false });
  box(1.15, 2.25, 0.1, 3.2, 1.525, 3.05, doorMat, { delay: 0.9 });                             // red door
  [-7.2, -3.6, 0, 3.6].forEach((x, i) => cyl(0.13, 3, x, 1.9, 3.3, wallMat, { delay: 0.95 + i * 0.05 }));
  box(16, 0.3, 8, -0.5, 3.55, -0.5, slabMat, { delay: 1.15, shell: true });                    // floor 2 slab
  box(9, 3, 6, 2, 5.2, -0.5, wallMat, { delay: 1.4, shell: true });                            // upper volume
  box(4.9, 1.9, 0.08, 0.15, 5.2, 2.54, glassMat, { delay: 1.65, cast: false });                // upper glass
  for (let i = 0; i <= 4; i++) box(0.07, 1.9, 0.1, -2.3 + i * 1.225, 5.2, 2.58, darkMat, { delay: 1.7, edges: false });
  const slats = new THREE.Group(); slats.position.set(0, 0, 0); house.add(slats);
  box(3.6, 2.6, 0.05, 4.6, 5.2, 2.52, darkMat, { parent: slats, edges: false });
  for (let i = 0; i < 14; i++) box(0.12, 2.6, 0.14, 2.95 + i * 0.25, 5.2, 2.62, woodMat, { parent: slats, edges: false, shell: true });
  reg(slats, 1.75);
  box(10.4, 0.35, 6.8, 2, 6.875, -0.5, roofMat, { delay: 2.0, shell: false });                 // roof
  const roofMesh = house.children[house.children.length - 1];
  box(10.5, 0.14, 6.9, 2, 6.72, -0.5, brandMat, { delay: 2.1, shell: true });                  // green fascia
  const fascia = house.children[house.children.length - 1];
  /* pool */
  box(8.6, 0.12, 3.6, -3, 0.46, 5.2, slabMat, { delay: 2.3, shell: true });
  const waterGeo = new THREE.PlaneGeometry(8, 3, 32, 12); waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, waterMat); water.position.set(-3, 0.56, 5.2); water.receiveShadow = true;
  house.add(water); reg(water, 2.35);
  const waterPos = waterGeo.attributes.position;
  /* path */
  for (let i = 0; i < 5; i++) box(1.4, 0.1, 0.8, 3.2, 0.45, 4.6 + i * 1.0, slabMat, { delay: 2.4 + i * 0.05, shell: true });
  /* trees */
  const trees = [];
  const treeGeo = new THREE.IcosahedronGeometry(1, 1);
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.6, 8);
  const greens = ['#2f7d3a', '#3c9447', '#256b30', '#4aa655'];
  [[-10.5, -8, 1.3], [14, -6, 1.4], [-14.5, -3, 1.2], [0, -11, 1.5], [15, -12, 0.9], [-16, -9, 1], [-3, -13, 1.1], [11, -11, 1.2]].forEach(([x, z, s], i) => {
    const t = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat); trunk.position.y = 0.8 * s; trunk.scale.setScalar(s); trunk.castShadow = true;
    const crown = new THREE.Mesh(treeGeo, new THREE.MeshStandardMaterial({ color: greens[i % 4], roughness: 0.9, flatShading: true }));
    crown.position.y = 2.5 * s; crown.scale.set(1.3 * s, 1.5 * s, 1.3 * s); crown.castShadow = true; crown.receiveShadow = true;
    t.add(trunk, crown); t.position.set(x, 0, z); scene.add(t); trees.push(t);
    reg(t, 2.5 + i * 0.1, 'scale');
  });

  /* --- structural frame --- */
  const frame = new THREE.Group(); frame.visible = false; scene.add(frame);
  const fbox = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat); m.position.set(x, y, z); frame.add(m); return m; };
  const gx = [-7, -3.5, 0, 3.5], gz = [-3.5, 2.5];
  gx.forEach(x => gz.forEach(z => { fbox(0.32, 3, 0.32, x, 1.9, z); fbox(0.95, 0.3, 0.95, x, 0.55, z); }));
  gz.forEach(z => fbox(11, 0.28, 0.28, -1.75, 3.25, z));
  gx.forEach(x => fbox(0.28, 0.28, 6, x, 3.25, -0.5));
  for (let x = -7; x <= 3.5; x += 1.75) fbox(0.14, 0.22, 6, x, 3.3, -0.5);
  const ux = [-2, 1, 4, 6.2], uz = [-3, 2];
  ux.forEach(x => uz.forEach(z => fbox(0.3, 3, 0.3, x, 5.2, z)));
  uz.forEach(z => { fbox(8.6, 0.26, 0.26, 2.1, 6.55, z); fbox(8.6, 0.26, 0.26, 2.1, 3.8, z); });
  ux.forEach(x => { fbox(0.26, 0.26, 5.6, x, 6.55, -0.5); fbox(0.26, 0.26, 5.6, x, 3.8, -0.5); });
  /* diagonal bracing */
  const brace = (a, b) => seg(a, b, 0.07, frameMat, frame);

  function seg(a, b, r, mat, parent) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const len = va.distanceTo(vb);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), mat);
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    parent.add(m); return m;
  }
  function pipe(pts, r, mat, parent) {
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], r, mat, parent);
    if (pts.length > 2) for (let i = 1; i < pts.length - 1; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 10, 10), mat); s.position.set(...pts[i]); parent.add(s);
    }
  }
  brace([-7, 0.6, -3.5], [-3.5, 3.2, -3.5]); brace([-3.5, 0.6, -3.5], [-7, 3.2, -3.5]);
  brace([0, 0.6, 2.5], [3.5, 3.2, 2.5]); brace([3.5, 0.6, 2.5], [0, 3.2, 2.5]);
  brace([1, 3.9, -3], [4, 6.4, -3]); brace([4, 3.9, -3], [1, 6.4, -3]);

  /* --- MEP --- */
  const mep = new THREE.Group(); mep.visible = false; scene.add(mep);
  const mHvac = new THREE.MeshBasicMaterial({ color: '#35e0b4', transparent: true, opacity: 0 });
  const mPlum = new THREE.MeshBasicMaterial({ color: '#3aa0ff', transparent: true, opacity: 0 });
  const mWaste = new THREE.MeshBasicMaterial({ color: '#9aa7b4', transparent: true, opacity: 0 });
  const mElec = new THREE.MeshBasicMaterial({ color: '#ff4d4d', transparent: true, opacity: 0 });
  const mLamp = new THREE.MeshBasicMaterial({ color: '#ffd54a', transparent: true, opacity: 0 });
  const mepMats = [mHvac, mPlum, mWaste, mElec, mLamp];
  pipe([[-7, 3.0, -1], [3.8, 3.0, -1]], 0.28, mHvac, mep);
  [-5.5, -2, 1.5].forEach(x => { pipe([[x, 3.0, -1], [x, 3.0, 2.4]], 0.17, mHvac, mep); pipe([[x, 3.0, -1], [x, 3.0, -3.4]], 0.17, mHvac, mep); });
  pipe([[3.8, 3.0, -1], [3.8, 6.3, -1], [-1.5, 6.3, -1]], 0.28, mHvac, mep);
  pipe([[-1.5, 6.3, -1], [6, 6.3, -1]], 0.25, mHvac, mep);
  [0, 3, 5.5].forEach(x => { pipe([[x, 6.3, -1], [x, 6.3, 1.9]], 0.16, mHvac, mep); pipe([[x, 6.3, -1], [x, 6.3, -2.8]], 0.16, mHvac, mep); });
  pipe([[-6.6, 0.5, -3.2], [-6.6, 6.4, -3.2]], 0.1, mPlum, mep);
  pipe([[-6.6, 1.0, -3.2], [-2, 1.0, -3.2], [-2, 1.0, -1], [-2, 0.5, -1]], 0.08, mPlum, mep);
  pipe([[-6.6, 4.6, -3.2], [-2.2, 4.6, -3.2], [-2.2, 4.6, -1]], 0.08, mPlum, mep);
  pipe([[-6.2, 0.5, -3.2], [-6.2, 6.4, -3.2]], 0.15, mWaste, mep);
  pipe([[-6.2, 0.5, -3.2], [-6.2, 0.5, -6], [-9.5, 0.5, -6]], 0.15, mWaste, mep);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.25), mElec); panel.position.set(4.2, 1.7, -3.7); mep.add(panel);
  pipe([[4.2, 3.2, -3.7], [-7, 3.2, -3.7]], 0.05, mElec, mep);
  pipe([[4.2, 3.2, -3.7], [4.2, 2.3, -3.7]], 0.05, mElec, mep);
  pipe([[4.2, 3.2, -3.7], [4.2, 6.45, -3.7], [-2, 6.45, -3.7]], 0.05, mElec, mep);
  [-6, -3, 0, 3].forEach(x => [-2, 1.5].forEach(z => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), mLamp); l.position.set(x, 3.2, z); mep.add(l);
  }));
  pipe([[-6, 3.2, -2], [3, 3.2, -2]], 0.04, mElec, mep); pipe([[-6, 3.2, 1.5], [3, 3.2, 1.5]], 0.04, mElec, mep);
  [-1, 1.5, 4, 5.8].forEach(x => [-2, 1].forEach(z => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), mLamp); l.position.set(x, 6.5, z); mep.add(l);
  }));
  pipe([[-1, 6.45, -2], [5.8, 6.45, -2]], 0.04, mElec, mep); pipe([[-1, 6.45, 1], [5.8, 6.45, 1]], 0.04, mElec, mep);

  /* --- dimensions (permit view) --- */
  const dims = new THREE.Group(); dims.visible = false; scene.add(dims);
  const dimLineMat = new THREE.LineBasicMaterial({ color: '#c4f5d0', transparent: true, opacity: 0 });
  const dimSprites = [];
  const ftIn = m => { const i = Math.round(m * 39.3701); return `${Math.floor(i / 12)}'-${i % 12}"`; };
  function label(text, x, y, z) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
    const g = cv.getContext('2d'); g.font = '500 56px "JetBrains Mono", monospace'; g.fillStyle = '#e8fff0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const sm = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    const s = new THREE.Sprite(sm); s.scale.set(5, 1.25, 1); s.position.set(x, y, z); s.renderOrder = 10; dims.add(s); dimSprites.push(sm);
  }
  function dimLine(a, b, perp) {
    const pts = [a, b];
    [a, b].forEach(p => { pts.push(p, [p[0] + perp[0], p[1], p[2] + perp[1]], [p[0] - perp[0], p[1], p[2] - perp[1]], p); });
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
    dims.add(new THREE.Line(geo, dimLineMat));
  }
  dimLine([-10, 0.6, 9.2], [10, 0.6, 9.2], [0, 0.5]); label(ftIn(20), 0, 0.7, 10.6);
  dimLine([11.8, 0.6, -6.5], [11.8, 0.6, 7.5], [0.5, 0]); label(ftIn(14), 13.6, 0.7, 0.5);
  dimLine([-7.5, 0.6, -5.6], [4.5, 0.6, -5.6], [0, 0.4]); label(ftIn(12), -1.5, 0.7, -6.9);

  /* --- ethereal particles --- */
  const N = isMobile ? 120 : 260;
  const pGeo = new THREE.BufferGeometry();
  const pArr = new Float32Array(N * 3), pSpd = new Float32Array(N);
  for (let i = 0; i < N; i++) { pArr[i * 3] = (Math.random() - 0.5) * 70; pArr[i * 3 + 1] = Math.random() * 22; pArr[i * 3 + 2] = (Math.random() - 0.5) * 70; pSpd[i] = 0.15 + Math.random() * 0.4; }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.14, color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true });
  scene.add(new THREE.Points(pGeo, pMat));

  /* --- sky dome, stars, reflections, window lights --- */
  const GRAD_V = 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C('#8fc5ee') }, bot: { value: C('#eaf3ee') } },
    vertexShader: GRAD_V,
    fragmentShader: 'uniform vec3 top;uniform vec3 bot;varying vec3 vP;void main(){float h=normalize(vP).y;gl_FragColor=vec4(mix(bot,top,smoothstep(0.0,0.6,h)),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 16), skyMat);
  skyDome.renderOrder = -10; skyDome.frustumCulled = false; scene.add(skyDome);

  const starN = isMobile ? 220 : 520, starArr = new Float32Array(starN * 3);
  for (let i = 0; i < starN; i++) {
    const a = Math.random() * Math.PI * 2, e = 0.12 + Math.random() * 1.3, r = 170;
    starArr[i * 3] = Math.cos(a) * Math.cos(e) * r; starArr[i * 3 + 1] = Math.sin(e) * r; starArr[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
  }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
  const starMat = new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, color: '#ffffff', transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: { top: { value: C('#6fb0e6') }, bot: { value: C('#ffffff') } }, vertexShader: GRAD_V,
    fragmentShader: 'uniform vec3 top;uniform vec3 bot;varying vec3 vP;void main(){float h=clamp(normalize(vP).y*.5+.5,0.,1.);gl_FragColor=vec4(mix(bot,top,pow(h,.8)),1.);\n#include <colorspace_fragment>\n}'
  })));
  const envTex = new THREE.PMREMGenerator(renderer).fromScene(envScene, 0.04).texture;
  glassMat.envMap = envTex; glassMat.envMapIntensity = 1.5; waterMat.envMap = envTex; waterMat.envMapIntensity = 1.2;
  const lampA = new THREE.PointLight('#ffb15c', 0, 18, 2); lampA.position.set(-3, 2.6, 5.4);
  const lampB = new THREE.PointLight('#ffb15c', 0, 18, 2); lampB.position.set(1, 5.4, 4.2);
  scene.add(lampA, lampB);
  const progBar = $('#prog');

  /* --- real house model: every part is placed and animated on its own --- */
  let useModel = false, modelDone = false;
  const HOUSE_W = 17;                       // house footprint (scene units)
  const modelGroup = new THREE.Group(); scene.add(modelGroup);
  const roofParts = [], glassList = [];
  const lawnMat = new THREE.MeshStandardMaterial({ color: '#86c566', roughness: 1 });
  const LAWN_DAY = new THREE.Color('#86c566'), LAWN_DARK = new THREE.Color('#1d3a25');
  const onModel = gltf => {
    try {
      gltf.scene.updateMatrixWorld(true);
      const parts = [];
      gltf.scene.traverse(o => { if (o.isMesh) parts.push(o); });
      if (!parts.length) throw new Error('no meshes');
      const isLand = o => /land/i.test(o.material.name || '');
      const houseBox = new THREE.Box3(), allBox = new THREE.Box3();
      parts.forEach(o => { const b = new THREE.Box3().setFromObject(o); allBox.union(b); if (!isLand(o)) houseBox.union(b); });
      const sz = houseBox.getSize(new THREE.Vector3()), ctr = houseBox.getCenter(new THREE.Vector3());
      const k = HOUSE_W / Math.max(sz.x, sz.z), H = sz.y * k;
      const items = parts.filter(o => !isLand(o)).map(o => {
        const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld);
        geo.translate(-ctr.x, -houseBox.min.y, -ctr.z); geo.scale(k, k, k);
        geo.computeBoundingBox();
        const c = geo.boundingBox.getCenter(new THREE.Vector3()), s = geo.boundingBox.getSize(new THREE.Vector3());
        geo.translate(-c.x, -c.y, -c.z);
        return { o, geo, c, s, land: isLand(o), name: o.name || '', mat: o.material };
      });
      const furn = /chair|table|bench|carpet|pillow|bed|sofa|lamp|plant|tv|cushion/i;
      items.sort((a, b) => a.c.y - b.c.y);
      items.forEach((it, i) => {
        const m = new THREE.Mesh(it.geo, it.mat);
        m.position.copy(it.c);
        const isGlass = /glass/i.test(it.mat.name || '');
        m.castShadow = !isGlass; m.receiveShadow = true; m.frustumCulled = false;
        if (isGlass && !glassList.includes(it.mat)) { glassList.push(it.mat); it.mat.envMap = envTex; it.mat.envMapIntensity = 1.3; it.mat.emissive = new THREE.Color('#ffb15c'); }
        const big = it.s.x > HOUSE_W * 0.3 && it.s.z > HOUSE_W * 0.2;
        if (!it.land && big && it.c.y > H * 0.78) {           // roof / ceiling slabs: can fade away for the plan view
          m.material = it.mat.clone(); m.material.transparent = true; roofParts.push(m);
        }
        modelGroup.add(m);
        const t = clamp(it.c.y / H);
        if (it.land) { reg(m, 0.0 + (i % 7) * 0.05, 'scale'); }
        else if (furn.test(it.name)) { reg(m, 2.5 + t * 0.9 + (i % 5) * 0.04, 'scale'); }
        else {
          reg(m, 0.35 + t * 2.1 + (i % 6) * 0.03, 'drop');
          m.userData.off = 9 + (i % 5) * 2.2; m.userData.rot = ((i % 3) - 1) * 0.5;
        }
      });
      /* turn the house so its open (pool / deck) side faces the opening camera */
      const poolIt = items.find(it => /^pool/i.test(it.name));
      let fx = 0, fz = 0;
      if (poolIt) { fx = poolIt.c.x; fz = poolIt.c.z; }
      else items.filter(it => /door|glass/i.test(it.name)).forEach(it => { fx += it.c.x; fz += it.c.z; });
      if (Math.hypot(fx, fz) > 0.5) modelGroup.rotation.y = 0.45 - Math.atan2(fx, fz) - 0.55;
      const lawn = new THREE.Mesh(new THREE.CircleGeometry(15.5, 64), lawnMat);
      lawn.rotation.x = -Math.PI / 2; lawn.position.y = 0.02; lawn.receiveShadow = true;
      modelGroup.add(lawn); reg(lawn, 0.0, 'scale');
      lampA.position.set(0, 2.2, 1); lampB.position.set(0, H * 0.7, 0);
      house.visible = false; useModel = true;
    } catch (err) { console.warn('Model not used, keeping built-in house', err); }
    modelDone = true;
  };
  const onModelErr = err => { console.warn('Model failed to load', err); modelDone = true; };
  /* --- corner retail building, modelled from the client's SketchUp views --- */
  let cornerRoof = null;
  function buildCorner() {
    const sc = 0.62, rot = 0.45, cx = -1.5, cz = -11;
    const L = new THREE.Group(); scene.add(L);
    L.scale.setScalar(sc); L.rotation.y = rot;
    L.position.set(-sc * (cx * Math.cos(rot) + cz * Math.sin(rot)), 0, -sc * (-cx * Math.sin(rot) + cz * Math.cos(rot)));
    const mk = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85 }, o || {}));
    const stucco = mk('#ffffff'); stucco.map = tex(256, 256, (g, w, h) => { g.fillStyle = '#f5f4ef'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1500, 0.08); }, 3, 2);
    const stone = mk('#ffffff'); stone.map = tex(256, 128, (g, w, h) => {
      g.fillStyle = '#dac8a6'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(120,95,60,.35)'; g.fillRect(0, y, w, 2); for (let x = ((y / 16) % 2) * 20; x < w; x += 40) g.fillRect(x, y, 2, 16); }
      speckle(g, w, h, 600, 0.2);
    }, 6, 1);
    const asphalt = mk('#ffffff', { roughness: 1 }); asphalt.map = tex(256, 256, (g, w, h) => { g.fillStyle = '#4b4e53'; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, 0.25); }, 10, 10);
    const concrete = mk('#ffffff'); concrete.map = tex(256, 256, (g, w, h) => { g.fillStyle = '#c9cac6'; g.fillRect(0, 0, w, h); speckle(g, w, h, 2000, 0.2); g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(0, 0, w, h); }, 8, 2);
    const perf = mk('#ffffff'); perf.map = tex(256, 512, (g, w, h) => { g.fillStyle = '#f7f6f2'; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(30,28,25,.85)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 9, 0, 6.283); g.fill(); } }, 1, 1);
    const cream = mk('#e9dcc3'), black = mk('#1b1d1f', { roughness: 0.5, metalness: 0.3 }), slatM = mk('#2a2d31', { roughness: 0.6 }), white = mk('#f6f6f3');
    const lineM = mk('#f4f4f0'), blueM = mk('#2f6fd1'), carBody = mk('#8d9298', { metalness: 0.5, roughness: 0.4 }), tire = mk('#151515');
    const leaf = mk('#3f9b4a', { flatShading: true }), pot = mk('#f2f1ec'), trunkM = mk('#6b5a43'), shrub = mk('#4a9a4c', { flatShading: true });
    const B = (w, h, d, x, y0, z, mat, delay, o) => box(w, h, d, x, y0 + h / 2, z, mat, Object.assign({ parent: L, delay }, o || {}));
    const G = 0.15;

    /* ground: asphalt, parking lot, sidewalk */
    const pad = box(46, 0.15, 40, 3, 0.075, -6, asphalt, { parent: L, edges: false, cast: false }); reg(pad, 0, 'scale');
    const lot = new THREE.Group(); L.add(lot);
    for (let i = 0; i < 6; i++) box(5.4, 0.02, 0.18, 19, 0.17, -21 + i * 4, lineM, { parent: lot, edges: false, cast: false });
    box(1.5, 0.02, 1.5, 17.5, 0.17, -5, blueM, { parent: lot, edges: false, cast: false });
    for (let i = 0; i < 5; i++) box(2.6, 0.02, 0.16, 18, 0.17, -3.4 + i * 0.5 - 1.2, lineM, { parent: lot, edges: false, cast: false });
    reg(lot, 0.25, 'scale');
    const walk = box(31, 0.08, 3.6, -1.5, 0.19, 1.8, concrete, { parent: L, edges: false }); reg(walk, 0.4, 'scale');

    /* low wing (storefronts + roof terrace) */
    B(15, 4.6, 7, -7.5, G, -3.5, stucco, 0.55);
    B(15.1, 0.9, 7.1, -7.5, G, -3.5, stone, 0.65);
    B(15.3, 0.35, 7.3, -7.5, 4.75, -3.5, cream, 1.1);
    const store = (x, w, h, dl) => {
      B(w + 0.4, h + 0.3, 0.14, x, 0.8, 0.04, black, dl, { edges: false });
      B(w, h, 0.1, x, 0.95, 0.1, glassMat, dl, { edges: false, cast: false });
      B(0.08, h, 0.12, x, 0.95, 0.14, black, dl, { edges: false });
      B(w + 0.6, 0.45, 0.3, x, 0.95 + h + 0.15, 0.1, black, dl, { edges: false });
    };
    store(-12.4, 3.2, 3.0, 0.95); store(-8.2, 3.2, 3.0, 1.0);
    B(1.7, 4.3, 0.12, -3.2, G + 0.4, 0.06, perf, 1.05, { edges: false }); B(1.7, 4.3, 0.12, -1.4, G + 0.4, 0.06, perf, 1.1, { edges: false });
    B(15, 1.1, 0.06, -7.5, 5.1, 0.0, glassMat, 1.2, { edges: false, cast: false });
    B(15, 0.07, 0.1, -7.5, 6.2, 0.0, black, 1.25, { edges: false });
    for (let i = 0; i < 7; i++) B(0.08, 1.1, 0.1, -14.5 + i * 2.4, 5.1, 0.0, black, 1.25, { edges: false });
    const shrubs = new THREE.Group(); L.add(shrubs);
    for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 + (i % 3) * 0.12, 1), shrub); s.position.set(-14 + i * 1.7, 5.7, -1.1); s.castShadow = true; shrubs.add(s); }
    reg(shrubs, 2.4, 'scale');

    /* tall block (two floors + rooftop pergola) */
    B(12, 8.4, 22, 6, G, -11, stucco, 0.8);
    B(12.1, 0.9, 22.1, 6, G, -11, stone, 0.9);
    B(12.3, 0.3, 22.3, 6, 4.75, -11, cream, 1.15);
    B(12.3, 0.4, 22.3, 6, 8.55, -11, cream, 1.4);
    B(5, 3.9, 0.14, 3.7, 0.8, 0.04, black, 1.2, { edges: false });
    B(4.5, 3.5, 0.1, 3.7, 0.95, 0.1, glassMat, 1.2, { edges: false, cast: false });
    B(0.08, 3.5, 0.12, 2.6, 0.95, 0.14, black, 1.2, { edges: false }); B(0.08, 3.5, 0.12, 4.8, 0.95, 0.14, black, 1.2, { edges: false });
    B(5.6, 0.5, 0.3, 3.7, 4.5, 0.1, black, 1.25, { edges: false });
    B(0.1, 2.2, 1.1, 12.05, G, -9, black, 1.3, { edges: false });
    B(0.12, 1.9, 0.9, 12.05, 5.6, -6, black, 1.35, { edges: false });
    B(0.5, 0.06, 1.1, 12.3, 5.1, -6, cream, 1.35, { edges: false }); B(0.05, 0.9, 1.1, 12.55, 5.15, -6, glassMat, 1.35, { edges: false, cast: false });

    /* rooftop pergola, canopy, penthouses (hidden in the plan view) */
    cornerRoof = new THREE.Group(); L.add(cornerRoof);
    [[0.6, -0.9], [11.4, -0.9], [0.6, -9], [11.4, -9]].forEach(([x, z], i) => cyl(0.22, 3.4, x, 8.95 + 1.7, z, white, { parent: cornerRoof, delay: 1.6 + i * 0.05 }));
    const vs = new THREE.Group(); cornerRoof.add(vs);
    for (let i = 0; i < 23; i++) box(0.14, 3.2, 0.14, 0.5 + i * 0.5, 10.55, -0.5, slatM, { parent: vs, edges: false });
    for (let i = 0; i < 16; i++) box(0.14, 3.2, 0.14, 11.5, 10.55, -1.0 - i * 0.55, slatM, { parent: vs, edges: false });
    reg(vs, 1.9);
    const lv = new THREE.Group(); cornerRoof.add(lv);
    for (let i = 0; i < 16; i++) box(11.6, 0.07, 0.26, 6, 12.15, -3.2 - i * 0.4, white, { parent: lv, edges: false });
    reg(lv, 2.1);
    const can = B(14, 0.2, 4.2, 5.5, 12.3, -0.2, white, 2.2, { parent: cornerRoof }); can.rotation.z = 0.04;
    B(3.4, 2.4, 3.4, 8.5, 8.95, -17.5, stucco, 2.3, { parent: cornerRoof }); B(2.6, 2.0, 2.6, 3.5, 8.95, -14, stucco, 2.35, { parent: cornerRoof });

    /* palms in white planters, and a parked car */
    const palm = (x, z, dl) => {
      const g = new THREE.Group(); g.position.set(x, G, z);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.75, 0.95, 24), pot); p.position.y = 0.48; p.castShadow = true;
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.9, 8), trunkM); t.position.y = 1.7; g.add(p, t);
      for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.5, 6), leaf); const a = i / 6 * 6.283; f.position.set(Math.cos(a) * 0.55, 2.65, Math.sin(a) * 0.55); f.rotation.set(Math.sin(a) * 1.15, 0, -Math.cos(a) * 1.15); f.castShadow = true; g.add(f); }
      L.add(g); reg(g, dl, 'scale');
    };
    palm(-5.6, 2.0, 2.5); palm(-3.9, 2.0, 2.55); palm(-14.2, 2.0, 2.6);
    const car = new THREE.Group(); car.position.set(19, G + 0.35, -11.5);
    const cb = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.75, 1.9), carBody); cb.position.y = 0.45; cb.castShadow = true;
    const cc = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.65), glassMat); cc.position.set(-0.2, 1.1, 0);
    car.add(cb, cc);
    [[-1.5, 0.95], [1.5, 0.95], [-1.5, -0.95], [1.5, -0.95]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), tire); w.rotation.x = Math.PI / 2; w.position.set(x, 0.1, z); car.add(w); });
    L.add(car); reg(car, 2.9);

    L.updateMatrixWorld(true);
    lampA.position.copy(L.localToWorld(new THREE.Vector3(-9, 3, 3.5)));
    lampB.position.copy(L.localToWorld(new THREE.Vector3(4, 3, 3.5)));
    trees.forEach(t => { t.visible = false; });
    house.visible = false; useModel = true; modelDone = true;
  }

  const BUILDING = 'corner';   // 'corner' = client's corner retail building, anything else = Luna house model
  if (BUILDING === 'corner') { buildCorner(); } else {
    const glLoader = new GLTFLoader();
    if (window.__HOUSE_B64) {   // embedded copy (used when .glb files can't be served)
      try {
        const bin = atob(window.__HOUSE_B64), buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        glLoader.parse(buf.buffer, '', onModel, onModelErr);
      } catch (e) { onModelErr(e); }
    } else glLoader.load('assets/house.glb', onModel, undefined, onModelErr);
  }

  /* --- resize --- */
  let W = 0, H = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = W / H < 0.8 ? 52 : 36;
  }
  addEventListener('resize', resize); resize();

  /* --- scroll -> scene fraction --- */
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / W - 0.5; mouse.y = e.clientY / H - 0.5; });
  function sceneFrac() {
    const mid = innerHeight / 2;
    const cs = panels.map(p => { const r = p.getBoundingClientRect(); return r.top + r.height / 2; });
    if (mid <= cs[0]) return 0;
    for (let i = 0; i < cs.length - 1; i++) {
      if (mid <= cs[i + 1]) return i + (mid - cs[i]) / (cs[i + 1] - cs[i]);
    }
    return cs.length - 1;
  }

  /* --- loop --- */
  const tmpPos = new THREE.Vector3(), tmpTgt = new THREE.Vector3(), look = new THREE.Vector3();
  let fTarget = 0, fCur = 0, started = false, t0 = 0, introStart = null;
  const INTRO_END = 5.2;
  const clock = new THREE.Clock();
  let hudT = 0;
  const camOffset = new THREE.Vector3();

  function tick(time) {
    requestAnimationFrame(tick);
    if (lenis) lenis.raf(time);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    fTarget = sceneFrac();
    fCur += (fTarget - fCur) * (1 - Math.pow(0.0009, dt));   // damped, frame-rate independent
    const i = Math.min(Math.floor(fCur), SCENES.length - 2);
    const k = smooth(clamp(fCur - i));
    const S = mixScene(SCENES[i], SCENES[i + 1], k);
    /* night mode blends into whatever scene is showing */
    nightK += (night - nightK) * (1 - Math.pow(0.02, dt));
    if (nightK > 0.002) {
      const n = nightK;
      S.bg.lerp(NIGHT_BG, n * 0.92); S.sky.lerp(NIGHT_SKY, n); S.ground.lerp(NIGHT_GR, n * 0.85);
      S.sun.lerp(NIGHT_SUN, n); S.sunI = lerp(S.sunI, 0.55, n); S.hemi = lerp(S.hemi, 0.3, n);
      S.glow = Math.max(S.glow, n); S.edge.lerp(NIGHT_EDGE, n * (S.dark > 0.5 ? 0 : 0.9));
      S.fog = lerp(S.fog, 0.013, n); S.dark = Math.max(S.dark, n);
    }
    const theme = S.dark > 0.5 ? 'dark' : 'light';
    if (document.body.dataset.theme !== theme) document.body.dataset.theme = theme;
    if (!dragging && performance.now() - lastInput > 4500) yawT *= 1 - Math.min(1, dt * 0.8);
    yaw += (yawT - yaw) * (1 - Math.pow(0.001, dt));
    setActive(clamp(Math.round(fTarget), 0, SCENES.length - 1));

    /* intro assembly */
    let it = 0;
    if (introStart !== null) it = (performance.now() - introStart) / 1000;
    const introK = reduceMotion ? 1 : clamp(it / INTRO_END);
    intro.forEach(({ obj, delay, mode }) => {
      const p = reduceMotion ? 1 : clamp((it - delay) / 1.5);
      if (p <= 0) { obj.scale.setScalar(0.0001); return; }
      const e = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);          // smooth, soft landing
      if (mode === 'scale') { obj.scale.copy(obj.userData.baseScale).multiplyScalar(Math.max(e, 0.0001)); }
      else {
        obj.scale.copy(obj.userData.baseScale);
        obj.position.y = obj.userData.base.y + (1 - e) * (obj.userData.off || 20);
        obj.rotation.y = (1 - e) * (obj.userData.rot || 0);
      }
    });

    /* lights / env */
    scene.background.copy(S.bg); scene.fog.color.copy(S.bg); scene.fog.density = S.fog;
    groundMat.color.copy(S.ground);
    hemi.intensity = S.hemi; sun.color.copy(S.sun); sun.intensity = S.sunI;
    sun.position.set(S.sunPos[0], S.sunPos[1], S.sunPos[2]);
    grid.material.color.copy(S.edge); grid.material.opacity = S.grid;
    edgeMat.color.copy(S.edge); edgeMat.opacity = S.dark ? 0.7 : 0.5;
    pMat.color.copy(S.edge).lerp(new THREE.Color('#ffffff'), 0.5); pMat.opacity = 0.25 + S.dark * 0.35;

    /* layers */
    shellMats.forEach(m => { m.opacity = S.shell; m.depthWrite = S.shell > 0.7; });
    shellMeshes.forEach(m => { m.castShadow = S.shell > 0.5; });
    glassMat.opacity = 0.08 + 0.34 * S.shell; glassMat.emissiveIntensity = S.glow * 0.95;
    roofMat.opacity = S.roof; roofMat.depthWrite = S.roof > 0.7;
    roofMesh.visible = S.roof > 0.02; roofMesh.castShadow = S.roof > 0.5;
    fascia.visible = S.roof > 0.02;
    frameMat.opacity = S.frame; frame.visible = !useModel && S.frame > 0.02;
    mepMats.forEach(m => { m.opacity = S.mep; }); mep.visible = !useModel && S.mep > 0.02;
    glassList.forEach(m => { m.emissiveIntensity = S.glow * 0.9; });
    if (cornerRoof) cornerRoof.visible = S.roof > 0.03;
    lawnMat.color.copy(LAWN_DAY).lerp(LAWN_DARK, clamp(S.dark));
    roofParts.forEach(m => { m.material.opacity = S.roof; m.visible = S.roof > 0.03; });
    dimLineMat.opacity = S.dims; dimSprites.forEach(m => { m.opacity = S.dims; }); dims.visible = S.dims > 0.02;

    /* camera */
    mouse.sx += (mouse.x - mouse.sx) * 0.04; mouse.sy += (mouse.y - mouse.sy) * 0.04;
    const zoom = W / H < 1 ? 1.8 : 1;
    tmpTgt.set(...S.tgt);
    camOffset.set(S.pos[0] - S.tgt[0], S.pos[1] - S.tgt[1], S.pos[2] - S.tgt[2]).multiplyScalar(zoom * (1 + (1 - easeOut(introK)) * 0.55));
    const ang = reduceMotion ? 0 : Math.sin(t * 0.22) * 0.05 + mouse.sx * 0.16;
    const angTotal = ang + yaw;
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angTotal);
    camOffset.y += -mouse.sy * 1.6;
    camera.position.copy(tmpTgt).add(camOffset);
    camera.lookAt(tmpTgt);
    const shift = W > 980 ? S.shift : 0;
    camera.setViewOffset(W, H, -W * 0.15 * shift, W <= 980 ? H * 0.2 : 0, W, H);
    sun.target.position.set(0, 0, 0);

    /* particles */
    for (let n = 0; n < N; n++) {
      let y = pArr[n * 3 + 1] + pSpd[n] * dt; if (y > 22) y = 0; pArr[n * 3 + 1] = y;
      pArr[n * 3] += Math.sin(t * 0.3 + n) * 0.004;
    }
    pGeo.attributes.position.needsUpdate = true;

    /* sky, stars, window lights, pool ripples, scroll bar */
    skyMat.uniforms.top.value.copy(S.sky); skyMat.uniforms.bot.value.copy(S.bg);
    starMat.opacity = clamp(Math.max(nightK, S.glow * 0.85));
    lampA.intensity = S.glow * 45; lampB.intensity = S.glow * 45;
    for (let n = 0; n < waterPos.count; n++) {
      const x = waterPos.getX(n), z = waterPos.getZ(n);
      waterPos.setY(n, Math.sin(x * 1.3 + t * 1.6) * 0.05 + Math.sin(z * 2.1 + t * 1.2) * 0.04);
    }
    waterPos.needsUpdate = true; waterGeo.computeVertexNormals();
    if (progBar) progBar.style.transform = `scaleX(${clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;

    renderer.render(scene, camera);

    hudT += dt;
    if (hudT > 0.1) {
      hudT = 0;
      const p = camera.position;
      $('#hudCoord').innerHTML = `X ${p.x.toFixed(1)} &nbsp; Y ${p.y.toFixed(1)} &nbsp; Z ${p.z.toFixed(1)}`;
    }
  }

  /* kick off: fake progress while shaders compile, then reveal */
  let prog = 0;
  renderer.compile(scene, camera);
  const iv = setInterval(() => {
    prog = Math.min(modelDone ? 100 : 96, prog + 5 + Math.random() * 9);
    ldBar.style.width = prog + '%'; ldPct.textContent = Math.floor(prog) + '%';
    if (prog >= 100 && modelDone) {
      clearInterval(iv);
      setTimeout(() => { finishBoot(); introStart = performance.now(); }, 350);
    }
  }, 90);
  requestAnimationFrame(tick);
  window.__bnb = { scene, camera, renderer }; // debug handle
}

/* wait for deferred Lenis script + fonts */
window.addEventListener('load', () => boot());
