// ===================== TEXTURAS PROCEDURAIS =====================
const TEX = {};
function _vn(x, y, P, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const x0 = ((xi % P) + P) % P, y0 = ((yi % P) + P) % P, x1 = (x0 + 1) % P, y1 = (y0 + 1) % P;
  const a = hash2(x0 + s * 131, y0 + s * 71), b = hash2(x1 + s * 131, y0 + s * 71), c = hash2(x0 + s * 131, y1 + s * 71), d = hash2(x1 + s * 131, y1 + s * 71);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(u, v, oct, base, seed) { let s = 0, amp = 0.5, n = 0, per = base; for (let i = 0; i < oct; i++) { s += amp * _vn(u * per, v * per, per, seed + i * 17); n += amp; amp *= 0.5; per *= 2; } return s / n; }
// Voronoi periódico: devolve [d1, d2, id]
function voro(u, v, G, seed) {
  const gx = u * G, gy = v * G, cx = Math.floor(gx), cy = Math.floor(gy);
  let d1 = 9, d2 = 9, id = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const nx = cx + i, ny = cy + j, wx = ((nx % G) + G) % G, wy = ((ny % G) + G) % G;
    const px = nx + hash2(wx + seed, wy * 3 + seed), py = ny + hash2(wx * 7 + seed, wy + seed * 5);
    const d = Math.hypot(px - gx, py - gy);
    if (d < d1) { d2 = d1; d1 = d; id = hash2(wx + 91, wy + 37 + seed); } else if (d < d2) d2 = d;
  }
  return [d1, d2, id];
}
function _mkCanvas(S) { const c = document.createElement('canvas'); c.width = c.height = S; return c; }
function _texFrom(canvas, srgb, rep = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(4, R.renderer ? R.renderer.capabilities.getMaxAnisotropy() : 1);
  t.needsUpdate = true; return t;
}
// gera mapa de cor e normal a partir de uma função (u,v) -> [r,g,b,h]
function genTex(name, fn, opt = {}) {
  if (TEX[name]) return TEX[name];
  const S = opt.size || Q().tex;
  const H = new Float32Array(S * S);
  const cc = _mkCanvas(S), cx = cc.getContext('2d'), img = cx.createImageData(S, S), D = img.data;
  const ec = opt.emissive ? _mkCanvas(S) : null, eimg = ec ? ec.getContext('2d').createImageData(S, S) : null;
  const out = [0, 0, 0, 0, 0];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x;
    fn(x / S, y / S, out);
    D[i * 4] = out[0] * 255; D[i * 4 + 1] = out[1] * 255; D[i * 4 + 2] = out[2] * 255; D[i * 4 + 3] = 255;
    H[i] = out[3];
    if (eimg) { const e = out[4] || 0; eimg.data[i * 4] = e * 255; eimg.data[i * 4 + 1] = e * 120; eimg.data[i * 4 + 2] = e * 30; eimg.data[i * 4 + 3] = 255; }
  }
  cx.putImageData(img, 0, 0);
  const res = { map: _texFrom(cc, true) };
  if (opt.normal !== false) {
    const nc = _mkCanvas(S), nx = nc.getContext('2d'), nimg = nx.createImageData(S, S), N = nimg.data, k = opt.bump || 2.5;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const l = H[y * S + (x - 1 + S) % S], r = H[y * S + (x + 1) % S], u = H[((y - 1 + S) % S) * S + x], d = H[((y + 1) % S) * S + x];
      let dx = (l - r) * k * S / 64, dy = (u - d) * k * S / 64, dz = 1; const L = Math.hypot(dx, dy, dz);
      N[i * 4] = (dx / L * .5 + .5) * 255; N[i * 4 + 1] = (dy / L * .5 + .5) * 255; N[i * 4 + 2] = (dz / L * .5 + .5) * 255; N[i * 4 + 3] = 255;
    }
    nx.putImageData(nimg, 0, 0); res.normal = _texFrom(nc, false);
  }
  if (ec) { ec.getContext('2d').putImageData(eimg, 0, 0); res.emissive = _texFrom(ec, true); }
  TEX[name] = res; return res;
}
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function hexc(h) { return [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255]; }
function setc(o, c, h) { o[0] = clamp(c[0], 0, 1); o[1] = clamp(c[1], 0, 1); o[2] = clamp(c[2], 0, 1); o[3] = h; }

