// ===================== HABILIDADES (uma por área) =====================
const SKILLS = {
  arco: { name: 'Arco Longo', fp: 0, cd: .55, icon: 'arco', how: 'Dispara uma flecha para a frente (ou para cima, segurando cima). Não gasta foco.' },
  fogo: { name: 'Bola de Fogo', fp: 30, cd: .5, icon: 'fogo', how: 'Lança uma bola de fogo que atravessa inimigos e explode nas paredes.' },
  giro: { name: 'Giro do Lobo', fp: 22, cd: .6, icon: 'giro', how: 'Rodopia com a arma estendida, acertando tudo à volta várias vezes.' },
  salto: { name: 'Salto da Bigorna', fp: 25, cd: .6, icon: 'salto', how: 'Mergulha a pique e esmaga o chão. Parte chão frágil.' },
  passo: { name: 'Passo Sombrio', fp: 18, cd: .5, icon: 'passo', how: 'Atravessa a sombra: passa por inimigos e véus negros, ferindo quem atravessa.' },
  luz: { name: 'Lança de Luz', fp: 33, cd: .6, icon: 'luz', how: 'Atira uma lança de luz pura que atravessa tudo.' },
};
function curSkill() { return PROG.skills[PROG.skillIdx] || null; }
function cycleSkill() { if (PROG.skills.length < 2) return; PROG.skillIdx = (PROG.skillIdx + 1) % PROG.skills.length; synth('ui'); UI.skillChanged(); }
function useSkill(p) {
  const id = curSkill(); if (!id) { UI.toast('Ainda não conheces nenhuma habilidade.', 1.6); return false; }
  const S = SKILLS[id]; if (p.fp < S.fp) { UI.noFp(); return false; }
  p.fp -= S.fp; p.spellCd = S.cd; p.atk = null; p.charge = 0; p.charged = false;
  SKILL_FN[id](p); return true;
}
const SKILL_FN = {
  arco(p) {
    const up = axisY() < 0; p.setState('cast'); p.castDur = .26; p.castFn = null; p.castPose = 'bow';
    after(.08, () => {
      const vx = up ? 0 : p.face * 980, vy = up ? -980 : 0;
      const pr = new Proj({ x: p.x + (up ? 0 : p.face * 14), y: p.y - (up ? 40 : 24), vx, vy, r: 4, dmg: Math.round(STATS.wDmg() * .9), team: 'player', life: .9, kind: 'arrow', color: 0xfff0d0, grav: up ? 0 : 160, light: false, poise: 8 });
      pr.onHit = (t, res) => { if (res !== 'dodge') p.fp = Math.min(STATS.maxFp(), p.fp + 3); };
      sfx('bow', at(p, .6, { jit: .05 }));
    });
  },
  fogo(p) {
    p.setState('cast'); p.castDur = .32; p.castFn = null; p.castPose = 'cast';
    sfx('cast_fire', at(p, .6));
    after(.1, () => {
      const pr = new Proj({ x: p.x + p.face * 16, y: p.y - 24, vx: p.face * 560, vy: 0, r: 9, dmg: Math.round(26 * STATS.fai()), team: 'player', life: 1.4, kind: 'orb', color: 0xff8a30, pierce: true, type: 'fire', trail: true, poise: 25 });
      pr.onDie = () => { ringFx(pr.x, pr.y, 6, 50, 0xffa040, .35, 4); burst(pr.x, pr.y, 22, { color: [0xff8a30, 0xffc070, 0xff5010], smin: 60, smax: 220 }); aoe({ x: pr.x, y: pr.y, r: 46, shape: 'circle', delay: 0, dur: .08, dmg: Math.round(14 * STATS.fai()), team: 'player', color: 0xff8a30, type: 'fire' }); sfx('fireball', { x: pr.x, y: pr.y, vol: .6 }); };
      p.vx = -p.face * 120; shake(2);
    });
  },
  giro(p) {
    p.setState('skill'); p.inv = Math.max(p.inv, .15); sfx('whoosh3', at(p, .7)); let last = -1;
    const w = WEAPONS[PROG.weapon];
    p.skillUpd = (dt, t) => {
      p.vx = approach(p.vx, axisX() * 160, 1200 * dt); p.vy = Math.min(p.vy, 120);
      const n = Math.floor(t / .09); if (n !== last && t < .62) { last = n; hitbox({ owner: p, team: 'player', ox: 0, oy: -20, w: 96 * w.reach, h: 52, life: .07, dmg: STATS.wDmg() * .55, kb: 120, kby: -60, poise: 8, tiles: true, onHit: (tt, r) => { if (r !== 'dodge') { p.fp = Math.min(STATS.maxFp(), p.fp + 2); hitStop(.02); } } }); slashFx(p.x, p.y - 22, n % 2 ? 1 : -1, n * 1.3, 46 * w.reach, 9, w.color, .12, { flat: .35 }); if (n % 2) sfx('swing' + rndi(1, 3), at(p, .35, { rate: 1.3 })); }
      p.spinA = t * 30; return t < .66;
    };
  },
  salto(p) {
    p.setState('skill'); p.inv = 1; p.atk = null; let phase = p.onGround ? 0 : 1; let t0 = 0; sfx('whoosh2', at(p, .6, { rate: .8 }));
    if (phase === 0) p.vy = -420;
    p.skillUpd = (dt, t) => {
      p.vx *= Math.exp(-10 * dt);
      if (phase === 0) { if (p.vy > -60) { phase = 1; t0 = t; } return true; }
      if (phase === 1) {
        p.vy = 1150; p.vx = 0; if (Math.random() < .9) part({ x: p.x + rnd(-6, 6), y: p.y - rnd(10, 40), vx: 0, vy: -200, life: .25, s: 2, color: 0xffc070, glow: true });
        hitbox({ owner: p, team: 'player', ox: 0, oy: 4, w: 30, h: 30, life: .03, dmg: Math.round(12 * STATS.fai()), kb: 120, poise: 20 });
        if (p.onGround) { phase = 2; t0 = t; slam(); }
        return true;
      }
      p.inv = Math.max(p.inv, .2); return t - t0 < .3;
    };
    function slam() {
      shake(9); hitStop(.08); synth('boom', .8); sfx('quake', at(p, .8));
      ringFx(p.x, p.y - 4, 10, 90, 0xffc070, .45, 6); burst(p.x, p.y - 2, 30, { color: [ROOM.theme.top, ROOM.theme.rim], glow: false, dir: -HPI, spread: 1.4, smin: 80, smax: 300, grav: 800, lmin: .4, lmax: .9, szmin: 2, szmax: 4, shape: 'r' });
      aoe({ x: p.x, y: p.y - 10, r: 80, shape: 'circle', delay: 0, dur: .1, dmg: Math.round(34 * STATS.fai()), team: 'player', color: 0xffc070, kb: 300, kby: -380 });
      // parte o chão frágil
      const tx = Math.floor(p.x / T), ty = Math.floor((p.y + 4) / T); let broke = false;
      for (let dx = -2; dx <= 2; dx++) for (let dy = 0; dy <= 1; dy++) if (cellAt(tx + dx, ty + dy) === 10) { breakFloor(tx + dx, ty + dy); broke = true; }
      if (broke) { p.onGround = false; sfx('cavein', at(p, .9)); }
    }
  },
  passo(p) {
    p.setState('skill'); p.veilPass = true; p.inv = Math.max(p.inv, .45); p.noGrav = true; p.vy = 0; sfx('dark', at(p, .7)); sfx('tele', at(p, .4, { rate: 1.4 }));
    // aparece atrás do inimigo mais próximo à frente, se houver
    let tgt = null, bd = 260; for (const e of ENEMIES) { if (!e.alive || e.noHit) continue; const dx = (e.x - p.x) * p.face; if (dx > 0 && dx < bd && Math.abs(e.cy - p.cy) < 60) { bd = dx; tgt = e; } }
    const dist = tgt ? (tgt.x - p.x) * p.face + tgt.w / 2 + 28 : 170; const x0 = p.x;
    let done = 0;
    p.skillUpd = (dt, t) => {
      const k = Math.min(1, t / .14); const wantX = x0 + p.face * dist * easeOut(k);
      p.vx = (wantX - p.x) / dt; p.vy = 0; moveActor(p, dt); p.vx = 0;
      if (Math.random() < .9) burst(p.x, p.y - 20, 2, { color: [0x5a3a8a, 0x1a0a2a, 0x8a6aff], glow: false, smin: 10, smax: 60, lmin: .3, lmax: .6, szmin: 2, szmax: 5, jy: 18 });
      p.after.push({ x: p.x, y: p.y, face: p.face, t: .2 });
      if (!done && k >= 1) { done = 1; hitbox({ x: (x0 + p.x) / 2, y: p.y - 20, w: Math.abs(p.x - x0) + 20, h: 44, team: 'player', owner: p, life: .05, dmg: Math.round(STATS.wDmg() * 1.6 * STATS.fai()), kb: 200, poise: 30, crit: true }); if (tgt && tgt.alive) { p.face = -p.face; } flashFx(p.x, p.y - 20, 40, 0x8a6aff, .3); }
      return t < .22;
    };
  },
  luz(p) {
    p.setState('cast'); p.castDur = .38; p.castFn = null; p.castPose = 'cast'; sfx('holy2', at(p, .7));
    flashFx(p.x + p.face * 14, p.y - 26, 40, 0xfff0c0, .3);
    after(.12, () => {
      const pr = new Proj({ x: p.x + p.face * 18, y: p.y - 24, vx: p.face * 1150, vy: 0, r: 7, dmg: Math.round(44 * STATS.fai()), team: 'player', life: .9, kind: 'spear', color: 0xfff0c0, pierce: true, wall: false, type: 'holy', poise: 40, trail: true });
      sfx('holy3', at(p, .5)); p.vx = -p.face * 160; shake(3);
    });
  },
};
function breakFloor(tx, ty) { setCell(tx, ty, 0); burst(tx * T + T / 2, ty * T + T / 2, 12, { color: [ROOM.theme.mid, ROOM.theme.rim, ROOM.theme.top], glow: false, smin: 40, smax: 160, grav: 700, lmin: .4, lmax: 1, szmin: 2, szmax: 4, shape: 'r' }); PROG.flags['floor_' + ROOM.cur.id + '_' + tx + '_' + ty] = 1; }
