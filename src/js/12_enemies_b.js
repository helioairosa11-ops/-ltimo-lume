// ===================== INIMIGOS II: Bosque, Forja, Catedral, Coração =====================
// --------------------------------------------------------- BOSQUE
EDEF.lobo = {
  name: 'Lobo Cinzento', w: 34, h: 24, hp: 46, cinzas: 40, walk: 60, run: 230, keep: [60, 120], sight: 280, poise: 14, touch: 9, sndHurt: ['wolf_hit'], sndDie: 'wolf_die', sndAggro: 'wolf_growl2', blood: [0x8a2a20, 0xd8d0e0], ash: 0xb8b4c4, glint: [18, -18],
  moves: [
    { id: 'lunge', range: [50, 200], wind: .4, act: .45, rec: .4, cd: 1.2, sndAct: 'wolf_growl1', fire(e) { e.vy = -260; e.vx = e.face * 390; }, upd(e, p, dt, mv) { if (mv.phase === 'act') { e.vx = e.face * 390; hitbox({ owner: e, team: 'enemy', ox: 12, oy: -12, w: 32, h: 20, life: dt * 1.5, dmg: e.dmg(15), kb: 240 }); if (e.onGround && mv.t2 > .12) { mv.phase = 'rec'; mv.t3 = 0; } } } },
    { id: 'bite', range: [0, 50], wind: .28, act: .1, rec: .35, lunge: 180, cd: .8, sndAct: 'hit_bite', hit: { ox: 20, oy: -12, w: 28, h: 18, dmg: 12, fx: false } },
    { id: 'circle', range: [0, 140], wind: .1, act: .7, rec: .1, cd: .6, w: .7, track: false, fire(e) { e.face = -e.face; }, upd(e, p, dt, mv) { if (mv.phase === 'act') e.vx = e.face * 160; } },
  ],
  draw(c, e, t) { EDEF.cao.draw.call(this, c, e, t); },
};
EDEF.lobo.draw = function (c, e, t) {
  const run = Math.abs(e.vx) > 30, ph = e.walkPh * 1.3, air = !e.onGround;
  c.fillStyle = col(0x3a3846); for (const [x, o] of [[-11, 0], [-7, PI], [8, PI / 2], [12, PI * 1.5]]) { const a = run && !air ? Math.sin(ph + o) * .7 : air ? (x > 0 ? -.9 : .9) : 0; c.save(); c.translate(x, -11); c.rotate(a); c.fillRect(-1.6, 0, 3.2, 11); c.restore(); }
  c.fillStyle = col(0x4a4858); ell(c, 0, -15, 17, 7, air ? -.12 : 0); c.fillStyle = col(0x8a889a); ell(c, -2, -18, 13, 3.5); c.fillStyle = col(0xc8c6d4); for (let i = 0; i < 5; i++) poly(c, [-10 + i * 4, -20, -8 + i * 4, -25 - (i % 2) * 2, -6 + i * 4, -20]);
  c.fillStyle = col(0x4a4858); c.beginPath(); c.moveTo(-16, -16); c.quadraticCurveTo(-26, -20, -30, -12 + Math.sin(t * 8) * 3); c.quadraticCurveTo(-22, -14, -15, -12); c.fill();
  c.save(); c.translate(17, -19); c.rotate(e.move && e.move.phase === 'wind' ? -.25 : 0); c.fillStyle = col(0x4a4858); poly(c, [-2, -6, 6, -10, 3, -3]); drawMask(c, 4, 0, .85, { c: 0xe0dcd0, eye: 0xff3a2a, shape: 'beak' }); c.restore();
};
EDEF.cacador = {
  name: 'Caçador Oco', w: 18, h: 40, hp: 50, cinzas: 46, walk: 40, run: 120, keep: [150, 260], sight: 340, sightY: 200, poise: 14, touch: 6, sndHurt: ['m_hit1'], sndDie: 'm_die', voice: 'orin', glint: [12, -30],
  moves: [
    { id: 'arrow', range: [80, 440], wind: .65, act: .1, rec: .5, cd: 1.5, sndAct: 'bow', fire(e, p) { const dx = p.x - e.x, sp = 520, tt = Math.abs(dx) / sp; new Proj({ x: e.x + e.face * 12, y: e.y - 28, vx: Math.sign(dx) * sp, vy: -380 * tt * .5 * 2 + (p.cy - (e.y - 28)) / Math.max(.2, tt), grav: 380, r: 4, dmg: e.dmg(14), team: 'enemy', owner: e, kind: 'arrow', color: 0xffe0c0, light: false, life: 2.5 }); } },
    { id: 'volley', range: [120, 440], wind: .85, act: .1, rec: .6, cd: 2.6, w: .7, sndAct: 'bow', fire(e, p) { for (let i = -1; i <= 1; i++) { const dx = p.x - e.x + i * 50, sp = 480, tt = Math.max(.25, Math.abs(dx) / sp); new Proj({ x: e.x + e.face * 12, y: e.y - 28, vx: Math.sign(dx || 1) * sp, vy: (p.cy - (e.y - 28)) / tt - 190 * tt, grav: 380, r: 4, dmg: e.dmg(12), team: 'enemy', owner: e, kind: 'arrow', color: 0xffe0c0, light: false, life: 2.5 }); } } },
    { id: 'slash', range: [0, 50], wind: .35, act: .1, rec: .4, lunge: 150, cd: .9, hit: { ox: 22, oy: -22, w: 34, h: 28, dmg: 13 } },
    { id: 'flip', range: [0, 90], wind: .1, act: .45, rec: .2, cd: 1, cdOwn: 3, sndAct: 'whoosh1', fire(e) { e.vy = -420; e.vx = -e.face * 260; }, upd(e, p, dt, mv) { if (mv.phase === 'act') e.vx = -e.face * 260; } },
  ],
  draw(c, e, t) {
    const drawBow = e.move && (e.move.m.id === 'arrow' || e.move.m.id === 'volley') && e.move.phase !== 'rec';
    drawHum(c, e, { w: 18, h: 40, body: 0x2e2a34, body2: 0x4a4458, belt: 0x6a5a3a, hood: 0x3a3646, hoodTip: true, mask: { c: 0xd8d4c8, shape: 'beak', eye: 0xff8a40 }, weapon: drawBow ? null : 'dagger', rest: .6, cape: 0x5a5468,
      extra: (cc, H) => { if (!drawBow) { cc.save(); cc.translate(-6, -H * .55); cc.rotate(.4); cc.strokeStyle = col(0x5a4a3a); cc.lineWidth = 2; cc.beginPath(); cc.arc(0, 0, 13, -1.1, 1.1); cc.stroke(); cc.restore(); return; } const k = e.move.phase === 'wind' ? Math.min(1, e.move.t / .6) : 1; cc.save(); cc.translate(12, -H * .62); cc.strokeStyle = col(0x5a4a3a); cc.lineWidth = 2.2; cc.beginPath(); cc.arc(-6, 0, 15, -1.1, 1.1); cc.stroke(); cc.strokeStyle = col(0xd8d0c0); cc.lineWidth = .8; cc.beginPath(); cc.moveTo(1, -13); cc.lineTo(-6 - k * 9, 0); cc.lineTo(1, 13); cc.stroke(); cc.fillStyle = col(0xc8c0b0); cc.fillRect(-6 - k * 9, -.6, 20, 1.2); cc.restore(); } });
  },
};
EDEF.ent = {
  name: 'Ent de Cinza', w: 44, h: 78, hp: 150, cinzas: 120, walk: 20, run: 38, keep: [40, 120], sight: 300, poise: 999, superArmor: true, touch: 12, mass: 4, big: true, sndHurt: ['wose_hit'], sndDie: 'wose_die', sndAggro: 'wose_attack', resist: { fire: -.5 }, blood: [0xd8d4e0, 0x8a8a9a], ash: 0xc8c4d0, glint: [14, -60],
  moves: [
    { id: 'roots', range: [60, 400], wind: .5, act: .1, rec: .9, cd: 2.2, sndAct: 'entangle', fire(e, p) { for (let i = 0; i < 3; i++) after(i * .35, () => { if (!e.alive) return; const x = p.x + rnd(-10, 10); const a = aoe({ x, y: e.y, w: 30, h: 70, delay: .75, dur: .3, dmg: e.dmg(18), color: 0xc8c4d0, kby: -420, onFire: () => { sfx('thorns', { x, y: e.y, vol: .6 }); burst(x, e.y - 6, 12, { color: [0xc8c4d0, 0x6a6a7a], glow: false, dir: -HPI, spread: .5, smin: 100, smax: 300, grav: 600 }); } }); a.draw = (cc, A) => { if (!A.fired) { cc.globalAlpha = .3 + .4 * (A.t / A.delay); cc.fillStyle = '#c8c4d0'; cc.fillRect(A.x - 14, A.y - 3, 28, 3); return; } const f = clamp(1 - (A.t - A.delay) / A.dur, 0, 1); cc.globalCompositeOperation = 'source-over'; cc.globalAlpha = f; cc.fillStyle = '#b8b4c4'; for (let k = 0; k < 3; k++) poly(cc, [A.x - 12 + k * 9, A.y, A.x - 8 + k * 9, A.y - 60 + k * 10, A.x - 4 + k * 9, A.y]); }; }); } },
    { id: 'swipe', range: [0, 90], wind: .7, act: .16, rec: .7, lunge: 60, cd: 1.6, sndAct: 'wose_attack', hit: { ox: 46, oy: -40, w: 80, h: 56, dmg: 22, kb: 360, len: 60, wid: 14, color: 0xd8d4e0 } },
  ],
  draw(c, e, t) {
    const sw = swingAng(e, .8, -1.8, 1.3), bob = Math.sin(t * 1.2 + e.ph) * 1.5; legs(c, e, 9, 18, 0x8a8698, 10);
    c.fillStyle = col(0xb8b4c4); c.beginPath(); c.moveTo(-18, -16); c.quadraticCurveTo(-22, -50, -14, -74 + bob); c.lineTo(10, -76 + bob); c.quadraticCurveTo(22, -50, 18, -16); c.fill();
    c.fillStyle = col(0x8a8698); for (let i = 0; i < 6; i++) c.fillRect(-14 + i * 5, -70 + bob, 1.6, 52); c.fillStyle = col(0xd8d4e0); c.fillRect(-12, -60 + bob, 6, 2);
    c.strokeStyle = col(0xb8b4c4); c.lineCap = 'round'; c.lineWidth = 5; c.beginPath(); c.moveTo(-8, -72 + bob); c.quadraticCurveTo(-20, -92, -30, -96); c.moveTo(4, -74 + bob); c.quadraticCurveTo(10, -96, 22, -104); c.stroke();
    c.save(); c.translate(12, -54 + bob); c.rotate(sw); c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(30, 4); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(28, 4); c.lineTo(40, -4); c.moveTo(28, 4); c.lineTo(40, 10); c.stroke(); c.restore();
    drawMask(c, 4, -64 + bob, 1.3, { c: 0x8a8698, eye: 0xb8ff90, shape: 'long' });
  },
};
EDEF.mariposa = {
  name: 'Mariposa de Cinza', w: 22, h: 18, hp: 20, cinzas: 16, fly: true, run: 90, touch: 8, sight: 260, sightY: 220, hover: [-90, 60], sndHurt: ['bat_hit'], sndDie: 'faerie', blood: [0xc8c4d0], ash: 0xd8d4e0, glint: [6, -10],
  moves: [{ id: 'dust', range: [0, 160], wind: .5, act: .1, rec: .6, cd: 2.2, sndAct: 'faerie', fire(e) { const x = e.x, y = e.y; aoe({ x, y: y + 40, r: 40, shape: 'circle', delay: .5, dur: .5, dmg: e.dmg(12), color: 0xd8d4e0, type: 'poison', draw(cc, A) { const k = A.fired ? clamp(1 - (A.t - A.delay) / A.dur, 0, 1) : A.t / A.delay; cc.globalAlpha = .3 * k; for (let i = 0; i < 4; i++) cc.drawImage(glowSpr(0xd8d4e0), A.x - 30 + i * 12 - 20, A.y - 30 + Math.sin(i + A.t * 3) * 6, 50, 50); } }); } }],
  draw(c, e, t) { const f = Math.sin(t * 14 + e.ph); c.fillStyle = col(0xc8c4d0, .85); c.beginPath(); c.ellipse(-4, -12, 10, 6 + 4 * f, -.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(4, -12, 10, 6 - 4 * f, .4, 0, TAU); c.fill(); c.fillStyle = col(0x2a2830); ell(c, 0, -9, 3, 7); drawMask(c, 3, -14, .5, { c: 0xe8e4f0, eye: 0xffd080 }); },
};
// --------------------------------------------------------- FORJA
EDEF.ferreiro = {
  name: 'Ferreiro Oco', w: 26, h: 44, hp: 92, cinzas: 70, walk: 32, run: 70, keep: [20, 60], sight: 240, poise: 50, touch: 8, mass: 2, sndHurt: ['dwarf_hit'], sndDie: 'm_die', voice: 'hrolf', glint: [14, -40], resist: { fire: .4 },
  moves: [
    { id: 'slam', range: [0, 90], wind: .8, act: .14, rec: .8, cd: 1.6, sndAct: 'hit_mace', hit: { ox: 34, oy: -14, w: 46, h: 30, dmg: 22, kb: 300, fx: false }, up: -2.4, fire(e) { shake(3); synth('boom', .5); burst(e.x + e.face * 38, e.y - 2, 14, { color: [0xffa040, 0x8a5a40], dir: -HPI, spread: 1, smin: 60, smax: 200, grav: 500 }); for (const s of [-1, 1]) { const p = new Proj({ x: e.x + e.face * 38, y: e.y - 10, vx: s * 260, vy: 0, r: 9, dmg: e.dmg(14), team: 'enemy', owner: e, color: 0xff8a30, pierce: true, life: 1.1, type: 'fire' }); p.draw = function (cc) { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.fillStyle = '#ff9a40'; cc.globalAlpha = .8; poly(cc, [this.x - 8, this.y + 9, this.x, this.y - 14 - Math.sin(G.t * 30) * 4, this.x + 8, this.y + 9]); cc.drawImage(glowSpr(0xff8a30), this.x - 18, this.y - 20, 36, 36); cc.restore(); }; } } },
    { id: 'sweep', range: [0, 60], wind: .5, act: .14, rec: .6, lunge: 90, cd: 1.2, hit: { ox: 30, oy: -24, w: 50, h: 34, dmg: 17, color: 0xffd0a0 } },
  ],
  draw(c, e, t) { const up = e.move && e.move.m.id === 'slam'; drawHum(c, e, { w: 26, h: 44, body: 0x3a2a20, body2: 0x6a4a30, belt: 0x2a1a10, mask: { c: 0xb8aa98, shape: 'skull', eye: 0xff7a2a }, ms: 1.1, weapon: 'hammer', wc: 0x6a6a72, hunch: .15, rest: .9, up: up ? -2.6 : -2, end: up ? 1.5 : 1.1, legW: 6 }); },
};
EDEF.salamandra = {
  name: 'Salamandra', w: 44, h: 20, hp: 68, cinzas: 56, walk: 40, run: 110, keep: [40, 110], sight: 260, poise: 30, touch: 10, light: [90, 0xff7a2a, .7], sndHurt: ['drake_hit'], sndDie: 'drake_die', sndAggro: 'hiss_big', resist: { fire: 1 }, blood: [0xff8a30, 0x3a1a10], ash: 0x5a2a1a, glint: [22, -14],
  moves: [
    { id: 'breath', range: [0, 170], wind: .55, act: .9, rec: .5, cd: 2, sndAct: 'flame_big', upd(e, p, dt, mv) { if (mv.phase !== 'act') return; for (let i = 0; i < 3; i++) part({ x: e.x + e.face * 22, y: e.y - 12, vx: e.face * rnd(220, 360), vy: rnd(-50, 30), life: rnd(.25, .45), s: rnd(3, 5), s1: 7, color: pick([0xff8a30, 0xffc070, 0xff5010]), glow: true, drag: 1 }); if ((mv.t2 * 10 | 0) !== mv.data.k) { mv.data.k = mv.t2 * 10 | 0; hitbox({ owner: e, team: 'enemy', ox: 70, oy: -12, w: 110, h: 30, life: .08, dmg: e.dmg(7), kb: 100, type: 'fire' }); } light(e.x + e.face * 80, e.y - 12, 140, 0xff8a30, 1); } },
    { id: 'tail', range: [0, 46], wind: .35, act: .12, rec: .5, cd: 1.2, track: true, fire(e) { e.face = -e.face; }, hit: { ox: 24, oy: -10, w: 40, h: 22, dmg: 15, fx: false } },
  ],
  draw(c, e, t) {
    const ph = e.walkPh * 1.5; c.fillStyle = col(0x2a1610); for (const [x, o] of [[-12, 0], [12, PI]]) for (const s of [-1, 1]) { c.save(); c.translate(x, -6); c.rotate(Math.sin(ph + o + (s > 0 ? PI : 0)) * .5 * (Math.abs(e.vx) > 5 ? 1 : 0)); c.fillRect(-2, 0, 4, 7); c.restore(); }
    c.fillStyle = col(0x3a2016); ell(c, 0, -9, 20, 7); c.beginPath(); c.moveTo(-18, -10); c.quadraticCurveTo(-34, -12 + Math.sin(t * 3) * 3, -42, -6); c.quadraticCurveTo(-30, -6, -18, -6); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = col(0xff7a2a, .8); for (let i = 0; i < 6; i++) ell(c, -14 + i * 6, -14, 2.4, 1.3); c.restore();
    c.fillStyle = col(0x3a2016); ell(c, 22, -11, 9, 5.5); c.fillStyle = col(0xffc070); ell(c, 25, -13, 1.6, 1.6); if (e.move && e.move.m.id === 'breath') { c.fillStyle = col(0xff8a30); ell(c, 30, -9, 3, 2); }
  },
};
EDEF.golem = {
  name: 'Golem de Escória', w: 42, h: 58, hp: 180, cinzas: 140, walk: 26, run: 46, keep: [30, 70], sight: 240, poise: 999, superArmor: true, touch: 12, mass: 5, big: true, light: [110, 0xff6a20, .7], sndHurt: ['troll_hit'], sndDie: 'troll_die', sndAggro: 'troll_hit', resist: { fire: .7 }, blood: [0xff8a30, 0x4a3a30], ash: 0x4a3a30, glint: [16, -48],
  moves: [
    { id: 'punch', range: [0, 80], wind: .7, act: .14, rec: .7, lunge: 120, cd: 1.5, sndAct: 'hit_club', hit: { ox: 38, oy: -30, w: 50, h: 40, dmg: 24, kb: 380, fx: false } },
    { id: 'stomp', range: [0, 160], wind: .9, act: .12, rec: .9, cd: 2.4, sndAct: 'quake', fire(e) { shake(5); synth('boom', .6); for (const s of [-1, 1]) bWave({ x: e.x, w: e.w, arena: { floor: e.y }, dmg: v => e.dmg(v) }, s, { dmg: 16, speed: 280, color: 0xff7a2a, life: 1.3, h: 20 }); } },
  ],
  onDie(e) { const x = e.x, y = e.y - 26; after(.4, () => { ringFx(x, y, 10, 80, 0xff7a2a, .45, 6); burst(x, y, 40, { color: [0xff7a2a, 0xffc070, 0x4a3a30], smin: 80, smax: 320 }); aoe({ x, y, r: 74, shape: 'circle', delay: 0, dur: .12, dmg: e.dmg(24), type: 'fire', color: 0xff7a2a }); sfx('explosion', { x, y, vol: .8 }); shake(7); }); },
  draw(c, e, t) {
    const sw = swingAng(e, .9, -1.9, .4); legs(c, e, 12, 16, 0x2a2018, 10);
    c.fillStyle = col(0x3a2e26); c.beginPath(); c.moveTo(-20, -14); c.lineTo(-24, -44); c.lineTo(-10, -58); c.lineTo(14, -58); c.lineTo(24, -40); c.lineTo(18, -14); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = col(0xff6a20, .85); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-12, -50); c.lineTo(-4, -36); c.lineTo(-10, -22); c.moveTo(6, -54); c.lineTo(10, -40); c.lineTo(4, -26); c.stroke(); c.drawImage(glowSpr(0xff6a20), -14, -50, 28, 28); c.restore();
    c.fillStyle = col(0x4a3a30); c.save(); c.translate(16, -46); c.rotate(sw); ell(c, 14, 0, 16, 9); ell(c, 28, 0, 9, 10); c.restore();
    c.fillStyle = col(0x4a3a30); ell(c, 2, -60, 11, 8); c.fillStyle = col(0xffa040); ell(c, 6, -61, 2.4, 1.6); ell(c, 11, -61, 2, 1.5);
  },
};
EDEF.chama = {
  name: 'Chama Errante', w: 16, h: 16, hp: 18, cinzas: 18, fly: true, run: 170, touch: 0, sight: 260, sightY: 240, hover: [-30, 10], light: [90, 0xff8a30, .9], sndDie: 'fireball', resist: { fire: 1 }, blood: [0xff8a30, 0xffc070], ash: 0xff8a30, glint: [0, -8],
  moves: [{ id: 'boom', range: [0, 40], dy: 50, wind: .55, act: .05, rec: .05, cd: 1, snd: 'hiss', fire(e) { e.hp = 0; e.die({ dir: 0 }); } }],
  onDie(e) { const x = e.x, y = e.y - 8; ringFx(x, y, 6, 54, 0xff8a30, .35, 5); burst(x, y, 24, { color: [0xff8a30, 0xffc070], smin: 60, smax: 240 }); aoe({ x, y, r: 50, shape: 'circle', delay: 0, dur: .1, dmg: e.dmg(18), type: 'fire', color: 0xff8a30 }); sfx('explosion', { x, y, vol: .6 }); },
  draw(c, e, t) { const sw = e.move ? 1 + Math.sin(t * 40) * .2 + e.move.t : 1; c.save(); c.globalCompositeOperation = 'lighter'; c.scale(sw, sw); c.drawImage(glowSpr(0xff8a30), -16, -24, 32, 32); for (let i = 0; i < 3; i++) { c.fillStyle = ['#ff6a20', '#ffa040', '#fff0c0'][i]; c.globalAlpha = .8; c.beginPath(); c.moveTo(-6 + i * 2, -2); c.quadraticCurveTo(-6, -12, Math.sin(t * 9 + i) * 2, -18 + i * 4); c.quadraticCurveTo(6, -12, 6 - i * 2, -2); c.fill(); } c.restore(); c.fillStyle = col(0x2a0a04); ell(c, -1.5, -7, 1, 1.6); ell(c, 2, -7, 1, 1.6); },
};
// --------------------------------------------------------- CATEDRAL
EDEF.cavaleiro = {
  name: 'Cavaleiro da Catedral', w: 26, h: 50, hp: 140, cinzas: 110, walk: 40, run: 100, keep: [20, 70], sight: 260, poise: 60, touch: 8, mass: 2, sndHurt: ['m_hit1', 'm_hit2'], sndDie: 'm_die', voice: 'aldric', blood: [0xe8e0c8, 0xfff6e0], glint: [14, -44],
  moves: [
    { id: 'combo', range: [0, 70], wind: .5, act: .14, rec: .25, lunge: 160, cd: .4, hit: { ox: 32, oy: -26, w: 56, h: 38, dmg: 18, len: 46, wid: 12 }, upd(e, p, dt, mv) { if (mv.phase === 'rec' && !mv.data.two && mv.t3 > .15) { mv.data.two = 1; mv.phase = 'wind'; mv.t = (mv.m.wind) - .25; e.face = Math.sign(p.x - e.x) || e.face; } } },
    { id: 'leap', range: [90, 240], wind: .5, act: .55, rec: .7, cd: 2.2, sndAct: 'warcry', fire(e, p) { e.vy = -520; e.vx = (p.x - e.x) / .62; }, upd(e, p, dt, mv) { if (mv.phase === 'act' && e.onGround && mv.t2 > .15) { mv.phase = 'rec'; mv.t3 = 0; e.vx = 0; shake(4); synth('boom', .5); aoe({ x: e.x + e.face * 18, y: e.y, w: 110, h: 40, delay: 0, dur: .12, dmg: e.dmg(22), color: 0xffe0b0 }); burst(e.x, e.y - 2, 16, { color: [0xcac2b6, 0x8a8478], glow: false, dir: -HPI, spread: 1.3, smin: 60, smax: 220, grav: 600 }); } } },
    { id: 'thrust', range: [40, 120], wind: .55, act: .2, rec: .6, lunge: 380, pose: 'thrust', cd: 1.4, hit: { ox: 30, oy: -28, w: 50, h: 16, dmg: 18, life: .2, fx: false } },
  ],
  draw(c, e, t) { drawHum(c, e, { w: 26, h: 50, body: 0x8a8478, body2: 0xb8b0a0, belt: 0xc8a040, pauldron: 0xd8d0c0, mask: { c: 0xcac2b6, shape: 'helm' }, ms: 1.15, plume: 0xb8302a, weapon: 'greatsword', wc: 0xe0dcd0, rest: .6, legW: 6, cape: 0x6a1e1a }); },
};
EDEF.clerigo = {
  name: 'Clérigo do Lume', w: 20, h: 44, hp: 66, cinzas: 70, walk: 30, run: 60, keep: [130, 240], sight: 320, sightY: 200, poise: 14, touch: 6, sndHurt: ['old_hit1'], sndDie: 'old_die', voice: 'ozias', light: [80, 0xffe0a0, .7], blood: [0xfff0c0], glint: [4, -44],
  moves: [
    { id: 'pillar', range: [0, 420], wind: .6, act: .1, rec: .7, cd: 2, sndAct: 'holy1', fire(e, p) { aoe({ x: p.x, y: e.y + (p.y - e.y), w: 36, h: 220, delay: .85, dur: .22, dmg: e.dmg(18), color: 0xfff0c0, lightC: 0xfff0c0, type: 'holy', onFire: () => sfx('holy3', { x: p.x, y: p.y, vol: .5 }) }); } },
    { id: 'heal', range: [0, 500], wind: .7, act: .1, rec: .5, cd: 2.5, cdOwn: 6, w: 3, cond: (e) => ENEMIES.some(o => o !== e && o.alive && !o.isBoss && o.hp < o.maxHp * .7 && Math.abs(o.x - e.x) < 320), sndAct: 'heal', fire(e) { for (const o of ENEMIES) if (o !== e && o.alive && !o.isBoss && Math.abs(o.x - e.x) < 320) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * .35); burst(o.x, o.cy, 20, { color: [0xfff0c0, 0xffd080], dir: -HPI, spread: 1, smin: 40, smax: 120 }); flashFx(o.x, o.cy, 40, 0xfff0c0, .4); } } },
    { id: 'orbs', range: [0, 300], wind: .55, act: .1, rec: .6, cd: 1.8, sndAct: 'holy2', fire(e, p) { for (let i = -1; i <= 1; i++) shootAt(e, 200, { dmg: 12, spread: i * .25, oy: -36, p: { r: 5, color: 0xfff0c0, kind: 'orb', life: 3, type: 'holy' } }); } },
  ],
  draw(c, e, t) { drawHum(c, e, { w: 22, h: 44, robe: true, body: 0xd8d0c0, body2: 0xb8a070, mask: { c: 0xf0e8d8, shape: 'long', eye: 0xffd080 }, neck: 2, weapon: 'scepter', rest: -.6, up: -1.8, end: -.4, extraHead: (cc, hx, hy) => { cc.fillStyle = col(0xe8e0d0); poly(cc, [hx - 6, hy - 6, hx, hy - 22, hx + 6, hy - 6]); cc.fillStyle = col(0xc8a040); cc.fillRect(hx - 6, hy - 8, 12, 2); } }); },
};
EDEF.gargula = {
  name: 'Gárgula', w: 28, h: 38, hp: 100, cinzas: 96, fly: false, walk: 0, run: 0, sight: 300, sightY: 260, poise: 40, touch: 8, statue: true, trigger: 110, emergeT: .9, sndHurt: ['gryphon_hit'], sndDie: 'gryphon_die', sndAggro: 'shriek2', resist: { phys: .1 }, blood: [0x9a948a, 0xd8d0c0], ash: 0x8a8478, glint: [10, -30],
  onWake(e) { e.grav = 0; e.D2 = true; sfx('petrified', at(e, .6)); burst(e.x, e.cy, 20, { color: [0x8a8478, 0xb8b0a0], glow: false, smin: 40, smax: 160, grav: 400 }); },
  ai(e, dt, p) {
    e.ph += dt; if (!e.aggro) return; e.face = Math.sign(p.x - e.x) || e.face;
    if (e.cd <= 0) { const m = e.pickMove(Math.abs(p.x - e.x), Math.abs(p.y - e.y)); if (m) { e.startMove(m); return; } }
    const tx = p.x - e.face * 90, ty = p.y - 110 + Math.sin(e.ph * 2) * 12, dx = tx - e.x, dy = ty - e.y; e.vx = approach(e.vx, clamp(dx * 2, -160, 160), 500 * dt); e.vy = approach(e.vy, clamp(dy * 2, -160, 160), 500 * dt);
  },
  moves: [
    { id: 'dive', range: [0, 340], wind: .55, act: .55, rec: .5, cd: 1.6, sndAct: 'shriek', fire(e, p, mv) { const a = Math.atan2(p.cy - e.cy, p.x - e.x); mv.data.vx = Math.cos(a) * 460; mv.data.vy = Math.sin(a) * 460; }, upd(e, p, dt, mv) { if (mv.phase === 'act') { e.vx = mv.data.vx; e.vy = mv.data.vy; e.face = Math.sign(e.vx) || e.face; hitbox({ owner: e, team: 'enemy', ox: 14, oy: -18, w: 34, h: 30, life: dt * 1.5, dmg: e.dmg(18), kb: 260 }); } else if (mv.phase === 'rec') { e.vx *= .9; e.vy = approach(e.vy, -160, 900 * dt); } } },
  ],
  draw(c, e, t) {
    const awake = e.state !== 'statue' && e.state !== 'emerge', f = awake ? Math.sin(t * 12 + e.ph) : 0, st = 0x8a8478;
    c.fillStyle = col(shade(st, -.15)); for (const s of [-1, 1]) { c.save(); c.translate(-2, -26); c.scale(s === 1 ? 1 : -.7, 1); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, -18 - f * 8, -30, -10 - f * 10); c.lineTo(-22, -4); c.lineTo(-26, 4 - f * 4); c.lineTo(-14, 2); c.fill(); c.restore(); }
    if (!awake) { c.fillStyle = col(shade(st, -.3)); c.fillRect(-16, -6, 32, 6); }
    drawHum(c, e, { w: 22, h: 38, body: st, body2: shade(st, .15), hunch: .25, mask: { c: shade(st, .25), horns: true, eye: awake ? 0xff5a3a : undefined }, weapon: 'spear', wc: 0xb8b0a0, rest: .3 });
  },
};
// --------------------------------------------------------- CORAÇÃO
EDEF.eco = {
  name: 'Eco do Desperto', w: 18, h: 40, hp: 120, cinzas: 120, walk: 60, run: 200, keep: [30, 80], sight: 320, poise: 30, touch: 6, sndHurt: ['p_hurt1', 'p_hurt2'], sndDie: 'dark_big', light: [80, 0x8a6aff, .7], blood: [0x8a6aff, 0x1a1030], ash: 0x5a3a8a, glint: [8, -36],
  moves: [
    { id: 'dashcut', range: [60, 220], wind: .3, act: .2, rec: .4, lunge: 640, cd: 1.1, sndAct: 'whoosh2', hit: { ox: 20, oy: -22, w: 40, h: 30, dmg: 17, life: .2, color: 0xb8a0ff } },
    { id: 'combo', range: [0, 60], wind: .25, act: .1, rec: .2, lunge: 120, cd: .5, hit: { ox: 26, oy: -22, w: 46, h: 32, dmg: 13, color: 0xb8a0ff }, upd(e, p, dt, mv) { if (mv.phase === 'rec' && (mv.data.n || 0) < 2 && mv.t3 > .08) { mv.data.n = (mv.data.n || 0) + 1; mv.phase = 'wind'; mv.t = mv.m.wind - .12; e.face = Math.sign(p.x - e.x) || e.face; } } },
    { id: 'evade', range: [0, 90], wind: .05, act: .2, rec: .1, cd: 1, cdOwn: 2.5, cond: (e, p) => !!p.atk, lunge: -560, track: true },
  ],
  draw(c, e, t) { drawEcho(c, e, t); },
};
function drawEcho(c, e, t) { // silhueta sombria do herói, com olhos brancos
  const bob = Math.abs(e.vx) > 10 ? Math.abs(Math.sin(e.walkPh)) * 1.2 : 0; legs(c, e, 4, 9, 0x0a0614, 3);
  c.fillStyle = col(0x14102a); c.beginPath(); c.moveTo(-6, -31 - bob); c.lineTo(7, -31 - bob); c.quadraticCurveTo(11, -18, 11, -7); c.lineTo(-11, -7); c.quadraticCurveTo(-10, -18, -6, -31 - bob); c.fill();
  c.fillStyle = col(0x1a1430); ell(c, 1, -36 - bob, 8, 7.6); c.fillStyle = col(0xffffff); ell(c, 3, -36 - bob, 1.6, 2.8); ell(c, 7, -36 - bob, 1.4, 2.6);
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .4; c.drawImage(glowSpr(0x8a6aff), -20, -56, 40, 50); c.restore();
  weapon(c, 'sword', 6, -22, swingAng(e, .9, -1.7, 1.1), 1, 0x9a8aff);
}
EDEF.vigia = {
  name: 'Vigia do Lume', w: 28, h: 52, hp: 160, cinzas: 150, walk: 40, run: 90, keep: [60, 140], sight: 300, poise: 70, touch: 8, mass: 2.5, light: [100, 0xff9a40, .7], sndHurt: ['m_hit2'], sndDie: 'm_die', voice: 'brigid', resist: { fire: .6 }, blood: [0xffc070, 0xfff0c0], glint: [16, -46],
  moves: [
    { id: 'charge', range: [80, 320], wind: .6, act: .55, rec: .7, lunge: 460, pose: 'thrust', cd: 2, sndAct: 'warcry', upd(e, p, dt, mv) { if (mv.phase === 'act') { hitbox({ owner: e, team: 'enemy', ox: 34, oy: -30, w: 46, h: 22, life: dt * 1.5, dmg: e.dmg(20), kb: 340, type: 'fire' }); if ((mv.t2 * 12 | 0) !== mv.data.k) { mv.data.k = mv.t2 * 12 | 0; const x = e.x; aoe({ x, y: e.y, w: 28, h: 26, delay: .05, dur: 1.6, dmg: e.dmg(6), color: 0xff8a30, type: 'fire', draw(cc, A) { const f = clamp(1 - (A.t - A.delay) / A.dur, 0, 1); cc.globalAlpha = f * .8; cc.fillStyle = '#ff8a30'; poly(cc, [A.x - 12, A.y, A.x - 2, A.y - 18 - Math.sin(G.t * 20 + A.x) * 5, A.x + 10, A.y]); cc.drawImage(glowSpr(0xff8a30), A.x - 16, A.y - 26, 32, 32); } }); } } } },
    { id: 'sweep', range: [0, 80], wind: .55, act: .16, rec: .6, lunge: 120, cd: 1.3, hit: { ox: 40, oy: -30, w: 70, h: 40, dmg: 20, type: 'fire', color: 0xffc070, len: 56 } },
  ],
  draw(c, e, t) { drawHum(c, e, { w: 28, h: 52, body: 0x6a5a40, body2: 0xc8a050, pauldron: 0xd8b060, mask: { c: 0xf0e0b0, shape: 'helm', eye: 0xffa040 }, ms: 1.15, weapon: 'lance', wc: 0xffc070, rest: .2, legW: 6, cape: 0x8a3a1a, extra: (cc, H, ang) => { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.translate(10 + Math.cos(ang) * 50, -H * .62 + Math.sin(ang) * 50); cc.drawImage(glowSpr(0xff8a30), -14, -14, 28, 28); cc.restore(); } }); },
};
