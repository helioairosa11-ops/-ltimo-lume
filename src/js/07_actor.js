// ===================== ATORES, GOLPES E PROJÉTEIS =====================
const GRAV = 1900, MAXFALL = 900;
const ACTORS = [], ENEMIES = [];
class Actor {
  constructor(o) {
    Object.assign(this, { x: 0, y: 0, w: 20, h: 40, vx: 0, vy: 0, face: 1, team: 'enemy', hp: 10, alive: true, onGround: false, flash: 0, inv: 0, grav: 1, state: 'idle', st: 0, kbT: 0, mass: 1, poise: 0, poiseMax: 0, id: Math.random().toString(36).slice(2, 8) }, o);
    this.maxHp = o.maxHp || this.hp; ACTORS.push(this);
  }
  get cx() { return this.x; } get cy() { return this.y - this.h / 2; }
  setState(s) { if (this.state !== s) { this.state = s; this.st = 0; } }
  physics(dt) { if (this.grav) { this.vy = Math.min(MAXFALL, this.vy + GRAV * this.grav * dt); } moveActor(this, dt); }
  box() { return { x0: this.x - this.w / 2, x1: this.x + this.w / 2, y0: this.y - this.h, y1: this.y }; }
  distTo(o) { return Math.hypot(o.x - this.x, o.cy - this.cy); }
  takeHit(h) { return false; }
  remove() { this.alive = false; this.dead = true; const i = ACTORS.indexOf(this); if (i >= 0) ACTORS.splice(i, 1); const j = ENEMIES.indexOf(this); if (j >= 0) ENEMIES.splice(j, 1); }
}
function overlaps(a, b) { return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0; }
// ---------- caixas de golpe ----------
const HITS = [];
// o: { owner, team, x,y,w,h (centro) ou ox,oy relativo ao dono (com face), dmg, kb, kby, life, type, poise, onHit, pogo, multi (intervalo) }
function hitbox(o) { const h = Object.assign({ life: .08, kb: 160, kby: -120, type: 'phys', poise: 10, hit: new Map() }, o); HITS.push(h); return h; }
function hitRect(h) {
  let x = h.x, y = h.y; if (h.owner && h.ox !== undefined) { x = h.owner.x + h.ox * (h.dir ?? h.owner.face); y = h.owner.y + h.oy; }
  return { x0: x - h.w / 2, x1: x + h.w / 2, y0: y - h.h / 2, y1: y + h.h / 2, cx: x, cy: y };
}
function updHits(dt) {
  for (let i = HITS.length - 1; i >= 0; i--) {
    const h = HITS[i]; h.life -= dt; if (h.life < 0 || (h.owner && (!h.owner.alive || h.cancel))) { HITS.splice(i, 1); continue; }
    const r = hitRect(h);
    for (const t of ACTORS) {
      if (!t.alive || t.team === h.team || t.noHit || t === h.owner) continue;
      const last = h.hit.get(t); if (last !== undefined && (!h.multi || TIME.now - last < h.multi)) continue;
      if (!overlaps(r, t.box())) continue;
      h.hit.set(t, TIME.now);
      const res = t.takeHit({ dmg: h.dmg, kb: h.kb, kby: h.kby, dir: Math.sign(t.x - r.cx) || (h.owner ? h.owner.face : 1), from: h.owner, type: h.type, poise: h.poise, x: r.cx, y: r.cy, crit: h.crit, unblock: h.unblock, heavy: h.heavy });
      if (res && h.onHit) h.onHit(t, res, h);
    }
    if (h.tiles && h.team === 'player') hitTiles(r, h);
  }
}
// golpes do jogador partem paredes ilusórias e acertam em espinhos (pogo)
function hitTiles(r, h) {
  const x0 = Math.floor(r.x0 / T), x1 = Math.floor(r.x1 / T), y0 = Math.floor(r.y0 / T), y1 = Math.floor(r.y1 / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const c = cellAt(tx, ty);
    if (c === 9) breakWall(tx, ty);
    if ((c === 5 || isRock(c)) && h.pogo && !h.pogoDone && ty * T > (h.owner.y - 4)) { if (c === 5) { h.pogoDone = true; h.onPogo && h.onPogo(); } }
    if (isRock(c) && h.spark && !h.sparked && !h.hit.size) { h.sparked = true; const sx = clamp(r.cx, tx * T, tx * T + T), sy = clamp(r.cy, ty * T, ty * T + T); burst(sx, sy, 6, { color: [0xfff0c0, 0xffc080], smin: 60, smax: 200, lmin: .1, lmax: .25, szmin: 1, szmax: 2 }); synth('clang', .6); }
  }
}
function breakWall(tx, ty) {
  const R = ROOM.cur; const stack = [[tx, ty]]; let n = 0;
  while (stack.length && n < 40) { const [x, y] = stack.pop(); if (cellAt(x, y) !== 9) continue; setCell(x, y, 0); n++; burst(x * T + T / 2, y * T + T / 2, 10, { color: [ROOM.theme.mid, ROOM.theme.rim, ROOM.theme.top], glow: false, smin: 40, smax: 180, grav: 600, lmin: .4, lmax: 1, szmin: 2, szmax: 4, shape: 'r' }); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) stack.push([x + dx, y + dy]); }
  if (n) { PROG.flags['wall_' + R.id + '_' + tx + '_' + ty] = 1; R.broken[tx + ',' + ty] = 1; sfx('cavein', { x: tx * T, y: ty * T, vol: .8 }); shake(5); UI.toast('A parede era ilusória.'); }
}
// ---------- projéteis ----------
const PROJ = [];
class Proj {
  constructor(o) { Object.assign(this, { x: 0, y: 0, vx: 0, vy: 0, r: 5, dmg: 10, team: 'enemy', life: 3, grav: 0, pierce: false, color: 0xffa050, kind: 'orb', hit: new Set(), kb: 140, type: 'phys', light: true, wall: true }, o); PROJ.push(this); }
  update(dt) {
    this.life -= dt; if (this.life <= 0) return this.die(false);
    if (this.homing && this.target && this.target.alive) { const a = Math.atan2(this.target.cy - this.y, this.target.x - this.x), sp = Math.hypot(this.vx, this.vy), cur = Math.atan2(this.vy, this.vx); const na = cur + clamp(angDiff(cur, a), -this.homing * dt, this.homing * dt); this.vx = Math.cos(na) * sp; this.vy = Math.sin(na) * sp; }
    if (this.accel) { this.vx *= 1 + this.accel * dt; this.vy *= 1 + this.accel * dt; }
    this.vy += this.grav * dt; this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.wall && solidAt(this.x, this.y)) return this.die(true);
    const b = { x0: this.x - this.r, x1: this.x + this.r, y0: this.y - this.r, y1: this.y + this.r };
    for (const t of ACTORS) {
      if (!t.alive || t.team === this.team || t.noHit || this.hit.has(t)) continue;
      if (!overlaps(b, t.box())) continue; this.hit.add(t);
      const res = t.takeHit({ dmg: this.dmg, kb: this.kb, kby: -80, dir: Math.sign(this.vx) || 1, from: this.owner, type: this.type, poise: this.poise ?? 8, x: this.x, y: this.y, proj: true });
      if (res && this.onHit) this.onHit(t, res);
      if (res && res !== 'dodge' && !this.pierce) return this.die(true);
    }
    if (this.trail && Math.random() < .8) part({ x: this.x, y: this.y, vx: -this.vx * .1 + rnd(-10, 10), vy: -this.vy * .1 + rnd(-10, 10), life: rnd(.15, .35), s: this.r * .7, s1: .5, color: this.color, glow: true });
    if (this.light) light(this.x, this.y, this.r * 10, this.color, .8);
    if (this.tick) this.tick(dt);
  }
  die(hitWall) { this.dead = true; if (this.onDie) this.onDie(hitWall); else burst(this.x, this.y, 8, { color: this.color, smin: 30, smax: 140, lmin: .15, lmax: .4 }); }
  draw(c) {
    c.save(); c.translate(this.x, this.y);
    if (this.kind === 'arrow' || this.kind === 'bolt') { c.rotate(Math.atan2(this.vy, this.vx)); c.fillStyle = this.kind === 'bolt' ? '#3a3028' : '#5a4a36'; c.fillRect(-14, -1, 18, 2); c.fillStyle = '#c8c0b0'; c.beginPath(); c.moveTo(4, -3); c.lineTo(9, 0); c.lineTo(4, 3); c.fill(); c.fillStyle = '#e8e0d0'; c.fillRect(-15, -3, 4, 1.2); c.fillRect(-15, 2, 4, 1.2); if (this.glowA) { c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(this.color), -18, -10, 30, 20); } }
    else if (this.kind === 'spear') { c.rotate(Math.atan2(this.vy, this.vx)); c.globalCompositeOperation = 'lighter'; c.fillStyle = css(this.color); c.globalAlpha = .9; c.beginPath(); c.moveTo(22, 0); c.lineTo(-24, -3.5); c.lineTo(-30, 0); c.lineTo(-24, 3.5); c.fill(); c.drawImage(glowSpr(this.color), -40, -16, 70, 32); }
    else { c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(this.color), -this.r * 3, -this.r * 3, this.r * 6, this.r * 6); c.fillStyle = css(shade(this.color, .55)); c.beginPath(); c.arc(0, 0, this.r * .7, 0, TAU); c.fill(); }
    c.restore();
  }
}
function updProj(dt) { for (let i = PROJ.length - 1; i >= 0; i--) { const p = PROJ[i]; if (!p.dead) p.update(dt); if (p.dead) PROJ.splice(i, 1); } }
function drawProj() { const c = G.ctx; camTransform(c); for (const p of PROJ) p.draw(c); }
// ---------- ataques de área com aviso (linhas, colunas, círculos no chão) ----------
const AOES = [];
// o: { x,y,w,h | shape:'col'|'rect'|'circle', r, delay (aviso), dur (ativo), dmg, team, color, owner, kb, kby, type, onFire, draw }
function aoe(o) { const a = Object.assign({ t: 0, delay: .6, dur: .15, team: 'enemy', color: 0xffa050, fired: false, hit: new Set(), kb: 180, kby: -260, type: 'phys' }, o); AOES.push(a); return a; }
function updAoes(dt) {
  for (let i = AOES.length - 1; i >= 0; i--) {
    const a = AOES[i]; a.t += dt; if (a.owner && a.owner.dead && !a.keep) { AOES.splice(i, 1); continue; }
    if (a.follow) { a.x = a.follow.x + (a.fox || 0); }
    if (!a.fired && a.t >= a.delay) { a.fired = true; a.onFire && a.onFire(a); }
    if (a.fired) {
      const r = a.shape === 'circle' ? { x0: a.x - a.r, x1: a.x + a.r, y0: a.y - a.r, y1: a.y + a.r } : { x0: a.x - a.w / 2, x1: a.x + a.w / 2, y0: a.y - a.h, y1: a.y };
      for (const t of ACTORS) { if (!t.alive || t.team === a.team || t.noHit || a.hit.has(t)) continue; const b = t.box(); if (!overlaps(r, b)) continue; if (a.shape === 'circle' && Math.hypot(t.x - a.x, t.cy - a.y) > a.r + t.w / 2) continue; a.hit.add(t); t.takeHit({ dmg: a.dmg, kb: a.kb, kby: a.kby, dir: Math.sign(t.x - a.x) || 1, from: a.owner, type: a.type, poise: 20, x: a.x, y: a.y }); }
      if (a.t >= a.delay + a.dur) AOES.splice(i, 1);
    }
    if (a.lightC) light(a.x, a.shape === 'circle' ? a.y : a.y - (a.h || 40) / 2, Math.max(60, (a.w || a.r * 2 || 60)), a.lightC, a.fired ? 1.2 : .4 + .4 * (a.t / a.delay));
  }
}
function drawAoes() {
  const c = G.ctx; camTransform(c);
  for (const a of AOES) {
    c.save(); c.globalCompositeOperation = 'lighter';
    if (a.draw) { a.draw(c, a); c.restore(); continue; }
    const k = clamp(a.t / a.delay, 0, 1);
    if (!a.fired) {
      c.globalAlpha = .18 + .35 * k * (.6 + .4 * Math.sin(a.t * 30)); c.fillStyle = css(a.color);
      if (a.shape === 'circle') { c.beginPath(); c.arc(a.x, a.y, a.r * (.3 + .7 * k), 0, TAU); c.fill(); c.globalAlpha = .7; c.strokeStyle = css(a.color); c.lineWidth = 1.5; c.beginPath(); c.arc(a.x, a.y, a.r, 0, TAU); c.stroke(); }
      else { c.fillRect(a.x - a.w / 2, a.y - 3, a.w, 3); c.globalAlpha *= .5; c.fillRect(a.x - a.w / 2 * k, a.y - a.h, a.w * k, a.h); }
    } else {
      const f = 1 - (a.t - a.delay) / a.dur; c.globalAlpha = clamp(f, 0, 1); c.fillStyle = css(shade(a.color, .3));
      if (a.shape === 'circle') { c.drawImage(glowSpr(a.color), a.x - a.r * 1.4, a.y - a.r * 1.4, a.r * 2.8, a.r * 2.8); }
      else { const gg = c.createLinearGradient(0, a.y, 0, a.y - a.h); gg.addColorStop(0, rgba(shade(a.color, .4), .95)); gg.addColorStop(1, rgba(a.color, 0)); c.fillStyle = gg; c.fillRect(a.x - a.w / 2, a.y - a.h, a.w, a.h); }
    }
    c.restore();
  }
}
function clearCombat() { HITS.length = 0; PROJ.length = 0; AOES.length = 0; FX.length = 0; }
// cinzas a esvoaçar quando um inimigo morre
function ashDeath(e, color = 0x8a847a, n = 26) {
  burst(e.x, e.cy, n, { color: [color, shade(color, -.3), 0x5a5650], glow: false, smin: 20, smax: 140, jx: e.w / 2, jy: e.h / 2, lmin: .6, lmax: 1.6, szmin: 1.5, szmax: 3.5, grav: -30, drag: 1.8, shape: 'r' });
  burst(e.x, e.cy, Math.round(n / 3), { color: [0xffc070, 0xff8a40], smin: 20, smax: 80, jx: e.w / 2, jy: e.h / 2, lmin: .4, lmax: 1, szmin: 1, szmax: 2, grav: -60 });
}
