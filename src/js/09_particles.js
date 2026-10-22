// ===================== PARTÍCULAS =====================
const PVS = `
attribute float size; attribute vec4 pcol;
varying vec4 vC; varying float vFog;
uniform float uScale; uniform float uFogD;
void main(){ vC = pcol; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * uScale / max(0.1,-mv.z); gl_Position = projectionMatrix * mv;
  float d = -mv.z; vFog = 1.0 - exp(-uFogD*uFogD*d*d); }`;
const PFS = `
uniform sampler2D map; uniform vec3 uFogC; uniform float uAdd;
varying vec4 vC; varying float vFog;
void main(){ vec4 t = texture2D(map, gl_PointCoord); float a = t.a * vC.a; if(a<0.003) discard;
  vec3 c = vC.rgb * t.rgb;
  if(uAdd>0.5){ gl_FragColor = vec4(c*(1.0-vFog), a); } else { gl_FragColor = vec4(mix(c,uFogC,vFog), a); } }`;
class PSys {
  constructor(cap, additive, tex = 'glow') {
    this.cap = cap; this.n = 0; this.add = additive;
    this.p = new Float32Array(cap * 3); this.v = new Float32Array(cap * 3); this.c = new Float32Array(cap * 4); this.s = new Float32Array(cap);
    this.life = new Float32Array(cap); this.max = new Float32Array(cap); this.s0 = new Float32Array(cap); this.s1 = new Float32Array(cap); this.a0 = new Float32Array(cap);
    this.drag = new Float32Array(cap); this.grav = new Float32Array(cap);
    const g = new THREE.BufferGeometry();
    this.ap = new THREE.BufferAttribute(this.p, 3); this.ap.setUsage(THREE.DynamicDrawUsage);
    this.ac = new THREE.BufferAttribute(this.c, 4); this.ac.setUsage(THREE.DynamicDrawUsage);
    this.as = new THREE.BufferAttribute(this.s, 1); this.as.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.ap); g.setAttribute('pcol', this.ac); g.setAttribute('size', this.as);
    g.boundingSphere = new THREE.Sphere(new V3(), 1e5);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: spriteTex(tex) }, uScale: { value: 300 }, uFogD: { value: .03 }, uFogC: { value: new COL(0) }, uAdd: { value: additive ? 1 : 0 } },
      vertexShader: PVS, fragmentShader: PFS, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = additive ? 10 : 9;
    g.setDrawRange(0, 0);
  }
  emit(x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, drag = 1.5, grav = 0) {
    if (this.n >= this.cap) return;
    const i = this.n++, i3 = i * 3, i4 = i * 4;
    this.p[i3] = x; this.p[i3 + 1] = y; this.p[i3 + 2] = z; this.v[i3] = vx; this.v[i3 + 1] = vy; this.v[i3 + 2] = vz;
    this.life[i] = life; this.max[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.c[i4] = r; this.c[i4 + 1] = g; this.c[i4 + 2] = b; this.a0[i] = a; this.c[i4 + 3] = a; this.s[i] = s0; this.drag[i] = drag; this.grav[i] = grav;
  }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { // troca com o último
        const j = --this.n; if (i !== j) {
          this.p.copyWithin(i * 3, j * 3, j * 3 + 3); this.v.copyWithin(i * 3, j * 3, j * 3 + 3); this.c.copyWithin(i * 4, j * 4, j * 4 + 4);
          this.life[i] = this.life[j]; this.max[i] = this.max[j]; this.s0[i] = this.s0[j]; this.s1[i] = this.s1[j]; this.a0[i] = this.a0[j]; this.drag[i] = this.drag[j]; this.grav[i] = this.grav[j]; this.s[i] = this.s[j];
        }
        continue;
      }
      const i3 = i * 3, k = Math.exp(-this.drag[i] * dt);
      this.v[i3] *= k; this.v[i3 + 1] = this.v[i3 + 1] * k - this.grav[i] * dt; this.v[i3 + 2] *= k;
      this.p[i3] += this.v[i3] * dt; this.p[i3 + 1] += this.v[i3 + 1] * dt; this.p[i3 + 2] += this.v[i3 + 2] * dt;
      const t = 1 - this.life[i] / this.max[i];
      this.s[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * t;
      const fade = t < .12 ? t / .12 : 1 - (t - .12) / .88;
      this.c[i * 4 + 3] = this.a0[i] * fade;
      i++;
    }
    this.ap.needsUpdate = true; this.ac.needsUpdate = true; this.as.needsUpdate = true;
    this.pts.geometry.setDrawRange(0, this.n);
    const u = this.mat.uniforms; u.uScale.value = R.h * R.renderer.getPixelRatio() * 0.6; u.uFogD.value = R.scene.fog.density; u.uFogC.value.copy(R.scene.fog.color);
  }
  clear() { this.n = 0; }
}
const PFX = { glow: null, dust: null, emitters: [] };
function initParticles() {
  const q = Q().particles;
  PFX.glow = new PSys(Math.round(2600 * q) + 200, true, 'glow');
  PFX.dust = new PSys(Math.round(1600 * q) + 200, false, 'soft');
  R.scene.add(PFX.glow.pts); R.scene.add(PFX.dust.pts);
}
const _cc = new COL();
// rajada de partículas
function burst(x, y, z, n, o = {}) {
  const sys = o.add === false ? PFX.dust : PFX.glow; n = Math.max(1, Math.round(n * Q().particles));
  _cc.set(o.color ?? 0xffa040);
  const c2 = o.color2 !== undefined ? new COL(o.color2) : null;
  for (let i = 0; i < n; i++) {
    let dx, dy, dz;
    if (o.dir) { dx = o.dir[0] + rnd(-1, 1) * (o.spread ?? .5); dy = o.dir[1] + rnd(-1, 1) * (o.spread ?? .5); dz = o.dir[2] + rnd(-1, 1) * (o.spread ?? .5); }
    else { const th = rnd(0, TAU), ph = Math.acos(rnd(-1, 1)); dx = Math.sin(ph) * Math.cos(th); dy = Math.cos(ph) * (o.flat ? .2 : 1) + (o.upBias || 0); dz = Math.sin(ph) * Math.sin(th); }
    const sp = rnd(o.smin ?? 1, o.smax ?? 4), j = o.jit || 0;
    let r = _cc.r, g = _cc.g, b = _cc.b; if (c2) { const t = Math.random(); r = lerp(r, c2.r, t); g = lerp(g, c2.g, t); b = lerp(b, c2.b, t); }
    sys.emit(x + rnd(-j, j), y + rnd(-j, j) * (o.jy ?? 1), z + rnd(-j, j), dx * sp, dy * sp, dz * sp, rnd(o.lmin ?? .3, o.lmax ?? .8), rnd(o.szmin ?? .08, o.szmax ?? .2), o.sz1 ?? (o.szmax ?? .2) * .3, r, g, b, o.alpha ?? 1, o.drag ?? 2, o.grav ?? 0);
  }
}
// emissor contínuo (fogueira, tocha, lava)
function addEmitter(e) { e.acc = 0; PFX.emitters.push(e); return e; }
function clearEmitters() { PFX.emitters.length = 0; PFX.glow && PFX.glow.clear(); PFX.dust && PFX.dust.clear(); }
function updParticles(dt, cx, cz) {
  const q = Q().particles;
  for (const e of PFX.emitters) {
    if (e.off) continue;
    if (Math.abs(e.x - cx) > 60 || Math.abs(e.z - cz) > 60) continue;
    e.acc += dt * e.rate * q;
    while (e.acc >= 1) { e.acc--; e.fn(e); }
  }
  PFX.glow.update(dt); PFX.dust.update(dt);
}
// presets
const EMIT = {
  fire(x, y, z, scale = 1) { return addEmitter({ x, y, z, rate: 26 * scale, fn: e => PFX.glow.emit(e.x + rnd(-.18, .18) * scale, e.y + rnd(0, .2), e.z + rnd(-.18, .18) * scale, rnd(-.2, .2), rnd(.6, 1.8) * scale, rnd(-.2, .2), rnd(.5, 1.3), rnd(.1, .2) * scale, .02, 1, rnd(.35, .6), .15, .9, .8, -0.5) }); },
  torch(x, y, z) { return addEmitter({ x, y, z, rate: 9, fn: e => PFX.glow.emit(e.x + rnd(-.05, .05), e.y + .1, e.z + rnd(-.05, .05), rnd(-.1, .1), rnd(.5, 1.2), rnd(-.1, .1), rnd(.4, .9), rnd(.05, .09), .01, 1, rnd(.4, .6), .15, .9, .6, -0.3) }); },
  candle(x, y, z) { return addEmitter({ x, y, z, rate: 2, fn: e => PFX.glow.emit(e.x, e.y, e.z, rnd(-.03, .03), rnd(.2, .5), rnd(-.03, .03), rnd(.3, .7), .04, .01, 1, .6, .25, .7, .3, 0) }); },
  lava(x, y, z, w, d) { return addEmitter({ x, y, z, rate: 10, fn: e => PFX.glow.emit(e.x + rnd(-w, w), e.y + .1, e.z + rnd(-d, d), rnd(-.2, .2), rnd(.5, 2), rnd(-.2, .2), rnd(.8, 2), rnd(.06, .12), .02, 1, rnd(.3, .5), .1, 1, .6, -0.2) }); },
  wisp(x, y, z, color = 0x9fc2ff) { const c = new COL(color); return addEmitter({ x, y, z, rate: 6, fn: e => PFX.glow.emit(e.x + rnd(-.1, .1), e.y + rnd(-.1, .1), e.z + rnd(-.1, .1), rnd(-.2, .2), rnd(0, .4), rnd(-.2, .2), rnd(.5, 1), rnd(.06, .12), .01, c.r, c.g, c.b, .8, 1, 0) }); },
};
// clima em volta da câmera: cinza caindo, chuva, vaga-lumes
const WEATHER = { kind: null, acc: 0 };
function setWeather(kind) { WEATHER.kind = kind; }
function updWeather(dt, cx, cy, cz) {
  const k = WEATHER.kind; if (!k) return; const q = Q().particles;
  if (k === 'ash' || k === 'embers' || k === 'snowash') {
    WEATHER.acc += dt * 40 * q;
    while (WEATHER.acc >= 1) { WEATHER.acc--; const x = cx + rnd(-18, 18), z = cz + rnd(-18, 18), y = cy + rnd(4, 10);
      if (k === 'embers' && Math.random() < .4) PFX.glow.emit(x, y - 6, z, rnd(-.3, .3), rnd(.3, 1), rnd(-.3, .3), rnd(3, 6), rnd(.04, .08), .02, 1, .5, .2, .8, .3, 0);
      else PFX.dust.emit(x, y, z, rnd(-.4, .2), rnd(-.9, -.4), rnd(-.3, .3), rnd(6, 10), rnd(.05, .09), .05, .55, .53, .5, .65, .1, 0); }
  } else if (k === 'rain') {
    WEATHER.acc += dt * 160 * q;
    while (WEATHER.acc >= 1) { WEATHER.acc--; const x = cx + rnd(-14, 14), z = cz + rnd(-14, 14), y = cy + rnd(3, 9); PFX.dust.emit(x, y, z, -1, -16, .5, .7, .035, .035, .6, .65, .75, .35, 0, 0); }
  } else if (k === 'fireflies') {
    WEATHER.acc += dt * 6 * q;
    while (WEATHER.acc >= 1) { WEATHER.acc--; PFX.glow.emit(cx + rnd(-14, 14), cy + rnd(-.5, 2.5), cz + rnd(-14, 14), rnd(-.3, .3), rnd(-.1, .2), rnd(-.3, .3), rnd(3, 6), .07, .07, .75, .95, .4, .9, .3, 0); }
  } else if (k === 'motes') {
    WEATHER.acc += dt * 14 * q;
    while (WEATHER.acc >= 1) { WEATHER.acc--; PFX.dust.emit(cx + rnd(-12, 12), cy + rnd(0, 6), cz + rnd(-12, 12), rnd(-.1, .1), rnd(-.05, .08), rnd(-.1, .1), rnd(4, 8), .035, .035, .85, .8, .7, .5, .2, 0); }
  }
}
