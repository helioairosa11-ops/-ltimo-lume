// ===================== GRÁFICOS: canvas, câmara, luz, partículas =====================
const T = 32;            // tamanho do bloco em unidades do mundo
const VIEW_H = 384;      // altura visível do mundo (unidades)
const G = { cv: null, ctx: null, W: 1, H: 1, dpr: 1, s: 1, lc: null, lctx: null, LF: 3, spr: {}, t: 0 };
const CAM = { x: 0, y: 0, w: 640, h: VIEW_H, tx: 0, ty: 0, shake: 0, sx: 0, sy: 0, zoom: 1, look: 0, lockX: null, override: null, minX: -1e9, maxX: 1e9, minY: -1e9, maxY: 1e9 };
const LIGHTS = []; // luzes deste frame
function initGfx() {
  G.cv = $('#cv'); G.ctx = G.cv.getContext('2d', { alpha: false });
  G.lc = document.createElement('canvas'); G.lctx = G.lc.getContext('2d');
  addEventListener('resize', resizeGfx); resizeGfx();
}
function resizeGfx() {
  const q = Q(); G.dpr = Math.min(devicePixelRatio || 1, q.dpr); G.LF = q.light;
  G.W = Math.max(1, Math.round(innerWidth * G.dpr)); G.H = Math.max(1, Math.round(innerHeight * G.dpr));
  G.cv.width = G.W; G.cv.height = G.H;
  G.s = Math.min(G.H / VIEW_H, G.W / 560);
  G.lc.width = Math.ceil(G.W / G.LF); G.lc.height = Math.ceil(G.H / G.LF);
  CAM.w = G.W / G.s; CAM.h = G.H / G.s;
  BUS.emit('resize');
}
// sprite de brilho radial por cor (cache)
function glowSpr(color, soft = 1) {
  const k = color + '_' + soft; let c = G.spr[k]; if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); const [r, gg, b] = hexRGB(color);
  if (soft === 1) { g.addColorStop(0, `rgba(${r},${gg},${b},1)`); g.addColorStop(.25, `rgba(${r},${gg},${b},.55)`); g.addColorStop(.6, `rgba(${r},${gg},${b},.16)`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); }
  else { g.addColorStop(0, `rgba(${r},${gg},${b},1)`); g.addColorStop(.5, `rgba(${r},${gg},${b},.6)`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); }
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); G.spr[k] = c; return c;
}
// adiciona uma luz neste frame
function light(x, y, r, color, i = 1, flick = 0) {
  if (flick) i *= 1 - flick * .5 + flick * .5 * (Math.sin(G.t * 11.3 + x * .7) * .5 + Math.sin(G.t * 7.1 + y) * .5);
  LIGHTS.push({ x, y, r, color, i });
}
// transformação mundo → ecrã
function camTransform(ctx, k = 1, par = 1) {
  const s = G.s * CAM.zoom * k; const ox = (CAM.x + CAM.sx) * par, oy = (CAM.y + CAM.sy) * par;
  ctx.setTransform(s, 0, 0, s, Math.round(G.W / 2 * k - ox * s), Math.round(G.H / 2 * k - oy * s));
}
function viewRect(m = 0) { const hw = CAM.w / 2 / CAM.zoom, hh = CAM.h / 2 / CAM.zoom; return { x0: CAM.x - hw - m, x1: CAM.x + hw + m, y0: CAM.y - hh - m, y1: CAM.y + hh + m }; }
function onScreen(x, y, m = 64) { const v = viewRect(m); return x > v.x0 && x < v.x1 && y > v.y0 && y < v.y1; }
// mapa de luz: ambiente + luzes somadas; multiplica sobre a cena
function renderLighting(amb) {
  const l = G.lctx, lc = G.lc; l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.globalAlpha = 1;
  l.fillStyle = css(amb); l.fillRect(0, 0, lc.width, lc.height);
  camTransform(l, 1 / G.LF); l.globalCompositeOperation = 'lighter';
  const v = viewRect(200);
  for (const L of LIGHTS) {
    if (L.x + L.r < v.x0 || L.x - L.r > v.x1 || L.y + L.r < v.y0 || L.y - L.r > v.y1) continue;
    l.globalAlpha = clamp(L.i, 0, 1.6) / 1.6 * .95; l.drawImage(glowSpr(L.color, 2), L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
    if (L.i > 1) { l.globalAlpha = Math.min(1, L.i - 1); l.drawImage(glowSpr(L.color, 2), L.x - L.r * .6, L.y - L.r * .6, L.r * 1.2, L.r * 1.2); }
  }
  l.globalAlpha = 1; l.globalCompositeOperation = 'source-over';
  const c = G.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.imageSmoothingEnabled = true; c.drawImage(lc, 0, 0, G.W, G.H); c.globalCompositeOperation = 'source-over';
}
// brilhos aditivos (depois da luz): dão a sensação de bloom
function renderGlows() {
  if (!Q().bloom) return; const c = G.ctx; camTransform(c); c.globalCompositeOperation = 'lighter'; const v = viewRect(100);
  for (const L of LIGHTS) { if (L.glow === 0 || L.x < v.x0 || L.x > v.x1 || L.y < v.y0 || L.y > v.y1) continue; const r = Math.min(L.r * .28, 70); c.globalAlpha = clamp(L.i * .22, 0, .5); c.drawImage(glowSpr(L.color), L.x - r, L.y - r, r * 2, r * 2); }
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}
// ---------- partículas ----------
const PARTS = [], GPARTS = []; // normais (iluminadas) e brilhantes (aditivas)
function part(o) {
  const q = Q().particles; if (o.opt && Math.random() > q) return;
  const p = { x: o.x, y: o.y, vx: o.vx || 0, vy: o.vy || 0, life: o.life || .6, max: o.life || .6, s: o.s || 2, s1: o.s1 ?? (o.s || 2), color: o.color ?? 0xffffff, a: o.a ?? 1, grav: o.grav || 0, drag: o.drag ?? 1.5, shape: o.shape || 'c', rot: o.rot || 0, vr: o.vr || 0, solid: o.solid };
  (o.glow ? GPARTS : PARTS).push(p); if (PARTS.length > 900) PARTS.splice(0, 100); if (GPARTS.length > 900) GPARTS.splice(0, 100);
}
function burst(x, y, n, o = {}) {
  const q = Q().particles; n = Math.max(1, Math.round(n * q));
  for (let i = 0; i < n; i++) {
    const a = (o.dir ?? -HPI) + rnd(-1, 1) * (o.spread ?? PI), sp = rnd(o.smin ?? 40, o.smax ?? 160);
    part({ x: x + rnd(-1, 1) * (o.jx || 0), y: y + rnd(-1, 1) * (o.jy || 0), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(o.lmin ?? .3, o.lmax ?? .8), s: rnd(o.szmin ?? 1.5, o.szmax ?? 3.5), s1: o.sz1, color: Array.isArray(o.color) ? pick(o.color) : o.color ?? 0xffffff, a: o.a ?? 1, grav: o.grav ?? 0, drag: o.drag ?? 2, shape: o.shape, glow: o.glow ?? true, vr: rnd(-8, 8), solid: o.solid });
  }
}
function updParts(dt) {
  for (const L of [PARTS, GPARTS]) for (let i = L.length - 1; i >= 0; i--) {
    const p = L[i]; p.life -= dt; if (p.life <= 0) { L.splice(i, 1); continue; }
    p.vy += p.grav * dt; const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy *= d; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.solid && ROOM.cur && solidAt(p.x, p.y)) { p.y -= p.vy * dt; p.vy *= -.3; p.vx *= .6; }
  }
}
function drawParts(L, add) {
  const c = G.ctx; camTransform(c); if (add) c.globalCompositeOperation = 'lighter'; const v = viewRect(20);
  for (const p of L) {
    if (p.x < v.x0 || p.x > v.x1 || p.y < v.y0 || p.y > v.y1) continue;
    const k = p.life / p.max, s = lerp(p.s1, p.s, k); c.globalAlpha = p.a * Math.min(1, k * 2.2); c.fillStyle = css(p.color);
    if (p.shape === 'r') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillRect(-s, -s * .45, s * 2, s * .9); c.restore(); }
    else if (p.shape === 'l') { c.strokeStyle = css(p.color); c.lineWidth = s * .5; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * .04, p.y - p.vy * .04); c.stroke(); }
    else if (add && s > 2.5) { c.drawImage(glowSpr(p.color), p.x - s * 2, p.y - s * 2, s * 4, s * 4); }
    else { c.beginPath(); c.arc(p.x, p.y, s, 0, TAU); c.fill(); }
  }
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}
// ---------- efeitos desenhados (golpes, ondas) ----------
const FX = [];
function fx(o) { o.t = 0; FX.push(o); return o; }
function updFx(dt) { for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt; if (f.upd && f.upd(f, dt) === false || f.t >= f.dur) FX.splice(i, 1); } }
function drawFx(layer) {
  const c = G.ctx; camTransform(c);
  for (const f of FX) { if ((f.layer || 'add') !== layer) continue; c.save(); if (layer === 'add') c.globalCompositeOperation = 'lighter'; f.draw(c, f, f.t / f.dur); c.restore(); }
}
// crescente de golpe (estilo Hollow Knight)
function slashFx(x, y, dir, ang, len, wid, color = 0xffffff, dur = .14, o = {}) {
  return fx({
    dur, layer: 'add', draw(c, f, k) {
      c.translate(x + (o.follow ? o.follow.x - o.fx0 : 0), y + (o.follow ? o.follow.y - o.fy0 : 0)); c.scale(dir, 1); c.rotate(ang);
      const a = (1 - k) * (o.alpha ?? .95), sweep = easeOut(Math.min(1, k * 2.2));
      c.globalAlpha = a; c.fillStyle = css(color);
      c.beginPath(); const r = len, w = wid * (1 - k * .5);
      const a0 = -1.35 + sweep * .25, a1 = 1.35 * (o.arc ?? 1);
      c.ellipse(0, 0, r, r * (o.flat ?? .62), 0, a0, a1, false); c.ellipse(-w * .5, 0, r - w, (r - w) * (o.flat ?? .62) * .78, 0, a1, a0, true); c.closePath(); c.fill();
      c.globalAlpha = a * .45; c.drawImage(glowSpr(color), r * .1, -r * .55, r * 1.1, r * 1.1);
    }
  });
}
function ringFx(x, y, r0, r1, color, dur = .4, w = 4) { return fx({ dur, layer: 'add', draw(c, f, k) { c.globalAlpha = (1 - k) * .9; c.strokeStyle = css(color); c.lineWidth = w * (1 - k) + .5; c.beginPath(); c.arc(x, y, lerp(r0, r1, easeOut(k)), 0, TAU); c.stroke(); } }); }
function flashFx(x, y, r, color, dur = .2) { return fx({ dur, layer: 'add', draw(c, f, k) { c.globalAlpha = (1 - k); c.drawImage(glowSpr(color), x - r, y - r, r * 2, r * 2); } }); }
function lineFx(x0, y0, x1, y1, color, w = 3, dur = .2) { return fx({ dur, layer: 'add', draw(c, f, k) { c.globalAlpha = 1 - k; c.strokeStyle = css(color); c.lineWidth = w * (1 - k * .6); c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); } }); }
// números de dano
const DNUM = [];
function dmgNum(x, y, v, kind = '') { if (!SET.dmgNumbers) return; if (kind !== 'player') for (const d of DNUM) if (d.kind !== 'player' && d.t < .5 && Math.abs(d.x - x) < 60 && Math.abs(d.y - y) < 50) { d.v += Math.round(v); d.t = .04; d.pop = 1; if (kind === 'crit') d.kind = 'crit'; return; } DNUM.push({ x: x + rnd(-6, 6), y, v: Math.round(v), t: 0, kind, pop: 1 }); if (DNUM.length > 40) DNUM.shift(); }
function drawDmgNums(dt) {
  const c = G.ctx; camTransform(c); c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = DNUM.length - 1; i >= 0; i--) {
    const d = DNUM[i]; d.t += dt; if (d.t > .9) { DNUM.splice(i, 1); continue; }
    const k = d.t / .9, y = d.y - easeOut(Math.min(1, d.t * 3)) * 18 - d.t * 8;
    c.globalAlpha = 1 - Math.max(0, k - .6) / .4; d.pop = Math.max(0, (d.pop || 0) - dt * 6); const sz = (d.kind === 'crit' ? 15 : 11) * (1 + d.pop * .35);
    c.font = `${d.kind === 'crit' ? 600 : 400} ${sz}px "EB Garamond",Georgia,serif`; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(d.v, d.x, y);
    c.fillStyle = d.kind === 'crit' ? '#ffd27a' : d.kind === 'fire' ? '#ff9a50' : d.kind === 'holy' ? '#fff2b8' : d.kind === 'player' ? '#ff6a5a' : '#f2ead8'; c.fillText(d.v, d.x, y);
  }
  c.globalAlpha = 1;
}
function shake(v) { if (SET.shake) CAM.shake = Math.max(CAM.shake, v); }
