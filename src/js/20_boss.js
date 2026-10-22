// ===================== CHEFES: ESTRUTURA =====================
let BOSS = null; // chefe ativo
class Boss extends Fighter {
  constructor(id, x, y, z, yaw) {
    const D = BOSSDEF[id];
    const rig = D.build();
    super({ rig, team: 'enemy', r: D.r || .5 * rig.s, h: D.h || 1.8 * rig.s, hp: D.phases[0].hp, poise: 999, mass: D.mass || 6, weapon: D.weapon, twoHand: D.twoHand, hold: D.hold, wscale: D.wscale || 1, offhand: D.offhand, trail: D.trail ?? 0xffe8c8, resist: D.resist, name: D.name });
    this.id = id; this.D = D; this.boss = true; this.phase = 0; this.pos.set(x, y, z); this.yaw = yaw; this.home = new V3(x, y, z); this.homeYaw = yaw;
    this.posture = 0; this.postureMax = D.posture || 300; this.postureT = 0; this.fighting = false; this.move = null; this.cd = 1.2; this.last = null; this.behindT = 0;
    this.state = 'wait'; this.walkSpeed = D.walk || 1.6; this.runSpeed = D.run || 4; this.keep = D.keep || [2, 4]; this.strafe = 1; this.strafeT = 0;
    this.hyper = true; this.cool = {}; this.adds = []; this.baseDmg = (typeof BOSS_DMG_MUL !== 'undefined' && BOSS_DMG_MUL[id]) || 1; this.dmgMul = this.baseDmg; this.hitMat = D.hitMat || 'flesh';
    if (D.init) D.init(this);
    this.rig.root.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !o.material.userData.rim) { const m = rimify(o.material, D.rim || 0xb0a080, 2.6, D.rimStr ?? .35); m.userData.rim = 1; o.material = m; } });
    this.bl = addLight(x, y + 2, z, D.rim || 0xd0c0a0, 1.6, 8 * Math.max(1, this.rig.s * .8), .05);
    this.sync(); R.scene.add(this.root);
  }
  get P() { return this.D.phases[this.phase]; }
  // ----- início do combate -----
  begin(first) {
    BOSS = this; this.fighting = false; const D = this.D; GAME.bossActive = this;
    musicPrefetch([D.music, ...(D.phases.map(p => p.music).filter(Boolean))]);
    const p = PLAYER; this.yaw = this.yawTo(p);
    const go = () => { this.fighting = true; this.state = 'fight'; music(this.P.music || D.music, 1.2); UI.bossBar(this); GAME.cine = false; camRelease(); };
    if (first && D.intro) {
      GAME.cine = true; music(null, .8);
      const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw), hh = this.h;
      camCine({ to: new V3(this.pos.x + fx * hh * 1.6 + fz * hh * .6, this.pos.y + hh * .55, this.pos.z + fz * hh * 1.6 - fx * hh * .6), look: new V3(this.pos.x, this.pos.y + hh * .75, this.pos.z), dur: 2.2 });
      D.intro(this);
      after(.9, () => UI.bossTitle(D.name, D.title));
      if (D.line) after(1.2, () => { UI.subtitle(D.speaker || D.name.split(',')[0], D.line, 4.5); speak(D.line, D.voiceSex || 'f', D.voiceOpt || {}); });
      after(D.introDur || 4.2, go);
    } else { UI.bossTitle(D.name, D.title); after(.8, go); }
  }
  // ----- atualização -----
  update(dt) {
    if (this.bl) { const L = this.bl; L.x = this.pos.x + Math.sin(this.yaw) * 1.6; L.y = this.pos.y + this.h * .95; L.z = this.pos.z + Math.cos(this.yaw) * 1.6; L.pri = this.fighting; L.int = this.alive ? 2.2 : Math.max(0, L.int - dt * .5); }
    this.stT += dt; this.iframe = Math.max(0, this.iframe - dt); this.speedMul = this.D.speed ? this.D.speed(this) : 1;
    for (const k in this.cool) this.cool[k] -= dt; this.hitRecent = Math.max(0, (this.hitRecent || 0) - dt * .45);
    if (this.postureT > 0) this.postureT -= dt; else this.posture = Math.max(0, this.posture - this.postureMax * .06 * dt);
    const p = PLAYER;
    if (!this.alive) { this.vel.set(0, 0, 0); this.deathUpd(dt); return; }
    if (this.state === 'trans') { this.transUpd(dt); }
    else if (this.state === 'broken') { this.vel.set(0, 0, 0); if (this.stT > 2.1) { this.state = 'fight'; this.anim.stop(.3); this.cd = .3; } }
    else if (this.fighting && p.alive) this.fightUpd(dt, p);
    else { this.vel.set(0, 0, 0); if (this.fighting && !p.alive) { this.move = null; this.atk = null; } }
    if (this.D.tick) this.D.tick(this, dt);
    this.physics(dt, { step: .8, grav: this.flying ? 0 : 1 });
    this.anim.update(dt, this.D.extraPose ? this.D.extraPose(this) : null);
    this.sync(); this.weaponIK(dt); this.checkHits(); this.updTrail(); this.updCloth(dt);
    if (this.D.post) this.D.post(this, dt);
  }
  fightUpd(dt, p) {
    const d = this.dist(p), ty = this.yawTo(p);
    if (Math.abs(angDiff(this.yaw, ty)) > 2) this.behindT += dt; else this.behindT = 0;
    if (this.move) {
      const m = this.move; m.t += dt * this.speedMul;
      let r;
      if (m.seq) {
        r = this.updAttack(dt);
        if (this.atk && this.atk.phase === 'act' && this.atk.def.shock && !this.atk.shocked && this.atk.t > this.atk.def.wind + this.atk.def.act * .75) { this.atk.shocked = true; this.slam(this.atk.def.shock, this.atk.def); }
        if (r === 'done') {
          m.i++;
          if (m.i < m.seq.length && (!m.seq[m.i].cond || m.seq[m.i].cond(this, p))) { const def = m.seq[m.i]; this.attack(def, p); this.atk.mul = def.mul || 1; if (def.onStart) def.onStart(this, p); }
          else r = 'end';
        }
      } else r = m.update(this, p, dt, m);
      if (r === 'end' || r === 'done' && !m.seq) { this.endMove(m); }
      return;
    }
    // aproximação / circulação
    this.cd -= dt * this.speedMul;
    const [kmin, kmax] = this.P.keep || this.keep;
    this.turn(ty, this.D.turn || 3.2, dt);
    if (d > kmax + 2) this.walk(d > 9 ? this.runSpeed : this.walkSpeed * 1.2, dt, 1, 0);
    else if (d < kmin - .5 && this.P.backoff) this.walk(this.walkSpeed, dt, -1, 0);
    else { this.strafeT -= dt; if (this.strafeT <= 0) { this.strafeT = rnd(1.2, 2.5); this.strafe = Math.random() < .5 ? 1 : -1; } this.walk(this.walkSpeed * .7, dt, d > kmax ? .6 : 0, this.strafe); }
    if (this.cd <= 0) this.choose(p, d);
  }
  walk(sp, dt, f, s) {
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    this.vel.set((fx * f + Math.cos(this.yaw) * s * -1 * 0 + fz * s) * sp * this.speedMul, 0, (fz * f - fx * s) * sp * this.speedMul);
    const mag = Math.hypot(f, s) * sp; this.anim.fx = f; this.anim.sx = -s;
    this.anim.amt = damp(this.anim.amt, mag < .05 ? 0 : mag < 2.3 ? mag / 1.6 : 1 + (mag - 1.8) / 2.5, 6, dt); this.anim.ph += dt * mag / (1.3 * this.rig.s) * PI * this.speedMul;
    this._fp = this._fp || 0; const fp = Math.floor(this.anim.ph / PI); if (fp !== this._fp && mag > .5 && !this.flying) { this._fp = fp; sfx(this.D.step || ('step' + rndi(1, 4)), { pos: this.pos, vol: .45, rate: 1 / Math.sqrt(this.rig.s), jit: .08 }); if (this.rig.s > 1.6) shake(.03); }
  }
  choose(p, d) {
    const moves = this.P.moves.filter(m => (!m.rng || (d >= m.rng[0] && d <= m.rng[1])) && !(this.cool[m.id] > 0) && (!m.cond || m.cond(this, p)));
    if (!moves.length) { this.cd = .3; return; }
    let pool = moves;
    // punições
    if (p.state === 'flask' && d < 12) { const pun = moves.filter(m => m.punish); if (pun.length) pool = pun; }
    else if (this.behindT > 1.1) { const tb = moves.filter(m => m.turn); if (tb.length) pool = tb; }
    const ws = pool.map(m => (m.w || 1) * (m.id === this.last ? .35 : 1));
    let r = Math.random() * ws.reduce((a, b) => a + b, 0), m = pool[0];
    for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) { m = pool[i]; break; } }
    this.startMove(m, p);
  }
  startMove(m, p) {
    this.last = m.id; this.cool[m.id] = m.cd || 0;
    const mv = { m, t: 0, i: 0, data: {} }; this.move = mv;
    if (m.seq) { mv.seq = m.seq; const def = m.seq[0]; this.attack(def, p); this.atk.mul = def.mul || 1; if (def.onStart) def.onStart(this, p); if (m.voice) this.voice(m.voice); }
    else { mv.update = m.update; m.start && m.start(this, p, mv); if (m.voice) this.voice(m.voice); }
  }
  endMove(mv) { this.move = null; this.atk = null; const m = mv.m; this.cd = (m.after ?? rnd(.45, 1.1)) * (this.P.aggr || 1) * BOSS_AGGR; this.anim.amt = 0; }
  voice(k) { const v = this.D.voices && this.D.voices[k]; if (v) sfxCD('bv_' + this.id + k, 1, pick(v), { pos: this.pos, vol: .85, jit: .05, rate: this.D.voiceRate || 1 }); }
  dmgFor(d) { return Math.round((d.dmg || 100) * (this.atk && this.atk.mul || 1) * this.dmgMul * rnd(.95, 1.05)); }
  slam(r, def) {
    const off = def.slamOff ?? 1.3 * this.rig.s, x = this.pos.x + Math.sin(this.yaw) * off, z = this.pos.z + Math.cos(this.yaw) * off;
    aoe({ x, y: this.pos.y, z, r, dmg: Math.round((def.dmg || 100) * .6 * this.dmgMul), poiseDmg: 40, team: 'enemy', owner: this, kb: 7, dur: .12, type: def.type || 'phys', status: def.status });
    ringFx(x, this.pos.y, z, .4, r * 1.3, .55, def.ringColor || 0xd8c8a8, .9);
    burst(x, this.pos.y + .1, z, 26, { add: false, color: 0x6b6458, smin: 1, smax: 6, lmin: .4, lmax: 1, szmin: .2, szmax: .45, upBias: .7, alpha: .5, grav: 5 });
    if (def.type === 'fire') burst(x, this.pos.y + .2, z, 20, { color: 0xff7a2a, smin: 2, smax: 6, lmin: .3, lmax: .7 });
    sfx('quake', { pos: this.pos, vol: .8 }); synth('boom', .6); shake(.35);
    def.onSlam && def.onSlam(this, x, z);
  }
  // ----- dano -----
  takeHit(h) {
    if (!this.alive || this.state === 'trans' || this.invuln) return false;
    if (this.iframe > 0) return 'dodge';
    if (!h.env) this.hitRecent = (this.hitRecent || 0) + 1;
    let dmg = dmgAfterResist(this, h), crit = false;
    if (this.state === 'broken' && h.from && h.from.isPlayer && !h.proj) { dmg = Math.round(dmg * 1.6); crit = true; this.state = 'fight'; this.anim.stop(.2); this.cd = .4; }
    this.hp -= dmg; this.flash = .1;
    const c = this.center(_v3); dmgNumber(c.x, c.y + this.h * .25, c.z, dmg, crit ? 'crit' : h.type !== 'phys' ? h.type : '');
    hitFx(this, h, crit); if (crit) { UI.toast('Golpe crítico!'); hitStop(.14); sfx('crunch', { pos: this.pos, vol: .9, rate: .8 }); }
    this.voice('hurt');
    if (!crit && this.state !== 'broken') { this.posture += (h.poiseDmg || 10) * (this.D.postureMul || 1); this.postureT = 2.2; if (this.posture >= this.postureMax && this.hp > 0) { this.breakPosture(); } }
    UI.bossHit(this, dmg);
    if (this.hp <= 0) {
      const P = this.D.phases;
      if (this.phase + 1 < P.length && P[this.phase].next === 'bar') { this.hp = 1; this.beginTrans(); }
      else { this.hp = 0; this.die(h); }
    } else if (this.phase + 1 < this.D.phases.length && this.D.phases[this.phase].next !== 'bar' && this.hp <= this.maxHp * (this.D.phases[this.phase].until ?? .5)) this.beginTrans();
    return true;
  }
  breakPosture() {
    this.posture = 0; this.move = null; this.atk = null; this.state = 'broken'; this.stT = 0; this.vel.set(0, 0, 0);
    this.anim.play(CLIP.kneel); sfx('crunch', { pos: this.pos, vol: 1, rate: .7 }); synth('boom', .4); shake(.25);
    burst(this.pos.x, this.pos.y + this.h * .6, this.pos.z, 30, { color: 0xf3d27a, smin: 1, smax: 5, lmin: .3, lmax: .8 }); UI.toast('Postura quebrada! Ataca para um golpe crítico.');
    this.voice('stagger');
  }
  beginTrans() {
    const next = this.D.phases[this.phase + 1]; this.move = null; this.atk = null; this.state = 'trans'; this.stT = 0; this.vel.set(0, 0, 0); this.transDone = false;
    this.posture = 0; CLEAR_HOSTILE_FX();
    if (next.music && next.music !== this.P.music) music(next.music, 2);
    next.trans && next.trans.start && next.trans.start(this);
    if (next.line) after(.4, () => { UI.subtitle(this.D.speaker || this.D.name.split(',')[0], next.line, 4); speak(next.line, this.D.voiceSex || 'f', this.D.voiceOpt || {}); });
    if (next.title) after(.8, () => UI.bossTitle(next.title, next.subtitle || '', true));
  }
  transUpd(dt) {
    const next = this.D.phases[this.phase + 1], T = next.trans || {};
    this.vel.set(0, 0, 0);
    if (T.update) T.update(this, dt, this.stT);
    if (this.stT >= (T.dur || 2.4) && !this.transDone) {
      this.transDone = true; this.phase++; this.state = 'fight'; this.cd = .6;
      if (next.next === 'bar' || this.D.phases[this.phase - 1].next === 'bar') { this.maxHp = next.hp; this.hp = next.hp; UI.bossBar(this); }
      if (next.walk) this.walkSpeed = next.walk; if (next.run) this.runSpeed = next.run; if (next.dmgMul) this.dmgMul = next.dmgMul * this.baseDmg; if (next.keep) this.keep = next.keep;
      T.end && T.end(this); this.anim.stop(.3);
    }
  }
  die(h) {
    this.alive = false; this.state = 'dead'; this.stT = 0; this.move = null; this.atk = null; this.fighting = false; this.ghost = true;
    CLEAR_HOSTILE_FX(); for (const a of this.adds) if (a.alive) { a.takeHit({ dmg: 99999 }); }
    slowMo(.35, 1.4); this.anim.play(this.D.deathClip || CLIP.die, { hold: true }); this.voice('die');
    music(null, 2.5); stopSpeech();
    if (this.D.deathLine) after(1.2, () => { UI.subtitle(this.D.speaker || this.D.name.split(',')[0], this.D.deathLine, 5); speak(this.D.deathLine, this.D.voiceSex || 'f', Object.assign({ rate: .8 }, this.D.voiceOpt || {})); });
    after(.5, () => { synth('victory'); UI.bigBanner('GRANDE INIMIGO ABATIDO', 'gold', 4); });
    GAME.onBossKilled(this);
  }
  deathUpd(dt) {
    this.anim.update(dt); this.sync(); this.weaponIK(dt);
    if (this.stT > .4 && this.stT < 3.4 && Math.random() < dt * 40) { const c = this.center(_v3); burst(c.x + rnd(-.5, .5) * this.rig.s, c.y + rnd(-.6, .6) * this.rig.s, c.z + rnd(-.5, .5) * this.rig.s, 2, { add: Math.random() < .4, color: Math.random() < .4 ? 0xffa050 : 0x8a847a, smin: .2, smax: 1, upBias: 1.5, lmin: 1, lmax: 2, szmin: .05, szmax: .15, alpha: .8, drag: 1 }); }
    if (this.stT > 3.4 && !this.dissolved) { this.dissolved = true; const c = this.center(_v3); burst(c.x, c.y, c.z, 120, { add: false, color: 0x8a847a, color2: 0x4a4640, smin: .5, smax: 3, upBias: 1.2, lmin: 1, lmax: 2.5, szmin: .08, szmax: .2, jit: this.rig.s, jy: 2, alpha: .8, drag: 1 }); burst(c.x, c.y, c.z, 50, { color: 0xffb060, smin: .5, smax: 3, upBias: 1.5, lmin: 1, lmax: 2.2, jit: this.rig.s }); this.root.visible = false; if (this.D.onVanish) this.D.onVanish(this); if (this.trail) this.trail.fade(); }
  }
  // ----- utilitários de golpes -----
  aimAt(p, lead = 0) { return new V3(p.pos.x + p.vel.x * lead, p.pos.y, p.pos.z + p.vel.z * lead); }
  handW(side = 'R') { this.rig.J['hand' + side].getWorldPosition(_v3); return _v3.clone(); }
  tipW() { return this.curT.clone(); }
  teleportTo(x, z, color = 0xc0a0ff, snd = 'tele') {
    burst(this.pos.x, this.pos.y + this.h * .5, this.pos.z, 34, { color, smin: 1, smax: 4, lmin: .3, lmax: .8, jit: this.r });
    const g = groundAt(x, z, this.pos.y + 3, 4); this.pos.set(x, g > -1e8 ? g : this.pos.y, z);
    burst(this.pos.x, this.pos.y + this.h * .5, this.pos.z, 34, { color, smin: 1, smax: 4, lmin: .3, lmax: .8, jit: this.r }); sfx(snd, { pos: this.pos, vol: .7 }); flashLight(x, this.pos.y + 1.5, z, color, 5, 8, .4);
  }
  arenaPoint(minD, maxD, from) { const A = this.D.arena; for (let i = 0; i < 30; i++) { const a = rnd(0, TAU), r = rnd(minD, maxD), x = from.x + Math.sin(a) * r, z = from.z + Math.cos(a) * r; if (Math.hypot(x - A.x, z - A.z) < A.r - 2 && validSpot(x, this.pos.y, z)) return [x, z]; } return [A.x, A.z]; }
  leapTo(x, z, T, h) { this.leap = { sx: this.pos.x, sz: this.pos.z, sy: this.pos.y, tx: x, tz: z, T, h, t: 0 }; this.flying = true; }
  leapUpd(dt) {
    const L = this.leap; if (!L) return true; L.t += dt; const k = Math.min(1, L.t / L.T);
    const nx = lerp(L.sx, L.tx, k), nz = lerp(L.sz, L.tz, k); this.vel.set(0, 0, 0); this.pos.x = nx; this.pos.z = nz;
    const gy = groundAt(nx, nz, L.sy + L.h + 2, 30); this.pos.y = lerp(L.sy, gy > -1e8 ? gy : L.sy, k) + Math.sin(k * PI) * L.h; resolveCircle(this);
    if (k >= 1) { this.leap = null; this.flying = false; this.vy = 0; this.onGround = true; return true; }
    return false;
  }
}
function CLEAR_HOSTILE_FX() { for (const a of AOES.slice()) if (a.team === 'enemy') AOES.splice(AOES.indexOf(a), 1); for (const p of PROJ) if (p.team === 'enemy') { p.dead = true; p.destroy(); } }
// ---------- ataques auxiliares (projéteis e áreas) ----------
function bossOrb(b, from, dir, o = {}) {
  return new Projectile(Object.assign({ pos: from, vel: dir.clone().normalize().multiplyScalar(o.speed || 12), r: o.r || .25, dmg: o.dmg || 80, poiseDmg: o.poise || 20, type: o.type || 'magic', team: 'enemy', owner: b, mesh: orbMesh(o.r || .22, o.color || 0xb090ff, o.core || 0xffffff), light: o.light ?? 1.5, lightR: 5, color: o.color || 0xb090ff, trailRate: o.trail ?? 18, life: o.life || 4, kb: o.kb ?? 3, homing: o.homing || 0, target: o.homing ? PLAYER : null }, o.extra || {}));
}
function orbRing(b, n, speed, o = {}) { const c = b.center(new V3()); c.y = b.pos.y + (o.h ?? 1.2); const off = o.off ?? rnd(0, TAU); for (let i = 0; i < n; i++) { const a = off + i / n * TAU; bossOrb(b, c.clone(), new V3(Math.sin(a), 0, Math.cos(a)), Object.assign({ speed }, o)); } }
function orbFan(b, n, spread, speed, o = {}) { const from = o.from || b.handW('L'); const base = Math.atan2(PLAYER.pos.x - from.x, PLAYER.pos.z - from.z); const dy = (PLAYER.pos.y + 1.1 - from.y) / Math.max(1, b.dist(PLAYER)); for (let i = 0; i < n; i++) { const a = base + (n > 1 ? (i / (n - 1) - .5) * spread : 0); bossOrb(b, from.clone(), new V3(Math.sin(a), dy, Math.cos(a)), Object.assign({ speed }, o)); } }
function lineAoe(b, x, z, yaw, len, w, delay, o = {}) {
  // marcador em linha
  const g = new THREE.PlaneGeometry(w, len); g.translate(0, len / 2, 0); g.rotateX(-HPI);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: o.tele || 0xff5a28, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.position.set(x, (o.y ?? b.pos.y) + .06, z); m.rotation.y = yaw; R.scene.add(m); let t = 0;
  FX.list.push({ obj: m, update: dt => { t += dt; m.material.opacity = Math.min(.5, t / delay * .5) * (t > delay ? Math.max(0, 1 - (t - delay) * 5) : 1); return t < delay + .25; }, dispose: () => { g.dispose(); m.material.dispose(); } });
  return aoe(Object.assign({ shape: 'line', x, y: o.y ?? b.pos.y, z, yaw, len, w, delay, dur: o.dur || .15, dmg: o.dmg || 100, poiseDmg: o.poise || 40, type: o.type || 'phys', team: 'enemy', owner: b, kb: o.kb ?? 6, status: o.status }, o.extra || {}));
}
function strikeAt(b, x, z, r, delay, o = {}) {
  const y = groundAt(x, z, b.pos.y + 4, 8); const yy = y > -1e8 ? y : b.pos.y;
  return aoe(Object.assign({ x, y: yy, z, r, delay, dur: o.dur || .15, tick: o.tick || 0, dmg: o.dmg || 100, poiseDmg: o.poise || 40, type: o.type || 'phys', team: 'enemy', owner: b, kb: o.kb ?? 6, tele: o.tele !== false, teleColor: o.color || 0xff5a28, status: o.status, maxH: o.maxH || 4, up: o.up,
    onFire: a => { o.fx ? o.fx(a.x, a.y, a.z) : null; } }, o.extra || {}));
}
// efeitos visuais prontos
const BFX = {
  lightning(x, y, z) {
    const pts = []; let px = x, pz = z; for (let i = 0; i <= 10; i++) { pts.push(new V3(px, y + 14 - i * 1.4, pz)); px += rnd(-.5, .5); pz += rnd(-.5, .5); } pts[10].set(x, y, z);
    const g = new THREE.BufferGeometry().setFromPoints(pts); const ln = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xe0eaff, transparent: true, blending: THREE.AdditiveBlending })); R.scene.add(ln);
    let t = 0; FX.list.push({ obj: ln, update: dt => { t += dt; ln.material.opacity = 1 - t / .3; return t < .3; }, dispose: () => { g.dispose(); ln.material.dispose(); } });
    burst(x, y + .2, z, 26, { color: 0xc0d8ff, color2: 0xffffff, smin: 2, smax: 7, lmin: .1, lmax: .4 }); flashLight(x, y + 3, z, 0xc8d8ff, 14, 16, .35); ringFx(x, y, z, .3, 2.8, .4, 0xc0d8ff, .9);
    sfx('lightning', { pos: new V3(x, y, z), vol: .9 }); shake(.2); GAME.flash = Math.max(GAME.flash || 0, .5);
  },
  fireCol(x, y, z, r = 1) { pillarFx(x, y, z, r * .8, 6, .7, 0xff7a2a); burst(x, y + .3, z, 24, { color: 0xff8a2a, color2: 0xffe0a0, smin: 1, smax: 5, upBias: 1.5, lmin: .4, lmax: .9, szmin: .12, szmax: .3, jit: r * .5 }); flashLight(x, y + 1.5, z, 0xff7020, 6, 7, .5); sfx('flame_big', { pos: new V3(x, y, z), vol: .6, jit: .1 }); },
  holyCol(x, y, z, r = 1) { pillarFx(x, y, z, r * .9, 12, .8, 0xfff0b0); burst(x, y + .3, z, 24, { color: 0xfff0c0, smin: 1, smax: 5, upBias: 1.5, lmin: .4, lmax: .9, jit: r * .5 }); flashLight(x, y + 2, z, 0xfff0c0, 8, 9, .5); sfx(pick(['holy1', 'holy2', 'holy3']), { pos: new V3(x, y, z), vol: .7 }); },
  darkCol(x, y, z, r = 1) { pillarFx(x, y, z, r * .8, 5, .7, 0x6a3aff); burst(x, y + .3, z, 24, { color: 0x8a5aff, color2: 0x200a40, smin: 1, smax: 5, upBias: 1.2, lmin: .4, lmax: .9, jit: r * .5 }); sfx('dark_big', { pos: new V3(x, y, z), vol: .6 }); },
  ash(x, y, z, r = 1) { burst(x, y + .2, z, 30, { add: false, color: 0x6b6458, smin: 1, smax: 5, upBias: 1, lmin: .4, lmax: 1, szmin: .15, szmax: .4, alpha: .6, jit: r * .4, grav: 4 }); sfx('quake', { pos: new V3(x, y, z), vol: .5 }); },
};
