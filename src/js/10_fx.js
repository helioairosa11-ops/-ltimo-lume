// ===================== EFEITOS =====================
const FX = { list: [], dmg: [] };
function flameTex() {
  if (SPR.flame) return SPR.flame;
  const c = _mkCanvas(64), x = c.getContext('2d');
  const g = x.createRadialGradient(32, 46, 2, 32, 40, 30); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.25, 'rgba(255,170,60,.95)'); g.addColorStop(.6, 'rgba(230,80,20,.5)'); g.addColorStop(1, 'rgba(120,20,0,0)');
  x.fillStyle = g; x.beginPath(); x.moveTo(32, 2); x.bezierCurveTo(52, 26, 58, 44, 32, 62); x.bezierCurveTo(6, 44, 12, 26, 32, 2); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; SPR.flame = t; return t;
}
function fxUpdate(dt, t) {
  for (let i = FX.list.length - 1; i >= 0; i--) { const f = FX.list[i]; if (f.update(dt, t) === false) { FX.list.splice(i, 1); if (f.obj) { f.obj.parent && f.obj.parent.remove(f.obj); if (f.dispose) f.dispose(); } } }
}
function fxClear() { for (const f of FX.list) if (f.obj && f.obj.parent) f.obj.parent.remove(f.obj); FX.list.length = 0; }
// chama (sprites) — persistente
function flame(parent, x, y, z, s = 1, color = 0xffffff) {
  const grp = new THREE.Group(); grp.position.set(x, y, z);
  const mats = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.SpriteMaterial({ map: flameTex(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true, opacity: i === 0 ? 1 : .6 });
    const sp = new THREE.Sprite(m); sp.scale.set(.5 * s, .8 * s, 1); sp.position.y = .3 * s; grp.add(sp); mats.push(m);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTex('glow'), color: 0xff7a2a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .35, fog: true }));
  glow.scale.set(2.2 * s, 2.2 * s, 1); glow.position.y = .25 * s; grp.add(glow);
  parent.add(grp);
  const ph = Math.random() * 10, o = { obj: grp, on: true, s };
  o.update = (dt, t) => {
    grp.visible = o.on; if (!o.on) return;
    for (let i = 0; i < 3; i++) { const sp = grp.children[i]; const f = Math.sin(t * (9 + i * 3) + ph + i) * .5 + Math.sin(t * (17 + i * 5) + ph * 2) * .5; sp.scale.set((.45 + i * .08 + f * .05) * o.s, (.75 - i * .1 + f * .12) * o.s, 1); sp.position.x = Math.sin(t * 3 + i * 2 + ph) * .03 * o.s; }
    glow.material.opacity = .3 + Math.sin(t * 11 + ph) * .05;
  };
  FX.list.push(o); return o;
}
// brilho simples (sprite aditivo)
function glowSprite(parent, x, y, z, size, color, opacity = .6) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTex('glow'), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity, fog: true }));
  sp.position.set(x, y, z); sp.scale.set(size, size, 1); parent.add(sp); return sp;
}
// anel que se expande no chão
function ringFx(x, y, z, r0, r1, dur, color = 0xffa050, opacity = .9, tex = 'ring') {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: spriteTex(tex), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = -HPI; m.position.set(x, y + .06, z); R.scene.add(m);
  let t = 0; const o = { obj: m, dispose: () => { m.geometry.dispose(); m.material.dispose(); } };
  o.update = dt => { t += dt; const k = Math.min(1, t / dur); const r = lerp(r0, r1, easeOut(k)); m.scale.set(r, r, 1); m.material.opacity = opacity * (1 - k); return k < 1; };
  FX.list.push(o); return o;
}
// marcador de área (aviso) que cresce até explodir
function telegraph(x, y, z, r, dur, color = 0xff5020, tex = 'rune') {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: spriteTex(tex), color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = -HPI; m.position.set(x, y + .05, z); m.scale.set(r, r, 1); R.scene.add(m);
  let t = 0; const o = { obj: m, dispose: () => { m.geometry.dispose(); m.material.dispose(); } };
  o.update = dt => { t += dt; const k = t / dur; m.material.opacity = Math.min(.85, k * 1.4) * (k > 1 ? Math.max(0, 1 - (k - 1) * 6) : 1); m.rotation.z += dt * .8; return k < 1.17; };
  FX.list.push(o); return o;
}
// coluna de luz/fogo
function pillarFx(x, y, z, r, h, dur, color = 0xffb060) {
  const g = new THREE.CylinderGeometry(r, r * 1.1, h, 16, 1, true); g.translate(0, h / 2, 0);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, map: spriteTex('soft') }));
  m.position.set(x, y, z); R.scene.add(m); let t = 0;
  const o = { obj: m, dispose: () => { g.dispose(); m.material.dispose(); } };
  o.update = dt => { t += dt; const k = t / dur; m.material.opacity = .8 * (1 - k); m.scale.set(1 + k * .4, 1, 1 + k * .4); return k < 1; };
  FX.list.push(o); return o;
}
// flash de luz
function flashLight(x, y, z, color, int, range, dur) {
  const L = addLight(x, y, z, color, int, range, 0); let t = 0;
  FX.list.push({ update: dt => { t += dt; L.int = int * Math.max(0, 1 - t / dur); if (t >= dur) { removeLight(L); return false; } } });
}
// rasto da arma
class Trail {
  constructor(color = 0xfff0d0, n = 10, opacity = .55) {
    this.n = n; this.base = []; this.tip = []; this.alive = false;
    const g = new THREE.BufferGeometry(); this.pos = new Float32Array(n * 2 * 3); this.al = new Float32Array(n * 2);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('alpha', new THREE.BufferAttribute(this.al, 1));
    const idx = []; for (let i = 0; i < n - 1; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); } g.setIndex(idx);
    this.mat = new THREE.ShaderMaterial({ uniforms: { c: { value: new COL(color) }, o: { value: opacity } }, vertexShader: 'attribute float alpha; varying float va; void main(){ va=alpha; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'uniform vec3 c; uniform float o; varying float va; void main(){ gl_FragColor=vec4(c, va*o);}', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.visible = false; R.scene.add(this.mesh); this.g = g;
  }
  setColor(c) { this.mat.uniforms.c.value.set(c); }
  push(b, t) { this.base.unshift(b.clone()); this.tip.unshift(t.clone()); if (this.base.length > this.n) { this.base.pop(); this.tip.pop(); } this.alive = true; }
  fade() { if (!this.base.length) { this.mesh.visible = false; return; } this.base.pop(); this.tip.pop(); }
  update() {
    const k = this.base.length; this.mesh.visible = k > 1; if (k < 2) return;
    for (let i = 0; i < this.n; i++) {
      const j = Math.min(i, k - 1), b = this.base[j], t = this.tip[j];
      this.pos[i * 6] = b.x; this.pos[i * 6 + 1] = b.y; this.pos[i * 6 + 2] = b.z; this.pos[i * 6 + 3] = t.x; this.pos[i * 6 + 4] = t.y; this.pos[i * 6 + 5] = t.z;
      const a = i < k ? (1 - i / k) : 0; this.al[i * 2] = a * .15; this.al[i * 2 + 1] = a;
    }
    this.g.attributes.position.needsUpdate = true; this.g.attributes.alpha.needsUpdate = true;
  }
  dispose() { R.scene.remove(this.mesh); this.g.dispose(); this.mat.dispose(); }
}
// números de dano
function dmgNumber(x, y, z, n, kind) {
  if (!SET.dmgNumbers) return;
  const el = document.createElement('div'); el.className = 'dnum' + (kind ? ' ' + kind : ''); el.textContent = n; $('#dnums').appendChild(el);
  FX.dmg.push({ el, x, y, z, t: 0, vx: rnd(-.4, .4) });
}
function updDmgNumbers(dt) {
  const cam = R.camera;
  for (let i = FX.dmg.length - 1; i >= 0; i--) {
    const d = FX.dmg[i]; d.t += dt; if (d.t > 1.1) { d.el.remove(); FX.dmg.splice(i, 1); continue; }
    _v1.set(d.x + d.vx * d.t, d.y + d.t * .8, d.z).project(cam);
    if (_v1.z > 1) { d.el.style.opacity = 0; continue; }
    d.el.style.transform = `translate(${(_v1.x * .5 + .5) * R.w}px,${(-_v1.y * .5 + .5) * R.h}px) translate(-50%,-50%)`;
    d.el.style.opacity = d.t < .8 ? 1 : 1 - (d.t - .8) / .3;
  }
}
// tremor de câmera
const SHAKE = { v: 0 };
function shake(v) { SHAKE.v = Math.max(SHAKE.v, v); }
