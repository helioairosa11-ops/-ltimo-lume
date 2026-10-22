// ===================== LUTADOR (humanoide com arma) =====================
// Poses de ação reutilizáveis
const CLIP = {};
function clip(name, dur, keys, o = {}) { CLIP[name] = Object.assign({ dur, keys }, o); return CLIP[name]; }
clip('hurt', .38, [[0, {}], [.07, { spine: [-.25, .2, 0], chest: [-.2, .15, 0], head: [-.3, 0, 0], armL: [-.4, 0, .5], foreL: [-.6, 0, 0], _y: -.04 }, 'out'], [.38, {}]]);
clip('stagger', .9, [[0, {}], [.12, { spine: [-.4, .3, .1], chest: [-.3, .2, 0], head: [-.4, .1, 0], armL: [-.8, 0, .9], armR: [-.5, 0, -.8], legL: [-.4, 0, 0], shinL: [.3, 0, 0], legR: [.3, 0, 0], shinR: [.6, 0, 0], _y: -.12 }, 'out'], [.6, { spine: [.3, 0, 0], chest: [.25, 0, 0], head: [.2, 0, 0], legL: [-.5, 0, 0], shinL: [.9, 0, 0], legR: [.4, 0, 0], shinR: [.8, 0, 0], _y: -.25 }], [.9, {}]]);
clip('knock', 1.5, [[0, {}], [.15, { hips: [-.6, 0, 0], spine: [-.5, 0, 0], head: [-.4, 0, 0], armL: [-1.5, 0, .8], armR: [-1.5, 0, -.8], legL: [-1, 0, 0], legR: [-.8, 0, 0], _y: -.4 }, 'out'], [.4, { hips: [-1.45, 0, 0], spine: [-.1, 0, 0], armL: [-2.6, 0, .6], armR: [-2.6, 0, -.6], legL: [-.3, 0, 0], legR: [-.1, 0, 0], shinL: [.3, 0, 0], _y: -.82 }, 'in'], [.85, { hips: [-1.45, 0, 0], spine: [-.1, 0, 0], armL: [-2.6, 0, .6], armR: [-2.6, 0, -.6], legL: [-.3, 0, 0], _y: -.82 }], [1.2, { hips: [.3, 0, 0], spine: [.5, 0, 0], legL: [-1.6, 0, 0], shinL: [2, 0, 0], legR: [-.2, 0, 0], shinR: [1.5, 0, 0], armL: [-.5, 0, .3], _y: -.45 }], [1.5, {}]]);
clip('die', 1.6, [[0, {}], [.25, { spine: [.4, .3, 0], chest: [.3, 0, 0], head: [.5, 0, 0], legL: [-1.2, 0, 0], shinL: [2.2, 0, 0], legR: [-.3, 0, 0], shinR: [1.9, 0, 0], armL: [.2, 0, .3], armR: [.3, 0, -.3], _y: -.45 }, 'out'], [.6, { spine: [.4, .3, 0], chest: [.3, 0, 0], head: [.5, 0, 0], legL: [-1.4, 0, 0], shinL: [2.4, 0, 0], legR: [-1.3, 0, 0], shinR: [2.4, 0, 0], armL: [.1, 0, .4], armR: [.1, 0, -.4], _y: -.62 }], [1.2, { hips: [1.5, 0, .1], spine: [.1, 0, 0], head: [.2, .6, 0], legL: [-.2, 0, 0], shinL: [.5, 0, 0], legR: [-.1, 0, 0], shinR: [.3, 0, 0], armL: [-2.5, 0, .9], armR: [-2.7, 0, -.7], _y: -.8 }, 'in'], [1.6, { hips: [1.52, 0, .1], spine: [.05, 0, 0], head: [.25, .6, 0], legL: [-.15, 0, 0], legR: [-.05, 0, 0], armL: [-2.6, 0, 1.1], armR: [-2.8, 0, -.8], _y: -.82 }]], { fadeIn: .05 });
clip('roll', .58, [[0, { _y: -.1 }], [.08, { hips: [.9, 0, 0], spine: [.6, 0, 0], chest: [.4, 0, 0], head: [.5, 0, 0], legL: [-1.6, 0, 0], shinL: [2.2, 0, 0], legR: [-1.4, 0, 0], shinR: [2.3, 0, 0], armL: [-1.2, 0, .4], foreL: [-1.4, 0, 0], _y: -.45 }, 'out'], [.28, { hips: [3.4, 0, 0], spine: [.6, 0, 0], chest: [.4, 0, 0], head: [.5, 0, 0], legL: [-1.8, 0, 0], shinL: [2.4, 0, 0], legR: [-1.7, 0, 0], shinR: [2.4, 0, 0], armL: [-1.2, 0, .4], foreL: [-1.4, 0, 0], _y: -.45 }, 'lin'], [.45, { hips: [6.28, 0, 0], spine: [.3, 0, 0], legL: [-1, 0, 0], shinL: [1.6, 0, 0], legR: [-.3, 0, 0], shinR: [1.2, 0, 0], armL: [-.6, 0, .4], _y: -.3 }, 'lin'], [.58, { hips: [6.28, 0, 0], _y: -.05 }]], { fadeIn: .03, fadeOut: .1 });
clip('backstep', .45, [[0, {}], [.1, { spine: [-.15, 0, 0], legL: [.4, 0, 0], shinL: [.5, 0, 0], legR: [-.2, 0, 0], shinR: [.3, 0, 0], armL: [-.4, 0, .4], _y: -.08 }, 'out'], [.3, { spine: [.15, 0, 0], legL: [-.2, 0, 0], shinL: [.6, 0, 0], legR: [.3, 0, 0], shinR: [.6, 0, 0], _y: -.18 }], [.45, {}]], { fadeIn: .03 });
clip('jump', .5, [[0, { legL: [-.2, 0, 0], shinL: [.5, 0, 0], legR: [-.2, 0, 0], shinR: [.5, 0, 0], _y: -.15 }], [.15, { legL: [-1.1, 0, 0], shinL: [1.6, 0, 0], legR: [-.6, 0, 0], shinR: [1.9, 0, 0], armL: [-1.2, 0, .5], spine: [.2, 0, 0] }, 'out'], [.5, { legL: [-.6, 0, 0], shinL: [.8, 0, 0], legR: [-.2, 0, 0], shinR: [.9, 0, 0], armL: [-.8, 0, .8] }]], { hold: true, fadeIn: .05 });
clip('fall', .6, [[0, { legL: [-.5, 0, 0], shinL: [.7, 0, 0], legR: [-.1, 0, 0], shinR: [.6, 0, 0], armL: [-1.3, 0, 1], armR: [-1.1, 0, -1] }], [.3, { legL: [-.3, 0, 0], shinL: [.5, 0, 0], legR: [-.3, 0, 0], shinR: [.7, 0, 0], armL: [-1.5, 0, 1.2], armR: [-1.3, 0, -1.1] }], [.6, { legL: [-.5, 0, 0], shinL: [.7, 0, 0], legR: [-.1, 0, 0], shinR: [.6, 0, 0], armL: [-1.3, 0, 1], armR: [-1.1, 0, -1] }]], { loop: true });
clip('land', .3, [[0, { legL: [-.7, 0, 0], shinL: [1.3, 0, 0], legR: [-.5, 0, 0], shinR: [1.2, 0, 0], spine: [.4, 0, 0], _y: -.35 }], [.3, {}]], { fadeIn: .02 });
clip('drink', .95, [[0, {}], [.25, { armL: [-2.2, .2, -.5], foreL: [-1.9, 0, 0], head: [-.35, 0, 0], chest: [-.1, 0, 0] }, 'out'], [.65, { armL: [-2.3, .2, -.6], foreL: [-2.0, 0, 0], head: [-.45, 0, 0], chest: [-.12, 0, 0] }], [.95, {}]], { mask: ['armL', 'foreL', 'handL', 'head', 'chest', 'neck'] });
clip('sit', 1.0, [[0, {}], [.6, { legL: [-1.4, .5, .5], shinL: [2.3, 0, 0], legR: [-1.4, -.5, -.5], shinR: [2.3, 0, 0], spine: [.3, 0, 0], chest: [.15, 0, 0], head: [.25, 0, 0], armL: [-.9, 0, .2], foreL: [-.8, 0, 0], armR: [-.9, 0, -.2], foreR: [-.8, 0, 0], _y: -.72 }, 'out'], [1, { legL: [-1.4, .5, .5], shinL: [2.3, 0, 0], legR: [-1.4, -.5, -.5], shinR: [2.3, 0, 0], spine: [.3, 0, 0], chest: [.15, 0, 0], head: [.25, 0, 0], armL: [-.9, 0, .2], foreL: [-.8, 0, 0], armR: [-.9, 0, -.2], foreR: [-.8, 0, 0], _y: -.72 }]], { hold: true });
clip('pickup', .8, [[0, {}], [.3, { spine: [.7, 0, 0], chest: [.3, 0, 0], legL: [-.9, 0, 0], shinL: [1.6, 0, 0], legR: [-.2, 0, 0], shinR: [1.3, 0, 0], armL: [-1.1, 0, .1], foreL: [-.2, 0, 0], _y: -.38 }, 'out'], [.55, { spine: [.7, 0, 0], chest: [.3, 0, 0], legL: [-.9, 0, 0], shinL: [1.6, 0, 0], legR: [-.2, 0, 0], shinR: [1.3, 0, 0], armL: [-1.1, 0, .1], _y: -.38 }], [.8, {}]]);
clip('push', 1.0, [[0, {}], [.3, { spine: [.35, 0, 0], armL: [-1.5, 0, .1], foreL: [-.3, 0, 0], armR: [-1.5, 0, -.1], foreR: [-.3, 0, 0], legL: [-.6, 0, 0], shinL: [.5, 0, 0], legR: [.4, 0, 0], _y: -.08 }, 'out'], [.75, { spine: [.45, 0, 0], armL: [-1.45, 0, .1], foreL: [-.05, 0, 0], armR: [-1.45, 0, -.1], foreR: [-.05, 0, 0], legL: [-.7, 0, 0], shinL: [.6, 0, 0], legR: [.55, 0, 0], _y: -.1 }], [1, {}]]);
clip('cast', .7, [[0, {}], [.25, { armL: [-1.4, .3, .3], foreL: [-.2, 0, 0], chest: [-.1, .4, 0], spine: [0, .2, 0], legL: [-.4, 0, 0], legR: [.3, 0, 0] }, 'out'], [.4, { armL: [-1.6, -.2, .1], foreL: [-.05, 0, 0], chest: [.1, -.2, 0], legL: [-.5, 0, 0], legR: [.35, 0, 0], shinR: [.3, 0, 0] }, 'in'], [.7, {}]]);
clip('roar', 1.3, [[0, {}], [.35, { chest: [-.45, 0, 0], head: [-.5, 0, 0], armL: [-.5, 0, 1.2], armR: [-.5, 0, -1.2], foreL: [-.6, 0, 0], foreR: [-.6, 0, 0], legL: [-.2, 0, .15], legR: [.1, 0, -.15], _y: -.06 }, 'out'], [1.0, { chest: [-.5, 0, 0], head: [-.55, 0, 0], armL: [-.4, 0, 1.3], armR: [-.4, 0, -1.3], foreL: [-.5, 0, 0], foreR: [-.5, 0, 0], _y: -.06 }], [1.3, {}]]);
clip('kneel', 1.2, [[0, {}], [.4, { legL: [-1.5, 0, 0], shinL: [1.6, 0, 0], legR: [.1, 0, 0], shinR: [1.9, 0, 0], spine: [.4, 0, 0], head: [.5, 0, 0], armL: [-.6, 0, .3], armR: [-.6, 0, -.3], _y: -.5 }, 'out'], [1.2, { legL: [-1.5, 0, 0], shinL: [1.6, 0, 0], legR: [.1, 0, 0], shinR: [1.9, 0, 0], spine: [.45, 0, 0], head: [.55, 0, 0], armL: [-.6, 0, .3], armR: [-.6, 0, -.3], _y: -.5 }]], { hold: true });
clip('bowdraw', .4, [[0, {}], [.4, { armL: [-1.55, .0, -.15], foreL: [0, 0, 0], armR: [-1.4, 0, .5], foreR: [-1.9, 0, 0], chest: [0, -.9, 0], spine: [0, -.4, 0], head: [0, 1.1, 0], legL: [-.3, 0, .1], legR: [.25, 0, -.1] }, 'out']], { hold: true });

