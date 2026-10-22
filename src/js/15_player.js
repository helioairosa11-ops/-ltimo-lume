// ===================== JOGADOR =====================
const A_ = (o) => o; // atalho p/ legibilidade
const WEAPONS = {
  sword: {
    kind: 'sword', two: false, dmg: 58, hitSfx: ['hit_sword', 'hit_knife'], trail: 0xffe2b8,
    hold: { hand: [-.24, 1.05, .22], blade: [0, -.15, 1], edge: [0, 1, 0] },
    light: [
      A_({ wind: .26, act: .13, rec: .36, psi: -12, th0: -115, th1: 75, mvW: .4, mvA: 3.2, stam: 14, poise: 22, mul: 1, body: { twist: .6, lean: .25 } }),
      A_({ wind: .2, act: .13, rec: .36, psi: 18, th0: 85, th1: -105, mvW: .4, mvA: 3, stam: 14, poise: 22, mul: 1, body: { twist: .6, lean: .25 } }),
      A_({ wind: .32, act: .15, rec: .46, psi: 90, th0: 125, th1: -35, px: -.05, mvW: .3, mvA: 4, stam: 16, poise: 35, mul: 1.25, body: { twist: .15, lean: .45, lunge: .8 } }),
    ],
    heavy: A_({ wind: .5, act: .16, rec: .58, psi: 82, th0: 140, th1: -40, px: -.05, mvW: .2, mvA: 4.5, stam: 26, poise: 60, mul: 1.7, charge: .6, cmul: 2.4, body: { twist: .2, lean: .5, lunge: 1, rear: 1 } }),
    run: A_({ kind: 'thrust', wind: .16, act: .15, rec: .45, from: [-.15, 1.25, -.1], to: [-.1, 1.3, .8], mvW: 5, mvA: 6.5, stam: 16, poise: 30, mul: 1.2, body: { twist: .3, lean: .35, lunge: 1 } }),
    roll: A_({ wind: .12, act: .13, rec: .4, psi: -30, th0: -100, th1: 70, py: 1.1, mvW: 1, mvA: 3, stam: 14, poise: 22, mul: .95, body: { twist: .6, lean: .4 } }),
    jump: A_({ wind: .16, act: .26, rec: .46, psi: 90, th0: 130, th1: -60, stam: 18, poise: 50, mul: 1.6, body: { twist: .1, lean: .55, lunge: 1 } }),
  },
  axe: {
    kind: 'axe', two: true, dmg: 92, hitSfx: ['hit_axe', 'hit_mace'], trail: 0xffd090, scale: 1,
    hold: { hand: [-.12, 1.05, .32], blade: [.1, .9, .5], edge: [0, 0, 1] },
    light: [
      A_({ wind: .42, act: .17, rec: .52, psi: 48, th0: -125, th1: 60, mvW: .3, mvA: 3, stam: 21, poise: 45, mul: 1, body: { twist: .8, lean: .3 } }),
      A_({ wind: .38, act: .17, rec: .52, psi: -25, th0: 80, th1: -115, mvW: .3, mvA: 3, stam: 21, poise: 45, mul: 1, body: { twist: .8, lean: .3 } }),
      A_({ wind: .5, act: .18, rec: .62, psi: 90, th0: 140, th1: -40, mvW: .2, mvA: 3.5, stam: 24, poise: 70, mul: 1.35, body: { twist: .2, lean: .6, lunge: 1, rear: 1 }, shock: 2.2 }),
    ],
    heavy: A_({ wind: .7, act: .2, rec: .7, psi: 88, th0: 150, th1: -45, mvW: .1, mvA: 3, stam: 32, poise: 95, mul: 1.9, charge: .7, cmul: 2.6, shock: 3, body: { twist: .2, lean: .65, lunge: 1, rear: 1 } }),
    run: A_({ wind: .3, act: .2, rec: .6, psi: 90, th0: 140, th1: -40, mvW: 4, mvA: 5, stam: 24, poise: 60, mul: 1.4, jumpV: 4, body: { twist: .1, lean: .6, lunge: 1, jump: 1 } }),
    roll: A_({ wind: .2, act: .17, rec: .5, psi: -20, th0: -110, th1: 80, py: 1.05, mvA: 3, stam: 20, poise: 40, mul: 1, body: { twist: .8, lean: .4 } }),
    jump: A_({ wind: .2, act: .28, rec: .55, psi: 90, th0: 140, th1: -60, stam: 22, poise: 70, mul: 1.8, shock: 2.5, body: { twist: .1, lean: .6, lunge: 1 } }),
  },
  daggers: {
    kind: 'dagger', two: false, dual: true, dmg: 34, hitSfx: ['hit_knife', 'hit_sword'], trail: 0xd8e6ff,
    hold: { hand: [-.22, 1.1, .25], blade: [0, .2, 1], edge: [0, 1, 0] },
    light: [
      A_({ wind: .13, act: .09, rec: .22, psi: -15, th0: -100, th1: 60, r: .55, mvA: 3.5, stam: 9, poise: 12, mul: 1, body: { twist: .7, lean: .25 } }),
      A_({ wind: .12, act: .09, rec: .22, psi: 20, th0: 70, th1: -95, r: .55, mvA: 3.5, stam: 9, poise: 12, mul: 1, body: { twist: .7, lean: .25 } }),
      A_({ kind: 'thrust', wind: .12, act: .09, rec: .22, from: [-.15, 1.25, .05], to: [-.08, 1.3, .65], mvA: 4, stam: 9, poise: 12, mul: 1.05, body: { twist: .3, lean: .3, lunge: .8 } }),
      A_({ wind: .2, act: .12, rec: .34, psi: 0, th0: -150, th1: 150, r: .6, mvA: 3, stam: 12, poise: 20, mul: 1.35, body: { twist: 1, lean: .2, spin: 1 } }),
    ],
    heavy: A_({ wind: .32, act: .14, rec: .4, psi: 0, th0: -170, th1: 170, r: .65, mvW: .5, mvA: 4, stam: 18, poise: 30, mul: 1.5, charge: .4, cmul: 2.1, body: { twist: 1, lean: .25, spin: 1 } }),
    run: A_({ kind: 'thrust', wind: .1, act: .12, rec: .3, from: [-.15, 1.25, -.05], to: [-.1, 1.25, .75], mvW: 6, mvA: 8, stam: 12, poise: 20, mul: 1.2, body: { twist: .3, lean: .4, lunge: 1 } }),
    roll: A_({ wind: .08, act: .1, rec: .25, psi: -30, th0: -100, th1: 70, py: 1.1, mvA: 3.5, stam: 9, poise: 12, mul: 1, body: { twist: .7, lean: .4 } }),
    jump: A_({ wind: .12, act: .22, rec: .35, psi: 90, th0: 120, th1: -60, stam: 12, poise: 30, mul: 1.5, body: { twist: .1, lean: .5, lunge: 1 } }),
  },
  greatsword: {
    kind: 'kingsword', two: true, dmg: 112, hitSfx: ['hit_sword', 'hit_axe'], trail: 0xff9a50, fire: true,
    hold: { hand: [-.1, 1.05, .34], blade: [.05, .95, .4], edge: [0, 0, 1] },
    light: [
      A_({ wind: .46, act: .2, rec: .56, psi: 30, th0: -130, th1: 80, r: .7, mvW: .3, mvA: 3.5, stam: 24, poise: 55, mul: 1, body: { twist: .9, lean: .3 } }),
      A_({ wind: .42, act: .2, rec: .56, psi: -15, th0: 85, th1: -125, r: .7, mvW: .3, mvA: 3.5, stam: 24, poise: 55, mul: 1, body: { twist: .9, lean: .3 } }),
      A_({ wind: .55, act: .2, rec: .66, psi: 90, th0: 145, th1: -40, r: .7, mvW: .2, mvA: 4, stam: 27, poise: 80, mul: 1.4, shock: 2.6, body: { twist: .2, lean: .6, lunge: 1, rear: 1 } }),
    ],
    heavy: A_({ wind: .75, act: .22, rec: .75, psi: 0, th0: -170, th1: 175, r: .75, mvW: .2, mvA: 3, stam: 34, poise: 100, mul: 1.9, charge: .7, cmul: 2.6, body: { twist: 1, lean: .3, spin: 1 } }),
    run: A_({ kind: 'thrust', wind: .28, act: .2, rec: .6, from: [-.12, 1.25, -.15], to: [-.05, 1.3, .9], mvW: 4.5, mvA: 6, stam: 26, poise: 60, mul: 1.4, body: { twist: .3, lean: .4, lunge: 1 } }),
    roll: A_({ wind: .22, act: .2, rec: .55, psi: -25, th0: -115, th1: 80, py: 1.05, r: .7, mvA: 3, stam: 22, poise: 50, mul: 1.05, body: { twist: .8, lean: .4 } }),
    jump: A_({ wind: .22, act: .3, rec: .6, psi: 90, th0: 140, th1: -60, r: .7, stam: 24, poise: 80, mul: 1.9, shock: 3, body: { twist: .1, lean: .6, lunge: 1 } }),
  },
};
// ---------- progresso ----------
function newProg() {
  return { level: 1, vig: 0, men: 0, end: 0, str: 0, fai: 0, cinzas: 0, flasks: 3, flaskMax: 3, flaskPow: 0, weapon: 'sword', weapons: ['sword'], wLvl: { sword: 0, axe: 0, daggers: 0, greatsword: 0 }, skills: [], skillIdx: 0, tals: [], talEq: [null, null], items: {}, keys: {}, flags: {}, bossDown: {}, bonfires: {}, lastBonfire: null, area: 'crypt', deaths: 0, time: 0, stain: null, shards: 0, letters: 0, picked: {} };
}
let PROG = newProg();
const TAL_FX = { // talismãs
  tal_vigor: { hp: 120 }, tal_folego: { stamRegen: .3 }, tal_brasa: { fire: .2 }, tal_pena: { iframe: .06 }, tal_escudo: { def: .12 }, tal_foco: { fp: 30, fpRegen: .6 }, tal_lua: { skill: .18 }, tal_furia: { lowHp: .25 },
};
function talSum(k) { let s = 0; for (const t of PROG.talEq) if (t && TAL_FX[t] && TAL_FX[t][k]) s += TAL_FX[t][k]; return s; }
const STATS = {
  maxHp: () => 420 + PROG.vig * 34 + talSum('hp'),
  maxFp: () => 60 + PROG.men * 9 + talSum('fp'),
  maxStam: () => 96 + PROG.end * 6,
  str: () => 1 + PROG.str * .055,
  fai: () => 1 + PROG.fai * .075 + talSum('skill'),
  flaskHeal: () => Math.round(STATS.maxHp() * (.38 + PROG.flaskPow * .05) + 40),
  levelCost: () => Math.round(110 * Math.pow(1.105, PROG.level - 1) + PROG.level * 25),
};
// ---------- habilidades ----------
const SKILLS = {
  arco: { fp: 0, stam: 10, cd: .45 },
  fogo: { fp: 14, stam: 6, cd: .8 },
  giro: { fp: 12, stam: 24, cd: .9 },
  salto: { fp: 16, stam: 20, cd: 1.2 },
  passo: { fp: 18, stam: 10, cd: 1.2 },
  luz: { fp: 28, stam: 10, cd: 2 },
};
// ---------- classe ----------
class Player extends Fighter {
  constructor() {
    const rig = buildHumanoid({
      s: 1, mats: { body: MAT('cloth_grey'), arms: MAT('cloth_dark'), legs: MAT('leather'), boots: MAT('leather'), skin: MAT('leather'), accent: MAT('iron') },
      head: 'hood', cape: { mat: MAT('cloth_dark'), len: 1.15, w: .5 }, skirt: { len: .42, r1: .3, mat: MAT('cloth_dark'), flare: .02 }, pauldrons: MAT('iron')
    });
    const w = WEAPONS[PROG.weapon] || WEAPONS.sword;
    super({ rig, team: 'player', r: .36, h: 1.8, hp: STATS.maxHp(), poise: 25, mass: 1, weapon: w.kind, twoHand: w.two, hold: w.hold, trail: w.trail });
    this.isPlayer = true; this.w = w;
    // brasa no peito (identidade do Desperto)
    const ember = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), MAT('ember')); ember.position.set(0, .2, .13); rig.J.chest.add(ember);
    // segunda adaga / arco
    this.offW = weaponMesh('dagger', 1); rig.J.handL.add(this.offW); this.offW.visible = false; this.offW.rotation.x = 1.4;
    this.bow = weaponMesh('bow', 1); rig.J.handL.add(this.bow); this.bow.visible = false; this.bow.position.set(0, -.08, 0);
    this.stam = STATS.maxStam(); this.fp = STATS.maxFp(); this.stamDelay = 0; this.combo = 0; this.lastRoll = -9; this.lock = null; this.lockLost = 0;
    this.skillCd = 0; this.fallStartY = 0; this.moveV = new V3(); this.speed = 0; this.flaskT = 0; this.lantern = addLight(0, 0, 0, 0xffb878, 1.5, 9, .05); this.lantern.pri = true;
    this.applyWeapon();
    this.setState('move');
    for (const m of [rig.root]) m.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && o.material !== MAT('ember')) o.material = rimify(o.material, 0x8a6a4a, 3, .35); });
  }
  applyWeapon() {
    const w = WEAPONS[PROG.weapon] || WEAPONS.sword; this.w = w;
    this.setWeapon(w.kind, w.two, w.hold, w.scale || 1); this.trailColor = w.trail; if (this.trail) this.trail.setColor(w.trail);
    this.offW.visible = !!w.dual;
  }
  setState(s) { this.state = s; this.stT = 0; }
  useStam(n) { this.stam -= n; this.stamDelay = .65; }
  camBasis() { const y = CAM.yaw; return { fx: Math.sin(y), fz: Math.cos(y), rx: -Math.cos(y), rz: Math.sin(y) }; }
  inputDir() {
    const m = moveInput(); if (m.l < .12) return null;
    const b = this.camBasis(); const x = b.fx * m.y + b.rx * m.x, z = b.fz * m.y + b.rz * m.x; const l = Math.hypot(x, z) || 1;
    return { x: x / l, z: z / l, mag: m.l };
  }
  canAct() { return this.stam > 0; }
  update(dt) {
    if (!this.alive) { this.anim.update(dt); this.physics(dt); this.sync(); return; }
    this.stT += dt; this.iframe = Math.max(0, this.iframe - dt); this.skillCd = Math.max(0, this.skillCd - dt);
    const mxS = STATS.maxStam(); this.stamDelay -= dt;
    if (this.stamDelay <= 0 && this.state !== 'roll' && !this.sprinting) this.stam = Math.min(mxS, this.stam + (48 + talSum('stamRegen') * 48) * dt * (this.state === 'flask' ? .5 : 1));
    this.fp = Math.min(STATS.maxFp(), this.fp + (.6 + talSum('fpRegen')) * dt);
    this.updStatus(dt);
    this.updLock(dt);
    const S = this.state;
    const dir = this.inputDir();
    this.sprinting = false; this.ikBlend = 1; this.speedMul = 1;
    switch (S) {
      case 'move': this.stMove(dt, dir); break;
      case 'roll': this.stRoll(dt); break;
      case 'backstep': this.stBackstep(dt); break;
      case 'attack': this.stAttack(dt, dir); break;
      case 'air': this.stAir(dt, dir); break;
      case 'plunge': this.stPlunge(dt); break;
      case 'flask': this.stFlask(dt, dir); break;
      case 'hurt': this.vel.set(0, 0, 0); if (this.stT > .32) this.setState('move'); break;
      case 'knock': this.vel.set(0, 0, 0); this.iframe = Math.max(this.iframe, this.stT > .9 ? .2 : 0); if (this.stT > 1.45) this.setState('move'); break;
      case 'skill': this.stSkill(dt, dir); break;
      case 'busy': this.vel.set(0, 0, 0); if (this.busyT !== undefined && this.stT >= this.busyT) { this.busyT = undefined; this.setState('move'); } break;
      case 'sit': this.vel.set(0, 0, 0); break;
      case 'walkto': this.stWalkTo(dt); break;
      case 'frozen': this.vel.set(0, 0, 0); break;
    }
    // física
    this.physics(dt, { step: .55, snap: this.state === 'air' ? 0 : .5 });
    // perigos do chão
    const hz = hazardAt(this.pos.x, this.pos.y, this.pos.z);
    if (hz && this.onGround) { this.hazT = (this.hazT || 0) - dt; if (this.hazT <= 0) { this.hazT = .25; this.takeHit({ dmg: Math.round(hz.dps * .25), poiseDmg: 0, type: hz.kind === 'lava' ? 'fire' : 'poison', env: true, status: hz.kind === 'poison' ? { poison: 6 } : hz.kind === 'lava' ? { burn: 3 } : null }); } }
    this.inWater = !!waterAt(this.pos.x, this.pos.y, this.pos.z);
    this.anim.update(dt);
    this.sync();
    this.weaponIK(dt);
    this.updOffhand();
    this.checkHits();
    this.updTrail(); this.updCloth(dt);
    this.lantern.x = this.pos.x - Math.sin(this.yaw) * .6; this.lantern.y = this.pos.y + 2.1; this.lantern.z = this.pos.z - Math.cos(this.yaw) * .6;
  }
  updOffhand() {
    const J = this.rig.J;
    if (this.w.dual && this.offW.visible) { J.handL.rotation.set(1.3, 0, 0); }
  }
  // ---- estados ----
  stMove(dt, dir) {
    const locked = this.lock && this.lock.alive;
    let tgtSp = 0;
    if (dir) {
      const runHeld = inHeld('roll') && inHeldTime('roll') > .22;
      if (runHeld && this.stam > 1 && !locked) { this.sprinting = true; tgtSp = 6.6; this.stam -= 16 * dt; this.stamDelay = .5; }
      else tgtSp = dir.mag < .55 ? 1.9 : locked ? 3.4 : 4.4;
      if (this.inWater) tgtSp *= .65;
      if (this.status.poison) tgtSp *= .92;
    }
    const k = 1 - Math.exp(-14 * dt);
    const vx = dir ? dir.x * tgtSp : 0, vz = dir ? dir.z * tgtSp : 0;
    this.moveV.x += (vx - this.moveV.x) * k; this.moveV.z += (vz - this.moveV.z) * k;
    this.vel.set(this.moveV.x, 0, this.moveV.z);
    const sp = Math.hypot(this.moveV.x, this.moveV.z); this.speed = sp;
    if (locked) { this.turn(this.yawTo(this.lock), 14, dt); }
    else if (sp > .3) this.turn(Math.atan2(this.moveV.x, this.moveV.z), this.sprinting ? 9 : 13, dt);
    // animação de locomoção
    const amt = sp < .05 ? 0 : sp < 2.2 ? sp / 1.9 : sp < 5 ? 1 + (sp - 1.9) / 2.5 : 2 + (sp - 4.4) / 2.2;
    this.anim.amt = damp(this.anim.amt, clamp(amt, 0, 3), 10, dt);
    const stride = sp < 2.2 ? 1.35 : sp < 5 ? 2.1 : 2.6;
    this.anim.ph += dt * sp / stride * TAU * .5 * (sp > .1 ? 1 : 0);
    if (locked && sp > .3) { const ly = angDiff(this.yaw, Math.atan2(this.moveV.x, this.moveV.z)); this.anim.fx = Math.cos(ly); this.anim.sx = -Math.sin(ly); } else { this.anim.fx = 1; this.anim.sx = 0; }
    // passos
    this._lastPh = this._lastPh || 0; const pp = Math.floor(this.anim.ph / PI); if (pp !== this._lastPh && sp > .8) { this._lastPh = pp; footstep(this, sp > 5 ? 1 : .7); }
    if (!this.onGround && this.airT > .12) { this.fallStartY = this.pos.y; this.setState('air'); this.anim.play(CLIP.fall); return; }
    // ações
    if (this.rollReleased()) { if (this.canAct()) { dir ? this.doRoll(dir) : this.doBackstep(); return; } }
    if (inConsume('jump') && this.canAct() && this.onGround) { this.doJump(dir); return; }
    if (inConsume('atk') && this.canAct()) { this.doAttack(this.sprinting ? 'run' : (TIME.now - this.lastRoll < .32 ? 'roll' : 'light')); return; }
    if (inPeek('heavy', .25) && this.canAct()) { inConsume('heavy', .25); this.doAttack('heavy'); return; }
    if (inConsume('flask')) { this.doFlask(); return; }
    if (inConsume('skill')) { this.doSkill(); return; }
    if (inConsume('skillNext')) this.cycleSkill(1); if (inConsume('skillPrev')) this.cycleSkill(-1);
    if (inConsume('interact')) { const it = GAME.interact; if (it) { it.act(); return; } }
  }
  // rolar dispara ao soltar (segurar = correr)
  rollReleased() {
    const up = IN.buf['roll_up']; const dn = IN.buf['roll'];
    if (up !== undefined && TIME.real - up < .2) {
      const heldFor = up - (IN.holdStart.roll || up);
      delete IN.buf['roll_up']; delete IN.buf['roll'];
      if (heldFor < .3) return true;
    }
    return false;
  }
  doRoll(dir) {
    this.useStam(18); this.setState('roll'); this.rollDir = dir; this.yaw = Math.atan2(dir.x, dir.z); this.anim.play(CLIP.roll);
    synth('roll', .8); sfx('whoosh3', { pos: this.pos, vol: .3, rate: .7 }); this.moveV.set(0, 0, 0);
  }
  stRoll(dt) {
    const t = this.stT, D = .58, iw = .4 + talSum('iframe');
    if (t > .05 && t < iw) this.iframe = Math.max(this.iframe, .02);
    const sp = t < .38 ? lerp(7.4, 5, t / .38) : lerp(5, 0, (t - .38) / .2);
    this.vel.set(this.rollDir.x * sp * (this.inWater ? .7 : 1), 0, this.rollDir.z * sp * (this.inWater ? .7 : 1));
    if (t > .2 && Math.random() < dt * 20) burst(this.pos.x, this.pos.y + .1, this.pos.z, 1, { add: false, color: 0x6b6458, smin: .2, smax: .8, lmin: .3, lmax: .6, szmin: .15, szmax: .3, alpha: .4 });
    if (t >= D) { this.lastRoll = TIME.now; this.setState('move'); }
    else if (t > .44) { // cancelar em ataque/rolagem
      if (inPeek('atk', .25)) { inConsume('atk', .25); this.lastRoll = TIME.now; this.doAttack('roll'); }
    }
  }
  doBackstep() { this.useStam(11); this.setState('backstep'); this.anim.play(CLIP.backstep); synth('roll', .5); }
  stBackstep(dt) {
    const t = this.stT; if (t > .03 && t < .26 + talSum('iframe')) this.iframe = Math.max(this.iframe, .02);
    const sp = t < .3 ? lerp(6, 1, t / .3) : 0; this.vel.set(-Math.sin(this.yaw) * sp, 0, -Math.cos(this.yaw) * sp);
    if (t > .42) this.setState('move');
  }
  doJump(dir) {
    this.useStam(9); this.vy = 7.4; this.onGround = false; this.fallStartY = this.pos.y; this.setState('air'); this.anim.play(CLIP.jump);
    this.airVel = new V3(dir ? dir.x * Math.max(this.speed, 3.4) : this.moveV.x * .5, 0, dir ? dir.z * Math.max(this.speed, 3.4) : this.moveV.z * .5);
    synth('roll', .4);
  }
  stAir(dt, dir) {
    if (!this.airVel) this.airVel = new V3(this.moveV.x, 0, this.moveV.z);
    if (dir) { this.airVel.x += dir.x * 6 * dt; this.airVel.z += dir.z * 6 * dt; const l = Math.hypot(this.airVel.x, this.airVel.z); if (l > 6.6) this.airVel.multiplyScalar(6.6 / l); }
    this.vel.set(this.airVel.x, 0, this.airVel.z);
    if (this.airVel.lengthSq() > .1) this.turn(Math.atan2(this.airVel.x, this.airVel.z), 6, dt);
    if (inConsume('atk') || inConsume('heavy')) { this.doPlunge(); return; }
    if (this.onGround) this.land();
  }
  land() {
    const drop = this.fallStartY - this.pos.y; this.airVel = null; this.moveV.set(this.vel.x * .3, 0, this.vel.z * .3);
    if (drop > 11) { this.takeHit({ dmg: 99999, type: 'fall', env: true }); return; }
    if (drop > 5.5) { this.takeHit({ dmg: Math.round(STATS.maxHp() * (drop - 5) / 7), type: 'fall', env: true, poiseDmg: 0 }); }
    synth('land', clamp(drop / 3, .3, 1)); footstep(this, 1);
    this.anim.play(CLIP.land); this.setState('busy'); this.busyT = drop > 2.5 ? .3 : .08;
  }
  onLand(fall) { if (this.state === 'air') this.land(); }
  onFall() { if (this.alive) { this.takeHit({ dmg: 99999, type: 'fall', env: true }); } }
  doPlunge() {
    const d = this.w.jump; this.setState('plunge'); this.attack(d, this.lock); this.atk.mul = d.mul; this.vy = Math.min(this.vy, 2); this.useStam(d.stam);
  }
  stPlunge(dt) {
    const r = this.updAttack(dt);
    if (this.airVel) this.vel.set(this.airVel.x * .6, 0, this.airVel.z * .6);
    if (!this.onGround) { this.vy -= 18 * dt; if (this.atk && this.atk.t > this.atk.def.wind + this.atk.def.act * .8) this.atk.t = this.atk.def.wind + this.atk.def.act * .8; }
    else if (!this.plungeLanded) { this.plungeLanded = true; this.shockwave(this.w.jump.shock || 2, this.w.jump.mul * .6); synth('land', 1); shake(.25); }
    if (r === 'done' || (!this.atk && this.onGround)) { this.plungeLanded = false; this.airVel = null; this.setState('move'); }
  }
  shockwave(r, mul) {
    aoe({ x: this.pos.x + Math.sin(this.yaw) * .9, y: this.pos.y, z: this.pos.z + Math.cos(this.yaw) * .9, r, dmg: Math.round(this.w.dmg * mul * STATS.str() * this.wUp()), poiseDmg: 40, team: 'player', owner: this, kb: 5, dur: .1 });
    ringFx(this.pos.x + Math.sin(this.yaw) * .9, this.pos.y, this.pos.z + Math.cos(this.yaw) * .9, .3, r * 1.2, .45, 0xffc080, .8);
    burst(this.pos.x + Math.sin(this.yaw) * .9, this.pos.y + .1, this.pos.z + Math.cos(this.yaw) * .9, 18, { add: false, color: 0x6b6458, smin: 1, smax: 4, lmin: .4, lmax: .9, szmin: .15, szmax: .35, upBias: .6, alpha: .5 });
  }
  wUp() { return 1 + (PROG.wLvl[PROG.weapon] || 0) * .085; }
  dmgFor(d) {
    const a = this.atk; let m = (a && a.mul) || d.mul || 1;
    let dmg = this.w.dmg * m * STATS.str() * this.wUp();
    if (this.buff && this.buff.t > 0) dmg *= 1.2;
    const low = talSum('lowHp'); if (low && this.hp < STATS.maxHp() * .3) dmg *= 1 + low;
    if (a && a.crit) dmg *= a.crit;
    return Math.round(dmg * rnd(.95, 1.05));
  }
  doAttack(kind) {
    const w = this.w; let d;
    if (kind === 'light') { if (TIME.now - (this.lastAtkEnd || -9) > .5) this.combo = 0; d = w.light[this.combo % w.light.length]; this.combo++; }
    else if (kind === 'heavy') { d = w.heavy; this.combo = 0; }
    else if (kind === 'run') { d = w.run; this.combo = 1; }
    else if (kind === 'roll') { d = w.roll; this.combo = 1; }
    this.useStam(d.stam); this.setState('attack'); this.atkKind = kind;
    this.attack(d, this.lock && this.lock.alive ? this.lock : this.autoTarget());
    this.atk.mul = d.mul; this.atk.charging = kind === 'heavy' && d.charge; this.atk.chargeT = 0;
    if (w.fire || (this.buff && this.buff.t > 0)) this.trail && this.trail.setColor(0xff7a2a);
    if (d.jumpV) { this.vy = d.jumpV; this.onGround = false; }
  }
  autoTarget() {
    let best = null, bs = 1e9; const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    for (const e of targetsOf('player')) { const dx = e.pos.x - this.pos.x, dz = e.pos.z - this.pos.z, d = Math.hypot(dx, dz); if (d > 4.5 + e.r || Math.abs(e.pos.y - this.pos.y) > 2.5) continue; const dot = (dx * fx + dz * fz) / (d || 1); if (dot < .2) continue; const s = d - dot * 2; if (s < bs) { bs = s; best = e; } }
    return best;
  }
  stAttack(dt, dir) {
    const a = this.atk;
    if (a && a.charging) { // carregar o pesado
      if (inHeld('heavy') && a.t >= a.def.wind * .85 && a.chargeT < a.def.charge) { a.t = a.def.wind * .85; a.chargeT += dt; if (a.chargeT > .15 && Math.random() < dt * 30) burst(this.curT.x, this.curT.y, this.curT.z, 1, { color: 0xffc070, smin: .2, smax: .8, lmin: .2, lmax: .4 }); if (a.chargeT >= a.def.charge) { a.mul = a.def.cmul; a.charging = false; flashLight(this.curT.x, this.curT.y, this.curT.z, 0xffb060, 3, 5, .3); } }
      else if (!inHeld('heavy') || a.chargeT >= a.def.charge) { if (a.chargeT > .25) a.mul = lerp(a.def.mul, a.def.cmul, a.chargeT / a.def.charge); a.charging = false; }
    }
    const ph = this.updAttack(dt);
    if (a && a.phase === 'act' && a.def.shock && !a.shocked && a.t > a.def.wind + a.def.act * .7) { a.shocked = true; this.shockwave(a.def.shock, a.mul * .55); shake(.2); }
    if (ph === 'done' || !this.atk) { this.lastAtkEnd = TIME.now; this.trail && this.trail.setColor(this.w.trail); this.setState('move'); return; }
    // cancelamentos na recuperação
    if (a.phase === 'rec' && a.t > a.def.wind + a.def.act + a.def.rec * .25) {
      if (inPeek('atk', .35) && this.canAct()) { inConsume('atk', .35); this.lastAtkEnd = TIME.now; this.doAttack('light'); return; }
      if (inPeek('heavy', .3) && this.canAct()) { inConsume('heavy', .3); this.doAttack('heavy'); return; }
      if (this.rollReleased() && this.canAct()) { dir ? this.doRoll(dir) : this.doBackstep(); return; }
      if (inPeek('skill', .3)) { inConsume('skill', .3); this.doSkill(); return; }
    }
    if (a.phase === 'rec' && a.t > a.def.wind + a.def.act + a.def.rec * .7 && dir) { this.lastAtkEnd = TIME.now; this.atk = null; this.anim.stop(.15); this.setState('move'); }
  }
  doFlask() {
    if (PROG.flasks <= 0) { synth('ui'); UI.flaskEmpty(); return; }
    this.setState('flask'); this.anim.play(CLIP.drink); this.flaskDone = false;
  }
  stFlask(dt, dir) {
    const sp = dir ? 1.3 : 0; this.vel.set(dir ? dir.x * sp : 0, 0, dir ? dir.z * sp : 0); if (dir) this.turn(Math.atan2(dir.x, dir.z), 6, dt);
    this.anim.amt = damp(this.anim.amt, dir ? .7 : 0, 8, dt); this.anim.ph += dt * sp * 2;
    if (!this.flaskDone && this.stT > .45) {
      this.flaskDone = true; PROG.flasks--; const h = STATS.flaskHeal(); this.hp = Math.min(STATS.maxHp(), this.hp + h); delete this.status.poison;
      sfx('flask', { vol: .7 }); sfx('heal', { vol: .5 }); burst(this.pos.x, this.pos.y + 1, this.pos.z, 16, { color: 0xffc060, smin: .3, smax: 1.5, upBias: .8, lmin: .5, lmax: 1, szmin: .06, szmax: .14 }); flashLight(this.pos.x, this.pos.y + 1.5, this.pos.z, 0xffb050, 2.5, 5, .7);
    }
    if (this.stT > .95) this.setState('move');
  }
  // ---- habilidades ----
  cycleSkill(d) { if (!PROG.skills.length) return; PROG.skillIdx = (PROG.skillIdx + d + PROG.skills.length) % PROG.skills.length; synth('ui'); UI.skillChanged(); }
  doSkill() {
    if (!PROG.skills.length) { UI.toast('Ainda não aprendeste nenhuma habilidade.'); return; }
    const id = PROG.skills[PROG.skillIdx % PROG.skills.length], S = SKILLS[id];
    if (this.skillCd > 0) return;
    if (this.fp < S.fp) { UI.noFp(); synth('ui'); return; }
    if (this.stam <= 0) return;
    this.fp -= S.fp; this.useStam(S.stam); this.skillCd = S.cd; this.skill = { id, t: 0, done: {} }; this.setState('skill');
    SKILL_FN[id].start(this);
  }
  stSkill(dt, dir) {
    const k = this.skill; k.t += dt;
    const r = SKILL_FN[k.id].update(this, dt, k, dir);
    if (r === 'done') { this.skill = null; this.bow.visible = false; if (this.wmesh) this.wmesh.visible = true; this.useIK = !!this.wmesh; this.setState('move'); }
  }
  // ---- alvo travado ----
  updLock(dt) {
    if (inConsume('lock')) { if (this.lock) { this.lock = null; synth('ui'); } else { this.lock = this.findLock(); if (this.lock) synth('ui'); else CAM.recenter = .35; } }
    if (this.lock) {
      const l = this.lock;
      if (!l.alive || l.ghost || this.dist(l) > 32) { this.lock = this.findLock(l) ; return; }
      if (!losClear(this.pos.x, this.pos.y + 1.5, this.pos.z, l.pos.x, l.pos.y + l.h * .6, l.pos.z)) { this.lockLost += dt; if (this.lockLost > 2.5) this.lock = null; } else this.lockLost = 0;
      if (inConsume('lockL')) this.switchLock(-1); if (inConsume('lockR')) this.switchLock(1);
    }
  }
  findLock(exclude) {
    let best = null, bs = 1e9; const cf = CAM.yaw;
    for (const e of targetsOf('player')) {
      if (e === exclude || e.noLock) continue; const d = this.dist(e); if (d > 26) continue;
      const a = Math.abs(angDiff(cf, this.yawTo(e))); if (a > 1.3 && d > 5) continue;
      if (!losClear(this.pos.x, this.pos.y + 1.5, this.pos.z, e.pos.x, e.pos.y + e.h * .6, e.pos.z)) continue;
      const s = a * 8 + d + (e.boss ? -6 : 0); if (s < bs) { bs = s; best = e; }
    }
    return best;
  }
  switchLock(side) {
    const cur = this.lock; if (!cur) return; const base = this.yawTo(cur); let best = null, bs = 1e9;
    for (const e of targetsOf('player')) { if (e === cur || e.noLock || this.dist(e) > 26) continue; const a = angDiff(base, this.yawTo(e)); if (side > 0 ? a >= -.02 : a <= .02) continue; const s = Math.abs(a); if (s < bs) { bs = s; best = e; } }
    if (best) { this.lock = best; synth('ui'); }
  }
  // ---- dano recebido ----
  takeHit(h) {
    if (!this.alive || GAME.cine) return false;
    if (!h.env && (this.iframe > 0)) { if (h.from && h.from !== this) GAME.onDodge && GAME.onDodge(h); return 'dodge'; }
    if (GAME.god && h.type !== 'fall') return false;
    let dmg = h.type === 'fall' ? h.dmg : Math.round(h.dmg * (1 - talSum('def')) * (1 - (h.type === 'fire' ? talSum('fire') : 0)));
    this.hp -= dmg; UI.hurt(dmg);
    if (h.status) for (const k in h.status) this.status[k] = Math.max(this.status[k] || 0, h.status[k]);
    if (!h.env || h.type === 'fall') { sfxAny(['p_hurt1', 'p_hurt2', 'p_hurt3'], { vol: .75, jit: .05 }); shake(.15 + Math.min(.35, dmg / 400)); vibrate(30); }
    burst(this.pos.x, this.pos.y + 1.2, this.pos.z, 10, { add: false, color: 0x5a1210, color2: 0x2a0808, smin: 1, smax: 3, lmin: .3, lmax: .6, szmin: .05, szmax: .12, grav: 6, alpha: .9 });
    if (this.hp <= 0) { this.hp = 0; this.die(h); return true; }
    if (h.env && h.type !== 'fall') return true;
    // reação
    if (this.state === 'flask' && this.flaskDone === false) { }
    const big = (h.kb || 0) >= 8 || h.knock || h.up;
    const dir = h.src ? _v2.set(this.pos.x - h.src.x, 0, this.pos.z - h.src.z).normalize() : this.fwd(_v2).multiplyScalar(-1);
    this.kb.set(dir.x * (h.kb || 3) * .8, 0, dir.z * (h.kb || 3) * .8);
    this.atk = null; this.skill = null; this.bow.visible = false; if (this.wmesh) this.wmesh.visible = true; this.useIK = !!this.wmesh;
    if (big) { this.setState('knock'); this.anim.play(CLIP.knock); this.yaw = Math.atan2(-dir.x, -dir.z); if (h.up) this.vy = h.up; }
    else { this.setState('hurt'); this.anim.play(CLIP.hurt); }
    this.iframe = Math.max(this.iframe, big ? .5 : .12);
    return true;
  }
  updStatus(dt) {
    for (const k in this.status) {
      this.status[k] -= dt; if (this.status[k] <= 0) { delete this.status[k]; continue; }
      this.stTick = (this.stTick || 0) - dt;
    }
    if (GAME.god) return;
    if ((this.status.poison || this.status.burn) && (this.stTick || 0) <= 0) {
      this.stTick = .5; const d = (this.status.poison ? 7 : 0) + (this.status.burn ? 9 : 0); this.hp -= d; UI.hurt(d, true);
      if (this.status.burn) burst(this.pos.x, this.pos.y + 1, this.pos.z, 4, { color: 0xff7020, smin: .3, smax: 1, upBias: 1, lmin: .3, lmax: .6 });
      if (this.status.poison) burst(this.pos.x, this.pos.y + 1, this.pos.z, 3, { color: 0x8ac040, smin: .2, smax: .6, upBias: 1, lmin: .4, lmax: .8 });
      if (this.hp <= 0) { this.hp = 0; this.die({ type: 'status' }); }
    }
  }
  die(h) {
    this.alive = false; this.state = 'dead'; this.atk = null; this.lock = null; this.vel.set(0, 0, 0);
    this.anim.play(CLIP.die, { hold: true }); sfx('p_die', { vol: .9 }); synth('death');
    GAME.onPlayerDeath(h);
  }
  stWalkTo(dt) {
    const t = this.walkTarget; if (!t) { this.setState('move'); return; }
    const dx = t.x - this.pos.x, dz = t.z - this.pos.z, d = Math.hypot(dx, dz);
    if (d < .15 || this.stT > (t.maxT || 3)) { this.vel.set(0, 0, 0); this.anim.amt = 0; const cb = t.cb; this.walkTarget = null; this.setState('move'); cb && cb(); return; }
    const sp = Math.min(t.speed || 1.6, d * 4); this.vel.set(dx / d * sp, 0, dz / d * sp); this.yaw = Math.atan2(dx, dz); this.anim.amt = damp(this.anim.amt, sp / 1.9, 8, dt); this.anim.ph += dt * sp / 1.35 * PI;
  }
  walkTo(x, z, cb, o = {}) { this.walkTarget = Object.assign({ x, z, cb }, o); this.setState('walkto'); }
  busy(t, clipName) { this.setState('busy'); this.busyT = t; if (clipName) this.anim.play(CLIP[clipName]); }
}
// passos (som por superfície)
function footstep(a, v = .7) {
  if (!AU.ctx) return;
  if (a.inWater) { noise({ f: 900, f2: 300, dur: .2, vol: .08 * v }); sfx('water', { pos: a.pos, vol: .08 * v, rate: 1.6, jit: .1 }); return; }
  const echo = GAME.area && GAME.area.echo;
  sfx((echo ? 'echo' : 'step') + rndi(1, 4), { pos: a.pos, vol: (echo ? .22 : .3) * v, jit: .08 });
}
