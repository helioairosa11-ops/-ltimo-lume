// ===================== O DESPERTO (jogador) =====================
function newProg() {
  return { level: 1, vig: 0, str: 0, fai: 0, cinzas: 0, flasks: 3, flaskMax: 3, flaskPow: 0, weapon: 'espada', weapons: ['espada'], wLvl: { espada: 0, machado: 0, adagas: 0, montante: 0 }, skills: [], skillIdx: 0, abil: {}, tals: [], talEq: [null, null, null], talSlots: 2, items: {}, keys: {}, flags: {}, bossDown: {}, bonfires: {}, lastBonfire: null, room: null, deaths: 0, time: 0, shade: null, letters: 0, picked: {}, seen: {}, lore: {}, bestiary: {}, map: {}, kills: 0 };
}
let PROG = newProg();
const TAL_FX = {
  tal_vigor: { hp: 30 }, tal_folego: { dashCd: .35 }, tal_brasa: { fire: .35 }, tal_pena: { iframe: .1 }, tal_escudo: { def: .15 },
  tal_foco: { fpGain: .5 }, tal_lua: { spell: .25 }, tal_furia: { lowHp: .4 }, tal_vampiro: { lifesteal: 1 }, tal_corvo: { cinzas: .25 },
};
function talSum(k) { let s = 0; for (const t of PROG.talEq) if (t && TAL_FX[t] && TAL_FX[t][k]) s += TAL_FX[t][k]; return s; }
const WEAPONS = {
  espada: { name: 'Espada do Desperto', dmg: 11, reach: 1, speed: 1, hits: 3, color: 0xfff6e0 },
  machado: { name: 'Machado do Carrasco', dmg: 17, reach: 1.15, speed: .78, hits: 2, color: 0xffd0a0, heavyShock: true },
  adagas: { name: 'Adagas da Caçadora', dmg: 7, reach: .8, speed: 1.45, hits: 5, color: 0xd8f0ff },
  montante: { name: 'Espada do Rei Apagado', dmg: 15, reach: 1.35, speed: .85, hits: 3, color: 0xffb070, fire: true },
};
const STATS = {
  maxHp: () => 100 + PROG.vig * 9 + talSum('hp'),
  maxFp: () => 99,
  str: () => 1 + PROG.str * .07,
  fai: () => 1 + PROG.fai * .09 + talSum('spell'),
  flaskHeal: () => Math.round(STATS.maxHp() * (.42 + PROG.flaskPow * .06)),
  levelCost: () => Math.round(90 * Math.pow(1.11, PROG.level - 1) + PROG.level * 20),
  wDmg: () => { const w = WEAPONS[PROG.weapon]; return w.dmg * STATS.str() * (1 + (PROG.wLvl[PROG.weapon] || 0) * .1); },
};
let PLAYER = null;
class Player extends Actor {
  constructor(x, y) {
    super({ x, y, w: 18, h: 40, team: 'player', hp: STATS.maxHp(), maxHp: STATS.maxHp(), isPlayer: true });
    this.fp = 33; this.coyote = 0; this.jumpHeld = false; this.airJumps = 0; this.airDash = 0; this.dashCd = 0; this.dashT = 0; this.atkCd = 0; this.combo = 0; this.comboT = 0;
    this.atk = null; this.charge = 0; this.charged = false; this.safe = { x, y }; this.safeT = 0; this.after = []; this.runPh = 0; this.squash = 0; this.land = 0;
    this.scarf = []; for (let i = 0; i < 6; i++) this.scarf.push({ x, y: y - 30, vx: 0, vy: 0 }); this.drink = 0; this.hitCount = 0; this.hitT = 0; this.dropT = 0; this.lookT = 0; this.spellCd = 0; this.ctrl = true;
  }
  get speed() { return 228; }
  update(dt) {
    this.st += dt; this.inv = Math.max(0, this.inv - dt); this.flash = Math.max(0, this.flash - dt * 4); this.dashCd -= dt; this.atkCd -= dt; this.comboT -= dt; this.spellCd -= dt; this.hitT -= dt; this.dropT = Math.max(0, this.dropT - dt);
    if (this.hitT <= 0) this.hitCount = 0;
    if (!this.alive) { this.vx *= .9; this.physics(dt); return; }
    const ax = this.ctrl ? axisX() : 0, ay = this.ctrl ? axisY() : 0;
    switch (this.state) {
      case 'hurt': this.vx *= Math.exp(-4 * dt); if (this.st > .22) this.setState('idle'); this.physics(dt); break;
      case 'hazard': this.vx = 0; this.vy = 0; if (this.st > .55) { this.x = this.safe.x; this.y = this.safe.y; this.vx = this.vy = 0; this.setState('idle'); this.inv = 1; flashFx(this.x, this.cy, 40, 0xffe0b0, .3); } break;
      case 'dash': this.updDash(dt, ax); break;
      case 'drink': this.updDrink(dt, ax); break;
      case 'cast': this.vx *= Math.exp(-8 * dt); if (this.castFn) this.castFn(dt, this.st); if (this.st > (this.castDur || .35)) this.setState('idle'); this.physics(dt); break;
      case 'skill': if (this.skillUpd && this.skillUpd(dt, this.st) === false) { this.skillUpd = null; this.veilPass = false; this.noGrav = false; this.setState('idle'); } else this.physics(dt); break;
      case 'busy': this.vx = 0; if (this.st > (this.busyT || .5)) this.setState('idle'); this.physics(dt); break;
      case 'sit': this.vx = 0; this.physics(dt); break;
      case 'frozen': this.vx = 0; this.physics(dt); break;
      default: this.updNormal(dt, ax, ay);
    }
    // perigos
    if (this.alive && this.state !== 'hazard') {
      const hz = overlapCell(this, [5, 8], 4);
      if (hz) this.hazardHit(hz.c === 8 ? 'lava' : 'spikes');
      const lq = liquidAt(this.x, this.y - 6); this.inWater = lq === 6 || lq === 7;
      if (lq === 7 && this.inv <= 0) { this.poisonT = (this.poisonT || 0) - dt; if (this.poisonT <= 0) { this.poisonT = .5; this.hurtRaw(4, 'poison'); } }
    }
    // posição segura (para voltar depois de cair em espinhos)
    if (this.onGround && this.state !== 'hazard') { this.safeT += dt; const c = cellAt(Math.floor(this.x / T), Math.floor((this.y + 2) / T)); if (this.safeT > .15 && (isRock(c) || c === 4) && !overlapCell(this, [5, 6, 7, 8], -6)) { this.safe.x = this.x; this.safe.y = this.y; } } else this.safeT = 0;
    if (this.y > ROOM.cur.h * T + 120) { if (!GAME.transition) this.hazardHit('fall'); }
    this.updScarf(dt); this.updAfter(dt);
    // luz própria (para o herói nunca se perder no escuro)
    light(this.x, this.y - 26, 150, 0xffe2b8, .55); light(this.x, this.y - 30, 46, 0xfff0d8, .5);
    if (this.charged) light(this.x, this.y - 20, 90, 0xfff0c0, .8 + Math.sin(G.t * 20) * .2);
  }
  // ---------- movimento normal ----------
  updNormal(dt, ax, ay) {
    const sp = this.speed * (this.inWater ? .65 : 1) * (this.charge > .1 ? .45 : 1) * (this.atk && this.onGround ? .6 : 1);
    const want = ax * sp; const acc = this.onGround ? 2600 : 1900;
    this.vx = approach(this.vx, want, acc * dt);
    if (ax && !this.atk && this.charge <= .1) this.face = Math.sign(ax);
    // salto
    if (this.onGround) { this.coyote = .1; this.airJumps = 0; this.airDash = 0; } else this.coyote -= dt;
    if (ay > 0 && this.onGround && inPeek('jump') && cellAt(Math.floor(this.x / T), Math.floor((this.y + 2) / T)) === 4) { inConsume('jump'); this.dropT = .25; this.onGround = false; this.y += 2; }
    else if (inPeek('jump', .13)) {
      if (this.coyote > 0) { inConsume('jump', .13); this.vy = this.inWater ? -560 : -650; this.coyote = 0; this.jumpHeld = true; synth('jump'); this.squash = -.2; burst(this.x, this.y, 5, { color: ROOM.theme.top, glow: false, dir: -HPI, spread: 1.2, smin: 20, smax: 70, lmin: .2, lmax: .4, szmin: 1, szmax: 2 }); }
      else if (PROG.abil.asas && this.airJumps < 1) { inConsume('jump', .13); this.airJumps++; this.vy = -580; this.jumpHeld = true; sfx('whoosh2', at(this, .45, { rate: 1.3 })); this.squash = -.25; this.wingT = .35; burst(this.x, this.y - 10, 16, { color: [0xd8d0c4, 0xfff0d8, 0x9a948a], glow: false, dir: HPI, spread: 1.1, smin: 40, smax: 140, lmin: .3, lmax: .7, szmin: 1.5, szmax: 3, shape: 'r' }); }
    }
    if (this.jumpHeld && !inHeld('jump') && this.vy < -120) { this.vy *= .42; this.jumpHeld = false; }
    if (this.vy >= 0) this.jumpHeld = false;
    // dash / esquiva
    if (inConsume('dash', .12) && this.dashCd <= 0 && (this.onGround || this.airDash < 1)) { this.startDash(ax || this.face); return; }
    // ataques
    this.updAttackInput(dt, ay);
    // frasco
    if (inConsume('heal') && !this.atk) { if (PROG.flasks > 0 && this.hp < this.maxHp) { this.setState('drink'); this.drinkDone = false; sfx('flask', at(this, .6)); return; } else UI.flaskEmpty(); }
    // feitiço
    if (inConsume('spell') && !this.atk && this.spellCd <= 0) { if (useSkill(this)) return; }
    if (inConsume('next')) cycleSkill();
    // interagir (E, ou cima quando há algo)
    if (GAME.interact && this.onGround && !this.atk && (inConsume('interact') || (ay < 0 && inConsume('up', .2)))) { GAME.interact.act(); return; }
    // gravidade mais forte a cair
    const gmul = this.vy > 0 ? 1.18 : 1; this.vy = Math.min(this.inWater ? 300 : MAXFALL, this.vy + GRAV * (gmul - 1) * dt);
    this.updAttack(dt);
    this.physics(dt);
    if (this.onGround && Math.abs(this.vx) > 20) { this.runPh += dt * Math.abs(this.vx) / 26; if ((this.runPh % PI) < dt * Math.abs(this.vx) / 26) footstep(this); } else this.runPh = 0;
  }
  onLand() { const v = this.vyBefore || 0; this.squash = .22; if (v > 500) { synth('land', .8); burst(this.x, this.y, 8, { color: ROOM.theme.top, glow: false, dir: -HPI, spread: 1.4, smin: 30, smax: 100, lmin: .2, lmax: .5, szmin: 1, szmax: 2.2 }); } else sfx('step' + rndi(1, 4), at(this, .25)); }
  physics(dt) { this.vyBefore = this.vy; if (this.noGrav) { moveActor(this, dt); return; } super.physics(dt); }
  // ---------- dash ----------
  startDash(dir) {
    this.face = dir > 0 ? 1 : -1; this.setState('dash'); this.dashT = 0; this.atk = null; this.charge = 0; this.charged = false;
    if (!this.onGround) this.airDash++;
    this.dashCd = .42 - talSum('dashCd') * .42 * .5; this.inv = Math.max(this.inv, .2 + talSum('iframe')); this.dodgeWin = .14 + talSum('iframe'); this.dashAtk = false;
    synth('dash'); sfx('whoosh' + rndi(1, 3), at(this, .35, { rate: 1.2 }));
    burst(this.x - this.face * 8, this.y - 14, 10, { color: [0xd8d0c4, 0x9a948a], glow: false, dir: this.face > 0 ? PI : 0, spread: .5, smin: 60, smax: 200, lmin: .15, lmax: .35, szmin: 1, szmax: 2.4, shape: 'r' });
  }
  updDash(dt, ax) {
    this.dashT += dt; this.dodgeWin -= dt; const D = .17;
    this.vx = this.face * 640; this.vy = 0;
    if (this.dashT % .03 < dt) this.after.push({ x: this.x, y: this.y, face: this.face, t: .22, pose: 'dash' });
    if (inConsume('attack', .15)) { this.dashAtk = true; }
    moveActor(this, dt);
    if (this.dashT >= D || this.hitWall) {
      this.vx = this.face * 180; this.setState('idle');
      if (this.dashAtk || inPeek('attack', .12)) { inConsume('attack', .12); this.startAttack('thrust'); }
    }
  }
  // ---------- frasco ----------
  updDrink(dt, ax) {
    this.vx = approach(this.vx, ax * this.speed * .3, 1500 * dt); this.physics(dt);
    if (!this.drinkDone && this.st > .48) { this.drinkDone = true; PROG.flasks--; const h = STATS.flaskHeal(); this.hp = Math.min(this.maxHp, this.hp + h); this.status = null; sfx('heal', at(this, .7)); burst(this.x, this.y - 22, 26, { color: [0xffc070, 0xfff0c0, 0xff9a40], dir: -HPI, spread: 1.2, smin: 30, smax: 120, lmin: .4, lmax: .9 }); flashFx(this.x, this.y - 22, 50, 0xffc070, .4); UI.flaskUsed(); }
    if (this.st > .78) this.setState('idle');
  }
  // ---------- ataques ----------
  updAttackInput(dt, ay) {
    const w = WEAPONS[PROG.weapon];
    // golpe forte: toque rápido no botão forte = golpe pesado; segurar (forte ou ataque) = carregar o Grande Golpe
    if (!this.atk) {
      const hHeavy = inHeld('heavy'), hAtk = inHeld('attack') && inHeldTime('attack') > .26;
      if (hHeavy || hAtk) {
        if (!this.chargeSrc) this.chargeSrc = hHeavy ? 'heavy' : 'attack';
        const was = this.charge; this.charge += dt;
        if (was < .22 && this.charge >= .22) synth('charge');
        if (!this.charged && this.charge >= .62) { this.charged = true; synth('charged'); flashFx(this.x, this.y - 22, 40, 0xfff0c0, .25); }
        if (this.charge > .2 && Math.random() < dt * 30 * Math.min(1, this.charge * 2)) part({ x: this.x + rnd(-14, 14), y: this.y - rnd(0, 40), vx: 0, vy: rnd(-40, -10), life: .4, s: 1.4, color: 0xffe0b0, glow: true });
      } else if (this.chargeSrc) {
        const src = this.chargeSrc, ch = this.charged; this.chargeSrc = null; this.charge = 0; this.charged = false;
        if (ch) { this.startAttack('great'); return; }
        if (src === 'heavy' && this.atkCd <= 0) { this.startAttack('heavy'); return; }
      }
    }
    if (this.atkCd > 0 || this.atk) return;
    if (inConsume('attack', .14)) {
      if (ay < 0) this.startAttack('up');
      else if (ay > 0 && !this.onGround) this.startAttack('down');
      else if (!this.onGround) { this.combo = this.comboT > 0 ? (this.combo + 1) % 2 : 0; this.comboT = .5; this.startAttack(this.combo ? 'air2' : 'air1'); }
      else { const n = w.hits; this.combo = this.comboT > 0 ? this.combo + 1 : 0; if (this.combo >= n) this.combo = 0; this.comboT = .5 / w.speed + .2; this.startAttack(this.combo === n - 1 ? 'fin' : this.combo % 2 ? 'g2' : 'g1'); }
    }
  }
  startAttack(kind) {
    const w = WEAPONS[PROG.weapon], sp = w.speed, R = w.reach, D = STATS.wDmg();
    const A = {
      g1: { dur: .26 / sp, act: [.02, .1], ox: 30 * R, oy: -22, w: 54 * R, h: 36, mul: 1, ang: -.1, len: 40 * R, slash: 1 },
      g2: { dur: .26 / sp, act: [.02, .1], ox: 30 * R, oy: -20, w: 54 * R, h: 36, mul: 1, ang: .25, len: 40 * R, slash: -1 },
      fin: { dur: .4 / sp, act: [.07, .17], ox: 36 * R, oy: -22, w: 70 * R, h: 44, mul: 1.6, ang: 0, len: 52 * R, slash: 1, lunge: 300, kb: 340, poise: 30, big: 1 },
      air1: { dur: .26 / sp, act: [.02, .1], ox: 30 * R, oy: -22, w: 54 * R, h: 38, mul: 1, ang: -.15, len: 40 * R, slash: 1 },
      air2: { dur: .26 / sp, act: [.02, .1], ox: 30 * R, oy: -22, w: 54 * R, h: 38, mul: 1, ang: .3, len: 40 * R, slash: -1 },
      up: { dur: .28 / sp, act: [.02, .11], ox: 0, oy: -58, w: 42 * R, h: 52 * R, mul: 1, ang: -HPI, len: 42 * R, slash: 1, up: 1 },
      down: { dur: .28 / sp, act: [.02, .13], ox: 0, oy: 18, w: 36 * R, h: 50 * R, mul: 1, ang: HPI, len: 40 * R, slash: 1, down: 1 },
      thrust: { dur: .3, act: [.0, .18], ox: 34 * R, oy: -20, w: 80 * R, h: 24, mul: 1.5, ang: 0, len: 60 * R, slash: 0, thrust: 1, lunge: 520, multi: 0 },
      heavy: { dur: .45 / sp, act: [.14, .24], ox: 40 * R, oy: -24, w: 76 * R, h: 52, mul: 1.9, ang: -.35, len: 58 * R, slash: 1, kb: 360, poise: 40, big: 1 },
      great: { dur: .55, act: [.06, .2], ox: 34 * R, oy: -26, w: 130 * R, h: 64, mul: 2.8, ang: 0, len: 82 * R, slash: 1, kb: 420, poise: 70, big: 2, lunge: 200, both: 1 },
    }[kind];
    this.atk = Object.assign({ kind, t: 0, fired: false }, A); this.atkCd = 0;
    if (A.lunge && this.onGround) this.vx = this.face * A.lunge;
    if (kind === 'thrust') { this.vx = this.face * A.lunge; this.atk.lungeT = .16; }
    sfx(kind === 'great' || kind === 'heavy' ? 'whoosh3' : 'swing' + rndi(1, 3), at(this, kind === 'great' ? .8 : .5, { rate: kind === 'great' ? .8 : rnd(1.05, 1.25) * w.speed ** .3 }));
  }
  updAttack(dt) {
    const a = this.atk; if (!a) return; a.t += dt; const w = WEAPONS[PROG.weapon];
    if (a.lungeT > 0) { a.lungeT -= dt; this.vx = this.face * a.lunge; if (a.lungeT <= 0) this.vx *= .3; }
    if (!a.fired && a.t >= a.act[0]) {
      a.fired = true; const dmg = STATS.wDmg() * a.mul * (1 + (this.hp < this.maxHp * .3 ? talSum('lowHp') : 0));
      const color = w.color;
      // efeito visual do golpe
      if (a.slash) slashFx(this.x + (a.up || a.down ? 0 : this.face * 6), this.y - 22 + (a.up ? -10 : a.down ? 8 : 0), a.up || a.down ? 1 : this.face, a.up ? -HPI : a.down ? HPI : (a.slash < 0 ? .5 : -.25), a.len, a.big ? 14 : 10, color, a.big ? .2 : .13, { flat: a.big === 2 ? .45 : .62, follow: this, fx0: this.x, fy0: this.y });
      if (a.thrust) { const x0 = this.x, y0 = this.y - 20, f = this.face; fx({ dur: .2, layer: 'add', draw(c, ff, k) { c.globalAlpha = 1 - k; c.strokeStyle = css(color); c.lineWidth = 4 * (1 - k); c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - f * 10, y0); c.lineTo(x0 + f * (70 + 40 * k), y0); c.stroke(); } }); }
      if (a.big === 2) { shake(4); flashFx(this.x + this.face * 40, this.y - 24, 80, 0xfff0c0, .25); if (w.heavyShock && this.onGround) this.shockwave(); }
      const me = this;
      hitbox({
        owner: this, team: 'player', ox: a.ox, oy: a.oy, w: a.w, h: a.h, life: a.act[1] - a.act[0], dmg, kb: a.kb || 200, kby: a.up ? -380 : a.down ? 120 : -140, poise: a.poise || 14, type: w.fire && a.big ? 'fire' : 'phys', tiles: true, spark: !a.up && !a.down, pogo: !!a.down, heavy: !!a.big,
        onPogo: () => me.pogo(), dir: a.up || a.down ? 0 : undefined,
        onHit: (t, res) => {
          if (res === 'dodge' || res === 'block') { if (res === 'block') { me.vx = -me.face * 260; synth('clang'); hitStop(.05); } return; }
          me.fp = Math.min(STATS.maxFp(), me.fp + (t.boss ? 8 : 6) * (1 + talSum('fpGain'))); me.hitCount++; me.hitT = 1.6; UI.combo(me.hitCount);
          if (talSum('lifesteal') && me.hitCount % 6 === 0) { me.hp = Math.min(me.maxHp, me.hp + 4); }
          if (a.down) me.pogo();
          else if (!a.thrust && !a.big) { me.vx = -me.face * (me.onGround ? 140 : 90); }
          hitStop(a.big ? .09 : .045); shake(a.big ? 4 : 1.6);
        }
      });
      if (a.both) hitbox({ owner: this, team: 'player', ox: -a.ox * .5, oy: a.oy, w: a.w * .5, h: a.h, life: a.act[1] - a.act[0], dmg: dmg * .6, kb: 260, poise: 30, tiles: true });
    }
    if (a.t >= a.dur) { this.atk = null; this.atkCd = a.kind === 'fin' || a.big ? .12 : .02; }
  }
  pogo() { this.vy = -560; this.airDash = 0; this.airJumps = 0; this.jumpHeld = false; synth('pogo'); burst(this.x, this.y + 10, 8, { color: 0xfff0d8, smin: 40, smax: 160, lmin: .1, lmax: .3, dir: HPI, spread: 1.2 }); }
  shockwave() { for (const s of [-1, 1]) { const p = new Proj({ x: this.x + s * 20, y: this.y - 8, vx: s * 380, vy: 0, r: 8, dmg: STATS.wDmg() * .9, team: 'player', life: .5, color: 0xffb070, pierce: true, kind: 'orb', wall: true, poise: 30 }); p.trail = true; } synth('boom', .5); shake(5); }
  // ---------- dano ----------
  takeHit(h) {
    if (!this.alive || GAME.cine) return false;
    if (this.state === 'dash' || this.inv > 0) {
      if (this.state === 'dash' && this.dodgeWin > 0 && !h.env && !this.perfectT) this.perfectDodge(h);
      return 'dodge';
    }
    if (GAME.god) return false;
    let dmg = h.dmg * (1 - talSum('def')) * (h.type === 'fire' ? 1 - talSum('fire') : 1);
    dmg = Math.max(1, Math.round(dmg)); this.hurtRaw(dmg, h.type);
    if (!this.alive) return true;
    const dir = h.dir || (h.from ? Math.sign(this.x - h.from.x) : -this.face) || 1;
    this.vx = dir * 240; this.vy = -280; this.setState('hurt'); this.atk = null; this.charge = 0; this.charged = false; this.inv = 1.1;
    hitStop(.12); shake(7); UI.hurt(); vibrate(40);
    sfx('p_hurt' + rndi(1, 3), at(this, .55)); burst(this.x, this.cy, 14, { color: [0x1a1418, 0x3a3038], glow: false, smin: 60, smax: 200, lmin: .3, lmax: .6, szmin: 1.5, szmax: 3, shape: 'r' }); burst(this.x, this.cy, 10, { color: 0xffffff, smin: 80, smax: 260, lmin: .08, lmax: .2, szmin: 1, szmax: 2, shape: 'l' });
    return true;
  }
  hurtRaw(dmg, type) {
    this.hp -= dmg; this.flash = 1; dmgNum(this.x, this.y - 46, dmg, 'player');
    if (this.hp <= 0) { this.hp = 0; this.die(); }
  }
  perfectDodge(h) {
    this.perfectT = true; after(.4, () => this.perfectT = false);
    slowMo(.25, .45); this.fp = Math.min(STATS.maxFp(), this.fp + 15); synth('perfect'); ringFx(this.x, this.cy, 10, 60, 0xd8e8ff, .35, 3); UI.toast('Esquiva perfeita', 1.2);
  }
  hazardHit(kind) {
    if (this.state === 'hazard' || !this.alive) return;
    const dmg = kind === 'lava' ? Math.round(this.maxHp * .3) : kind === 'fall' ? Math.round(this.maxHp * .15) : Math.round(this.maxHp * .12);
    if (!GAME.god) this.hurtRaw(dmg, kind); if (!this.alive) return;
    this.setState('hazard'); this.atk = null; this.inv = 1; hitStop(.1); shake(6); UI.hurt(); sfx(kind === 'lava' ? 'burn' : 'p_hurt2', at(this, .6));
    burst(this.x, this.cy, 20, { color: kind === 'lava' ? [0xff6a20, 0xffc070] : [0x1a1418, 0x3a3038], glow: kind === 'lava', smin: 60, smax: 200 });
  }
  die() {
    this.alive = false; this.setState('dead'); this.atk = null; this.vx = 0; this.inv = 99;
    slowMo(.3, 1.2); sfx('p_die', at(this, .8)); synth('death'); shake(8);
    burst(this.x, this.cy, 40, { color: [0x1a1418, 0x3a3038, 0xffffff], glow: false, smin: 40, smax: 220, lmin: .6, lmax: 1.4, szmin: 1.5, szmax: 4, shape: 'r', grav: 120 });
    GAME.onPlayerDeath();
  }
  // ---------- cachecol e rastos ----------
  updScarf(dt) {
    const ax = this.x - this.face * 5, ay = this.y - 31; const s = this.scarf; s[0].x = ax; s[0].y = ay;
    for (let i = 1; i < s.length; i++) { const p = s[i], q = s[i - 1]; p.vx = (p.vx + (-this.face * 18 - this.vx * .06) * dt * 8) * Math.exp(-6 * dt); p.vy = (p.vy + 260 * dt) * Math.exp(-6 * dt) + Math.sin(G.t * 6 + i) * .5; p.x += p.vx * dt; p.y += p.vy * dt; const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy) || 1, L = 4.2; p.x = q.x + dx / d * L; p.y = q.y + dy / d * L; }
  }
  updAfter(dt) { for (let i = this.after.length - 1; i >= 0; i--) { this.after[i].t -= dt; if (this.after[i].t <= 0) this.after.splice(i, 1); } }
  busy(t, kind) { this.setState('busy'); this.busyT = t; this.busyKind = kind; this.atk = null; }
  draw(c) { drawHero(c, this); }
}
function footstep(a) { if (a.inWater) { sfx('water', at(a, .12, { rate: 1.8, jit: .1 })); return; } sfx('step' + rndi(1, 4), at(a, .22, { jit: .08 })); }