// ----- lutador -----
const _lh = new V3(), _lb = new V3(), _le = new V3(), _wh = new V3(), _wb = new V3(), _we = new V3(), _pole = new V3(), _tmpQ = new QT();
const ARCOUT = { hand: new V3(), blade: new V3(), edge: new V3() };
const ARCOUT2 = { hand: new V3(), blade: new V3(), edge: new V3() };
class Fighter extends Actor {
  constructor(o) {
    super(o);
    this.rig = o.rig; this.root.add(this.rig.root); this.anim = new Animator(this.rig);
    this.weaponKind = o.weapon || null; this.twoHand = !!o.twoHand; this.wscale = o.wscale || 1;
    if (this.weaponKind) { this.wmesh = weaponMesh(this.weaponKind, this.wscale * this.rig.s); this.rig.J.handR.add(this.wmesh); this.winfo = this.wmesh.userData; }
    if (o.offhand) { this.off = weaponMesh(o.offhand, this.rig.s); this.rig.J.handL.add(this.off); if (o.offhand === 'shield') { this.off.position.set(0, -.05, .08); this.off.rotation.set(0, HPI, 0); } }
    this.hold = o.hold || { hand: [-.24, 1.0, .3], blade: [0, .55, 1], edge: [0, 1, 0] };
    this.useIK = !!this.weaponKind; this.atk = null; this.prevB = new V3(); this.prevT = new V3(); this.curB = new V3(); this.curT = new V3();
    this.trailColor = o.trail ?? 0xfff0d8; this.trail = null; this.ikW = 1; this.speedMul = 1;
  }
  setWeapon(kind, twoHand, hold, scale = 1) {
    if (this.wmesh) this.rig.J.handR.remove(this.wmesh);
    this.weaponKind = kind; this.twoHand = twoHand; this.wscale = scale;
    if (kind) { this.wmesh = weaponMesh(kind, scale * this.rig.s); this.rig.J.handR.add(this.wmesh); this.winfo = this.wmesh.userData; }
    if (hold) this.hold = hold; this.useIK = !!kind;
  }
  // inicia golpe definido por arco
  attack(def, target) {
    this.atk = { def, t: 0, phase: 'wind', hit: new Set(), target, firedEv: {}, started: false, tracked: 0 };
    const total = def.wind + def.act + def.rec;
    const self = this;
    this.anim.play({ dur: total, fadeIn: def.fadeIn ?? .08, fadeOut: .15, fn: (t) => self.atkBodyPose(t) });
    return this.atk;
  }
  atkBodyPose(t) {
    const a = this.atk; if (!a) return {};
    const d = a.def, b = d.body || {};
    const tw = b.twist ?? .5, ln = b.lean ?? .25;
    let u; // 0 = preparo máximo, 1 = golpe completo
    if (t < d.wind) u = -easeOut(t / d.wind);
    else if (t < d.wind + d.act) u = -1 + 2 * easeIn((t - d.wind) / d.act);
    else u = 1 - easeOut((t - d.wind - d.act) / d.rec);
    const side = d.side ?? (d.th1 < d.th0 ? 1 : -1); // giro do tronco
    const lunge = Math.max(0, u) * (b.lunge ?? .5), coil = Math.max(0, -u);
    const p = {
      spine: [ln * Math.max(0, u) * .6 - coil * .05, side * u * tw * .45, 0], chest: [ln * Math.max(0, u) * .5 - coil * .15 * (b.rear ?? 0), side * u * tw * .55, 0],
      head: [0, -side * u * tw * .5, 0],
      legL: [-.35 - lunge * .5, 0, .08], shinL: [.35 + lunge * .3, 0, 0], legR: [.3 + lunge * .25, 0, -.06], shinR: [.25 + lunge * .1, 0, 0], footL: [.1, 0, 0],
      armL: [-.4 - coil * .3, 0, .25 + coil * .3], foreL: [-.7, 0, 0],
      _y: -.08 - lunge * .08 - coil * .04
    };
    if (b.jump) { const k = clamp(t / (d.wind + d.act * .5), 0, 1); p._y = -.1 + Math.sin(k * PI) * .2; }
    if (b.spin) { p.hips = [0, -side * u * PI, 0]; }
    if (b.pose) Object.assign(p, b.pose);
    return p;
  }
  updAttack(dt) {
    const a = this.atk; if (!a) return null;
    const d = a.def; a.t += dt * (d.speed || 1) * this.speedMul;
    const t = a.t, T1 = d.wind, T2 = d.wind + d.act, T3 = T2 + d.rec;
    const prev = a.phase;
    a.phase = t < T1 ? 'wind' : t < T2 ? 'act' : t < T3 ? 'rec' : 'done';
    // rastreio
    if (a.target && a.target.alive && (a.phase === 'wind' || (a.phase === 'act' && d.trackAct))) {
      const rate = (a.phase === 'wind' ? d.track ?? 6 : d.trackAct ?? 0);
      if (!(d.trackStop && t > d.wind * d.trackStop)) this.turn(this.yawTo(a.target), rate, dt);
    }
    // movimento
    const mv = a.phase === 'wind' ? (d.mvW || 0) : a.phase === 'act' ? (d.mvA || 0) : a.phase === 'rec' ? (d.mvR || 0) * (1 - (t - T2) / d.rec) : 0;
    let mvx = Math.sin(this.yaw) * mv, mvz = Math.cos(this.yaw) * mv;
    if (d.gapClose && a.target && a.phase !== 'rec') { const dd = this.dist(a.target) - (this.r + a.target.r + (d.stopAt ?? .6)); if (dd < 0) { mvx *= .1; mvz *= .1; } }
    this.vel.set(mvx, 0, mvz);
    if (prev !== a.phase) { this.onPhase && this.onPhase(a.phase, a); if (a.phase === 'act') { if (d.sfx !== false) sfx(d.sfx || pick(['swing1', 'swing2', 'swing3', 'whoosh1', 'whoosh2']), { pos: this.pos, vol: d.sfxVol ?? .7, jit: .08, rate: d.sfxRate || (this.boss ? .8 : 1) }); if (d.jumpV) { this.vy = d.jumpV; this.onGround = false; } } }
    // eventos
    if (d.events) for (const ev of d.events) { const et = ev.at === 'act' ? T1 + (ev.dt || 0) : ev.at === 'rec' ? T2 + (ev.dt || 0) : ev.at; if (!a.firedEv[et + ev.fn.name] && t >= et) { a.firedEv[et + ev.fn.name] = 1; ev.fn(this, a); } }
    if (a.phase === 'done') { this.atk = null; this.vel.set(0, 0, 0); return 'done'; }
    return a.phase;
  }
  // aplica IK da arma (depois da pose)
  weaponIK(dt) {
    if (!this.useIK || !this.wmesh) return;
    const rig = this.rig, a = this.atk;
    let H = _lh, B = _lb, E = _le;
    const hold = this.curHold || this.hold;
    const sway = this.anim.amt > .05 ? Math.sin(this.anim.ph) * .12 * Math.min(1.5, this.anim.amt) : 0;
    H.set(hold.hand[0] * rig.s, hold.hand[1] * rig.s, (hold.hand[2] + sway) * rig.s); B.set(hold.blade[0], hold.blade[1], hold.blade[2]).normalize(); E.set(hold.edge[0], hold.edge[1], hold.edge[2]);
    let w = this.ikBlend ?? 1;
    if (a && a.def.arc !== false) {
      const d = a.def, t = a.t, arc = d.arc || d;
      if (t < d.wind) { arcEval(arc, 0, rig, ARCOUT); const k = easeOut(t / d.wind); H.lerp(ARCOUT.hand, k); B.lerp(ARCOUT.blade, k).normalize(); E.lerp(ARCOUT.edge, k); }
      else if (t < d.wind + d.act) { const u = (t - d.wind) / d.act; arcEval(arc, d.lin ? u : easeInOut(u), rig, ARCOUT); H.copy(ARCOUT.hand); B.copy(ARCOUT.blade); E.copy(ARCOUT.edge); }
      else { arcEval(arc, 1, rig, ARCOUT); const k = easeInOut(Math.min(1, (t - d.wind - d.act) / (d.rec * .85))); _wh.copy(ARCOUT.hand).lerp(H, k); _wb.copy(ARCOUT.blade).lerp(B, k).normalize(); _we.copy(ARCOUT.edge).lerp(E, k); H.copy(_wh); B.copy(_wb); E.copy(_we); }
    }
    if (w <= 0) return;
    // local -> mundo
    this.root.updateMatrixWorld(true);
    const Mw = this.root.matrixWorld;
    _wh.copy(H).applyMatrix4(Mw); _wb.copy(B).transformDirection(Mw); _we.copy(E).transformDirection(Mw);
    _pole.set(-.6 * rig.s, -.4 * rig.s, -.6 * rig.s).applyMatrix4(Mw);
    armIK(rig, 'R', _wh, _pole);
    rig.J.armR.updateMatrixWorld(true);
    handAim(rig, 'R', _wb, _we);
    if (this.twoHand) { _v3.copy(_wh).addScaledVector(_wb, -.2 * rig.s * this.wscale); _pole.set(.6 * rig.s, -.4 * rig.s, -.4 * rig.s).applyMatrix4(Mw); armIK(rig, 'L', _v3, _pole); }
    // segmento da lâmina (mundo)
    this.rig.J.handR.updateMatrixWorld(true);
    const hw = this.rig.J.handR.matrixWorld;
    this.prevB.copy(this.curB); this.prevT.copy(this.curT);
    this.curB.set(0, this.winfo.base, 0).applyMatrix4(hw); this.curT.set(0, this.winfo.len, 0).applyMatrix4(hw);
  }
  // colisões da lâmina durante a fase ativa
  checkHits() {
    const a = this.atk; if (!a || a.phase !== 'act' || a.def.noBlade) return;
    const d = a.def;
    for (const t of targetsOf(this.team)) {
      if (a.hit.has(t)) continue;
      let ok = false;
      if (d.sphere) { const sp = d.sphere; _v2.set(sp[0] * this.rig.s, sp[1] * this.rig.s, sp[2] * this.rig.s).applyMatrix4(this.root.matrixWorld); ok = sphereHits(_v2, sp[3] * this.rig.s, t); }
      else ok = bladeHits(this.prevB, this.prevT, this.curB, this.curT, t, (this.winfo.w || .08) * (d.thick || 1));
      if (ok) { a.hit.add(t); this.onBladeHit(t, a); }
    }
  }
  onBladeHit(t, a) {
    const d = a.def;
    const res = t.takeHit({ dmg: this.dmgFor(d), poiseDmg: d.poise || 20, type: d.type || 'phys', from: this, src: this.curT, dir: this.fwd(_v2).clone(), kb: d.kb ?? 3, up: d.up, status: d.status, crit: a.crit });
    if (res && res !== 'dodge') { hitStop(this.team === 'player' ? .055 : .07); }
    return res;
  }
  dmgFor(d) { return d.dmg || 40; }
  updTrail() {
    if (!this.wmesh) return;
    const act = this.atk && (this.atk.phase === 'act' || (this.atk.phase === 'rec' && this.atk.t - this.atk.def.wind - this.atk.def.act < .05));
    if (act && this.atk.def.trail !== false) { if (!this.trail) this.trail = new Trail(this.trailColor, 12, .5); this.trail.push(this.curB, this.curT); }
    else if (this.trail) this.trail.fade();
    if (this.trail) this.trail.update();
  }
  // capa e saia
  updCloth(dt) {
    const sp = Math.hypot(this.vel.x, this.vel.z);
    if (this.rig.cape) { const ch = this.rig.cape.userData.chain; const sw = Math.sin(TIME.now * 2.5) * .05; ch.forEach((c, i) => { c.rotation.x = damp(c.rotation.x, (i ? .12 : .18) + sp * .06 * (i ? .5 : 1) + sw * (i + 1) * .5, 6, dt); }); }
    if (this.rig.skirt) { this.rig.skirt.rotation.x = damp(this.rig.skirt.rotation.x, -sp * .03, 5, dt); }
  }
}
