// ===================== CHEFES: estrutura =====================
const BOSSDEF = {};
class Boss extends Actor {
  constructor(id, x, y) {
    const D = BOSSDEF[id];
    super({ x, y, w: D.w, h: D.h, hp: D.phases[0].hp, team: 'enemy', mass: D.mass || 4, grav: D.fly ? 0 : 1 });
    this.id = id; this.D = D; this.isBoss = this.boss = true; this.name = D.name; this.phase = 0; this.posture = 0; this.postureMax = D.posture || 200; this.postureT = 0;
    this.fighting = false; this.move = null; this.cd = 1; this.face = -1; this.home = { x, y }; this.state = 'wait'; this.pose = 'idle'; this.poseT = 0; this.poseD = .3; this.dmgMul = 1; this.speedMul = 1; this.adds = []; this.last = null; this.cool = {}; this.walkPh = 0; this.hitRecent = 0; this.ph = 0;
    const R = ROOM.cur, A = R.def.arena || [1, R.w - 2]; this.arena = { x0: A[0] * T, x1: (A[1] + 1) * T, floor: y };
    this.noHit = true; ENEMIES.push(this); GAME.boss = this; D.init && D.init(this);
    GAME.zones.push({ x0: this.arena.x0 + 2.5 * T, x1: this.arena.x1 - 2.5 * T, y0: -1e9, y1: 1e9, fn: () => this.begin() });
  }
  get P() { return this.D.phases[this.phase]; }
  dmg(v) { return Math.round(v * this.dmgMul * (this.P.dmgMul || 1)); }
  begin() {
    if (this.fighting || this.state === 'intro' || !this.alive) return; const D = this.D; GAME.boss = this; this.state = 'intro'; this.st = 0;
    for (const e of ENTS) if (e instanceof Door && e.gate && e.arena !== false) e.setOpen(false);
    musicPrefetch([D.music, ...D.phases.map(p => p.music).filter(Boolean)]); music(null, .8);
    const first = !PROG.flags['bseen_' + this.id]; PROG.flags['bseen_' + this.id] = 1;
    this.face = Math.sign(PLAYER.x - this.x) || -1; D.intro && D.intro(this);
    CAM.override = { x: (this.x + PLAYER.x) / 2, y: this.y - 70, zoom: 1.12, k: 3 };
    after(.5, () => UI.bossTitle(D.name, D.title, '', false));
    if (D.line && first) after(1.1, () => UI.subtitle(D.speaker || D.name.split(',')[0], D.line, 4.2, D.voice));
    else if (D.voice) after(1, () => voxCry(D.voice, 'big', { vol: .8 }));
    after(first ? 2.8 : 1.6, () => { CAM.override = null; this.state = 'fight'; this.fighting = true; this.noHit = false; this.barOn = true; UI.bossBar(this); music(this.P.music || D.music, 1); this.cd = .6; });
  }
  update(dt) {
    this.st += dt; this.poseT += dt; this.flash = Math.max(0, this.flash - dt * 5); this.inv = Math.max(0, this.inv - dt); this.hitRecent = Math.max(0, this.hitRecent - dt * .5); this.ph += dt;
    for (const k in this.cool) this.cool[k] -= dt;
    const D = this.D, p = PLAYER;
    if (this.postureT > 0) this.postureT -= dt; else this.posture = Math.max(0, this.posture - this.postureMax * .08 * dt);
    if (D.light) light(this.x, this.cy, D.light[0], D.light[1], D.light[2] ?? 1, .08);
    light(this.x + this.face * 30, this.y - this.h * .9, 170, D.rim || 0xd0c0a0, this.alive ? .55 : 0);
    if (!this.alive) { this.vx *= Math.exp(-4 * dt); if (!D.fly) this.physics(dt); D.deathUpd && D.deathUpd(this, dt); return; }
    if (D.tick) D.tick(this, dt, p);
    if (this.state === 'wait' || this.state === 'intro') { this.vx = 0; if (!D.fly) this.physics(dt); else this.flyMove(dt); return; }
    if (this.state === 'broken') { this.vx *= Math.exp(-6 * dt); if (!D.fly) this.physics(dt); else { this.vy = approach(this.vy, 120, 400 * dt); this.flyMove(dt); } if (this.st > 2.4) { this.state = 'fight'; this.setPose('idle'); } return; }
    if (this.state === 'trans') { this.vx = 0; const T0 = this.P.trans || {}; if (T0.upd) T0.upd(this, dt, this.st); if (!D.fly) this.physics(dt); else this.flyMove(dt); if (this.st >= (T0.dur || 2.2)) { this.state = 'fight'; this.noHit = false; this.cd = .5; } return; }
    if (!p || !p.alive) { this.move = null; this.vx = approach(this.vx, 0, 600 * dt); if (!D.fly) this.physics(dt); else this.flyMove(dt); return; }
    if (this.move) {
      const mv = this.move; mv.t += dt * this.speedMul;
      for (const ev of mv.ev) if (!ev.done && mv.t >= ev[0]) { ev.done = true; ev[1](this, p, mv); }
      if (mv.lungeT > 0) { mv.lungeT -= dt; this.vx = this.face * mv.lunge; if (mv.lungeT <= 0) this.vx *= .2; } else if (!D.fly && !mv.keepV && this.onGround) this.vx = approach(this.vx, 0, 1400 * dt);
      const r = mv.m.upd ? mv.m.upd(this, p, dt, mv) : true;
      if (r === false || r === 'done' || (mv.m.dur && mv.t >= mv.m.dur)) this.endMove();
    } else {
      this.cd -= dt * this.speedMul; const d = Math.abs(p.x - this.x);
      if (D.locomotion) D.locomotion(this, p, dt); else this.walk(p, dt, d);
      if (this.cd <= 0) this.choose(p, d);
    }
    if (this.leap) this.leapUpd(dt);
    else if (D.fly) this.flyMove(dt); else this.physics(dt);
    this.x = clamp(this.x, this.arena.x0 + this.w / 2 + 2, this.arena.x1 - this.w / 2 - 2);
  }
  flyMove(dt) { this.x += this.vx * dt; this.y += this.vy * dt; }
  walk(p, dt, d) {
    const k = this.P.keep || this.D.keep || [40, 90]; this.face = Math.sign(p.x - this.x) || this.face; let want = 0;
    if (d > k[1]) want = this.face; else if (d < k[0]) want = -this.face * .7;
    const sp = (d > k[1] * 2.5 ? (this.P.run || this.D.run || 160) : (this.P.walk || this.D.walk || 70));
    this.vx = approach(this.vx, want * sp, 900 * dt); this.walkPh += dt * Math.abs(this.vx) / 16;
    if (Math.abs(this.vx) > 10 && !this.D.fly && Math.floor(this.walkPh / PI) !== this._fp) { this._fp = Math.floor(this.walkPh / PI); sfx(this.D.step || 'step' + rndi(1, 4), at(this, this.D.stepVol || .35, { rate: this.D.stepRate || .8 })); if (this.D.heavyStep) shake(1.5); }
  }
  choose(p, d) {
    const moves = this.P.moves.filter(m => (!m.rng || (d >= m.rng[0] && d <= m.rng[1])) && !(this.cool[m.id] > 0) && (!m.cond || m.cond(this, p)));
    if (!moves.length) { this.cd = .2; return; }
    let pool = moves; if (p.state === 'drink' && d < 260) { const pun = moves.filter(m => m.punish); if (pun.length) pool = pun; }
    const ws = pool.map(m => (m.w || 1) * (m.id === this.last ? .3 : 1)); let r = Math.random() * ws.reduce((a, b) => a + b, 0), m = pool[0];
    for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) { m = pool[i]; break; } }
    this.startMove(m, p);
  }
  startMove(m, p) {
    this.last = m.id; this.cool[m.id] = m.cool || 0; this.face = m.track === false ? this.face : (Math.sign(p.x - this.x) || this.face);
    const ev = (typeof m.ev === 'function' ? m.ev(this, p) : m.ev || []).map(e => [e[0], e[1]]);
    this.move = { m, t: 0, ev, data: {}, lunge: 0, lungeT: 0 }; m.start && m.start(this, p, this.move);
  }
  endMove() { const m = this.move.m; this.move = null; this.cd = (m.after ?? rnd(.35, .9)) * (this.P.aggr ?? 1); this.setPose('idle'); this.vx *= .3; }
  setPose(n, d = .3) { this.pose = n; this.poseT = 0; this.poseD = d; }
  get pk() { return clamp(this.poseT / Math.max(.01, this.poseD), 0, 1); }
  // salto em arco até x
  leapTo(tx, h = 160, dur = .7, onLand) { this.leap = { sx: this.x, sy: this.y, tx: clamp(tx, this.arena.x0 + 30, this.arena.x1 - 30), h, dur, t: 0, onLand }; }
  leapUpd(dt) { const L = this.leap; L.t += dt * this.speedMul; const k = Math.min(1, L.t / L.dur); this.x = lerp(L.sx, L.tx, k); this.y = lerp(L.sy, this.arena.floor, k) - Math.sin(k * PI) * L.h; this.vx = 0; this.vy = 0; if (k >= 1) { this.leap = null; this.y = this.D.fly ? this.y : this.arena.floor; this.onGround = true; L.onLand && L.onLand(this); } }
  teleport(x, y, color = 0xc0a0ff) { burst(this.x, this.cy, 30, { color: [color, 0x1a1020], smin: 40, smax: 200, jx: this.w / 2, jy: this.h / 2 }); this.x = clamp(x, this.arena.x0 + 30, this.arena.x1 - 30); if (y !== undefined) this.y = y; burst(this.x, this.cy, 30, { color: [color, 0x1a1020], smin: 40, smax: 200, jx: this.w / 2, jy: this.h / 2 }); sfx('tele', at(this, .7)); flashFx(this.x, this.cy, 60, color, .3); }
  takeHit(h) {
    if (!this.alive || this.noHit || this.state === 'trans' || this.state === 'intro' || this.state === 'wait') return false;
    if (this.D.block && this.D.block(this, h)) return 'block';
    this.hitRecent++;
    let dmg = h.dmg * (this.D.resist && this.D.resist[h.type] ? 1 - this.D.resist[h.type] : 1), crit = false;
    if (this.state === 'broken' && !h.proj) { dmg *= 1.8; crit = true; this.state = 'fight'; this.setPose('idle'); this.cd = .3; UI.toast('Golpe crítico!', 1.2); hitStop(.15); shake(6); sfx('crunch', at(this, .9, { rate: .8 })); }
    dmg = Math.max(1, Math.round(dmg)); this.hp -= dmg; this.flash = .55;
    dmgNum(this.x, this.y - this.h - 8, dmg, crit ? 'crit' : h.type === 'fire' ? 'fire' : h.type === 'holy' ? 'holy' : '');
    burst(h.x ?? this.x, h.y ?? this.cy, 12, { color: this.D.blood || [0xf0e8d8, 0xfff6e0], smin: 60, smax: 240, lmin: .12, lmax: .35, dir: Math.atan2(-.2, h.dir || 1), spread: 1, szmin: 1, szmax: 2.6 });
    if (this.D.voice && Math.random() < .25) voxCry(this.D.voice, 'hurt', { vol: .5 }); sfx(this.D.hitSnd || 'hit_sword', at(this, .5, { jit: .1 }));
    if (!crit && this.state !== 'broken') { this.posture += (h.poise || 10) * (this.D.postureMul || 1); this.postureT = 2.4; if (this.posture >= this.postureMax && this.hp > 0) this.breakPosture(); }
    if (this.hp <= 0) {
      const P = this.D.phases; if (this.phase + 1 < P.length && P[this.phase].next === 'bar') { this.hp = 1; this.beginTrans(); } else { this.hp = 0; this.die(); }
    } else if (this.phase + 1 < this.D.phases.length && this.P.next !== 'bar' && this.hp <= this.maxHp * (this.P.until ?? .5)) this.beginTrans();
    return true;
  }
  breakPosture() { this.posture = 0; this.move = null; this.leap = null; this.state = 'broken'; this.st = 0; this.setPose('broken', .4); sfx('crunch', at(this, 1, { rate: .7 })); synth('boom', .4); shake(4); burst(this.x, this.cy, 30, { color: 0xf3d27a, smin: 60, smax: 240 }); UI.toast('Postura quebrada! Ataca agora.', 1.6); if (this.D.voice) voxCry(this.D.voice, 'hurt', { vol: .7 }); }
  beginTrans() {
    this.move = null; this.leap = null; this.state = 'trans'; this.st = 0; this.noHit = true; this.phase++; const next = this.P; this.posture = 0; this.vx = 0;
    clearHostile(); UI.flash(.5); shake(6); hitStop(.2);
    if (next.music) music(next.music, 1.2);
    if (next.hp && (next.next === 'bar' || this.D.phases[this.phase - 1].next === 'bar')) { this.maxHp = next.hp; this.hp = next.hp; UI.bossBar(this); UI.bLag = 1; }
    if (next.line) after(.4, () => UI.subtitle(this.D.speaker || this.D.name.split(',')[0], next.line, 4, this.D.voice));
    if (next.title) { this.barName = next.title; after(.8, () => { UI.bossTitle(next.title, next.subtitle || '', '', true); UI.el.bname.textContent = next.title; }); }
    if (next.speed) this.speedMul = next.speed;
    next.trans && next.trans.start && next.trans.start(this);
  }
  die() {
    const D = this.D; this.alive = false; this.state = 'dead'; this.st = 0; this.move = null; this.leap = null; this.noHit = true; this.fighting = false; this.setPose('dead', 1.5);
    clearHostile(); for (const a of this.adds) if (a.alive) a.die({ dir: 0 });
    slowMo(.3, 1.6); music(null, 2.5); if (D.voice) voxCry(D.voice, 'die', { vol: .9 }); sfx(D.dieSnd || 'm_die', at(this, .9));
    UI.flash(.8); shake(8);
    if (D.deathLine) after(1.3, () => UI.subtitle(D.speaker || D.name.split(',')[0], D.deathLine, 5, D.voice));
    after(.6, () => { synth('victory'); UI.bigBanner(D.sub ? 'INIMIGO ABATIDO' : 'GRANDE INIMIGO ABATIDO', 'gold', 4); });
    after(2.6, () => { ashDeath(this, D.ash || 0x8a847a, 90); this.gone = true; });
    PROG.bossDown[this.id] = 1; GAME.quietT = 9;
    const rw = D.reward || {};
    after(1.2, () => { const n = rw.cinzas || 0; if (n) { PROG.cinzas += n; UI.gainCinzas(n); } });
    after(5, () => {
      for (const e of ENTS) if (e instanceof Door && e.gate) e.setOpen(true);
      const items = (rw.items || []).slice();
      const give = (i) => { if (i >= items.length) { GAME.save(); rw.after && rw.after(); D.after && D.after(true); return; } const [id, n] = Array.isArray(items[i]) ? items[i] : [items[i], 1]; GAME.giveItem(id, n, () => give(i + 1)); };
      give(0);
      for (const id in GAME.bonfires) { const bf = GAME.bonfires[id]; if (bf.after === this.id && bf.hiddenUntil) { bf.hiddenUntil = false; bf.reveal(); } }
    });
    GAME.save();
  }
  draw(c) {
    if (this.gone) return; FL = this.flash; c.save(); c.translate(this.x, this.y);
    if (this.state === 'dead') { c.globalAlpha = clamp(1 - (this.st - 1.8) / .8, 0, 1); }
    c.scale(this.face, 1); this.D.draw(c, this, G.t); c.restore(); FL = 0;
  }
}
function clearHostile() { for (let i = PROJ.length - 1; i >= 0; i--) if (PROJ[i].team === 'enemy') PROJ.splice(i, 1); for (let i = AOES.length - 1; i >= 0; i--) if (AOES[i].team === 'enemy' && !AOES[i].keepOnClear) AOES.splice(i, 1); for (let i = HITS.length - 1; i >= 0; i--) if (HITS[i].team === 'enemy') HITS.splice(i, 1); }
// ---------- ajudantes de ataques dos chefes ----------
// golpe corpo-a-corpo relativo ao chefe
function bHit(b, o) {
  hitbox({ owner: b, team: 'enemy', ox: o.ox, oy: o.oy, w: o.w, h: o.h, life: o.life ?? .12, dmg: b.dmg(o.dmg), kb: o.kb ?? 280, kby: o.kby ?? -260, type: o.type || 'phys', unblock: true });
  if (o.fx !== false) slashFx(b.x + b.face * (o.fxo ?? o.ox * .4), b.y + o.oy, b.face, o.ang ?? 0, o.len ?? o.w * .75, o.wid ?? 11, o.color ?? 0xfff0e0, .16, { alpha: .8, flat: o.flat });
  sfx(o.snd || 'swing' + rndi(1, 3), at(b, .6, { rate: o.rate || .8, jit: .06 }));
}
// clarão de aviso (estilo Hollow Knight) antes de um golpe
function bTele(b, ox = 10, oy = -.9, color = 0xffffff) { const x = b.x + b.face * ox, y = b.y + oy * b.h; fx({ dur: .32, layer: 'add', draw(c, f, k) { c.globalAlpha = 1 - k; c.drawImage(glowSpr(color), x - 16, y - 16, 32, 32); c.fillStyle = css(color); c.fillRect(x - 12 * (1 - k * .5), y - .7, 24 * (1 - k * .5), 1.4); c.fillRect(x - .7, y - 12 * (1 - k * .5), 1.4, 24 * (1 - k * .5)); } }); synth('parry', .4); }
// onda que corre pelo chão
function bWave(b, dir, o = {}) {
  const p = new Proj({ x: b.x + dir * (o.off ?? b.w * .6), y: b.arena.floor - (o.h || 22) / 2, vx: dir * (o.speed || 300), vy: 0, r: (o.h || 22) / 2, dmg: b.dmg(o.dmg || 18), team: 'enemy', owner: b, color: o.color ?? 0xffa040, pierce: true, life: o.life || 2.5, kind: 'wave', type: o.type || 'phys', light: true });
  p.draw = function (c) { c.save(); c.globalCompositeOperation = 'lighter'; const hh = (o.h || 22) * (1 + Math.sin(G.t * 30 + this.x) * .1); c.fillStyle = css(this.color); c.globalAlpha = .8; c.beginPath(); c.moveTo(this.x - 10, this.y + this.r); c.quadraticCurveTo(this.x - 4 * Math.sign(this.vx), this.y + this.r - hh * 1.4, this.x + 8 * Math.sign(this.vx), this.y + this.r); c.fill(); c.drawImage(glowSpr(this.color), this.x - hh, this.y - hh, hh * 2, hh * 2); c.restore(); };
  p.tick = function () { if (Math.random() < .6) part({ x: this.x, y: this.y + this.r, vx: rnd(-30, 30), vy: rnd(-120, -40), life: .4, s: 2, color: this.color, glow: true, grav: 200 }); };
  return p;
}
// orbe
function bOrb(b, x, y, vx, vy, o = {}) { const p = new Proj(Object.assign({ x, y, vx, vy, r: 6, dmg: b.dmg(o.dmg || 14), team: 'enemy', owner: b, color: 0xc8a8ff, life: 5, trail: false, kind: 'orb' }, o)); return p; }
function bRing(b, n, sp, o = {}) { const cx = o.x ?? b.x, cy = o.y ?? b.cy; for (let i = 0; i < n; i++) { const a = (o.off || 0) + i / n * TAU; bOrb(b, cx, cy, Math.cos(a) * sp, Math.sin(a) * sp, o); } }
function bFan(b, n, spread, sp, o = {}) { const p = PLAYER, cx = o.x ?? b.x + b.face * 14, cy = o.y ?? b.cy; const base = Math.atan2(p.cy - cy, p.x - cx); for (let i = 0; i < n; i++) { const a = base + (n > 1 ? (i / (n - 1) - .5) * spread : 0); bOrb(b, cx, cy, Math.cos(a) * sp, Math.sin(a) * sp, o); } }
// coluna vinda do chão ou do céu
function bPillar(b, x, o = {}) { return aoe({ x, y: o.y ?? b.arena.floor, w: o.w || 40, h: o.h || 260, delay: o.delay ?? .8, dur: o.dur || .25, dmg: b.dmg(o.dmg || 20), team: 'enemy', owner: b, color: o.color ?? 0xfff0c0, lightC: o.color ?? 0xfff0c0, type: o.type || 'holy', kby: -420, onFire: a => { sfx(o.snd || 'holy3', { x, y: a.y, vol: .5 }); shake(2.5); burst(x, a.y - 4, 16, { color: [o.color ?? 0xfff0c0, 0xffffff], dir: -HPI, spread: .4, smin: 100, smax: 360, lmin: .3, lmax: .7 }); o.onFire && o.onFire(a); } }); }
function bStrike(b, x, o = {}) { const a = bPillar(b, x, Object.assign({ color: 0xbfd8ff, snd: 'lightning', type: 'phys', w: 34 }, o)); a.draw = (c, A) => { const k = clamp(A.t / A.delay, 0, 1); if (!A.fired) { c.globalAlpha = .25 + .45 * k; c.fillStyle = '#bfd8ff'; c.fillRect(A.x - A.w / 2 * k, A.y - 4, A.w * k, 4); c.globalAlpha = .12 * k; c.fillRect(A.x - 2, A.y - A.h, 4, A.h); } else { const f = 1 - (A.t - A.delay) / A.dur; c.globalAlpha = clamp(f, 0, 1); c.strokeStyle = '#eaf2ff'; c.lineWidth = 4; c.beginPath(); let yy = A.y - A.h, xx = A.x; c.moveTo(xx, yy); while (yy < A.y) { yy += 18; xx = A.x + rnd(-10, 10); c.lineTo(xx, yy); } c.stroke(); c.drawImage(glowSpr(0xbfd8ff), A.x - 50, A.y - 60, 100, 100); } }; return a; }
// projéteis a cair do céu
function bRain(b, n, o = {}) { for (let i = 0; i < n; i++) { const x = rnd(b.arena.x0 + 30, b.arena.x1 - 30); after((o.stagger ?? .12) * i, () => { if (!b.alive) return; bPillar(b, x, Object.assign({ w: 30, delay: .7 }, o)); }); } }
function bSummon(b, type, x, opt = {}) { const e = new Enemy(type, clamp(x, b.arena.x0 + 30, b.arena.x1 - 30), opt.y ?? b.arena.floor, Object.assign({ lvl: ROOM.cur.def.lvl || 1 }, opt)); e.isAdd = true; e.aggro = true; e.cinzas = 0; b.adds.push(e); burst(e.x, e.cy, 20, { color: [0xd8c8ff, 0x8a6aff], smin: 40, smax: 160 }); return e; }
// ataque horizontal que atravessa a arena (linha com aviso)
function bLine(b, y, o = {}) { return aoe({ x: (b.arena.x0 + b.arena.x1) / 2, y: y + (o.h || 14) / 2, w: b.arena.x1 - b.arena.x0, h: o.h || 14, delay: o.delay ?? .8, dur: o.dur || .2, dmg: b.dmg(o.dmg || 18), team: 'enemy', owner: b, color: o.color ?? 0xc8a8ff, type: o.type || 'phys', kb: 160, kby: -200, onFire: () => sfx(o.snd || 'cast_arc', { x: b.x, y, vol: .5 }), draw(c, A) { const k = clamp(A.t / A.delay, 0, 1); c.fillStyle = css(A.color); if (!A.fired) { c.globalAlpha = .15 + .4 * k * (.6 + .4 * Math.sin(A.t * 30)); c.fillRect(A.x - A.w / 2, A.y - A.h / 2 - .5, A.w, 1); } else { c.globalAlpha = clamp(1 - (A.t - A.delay) / A.dur, 0, 1); c.fillRect(A.x - A.w / 2, A.y - A.h, A.w, A.h); c.globalAlpha *= .6; c.fillRect(A.x - A.w / 2, A.y - A.h * 1.6, A.w, A.h * 2.2); } } }); }
