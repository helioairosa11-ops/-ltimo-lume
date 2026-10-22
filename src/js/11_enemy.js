// ===================== INIMIGOS: estrutura comum, IA e golpes =====================
const EDEF = {}; // definições por tipo (preenchidas nos ficheiros seguintes)
class Enemy extends Actor {
  constructor(type, x, y, opt = {}) {
    const D = EDEF[type]; const lv = opt.lvl || (ROOM.cur && ROOM.cur.def.lvl) || 1;
    super({ x, y, w: D.w, h: D.h, hp: Math.round(D.hp * lv), team: 'enemy', grav: D.fly ? 0 : 1, mass: D.mass || 1, face: opt.face || (Math.random() < .5 ? -1 : 1) });
    this.type = type; this.D = D; this.opt = opt; this.lv = lv; this.home = { x, y }; this.cd = rnd(.4, 1.2); this.move = null; this.aggro = false; this.lostT = 0; this.ph = rnd(0, TAU);
    this.poiseMax = D.poise || 20; this.poise = this.poiseMax; this.walkPh = 0; this.tele = 0; this.alert = 0; this.cinzas = Math.round((D.cinzas || 10) * (1 + (lv - 1) * .7));
    this.state = opt.sleep ? 'sleep' : D.hidden ? 'hidden' : D.statue ? 'statue' : 'idle';
    if (this.state === 'hidden' || this.state === 'statue') this.noHit = D.hidden ? true : false;
    ENEMIES.push(this); D.init && D.init(this);
  }
  get P() { return PLAYER; }
  dmg(base) { return Math.round(base * (1 + (this.lv - 1) * .55)); }
  update(dt) {
    this.st += dt; this.flash = Math.max(0, this.flash - dt * 5); this.inv = Math.max(0, this.inv - dt); this.cd -= dt; this.tele = Math.max(0, this.tele - dt * 3); this.alert = Math.max(0, this.alert - dt);
    const p = PLAYER, D = this.D;
    if (this.state === 'dead') { this.vx *= Math.exp(-6 * dt); if (!D.fly) this.physics(dt); if (this.st > .55) this.remove(); return; }
    if (this.state === 'stagger') { this.vx *= Math.exp(-5 * dt); if (D.fly) { this.vy *= Math.exp(-5 * dt); this.flyMove(dt); } else this.physics(dt); if (this.st > (this.stagT || .45)) { this.setState(this.aggro ? 'chase' : 'idle'); this.poise = this.poiseMax; } return; }
    if (this.state === 'sleep' || this.state === 'hidden' || this.state === 'statue') {
      this.vx = 0; if (!D.fly && this.state !== 'hidden') this.physics(dt);
      if (p && p.alive && Math.abs(p.x - this.x) < (this.opt.trigger || D.trigger || 90) && Math.abs(p.y - this.y) < 70) this.wake();
      return;
    }
    if (this.state === 'emerge') { this.vx = 0; if (!D.fly) this.physics(dt); if (this.st > (D.emergeT || .7)) { this.setState('chase'); this.noHit = false; } return; }
    // percepção
    if (p && p.alive) {
      const dx = p.x - this.x, dy = p.cy - this.cy, d = Math.hypot(dx, dy);
      const sees = d < (D.sight || 230) && Math.abs(dy) < (D.sightY || 110) && (this.aggro || Math.sign(dx) === this.face || d < 70) && losClear(this.x, this.cy - 6, p.x, p.cy - 6);
      if (sees) { if (!this.aggro) this.onAggro(); this.lostT = 0; } else if (this.aggro) { this.lostT += dt; if (this.lostT > 4 || d > (D.sight || 230) * 2.5) { this.aggro = false; this.move = null; } }
    } else this.aggro = false;
    if (this.move) this.updMove(dt);
    else if (D.ai) D.ai(this, dt, p);
    else if (D.fly) this.aiFly(dt, p); else this.aiWalk(dt, p);
    if (D.fly) this.flyMove(dt); else this.physics(dt);
    // dano por contacto
    if (D.touch && p && p.alive && !this.noTouch && overlaps(this.box(), p.box())) p.takeHit({ dmg: this.dmg(D.touch), kb: 200, dir: Math.sign(p.x - this.x) || 1, from: this, type: D.touchType || 'phys' });
    if (D.light) light(this.x, this.cy, D.light[0], D.light[1], D.light[2] ?? .8, .1);
    if (D.tick) D.tick(this, dt, p);
    if (this.y > ROOM.cur.h * T + 200) this.remove();
  }
  wake() { const D = this.D; this.face = Math.sign(PLAYER.x - this.x) || 1; this.setState('emerge'); this.noHit = false; this.onAggro(); D.onWake && D.onWake(this); if (D.hidden) { burst(this.x, this.y - 4, 18, { color: [0x2a3a28, 0x3a4a30, 0x9ab0a0], glow: false, dir: -HPI, spread: 1, smin: 60, smax: 180, grav: 500 }); sfx('water', at(this, .6)); } }
  onAggro() { this.aggro = true; this.alert = .6; if (this.D.voice) voxCry(this.D.voice, 'atk', { vol: .5 }); else if (this.D.sndAggro) sfx(this.D.sndAggro, at(this, .5)); if (this.cd < .5) this.cd = rnd(.4, .8); }
  // ---------- IA: andar ----------
  aiWalk(dt, p) {
    const D = this.D; this.walkPh += dt * Math.abs(this.vx) / 14;
    if (!this.aggro) {
      if (this.opt.still || D.still) { this.vx = approach(this.vx, 0, 600 * dt); return; }
      const r = (this.opt.range || D.patrol || 4) * T; const sp = D.walk || 40;
      if (this.x > this.home.x + r) this.face = -1; else if (this.x < this.home.x - r) this.face = 1;
      if (this.hitWall || this.edgeAhead()) this.face *= -1;
      this.vx = approach(this.vx, this.face * sp, 400 * dt); return;
    }
    const dx = p.x - this.x, ad = Math.abs(dx); this.face = Math.sign(dx) || this.face;
    // escolher golpe
    if (this.cd <= 0 && D.moves) { const m = this.pickMove(ad, Math.abs(p.y - this.y)); if (m) { this.startMove(m); return; } }
    const keep = D.keep || [0, 40]; let want = 0;
    if (ad > keep[1]) want = this.face; else if (ad < keep[0]) want = -this.face;
    if (want && this.edgeAhead(want)) want = 0;
    this.vx = approach(this.vx, want * (D.run || 90), 900 * dt);
  }
  // ---------- IA: voar ----------
  aiFly(dt, p) {
    const D = this.D; this.ph += dt;
    if (!this.aggro) { const tx = this.home.x + Math.sin(this.ph * .7) * 40, ty = this.home.y + Math.sin(this.ph * 1.3) * 14; this.vx = approach(this.vx, (tx - this.x) * 2, 300 * dt); this.vy = approach(this.vy, (ty - this.y) * 2, 300 * dt); return; }
    this.face = Math.sign(p.x - this.x) || this.face;
    if (this.cd <= 0 && D.moves) { const m = this.pickMove(Math.abs(p.x - this.x), Math.abs(p.y - this.y)); if (m) { this.startMove(m); return; } }
    const off = D.hover || [-70, 90]; const tx = p.x + (this.x < p.x ? -1 : 1) * off[1] * .8, ty = p.y + off[0] + Math.sin(this.ph * 2) * 12;
    const sp = D.run || 110; const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy) || 1;
    this.vx = approach(this.vx, dx / d * Math.min(sp, d * 3), 500 * dt); this.vy = approach(this.vy, dy / d * Math.min(sp, d * 3), 500 * dt);
  }
  flyMove(dt) { moveActor(this, dt); }
  edgeAhead(dir = this.face) { if (this.D.fly) return false; const x = this.x + dir * (this.w / 2 + 6), y = this.y + 4; const c = cellAt(Math.floor(x / T), Math.floor(y / T)); const c2 = cellAt(Math.floor(x / T), Math.floor((y + T) / T)); return !(SOLID[c] || c === 4) && !(SOLID[c2] || c2 === 4) || c === 5 || (c >= 6 && c <= 8 && !this.D.swim); }
  pickMove(dx, dy) {
    const ms = this.D.moves.filter(m => (!m.range || (dx >= m.range[0] && dx <= m.range[1])) && (!m.dy || dy <= m.dy) && !(this['cd_' + m.id] > TIME.now) && (!m.cond || m.cond(this, PLAYER)));
    if (!ms.length) return null; let tot = ms.reduce((a, m) => a + (m.w || 1), 0), r = Math.random() * tot; for (const m of ms) { r -= m.w || 1; if (r <= 0) return m; } return ms[0];
  }
  startMove(m) { this.move = { m, t: 0, phase: 'wind', fired: false, data: {} }; this.tele = 1; if (m.track !== false && PLAYER) this.face = Math.sign(PLAYER.x - this.x) || this.face; if (m.start) m.start(this, PLAYER, this.move); if (m.snd) sfx(m.snd, at(this, .5)); if (m.voice && this.D.voice) voxCry(this.D.voice, 'atk', { vol: .5 }); }
  updMove(dt) {
    const mv = this.move, m = mv.m, p = PLAYER; mv.t += dt; const wind = m.wind ?? .4, act = m.act ?? .12, rec = m.rec ?? .4;
    if (mv.phase === 'wind') { if (!this.D.fly) this.vx = approach(this.vx, 0, 800 * dt); if (m.trackWind && p) this.face = Math.sign(p.x - this.x) || this.face; if (mv.t >= wind) { mv.phase = 'act'; mv.t2 = 0; this.fireMove(mv); } }
    else if (mv.phase === 'act') { mv.t2 += dt; if (m.lunge !== undefined) this.vx = this.face * m.lunge; if (mv.t2 >= act) { mv.phase = 'rec'; mv.t3 = 0; if (m.lunge) this.vx *= .25; } }
    else { mv.t3 += dt; if (!this.D.fly) this.vx = approach(this.vx, 0, 900 * dt); if (mv.t3 >= rec) { this.move = null; this.cd = (m.cd ?? 1.2) * rnd(.75, 1.25); if (m.cdOwn) this['cd_' + m.id] = TIME.now + m.cdOwn; } }
    if (m.upd) m.upd(this, p, dt, mv);
  }
  fireMove(mv) {
    const m = mv.m; mv.fired = true;
    if (m.hit) { const h = m.hit; hitbox({ owner: this, team: 'enemy', ox: h.ox, oy: h.oy, w: h.w, h: h.h, life: h.life ?? m.act ?? .12, dmg: this.dmg(h.dmg), kb: h.kb ?? 220, kby: h.kby ?? -200, type: h.type || 'phys', unblock: h.unblock }); if (h.fx !== false) slashFx(this.x + this.face * (h.fxo ?? 8), this.y + h.oy, this.face, h.ang ?? 0, h.len ?? h.w * .8, h.wid ?? 7, h.color ?? 0xfff0e0, .14, { alpha: .7 }); }
    if (m.fire) m.fire(this, PLAYER, mv);
    if (m.sndAct) sfx(m.sndAct, at(this, .55, { jit: .08 })); else if (m.hit) sfx('swing' + rndi(1, 3), at(this, .45, { rate: .85, jit: .08 }));
  }
  takeHit(h) {
    if (!this.alive || this.state === 'dead' || this.noHit) return false;
    const D = this.D;
    // escudo: bloqueia golpes de frente (o golpe de cima, o forte e os de trás passam)
    if (D.shield && !h.unblock && !h.heavy && !h.proj && this.state !== 'stagger' && h.from && Math.sign(h.from.x - this.x) === this.face && !(h.from.y < this.y - this.h - 4)) {
      this.vx = -this.face * 90; this.guardHits = (this.guardHits || 0) + 1; synth('clang'); burst(this.x + this.face * 12, this.cy, 8, { color: [0xfff0c0, 0xffc080], smin: 60, smax: 200, lmin: .1, lmax: .25 });
      if (this.guardHits >= (D.guardBreak || 4)) { this.guardHits = 0; this.stagger(.8); UI.toast('Guarda quebrada!', 1.2); }
      return 'block';
    }
    let dmg = h.dmg * (D.resist && D.resist[h.type] ? 1 - D.resist[h.type] : 1);
    const back = h.from && Math.sign(h.from.x - this.x) === -this.face && !this.aggro;
    if (back) { dmg *= 1.5; h.crit = true; }
    dmg = Math.max(1, Math.round(dmg)); this.hp -= dmg; this.flash = 1;
    dmgNum(this.x, this.y - this.h - 6, dmg, h.crit ? 'crit' : h.type === 'fire' ? 'fire' : h.type === 'holy' ? 'holy' : '');
    if (!this.aggro) this.onAggro(); this.lostT = 0;
    if (D.sndHurt) sfx(pick(D.sndHurt), at(this, .55, { jit: .08 })); else sfx('hit_sword', at(this, .5, { jit: .1 }));
    burst(h.x ?? this.x, h.y ?? this.cy, 10, { color: D.blood || [0xf0e8d8, 0xfff6e0], smin: 60, smax: 220, lmin: .12, lmax: .3, dir: Math.atan2(-.3, h.dir || 1), spread: .9, szmin: 1, szmax: 2.5 });
    if (this.hp <= 0) { this.die(h); return true; }
    if (!D.superArmor) { this.vx = (h.dir || 1) * (h.kb || 150) * .55 / this.mass; if (D.fly) this.vy = -60; }
    this.poise -= h.poise || 10; if (this.poise <= 0 && !D.superArmor) this.stagger(.45);
    else if (this.poise <= 0) { this.poise = this.poiseMax; }
    return true;
  }
  stagger(t) { this.move = null; this.setState('stagger'); this.stagT = t; this.poise = this.poiseMax; }
  die(h) {
    const D = this.D; this.setState('dead'); this.move = null; this.noHit = true; this.vx = (h && h.dir || 1) * 120;
    if (D.sndDie) sfx(D.sndDie, at(this, .7)); if (D.voice) voxCry(D.voice, 'die', { vol: .5 });
    ashDeath(this, D.ash || 0x8a847a, D.big ? 50 : 26); hitStop(.05); shake(D.big ? 5 : 2);
    GAME.onEnemyKilled(this); D.onDie && D.onDie(this);
  }
  draw(c) {
    const D = this.D; if (this.state === 'hidden' && !D.drawHidden) return;
    FL = this.flash; c.save();
    if (this.state === 'dead') c.globalAlpha = clamp(1 - this.st / .55, 0, 1);
    c.translate(this.x, this.y); c.scale(this.face, 1);
    D.draw(c, this, G.t);
    if (this.tele > 0 && this.move && this.move.phase === 'wind') { c.globalCompositeOperation = 'lighter'; c.globalAlpha = this.tele * .9; const g = D.glint || [6, -this.h + 8]; c.drawImage(glowSpr(0xffffff), g[0] - 9, g[1] - 9, 18, 18); c.fillStyle = '#fff'; c.fillRect(g[0] - 6, g[1] - .5, 12, 1); c.fillRect(g[0] - .5, g[1] - 6, 1, 12); }
    c.restore(); FL = 0;
  }
}
// projétil inimigo apontado ao jogador
function shootAt(e, sp, o = {}) { const p = PLAYER; const sx = e.x + e.face * (o.ox || 10), sy = e.y + (o.oy ?? -e.h * .6); const a = Math.atan2(p.cy - sy, p.x - sx) + (o.spread || 0); return new Proj(Object.assign({ x: sx, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, team: 'enemy', owner: e, dmg: e.dmg(o.dmg || 12) }, o.p || {})); }
// pernas simples para andar
function legs(c, e, w, len, color, gap = 4) { const ph = e.walkPh, a = Math.sin(ph) * (Math.abs(e.vx) > 5 ? 1 : 0); c.fillStyle = col(color); c.fillRect(-gap - w / 2 + a * 3, -len, w, len - Math.max(0, Math.cos(ph)) * 2 * Math.abs(a)); c.fillRect(gap - w / 2 - a * 3, -len, w, len - Math.max(0, -Math.cos(ph)) * 2 * Math.abs(a)); }
