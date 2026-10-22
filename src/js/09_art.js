// ===================== ARTE: herói, ajudantes de desenho =====================
// FL: mistura de cor para o piscar branco quando é atingido
let FL = 0;
function col(h, a) { const v = FL > 0 ? mixHex(h, 0xffffff, FL) : h; return a === undefined ? css(v) : rgba(v, a); }
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); c.fill(); }
function poly(c, pts, close = true) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); if (close) c.closePath(); c.fill(); }
function capsuleLine(c, x0, y0, x1, y1, w, color) { c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
// lâmina simples
function blade(c, x, y, ang, len, w, colBlade = 0xe8e4dc, colHilt = 0x5a4a36) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = col(colHilt); c.fillRect(-5, -1.5, 6, 3); c.fillRect(0, -4, 2, 8);
  c.fillStyle = col(colBlade); c.beginPath(); c.moveTo(2, -1.6); c.lineTo(len - 4, -1.2); c.lineTo(len, 0); c.lineTo(len - 4, 1.2); c.lineTo(2, 1.6); c.fill();
  c.restore();
}
// ---------- o Desperto ----------
function heroPose(p) {
  const t = G.t, st = p.state, P = { lean: 0, sx: 1, sy: 1, legL: 0, legR: 0, liftL: 0, liftR: 0, tuck: 0, arm: 0, sword: null, mask: 0, sit: 0, hem: 0, alpha: 1 };
  p.squash = damp(p.squash, 0, 14, TIME.dtReal || .016);
  const sq = p.squash; P.sx = 1 + sq * .6; P.sy = 1 - sq * .7;
  if (st === 'dash') { P.lean = .35; P.sx *= 1.15; P.sy *= .9; P.tuck = 1; P.hem = -6; }
  else if (!p.onGround) { if (p.vy < 0) { P.sy *= 1.06; P.sx *= .95; P.tuck = .5; } else { P.tuck = .2; P.hem = 3; } P.lean = clamp(p.vx / 900, -.15, .15) * p.face; }
  else if (Math.abs(p.vx) > 20) { const ph = p.runPh; P.legL = Math.sin(ph) * 4; P.legR = -Math.sin(ph) * 4; P.liftL = Math.max(0, Math.cos(ph)) * 3; P.liftR = Math.max(0, -Math.cos(ph)) * 3; P.lean = .12; P.sy *= 1 + Math.abs(Math.sin(ph)) * .03; P.hem = -Math.min(5, Math.abs(p.vx) / 50); }
  else { P.sy *= 1 + Math.sin(t * 2.4) * .018; }
  if (st === 'sit') { P.sit = 1; P.sy *= .78; }
  if (st === 'drink') { P.mask = -.25; P.arm = 1; }
  if (p.charge > .2) { P.lean = -.1; P.sy *= .95; }
  const a = p.atk;
  if (a) {
    const k = clamp(a.t / Math.max(.01, a.act[1] + .04), 0, 1), e = easeOut(k);
    if (a.up) P.sword = lerp(.6, -2.4, e) - 0;
    else if (a.down) P.sword = lerp(-.6, 2.2, e);
    else if (a.thrust) { P.sword = 0; P.lean = .3; }
    else if (a.slash < 0) P.sword = lerp(1.1, -1.1, e) * -1 - 0;
    else P.sword = lerp(-1.6, .9, e);
    if (!a.up && !a.down) P.lean += .15 * (1 - k);
  }
  if (!p.alive) { P.sit = 1; P.sy *= .6; P.lean = .5; P.alpha = clamp(1 - p.st / 2.5, 0, 1); }
  if (p.inv > 0 && p.state !== 'dash' && p.alive && p.state !== 'hazard' && Math.floor(p.inv * 18) % 2 === 0) P.alpha *= .35;
  if (p.state === 'hazard') P.alpha = clamp(1 - p.st * 3, 0, 1);
  return P;
}
function drawHero(c, p) {
  // rastos do dash
  for (const af of p.after) { c.save(); c.globalAlpha = af.t / .22 * .45; c.translate(af.x, af.y); c.scale(af.face, 1); c.fillStyle = '#9ab0ff'; poly(c, [-8, -30, 7, -30, 12, -6, -12, -6]); ell(c, 1, -36, 8.5, 8); c.restore(); }
  const P = heroPose(p); if (P.alpha <= 0) return;
  FL = Math.min(1, p.flash);
  c.save(); c.globalAlpha = P.alpha;
  // cachecol (no mundo)
  const s = p.scarf; c.fillStyle = col(0x8a1e1a); c.beginPath(); c.moveTo(s[0].x, s[0].y - 2);
  for (let i = 1; i < s.length; i++) c.lineTo(s[i].x, s[i].y - 2 * (1 - i / s.length));
  for (let i = s.length - 1; i >= 0; i--) c.lineTo(s[i].x, s[i].y + 2.4 * (1 - i / s.length) + .5);
  c.fill();
  c.translate(p.x, p.y); c.scale(p.face, 1);
  if (p.charge > .2) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, p.charge) * (p.charged ? .8 + Math.sin(G.t * 30) * .2 : .4); c.drawImage(glowSpr(0xfff0c0), -34, -60, 68, 68); c.restore(); }
  c.rotate(P.lean * .5); c.scale(P.sx, P.sy);
  // pernas
  c.fillStyle = col(0x0f0d12);
  if (P.sit) { c.fillRect(-2, -5, 9, 4); c.fillRect(-6, -5, 8, 4); }
  else { const tl = P.tuck * 3; c.fillRect(-5 + P.legL, -9 - P.liftL + tl, 4, 9 - tl); c.fillRect(1 + P.legR, -9 - P.liftR + tl, 4, 9 - tl); }
  // espada às costas quando parado
  if (P.sword === null && !P.sit) { c.save(); c.translate(-4, -22); c.rotate(-2.3); c.fillStyle = col(0x5a4a36); c.fillRect(-2, -1.5, 6, 3); c.fillStyle = col(0xc8c4bc); c.fillRect(4, -1.2, 14, 2.4); c.restore(); }
  // manto
  const hem = P.hem;
  c.fillStyle = col(0x16141b); c.beginPath(); c.moveTo(-6, -31); c.lineTo(7, -31);
  c.quadraticCurveTo(11, -18, 11 + hem * .3, -7); c.lineTo(6 + hem * .5, -5 + Math.sin(G.t * 5) * .6); c.lineTo(1 + hem * .7, -7.5); c.lineTo(-4 + hem, -5); c.lineTo(-11 + hem, -7 + Math.sin(G.t * 4 + 1) * .8);
  c.quadraticCurveTo(-10, -18, -6, -31); c.fill();
  c.fillStyle = col(0x2c2834); c.beginPath(); c.moveTo(7, -31); c.quadraticCurveTo(11, -18, 11 + hem * .3, -7); c.lineTo(8 + hem * .4, -7); c.quadraticCurveTo(8, -18, 5, -30); c.fill();
  // braço com a espada
  if (P.sword !== null) {
    c.fillStyle = col(0x16141b); ell(c, 4, -22, 3.5, 5);
    const ang = P.sword; const w = WEAPONS[PROG.weapon];
    if (PROG.weapon === 'machado') { c.save(); c.translate(6, -22); c.rotate(ang); c.fillStyle = col(0x5a4a36); c.fillRect(0, -1.5, 26, 3); c.fillStyle = col(0xb8b0a0); c.beginPath(); c.moveTo(20, -2); c.quadraticCurveTo(30, -12, 34, -6); c.lineTo(32, 6); c.quadraticCurveTo(28, 8, 20, 3); c.fill(); c.restore(); }
    else if (PROG.weapon === 'adagas') { blade(c, 6, -22, ang, 16, 2); blade(c, 0, -20, ang + .5, 14, 2); }
    else blade(c, 6, -22, ang, PROG.weapon === 'montante' ? 34 : 25, 2, PROG.weapon === 'montante' ? 0x2a2420 : 0xe8e4dc);
    if (PROG.weapon === 'montante') { c.save(); c.globalCompositeOperation = 'lighter'; c.translate(6, -22); c.rotate(ang); c.globalAlpha = .6; c.drawImage(glowSpr(0xff7a2a), 6, -8, 30, 16); c.restore(); }
  } else if (P.arm) { c.fillStyle = col(0x16141b); ell(c, 5, -30, 3, 4.5); c.fillStyle = col(0xffb060); ell(c, 7, -35, 2, 3); }
  // máscara e capuz
  c.save(); c.translate(1, -36); c.rotate(P.mask);
  c.fillStyle = col(0x16141b); c.beginPath(); c.moveTo(-9, 2); c.quadraticCurveTo(-11, -9, -2, -11.5); c.quadraticCurveTo(6, -12, 9, -6); c.lineTo(-4, -4); c.lineTo(-14, -9 + Math.sin(G.t * 3) * .8); c.lineTo(-11, 4); c.fill(); // capuz com ponta
  c.fillStyle = col(0xebe4d6); ell(c, 1.2, 0, 8, 7.6);
  c.fillStyle = col(0xbcb3a3); c.beginPath(); c.ellipse(1.2, 0, 8, 7.6, 0, .2, PI - .3); c.ellipse(1.2, -1.2, 7.2, 6, 0, PI - .3, .2, true); c.fill();
  c.fillStyle = col(0x0a0809); ell(c, 2.4, .2, 1.7, 3.1); ell(c, 6.7, .3, 1.5, 2.9);
  c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,150,60,.85)'; ell(c, 2.6, 1, .7, .9); ell(c, 6.8, 1, .6, .8); c.globalCompositeOperation = 'source-over';
  c.strokeStyle = col(0x6a6258); c.lineWidth = .6; c.beginPath(); c.moveTo(-2, -7); c.lineTo(0, -3); c.lineTo(-.5, 1); c.stroke();
  c.restore();
  c.restore(); FL = 0;
}
// ---------- desenho genérico de criaturas mascaradas (inimigos e NPCs) ----------
// m: máscara {c, eye, w, h, horns, shape}, corpo {c, c2, w, h}, arma, etc. Usado pelos inimigos com variações.
function drawMask(c, x, y, s, m) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = col(m.c ?? 0xe0d8c8);
  if (m.shape === 'long') { c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(0, -11, 6, -6); c.lineTo(5, 8); c.quadraticCurveTo(0, 12, -5, 8); c.fill(); }
  else if (m.shape === 'skull') { ell(c, 0, -1, 7, 6.5); c.fillRect(-4, 3, 8, 5); }
  else if (m.shape === 'beak') { ell(c, 0, 0, 6, 6); poly(c, [3, -2, 13, 2, 3, 4]); }
  else if (m.shape === 'helm') { c.beginPath(); c.moveTo(-7, 6); c.lineTo(-7, -3); c.quadraticCurveTo(0, -12, 7, -3); c.lineTo(7, 6); c.closePath(); c.fill(); }
  else ell(c, 0, 0, 7, 7);
  if (m.horns) { c.fillStyle = col(m.hc ?? m.c ?? 0xe0d8c8); poly(c, [-4, -5, -9, -15, -1, -7]); poly(c, [4, -5, 9, -15, 1, -7]); }
  if (m.shape === 'helm') { c.fillStyle = col(0x050405); c.fillRect(-1, -2, 8, 2); }
  else { c.fillStyle = col(0x0a0809); ell(c, 1, 0, 1.6, 2.6); ell(c, 4.8, 0, 1.4, 2.4); }
  if (m.eye) { c.globalCompositeOperation = 'lighter'; c.fillStyle = rgba(m.eye, .95); ell(c, 1.2, .6, .9, 1.1); ell(c, 4.9, .6, .8, 1); c.drawImage(glowSpr(m.eye), -3, -5, 12, 11); c.globalCompositeOperation = 'source-over'; }
  c.restore();
}
