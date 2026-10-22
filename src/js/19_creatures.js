// ===================== QUADRÚPEDES E ESPÍRITOS =====================
class QuadEnemy extends Actor {
  constructor(type, x, y, z, yaw, lvl = 1, opt = {}) {
    const T = ETYPE[type];
    const kind = T.quad;
    const rig = kind === 'lizard' ? buildQuad({ s: 1.5, kind: 'lizard', len: 1.3, mats: { body: MAT('skin_ash', { color: 0x4a2a1a, emissive: 0x401000, emissiveInt: .4 }), eye: MAT('fire_core') } })
      : kind === 'wolf' ? buildQuad({ s: 1.25, kind: 'wolf', len: 1.0, mats: { body: MAT('cloth_grey', { color: 0x8a867e }), eye: MAT('glow_white') } })
        : buildQuad({ s: 1.0, kind: 'dog', len: .85, mats: { body: MAT('leather', { color: 0x4a3a2c }), eye: MAT('ember') } });
    super({ team: 'enemy', r: .45 * rig.s, h: 1.0 * rig.s, hp: Math.round(T.hp * lvl), poise: T.poise, mass: rig.s, resist: T.resist, name: T.name });
    this.rig = rig; this.root.add(rig.root); this.type = type; this.T = T; this.lvl = lvl; this.opt = opt; this.kind = kind;
    this.home = new V3(x, y, z); this.homeYaw = yaw; this.pos.set(x, y, z); this.yaw = yaw; this.state = opt.sleep ? 'sleep' : 'idle'; this.cd = rnd(.5, 1.5); this.ph = 0; this.amt = 0;
    this.cinzas = Math.round(T.cinzas * (lvl > 1 ? 1 + (lvl - 1) * .6 : 1)); this.flank = rnd(-1, 1); this.strafeDir = 1; this.aggroed = false;
    this.rig.root.traverse(o => { if (o.isMesh && o.material.isMeshStandardMaterial) o.material = rimify(o.material, 0x9aa0c0, 3, .15); });
    if (kind === 'lizard') { this.light = addLight(0, 0, 0, 0xff6a1a, 1.2, 4.5); }
    ENEMIES.push(this); this.sync();
  }
  get aggroR() { return this.T.aggro; }
  update(dt) {
    this.stT += dt; this.iframe = Math.max(0, this.iframe - dt);
    if (this.poiseT > 0) this.poiseT -= dt; else this.poise = Math.min(this.maxPoise, this.poise + this.maxPoise * .5 * dt);
    const p = PLAYER;
    if (!this.alive) { this.vel.set(0, 0, 0); this.deadUpd(dt); this.physics(dt); return; }
    const T = this.T, d = this.dist(p), ty = this.yawTo(p);
    switch (this.state) {
      case 'sleep': this.vel.set(0, 0, 0); if (p.alive && d < 4) this.aggro(p); break;
      case 'idle': this.vel.set(0, 0, 0); this.amt = damp(this.amt, 0, 5, dt); if (p.alive && this.see(p)) this.aggro(p); break;
      case 'alert': this.vel.set(0, 0, 0); this.turn(ty, 6, dt); if (this.stT > .5) { this.state = 'chase'; this.stT = 0; } break;
      case 'return': this.stReturn(dt, p); break;
      case 'chase': {
        if (!p.alive) { this.state = 'return'; break; }
        if (this.pos.distanceTo(this.home) > 36) { this.state = 'return'; this.stT = 0; break; }
        this.cd -= dt;
        if (this.kind === 'lizard') {
          this.turn(ty, 3, dt);
          if (this.cd <= 0 && d < 5.5 && Math.abs(angDiff(this.yaw, ty)) < .5) { this.startQ(d < 2.4 && Math.random() < .5 ? 'bite' : 'breath'); break; }
          if (this.cd <= 0 && d < 3 && Math.abs(angDiff(this.yaw, ty)) > 1.6) { this.startQ('tail'); break; }
          if (d > 3.2) this.qmove(T.walk * 1.4, dt); else this.qmove(0, dt);
        } else {
          // circular ao redor e investir
          const want = 3.8 + this.flank;
          let my = ty + (d < want + 1 ? this.strafeDir * 1.2 : 0);
          this.turn(my, 7, dt);
          if (this.cd <= 0 && d < 5.5 && d > 1.2 && Math.abs(angDiff(this.yaw, ty)) < .9) { this.yaw = ty; this.startQ('lunge'); break; }
          if (this.cd <= 0 && d <= 1.6) { this.yaw = ty; this.startQ('bite'); break; }
          this.qmove(d > want + 1 ? T.run : T.walk * 1.4, dt);
          if (Math.random() < dt * .4) this.strafeDir *= -1;
        }
        break;
      }
      case 'attack': this.stQAtk(dt, p); break;
      case 'hurt': this.vel.set(0, 0, 0); if (this.stT > .35) { this.state = 'chase'; this.stT = 0; } break;
      case 'stagger': this.vel.set(0, 0, 0); if (this.stT > .9) { this.state = 'chase'; this.stT = 0; } break;
    }
    this.physics(dt, { ledge: true });
    this.animQ(dt); this.sync();
    if (this.light) { this.light.x = this.pos.x; this.light.y = this.pos.y + 1; this.light.z = this.pos.z; }
  }
  qmove(sp, dt) { this.vel.set(Math.sin(this.yaw) * sp, 0, Math.cos(this.yaw) * sp); this.amt = damp(this.amt, sp, 8, dt); }
  startQ(kind) {
    this.state = 'attack'; this.stT = 0; this.qa = kind; this.hitDone = false; this.vel.set(0, 0, 0);
    const v = this.T.voice; if (kind !== 'breath') sfx(v.aggro, { pos: this.pos, vol: .6, jit: .1 });
    if (kind === 'breath') { sfx('hiss_big', { pos: this.pos, vol: .7 }); }
  }
  stQAtk(dt, p) {
    const t = this.stT, k = this.qa, T = this.T, dmg = Math.round(T.dmg * this.lvl);
    const head = () => { this.rig.J.head.getWorldPosition(_v3); return _v3; };
    if (k === 'lunge') {
      if (t < .38) { this.vel.set(0, 0, 0); this.turn(this.yawTo(p), 8, dt); }
      else if (t < .7) { const sp = 9.5; this.vel.set(Math.sin(this.yaw) * sp, 0, Math.cos(this.yaw) * sp); if (!this.hitDone && sphereHits(head(), .45 * this.rig.s, p)) { this.hitDone = true; p.takeHit({ dmg, poiseDmg: 25, from: this, src: this.pos, kb: 4 }); sfx('hit_bite', { pos: this.pos, vol: .7 }); } }
      else { this.vel.multiplyScalar(Math.exp(-8 * dt)); if (t > 1.15) this.endQ(rnd(.8, 1.8)); }
    } else if (k === 'bite') {
      if (t < .3) { this.vel.set(0, 0, 0); this.turn(this.yawTo(p), 8, dt); }
      else if (t < .45) { this.vel.set(Math.sin(this.yaw) * 4, 0, Math.cos(this.yaw) * 4); if (!this.hitDone && sphereHits(head(), .5 * this.rig.s, p)) { this.hitDone = true; p.takeHit({ dmg: Math.round(dmg * .8), poiseDmg: 20, from: this, src: this.pos, kb: 3 }); sfx('hit_bite', { pos: this.pos, vol: .7 }); } }
      else { this.vel.set(0, 0, 0); if (t > .9) this.endQ(rnd(.6, 1.4)); }
    } else if (k === 'breath') {
      this.vel.set(0, 0, 0); if (t < .7) this.turn(this.yawTo(p), 3, dt); else this.turn(this.yawTo(p), .8, dt);
      if (t > .7 && t < 2.1) {
        const h = head(); const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
        for (let i = 0; i < 3; i++) PFX.glow.emit(h.x + fx * .3, h.y, h.z + fz * .3, fx * rnd(5, 8) + rnd(-1.2, 1.2), rnd(-.4, .8), fz * rnd(5, 8) + rnd(-1.2, 1.2), rnd(.4, .7), rnd(.2, .35), .7, 1, rnd(.35, .6), .1, .9, 1.5, -1);
        this.breathT = (this.breathT || 0) - dt;
        if (this.breathT <= 0) { this.breathT = .3; const dx = p.pos.x - h.x, dz = p.pos.z - h.z, dd = Math.hypot(dx, dz); if (dd < 5.5 && Math.abs(angDiff(this.yaw, Math.atan2(dx, dz))) < .45 && Math.abs(p.pos.y - this.pos.y) < 2) p.takeHit({ dmg: Math.round(dmg * .35), poiseDmg: 6, type: 'fire', from: this, src: h, kb: 1, status: { burn: 2 } }); }
        if (Math.random() < dt * 4) sfx('fire', { pos: this.pos, vol: .45, jit: .1 });
        if (this.light) this.light.boost = 2;
      } else if (this.light) this.light.boost = 0;
      if (t > 2.5) this.endQ(rnd(1.5, 2.5));
    } else if (k === 'tail') {
      this.vel.set(0, 0, 0);
      if (t > .35 && t < .65) { this.yaw += dt * 14; if (!this.hitDone && this.dist(p) < 3.2) { this.hitDone = true; p.takeHit({ dmg: Math.round(dmg * .9), poiseDmg: 40, from: this, src: this.pos, kb: 8 }); sfx('tusker', { pos: this.pos, vol: .7 }); } }
      if (t > 1.1) this.endQ(1);
    }
  }
  endQ(cd) { this.state = 'chase'; this.stT = 0; this.cd = cd; }
  animQ(dt) {
    const J = this.rig.J, s = this.rig.s, sp = Math.hypot(this.vel.x, this.vel.z);
    this.ph += dt * sp * (this.kind === 'lizard' ? 2.2 : 1.7) + dt * .3;
    const A = Math.min(1, sp / 4) * (this.kind === 'lizard' ? .5 : .75), sn = Math.sin(this.ph * 2), cs = Math.cos(this.ph * 2);
    J.fl.rotation.x = sn * A; J.br.rotation.x = sn * A; J.fr.rotation.x = -sn * A; J.bl.rotation.x = -sn * A;
    J.fl2.rotation.x = Math.max(0, -sn) * A * .9; J.br2.rotation.x = Math.max(0, sn) * A * -.6; J.fr2.rotation.x = Math.max(0, sn) * A * .9; J.bl2.rotation.x = Math.max(0, -sn) * A * -.6;
    let bodyY = this.rig.hip + Math.abs(cs) * .04 * s * Math.min(1, sp / 3), bodyX = 0, headX = 0, jaw = 0;
    const t = this.stT;
    if (this.state === 'attack') {
      const k = this.qa;
      if (k === 'lunge') { if (t < .38) { bodyY -= .15 * s; bodyX = .15; headX = .3; } else if (t < .7) { bodyX = -.2; headX = -.3; jaw = .6; bodyY += .15 * s; } }
      if (k === 'bite') { if (t < .3) { headX = -.4; } else if (t < .45) { headX = .5; jaw = .7; } }
      if (k === 'breath') { headX = t > .6 && t < 2.1 ? -.1 : .3; jaw = t > .6 && t < 2.1 ? .7 : 0; bodyY -= .05 * s; }
    }
    if (this.state === 'stagger' || this.state === 'hurt') bodyX = -.2;
    if (!this.alive) { bodyY = lerp(bodyY, .2 * s, Math.min(1, this.stT * 3)); this.rig.root.rotation.z = lerp(0, 1.4, Math.min(1, this.stT * 2.5)); }
    J.body.position.y = damp(J.body.position.y, bodyY, 12, dt); J.body.rotation.x = damp(J.body.rotation.x, bodyX, 10, dt);
    J.neck.rotation.x = damp(J.neck.rotation.x, headX, 12, dt); J.jaw.rotation.x = damp(J.jaw.rotation.x, jaw, 15, dt);
    this.rig.tails.forEach((tl, i) => tl.rotation.y = Math.sin(TIME.now * 3 + i) * .25 + Math.sin(this.ph * 2) * .15);
  }
  takeHit(h) {
    if (!this.alive) return false; if (this.iframe > 0) return 'dodge';
    let dmg = dmgAfterResist(this, h); const p = h.from; let crit = false;
    if (p && p.isPlayer && !h.proj && !h.aoe && this.state !== 'attack' && Math.abs(angDiff(this.yaw, this.yawTo(p))) > 2.3) { dmg = Math.round(dmg * 2); crit = true; }
    this.applyDmg(dmg, h, crit); if (!this.alive) return true;
    if (!this.aggroed && PLAYER) this.aggro(PLAYER);
    this.poise -= h.poiseDmg || 10; this.poiseT = 2;
    if (this.poise <= 0) { this.poise = this.maxPoise; this.state = 'stagger'; this.stT = 0; if (h.src) this.kb.set(this.pos.x - h.src.x, 0, this.pos.z - h.src.z).normalize().multiplyScalar(5 / this.mass); }
    else if (this.kind !== 'lizard' && this.state !== 'attack') { this.state = 'hurt'; this.stT = 0; if (h.src) this.kb.set(this.pos.x - h.src.x, 0, this.pos.z - h.src.z).normalize().multiplyScalar(3); }
    return true;
  }
  center(out = _v1) { return out.set(this.pos.x, this.pos.y + this.rig.hip, this.pos.z); }
  die(h) { this.hp = 0; this.alive = false; this.state = 'dead'; this.stT = 0; this.ghost = true; sfx(this.T.voice.die, { pos: this.pos, vol: .7 }); GAME.onEnemyKilled(this); }
  deadUpd(dt) {
    this.animQ(dt); this.sync();
    if (this.stT > 1.4 && !this.dissolved) { this.dissolved = true; const c = this.center(new V3()); burst(c.x, c.y, c.z, 30, { add: false, color: 0x8a847a, smin: .3, smax: 1.4, upBias: 1.2, lmin: .8, lmax: 1.6, szmin: .06, szmax: .14, jit: .5, alpha: .8, drag: 1 }); this.root.visible = false; if (this.light) { removeLight(this.light); this.light = null; } }
  }
  remove() { super.remove(); const i = ENEMIES.indexOf(this); if (i >= 0) ENEMIES.splice(i, 1); if (this.light) removeLight(this.light); }
}
for (const k of ['see', 'aggro', 'applyDmg', 'stReturn']) QuadEnemy.prototype[k] = Enemy.prototype[k];
QuadEnemy.prototype.move = function (sp, dt) { this.qmove(sp, dt); };
// ---------- chama errante / espírito ----------
class WispEnemy extends Actor {
  constructor(type, x, y, z, yaw, lvl = 1, opt = {}) {
    const T = ETYPE[type] || ETYPE.chama;
    super({ team: 'enemy', r: .35, h: .8, hp: Math.round(T.hp * lvl), poise: 5, mass: .3, resist: T.resist, name: T.name });
    this.T = T; this.type = type; this.lvl = lvl; this.opt = opt; this.color = opt.color || 0xff8a3a;
    this.home = new V3(x, y, z); this.pos.set(x, y, z); this.yaw = yaw; this.state = 'idle'; this.cinzas = opt.cinzas ?? Math.round(T.cinzas * lvl); this.hover = opt.hover ?? 1.2;
    this.core = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); this.core.position.y = this.hover; this.root.add(this.core);
    this.halo = glowSprite(this.root, 0, this.hover, 0, 1.6, this.color, .8); this.fl = flame(this.root, 0, this.hover - .25, 0, .7, this.color);
    this.light = addLight(x, y + 1, z, this.color, 2.2, 6); this.life = opt.life || 0; this.speed = opt.speed || T.run;
    this.aggroed = false; ENEMIES.push(this); this.sync();
  }
  get aggroR() { return this.T.aggro; }
  center(out = _v1) { return out.set(this.pos.x, this.pos.y + this.hover, this.pos.z); }
  update(dt) {
    this.stT += dt; const p = PLAYER;
    if (!this.alive) { this.root.visible = false; return; }
    if (this.life) { this.life -= dt; if (this.life <= 0) { this.explode(true); return; } }
    const d = this.dist(p);
    if (this.state === 'idle') { if (this.opt.summoned || (p.alive && d < this.aggroR)) { this.state = 'chase'; this.aggroed = true; sfx('fire', { pos: this.pos, vol: .5 }); } }
    else if (this.state === 'chase') {
      const ty = this.yawTo(p); this.yaw = turnTo(this.yaw, ty, 2.6 * dt);
      const sp = this.speed; this.vel.set(Math.sin(this.yaw) * sp, 0, Math.cos(this.yaw) * sp);
      if (d < (this.opt.blastAt || 1.8)) { this.state = 'charge'; this.stT = 0; this.vel.set(0, 0, 0); sfx('hiss', { pos: this.pos, vol: .6, rate: 1.4 }); }
    } else if (this.state === 'charge') { this.vel.set(0, 0, 0); this.halo.scale.setScalar(1.6 + this.stT * 2); if (this.stT > (this.opt.fuse || .6)) this.explode(false); }
    this.physics(dt, { grav: 0, step: 1.5 });
    this.pos.y = damp(this.pos.y, groundAt(this.pos.x, this.pos.z, this.pos.y + 2, 2) , 6, dt);
    this.core.position.y = this.hover + Math.sin(TIME.now * 3 + this.home.x) * .15; this.halo.position.y = this.core.position.y;
    this.light.x = this.pos.x; this.light.y = this.pos.y + this.hover; this.light.z = this.pos.z;
    if (Math.random() < dt * 25) { const c = new COL(this.color); PFX.glow.emit(this.pos.x + rnd(-.1, .1), this.pos.y + this.core.position.y, this.pos.z + rnd(-.1, .1), rnd(-.3, .3), rnd(.3, 1), rnd(-.3, .3), rnd(.3, .7), rnd(.08, .15), .02, c.r, c.g, c.b, .9, 1, -.5); }
    this.sync();
  }
  explode(quiet) {
    if (!this.alive) return; this.alive = false; this.ghost = true; const x = this.pos.x, y = this.pos.y, z = this.pos.z;
    if (!quiet) { aoe({ x, y, z, r: this.opt.blastR || 2.4, dmg: Math.round(this.T.dmg * this.lvl * (this.opt.dmgMul || 1)), poiseDmg: 30, type: this.opt.type || 'fire', team: 'enemy', owner: this, dur: .12, kb: 6, maxH: 3 }); sfx('explosion', { pos: this.pos, vol: .7 }); flashLight(x, y + 1, z, this.color, 6, 7, .4); }
    burst(x, y + this.hover, z, quiet ? 10 : 34, { color: this.color, smin: 1, smax: quiet ? 2 : 6, lmin: .2, lmax: .6, szmin: .08, szmax: .2 });
    removeLight(this.light); this.fl.on = false; this.root.visible = false;
  }
  takeHit(h) { if (!this.alive) return false; const dmg = dmgAfterResist(this, h); this.hp -= dmg; dmgNumber(this.pos.x, this.pos.y + 1.6, this.pos.z, dmg, ''); if (this.hp <= 0) { this.hp = 0; GAME.onEnemyKilled(this); this.explode(true); } return true; }
  remove() { super.remove(); const i = ENEMIES.indexOf(this); if (i >= 0) ENEMIES.splice(i, 1); removeLight(this.light); this.fl.on = false; }
}
function spawnEnemy(type, x, y, z, yaw = 0, lvl = 1, opt = {}) {
  const T = ETYPE[type]; let e;
  if (T.quad) e = new QuadEnemy(type, x, y, z, yaw, lvl, opt);
  else if (T.wisp) e = new WispEnemy(type, x, y, z, yaw, lvl, opt);
  else e = new Enemy(type, x, y, z, yaw, lvl, opt);
  R.scene.add(e.root); return e;
}
