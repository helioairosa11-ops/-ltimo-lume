// ===================== JOGO =====================
let PLAYER = null;
// vida dos chefes afinada para um jogo de ~2 horas (o jogador vai subindo de nível e reforçando a arma)
const BOSS_HP_MUL = { odile: 1.5, brigid: 1.6, vesper: 1.55, selene: 1.6, hilde: 1.6, aldric: 1.7, seraphine: 1.75 };
const BOSS_DMG_MUL = { odile: 1.2, brigid: 1.2, vesper: 1.25, selene: 1.25, hilde: 1.3, aldric: 1.35, seraphine: 1.45 };
const BOSS_AGGR = .72; // menos pausa entre golpes
for (const id in BOSS_HP_MUL) if (BOSSDEF[id]) { for (const ph of BOSSDEF[id].phases) ph.hp = Math.round(ph.hp * BOSS_HP_MUL[id] / 10) * 10; BOSSDEF[id].posture = Math.round((BOSSDEF[id].posture || 300) * 1.3); }
const SAVE_KEY = 'ultimo-lume-3d-save-v1';
const GAME = { mode: 'boot', menuFrom: 'title', areaId: null, area: null, cine: false, bossActive: null, interact: null, god: false, flash: 0, eclipse: 0, introI: 0, introT: 0, fps: 60, fpsAcc: 0, fpsN: 0, lowT: 0, killedMini: {}, bosses: {} };
GAME.setMode = (m) => { GAME.mode = m; inClear(); };
// ---------- ciclo principal ----------
let _last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  let dtR = (now - _last) / 1000; _last = now; if (!(dtR > 0)) dtR = 1 / 60; dtR = Math.min(dtR, .066);
  TIME.real += dtR; TIME.dtReal = dtR;
  pollPad();
  GAME.fpsAcc += (now - (GAME.fpsLast || now)) / 1000; GAME.fpsLast = now; GAME.fpsN++; if (GAME.fpsAcc > 1) { GAME.fps = GAME.fpsN / GAME.fpsAcc; GAME.fpsAcc = 0; GAME.fpsN = 0; autoQuality(); }
  if (GAME.mode === 'play') {
    if (inConsume('pause')) openPause();
    let dt = Math.min(dtR, .05);
    if (TIME.slowT > 0) { TIME.slowT -= dtR; dt *= TIME.slowScale; }
    if (TIME.hitstop > 0) { TIME.hitstop -= dtR; dt *= .05; }
    TIME.now += dt; step(dt);
  } else if (GAME.mode === 'dialog') { dlgUpdate(); idleWorld(dtR); }
  else if (GAME.mode === 'menu') { menuNav(); idleWorld(dtR); }
  else if (GAME.mode === 'title' || GAME.mode === 'ending') { titleNav(); titleScene(dtR); }
  else if (GAME.mode === 'intro') { GAME.introT += dtR; if (GAME.introT > 5.2) GAME.introNext(); if (inConsume('ok') || inConsume('atk')) GAME.introNext(); if (inConsume('back')) GAME.endIntro(); titleScene(dtR); }
  UI.update(dtR); musicTick(); updDmgNumbers(dtR);
  if (R.renderer && GAME.mode !== 'loading' && GAME.mode !== 'boot') renderFrame();
}
function idleWorld(dt) { // mundo parado mas a câmera e efeitos ambientes continuam
  TIME.now += dt * .0; fxUpdate(dt, TIME.real); if (PLAYER) { updateLightPool(R.camera.position.x, R.camera.position.y, R.camera.position.z, TIME.real); }
}
function step(dt) {
  updTimers(dt);
  const p = PLAYER; if (!p) return;
  if (!GAME.cine) p.update(dt); else { p.vel.set(0, 0, 0); p.anim.update(dt); p.physics(dt); p.sync(); p.weaponIK(dt); }
  checkBreakables(p);
  for (const e of ENEMIES.slice()) {
    const d = Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z);
    const near = d < 55 || e.aggroed;
    e.root.visible = (e.alive || !e.dissolved) && d < Q().drawDist && e.state !== 'hidden' && !(e.ghost && e.state === 'hidden');
    if (near) e.update(dt);
  }
  for (const id in GAME.bosses) { const b = GAME.bosses[id]; if (b) b.update(dt); }
  separateActors();
  updProjectiles(dt); updAoes(dt);
  for (const e of WORLD.ents) e.update(dt);
  GAME.interact = GAME.cine ? null : nearestInteract();
  updCamera(dt);
  updParticles(dt, p.pos.x, p.pos.z); updWeather(dt, R.camera.position.x, R.camera.position.y, R.camera.position.z);
  fxUpdate(dt, TIME.now);
  updateLightPool(p.pos.x, p.pos.y + 1, p.pos.z, TIME.now); updateShadowCam(p.pos.x, p.pos.y, p.pos.z);
  if (!p.alive || GAME.cine) { } else PROG.time += dt;
  GAME.updAudio(dt);
  if (GAME.area && GAME.area.tick) GAME.area.tick(dt);
}
// ---------- qualidade automática ----------
function autoQuality() {
  if (GAME.mode !== 'play') return;
  if (GAME.fps < 22) GAME.lowT++; else GAME.lowT = 0;
  if (GAME.lowT >= 6 && SET.quality !== 'low' && !GAME.qWarned) { GAME.qWarned = true; UI.toast('O jogo está lento. Em Definições podes baixar a qualidade gráfica.', 5); }
}
// ---------- áudio por estado ----------
GAME.updAudio = (dt) => {
  if (!AU.ctx) return; const A = GAME.area; if (!A) return;
  const b = GAME.bossActive;
  if (b && b.alive && b.fighting) { /* música do chefe gerida pelo chefe */ }
  else if (GAME.quietT > 0) { GAME.quietT -= dt; music(null); }
  else if (PLAYER && PLAYER.alive) music(A.music);
  const amb = Object.assign({}, A.amb || {});
  if (PLAYER) { let nb = 1e9; for (const id in WORLD.bonfires) { const bf = WORLD.bonfires[id]; if (bf.lit) nb = Math.min(nb, Math.hypot(PLAYER.pos.x - bf.pos.x, PLAYER.pos.z - bf.pos.z)); } amb.l_campfire = nb < 12 ? .55 * (1 - nb / 12) : 0; amb.l_heart = PLAYER.alive && PLAYER.hp < STATS.maxHp() * .28 ? .6 : 0; }
  if (b && b.fighting) for (const k in amb) if (k !== 'l_heart') amb[k] *= .35;
  ambSet(amb);
};
// ---------- áreas ----------
const AREAS = {}; const BONFIRE_LIST = {};
function disposeGroup(g) {
  const keep = new Set(Object.values(PROPGEO)); const mats = new Set(Object.values(MATS));
  g.traverse(o => { if (o.geometry && !keep.has(o.geometry)) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const m of ms) if (!mats.has(m) && !Object.values(FXMAT).includes(m)) { if (m.map && m.map.isCanvasTexture && !Object.values(SPR).includes(m.map)) m.map.dispose(); m.dispose(); } } });
}
function clearWorld() {
  for (const a of ACTORS.slice()) a.remove(); ACTORS.length = 0; ENEMIES.length = 0; GAME.bosses = {}; GAME.bossActive = null; BOSS = null;
  clearProjectiles(); clearAoes(); clearEmitters(); fxClear(); clearLights(); entsClear(); physClear(); BREAKABLES.length = 0; TIMERS.length = 0;
  if (WORLD.group) { R.scene.remove(WORLD.group); disposeGroup(WORLD.group); }
  for (const d of FX.dmg) d.el.remove(); FX.dmg.length = 0;
  PLAYER = null; setWeather(null); camRelease(); GAME.cine = false;
}
GAME.loadArea = (id, spawn, after2) => {
  GAME.setMode('loading'); const A = AREAS[id];
  UI.el.loading.hidden = false; UI.el.loading.classList.remove('out'); UI.el.lname.textContent = AREA_NAMES[id]; UI.el.ltip.textContent = pick(TIPS); css(UI.el.lbar, 'width', '15%');
  stopSpeech(); music(null, .8);
  setTimeout(() => {
    try {
      clearWorld();
      GAME.areaId = id; GAME.area = A; PROG.area = id;
      const g = new THREE.Group(); WORLD.group = g; R.scene.add(g); WORLD.area = A;
      setEnv(A.env); PHYS.killY = A.killY ?? -30;
      const kit = new AreaKit(g, A); A.build(kit); kit.finish(); GAME.kit = kit;
      css(UI.el.lbar, 'width', '70%');
      initParticles2(); setWeather(A.weather || null);
      // jogador
      PLAYER = new Player(); R.scene.add(PLAYER.root);
      const sp = kit.spawnPts[spawn] || kit.spawnPts.start || [0, 0, 0, 0];
      PLAYER.pos.set(sp[0], sp[1], sp[2]); PLAYER.yaw = sp[3] || 0; PLAYER.lastSafe.copy(PLAYER.pos);
      const gy = groundAt(sp[0], sp[2], sp[1] + 2, 3); if (gy > -1e8) PLAYER.pos.y = gy;
      PLAYER.hp = Math.min(PLAYER.hp, STATS.maxHp()); if (GAME.pendingHp !== undefined) { PLAYER.hp = GAME.pendingHp; GAME.pendingHp = undefined; }
      PLAYER.sync(); camReset(PLAYER);
      GAME.spawnAll();
      if (PROG.stain && PROG.stain.area === id) new Stain({ x: PROG.stain.x, y: PROG.stain.y, z: PROG.stain.z });
      // aquecer shaders
      R.renderer.compile(R.scene, R.camera);
      musicPrefetch([A.music]);
    } catch (e) { console.error(e); }
    css(UI.el.lbar, 'width', '100%');
    setTimeout(() => {
      UI.el.loading.classList.add('out'); setTimeout(() => UI.el.loading.hidden = true, 600);
      GAME.setMode('play'); _last = performance.now();
      if (!PROG.flags['seen_' + id]) { PROG.flags['seen_' + id] = 1; after(.6, () => UI.areaTitle(AREA_NAMES[id])); }
      if (A.onEnter) A.onEnter();
      after2 && after2();
    }, 250);
  }, 60);
};
function initParticles2() { if (!PFX.glow) initParticles(); else { R.scene.add(PFX.glow.pts); R.scene.add(PFX.dust.pts); } }
GAME.spawnAll = () => {
  for (const e of ENEMIES.slice()) e.remove(); ENEMIES.length = 0;
  WORLD.spawns.forEach((s, i) => {
    const T = ETYPE[s.type]; const key = GAME.areaId + '_' + i;
    if (T.mini && PROG.flags['mini_' + key]) return;
    if (s.opt.cond && !s.opt.cond()) return;
    const e = spawnEnemy(s.type, s.x, s.y, s.z, s.yaw, s.opt.lvl || GAME.area.lvl || 1, s.opt); e.spawnKey = key;
  });
  for (const id in GAME.bosses) { const b = GAME.bosses[id]; if (b) b.remove(); }
  GAME.bosses = {}; GAME.bossActive = null;
  for (const id in WORLD.bossSpawns) { if (PROG.bossDown[id]) continue; const s = WORLD.bossSpawns[id]; const b = new Boss(id, s.x, s.y, s.z, s.yaw); GAME.bosses[id] = b; }
  for (const id in WORLD.fogs) { const f = WORLD.fogs[id]; if (!PROG.bossDown[id] && f.gone && !f.permGone) { f.gone = false; f.col.enabled = true; f.m.visible = true; f.m.scale.y = 1; } }
};
// ---------- névoa / chefe ----------
GAME.enterFog = (fog) => {
  const p = PLAYER; const c = Math.cos(fog.yaw || 0), s = Math.sin(fog.yaw || 0);
  const dir = fog.inside; const tx = fog.pos.x + s * dir * 2.2, tz = fog.pos.z + c * dir * 2.2;
  fog.col.enabled = false; synth('fog'); p.lock = null;
  p.walkTo(tx, tz, () => {
    fog.col.enabled = true;
    const b = GAME.bosses[fog.boss]; if (!b) return;
    const first = !PROG.flags['bossSeen_' + fog.boss]; PROG.flags['bossSeen_' + fog.boss] = 1;
    b.begin(first);
  }, { speed: 1.4, maxT: 3 });
};
GAME.onBossKilled = (b) => {
  PROG.bossDown[b.id] = 1; GAME.quietT = 8;
  const R2 = BOSS_REWARDS[b.id] || {};
  after(1, () => { UI.gainCinzas(R2.cinzas || 0); PROG.cinzas += R2.cinzas || 0; });
  after(5.2, () => {
    GAME.bossActive = null; const f = WORLD.fogs[b.id]; if (f) f.dissolve();
    const items = [R2.brasa, ...(R2.items || [])].filter(Boolean);
    const give = (i) => { if (i >= items.length) { GAME.save(); R2.after && R2.after(); return; } const [id, n] = Array.isArray(items[i]) ? items[i] : [items[i], 1]; GAME.giveItem(id, n, () => give(i + 1)); };
    give(0);
  });
  // a fogueira da arena aparece
  const bf = Object.values(WORLD.bonfires).find(x => x.afterBoss === b.id); if (bf) after(6, () => { bf.reveal(); burst(bf.pos.x, bf.pos.y + .5, bf.pos.z, 40, { color: 0xffa040, smin: 1, smax: 4, upBias: 1, lmin: .5, lmax: 1.2 }); });
};
const BOSS_REWARDS = {
  odile: { cinzas: 2000, brasa: 'brasa_lamento', items: [['lagrima', 1], ['fragmento', 2]] },
  brigid: { cinzas: 5500, brasa: 'brasa_juramento', items: [['fragmento', 2]] },
  vesper: { cinzas: 9000, brasa: 'brasa_veu', items: [['fragmento', 3], ['tal_foco', 1]] },
  selene: { cinzas: 9500, brasa: 'brasa_lua', items: [['fragmento', 3], ['w_daggers', 1]] },
  hilde: { cinzas: 15000, brasa: 'brasa_forja', items: [['fragmento', 3], ['cinza_bendita', 1]] },
  aldric: { cinzas: 24000, brasa: 'brasa_rei', items: [['fragmento', 3], ['w_greatsword', 1]] },
  seraphine: { cinzas: 50000, after: () => after(1, () => GAME.finalChoice()) },
};
GAME.onEnemyKilled = (e) => {
  if (e.isBossAdd) return;
  const n = e.cinzas || 0; if (n) { PROG.cinzas += n; UI.gainCinzas(n); sfx('gold', { vol: .25, rate: 1.2 }); }
  if (e.T && e.T.mini) { PROG.flags['mini_' + e.spawnKey] = 1; if (e.type === 'carrasco') { PROG.flags.carrasco = 1; after(2.5, () => { GAME.giveItem('w_axe', 1); }); } UI.bigBanner('INIMIGO ABATIDO', 'gold', 3); GAME.quietT = 4; }
  if (e.opt && e.opt.drop && !PROG.picked[e.opt.drop.id]) { const d = e.opt.drop; after(1.8, () => new Pickup({ id: d.id, item: d.item, x: e.pos.x, y: e.pos.y, z: e.pos.z, n: d.n || 1 })); }
};
// ---------- morte ----------
GAME.onPlayerDeath = (h) => {
  PROG.deaths++; const p = PLAYER;
  const sp = h && h.type === 'fall' ? p.lastSafe : p.pos;
  PROG.stain = PROG.cinzas > 0 ? { area: GAME.areaId, x: sp.x, y: sp.y, z: sp.z, n: PROG.cinzas } : null; PROG.cinzas = 0; UI.cShown = 0;
  music(null, 2); stopSpeech(); if (GAME.bossActive) { UI.el.boss.hidden = true; }
  after(1.2, () => UI.bigBanner('MORRESTE', 'red', 3.6));
  after(4.4, () => UI.el.fade.classList.add('on'));
  after(5.2, () => { UI.el.fade.classList.remove('on'); GAME.respawn(); });
  GAME.save();
};
GAME.respawn = () => {
  const bf = PROG.lastBonfire && BONFIRE_LIST[PROG.lastBonfire];
  PROG.flasks = PROG.flaskMax; GAME.pendingHp = STATS.maxHp();
  if (bf) GAME.loadArea(bf.area, 'bf_' + PROG.lastBonfire); else GAME.loadArea('crypt', 'start');
};
GAME.recoverStain = () => { const s = PROG.stain; if (!s) return; PROG.cinzas += s.n; UI.gainCinzas(s.n); PROG.stain = null; sfx('gold', { vol: .6 }); synth('item'); UI.bigBanner('CINZAS RECUPERADAS', 'gold', 2.6); GAME.save(); };
// ---------- fogueiras ----------
GAME.useBonfire = (bf) => {
  const p = PLAYER; p.lock = null;
  const first = !bf.lit;
  if (first) { bf.setLit(true); PROG.bonfires[bf.id] = 1; synth('bonfire'); sfx('fire', { vol: .7 }); UI.bigBanner('FOGUEIRA ACESA', 'ember', 2.6); burst(bf.pos.x, bf.pos.y + .5, bf.pos.z, 50, { color: 0xffa040, smin: 1, smax: 5, upBias: 1.2, lmin: .6, lmax: 1.4 }); }
  PROG.lastBonfire = bf.id; p.hp = STATS.maxHp(); p.fp = STATS.maxFp(); p.stam = STATS.maxStam(); p.status = {}; PROG.flasks = PROG.flaskMax;
  p.yaw = yawTo(p.pos.x, p.pos.z, bf.pos.x, bf.pos.z); p.setState('sit'); p.anim.play(CLIP.sit, { hold: true }); p.useIK = false;
  GAME.spawnAll(); GAME.save();
  after(first ? 2.4 : .7, () => { if (PLAYER === p && p.state === 'sit') UI.menu(bonfireMenu(bf)); });
};
GAME.leaveBonfire = () => { UI.closeMenus(); const p = PLAYER; if (p) { p.anim.stop(.5); p.useIK = !!p.wmesh; p.busy(.6); } };
GAME.warpTo = (id) => { const b = BONFIRE_LIST[id]; if (!b) return; PROG.lastBonfire = id; GAME.pendingHp = STATS.maxHp(); GAME.loadArea(b.area, 'bf_' + id); };
GAME.travel = (areaId, spawn) => { GAME.pendingHp = PLAYER ? PLAYER.hp : undefined; GAME.save(); GAME.loadArea(areaId, spawn); };
// ---------- itens ----------
GAME.giveItem = (id, n = 1, cb) => {
  const it = ITEMS[id]; if (!it) { cb && cb(); return; }
  PROG.items[id] = (PROG.items[id] || 0) + n;
  let extra = '';
  if (it.kind === 'weapon' && !PROG.weapons.includes(it.wid)) { PROG.weapons.push(it.wid); extra = ' Equipa-a no menu de Equipamento.'; }
  if (it.kind === 'skill' && !PROG.skills.includes(it.sid)) { PROG.skills.push(it.sid); PROG.skillIdx = PROG.skills.length - 1; extra = ' Nova habilidade! Usa-a com o botão de habilidade.'; }
  if (it.kind === 'tal' && !PROG.tals.includes(it.tid)) { PROG.tals.push(it.tid); if (!PROG.talEq[0]) PROG.talEq[0] = it.tid; else if (!PROG.talEq[1]) PROG.talEq[1] = it.tid; }
  if (it.kind === 'key') PROG.keys[id] = 1;
  if (id === 'lagrima') { PROG.flaskMax += n; PROG.flasks += n; }
  if (id === 'cinza_bendita') PROG.flaskPow += n;
  if (it.kind === 'cinzas') { PROG.cinzas += it.n * n; UI.gainCinzas(it.n * n); }
  if (id.startsWith('carta')) PROG.letters = ['carta1', 'carta2', 'carta3'].filter(c => PROG.items[c]).length;
  synth('item'); sfx(it.kind === 'brasa' ? 'holy2' : 'chest', { vol: .5 });
  UI.itemBox(it.name + (n > 1 ? ' ×' + n : ''), it.desc + extra, cb);
  GAME.save();
};
// ---------- gravação ----------
GAME.save = () => { store.set(SAVE_KEY, JSON.stringify(PROG)); };
GAME.hasSave = () => !!store.json(SAVE_KEY);
GAME.newGame = () => { PROG = newProg(); store.del(SAVE_KEY); UI.el.title.hidden = true; GAME.startIntro(); };
GAME.continueGame = () => { const s = store.json(SAVE_KEY); if (!s) { GAME.newGame(); return; } PROG = Object.assign(newProg(), s); UI.el.title.hidden = true; GAME.pendingHp = STATS.maxHp(); PROG.flasks = PROG.flaskMax; GAME.respawn(); };
GAME.toTitle = () => { UI.closeMenus(); UI.el.ending.hidden = true; UI.el.ending.classList.remove('show'); clearWorld(); GAME.titleSetup(); };
// ---------- título e introdução ----------
GAME.titleSetup = () => {
  GAME.setMode('title'); UI.el.title.hidden = false; $('#tContinue').hidden = !GAME.hasSave(); music('title', 2);
  if (!WORLD.group || !WORLD.titleScene) buildTitleScene();
  if (!IN.touch) (GAME.hasSave() ? $('#tContinue') : $('#tNew')).focus({ preventScroll: true });
};
function titleNav() { const btns = $$(GAME.mode === 'ending' ? '#ending button' : '#title button').filter(b => !b.hidden); if (inConsume('down')) moveFocus(btns, 1); if (inConsume('up')) moveFocus(btns, -1); if (IN.lastDevice === 'pad' && inConsume('ok') && document.activeElement && document.activeElement.click) document.activeElement.click(); }
function buildTitleScene() {
  clearWorld(); const g = new THREE.Group(); WORLD.group = g; WORLD.titleScene = true; R.scene.add(g);
  setEnv({ fog: 0x050405, fogD: .05, bg: 0x030203, hemi: .15, moonI: .2, exposure: 1.1, bloomStr: .8, bloomTh: .7 });
  const kit = new AreaKit(g, { lvl: 1 });
  kit.floor(-12, -12, 12, 12, 0, 'ash');
  kit.statue(-3.5, -2.2, .5, 'weep', 1.6, 0); kit.statue(3.5, -2.2, -.5, 'pray', 1.6, 0);
  for (let i = 0; i < 6; i++) kit.rock(rnd(-8, 8), rnd(-8, -3), rnd(.4, 1));
  const bf = new Bonfire({ id: '_title', x: 0, y: 0, z: 0 }); bf.setLit(true);
  kit.finish(); initParticles2(); setWeather('embers');
  R.camera.position.set(0, 1.35, 5.2); R.camera.lookAt(0, 1.1, 0);
}
function titleScene(dt) { TIME.now += dt; const t = TIME.now; R.camera.position.set(Math.sin(t * .05) * .6, 1.35 + Math.sin(t * .2) * .05, 5.2); R.camera.lookAt(0, 1.05, 0); updParticles(dt, 0, 0); updWeather(dt, 0, 1, 0); fxUpdate(dt, t); updateLightPool(0, 1, 0, t); }
GAME.startIntro = () => { GAME.setMode('intro'); UI.el.intro.hidden = false; GAME.introI = -1; music('title', 1); GAME.introNext(); };
GAME.introNext = () => {
  if (GAME.mode !== 'intro') return; GAME.introI++; GAME.introT = 0;
  if (GAME.introI >= INTRO_TEXT.length) { GAME.endIntro(); return; }
  const e = UI.el.itext; e.classList.remove('on'); setTimeout(() => { e.textContent = INTRO_TEXT[GAME.introI]; e.classList.add('on'); speak(INTRO_TEXT[GAME.introI], 'f', { pitch: .8, rate: .82, vol: .8 }); }, GAME.introI ? 380 : 60);
};
GAME.endIntro = () => { if (GAME.mode !== 'intro') return; stopSpeech(); UI.el.intro.hidden = true; PROG.flasks = PROG.flaskMax; GAME.loadArea('crypt', 'start', () => { PLAYER.anim.play(CLIP.kneel, { hold: true }); PLAYER.setState('frozen'); after(1.6, () => { PLAYER.anim.stop(1); PLAYER.setState('move'); showControlsHint(); }); }); };
function showControlsHint() {
  const h = IN.touch ? 'Arrasta à <b>esquerda</b> para andar e à <b>direita</b> para olhar · <b>espada</b> ataca · <b>seta circular</b> rola (segura para correr)' : IN.lastDevice === 'pad' ? '<b>RB</b> atacar · <b>RT</b> pesado · <b>B</b> rolar (segura para correr) · <b>A</b> saltar · <b>R3</b> travar mira' : '<b>WASD</b> andar · <b>rato</b> olhar · <b>clique</b> atacar · <b>Espaço</b> rolar (segura para correr) · <b>F</b> saltar · <b>Q</b> travar mira';
  UI.tut(h, 9);
}
// ---------- final ----------
GAME.finalChoice = () => {
  const opts = [{ label: 'Reacender o Lume', desc: 'Torna-te o novo receptáculo.', fn: () => GAME.ending('lume') }, { label: 'Deixar o Lume apagar-se', desc: 'Que venha a escuridão.', fn: () => GAME.ending('cinza') }];
  if (PROG.letters >= 3 && PROG.flags.ioneL) opts.splice(1, 0, { label: 'Entregar as brasas a Ione', desc: 'Que seja por escolha, e não por medo.', fn: () => GAME.ending('filha') });
  UI.menu({ onBack: () => { }, build: () => ({ title: 'O Altar do Lume', sub: 'As seis brasas pulsam nas tuas mãos.', items: opts }) });
};
GAME.ending = (k) => {
  UI.closeMenus(); GAME.setMode('ending'); const E = ENDINGS[k]; PROG.flags.ending = k; PROG.flags['end_' + k] = 1;
  music(E.music, 2); txt(UI.el.eTitle, E.title); txt(UI.el.eText, E.text); txt(UI.el.eStats, `Tempo ${fmtTime(PROG.time)} · Mortes ${PROG.deaths} · Nível ${PROG.level}`);
  UI.el.ending.className = 'layer screen' + (k === 'cinza' ? ' dark' : ''); UI.el.ending.hidden = false; setTimeout(() => UI.el.ending.classList.add('show'), 600);
  speak(E.text, 'f', { pitch: .85, rate: .85 }); store.del(SAVE_KEY);
};
// ---------- NPC ----------
NPC.prototype.talk = function () {
  const tbl = DIALOG[this.dialog || this.id]; if (!tbl) return; const e = tbl.find(x => !x.cond || x.cond()); if (!e) return;
  const lines = typeof e.lines === 'function' ? e.lines() : e.lines;
  const p = PLAYER; p.lock = null; p.yaw = yawTo(p.pos.x, p.pos.z, this.pos.x, this.pos.z);
  UI.dialog(this.name, lines, () => { if (e.set) PROG.flags[e.set] = 1; const gift = typeof e.gift === 'function' ? e.gift() : e.gift; if (gift && !PROG.flags['gift_' + this.id + gift]) { PROG.flags['gift_' + this.id + gift] = 1; GAME.giveItem(gift, 1, () => this.afterTalk && this.afterTalk()); } else this.afterTalk && this.afterTalk(); GAME.save(); }, { voice: this.voice });
};
NPC.prototype.chat = NPC.prototype.talk;
// ---------- arranque ----------
function boot() {
  initRenderer(); initInput(); initUI();
  addEventListener('keydown', () => audioUnlock(), { once: true });
  GAME.titleSetup();
  requestAnimationFrame(t => { _last = t; requestAnimationFrame(frame); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && GAME.mode === 'play') openPause(); try { if (AU.ctx) { if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume(); } } catch (e) { } });
  window.__UL = { GAME, TIMERS, SET, UI, get PLAYER() { return PLAYER; }, PROG: () => PROG, setProg: p => PROG = p, ENEMIES, ACTORS, AOES, PROJ, WORLD, renderFrame, Q, TIME, R, CAM, inPress, inRelease, IN, BOSSDEF, ITEMS, STATS, AU, MD, LIGHTS, PHYS, groundAt, step: dt => step(dt), spawnEnemy, Boss, KEYS, CLIP, ETYPE, BOSS: () => BOSS, sim: (sec, fn, dt = 1 / 30) => { for (let t = 0; t < sec; t += dt) { TIME.real += dt; TIME.dtReal = dt; if (fn) fn(t); if (GAME.mode === 'play') { let d = dt; if (TIME.hitstop > 0) { TIME.hitstop -= dt; d *= .05; } if (TIME.slowT > 0) { TIME.slowT -= dt; d *= TIME.slowScale; } TIME.now += d; step(d); } else if (GAME.mode === 'dialog') dlgUpdate(); UI.update(dt); musicTick(); } } };
}