// ---- receitas ----
const TEXGEN = {
  stone(a = 0x4d4842, b = 0x2e2a27, rows = 6, cols = 3, seed = 1) {
    const A = hexc(a), B = hexc(b);
    return (u, v, o) => {
      const r = Math.floor(v * rows), off = (r % 2) * 0.5 / cols, cu = (u + off) * cols, c = Math.floor(cu);
      const fu = cu - c, fv = v * rows - r;
      const edge = Math.min(fu, 1 - fu) / cols * rows, ev = Math.min(fv, 1 - fv);
      const e = Math.min(edge * 1.4, ev);
      const id = hash2(((c % cols) + cols) % cols + r * 13, r + seed * 7);
      const n = fbm(u, v, 5, 4, seed), n2 = fbm(u, v, 3, 16, seed + 9);
      const mortar = e < 0.06;
      let col = mixc(B, A, 0.35 + id * 0.45 + (n - .5) * 0.6);
      col = mixc(col, hexc(0x3a4030), Math.max(0, fbm(u, v, 3, 3, seed + 3) - .62) * 1.8); // musgo
      if (mortar) col = mixc(col, [0.09, 0.08, 0.07], 0.75);
      const h = mortar ? 0.0 : 0.55 + n * .35 + n2 * .15 - Math.max(0, 0.12 - e) * 2;
      setc(o, mixc(col, [0, 0, 0], (1 - n2) * .25), h);
    };
  },
  cobble(a = 0x55504a, b = 0x2a2724, G = 7, seed = 3) {
    const A = hexc(a), B = hexc(b);
    return (u, v, o) => {
      const [d1, d2, id] = voro(u, v, G, seed); const e = d2 - d1;
      const n = fbm(u, v, 4, 8, seed);
      let col = mixc(B, A, 0.3 + id * 0.5 + (n - .5) * .4);
      const gap = e < 0.08;
      if (gap) col = mixc(col, [0.07, 0.06, 0.05], 0.8);
      setc(o, col, gap ? 0 : Math.min(1, e * 2.2) * 0.7 + n * 0.3);
    };
  },
  flag(a = 0x58534c, b = 0x34302b, G = 4, seed = 5) {
    const A = hexc(a), B = hexc(b);
    return (u, v, o) => {
      const gx = u * G, gy = v * G, fx = gx - Math.floor(gx), fy = gy - Math.floor(gy);
      const e = Math.min(fx, 1 - fx, fy, 1 - fy); const id = hash2(Math.floor(gx), Math.floor(gy) + seed);
      const n = fbm(u, v, 5, 6, seed), cr = Math.abs(fbm(u, v, 3, 5, seed + 4) - .5);
      let col = mixc(B, A, .35 + id * .4 + (n - .5) * .5);
      if (cr < .012) col = mixc(col, [0.05, 0.05, 0.05], .7);
      if (e < .025) col = mixc(col, [0.06, 0.055, 0.05], .8);
      setc(o, col, e < .025 ? 0 : .6 + n * .3 - (cr < .012 ? .3 : 0));
    };
  },
  marble(a = 0xbab3a6, b = 0x6c665f, seed = 7) {
    const A = hexc(a), B = hexc(b);
    return (u, v, o) => {
      const n = fbm(u, v, 5, 3, seed); const vein = Math.abs(Math.sin((u * 3 + v * 2 + n * 3.5) * PI * 2));
      const gx = u * 2, gy = v * 2, fx = gx % 1, fy = gy % 1, e = Math.min(fx, 1 - fx, fy, 1 - fy);
      let col = mixc(B, A, 0.55 + n * .35); col = mixc(col, [0.25, 0.23, 0.22], Math.pow(1 - vein, 12) * .7);
      if (e < .012) col = mixc(col, [0.1, 0.1, 0.1], .7);
      setc(o, col, e < .012 ? 0 : .5 + n * .1);
    };
  },
  ground(a = 0x3d3428, b = 0x221c15, seed = 11, speck = 0x000000, sp = 0) {
    const A = hexc(a), B = hexc(b), SPC = hexc(speck);
    return (u, v, o) => {
      const n = fbm(u, v, 6, 4, seed), n2 = fbm(u, v, 3, 24, seed + 2);
      let col = mixc(B, A, n * 1.2 - .1 + (n2 - .5) * .3);
      if (sp && hash2((u * 512) | 0, (v * 512) | 0) < sp) col = mixc(col, SPC, .6);
      setc(o, col, n * .7 + n2 * .3);
    };
  },
  grass(seed = 13) {
    return (u, v, o) => {
      const n = fbm(u, v, 5, 4, seed), n2 = fbm(u, v, 2, 64, seed + 5), n3 = fbm(u, v, 3, 6, seed + 9);
      let col = mixc([0.12, 0.13, 0.07], [0.27, 0.3, 0.15], n * 1.1 + (n2 - .5) * .6);
      col = mixc(col, [0.25, 0.2, 0.13], Math.max(0, n3 - .55) * 2.2);
      setc(o, col, n2 * .6 + n * .4);
    };
  },
  wood(a = 0x4a3524, b = 0x2a1c12, planks = 4, seed = 17) {
    const A = hexc(a), B = hexc(b);
    return (u, v, o) => {
      const p = Math.floor(u * planks), fu = u * planks - p, id = hash2(p, seed);
      const g = fbm(u * .3, v, 3, 8, seed + p) * 6 + v * 20 * (0.6 + id);
      const grain = Math.sin(g * PI) * .5 + .5;
      let col = mixc(B, A, .4 + grain * .3 + id * .3);
      const e = Math.min(fu, 1 - fu);
      if (e < .04) col = mixc(col, [0.05, 0.035, 0.025], .8);
      setc(o, col, e < .04 ? 0 : .6 + grain * .2);
    };
  },
  bark(seed = 19) {
    return (u, v, o) => {
      const n = fbm(u * 4, v * .5, 4, 4, seed), r = Math.abs(Math.sin((u * 14 + n * 2) * PI));
      const col = mixc([0.08, 0.065, 0.05], [0.28, 0.24, 0.2], r * .7 + n * .4);
      setc(o, col, r * .8 + n * .2);
    };
  },
  metal(a = 0x5b5f66, seed = 23) {
    const A = hexc(a);
    return (u, v, o) => {
      const n = fbm(u, v, 5, 6, seed), s = hash2((u * 300) | 0, (v * 9) | 0) > .985 ? .25 : 0;
      setc(o, mixc(mixc([0.05, 0.05, 0.06], A, .5 + n * .6), [0.85, 0.85, 0.85], s), .5 + n * .2 - s);
    };
  },
  cloth(a = 0x3a2e2a, seed = 29) {
    const A = hexc(a);
    return (u, v, o) => {
      const w = (Math.sin(u * 256 * PI) * Math.sin(v * 256 * PI)) * .5 + .5, n = fbm(u, v, 4, 5, seed);
      setc(o, mixc(mixc([0.02, 0.02, 0.02], A, .7 + n * .5), [0, 0, 0], w * .15), w * .3 + n * .4);
    };
  },
  rock(a = 0x55504a, b = 0x24211e, seed = 31) {
    const A = hexc(a), B = hexc(b);
    return (u, v, o) => {
      const n = fbm(u, v, 6, 3, seed), r = 1 - Math.abs(fbm(u, v, 4, 5, seed + 3) * 2 - 1);
      const col = mixc(B, A, n * .9 + r * .35 - .1);
      setc(o, col, n * .5 + r * .5);
    };
  },
  lava(seed = 37) {
    return (u, v, o) => {
      const [d1, d2] = voro(u, v, 6, seed); const e = d2 - d1; const n = fbm(u, v, 4, 6, seed);
      const glow = clamp(1 - e * 9, 0, 1) * (0.6 + n * .6);
      setc(o, mixc([0.06, 0.04, 0.035], [0.2, 0.1, 0.07], n), (1 - glow) * .7 + n * .3);
      o[4] = glow;
    };
  },
  plaster(a = 0x6e675c, seed = 41) {
    const A = hexc(a);
    return (u, v, o) => {
      const n = fbm(u, v, 6, 4, seed), stain = Math.max(0, fbm(u, v * .5, 3, 2, seed + 2) - .55);
      setc(o, mixc(mixc(A, [0.15, 0.13, 0.11], (1 - n) * .5), [0.08, 0.07, 0.06], stain * 2), n);
    };
  },
  tiles(a = 0x2b2522, b = 0x47403a, G = 8, seed = 43) { // pisos xadrez da catedral
    const A = hexc(a), B = hexc(b);
    return (u, v, o) => {
      const gx = Math.floor(u * G), gy = Math.floor(v * G), fx = u * G - gx, fy = v * G - gy, e = Math.min(fx, 1 - fx, fy, 1 - fy);
      const n = fbm(u, v, 4, 8, seed);
      let col = ((gx + gy) & 1) ? A : B; col = mixc(col, [0, 0, 0], (1 - n) * .3);
      if (e < .03) col = mixc(col, [0.05, 0.04, 0.04], .8);
      setc(o, col, e < .03 ? 0 : .6 + n * .2);
    };
  },
};
function tex(name, recipe, opt) { return genTex(name, recipe, opt); }

