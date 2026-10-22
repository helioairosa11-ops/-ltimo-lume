// ===================== ATORES E COMBATE =====================
const ACTORS = [];
const GRAV = 22;
class Actor {
  constructor(o = {}) {
    this.team = o.team || 'enemy'; this.r = o.r || .4; this.h = o.h || 1.8; this.mass = o.mass || 1;
    this.pos = new V3(); this.vel = new V3(); this.vy = 0; this.yaw = 0; this.onGround = true; this.groundY = 0; this.airT = 0; this.lastSafe = new V3();
    this.maxHp = o.hp || 100; this.hp = this.maxHp; this.maxPoise = o.poise || 30; this.poise = this.maxPoise; this.poiseT = 0;
    this.alive = true; this.state = 'idle'; this.st = 0; this.iframe = 0; this.hyper = false; this.flash = 0; this.status = {};
    this.root = new THREE.Group(); this.kb = new V3(); this.immune = {}; this.resist = o.resist || {};
    this.boss = false; this.name = o.name || '';
    ACTORS.push(this);
  }
  get x() { return this.pos.x; } get z() { return this.pos.z; } get y() { return this.pos.y; } set x(v) { this.pos.x = v; } set z(v) { this.pos.z = v; } set y(v) { this.pos.y = v; }
  center(out = _v1) { return out.set(this.pos.x, this.pos.y + this.h * .55, this.pos.z); }
  dist(o) { return Math.hypot(o.pos.x - this.pos.x, o.pos.z - this.pos.z); }
  yawTo(o) { return yawTo(this.pos.x, this.pos.z, o.pos.x, o.pos.z); }
  fwd(out = _v1) { return out.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
  turn(target, rate, dt) { this.yaw = turnTo(this.yaw, target, rate * dt); }
  // integração física (velocidade horizontal em this.vel)
  physics(dt, o = {}) {
    const step = o.step ?? .55;
    const dx = (this.vel.x + this.kb.x) * dt, dz = (this.vel.z + this.kb.z) * dt;
    const kd = Math.exp(-7 * dt); this.kb.multiplyScalar(kd);
    const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (this.r * .7)));
    for (let i = 0; i < n; i++) {
      const ox = this.pos.x, oz = this.pos.z;
      this.pos.x += dx / n; this.pos.z += dz / n;
      if (o.ledge && this.onGround) { // inimigos não caem de bordas
        const g = groundAt(this.pos.x, this.pos.z, this.pos.y + step, step);
        if (g < this.pos.y - 1.2) { this.pos.x = ox; this.pos.z = oz; break; }
      }
      resolveCircle(this, step);
    }
    // vertical
    const g = groundAt(this.pos.x, this.pos.z, this.pos.y + (this.vy > 0 ? 0 : step), step);
    if (this.vy > 0 || this.pos.y > g + .02) {
      if (this.onGround && this.vy <= 0 && g > -1e8 && this.pos.y - g < (o.snap ?? .45)) { this.pos.y = g; }
      else {
        this.onGround = false; this.vy -= GRAV * (o.grav ?? 1) * dt; const py = this.pos.y; this.pos.y += this.vy * dt; this.airT += dt;
        if (this.vy > 0) { const c = ceilingAt(this.pos.x, this.pos.z, this.pos.y + this.h - .2); if (this.pos.y + this.h > c) { this.pos.y = c - this.h; this.vy = 0; } }
        const g2 = groundAt(this.pos.x, this.pos.z, Math.max(py, this.pos.y) + .02, .05); // procura o chão entre a altura anterior e a nova (evita atravessar o chão a alta velocidade)
        if (this.vy <= 0 && this.pos.y <= g2) { const fall = this.airT; this.pos.y = g2; this.vy = 0; this.onGround = true; this.airT = 0; this.onLand && this.onLand(fall); }
      }
    } else { this.pos.y = g; this.vy = 0; if (!this.onGround) { this.onGround = true; this.onLand && this.onLand(this.airT); } this.airT = 0; }
    if (this.onGround && g > -1e8) this.lastSafe.copy(this.pos);
    if (this.pos.y < PHYS.killY) this.onFall && this.onFall();
    this.groundY = g;
  }
  takeHit(h) { return false; }
  sync() { this.root.position.copy(this.pos); this.root.rotation.y = this.yaw; }
  remove() { const i = ACTORS.indexOf(this); if (i >= 0) ACTORS.splice(i, 1); if (this.root.parent) this.root.parent.remove(this.root); if (this.trail) this.trail.dispose(); }
}
// separação entre atores (empurrão suave)
function separateActors() {
  for (let i = 0; i < ACTORS.length; i++) for (let j = i + 1; j < ACTORS.length; j++) {
    const a = ACTORS[i], b = ACTORS[j]; if (!a.alive || !b.alive || a.ghost || b.ghost) continue;
    if (Math.abs(a.pos.y - b.pos.y) > Math.max(a.h, b.h) * .8) continue;
    const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz), m = a.r + b.r;
    if (d < m && d > 1e-4) { const o = m - d, ta = b.mass / (a.mass + b.mass), tb = a.mass / (a.mass + b.mass); a.pos.x -= dx / d * o * ta; a.pos.z -= dz / d * o * ta; b.pos.x += dx / d * o * tb; b.pos.z += dz / d * o * tb; resolveCircle(a); resolveCircle(b); }
  }
}
// ---------- armas (malhas) ----------
function weaponMesh(kind, s = 1) {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; g.add(m); return m; };
  const st = MAT('steel'), dk = MAT('dark_steel'), lt = MAT('leather'), gd = MAT('gold'), wd = MAT('wood_dark');
  if (kind === 'sword' || kind === 'greatsword' || kind === 'kingsword') {
    const big = kind !== 'sword', L = (kind === 'sword' ? .95 : 1.45) * s, W = (big ? .1 : .06) * s;
    add(new THREE.BoxGeometry(W, L, .014 * s), kind === 'kingsword' ? dk : st, 0, L / 2 + .1 * s, 0);
    add(new THREE.ConeGeometry(W * .72, .14 * s, 4), kind === 'kingsword' ? dk : st, 0, L + .17 * s, 0, 0, PI / 4, 0).scale.set(1, 1, .2);
    add(new THREE.BoxGeometry((big ? .38 : .24) * s, .04 * s, .05 * s), kind === 'kingsword' ? gd : MAT('bronze'), 0, .1 * s, 0);
    add(new THREE.CylinderGeometry(.018 * s, .02 * s, (big ? .32 : .2) * s, 6), lt, 0, -.02 * s, 0);
    add(new THREE.SphereGeometry(.03 * s, 6, 4), kind === 'kingsword' ? gd : MAT('bronze'), 0, (big ? -.2 : -.13) * s, 0);
    g.userData = { len: L + .2 * s, base: .12 * s, w: .09 * s };
  } else if (kind === 'axe') {
    add(new THREE.CylinderGeometry(.025 * s, .03 * s, 1.3 * s, 6), wd, 0, .35 * s, 0);
    const head = add(new THREE.CylinderGeometry(.32 * s, .32 * s, .03 * s, 12, 1, false, 0, PI * .9), dk, .12 * s, .85 * s, 0, 0, 0, HPI); head.rotation.set(0, HPI, HPI);
    g.userData = { len: 1.1 * s, base: .5 * s, w: .3 * s };
  } else if (kind === 'spear' || kind === 'lance') {
    add(new THREE.CylinderGeometry(.022 * s, .026 * s, 2.3 * s, 6), kind === 'lance' ? MAT('bronze') : wd, 0, .55 * s, 0);
    add(new THREE.ConeGeometry(.06 * s, .38 * s, 4), st, 0, 1.88 * s, 0);
    g.userData = { len: 2.05 * s, base: .9 * s, w: .07 * s };
  } else if (kind === 'hammer') {
    add(new THREE.CylinderGeometry(.04 * s, .05 * s, 1.6 * s, 6), wd, 0, .45 * s, 0);
    add(new THREE.BoxGeometry(.5 * s, .32 * s, .32 * s), dk, 0, 1.2 * s, 0);
    g.userData = { len: 1.4 * s, base: .9 * s, w: .3 * s };
  } else if (kind === 'dagger') {
    add(new THREE.BoxGeometry(.04 * s, .34 * s, .01 * s), st, 0, .22 * s, 0);
    add(new THREE.BoxGeometry(.1 * s, .025 * s, .03 * s), MAT('bronze'), 0, .05 * s, 0);
    add(new THREE.CylinderGeometry(.015 * s, .015 * s, .1 * s, 5), lt, 0, -.02 * s, 0);
    g.userData = { len: .4 * s, base: .06 * s, w: .05 * s };
  } else if (kind === 'staff') {
    add(new THREE.CylinderGeometry(.022 * s, .028 * s, 1.7 * s, 6), wd, 0, .3 * s, 0);
    const c = add(new THREE.OctahedronGeometry(.08 * s, 0), MAT('glow_blue'), 0, 1.22 * s, 0); g.userData = { len: 1.25 * s, base: .9 * s, w: .1 * s, gem: c };
  } else if (kind === 'scepter') {
    add(new THREE.CylinderGeometry(.025 * s, .03 * s, 1.3 * s, 6), MAT('gold'), 0, .35 * s, 0);
    const c = add(new THREE.SphereGeometry(.1 * s, 10, 8), MAT('fire_core'), 0, 1.05 * s, 0); g.userData = { len: 1.15 * s, base: .6 * s, w: .12 * s, gem: c };
  } else if (kind === 'crossbow') {
    add(new THREE.BoxGeometry(.06 * s, .06 * s, .55 * s), wd, 0, 0, .1 * s);
    add(new THREE.BoxGeometry(.6 * s, .03 * s, .04 * s), dk, 0, .02 * s, .32 * s);
    g.userData = { len: .4, base: 0, w: .1 };
  } else if (kind === 'bow') {
    const arc = add(new THREE.TorusGeometry(.55 * s, .018 * s, 4, 16, PI * .8), wd, -.12 * s, 0, 0, 0, 0, PI * .6); arc.rotation.set(0, HPI, PI * .6 - HPI);
    g.userData = { len: .5, base: 0, w: .1 };
  } else if (kind === 'shield') {
    add(new THREE.BoxGeometry(.55 * s, .85 * s, .06 * s), MAT('iron'), 0, 0, 0);
    add(new THREE.BoxGeometry(.12 * s, .12 * s, .04 * s), MAT('bronze'), 0, 0, .04 * s);
    g.userData = { len: 0, base: 0, w: .5 };
  } else if (kind === 'claw') { g.userData = { len: .25 * s, base: 0, w: .12 * s }; }
  return g;
}
// ---------- golpes (arcos) ----------
// Quadro local do ator: origem nos pés, +Z frente, +X esquerda.
// slash: mão percorre um círculo em torno do pivô no plano inclinado psi (graus) do ângulo th0 a th1 (graus, 0 = frente, +90 = esquerda/cima)
const _a1 = new V3(), _a2 = new V3(), _an = new V3(), _at = new V3();
function arcEval(arc, u, rig, out) {
  const s = rig ? rig.s : 1;
  const piv = _a1.set(arc.px ?? -.08 * s, (arc.py ?? 1.35) * s, (arc.pz ?? .05) * s);
  if (arc.kind === 'thrust') {
    const a = arc.from, b = arc.to; out.hand.set(lerp(a[0], b[0], u) * s, lerp(a[1], b[1], u) * s, lerp(a[2], b[2], u) * s);
    out.blade.set(arc.dir ? arc.dir[0] : 0, arc.dir ? arc.dir[1] : 0, 1).normalize(); out.edge.set(0, 1, 0); return out;
  }
  const psi = (arc.psi || 0) * PI / 180, th = lerp(arc.th0, arc.th1, u) * PI / 180;
  const e1 = _a2.set(0, 0, 1), e2 = _an.set(Math.cos(psi), Math.sin(psi), 0);
  const r = (arc.r ?? .62) * s;
  out.hand.set(piv.x + r * (Math.cos(th) * e1.x + Math.sin(th) * e2.x), piv.y + r * (Math.cos(th) * e1.y + Math.sin(th) * e2.y), piv.z + r * (Math.cos(th) * e1.z + Math.sin(th) * e2.z));
  out.blade.set(Math.cos(th) * e1.x + Math.sin(th) * e2.x, Math.cos(th) * e1.y + Math.sin(th) * e2.y + (arc.lift || 0), Math.cos(th) * e1.z + Math.sin(th) * e2.z).normalize();
  const sg = arc.th1 > arc.th0 ? 1 : -1;
  out.edge.set(-Math.sin(th) * e1.x + Math.cos(th) * e2.x, -Math.sin(th) * e1.y + Math.cos(th) * e2.y, -Math.sin(th) * e1.z + Math.cos(th) * e2.z).multiplyScalar(sg);
  return out;
}
// distância entre dois segmentos 3D
function segSegDist(p1, q1, p2, q2) {
  const d1x = q1.x - p1.x, d1y = q1.y - p1.y, d1z = q1.z - p1.z, d2x = q2.x - p2.x, d2y = q2.y - p2.y, d2z = q2.z - p2.z, rx = p1.x - p2.x, ry = p1.y - p2.y, rz = p1.z - p2.z;
  const a = d1x * d1x + d1y * d1y + d1z * d1z, e = d2x * d2x + d2y * d2y + d2z * d2z, f = d2x * rx + d2y * ry + d2z * rz;
  let s, t;
  if (a <= 1e-8 && e <= 1e-8) { s = t = 0; }
  else if (a <= 1e-8) { s = 0; t = clamp(f / e, 0, 1); }
  else { const c = d1x * rx + d1y * ry + d1z * rz; if (e <= 1e-8) { t = 0; s = clamp(-c / a, 0, 1); } else { const b = d1x * d2x + d1y * d2y + d1z * d2z, den = a * e - b * b; s = den !== 0 ? clamp((b * f - c * e) / den, 0, 1) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); } else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); } } }
  const cx = p1.x + d1x * s - (p2.x + d2x * t), cy = p1.y + d1y * s - (p2.y + d2y * t), cz = p1.z + d1z * s - (p2.z + d2z * t);
  return Math.sqrt(cx * cx + cy * cy + cz * cz);
}
const _cA = new V3(), _cB = new V3(), _sA = new V3(), _sB = new V3();
// testa a lâmina (segmento base->ponta, atual e anterior) contra a cápsula do alvo
function bladeHits(prevB, prevT, curB, curT, tgt, thick) {
  _cA.set(tgt.pos.x, tgt.pos.y + tgt.r * .5, tgt.pos.z); _cB.set(tgt.pos.x, tgt.pos.y + tgt.h - tgt.r * .3, tgt.pos.z);
  for (let i = 0; i <= 3; i++) { const t = i / 3; _sA.lerpVectors(prevB, curB, t); _sB.lerpVectors(prevT, curT, t); if (segSegDist(_sA, _sB, _cA, _cB) < tgt.r + thick) return true; }
  return false;
}
// esfera contra alvo
function sphereHits(c, r, tgt) { _cA.set(tgt.pos.x, tgt.pos.y + tgt.r * .5, tgt.pos.z); _cB.set(tgt.pos.x, tgt.pos.y + tgt.h - tgt.r * .3, tgt.pos.z); return segSegDist(c, c, _cA, _cB) < r + tgt.r; }
function targetsOf(team) { return ACTORS.filter(a => a.alive && a.team !== team && !a.ghost && a.team !== 'neutral'); }
// ---------- projéteis ----------
const PROJ = [];
class Projectile {
  constructor(o) {
    Object.assign(this, { r: .25, dmg: 50, poiseDmg: 10, life: 4, grav: 0, homing: 0, type: 'phys', pierce: false, color: 0xffa050, light: 0, trailRate: 0, team: 'enemy', hit: new Set(), sfxHit: null, kb: 4 }, o);
    this.pos = o.pos.clone(); this.vel = o.vel.clone();
    if (o.mesh) { this.mesh = o.mesh; this.mesh.position.copy(this.pos); R.scene.add(this.mesh); }
    if (this.light) this.L = addLight(this.pos.x, this.pos.y, this.pos.z, this.color, this.light, this.lightR || 6, .1);
    this.acc = 0; PROJ.push(this);
  }
  update(dt) {
    if (this.homing && this.target && this.target.alive) { const c = this.target.center(_v2); _v3.subVectors(c, this.pos).normalize().multiplyScalar(this.vel.length()); this.vel.lerp(_v3, Math.min(1, this.homing * dt)); }
    this.vel.y -= this.grav * dt;
    const o = _v1.copy(this.pos); this.pos.addScaledVector(this.vel, dt); this.life -= dt;
    if (this.mesh) { this.mesh.position.copy(this.pos); if (this.orient) this.mesh.lookAt(_v2.copy(this.pos).add(this.vel)); if (this.spin) this.mesh.rotation.z += dt * this.spin; }
    if (this.L) { this.L.x = this.pos.x; this.L.y = this.pos.y; this.L.z = this.pos.z; }
    if (this.trailRate) { this.acc += dt * this.trailRate; while (this.acc > 1) { this.acc--; const c = new COL(this.color); PFX.glow.emit(this.pos.x + rnd(-.05, .05), this.pos.y + rnd(-.05, .05), this.pos.z + rnd(-.05, .05), rnd(-.3, .3), rnd(-.1, .4), rnd(-.3, .3), rnd(.2, .45), this.r * 1.3, this.r * .2, c.r, c.g, c.b, .9, 2, 0); } }
    // colisão com mundo
    if (pointBlocked(this.pos.x, this.pos.y, this.pos.z) || this.pos.y < groundAt(this.pos.x, this.pos.z, this.pos.y + 1) + .02) { this.explode(null); return false; }
    for (const t of targetsOf(this.team)) {
      if (this.hit.has(t)) continue;
      if (sphereHits(this.pos, this.r, t)) {
        this.hit.add(t);
        const res = t.takeHit({ dmg: this.dmg, poiseDmg: this.poiseDmg, type: this.type, from: this.owner, src: this.pos, dir: _v2.copy(this.vel).normalize(), kb: this.kb, proj: this, status: this.status });
        if (res !== 'dodge') { this.onHitFx && this.onHitFx(t); if (!this.pierce) { this.explode(t); return false; } }
      }
    }
    if (this.life <= 0) { this.explode(null); return false; }
    return true;
  }
  explode(t) {
    if (this.dead) return; this.dead = true;
    if (this.onExplode) this.onExplode(this.pos, t);
    else burst(this.pos.x, this.pos.y, this.pos.z, 10, { color: this.color, smin: 1, smax: 4, lmin: .2, lmax: .5 });
    this.destroy();
  }
  destroy() { if (this.mesh) { R.scene.remove(this.mesh); } if (this.L) removeLight(this.L); }
}
function updProjectiles(dt) { for (let i = PROJ.length - 1; i >= 0; i--) { const p = PROJ[i]; if (p.dead || p.update(dt) === false) { if (!p.dead) { p.dead = true; p.destroy(); } PROJ.splice(i, 1); } } }
function clearProjectiles() { for (const p of PROJ) { p.dead = true; p.destroy(); } PROJ.length = 0; }
function orbMesh(r, color, core = 0xffffff) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r * .55, 8, 6), new THREE.MeshBasicMaterial({ color: core })));
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTex('glow'), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(r * 5, r * 5, 1); g.add(sp);
  return g;
}
function arrowMesh(len = .8, color = 0xcbb994) {
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, len, 4), new THREE.MeshStandardMaterial({ color, roughness: .8 })); m.rotation.x = HPI; g.add(m);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.03, .1, 4), MAT('steel')); tip.rotation.x = HPI; tip.position.z = len / 2; g.add(tip); return g;
}
// ---------- áreas de dano (AoE) ----------
const AOES = [];
// o: {x,y,z, r, r0 (anel interno), delay, dur, dmg, type, team, owner, tele:true, color, onFire(), tick, kb, shape:'circle'|'ring'|'line', len, w, yaw, maxH}
function aoe(o) {
  o = Object.assign({ delay: 0, dur: .15, dmg: 50, poiseDmg: 20, type: 'phys', team: 'enemy', kb: 6, r0: 0, hit: new Set(), t: 0, fired: false, maxH: 2.5, shape: 'circle' }, o);
  if (o.tele && o.delay > 0) { if (o.shape === 'line') { /* sem marcador */ } else o.teleFx = telegraph(o.x, o.y, o.z, o.r, o.delay, o.teleColor || 0xff5a28); }
  AOES.push(o); return o;
}
function aoeContains(a, t) {
  if (t.pos.y > a.y + a.maxH || t.pos.y + t.h < a.y - .6) return false;
  const dx = t.pos.x - a.x, dz = t.pos.z - a.z;
  if (a.shape === 'line') { const c = Math.cos(a.yaw), s = Math.sin(a.yaw); const lz = dx * s + dz * c, lx = dx * c - dz * s; return lz > -t.r && lz < a.len + t.r && Math.abs(lx) < a.w / 2 + t.r; }
  const d = Math.hypot(dx, dz); if (d > a.r + t.r) return false;
  if (a.shape === 'ring' && d < a.r0 - t.r) return false;
  if (a.arc) { const ang = Math.abs(angDiff(a.yaw, Math.atan2(dx, dz))); if (ang > a.arc && d > t.r * 1.5) return false; }
  return true;
}
function updAoes(dt) {
  for (let i = AOES.length - 1; i >= 0; i--) {
    const a = AOES[i]; a.t += dt;
    if (!a.fired && a.t >= a.delay) { a.fired = true; a.onFire && a.onFire(a); }
    if (a.fired) {
      if (a.grow) { a.r = a.r0 + a.grow * (a.t - a.delay); a.r0 = Math.max(0, a.r - (a.width || 1.2)); }
      for (const t of targetsOf(a.team)) {
        if (a.hit.has(t) && !a.tick) continue;
        if (a.tick && a.hit.has(t) && (a.nextT?.get(t) || 0) > a.t) continue;
        if (aoeContains(a, t)) {
          const res = t.takeHit({ dmg: a.dmg, poiseDmg: a.poiseDmg, type: a.type, from: a.owner, src: _v2.set(a.x, a.y, a.z), kb: a.kb, aoe: a, status: a.status, up: a.up });
          if (res !== 'dodge' || !a.tick) a.hit.add(t);
          if (a.tick) { a.nextT = a.nextT || new Map(); a.nextT.set(t, a.t + a.tick); }
        }
      }
    }
    if (a.t >= a.delay + a.dur) AOES.splice(i, 1);
  }
}
function clearAoes() { AOES.length = 0; }
// tipos de dano: multiplicador por resistência
function dmgAfterResist(t, h) { return Math.round(h.dmg * (1 - (t.resist[h.type] || 0))); }
