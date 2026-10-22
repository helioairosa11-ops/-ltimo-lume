// ===================== MUNDO: entidades das salas =====================
const ENTS = [];
class Ent {
  constructor(o) { Object.assign(this, { layer: 'back' }, o); ENTS.push(this); }
  update(dt) { } draw(c) { } interact() { return null; }
}
function entsClear() { ENTS.length = 0; PLATS.length = 0; ROOM.props = []; }
function nearestInteract() {
  const p = PLAYER; if (!p || !p.alive || !p.onGround || ['dash', 'hurt', 'hazard', 'skill', 'cast', 'busy', 'sit', 'frozen', 'drink', 'wake'].includes(p.state)) return null;
  let best = null, bd = 1e9;
  for (const e of ENTS) { const it = e.interact(); if (!it) continue; const d = Math.abs(e.x - p.x); if (d > (it.r || 34) || Math.abs((e.y ?? p.y) - p.y) > 50) continue; if (d < bd) { bd = d; best = it; } }
  return best;
}
// adereço estático desenhado no cache dos blocos
function prop(x, y, w, h, bake) { ROOM.props.push({ x: x - w / 2, y: y - h, w, h, bake }); }
// ---------- fogueira ----------
class Bonfire extends Ent {
  constructor(o) { super(o); this.lit = !!PROG.bonfires[this.id]; GAME.bonfires[this.id] = this; if (this.after && !PROG.bossDown[this.after]) this.hiddenUntil = true; }
  update(dt) {
    if (this.hiddenUntil) return; const k = this.lit ? 1 : .25;
    light(this.x, this.y - 18, this.lit ? 260 : 90, 0xff9a40, this.lit ? 1.25 : .5, .15);
    if (this.lit && Math.random() < dt * 22) part({ x: this.x + rnd(-6, 6), y: this.y - 8, vx: rnd(-10, 10), vy: rnd(-70, -30), life: rnd(.6, 1.4), s: rnd(1, 2), s1: .3, color: pick([0xffa040, 0xffd080, 0xff6a20]), glow: true, drag: .5 });
  }
  draw(c) {
    if (this.hiddenUntil) return; const x = this.x, y = this.y, t = G.t;
    c.fillStyle = '#2a2420'; for (let i = 0; i < 7; i++) ell(c, x - 15 + i * 5, y - 2, 4, 3); c.fillStyle = '#4a443e'; ell(c, x, y - 3, 13, 3.5);
    c.save(); c.translate(x + 2, y - 4); c.rotate(-.22); c.fillStyle = '#4a3a2a'; c.fillRect(-1.5, -40, 3, 10); c.fillRect(-5, -31, 10, 2.5); c.fillStyle = '#b8b4ac'; poly(c, [-1.6, -29, 1.6, -29, 1, 0, -1, 0]); c.restore();
    if (this.lit) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const f = Math.sin(t * (9 + i * 3) + i) * .5 + .5; c.globalAlpha = .55 - i * .12; c.fillStyle = ['#ff7a20', '#ffb040', '#fff0c0'][i]; c.beginPath(); c.moveTo(x - 9 + i * 3, y - 3); c.quadraticCurveTo(x - 8 + i * 2, y - 16 - f * 4, x + Math.sin(t * 5 + i) * 2, y - 24 + i * 5 - f * 6); c.quadraticCurveTo(x + 8 - i * 2, y - 16 - f * 4, x + 9 - i * 3, y - 3); c.fill(); } c.drawImage(glowSpr(0xff9a40), x - 30, y - 44, 60, 60); c.restore(); }
    else { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .4 + Math.sin(t * 2) * .15; c.drawImage(glowSpr(0xff6a20), x - 10, y - 14, 20, 20); c.restore(); }
  }
  interact() { if (this.hiddenUntil || GAME.boss) return null; return { label: this.lit ? 'Descansar' : 'Acender a fogueira', r: 30, act: () => GAME.useBonfire(this) }; }
  reveal() { this.hiddenUntil = false; burst(this.x, this.y - 10, 40, { color: [0xffa040, 0xffd080], smin: 40, smax: 200, dir: -HPI, spread: 1.2 }); }
}
// ---------- item no chão ----------
class Pickup extends Ent {
  constructor(o) { super(o); this.taken = !!PROG.picked[this.id]; this.ph = rnd(0, TAU); }
  update(dt) { if (this.taken) return; light(this.x, this.y - 10, 70, 0xfff0d0, .6); if (Math.random() < dt * 5) part({ x: this.x + rnd(-6, 6), y: this.y - rnd(4, 16), vx: 0, vy: rnd(-30, -10), life: rnd(.5, 1), s: 1.2, color: 0xfff0d0, glow: true }); }
  draw(c) { if (this.taken) return; const b = Math.sin(G.t * 3 + this.ph) * 2; c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(0xfff0d0), this.x - 16, this.y - 26 + b, 32, 32); c.fillStyle = '#fffaf0'; ell(c, this.x, this.y - 10 + b, 2.2, 2.2); c.restore(); }
  interact() { if (this.taken) return null; return { label: 'Pegar', r: 26, act: () => this.take() }; }
  take() { this.taken = true; PROG.picked[this.id] = 1; PLAYER.busy(.5, 'pickup'); after(.25, () => GAME.giveItem(this.item, this.n || 1)); }
}
// ---------- baú ----------
class Chest extends Ent {
  constructor(o) { super(o); this.open = !!PROG.picked[this.id]; this.lidA = this.open ? 1 : 0; }
  update(dt) { if (this.opening) { this.lidA = Math.min(1, this.lidA + dt * 3); } }
  draw(c) {
    const x = this.x, y = this.y; c.fillStyle = '#3a2a1c'; c.fillRect(x - 14, y - 16, 28, 16); c.fillStyle = '#6a6052'; c.fillRect(x - 14, y - 11, 28, 2.5); c.fillRect(x - 2, y - 14, 4, 6);
    c.save(); c.translate(x - 14, y - 16); c.rotate(-this.lidA * 1.9); c.fillStyle = '#4a3624'; c.beginPath(); c.moveTo(0, 0); c.lineTo(28, 0); c.quadraticCurveTo(28, -9, 14, -9); c.quadraticCurveTo(0, -9, 0, 0); c.fill(); c.restore();
    if (!this.open) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .25 + Math.sin(G.t * 2) * .1; c.drawImage(glowSpr(0xffd080), x - 14, y - 26, 28, 28); c.restore(); }
  }
  interact() { if (this.open) return null; return { label: 'Abrir o baú', r: 28, act: () => { this.open = true; this.opening = true; PROG.picked[this.id] = 1; PLAYER.busy(.7, 'push'); sfx('chest', at(this, .8)); after(.5, () => GAME.giveItem(this.item, this.n || 1)); } }; }
}
// ---------- portas e grades (ocupam células, código 12) ----------
function setBlock(tx, ty0, h, on) { for (let i = 0; i < h; i++) { const R = ROOM.cur; const ty = ty0 - i; if (tx >= 0 && ty >= 0 && tx < R.w && ty < R.h) R.g[ty * R.w + tx] = on ? 12 : 0; } }
class Door extends Ent {
  // porta: key (chave), oneWay (1: só abre pela direita; -1: pela esquerda), need (função), boss: grade de arena
  constructor(o) { super(o); this.h = this.hh || 3; this.tx = Math.floor(this.x / T); this.ty = Math.floor((this.y - 1) / T); this.isOpen = !!(PROG.flags['door_' + this.id] || this.startOpen); this.k = this.isOpen ? 1 : 0; setBlock(this.tx, this.ty, this.h, !this.isOpen); }
  setOpen(v, instant) { this.isOpen = v; setBlock(this.tx, this.ty, this.h, !v); if (v && this.id && !this.temp) PROG.flags['door_' + this.id] = 1; if (instant) this.k = v ? 1 : 0; else { sfx(this.gate ? 'stone' : 'door', at(this, .8, { rate: this.gate ? .7 : .8 })); if (this.gate) sfx('rumble', at(this, .5)); } }
  update(dt) { this.k = approach(this.k, this.isOpen ? 1 : 0, dt * (this.gate ? 1.2 : 2)); }
  draw(c) {
    const X = this.tx * T, Y = (this.ty + 1) * T, H = this.h * T;
    if (this.gate) { const lift = this.k * (H - 6); c.fillStyle = '#2a2a30'; for (let i = 0; i < 4; i++) c.fillRect(X + 3 + i * 8, Y - H - lift, 3, H); c.fillRect(X, Y - H - lift + 8, T, 3); c.fillRect(X, Y - H / 2 - lift, T, 3); c.fillStyle = '#4a4a54'; for (let i = 0; i < 4; i++) poly(c, [X + 2 + i * 8, Y - lift, X + 4.5 + i * 8, Y + 5 - lift, X + 7 + i * 8, Y - lift]); return; }
    const w = T * (1 - this.k * .85); c.fillStyle = '#2e2218'; c.fillRect(X + (T - w) / 2, Y - H, w, H); c.fillStyle = '#1a140e'; for (let i = 1; i < 4; i++) c.fillRect(X + (T - w) / 2 + w * i / 4, Y - H, 1.2, H);
    c.fillStyle = '#5a5248'; c.fillRect(X + (T - w) / 2, Y - H * .78, w, 3); c.fillRect(X + (T - w) / 2, Y - H * .28, w, 3);
    if (this.key && !this.isOpen) { c.fillStyle = '#8a7a50'; ell(c, X + T / 2, Y - H * .5, 3, 3); }
  }
  interact() {
    if (this.isOpen || this.gate) return null; const p = PLAYER, side = Math.sign(p.x - this.x);
    if (this.oneWay && side !== this.oneWay) return { label: 'Não abre deste lado', r: 30, act: () => { UI.toast('Está trancada pelo outro lado.'); synth('ui'); } };
    if (this.key && !PROG.keys[this.key]) return { label: 'Trancada', r: 30, act: () => { UI.toast('Precisas de: ' + (ITEMS[this.key] ? ITEMS[this.key].name : 'uma chave') + '.'); synth('ui'); } };
    if (this.need && !this.need()) return { label: this.needLabel || 'Selada', r: 30, act: () => { UI.toast(this.needMsg || 'Uma força antiga sela esta porta.'); synth('ui'); } };
    return { label: 'Abrir', r: 30, act: () => { PLAYER.busy(.6, 'push'); after(.3, () => { this.setOpen(true); if (this.key) UI.toast('Usaste: ' + ITEMS[this.key].name); }); } };
  }
}
class Lever extends Ent {
  constructor(o) { super(o); this.pulled = !!PROG.flags['door_' + this.door]; this.a = this.pulled ? 1 : 0; }
  update(dt) { this.a = approach(this.a, this.pulled ? 1 : 0, dt * 4); }
  draw(c) { const x = this.x, y = this.y; c.fillStyle = '#3a3a40'; c.fillRect(x - 6, y - 8, 12, 8); c.save(); c.translate(x, y - 7); c.rotate(lerp(-.7, .7, this.a)); c.fillStyle = '#6a6a72'; c.fillRect(-1.2, -18, 2.4, 18); c.fillStyle = '#8a3a2a'; ell(c, 0, -19, 3, 3); c.restore(); }
  interact() { if (this.pulled) return null; return { label: 'Puxar a alavanca', r: 26, act: () => { this.pulled = true; PLAYER.busy(.6, 'push'); sfx('torch', at(this, .7, { rate: .6 })); after(.4, () => { const d = ENTS.find(e => e instanceof Door && e.id === this.door); if (d) d.setOpen(true); else PROG.flags['door_' + this.door] = 1; UI.toast('Ouviste um portão a abrir-se.', 2); }); } }; }
}
// ---------- elevador ----------
class Elevator extends Ent {
  constructor(o) { super(o); this.w = (this.wt || 3) * T; this.y0 = this.y; this.cur = PROG.flags['elev_' + this.id] ? this.y1 : this.y0; this.plat = { x0: this.x - this.w / 2, x1: this.x + this.w / 2, y: this.cur }; PLATS.push(this.plat); this.moving = 0; this.idle = 0; }
  update(dt) {
    const p = PLAYER, on = p && p.plat === this.plat;
    if (!this.moving && on && Math.abs(p.vx) < 5) { this.idle += dt; if (this.idle > .5) { this.idle = 0; this.moving = this.cur === this.y0 ? 1 : -1; sfx('rumble', at(this, .6)); } } else if (!on) this.idle = 0;
    if (this.moving) { const tgt = this.moving > 0 ? this.y1 : this.y0, sp = 120 * dt; const ny = approach(this.cur, tgt, sp); const dy = ny - this.cur; this.cur = ny; this.plat.y = ny; if (on || (p && Math.abs(p.y - (ny - dy)) < 3 && p.x > this.plat.x0 && p.x < this.plat.x1)) { p.y = ny; p.vy = 0; } if (ny === tgt) { this.moving = 0; PROG.flags['elev_' + this.id] = tgt === this.y1 ? 1 : 0; sfx('stone', at(this, .6, { rate: .7 })); } }
  }
  draw(c) { const x0 = this.plat.x0, y = this.cur; c.fillStyle = '#3a2e22'; c.fillRect(x0, y, this.w, 8); c.fillStyle = '#5a4a36'; c.fillRect(x0, y, this.w, 2); c.strokeStyle = '#4a4a50'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 + 4, y); c.lineTo(x0 + 4, y - 900); c.moveTo(x0 + this.w - 4, y); c.lineTo(x0 + this.w - 4, y - 900); c.stroke(); }
}
// ---------- inscrição (lore) ----------
class Tablet extends Ent {
  update(dt) { light(this.x, this.y - 22, 60, 0xa8c8ff, .5 + Math.sin(G.t * 2 + this.x) * .1); }
  draw(c) { const x = this.x, y = this.y; c.fillStyle = '#3a3640'; c.beginPath(); c.moveTo(x - 11, y); c.lineTo(x - 11, y - 30); c.quadraticCurveTo(x, y - 40, x + 11, y - 30); c.lineTo(x + 11, y); c.fill(); c.fillStyle = '#26232c'; c.fillRect(x - 13, y - 3, 26, 3); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55 + Math.sin(G.t * 2 + x) * .15; c.fillStyle = '#9ac0ff'; for (let i = 0; i < 4; i++) c.fillRect(x - 6, y - 28 + i * 6, 12 - (i % 2) * 4, 1.5); c.restore(); }
  interact() { return { label: 'Ler', r: 28, act: () => { const L = LORE[this.lore]; PROG.lore[this.lore] = 1; UI.lore(L.t, L.x); } }; }
}
// ---------- mensagem no chão (de outros Despertos) ----------
class Msg extends Ent {
  draw(c) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .5 + Math.sin(G.t * 2 + this.x) * .2; c.strokeStyle = '#ff9a40'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(this.x - 12 + i * 6, this.y - 1); c.lineTo(this.x - 9 + i * 6, this.y - 4); } c.stroke(); c.restore(); }
  interact() { return { label: 'Ler a mensagem', r: 26, act: () => UI.message(this.text) }; }
}
// ---------- portal para outra sala (portas, elevadores longos) ----------
// topo do chão por baixo de (x, y)
function groundBelow(x, y) { const tx = Math.floor(x / T); for (let ty = Math.max(0, Math.floor(y / T)); ty < (ROOM.cur ? ROOM.cur.h : 0); ty++) { const c = cellAt(tx, ty); if (SOLID[c] || c === 4) return ty * T; } return y; }
// ---------- sarcófago onde o Desperto acorda (cena inicial) ----------
const DUST = { color: [0x9a9488, 0x6a6458, 0xb8b0a0], glow: false, dir: -HPI, spread: 1.4, smin: 20, smax: 120, grav: 420, lmin: .4, lmax: 1, szmin: 1, szmax: 3, shape: 'r' };
class WakeCoffin extends Ent {
  constructor(o) { super(o); this.open = !!PROG.flags.woke; this.layer = this.open ? 'back' : 'front'; this.jit = 0; this.seam = 0; this.lidX = this.x + 96; this.lidY = groundBelow(this.lidX, this.y - 60); this.lid = this.open ? this.restLid() : null; }
  restLid() { return { x: this.lidX, y: this.lidY, a: .06, rest: true }; }
  knock(k) { this.jit = .4 + k * .3; shake(1 + k * 1.6); sfx('stone', at(this, .35 + k * .25, { rate: .62 })); sfx('hit_club', at(this, .3 + k * .25, { rate: .45 })); burst(this.x + rnd(-30, 30), this.y - 34, 6 + k * 8, DUST); this.seam = Math.min(1, this.seam + .3 + k * .15); vibrate(30 + k * 30); }
  burstOpen() {
    this.open = true; this.seam = 1.2; this.lid = { x: this.x, y: this.y - 26, a: 0, vx: (this.lidX - this.x) * 1.9, vy: -420, va: 3.4 };
    shake(7); hitStop(.07); sfx('crumble', at(this, 1)); sfx('stone', at(this, .9, { rate: .5 })); synth('boom', .55); vibrate(80);
    burst(this.x, this.y - 30, 44, Object.assign({}, DUST, { smin: 60, smax: 300, spread: 2.2 })); burst(this.x, this.y - 28, 22, { color: [0xffb060, 0xff8a40, 0xffe0a0], smin: 30, smax: 160, lmin: .4, lmax: 1 }); flashFx(this.x, this.y - 30, 110, 0xffb060, .5);
  }
  update(dt) {
    this.jit = Math.max(0, this.jit - dt * 2.2); this.seam = Math.max(this.open ? 0 : .12 * (this.seam > 0), this.seam - dt * (this.open ? .8 : .12));
    if (this.seam > 0) light(this.x, this.y - 30, 70 + this.seam * 70, 0xff8a40, Math.min(1, this.seam) * .95, .25);
    const L = this.lid; if (!L || L.rest) return;
    L.vy += 1500 * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.a += L.va * dt;
    if (Math.abs(L.x - this.lidX) < 8 || (L.x > this.lidX)) { L.x = Math.min(L.x, this.lidX); L.vx = 0; }
    if (L.y >= this.lidY && L.vy > 0) { if (L.vy > 220) { L.y = this.lidY; L.vy *= -.22; L.va = (.06 - L.a) * 3; shake(3); sfx('stone', at(this, .7, { rate: .7 })); burst(L.x, this.lidY - 2, 16, DUST); } else { L.y = this.lidY; L.a = .06; L.rest = true; } }
  }
  drawLid(c, x, y, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = '#34303b'; c.fillRect(-39, -10, 78, 10); c.fillStyle = '#4c4756'; c.fillRect(-39, -10, 78, 3);
    c.fillStyle = '#29262f'; c.beginPath(); c.ellipse(-22, -5, 7, 3.2, 0, 0, TAU); c.fill(); c.fillRect(-15, -6.5, 40, 3); c.fillRect(-3, -9, 2, 8);
    c.restore();
  }
  draw(c) {
    const x = this.x + (this.jit > 0 ? (Math.random() - .5) * this.jit * 5 : 0), y = this.y;
    // base de pedra (a frente tapa o Desperto enquanto se levanta)
    c.fillStyle = '#2b2830'; c.fillRect(x - 35, y - 26, 70, 26); c.fillStyle = '#3d3946'; c.fillRect(x - 37, y - 28, 74, 4); c.fillRect(x - 37, y - 5, 74, 5);
    c.fillStyle = '#211e26'; for (const k of [-1, 1]) c.fillRect(x + k * 22 - 1, y - 23, 2, 17); c.beginPath(); c.ellipse(x, y - 15, 8, 6, 0, 0, TAU); c.fill();
    c.fillStyle = '#4a4552'; c.beginPath(); c.ellipse(x, y - 16, 4, 4.5, 0, 0, TAU); c.fill(); c.fillStyle = '#211e26'; c.fillRect(x - 2.5, y - 17, 1.6, 2.2); c.fillRect(x + 1, y - 17, 1.6, 2.2);
    if (this.open) { c.fillStyle = '#08070a'; c.fillRect(x - 33, y - 28, 66, 3); }
    if (!this.lid) { const lx = x + (this.jit > 0 ? (Math.random() - .5) * this.jit * 3 : 0), ly = y - 28 - (this.jit > .3 ? Math.random() * this.jit * 3 : 0); this.drawLid(c, lx, ly, 0);
      if (this.seam > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, this.seam); c.fillStyle = '#ff9a4a'; c.fillRect(x - 35, y - 28.5, 70, 1.5); c.drawImage(glowSpr(0xff8a40), x - 40, y - 40, 80, 24); c.restore(); } }
    else this.drawLid(c, this.lid.x, this.lid.y, this.lid.a);
  }
}
class Portal extends Ent {
  draw(c) { if (this.invisible || (this.cond && !this.cond() && !this.lockedLabel)) return; const x = this.x, y = this.y; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .25 + Math.sin(G.t * 2) * .08; c.drawImage(glowSpr(this.color || 0xffe0b0), x - 30, y - 80, 60, 80); c.restore(); }
  interact() { if (this.cond && !this.cond()) return this.lockedLabel ? { label: this.lockedLabel, r: 34, act: () => UI.toast(this.lockedMsg || 'O caminho está fechado.') } : null; return { label: this.label || 'Entrar', r: 34, act: () => { if (this.setFlag) PROG.flags[this.setFlag] = 1; GAME.travel(this.to, this.spawn); } }; }
}
// ---------- sombra (cinzas perdidas ao morrer) ----------
class Shade extends Ent {
  update(dt) { light(this.x, this.y - 20, 80, 0xb8e070, .7); if (Math.random() < dt * 10) part({ x: this.x + rnd(-8, 8), y: this.y - rnd(6, 34), vx: 0, vy: rnd(-40, -10), life: rnd(.4, .9), s: 1.5, color: 0xc8f080, glow: true }); const p = PLAYER; if (p && p.alive && Math.abs(p.x - this.x) < 18 && Math.abs(p.y - this.y) < 40) this.collect(); }
  draw(c) { const x = this.x, y = this.y - 20 + Math.sin(G.t * 2) * 3; c.save(); c.globalAlpha = .75; c.fillStyle = '#0a0c08'; c.beginPath(); c.moveTo(x - 9, y - 12); c.quadraticCurveTo(x, y - 22, x + 9, y - 12); c.lineTo(x + 7, y + 14); for (let i = 0; i < 4; i++) c.lineTo(x + 7 - i * 4.6, y + 14 + Math.sin(G.t * 6 + i) * 3); c.fill(); c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(0xb8e070), x - 22, y - 26, 44, 44); c.fillStyle = '#e0ffc0'; ell(c, x - 2, y - 10, 1.4, 2.4); ell(c, x + 3, y - 10, 1.3, 2.2); c.restore(); }
  collect() { const i = ENTS.indexOf(this); if (i >= 0) ENTS.splice(i, 1); GAME.recoverShade(); }
}
// ---------- adereços animados (luz) ----------
class Torch extends Ent {
  update(dt) { if (onScreen(this.x, this.y, 200)) { light(this.x, this.y - 10, this.r || 170, this.color || 0xff8a3a, this.i || 1, .2); if (Math.random() < dt * 6) part({ x: this.x + rnd(-2, 2), y: this.y - 12, vx: rnd(-8, 8), vy: rnd(-50, -25), life: rnd(.4, .9), s: 1, s1: .2, color: 0xffb050, glow: true }); } }
  draw(c) {
    const x = this.x, y = this.y, t = G.t, k = this.kind || 'wall';
    if (k === 'wall') { c.fillStyle = '#2a2622'; c.fillRect(x - 1.5, y - 8, 3, 12); c.fillRect(x - 4, y - 9, 8, 3); }
    else if (k === 'brazier') { c.fillStyle = '#26221e'; c.fillRect(x - 2, y - 18, 4, 18); c.fillRect(x - 6, y - 2, 12, 2); c.beginPath(); c.moveTo(x - 10, y - 22); c.lineTo(x + 10, y - 22); c.lineTo(x + 6, y - 16); c.lineTo(x - 6, y - 16); c.fill(); }
    else if (k === 'candles') { c.fillStyle = '#e8dcb8'; for (let i = 0; i < 4; i++) c.fillRect(x - 9 + i * 5, y - 6 - (i % 2) * 4 - (i === 2 ? 3 : 0), 3, 6 + (i % 2) * 4 + (i === 2 ? 3 : 0)); }
    c.save(); c.globalCompositeOperation = 'lighter';
    if (k === 'candles') { for (let i = 0; i < 4; i++) { const fx = x - 7.5 + i * 5, fy = y - 8 - (i % 2) * 4 - (i === 2 ? 3 : 0); c.drawImage(glowSpr(0xffb050), fx - 5, fy - 8, 10, 12); c.fillStyle = '#fff0c0'; ell(c, fx, fy - 1, .9, 2 + Math.sin(t * 13 + i) * .4); } }
    else { const fy = k === 'brazier' ? y - 24 : y - 12, s = k === 'brazier' ? 1.6 : 1; for (let i = 0; i < 3; i++) { const f = Math.sin(t * (10 + i * 3) + x) * .5 + .5; c.globalAlpha = .6 - i * .15; c.fillStyle = ['#ff6a20', '#ffa040', '#fff0c0'][i]; c.beginPath(); c.moveTo(x - 5 * s + i * 1.5, fy + 2); c.quadraticCurveTo(x - 4 * s, fy - 8 * s - f * 3, x + Math.sin(t * 6 + i) * 1.5, fy - (14 - i * 3) * s - f * 3); c.quadraticCurveTo(x + 4 * s, fy - 8 * s - f * 3, x + 5 * s - i * 1.5, fy + 2); c.fill(); } c.globalAlpha = .7; c.drawImage(glowSpr(0xff8a3a), x - 22 * s, fy - 26 * s, 44 * s, 44 * s); }
    c.restore();
  }
}
class Glow extends Ent { update() { if (onScreen(this.x, this.y, 300)) light(this.x, this.y, this.r || 150, this.color || 0xffe0b0, this.i ?? .8, this.flick || 0); } draw(c) { if (this.shaft) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(this.x, this.y - 40, this.x + this.shaft * 60, this.y + 260); g.addColorStop(0, rgba(this.color || 0xffe0b0, .16)); g.addColorStop(1, rgba(this.color || 0xffe0b0, 0)); c.fillStyle = g; c.beginPath(); c.moveTo(this.x - 14, this.y - 30); c.lineTo(this.x + 14, this.y - 30); c.lineTo(this.x + 60 + this.shaft * 80, this.y + 260); c.lineTo(this.x - 20 + this.shaft * 80, this.y + 260); c.fill(); c.restore(); } } }
// ---------- NPCs ----------
class NPC extends Ent {
  constructor(o) { super(o); this.face = this.face || -1; this.ph = rnd(0, TAU); }
  update(dt) { if (this.hidden) return; const p = PLAYER; if (p && Math.abs(p.x - this.x) < 160 && !this.fixedFace) this.face = Math.sign(p.x - this.x) || this.face; if (this.light) light(this.x, this.y - 24, 90, this.light, .6); }
  draw(c) { if (this.hidden) return; c.save(); c.translate(this.x, this.y); c.scale(this.face, 1); NPC_ART[this.art || this.id](c, this, G.t); c.restore(); }
  interact() { if (this.hidden || (this.cond && !this.cond())) return null; return { label: 'Falar com ' + this.name, r: 40, act: () => this.talk() }; }
  talk() {
    const tbl = DIALOG[this.dialog || this.id]; if (!tbl) return; const e = tbl.find(x => !x.cond || x.cond()); if (!e) return;
    const lines = typeof e.lines === 'function' ? e.lines() : e.lines; const p = PLAYER; p.face = Math.sign(this.x - p.x) || p.face;
    UI.dialog(this.name, lines, () => { if (e.set) PROG.flags[e.set] = 1; const gift = typeof e.gift === 'function' ? e.gift() : e.gift; if (gift && !PROG.flags['gift_' + this.id + gift]) { PROG.flags['gift_' + this.id + gift] = 1; GAME.giveItem(gift, 1, () => this.afterTalk && this.afterTalk()); } else this.afterTalk && this.afterTalk(); GAME.save(); }, { voice: this.voice || this.id });
  }
}
const NPC_ART = {
  ione(c, n, t) { // menina cega com véu, sentada junto à chama
    c.fillStyle = col(0xe8e2d4); c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(-11, -16, -5, -22); c.lineTo(6, -22); c.quadraticCurveTo(12, -12, 12, 0); c.fill();
    c.fillStyle = col(0xcfc6b4); c.fillRect(-10, -3, 22, 3);
    c.fillStyle = col(0xf0eadc); ell(c, 1, -28, 7, 7); c.fillStyle = col(0xd8d0c0); c.beginPath(); c.moveTo(-7, -30); c.quadraticCurveTo(1, -40, 9, -30); c.lineTo(10, -14); c.lineTo(-9, -14); c.fill();
    c.fillStyle = col(0x2a2228); c.fillRect(-3, -30, 10, 2.4); // venda nos olhos
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .7 + Math.sin(t * 3) * .2; c.drawImage(glowSpr(0xffc070), 2, -22, 18, 18); c.fillStyle = '#fff0c0'; ell(c, 11, -13, 1.6, 2.2); c.restore();
    c.fillStyle = col(0xe8e2d4); ell(c, 8, -12, 3, 2.4);
  },
  hrolf(c, n, t) { // ferreiro corpulento sentado com um martelo
    c.fillStyle = col(0x1e1a18); c.fillRect(-12, -6, 9, 6); c.fillRect(2, -6, 9, 6);
    c.fillStyle = col(0x3a2a20); c.beginPath(); c.moveTo(-14, -6); c.lineTo(14, -6); c.lineTo(12, -32); c.lineTo(-12, -32); c.fill(); c.fillStyle = col(0x5a4030); c.fillRect(-8, -30, 16, 24);
    c.fillStyle = col(0x2a2020); ell(c, 1, -38, 10, 9); drawMask(c, 3, -38, 1.15, { c: 0xb8aa98, shape: 'skull' }); c.fillStyle = col(0x6a6a6a); poly(c, [-4, -33, 8, -33, 2, -22]); // barba de cinza
    weapon(c, 'hammer', 10, -16, -1.2 + Math.sin(t * .8) * .05, .8, 0x8a8a90);
  },
  maren(c, n, t) { // viajante encapuçada
    c.fillStyle = col(0x10120e); c.fillRect(-6, -6, 4, 6); c.fillRect(2, -6, 4, 6);
    c.fillStyle = col(0x2a3424); c.beginPath(); c.moveTo(-7, -30); c.lineTo(7, -30); c.lineTo(11, -5); c.lineTo(-11, -5); c.fill();
    c.fillStyle = col(0x22301e); c.beginPath(); c.ellipse(0, -36, 9, 9, 0, 0, TAU); c.fill(); poly(c, [-6, -40, -15, -34 + Math.sin(t * 2) * 1.5, -6, -32]);
    drawMask(c, 2, -35, 1, { c: 0xd8cfc0, shape: 'long' });
    c.fillStyle = col(0x5a4a36); c.fillRect(8, -30, 2, 30);
  },
  teodoro(c, n, t) { // velho sacristão de túnica
    const hol = n.hollow; c.fillStyle = col(0x1a1614); c.beginPath(); c.moveTo(-7, -28); c.lineTo(6, -28); c.lineTo(10, 0); c.lineTo(-10, 0); c.fill(); c.fillStyle = col(0x2e2620); c.fillRect(-2, -28, 4, 28);
    drawMask(c, 2, -34, 1, { c: hol ? 0x9a9488 : 0xd8d0c0, shape: 'skull', eye: hol ? 0xff6a3a : undefined });
    c.fillStyle = col(0x4a3a2a); c.fillRect(-12, -26, 2, 26); c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(0xffb050), -18, -40, 16, 16); c.restore();
  },
};