// Sprites (sem normal)
const SPR = {};
function spriteTex(name) {
  if (SPR[name]) return SPR[name];
  const S = 64, c = _mkCanvas(S), x = c.getContext('2d');
  if (name === 'glow') { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
  else if (name === 'soft') { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.6, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
  else if (name === 'smoke') { for (let i = 0; i < 14; i++) { const px = 32 + rnd(-10, 10), py = 32 + rnd(-10, 10), r = rnd(8, 20); const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); } }
  else if (name === 'ring') { x.strokeStyle = 'white'; x.lineWidth = 3; x.beginPath(); x.arc(32, 32, 29, 0, TAU); x.stroke(); x.globalAlpha = .35; x.lineWidth = 1; x.beginPath(); x.arc(32, 32, 24, 0, TAU); x.stroke(); }
  else if (name === 'rune') { x.strokeStyle = 'white'; x.lineWidth = 1.5; x.beginPath(); x.arc(32, 32, 29, 0, TAU); x.stroke(); x.beginPath(); x.arc(32, 32, 22, 0, TAU); x.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.save(); x.translate(32 + Math.cos(a) * 25.5, 32 + Math.sin(a) * 25.5); x.rotate(a); x.fillStyle = 'white'; x.fillRect(-1.5, -2, 3, 4); x.restore(); } x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; x.lineTo(32 + Math.cos(a) * 20, 32 + Math.sin(a) * 20); } x.closePath(); x.stroke(); }
  else if (name === 'scrawl') { x.strokeStyle = 'white'; x.lineWidth = 2.2; x.lineCap = 'round'; for (let i = 0; i < 7; i++) { x.beginPath(); const sx = 10 + i * 7, sy = 26 + rnd(-6, 6); x.moveTo(sx, sy); x.quadraticCurveTo(sx + rnd(-4, 6), sy + rnd(-10, 10), sx + rnd(2, 6), sy + rnd(-8, 12)); x.stroke(); } }
  else if (name === 'spark') { const g = x.createLinearGradient(0, 32, 64, 32); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 28, 64, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; SPR[name] = t; return t;
}
