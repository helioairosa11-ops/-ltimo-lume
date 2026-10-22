// ===================== RENDERIZAÇÃO =====================
const R = { renderer: null, scene: null, camera: null, composer: null, bloom: null, w: 1, h: 1, hemi: null, moon: null, pool: [], envT: null };
const LIGHTS = []; // fontes de luz do mundo: {x,y,z,color:Color,int,range,flick,ph,on}

function initRenderer() {
  const q = Q();
  const canvas = $('#cv');
  const r = new THREE.WebGLRenderer({ canvas, antialias: q.aa, powerPreference: 'high-performance', stencil: false });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = q.shadows;
  r.shadowMap.type = SET.quality === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  R.renderer = r;
  const scene = new THREE.Scene();
  scene.background = new COL(0x050405);
  scene.fog = new THREE.FogExp2(0x050405, 0.03);
  R.scene = scene;
  R.camera = new THREE.PerspectiveCamera(62, 1, 0.08, 400);
  R.hemi = new THREE.HemisphereLight(0x6a6f88, 0x1a1410, 0.35);
  scene.add(R.hemi);
  const moon = new THREE.DirectionalLight(0x9aa6d8, 0.6);
  moon.castShadow = q.shadows;
  moon.shadow.mapSize.set(q.shadowSize, q.shadowSize);
  const sc = moon.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 120;
  moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.04;
  scene.add(moon); scene.add(moon.target);
  R.moon = moon; R.moonDir = new V3(-0.4, 1, 0.3).normalize();
  R.pool = [];
  for (let i = 0; i < q.lights; i++) {
    const l = new THREE.PointLight(0xff8833, 0, 12, 1.6);
    l.castShadow = false; scene.add(l); R.pool.push(l);
  }
  if (q.bloom) {
    const comp = new EffectComposer(r);
    comp.addPass(new RenderPass(scene, R.camera));
    R.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.82);
    comp.addPass(R.bloom);
    comp.addPass(new OutputPass());
    R.composer = comp;
  }
  resizeRenderer();
  addEventListener('resize', resizeRenderer);
  addEventListener('orientationchange', () => setTimeout(resizeRenderer, 200));
}
function resizeRenderer() {
  const w = innerWidth || 800, h = innerHeight || 450;
  R.w = w; R.h = h;
  const dpr = Math.min(window.devicePixelRatio || 1, Q().dpr);
  R.renderer.setPixelRatio(dpr);
  R.renderer.setSize(w, h, false);
  R.camera.aspect = w / h;
  R.camera.fov = w < h ? 72 : 62;
  R.camera.updateProjectionMatrix();
  if (R.composer) { R.composer.setPixelRatio(dpr); R.composer.setSize(w, h); R.bloom.resolution.set(w * dpr / 2, h * dpr / 2); }
}
// Ambiente (por área)
const ENV_DEFAULT = { fog: 0x060507, fogD: 0.035, bg: 0x050405, sky: 0x5a6078, ground: 0x15110e, hemi: 0.35, moonC: 0x8d9ad0, moonI: 0.55, moonDir: [-0.4, 1, 0.3], exposure: 1.0, bloomStr: 0.55, bloomTh: 0.82 };
function setEnv(e) {
  e = Object.assign({}, ENV_DEFAULT, e || {});
  R.env = e;
  R.scene.fog.color.set(e.fog); R.scene.fog.density = e.fogD;
  R.scene.background = new COL(e.bg);
  R.hemi.color.set(e.sky); R.hemi.groundColor.set(e.ground); R.hemi.intensity = e.hemi * 1.25 + .08;
  R.moon.color.set(e.moonC); R.moon.intensity = e.moonI;
  R.moonDir.set(e.moonDir[0], e.moonDir[1], e.moonDir[2]).normalize();
  R.renderer.toneMappingExposure = e.exposure * 1.22;
  if (R.bloom) { R.bloom.strength = e.bloomStr; R.bloom.threshold = e.bloomTh; }
}
// Luzes do mundo
function addLight(x, y, z, color, int, range, flick = 0.15) {
  const L = { x, y, z, color: new COL(color), int, range, flick, ph: Math.random() * 100, on: true, boost: 0 };
  LIGHTS.push(L); return L;
}
function removeLight(L) { const i = LIGHTS.indexOf(L); if (i >= 0) LIGHTS.splice(i, 1); }
function clearLights() { LIGHTS.length = 0; }
const _lsort = [];
let LIGHT_MUL = 2.8;
function updateLightPool(cx, cy, cz, t) {
  _lsort.length = 0;
  for (const L of LIGHTS) {
    if (!L.on) continue;
    const d = Math.hypot(L.x - cx, L.y - cy, L.z - cz);
    if (d > L.range + 38) continue;
    _lsort.push([L.pri ? -1e3 + d : d / Math.sqrt(Math.max(.05, L.int + L.boost)) - L.range * 0.25, L]);
  }
  _lsort.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < R.pool.length; i++) {
    const p = R.pool[i], e = _lsort[i];
    if (!e) { p.intensity = 0; continue; }
    const L = e[1];
    const f = L.flick ? (1 - L.flick * 0.5 + L.flick * 0.5 * (Math.sin(t * 13.1 + L.ph) * .5 + Math.sin(t * 7.7 + L.ph * 2) * .5)) : 1;
    p.position.set(L.x, L.y, L.z); p.color.copy(L.color); p.intensity = (L.int + L.boost) * f * LIGHT_MUL; p.distance = L.range * 1.15;
  }
}
function updateShadowCam(px, py, pz) {
  const m = R.moon;
  const snap = 44 / Q().shadowSize;
  const x = Math.round(px / snap) * snap, z = Math.round(pz / snap) * snap;
  m.target.position.set(x, py, z);
  m.position.set(x + R.moonDir.x * 50, py + R.moonDir.y * 50, z + R.moonDir.z * 50);
}
function renderFrame() {
  if (R.composer) R.composer.render(); else R.renderer.render(R.scene, R.camera);
}
