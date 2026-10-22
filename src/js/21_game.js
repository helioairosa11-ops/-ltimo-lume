// ===================== JOGO: ciclo principal, salas, morte, fogueiras, gravação =====================
const SAVE_KEY = 'ultimo-lume-2d-save-v1';
const GAME = { mode: 'boot', prevMode: 'title', boss: null, bonfires: {}, interact: null, killed: {}, god: false, cine: false, fps: 60, fpsAcc: 0, fpsN: 0, quietT: 0, trans: null, transition: false, introI: 0, introT: 0 };
GAME.setMode = (m) => { GAME.mode = m; inClear(); };
const BONFIRE_LIST = {};
// ---------- ciclo ----------
let _last = 0;
function frame(now) {
  requestAnimationFrame(frame); if (window.__FREEZE) return;
  let dtR = (now - _last) / 1000; _last = now; if (!(dtR > 0)) dtR = 1 / 60; dtR = Math.min(dtR, .05);
  TIME.real += dtR; TIME.dtReal = dtR; G.t += dtR; LIGHTS.length = 0;
  GAME.fpsAcc += dtR; GAME.fpsN++; if (GAME.fpsAcc >= 1) { GAME.fps = GAME.fpsN / GAME.fpsAcc; GAME.fpsAcc = 0; GAME.fpsN = 0; autoQuality(); }
  pollPad();
  if (GAME.mode === 'play') {
    if (inConsume('pause')) { openPause(UI.lastTab || 'inv'); } else if (inConsume('inv')) { openPause('inv'); }
    let dt = dtR; if (TIME.slowT > 0) { TIME.slowT -= dtR; dt *= TIME.slowScale; } if (TIME.hitstop > 0) { TIME.hitstop -= dtR; dt *= .04; }
    TIME.now += dt; const _t0 = performance.now(); step(dt); if (window.__PERF) GAME._st = performance.now() - _t0;
  } else if (GAME.mode === 'dialog') { dlgUpdate(dtR); idle(dtR); }
  else if (GAME.mode === 'menu') { menuNav(); idle(dtR); }
  else if (GAME.mode === 'title' || GAME.mode === 'ending') { titleNav(); idle(dtR); }
  else if (GAME.mode === 'intro') { GAME.introT += dtR; if (GAME.introT > 6.5) GAME.introNext(); if (inConsume('ok') || inConsume('attack') || inConsume('jump')) GAME.introNext(); if (inConsume('back')) GAME.endIntro(); }
  UI.update(dtR); musicTick();
  const _t1 = performance.now(); if (ROOM.cur && GAME.mode !== 'intro' && GAME.mode !== 'loading') render(dtR);
  if (window.__PERF) { window.__PERF.push([Math.round(now), +(GAME._st || 0).toFixed(1), +(performance.now() - _t1).toFixed(1), G.baked || 0]); G.baked = 0; GAME._st = 0; }
}
// se o aparelho não aguentar, baixa a qualidade sozinho (só uma vez por nível, e nunca depois de o jogador escolher)
function autoQuality() {
  if (GAME.mode !== 'play' || GAME.cine || GAME.wake || GAME.transition) { GAME.slowS = 0; return; }
  GAME.slowS = GAME.fps < 40 ? (GAME.slowS || 0) + 1 : 0;
  if (GAME.slowS >= 4 && SET.quality !== 'baixa' && !SET.qLocked) {
    SET.quality = SET.quality === 'alta' ? 'media' : 'baixa'; saveSettings(); resizeGfx(); ROOM.chunks.clear(); if (BG.kind) bgMake(BG.kind); GAME.slowS = 0;
    UI.toast('Baixei a qualidade gráfica para o jogo correr mais fluido. Podes mudar em Definições.', 4);
  }
}
function idle(dt) { if (!ROOM.cur) return; updParts(dt); updFx(dt); for (const e of ENTS) if (!(e instanceof Elevator)) e.update(0); if (PLAYER && GAME.mode !== 'title') { light(PLAYER.x, PLAYER.y - 26, 150, 0xffe2b8, .55); } updCamera(dt, true); }
function step(dt) {
  updTimers(dt); if (GAME.wake) wakeUpdate(dt);
  const p = PLAYER; if (!p) return;
  p.update(dt);
  for (const e of ENEMIES.slice()) { if (Math.abs(e.x - p.x) < 900 || e.aggro || e.boss) e.update(dt); }
  for (const e of ENTS) e.update(dt);
  updHits(dt); updProj(dt); updAoes(dt); updParts(dt); updFx(dt); ambientParticles(dt);
  GAME.interact = GAME.cine || GAME.transition ? null : nearestInteract();
  updCamera(dt);
  if (!GAME.transition) checkExits(p);
  if (p.alive && !GAME.cine) PROG.time += dt;
  if (GAME.zones) for (const z of GAME.zones) if (!z.done && p.alive && p.x > z.x0 && p.x < z.x1 && p.y > z.y0 && p.y < z.y1) { z.done = !z.repeat; z.fn(); }
  updAudio(dt);
  if (!PLAYER || !ROOM.cur) return; prebakeAround(1);
}
// ---------- desenho ----------
function render(dt) {
  const c = G.ctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  drawBG();
  drawRoomTiles();
  camTransform(c); for (const e of ENTS) if (e.layer === 'back') e.draw(c);
  drawFx('normal');
  drawParts(PARTS, false);
  camTransform(c); for (const e of ENEMIES) if (onScreen(e.x, e.cy, 160)) e.draw(c);
  if (PLAYER && ROOM.cur.id !== 'title') PLAYER.draw(c);
  camTransform(c); for (const e of ENTS) if (e.layer === 'front') e.draw(c);
  drawLiquids('front');
  renderLighting(GAME.eclipse ? mixHex(ROOM.amb, 0x000000, .55) : ROOM.amb);
  renderGlows(); drawLiquidGlow();
  drawAoes(); drawProj(); drawFx('add'); drawParts(GPARTS, true);
  drawDmgNums(dt);
  drawOverlay();
  if (GAME.wake) drawWakeOverlay();
}
// ---------- câmara ----------
function updCamera(dt, idleOnly) {
  const p = PLAYER, R = ROOM.cur; if (!R) return;
  if (CAM.override) { const o = CAM.override; CAM.x = damp(CAM.x, o.x, o.k || 4, dt); CAM.y = damp(CAM.y, o.y, o.k || 4, dt); CAM.zoom = damp(CAM.zoom, o.zoom || 1, 3, dt); }
  else if (p) {
    CAM.zoom = damp(CAM.zoom, 1, 3, dt);
    const look = p.face * (Math.abs(p.vx) > 40 ? 70 : 40); CAM.look = damp(CAM.look, look, 2.5, dt);
    let ly = 0; if (!idleOnly && p.onGround && Math.abs(p.vx) < 10 && p.state === 'idle') { const ay = axisY(); p.lookT = ay ? (p.lookT || 0) + dt : 0; if (p.lookT > .45) ly = ay * 110; }
    let tx = p.x + CAM.look, ty = p.y - 52 + ly + (p.vy > 300 ? Math.min(90, (p.vy - 300) * .25) : 0);
    if (GAME.boss && GAME.boss.alive && GAME.boss.arena) { const A = GAME.boss.arena; tx = clamp(lerp(tx, (A.x0 + A.x1) / 2, .35), A.x0, A.x1); }
    CAM.x = damp(CAM.x, tx, 7, dt); CAM.y = damp(CAM.y, ty, p.vy > 200 ? 9 : 5, dt);
  }
  // limites da sala
  const hw = CAM.w / 2 / CAM.zoom, hh = CAM.h / 2 / CAM.zoom, W = R.w * T, H = R.h * T;
  CAM.x = W < hw * 2 ? W / 2 : clamp(CAM.x, hw, W - hw); CAM.y = H < hh * 2 ? H / 2 : clamp(CAM.y, hh, H - hh);
  if (CAM.shake > 0) { CAM.sx = rnd(-1, 1) * CAM.shake; CAM.sy = rnd(-1, 1) * CAM.shake; CAM.shake = Math.max(0, CAM.shake - dt * 28); } else CAM.sx = CAM.sy = 0;
}
function camSnap() { CAM.shake = 0; CAM.look = PLAYER ? PLAYER.face * 40 : 0; if (PLAYER) { CAM.x = PLAYER.x + CAM.look; CAM.y = PLAYER.y - 52; } updCamera(0, true); }
// ---------- áudio por estado ----------
function updAudio(dt) {
  const R = ROOM.cur; if (!R || !AU.ctx) return; const b = GAME.boss;
  if (b && b.alive && b.fighting) { } else if (GAME.wake) music(null); else if (GAME.quietT > 0) { GAME.quietT -= dt; music(null); } else if (PLAYER && PLAYER.alive) music(R.def.music || AREAS[R.area].music);
  const amb = Object.assign({}, AREAS[R.area].amb || {}, R.def.amb || {});
  if (PLAYER) { let nb = 1e9; for (const id in GAME.bonfires) { const bf = GAME.bonfires[id]; if (bf.lit && !bf.hiddenUntil) nb = Math.min(nb, Math.abs(PLAYER.x - bf.x)); } amb.l_campfire = nb < 260 ? .5 * (1 - nb / 260) : 0; amb.l_heart = PLAYER.alive && PLAYER.hp < STATS.maxHp() * .25 ? .55 : 0; }
  if (b && b.fighting) for (const k in amb) if (k !== 'l_heart') amb[k] *= .3;
  ambSet(amb);
}
// ---------- salas ----------
const AREAS = {
  crypt: { music: 'crypt', amb: { l_cavewind: .4, l_drops: .3 } },
  hub: { music: 'hub', amb: { l_wind: .35, l_night: .3, l_raven: .12 } },
  walls: { music: 'walls', amb: { l_wind: .5, l_raven: .2 } },
  swamp: { music: 'swamp', amb: { l_night: .45, l_drops: .2, l_owl: .15 } },
  forest: { music: 'forest', amb: { l_wind: .4, l_owl: .3, l_night: .3 } },
  forge: { music: 'forge', amb: { l_fire: .45, l_cavewind: .25, l_drums: .1 } },
  cathedral: { music: 'cathedral', amb: { l_wind: .25, l_cavewind: .25 } },
  heart: { music: 'heart', amb: { l_fire: .3, l_heart: .2, l_wind: .2 } },
};
function clearRoom() { GAME.eclipse = 0; for (const a of ACTORS.slice()) if (a !== PLAYER) a.remove(); ENEMIES.length = 0; entsClear(); clearCombat(); PARTS.length = 0; GPARTS.length = 0; DNUM.length = 0; ROOM.chunks.clear(); GAME.bonfires = {}; GAME.zones = []; GAME.boss = null; CAM.override = null; GAME.cine = false; }
// entry: { side, idx, fromRoom } | { spawn: nome } | { bonfire: id } | { x, y }
function loadRoom(id, entry = {}) {
  clearRoom();
  const R = parseRoom(id); ROOM.cur = R; ROOM.theme = R.theme; ROOM.amb = R.def.amb !== undefined && typeof R.def.amb === 'number' ? R.def.amb : (R.def.ambient ?? R.theme.amb); PROG.room = id; PROG.map[id] = 1;
  // paredes e chãos já partidos
  for (const k in PROG.flags) { const m = k.match(/^(wall|floor)_(.+)_(\d+)_(\d+)$/); if (m && m[2] === id) { if (m[1] === 'wall') { const st = [[+m[3], +m[4]]]; let n = 0; while (st.length && n < 60) { const [x, y] = st.pop(); if (cellAt(x, y) !== 9) continue; R.g[y * R.w + x] = 0; n++; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) st.push([x + dx, y + dy]); } } else R.g[+m[4] * R.w + +m[3]] = 0; } }
  if (BG.kind !== (R.theme.bgKind) || !BG.layers.length) bgMake(R.theme.bgKind);
  // entidades das marcas
  const spawns = {}; let ei = 0;
  for (const mk of R.marks) {
    const def = R.def.marks && R.def.marks[mk.ch]; if (!def) continue; const x = (mk.x + .5) * T, y = (mk.y + 1) * T; const [type, a, b, c] = def;
    switch (type) {
      case 'enemy': { const key = id + '#' + (ei++); if (GAME.killed[key] || (b && b.cond && !b.cond())) break; const e = new Enemy(a, x, y, Object.assign({}, b || {})); e.spawnKey = key; break; }
      case 'boss': { if (PROG.bossDown[a]) { BOSSDEF[a].after && BOSSDEF[a].after(); break; } new Boss(a, x, y); break; }
      case 'bonfire': new Bonfire({ id: a, x, y, after: c && c.after }); spawns['bf_' + a] = { x: x + 26, y }; break;
      case 'item': new Pickup({ id: a, item: b, n: c || 1, x, y }); break;
      case 'chest': new Chest({ id: a, item: b, n: c || 1, x, y }); break;
      case 'door': new Door(Object.assign({ id: a, x, y }, b || {})); break;
      case 'gate': new Door(Object.assign({ id: a, x, y, gate: true, temp: true, startOpen: true }, b || {})); break;
      case 'lever': new Lever({ door: a, x, y }); break;
      case 'elev': new Elevator({ id: a, x, y: y, y1: y - b * T, wt: c || 3 }); break;
      case 'tablet': new Tablet({ lore: a, x, y }); break;
      case 'msg': new Msg({ text: a, x, y }); break;
      case 'npc': { const o = Object.assign({ id: a, x, y }, b || {}); if (o.cond && !o.cond()) break; new NPC(o); break; }
      case 'portal': new Portal(Object.assign({ to: a, spawn: b, x, y }, c || {})); break;
      case 'spawn': spawns[a] = { x, y, face: b || 1 }; break;
      case 'wakecoffin': new WakeCoffin({ x, y }); spawns.start = { x: x + 48, y, face: 1 }; break;
      case 'torch': new Torch(Object.assign({ x, y: y - (a === 'wall' || !a ? 18 : 0), kind: a || 'wall' }, b || {})); break;
      case 'glow': new Glow(Object.assign({ x, y: y - T / 2, color: a, r: b }, c || {})); break;
      case 'prop': makeProp(a, x, y, b || {}); break;
      case 'zone': GAME.zones.push(Object.assign({ x0: x - (b || 2) * T, x1: x + (b || 2) * T, y0: y - 6 * T, y1: y + T, fn: a }, c || {})); break;
    }
  }
  R.spawns = spawns; R.def.init && R.def.init(R);
  // posicionar o jogador
  if (!PLAYER) PLAYER = new Player(0, 0); else if (!ACTORS.includes(PLAYER)) ACTORS.push(PLAYER);
  const p = PLAYER; let px = R.w * T / 2, py = R.h * T / 2; p.vx = entry.vx || 0; p.vy = entry.vy || 0;
  const pf = !spawns[entry.spawn] && entry.portalFrom && ENTS.find(e => e instanceof Portal && e.to === entry.portalFrom);
  if (pf) { px = pf.x; py = pf.y; }
  else if (entry.spawn && spawns[entry.spawn]) { px = spawns[entry.spawn].x; py = spawns[entry.spawn].y; p.face = spawns[entry.spawn].face || p.face; }
  else if (entry.bonfire && spawns['bf_' + entry.bonfire]) { px = spawns['bf_' + entry.bonfire].x; py = spawns['bf_' + entry.bonfire].y; }
  else if (entry.side) {
    const S = entry.side, runs = R.openings[S]; const exv = (R.def.exits || {})[S]; let idx = 0;
    if (Array.isArray(exv)) { idx = Math.max(0, exv.indexOf(entry.fromRoom)); } const run = runs[Math.min(idx, runs.length - 1)] || [0, 0];
    if (S === 'L') { px = 14; py = (run[1] + 1) * T; p.face = 1; } else if (S === 'R') { px = R.w * T - 14; py = (run[1] + 1) * T; p.face = -1; }
    else if (S === 'T') { px = clamp((entry.rel ?? .5) * (run[1] - run[0] + 1) * T + run[0] * T, (run[0] + .5) * T, (run[1] + .5) * T); py = p.h + 6; }
    else if (S === 'B') { px = clamp((entry.rel ?? .5) * (run[1] - run[0] + 1) * T + run[0] * T, (run[0] + .5) * T, (run[1] + .5) * T); py = R.h * T - 2; p.vy = Math.min(p.vy, -720); }
    // procurar chão por baixo nas entradas laterais
    if (S === 'L' || S === 'R') { let ty = Math.floor((py - 1) / T); while (ty < R.h && !SOLID[cellAt(Math.floor(px / T), ty + 1)] && cellAt(Math.floor(px / T), ty + 1) !== 4) ty++; py = (ty + 1) * T; }
  } else if (entry.x !== undefined) { px = entry.x; py = entry.y; }
  p.x = px; p.y = py; p.safe = { x: px, y: py }; p.onGround = false; p.after.length = 0; for (const s of p.scarf) { s.x = px; s.y = py - 30; }
  if (!ENTS.length || !PLATS) { }
  camSnap(); ROOM.chunks.clear(); prebakeAround(30);
  GAME.save();
  if (!PROG.seen[R.area]) { PROG.seen[R.area] = 1; after(.4, () => UI.areaTitle(AREA_NAMES[R.area], AREA_SUBS[R.area])); }
  else if (GAME.lastArea !== R.area) after(.2, () => UI.areaTitle(AREA_NAMES[R.area], ''));
  GAME.lastArea = R.area;
}
// saídas pelas bordas da sala
function checkExits(p) {
  const R = ROOM.cur, ex = R.def.exits || {}; let side = null;
  if (p.x < 2 && ex.L) side = 'L'; else if (p.x > R.w * T - 2 && ex.R) side = 'R'; else if (p.y - p.h < -4 && ex.T) side = 'T'; else if (p.y > R.h * T + 4 && ex.B) side = 'B';
  if (!side) return;
  const runs = R.openings[side]; let idx = 0, rel = .5;
  if (side === 'L' || side === 'R') { const ty = Math.floor((p.y - 8) / T); idx = Math.max(0, runs.findIndex(([a, b]) => ty >= a - 1 && ty <= b + 1)); }
  else { const tx = Math.floor(p.x / T); idx = Math.max(0, runs.findIndex(([a, b]) => tx >= a && tx <= b)); const r = runs[idx]; if (r) rel = (p.x - r[0] * T) / ((r[1] - r[0] + 1) * T); }
  const to = Array.isArray(ex[side]) ? ex[side][idx] : ex[side]; if (!to) return;
  const opp = { L: 'R', R: 'L', T: 'B', B: 'T' }[side];
  GAME.transitionTo(to, { side: opp, fromRoom: R.id, vx: p.vx, vy: side === 'B' ? p.vy : side === 'T' ? -720 : 0, rel });
}
GAME.transitionTo = (id, entry) => {
  GAME.transition = true; UI.el.fade.classList.add('on'); const p = PLAYER; p.ctrl = false;
  setTimeout(() => { try { loadRoom(id, entry); } catch (e) { console.error(e); } UI.el.fade.classList.remove('on'); GAME.transition = false; p.ctrl = true; _last = performance.now(); }, 230);
};
GAME.travel = (id, spawn) => GAME.transitionTo(id, { spawn, portalFrom: ROOM.cur && ROOM.cur.id });
// ---------- inimigos mortos, recompensas ----------
GAME.onEnemyKilled = (e) => {
  if (e.spawnKey) GAME.killed[e.spawnKey] = 1; PROG.bestiary[e.type] = (PROG.bestiary[e.type] || 0) + 1; PROG.kills++;
  const n = Math.round(e.cinzas * (1 + talSum('cinzas'))); if (n && !e.isAdd) { PROG.cinzas += n; UI.gainCinzas(n); burst(e.x, e.cy, Math.min(14, 3 + n / 10), { color: [0xffd890, 0xffb050], smin: 40, smax: 120, lmin: .4, lmax: .8 }); }
  if (e.opt.drop && !PROG.picked[e.opt.drop.id]) { const d = e.opt.drop; after(.6, () => new Pickup({ id: d.id, item: d.item, x: e.x, y: Math.floor(e.y / T) * T + T >= e.y ? e.y : e.y, n: d.n || 1 })); }
};
// ---------- morte e sombra ----------
GAME.onPlayerDeath = () => {
  PROG.deaths++; const p = PLAYER; const sp = p.safe;
  PROG.shade = PROG.cinzas > 0 ? { room: ROOM.cur.id, x: sp.x, y: sp.y, n: PROG.cinzas } : null; PROG.cinzas = 0; UI.cShown = 0;
  music(null, 2); if (GAME.boss) UI.el.boss.hidden = true;
  after(1, () => UI.bigBanner('MORRESTE', 'red', 3.4)); GAME.save();
  setTimeout(() => UI.el.fade.classList.add('on'), 3400);
  setTimeout(() => { UI.el.fade.classList.remove('on'); GAME.respawn(); }, 4300);
};
GAME.respawn = () => {
  GAME.killed = {}; const p = PLAYER; p.alive = true; p.dead = false; p.hp = STATS.maxHp(); p.maxHp = p.hp; p.fp = Math.max(p.fp, 33); p.inv = 1; p.state = 'idle'; p.st = 0; p.atk = null; PROG.flasks = PROG.flaskMax; TIME.slowT = 0;
  if (!ACTORS.includes(p)) ACTORS.push(p);
  const bf = PROG.lastBonfire && BONFIRE_LIST[PROG.lastBonfire];
  if (bf) loadRoom(bf.room, { bonfire: PROG.lastBonfire }); else loadRoom(START_ROOM, { spawn: 'start' });
  _last = performance.now();
};
GAME.recoverShade = () => { const s = PROG.shade; if (!s) return; PROG.cinzas += s.n; UI.gainCinzas(s.n); PROG.shade = null; sfx('gold', { vol: .6 }); synth('item'); UI.bigBanner('CINZAS RECUPERADAS', 'gold', 2.6); GAME.save(); };
// ---------- fogueiras ----------
GAME.useBonfire = (bf) => {
  const p = PLAYER; const first = !bf.lit;
  if (first) { bf.lit = true; PROG.bonfires[bf.id] = 1; synth('bonfire'); sfx('fire', { vol: .7 }); UI.bigBanner('FOGUEIRA ACESA', 'ember', 2.6); burst(bf.x, bf.y - 10, 50, { color: [0xffa040, 0xffd080], smin: 40, smax: 220, dir: -HPI, spread: 1.2 }); }
  PROG.lastBonfire = bf.id; p.maxHp = STATS.maxHp(); p.hp = p.maxHp; PROG.flasks = PROG.flaskMax; p.x = bf.x + (p.x < bf.x ? -20 : 20); p.face = Math.sign(bf.x - p.x); p.setState('sit'); p.vx = 0;
  GAME.killed = {}; GAME.save();
  after(first ? 2.2 : .5, () => { if (PLAYER === p && p.state === 'sit') UI.menu(bonfireMenu(bf)); });
};
GAME.leaveBonfire = () => { const p = PLAYER; if (p && p.state === 'sit') p.setState('idle'); if (GAME.mode === 'menu' && !UI.stack.length) GAME.setMode('play'); GAME.reloadEnemies(); };
GAME.reloadEnemies = () => { const R = ROOM.cur; if (!R) return; for (const e of ENEMIES.slice()) if (!e.isBoss) e.remove(); let ei = 0; for (const mk of R.marks) { const def = R.def.marks && R.def.marks[mk.ch]; if (!def || def[0] !== 'enemy') continue; const key = R.id + '#' + (ei++); if (GAME.killed[key] || (def[2] && def[2].cond && !def[2].cond())) continue; const e = new Enemy(def[1], (mk.x + .5) * T, (mk.y + 1) * T, Object.assign({}, def[2] || {})); e.spawnKey = key; } };
GAME.warpTo = (id) => { const b = BONFIRE_LIST[id]; if (!b) return; PROG.lastBonfire = id; GAME.killed = {}; GAME.transitionTo(b.room, { bonfire: id }); };
// ---------- itens ----------
GAME.giveItem = (id, n = 1, cb) => {
  const it = ITEMS[id]; if (!it) { cb && cb(); return; }
  PROG.items[id] = (PROG.items[id] || 0) + n; let how = '';
  if (it.wid && !PROG.weapons.includes(it.wid)) { PROG.weapons.push(it.wid); how = 'Nova arma! Equipa-a no inventário (separador Equipamento).'; }
  if (it.sid && !PROG.skills.includes(it.sid)) { PROG.skills.push(it.sid); PROG.skillIdx = PROG.skills.length - 1; how = 'Nova habilidade! ' + SKILLS[it.sid].how + (IN.touch ? ' Usa o botão da chama.' : IN.lastDevice === 'pad' ? ' Usa Y / △.' : ' Usa F.'); }
  if (it.abil) { PROG.abil[it.abil] = 1; if (it.abil === 'asas') how = 'Salta outra vez no ar para um segundo salto.'; }
  if (it.tid && !PROG.tals.includes(it.tid)) { PROG.tals.push(it.tid); const j = PROG.talEq.indexOf(null); if (j >= 0) { PROG.talEq[j] = it.tid; how = 'Talismã equipado. Podes trocá-lo no inventário.'; } }
  if (it.cat === 'chaves') PROG.keys[id] = 1;
  if (id === 'lagrima') { PROG.flaskMax += n; PROG.flasks += n; how = 'Agora tens ' + PROG.flaskMax + ' Frascos de Lume.'; }
  if (id === 'cinza_bendita') { PROG.flaskPow += n; how = 'Os frascos curam mais.'; }
  if (id.startsWith('carta')) PROG.letters = ['carta1', 'carta2', 'carta3'].filter(c => PROG.items[c]).length;
  if (it.cat === 'brasas') how = 'Brasas: ' + Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'brasas' && PROG.items[k]).length + ' de 6.';
  if (PLAYER) { PLAYER.maxHp = STATS.maxHp(); }
  synth('item'); sfx(it.cat === 'brasas' ? 'holy2' : 'chest', { vol: .45 });
  UI.itemBox(id, cb, n > 1 ? 'Obtido ×' + n : 'Obtido', how); GAME.save();
};
// ---------- gravação ----------
GAME.save = () => { if (GAME.mode === 'title' || GAME.mode === 'ending') return; store.set(SAVE_KEY, JSON.stringify(PROG)); };
GAME.hasSave = () => !!store.json(SAVE_KEY);
GAME.newGame = () => { PROG = newProg(); store.del(SAVE_KEY); UI.el.title.hidden = true; PLAYER = null; GAME.startIntro(); };
GAME.continueGame = () => { const s = store.json(SAVE_KEY); if (!s) { GAME.newGame(); return; } PROG = Object.assign(newProg(), s); PROG.flags.woke = 1; UI.el.title.hidden = true; PLAYER = null; GAME.setMode('play'); GAME.respawnFresh(); };
GAME.respawnFresh = () => { PLAYER = null; for (const a of ACTORS.slice()) a.remove(); ACTORS.length = 0; const bf = PROG.lastBonfire && BONFIRE_LIST[PROG.lastBonfire]; if (bf) loadRoom(bf.room, { bonfire: PROG.lastBonfire }); else loadRoom(START_ROOM, { spawn: 'start' }); PROG.flasks = PROG.flaskMax; _last = performance.now(); };
GAME.toTitle = () => { UI.closeMenus(); UI.el.ending.hidden = true; UI.el.ending.classList.remove('show'); GAME.titleSetup(); };
// ---------- título e introdução ----------
const START_ROOM = 'crypt_1';
GAME.titleSetup = () => {
  PLAYER = null; for (const a of ACTORS.slice()) a.remove(); ACTORS.length = 0;
  loadRoomTitle(); GAME.setMode('title'); UI.el.title.hidden = false; $('#tContinue').hidden = !GAME.hasSave(); music('title', 2); $('#tsnd').hidden = !!AU.ctx;
  if (!IN.touch) (GAME.hasSave() ? $('#tContinue') : $('#tNew')).focus({ preventScroll: true });
};
function loadRoomTitle() { clearRoom(); const R = parseRoom('title'); ROOM.cur = R; ROOM.theme = R.theme; ROOM.amb = R.theme.amb; bgMake(R.theme.bgKind); for (const mk of R.marks) { const def = R.def.marks[mk.ch]; if (!def) continue; const x = (mk.x + .5) * T, y = (mk.y + 1) * T; if (def[0] === 'bonfire') { PROG.bonfires._t = 1; new Bonfire({ id: '_t', x, y }); } if (def[0] === 'torch') new Torch({ x, y, kind: def[1] }); if (def[0] === 'prop') makeProp(def[1], x, y, def[2] || {}); } CAM.x = R.w * T / 2; CAM.y = R.h * T / 2 + 20; CAM.override = { x: R.w * T / 2, y: R.h * T / 2 + 20, k: 1 }; }
function titleNav() { const btns = $$(GAME.mode === 'ending' ? '#ending button' : '#title button').filter(b => !b.hidden); const i = btns.indexOf(document.activeElement); if (inConsume('down')) { btns[(i + 1) % btns.length].focus(); synth('ui'); } if (inConsume('up')) { btns[(i - 1 + btns.length) % btns.length].focus(); synth('ui'); } if ((inConsume('ok') || inConsume('interact')) && document.activeElement && btns.includes(document.activeElement)) document.activeElement.click(); }
GAME.startIntro = () => { GAME.setMode('intro'); UI.el.intro.hidden = false; GAME.introI = -1; music('title', 1); GAME.introNext(); };
GAME.introNext = () => {
  if (GAME.mode !== 'intro') return; GAME.introI++; GAME.introT = 0;
  if (GAME.introI >= INTRO_TEXT.length) { GAME.endIntro(); return; }
  const e = UI.el.itext; e.classList.remove('on'); setTimeout(() => { e.textContent = INTRO_TEXT[GAME.introI]; e.classList.add('on'); }, GAME.introI ? 380 : 60);
};
GAME.endIntro = () => {
  if (GAME.mode !== 'intro') return; UI.el.intro.hidden = true; PROG.flasks = PROG.flaskMax; GAME.setMode('play');
  PROG.seen.crypt = 1; GAME.lastArea = 'crypt'; loadRoom(START_ROOM, { spawn: 'start' }); _last = performance.now();
  if (!PROG.flags.woke && GAME.wakeStart()) return;
  const p = PLAYER; p.setState('sit'); after(.4, () => UI.areaTitle(AREA_NAMES.crypt, AREA_SUBS.crypt)); after(1.6, () => { if (p.state === 'sit') p.setState('idle'); showControlsHint(); });
};
// ---------- cena do despertar: o Desperto abre o sarcófago por dentro ----------
const WAKE_EV = [
  [.45, () => synth('heartbeat')],
  [1.0, () => UI.subtitle('', 'Escuro. Frio. Pedra encostada à cara.', 2.6)],
  [1.3, () => synth('heartbeat')],
  [2.2, w => w.cof.knock(0)],
  [2.55, () => synth('heartbeat')],
  [3.1, w => w.cof.knock(1)],
  [3.4, () => UI.subtitle('', 'Um coração que já não batia... a bater outra vez.', 2.9)],
  [4.05, w => w.cof.knock(2)],
  [4.5, () => synth('heartbeat')],
  [4.95, w => { w.cof.burstOpen(); const p = PLAYER; p.hidden = false; p.wakeSit = true; p.x = w.cof.x; p.y = w.cof.y + 14; w.rise = 0; }],
  [6.35, w => { w.rise = null; w.hop = 0; PLAYER.wakeSit = false; sfx('whoosh1', at(PLAYER, .4)); }],
  [7.2, () => { PLAYER.face = -1; }],
  [7.75, () => { PLAYER.face = 1; sfx('breath', at(PLAYER, .55)); burst(PLAYER.x + 8, PLAYER.y - 34, 6, { color: 0xd8d4cc, glow: false, smin: 10, smax: 30, dir: 0, spread: .6, lmin: .6, lmax: 1.1, szmin: 2, szmax: 4, grav: -20, drag: 2 }); }],
  [8.5, () => wakeEnd(false)],
];
GAME.wakeStart = () => {
  const p = PLAYER, cof = ENTS.find(e => e instanceof WakeCoffin); if (!p || !cof) return false;
  GAME.wake = { t: 0, i: 0, cof, skip: false, rise: null, hop: null }; GAME.cine = true; document.body.classList.add('cine');
  p.setState('wake'); p.hidden = true; p.ctrl = false; p.face = 1; p.x = cof.x; p.y = cof.y + 14; for (const s of p.scarf) { s.x = p.x; s.y = p.y - 20; }
  CAM.zoom = 1.8; CAM.override = { x: cof.x + 36, y: cof.y - 46, zoom: 1.8, k: 2 }; CAM.x = CAM.override.x; CAM.y = CAM.override.y; music(null, .5);
  return true;
};
function wakeUpdate(dt) {
  const w = GAME.wake, p = PLAYER; w.t += dt;
  if (w.t > 1.1 && (w.skip || inConsume('attack') || inConsume('jump') || inConsume('ok') || inConsume('interact') || inConsume('dash') || inConsume('back'))) { wakeEnd(true); return; }
  while (w.i < WAKE_EV.length && w.t >= WAKE_EV[w.i][0]) WAKE_EV[w.i++][1](w);
  if (!GAME.wake) return;
  if (w.rise !== null && p.state === 'wake') { w.rise = Math.min(1, w.rise + dt / 1.2); p.x = w.cof.x; p.y = lerp(w.cof.y + 14, w.cof.y - 12, easeOut(w.rise)); }
  if (w.hop !== null && p.state === 'wake') { w.hop = Math.min(1, w.hop + dt / .5); const k = w.hop; p.x = lerp(w.cof.x, w.cof.x + 48, k); p.y = lerp(w.cof.y - 12, w.cof.y, k) - Math.sin(k * PI) * 30; if (k >= 1) { w.hop = null; p.setState('idle'); p.vy = 0; p.onGround = true; p.squash = .3; footstep(p); burst(p.x, p.y, 8, DUST); } }
  if (w.t > 7.6 && CAM.override) { CAM.override.zoom = 1; CAM.override.x = p.x + 40; CAM.override.y = p.y - 52; }
}
function wakeEnd(skip) {
  const w = GAME.wake; if (!w) return; const p = PLAYER, cof = w.cof; GAME.wake = null;
  if (skip) { if (!cof.open) cof.open = true; cof.lid = cof.restLid(); cof.seam = .4; p.x = cof.x + 48; p.y = cof.y; p.vy = 0; p.face = 1; p.squash = .2; }
  if (p.state === 'wake') p.setState('idle'); p.hidden = false; p.wakeSit = false; p.ctrl = true; p.safe = { x: cof.x + 48, y: cof.y };
  cof.layer = 'back'; GAME.cine = false; document.body.classList.remove('cine'); CAM.override = null; PROG.flags.woke = 1; GAME.save();
  if (skip) { UI.el.subs.classList.remove('show'); }
  after(.35, () => UI.areaTitle(AREA_NAMES.crypt, AREA_SUBS.crypt)); after(2.4, () => showControlsHint());
}
function drawWakeOverlay() {
  const w = GAME.wake, c = G.ctx, t = w.t; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = '#000';
  const bar = G.H * .11 * (t > 7.7 ? Math.max(0, 1 - (t - 7.7) / .8) : 1); if (bar > .5) { c.fillRect(0, 0, G.W, bar); c.fillRect(0, G.H - bar, G.W, bar); }
  const fa = t < 2.4 ? 1 - easeInOut(Math.min(1, t / 2.4)) * (t < 4.95 ? .72 : 1) : t < 4.95 ? .28 : Math.max(0, .28 - (t - 4.95) * .6);
  if (fa > 0) { c.globalAlpha = fa; c.fillRect(0, 0, G.W, G.H); c.globalAlpha = 1; }
  if (t > 1.1 && t < 7.7) { c.globalAlpha = .55 * Math.min(1, (t - 1.1) * 2); c.fillStyle = '#d8cfbf'; c.font = `${Math.round(11 * G.dpr)}px "EB Garamond",Georgia,serif`; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(IN.touch ? 'toca no ecrã para passar à frente' : 'carrega numa tecla para passar à frente', G.W - 18 * G.dpr, G.H - bar / 2); c.globalAlpha = 1; }
}
document.addEventListener('pointerdown', () => { if (GAME.wake && GAME.wake.t > 1.1) GAME.wake.skip = true; }, true);
function showControlsHint() {
  const h = IN.touch ? 'Arrasta à <b>esquerda</b> para andar · <b>espada</b> ataca · <b>seta</b> salta · <b>seta com barra</b> faz dash e esquiva'
    : IN.lastDevice === 'pad' ? '<b>A</b> saltar · <b>X</b> atacar · <b>B</b> dash e esquiva · <b>RT</b> golpe forte'
      : '<b>A/D</b> andar · <b>Espaço</b> saltar · <b>J</b> ou <b>clique</b> atacar · <b>K</b> ou <b>Shift</b> dash e esquiva';
  UI.tut(h, 9);
}
// ---------- finais ----------
GAME.finalChoice = () => {
  const opts = [{ label: 'Reacender o Lume', desc: 'Torna-te o novo receptáculo.', fn: () => GAME.ending('lume') }, { label: 'Deixar o Lume apagar-se', desc: 'Que venha a escuridão.', fn: () => GAME.ending('cinza') }];
  if (PROG.letters >= 3 && PROG.flags.ioneL) opts.splice(1, 0, { label: 'Entregar as brasas a Ione', desc: 'Que seja por escolha, e não por medo.', fn: () => GAME.ending('filha') });
  UI.menu({ noBack: true, build: () => ({ title: 'O Altar do Lume', sub: 'As seis brasas pulsam nas tuas mãos. A chama espera uma escolha.', items: opts }) });
};
GAME.ending = (k) => {
  UI.closeMenus(); GAME.setMode('ending'); const E = ENDINGS[k]; PROG.flags.ending = k;
  music(E.music, 2); txt(UI.el.eTitle, E.title); UI.el.eText.textContent = E.text; txt(UI.el.eStats, `Tempo ${fmtTime(PROG.time)} · Mortes ${PROG.deaths} · Nível ${PROG.level}`);
  UI.el.ending.className = 'layer screen ' + E.cls; UI.el.ending.hidden = false; setTimeout(() => UI.el.ending.classList.add('show'), 600);
  store.del(SAVE_KEY); if (!IN.touch) setTimeout(() => $('#eBack').focus(), 1500);
};
// ---------- arranque ----------
function boot() {
  initGfx(); initInput(); initUI();
  for (const id in ROOMS) { const d = ROOMS[id]; d.map.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const m = d.marks && d.marks[row[x]]; if (m && m[0] === 'bonfire') BONFIRE_LIST[m[1]] = { room: id, name: m[2] || 'Fogueira', tx: x, ty: y }; } }); }
  GAME.titleSetup();
  BUS.on('resize', () => { ROOM.chunks.clear(); if (BG.kind) bgMake(BG.kind); });
  requestAnimationFrame(t => { _last = t; requestAnimationFrame(frame); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && GAME.mode === 'play') openPause(UI.lastTab || 'inv'); try { if (AU.ctx) { if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume(); MD.pause(document.hidden); } } catch (e) { } });
  window.__UL = { GAME, get PLAYER() { return PLAYER; }, PROG: () => PROG, setProg: p => PROG = p, ENEMIES, ACTORS, ENTS, ROOM, ROOMS, TIME, CAM, G, IN, inPress, inRelease, ITEMS, STATS, UI, BOSSDEF, EDEF, loadRoom, step: dt => step(dt), render: () => render(1 / 60), Enemy, BOSS: () => GAME.boss, TIMERS, AU, MD, LIGHTS,
    sim: (sec, fn, dt = 1 / 30) => { for (let t = 0; t < sec; t += dt) { LIGHTS.length = 0; TIME.real += dt; TIME.dtReal = dt; G.t += dt; if (fn) fn(t); if (GAME.mode === 'play') { let d = dt; if (TIME.slowT > 0) { TIME.slowT -= dt; d *= TIME.slowScale; } if (TIME.hitstop > 0) { TIME.hitstop -= dt; d *= .04; } TIME.now += d; step(d); } else if (GAME.mode === 'dialog') dlgUpdate(dt); else if (GAME.mode === 'menu') menuNav(); UI.update(dt); } } };
}
