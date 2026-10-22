// ===================== CHEFES (1–4) =====================
const BA = {
  sl: o => Object.assign({ wind: .6, act: .18, rec: .6, psi: -10, th0: -125, th1: 80, r: .75, mvA: 2.5, track: 4, poise: 40, dmg: 120, body: { twist: .6, lean: .3 } }, o),
  sr: o => Object.assign({ wind: .5, act: .18, rec: .6, psi: 15, th0: 90, th1: -115, r: .75, mvA: 2.5, track: 4, poise: 40, dmg: 120, body: { twist: .6, lean: .3 } }, o),
  ov: o => Object.assign({ wind: .8, act: .2, rec: .75, psi: 90, th0: 140, th1: -45, r: .75, mvA: 3, track: 3.5, poise: 60, dmg: 160, body: { twist: .15, lean: .55, lunge: 1, rear: 1 } }, o),
  th: o => Object.assign({ kind: 'thrust', wind: .55, act: .18, rec: .6, from: [-.2, 1.3, -.2], to: [-.1, 1.35, 1.15], mvA: 5, track: 5, poise: 45, dmg: 130, body: { twist: .3, lean: .35, lunge: 1 } }, o),
  sw: o => Object.assign({ wind: .8, act: .3, rec: .7, psi: 0, th0: -180, th1: 180, r: .85, lin: true, mvA: 1, track: 3, poise: 50, dmg: 140, body: { twist: 1, lean: .2, spin: 1 } }, o),
};
const BOSSDEF = {};
// ============ 1. IRMÃ ODILE, A CARPIDEIRA ============
BOSSDEF.odile = {
  name: 'Irmã Odile, a Carpideira', title: 'Ordem do Véu', speaker: 'Odile', music: 'b_odile', r: .7, h: 2.5, mass: 5, walk: 1.5, run: 3.6, keep: [2.5, 4.5], posture: 260, rim: 0x9fb8c8,
  line: 'Dorme... dorme, criança. Eu canto por ti.', deathLine: 'O cântico... acabou. Finalmente... silêncio.',
  voices: { hurt: ['f_hit2', 'f_hit3'], die: ['f_die2'], wail: ['wail_long'], stagger: ['f_hit1'] }, voiceOpt: { pitch: .9, rate: .78 },
  weapon: 'claw', hold: { hand: [-.3, 1.15, .25], blade: [0, -1, .2], edge: [0, 0, 1] },
  build: () => buildHumanoid({ s: 1.38, female: true, mats: { skin: MAT('bone'), body: MAT('cloth_dark'), arms: MAT('cloth_dark'), legs: MAT('cloth_dark'), boots: MAT('cloth_dark'), veil: MAT('cloth_dark') }, head: 'veil', mask: MAT('bone'), skirt: { len: 1.05, r1: .66, mat: MAT('cloth_dark'), flare: .06 }, cape: { mat: MAT('cloth_white'), len: .8, w: .4 } }),
  init(b) {
    b.chain = new Chain(10, .29, .99); b.links = [];
    const lm = MAT('iron'); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .29, 4), lm); m.castShadow = true; R.scene.add(m); b.links.push(m); }
    const cen = new THREE.Group(); cen.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .32, 8), MAT('bronze'))); const top = new THREE.Mesh(new THREE.ConeGeometry(.18, .22, 8), MAT('bronze')); top.position.y = .26; cen.add(top);
    cen.children.forEach(c => c.castShadow = true); R.scene.add(cen); b.censer = cen; b.cenFlame = flame(cen, 0, -.05, 0, .6, 0xa0ffd0); b.cenFlame.on = false;
    b.cenLight = addLight(0, 0, 0, 0x9adfc0, 1.2, 5); b.chainInit = false;
  },
  intro(b) { b.anim.play(CLIP.kneel); sfx('wail_sml', { pos: b.pos, vol: .8 }); after(1.4, () => { b.anim.stop(.6); b.anim.play(CLIP.roar); sfx('wail_long', { pos: b.pos, vol: 1 }); }); },
  tick(b, dt) {
    const hand = b.handW('R'); if (!b.chainInit) { b.chain.reset(hand); b.chainInit = true; }
    const a = b.atk, act = a && (a.phase === 'act' || (a.phase === 'wind' && a.t > a.def.wind * .7));
    b.chain.step(hand, dt);
    if (act || b.spinning) { // corrente rígida durante o golpe
      const dir = b.spinning ? _v1.set(Math.sin(b.yaw + HPI), -.05, Math.cos(b.yaw + HPI)) : _v1.copy(b.curT).sub(b.curB).normalize();
      for (let i = 1; i < b.chain.n; i++) { const tgt = _v2.copy(hand).addScaledVector(dir, i * b.chain.L); b.chain.p[i].lerp(tgt, b.spinning ? .5 : .28); }
    }
    for (let i = 0; i < 9; i++) { const A = b.chain.p[i], B = b.chain.p[i + 1], m = b.links[i]; m.position.lerpVectors(A, B, .5); _v3.subVectors(B, A).normalize(); m.quaternion.setFromUnitVectors(UP, _v3); }
    const end = b.chain.p[b.chain.n - 1]; b.censer.position.copy(end); b.cenLight.x = end.x; b.cenLight.y = end.y; b.cenLight.z = end.z;
    if (Math.random() < dt * (b.phase ? 30 : 10)) { if (b.phase) PFX.glow.emit(end.x, end.y + .1, end.z, rnd(-.3, .3), rnd(.5, 1.2), rnd(-.3, .3), rnd(.4, .8), rnd(.08, .15), .02, .6, 1, .85, .9, 1, -.5); else PFX.dust.emit(end.x, end.y + .2, end.z, rnd(-.2, .2), rnd(.3, .7), rnd(-.2, .2), rnd(1.5, 2.5), .15, .5, .6, .62, .6, .25, .5, -.1); }
    // acerto do incensário
    if (b.alive && ((a && a.phase === 'act' && !a.def.noCenser) || b.spinning)) {
      const p = PLAYER; b._cenHit = b._cenHit || 0;
      if (TIME.now > b._cenHit && sphereHits(end, .55, p)) { b._cenHit = TIME.now + .6; const r = p.takeHit({ dmg: Math.round((a ? a.def.dmg : 110) * (a && a.mul || 1) * b.dmgMul), poiseDmg: 40, type: b.phase ? 'fire' : 'phys', from: b, src: end, kb: 6, status: b.phase ? { burn: 2 } : null }); if (r && r !== 'dodge') { sfx('hit_flail', { pos: end, vol: .9 }); hitStop(.07); } }
    }
  },
  onVanish(b) { b.links.forEach(l => R.scene.remove(l)); R.scene.remove(b.censer); removeLight(b.cenLight); },
  arena: null,
  phases: [
    { hp: 1250, music: 'b_odile', keep: [2.5, 4.5],
      moves: [
        { id: 'swing', w: 3, rng: [0, 4.2], cd: 1, seq: [BA.sl({ wind: .8, act: .3, rec: .7, py: 1.45, r: .8, th0: -140, th1: 100, dmg: 105, noBlade: true })] },
        { id: 'swing2', w: 2.5, rng: [0, 4.2], cd: 2, seq: [BA.sl({ wind: .75, act: .3, rec: .35, py: 1.45, r: .8, th0: -140, th1: 100, dmg: 100, noBlade: true }), BA.sr({ wind: .4, act: .3, rec: .8, py: 1.45, r: .8, th0: 100, th1: -140, dmg: 100, noBlade: true })] },
        { id: 'slam', w: 2, rng: [0, 4.6], cd: 3, seq: [BA.ov({ wind: 1.05, act: .3, rec: .9, r: .8, dmg: 135, noBlade: true, events: [{ at: 'rec', fn: b => odileSlam(b) }] })] },
        { id: 'spin', w: 1.5, rng: [0, 3.6], cd: 6, turn: true, start(b, p, m) { b.anim.play(CLIP.roar); sfx('wail_sml', { pos: b.pos, vol: .7 }); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (m.t > .7 && m.t < 2.3) { b.spinning = true; b.yaw += dt * 9; if (Math.random() < dt * 6) sfx('whoosh2', { pos: b.pos, vol: .6, rate: .7 }); } else b.spinning = false; if (m.t > 3) { b.spinning = false; return 'done'; } } },
        { id: 'glide', w: 1.6, rng: [5, 16], cd: 4, punish: true, start(b, p, m) { m.data.ty = b.yawTo(p); sfx('wail_sml', { pos: b.pos, vol: .6, rate: 1.2 }); }, update(b, p, dt, m) { if (m.t < .5) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 6, dt); return; } if (!m.data.sw) { const sp = 9; b.vel.set(Math.sin(b.yaw) * sp, 0, Math.cos(b.yaw) * sp); b.turn(b.yawTo(p), 2, dt); if (Math.random() < dt * 30) burst(b.pos.x, b.pos.y + .2, b.pos.z, 1, { add: false, color: 0x2a2826, smin: .2, smax: .6, lmin: .5, lmax: 1, szmin: .3, szmax: .5, alpha: .4 }); if (b.dist(p) < 3.4 || m.t > 1.6) { m.data.sw = 1; b.attack(BA.sl({ wind: .25, act: .3, rec: .8, py: 1.45, r: .8, th0: -140, th1: 100, dmg: 115, noBlade: true }), p); } return; } const r = b.updAttack(dt); if (r === 'done') return 'done'; } },
      ] },
    { hp: 1250, until: .5, music: 'b_odile', line: 'Não chores... já não dói. Já não dói!', title: 'O Lamento de Odile', keep: [2.5, 4.5], dmgMul: 1.15, aggr: .8,
      trans: { dur: 2.6, start(b) { b.anim.play(CLIP.roar); sfx('wail_long', { pos: b.pos, vol: 1 }); after(.9, () => { odileWail(b, 6, 60); b.cenFlame.on = true; b.cenLight.color.set(0x9affd0); b.cenLight.int = 3; }); } },
      moves: [
        { id: 'swing2', w: 3, rng: [0, 4.2], cd: 1.5, seq: [BA.sl({ wind: .65, act: .28, rec: .3, py: 1.45, r: .8, th0: -140, th1: 100, dmg: 110, noBlade: true }), BA.sr({ wind: .35, act: .28, rec: .3, py: 1.45, r: .8, th0: 100, th1: -140, dmg: 110, noBlade: true }), BA.ov({ wind: .5, act: .28, rec: .9, r: .8, dmg: 140, noBlade: true, events: [{ at: 'rec', fn: b => odileSlam(b) }] })] },
        { id: 'slam', w: 2, rng: [0, 4.6], cd: 3, seq: [BA.ov({ wind: .9, act: .28, rec: .8, r: .8, dmg: 140, noBlade: true, events: [{ at: 'rec', fn: b => odileSlam(b) }] })] },
        { id: 'spin', w: 1.5, rng: [0, 3.8], cd: 5, turn: true, start(b) { sfx('wail_sml', { pos: b.pos, vol: .7 }); b.anim.play(CLIP.roar); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (m.t > .5 && m.t < 2.6) { b.spinning = true; b.yaw += dt * 10; const d = b.dist(p); b.turn(b.yaw, 0, dt); b.vel.set(Math.sin(b.yawTo(p)) * 1.5, 0, Math.cos(b.yawTo(p)) * 1.5); if (Math.random() < dt * 6) sfx('whoosh2', { pos: b.pos, vol: .6, rate: .7 }); } else b.spinning = false; if (m.t > 3.2) { b.spinning = false; return 'done'; } } },
        { id: 'spirits', w: 2, rng: [3, 20], cd: 9, voice: 'wail', start(b, p, m) { b.anim.play(CLIP.cast); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.s && m.t > .6) { m.data.s = 1; for (let i = 0; i < 3; i++) { const a = b.yaw + (i - 1) * .9; const w = spawnEnemy('chama', b.pos.x + Math.sin(a) * 1.5, b.pos.y, b.pos.z + Math.cos(a) * 1.5, a, 1, { summoned: true, color: 0x9adfff, life: 9, speed: 2.6, blastR: 2.2, dmgMul: .95, type: 'magic', cinzas: 0, fuse: .7 }); b.adds.push(w); } sfx('wail_sml', { pos: b.pos, vol: .8 }); } if (m.t > 1.4) return 'done'; } },
        { id: 'wail', w: 1.3, rng: [0, 5], cd: 7, voice: 'wail', start(b) { b.anim.play(CLIP.roar); telegraph(b.pos.x, b.pos.y, b.pos.z, 5.5, .9, 0x9adfff); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.w && m.t > .9) { m.data.w = 1; odileWail(b, 5.5, 120); } if (m.t > 1.8) return 'done'; } },
        { id: 'glide', w: 1.6, rng: [5, 18], cd: 4, punish: true, start(b, p, m) { sfx('wail_sml', { pos: b.pos, vol: .6, rate: 1.2 }); }, update(b, p, dt, m) { if (m.t < .4) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 6, dt); return; } if (!m.data.sw) { const sp = 10; b.vel.set(Math.sin(b.yaw) * sp, 0, Math.cos(b.yaw) * sp); b.turn(b.yawTo(p), 2.5, dt); if (m.t % .12 < dt) aoe({ x: b.pos.x, y: b.pos.y, z: b.pos.z, r: 1, dur: 2.5, tick: .5, dmg: 18, poiseDmg: 0, type: 'fire', team: 'enemy', owner: b, kb: 0, onFire: a => burst(a.x, a.y + .2, a.z, 6, { color: 0x9affd0, smin: .3, smax: 1, upBias: 1, lmin: 1, lmax: 2 }) }); if (b.dist(p) < 3.4 || m.t > 1.5) { m.data.sw = 1; b.attack(BA.sl({ wind: .2, act: .28, rec: .8, py: 1.45, r: .8, th0: -140, th1: 100, dmg: 120, noBlade: true }), p); } return; } const r = b.updAttack(dt); if (r === 'done') return 'done'; } },
      ] },
  ],
};
function odileSlam(b) {
  const e = b.chain.p[b.chain.n - 1]; const y = groundAt(e.x, e.z, e.y + 1, 3);
  aoe({ x: e.x, y, z: e.z, r: 2.2, dmg: Math.round(90 * b.dmgMul), poiseDmg: 40, team: 'enemy', owner: b, kb: 6, dur: .12, type: b.phase ? 'fire' : 'phys' });
  aoe({ x: e.x, y, z: e.z, r: 2.6, delay: .2, dur: 2.4, tick: .5, dmg: Math.round(16 * b.dmgMul), poiseDmg: 0, team: 'enemy', owner: b, kb: 0, type: 'poison' });
  for (let i = 0; i < 26; i++) after(i * .08, () => burst(e.x + rnd(-1.6, 1.6), y + .3, e.z + rnd(-1.6, 1.6), 2, { add: false, color: b.phase ? 0x6abfa0 : 0x8a8f86, smin: .2, smax: .7, upBias: .6, lmin: 1.2, lmax: 2.2, szmin: .4, szmax: .9, alpha: .3, drag: 1 }));
  ringFx(e.x, y, e.z, .3, 3, .5, b.phase ? 0x9affd0 : 0xd8c8a8, .9); sfx('quake', { pos: e, vol: .7 }); sfx('hit_flail', { pos: e, vol: .8, rate: .7 }); shake(.3);
}
function odileWail(b, r, dmg) {
  aoe({ x: b.pos.x, y: b.pos.y, z: b.pos.z, r, dmg: Math.round(dmg * b.dmgMul), poiseDmg: 60, team: 'enemy', owner: b, kb: 12, dur: .15, type: 'magic', maxH: 4 });
  ringFx(b.pos.x, b.pos.y + 1, b.pos.z, .5, r * 1.3, .6, 0x9adfff, .9); ringFx(b.pos.x, b.pos.y + .1, b.pos.z, .5, r, .5, 0xffffff, .6);
  sfx('wail_long', { pos: b.pos, vol: 1 }); shake(.5); flashLight(b.pos.x, b.pos.y + 2, b.pos.z, 0x9adfff, 6, 10, .6);
}
// ============ 2. BRIGID, A LANÇA JURAMENTADA ============
BOSSDEF.brigid = {
  name: 'Brigid, a Lança Juramentada', title: 'Capitã da Guarda da Rainha', speaker: 'Brigid', music: 'b_brigid', r: .6, h: 2.3, mass: 6, walk: 1.7, run: 4.6, keep: [2.5, 4.5], posture: 340, rim: 0xc8d0e0, hitMat: 'armor',
  line: 'Nenhum vivo passará pelo Portão. Assim jurei à minha rainha.', deathLine: 'Rainha minha... guardei... a porta...',
  voices: { hurt: ['f_hit1', 'f_hit3'], die: ['f_die1'], shout: ['warcry'], stagger: ['f_hit2'] }, voiceOpt: { pitch: .75, rate: .84 },
  weapon: 'lance', wscale: 1.15, offhand: 'shield', trail: 0xdde6ff, hold: { hand: [-.24, 1.2, .2], blade: [0, .25, 1], edge: [0, 1, 0] },
  build: () => buildHumanoid({ s: 1.28, female: true, bulk: 1.1, mats: { skin: MAT('skin_pale'), body: MAT('steel'), arms: MAT('dark_steel'), legs: MAT('dark_steel'), boots: MAT('steel'), accent: MAT('steel') }, head: 'helm', plume: MAT('cloth_red'), pauldrons: MAT('gold'), cape: { mat: MAT('cloth_red'), len: 1.3, w: .55 }, skirt: { len: .5, r1: .4, mat: MAT('cloth_red') } }),
  init(b) { b.off.scale.setScalar(1.25); b.guarding = false; },
  intro(b) { b.anim.play(CLIP.roar); after(.6, () => sfx('warcry', { pos: b.pos, vol: .7, rate: 1.25 })); },
  tick(b, dt) { if (b.phase && b.alive && b.wmesh) { if (Math.random() < dt * 20) { const t = b.curT; PFX.glow.emit(t.x + rnd(-.1, .1), t.y + rnd(-.1, .1), t.z + rnd(-.1, .1), rnd(-.5, .5), rnd(-.5, .5), rnd(-.5, .5), rnd(.1, .25), rnd(.05, .1), .02, .75, .85, 1, 1, 1, 0); } } },
  extraPose(b) { return b.guarding ? { armL: [-1.3, .6, .4], foreL: [-1.2, 0, 0] } : null; },
  speed: b => b.phase ? 1.12 : 1,
  phases: [
    { hp: 2300, music: 'b_brigid',
      moves: [
        { id: 'thrust3', w: 3, rng: [0, 5], cd: 1.5, seq: [BA.th({ wind: .6, dmg: 115 }), BA.th({ wind: .3, dmg: 115 }), BA.th({ wind: .38, dmg: 130, mvA: 7, to: [-.1, 1.35, 1.4] })] },
        { id: 'sweep', w: 2, rng: [0, 4], cd: 2, turn: true, seq: [BA.sl({ wind: .75, act: .22, rec: .7, psi: 0, th0: -150, th1: 110, r: .9, dmg: 135 })] },
        { id: 'bash', w: 1.5, rng: [0, 2.6], cd: 4, start(b, p, m) { b.anim.play({ dur: 1.1, keys: [[0, {}], [.35, { armL: [-1.6, .3, .2], foreL: [-.4, 0, 0], chest: [0, .6, 0], legL: [-.3, 0, 0], legR: [.4, 0, 0] }, 'out'], [.5, { armL: [-1.6, -.2, .1], foreL: [-.2, 0, 0], chest: [.2, -.3, 0], legL: [-.6, 0, 0], legR: [.5, 0, 0] }, 'in'], [1.1, {}]] }); }, update(b, p, dt, m) { if (m.t < .38) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 6, dt); } else if (m.t < .55) { b.vel.set(Math.sin(b.yaw) * 7, 0, Math.cos(b.yaw) * 7); if (!m.data.h && b.dist(p) < 2.2 && Math.abs(angDiff(b.yaw, b.yawTo(p))) < 1) { m.data.h = 1; p.takeHit({ dmg: Math.round(90 * b.dmgMul), poiseDmg: 60, from: b, src: b.pos, kb: 10 }); sfx('hit_flail', { pos: b.pos, vol: 1, rate: .8 }); hitStop(.08); } } else b.vel.set(0, 0, 0); if (m.t > 1.1) return 'done'; } },
        { id: 'charge', w: 1.6, rng: [6, 22], cd: 6, punish: true, voice: 'shout', start(b, p) { b.anim.play({ dur: 2.5, keys: [[0, {}], [.8, { chest: [-.2, .5, 0], legL: [-.5, 0, 0], shinL: [.5, 0, 0], legR: [.6, 0, 0], shinR: [.4, 0, 0], _y: -.15 }, 'out'], [2.5, { chest: [.3, .2, 0], legL: [-.6, 0, 0], legR: [.5, 0, 0], _y: -.1 }]] }); b.curHold = { hand: [-.2, 1.25, .45], blade: [0, .05, 1], edge: [0, 1, 0] }; }, update(b, p, dt, m) { if (m.t < .9) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 5, dt); return; } if (m.t < 2.4 && !m.data.stop) { const sp = 12.5; b.vel.set(Math.sin(b.yaw) * sp, 0, Math.cos(b.yaw) * sp); b.turn(b.yawTo(p), .9, dt); if (Math.random() < dt * 30) burst(b.pos.x, b.pos.y + .1, b.pos.z, 1, { add: false, color: 0x6b6458, smin: .5, smax: 1.5, lmin: .3, lmax: .6, szmin: .2, szmax: .4, alpha: .5 }); if (!m.data.h && sphereHits(b.curT, .6, p)) { m.data.h = 1; p.takeHit({ dmg: Math.round(165 * b.dmgMul), poiseDmg: 80, from: b, src: b.pos, kb: 11 }); hitStop(.1); } const blocked = Math.hypot(b.vel.x, b.vel.z) > 1 && b.lastPos && b.lastPos.distanceTo(b.pos) < sp * dt * .3; b.lastPos = b.pos.clone(); if (blocked || (m.data.h && m.t > 1.3) || b.dist(p) > 26) { m.data.stop = 1; if (blocked) { synth('boom', .6); shake(.3); } } return; } b.vel.multiplyScalar(Math.exp(-6 * dt)); b.curHold = null; if (m.t > 3) return 'done'; } },
        { id: 'leap', w: 1.3, rng: [3, 18], cd: 8, voice: 'shout', start(b, p, m) { b.anim.play(CLIP.jump); m.data.tx = p.pos.x; m.data.tz = p.pos.z; b.curHold = { hand: [-.2, 1.6, .1], blade: [0, -1, .1], edge: [0, 0, 1] }; }, update(b, p, dt, m) { if (m.t < .45) { b.vel.set(0, 0, 0); return; } if (!m.data.l) { m.data.l = 1; const tx = lerp(m.data.tx, p.pos.x, .6), tz = lerp(m.data.tz, p.pos.z, .6); b.leapTo(tx, tz, 1.25, 7); m.data.tele = telegraph(tx, p.pos.y, tz, 2.6, 1.25, b.phase ? 0x9ab8ff : 0xff5a28); } if (!m.data.land) { if (b.leapUpd(dt)) { m.data.land = 1; aoe({ x: b.pos.x, y: b.pos.y, z: b.pos.z, r: 2.6, dmg: Math.round(175 * b.dmgMul), poiseDmg: 80, team: 'enemy', owner: b, kb: 10, dur: .12, type: b.phase ? 'lightning' : 'phys' }); ringFx(b.pos.x, b.pos.y, b.pos.z, .3, 4, .5, 0xd8c8a8, .9); BFX.ash(b.pos.x, b.pos.y, b.pos.z, 2); synth('boom', .9); shake(.5); if (b.phase) { aoe({ x: b.pos.x, y: b.pos.y, z: b.pos.z, r: 0, r0: 0, grow: 9, width: 1.2, shape: 'ring', dur: .7, delay: .15, dmg: Math.round(90 * b.dmgMul), poiseDmg: 30, team: 'enemy', owner: b, kb: 6, type: 'lightning' }); ringFx(b.pos.x, b.pos.y, b.pos.z, .5, 7, .7, 0x9ab8ff, 1); BFX.lightning(b.pos.x, b.pos.y, b.pos.z); } b.anim.play(CLIP.land); } return; } b.curHold = null; if (m.t > m.data.land + 2.4 || m.t > 3.6) return 'done'; } },
        { id: 'guard', w: 1.2, rng: [0, 6], cd: 7, start(b) { b.guarding = true; sfx('hit_flail', { pos: b.pos, vol: .4, rate: 1.5 }); }, update(b, p, dt, m) { b.turn(b.yawTo(p), 4, dt); b.walk(b.walkSpeed * .6, dt, .2, b.strafe); if (m.data.countered || m.t > 1.8) { b.guarding = false; if (m.data.countered && !m.data.c) { m.data.c = 1; b.attack(BA.th({ wind: .2, dmg: 140, mvA: 7 }), p); } } if (m.data.c) { const r = b.updAttack(dt); if (r === 'done') return 'done'; } else if (m.t > 1.8) return 'done'; } },
      ] },
    { hp: 2300, until: .5, music: 'b_brigid', line: 'Pelo Lume... ninguém passa! NINGUÉM!', title: 'O Juramento Relampejante', dmgMul: 1.12, aggr: .8,
      trans: { dur: 2.6, start(b) { b.anim.play(CLIP.roar); sfx('warcry', { pos: b.pos, vol: .9, rate: 1.2 }); after(.8, () => { BFX.lightning(b.pos.x, b.pos.y, b.pos.z); b.trailColor = 0x9ab8ff; if (b.trail) b.trail.setColor(0x9ab8ff); b.L = addLight(0, 0, 0, 0x9ab8ff, 2, 6); }); after(1.6, () => BFX.lightning(b.pos.x + 3, b.pos.y, b.pos.z - 2)); } },
      moves: [
        { id: 'thrust3', w: 3, rng: [0, 5], cd: 1.5, seq: [BA.th({ wind: .5, dmg: 125 }), BA.th({ wind: .26, dmg: 125 }), BA.th({ wind: .32, dmg: 140, mvA: 7, to: [-.1, 1.35, 1.4], events: [{ at: 'act', dt: .1, fn: (b) => lineAoe(b, b.pos.x, b.pos.z, b.yaw, 10, 1.6, .35, { dmg: Math.round(110 * b.dmgMul), type: 'lightning', tele: 0x9ab8ff, extra: { onFire: a => { for (let i = 0; i < 5; i++) burst(a.x + Math.sin(a.yaw) * i * 2, a.y + .3, a.z + Math.cos(a.yaw) * i * 2, 10, { color: 0xc8d8ff, smin: 1, smax: 4, lmin: .1, lmax: .3 }); sfx('lightning', { pos: b.pos, vol: .7 }); } } }) }] })] },
        { id: 'sweep', w: 2, rng: [0, 4], cd: 2, turn: true, seq: [BA.sl({ wind: .6, act: .22, rec: .4, psi: 0, th0: -150, th1: 110, r: .9, dmg: 140 }), BA.sr({ wind: .35, act: .22, rec: .7, psi: 0, th0: 110, th1: -150, r: .9, dmg: 140 })] },
        { id: 'storm', w: 2, rng: [0, 25], cd: 7, voice: 'shout', start(b) { b.anim.play({ dur: 2.2, keys: [[0, {}], [.5, { chest: [-.3, 0, 0], head: [-.4, 0, 0] }, 'out'], [2.2, {}]] }); b.curHold = { hand: [-.2, 1.9, .1], blade: [0, 1, 0], edge: [0, 0, 1] }; }, update(b, p, dt, m) { b.vel.set(0, 0, 0); for (const [i, at] of [[0, .6], [1, .85], [2, 1.1], [3, 1.35], [4, 1.6]]) if (!m.data['s' + i] && m.t > at) { m.data['s' + i] = 1; const lx = p.pos.x + p.vel.x * .6 + rnd(-1.5, 1.5), lz = p.pos.z + p.vel.z * .6 + rnd(-1.5, 1.5); strikeAt(b, lx, lz, 1.8, .9, { dmg: Math.round(120 * b.dmgMul), type: 'lightning', color: 0x9ab8ff, fx: (x, y, z) => BFX.lightning(x, y, z) }); } if (m.t > 2.2) { b.curHold = null; return 'done'; } } },
        { id: 'charge', w: 1.5, rng: [6, 22], cd: 6, punish: true, voice: 'shout', start(b, p, m) { BOSSDEF.brigid.phases[0].moves[3].start(b, p, m); m.data.n = 0; }, update(b, p, dt, m) { const r = BOSSDEF.brigid.phases[0].moves[3].update(b, p, dt, m); if (r === 'done') { if (m.data.n++ < 1) { m.t = .4; m.data.stop = 0; m.data.h = 0; b.curHold = { hand: [-.2, 1.25, .45], blade: [0, .05, 1], edge: [0, 1, 0] }; return; } return 'done'; } } },
        { id: 'leap', w: 1.6, rng: [3, 18], cd: 6, voice: 'shout', start: (b, p, m) => BOSSDEF.brigid.phases[0].moves[4].start(b, p, m), update: (b, p, dt, m) => BOSSDEF.brigid.phases[0].moves[4].update(b, p, dt, m) },
        { id: 'bash', w: 1, rng: [0, 2.6], cd: 4, start: (b, p, m) => BOSSDEF.brigid.phases[0].moves[2].start(b, p, m), update: (b, p, dt, m) => BOSSDEF.brigid.phases[0].moves[2].update(b, p, dt, m) },
      ] },
  ],
};
// ============ 3. VESPER, TECELÃ DE CINZAS ============
BOSSDEF.vesper = {
  name: 'Vesper, Tecelã de Cinzas', title: 'Irmã da Rainha', speaker: 'Vesper', music: 'b_vesper', r: .55, h: 2.3, mass: 4, walk: 1.8, run: 3.5, keep: [7, 12], posture: 240, rim: 0xb8a0ff, rimStr: .5,
  line: 'O véu rasgou-se, criança. E eu coso-o... com o que me resta.', deathLine: 'Os fios... soltam-se... Seraphine, irmã... perdoa-me.',
  voices: { hurt: ['f_hit2', 'mermaid_hit'], die: ['f_die3'], cast: ['wail_sml'], stagger: ['f_hit1'] }, voiceOpt: { pitch: 1.0, rate: .8 },
  weapon: 'staff', trail: 0xc8b0ff, hold: { hand: [-.24, 1.1, .2], blade: [0, 1, .2], edge: [0, 0, 1] },
  build: () => buildHumanoid({ s: 1.25, female: true, mats: { skin: MAT('skin_pale', { color: 0xc8c0d0 }), body: MAT('cloth_purple'), arms: MAT('cloth_purple'), legs: MAT('cloth_purple'), veil: MAT('cloth_grey') }, head: 'veil', skirt: { len: 1.2, r1: .7, mat: MAT('cloth_purple'), flare: .1 }, cape: { mat: MAT('cloth_grey'), len: 1.6, w: .6 } }),
  init(b) { b.hover = .5; b.L = addLight(0, 0, 0, 0xb090ff, 2, 6); b.threads = []; },
  intro(b) { b.anim.play(CLIP.cast); sfx('wail_sml', { pos: b.pos, vol: .7 }); },
  tick(b, dt) { b.L.x = b.pos.x; b.L.y = b.pos.y + 2; b.L.z = b.pos.z; if (b.alive) { b.rig.root.position.y = b.hover + Math.sin(TIME.now * 1.6) * .15; if (Math.random() < dt * 12) { const c = b.center(_v1); PFX.dust.emit(c.x + rnd(-.4, .4), b.pos.y + .3, c.z + rnd(-.4, .4), rnd(-.2, .2), rnd(.2, .5), rnd(-.2, .2), rnd(1, 2), .1, .3, .7, .65, .8, .4, .5, -.1); } } },
  speed: b => b.phase ? 1.1 : 1,
  phases: [
    { hp: 2400, music: 'b_vesper', backoff: true,
      moves: [
        { id: 'fan', w: 3, rng: [0, 30], cd: 2, voice: 'cast', start(b) { b.anim.play(CLIP.cast); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 5, dt); if (!m.data.f && m.t > .55) { m.data.f = 1; orbFan(b, 5, 1.0, 11, { dmg: Math.round(95 * b.dmgMul), color: 0xb090ff }); sfx('cast_arc', { pos: b.pos, vol: .6 }); } if (m.t > 1.1) return 'done'; } },
        { id: 'ring', w: 2, rng: [0, 9], cd: 4, start(b) { b.anim.play(CLIP.roar); telegraph(b.pos.x, b.pos.y, b.pos.z, 2.5, .8, 0xb090ff); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.f && m.t > .8) { m.data.f = 1; orbRing(b, 14, 7.5, { dmg: Math.round(90 * b.dmgMul), color: 0xb090ff }); sfx('dark', { pos: b.pos, vol: .7 }); } if (m.t > 1.5) return 'done'; } },
        { id: 'threads', w: 2.2, rng: [0, 30], cd: 5, voice: 'cast', start(b) { b.anim.play(CLIP.cast); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.f && m.t > .5) { m.data.f = 1; const base = b.yawTo(p); for (let i = -2; i <= 2; i++) lineAoe(b, b.pos.x, b.pos.z, base + i * .35, 22, 1.1, 1.15, { dmg: Math.round(125 * b.dmgMul), type: 'magic', tele: 0xc0a0ff, extra: { onFire: a => { const n = 8; for (let k = 0; k < n; k++) burst(a.x + Math.sin(a.yaw) * k * 2.6, a.y + .4, a.z + Math.cos(a.yaw) * k * 2.6, 5, { color: 0xc0a0ff, smin: 1, smax: 3, lmin: .2, lmax: .5 }); sfx('slowed', { pos: b.pos, vol: .7 }); } } }); } if (m.t > 1.8) return 'done'; } },
        { id: 'needle', w: 1.5, rng: [4, 30], cd: 3, start(b) { b.anim.play(CLIP.cast); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 6, dt); if (!m.data.f && m.t > .4) { m.data.f = 1; const h = b.handW('L'); bossOrb(b, h, p.center(new V3()).sub(h), { speed: 22, dmg: Math.round(110 * b.dmgMul), r: .15, color: 0xe0d0ff, homing: 1.5, life: 2.5 }); sfx('cast_arc2', { pos: b.pos, vol: .6 }); } if (m.t > .9) return 'done'; } },
        { id: 'blink', w: 1.1, rng: [0, 4], cd: 6.5, cond: (b, p) => b.dist(p) < 4 && b.hitRecent > 1, start(b, p) { const [x, z] = b.arenaPoint(9, 14, p.pos); b.teleportTo(x, z, 0xc0a0ff); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (m.t > .4) return 'done'; } },
        { id: 'swipe', w: 2, rng: [0, 3], cd: 2, seq: [BA.sl({ wind: .45, act: .16, rec: .5, dmg: 105, r: .7 })] },
        { id: 'spirits', w: 1.2, rng: [0, 30], cd: 10, voice: 'cast', start(b) { b.anim.play(CLIP.cast); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.f && m.t > .6) { m.data.f = 1; for (let i = 0; i < 2; i++) { const a = b.yaw + (i ? 1 : -1); b.adds.push(spawnEnemy('chama', b.pos.x + Math.sin(a) * 1.4, b.pos.y, b.pos.z + Math.cos(a) * 1.4, a, 1, { summoned: true, color: 0xb090ff, life: 8, speed: 2.8, blastR: 2.2, dmgMul: .95, type: 'magic', cinzas: 0 })); } } if (m.t > 1.2) return 'done'; } },
      ] },
    { hp: 2400, until: .5, music: 'b_vesper', line: 'Rasgaste o meu véu... então coso-o com a tua carne!', title: 'A Tecelã Desvelada', dmgMul: 1.1, aggr: .75, backoff: true,
      trans: { dur: 2.4, start(b) { b.anim.play(CLIP.roar); sfx('shriek', { pos: b.pos, vol: .9, rate: 1.3 }); after(.8, () => { orbRing(b, 20, 6, { dmg: Math.round(80 * b.dmgMul), color: 0xd0b0ff, off: 0 }); ringFx(b.pos.x, b.pos.y + 1, b.pos.z, .5, 9, .7, 0xc0a0ff, 1); GAME.envPulse && GAME.envPulse(0x1a0a2a); }); } },
      moves: [
        { id: 'fan', w: 2.5, rng: [0, 30], cd: 1.8, voice: 'cast', start(b) { b.anim.play(CLIP.cast); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 5, dt); for (const k of [0, 1]) if (!m.data['f' + k] && m.t > .5 + k * .45) { m.data['f' + k] = 1; orbFan(b, 7, 1.3, 12, { dmg: Math.round(90 * b.dmgMul), color: 0xd0b0ff }); sfx('cast_arc', { pos: b.pos, vol: .6 }); } if (m.t > 1.5) return 'done'; } },
        { id: 'spiral', w: 2, rng: [0, 12], cd: 6, start(b) { b.anim.play(CLIP.roar); m_spiral(b); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); m.data.acc = (m.data.acc || 0) + dt; m.data.a = (m.data.a || 0); while (m.data.acc > .09) { m.data.acc -= .09; const c = b.center(new V3()); for (const s of [0, PI]) bossOrb(b, c.clone(), new V3(Math.sin(m.data.a + s), 0, Math.cos(m.data.a + s)), { speed: 6.5, dmg: Math.round(80 * b.dmgMul), color: 0xd0b0ff, r: .2, trail: 6 }); m.data.a += .32; } if (m.t > 2.6) return 'done'; } },
        { id: 'weave', w: 2, rng: [0, 30], cd: 7, voice: 'cast', start(b) { b.anim.play(CLIP.cast); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.f && m.t > .5) { m.data.f = 1; const c = p.pos; for (let i = -2; i <= 2; i++) { lineAoe(b, c.x + i * 2.6 - 0, c.z - 12, 0, 24, .9, 1.3, { dmg: Math.round(120 * b.dmgMul), type: 'magic', tele: 0xc0a0ff, y: c.y }); lineAoe(b, c.x - 12, c.z + i * 2.6 + 1.3, HPI, 24, .9, 1.75, { dmg: Math.round(120 * b.dmgMul), type: 'magic', tele: 0xc0a0ff, y: c.y }); } sfx('slowed', { pos: b.pos, vol: .8 }); } if (m.t > 2.2) return 'done'; } },
        { id: 'clones', w: 1.6, rng: [0, 30], cd: 14, voice: 'cast', start(b) { b.anim.play(CLIP.roar); sfx('dark_big', { pos: b.pos, vol: .7 }); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.f && m.t > .7) { m.data.f = 1; for (let i = 0; i < 2; i++) { const [x, z] = b.arenaPoint(6, 11, p.pos); b.adds.push(vesperClone(b, x, z)); } const [x, z] = b.arenaPoint(7, 12, p.pos); b.teleportTo(x, z, 0xc0a0ff); } if (m.t > 1.3) return 'done'; } },
        { id: 'pull', w: 1.3, rng: [3, 14], cd: 9, start(b) { b.anim.play(CLIP.cast); sfx('ink', { pos: b.pos, vol: .7 }); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (m.t > .4 && m.t < 1.6 && p.alive && p.state !== 'roll') { const d = b.dist(p); if (d > 1.8) { const k = 6.5 * dt; p.pos.x += (b.pos.x - p.pos.x) / d * k; p.pos.z += (b.pos.z - p.pos.z) / d * k; resolveCircle(p); } if (Math.random() < dt * 20) { const t = Math.random(); burst(lerp(b.pos.x, p.pos.x, t), lerp(b.pos.y, p.pos.y, t) + 1.2, lerp(b.pos.z, p.pos.z, t), 1, { color: 0xc0a0ff, smin: .1, smax: .3, lmin: .2, lmax: .4 }); } } if (!m.data.f && m.t > 1.7) { m.data.f = 1; aoe({ x: b.pos.x, y: b.pos.y, z: b.pos.z, r: 3.6, dmg: Math.round(150 * b.dmgMul), poiseDmg: 60, type: 'magic', team: 'enemy', owner: b, kb: 10, dur: .15 }); ringFx(b.pos.x, b.pos.y + .5, b.pos.z, .5, 4.5, .5, 0xc0a0ff, 1); sfx('dark_big', { pos: b.pos, vol: .9 }); shake(.3); } if (m.t > 2.4) return 'done'; } },
        { id: 'blink', w: 1.4, rng: [0, 4], cd: 4.5, cond: (b, p) => b.dist(p) < 4 && b.hitRecent > 1, start(b, p) { const [x, z] = b.arenaPoint(8, 13, p.pos); b.teleportTo(x, z, 0xc0a0ff); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.f && m.t > .35) { m.data.f = 1; orbFan(b, 3, .5, 14, { dmg: Math.round(90 * b.dmgMul), color: 0xd0b0ff, from: b.center(new V3()) }); } if (m.t > .7) return 'done'; } },
        { id: 'threads', w: 1.6, rng: [0, 30], cd: 5, voice: 'cast', start: (b, p, m) => BOSSDEF.vesper.phases[0].moves[2].start(b, p, m), update: (b, p, dt, m) => BOSSDEF.vesper.phases[0].moves[2].update(b, p, dt, m) },
      ] },
  ],
};
function m_spiral(b) { sfx('dark', { pos: b.pos, vol: .7 }); }
// clone ilusório de Vesper
function vesperClone(b, x, z) {
  const w = spawnEnemy('chama', x, b.pos.y, z, 0, 1, { summoned: true, color: 0xc0a0ff, life: 10, speed: 0, blastAt: -1, cinzas: 0 });
  w.hp = 1; w.maxHp = 1; const ghost = buildHumanoid({ s: 1.25, female: true, mats: { skin: MAT('glow_blue'), body: MAT('shadow_body'), arms: MAT('shadow_body'), legs: MAT('shadow_body'), veil: MAT('shadow_body') }, head: 'veil', skirt: { len: 1.2, r1: .7, mat: MAT('shadow_body'), flare: .1 } });
  ghost.root.position.y = .4; w.root.add(ghost.root); w.core.visible = false; w.halo.visible = false; w.fl.on = false; w.h = 2.3; w.r = .5; w.hover = 1.2;
  const cast = () => { if (!w.alive || !b.alive) return; orbFan(b, 3, .6, 10, { dmg: Math.round(70 * b.dmgMul), color: 0xd0b0ff, from: new V3(w.pos.x, w.pos.y + 1.5, w.pos.z) }); after(2.6, cast); };
  after(1.2, cast); return w;
}
// ============ 4. SELENE, A CAÇADORA DA LUA MORTA ============
BOSSDEF.selene = {
  name: 'Selene, a Caçadora da Lua Morta', title: 'Primogénita do Rei', speaker: 'Selene', music: 'b_selene', r: .45, h: 2.05, mass: 3, walk: 2.4, run: 6, keep: [3, 9], posture: 260, rim: 0xc0d8e8,
  line: 'O meu pai mandou-te? ... Não. Tu cheiras a cinza. Como eu.', deathLine: 'Garra... vamos... para casa...',
  voices: { hurt: ['elf_hit1', 'elf_hit2'], die: ['f_die3'], shout: ['f_hit3'], stagger: ['elf_hit2'] }, voiceOpt: { pitch: 1.05, rate: .9 },
  weapon: 'dagger', wscale: 1.4, offhand: 'bow', trail: 0xd8e8ff, hold: { hand: [-.22, 1.05, .25], blade: [0, -.2, 1], edge: [0, 1, 0] },
  build: () => buildHumanoid({ s: 1.14, female: true, mats: { skin: MAT('skin_pale'), body: MAT('leather'), arms: MAT('cloth_green'), legs: MAT('leather'), boots: MAT('leather'), hair: MAT('cloth_white') }, head: 'hood', cape: { mat: MAT('cloth_green'), len: 1.25, w: .5 }, skirt: { len: .45, r1: .33, mat: MAT('cloth_green') } }),
  init(b) { b.off.visible = true; },
  intro(b) { b.anim.play(CLIP.bowdraw); },
  speed: b => b.enraged ? 1.25 : 1,
  phases: [
    { hp: 2500, music: 'b_selene', backoff: true,
      moves: [
        { id: 'volley', w: 3, rng: [4, 30], cd: 2, start(b) { b.anim.play(CLIP.bowdraw, { hold: true }); b.useIK = false; if (b.wmesh) b.wmesh.visible = false; }, update(b, p, dt, m) { b.vel.set(0, 0, 0); b.turn(b.yawTo(p), 7, dt); for (const k of [0, 1, 2]) if (!m.data['a' + k] && m.t > .55 + k * .3) { m.data['a' + k] = 1; seleneArrow(b, p, 105); } if (m.t > 1.6) { b.anim.stop(.2); b.useIK = true; b.wmesh.visible = true; return 'done'; } } },
        { id: 'rain', w: 2, rng: [0, 30], cd: 7, voice: 'shout', start(b) { b.anim.play({ dur: 1, keys: [[0, {}], [.4, { armL: [-3, 0, .2], chest: [-.4, 0, 0], head: [-.6, 0, 0] }, 'out'], [1, {}]] }); b.useIK = false; b.wmesh.visible = false; }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.f && m.t > .45) { m.data.f = 1; sfx('bow', { pos: b.pos, vol: .8, rate: .8 }); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, r = i ? rnd(1.8, 3.4) : 0; strikeAt(b, p.pos.x + p.vel.x * .8 + Math.sin(a) * r, p.pos.z + p.vel.z * .8 + Math.cos(a) * r, 1.4, 1.4 + i * .06, { dmg: Math.round(115 * b.dmgMul), color: 0xd8e8ff, fx: (x, y, z) => { burst(x, y + .2, z, 8, { add: false, color: 0x6b6458, smin: 1, smax: 3, lmin: .2, lmax: .5, alpha: .5 }); sfx('hit_spear', { pos: new V3(x, y, z), vol: .5, jit: .1 }); } }); } } if (m.t > 1.2) { b.useIK = true; b.wmesh.visible = true; return 'done'; } } },
        { id: 'combo', w: 3, rng: [0, 3.5], cd: 1.5, seq: [BA.sl({ wind: .32, act: .12, rec: .2, r: .6, dmg: 95, mvA: 4 }), BA.sr({ wind: .18, act: .12, rec: .2, r: .6, dmg: 95, mvA: 4 }), BA.th({ wind: .25, act: .14, rec: .55, dmg: 115, mvA: 7 })] },
        { id: 'flip', w: 2, rng: [0, 4], cd: 4, start(b, p, m) { b.anim.play(CLIP.roll); m.data.y = b.yawTo(p); sfx('whoosh3', { pos: b.pos, vol: .5 }); }, update(b, p, dt, m) { if (m.t < .5) { const sp = 11; b.vel.set(-Math.sin(m.data.y) * sp, 0, -Math.cos(m.data.y) * sp); b.iframe = .1; return; } b.vel.set(0, 0, 0); if (!m.data.s) { m.data.s = 1; b.anim.play(CLIP.bowdraw, { hold: true }); b.useIK = false; b.wmesh.visible = false; } b.turn(b.yawTo(p), 8, dt); if (!m.data.a && m.t > .95) { m.data.a = 1; seleneArrow(b, p, 120); } if (m.t > 1.3) { b.anim.stop(.2); b.useIK = true; b.wmesh.visible = true; return 'done'; } } },
        { id: 'smoke', w: 1.4, rng: [0, 12], cd: 8, start(b) { burst(b.pos.x, b.pos.y + 1, b.pos.z, 40, { add: false, color: 0x9a9890, smin: 1, smax: 4, lmin: .8, lmax: 1.6, szmin: .4, szmax: .9, alpha: .5, drag: 2 }); sfx('ink', { pos: b.pos, vol: .7 }); b.root.visible = false; b.ghost = true; }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (!m.data.r && m.t > 1.1) { m.data.r = 1; const a = p.yaw + PI + rnd(-.5, .5); b.pos.set(p.pos.x + Math.sin(a) * 2.4, p.pos.y, p.pos.z + Math.cos(a) * 2.4); resolveCircle(b); b.yaw = b.yawTo(p); b.root.visible = true; b.ghost = false; burst(b.pos.x, b.pos.y + 1, b.pos.z, 30, { add: false, color: 0x9a9890, smin: 1, smax: 3, lmin: .6, lmax: 1.2, szmin: .3, szmax: .7, alpha: .5 }); b.attack(BA.sl({ wind: .35, act: .14, rec: .6, r: .6, dmg: 130, mvA: 4 }), p); } if (m.data.r) { const r = b.updAttack(dt); if (r === 'done') return 'done'; } } },
      ] },
    { hp: 2500, until: .55, music: 'b_selene', line: 'Garra! A mim!', title: 'Selene e Garra', dmgMul: 1.1, aggr: .85, backoff: true,
      trans: { dur: 3.0, start(b) { b.anim.play(CLIP.roar); sfx('wolf_growl2', { pos: b.pos, vol: 1, rate: .6 }); after(1.2, () => { const [x, z] = b.arenaPoint(10, 14, b.pos); const w = spawnEnemy('lobo', x, b.pos.y, z, 0, 1, { noLeash: true }); w.rig.root.scale.setScalar(2); w.r = 1; w.h = 2.2; w.maxHp = w.hp = 1300; w.T = Object.assign({}, w.T, { dmg: 150, run: 9, walk: 3.4, aggro: 99, name: 'Garra' }); w.name = 'Garra, o Lobo da Lua'; w.cinzas = 0; w.aggro(PLAYER); w.isBossAdd = true; w.mass = 5; b.wolf = w; b.adds.push(w); UI.bossBar2(w); sfx('wolf_growl1', { pos: w.pos, vol: 1, rate: .55 }); }); } },
      moves: [
        { id: 'moon', w: 2.2, rng: [5, 40], cd: 7, voice: 'shout', start(b, p, m) { b.anim.play(CLIP.bowdraw, { hold: true }); b.useIK = false; b.wmesh.visible = false; m.data.line = moonLine(b); sfx('holy1', { pos: b.pos, vol: .6, rate: .7 }); }, update(b, p, dt, m) { b.vel.set(0, 0, 0); if (m.t < 1.25) b.turn(b.yawTo(p), 6, dt); moonLineUpd(m.data.line, b, m.t / 1.6); if (!m.data.a && m.t > 1.6) { m.data.a = 1; m.data.line.kill(); const from = b.center(new V3()); from.y += .3; const d = new V3(Math.sin(b.yaw), (p.pos.y + 1 - from.y) / Math.max(1, b.dist(p)), Math.cos(b.yaw)); bossOrb(b, from, d, { speed: 46, dmg: Math.round(240 * b.dmgMul), r: .3, color: 0xe8f0ff, life: 1.4, poise: 90, kb: 10, extra: { pierce: true } }); sfx('holy3', { pos: b.pos, vol: 1 }); flashLight(from.x, from.y, from.z, 0xe8f0ff, 8, 10, .4); shake(.2); } if (m.t > 2.1) { b.anim.stop(.2); b.useIK = true; b.wmesh.visible = true; return 'done'; } } },
        { id: 'volley', w: 2.5, rng: [4, 30], cd: 2, start: (b, p, m) => BOSSDEF.selene.phases[0].moves[0].start(b, p, m), update: (b, p, dt, m) => BOSSDEF.selene.phases[0].moves[0].update(b, p, dt, m) },
        { id: 'rain', w: 2, rng: [0, 30], cd: 6, start: (b, p, m) => BOSSDEF.selene.phases[0].moves[1].start(b, p, m), update: (b, p, dt, m) => BOSSDEF.selene.phases[0].moves[1].update(b, p, dt, m) },
        { id: 'combo', w: 3, rng: [0, 3.5], cd: 1.5, seq: [BA.sl({ wind: .28, act: .12, rec: .16, r: .6, dmg: 100, mvA: 4 }), BA.sr({ wind: .16, act: .12, rec: .16, r: .6, dmg: 100, mvA: 4 }), BA.sl({ wind: .16, act: .12, rec: .16, r: .6, dmg: 100, mvA: 4 }), BA.th({ wind: .22, act: .14, rec: .55, dmg: 125, mvA: 7 })] },
        { id: 'flip', w: 2, rng: [0, 4], cd: 3.5, start: (b, p, m) => BOSSDEF.selene.phases[0].moves[3].start(b, p, m), update: (b, p, dt, m) => BOSSDEF.selene.phases[0].moves[3].update(b, p, dt, m) },
        { id: 'smoke', w: 1.2, rng: [0, 12], cd: 7, start: (b, p, m) => BOSSDEF.selene.phases[0].moves[4].start(b, p, m), update: (b, p, dt, m) => BOSSDEF.selene.phases[0].moves[4].update(b, p, dt, m) },
      ] },
  ],
  tick(b, dt) { if (b.wolf && !b.wolf.alive && !b.enraged && b.alive) { b.enraged = true; UI.subtitle('Selene', 'GARRA! Não... não tu também!', 3.5); speak('Garra! Não... não tu também!', 'f', { pitch: 1.1, rate: .95 }); b.dmgMul *= 1.15; sfx('f_die1', { pos: b.pos, vol: .8, rate: 1.1 }); } },
};
function seleneArrow(b, p, dmg) {
  const from = b.center(new V3()); from.y += .3; const t = p.center(new V3()); t.x += p.vel.x * .35; t.z += p.vel.z * .35;
  new Projectile({ pos: from, vel: t.sub(from).normalize().multiplyScalar(36), r: .13, dmg: Math.round(dmg * b.dmgMul), poiseDmg: 20, team: 'enemy', owner: b, mesh: arrowMesh(.9, 0xd8e8ff), orient: true, life: 2, kb: 2, light: 1, color: 0xd8e8ff, grav: 1 });
  sfx('bow', { pos: b.pos, vol: .7, jit: .05 });
}
function moonLine(b) {
  const g = new THREE.CylinderGeometry(.03, .03, 1, 4); g.translate(0, .5, 0); g.rotateX(HPI);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xe8f0ff, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false })); R.scene.add(m);
  return { m, kill() { R.scene.remove(m); g.dispose(); } };
}
function moonLineUpd(L, b, k) { const c = b.center(_v1); L.m.position.set(c.x, c.y + .3, c.z); L.m.rotation.set(0, b.yaw, 0); const d = 30; L.m.scale.set(1 + k * 3, 1 + k * 3, d); L.m.material.opacity = .15 + k * .6 * (Math.sin(TIME.now * 30) * .2 + .8); }
