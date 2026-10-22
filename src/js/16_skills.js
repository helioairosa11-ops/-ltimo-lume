// ===================== HABILIDADES DO JOGADOR =====================
const _hp = new V3();
function handPos(p, side = 'L', out = _hp) { p.rig.J['hand' + side].getWorldPosition(out); return out; }
function aimDir(p, from, out = new V3()) {
  if (p.lock && p.lock.alive) { p.lock.center(out); return out.sub(from).normalize(); }
  const t = p.autoTarget && p.autoTargetFar ? p.autoTargetFar() : null;
  if (t) { t.center(out); return out.sub(from).normalize(); }
  return out.set(Math.sin(p.yaw) * Math.cos(-CAM.pitch * .3), Math.sin(-CAM.pitch * .3) + .02, Math.cos(p.yaw) * Math.cos(-CAM.pitch * .3)).normalize();
}
Player.prototype.autoTargetFar = function () {
  let best = null, bs = 1e9;
  for (const e of targetsOf('player')) { const d = this.dist(e); if (d > 28) continue; const a = Math.abs(angDiff(this.yaw, this.yawTo(e))); if (a > .35) continue; if (!losClear(this.pos.x, this.pos.y + 1.4, this.pos.z, e.pos.x, e.pos.y + e.h * .6, e.pos.z)) continue; const s = a * 20 + d; if (s < bs) { bs = s; best = e; } }
  return best;
};
const SPIN_DEF = { wind: .16, act: .32, rec: .3, psi: 0, th0: -200, th1: 200, r: .72, py: 1.25, mvA: 1.5, lin: true, poise: 45, mul: 1.15, body: { twist: 1, lean: .15, spin: 1 } };
const STEP_DEF = { kind: 'thrust', wind: .06, act: .14, rec: .42, from: [-.15, 1.25, -.05], to: [-.08, 1.3, .85], mvA: 4, poise: 60, mul: 1.6, body: { twist: .3, lean: .45, lunge: 1 } };
const SKILL_FN = {
  arco: {
    start(p) {
      p.useIK = false; if (p.wmesh) p.wmesh.visible = false; p.offW.visible = false; p.bow.visible = true; p.anim.play(CLIP.bowdraw); p.vel.set(0, 0, 0);
      const t = p.lock && p.lock.alive ? p.lock : p.autoTargetFar(); p.yaw = t ? p.yawTo(t) : CAM.yaw; sfx('dagger', { vol: .3, rate: .6 });
    },
    update(p, dt, k) {
      p.vel.set(0, 0, 0); if (p.lock && p.lock.alive) p.turn(p.yawTo(p.lock), 10, dt);
      if (!k.done.shot && k.t >= .44) {
        k.done.shot = 1; const from = handPos(p, 'L').clone(); from.y += .05; const d = aimDir(p, from);
        const dmg = Math.round(40 * STATS.str() * (1 + PROG.level * .012));
        new Projectile({ pos: from, vel: d.multiplyScalar(44), r: .1, dmg, poiseDmg: 14, team: 'player', owner: p, mesh: arrowMesh(.8), orient: true, life: 2, kb: 1.5, grav: 1.5, onExplode: (pos) => burst(pos.x, pos.y, pos.z, 5, { add: false, color: 0x8a7a60, smin: .5, smax: 2, lmin: .2, lmax: .4 }), sfxHit: 'hit_spear' });
        sfx('bow', { vol: .7, jit: .05 });
      }
      if (k.t >= .78) { p.anim.stop(.15); return 'done'; }
    }
  },
  fogo: {
    start(p) { p.anim.play(CLIP.cast); p.vel.set(0, 0, 0); const t = p.lock && p.lock.alive ? p.lock : p.autoTargetFar(); if (t) p.yaw = p.yawTo(t); sfx('cast_fire', { vol: .4 }); k_glow(p, 0xff7a2a); },
    update(p, dt, k) {
      p.vel.set(0, 0, 0);
      if (!k.done.cast && k.t >= .36) {
        k.done.cast = 1; const from = handPos(p, 'L').clone(); const d = aimDir(p, from); const dmg = Math.round(105 * STATS.fai());
        new Projectile({
          pos: from, vel: d.multiplyScalar(17), r: .22, dmg, poiseDmg: 30, type: 'fire', team: 'player', owner: p, mesh: orbMesh(.2, 0xff6a1a, 0xffe2a0), light: 3.5, lightR: 7, color: 0xff7a2a, trailRate: 45, homing: p.lock ? 2.2 : 0, target: p.lock, life: 3, kb: 4, status: { burn: 3 },
          onExplode: (pos) => { aoe({ x: pos.x, y: pos.y - .8, z: pos.z, r: 2.3, dmg: Math.round(dmg * .45), poiseDmg: 15, type: 'fire', team: 'player', owner: p, maxH: 3, dur: .1, kb: 3 }); burst(pos.x, pos.y, pos.z, 30, { color: 0xff8a2a, color2: 0xffe0a0, smin: 2, smax: 6, lmin: .3, lmax: .7, szmin: .1, szmax: .3 }); flashLight(pos.x, pos.y, pos.z, 0xff7020, 8, 9, .5); sfx('explosion', { pos, vol: .6 }); sfx('fire', { pos, vol: .4 }); shake(.1); }
        });
        sfx('fireball', { vol: .55 });
      }
      if (k.t >= .7) return 'done';
    }
  },
  giro: {
    start(p) { k_spin(p, 1); sfx('warcry', { vol: .25, rate: 1.3 }); },
    update(p, dt, k) {
      const r = p.updAttack(dt); p.checkHits();
      if (!k.done.aoe1 && p.atk && p.atk.phase === 'act') { k.done.aoe1 = 1; aoe({ x: p.pos.x, y: p.pos.y, z: p.pos.z, r: 2.5, dmg: Math.round(p.w.dmg * .9 * STATS.str() * p.wUp() * (1 + PROG.fai * .03)), poiseDmg: 40, team: 'player', owner: p, dur: .3, kb: 5 }); ringFx(p.pos.x, p.pos.y, p.pos.z, .5, 2.8, .4, 0xffe0b0, .7); }
      if (r === 'done' || !p.atk) {
        if (!k.done.second) { k.done.second = 1; k.done.aoe1 = 0; k_spin(p, .85); return; }
        return 'done';
      }
    }
  },
  salto: {
    start(p) {
      const t = p.lock && p.lock.alive ? p.lock : p.autoTargetFar(); let tx, tz;
      if (t && p.dist(t) < 11) { tx = t.pos.x; tz = t.pos.z; p.yaw = p.yawTo(t); } else { tx = p.pos.x + Math.sin(p.yaw) * 6.5; tz = p.pos.z + Math.cos(p.yaw) * 6.5; }
      const d = Math.hypot(tx - p.pos.x, tz - p.pos.z), T = .75; p.leapV = new V3((tx - p.pos.x) / T * .92, 0, (tz - p.pos.z) / T * .92); if (d < 1) p.leapV.set(0, 0, 0);
      p.vy = 9.5; p.onGround = false; p.fallStartY = p.pos.y + 99; p.anim.play(CLIP.jump); synth('roll', 1); sfx('warcry', { vol: .3, rate: 1.1 });
      p.attack({ wind: .5, act: .2, rec: .5, psi: 90, th0: 150, th1: -60, poise: 80, mul: 1.5, body: { twist: .1, lean: .6, lunge: 1 } }, t);
    },
    update(p, dt, k) {
      if (!p.onGround) { p.vel.set(p.leapV.x, 0, p.leapV.z); if (p.atk && p.atk.t > .5) p.atk.t = .5; if (k.t > .1 && p.vy < 0) p.vy -= 10 * dt; }
      else if (!k.done.land && k.t > .15) {
        k.done.land = 1; p.vel.set(0, 0, 0); const x = p.pos.x + Math.sin(p.yaw) * 1, z = p.pos.z + Math.cos(p.yaw) * 1;
        aoe({ x, y: p.pos.y, z, r: 3.4, dmg: Math.round(p.w.dmg * 1.7 * STATS.str() * p.wUp() * STATS.fai()), poiseDmg: 90, team: 'player', owner: p, dur: .12, kb: 9, up: 3 });
        ringFx(x, p.pos.y, z, .5, 4.2, .55, 0xffc080, .9); burst(x, p.pos.y + .1, z, 34, { add: false, color: 0x6b6458, smin: 2, smax: 7, lmin: .5, lmax: 1.1, szmin: .2, szmax: .45, upBias: .9, alpha: .55, grav: 5 });
        burst(x, p.pos.y + .2, z, 18, { color: 0xffa040, smin: 2, smax: 6, lmin: .3, lmax: .6 }); sfx('quake', { vol: .8 }); synth('boom', .7); shake(.45); flashLight(x, p.pos.y + 1, z, 0xffa050, 5, 8, .4);
      }
      const r = p.onGround ? p.updAttack(dt) : null;
      if (k.done.land && (r === 'done' || !p.atk)) return 'done';
      if (k.t > 3) return 'done';
    }
  },
  passo: {
    start(p) {
      const t = p.lock && p.lock.alive ? p.lock : p.autoTargetFar(); let nx, nz;
      if (t && p.dist(t) < 14) { const by = t.yaw + PI; const back = t.r + p.r + .5; nx = t.pos.x + Math.sin(by) * back; nz = t.pos.z + Math.cos(by) * back; if (!validSpot(nx, t.pos.y, nz)) { nx = t.pos.x - Math.sin(p.yawTo(t)) * (back); nz = t.pos.z - Math.cos(p.yawTo(t)) * back; } }
      else { nx = p.pos.x + Math.sin(p.yaw) * 6; nz = p.pos.z + Math.cos(p.yaw) * 6; }
      for (let i = 0; i < 6 && !validSpot(nx, p.pos.y, nz); i++) { nx = lerp(nx, p.pos.x, .3); nz = lerp(nz, p.pos.z, .3); }
      burst(p.pos.x, p.pos.y + 1, p.pos.z, 26, { color: 0x8a6aff, color2: 0x1a0a30, smin: 1, smax: 4, lmin: .3, lmax: .7, szmin: .1, szmax: .25 });
      sfx('tele', { vol: .55 }); sfx('dark', { vol: .4 });
      const g = groundAt(nx, nz, p.pos.y + 2); p.pos.set(nx, g > -1e8 ? g : p.pos.y, nz); p.iframe = .45; if (t) p.yaw = p.yawTo(t);
      burst(p.pos.x, p.pos.y + 1, p.pos.z, 26, { color: 0x8a6aff, color2: 0x1a0a30, smin: 1, smax: 4, lmin: .3, lmax: .7, szmin: .1, szmax: .25 });
      flashLight(p.pos.x, p.pos.y + 1, p.pos.z, 0x8a6aff, 4, 6, .4);
      p.attack(STEP_DEF, t); p.atk.mul = STEP_DEF.mul; p.atk.crit = 1.45;
    },
    update(p, dt, k) { const r = p.updAttack(dt); p.checkHits(); if (r === 'done' || !p.atk) return 'done'; }
  },
  luz: {
    start(p) { p.anim.play({ dur: 1.05, keys: [[0, {}], [.55, { armL: [-2.9, 0, .2], foreL: [-.1, 0, 0], chest: [-.2, .3, 0], head: [-.2, 0, 0], legL: [-.3, 0, 0], legR: [.3, 0, 0] }, 'out'], [.75, { armL: [-1.5, -.3, .1], foreL: [0, 0, 0], chest: [.15, -.3, 0], legL: [-.5, 0, 0], legR: [.4, 0, 0] }, 'in'], [1.05, {}]] }); const t = p.lock && p.lock.alive ? p.lock : p.autoTargetFar(); if (t) p.yaw = p.yawTo(t); sfx('holy1', { vol: .5 }); k_glow(p, 0xfff0c0, .7); },
    update(p, dt, k) {
      p.vel.set(0, 0, 0); if (p.lock && p.lock.alive) p.turn(p.yawTo(p.lock), 6, dt);
      if (k.t < .6 && Math.random() < dt * 40) { const h = handPos(p, 'L'); burst(h.x, h.y, h.z, 1, { color: 0xfff0c0, smin: .2, smax: .8, lmin: .3, lmax: .5, szmin: .05, szmax: .1 }); }
      if (!k.done.cast && k.t >= .72) {
        k.done.cast = 1; const from = handPos(p, 'L').clone(); const d = aimDir(p, from); const dmg = Math.round(250 * STATS.fai());
        const mesh = new THREE.Group(); const core = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2.2, 6), new THREE.MeshBasicMaterial({ color: 0xfffbe8 })); core.rotation.x = HPI; mesh.add(core);
        const halo = new THREE.Mesh(new THREE.CylinderGeometry(.16, .02, 2.6, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false })); halo.rotation.x = HPI; mesh.add(halo);
        new Projectile({ pos: from, vel: d.multiplyScalar(34), r: .3, dmg, poiseDmg: 70, type: 'holy', team: 'player', owner: p, mesh, orient: true, pierce: true, light: 4, lightR: 8, color: 0xfff0c0, trailRate: 60, life: 1.6, kb: 7, onHitFx: t => { burst(t.pos.x, t.pos.y + 1, t.pos.z, 20, { color: 0xfff0c0, smin: 2, smax: 6, lmin: .2, lmax: .5 }); flashLight(t.pos.x, t.pos.y + 1, t.pos.z, 0xfff0c0, 6, 7, .3); } });
        sfx('holy3', { vol: .8 }); sfx('lightning', { vol: .35 }); shake(.15); flashLight(from.x, from.y, from.z, 0xfff0c0, 6, 8, .4);
      }
      if (k.t >= 1.05) return 'done';
    }
  },
};
function k_spin(p, mul) { p.attack(SPIN_DEF, p.lock); p.atk.mul = SPIN_DEF.mul * mul; sfx('whoosh2', { vol: .6, rate: .8 }); }
function k_glow(p, color, dur = .5) { const L = addLight(0, 0, 0, color, 3, 5, .1); let t = 0; FX.list.push({ update: dt => { t += dt; const h = handPos(p, 'L'); L.x = h.x; L.y = h.y; L.z = h.z; L.int = 3 * Math.min(1, t / .2) * (t > dur ? Math.max(0, 1 - (t - dur) / .3) : 1); if (t > dur + .3) { removeLight(L); return false; } } }); }
function validSpot(x, y, z) { const g = groundAt(x, z, y + 1.5, 2); if (g < y - 2 || g === -Infinity) return false; for (let a = 0; a < 4; a++) if (pointBlocked(x + Math.sin(a * HPI) * .3, g + 1, z + Math.cos(a * HPI) * .3)) return false; return true; }
