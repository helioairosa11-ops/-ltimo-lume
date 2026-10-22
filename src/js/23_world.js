// ===================== MUNDO: ENTIDADES =====================
const WORLD = { group: null, ents: [], spawns: [], bonfires: {}, fogs: {}, bossSpawns: {}, gates: {}, npcs: {}, area: null, triggers: [] };
class Ent {
  constructor(o) { Object.assign(this, o); this.pos = o.pos || new V3(o.x || 0, o.y || 0, o.z || 0); WORLD.ents.push(this); }
  update(dt) { }
  interact() { return null; } // {label, r, act}
}
function entsClear() { WORLD.ents.forEach(e => e.dispose && e.dispose()); WORLD.ents.length = 0; WORLD.spawns.length = 0; WORLD.bonfires = {}; WORLD.fogs = {}; WORLD.bossSpawns = {}; WORLD.gates = {}; WORLD.npcs = {}; WORLD.triggers.length = 0; }
// ---------- fogueira ----------
class Bonfire extends Ent {
  constructor(o) {
    super(o); const g = new THREE.Group(); g.position.copy(this.pos); WORLD.group.add(g); this.g = g;
    const st = MAT('rock'); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; const m = new THREE.Mesh(rockGeo(i % 4), st); m.position.set(Math.cos(a) * .55, .08, Math.sin(a) * .55); m.scale.set(.18, .14, .16); m.rotation.y = a; m.castShadow = true; g.add(m); }
    const ash = new THREE.Mesh(new THREE.CylinderGeometry(.45, .55, .12, 12), MAT('ash')); ash.position.y = .04; g.add(ash);
    const sw = weaponMesh('sword', 1); sw.position.set(0, .05, 0); sw.rotation.set(.12, .4, .1); g.add(sw);
    for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(.06, .015, 4, 8), MAT('iron')); t.position.set(0, .25 + i * .07, 0); t.rotation.x = HPI; sw.add(t); }
    this.fire = flame(g, 0, .08, 0, 1.25); this.light = addLight(this.pos.x, this.pos.y + 1.2, this.pos.z, 0xff8a3a, 4.5, 14, .2); this.light.pri = true;
    this.em = EMIT.fire(this.pos.x, this.pos.y + .2, this.pos.z, .9);
    this.dim = glowSprite(g, 0, .2, 0, .8, 0xff6a2a, .5);
    this.setLit(!!PROG.bonfires[this.id]);
    WORLD.bonfires[this.id] = this;
  }
  setLit(v) { this.lit = v; this.fire.on = v; this.light.int = v ? 4.5 : .6; this.light.range = v ? 14 : 4; this.em.off = !v; this.dim.visible = !v; }
  interact() { if (this.hiddenUntil || GAME.bossActive) return null; return { label: this.lit ? 'Descansar' : 'Acender a fogueira', r: 2.4, act: () => GAME.useBonfire(this) }; }
  hideUntilBoss(id) { this.afterBoss = id; if (PROG.bossDown[id]) return; this.hiddenUntil = true; this.g.visible = false; this.light.int = 0; this.em.off = true; }
  reveal() { this.hiddenUntil = false; this.g.visible = true; this.setLit(this.lit); }
  dispose() { removeLight(this.light); }
}
// ---------- item no chão ----------
class Pickup extends Ent {
  constructor(o) {
    super(o); if (PROG.picked[this.id]) { this.taken = true; return; }
    this.sp = glowSprite(WORLD.group, this.pos.x, this.pos.y + .35, this.pos.z, .9, o.color || 0xfff0d0, .85);
    this.core = glowSprite(WORLD.group, this.pos.x, this.pos.y + .35, this.pos.z, .25, 0xffffff, 1);
    this.L = addLight(this.pos.x, this.pos.y + .6, this.pos.z, o.color || 0xfff0d0, .9, 3, .05);
  }
  update(dt) { if (this.taken) return; const s = .8 + Math.sin(TIME.now * 3 + this.pos.x) * .15; this.sp.scale.set(s, s, 1); if (Math.random() < dt * 4) burst(this.pos.x, this.pos.y + .3, this.pos.z, 1, { color: 0xfff0d0, smin: .1, smax: .3, upBias: 1, lmin: .6, lmax: 1.2, szmin: .03, szmax: .06 }); }
  interact() { if (this.taken) return null; return { label: 'Pegar', r: 1.8, act: () => this.take() }; }
  take() { this.taken = true; PROG.picked[this.id] = 1; WORLD.group.remove(this.sp); WORLD.group.remove(this.core); removeLight(this.L); PLAYER.busy(.8, 'pickup'); after(.35, () => GAME.giveItem(this.item, this.n || 1)); }
  dispose() { if (this.L) removeLight(this.L); }
}
// ---------- baú ----------
class Chest extends Ent {
  constructor(o) {
    super(o); const g = new THREE.Group(); g.position.copy(this.pos); g.rotation.y = this.yaw || 0; WORLD.group.add(g); this.g = g;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, .55, .6), MAT('wood_dark')); body.position.y = .28; body.castShadow = true; g.add(body);
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.04, .08, .64), MAT('iron')); band.position.y = .45; g.add(band);
    this.lid = new THREE.Group(); this.lid.position.set(0, .55, -.3); g.add(this.lid);
    const lm = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 1.0, 10, 1, false, 0, PI), MAT('wood_dark')); lm.rotation.z = HPI; lm.position.z = .3; lm.castShadow = true; this.lid.add(lm);
    addSolidBox(this.pos.x, this.pos.z, .5, .3, this.yaw || 0, this.pos.y, this.pos.y + .6, { walk: true });
    this.open = !!PROG.picked[this.id]; if (this.open) this.lid.rotation.x = -1.9;
  }
  interact() { if (this.open) return null; const p = PLAYER; if (Math.abs(angDiff(this.yaw || 0, yawTo(this.pos.x, this.pos.z, p.pos.x, p.pos.z))) > 1.2) return null; return { label: 'Abrir o baú', r: 1.9, act: () => this.doOpen() }; }
  doOpen() { this.open = true; PROG.picked[this.id] = 1; PLAYER.busy(1, 'push'); sfx('chest', { pos: this.pos, vol: .8 }); let t = 0; FX.list.push({ update: dt => { t += dt; this.lid.rotation.x = -1.9 * easeOut(Math.min(1, t / .6)); return t < .6; } }); after(.6, () => GAME.giveItem(this.item, this.n || 1)); }
}
// ---------- porta (atalho) ----------
class Door extends Ent {
  constructor(o) {
    super(o); const g = new THREE.Group(); g.position.copy(this.pos); g.rotation.y = this.yaw || 0; WORLD.group.add(g); this.g = g;
    const w = this.w || 2.4, h = this.h || 3.4; this.leaves = [];
    for (const s of [-1, 1]) { const hinge = new THREE.Group(); hinge.position.set(s * w / 2, 0, 0); g.add(hinge); const m = new THREE.Mesh(new THREE.BoxGeometry(w / 2 - .02, h, .14), MAT('wood_dark')); m.position.set(-s * w / 4, h / 2, 0); m.castShadow = true; m.receiveShadow = true; hinge.add(m); const bar = new THREE.Mesh(new THREE.BoxGeometry(w / 2, .1, .16), MAT('iron')); bar.position.set(-s * w / 4, h * .3, 0); hinge.add(bar); const bar2 = bar.clone(); bar2.position.y = h * .75; hinge.add(bar2); this.leaves.push(hinge); }
    this.col = addSolidBox(this.pos.x, this.pos.z, w / 2, .12, this.yaw || 0, this.pos.y, this.pos.y + h, { walk: false });
    this.isOpen = !!(PROG.flags['door_' + this.id] || this.startOpen);
    if (this.isOpen) this.setOpen(true, true);
  }
  setOpen(v, instant) {
    this.isOpen = v; this.col.enabled = !v; if (v && this.id) PROG.flags['door_' + this.id] = 1;
    const target = v ? 1.55 : 0; if (instant) { this.leaves[0].rotation.y = -target; this.leaves[1].rotation.y = target; return; }
    let t = 0; FX.list.push({ update: dt => { t += dt; const k = easeInOut(Math.min(1, t / 1.2)); this.leaves[0].rotation.y = -target * k; this.leaves[1].rotation.y = target * k; return t < 1.2; } });
    sfx('door', { pos: this.pos, vol: .8, rate: .7 }); sfx('stone', { pos: this.pos, vol: .4, rate: .8 });
  }
  side(p) { const c = Math.cos(this.yaw || 0), s = Math.sin(this.yaw || 0); const dx = p.pos.x - this.pos.x, dz = p.pos.z - this.pos.z; return dx * s + dz * c; } // >0 = frente (+z local)
  interact() {
    if (this.isOpen) return null; const p = PLAYER; const sd = this.side(p);
    if (this.oneWay && Math.sign(sd) !== this.oneWay) return { label: 'Não abre deste lado', r: 2.2, act: () => { UI.toast('Está trancada pelo outro lado.'); synth('ui'); } };
    if (this.key && !PROG.keys[this.key]) return { label: 'Trancada', r: 2.2, act: () => { UI.toast('Precisas de: ' + (ITEMS[this.key] ? ITEMS[this.key].name : 'uma chave') + '.'); synth('ui'); } };
    if (this.need && !this.need()) return { label: 'Selada', r: 2.2, act: () => { UI.toast(this.needMsg || 'Uma força antiga sela esta porta.'); synth('ui'); } };
    return { label: 'Abrir', r: 2.2, act: () => { PLAYER.busy(1, 'push'); after(.4, () => { this.setOpen(true); if (this.key) UI.toast('Usaste: ' + ITEMS[this.key].name); }); } };
  }
}
// ---------- grade levadiça + alavanca ----------
class Gate extends Ent {
  constructor(o) {
    super(o); const w = this.w || 3, h = this.h || 3.6; const g = new THREE.Group(); g.position.copy(this.pos); g.rotation.y = this.yaw || 0; WORLD.group.add(g); this.g = g;
    for (let i = 0; i <= 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.08, h, .08), MAT('iron')); b.position.set(-w / 2 + i * w / 6, h / 2, 0); b.castShadow = true; g.add(b); }
    for (let j = 1; j < 4; j++) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, .08, .08), MAT('iron')); b.position.set(0, j * h / 4, 0); g.add(b); }
    this.col = addSolidBox(this.pos.x, this.pos.z, w / 2, .12, this.yaw || 0, this.pos.y, this.pos.y + h, { walk: false });
    this.h0 = h; WORLD.gates[this.id] = this; this.isOpen = !!PROG.flags['gate_' + this.id]; if (this.isOpen) { this.g.position.y = this.pos.y + h - .3; this.col.enabled = false; }
  }
  openGate() { if (this.isOpen) return; this.isOpen = true; PROG.flags['gate_' + this.id] = 1; this.col.enabled = false; let t = 0; sfx('stone', { pos: this.pos, vol: .9, rate: .6 }); sfx('rumble', { pos: this.pos, vol: .5 }); FX.list.push({ update: dt => { t += dt; this.g.position.y = this.pos.y + (this.h0 - .3) * easeInOut(Math.min(1, t / 2.2)); return t < 2.2; } }); }
}
class Lever extends Ent {
  constructor(o) {
    super(o); const g = new THREE.Group(); g.position.copy(this.pos); g.rotation.y = this.yaw || 0; WORLD.group.add(g);
    const base = new THREE.Mesh(new THREE.BoxGeometry(.4, .5, .3), MAT('iron')); base.position.y = .25; g.add(base);
    this.arm = new THREE.Group(); this.arm.position.y = .45; g.add(this.arm); const st = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .8, 6), MAT('iron')); st.position.y = .4; this.arm.add(st);
    this.pulled = !!PROG.flags['gate_' + this.gate]; this.arm.rotation.x = this.pulled ? .8 : -.8;
  }
  interact() { if (this.pulled) return null; return { label: 'Puxar a alavanca', r: 1.8, act: () => { this.pulled = true; PLAYER.busy(1.1, 'push'); let t = 0; FX.list.push({ update: dt => { t += dt; this.arm.rotation.x = lerp(-.8, .8, easeInOut(Math.min(1, t / .6))); return t < .6; } }); sfx('torch', { pos: this.pos, vol: .7, rate: .6 }); after(.7, () => { const gt = WORLD.gates[this.gate]; if (gt) gt.openGate(); else PROG.flags['gate_' + this.gate] = 1; if (this.onPull) this.onPull(); }); } }; }
}
// ---------- elevador ----------
class Elevator extends Ent {
  constructor(o) {
    super(o); const w = this.w || 3; const g = new THREE.Group(); WORLD.group.add(g); this.g = g;
    const pl = new THREE.Mesh(new THREE.BoxGeometry(w, .3, w), MAT('wood')); pl.position.y = -.15; pl.receiveShadow = true; pl.castShadow = true; g.add(pl);
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 30, 4), MAT('iron')); c.position.set(sx * w / 2.2, 15, sz * w / 2.2); g.add(c); }
    this.y = PROG.flags['elev_' + this.id] ? this.y1 : this.y0; this.target = this.y; this.moving = false;
    this.floor = addFloor(this.pos.x, this.pos.z, w / 2, w / 2, 0, this.y, .3); g.position.set(this.pos.x, this.y, this.pos.z);
  }
  update(dt) {
    const p = PLAYER; const on = p && Math.abs(p.pos.x - this.pos.x) < (this.w || 3) / 2 && Math.abs(p.pos.z - this.pos.z) < (this.w || 3) / 2 && Math.abs(p.pos.y - this.y) < .3;
    if (!this.moving && on && p.state === 'move' && p.speed < .2) { this.idleOn = (this.idleOn || 0) + dt; if (this.idleOn > .6) { this.idleOn = 0; this.go(this.y < (this.y0 + this.y1) / 2 ? this.y1 : this.y0); } } else if (!on) this.idleOn = 0;
    if (this.moving) {
      const dir = Math.sign(this.target - this.y), sp = 3.2; const ny = this.y + dir * sp * dt; const done = dir > 0 ? ny >= this.target : ny <= this.target; const fy = done ? this.target : ny;
      if (on || (p && Math.abs(p.pos.x - this.pos.x) < 1.6 && Math.abs(p.pos.z - this.pos.z) < 1.6 && Math.abs(p.pos.y - this.y) < .5)) { p.pos.y = fy; p.onGround = true; p.vy = 0; }
      this.y = fy; this.floor.y1 = fy; this.floor.y0 = fy - .3; this.g.position.y = fy; if (done) { this.moving = false; PROG.flags['elev_' + this.id] = this.y === this.y1 ? 1 : 0; sfx('stone', { pos: this.pos, vol: .6, rate: .7 }); }
    }
  }
  go(y) { this.target = y; this.moving = true; sfx('rumble', { pos: this.pos, vol: .6 }); }
  interact() { return null; }
}
// ---------- névoa de chefe ----------
const FOG_VS = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const FOG_FS = 'uniform float t, a; uniform vec3 c; varying vec2 vUv; float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);} float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);} void main(){ vec2 p=vUv*vec2(4.,3.); float v=n(p+vec2(t*.3,-t*.5))*.6+n(p*2.3-vec2(t*.6,t*.2))*.4; float e=smoothstep(0.,.15,vUv.x)*smoothstep(1.,.85,vUv.x)*smoothstep(0.,.1,vUv.y)*smoothstep(1.,.7,vUv.y); gl_FragColor=vec4(c*(.6+v*.8), (.35+v*.45)*e*a); }';
class FogWall extends Ent {
  constructor(o) {
    super(o); const w = this.w || 4, h = this.h || 4.5;
    this.mat = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, a: { value: 1 }, c: { value: new COL(o.color || 0xd8d8e8) } }, vertexShader: FOG_VS, fragmentShader: FOG_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    this.m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.mat); this.m.position.set(this.pos.x, this.pos.y + h / 2, this.pos.z); this.m.rotation.y = this.yaw || 0; WORLD.group.add(this.m);
    this.col = addSolidBox(this.pos.x, this.pos.z, w / 2, .2, this.yaw || 0, this.pos.y, this.pos.y + h, { walk: false, cam: false });
    WORLD.fogs[this.boss] = this; this.gone = !!PROG.bossDown[this.boss]; if (this.gone) this.remove();
  }
  update(dt) {
    if (this.gone) return; const U = this.mat.uniforms; U.t.value += dt;
    // não ofuscar a câmara: transparente durante o combate e quando a câmara está colada à névoa
    const cam = R.camera.position, c = Math.cos(this.yaw || 0), s = Math.sin(this.yaw || 0); const dpl = Math.abs((cam.x - this.pos.x) * s + (cam.z - this.pos.z) * c);
    const fight = GAME.bossActive && GAME.bossActive.id === this.boss; const tgt = (fight ? .22 : 1) * clamp((dpl - .4) / 2.6, .08, 1);
    U.a.value = damp(U.a.value, tgt, 5, dt);
  }
  remove() { this.gone = true; this.col.enabled = false; this.m.visible = false; }
  dissolve() { this.gone = true; this.col.enabled = false; let t = 0; FX.list.push({ update: dt => { t += dt; this.m.material.opacity = 1; this.m.scale.y = Math.max(.01, 1 - t); if (t > 1) { this.m.visible = false; return false; } } }); synth('fog'); }
  side(p) { const c = Math.cos(this.yaw || 0), s = Math.sin(this.yaw || 0); return (p.pos.x - this.pos.x) * s + (p.pos.z - this.pos.z) * c; }
  interact() {
    if (this.gone || GAME.bossActive) return null; const p = PLAYER; const sd = this.side(p);
    if (Math.sign(sd) === this.inside) return null; // já dentro
    return { label: 'Atravessar a névoa', r: 2.4, act: () => GAME.enterFog(this) };
  }
}
// ---------- mensagem no chão ----------
class Message extends Ent {
  constructor(o) {
    super(o); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .7), new THREE.MeshBasicMaterial({ map: spriteTex('scrawl'), color: 0xff8a3a, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.x = -HPI; m.rotation.z = rnd(-.4, .4); m.position.set(this.pos.x, this.pos.y + .04, this.pos.z); WORLD.group.add(m); this.m = m;
  }
  update(dt) { this.m.material.opacity = .6 + Math.sin(TIME.now * 2 + this.pos.x) * .2; }
  interact() { return { label: 'Ler a mensagem', r: 1.6, act: () => UI.message(this.text) }; }
}
// ---------- cinzas perdidas ----------
class Stain extends Ent {
  constructor(o) { super(o); this.sp = glowSprite(WORLD.group, this.pos.x, this.pos.y + .4, this.pos.z, 1.3, 0xc8e070, .9); this.L = addLight(this.pos.x, this.pos.y + .8, this.pos.z, 0xb8e060, 1.5, 4); }
  update(dt) { if (this.done) return; this.sp.scale.setScalar(1.2 + Math.sin(TIME.now * 4) * .2); if (Math.random() < dt * 8) burst(this.pos.x, this.pos.y + .3, this.pos.z, 1, { color: 0xc8e070, smin: .2, smax: .6, upBias: 1.5, lmin: .6, lmax: 1.2 }); if (PLAYER && PLAYER.alive && Math.hypot(PLAYER.pos.x - this.pos.x, PLAYER.pos.z - this.pos.z) < 1.1 && Math.abs(PLAYER.pos.y - this.pos.y) < 1.5) this.collect(); }
  collect() { this.done = true; WORLD.group.remove(this.sp); removeLight(this.L); GAME.recoverStain(); }
  dispose() { removeLight(this.L); }
}
// ---------- zona de saída / gatilho ----------
class Zone extends Ent {
  update(dt) {
    if (this.done || !PLAYER || !PLAYER.alive) return; const p = PLAYER.pos;
    const inside = this.r ? Math.hypot(p.x - this.pos.x, p.z - this.pos.z) < this.r && Math.abs(p.y - this.pos.y) < (this.hy || 3) : (p.x > this.x0 && p.x < this.x1 && p.z > this.z0 && p.z < this.z1 && Math.abs(p.y - this.pos.y) < (this.hy || 4));
    if (inside && (!this.cond || this.cond())) { if (this.once !== false) this.done = true; this.fn(); }
  }
}
class Exit extends Ent {
  interact() { if (this.cond && !this.cond()) return this.lockedLabel ? { label: this.lockedLabel, r: this.r || 2.5, act: () => UI.toast(this.lockedMsg || 'O caminho está bloqueado.') } : null; return { label: this.label || 'Seguir', r: this.r || 2.5, act: () => GAME.travel(this.to, this.spawn) }; }
}
// ---------- NPC ----------
class NPC extends Ent {
  constructor(o) {
    super(o); this.rig = o.build(); this.rig.root.position.copy(this.pos); this.rig.root.rotation.y = this.yaw || 0; WORLD.group.add(this.rig.root);
    this.anim = new Animator(this.rig); this.anim.play(o.idleClip || CLIP.sit, { hold: true }); this.anim.update(1);
    addSolidCyl(this.pos.x, this.pos.z, .4, this.pos.y, this.pos.y + 1.6, { walk: false });
    if (o.light) this.L = addLight(this.pos.x, this.pos.y + 1.4, this.pos.z, o.light, 1.2, 5);
    WORLD.npcs[this.id] = this;
  }
  update(dt) { if (this.hidden) return; this.anim.update(dt); if (PLAYER && this.look) { const y = yawTo(this.pos.x, this.pos.z, PLAYER.pos.x, PLAYER.pos.z); this.rig.J.head.rotation.y = clamp(angDiff(this.rig.root.rotation.y, y), -.8, .8); } }
  interact() { if (this.hidden || (this.cond && !this.cond())) return null; return { label: 'Falar com ' + this.name, r: 2.4, act: () => this.talk() }; }
  hide() { this.hidden = true; this.rig.root.visible = false; if (this.L) removeLight(this.L); }
  dispose() { if (this.L) removeLight(this.L); }
}
// lista de interação mais próxima
function nearestInteract() {
  const p = PLAYER; if (!p || !p.alive || p.state !== 'move') return null;
  let best = null, bd = 1e9;
  for (const e of WORLD.ents) {
    const it = e.interact(); if (!it) continue;
    const d = Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z); if (d > it.r || Math.abs(e.pos.y - p.pos.y) > 2) continue;
    if (d < bd) { bd = d; best = it; }
  }
  return best;
}
