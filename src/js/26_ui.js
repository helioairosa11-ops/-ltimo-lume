// ===================== INTERFACE =====================
const UI = { el: {}, menuStack: [], toastT: 0, tutT: 0, hurtV: 0, hpLag: 1, bLag: 1, cShown: 0, cGain: 0, cGainT: 0, subT: 0 };
function initUI() {
  const ids = ['hud', 'hpb', 'hpf', 'hpl', 'fpb', 'fpf', 'stb', 'stf', 'status', 'cN', 'cgain', 'qflask', 'qfN', 'qskill', 'qsN', 'qsC', 'bPause', 'boss', 'bname', 'bdmg', 'bfill', 'blag', 'bpost', 'bpostw', 'boss2', 'b2name', 'b2fill', 'reticle', 'prompt', 'ptext', 'pkey', 'toast', 'tut', 'area', 'banner', 'btitle', 'subs', 'touch', 'dialog', 'dwho', 'dtext', 'itembox', 'iname', 'idesc', 'menu', 'fade', 'title', 'intro', 'itext', 'loading', 'lname', 'ltip', 'lbar', 'ending', 'eTitle', 'eText', 'eStats', 'hurt', 'flashL', 'tsnd'];
  for (const i of ids) UI.el[i] = $('#' + i);
  UI.el.bPause.addEventListener('click', () => { if (GAME.mode === 'play') openPause(); });
  UI.el.prompt.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); inPress('interact'); });
  for (const el of [UI.el.dialog, UI.el.itembox]) el.addEventListener('pointerdown', e => { e.stopPropagation(); inPress('ok'); });
  $('#tNew').addEventListener('click', () => { audioUnlock(); GAME.newGame(); });
  $('#tContinue').addEventListener('click', () => { audioUnlock(); GAME.continueGame(); });
  $('#tSettings').addEventListener('click', () => { audioUnlock(); UI.menu(settingsMenu()); });
  $('#tControls').addEventListener('click', () => { audioUnlock(); UI.menu(controlsMenu()); });
  $('#tCredits').addEventListener('click', () => { audioUnlock(); UI.menu(creditsMenu()); });
  $('#iskip').addEventListener('click', e => { e.stopPropagation(); GAME.endIntro(); });
  UI.el.intro.addEventListener('click', () => GAME.introNext());
  $('#eBack').addEventListener('click', () => GAME.toTitle());
  addEventListener('pointerdown', () => { audioUnlock(); if (AU.ctx) UI.el.tsnd.hidden = true; }, true);
  BUS.on('device', d => UI.updDevice());
  UI.updDevice();
}
UI.updDevice = () => { UI.el.pkey.textContent = IN.lastDevice === 'pad' ? 'Y' : 'E'; UI.el.pkey.hidden = IN.touch; };
const css = (el, p, v) => { if (el['_' + p] !== v) { el['_' + p] = v; el.style[p] = v; } };
const txt = (el, v) => { v = String(v); if (el._t !== v) { el._t = v; el.textContent = v; } };
UI.update = (dt) => {
  const E = UI.el, p = PLAYER;
  const inGame = GAME.mode === 'play' || GAME.mode === 'dialog' || (GAME.mode === 'menu' && GAME.menuFrom === 'play');
  E.hud.hidden = !inGame || GAME.cine; E.bPause.hidden = GAME.mode !== 'play' || GAME.cine; E.touch.hidden = !(IN.touch && GAME.mode === 'play' && !GAME.cine);
  if (!inGame || !p) { E.prompt.hidden = true; E.reticle.hidden = true; return; }
  const mh = STATS.maxHp(), mf = STATS.maxFp(), ms = STATS.maxStam();
  const hf = Math.max(0, p.hp / mh); if (hf < UI.hpLag) UI.hpLag = Math.max(hf, UI.hpLag - dt * .35); else UI.hpLag = hf;
  css(E.hpb, 'width', Math.round(110 + mh * .32) + 'px'); css(E.hpf, 'width', (hf * 100).toFixed(1) + '%'); css(E.hpl, 'width', (UI.hpLag * 100).toFixed(1) + '%');
  css(E.fpb, 'width', Math.round(80 + mf * .7) + 'px'); css(E.fpf, 'width', (Math.max(0, p.fp) / mf * 100).toFixed(1) + '%');
  css(E.stb, 'width', Math.round(80 + ms * .9) + 'px'); css(E.stf, 'width', (Math.max(0, p.stam) / ms * 100).toFixed(1) + '%');
  let st = ''; if (p.status.poison) st += '<span class="poison">Envenenado</span>'; if (p.status.burn) st += '<span class="burn">A arder</span>'; if (E.status._h !== st) { E.status._h = st; E.status.innerHTML = st; }
  if (UI.cShown < PROG.cinzas) UI.cShown = Math.min(PROG.cinzas, UI.cShown + Math.max(60 * dt, (PROG.cinzas - UI.cShown) * 5 * dt)); else UI.cShown = PROG.cinzas;
  txt(E.cN, Math.floor(UI.cShown));
  if (UI.cGainT > 0) { UI.cGainT -= dt; txt(E.cgain, '+' + UI.cGain); css(E.cgain, 'opacity', Math.min(1, UI.cGainT * 2).toFixed(2)); } else if (UI.cGain) { UI.cGain = 0; css(E.cgain, 'opacity', '0'); }
  txt(E.qfN, PROG.flasks + '/' + PROG.flaskMax); E.qflask.classList.toggle('empty', PROG.flasks <= 0);
  E.qskill.hidden = !PROG.skills.length;
  if (PROG.skills.length) { const id = PROG.skills[PROG.skillIdx % PROG.skills.length], it = Object.values(ITEMS).find(i => i.sid === id); txt(E.qsN, it ? shortSkill(it.name) : id); txt(E.qsC, SKILLS[id].fp ? SKILLS[id].fp + ' foco' : 'sem foco'); }
  // alvo travado
  if (p.lock && p.lock.alive) { const c = p.lock.center(_v1); c.y += p.lock.boss ? 0 : .1; c.project(R.camera); if (c.z < 1) { E.reticle.hidden = false; css(E.reticle, 'transform', `translate(${((c.x * .5 + .5) * R.w).toFixed(1)}px,${((-c.y * .5 + .5) * R.h).toFixed(1)}px)`); } else E.reticle.hidden = true; } else E.reticle.hidden = true;
  // interação
  const it = GAME.mode === 'play' && !GAME.cine ? GAME.interact : null; E.prompt.hidden = !it; if (it) txt(E.ptext, it.label);
  // chefe
  const b = GAME.bossActive;
  if (b && b.alive && b.fighting) {
    E.boss.hidden = false; const f = Math.max(0, b.hp / b.maxHp); if (UI.bDmgT > 0) { UI.bDmgT -= dt; txt(E.bdmg, UI.bDmg); } else { UI.bDmg = 0; txt(E.bdmg, ''); UI.bLag = Math.max(f, UI.bLag - dt * .5); }
    if (UI.bLag < f) UI.bLag = f; css(E.bfill, 'width', (f * 100).toFixed(1) + '%'); css(E.blag, 'width', (UI.bLag * 100).toFixed(1) + '%');
    const pf = b.state === 'broken' ? 1 : clamp(b.posture / b.postureMax, 0, 1); css(E.bpost, 'width', (pf * 100).toFixed(1) + '%'); E.bpostw.classList.toggle('full', b.state === 'broken');
    if (UI.b2 && UI.b2.alive) { E.boss2.hidden = false; css(E.b2fill, 'width', (Math.max(0, UI.b2.hp / UI.b2.maxHp) * 100).toFixed(1) + '%'); } else E.boss2.hidden = true;
  } else E.boss.hidden = true;
  // efeitos de ecrã
  UI.hurtV = Math.max(0, UI.hurtV - dt * 1.5); const low = p.alive && p.hp < mh * .25 ? .18 + .1 * Math.sin(TIME.real * 5) : 0; css(E.hurt, 'opacity', Math.max(UI.hurtV, low).toFixed(2));
  GAME.flash = Math.max(0, (GAME.flash || 0) - dt * 2.5); css(E.flashL, 'opacity', (GAME.flash * .35).toFixed(2));
  if (UI.subT > 0) { UI.subT -= dt; if (UI.subT <= 0) E.subs.classList.remove('show'); }
};
function shortSkill(n) { return n.replace('Cinza de Guerra: ', ''); }
UI.toast = (t, d = 3) => { const e = UI.el.toast; e.textContent = t; e.classList.add('show'); clearTimeout(UI._tt); UI._tt = setTimeout(() => e.classList.remove('show'), d * 1000); };
UI.tut = (h, d = 7) => { const e = UI.el.tut; e.innerHTML = h; e.classList.add('show'); clearTimeout(UI._ut); UI._ut = setTimeout(() => e.classList.remove('show'), d * 1000); };
UI.areaTitle = (n) => { UI.el.tut.classList.remove('show'); const e = UI.el.area; e.firstElementChild.textContent = n; e.classList.add('show'); clearTimeout(UI._at); UI._at = setTimeout(() => e.classList.remove('show'), 3600); };
UI.bigBanner = (t, cls, d = 3.5) => { const e = UI.el.banner; e.className = 'layer ' + cls; e.firstElementChild.textContent = t; void e.offsetWidth; e.classList.add('show'); clearTimeout(UI._bt); UI._bt = setTimeout(() => e.classList.remove('show'), d * 1000); };
UI.bossTitle = (n, t, phase) => { const e = UI.el.btitle; e.querySelector('.n').textContent = n; e.querySelector('.t').textContent = t || ''; e.classList.toggle('phase', !!phase); e.classList.add('show'); clearTimeout(UI._btt); UI._btt = setTimeout(() => e.classList.remove('show'), 3200); };
UI.subtitle = (who, l, d = 4) => { if (!SET.subtitles) return; const e = UI.el.subs; e.querySelector('.w').textContent = who; e.querySelector('.l').textContent = l; e.classList.add('show'); UI.subT = d; };
UI.bossBar = (b) => { UI.el.bname.textContent = b.D.phases[b.phase] && b.D.phases[b.phase].title && b.phase ? b.D.phases[b.phase].title : b.name; UI.bLag = 1; UI.b2 = null; };
UI.bossBar2 = (a) => { UI.b2 = a; UI.el.b2name.textContent = a.name; };
UI.bossHit = (b, d) => { UI.bDmg = (UI.bDmg || 0) + d; UI.bDmgT = 1.6; };
UI.hurt = (d, quiet) => { UI.hurtV = Math.max(UI.hurtV, quiet ? .2 : .55); };
UI.flaskEmpty = () => { const q = UI.el.qflask; q.classList.remove('shake'); void q.offsetWidth; q.classList.add('shake'); UI.toast('Sem frascos. Descansa numa fogueira.'); };
UI.noFp = () => { const q = UI.el.qskill; q.classList.remove('shake'); void q.offsetWidth; q.classList.add('shake'); UI.toast('Foco insuficiente.'); };
UI.skillChanged = () => { const id = PROG.skills[PROG.skillIdx]; const it = Object.values(ITEMS).find(i => i.sid === id); if (it) UI.toast(shortSkill(it.name), 1.5); };
UI.gainCinzas = (n) => { UI.cGain += n; UI.cGainT = 1.8; };
// ---------- diálogos ----------
const DLG = { lines: [], i: 0, cb: null, t: 0 };
UI.dialog = (who, lines, cb, o = {}) => {
  GAME.setMode('dialog'); DLG.lines = lines; DLG.i = 0; DLG.cb = cb; DLG.who = who; DLG.voice = o.voice; UI.el.dwho.textContent = who; UI.el.dialog.hidden = false; UI.el.itembox.hidden = true; dlgShow(); DLG.t = TIME.real;
};
function dlgShow() { const l = DLG.lines[DLG.i]; UI.el.dtext.textContent = l; UI.el.dtext.classList.remove('in'); void UI.el.dtext.offsetWidth; UI.el.dtext.classList.add('in'); if (DLG.voice && l.length > 3) speak(l, DLG.voice.sex || 'f', DLG.voice); }
UI.itemBox = (name, desc, cb, kick = 'Obtido') => { GAME.setMode('dialog'); DLG.lines = [desc]; DLG.i = 0; DLG.cb = cb; DLG.voice = null; UI.el.itembox.querySelector('.kick').textContent = kick; UI.el.iname.textContent = name; UI.el.idesc.textContent = desc; UI.el.itembox.hidden = false; UI.el.dialog.hidden = true; DLG.t = TIME.real; };
UI.message = (t) => UI.dialog('Mensagem de um Desperto', ['«' + t + '»']);
function dlgUpdate() {
  if (TIME.real - DLG.t < .25) return;
  if (inConsume('ok') || inConsume('interact') || inConsume('atk')) { synth('ui'); DLG.i++; DLG.t = TIME.real; if (DLG.i >= DLG.lines.length) { UI.el.dialog.hidden = true; UI.el.itembox.hidden = true; stopSpeech(); GAME.setMode('play'); const cb = DLG.cb; DLG.cb = null; cb && cb(); } else dlgShow(); }
}
// ---------- menus ----------
UI.menu = (m) => { if (GAME.mode !== 'menu') { GAME.menuFrom = GAME.mode; } GAME.setMode('menu'); UI.el.menu.hidden = false; UI.menuStack.push(m); renderMenu(0); };
function renderMenu(fi) {
  const m = UI.menuStack[UI.menuStack.length - 1]; if (!m) return; const d = m.build ? m.build() : m;
  const panel = document.createElement('div'); panel.className = 'panel' + (d.wide ? ' wide' : '');
  const h = document.createElement('h2'); h.textContent = d.title; panel.appendChild(h);
  if (d.sub) { const s = document.createElement('p'); s.className = 'sub'; s.textContent = d.sub; panel.appendChild(s); }
  if (d.html) { const c = document.createElement('div'); c.className = 'copy'; c.innerHTML = d.html; panel.appendChild(c); }
  const btns = [];
  (d.items || []).forEach((it, i) => {
    const b = document.createElement('button'); b.className = 'mbtn' + (it.off ? ' off' : '') + (it.sel ? ' sel' : ''); const l = document.createElement('span'); l.className = 'l'; l.textContent = it.label;
    if (it.desc) { const dd = document.createElement('span'); dd.className = 'd'; dd.textContent = it.desc; l.appendChild(dd); }
    b.appendChild(l); if (it.right !== undefined) { const r = document.createElement('span'); r.className = 'r'; r.textContent = it.right; b.appendChild(r); }
    b.addEventListener('click', () => { synth('ui'); it.fn && it.fn(); }); panel.appendChild(b); btns.push(b);
  });
  UI.el.menu.replaceChildren(panel); UI.menuBtns = btns;
  const fb = btns[Math.min(fi || 0, btns.length - 1)]; if (fb && !IN.touch) fb.focus({ preventScroll: true });
}
UI.rerender = () => { const i = UI.menuBtns ? UI.menuBtns.indexOf(document.activeElement) : 0; renderMenu(Math.max(0, i)); };
UI.back = () => { if (UI.menuStack.length > 1) { UI.menuStack.pop(); renderMenu(0); } else UI.closeMenus(); };
UI.closeMenus = () => { UI.menuStack = []; UI.el.menu.hidden = true; UI.el.menu.replaceChildren(); const f = GAME.menuFrom || 'play'; GAME.setMode(f); if (f === 'title' && !IN.touch) $('#tNew').focus({ preventScroll: true }); if (PLAYER && PLAYER.state === 'sit' && f === 'play') { PLAYER.anim.stop(.4); PLAYER.setState('move'); } };
function menuNav() {
  const btns = UI.menuBtns || []; if (inConsume('back') || inConsume('pause')) { synth('ui'); const m = UI.menuStack[UI.menuStack.length - 1]; if (m && m.onBack) m.onBack(); else UI.back(); return; }
  if (inConsume('down')) moveFocus(btns, 1); if (inConsume('up')) moveFocus(btns, -1);
  if (IN.lastDevice === 'pad' && inConsume('ok') && document.activeElement && document.activeElement.click) document.activeElement.click();
}
function moveFocus(btns, d) { if (!btns.length) return; const i = btns.indexOf(document.activeElement); btns[(i + d + btns.length) % btns.length].focus({ preventScroll: true }); synth('ui'); }
// ----- menus específicos -----
function openPause() { if (GAME.mode !== 'play') return; try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { } UI.menu(pauseMenu()); }
function pauseMenu() {
  return { build: () => ({ title: 'Pausa', sub: `${AREA_NAMES[GAME.areaId] || ''} · ${fmtTime(PROG.time)} · Nível ${PROG.level} · ${PROG.deaths} mortes`, items: [
    { label: 'Continuar', fn: UI.closeMenus }, { label: 'Equipamento', fn: () => UI.menu(equipMenu()) }, { label: 'Habilidades', fn: () => UI.menu(skillMenu()) }, { label: 'Inventário', fn: () => UI.menu(invMenu()) }, { label: 'Estado', fn: () => UI.menu(statusMenu()) },
    { label: 'Definições', fn: () => UI.menu(settingsMenu()) }, { label: 'Controlos', fn: () => UI.menu(controlsMenu()) }, { label: 'Guardar e sair', fn: () => { GAME.save(); GAME.toTitle(); } }] }) };
}
function bonfireMenu(bf) {
  return { onBack: () => GAME.leaveBonfire(), build: () => ({ title: bf.name, sub: 'Descansaste junto ao fogo. Os mortos voltaram a erguer-se.', items: [
    { label: 'Subir de nível', right: 'Nível ' + PROG.level, fn: () => UI.menu(levelMenu()) },
    { label: 'Viajar', fn: () => UI.menu(travelMenu()) },
    { label: 'Equipamento', fn: () => UI.menu(equipMenu()) }, { label: 'Habilidades', fn: () => UI.menu(skillMenu()) },
    { label: 'Partir', fn: () => GAME.leaveBonfire() }] }) };
}
const STAT_INFO = [['vig', 'Vigor', 'vida', () => STATS.maxHp()], ['men', 'Mente', 'foco', () => STATS.maxFp()], ['end', 'Fôlego', 'energia', () => STATS.maxStam()], ['str', 'Força', 'dano da arma', () => Math.round(WEAPONS[PROG.weapon].dmg * STATS.str() * (1 + (PROG.wLvl[PROG.weapon] || 0) * .085))], ['fai', 'Fé', 'dano das habilidades', () => Math.round(100 * STATS.fai()) + '%']];
function levelMenu() {
  return { build: () => { const c = STATS.levelCost(), ok = PROG.cinzas >= c; return { title: 'Subir de nível', sub: `Nível ${PROG.level} · Cinzas ${PROG.cinzas} · Custo ${c}`, items: STAT_INFO.map(([k, n, d, f], i) => ({ label: n, right: `${10 + PROG[k]} · ${d} ${f()}`, off: !ok, fn: () => { if (PROG.cinzas < STATS.levelCost()) { synth('ui'); return; } PROG.cinzas -= STATS.levelCost(); UI.cShown = PROG.cinzas; PROG[k]++; PROG.level++; PLAYER.hp = STATS.maxHp(); PLAYER.fp = STATS.maxFp(); PLAYER.stam = STATS.maxStam(); sfx('levelup', { vol: .7 }); GAME.save(); renderMenu(i); } })).concat([{ label: 'Voltar', fn: UI.back }]) }; } };
}
function travelMenu() {
  return { build: () => { const list = Object.entries(BONFIRE_LIST).filter(([id]) => PROG.bonfires[id]); return { title: 'Viajar', sub: 'Fogueiras acesas', items: list.map(([id, b]) => ({ label: b.name, right: AREA_NAMES[b.area], sel: id === PROG.lastBonfire, fn: () => { UI.closeMenus(); GAME.warpTo(id); } })).concat([{ label: 'Voltar', fn: UI.back }]) }; } };
}
function equipMenu() {
  return { build: () => ({ title: 'Equipamento', sub: 'Arma e talismãs', items: PROG.weapons.map(w => { const it = Object.values(ITEMS).find(i => i.wid === w) || { name: 'Espada Longa' }; return { label: it.name, right: '+' + (PROG.wLvl[w] || 0), sel: PROG.weapon === w, fn: () => { PROG.weapon = w; PLAYER.applyWeapon(); UI.rerender(); } }; })
    .concat([{ label: 'Talismã I', right: PROG.talEq[0] ? ITEMS[PROG.talEq[0]].name.replace('Talismã ', '') : 'vazio', fn: () => UI.menu(talMenu(0)) }, { label: 'Talismã II', right: PROG.talEq[1] ? ITEMS[PROG.talEq[1]].name.replace('Talismã ', '') : 'vazio', fn: () => UI.menu(talMenu(1)) }, { label: 'Voltar', fn: UI.back }]) }) };
}
function talMenu(slot) {
  return { build: () => ({ title: 'Talismã ' + (slot ? 'II' : 'I'), items: [{ label: 'Nenhum', fn: () => { PROG.talEq[slot] = null; UI.back(); } }].concat(PROG.tals.map(t => ({ label: ITEMS[t].name, desc: ITEMS[t].desc, sel: PROG.talEq[slot] === t, off: PROG.talEq[1 - slot] === t, fn: () => { if (PROG.talEq[1 - slot] === t) return; PROG.talEq[slot] = t; PLAYER.hp = Math.min(PLAYER.hp, STATS.maxHp()); UI.back(); } }))).concat([{ label: 'Voltar', fn: UI.back }]) }) };
}
function skillMenu() {
  return { build: () => ({ title: 'Habilidades', sub: PROG.skills.length ? 'Escolhe a habilidade ativa.' : 'Ainda não aprendeste nenhuma. Explora: cada região esconde uma.', items: PROG.skills.map((s, i) => { const it = Object.values(ITEMS).find(x => x.sid === s); return { label: shortSkill(it.name), desc: it.desc, right: SKILLS[s].fp ? SKILLS[s].fp + ' foco' : '', sel: PROG.skillIdx === i, fn: () => { PROG.skillIdx = i; UI.rerender(); } }; }).concat([{ label: 'Voltar', fn: UI.back }]) }) };
}
function invMenu() {
  return { build: () => { const keys = Object.keys(PROG.items).filter(k => PROG.items[k] > 0 && ITEMS[k]); return { title: 'Inventário', sub: `Fragmentos de Brasa: ${PROG.items.fragmento || 0}`, items: keys.map(k => ({ label: ITEMS[k].name + (PROG.items[k] > 1 ? ' ×' + PROG.items[k] : ''), fn: () => UI.menu({ build: () => ({ title: ITEMS[k].name, html: '<p><i>' + ITEMS[k].desc + '</i></p>', items: [{ label: 'Voltar', fn: UI.back }] }) }) })).concat([{ label: 'Voltar', fn: UI.back }]) }; } };
}
function statusMenu() {
  return { build: () => ({ title: 'Estado', html: `<p>Nível ${PROG.level} · Cinzas ${PROG.cinzas}</p><p>Vida ${STATS.maxHp()} · Foco ${STATS.maxFp()} · Energia ${STATS.maxStam()}</p><p>Vigor ${10 + PROG.vig} · Mente ${10 + PROG.men} · Fôlego ${10 + PROG.end} · Força ${10 + PROG.str} · Fé ${10 + PROG.fai}</p><p>Frascos ${PROG.flaskMax} (cura ${STATS.flaskHeal()}) · Brasas ${Object.keys(PROG.bossDown).length}/6 · Cartas ${PROG.letters}/3</p>`, items: [{ label: 'Voltar', fn: UI.back }] }) };
}
function smithMenu() {
  return { build: () => { const w = PROG.weapon, lv = PROG.wLvl[w] || 0, cost = lv < 10 ? 1 + Math.floor(lv / 3) : 0, have = PROG.items.fragmento || 0; const it = Object.values(ITEMS).find(i => i.wid === w) || { name: 'Espada Longa' }; return { title: 'Hrolf, o Ferreiro', sub: `Fragmentos: ${have}`, items: [
    { label: `Reforçar ${it.name}`, right: lv >= 10 ? 'máximo' : `+${lv} → +${lv + 1} · ${cost} frag.`, off: lv >= 10 || have < cost, fn: () => { if (lv >= 10 || have < cost) { synth('ui'); return; } PROG.items.fragmento -= cost; PROG.wLvl[w] = lv + 1; sfx('hit_mace', { vol: .8 }); after(.25, () => sfx('hit_mace', { vol: .7, rate: 1.1 })); after(.5, () => sfx('levelup', { vol: .5 })); GAME.save(); UI.rerender(); } },
    { label: 'Falar', fn: () => { UI.closeMenus(); WORLD.npcs.hrolf && WORLD.npcs.hrolf.chat(); } }, { label: 'Sair', fn: UI.closeMenus }] }; } };
}
function settingsMenu() {
  const qn = { low: 'baixa', medium: 'média', high: 'alta' };
  return { build: () => ({ title: 'Definições', items: [
    { label: 'Qualidade gráfica', right: qn[SET.quality], fn: () => { SET.quality = SET.quality === 'low' ? 'medium' : SET.quality === 'medium' ? 'high' : 'low'; saveSettings(); UI.toast('A qualidade muda ao recarregar a página.'); UI.rerender(); } },
    { label: 'Sensibilidade da câmara', right: SET.camSens.toFixed(1), fn: () => { SET.camSens = SET.camSens >= 2 ? .4 : +(SET.camSens + .2).toFixed(1); saveSettings(); UI.rerender(); } },
    { label: 'Inverter eixo vertical', right: SET.invertY ? 'sim' : 'não', fn: () => { SET.invertY = !SET.invertY; saveSettings(); UI.rerender(); } },
    { label: 'Câmara automática', right: SET.autoCam ? 'sim' : 'não', fn: () => { SET.autoCam = !SET.autoCam; saveSettings(); UI.rerender(); } },
    { label: 'Música', right: Math.round(SET.music * 100) + '%', fn: () => { SET.music = SET.music >= 1 ? 0 : +(SET.music + .25).toFixed(2); saveSettings(); applyVolumes(); UI.rerender(); } },
    { label: 'Efeitos sonoros', right: Math.round(SET.sfx * 100) + '%', fn: () => { SET.sfx = SET.sfx >= 1 ? 0 : +(SET.sfx + .25).toFixed(2); saveSettings(); applyVolumes(); UI.rerender(); } },
    { label: 'Falas narradas', right: SET.voices ? 'sim' : 'não', desc: 'Usa a voz do teu aparelho para ler as falas.', fn: () => { SET.voices = !SET.voices; saveSettings(); UI.rerender(); } },
    { label: 'Legendas', right: SET.subtitles ? 'sim' : 'não', fn: () => { SET.subtitles = !SET.subtitles; saveSettings(); UI.rerender(); } },
    { label: 'Números de dano', right: SET.dmgNumbers ? 'sim' : 'não', fn: () => { SET.dmgNumbers = !SET.dmgNumbers; saveSettings(); UI.rerender(); } },
    { label: 'Vibração', right: SET.vibrate ? 'sim' : 'não', fn: () => { SET.vibrate = !SET.vibrate; saveSettings(); UI.rerender(); } },
    { label: 'Voltar', fn: UI.back }] }) };
}
function controlsMenu() {
  return { build: () => ({ title: 'Controlos', html: `<h3>Toque</h3><p>Arrasta no lado esquerdo para andar e no direito para mover a câmera. Espada: atacar · martelo: ataque pesado (segura para carregar) · seta circular: rolar (segura para correr) · seta para cima: saltar · estrela: habilidade (a seta pequena troca) · frasco: curar · alvo: travar mira (desliza para trocar de alvo).</p>
    <h3>Teclado e rato</h3><p>WASD andar · rato: câmera (clica para capturar) · clique esquerdo ou J: atacar · clique direito ou K: pesado · Espaço: rolar/correr · F: saltar · C: habilidade · Tab ou roda: trocar habilidade · R: frasco · Q: travar mira · Z/X: trocar alvo · E: interagir · Esc: pausa · setas: câmera.</p>
    <h3>Comando</h3><p>RB atacar · RT pesado · B rolar/correr · A saltar · LB habilidade · LT trocar habilidade · X frasco · Y interagir · R3 travar mira · Start pausa.</p>`, items: [{ label: 'Voltar', fn: UI.back }] }) };
}
function creditsMenu() {
  return { build: () => ({ title: 'Créditos', wide: true, html: `<p>Último Lume: jogo, história e arte procedural. Feito com three.js (MIT).</p>
    <h3>Música</h3><p>Battle for Wesnoth (GPL v2+ / CC BY-SA 4.0): Jeremy Nicoll (Nunc Dimittis, Vengeful), Aleksi Aubry-Carlson (Underground), Doug Kaufman (The City Falls), Timothy Pinkham (Wanderer), Gianmarco Leone (The Deep Path, The Dangerous Symphony), Mattias Westlund (The King is Dead, Legends of the North, Journey's End, Return to Wesnoth), Tyler Johnson (Into the Shadows), Tomek Szczęsny (Undead Siege), Stephen Rozanc (Northerners, Frantic), Ryan Reilly (Knalgan Theme), Doug Kaufman (Siege of Laurelmor), Aleksi Aubry-Carlson (Transience).</p>
    <p>Flare (CC BY-SA 3.0 / CC BY 3.0): remaxim (Safe Room Theme, Boss Theme), Brandon Morris (Creepy Forest, Osare Song 1).</p>
    <h3>Vozes e sons</h3><p>Battle for Wesnoth: Lari Nieminen e colaboradores (GPL v2+). Flare: remaxim, Brandon Morris, Bart K, Iwan Gabovitch, Ljudbank, Henrik Andersson, Mike Koenig, Justin Jacobs e outros (CC0, CC BY, CC BY-SA). Lista completa em CREDITS.md.</p>`, items: [{ label: 'Voltar', fn: UI.back }] }) };
}
function fmtTime(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + 'h ' : '') + m + 'min'; }
