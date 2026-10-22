// ===================== TEMAS DAS ÁREAS: cores, fundos em paralaxe, ambiente =====================
// fill: interior da rocha; mid: pedras junto à superfície; rim: contorno; top: superfície de cima; moss: musgo/erva;
// back/backL: parede de fundo e as suas juntas; amb: luz ambiente; sky: céu (topo, base); fog: neblina
const THEMES = {
  crypt: { fill: 0x0d0b10, mid: 0x2c2633, rim: 0x403849, top: 0x7a6f80, moss: 0x5b6f4c, back: 0x27212d, backL: 0x1b1721, amb: 0x9f91ab, sky: [0x07060a, 0x1a1420], fog: 0x2a2234, bgKind: 'crypt', accent: 0xd8c8a8, particles: 'dust' },
  hub: { fill: 0x0f0d0d, mid: 0x3a3330, rim: 0x51473f, top: 0x9a8a76, moss: 0x6d7a52, back: 0x38302c, backL: 0x25201d, amb: 0xc8b6cd, sky: [0x0b0c1c, 0x4a3442], fog: 0x3a2e3a, bgKind: 'hub', accent: 0xffd9a0, particles: 'ash' },
  walls: { fill: 0x0c0d12, mid: 0x2f3442, rim: 0x464d60, top: 0x8892a8, moss: 0x5a6a50, back: 0x272c40, backL: 0x1b1f2e, amb: 0xb0b9e8, sky: [0x080a18, 0x2c2a44], fog: 0x262a40, bgKind: 'walls', accent: 0xaab8f0, particles: 'ash' },
  swamp: { fill: 0x0a0d0a, mid: 0x26301f, rim: 0x384530, top: 0x627a4a, moss: 0x7a9a4a, back: 0x1d2b1d, backL: 0x141f14, amb: 0x99b9a2, sky: [0x07100c, 0x23372a], fog: 0x2a4030, bgKind: 'swamp', accent: 0xb8f0a0, particles: 'fireflies' },
  forest: { fill: 0x0d0d12, mid: 0x3a3a46, rim: 0x55556a, top: 0xb8b4c4, moss: 0x8a8aa0, back: 0x252533, backL: 0x1a1a24, amb: 0xc8c8f3, sky: [0x0a0a1a, 0x3a3048], fog: 0x3a3650, bgKind: 'forest', accent: 0xd8e0ff, particles: 'embers' },
  forge: { fill: 0x0e0706, mid: 0x30201a, rim: 0x4a2c20, top: 0x8a5a40, moss: 0xd86a2a, back: 0x281815, backL: 0x1b0f0d, amb: 0xc88874, sky: [0x0a0402, 0x3a1408], fog: 0x4a1c0c, bgKind: 'forge', accent: 0xffa050, particles: 'embers' },
  cathedral: { fill: 0x0e0d10, mid: 0x3c3940, rim: 0x5a5560, top: 0xcac2b6, moss: 0x8a7a5a, back: 0x302c38, backL: 0x211f29, amb: 0xc8bfdf, sky: [0x0a0a18, 0x2e2a36], fog: 0x2e2a3a, bgKind: 'cathedral', accent: 0xffe0a0, particles: 'motes' },
  heart: { fill: 0x140c08, mid: 0x5a3a20, rim: 0x8a5a2a, top: 0xf0d090, moss: 0xffc070, back: 0x382315, backL: 0x27170d, amb: 0xffd0a2, sky: [0x2a1408, 0xff9a40], fog: 0x6a3a1a, bgKind: 'heart', accent: 0xfff0c0, particles: 'embers' },
};
// ---------- fundos em paralaxe (pré-desenhados em canvases) ----------
const BG = { kind: null, layers: [], w: 0, h: 0 };
function bgMake(kind) {
  const th = THEMES[kind]; BG.kind = kind; BG.layers = [];
  const H = G.H, W = Math.max(1024, Math.ceil(G.W * 1.5 / 64) * 64); BG.w = W; BG.h = H; const r = mulberry(kind.length * 977 + 13);
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  // céu
  const sky = mk(), s = sky.getContext('2d'); const g = s.createLinearGradient(0, 0, 0, H); g.addColorStop(0, css(th.sky[0])); g.addColorStop(1, css(th.sky[1])); s.fillStyle = g; s.fillRect(0, 0, W, H);
  if (kind !== 'heart' && kind !== 'forge') { for (let i = 0; i < 160; i++) { s.globalAlpha = r() * .7; s.fillStyle = '#fff'; const z = r() < .9 ? 1 : 2; s.fillRect(r() * W, r() * H * .6, z * G.dpr, z * G.dpr); } s.globalAlpha = 1;
    const mx = W * .7, my = H * .2, mr = H * .07; const mg = s.createRadialGradient(mx, my, 0, mx, my, mr * 5); mg.addColorStop(0, 'rgba(230,230,255,.35)'); mg.addColorStop(1, 'rgba(230,230,255,0)'); s.fillStyle = mg; s.fillRect(0, 0, W, H); s.fillStyle = '#e8e6f4'; s.beginPath(); s.arc(mx, my, mr, 0, TAU); s.fill(); s.fillStyle = css(th.sky[0]); s.globalAlpha = .25; s.beginPath(); s.arc(mx - mr * .3, my - mr * .1, mr * .9, 0, TAU); s.fill(); s.globalAlpha = 1; }
  if (kind === 'heart') { const sg = s.createRadialGradient(W * .5, H * .75, 0, W * .5, H * .75, H); sg.addColorStop(0, 'rgba(255,240,200,.9)'); sg.addColorStop(.3, 'rgba(255,170,80,.35)'); sg.addColorStop(1, 'rgba(255,120,40,0)'); s.fillStyle = sg; s.fillRect(0, 0, W, H); }
  BG.layers.push({ c: sky, par: 0, py: 0 });
  // silhuetas por tipo
  const sil = (par, col, alpha, fn, py = .05) => { const c = mk(), x = c.getContext('2d'); x.fillStyle = css(col); x.globalAlpha = alpha; fn(x, W, H, r); x.globalAlpha = 1; BG.layers.push({ c, par, py }); };
  const fogBand = (x, y0, y1, col, a) => { const gg = x.createLinearGradient(0, y0, 0, y1); gg.addColorStop(0, rgba(col, 0)); gg.addColorStop(.5, rgba(col, a)); gg.addColorStop(1, rgba(col, 0)); x.fillStyle = gg; x.fillRect(0, y0, W, y1 - y0); };
  const ridge = (x, base, amp, freq, seed) => { const p1 = seed * 1.3, p2 = seed * 2.7, p3 = seed * .7; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= W; i += 8) { const t = i / W * TAU; const n = .5 + .5 * (Math.sin(t * freq + p1) * .5 + Math.sin(t * freq * 2 + p2) * .3 + Math.sin(t * freq * 5 + p3) * .2); x.lineTo(i, base - n * amp); } x.lineTo(W, H); x.closePath(); x.fill(); };
  const spire = (x, cx, base, w, h) => { x.beginPath(); x.moveTo(cx - w, base); x.lineTo(cx - w, base - h * .7); x.lineTo(cx, base - h); x.lineTo(cx + w, base - h * .7); x.lineTo(cx + w, base); x.closePath(); x.fill(); };
  const tree = (x, cx, base, h, w, dead) => { x.beginPath(); x.moveTo(cx - w, base); x.quadraticCurveTo(cx - w * .4, base - h * .5, cx - w * .2, base - h); x.lineTo(cx + w * .2, base - h); x.quadraticCurveTo(cx + w * .4, base - h * .5, cx + w, base); x.fill(); x.lineWidth = w * .35; x.strokeStyle = x.fillStyle; for (let i = 0; i < 6; i++) { const yy = base - h * (.4 + i * .1), sd = i % 2 ? 1 : -1; x.beginPath(); x.moveTo(cx, yy); x.quadraticCurveTo(cx + sd * h * .2, yy - h * .08, cx + sd * h * (.25 + r() * .15), yy - h * (.15 + r() * .1)); x.stroke(); } if (!dead) { x.beginPath(); x.arc(cx, base - h, h * .32, 0, TAU); x.fill(); } };
  switch (kind) {
    case 'crypt': case 'forge':
      sil(.15, kind === 'forge' ? 0x2a0c06 : 0x14101a, 1, (x) => { for (let i = 0; i < 9; i++) { const cx = (i + .5) / 9 * W, w = W / 9 * .32; x.fillRect(cx - w / 2, 0, w, H); x.beginPath(); x.ellipse(cx, H * .25, w * 1.4, H * .12, 0, 0, TAU); } fogBand(x, H * .5, H, kind === 'forge' ? 0x6a2008 : 0x2a2234, .7); });
      sil(.35, kind === 'forge' ? 0x1a0604 : 0x0e0b12, 1, (x) => { for (let i = 0; i < 7; i++) { const cx = (i + .3) / 7 * W, w = W / 7 * .28; x.fillRect(cx - w / 2, 0, w, H); for (let k = 0; k < 5; k++) x.fillRect(cx - w * .7, H * (.15 + k * .2), w * 1.4, H * .02); } });
      if (kind === 'forge') sil(.55, 0xff6a20, .18, (x) => { fogBand(x, H * .7, H, 0xff5a10, .9); });
      break;
    case 'hub': case 'walls':
      sil(.1, 0x1a1828, 1, (x) => { ridge(x, H * .72, H * .3, 3, 2); });
      sil(.25, 0x111020, 1, (x) => { for (let i = 0; i < 6; i++) { const cx = (i + r() * .5) / 6 * W; x.fillRect(cx - 30 * G.dpr, H * .45, 60 * G.dpr, H); spire(x, cx, H * .46, 34 * G.dpr, H * (.12 + r() * .1)); } x.fillRect(0, H * .62, W, H); for (let i = 0; i < W; i += 22 * G.dpr) x.fillRect(i, H * .6, 12 * G.dpr, H * .03); fogBand(x, H * .55, H * .9, kind === 'walls' ? 0x262a40 : 0x3a2e3a, .55); });
      sil(.5, 0x08070e, 1, (x) => { ridge(x, H * .88, H * .1, 6, 9); });
      break;
    case 'swamp':
      sil(.12, 0x10201a, 1, (x) => { ridge(x, H * .7, H * .15, 4, 5); fogBand(x, H * .55, H * .85, 0x2a4030, .8); });
      sil(.3, 0x0a140e, 1, (x) => { for (let i = 0; i < 14; i++) tree(x, r() * W, H * (.78 + r() * .1), H * (.3 + r() * .25), 7 * G.dpr, true); fogBand(x, H * .7, H, 0x23372a, .7); });
      sil(.55, 0x050a07, 1, (x) => { for (let i = 0; i < 8; i++) tree(x, r() * W, H * 1.02, H * (.45 + r() * .3), 12 * G.dpr, true); });
      break;
    case 'forest':
      sil(.1, 0x1c1a2a, 1, (x) => { ridge(x, H * .66, H * .25, 3, 3); fogBand(x, H * .5, H * .8, 0x3a3650, .6); });
      sil(.28, 0x2a2838, .9, (x) => { for (let i = 0; i < 20; i++) tree(x, r() * W, H * (.8 + r() * .08), H * (.35 + r() * .25), 6 * G.dpr, r() < .6); fogBand(x, H * .65, H, 0x3a3650, .6); });
      sil(.5, 0x0c0b14, 1, (x) => { for (let i = 0; i < 9; i++) tree(x, r() * W, H * 1.02, H * (.6 + r() * .3), 13 * G.dpr, true); });
      break;
    case 'cathedral':
      sil(.12, 0x1a1828, 1, (x) => { for (let i = 0; i < 5; i++) { const cx = (i + .5) / 5 * W; x.fillRect(cx - 50 * G.dpr, H * .3, 100 * G.dpr, H); spire(x, cx, H * .31, 56 * G.dpr, H * .28); x.fillStyle = 'rgba(255,200,120,.35)'; x.fillRect(cx - 8 * G.dpr, H * .4, 16 * G.dpr, 34 * G.dpr); x.fillStyle = css(0x1a1828); } fogBand(x, H * .5, H, 0x2e2a3a, .6); });
      sil(.4, 0x0c0b12, 1, (x) => { for (let i = 0; i < 8; i++) { const cx = (i + .5) / 8 * W; x.fillRect(cx - 14 * G.dpr, 0, 28 * G.dpr, H); x.beginPath(); x.arc(cx + W / 16, H * .32, W / 16 - 14 * G.dpr, PI, 0); x.lineTo(cx + W / 8 - 14 * G.dpr, H * .26); x.lineTo(cx + 14 * G.dpr, H * .26); x.fill(); } });
      break;
    case 'heart':
      sil(.15, 0xffc080, .25, (x) => { for (let i = 0; i < 18; i++) { const cx = r() * W, cy = H * (.3 + r() * .5), rr = (20 + r() * 60) * G.dpr; x.beginPath(); x.moveTo(cx, cy - rr); x.lineTo(cx + rr * .4, cy); x.lineTo(cx, cy + rr * .6); x.lineTo(cx - rr * .4, cy); x.fill(); } });
      sil(.35, 0x2a1408, .85, (x) => { for (let i = 0; i < 10; i++) { const cx = r() * W, cy = H * (.5 + r() * .45), w = (40 + r() * 90) * G.dpr; x.beginPath(); x.ellipse(cx, cy, w, w * .22, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(cx - w * .8, cy); x.lineTo(cx, cy + w * .9); x.lineTo(cx + w * .8, cy); x.fill(); } });
      break;
  }
}
function drawBG() {
  const c = G.ctx; c.setTransform(1, 0, 0, 1, 0, 0);
  const R0 = ROOM.cur; const cy0 = R0 ? (CAM.y - R0.h * T / 2) : 0;
  for (const L of BG.layers) {
    const off = ((CAM.x * L.par * G.s) % BG.w + BG.w) % BG.w, oy = clamp(-cy0 * L.py * G.s, -G.H * .15, G.H * .15);
    c.drawImage(L.c, -off, oy); if (BG.w - off < G.W) c.drawImage(L.c, BG.w - off, oy);
    if (oy > 0) { c.fillStyle = '#000'; }
  }
}
// ---------- partículas ambientes ----------
function ambientParticles(dt) {
  const th = ROOM.theme, k = th.particles, q = Q().particles, v = viewRect(0);
  const n = dt * 26 * q;
  for (let i = 0; i < n; i++) {
    if (Math.random() > n - i) break;
    const x = rnd(v.x0, v.x1), y = rnd(v.y0, v.y1);
    if (k === 'dust') part({ x, y, vx: rnd(-6, 6), vy: rnd(-4, 4), life: rnd(2, 4), s: rnd(.6, 1.4), color: 0xcfc4b0, a: .35, drag: 0, glow: false });
    else if (k === 'ash') part({ x, y: v.y0 - 10, vx: rnd(10, 30), vy: rnd(15, 35), life: rnd(4, 7), s: rnd(.8, 1.8), color: 0xbab2a8, a: .55, drag: 0, glow: false, shape: 'r', rot: rnd(0, TAU) });
    else if (k === 'embers') part({ x, y: v.y1 + 10, vx: rnd(-15, 15), vy: rnd(-60, -25), life: rnd(2.5, 5), s: rnd(.8, 1.6), s1: .3, color: pick([0xff9a40, 0xffc070, 0xff6a20]), a: .9, drag: .2, glow: true });
    else if (k === 'fireflies') { if (Math.random() < .35) part({ x, y, vx: rnd(-12, 12), vy: rnd(-10, 6), life: rnd(2, 4), s: rnd(1, 1.8), color: 0xc8f080, a: .9, drag: .3, glow: true }); }
    else if (k === 'motes') part({ x, y, vx: rnd(-4, 4), vy: rnd(-8, -2), life: rnd(3, 5), s: rnd(.6, 1.2), color: 0xffe6b0, a: .6, drag: 0, glow: true });
  }
}
// neblina sobreposta e vinheta (por cima de tudo)
function drawOverlay() {
  const c = G.ctx, th = ROOM.theme; c.setTransform(1, 0, 0, 1, 0, 0);
  const t = G.t; const fogA = ROOM.cur && ROOM.cur.fog != null ? ROOM.cur.fog : .2;
  if (fogA > 0) {
    if (!G.fogSpr || G.fogKey !== th.fog) { G.fogKey = th.fog; const f = document.createElement('canvas'); f.width = 256; f.height = 128; const x = f.getContext('2d'); for (let i = 0; i < 40; i++) { const gx = Math.random() * 256, gy = Math.random() * 128, rr = 20 + Math.random() * 50; const gg = x.createRadialGradient(gx, gy, 0, gx, gy, rr); gg.addColorStop(0, rgba(shade(th.fog, .3), .35)); gg.addColorStop(1, rgba(th.fog, 0)); x.fillStyle = gg; x.fillRect(0, 0, 256, 128); } G.fogSpr = f; }
    const fw = G.W * 1.2, fh = G.H * .6, ox = ((-(CAM.x * .6 * G.s) - t * 12 * G.dpr) % fw + fw) % fw;
    c.globalAlpha = fogA; c.globalCompositeOperation = 'screen';
    c.drawImage(G.fogSpr, ox - fw, G.H - fh, fw, fh); c.drawImage(G.fogSpr, ox, G.H - fh, fw, fh);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  }
  if (!G.vig || G.vigW !== G.W || G.vigH !== G.H) { G.vigW = G.W; G.vigH = G.H; const v = document.createElement('canvas'); v.width = 256; v.height = 256; const x = v.getContext('2d'); const gg = x.createRadialGradient(128, 128, 60, 128, 128, 182); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(0,0,0,.62)'); x.fillStyle = gg; x.fillRect(0, 0, 256, 256); G.vig = v; }
  c.drawImage(G.vig, 0, 0, G.W, G.H);
}
