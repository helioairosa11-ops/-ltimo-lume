// ===================== SALAS: leitura do mapa ASCII, colisão, desenho em blocos =====================
// Caracteres: ' ' vazio (parede de fundo se a sala tiver), '.' vazio com céu, ',' vazio com parede de fundo,
// '#' rocha, '%' segundo material, '&' terceiro material, '=' plataforma (atravessável por baixo), '^' espinhos,
// '~' água, '!' água envenenada, 'L' lava, 'X' parede ilusória (parte-se com golpes), 'F' chão frágil (parte-se com o Salto),
// 'D' véu negro (só se atravessa com o Passo Sombrio). Letras minúsculas e dígitos: marcas de entidades (definidas em marks).
const ROOMS = {};
const ROOM = { cur: null, theme: THEMES.crypt, chunks: new Map(), CH: 8, props: [] };
const TC = { ' ': 0, '.': 0, ',': 0, '#': 1, '%': 2, '&': 3, '=': 4, '^': 5, '~': 6, '!': 7, 'L': 8, 'X': 9, 'F': 10, 'D': 11 };
const SOLID = [0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1];
// plataformas móveis (elevadores): { x0, x1, y, dy }
const PLATS = [];
function parseRoom(id) {
  const d = ROOMS[id]; if (!d) throw new Error('sala inexistente: ' + id);
  const rows = d.map.map(r => r.replace(/\t/g, '    ')); const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const g = new Uint8Array(w * h), back = new Uint8Array(w * h), marks = [];
  const defBack = d.back !== false;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x] ?? '#'; const i = y * w + x;
    if (ch in TC) { g[i] = TC[ch]; back[i] = ch === '.' ? 0 : ch === ',' ? 1 : defBack ? 1 : 0; }
    else { const lq = x > 0 && g[i - 1] >= 6 && g[i - 1] <= 8 ? g[i - 1] : 0; g[i] = lq; back[i] = x > 0 ? back[i - 1] : defBack ? 1 : 0; marks.push({ ch, x, y }); }
  }
  const R = { id, def: d, w, h, g, back, marks, area: d.area, theme: THEMES[d.theme || d.area] || THEMES.crypt, liquids: [], openings: { L: [], R: [], T: [], B: [] }, dist: null, broken: {} };
  // aberturas nas bordas (para ligar às salas vizinhas)
  const runs = (len, f) => { const out = []; let s = -1; for (let i = 0; i <= len; i++) { const open = i < len && f(i); if (open && s < 0) s = i; if (!open && s >= 0) { out.push([s, i - 1]); s = -1; } } return out; };
  const nonSolid = (x, y) => !SOLID[g[y * w + x]];
  R.openings.L = runs(h, y => nonSolid(0, y)); R.openings.R = runs(h, y => nonSolid(w - 1, y));
  R.openings.T = runs(w, x => nonSolid(x, 0)); R.openings.B = runs(w, x => nonSolid(x, h - 1));
  // líquidos (retângulos por linha juntados)
  for (let y = 0; y < h; y++) { let s = -1, k = 0; for (let x = 0; x <= w; x++) { const c = x < w ? g[y * w + x] : 0; const liq = c >= 6 && c <= 8 ? c : 0; if (liq && s < 0) { s = x; k = liq; } else if (s >= 0 && liq !== k) { R.liquids.push({ x0: s, x1: x - 1, y, kind: k, top: y === 0 || g[(y - 1) * w + s] !== k }); s = liq ? x : -1; k = liq; } } }
  // distância até à superfície (para o desenho da rocha)
  const dist = new Uint8Array(w * h).fill(9); const q = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!isRock(g[i])) { dist[i] = 0; q.push(i); } }
  while (q.length) { const i = q.shift(); const x = i % w, y = (i / w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (dist[j] > dist[i] + 1) { dist[j] = dist[i] + 1; q.push(j); } } }
  R.dist = dist;
  return R;
}
function isRock(c) { return c === 1 || c === 2 || c === 3 || c === 9 || c === 10; }
function cellAt(tx, ty) {
  const R = ROOM.cur; if (!R) return 1;
  if (tx < 0 || ty < 0 || tx >= R.w || ty >= R.h) {
    // fora da sala: aberto só onde há saída
    const ex = R.def.exits || {};
    if (tx < 0 && ex.L && R.openings.L.some(([a, b]) => ty >= a && ty <= b)) return 0;
    if (tx >= R.w && ex.R && R.openings.R.some(([a, b]) => ty >= a && ty <= b)) return 0;
    if (ty < 0 && (ex.T || R.def.openTop)) return tx >= 0 && tx < R.w && !SOLID[R.g[tx]] ? 0 : 1;
    if (ty >= R.h) return tx >= 0 && tx < R.w && !SOLID[R.g[(R.h - 1) * R.w + tx]] ? 0 : 1;
    return 1;
  }
  return R.g[ty * R.w + tx];
}
function solidAt(x, y) { return SOLID[cellAt(Math.floor(x / T), Math.floor(y / T))] === 1; }
function solidFor(c, a) { if (c === 11) return !(a && a.veilPass); return SOLID[c] === 1; }
// ---------- movimento com colisão (actor: x = centro, y = pés, w, h) ----------
function moveActor(a, dt) {
  const hw = a.w / 2; a.hitWall = 0; a.hitCeil = false; const wasGround = a.onGround; a.onGround = false; a.plat = null;
  // horizontal
  let dx = a.vx * dt; const steps = Math.ceil(Math.abs(dx) / 12) || 1; dx /= steps;
  for (let s = 0; s < steps; s++) {
    let nx = a.x + dx; const top = Math.floor((a.y - a.h + 2) / T), bot = Math.floor((a.y - 2) / T);
    if (dx > 0) { const tx = Math.floor((nx + hw) / T); for (let ty = top; ty <= bot; ty++) if (solidFor(cellAt(tx, ty), a)) { nx = tx * T - hw - .01; a.hitWall = 1; a.vx = 0; break; } }
    else if (dx < 0) { const tx = Math.floor((nx - hw) / T); for (let ty = top; ty <= bot; ty++) if (solidFor(cellAt(tx, ty), a)) { nx = (tx + 1) * T + hw + .01; a.hitWall = -1; a.vx = 0; break; } }
    a.x = nx; if (a.hitWall) break;
  }
  // vertical
  let dy = a.vy * dt; const sy = Math.ceil(Math.abs(dy) / 12) || 1; dy /= sy;
  for (let s = 0; s < sy; s++) {
    let ny = a.y + dy; const l = Math.floor((a.x - hw + 1) / T), r = Math.floor((a.x + hw - 1) / T);
    if (dy > 0) {
      const ty = Math.floor(ny / T);
      for (let tx = l; tx <= r; tx++) { const c = cellAt(tx, ty); if (solidFor(c, a) || (c === 4 && !a.dropT && a.y <= ty * T + .5)) { ny = ty * T; a.onGround = true; a.vy = 0; break; } }
    } else if (dy < 0) {
      const ty = Math.floor((ny - a.h) / T);
      for (let tx = l; tx <= r; tx++) if (solidFor(cellAt(tx, ty), a)) { ny = (ty + 1) * T + a.h + .01; a.hitCeil = true; a.vy = 0; break; }
    }
    if (dy > 0 && !a.onGround) for (const P of PLATS) if (a.x > P.x0 - hw * .5 && a.x < P.x1 + hw * .5 && a.y <= P.y + 1 && ny >= P.y) { ny = P.y; a.onGround = true; a.vy = 0; a.plat = P; }
    a.y = ny; if (a.onGround || a.hitCeil) break;
  }
  // continua no chão se estiver encostado
  if (!a.onGround && a.vy >= 0) for (const P of PLATS) if (a.x > P.x0 - hw * .5 && a.x < P.x1 + hw * .5 && Math.abs(a.y - P.y) < 2) { a.onGround = true; a.plat = P; }
  if (!a.onGround && a.vy >= 0) { const ty = Math.floor((a.y + 1) / T); const l = Math.floor((a.x - hw + 1) / T), r = Math.floor((a.x + hw - 1) / T); for (let tx = l; tx <= r; tx++) { const c = cellAt(tx, ty); if (solidFor(c, a) || (c === 4 && !a.dropT && Math.abs(a.y - ty * T) < 1.5)) { a.onGround = true; break; } } }
  if (a.onGround && !wasGround && a.onLand) a.onLand();
}
// sobreposição com células de um tipo (espinhos, líquidos)
function overlapCell(a, codes, shrink = 3) {
  const x0 = Math.floor((a.x - a.w / 2 + shrink) / T), x1 = Math.floor((a.x + a.w / 2 - shrink) / T), y0 = Math.floor((a.y - a.h + shrink) / T), y1 = Math.floor((a.y - 1) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) { const c = cellAt(tx, ty); if (codes.includes(c)) { if (c === 5 && a.y - 1 < ty * T + T * .45) continue; return { c, tx, ty }; } }
  return null;
}
function liquidAt(x, y) { const c = cellAt(Math.floor(x / T), Math.floor(y / T)); return c >= 6 && c <= 8 ? c : 0; }
// linha de visão (para inimigos e projéteis)
function losClear(x0, y0, x1, y1) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 12); for (let i = 1; i < n; i++) { const t = i / n; if (solidAt(lerp(x0, x1, t), lerp(y0, y1, t))) return false; } return true; }
// altera uma célula (paredes partidas, chão frágil) e redesenha o bloco
function setCell(tx, ty, code) { const R = ROOM.cur; if (!R || tx < 0 || ty < 0 || tx >= R.w || ty >= R.h) return; R.g[ty * R.w + tx] = code; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) ROOM.chunks.delete(Math.floor((tx + dx) / ROOM.CH) + ',' + Math.floor((ty + dy) / ROOM.CH)); }
// ---------- desenho dos blocos (cache por pedaços de 8x8 células, à escala do ecrã) ----------
function chunkCanvas(cx, cy) {
  const key = cx + ',' + cy; let c = ROOM.chunks.get(key); if (c && c._s === G.s) return c;
  const CH = ROOM.CH, px = Math.ceil(CH * T * G.s); c = c && c.width === px ? c : document.createElement('canvas'); c.width = c.height = px; c._s = G.s;
  const x = c.getContext('2d'); x.setTransform(G.s, 0, 0, G.s, 0, 0); x.clearRect(0, 0, CH * T, CH * T); x.translate(-cx * CH * T, -cy * CH * T);
  bakeArea(x, cx * CH, cy * CH, CH, CH); G.baked = (G.baked || 0) + 1;
  ROOM.chunks.set(key, c); if (ROOM.chunks.size > 70) { const k0 = ROOM.chunks.keys().next().value; ROOM.chunks.delete(k0); }
  return c;
}
function drawRoomTiles() {
  const R = ROOM.cur; if (!R) return; const c = G.ctx; c.setTransform(1, 0, 0, 1, 0, 0);
  const CHW = ROOM.CH * T, v = viewRect(4), s = G.s * CAM.zoom, ox = G.W / 2 - (CAM.x + CAM.sx) * s, oy = G.H / 2 - (CAM.y + CAM.sy) * s;
  const cx0 = Math.max(0, Math.floor(v.x0 / CHW)), cx1 = Math.min(Math.ceil(R.w / ROOM.CH) - 1, Math.floor(v.x1 / CHW)), cy0 = Math.max(0, Math.floor(v.y0 / CHW)), cy1 = Math.min(Math.ceil(R.h / ROOM.CH) - 1, Math.floor(v.y1 / CHW));
  let baked = 0;
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const key = cx + ',' + cy; let ch = ROOM.chunks.get(key);
    if (!ch || ch._s !== G.s) { if (baked > 3 && ch) { } else { ch = chunkCanvas(cx, cy); baked++; } }
    if (!ch) continue;
    const X0 = Math.round(ox + cx * CHW * s), Y0 = Math.round(oy + cy * CHW * s), X1 = Math.round(ox + (cx + 1) * CHW * s), Y1 = Math.round(oy + (cy + 1) * CHW * s);
    c.drawImage(ch, X0, Y0, X1 - X0, Y1 - Y0);
  }
}
// pré-desenha os pedaços à volta da câmara (evita engasgos)
function prebakeAround(n = 2) { const R = ROOM.cur; if (!R) return; const CHW = ROOM.CH * T, v = viewRect(CHW); let k = 0; for (let cy = Math.max(0, Math.floor(v.y0 / CHW)); cy <= Math.min(Math.ceil(R.h / ROOM.CH) - 1, Math.floor(v.y1 / CHW)); cy++) for (let cx = Math.max(0, Math.floor(v.x0 / CHW)); cx <= Math.min(Math.ceil(R.w / ROOM.CH) - 1, Math.floor(v.x1 / CHW)); cx++) { const ch = ROOM.chunks.get(cx + ',' + cy); if (!ch || ch._s !== G.s) { chunkCanvas(cx, cy); if (++k >= n) return; } } }
// arte procedural das células
function bakeArea(x, tx0, ty0, nw, nh) {
  const R = ROOM.cur, th = R.theme, w = R.w;
  const kind = th.bgKind;
  for (let ty = ty0; ty < ty0 + nh; ty++) for (let tx = tx0; tx < tx0 + nw; tx++) {
    if (tx >= R.w || ty >= R.h) continue; const i = ty * w + tx, c = R.g[i], X = tx * T, Y = ty * T, hsh = hash2(tx * 7 + 3, ty * 13 + 1);
    if (!isRock(c) && R.back[i]) drawBack(x, tx, ty, X, Y, th, kind, hsh);
  }
  for (let ty = ty0 - 1; ty < ty0 + nh + 1; ty++) for (let tx = tx0 - 1; tx < tx0 + nw + 1; tx++) {
    if (tx < 0 || ty < 0 || tx >= R.w || ty >= R.h) continue; const i = ty * w + tx, c = R.g[i], X = tx * T, Y = ty * T, hsh = hash2(tx * 7 + 3, ty * 13 + 1);
    if (isRock(c)) drawRock(x, R, tx, ty, X, Y, c, th, hsh);
    else if (c === 4) drawPlatform(x, X, Y, th, kind, cellAt(tx - 1, ty) !== 4, cellAt(tx + 1, ty) !== 4);
    else if (c === 5) drawSpikes(x, X, Y, th, hsh);
  }
  // adereços estáticos
  for (const p of ROOM.props) if (p.x + p.w > tx0 * T && p.x < (tx0 + nw) * T && p.y + p.h > ty0 * T && p.y < (ty0 + nh) * T) { x.save(); p.bake(x); x.restore(); }
}
function drawBack(x, tx, ty, X, Y, th, kind, h) {
  x.fillStyle = css(th.back); x.fillRect(X, Y, T, T);
  x.strokeStyle = css(th.backL); x.lineWidth = 1.5;
  if (kind === 'swamp' || kind === 'forest') {
    x.globalAlpha = .7; x.beginPath(); for (let k = 0; k < 3; k++) { const xx = X + hash2(tx + k * 5, ty * 3) * T; x.moveTo(xx, Y); x.quadraticCurveTo(xx + (hash2(tx, ty + k) - .5) * 14, Y + T / 2, xx + (hash2(tx + 1, ty + k) - .5) * 8, Y + T); } x.stroke(); x.globalAlpha = 1;
    if (h < .1) { x.fillStyle = css(shade(th.back, .12)); x.beginPath(); x.ellipse(X + T / 2, Y + T / 2, 6, 4, h * 30, 0, TAU); x.fill(); }
  } else if (kind === 'forge') {
    x.strokeRect(X + .5, Y + .5, T - 1, T - 1); if (h < .18) { x.strokeStyle = 'rgba(255,110,40,.35)'; x.beginPath(); x.moveTo(X + h * 100, Y); x.lineTo(X + 10 + h * 40, Y + T * .6); x.lineTo(X + 4, Y + T); x.stroke(); }
  } else if (kind === 'heart') {
    if (h < .25) { x.strokeStyle = 'rgba(255,210,140,.25)'; x.beginPath(); x.moveTo(X, Y + h * 120); x.lineTo(X + T, Y + T - h * 60); x.stroke(); }
    x.strokeRect(X + .5, Y + .5, T - 1, T - 1);
  } else {
    // tijolos grandes
    const off = (ty % 2) * T / 2; x.beginPath(); x.moveTo(X, Y + .5); x.lineTo(X + T, Y + .5); x.moveTo(X, Y + T / 2); x.lineTo(X + T, Y + T / 2);
    const bx = X + ((off + 0) % T); x.moveTo(bx + .5, Y); x.lineTo(bx + .5, Y + T / 2); x.moveTo(X + ((off + T / 2) % T) + .5, Y + T / 2); x.lineTo(X + ((off + T / 2) % T) + .5, Y + T); x.stroke();
    if (h < .12) { x.fillStyle = css(shade(th.back, -.25)); x.fillRect(X + 2, Y + (h < .06 ? 2 : T / 2 + 2), T / 2 - 4, T / 2 - 4); }
    if (h > .97 && kind === 'cathedral') { x.fillStyle = css(shade(th.back, .1)); x.fillRect(X + 4, Y + 4, T - 8, T - 8); }
  }
}
function drawRock(x, R, tx, ty, X, Y, c, th, h) {
  const d = R.dist[ty * R.w + tx];
  const open = (dx, dy) => { const n = cellAt(tx + dx, ty + dy); return !isRock(n) && !(tx + dx < 0 || ty + dy < 0 || tx + dx >= R.w || ty + dy >= R.h); };
  const up = open(0, -1), dn = open(0, 1), lf = open(-1, 0), rt = open(1, 0);
  const base = c === 2 ? shade(th.mid, -.1) : c === 3 ? shade(th.mid, .12) : th.mid;
  x.fillStyle = css(th.fill); x.fillRect(X - .5, Y - .5, T + 1, T + 1);
  if (d <= 2) {
    // pedras junto à superfície
    x.fillStyle = css(d === 1 ? base : mixHex(base, th.fill, .55));
    if (th.bgKind === 'swamp' || th.bgKind === 'forest') { x.beginPath(); x.ellipse(X + T * .5, Y + T * .5, T * .52, T * .46, h * 3, 0, TAU); x.fill(); if (h < .5) { x.fillStyle = css(shade(base, .08)); x.beginPath(); x.ellipse(X + T * (.3 + h * .3), Y + T * .35, T * .2, T * .14, 0, 0, TAU); x.fill(); } }
    else { const off = (ty % 2) * 10; x.fillRect(X + 1, Y + 1, T / 2 - 2 + (off ? 6 : 0), T / 2 - 2); x.fillRect(X + T / 2 + 1 + (off ? 6 : 0), Y + 1, T / 2 - 2 - (off ? 6 : 0), T / 2 - 2); x.fillRect(X + 1, Y + T / 2 + 1, T - 2 - (h > .5 ? 12 : 0), T / 2 - 2); if (h > .5) x.fillRect(X + T - 11, Y + T / 2 + 1, 10, T / 2 - 2); }
    if (c === 9 || c === 10) { x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(X + 6, Y + 4); x.lineTo(X + 14, Y + 16); x.lineTo(X + 10, Y + 26); x.moveTo(X + 14, Y + 16); x.lineTo(X + 25, Y + 20); x.stroke(); }
  } else if (h < .06) { x.fillStyle = css(mixHex(th.mid, th.fill, .75)); x.fillRect(X + h * 300 % 24, Y + h * 500 % 24, 4, 3); }
  // bordas
  const rim = css(th.rim), top = css(th.top);
  if (lf) { x.fillStyle = rim; x.beginPath(); x.moveTo(X, Y); for (let k = 0; k <= 4; k++) x.lineTo(X + 2 + hash2(tx * 3 + k, ty) * 3, Y + k * T / 4); x.lineTo(X, Y + T); x.fill(); }
  if (rt) { x.fillStyle = rim; x.beginPath(); x.moveTo(X + T, Y); for (let k = 0; k <= 4; k++) x.lineTo(X + T - 2 - hash2(tx * 5 + k, ty) * 3, Y + k * T / 4); x.lineTo(X + T, Y + T); x.fill(); }
  if (dn) {
    x.fillStyle = rim; x.fillRect(X, Y + T - 3, T, 3);
    if (h < .35) { x.beginPath(); const sx = X + 6 + h * 50; x.moveTo(sx - 4, Y + T); x.lineTo(sx, Y + T + 5 + h * 22); x.lineTo(sx + 4, Y + T); x.fill(); }
  }
  if (up) {
    x.fillStyle = top; x.beginPath(); x.moveTo(X - .5, Y + 6); for (let k = 0; k <= 4; k++) x.lineTo(X + k * T / 4, Y + 1 - hash2(tx * 11 + k, ty) * 2.2); x.lineTo(X + T + .5, Y + 6); x.closePath(); x.fill();
    x.fillStyle = css(shade(th.top, .25)); x.fillRect(X, Y, T, 1.2);
    if (th.moss && h > .35) {
      x.strokeStyle = css(th.moss); x.lineWidth = 1.2; x.beginPath(); const n = 2 + ((h * 10) | 0) % 4;
      for (let k = 0; k < n; k++) { const gx = X + hash2(tx + k, ty * 7) * T, gh = 3 + hash2(tx * 3, ty + k) * (th.bgKind === 'swamp' || th.bgKind === 'hub' ? 9 : 5); x.moveTo(gx, Y + 1); x.quadraticCurveTo(gx + 1.5, Y - gh * .5, gx + (hash2(k, tx) - .5) * 4, Y - gh); }
      x.stroke();
    }
    if (th.bgKind === 'forge' && h < .3) { x.fillStyle = 'rgba(255,120,40,.6)'; x.fillRect(X + h * 90, Y + 2, 6, 1.5); }
    if (c === 10) { x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(X + 4, Y + 1); x.lineTo(X + 12, Y + 8); x.lineTo(X + 20, Y + 3); x.lineTo(X + 28, Y + 9); x.stroke(); }
  }
}
function drawPlatform(x, X, Y, th, kind, capL, capR) {
  const stone = kind === 'crypt' || kind === 'cathedral' || kind === 'walls' || kind === 'heart';
  x.fillStyle = css(stone ? th.rim : 0x4a3626); x.fillRect(X, Y, T, 7);
  x.fillStyle = css(stone ? th.top : 0x7a5a3a); x.fillRect(X, Y, T, 2);
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(X, Y + 5, T, 2);
  if (!stone) { x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(X + T / 2 - .5, Y, 1, 7); }
  if (capL) { x.fillStyle = css(stone ? th.rim : 0x3a2a1c); x.beginPath(); x.moveTo(X + 2, Y + 7); x.lineTo(X + 8, Y + 7); x.lineTo(X + 2, Y + 16); x.fill(); }
  if (capR) { x.fillStyle = css(stone ? th.rim : 0x3a2a1c); x.beginPath(); x.moveTo(X + T - 2, Y + 7); x.lineTo(X + T - 8, Y + 7); x.lineTo(X + T - 2, Y + 16); x.fill(); }
}
function drawSpikes(x, X, Y, th, h) {
  const n = 4; for (let k = 0; k < n; k++) { const sx = X + k * T / n, hh = T * (.45 + hash2(k, X) * .2); x.fillStyle = css(0xb8b0a0); x.beginPath(); x.moveTo(sx + 1, Y + T); x.lineTo(sx + T / n / 2, Y + T - hh); x.lineTo(sx + T / n - 1, Y + T); x.fill(); x.fillStyle = 'rgba(0,0,0,.4)'; x.beginPath(); x.moveTo(sx + T / n / 2, Y + T - hh); x.lineTo(sx + T / n - 1, Y + T); x.lineTo(sx + T / n / 2, Y + T); x.fill(); }
  x.fillStyle = css(th.rim); x.fillRect(X, Y + T - 3, T, 3);
}
// líquidos e véus (animados, desenhados a cada frame)
function drawLiquidGlow() {
  const R = ROOM.cur; if (!R || !R.liquids.length) return; const c = G.ctx; camTransform(c); const v = viewRect(T), t = G.t; c.save(); c.globalCompositeOperation = 'lighter';
  for (const L of R.liquids) { if (L.kind !== 8) continue; const X0 = L.x0 * T, X1 = (L.x1 + 1) * T, Y = L.y * T; if (X1 < v.x0 || X0 > v.x1 || Y > v.y1 || Y + T < v.y0) continue;
    const g = c.createLinearGradient(0, Y + (L.top ? 4 : 0), 0, Y + T); g.addColorStop(0, L.top ? 'rgba(255,170,60,.55)' : 'rgba(200,60,10,.25)'); g.addColorStop(1, 'rgba(160,30,0,.05)'); c.fillStyle = g; c.fillRect(X0, Y + (L.top ? 4 : 0), X1 - X0, T);
    if (L.top) { const h = 26 + Math.sin(t * 1.7 + X0) * 4, g2 = c.createLinearGradient(0, Y + 6, 0, Y + 6 - h); g2.addColorStop(0, 'rgba(255,120,30,.35)'); g2.addColorStop(1, 'rgba(255,80,10,0)'); c.fillStyle = g2; c.fillRect(X0, Y + 6 - h, X1 - X0, h); } }
  c.restore();
}
function drawLiquids(layer) {
  const R = ROOM.cur; if (!R) return; const c = G.ctx; camTransform(c); const t = G.t; const v = viewRect(T);
  for (const L of R.liquids) {
    const X0 = L.x0 * T, X1 = (L.x1 + 1) * T, Y = L.y * T; if (X1 < v.x0 || X0 > v.x1 || Y > v.y1 || Y + T < v.y0) continue;
    const col = L.kind === 6 ? [0x1a3a48, .62] : L.kind === 7 ? [0x3a6a1a, .7] : [0xff5a10, .95];
    if (layer === 'back') continue;
    if (L.kind === 8) { // lava: gradiente quente, crosta escura a deslizar
      const top = L.top ? Y + 5 : Y, g = c.createLinearGradient(0, top, 0, Y + T); if (L.top) { g.addColorStop(0, '#ffd870'); g.addColorStop(.25, '#ff7a18'); g.addColorStop(1, '#a8260a'); } else { g.addColorStop(0, '#b0300c'); g.addColorStop(1, '#5a1206'); }
      c.fillStyle = g; c.fillRect(X0, top, X1 - X0, Y + T - top + .5);
      c.fillStyle = 'rgba(60,12,4,.55)'; for (let k = 0; k < (X1 - X0) / 22; k++) { const px = X0 + ((k * 37 + t * (8 + (k % 3) * 4)) % (X1 - X0)), py = top + 6 + ((k * 13) % Math.max(4, T - 10)); c.beginPath(); c.ellipse(px, py, 6 + (k % 4) * 2, 2 + (k % 2), 0, 0, TAU); c.fill(); }
      if (L.top) { c.beginPath(); c.moveTo(X0, Y + T); for (let xx = X0; xx <= X1; xx += 4) c.lineTo(xx, Y + 6 + Math.sin(xx * .15 + t * 2.2) * 1.6 + Math.sin(xx * .05 - t * 1.3) * 1.2); c.lineTo(X1, Y + 9); c.lineTo(X0, Y + 9); c.closePath(); c.fillStyle = '#ffb040'; c.fill(); }
    } else if (L.kind === 7) { // veneno: lodo verde escuro com bolhas
      const top = L.top ? Y + 5 : Y, g = c.createLinearGradient(0, top, 0, Y + T); if (L.top) { g.addColorStop(0, 'rgba(110,170,40,.92)'); g.addColorStop(.35, 'rgba(46,90,22,.94)'); g.addColorStop(1, 'rgba(18,40,10,.96)'); } else { g.addColorStop(0, 'rgba(18,40,10,.96)'); g.addColorStop(1, 'rgba(10,24,6,.97)'); }
      c.fillStyle = g; c.fillRect(X0, top, X1 - X0, Y + T - top + .5);
      c.fillStyle = 'rgba(170,230,90,.5)'; for (let k = 0; k < (X1 - X0) / 26; k++) { const ph = (t * .6 + k * .37) % 1, bx = X0 + ((k * 53) % (X1 - X0)) + Math.sin(t * 2 + k) * 2, by = Y + T - ph * (T - 6); c.beginPath(); c.arc(bx, by, 1.2 + (k % 3) * .6, 0, TAU); c.fill(); }
      if (L.top) { c.fillStyle = 'rgba(110,170,40,.92)'; c.beginPath(); c.moveTo(X0, Y + 9); for (let xx = X0; xx <= X1; xx += 4) c.lineTo(xx, Y + 6 + Math.sin(xx * .15 + t * 1.6) * 1.2 + Math.sin(xx * .05 - t) * 1); c.lineTo(X1, Y + 9); c.closePath(); c.fill(); }
    } else { c.fillStyle = rgba(col[0], col[1]); c.fillRect(X0, Y + (L.top ? 6 : 0), X1 - X0, T - (L.top ? 6 : 0) + .5); }
    if (L.top) {
      if (L.kind === 6) { c.beginPath(); c.moveTo(X0, Y + T); for (let xx = X0; xx <= X1; xx += 4) c.lineTo(xx, Y + 6 + Math.sin(xx * .15 + t * 2.2) * 1.6 + Math.sin(xx * .05 - t * 1.3) * 1.2); c.lineTo(X1, Y + T); c.closePath(); c.fill(); }
      c.strokeStyle = L.kind === 8 ? 'rgba(255,220,120,.9)' : L.kind === 7 ? 'rgba(180,240,90,.55)' : 'rgba(170,220,255,.4)'; c.lineWidth = 1.2; c.beginPath();
      for (let xx = X0; xx <= X1; xx += 4) { const yy = Y + 6 + Math.sin(xx * .15 + t * 2.2) * 1.6 + Math.sin(xx * .05 - t * 1.3) * 1.2; xx === X0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } c.stroke();
      if (L.kind === 8) { light((X0 + X1) / 2, Y + 10, Math.max(90, (X1 - X0) * .7), 0xff6a1a, 1.2, .15); if (Math.random() < (X1 - X0) / 900) burst(rnd(X0, X1), Y + 6, 1, { color: [0xffa040, 0xff6a20], dir: -HPI, spread: .5, smin: 30, smax: 90, lmin: .4, lmax: 1, grav: 200 }); }
      if (L.kind === 7) { light((X0 + X1) / 2, Y + 8, Math.max(60, (X1 - X0) * .5), 0x9ad04a, .45, .05); if (Math.random() < (X1 - X0) / 2500) burst(rnd(X0, X1), Y + 8, 1, { color: 0xb0f070, dir: -HPI, spread: .3, smin: 10, smax: 30, lmin: .6, lmax: 1.2 }); }
    }
  }
  // véus negros
  for (let ty = Math.max(0, Math.floor(v.y0 / T)); ty <= Math.min(R.h - 1, Math.floor(v.y1 / T)); ty++) for (let tx = Math.max(0, Math.floor(v.x0 / T)); tx <= Math.min(R.w - 1, Math.floor(v.x1 / T)); tx++) {
    if (R.g[ty * R.w + tx] !== 11) continue; const X = tx * T, Y = ty * T;
    c.fillStyle = 'rgba(8,4,14,.88)'; c.fillRect(X, Y, T, T);
    c.globalAlpha = .5; c.fillStyle = '#5a3a8a'; for (let k = 0; k < 3; k++) { const yy = Y + ((t * 20 + k * 11 + tx * 7) % T); c.fillRect(X + hash2(tx, k) * T * .7, yy, 2, 6); } c.globalAlpha = 1;
  }
}
