// ===================== INIMIGOS I: Cripta, Muralhas, Pântano =====================
// ângulo do braço/arma conforme a fase do golpe (0 = para a frente, positivo = para baixo)
function swingAng(e, rest = .9, up = -2.1, end = 1.15) {
  const m = e.move; if (!m) return rest + Math.sin(G.t * 2 + e.ph) * .05;
  const M = m.m; if (M.pose === 'thrust') { if (m.phase === 'wind') return lerp(rest, -.25, easeOut(Math.min(1, m.t / (M.wind ?? .4)))); return 0; }
  if (m.phase === 'wind') return lerp(rest, up, easeOut(Math.min(1, m.t / (M.wind ?? .4))));
  if (m.phase === 'act') return lerp(up, end, easeOut(Math.min(1, m.t2 / (M.act ?? .12))));
  return lerp(end, rest, Math.min(1, m.t3 / (M.rec ?? .4)));
}
function weapon(c, kind, x, y, ang, s = 1, wc) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const W = col(wc ?? 0xc8c0b0), H = col(0x4a3a2a);
  switch (kind) {
    case 'sword': c.fillStyle = H; c.fillRect(-4, -1.2, 5, 2.4); c.fillRect(0, -3.5, 1.6, 7); c.fillStyle = W; poly(c, [1.6, -1.5, 22, -1, 25, 0, 22, 1, 1.6, 1.5]); break;
    case 'rusty': c.fillStyle = H; c.fillRect(-4, -1.2, 5, 2.4); c.fillStyle = col(wc ?? 0x8a7a66); poly(c, [1, -1.8, 14, -2, 17, -.5, 19, 1, 1, 1.8]); break;
    case 'greatsword': c.fillStyle = H; c.fillRect(-7, -1.5, 8, 3); c.fillRect(0, -5, 2, 10); c.fillStyle = W; poly(c, [2, -2.6, 38, -2, 43, 0, 38, 2, 2, 2.6]); break;
    case 'axe': c.fillStyle = H; c.fillRect(-4, -1.4, 34, 2.8); c.fillStyle = W; c.beginPath(); c.moveTo(24, -2); c.quadraticCurveTo(34, -14, 40, -8); c.lineTo(38, 8); c.quadraticCurveTo(32, 10, 24, 3); c.fill(); break;
    case 'hammer': c.fillStyle = H; c.fillRect(-4, -1.6, 30, 3.2); c.fillStyle = W; c.fillRect(22, -8, 12, 16); c.fillStyle = col(shade(wc ?? 0xc8c0b0, -.3)); c.fillRect(22, 4, 12, 4); break;
    case 'spear': c.fillStyle = H; c.fillRect(-14, -1.2, 46, 2.4); c.fillStyle = W; poly(c, [32, -3.2, 42, 0, 32, 3.2]); break;
    case 'lance': c.fillStyle = H; c.fillRect(-16, -1.6, 50, 3.2); c.fillStyle = W; poly(c, [30, -5, 50, 0, 30, 5]); break;
    case 'staff': c.fillStyle = H; c.fillRect(-14, -1.2, 40, 2.4); c.fillStyle = W; ell(c, 27, 0, 3.5, 3.5); break;
    case 'dagger': c.fillStyle = H; c.fillRect(-3, -1, 4, 2); c.fillStyle = W; poly(c, [1, -1.4, 11, 0, 1, 1.4]); break;
    case 'scepter': c.fillStyle = col(0xc8a040); c.fillRect(-10, -1.2, 32, 2.4); ell(c, 23, 0, 4, 4); break;
  }
  c.restore();
}
// humanoide mascarado genérico
function drawHum(c, e, o) {
  const H = o.h || e.h, t = G.t, hunch = o.hunch || 0, bob = Math.abs(e.vx) > 5 ? Math.abs(Math.sin(e.walkPh)) * 1.5 : Math.sin(t * 2 + e.ph) * .6;
  const ang = o.ang ?? swingAng(e, o.rest ?? .9, o.up ?? -2.1, o.end ?? 1.15);
  if (!o.robe) legs(c, e, o.legW || 4, o.legH || H * .26, o.legC ?? 0x100e12, o.legGap || 4);
  c.save(); c.translate(0, -bob * .5); c.rotate(hunch + (o.lean ?? (e.move && e.move.phase === 'wind' ? -.06 : e.move && e.move.phase === 'act' ? .12 : 0)));
  // arma atrás (mão de trás) para escudos
  const shY = -H * .62, bodyTop = -H * .78;
  // corpo
  c.fillStyle = col(o.body ?? 0x1e1a20);
  if (o.robe) { c.beginPath(); c.moveTo(-o.w * .3, bodyTop); c.lineTo(o.w * .32, bodyTop); c.quadraticCurveTo(o.w * .55, -H * .4, o.w * .6, 0); for (let i = 4; i >= 0; i--) c.lineTo(-o.w * .6 + i * o.w * .3, -(i % 2) * 3 + Math.sin(t * 3 + i + e.ph) * 1); c.quadraticCurveTo(-o.w * .55, -H * .4, -o.w * .3, bodyTop); c.fill(); }
  else { c.beginPath(); c.moveTo(-o.w * .32, bodyTop); c.lineTo(o.w * .34, bodyTop); c.lineTo(o.w * .4, -H * .24); c.lineTo(-o.w * .42, -H * .24); c.fill(); }
  if (o.body2) { c.fillStyle = col(o.body2); c.beginPath(); c.moveTo(o.w * .05, bodyTop + 2); c.lineTo(o.w * .3, bodyTop + 2); c.lineTo(o.w * (o.robe ? .52 : .38), o.robe ? -2 : -H * .25); c.lineTo(o.w * .12, o.robe ? -2 : -H * .25); c.fill(); }
  if (o.belt) { c.fillStyle = col(o.belt); c.fillRect(-o.w * .38, -H * .42, o.w * .78, 2.5); }
  if (o.pauldron) { c.fillStyle = col(o.pauldron); ell(c, o.w * .22, bodyTop + 2, o.w * .22, 4); }
  if (o.cape) { c.fillStyle = col(o.cape); c.beginPath(); c.moveTo(-o.w * .3, bodyTop); c.quadraticCurveTo(-o.w * .7 - Math.abs(e.vx) * .03, -H * .4, -o.w * .55 - Math.abs(e.vx) * .05, -2 + Math.sin(t * 3 + e.ph) * 2); c.lineTo(-o.w * .15, -H * .3); c.fill(); }
  // cabeça
  const hx = o.headX ?? o.w * .12, hy = bodyTop - (o.neck ?? 4);
  if (o.hood) { c.fillStyle = col(o.hood); c.beginPath(); c.ellipse(hx - 1, hy - 1, 9 * (o.ms || 1), 9.5 * (o.ms || 1), 0, 0, TAU); c.fill(); if (o.hoodTip) poly(c, [hx - 6, hy - 6, hx - 15, hy - 14 + Math.sin(t * 2) * 1.5, hx - 2, hy - 8]); }
  drawMask(c, hx + 1, hy, o.ms || 1, o.mask || {});
  if (o.plume) { c.fillStyle = col(o.plume); c.beginPath(); c.moveTo(hx, hy - 7 * (o.ms || 1)); c.quadraticCurveTo(hx - 10, hy - 18, hx - 20, hy - 12 + Math.sin(t * 4) * 2); c.quadraticCurveTo(hx - 10, hy - 12, hx - 2, hy - 5); c.fill(); }
  if (o.crown) { c.fillStyle = col(0xd8b04a); for (let i = -2; i <= 2; i++) poly(c, [hx + i * 3 - 1.5, hy - 6, hx + i * 3, hy - 11 - (i % 2 ? 0 : 2), hx + i * 3 + 1.5, hy - 6]); c.fillRect(hx - 8, hy - 7, 16, 2); }
  if (o.extraHead) o.extraHead(c, hx, hy);
  // escudo
  if (o.shield) { c.fillStyle = col(o.shield); c.beginPath(); c.ellipse(o.w * .48, -H * .5, 6, H * .26, 0, 0, TAU); c.fill(); c.fillStyle = col(shade(o.shield, .25)); ell(c, o.w * .5, -H * .5, 2, 2); c.strokeStyle = col(shade(o.shield, -.3)); c.lineWidth = 1.2; c.beginPath(); c.ellipse(o.w * .48, -H * .5, 6, H * .26, 0, 0, TAU); c.stroke(); }
  // arma
  if (o.weapon) { c.fillStyle = col(o.body ?? 0x1e1a20); const ax = o.w * .2, ay = shY; ell(c, ax + Math.cos(ang) * 6, ay + Math.sin(ang) * 6, 3, 3.5); weapon(c, o.weapon, ax + Math.cos(ang) * 9, ay + Math.sin(ang) * 9, ang, o.ws || 1, o.wc); }
  if (o.extra) o.extra(c, H, ang);
  c.restore();
}
// --------------------------------------------------------- CRIPTA
EDEF.oco = {
  name: 'Oco', w: 18, h: 38, hp: 30, cinzas: 18, walk: 34, run: 92, keep: [10, 30], sight: 220, poise: 14, touch: 6, sndHurt: ['z_hit1', 'z_hit2'], sndDie: 'crumble', sndAggro: 'moan', voice: 'hollow', glint: [8, -30],
  moves: [
    { id: 'slash', range: [0, 52], wind: .48, act: .12, rec: .45, lunge: 140, cd: 1.1, hit: { ox: 26, oy: -20, w: 42, h: 30, dmg: 13, len: 30 } },
    { id: 'stab', range: [40, 120], wind: .6, act: .2, rec: .55, lunge: 300, cd: 1.6, pose: 'thrust', hit: { ox: 22, oy: -20, w: 34, h: 18, dmg: 15, life: .2, fx: false } },
  ],
  draw(c, e) { drawHum(c, e, { w: 18, h: 38, body: 0x2a2420, body2: 0x3a322c, hunch: .22, mask: { c: 0xcfc6b2, eye: 0xff8a40, shape: 'skull' }, weapon: 'rusty', hood: 0x231e1b, hoodTip: true }); },
};
EDEF.rastejante = {
  name: 'Rastejante', w: 26, h: 14, hp: 13, cinzas: 8, touch: 10, sndHurt: ['sk_hit'], sndDie: 'sk_die', ash: 0xb8b0a0,
  ai(e, dt) { e.walkPh += dt * 6; if (e.onGround) { if (e.hitWall || e.edgeAhead()) e.face *= -1; e.vx = e.face * (e.aggro ? 58 : 40); } },
  draw(c, e, t) {
    c.fillStyle = col(0x0e0c10); for (let i = 0; i < 4; i++) { const ph = e.walkPh + i * 1.6; c.fillRect(-9 + i * 6, -5 + Math.sin(ph) * 1.5, 2, 5); }
    c.fillStyle = col(0xcdc4b0); c.beginPath(); c.ellipse(0, -7, 13, 7, 0, PI, 0); c.fill(); c.fillStyle = col(0x9a907e); for (let i = -1; i <= 1; i++) c.fillRect(i * 5 - 1, -13, 2, 6);
    c.fillStyle = col(0x0a0809); ell(c, 9, -6, 1.6, 1.8); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,140,60,.8)'; ell(c, 9.4, -6, .7, .8); c.globalCompositeOperation = 'source-over';
  },
};
EDEF.vela = {
  name: 'Vela Errante', w: 16, h: 26, hp: 18, cinzas: 14, fly: true, run: 60, touch: 8, sight: 260, sightY: 200, hover: [-60, 80], sndHurt: ['wail_sml'], sndDie: 'wail_sml', light: [110, 0xffc070, .8], ash: 0xe8dcb0, blood: [0xffe0a0, 0xfff6d0], glint: [2, -22],
  moves: [{ id: 'wisp', range: [0, 300], wind: .75, act: .1, rec: .6, cd: 2.4, sndAct: 'faerie', fire(e) { const p = shootAt(e, 120, { dmg: 10, oy: -22, p: { r: 5, color: 0xffd080, homing: 1.1, life: 4, kind: 'orb' } }); p.target = PLAYER; } }],
  draw(c, e, t) {
    const b = Math.sin(t * 3 + e.ph) * 2; c.translate(0, b);
    c.fillStyle = col(0xc8d0ff, .18); c.beginPath(); c.moveTo(-10, -4); c.quadraticCurveTo(-12, -24, 0, -28); c.quadraticCurveTo(12, -24, 10, -4); for (let i = 0; i < 4; i++) c.lineTo(10 - i * 6.6, -4 + (i % 2 ? 5 : 0) + Math.sin(t * 6 + i) * 2); c.fill();
    c.fillStyle = col(0xe8dcb8); c.fillRect(-5, -20, 10, 14); c.fillStyle = col(0xfff2d0); c.fillRect(-5, -20, 10, 2.5); poly(c, [-5, -8, -6, -2, -3, -6]);
    c.fillStyle = col(0x0a0809); ell(c, -1.5, -13, 1.2, 2); ell(c, 2.5, -13, 1.1, 1.9);
    c.globalCompositeOperation = 'lighter'; const f = 1 + Math.sin(t * 17 + e.ph) * .12; c.drawImage(glowSpr(0xffb050), -9, -36 * f, 18, 18 * f); c.fillStyle = '#fff2c0'; ell(c, 0, -23, 1.6, 3.2 * f); c.globalCompositeOperation = 'source-over';
  },
};
// --------------------------------------------------------- MURALHAS
EDEF.soldado = {
  name: 'Soldado Juramentado', w: 22, h: 42, hp: 58, cinzas: 40, walk: 36, run: 84, keep: [16, 40], sight: 240, poise: 30, shield: true, guardBreak: 4, touch: 6, mass: 1.4, sndHurt: ['m_hit1', 'm_hit2'], sndDie: 'm_die', voice: 'hollow', blood: [0xd8d8e8, 0xfff6e0], glint: [10, -36],
  moves: [
    { id: 'thrust', range: [0, 70], wind: .5, act: .16, rec: .5, lunge: 230, cd: 1.2, pose: 'thrust', hit: { ox: 30, oy: -24, w: 46, h: 16, dmg: 16, fx: false } },
    { id: 'bash', range: [0, 34], wind: .32, act: .12, rec: .5, lunge: 120, cd: 1.6, sndAct: 'hit_club', hit: { ox: 18, oy: -24, w: 30, h: 34, dmg: 10, kb: 380, fx: false } },
  ],
  draw(c, e) { drawHum(c, e, { w: 22, h: 42, body: 0x2a2f3c, body2: 0x3a4a7a, belt: 0x6a5a3a, pauldron: 0x8a92a8, mask: { c: 0xb8bcc8, shape: 'helm' }, ms: 1.05, weapon: 'sword', wc: 0xd8dce8, shield: 0x6a5030, rest: .4 }); },
};
EDEF.besteiro = {
  name: 'Besteiro', w: 18, h: 40, hp: 34, cinzas: 30, walk: 30, run: 70, keep: [150, 280], sight: 340, sightY: 200, poise: 12, touch: 6, sndHurt: ['m_hit1'], sndDie: 'm_die', voice: 'hollow', glint: [12, -28],
  moves: [{ id: 'bolt', range: [0, 460], wind: .9, act: .1, rec: .6, cd: 1.8, track: true, trackWind: true, sndAct: 'crossbow',
    upd(e, p, dt, mv) { if (mv.phase === 'wind' && mv.t < .75) mv.data.a = Math.atan2(p.cy - (e.y - 26), p.x - (e.x + e.face * 12)); },
    fire(e, p, mv) { const a = mv.data.a ?? 0; new Proj({ x: e.x + e.face * 12, y: e.y - 26, vx: Math.cos(a) * 720, vy: Math.sin(a) * 720, r: 4, dmg: e.dmg(15), team: 'enemy', owner: e, kind: 'bolt', color: 0xffe0c0, light: false, life: 1.5 }); } }],
  draw(c, e) {
    drawHum(c, e, { w: 18, h: 40, body: 0x2a2620, body2: 0x5a3a2a, hood: 0x3a2e24, hoodTip: true, mask: { c: 0xcfc6b2, shape: 'beak' }, rest: 0,
      extra: (cc, H) => { const a = e.move && e.move.data.a !== undefined ? (e.face > 0 ? e.move.data.a : PI - e.move.data.a) : 0; cc.save(); cc.translate(8, -H * .6); cc.rotate(e.face > 0 ? a : a); cc.fillStyle = col(0x4a3a2a); cc.fillRect(-2, -1.5, 18, 3); cc.fillStyle = col(0x2a2018); cc.fillRect(12, -8, 2.5, 16); cc.restore(); } });
    if (e.move && e.move.phase === 'wind' && e.move.data.a !== undefined) { const a = e.face > 0 ? e.move.data.a : PI - e.move.data.a; c.save(); c.translate(8, -24); c.rotate(a); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .25 + .5 * (e.move.t / .9); c.fillStyle = '#ff4a3a'; c.fillRect(14, -.5, 520, 1); c.restore(); }
  },
};
EDEF.cao = {
  name: 'Cão de Guerra', w: 30, h: 22, hp: 32, cinzas: 26, walk: 60, run: 200, keep: [0, 30], sight: 260, poise: 10, touch: 9, sndHurt: ['wolf_hit'], sndDie: 'wolf_die', sndAggro: 'wolf_growl1', blood: [0x8a2a20, 0xd8c8b0], glint: [16, -16],
  moves: [
    { id: 'leap', range: [50, 190], wind: .35, act: .45, rec: .35, cd: 1.3, sndAct: 'wolf_growl2', fire(e) { e.vy = -360; e.vx = e.face * 340; }, upd(e, p, dt, mv) { if (mv.phase === 'act') { e.vx = e.face * 340; hitbox({ owner: e, team: 'enemy', ox: 10, oy: -12, w: 30, h: 20, life: dt * 1.5, dmg: e.dmg(13), kb: 240 }); if (e.onGround && mv.t2 > .1) { mv.phase = 'rec'; mv.t3 = 0; } } } },
    { id: 'bite', range: [0, 44], wind: .25, act: .1, rec: .4, lunge: 160, cd: .9, sndAct: 'hit_bite', hit: { ox: 18, oy: -12, w: 26, h: 18, dmg: 11, fx: false } },
  ],
  draw(c, e, t) {
    const run = Math.abs(e.vx) > 30, ph = e.walkPh * 1.4, air = !e.onGround;
    c.fillStyle = col(0x1a1614); for (const [x, o] of [[-9, 0], [-5, PI], [7, PI / 2], [11, PI * 1.5]]) { const a = run && !air ? Math.sin(ph + o) * .6 : air ? (x > 0 ? -.8 : .8) : 0; c.save(); c.translate(x, -10); c.rotate(a); c.fillRect(-1.5, 0, 3, 10); c.restore(); }
    c.fillStyle = col(0x241e1a); ell(c, 0, -13, 15, 6.5, air ? -.15 : 0); c.fillStyle = col(0x3a302a); ell(c, -2, -16, 11, 3);
    c.fillStyle = col(0x241e1a); poly(c, [-14, -14, -24, -18 + Math.sin(t * 9) * 3, -14, -11]);
    c.save(); c.translate(15, -16); c.rotate(e.move && e.move.phase === 'wind' ? -.3 : 0); drawMask(c, 2, 0, .8, { c: 0xd0c8b8, eye: 0xff3a2a, shape: 'beak' }); c.restore();
  },
};
EDEF.corvo = {
  name: 'Corvo Carniceiro', w: 20, h: 14, hp: 13, cinzas: 12, fly: true, run: 120, touch: 9, sight: 260, sightY: 220, hover: [-110, 60], sndHurt: ['bat_hit'], sndDie: 'gryphon_die', sndAggro: 'shriek', blood: [0x2a2228, 0xd8c8b0], glint: [8, -8],
  moves: [{ id: 'swoop', range: [0, 300], wind: .45, act: .7, rec: .5, cd: 1.4, sndAct: 'shriek2',
    fire(e, p, mv) { const a = Math.atan2(p.cy - e.cy, p.x - e.x); mv.data.vx = Math.cos(a) * 420; mv.data.vy = Math.sin(a) * 420; },
    upd(e, p, dt, mv) { if (mv.phase === 'act') { e.vx = mv.data.vx; e.vy = mv.data.vy; mv.data.vy -= 700 * dt; e.face = Math.sign(e.vx) || e.face; hitbox({ owner: e, team: 'enemy', ox: 0, oy: -7, w: 20, h: 14, life: dt * 1.5, dmg: e.dmg(11) }); } else if (mv.phase === 'rec') { e.vy = approach(e.vy, -120, 600 * dt); } } }],
  draw(c, e, t) { const f = Math.sin(t * 18 + e.ph); c.fillStyle = col(0x141016); ell(c, 0, -7, 9, 5); poly(c, [-8, -8, -16, -10, -15, -4]); c.fillStyle = col(0x1e1a22); poly(c, [-2, -9, -10, -9 - 10 * f, 4, -8]); poly(c, [0, -9, 6, -10 - 9 * f, 8, -8]); drawMask(c, 8, -8, .6, { c: 0xd8d0c0, eye: 0xff4a3a, shape: 'beak' }); },
};
// --------------------------------------------------------- PÂNTANO
EDEF.afogado = {
  name: 'Afogado', w: 22, h: 40, hp: 54, cinzas: 42, walk: 26, run: 62, keep: [0, 34], sight: 200, poise: 22, touch: 8, hidden: true, trigger: 90, emergeT: .8, swim: true, sndHurt: ['mermaid_hit'], sndDie: 'mermaid_die', voice: 'hollow', blood: [0x4a6a50, 0x9ab0a0], ash: 0x5a6a58, glint: [8, -30],
  moves: [
    { id: 'claw', range: [0, 52], wind: .5, act: .14, rec: .5, lunge: 110, cd: 1.1, sndAct: 'hit_claws', hit: { ox: 22, oy: -22, w: 36, h: 32, dmg: 15, color: 0xb8e0c0 } },
    { id: 'grab', range: [40, 130], wind: .62, act: .22, rec: .7, lunge: 280, cd: 2, pose: 'thrust', hit: { ox: 18, oy: -22, w: 30, h: 28, dmg: 18, life: .22, fx: false } },
  ],
  draw(c, e, t) {
    const em = e.state === 'emerge' ? clamp(e.st / .8, 0, 1) : 1; c.translate(0, (1 - em) * 34);
    drawHum(c, e, { w: 22, h: 40, body: 0x2a3a30, body2: 0x3a4a3a, hunch: .3, mask: { c: 0xa8b8a8, eye: 0xc0ffd0, shape: 'long' }, rest: .7, up: -1.6, end: 1.2,
      extraHead: (cc, hx, hy) => { cc.fillStyle = col(0x1a2a1a); for (let i = 0; i < 5; i++) poly(cc, [hx - 7 + i * 3, hy - 6, hx - 9 + i * 3, hy + 10 + Math.sin(t * 3 + i) * 2, hx - 5 + i * 3, hy - 4]); },
      extra: (cc, H, ang) => { cc.fillStyle = col(0x2a3a30); cc.save(); cc.translate(6, -H * .62); cc.rotate(ang); cc.fillRect(0, -2, 14, 4); cc.fillStyle = col(0xa8b8a8); for (let k = 0; k < 3; k++) poly(cc, [14, -2 + k * 2, 19, -3 + k * 3, 14, k * 2]); cc.restore(); } });
  },
  drawHidden: true,
};
// o afogado escondido só mostra os olhos
EDEF.afogado.draw0 = EDEF.afogado.draw; EDEF.afogado.draw = function (c, e, t) { if (e.state === 'hidden') { c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(190,255,210,.7)'; const b = Math.sin(t * 2 + e.ph) > .9 ? .2 : 1; ell(c, 2, -6, 1.2, 1.2 * b); ell(c, 6, -6, 1.1, 1.1 * b); c.globalCompositeOperation = 'source-over'; return; } EDEF.afogado.draw0(c, e, t); };
EDEF.bruxa = {
  name: 'Bruxa das Velas', w: 18, h: 42, hp: 46, cinzas: 46, walk: 30, run: 60, keep: [120, 230], sight: 300, sightY: 180, poise: 12, touch: 6, sndHurt: ['f_hit1', 'f_hit2'], sndDie: 'f_die1', voice: 'vesper', light: [90, 0xffb060, .7], glint: [4, -40],
  moves: [
    { id: 'candles', range: [0, 360], wind: .75, act: .1, rec: .6, cd: 2.4, sndAct: 'cast_fire', fire(e, p) { for (let i = -1; i <= 1; i++) { const pr = new Proj({ x: e.x + i * 10, y: e.y - 50, vx: i * 60, vy: -120, r: 5, dmg: e.dmg(11), team: 'enemy', owner: e, color: 0xffb050, homing: 1.6, life: 3.5, trail: true }); pr.target = p; } } },
    { id: 'blink', range: [0, 90], wind: .3, act: .05, rec: .3, cd: 1, cdOwn: 4, sndAct: 'tele', fire(e, p) { burst(e.x, e.cy, 20, { color: [0x2a3a2a, 0x5a7a4a], glow: false, smin: 40, smax: 140 }); for (let k = 0; k < 12; k++) { const nx = p.x + (Math.random() < .5 ? -1 : 1) * rnd(130, 220); const ty = Math.floor((e.y - 4) / T); if (!solidAt(nx, e.y - 20) && solidAt(nx, e.y + 6)) { e.x = nx; break; } } burst(e.x, e.cy, 20, { color: [0x2a3a2a, 0x5a7a4a], glow: false, smin: 40, smax: 140 }); } },
  ],
  draw(c, e, t) {
    drawHum(c, e, { w: 20, h: 42, robe: true, body: 0x1e2a1c, body2: 0x2e3e2a, mask: { c: 0xd8d0c0, shape: 'long', eye: 0xffc070 }, hood: 0x16201a, weapon: 'staff', wc: 0xffc070, rest: -.9, up: -1.6, end: -.6, neck: 2,
      extraHead: (cc, hx, hy) => { cc.fillStyle = col(0x16201a); poly(cc, [hx - 8, hy - 4, hx - 2, hy - 26, hx + 6, hy - 5]); cc.fillStyle = col(0xe8dcb0); cc.fillRect(hx - 4, hy - 30, 4, 7); cc.globalCompositeOperation = 'lighter'; cc.drawImage(glowSpr(0xffb050), hx - 10, hy - 44, 16, 16); cc.fillStyle = '#fff0c0'; ell(cc, hx - 2, hy - 33, 1.2, 2.6); cc.globalCompositeOperation = 'source-over'; } });
  },
};
EDEF.inchado = {
  name: 'Inchado', w: 30, h: 34, hp: 40, cinzas: 30, walk: 22, run: 44, keep: [0, 30], sight: 200, poise: 30, touch: 8, superArmor: true, sndHurt: ['squish'], sndDie: 'squish', blood: [0x8ab040, 0xc8e070], ash: 0x6a7a40, glint: [6, -26],
  moves: [{ id: 'pop', range: [0, 46], wind: 1.0, act: .05, rec: .1, cd: 1, snd: 'hiss', fire(e) { e.hp = 0; e.die({ dir: 0 }); } }],
  onDie(e) { const x = e.x, y = e.y - 16; ringFx(x, y, 10, 64, 0xb0e060, .4, 5); burst(x, y, 34, { color: [0x8ab040, 0xc8e070, 0x5a7a20], smin: 60, smax: 240, lmin: .4, lmax: .9 }); aoe({ x, y, r: 62, shape: 'circle', delay: 0, dur: .12, dmg: e.dmg(18), type: 'poison', color: 0xb0e060 }); sfx('poison', { x, y, vol: .8 }); sfx('explosion', { x, y, vol: .4, rate: 1.4 });
    // nuvem venenosa que fica
    aoe({ x, y: y + 6, r: 50, shape: 'circle', delay: .3, dur: 2.6, dmg: e.dmg(6), type: 'poison', color: 0x9ad04a, draw(cc, a) { const k = clamp(1 - (a.t - a.delay) / a.dur, 0, 1); cc.globalAlpha = .35 * k; for (let i = 0; i < 5; i++) cc.drawImage(glowSpr(0x7ab030), a.x - 40 + i * 18 - 20 + Math.sin(a.t * 2 + i) * 6, a.y - 34 + Math.cos(a.t * 1.5 + i) * 6, 50, 50); } }); },
  draw(c, e, t) {
    const sw = e.move ? 1 + clamp(e.move.t / 1, 0, 1) * .35 + Math.sin(t * 40) * .03 * (e.move.t > .5 ? 1 : 0) : 1 + Math.sin(t * 2 + e.ph) * .03;
    legs(c, e, 4, 7, 0x1a1a10, 7); c.save(); c.translate(0, -17); c.scale(sw, sw);
    c.fillStyle = col(0xa8b08a); ell(c, 0, 0, 15, 14); c.fillStyle = col(0x7a8a5a); for (let i = 0; i < 6; i++) ell(c, Math.cos(i * 2.3) * 8, Math.sin(i * 1.7) * 7, 2.6, 2);
    c.fillStyle = col(0xc8d0a8); ell(c, -4, -5, 6, 4); drawMask(c, 7, -2, .7, { c: 0xe0d8c0, eye: 0xc8ff80 }); c.restore();
  },
};
EDEF.mosquito = {
  name: 'Mosca do Pântano', w: 14, h: 10, hp: 11, cinzas: 9, fly: true, run: 150, touch: 8, sight: 240, sightY: 220, hover: [-40, 50], sndHurt: ['bat_hit'], sndDie: 'squish', blood: [0x8ab040], glint: [6, -6],
  moves: [{ id: 'dive', range: [0, 220], wind: .35, act: .4, rec: .4, cd: 1.1, sndAct: 'bat', fire(e, p, mv) { const a = Math.atan2(p.cy - e.cy, p.x - e.x); mv.data.vx = Math.cos(a) * 400; mv.data.vy = Math.sin(a) * 400; }, upd(e, p, dt, mv) { if (mv.phase === 'act') { e.vx = mv.data.vx; e.vy = mv.data.vy; hitbox({ owner: e, team: 'enemy', ox: 0, oy: -5, w: 14, h: 10, life: dt * 1.5, dmg: e.dmg(9) }); } } }],
  tick(e, dt) { if (!e.move && e.aggro) { e.vx += rnd(-600, 600) * dt; e.vy += rnd(-600, 600) * dt; } },
  draw(c, e, t) { c.fillStyle = col(0x1a1c10); ell(c, 0, -5, 6, 4); c.fillStyle = col(0x2a2c18); ell(c, -5, -4, 4, 3); c.fillStyle = col(0xc8d0b0, .5); const f = Math.sin(t * 50); ell(c, -1, -10, 6, 2.5 * Math.abs(f) + .5); c.fillStyle = col(0x2a2018); c.fillRect(5, -5, 7, 1); c.fillStyle = col(0xff6a3a); ell(c, 3, -6, 1.3, 1.3); },
};
