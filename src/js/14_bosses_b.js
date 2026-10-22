// ===================== CHEFES II: Selene (+Garra), Hilde, Ozias, Aldric, Seraphine =====================
function arrowAt(b, p, o = {}) { const sx = b.x + b.face * 12, sy = b.y - (o.oy ?? 38), a = Math.atan2(p.cy - sy, p.x - sx) + (o.da || 0), sp = o.sp || 620; return new Proj({ x: sx, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4, dmg: b.dmg(o.dmg || 14), team: 'enemy', owner: b, kind: o.kind || 'arrow', color: o.color ?? 0xd8e0ff, light: !!o.light, glowA: true, life: 1.8 }); }
// ==================================================== 6. SELENE, A CAÇADORA DA LUA MORTA (Bosque)
EDEF.garra = {
  name: 'Garra, a Loba da Princesa', w: 50, h: 34, hp: 230, cinzas: 0, walk: 80, run: 260, keep: [60, 140], sight: 900, sightY: 400, poise: 60, touch: 10, mass: 3, sndHurt: ['wolf_hit'], sndDie: 'wolf_die', sndAggro: 'wolf_growl2', blood: [0x8a2a20, 0xe8e8f0], ash: 0xd8d8e8, glint: [28, -26], big: true,
  moves: [
    { id: 'lunge', range: [60, 260], wind: .5, act: .5, rec: .5, cd: 1.6, sndAct: 'wolf_growl1', fire(e) { e.vy = -300; e.vx = e.face * 440; }, upd(e, p, dt, mv) { if (mv.phase === 'act') { e.vx = e.face * 440; hitbox({ owner: e, team: 'enemy', ox: 18, oy: -16, w: 44, h: 28, life: dt * 1.5, dmg: e.dmg(18), kb: 300 }); if (e.onGround && mv.t2 > .12) { mv.phase = 'rec'; mv.t3 = 0; } } } },
    { id: 'bite', range: [0, 70], wind: .34, act: .1, rec: .4, lunge: 220, cd: 1, sndAct: 'hit_bite', hit: { ox: 28, oy: -16, w: 40, h: 26, dmg: 16, fx: false } },
    { id: 'howl', range: [0, 400], wind: .6, act: .4, rec: .3, cd: 4, cdOwn: 9, sndAct: 'wolf_growl2', fire(e) { ringFx(e.x, e.cy, 10, 120, 0xd8e0ff, .5, 4); aoe({ x: e.x, y: e.cy, r: 90, shape: 'circle', delay: 0, dur: .12, dmg: e.dmg(12), color: 0xd8e0ff, owner: e }); shake(3); } },
    { id: 'circle', range: [0, 160], wind: .1, act: .7, rec: .1, cd: .6, w: .6, track: false, fire(e) { e.face = -e.face; }, upd(e, p, dt, mv) { if (mv.phase === 'act') e.vx = e.face * 200; } },
  ],
  draw(c, e, t) { c.scale(1.45, 1.45); EDEF.lobo.draw(c, e, t); c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(0xd8e0ff), 6, -32, 24, 24); c.globalCompositeOperation = 'source-over'; },
  onDie(e) { const b = GAME.boss; if (b && b.id === 'selene' && b.alive) seleneEnrage(b); },
};
function seleneEnrage(b) {
  if (b.enraged) return; b.enraged = true; b.speedMul = 1.3; b.dmgMul = 1.2; b.move = null; b.cd = .8;
  UI.subtitle('Selene', 'GARRA! Não... não, não, não! Vais pagar por ela!', 3.6, 'selene'); voxCry('selene', 'big', { vol: 1 }); shake(6); UI.flash(.4);
  bRing(b, 14, 160, { color: 0xd8e0ff, dmg: 12, life: 5 });
}
BOSSDEF.selene = {
  name: 'Selene, a Caçadora da Lua Morta', title: 'Primogénita do Rei', speaker: 'Selene', music: 'b_selene', voice: 'selene', w: 22, h: 58, mass: 3, posture: 240, rim: 0xd8e0ff, light: [150, 0xc8d8ff, .5], keep: [150, 280], walk: 90, run: 220, hitSnd: 'hit_knife', dieSnd: 'f_die2',
  line: 'O meu pai mandou-te? Diz-lhe que a brasa fica comigo. Diz-lhe que a filha dele morreu na floresta.', deathLine: 'Garra... vem cá... está tão frio, Garra... a lua... apagou-se...',
  reward: { cinzas: 4200, items: ['brasa_lua', 'w_adagas', ['fragmento', 2]] }, blood: [0x8a2a20, 0xe8e8f0],
  phases: [
    { hp: 1100, until: .55, keep: [150, 280], moves: [
      { id: 'shot', w: 3, rng: [100, 800], dur: 1, ev: [[0, b => { b.setPose('cast', .5); bTele(b, 16, -.65, 0xd8e0ff); }], [.5, (b, p) => { arrowAt(b, p, { sp: 700, dmg: 15 }); sfx('bow', at(b, .7)); b.setPose('rec', .3); }]] },
      { id: 'volley', w: 2, rng: [0, 800], dur: 1.4, cool: 2, ev: [[0, (b, p, mv) => { b.setPose('cast', .3); b.vy = -420; mv.lunge = -280; mv.lungeT = .35; sfx('whoosh1', at(b, .6)); }], [.42, (b, p) => { for (let i = -1; i <= 1; i++) arrowAt(b, p, { da: i * .14, dmg: 13 }); sfx('bow', at(b, .7)); }]] },
      { id: 'rain', w: 1.5, rng: [0, 800], dur: 1.6, cool: 5, ev: [[0, b => { b.setPose('cast', .5); voxCry('selene', 'atk'); }], [.4, b => { lineFx(b.x, b.y - 40, b.x + b.face * 30, b.y - 420, 0xd8e0ff, 2, .35); sfx('bow', at(b, .8)); }], [.9, b => bRain(b, 8, { color: 0xd8e0ff, dmg: 15, w: 26, type: 'phys', snd: 'crossbow', stagger: .1 })]] },
      seq('daggers', [{ w: .4, hit: { ox: 26, oy: -30, w: 46, h: 36, dmg: 14, color: 0xe8f0ff }, lunge: 360, lungeT: .12, r: .1 }, { w: .16, tele: false, hit: { ox: 26, oy: -26, w: 46, h: 36, dmg: 14, color: 0xe8f0ff, ang: .6 }, lunge: 200, r: .1 }, { w: .18, tele: false, hit: { ox: 30, oy: -34, w: 54, h: 44, dmg: 18, color: 0xe8f0ff, ang: -.5 }, lunge: 260 }], { w: 2.5, rng: [0, 120] }),
      { id: 'flip', w: 2, rng: [0, 110], dur: 1, ev: [[0, (b, p, mv) => { b.setPose('cast', .2); b.vy = -460; mv.lunge = -320; mv.lungeT = .4; sfx('whoosh2', at(b, .6)); }], [.45, (b, p) => { arrowAt(b, p, { dmg: 15, sp: 720 }); sfx('bow', at(b, .7)); }]] },
      { id: 'smoke', w: 1, rng: [0, 800], dur: 1.2, cool: 6, ev: [[0, b => { b.setPose('cast', .3); sfx('hiss', at(b, .6)); burst(b.x, b.cy, 30, { color: [0x6a6a78, 0x8a8a9a], glow: false, smin: 40, smax: 160, lmin: .5, lmax: 1, szmin: 4, szmax: 9, grav: -40, drag: 2 }); }], [.35, (b, p) => { b.teleport(p.x - (Math.sign(p.vx) || p.face) * 70, undefined, 0x8a8a9a); b.face = Math.sign(p.x - b.x) || 1; }], [.55, b => { bTele(b, 20, -.6, 0xffffff); }], [.75, b => { b.setPose('swing', .15); bHit(b, { ox: 28, oy: -30, w: 52, h: 40, dmg: 18, color: 0xe8f0ff }); }]] },
    ] },
    { hp: 1100, title: 'A Lua Morta', line: 'Garra! Comigo! Caçamos juntas, como antes!', speed: 1.08, dmgMul: 1.08, aggr: .85,
      trans: { dur: 2.4, start(b) { b.setPose('cast', .6); voxCry('selene', 'big', { vol: 1 }); after(.9, () => { sfx('wolf_growl2', at(b, 1, { rate: .7 })); const g = bSummon(b, 'garra', b.x < (b.arena.x0 + b.arena.x1) / 2 ? b.arena.x1 - 60 : b.arena.x0 + 60, { lvl: 1 }); g.cinzas = 0; UI.toast('Garra, a Loba da Princesa', 2); }); } },
      moves: [
        { id: 'shot3', w: 2.5, rng: [100, 800], dur: 1.3, ev: [[0, b => { b.setPose('cast', .45); bTele(b, 16, -.65, 0xd8e0ff); }], [.45, (b, p) => { arrowAt(b, p, { sp: 720 }); sfx('bow', at(b, .7)); }], [.7, (b, p) => arrowAt(b, p, { sp: 720 })], [.95, (b, p) => { arrowAt(b, p, { sp: 760, dmg: 16 }); sfx('bow', at(b, .7)); }]] },
        { id: 'moon', w: 1.6, rng: [0, 800], dur: 2.2, cool: 6, ev: [[0, b => { b.setPose('cast', 1.1); sfx('charge', at(b, .6)); synth('charge'); voxSay('selene', 3, { vol: .6 }); }], [.2, (b, p, mv) => { mv.data.y = p.y; bLine(b, p.y - 22, { delay: 1, dmg: 26, h: 26, color: 0xd8e0ff, snd: 'lightning' }); }], [1.25, b => { shake(5); UI.flash(.2); b.setPose('rec', .5); }]] },
        { id: 'rain', w: 1.5, rng: [0, 800], dur: 1.6, cool: 4, ev: [[0, b => b.setPose('cast', .5)], [.4, b => sfx('bow', at(b, .8))], [.8, b => bRain(b, 11, { color: 0xd8e0ff, dmg: 15, w: 26, type: 'phys', snd: 'crossbow', stagger: .08 })]] },
        seq('daggers', [{ w: .36, hit: { ox: 26, oy: -30, w: 46, h: 36, dmg: 14, color: 0xe8f0ff }, lunge: 380, lungeT: .12, r: .08 }, { w: .14, tele: false, hit: { ox: 26, oy: -26, w: 46, h: 36, dmg: 14, color: 0xe8f0ff, ang: .6 }, lunge: 220, r: .08 }, { w: .14, tele: false, hit: { ox: 26, oy: -30, w: 46, h: 36, dmg: 14, color: 0xe8f0ff }, lunge: 220, r: .08 }, { w: .2, tele: false, hit: { ox: 30, oy: -34, w: 54, h: 44, dmg: 18, color: 0xe8f0ff, ang: -.5 }, lunge: 300 }], { w: 2.5, rng: [0, 120] }),
        { id: 'flip', w: 2, rng: [0, 110], dur: 1, ev: [[0, (b, p, mv) => { b.setPose('cast', .2); b.vy = -480; mv.lunge = -340; mv.lungeT = .4; }], [.4, (b, p) => { for (let i = -1; i <= 1; i++) arrowAt(b, p, { da: i * .12, dmg: 13 }); sfx('bow', at(b, .7)); }]] },
        { id: 'smoke', w: 1, rng: [0, 800], dur: 1.2, cool: 5, ev: [[0, b => { b.setPose('cast', .3); sfx('hiss', at(b, .6)); burst(b.x, b.cy, 30, { color: [0x6a6a78, 0x8a8a9a], glow: false, smin: 40, smax: 160, lmin: .5, lmax: 1, szmin: 4, szmax: 9, grav: -40, drag: 2 }); }], [.35, (b, p) => { b.teleport(p.x - (Math.sign(p.vx) || p.face) * 70, undefined, 0x8a8a9a); b.face = Math.sign(p.x - b.x) || 1; }], [.55, b => bTele(b, 20, -.6)], [.72, b => { b.setPose('swing', .15); bHit(b, { ox: 28, oy: -30, w: 52, h: 40, dmg: 18, color: 0xe8f0ff }); }]] },
      ] },
  ],
  draw(c, b, t) {
    const ang = b.pose === 'cast' ? -.15 : bAng(b, .7, -1.7, 1.1), bow = b.pose === 'cast';
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 12); c.rotate(.15); }
    drawHum(c, { walkPh: b.walkPh, vx: b.vx, ph: b.ph, move: null }, { w: 22, h: 58, body: 0x2a3040, body2: 0x4a5878, belt: 0x8a7a5a, hood: 0x3a4258, hoodTip: true, mask: { c: 0xeef0f8, shape: 'long', eye: 0xd8e0ff }, ms: 1.15, weapon: bow ? null : 'dagger', wc: 0xe8f0ff, ang, cape: 0x5a6078, legW: 4.5,
      extraHead: (cc, hx, hy) => { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.strokeStyle = col(0xe8ecff); cc.lineWidth = 2; cc.beginPath(); cc.arc(hx - 2, hy - 12, 6, -.4, PI + .4, true); cc.stroke(); cc.drawImage(glowSpr(0xd8e0ff), hx - 12, hy - 22, 20, 20); cc.restore(); },
      extra: (cc, H) => { if (bow) { cc.save(); cc.translate(14, -H * .6); cc.strokeStyle = col(0x6a5a40); cc.lineWidth = 2.4; cc.beginPath(); cc.arc(0, 0, 18, -1.25, 1.25); cc.stroke(); cc.strokeStyle = col(0xe8e8f0, .8); cc.lineWidth = .8; const dx = -8 * b.pk; cc.beginPath(); cc.moveTo(Math.cos(-1.25) * 18, Math.sin(-1.25) * 18); cc.lineTo(dx, 0); cc.lineTo(Math.cos(1.25) * 18, Math.sin(1.25) * 18); cc.stroke(); cc.fillStyle = col(0xd8e0ff); cc.fillRect(dx, -.8, 22, 1.6); cc.restore(); } else { cc.save(); cc.translate(-8, -H * .62); cc.rotate(.6); cc.strokeStyle = col(0x6a5a40); cc.lineWidth = 2; cc.beginPath(); cc.arc(0, 0, 16, -1.2, 1.2); cc.stroke(); cc.restore(); } } });
  },
};
// ==================================================== 7. HILDE, A MÃE DA FORJA (Forja)
BOSSDEF.hilde = {
  name: 'Hilde, a Mãe da Forja', title: 'Artífice do Cálice', speaker: 'Hilde', music: 'b_hilde', voice: 'hilde', w: 60, h: 108, mass: 14, posture: 460, rim: 0xffa050, light: [220, 0xff7a30, .7], keep: [70, 140], walk: 50, run: 110, heavyStep: true, step: 'step2', stepRate: .5, stepVol: .6, hitSnd: 'hit_mace', dieSnd: 'troll_die', resist: { fire: .5 },
  line: 'Fui eu que fiz o cálice. Fui eu que o aqueci. Então fui eu que me atirei ao fogo. Vieste ver se ainda ardo?', deathLine: 'O metal... arrefece. Finalmente posso... pousar o martelo.',
  reward: { cinzas: 5200, items: ['brasa_forja', 'cinza_bendita', ['fragmento', 3]] }, blood: [0xff8a30, 0x4a3a30], ash: 0x5a4030,
  tick(b, dt) { if (Math.random() < dt * 20) part({ x: b.x + rnd(-24, 24), y: b.y - rnd(20, 100), vx: rnd(-10, 10), vy: rnd(-60, -20), life: rnd(.5, 1.2), s: rnd(1, 2.4), color: pick([0xff8a30, 0xffc070]), glow: true }); },
  phases: [
    { hp: 1500, until: .5, keep: [70, 150], moves: [
      seq('slam', [{ w: .9, teleY: -1.05, teleC: 0xffa050, hit: { ox: 70, oy: -40, w: 90, h: 90, dmg: 32, len: 90, wid: 20, ang: 1, color: 0xffc070, snd: 'hit_mace' }, lunge: 60, fn: b => { shake(9); synth('boom', 1); sfx('quake', at(b, .8)); bWave(b, b.face, { off: 90, dmg: 20, speed: 320, color: 0xff8a30, h: 28, type: 'fire' }); burst(b.x + b.face * 90, b.y - 4, 26, { color: [0xff8a30, 0xffc070], dir: -HPI, spread: 1, smin: 120, smax: 340, grav: 800 }); } }], { w: 3, rng: [0, 170] }),
      seq('sweep', [{ w: .7, teleY: -.2, teleC: 0xffa050, hit: { ox: 60, oy: -6, w: 170, h: 30, dmg: 24, len: 120, wid: 14, ang: 0, color: 0xffc070, flat: true, kby: -400 }, lunge: 80 }], { w: 2, rng: [0, 170] }),
      { id: 'slag', w: 2, rng: [80, 900], dur: 1.6, cool: 3, ev: [[0, b => { b.setPose('wind', .6); sfx('fire', at(b, .6)); }], [.6, (b, p) => { b.setPose('swing', .2); sfx('throw', at(b, .8)); for (let i = 0; i < 3; i++) { const tx = p.x + (i - 1) * 90, dx = tx - b.x, tt = .9; const pr = new Proj({ x: b.x + b.face * 30, y: b.y - 90, vx: dx / tt, vy: -420, grav: (2 * ((b.arena.floor - 10) - (b.y - 90) + 420 * tt)) / (tt * tt), r: 7, dmg: b.dmg(14), team: 'enemy', owner: b, color: 0xff7a30, kind: 'orb', life: 3, trail: true, type: 'fire', wall: true }); pr.onDie = function () { burst(this.x, this.y, 14, { color: [0xff8a30, 0x3a2a20], smin: 40, smax: 160 }); sfx('fire', { x: this.x, y: this.y, vol: .4 }); aoe({ x: this.x, y: b.arena.floor, w: 60, h: 26, delay: 0, dur: 2.5, dmg: b.dmg(10), type: 'fire', color: 0xff6a20, owner: b, lightC: 0xff6a20, draw(c, A) { c.globalAlpha = clamp((A.delay + A.dur - A.t) / .5, 0, 1) * .8; c.fillStyle = '#ff7a30'; for (let k = 0; k < 5; k++) { const fx = A.x - 26 + k * 13, fh = 10 + Math.sin(G.t * 12 + k * 2) * 6; c.beginPath(); c.moveTo(fx - 6, A.y); c.quadraticCurveTo(fx, A.y - fh * 2, fx + 6, A.y); c.fill(); } } }); }; } }]] },
      { id: 'stomp', w: 1.5, rng: [0, 900], dur: 1.8, cool: 5, ev: [[0, b => { b.setPose('cast', .5); voxCry('hilde', 'atk'); }], [.5, b => { shake(10); synth('boom', 1); sfx('cavein', at(b, .8)); aoe({ x: b.x, y: b.y, w: 140, h: 30, delay: 0, dur: .12, dmg: b.dmg(18), owner: b, kby: -420 }); bRain(b, 8, { color: 0xb09070, dmg: 16, w: 30, type: 'phys', snd: 'crumble', stagger: .12, delay: .9 }); }]] },
      seq('combo3', [{ w: .7, hit: { ox: 60, oy: -60, w: 110, h: 80, dmg: 24, len: 90, wid: 18, ang: .7, color: 0xffc070 }, lunge: 120, r: .2 }, { w: .45, hit: { ox: 60, oy: -40, w: 120, h: 60, dmg: 24, len: 90, wid: 18, ang: -.6, color: 0xffc070 }, lunge: 120, r: .25 }, { w: .7, teleC: 0xffa050, hit: { ox: 66, oy: -40, w: 90, h: 90, dmg: 30, len: 90, wid: 22, ang: 1.1, color: 0xffc070, snd: 'hit_mace' }, lunge: 80, fn: b => { shake(8); synth('boom', .9); for (const s of [-1, 1]) bWave(b, s, { off: 70, dmg: 16, speed: 300, color: 0xff8a30, h: 22, type: 'fire' }); } }], { w: 2, rng: [0, 160], cool: 3 }),
    ] },
    { hp: 1500, title: 'A Fornalha Desperta', line: 'Sentes o calor? Era isto que sentia a minha rainha. Era isto, todos os dias!', speed: 1.1, dmgMul: 1.15, aggr: .8,
      trans: { dur: 2.6, start(b) { b.setPose('cast', .8); voxCry('hilde', 'big', { vol: 1 }); sfx('flame_big', at(b, 1)); after(1, () => { for (let i = 0; i < 6; i++) bPillar(b, b.arena.x0 + 50 + i * (b.arena.x1 - b.arena.x0 - 100) / 5, { delay: .5 + i * .1, color: 0xff7a30, type: 'fire', dmg: 18, snd: 'flame_big', w: 34 }); shake(8); }); } },
      moves: [
        seq('slam', [{ w: .75, teleY: -1.05, teleC: 0xffa050, hit: { ox: 70, oy: -40, w: 90, h: 90, dmg: 30, len: 90, wid: 20, ang: 1, color: 0xffc070, snd: 'hit_mace' }, lunge: 60, fn: b => { shake(9); synth('boom', 1); for (const s of [-1, 1]) bWave(b, s, { off: 90, dmg: 20, speed: 340, color: 0xff8a30, h: 30, type: 'fire' }); } }], { w: 2.5, rng: [0, 170] }),
        { id: 'erupt', w: 2, rng: [0, 900], dur: 2.2, cool: 4, ev: [[0, b => { b.setPose('cast', .5); sfx('rumble', at(b, .8)); }], [.4, (b, p) => { const dir = Math.sign(p.x - b.x) || 1; for (let i = 0; i < 7; i++) bPillar(b, b.x + dir * (70 + i * 60), { delay: .55 + i * .12, color: 0xff7a30, type: 'fire', dmg: 20, snd: 'fireball', w: 40 }); }]] },
        { id: 'anvil', w: 1.6, rng: [100, 900], dur: 2, cool: 5, ev: [[0, b => { b.setPose('wind', .5); bTele(b, 0, -1.1, 0xffa050); voxCry('hilde', 'atk'); }], [.45, (b, p) => b.leapTo(p.x, 300, .9, b => { shake(12); synth('boom', 1); sfx('quake', at(b, 1)); UI.flash(.25); aoe({ x: b.x, y: b.y, w: 160, h: 70, delay: 0, dur: .12, dmg: b.dmg(32), owner: b, kby: -460 }); for (const s of [-1, 1]) bWave(b, s, { off: 60, dmg: 20, speed: 360, color: 0xff8a30, h: 30, type: 'fire' }); b.setPose('swing', .2); })]] },
        seq('combo3', [{ w: .6, hit: { ox: 60, oy: -60, w: 110, h: 80, dmg: 24, len: 90, wid: 18, ang: .7, color: 0xffc070 }, lunge: 140, r: .16 }, { w: .38, hit: { ox: 60, oy: -40, w: 120, h: 60, dmg: 24, len: 90, wid: 18, ang: -.6, color: 0xffc070 }, lunge: 140, r: .2 }, { w: .55, teleC: 0xffa050, hit: { ox: 66, oy: -40, w: 90, h: 90, dmg: 30, len: 90, wid: 22, ang: 1.1, color: 0xffc070, snd: 'hit_mace' }, lunge: 80, fn: b => { shake(8); synth('boom', .9); for (let i = 0; i < 3; i++) bPillar(b, b.x + b.face * (90 + i * 60), { delay: .3 + i * .1, color: 0xff7a30, type: 'fire', dmg: 18, w: 34, snd: 'fireball' }); } }], { w: 2.4, rng: [0, 160] }),
        { id: 'slag', w: 1.2, rng: [80, 900], dur: 1.4, cool: 3, ev: [[0, b => b.setPose('wind', .5)], [.5, (b, p) => { b.setPose('swing', .2); sfx('throw', at(b, .8)); for (let i = 0; i < 5; i++) { const tx = p.x + (i - 2) * 70, dx = tx - b.x, tt = .9; const pr = new Proj({ x: b.x + b.face * 30, y: b.y - 90, vx: dx / tt, vy: -420, grav: (2 * ((b.arena.floor - 10) - (b.y - 90) + 420 * tt)) / (tt * tt), r: 7, dmg: b.dmg(14), team: 'enemy', owner: b, color: 0xff7a30, kind: 'orb', life: 3, trail: true, type: 'fire', wall: true }); pr.onDie = function () { burst(this.x, this.y, 14, { color: [0xff8a30, 0x3a2a20], smin: 40, smax: 160 }); }; } }]] },
        seq('sweep', [{ w: .55, teleY: -.2, teleC: 0xffa050, hit: { ox: 60, oy: -6, w: 170, h: 30, dmg: 24, len: 120, wid: 14, color: 0xffc070, flat: true, kby: -400 }, lunge: 100 }], { w: 1.6, rng: [0, 170] }),
      ] },
  ],
  draw(c, b, t) {
    const ang = bAng(b, 1.1, -2.4, 1.3), bob = Math.abs(b.vx) > 10 ? Math.abs(Math.sin(b.walkPh)) * 2.5 : Math.sin(t * 1.2) * 1, P2 = b.phase > 0;
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 22); c.rotate(.12); }
    legs(c, { walkPh: b.walkPh, vx: b.vx }, 14, 30, 0x2a1c14, 12);
    c.translate(0, -bob);
    // saia/avental de couro
    c.fillStyle = col(0x4a3020); c.beginPath(); c.moveTo(-26, -66); c.lineTo(26, -66); c.lineTo(32, -24); c.lineTo(-32, -24); c.fill();
    c.fillStyle = col(0x6a4a30); c.beginPath(); c.moveTo(-8, -64); c.lineTo(20, -64); c.lineTo(24, -20); c.lineTo(-4, -20); c.fill();
    // tronco largo
    c.fillStyle = col(0x5a3a2a); c.beginPath(); c.moveTo(-28, -64); c.quadraticCurveTo(-34, -96, -18, -102); c.lineTo(20, -102); c.quadraticCurveTo(34, -96, 28, -64); c.fill();
    // fissuras incandescentes no corpo
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = col(0xff8a30, .55 + Math.sin(t * 5) * .2 + (P2 ? .3 : 0)); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-12, -96); c.lineTo(-6, -84); c.lineTo(-14, -74); c.moveTo(10, -98); c.lineTo(6, -86); c.lineTo(14, -76); c.lineTo(8, -68); c.stroke(); if (P2) c.drawImage(glowSpr(0xff6a20), -50, -130, 100, 100); c.restore();
    c.fillStyle = col(0x3a2a1c); c.fillRect(-26, -70, 52, 6); c.fillStyle = col(0x8a6a3a); c.fillRect(-4, -70, 8, 6);
    // braço de trás
    c.fillStyle = col(0x4a3022); ell(c, -22, -86, 10, 13);
    // cabeça com máscara de forja
    c.fillStyle = col(0x2a1c14); ell(c, 4, -110, 14, 13); c.fillStyle = col(0x6a6a70); c.beginPath(); c.moveTo(-6, -122); c.quadraticCurveTo(6, -128, 18, -118); c.lineTo(18, -100); c.lineTo(-4, -100); c.fill();
    c.fillStyle = col(0x0a0808); c.fillRect(0, -114, 17, 4); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = col(0xffa040, .95); c.fillRect(2, -113, 13, 2); c.drawImage(glowSpr(0xff8a30), -4, -124, 26, 26); c.restore();
    c.fillStyle = col(0x3a2a1c); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-8 + i * 2, -116); c.quadraticCurveTo(-24 - i * 3, -112 + i * 5, -20 - i * 2, -90 + i * 3 + Math.sin(t * 2 + i) * 2); c.lineTo(-12 + i * 2, -104); c.fill(); }
    // braço da frente e martelo
    c.fillStyle = col(0x5a3a2a); ell(c, 22, -86, 11, 14);
    weapon(c, 'hammer', 26, -84, ang, 2.6, P2 ? 0xd88a5a : 0x8a8478);
    if (P2) { c.save(); c.translate(26, -84); c.rotate(ang); c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(0xff7a30), 50, -26, 52, 52); c.restore(); }
  },
};
// ==================================================== 8. BISPO OZIAS (Catedral, subchefe)
BOSSDEF.ozias = {
  name: 'Bispo Ozias', title: 'Pastor do Lume', speaker: 'Ozias', music: 'b_ozias', voice: 'ozias', sub: true, w: 26, h: 66, mass: 4, posture: 240, rim: 0xffe0a0, light: [170, 0xffe0a0, .6], keep: [150, 280], walk: 45, run: 90, hitSnd: 'hit_mace', dieSnd: 'old_die', resist: { holy: .6 },
  line: 'Ajoelha-te, filho. Eu disse ao rei que ela não ia sentir nada. Disse-o tantas vezes que comecei a acreditar.', deathLine: 'Deus... nunca esteve... no altar. Era só... o fogo...',
  reward: { cinzas: 4800, items: ['chave_sacristia', 'tal_vampiro', ['fragmento', 2]] }, blood: [0xfff0c0, 0xffffff], ash: 0xd8d0b0,
  phases: [
    { hp: 1250, until: .5, keep: [150, 280], moves: [
      { id: 'pillars', w: 3, rng: [0, 900], dur: 1.5, ev: [[0, b => { b.setPose('cast', .6); voxSay('ozias', 3, { vol: .6 }); sfx('holy1', at(b, .6)); }], [.4, (b, p) => { for (let i = -1; i <= 1; i++) bPillar(b, p.x + i * 64, { delay: .85 + Math.abs(i) * .15, dmg: 20, w: 36 }); }]] },
      { id: 'censer', w: 2, rng: [0, 900], dur: 1.4, cool: 3, ev: [[0, b => { b.setPose('cast', .5); sfx('holy2', at(b, .5)); }], [.55, b => { for (let i = 0; i < 3; i++) { const a = -HPI + (i - 1) * .7; const pr = bOrb(b, b.x + b.face * 16, b.y - 50, Math.cos(a) * 160, Math.sin(a) * 160, { color: 0xffe0a0, dmg: 14, homing: 1.4, life: 4.5, type: 'holy', light: true }); pr.target = PLAYER; } }]] },
      { id: 'sermon', w: 1.6, rng: [0, 300], dur: 1.8, cool: 4, ev: [[0, b => { b.setPose('cast', .7); sfx('holy3', at(b, .6)); bTele(b, 0, -.8, 0xffe0a0); }], [.7, b => { bRing(b, 12, 150, { color: 0xffe0a0, dmg: 13, type: 'holy', life: 5 }); ringFx(b.x, b.cy, 10, 110, 0xffe0a0, .5, 5); }]] },
      { id: 'tele', w: 2, rng: [0, 110], dur: .9, cool: 3, ev: [[0, b => b.setPose('cast', .3)], [.3, (b, p) => { const tx = p.x < (b.arena.x0 + b.arena.x1) / 2 ? b.arena.x1 - 70 : b.arena.x0 + 70; b.teleport(tx, undefined, 0xffe0a0); }], [.55, b => bRing(b, 8, 120, { color: 0xffe0a0, dmg: 12, type: 'holy', life: 4 })]] },
      seq('staff', [{ w: .5, teleC: 0xffe0a0, hit: { ox: 34, oy: -40, w: 60, h: 50, dmg: 18, color: 0xffe0a0, kb: 420 }, lunge: 120 }], { w: 1.5, rng: [0, 80] }),
    ] },
    { hp: 1250, title: 'O Sermão Final', line: 'Então ouve o sermão inteiro. Ouve o que eu disse à rainha antes do fogo.', speed: 1.1, dmgMul: 1.12, aggr: .8,
      trans: { dur: 2.4, start(b) { b.setPose('cast', 1); voxCry('ozias', 'big', { vol: 1 }); sfx('holy3', at(b, 1)); after(1, () => { bRing(b, 18, 150, { color: 0xffe0a0, dmg: 12, type: 'holy', life: 6 }); UI.flash(.3); }); } },
      moves: [
        { id: 'beam', w: 2, rng: [0, 900], dur: 2.8, cool: 5, ev: [[0, b => { b.setPose('cast', 1); sfx('charge', at(b, .7)); voxSay('ozias', 4, { vol: .6 }); }], [.5, (b, p) => { const dir = Math.sign(p.x - b.x) || 1, n = 9; for (let i = 0; i < n; i++) bPillar(b, b.x + dir * (60 + i * 52), { delay: .7 + i * .11, dmg: 22, w: 46, snd: i % 3 ? 'holy2' : 'holy3' }); }]] },
        { id: 'pillars', w: 2.5, rng: [0, 900], dur: 1.6, ev: [[0, b => { b.setPose('cast', .5); sfx('holy1', at(b, .6)); }], [.35, (b, p) => { for (let i = -2; i <= 2; i++) bPillar(b, p.x + i * 60, { delay: .8 + Math.abs(i) * .14, dmg: 20, w: 34 }); }]] },
        { id: 'censer', w: 2, rng: [0, 900], dur: 1.4, cool: 3, ev: [[0, b => b.setPose('cast', .5)], [.5, b => { for (let i = 0; i < 5; i++) { const a = -HPI + (i - 2) * .55; const pr = bOrb(b, b.x, b.y - 50, Math.cos(a) * 170, Math.sin(a) * 170, { color: 0xffe0a0, dmg: 13, homing: 1.5, life: 4.5, type: 'holy', light: true }); pr.target = PLAYER; } sfx('holy2', at(b, .6)); }]] },
        { id: 'sermon2', w: 1.5, rng: [0, 320], dur: 2, cool: 4, ev: [[0, b => { b.setPose('cast', .6); bTele(b, 0, -.8, 0xffe0a0); }], [.6, b => bRing(b, 12, 150, { color: 0xffe0a0, dmg: 13, type: 'holy', life: 5 })], [1.05, b => bRing(b, 12, 180, { color: 0xffe0a0, dmg: 13, type: 'holy', life: 5, off: .26 })]] },
        { id: 'clergy', w: 1, rng: [0, 900], dur: 1.4, cool: 16, cond: b => b.adds.filter(a => a.alive).length < 1, ev: [[0, b => { b.setPose('cast', .6); voxSay('ozias', 3); }], [.7, b => bSummon(b, 'clerigo', b.x - b.face * 120)]] },
        { id: 'tele', w: 2, rng: [0, 120], dur: .9, cool: 2.5, ev: [[0, b => b.setPose('cast', .25)], [.25, (b, p) => { const tx = p.x < (b.arena.x0 + b.arena.x1) / 2 ? b.arena.x1 - 70 : b.arena.x0 + 70; b.teleport(tx, undefined, 0xffe0a0); bPillar(b, p.x, { delay: .7, dmg: 18, w: 36 }); }]] },
      ] },
  ],
  draw(c, b, t) {
    const ang = b.pose === 'cast' ? -1.2 - b.pk * .3 : bAng(b, -.9, -2.2, .6);
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 12); c.rotate(.15); }
    drawHum(c, { walkPh: b.walkPh, vx: b.vx, ph: b.ph, move: null }, { w: 30, h: 66, robe: true, body: 0xe8e0cc, body2: 0xc8a040, belt: 0x8a2020, mask: { c: 0xe8c860, shape: 'long', eye: 0xfff0c0 }, ms: 1.2, weapon: 'scepter', wc: 0xc8a040, ang, ws: 1.4, neck: 2,
      extraHead: (cc, hx, hy) => { cc.fillStyle = col(0xf0e8d8); cc.beginPath(); cc.moveTo(hx - 8, hy - 7); cc.lineTo(hx - 4, hy - 26); cc.quadraticCurveTo(hx + 1, hy - 30, hx + 6, hy - 26); cc.lineTo(hx + 9, hy - 7); cc.fill(); cc.fillStyle = col(0xc8a040); cc.fillRect(hx - .8, hy - 24, 1.6, 15); cc.fillRect(hx - 5, hy - 18, 10, 1.6); },
      extra: (cc, H) => { cc.fillStyle = col(0xc8a040); cc.fillRect(-2, -H * .76, 4, H * .7); if (b.pose === 'cast') { cc.save(); cc.globalCompositeOperation = 'lighter'; cc.globalAlpha = .7 * b.pk; cc.drawImage(glowSpr(0xffe0a0), 4, -H * 1.3, 50, 50); cc.restore(); } } });
  },
};
// ==================================================== 9. ALDRIC, O REI APAGADO (Catedral, trono)
BOSSDEF.aldric = {
  name: 'Aldric, o Rei Apagado', title: 'Senhor de Vesperal', speaker: 'Aldric', music: 'b_aldric', voice: 'aldric', w: 34, h: 80, mass: 8, posture: 420, rim: 0xe0c080, light: [160, 0xe0a060, .5], keep: [70, 140], walk: 70, run: 170, hitSnd: 'hit_sword', dieSnd: 'm_die', step: 'step3', stepRate: .7, stepVol: .45,
  line: 'Partiste a minha cortina. Vieste ver o que está por trás? Nada. Eu sei. Fui eu que a pus lá.', deathLine: 'Seraphine... perdoa-me... eu só... não queria ficar no escuro sem ti...',
  reward: { cinzas: 7000, items: ['brasa_rei', 'w_montante', ['fragmento', 2]] }, blood: [0x2a1a2a, 0xe0c080], ash: 0x3a3040,
  tick(b, dt) { if (b.phase > 0 && b.alive && Math.random() < dt * 30) part({ x: b.x + rnd(-14, 14), y: b.y - rnd(0, 80), vx: rnd(-10, 10), vy: rnd(-80, -30), life: rnd(.4, .9), s: rnd(2, 4), s1: .5, color: pick([0x1a0a20, 0x2a1030, 0x4a1a3a]), glow: false, a: .8 }); if (b.phase > 0) light(b.x, b.cy, 120, 0x8a3aff, .5, .15); },
  phases: [
    { hp: 1700, until: .5, keep: [70, 150], moves: [
      seq('combo3', [{ w: .55, hit: { ox: 50, oy: -46, w: 96, h: 60, dmg: 24, len: 90, wid: 16, ang: .5, color: 0xffe8c0 }, lunge: 220, r: .18 }, { w: .35, hit: { ox: 50, oy: -40, w: 100, h: 50, dmg: 22, len: 90, wid: 16, ang: -.4, color: 0xffe8c0 }, lunge: 200, r: .2 }, { w: .6, hit: { ox: 54, oy: -40, w: 90, h: 80, dmg: 30, len: 100, wid: 20, ang: 1, color: 0xffe8c0, snd: 'metal1' }, lunge: 160, fn: b => shake(5) }], { w: 3, rng: [0, 150] }),
      seq('delayed', [{ w: 1.15, teleY: -1.1, hit: { ox: 54, oy: -40, w: 90, h: 90, dmg: 34, len: 100, wid: 22, ang: 1.1, color: 0xffe8c0, snd: 'metal2' }, lunge: 120, fn: b => { shake(7); synth('boom', .6); } }], { w: 2, rng: [0, 160] }),
      seq('lunge', [{ w: .6, pose: 'thrust', hit: { ox: 60, oy: -46, w: 110, h: 24, dmg: 26, fx: false }, lunge: 560, lungeT: .2, fn: b => lineFx(b.x, b.y - 46, b.x + b.face * 160, b.y - 46, 0xffe8c0, 4, .2) }], { w: 2, rng: [150, 500], cool: 2 }),
      seq('firewave', [{ w: .7, teleC: 0xffa050, hit: { ox: 50, oy: -40, w: 80, h: 80, dmg: 24, len: 90, wid: 18, ang: 1, color: 0xffa050, type: 'fire' }, lunge: 60, fn: b => { synth('boom', .6); bWave(b, b.face, { off: 60, dmg: 22, speed: 360, color: 0xff8a30, h: 30, type: 'fire' }); } }], { w: 2, rng: [100, 700], cool: 3 }),
      { id: 'spin', w: 1.5, rng: [0, 140], dur: 1.6, cool: 4, ev: [[0, b => { b.setPose('wind', .5); bTele(b, 0, -.6, 0xffe8c0); }], [.55, b => { b.setPose('swing', .15); sfx('whoosh3', at(b, .8)); }], [.6, b => { bHit(b, { ox: 0, oy: -40, w: 170, h: 70, dmg: 22, len: 90, wid: 16, ang: 0, color: 0xffe8c0, flat: true }); slashFx(b.x, b.y - 40, -b.face, 0, 90, 16, 0xffe8c0, .16, { alpha: .8, flat: true }); }], [.85, b => { bHit(b, { ox: 0, oy: -40, w: 170, h: 70, dmg: 22, len: 90, wid: 16, ang: 0, color: 0xffe8c0, flat: true }); slashFx(b.x, b.y - 40, -b.face, 0, 90, 16, 0xffe8c0, .16, { alpha: .8, flat: true }); }], [1.1, b => b.setPose('rec', .4)]] },
      seq('kick', [{ w: .32, hit: { ox: 26, oy: -20, w: 40, h: 30, dmg: 14, kb: 520, fx: false, snd: 'hit_club' }, lunge: 200, lungeT: .1 }], { w: 1.2, rng: [0, 55] }),
    ] },
    { hp: 1700, title: 'A Chama Negra', line: 'Se o Lume não é meu, então que arda negro. Que arda tudo!', speed: 1.12, dmgMul: 1.15, aggr: .7,
      trans: { dur: 2.6, start(b) { b.setPose('cast', .8); voxCry('aldric', 'big', { vol: 1 }); sfx('dark_big', at(b, 1)); after(1, () => { ringFx(b.x, b.cy, 10, 160, 0x8a3aff, .6, 6); bRing(b, 16, 170, { color: 0x9a4aff, dmg: 13, life: 5 }); UI.flash(.3); shake(8); }); } },
      moves: [
        seq('combo5', [{ w: .5, hit: { ox: 50, oy: -46, w: 96, h: 60, dmg: 22, len: 90, wid: 16, ang: .5, color: 0xc8a0ff }, lunge: 240, r: .12 }, { w: .26, tele: false, hit: { ox: 50, oy: -40, w: 100, h: 50, dmg: 20, len: 90, wid: 16, ang: -.4, color: 0xc8a0ff }, lunge: 200, r: .12 }, { w: .3, tele: false, hit: { ox: 50, oy: -46, w: 96, h: 60, dmg: 20, len: 90, wid: 16, ang: .5, color: 0xc8a0ff }, lunge: 200, r: .14 }, { w: .26, tele: false, hit: { ox: 50, oy: -40, w: 100, h: 50, dmg: 20, len: 90, wid: 16, ang: -.4, color: 0xc8a0ff }, lunge: 200, r: .2 }, { w: .6, teleC: 0x9a4aff, hit: { ox: 54, oy: -40, w: 90, h: 90, dmg: 30, len: 100, wid: 22, ang: 1, color: 0xc8a0ff }, lunge: 140, fn: b => { shake(6); for (let i = 0; i < 3; i++) bPillar(b, b.x + b.face * (80 + i * 60), { delay: .25 + i * .1, color: 0x9a4aff, type: 'fire', dmg: 18, w: 32, snd: 'dark' }); } }], { w: 3, rng: [0, 150] }),
        { id: 'shadow', w: 2, rng: [0, 900], dur: 1.3, cool: 3, ev: [[0, b => { b.setPose('cast', .3); sfx('dark', at(b, .7)); }], [.3, (b, p) => { b.teleport(p.x - (p.face || 1) * 80, undefined, 0x8a3aff); b.face = Math.sign(p.x - b.x) || 1; }], [.5, b => { b.setPose('wind', .3); bTele(b, 20, -.8, 0xc8a0ff); }], [.8, b => { b.setPose('swing', .15); bHit(b, { ox: 50, oy: -44, w: 100, h: 70, dmg: 26, len: 90, wid: 18, ang: .7, color: 0xc8a0ff }); }], [1, b => b.setPose('rec', .3)]] },
        { id: 'flamering', w: 1.5, rng: [0, 260], dur: 2, cool: 4, ev: [[0, b => { b.setPose('cast', .7); sfx('dark_big', at(b, .7)); }], [.3, b => aoe({ x: b.x, y: b.cy, r: 110, shape: 'circle', delay: .75, dur: .15, dmg: b.dmg(28), color: 0x9a4aff, owner: b, type: 'fire', onFire: a => { shake(7); synth('boom', .8); ringFx(a.x, a.y, 10, 130, 0x9a4aff, .4, 6); } })], [1.1, b => bRing(b, 12, 160, { color: 0x9a4aff, dmg: 13, life: 4 })]] },
        { id: 'embers', w: 1.5, rng: [0, 900], dur: 1.8, cool: 5, ev: [[0, b => { b.setPose('cast', .6); voxCry('aldric', 'atk'); }], [.5, b => bRain(b, 10, { color: 0x9a4aff, dmg: 18, w: 30, type: 'fire', snd: 'dark', stagger: .1 })]] },
        seq('lunge', [{ w: .5, pose: 'thrust', hit: { ox: 60, oy: -46, w: 110, h: 24, dmg: 26, fx: false }, lunge: 620, lungeT: .2, fn: b => { lineFx(b.x, b.y - 46, b.x + b.face * 180, b.y - 46, 0xc8a0ff, 5, .2); bWave(b, b.face, { off: 40, dmg: 18, speed: 380, color: 0x9a4aff, h: 26, type: 'fire' }); } }], { w: 2, rng: [150, 600], cool: 2 }),
        seq('delayed', [{ w: 1.25, teleY: -1.1, teleC: 0x9a4aff, hit: { ox: 54, oy: -40, w: 90, h: 90, dmg: 34, len: 100, wid: 22, ang: 1.1, color: 0xc8a0ff, snd: 'metal2' }, lunge: 120, fn: b => { shake(8); synth('boom', .8); for (const s of [-1, 1]) bWave(b, s, { off: 60, dmg: 18, speed: 320, color: 0x9a4aff, h: 26, type: 'fire' }); } }], { w: 1.5, rng: [0, 160] }),
      ] },
  ],
  draw(c, b, t) {
    const ang = bAng(b, .7, -2.3, 1.2), P2 = b.phase > 0;
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 16); c.rotate(.15); }
    if (P2) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .45 + Math.sin(t * 6) * .1; c.drawImage(glowSpr(0x6a2aff), -50, -110, 100, 120); c.restore(); }
    drawHum(c, { walkPh: b.walkPh, vx: b.vx, ph: b.ph, move: null }, { w: 34, h: 80, body: 0x1e1c24, body2: 0x3a3644, belt: 0xc8a040, pauldron: 0x5a5464, mask: { c: 0x8a8478, shape: 'helm', eye: P2 ? 0xb07aff : 0xffc070 }, ms: 1.45, crown: true, cape: P2 ? 0x2a1030 : 0x5a1a1a, weapon: 'greatsword', wc: P2 ? 0x6a4a8a : 0xd8d0c0, ws: 1.5, ang, legW: 7, legC: 0x141218, lean: b.pose === 'thrust' ? .2 : undefined,
      extra: (cc, H, a) => { if (P2) { cc.save(); cc.globalCompositeOperation = 'lighter'; const ax = 34 * .2 + Math.cos(a) * 9, ay = -H * .62 + Math.sin(a) * 9; cc.translate(ax, ay); cc.rotate(a); cc.globalAlpha = .7; for (let i = 0; i < 4; i++) cc.drawImage(glowSpr(0x8a3aff), 10 + i * 14, -9, 20, 18); cc.restore(); } } });
  },
};
// ==================================================== 10. SERAPHINE, A RAINHA DO LUME (Coração)
BOSSDEF.seraphine = {
  name: 'Seraphine, a Rainha do Lume', title: 'O Receptáculo', speaker: 'Seraphine', music: 'b_sera1', voice: 'seraphine', w: 28, h: 74, mass: 5, posture: 420, fly: true, rim: 0xfff0c0, light: [240, 0xfff0c0, .8], keep: [110, 220], walk: 80, run: 160, hitSnd: 'hit_sword', dieSnd: 'f_die3',
  line: 'Tu. Feito de cinza, como eu agora. Vieste devolver-me o que me tiraram? Ou vieste tirar o que resta?', deathLine: 'Obrigada... agora... escolhe tu. Eu já não consigo.',
  reward: { cinzas: 0, items: [] }, blood: [0xfff0c0, 0xffffff], ash: 0xe8dcc0,
  init(b) { b.alt = 0; b.altT = 0; },
  tick(b, dt) {
    const tgt = b.phase === 1 ? 64 : b.phase === 2 ? 20 : 0; b.altT = b.altT ?? 0; b.alt = damp(b.alt || 0, b.state === 'broken' ? 0 : tgt, 2.5, dt);
    if (!b.leap && b.alive && !(b.move && b.move.data.dive)) { const ty = b.arena.floor - b.alt + (b.phase ? Math.sin(G.t * 1.6) * 8 : 0); b.vy = (ty - b.y) * 6; }
    if (b.move && b.phase > 0 && !(b.move.lungeT > 0) && !b.move.data.dive) b.vx = approach(b.vx, 0, 500 * dt);
    if (b.phase === 1 && b.alive && Math.random() < dt * 40) part({ x: b.x - b.face * rnd(0, 40), y: b.y - rnd(30, 80), vx: rnd(-30, 30), vy: rnd(-90, -30), life: rnd(.3, .8), s: rnd(2, 4), s1: .3, color: pick([0xff8a30, 0xffc070, 0xfff0c0]), glow: true });
    if (b.phase === 2 && b.alive && Math.random() < dt * 30) part({ x: b.x + rnd(-16, 16), y: b.y - rnd(0, 70), vx: rnd(-10, 10), vy: rnd(-60, -20), life: rnd(.6, 1.4), s: rnd(1.5, 3), color: pick([0x8a847a, 0x5a5650, 0xff8a40]), glow: false, a: .8 });
  },
  locomotion(b, p, dt) { const d = Math.abs(p.x - b.x); if (b.phase === 1) { b.face = Math.sign(p.x - b.x) || b.face; const k = [140, 260]; let want = d < k[0] ? -b.face : d > k[1] ? b.face : 0; b.vx = approach(b.vx, want * 140, 400 * dt); } else b.walk(p, dt, d); },
  after() { after(2.5, () => GAME.finalChoice()); },
  phases: [
    // ---- I: a rainha santa
    { hp: 1300, next: 'bar', keep: [90, 200], music: 'b_sera1', moves: [
      seq('scepter', [{ w: .5, teleC: 0xfff0c0, hit: { ox: 46, oy: -46, w: 86, h: 60, dmg: 22, len: 80, wid: 14, ang: .5, color: 0xfff0c0, type: 'holy' }, lunge: 220, r: .14 }, { w: .3, hit: { ox: 46, oy: -40, w: 90, h: 50, dmg: 20, len: 80, wid: 14, ang: -.4, color: 0xfff0c0, type: 'holy' }, lunge: 200, r: .16 }, { w: .5, hit: { ox: 50, oy: -40, w: 80, h: 80, dmg: 26, len: 90, wid: 18, ang: 1, color: 0xfff0c0, type: 'holy' }, lunge: 140, fn: b => { bPillar(b, b.x + b.face * 100, { delay: .3, dmg: 20, w: 40 }); } }], { w: 3, rng: [0, 150] }),
      { id: 'march', w: 2, rng: [0, 900], dur: 2.2, cool: 3, ev: [[0, b => { b.setPose('cast', .6); sfx('holy1', at(b, .7)); voxSay('seraphine', 3, { vol: .6 }); }], [.4, (b, p) => { const dir = Math.sign(p.x - b.x) || 1; for (let i = 0; i < 8; i++) bPillar(b, b.x + dir * (60 + i * 56), { delay: .6 + i * .12, dmg: 20, w: 40 }); }]] },
      { id: 'orbs', w: 2, rng: [0, 900], dur: 1.4, ev: [[0, b => { b.setPose('cast', .5); }], [.5, b => { bFan(b, 7, 1.3, 230, { color: 0xfff0c0, dmg: 13, type: 'holy' }); sfx('holy2', at(b, .6)); }]] },
      { id: 'judgement', w: 1.5, rng: [0, 900], dur: 2.4, cool: 5, ev: [[0, b => { b.setPose('cast', 1); sfx('charge', at(b, .7)); voxCry('seraphine', 'atk'); }], [.3, (b, p) => { bPillar(b, p.x, { delay: 1.1, dmg: 32, w: 90, h: 400, snd: 'holy3', onFire: a => { shake(9); UI.flash(.3); bRing(b, 12, 170, { x: a.x, y: a.y - 30, color: 0xfff0c0, dmg: 12, type: 'holy', life: 4 }); } }); }]] },
      { id: 'blink', w: 1.5, rng: [0, 120], dur: 1, cool: 3, ev: [[0, b => b.setPose('cast', .3)], [.3, (b, p) => { const tx = p.x < (b.arena.x0 + b.arena.x1) / 2 ? b.arena.x1 - 90 : b.arena.x0 + 90; b.teleport(tx, undefined, 0xfff0c0); }], [.55, b => bFan(b, 5, .8, 240, { color: 0xfff0c0, dmg: 12, type: 'holy' })]] },
    ] },
    // ---- II: a chama despida (voa)
    { hp: 1400, next: 'bar', title: 'A Chama Despida', subtitle: 'O fogo lembra-se de tudo', music: 'b_sera2', speed: 1.05, keep: [140, 260], line: 'Queimou-me durante cem anos. Agora queima-te a ti, um bocadinho. Só um bocadinho.',
      trans: { dur: 3, start(b) { b.setPose('cast', 1.2); voxCry('seraphine', 'big', { vol: 1 }); sfx('flame_big', at(b, 1)); after(1.2, () => { ringFx(b.x, b.cy, 10, 200, 0xff8a30, .7, 7); bRing(b, 18, 170, { color: 0xff8a30, dmg: 12, type: 'fire', life: 5 }); UI.flash(.5); shake(8); }); } },
      moves: [
        { id: 'dive', w: 3, rng: [0, 900], dur: 1.8, cool: 1.5, ev: [[0, (b, p) => { b.setPose('wind', .5); bTele(b, 0, -.7, 0xff8a30); voxCry('seraphine', 'atk', { vol: .5 }); }], [.55, (b, p, mv) => { mv.data.dive = 1; const dx = p.x - b.x, dy = (p.cy) - b.cy, d = Math.hypot(dx, dy) || 1; mv.data.vx = dx / d * 620; mv.data.vy = dy / d * 620; b.face = Math.sign(dx) || b.face; sfx('whoosh3', at(b, .9)); b.setPose('swing', .2); }], [1.05, (b, p, mv) => { mv.data.dive = 0; b.setPose('rec', .5); }]], upd(b, p, dt, mv) { if (mv.data.dive) { b.vx = mv.data.vx; b.vy = mv.data.vy; if (b.y > b.arena.floor - 4) { b.y = b.arena.floor - 4; mv.data.vy = 0; } hitbox({ owner: b, team: 'enemy', ox: 0, oy: -40, w: 50, h: 70, life: dt * 1.5, dmg: b.dmg(24), kb: 320, type: 'fire' }); if (Math.random() < .8) part({ x: b.x, y: b.cy, vx: -b.vx * .2, vy: -b.vy * .2, life: .4, s: 4, s1: .5, color: 0xff8a30, glow: true }); } return true; } },
        { id: 'meteors', w: 2, rng: [0, 900], dur: 2, cool: 4, ev: [[0, b => { b.setPose('cast', .6); sfx('flame_big', at(b, .7)); }], [.5, b => bRain(b, 12, { color: 0xff7a30, dmg: 18, w: 34, type: 'fire', snd: 'fireball', stagger: .09 })]] },
        { id: 'tornado', w: 1.5, rng: [0, 900], dur: 1.6, cool: 6, ev: [[0, b => { b.setPose('cast', .6); sfx('fire', at(b, .8)); }], [.6, (b, p) => { for (const s of [-1, 1]) { const tor = new Proj({ x: b.x + s * 40, y: b.arena.floor - 50, vx: s * 90, vy: 0, r: 22, dmg: b.dmg(16), team: 'enemy', owner: b, color: 0xff8a30, pierce: true, life: 4.5, kind: 'tornado', type: 'fire', light: true }); tor.draw = function (c) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const yy = this.y + 40 - i * 14, rr = 8 + i * 3, a = G.t * 10 + i; c.globalAlpha = .55; c.fillStyle = i % 2 ? '#ff8a30' : '#ffc070'; c.beginPath(); c.ellipse(this.x + Math.sin(a) * 4, yy, rr, 4, 0, 0, TAU); c.fill(); } c.drawImage(glowSpr(0xff7a30), this.x - 40, this.y - 60, 80, 120); c.restore(); }; tor.tick = function (dt) { this.hit.clear(); if (this.x < b.arena.x0 + 20 || this.x > b.arena.x1 - 20) this.vx *= -1; this.y = b.arena.floor - 50; this.r = 22; }; } }]] },
        { id: 'beam', w: 1.5, rng: [0, 900], dur: 2.4, cool: 5, ev: [[0, b => { b.setPose('cast', 1); sfx('charge', at(b, .7)); synth('charge'); }], [.3, (b, p) => bLine(b, p.y - 16, { delay: 1, dmg: 26, h: 26, color: 0xff8a30, type: 'fire', snd: 'flame_big' })], [.9, (b, p) => bLine(b, b.arena.floor - 110, { delay: 1, dmg: 22, h: 20, color: 0xff8a30, type: 'fire', snd: 'flame_big' })]] },
        { id: 'feathers', w: 2, rng: [0, 900], dur: 1.6, ev: [[0, b => b.setPose('cast', .5)], [.45, b => { bFan(b, 9, 1.6, 240, { color: 0xffa040, dmg: 12, type: 'fire', kind: 'spear', r: 4 }); sfx('cast_fire', at(b, .6)); }], [.9, b => bFan(b, 8, 1.4, 270, { color: 0xffa040, dmg: 12, type: 'fire', kind: 'spear', r: 4 })]] },
      ] },
    // ---- III: cinza primordial (ecos de todos os chefes)
    { hp: 1500, title: 'Cinza Primordial', subtitle: 'Tudo o que ardeu, arde outra vez', music: 'b_sera3', speed: 1.08, dmgMul: 1.1, aggr: .75, keep: [90, 200], line: 'Eu sou todos eles agora. A Odile, a Brigid, a minha irmã, a minha filha, o meu marido. Somos cinza. Somos uma.',
      trans: { dur: 3.4, start(b) { b.setPose('cast', 1.5); voxCry('seraphine', 'big', { vol: 1 }); sfx('dark_big', at(b, 1)); UI.flash(.8); after(1.4, () => { shake(10); ringFx(b.x, b.cy, 10, 240, 0xe8dcc0, .8, 8); for (let i = 0; i < 6; i++) bStrike(b, b.arena.x0 + 60 + i * (b.arena.x1 - b.arena.x0 - 120) / 5, { delay: .5 + i * .08, dmg: 16, color: 0xe8dcc0 }); }); } },
      moves: [
        { id: 'e_odile', w: 1.5, rng: [0, 900], dur: 1.8, cool: 4, ev: [[0, b => { b.setPose('cast', .6); sfx('wail_long', at(b, .6)); }], [.6, b => bRing(b, 12, 130, { color: 0xc8d8ff, dmg: 13, life: 5 })], [1.1, b => bRing(b, 12, 160, { color: 0xc8d8ff, dmg: 13, life: 5, off: .26 })]] },
        { id: 'e_brigid', w: 1.5, rng: [0, 900], dur: 2, cool: 4, ev: [[0, b => { b.setPose('cast', .5); sfx('thunder', at(b, .6)); }], [.4, (b, p) => { for (let i = -2; i <= 2; i++) bStrike(b, p.x + i * 66, { delay: .6 + Math.abs(i) * .12, dmg: 20 }); }]] },
        { id: 'e_vesper', w: 1.2, rng: [0, 900], dur: 1.8, cool: 5, ev: [[0, b => { b.setPose('cast', .6); sfx('ink', at(b, .7)); }], [.3, b => { const ys = [b.arena.floor - 18, b.arena.floor - 70, b.arena.floor - 122]; const skip = rndi(0, 2); ys.forEach((y, i) => { if (i !== skip) bLine(b, y, { delay: .95, dmg: 18, color: 0xd0b0ff }); }); }]] },
        { id: 'e_selene', w: 1.2, rng: [0, 900], dur: 1.6, cool: 5, ev: [[0, b => { b.setPose('cast', .5); sfx('bow', at(b, .7)); }], [.6, b => bRain(b, 10, { color: 0xd8e0ff, dmg: 15, w: 26, type: 'phys', snd: 'crossbow', stagger: .08 })]] },
        { id: 'e_hilde', w: 1.2, rng: [0, 900], dur: 2, cool: 5, ev: [[0, b => { b.setPose('cast', .5); sfx('rumble', at(b, .7)); }], [.4, (b, p) => { const dir = Math.sign(p.x - b.x) || 1; for (let i = 0; i < 7; i++) bPillar(b, b.x + dir * (60 + i * 56), { delay: .55 + i * .1, color: 0xff7a30, type: 'fire', dmg: 20, snd: 'fireball', w: 40 }); }]] },
        seq('e_aldric', [{ w: .45, hit: { ox: 46, oy: -46, w: 90, h: 60, dmg: 22, len: 80, wid: 14, ang: .5, color: 0xc8a0ff }, lunge: 260, r: .1 }, { w: .24, tele: false, hit: { ox: 46, oy: -40, w: 90, h: 50, dmg: 20, len: 80, wid: 14, ang: -.4, color: 0xc8a0ff }, lunge: 220, r: .1 }, { w: .26, tele: false, hit: { ox: 46, oy: -46, w: 90, h: 60, dmg: 20, len: 80, wid: 14, ang: .5, color: 0xc8a0ff }, lunge: 220, r: .14 }, { w: .55, teleC: 0x9a4aff, hit: { ox: 50, oy: -40, w: 80, h: 80, dmg: 28, len: 90, wid: 18, ang: 1, color: 0xc8a0ff }, lunge: 140, fn: b => { for (const s of [-1, 1]) bWave(b, s, { off: 50, dmg: 18, speed: 340, color: 0x9a4aff, h: 26, type: 'fire' }); } }], { w: 2.5, rng: [0, 160] }),
        { id: 'eclipse', w: 1, rng: [0, 900], dur: 5, cool: 18, cond: b => b.hp < b.maxHp * .7, ev: [[0, b => { b.setPose('cast', 3.5); UI.subtitle('Seraphine', 'Olha. É assim que o mundo acaba quando ninguém arde por ele.', 3.5, 'seraphine'); sfx('dark_big', at(b, 1)); GAME.eclipse = 1; }], [.4, b => { b.teleport((b.arena.x0 + b.arena.x1) / 2, undefined, 0xe8dcc0); }], [1, (b, p) => { const n = 9, gap = rndi(1, n - 2), span = b.arena.x1 - b.arena.x0 - 60; for (let i = 0; i < n; i++) if (Math.abs(i - gap) > 0) bPillar(b, b.arena.x0 + 30 + (i + .5) * span / n, { delay: 1.6, dmg: 40, w: span / n, h: 420, color: 0xe8dcc0, type: 'fire', snd: 'flame_big' }); else { const gx = b.arena.x0 + 30 + (i + .5) * span / n, gw = span / n, gy = b.arena.floor; fx({ dur: 1.8, layer: 'add', draw(c, f, k) { c.globalAlpha = .35 + .35 * Math.sin(f.t * 12); c.fillStyle = '#c8ffd8'; c.fillRect(gx - gw / 2, gy - 3, gw, 3); c.globalAlpha *= .4; c.drawImage(glowSpr(0x80ffa0), gx - gw / 2, gy - 60, gw, 80); } }); } }], [2.8, b => { shake(12); UI.flash(.6); }], [3.2, b => { bRing(b, 20, 160, { color: 0xe8dcc0, dmg: 12, life: 6 }); }], [4.6, () => { GAME.eclipse = 0; }]] },
      ] },
  ],
  draw(c, b, t) {
    const ph = b.phase, ang = b.pose === 'cast' ? -1.3 - b.pk * .2 : bAng(b, -.6, -2.2, .9);
    const dress = ph === 2 ? 0x5a5650 : 0xf0e8d8, dress2 = ph === 2 ? 0x3a3630 : ph === 1 ? 0xffa040 : 0xd8c070;
    if (b.state === 'broken' || b.state === 'dead') { c.translate(0, 10); c.rotate(.12); }
    // asas de fogo
    if (ph === 1 && b.alive) { c.save(); c.globalCompositeOperation = 'lighter'; const flap = Math.sin(t * 5) * .25; for (const s of [1, -1]) { c.save(); c.translate(-4, -54); c.scale(s === 1 ? 1 : -.6, 1); c.rotate(-.4 + flap * s); for (let i = 0; i < 6; i++) { c.globalAlpha = .5 - i * .05; c.fillStyle = i % 2 ? '#ff8a30' : '#ffc070'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-30 - i * 8, -40 + i * 10, -70 - i * 6, -20 + i * 16); c.quadraticCurveTo(-40, -4 + i * 4, 0, 6); c.fill(); } c.restore(); } c.drawImage(glowSpr(0xff8a30), -70, -120, 140, 140); c.restore(); }
    // halo
    if (ph === 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = col(0xfff0c0, .8); c.lineWidth = 2; c.beginPath(); c.ellipse(2, -84, 12, 4, 0, 0, TAU); c.stroke(); c.drawImage(glowSpr(0xfff0c0), -22, -108, 48, 48); c.restore(); }
    // vestido longo
    c.fillStyle = col(dress); c.beginPath(); c.moveTo(-10, -56); c.lineTo(12, -56); c.quadraticCurveTo(22, -24, 28, 0); for (let i = 0; i <= 8; i++) c.lineTo(28 - i * 7, Math.sin(t * 2.5 + i) * 2 + (i % 2 ? -3 : 0)); c.quadraticCurveTo(-22, -24, -10, -56); c.fill();
    c.fillStyle = col(dress2); c.beginPath(); c.moveTo(2, -54); c.quadraticCurveTo(12, -24, 16, 0); c.lineTo(8, 0); c.quadraticCurveTo(6, -24, -2, -54); c.fill();
    c.fillStyle = col(dress); c.beginPath(); c.moveTo(-10, -56); c.quadraticCurveTo(-12, -70, 0, -72); c.quadraticCurveTo(14, -70, 12, -56); c.fill();
    if (ph === 2) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = col(0xff8a40, .6 + Math.sin(t * 8) * .3); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-4, -66); c.lineTo(2, -50); c.lineTo(-6, -36); c.lineTo(4, -20); c.moveTo(10, -60); c.lineTo(6, -44); c.lineTo(14, -30); c.stroke(); c.restore(); }
    // cabelo/véu
    c.fillStyle = col(ph === 2 ? 0x3a3630 : 0xe8d8a8); c.beginPath(); c.moveTo(-6, -84); c.quadraticCurveTo(-18, -70, -16, -46 + Math.sin(t * 2) * 2); c.lineTo(-6, -60); c.fill();
    drawMask(c, 3, -78, 1.25, { c: ph === 2 ? 0x8a847a : 0xf0d890, shape: 'long', eye: ph === 2 ? 0xff6a2a : ph === 1 ? 0xffc070 : 0xffffff });
    if (ph < 2) { c.fillStyle = col(0xd8b04a); for (let i = -2; i <= 2; i++) poly(c, [3 + i * 3 - 1.4, -88, 3 + i * 3, -95 - (i % 2 ? 0 : 3), 3 + i * 3 + 1.4, -88]); }
    // cetro
    c.fillStyle = col(dress); ell(c, 10, -62, 3.5, 4); weapon(c, 'scepter', 12, -60, ang, 1.5, 0xd8b04a);
    c.save(); c.translate(12, -60); c.rotate(ang); c.globalCompositeOperation = 'lighter'; c.drawImage(glowSpr(ph === 2 ? 0xff6a2a : ph === 1 ? 0xff8a30 : 0xfff0c0), 24, -14, 28, 28); c.restore();
  },
};
