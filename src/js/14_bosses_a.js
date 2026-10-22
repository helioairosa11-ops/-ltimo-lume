// ===================== CHEFES I: Odile, Tobias, Brigid, Vesper, Orin =====================
// ângulo da arma conforme a pose do chefe
function bAng(b, rest = .8, up = -2.1, end = 1.1) {
  const k = easeOut(b.pk);
  switch (b.pose) { case 'wind': return lerp(rest, up, k); case 'swing': return lerp(up, end, k); case 'rec': return lerp(end, rest, b.pk); case 'cast': return lerp(rest, -1.3, k); case 'thrust': return 0; case 'thrustw': return lerp(rest, -.3, k); case 'broken': return 1.4; case 'dead': return 1.5; default: return rest + Math.sin(G.t * 1.6 + b.ph) * .06; }
}
// sequência de golpes: steps = [{ w: tempo de preparação, hit: {...}, lunge, lungeT, tele, pose, fn }]
function seq(id, steps, o = {}) {
  return Object.assign({ id, ev: (b, p) => {
    const ev = []; let t = 0;
    for (const s of steps) {
      const w = s.w ?? .45; const t0 = t;
      ev.push([t0, (b, p, mv) => { if (s.track !== false) b.face = Math.sign(p.x - b.x) || b.face; b.setPose(s.pose === 'thrust' ? 'thrustw' : 'wind', w); if (s.tele !== false) bTele(b, s.teleX ?? 20, s.teleY ?? -.85, s.teleC); s.pre && s.pre(b, p, mv); }]);
      t += w;
      ev.push([t, (b, p, mv) => { b.setPose(s.pose === 'thrust' ? 'thrust' : 'swing', .14); if (s.lunge) { mv.lunge = s.lunge; mv.lungeT = s.lungeT ?? .14; } if (s.hit) bHit(b, s.hit); s.fn && s.fn(b, p, mv); }]);
      t += s.a ?? .16;
      ev.push([t, b => b.setPose('rec', s.r ?? .3)]);
      t += s.r ?? .3;
    }
    return ev;
  }, dur: steps.reduce((a, s) => a + (s.w ?? .45) + (s.a ?? .16) + (s.r ?? .3), 0) }, o);
}
// ==================================================== 1. IRMÃ ODILE (Cripta)
BOSSDEF.odile = {
  name: 'Irmã Odile, a Carpideira', title: 'Ordem do Véu', speaker: 'Odile', music: 'b_odile', voice: 'odile', w: 30, h: 70, mass: 4, posture: 220, rim: 0xb8c8ff, light: [180, 0xb8c8ff, .7], keep: [70, 150], walk: 55, run: 110, fly: false, dieSnd: 'wail_long',
  line: 'Dorme, criança. Dorme. Eu canto por ti, como cantei por ela.', deathLine: 'O cântico... acabou. Finalmente... silêncio.',
  reward: { cinzas: 900, items: ['brasa_lamento', 'lagrima'] }, blood: [0xd8e0ff, 0xffffff], ash: 0xb8c0d0,
  init(b) { b.cA = 0; b.cV = 0; b.cL = 34; b.cLT = 34; b.spin = 0; },
  tick(b, dt) { // pêndulo do incensário
    const tgtA = b.spin ? b.cA + dt * 14 : (b.pose === 'wind' ? -2.2 : b.pose === 'swing' ? 1.4 : .9 + Math.sin(G.t * 1.7) * .25);
    if (b.spin) b.cA = tgtA; else { b.cV += (angDiff(b.cA, tgtA) * 40 - b.cV * 6) * dt; b.cA += b.cV * dt; }
    b.cL = damp(b.cL, b.cLT, 8, dt);
    const hx = b.x + b.face * 14, hy = b.y - 44, cx = hx + Math.cos(b.cA) * b.cL * b.face, cy = hy + Math.sin(b.cA) * b.cL; b.cpos = [cx, cy];
    light(cx, cy, 90, 0xb8c8ff, .8, .1); if (Math.random() < dt * 14) part({ x: cx, y: cy, vx: rnd(-10, 10), vy: rnd(-30, -10), life: rnd(1, 2), s: rnd(2, 4), s1: 7, color: 0xc8d0e8, a: .35, glow: false, drag: .6 });
  },
  phases: [
    { hp: 640, until: .5, keep: [60, 150], moves: [
      seq('swing', [{ w: .55, hit: { ox: 55, oy: -36, w: 96, h: 64, dmg: 18, len: 60, wid: 14, color: 0xc8d8ff, ang: .2 }, lunge: 80, pre: b => b.cLT = 64, fn: b => after(.3, () => b.cLT = 34) }], { w: 3, rng: [0, 140] }),
      { id: 'slam', w: 2, rng: [40, 260], dur: 1.6, ev: [[0, b => { b.setPose('wind', .6); b.cLT = 70; bTele(b, 20, -1.1, 0xc8d8ff); }], [.15, (b, p, mv) => { mv.data.x = clamp(p.x, b.arena.x0 + 30, b.arena.x1 - 30); aoe({ x: mv.data.x, y: b.arena.floor - 2, r: 46, shape: 'circle', delay: .5, dur: .12, dmg: b.dmg(22), color: 0xc8d8ff, owner: b, onFire: a => { shake(5); synth('boom', .6); sfx('hit_flail', { x: a.x, y: a.y, vol: .8 }); for (const s of [-1, 1]) bWave(b, s, { off: 0, dmg: 14, speed: 240, color: 0xb8c8ff, life: 1.2, h: 18 }).x = a.x; burst(a.x, a.y, 20, { color: [0xc8d8ff, 0xffffff], dir: -HPI, spread: 1.2, smin: 60, smax: 220 }); } }); }], [.65, b => { b.setPose('swing', .2); }], [1.1, b => { b.setPose('rec', .4); b.cLT = 34; }]] },
      { id: 'wail', w: 1.5, rng: [0, 400], dur: 1.5, cool: 3, ev: [[0, b => { b.setPose('cast', .5); voxCry('odile', 'big', { vol: .8 }); sfx('wail_long', at(b, .5)); }], [.6, b => { bRing(b, 10, 120, { color: 0xc8d8ff, dmg: 13, y: b.y - 40, life: 6 }); ringFx(b.x, b.y - 40, 10, 80, 0xc8d8ff, .5, 4); }]] },
      { id: 'spirits', w: 1, rng: [0, 500], dur: 1.2, cool: 14, cond: b => b.adds.filter(a => a.alive).length < 2, ev: [[0, b => { b.setPose('cast', .5); sfx('wail_sml', at(b, .6)); }], [.6, b => { for (const s of [-1, 1]) bSummon(b, 'vela', b.x + s * 70, { y: b.y - 70 }); }]] },
      { id: 'glide', w: 1, rng: [0, 90], dur: .9, cool: 4, ev: [[0, b => { b.setPose('cast', .3); }], [.3, (b, p) => { const tx = p.x < (b.arena.x0 + b.arena.x1) / 2 ? b.arena.x1 - 80 : b.arena.x0 + 80; b.teleport(tx, undefined, 0xc8d8ff); }]] },
    ] },
    { hp: 640, title: 'O Lamento de Odile', line: 'Não chores. Já não dói. Já não dói!', speed: 1.12, dmgMul: 1.15, aggr: .8, trans: { dur: 2.2, start(b) { b.setPose('cast', .6); voxCry('odile', 'big', { vol: 1 }); sfx('wail_long', at(b, .8)); after(.9, () => { bRing(b, 14, 140, { color: 0xc8d8ff, dmg: 12, y: b.y - 40, life: 6 }); ringFx(b.x, b.y - 40, 10, 120, 0xc8d8ff, .6, 5); }); } },
      moves: [
        seq('swing2', [{ w: .5, hit: { ox: 55, oy: -36, w: 96, h: 64, dmg: 18, len: 60, wid: 14, color: 0xc8d8ff }, lunge: 80, pre: b => b.cLT = 64 }, { w: .35, hit: { ox: 55, oy: -30, w: 96, h: 64, dmg: 18, len: 60, wid: 14, color: 0xc8d8ff, ang: .5 }, lunge: 120, fn: b => after(.3, () => b.cLT = 34) }], { w: 3, rng: [0, 140] }),
        { id: 'spin', w: 2, rng: [0, 220], dur: 2.2, cool: 3, ev: [[0, b => { b.setPose('cast', .3); b.cLT = 74; bTele(b, 0, -.9, 0xc8d8ff); }], [.45, b => { b.spin = 1; sfx('whoosh3', at(b, .7)); }], [2.0, b => { b.spin = 0; b.cLT = 34; }]], upd(b, p, dt, mv) { if (b.spin) { b.vx = approach(b.vx, Math.sign(p.x - b.x) * 90, 400 * dt); if ((mv.t * 8 | 0) !== mv.data.k) { mv.data.k = mv.t * 8 | 0; hitbox({ owner: b, team: 'enemy', ox: 0, oy: -40, w: 160, h: 90, life: .08, dmg: b.dmg(12), kb: 240 }); } } return true; } },
        { id: 'rain', w: 1.6, rng: [0, 500], dur: 2, cool: 5, ev: [[0, b => { b.setPose('cast', .5); voxSay('odile', 4, { vol: .7 }); }], [.5, b => bRain(b, 7, { color: 0xc8d8ff, dmg: 16, w: 34, stagger: .14 })]] },
        { id: 'wail2', w: 1.4, rng: [0, 400], dur: 1.8, cool: 3, ev: [[0, b => { b.setPose('cast', .5); voxCry('odile', 'big', { vol: .8 }); sfx('wail_long', at(b, .5)); }], [.6, b => bRing(b, 10, 120, { color: 0xc8d8ff, dmg: 13, y: b.y - 40, life: 6 })], [1.1, b => bRing(b, 10, 150, { color: 0xc8d8ff, dmg: 13, y: b.y - 40, life: 6, off: .3 })]] },
        { id: 'glide', w: 1, rng: [0, 90], dur: .9, cool: 3, ev: [[0, b => b.setPose('cast', .3)], [.3, (b, p) => { const tx = p.x < (b.arena.x0 + b.arena.x1) / 2 ? b.arena.x1 - 80 : b.arena.x0 + 80; b.teleport(tx, undefined, 0xc8d8ff); }]] },
      ] },
  ],
  draw(c, b, t) {
    const hov = -6 + Math.sin(t * 1.6) * 3, H = b.h, ang = b.state === 'dead' ? 1.2 : 0;
    c.translate(0, hov); if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 12); c.rotate(.15); }
    // hábito
    c.fillStyle = col(0xcfc8bc); c.beginPath(); c.moveTo(-13, -H + 22); c.lineTo(12, -H + 22); c.quadraticCurveTo(22, -30, 24, 0); for (let i = 0; i <= 6; i++) c.lineTo(24 - i * 8, Math.sin(t * 2.4 + i) * 2.5 + (i % 2 ? -4 : 0)); c.quadraticCurveTo(-22, -30, -13, -H + 22); c.fill();
    c.fillStyle = col(0x9a948a); c.beginPath(); c.moveTo(4, -H + 24); c.quadraticCurveTo(16, -30, 18, 0); c.lineTo(8, 0); c.quadraticCurveTo(10, -30, 0, -H + 24); c.fill();
    c.fillStyle = col(0x2a2628); c.fillRect(-12, -H + 36, 26, 3); // cinto
    // véu negro e máscara
    c.fillStyle = col(0x15131a); c.beginPath(); c.moveTo(-14, -H + 26); c.quadraticCurveTo(-18, -H + 4, -2, -H - 4); c.quadraticCurveTo(14, -H, 14, -H + 20); c.lineTo(10, -H + 34); c.lineTo(-20, -H + 44 + Math.sin(t * 2) * 2); c.fill();
    drawMask(c, 4, -H + 14, 1.25, { c: 0xe8e2d8, shape: 'long', eye: 0x9ab8ff });
    c.strokeStyle = col(0x3a3a4a); c.lineWidth = 1; c.beginPath(); c.moveTo(5, -H + 16); c.lineTo(5, -H + 27); c.moveTo(10, -H + 16); c.lineTo(10, -H + 26); c.stroke();
    // braço e corrente do incensário (coordenadas do mundo → locais)
    c.fillStyle = col(0xcfc8bc); ell(c, 12, -44 - hov + hov, 4, 6);
    if (b.cpos && b.alive) { const lx = (b.cpos[0] - b.x) * b.face, ly = b.cpos[1] - b.y - hov; c.strokeStyle = col(0x5a5040); c.lineWidth = 1.5; c.beginPath(); c.moveTo(14, -44); c.lineTo(lx, ly); c.stroke(); c.fillStyle = col(0x8a6a3a); ell(c, lx, ly, 7, 8); c.fillStyle = col(0x2a2018); for (let i = 0; i < 3; i++) ell(c, lx - 3 + i * 3, ly, .9, 1.4); c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(0xb8c8ff), lx - 18, ly - 18, 36, 36); c.restore(); }
    if (b.pose === 'cast') { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .5 * b.pk; c.drawImage(glowSpr(0xc8d8ff), -40, -H - 20, 80, 80); c.restore(); }
  },
};
// ==================================================== 2. TOBIAS, O CARRASCO (Muralhas, subchefe)
BOSSDEF.tobias = {
  name: 'Tobias, o Carrasco', title: 'Executor das Muralhas', speaker: 'Tobias', music: 'b_tobias', voice: 'tobias', sub: true, w: 40, h: 80, mass: 8, posture: 260, rim: 0xd0a080, keep: [60, 110], walk: 60, run: 140, heavyStep: true, step: 'step1', stepRate: .6, stepVol: .5, hitSnd: 'hit_club', dieSnd: 'ogre_die',
  line: 'Ajoelha. A sentença foi lida. Não fui eu que a escrevi.', deathLine: 'Maren... diz à Maren... que eu ainda me lembro... da cara dela.',
  reward: { cinzas: 1400, items: ['w_machado', 'fragmento'] }, blood: [0x8a2a20, 0xd8c0a0],
  phases: [
    { hp: 780, until: .4, keep: [50, 110], moves: [
      seq('chop', [{ w: .85, teleY: -1.05, hit: { ox: 52, oy: -30, w: 84, h: 70, dmg: 30, len: 70, wid: 16, ang: .9, color: 0xffd8b0, snd: 'hit_axe' }, lunge: 60, fn: b => { shake(6); synth('boom', .7); burst(b.x + b.face * 60, b.y - 2, 20, { color: [0x8a8478, 0xb8b0a0], glow: false, dir: -HPI, spread: 1.2, smin: 80, smax: 260, grav: 700 }); } }], { w: 3, rng: [0, 120] }),
      seq('cleave', [{ w: .6, hit: { ox: 46, oy: -36, w: 110, h: 44, dmg: 24, len: 74, wid: 14, ang: -.1, color: 0xffd8b0 }, lunge: 140 }], { w: 2.5, rng: [0, 130] }),
      { id: 'charge', w: 1.6, rng: [140, 600], dur: 1.6, cool: 3, ev: [[0, b => { b.setPose('thrustw', .5); bTele(b, 24, -.75); voxCry('tobias', 'big', { vol: .8 }); }], [.5, (b, p, mv) => { b.setPose('thrust', .1); mv.lunge = 440; mv.lungeT = .75; sfx('warcry', at(b, .6)); }]], upd(b, p, dt, mv) { if (mv.lungeT > 0) { hitbox({ owner: b, team: 'enemy', ox: 26, oy: -40, w: 40, h: 70, life: dt * 1.5, dmg: b.dmg(22), kb: 380 }); if (b.x <= b.arena.x0 + b.w / 2 + 6 || b.x >= b.arena.x1 - b.w / 2 - 6) { mv.lungeT = 0; shake(5); synth('boom', .5); } } return true; } },
      { id: 'leap', w: 1.6, rng: [100, 600], dur: 1.6, cool: 4, ev: [[0, (b, p) => { b.setPose('wind', .4); bTele(b, 0, -1.1); }], [.35, (b, p) => { b.leapTo(p.x, 190, .7, b => { shake(8); synth('boom', .9); sfx('quake', at(b, .9)); for (const s of [-1, 1]) bWave(b, s, { dmg: 18, speed: 300, color: 0xd8c0a0, h: 24 }); aoe({ x: b.x, y: b.y, w: 90, h: 50, delay: 0, dur: .1, dmg: b.dmg(24), owner: b }); b.setPose('swing', .2); }); }]] },
      seq('grab', [{ w: .5, teleC: 0xff4a3a, hit: { ox: 34, oy: -40, w: 44, h: 50, dmg: 34, kb: 420, fx: false }, lunge: 360, lungeT: .2, pose: 'thrust' }], { w: 1.2, rng: [30, 160], cool: 4 }),
    ] },
    { hp: 780, title: 'Tobias, o Carrasco', subtitle: 'A sentença não acaba', speed: 1.22, dmgMul: 1.15, aggr: .7, trans: { dur: 1.6, start(b) { b.setPose('cast', .5); voxCry('tobias', 'big', { vol: 1 }); shake(6); sfx('warcry', at(b, .9, { rate: .7 })); } },
      moves: [
        seq('chop2', [{ w: .7, hit: { ox: 52, oy: -30, w: 84, h: 70, dmg: 28, len: 70, wid: 16, ang: .9, color: 0xffd8b0, snd: 'hit_axe' }, lunge: 80, fn: b => { shake(6); synth('boom', .6); for (const s of [-1, 1]) bWave(b, s, { dmg: 14, speed: 260, color: 0xd8c0a0, off: 60, h: 18, life: 1.4 }); } }, { w: .45, hit: { ox: 46, oy: -36, w: 110, h: 44, dmg: 22, len: 74, wid: 14, color: 0xffd8b0 }, lunge: 160 }], { w: 3, rng: [0, 130] }),
        { id: 'charge', w: 1.4, rng: [140, 600], dur: 1.6, cool: 3, ev: [[0, b => { b.setPose('thrustw', .4); bTele(b, 24, -.75); }], [.4, (b, p, mv) => { b.setPose('thrust', .1); mv.lunge = 500; mv.lungeT = .7; }]], upd(b, p, dt, mv) { if (mv.lungeT > 0) hitbox({ owner: b, team: 'enemy', ox: 26, oy: -40, w: 40, h: 70, life: dt * 1.5, dmg: b.dmg(22), kb: 380 }); return true; } },
        { id: 'leap', w: 1.6, rng: [80, 600], dur: 1.5, cool: 3, ev: [[0, b => { b.setPose('wind', .35); bTele(b, 0, -1.1); }], [.3, (b, p) => b.leapTo(p.x, 200, .65, b => { shake(8); synth('boom', .9); for (const s of [-1, 1]) bWave(b, s, { dmg: 18, speed: 340, color: 0xd8c0a0, h: 24 }); aoe({ x: b.x, y: b.y, w: 90, h: 50, delay: 0, dur: .1, dmg: b.dmg(24), owner: b }); })]] },
        seq('grab', [{ w: .42, teleC: 0xff4a3a, hit: { ox: 34, oy: -40, w: 44, h: 50, dmg: 34, kb: 420, fx: false }, lunge: 400, lungeT: .2, pose: 'thrust' }], { w: 1, rng: [30, 170], cool: 3 }),
      ] },
  ],
  draw(c, b, t) {
    const ang = bAng(b, .9, -2.4, 1.2), bob = Math.abs(b.vx) > 10 ? Math.abs(Math.sin(b.walkPh)) * 2 : Math.sin(t * 1.5) * .8;
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 16); c.rotate(.2); }
    legs(c, { walkPh: b.walkPh, vx: b.vx }, 10, 22, 0x2a1e16, 9);
    c.translate(0, -bob); c.fillStyle = col(0x6a5a4a); c.beginPath(); c.moveTo(-20, -22); c.lineTo(-22, -60); c.quadraticCurveTo(0, -70, 22, -60); c.lineTo(20, -22); c.fill(); // tronco nu
    c.fillStyle = col(0x4a3a2c); c.fillRect(-21, -34, 42, 12); c.fillStyle = col(0x2a1e16); c.save(); c.rotate(.5); c.fillRect(-26, -50, 52, 4); c.restore(); // correias
    c.fillStyle = col(0x5a4a3c); for (let i = 0; i < 3; i++) ell(c, -8 + i * 8, -48, 5, 4);
    c.fillStyle = col(0x1a1414); c.beginPath(); c.moveTo(-14, -60); c.quadraticCurveTo(-16, -88, 2, -92); c.quadraticCurveTo(18, -86, 14, -60); c.fill(); poly(c, [2, -92, -6, -100, -2, -88]); // capuz de carrasco
    c.fillStyle = col(0x0a0808); c.fillRect(-2, -80, 14, 4); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = col(0xff6a3a, .9); ell(c, 3, -78, 1.6, 1.2); ell(c, 9, -78, 1.5, 1.1); c.restore();
    c.fillStyle = col(0x6a5a4a); ell(c, 18, -54, 7, 9); weapon(c, 'axe', 20, -50, ang, 1.7, 0xb8b0a0);
  },
};
// ==================================================== 3. BRIGID, A LANÇA JURAMENTADA (Muralhas)
BOSSDEF.brigid = {
  name: 'Brigid, a Lança Juramentada', title: 'Capitã da Guarda da Rainha', speaker: 'Brigid', music: 'b_brigid', voice: 'brigid', w: 28, h: 64, mass: 6, posture: 300, rim: 0xc8d8ff, keep: [70, 140], walk: 70, run: 160, hitSnd: 'hit_spear', dieSnd: 'f_die1',
  line: 'Nenhum vivo passará pelo Portão. Assim o jurei à minha rainha. Nenhum morto também.', deathLine: 'Rainha minha... guardei... a porta...',
  reward: { cinzas: 2600, items: ['brasa_juramento', 'asas', ['fragmento', 2]] }, blood: [0xd8e0ff, 0xffffff],
  block(b, h) { if (b.guard && !h.proj && h.from && Math.sign(h.from.x - b.x) === b.face) { synth('clang'); burst(b.x + b.face * 20, b.cy, 12, { color: [0xfff0c0, 0xbfd8ff], smin: 60, smax: 220 }); b.guardHit = true; return true; } return false; },
  phases: [
    { hp: 1000, until: .55, keep: [70, 140], moves: [
      seq('thrust', [{ w: .55, pose: 'thrust', hit: { ox: 62, oy: -36, w: 110, h: 18, dmg: 22, fx: false }, lunge: 300, lungeT: .12, fn: b => lineFx(b.x, b.y - 36, b.x + b.face * 130, b.y - 36, 0xdde6ff, 3, .15) }], { w: 3, rng: [0, 170] }),
      seq('thrust3', [{ w: .5, pose: 'thrust', hit: { ox: 62, oy: -36, w: 110, h: 18, dmg: 18, fx: false }, lunge: 220, lungeT: .1, r: .12, fn: b => lineFx(b.x, b.y - 36, b.x + b.face * 130, b.y - 36, 0xdde6ff, 3, .12) }, { w: .22, tele: false, pose: 'thrust', hit: { ox: 62, oy: -30, w: 110, h: 18, dmg: 18, fx: false }, lunge: 220, lungeT: .1, r: .12, fn: b => lineFx(b.x, b.y - 30, b.x + b.face * 130, b.y - 30, 0xdde6ff, 3, .12) }, { w: .3, tele: false, pose: 'thrust', hit: { ox: 66, oy: -40, w: 120, h: 20, dmg: 22, fx: false }, lunge: 300, lungeT: .14, fn: b => lineFx(b.x, b.y - 40, b.x + b.face * 140, b.y - 40, 0xdde6ff, 4, .15) }], { w: 2.5, rng: [0, 170] }),
      seq('bash', [{ w: .4, hit: { ox: 26, oy: -36, w: 40, h: 50, dmg: 16, kb: 460, fx: false, snd: 'hit_club' }, lunge: 260, lungeT: .1 }], { w: 1.5, rng: [0, 60] }),
      { id: 'leap', w: 1.6, rng: [100, 700], dur: 1.6, cool: 3, ev: [[0, b => { b.setPose('wind', .35); bTele(b, 0, -1.1, 0xdde6ff); voxCry('brigid', 'atk'); }], [.35, (b, p) => b.leapTo(p.x, 240, .75, b => { shake(6); synth('boom', .6); sfx('hit_spear', at(b, .9)); aoe({ x: b.x, y: b.y, w: 60, h: 60, delay: 0, dur: .12, dmg: b.dmg(24), owner: b, color: 0xdde6ff }); burst(b.x, b.y - 2, 20, { color: [0xdde6ff, 0x8a8478], dir: -HPI, spread: 1.2, smin: 60, smax: 240, grav: 600, glow: false }); b.setPose('swing', .2); })]] },
      { id: 'guard', w: 1.2, rng: [0, 200], dur: 1.8, cool: 5, ev: [[0, b => { b.guard = true; b.guardHit = false; b.setPose('guard', .2); }]], upd(b, p, dt, mv) { b.face = Math.sign(p.x - b.x) || b.face; if (b.guardHit) { b.guard = false; b.guardHit = false; b.startMove(seq('counter', [{ w: .14, tele: false, pose: 'thrust', hit: { ox: 62, oy: -36, w: 110, h: 18, dmg: 24, fx: false }, lunge: 360, lungeT: .12, fn: b => lineFx(b.x, b.y - 36, b.x + b.face * 140, b.y - 36, 0xffffff, 4, .15) }]), p); return true; } if (mv.t > 1.7) b.guard = false; return true; } },
      { id: 'charge', w: 1.2, rng: [180, 700], dur: 1.6, cool: 4, ev: [[0, b => { b.setPose('guard', .3); b.guard = true; bTele(b, 20, -.6, 0xdde6ff); }], [.45, (b, p, mv) => { mv.lunge = 420; mv.lungeT = .7; sfx('warcry', at(b, .6)); }], [1.2, b => { b.guard = false; }]], upd(b, p, dt, mv) { if (mv.lungeT > 0) hitbox({ owner: b, team: 'enemy', ox: 22, oy: -36, w: 30, h: 56, life: dt * 1.5, dmg: b.dmg(18), kb: 420 }); return true; } },
    ] },
    { hp: 1000, title: 'O Juramento Eterno', line: 'O juramento não morre comigo. O juramento SOU eu!', speed: 1.1, dmgMul: 1.12, aggr: .8, music: 'b_brigid',
      trans: { dur: 2.4, start(b) { b.guard = false; b.setPose('cast', .6); voxCry('brigid', 'big', { vol: 1 }); sfx('thunder', at(b, .8)); after(.8, () => { for (let i = 0; i < 5; i++) bStrike(b, b.arena.x0 + 60 + i * (b.arena.x1 - b.arena.x0 - 120) / 4, { delay: .6, dmg: 18 }); UI.flash(.6); }); } },
      moves: [
        seq('thrust3', [{ w: .45, pose: 'thrust', hit: { ox: 62, oy: -36, w: 110, h: 18, dmg: 18, fx: false }, lunge: 240, lungeT: .1, r: .1, fn: b => lineFx(b.x, b.y - 36, b.x + b.face * 130, b.y - 36, 0xdde6ff, 3, .12) }, { w: .2, tele: false, pose: 'thrust', hit: { ox: 62, oy: -30, w: 110, h: 18, dmg: 18, fx: false }, lunge: 240, lungeT: .1, r: .1 }, { w: .26, tele: false, pose: 'thrust', hit: { ox: 66, oy: -40, w: 120, h: 20, dmg: 22, fx: false, type: 'phys' }, lunge: 320, lungeT: .14, fn: (b, p) => { lineFx(b.x, b.y - 40, b.x + b.face * 150, b.y - 40, 0xbfd8ff, 5, .2); bStrike(b, b.x + b.face * 160, { delay: .35, dmg: 16 }); } }], { w: 2.5, rng: [0, 170] }),
        { id: 'storm', w: 1.6, rng: [0, 700], dur: 2.2, cool: 4, ev: [[0, b => { b.setPose('cast', .5); voxCry('brigid', 'atk'); sfx('lightning', at(b, .4)); }], [.5, (b, p) => { for (let i = -1; i <= 1; i++) bStrike(b, p.x + i * 70, { delay: .65 + Math.abs(i) * .15, dmg: 20 }); }], [1.2, (b, p) => bStrike(b, p.x, { delay: .5, dmg: 20 })]] },
        { id: 'leap', w: 1.6, rng: [80, 700], dur: 1.7, cool: 3, ev: [[0, b => { b.setPose('wind', .3); bTele(b, 0, -1.1, 0xdde6ff); }], [.3, (b, p) => b.leapTo(p.x, 260, .7, b => { shake(7); synth('boom', .7); aoe({ x: b.x, y: b.y, w: 60, h: 60, delay: 0, dur: .12, dmg: b.dmg(24), owner: b, color: 0xdde6ff }); for (const s of [-1, 1]) for (let k = 1; k <= 3; k++) bStrike(b, b.x + s * k * 70, { delay: .25 + k * .15, dmg: 16 }); })]] },
        seq('bash', [{ w: .32, hit: { ox: 26, oy: -36, w: 40, h: 50, dmg: 16, kb: 460, fx: false, snd: 'hit_club' }, lunge: 280, lungeT: .1 }], { w: 1.2, rng: [0, 60] }),
        { id: 'guard', w: 1, rng: [0, 200], dur: 1.6, cool: 5, ev: [[0, b => { b.guard = true; b.guardHit = false; b.setPose('guard', .2); }]], upd(b, p, dt, mv) { b.face = Math.sign(p.x - b.x) || b.face; if (b.guardHit) { b.guard = false; b.guardHit = false; bStrike(b, p.x, { delay: .3, dmg: 18 }); b.startMove(seq('counter', [{ w: .12, tele: false, pose: 'thrust', hit: { ox: 62, oy: -36, w: 110, h: 18, dmg: 24, fx: false }, lunge: 380, lungeT: .12 }]), p); return true; } if (mv.t > 1.5) b.guard = false; return true; } },
      ] },
  ],
  draw(c, b, t) {
    const ang = b.pose === 'guard' ? -.4 : bAng(b, .25, -.9, .3), bob = Math.abs(b.vx) > 10 ? Math.abs(Math.sin(b.walkPh)) * 1.5 : 0;
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 14); c.rotate(.15); }
    drawHum(c, { walkPh: b.walkPh, vx: b.vx, ph: b.ph, move: null, h: 64 }, { w: 28, h: 64, body: 0x2a3550, body2: 0x3a5a9a, belt: 0xc8a040, pauldron: 0xd8dce8, mask: { c: 0xd8dce8, shape: 'helm' }, ms: 1.3, plume: 0xf0f0ff, cape: 0x8a1e1a, weapon: 'spear', wc: 0xe8ecff, ang, legW: 6, lean: b.pose === 'thrust' ? .15 : 0,
      extra: (cc, H) => { const sx = b.guard ? 20 : 12, sy = b.guard ? -H * .52 : -H * .48; cc.fillStyle = col(0x6a5a3a); cc.beginPath(); cc.ellipse(sx, sy, 7, 17, 0, 0, TAU); cc.fill(); cc.fillStyle = col(0xc8a040); cc.beginPath(); cc.ellipse(sx + 1, sy, 3, 9, 0, 0, TAU); cc.fill(); cc.strokeStyle = col(0xd8dce8); cc.lineWidth = 1.5; cc.beginPath(); cc.ellipse(sx, sy, 7, 17, 0, 0, TAU); cc.stroke(); if (b.phase && b.alive) { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.globalAlpha = .5 + Math.sin(t * 20) * .3; cc.drawImage(glowSpr(0xbfd8ff), 30, -H * .7, 40, 40); cc.restore(); } } });
  },
};
// ==================================================== 4. VESPER, TECELÃ DE CINZAS (Pântano)
BOSSDEF.vesper = {
  name: 'Vesper, Tecelã de Cinzas', title: 'Irmã da Rainha', speaker: 'Vesper', music: 'b_vesper', voice: 'vesper', w: 26, h: 66, mass: 3, posture: 200, rim: 0xc8a8ff, light: [170, 0xb090ff, .8], fly: true, keep: [180, 300], hitSnd: 'hit_knife', dieSnd: 'f_die3',
  line: 'O véu rasgou-se, criança. E eu coso-o... com o que me resta. Com o que te resta.', deathLine: 'Os fios... soltam-se. Seraphine, irmã... perdoa-me. Não fui a tempo.',
  reward: { cinzas: 3200, items: ['brasa_veu', 'tal_foco', ['fragmento', 2]] }, blood: [0xc8a8ff, 0xffffff], ash: 0x9a8ab8,
  init(b) { b.y = b.arena.floor - 56; b.hy = b.y; },
  locomotion(b, p, dt) { // flutua, mantendo distância
    b.face = Math.sign(p.x - b.x) || b.face; const d = Math.abs(p.x - b.x), k = b.P.keep || [180, 300]; let want = 0; if (d < k[0]) want = -b.face; else if (d > k[1]) want = b.face;
    if (b.x < b.arena.x0 + 60 && want < 0) want = 0; if (b.x > b.arena.x1 - 60 && want > 0) want = 0;
    b.vx = approach(b.vx, want * 110, 300 * dt);
    if (b.hitRecent > 2.5 && !(b.cool.blink > 0)) { b.hitRecent = 0; b.startMove(BOSSDEF.vesper.blinkMove, p); b.cool.blink = 3; }
  },
  tick(b, dt) { const ty = b.arena.floor - 56 + Math.sin(G.t * 1.3) * 10; if (b.alive && b.state !== 'broken') b.vy = (ty - b.y) * 3; if (b.move) b.vx = approach(b.vx, 0, 300 * dt); },
  blinkMove: { id: 'blink', dur: .6, ev: [[0, b => b.setPose('cast', .2)], [.2, (b, p) => { const side = p.x < (b.arena.x0 + b.arena.x1) / 2 ? 1 : -1; b.teleport(p.x + side * rnd(200, 280), b.arena.floor - 80, 0xc0a0ff); if (b.phase) bFan(b, 3, .5, 220, { color: 0xd0b0ff, dmg: 12 }); }]] },
  phases: [
    { hp: 980, until: .5, keep: [180, 300], moves: [
      { id: 'fan', w: 3, rng: [0, 700], dur: 1.2, ev: [[0, b => { b.setPose('cast', .5); voxCry('vesper', 'atk', { vol: .5 }); }], [.55, b => { bFan(b, 5, .9, 210, { color: 0xc8a8ff, dmg: 13 }); sfx('cast_arc', at(b, .6)); }]] },
      { id: 'threads', w: 2.2, rng: [0, 700], dur: 1.8, cool: 3, ev: [[0, b => { b.setPose('cast', .6); sfx('ink', at(b, .6)); }], [.3, (b, p) => { const ys = [b.arena.floor - 18, b.arena.floor - 70, b.arena.floor - 122]; const skip = rndi(0, 2); ys.forEach((y, i) => { if (i !== skip) bLine(b, y, { delay: 1, dmg: 18, color: 0xd0b0ff }); }); }]] },
      { id: 'needle', w: 1.5, rng: [0, 700], dur: .9, ev: [[0, b => { b.setPose('cast', .35); bTele(b, 10, -.6, 0xd0b0ff); }], [.4, (b, p) => { const sx = b.x + b.face * 10, sy = b.y - 40, a = Math.atan2(p.cy - sy, p.x - sx); new Proj({ x: sx, y: sy, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, r: 4, dmg: b.dmg(16), team: 'enemy', owner: b, kind: 'spear', color: 0xd0b0ff, life: 1.4 }); sfx('cast_arc2', at(b, .6)); }]] },
      { id: 'spirits', w: 1, rng: [0, 700], dur: 1.2, cool: 12, cond: b => b.adds.filter(a => a.alive).length < 2, ev: [[0, b => { b.setPose('cast', .5); sfx('wail_sml', at(b, .6)); }], [.6, b => { for (const s of [-1, 1]) bSummon(b, 'vela', b.x + s * 60, { y: b.y - 20 }); }]] },
    ] },
    { hp: 980, title: 'A Tecelã Desvelada', line: 'Rasgaste o meu véu. Então coso-o com a tua carne!', speed: 1.12, dmgMul: 1.12, aggr: .75, keep: [160, 280],
      trans: { dur: 2.4, start(b) { b.setPose('cast', .6); voxCry('vesper', 'big', { vol: 1 }); sfx('shriek', at(b, .8, { rate: 1.3 })); after(.8, () => { bRing(b, 16, 150, { color: 0xd0b0ff, dmg: 12, life: 6 }); ringFx(b.x, b.cy, 10, 120, 0xc0a0ff, .6, 5); }); } },
      moves: [
        { id: 'fan2', w: 2.5, rng: [0, 700], dur: 1.6, ev: [[0, b => b.setPose('cast', .5)], [.5, b => { bFan(b, 7, 1.2, 220, { color: 0xc8a8ff, dmg: 12 }); sfx('cast_arc', at(b, .6)); }], [.95, b => bFan(b, 6, 1.1, 250, { color: 0xc8a8ff, dmg: 12 })]] },
        { id: 'spiral', w: 2, rng: [0, 700], dur: 2.6, cool: 5, ev: [[0, b => { b.setPose('cast', .5); sfx('dark', at(b, .6)); }]], upd(b, p, dt, mv) { if (mv.t > .5 && mv.t < 2.4) { mv.data.acc = (mv.data.acc || 0) + dt; while (mv.data.acc > .09) { mv.data.acc -= .09; mv.data.a = (mv.data.a || 0) + .38; for (const s of [0, PI]) bOrb(b, b.x, b.cy, Math.cos(mv.data.a + s) * 170, Math.sin(mv.data.a + s) * 170, { color: 0xc0a0ff, dmg: 11, r: 5, life: 4 }); } } return true; } },
        { id: 'weave', w: 2, rng: [0, 700], dur: 2.2, cool: 4, ev: [[0, b => { b.setPose('cast', .6); sfx('ink', at(b, .7)); }], [.3, (b, p) => { for (let i = -2; i <= 2; i++) bPillar(b, p.x + i * 80, { delay: .9, dmg: 16, color: 0xd0b0ff, type: 'phys', w: 22 }); bLine(b, b.arena.floor - 60, { delay: 1.5, dmg: 16, color: 0xd0b0ff }); }]] },
        { id: 'clones', w: 1.4, rng: [0, 700], dur: 1.4, cool: 12, ev: [[0, b => { b.setPose('cast', .6); sfx('dark_big', at(b, .6)); }], [.7, (b, p) => { for (const s of [-1, 1]) vesperClone(b, clamp(p.x + s * 200, b.arena.x0 + 40, b.arena.x1 - 40)); }]] },
        { id: 'pull', w: 1.2, rng: [120, 700], dur: 2, cool: 7, ev: [[0, b => { b.setPose('cast', .5); sfx('ink', at(b, .7)); voxSay('vesper', 3); }]], upd(b, p, dt, mv) { if (mv.t > .4 && mv.t < 1.7 && p.state !== 'dash') { const d = Math.abs(b.x - p.x); if (d > 40) p.x += Math.sign(b.x - p.x) * 150 * dt; if (Math.random() < .5) part({ x: lerp(p.x, b.x, Math.random()), y: lerp(p.cy, b.cy, Math.random()), vx: 0, vy: 0, life: .2, s: 1.5, color: 0xd0b0ff, glow: true }); } if (mv.t > 1.2 && !mv.data.f) { mv.data.f = 1; bRing(b, 10, 160, { color: 0xd0b0ff, dmg: 13, life: 4 }); } return true; } },
        { id: 'threads', w: 1.6, rng: [0, 700], dur: 1.8, cool: 3, ev: [[0, b => b.setPose('cast', .6)], [.3, () => { const b = GAME.boss; const ys = [b.arena.floor - 18, b.arena.floor - 70, b.arena.floor - 122]; const skip = rndi(0, 2); ys.forEach((y, i) => { if (i !== skip) bLine(b, y, { delay: .9, dmg: 18, color: 0xd0b0ff }); }); }]] },
      ] },
  ],
  draw(c, b, t) { drawVesper(c, b, t, false); },
};
function drawVesper(c, b, t, ghost) {
  const H = 66, cast = b.pose === 'cast';
  c.globalAlpha *= ghost ? .55 : 1;
  // fios
  c.strokeStyle = col(0xc8a8ff, .45); c.lineWidth = .8; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(-10 + i * 5, -H + 10); c.quadraticCurveTo(-30 + i * 14, -H - 40, -40 + i * 22, -H - 120); } c.stroke();
  // vestido
  c.fillStyle = col(ghost ? 0x2a1a40 : 0x3a2a5a); c.beginPath(); c.moveTo(-10, -H + 22); c.lineTo(10, -H + 22); c.quadraticCurveTo(20, -24, 26, 10); for (let i = 0; i <= 7; i++) c.lineTo(26 - i * 7.4, 10 + Math.sin(t * 3 + i) * 5 + (i % 2 ? 6 : 0)); c.quadraticCurveTo(-20, -24, -10, -H + 22); c.fill();
  c.fillStyle = col(0x5a4a8a); c.beginPath(); c.moveTo(2, -H + 24); c.quadraticCurveTo(14, -24, 18, 10); c.lineTo(8, 12); c.quadraticCurveTo(8, -24, -2, -H + 24); c.fill();
  // braços (vários, como fiandeira)
  c.strokeStyle = col(0xd8d0e8); c.lineWidth = 2.4; c.lineCap = 'round'; const a = cast ? -.9 - b.pk * .5 : .4 + Math.sin(t * 2) * .2;
  for (const [ox, oy, k] of [[8, -46, 1], [6, -40, -.5], [-4, -44, .3]]) { c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a * k) * 18, oy + Math.sin(a * k) * 18); c.stroke(); }
  // véu e máscara
  c.fillStyle = col(0x8a849a, .8); c.beginPath(); c.moveTo(-12, -H + 2); c.quadraticCurveTo(2, -H - 16, 14, -H + 2); c.lineTo(16, -H + 34); c.lineTo(-18, -H + 40 + Math.sin(t * 2) * 3); c.fill();
  drawMask(c, 3, -H + 10, 1.2, { c: 0xe8e0f0, shape: 'long', eye: 0xc8a8ff });
  if (cast) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .6 * b.pk; c.drawImage(glowSpr(0xc0a0ff), -10, -70, 60, 60); c.restore(); }
}
function vesperClone(b, x) {
  const e = new Enemy('vela', x, b.arena.floor - 70, { lvl: 1 }); e.isAdd = true; e.cinzas = 0; e.hp = e.maxHp = 1; e.aggro = true; b.adds.push(e);
  e.draw = function (c) { c.save(); c.translate(this.x, this.y + 6); c.scale(Math.sign(PLAYER.x - this.x) || 1, 1); drawVesper(c, { pose: 'cast', pk: .6, alive: true, phase: 1 }, G.t, true); c.restore(); };
  e.w = 22; e.h = 60; e.D = Object.assign({}, e.D, { moves: [{ id: 'fan', range: [0, 800], wind: .8, act: .1, rec: .4, cd: 2.2, fire(en) { bFan(b, 3, .6, 200, { color: 0xd0b0ff, dmg: 10, x: en.x, y: en.y - 40 }); } }] });
  after(10, () => { if (e.alive) { burst(e.x, e.cy, 20, { color: 0xc0a0ff }); e.remove(); } });
  burst(x, b.arena.floor - 100, 24, { color: [0xc0a0ff, 0x1a1020] });
}
// ==================================================== 5. ORIN, MESTRE DOS CAÇADORES (Bosque, subchefe)
BOSSDEF.orin = {
  name: 'Orin, Mestre dos Caçadores', title: 'Guardião dos Rastos da Princesa', speaker: 'Orin', music: 'b_orin', voice: 'orin', sub: true, w: 24, h: 60, mass: 3, posture: 240, rim: 0xd8e0ff, keep: [60, 160], walk: 90, run: 210, hitSnd: 'hit_knife', dieSnd: 'm_die',
  line: 'Ela não quer ser encontrada. Eu ensinei-a a não deixar rastos. Tu deixas muitos.', deathLine: 'Selene... corre... não olhes para trás... como te ensinei...',
  reward: { cinzas: 2400, items: ['tal_corvo', 'fragmento'] }, blood: [0x8a2a20, 0xe8e0d0],
  phases: [
    { hp: 900, until: .5, keep: [60, 170], moves: [
      seq('dashcut', [{ w: .4, hit: { ox: 30, oy: -30, w: 52, h: 36, dmg: 18, color: 0xe8f0ff }, lunge: 520, lungeT: .14, r: .12 }, { w: .18, tele: false, hit: { ox: 30, oy: -26, w: 52, h: 36, dmg: 16, color: 0xe8f0ff, ang: .5 }, lunge: 200 }], { w: 3, rng: [0, 260] }),
      { id: 'volley', w: 2, rng: [0, 700], dur: 1.4, cool: 2, ev: [[0, (b, p, mv) => { b.setPose('cast', .3); b.vy = -380; mv.lunge = -260; mv.lungeT = .35; sfx('whoosh1', at(b, .6)); }], [.45, (b, p) => { for (let i = -1; i <= 1; i++) { const sx = b.x, sy = b.y - 40, a = Math.atan2(p.cy - sy, p.x - sx) + i * .12; new Proj({ x: sx, y: sy, vx: Math.cos(a) * 600, vy: Math.sin(a) * 600, r: 4, dmg: b.dmg(13), team: 'enemy', owner: b, kind: 'arrow', color: 0xffe0c0, light: false, life: 1.6 }); } sfx('bow', at(b, .7)); }]] },
      { id: 'trap', w: 1.2, rng: [0, 700], dur: 1, cool: 5, ev: [[0, b => b.setPose('cast', .3)], [.3, (b, p) => { const x = p.x; sfx('throw', at(b, .5)); aoe({ x, y: b.arena.floor, w: 50, h: 24, delay: .6, dur: 4, dmg: b.dmg(16), color: 0xc8b080, kby: -300, draw(cc, A) { cc.globalCompositeOperation = 'source-over'; const open = A.fired ? 1 : A.t / A.delay; cc.globalAlpha = .9; cc.strokeStyle = '#8a7a5a'; cc.lineWidth = 2; cc.beginPath(); for (let k = -3; k <= 3; k++) { cc.moveTo(A.x + k * 6, A.y); cc.lineTo(A.x + k * 6 * (1 - open * .3), A.y - 8 - open * 6); } cc.stroke(); cc.fillStyle = '#5a4a3a'; cc.fillRect(A.x - 22, A.y - 3, 44, 3); } }); }]] },
      seq('antler', [{ w: .6, teleY: -1.05, pose: 'thrust', hit: { ox: 22, oy: -50, w: 40, h: 30, dmg: 22, kb: 420, fx: false }, lunge: 480, lungeT: .35 }], { w: 1.2, rng: [120, 500], cool: 3 }),
    ] },
    { hp: 900, title: 'O Chamado da Matilha', line: 'Irmãos! A princesa! Protejam a princesa!', speed: 1.1, dmgMul: 1.1, aggr: .8,
      trans: { dur: 2.2, start(b) { b.setPose('cast', .6); sfx('wolf_growl2', at(b, 1, { rate: .8 })); voxCry('orin', 'big', { vol: 1 }); after(.9, () => { for (const s of [-1, 1]) bSummon(b, 'lobo', b.x + s * 140); }); } },
      moves: [
        seq('dashcut', [{ w: .35, hit: { ox: 30, oy: -30, w: 52, h: 36, dmg: 18, color: 0xe8f0ff }, lunge: 560, lungeT: .14, r: .1 }, { w: .16, tele: false, hit: { ox: 30, oy: -26, w: 52, h: 36, dmg: 16, color: 0xe8f0ff, ang: .5 }, lunge: 220, r: .1 }, { w: .16, tele: false, hit: { ox: 34, oy: -30, w: 60, h: 40, dmg: 20, color: 0xe8f0ff }, lunge: 260 }], { w: 3, rng: [0, 260] }),
        { id: 'volley', w: 2, rng: [0, 700], dur: 1.6, cool: 2, ev: [[0, (b, p, mv) => { b.setPose('cast', .3); b.vy = -400; mv.lunge = -260; mv.lungeT = .35; }], [.4, (b, p) => { for (let i = -2; i <= 2; i++) { const sx = b.x, sy = b.y - 40, a = Math.atan2(p.cy - sy, p.x - sx) + i * .1; new Proj({ x: sx, y: sy, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, r: 4, dmg: b.dmg(12), team: 'enemy', owner: b, kind: 'arrow', color: 0xffe0c0, light: false, life: 1.6 }); } sfx('bow', at(b, .7)); }]] },
        seq('antler', [{ w: .5, teleY: -1.05, pose: 'thrust', hit: { ox: 22, oy: -50, w: 40, h: 30, dmg: 22, kb: 420, fx: false }, lunge: 520, lungeT: .35 }], { w: 1.2, rng: [120, 500], cool: 3 }),
        { id: 'howl', w: 1, rng: [0, 700], dur: 1.4, cool: 14, cond: b => b.adds.filter(a => a.alive).length < 1, ev: [[0, b => { b.setPose('cast', .6); sfx('wolf_growl2', at(b, .9)); }], [.8, b => bSummon(b, 'lobo', b.x - b.face * 160)]] },
      ] },
  ],
  draw(c, b, t) {
    const ang = bAng(b, .6, -1.6, 1.2);
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 12); c.rotate(.15); }
    drawHum(c, { walkPh: b.walkPh, vx: b.vx, ph: b.ph, move: null }, { w: 24, h: 60, body: 0x3a3428, body2: 0x5a5040, belt: 0x6a5030, hood: 0x6a6458, mask: { c: 0xe0d8c8, shape: 'beak', eye: 0xffb060 }, ms: 1.2, weapon: 'dagger', wc: 0xe8f0ff, ang, cape: 0x8a8070, legW: 5, lean: b.pose === 'thrust' ? .35 : 0,
      extraHead: (cc, hx, hy) => { cc.strokeStyle = col(0xe8e4dc); cc.lineWidth = 2; cc.lineCap = 'round'; for (const s of [-1, 1]) { cc.beginPath(); cc.moveTo(hx - 2, hy - 8); cc.quadraticCurveTo(hx - 4 + s * 4, hy - 20, hx - 10 + s * 10, hy - 30); cc.moveTo(hx - 4 + s * 3, hy - 18); cc.lineTo(hx + 4 + s * 8, hy - 22); cc.stroke(); } },
      extra: (cc, H) => { weapon(cc, 'dagger', -2, -H * .55, ang + .6, 1.2, 0xe8f0ff); cc.save(); cc.translate(-10, -H * .6); cc.rotate(.5); cc.strokeStyle = col(0x5a4a3a); cc.lineWidth = 2; cc.beginPath(); cc.arc(0, 0, 16, -1.1, 1.1); cc.stroke(); cc.restore(); } });
  },
};
