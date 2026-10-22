// ===================== INTERFACE: HUD, diálogos, menus, inventário =====================
const UI = { el: {}, hpShow: 1, hpLag: 1, bLag: 1, cShown: 0, toastT: 0, tutT: 0, subT: 0, comboT: 0, stack: [], tab: 'inv', sel: null };
function initUI() {
  const ids = ['hud', 'hpb', 'hpf', 'hpl', 'flasks', 'spell', 'cN', 'cgain', 'combo', 'bInv', 'bPause', 'boss', 'bname', 'bfill', 'blag', 'bpost', 'tut', 'toast', 'area', 'banner', 'btitle', 'subs', 'touch', 'prompt', 'pkey', 'ptext', 'dialog', 'dwho', 'dtext', 'itembox', 'iicon', 'iname', 'idesc', 'menu', 'fade', 'title', 'intro', 'itext', 'ending', 'eTitle', 'eText', 'eStats', 'hurt', 'flashL', 'orbc', 'rot'];
  for (const id of ids) UI.el[id] = document.getElementById(id);
  const E = UI.el;
  E.prompt.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); inPress('interact'); setTimeout(() => inRelease('interact'), 60); });
  E.bPause.addEventListener('click', e => { e.stopPropagation(); audioUnlock(); if (GAME.mode === 'play') openPause(UI.lastTab || 'inv'); });
  E.bInv.addEventListener('click', e => { e.stopPropagation(); audioUnlock(); if (GAME.mode === 'play') openPause('inv'); });
  E.spell.addEventListener('pointerdown', e => { e.stopPropagation(); cycleSkill(); });
  E.spell.style.pointerEvents = 'auto';
  E.dialog.addEventListener('click', () => inPress('ok'));
  E.itembox.addEventListener('click', () => inPress('ok'));
  $('#tNew').onclick = () => { audioUnlock(); if (GAME.hasSave()) { UI.menu(confirmMenu('Começar de novo?', 'O progresso guardado será apagado.', () => { UI.closeMenus(); GAME.newGame(); })); } else GAME.newGame(); };
  $('#tContinue').onclick = () => { audioUnlock(); GAME.continueGame(); };
  $('#tSettings').onclick = () => { audioUnlock(); UI.menu(settingsMenu()); };
  $('#tControls').onclick = () => { audioUnlock(); UI.menu(controlsMenu()); };
  $('#tCredits').onclick = () => { audioUnlock(); UI.menu(creditsMenu()); };
  $('#iskip').onclick = () => GAME.endIntro();
  E.intro.addEventListener('click', e => { if (e.target.id !== 'iskip') GAME.introNext(); });
  $('#eBack').onclick = () => GAME.toTitle();
  $('#rotGo').onclick = () => { UI.rotOk = true; E.rot.hidden = true; };
  E.title.addEventListener('click', () => audioUnlock());
  BUS.on('device', () => UI.rerender && UI.stack.length && UI.rerender());
}
// ---------- HUD ----------
UI.update = (dt) => {
  const E = UI.el, p = PLAYER, inGame = (GAME.mode === 'play' || GAME.mode === 'dialog' || GAME.mode === 'menu') && p;
  E.hud.hidden = !inGame; E.bPause.hidden = !inGame || GAME.mode !== 'play'; E.bInv.hidden = E.bPause.hidden; E.touch.hidden = !(inGame && IN.touch && GAME.mode === 'play');
  E.rot.hidden = !(IN.touch && innerHeight > innerWidth && !UI.rotOk && (GAME.mode === 'play' || GAME.mode === 'title'));
  if (!inGame) { E.prompt.hidden = true; return; }
  const mh = STATS.maxHp(); const hp = clamp(p.hp / mh, 0, 1);
  UI.hpShow = hp; UI.hpLag = UI.hpLag > hp ? Math.max(hp, UI.hpLag - dt * .45) : hp;
  E.hpb.style.width = Math.round(150 + Math.min(130, (mh - 100) * .9)) + 'px';
  E.hpf.style.transform = `scaleX(${hp})`; E.hpl.style.transform = `scaleX(${UI.hpLag})`;
  // frascos
  const fl = PROG.flasks + '/' + PROG.flaskMax; if (UI._fl !== fl) { UI._fl = fl; E.flasks.innerHTML = Array.from({ length: PROG.flaskMax }, (_, i) => `<span class="${i < PROG.flasks ? '' : 'e'}"></span>`).join(''); }
  // habilidade
  const sk = curSkill(); txt(E.spell, sk ? '⟳ ' + SKILLS[sk].name + (SKILLS[sk].fp ? ' · ' + SKILLS[sk].fp : '') : '');
  // cinzas
  UI.cShown = UI.cShown < PROG.cinzas ? Math.min(PROG.cinzas, UI.cShown + Math.max(1, (PROG.cinzas - UI.cShown) * dt * 6)) : PROG.cinzas; txt(E.cN, String(Math.round(UI.cShown)));
  if (UI.gainT > 0) { UI.gainT -= dt; if (UI.gainT <= 0) E.cgain.style.opacity = 0; }
  // orbe de foco
  drawOrb(p.fp / STATS.maxFp());
  // combo
  if (UI.comboT > 0) { UI.comboT -= dt; if (UI.comboT <= 0) E.combo.classList.remove('show'); }
  // chefe
  const b = GAME.boss; if (b && b.alive && b.barOn) { E.boss.hidden = false; const f = clamp(b.hp / b.maxHp, 0, 1); UI.bLag = UI.bLag > f ? Math.max(f, UI.bLag - dt * .3) : f; E.bfill.style.transform = `scaleX(${f})`; E.blag.style.transform = `scaleX(${UI.bLag})`; E.bpost.style.transform = `scaleX(${clamp(b.posture / b.postureMax, 0, 1)})`; } else if (!b || !b.alive) E.boss.hidden = true;
  // pedido de interação
  const it = GAME.mode === 'play' ? GAME.interact : null; E.prompt.hidden = !it; if (it) { txt(E.ptext, it.label); txt(E.pkey, IN.lastDevice === 'pad' ? 'Y' : IN.touch ? '✋' : 'E'); }
  // textos temporários
  if (UI.toastT > 0) { UI.toastT -= dt; if (UI.toastT <= 0) E.toast.classList.remove('show'); }
  if (UI.tutT > 0) { UI.tutT -= dt; if (UI.tutT <= 0) E.tut.classList.remove('show'); }
  if (UI.subT > 0) { UI.subT -= dt; if (UI.subT <= 0) E.subs.classList.remove('show'); }
  // efeitos de ecrã
  if (UI.hurtA > 0) { UI.hurtA -= dt * 1.8; E.hurt.style.opacity = Math.max(0, UI.hurtA); }
  const low = p.alive && p.hp < mh * .25; E.hurt.style.opacity = Math.max(UI.hurtA || 0, low ? .25 + Math.sin(G.t * 4) * .1 : 0);
  if (UI.flashA > 0) { UI.flashA -= dt * 2.5; E.flashL.style.opacity = Math.max(0, UI.flashA); }
};
function drawOrb(k) {
  const c = UI.el.orbc, x = c.getContext('2d'), S = 108, t = G.t; x.clearRect(0, 0, S, S);
  x.save(); x.beginPath(); x.arc(54, 54, 42, 0, TAU); x.fillStyle = 'rgba(0,0,0,.6)'; x.fill(); x.clip();
  const lvl = 96 - k * 84; const g = x.createLinearGradient(0, lvl, 0, 100); g.addColorStop(0, 'rgba(220,235,255,.95)'); g.addColorStop(1, 'rgba(120,160,230,.9)'); x.fillStyle = g;
  x.beginPath(); x.moveTo(0, 108); for (let i = 0; i <= 108; i += 4) x.lineTo(i, lvl + Math.sin(i * .12 + t * 3) * 2.5); x.lineTo(108, 108); x.fill(); x.restore();
  x.lineWidth = 4; x.strokeStyle = 'rgba(230,220,200,.8)'; x.beginPath(); x.arc(54, 54, 44, 0, TAU); x.stroke();
  x.fillStyle = '#e6dcc8'; x.beginPath(); x.ellipse(54, 54, 20, 18, 0, 0, TAU); x.globalAlpha = .12; x.fill(); x.globalAlpha = 1;
  if (k >= SKILLS[curSkill() || 'arco'].fp / STATS.maxFp() && curSkill()) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = .25 + Math.sin(t * 4) * .1; x.drawImage(glowSpr(0x9ac0ff), 10, 10, 88, 88); }
}
UI.toast = (s, d = 2.6) => { const e = UI.el.toast; e.textContent = s; e.classList.add('show'); UI.toastT = d; };
UI.tut = (html, d = 6) => { const e = UI.el.tut; e.innerHTML = html; e.classList.add('show'); UI.tutT = d; };
UI.areaTitle = (n, s) => { const e = UI.el.area; e.querySelector('.n').textContent = n; e.querySelector('.s').textContent = s || ''; e.classList.add('show'); clearTimeout(UI._at); UI._at = setTimeout(() => e.classList.remove('show'), 3800); };
UI.bigBanner = (t, cls, d = 3.5) => { const e = UI.el.banner; e.className = 'layer ' + cls; e.firstElementChild.textContent = t; void e.offsetWidth; e.classList.add('show'); clearTimeout(UI._bt); UI._bt = setTimeout(() => e.classList.remove('show'), d * 1000); };
UI.bossTitle = (n, t, e2, phase) => { const e = UI.el.btitle; e.querySelector('.n').textContent = n; e.querySelector('.t').textContent = t || ''; e.querySelector('.e').textContent = e2 || ''; e.classList.toggle('phase', !!phase); e.classList.add('show'); clearTimeout(UI._btt); UI._btt = setTimeout(() => e.classList.remove('show'), 3400); };
UI.subtitle = (who, l, d = 4, voice) => { const e = UI.el.subs; e.querySelector('.w').textContent = who; e.querySelector('.l').textContent = l; if (SET.subtitles) { e.classList.add('show'); UI.subT = d; } if (voice) voxSay(voice, Math.min(10, 3 + Math.round(l.length / 14))); };
UI.hurt = () => { UI.hurtA = .8; };
UI.flash = (a = .6) => { UI.flashA = a; };
UI.flaskEmpty = () => { UI.toast('Sem Frascos de Lume.', 1.4); synth('ui'); };
UI.flaskUsed = () => { };
UI.noFp = () => { UI.toast('Foco insuficiente. Golpeia inimigos para encher o orbe.', 1.6); synth('ui'); };
UI.skillChanged = () => { const s = curSkill(); if (s) UI.toast(SKILLS[s].name, 1.2); };
UI.gainCinzas = (n) => { const e = UI.el.cgain; e.textContent = '+' + n; e.style.opacity = 1; UI.gainT = 2; };
UI.combo = (n) => { if (n < 3) return; const e = UI.el.combo; e.querySelector('.n').textContent = n; e.classList.add('show'); e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); UI.comboT = 1.4; };
UI.bossBar = (b) => { UI.el.bname.textContent = b.barName || b.name; UI.bLag = 1; UI.el.boss.hidden = false; };
// ---------- diálogo (palavra a palavra, com voz de balbucio) ----------
const DLG = { lines: [], i: 0, cb: null, voice: null, t: 0, words: 0, shown: 0 };
UI.dialog = (who, lines, cb, o = {}) => {
  GAME.setMode('dialog'); DLG.lines = lines; DLG.i = 0; DLG.cb = cb; DLG.voice = o.voice; UI.el.dwho.textContent = who; UI.el.dwho.hidden = !who; UI.el.dialog.hidden = false; UI.el.itembox.hidden = true; dlgShow();
};
function dlgShow() {
  const l = DLG.lines[DLG.i]; const words = l.split(/(\s+)/); UI.el.dtext.innerHTML = words.map(w => /\s+/.test(w) ? w : `<span>${w.replace(/</g, '&lt;')}</span>`).join('');
  DLG.spans = [...UI.el.dtext.querySelectorAll('span')]; DLG.shown = 0; DLG.t = 0; DLG.t0 = TIME.real;
  if (DLG.voice && l.length > 2 && l !== '...') voxSay(DLG.voice, Math.min(11, 2 + Math.round(l.length / 12)), { ask: l.trim().endsWith('?') });
}
function dlgUpdate(dt) {
  if (!DLG.spans) return; DLG.t += dt; const n = Math.min(DLG.spans.length, Math.floor(DLG.t * 26));
  while (DLG.shown < n) DLG.spans[DLG.shown++].classList.add('v');
  if (TIME.real - DLG.t0 < .15) { inConsume('ok'); inConsume('interact'); inConsume('attack'); return; }
  if (inConsume('ok') || inConsume('interact') || inConsume('attack') || inConsume('jump')) {
    if (DLG.shown < DLG.spans.length) { DLG.spans.forEach(s => s.classList.add('v')); DLG.shown = DLG.spans.length; DLG.t = 99; return; }
    DLG.i++; synth('ui');
    if (DLG.i >= DLG.lines.length) { UI.el.dialog.hidden = true; UI.el.itembox.hidden = true; DLG.spans = null; GAME.setMode('play'); const cb = DLG.cb; DLG.cb = null; cb && cb(); }
    else dlgShow();
  }
}
UI.itemBox = (id, cb, kick = 'Obtido', extra = '') => {
  const it = ITEMS[id] || { name: id, desc: '' }; GAME.setMode('dialog'); DLG.lines = ['']; DLG.i = 0; DLG.cb = cb; DLG.voice = null; DLG.spans = []; DLG.t = 99; DLG.t0 = TIME.real;
  UI.el.itembox.querySelector('.kick').textContent = kick; UI.el.iname.textContent = it.name; UI.el.idesc.innerHTML = esc(it.desc) + (extra ? `<span class="how">${extra}</span>` : '');
  drawIcon(UI.el.iicon, id); UI.el.itembox.hidden = false; UI.el.dialog.hidden = true;
};
UI.lore = (t, x) => { GAME.setMode('dialog'); DLG.lines = ['']; DLG.i = 0; DLG.cb = null; DLG.spans = []; DLG.t = 99; DLG.t0 = TIME.real; UI.el.itembox.querySelector('.kick').textContent = 'Inscrição'; UI.el.iname.textContent = t; UI.el.idesc.innerHTML = esc(x).replace(/\n/g, '<br>'); const c = UI.el.iicon; c.getContext('2d').clearRect(0, 0, 128, 128); drawIcon(c, '_tablet'); UI.el.itembox.hidden = false; UI.el.dialog.hidden = true; synth('ui'); };
UI.message = (t) => UI.dialog('', ['«' + t + '»'], null);
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
// ---------- ícones dos itens (desenhados) ----------
function drawIcon(cv, id) {
  const it = ITEMS[id] || {}; const x = cv.getContext('2d'), S = cv.width; x.setTransform(S / 64, 0, 0, S / 64, 0, 0); x.clearRect(0, 0, 64, 64);
  const c0 = it.c || 0xe0d8c8, kind = id === '_tablet' ? 'tablet' : it.icon;
  x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = .35; x.drawImage(glowSpr(c0), 4, 4, 56, 56); x.restore();
  x.fillStyle = css(c0); x.strokeStyle = css(shade(c0, -.45)); x.lineWidth = 2; x.lineJoin = 'round';
  const P = (pts) => { x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.closePath(); x.fill(); x.stroke(); };
  switch (kind) {
    case 'brasa': P([32, 10, 46, 28, 40, 50, 24, 50, 18, 28]); x.fillStyle = 'rgba(255,255,255,.6)'; P([32, 16, 38, 28, 32, 40, 27, 28]); break;
    case 'chave': x.beginPath(); x.arc(22, 22, 9, 0, TAU); x.lineWidth = 5; x.strokeStyle = css(c0); x.stroke(); x.fillRect(28, 28, 22, 5); x.fillRect(42, 33, 4, 8); x.fillRect(48, 33, 3, 6); break;
    case 'carta': x.save(); x.translate(32, 32); x.rotate(-.15); x.fillRect(-16, -20, 32, 40); x.strokeRect(-16, -20, 32, 40); x.fillStyle = 'rgba(80,60,40,.6)'; for (let i = 0; i < 5; i++) x.fillRect(-11, -13 + i * 6, 22 - (i % 2) * 6, 1.6); x.fillStyle = '#a02a20'; x.beginPath(); x.arc(0, 15, 4, 0, TAU); x.fill(); x.restore(); break;
    case 'lagrima': x.beginPath(); x.moveTo(32, 10); x.quadraticCurveTo(48, 34, 42, 44); x.arc(32, 42, 11, 0, PI); x.quadraticCurveTo(16, 34, 32, 10); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.ellipse(28, 38, 3, 6, -.4, 0, TAU); x.fill(); break;
    case 'cinza': case 'cinzas': x.beginPath(); x.ellipse(32, 44, 18, 8, 0, 0, TAU); x.fill(); x.stroke(); x.beginPath(); x.moveTo(18, 44); x.quadraticCurveTo(32, 14, 46, 44); x.fill(); x.fillStyle = 'rgba(255,200,120,.8)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(24 + i * 6, 38 - (i % 2) * 6, 1.6, 0, TAU); x.fill(); } break;
    case 'fragmento': P([28, 12, 44, 24, 36, 52, 20, 40]); x.fillStyle = 'rgba(255,240,200,.7)'; P([30, 20, 38, 26, 33, 40]); break;
    case 'espada': case 'montante': x.save(); x.translate(32, 32); x.rotate(-.8); x.fillRect(-2.5, -26, 5, 38); x.strokeRect(-2.5, -26, 5, 38); x.fillStyle = '#6a5038'; x.fillRect(-10, 12, 20, 4); x.fillRect(-2, 16, 4, 10); x.restore(); break;
    case 'machado': x.save(); x.translate(32, 32); x.rotate(-.6); x.fillStyle = '#6a5038'; x.fillRect(-2, -24, 4, 50); x.fillStyle = css(c0); x.beginPath(); x.moveTo(2, -20); x.quadraticCurveTo(22, -24, 20, -4); x.quadraticCurveTo(10, -6, 2, -4); x.fill(); x.stroke(); x.restore(); break;
    case 'adagas': for (const s of [-1, 1]) { x.save(); x.translate(32 + s * 6, 32); x.rotate(s * .5); x.fillRect(-2, -20, 4, 26); x.strokeRect(-2, -20, 4, 26); x.fillStyle = '#6a5038'; x.fillRect(-6, 6, 12, 3); x.fillRect(-1.5, 9, 3, 8); x.fillStyle = css(c0); x.restore(); } break;
    case 'arco': x.beginPath(); x.arc(24, 32, 22, -1.1, 1.1); x.lineWidth = 4; x.strokeStyle = css(c0); x.stroke(); x.lineWidth = 1; x.strokeStyle = '#ddd'; x.beginPath(); x.moveTo(34, 12); x.lineTo(34, 52); x.stroke(); x.fillStyle = '#ccc'; x.fillRect(16, 31, 30, 2); break;
    case 'fogo': x.beginPath(); x.moveTo(32, 8); x.quadraticCurveTo(48, 26, 44, 40); x.arc(32, 40, 12, 0, PI); x.quadraticCurveTo(16, 26, 26, 18); x.quadraticCurveTo(28, 30, 32, 8); x.fill(); x.stroke(); x.fillStyle = '#fff0c0'; x.beginPath(); x.arc(32, 42, 5, 0, TAU); x.fill(); break;
    case 'giro': x.lineWidth = 4; x.strokeStyle = css(c0); for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(32, 32, 8 + i * 7, i * 2, i * 2 + 4); x.stroke(); } break;
    case 'salto': P([32, 8, 40, 30, 36, 30, 36, 46, 28, 46, 28, 30, 24, 30]); x.fillRect(12, 50, 40, 4); break;
    case 'passo': x.globalAlpha = .4; P([12, 20, 30, 32, 12, 44]); x.globalAlpha = .7; P([22, 20, 40, 32, 22, 44]); x.globalAlpha = 1; P([32, 18, 52, 32, 32, 46]); break;
    case 'luz': P([10, 32, 44, 26, 56, 32, 44, 38]); x.fillStyle = '#fff'; P([18, 32, 44, 29, 50, 32, 44, 35]); break;
    case 'asas': for (const s of [-1, 1]) { x.save(); x.translate(32, 36); x.scale(s, 1); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(12, -26, 26, -20); x.quadraticCurveTo(22, -8, 26, -2); x.quadraticCurveTo(16, 0, 18, 8); x.quadraticCurveTo(8, 6, 0, 8); x.fill(); x.stroke(); x.restore(); } break;
    case 'talisma': x.beginPath(); x.arc(32, 36, 15, 0, TAU); x.fill(); x.stroke(); x.strokeStyle = '#d8b46a'; x.lineWidth = 2; x.beginPath(); x.moveTo(20, 12); x.quadraticCurveTo(32, 22, 44, 12); x.stroke(); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(32, 26); x.lineTo(38, 36); x.lineTo(32, 46); x.lineTo(26, 36); x.closePath(); x.fill(); break;
    case 'tablet': x.fillStyle = '#4a4650'; x.beginPath(); x.moveTo(16, 56); x.lineTo(16, 18); x.quadraticCurveTo(32, 4, 48, 18); x.lineTo(48, 56); x.fill(); x.fillStyle = '#9ac0ff'; for (let i = 0; i < 5; i++) x.fillRect(22, 22 + i * 6, 20 - (i % 2) * 6, 2); break;
    default: x.beginPath(); x.arc(32, 32, 12, 0, TAU); x.fill(); x.stroke();
  }
}
// ---------- sistema de menus (pilha) ----------
UI.menu = (def) => { if (!UI.stack.length) { GAME.prevMode = GAME.mode === 'menu' ? 'play' : GAME.mode; } UI.stack.push(def); GAME.setMode('menu'); renderMenu(); synth('ui'); };
UI.back = () => { const d = UI.stack[UI.stack.length - 1]; if (d && d.noBack) return; UI.stack.pop(); synth('ui'); if (d && d.onBack) d.onBack(); if (UI.stack.length) renderMenu(); else UI.closeMenus(); };
UI.closeMenus = () => { const top = UI.stack[UI.stack.length - 1]; UI.stack.length = 0; UI.el.menu.hidden = true; UI.el.menu.innerHTML = ''; if (GAME.mode === 'menu') GAME.setMode(GAME.prevMode === 'title' ? 'title' : GAME.prevMode === 'ending' ? 'ending' : 'play'); if (top && top.onClose) top.onClose(); };
UI.rerender = () => renderMenu(true);
function renderMenu(keepFocus) {
  const d = UI.stack[UI.stack.length - 1]; if (!d) return; const M = UI.el.menu; const fi = keepFocus ? [...M.querySelectorAll('button')].indexOf(document.activeElement) : -1;
  M.hidden = false; M.innerHTML = ''; M.className = 'layer'; const r = d.build();
  if (r.tabs) { renderTabs(M, r); }
  else {
    M.classList.add('center'); const panel = document.createElement('div'); panel.className = 'panel' + (r.wide ? ' wide' : ''); M.appendChild(panel);
    panel.innerHTML = `<h2>${r.title}</h2>${r.sub ? `<p class="sub">${r.sub}</p>` : ''}${r.html ? `<div class="copy">${r.html}</div>` : ''}`;
    for (const it of r.items || []) { const b = document.createElement('button'); b.className = 'mbtn' + (it.off ? ' off' : ''); b.innerHTML = `<span>${it.label}${it.desc ? `<span class="d">${it.desc}</span>` : ''}</span>${it.right !== undefined ? `<span class="r">${it.right}</span>` : ''}`; b.onclick = () => { if (it.off) { synth('ui'); return; } synth('uiok'); it.fn(); }; panel.appendChild(b); }
  }
  const btns = [...M.querySelectorAll('button')]; const f = btns[fi >= 0 ? Math.min(fi, btns.length - 1) : (r.focus || 0)];
  if (f && !IN.touch) f.focus({ preventScroll: true });
}
function menuNav() {
  if (inConsume('back') || inConsume('pause')) { UI.back(); return; }
  if (inConsume('inv')) { UI.closeMenus(); return; }
  const btns = [...UI.el.menu.querySelectorAll('button:not([disabled])')]; if (!btns.length) return;
  const i = btns.indexOf(document.activeElement);
  if (inConsume('down') || inConsume('right')) { btns[(i + 1 + btns.length) % btns.length].focus(); synth('ui'); }
  if (inConsume('up') || inConsume('left')) { btns[(i - 1 + btns.length) % btns.length].focus(); synth('ui'); }
  if (inConsume('next')) { const t = UI.el.menu.querySelector('.tab.on'); const tabs = [...UI.el.menu.querySelectorAll('.tab')]; if (t && tabs.length) tabs[(tabs.indexOf(t) + 1) % tabs.length].click(); }
  if ((inConsume('ok') || inConsume('interact')) && document.activeElement && btns.includes(document.activeElement)) document.activeElement.click();
}
function confirmMenu(title, sub, yes) { return { build: () => ({ title, sub, items: [{ label: 'Sim', fn: yes }, { label: 'Não', fn: UI.back }] }) }; }
// ---------- menu de pausa com separadores ----------
function openPause(tab = 'inv') { UI.tab = tab; UI.sel = null; UI.menu({ build: pauseBuild, onClose: () => { } }); }
const TABS = [['inv', 'Inventário'], ['eq', 'Equipamento'], ['sk', 'Habilidades'], ['map', 'Mapa'], ['jr', 'Diário'], ['st', 'Estado'], ['sys', 'Sistema']];
function pauseBuild() { return { tabs: true }; }
function renderTabs(M) {
  const close = document.createElement('button'); close.className = 'close'; close.textContent = '✕'; close.setAttribute('aria-label', 'Fechar'); close.onclick = () => UI.closeMenus(); M.appendChild(close);
  const tabs = document.createElement('div'); tabs.className = 'tabs'; M.appendChild(tabs);
  for (const [k, n] of TABS) { const b = document.createElement('button'); b.className = 'tab' + (UI.tab === k ? ' on' : ''); b.textContent = n; b.onclick = () => { UI.tab = UI.lastTab = k; UI.sel = null; synth('ui'); renderMenu(); }; tabs.appendChild(b); }
  const page = document.createElement('div'); page.className = 'page'; M.appendChild(page);
  ({ inv: pageInv, eq: pageEq, sk: pageSk, map: pageMap, jr: pageJr, st: pageSt, sys: pageSys })[UI.tab](page);
}
function detailHTML(id, extra = '') { const it = ITEMS[id]; if (!it) return ''; const catN = { brasas: 'Brasa', chaves: 'Chave', cartas: 'Carta', itens: 'Objeto', armas: 'Arma', habilidades: 'Habilidade', talismas: 'Talismã' }[it.cat] || ''; return `<div class="det"><canvas class="big" width="128" height="128" data-icon="${id}"></canvas><div class="dk">${catN}</div><div class="dn">${it.name}</div><div class="dd">${esc(it.desc)}</div>${extra}</div>`; }
function paintIcons(root) { root.querySelectorAll('canvas[data-icon]').forEach(c => drawIcon(c, c.dataset.icon)); }
function gridSection(left, title, ids, onSel, isEq) {
  const h = document.createElement('h3'); h.textContent = title; left.appendChild(h); const g = document.createElement('div'); g.className = 'grid'; left.appendChild(g);
  if (!ids.length) { const p = document.createElement('div'); p.className = 'slot empty'; g.appendChild(p); return; }
  for (const id of ids) { const b = document.createElement('button'); b.className = 'slot' + (UI.sel === id ? ' sel' : '') + (isEq && isEq(id) ? ' eq' : ''); b.innerHTML = `<canvas width="96" height="96" data-icon="${id}"></canvas>${(PROG.items[id] || 0) > 1 ? `<span class="q">${PROG.items[id]}</span>` : ''}`; b.setAttribute('aria-label', ITEMS[id].name); b.onclick = () => { UI.sel = id; onSel(id); }; b.onfocus = () => { if (UI.sel !== id) { UI.sel = id; showDet(id); } }; g.appendChild(b); }
}
let showDet = () => { };
function pageInv(page) {
  const left = document.createElement('div'), right = document.createElement('div'); left.className = 'left'; right.className = 'right'; page.append(left, right);
  const owned = Object.keys(PROG.items).filter(id => PROG.items[id] > 0 && ITEMS[id]);
  const cats = [['brasas', 'Brasas'], ['itens', 'Objetos'], ['chaves', 'Chaves'], ['cartas', 'Cartas']];
  showDet = (id) => { const it = ITEMS[id]; let ex = ''; if (it.use) ex = `<button class="act" id="useBtn">Usar (${PROG.items[id]})</button>`; if (id === 'fragmento') ex = `<div class="du">Tens ${PROG.items[id]}. Leva-os ao ferreiro Hrolf.</div>`; right.innerHTML = detailHTML(id, ex); paintIcons(right); const ub = right.querySelector('#useBtn'); if (ub) ub.onclick = () => { PROG.items[id]--; const n = it.n; PROG.cinzas += n; UI.gainCinzas(n); sfx('gold', { vol: .6 }); if (PROG.items[id] <= 0) { delete PROG.items[id]; UI.sel = null; } GAME.save(); renderMenu(true); }; left.querySelectorAll('.slot').forEach(s => s.classList.toggle('sel', s.querySelector('canvas').dataset.icon === id)); };
  for (const [k, n] of cats) gridSection(left, n, owned.filter(id => ITEMS[id].cat === k), showDet);
  const fl = document.createElement('div'); fl.className = 'stat'; fl.innerHTML = `<span>Frascos de Lume</span><span class="r">${PROG.flasks} / ${PROG.flaskMax}</span>`; left.appendChild(fl);
  const first = UI.sel && ITEMS[UI.sel] && PROG.items[UI.sel] ? UI.sel : owned[0]; if (first) { UI.sel = first; showDet(first); } else right.innerHTML = '<div class="det"><div class="dd">Ainda não encontraste nada. Explora, e lê tudo o que encontrares.</div></div>';
  paintIcons(left);
}
function pageEq(page) {
  const left = document.createElement('div'), right = document.createElement('div'); left.className = 'left'; right.className = 'right'; page.append(left, right);
  const wIds = PROG.weapons.map(w => 'w_' + w); const tIds = PROG.tals.slice();
  showDet = (id) => {
    const it = ITEMS[id]; let ex = '';
    if (it.wid) { const w = WEAPONS[it.wid]; ex = `<div class="du">Dano ${Math.round(w.dmg * STATS.str() * (1 + (PROG.wLvl[it.wid] || 0) * .1))} · Reforço +${PROG.wLvl[it.wid] || 0} · Golpes por série ${w.hits}</div>` + (PROG.weapon === it.wid ? '<div class="du">Equipada</div>' : `<button class="act" id="eqBtn">Equipar</button>`); }
    if (it.tid) { const on = PROG.talEq.includes(it.tid); ex = `<button class="act" id="eqBtn">${on ? 'Tirar' : 'Usar'}</button><div class="du">Talismãs em uso: ${PROG.talEq.filter(Boolean).length} / ${PROG.talEq.length}</div>`; }
    right.innerHTML = detailHTML(id, ex); paintIcons(right);
    const b = right.querySelector('#eqBtn'); if (b) b.onclick = () => {
      if (it.wid) { PROG.weapon = it.wid; synth('uiok'); }
      if (it.tid) { const i = PROG.talEq.indexOf(it.tid); if (i >= 0) PROG.talEq[i] = null; else { const j = PROG.talEq.indexOf(null); if (j >= 0) PROG.talEq[j] = it.tid; else { UI.toast('Não há espaço. Tira outro talismã primeiro.'); return; } } if (PLAYER) { PLAYER.maxHp = STATS.maxHp(); PLAYER.hp = Math.min(PLAYER.hp, PLAYER.maxHp); } }
      GAME.save(); renderMenu(true);
    };
    left.querySelectorAll('.slot').forEach(s => s.classList.toggle('sel', s.querySelector('canvas').dataset.icon === id));
  };
  gridSection(left, 'Armas', wIds, showDet, id => PROG.weapon === ITEMS[id].wid);
  gridSection(left, 'Talismãs', tIds, showDet, id => PROG.talEq.includes(id));
  const first = UI.sel && (wIds.includes(UI.sel) || tIds.includes(UI.sel)) ? UI.sel : wIds[0]; UI.sel = first; showDet(first); paintIcons(left);
}
function pageSk(page) {
  const left = document.createElement('div'), right = document.createElement('div'); left.className = 'left'; right.className = 'right'; page.append(left, right);
  const ids = PROG.skills.map(s => 'sk_' + s).concat(PROG.abil.asas ? ['asas'] : []);
  showDet = (id) => { const it = ITEMS[id]; let ex = ''; if (it.sid) { const S = SKILLS[it.sid]; ex = `<div class="du">${S.how}</div><div class="du">Custo: ${S.fp ? S.fp + ' de foco' : 'nenhum'}</div>` + (curSkill() === it.sid ? '<div class="du">Selecionada</div>' : '<button class="act" id="selBtn">Selecionar</button>'); } right.innerHTML = detailHTML(id, ex); paintIcons(right); const b = right.querySelector('#selBtn'); if (b) b.onclick = () => { PROG.skillIdx = PROG.skills.indexOf(it.sid); synth('uiok'); renderMenu(true); }; left.querySelectorAll('.slot').forEach(s => s.classList.toggle('sel', s.querySelector('canvas').dataset.icon === id)); };
  gridSection(left, 'Habilidades e capacidades', ids, showDet, id => ITEMS[id].sid === curSkill());
  const base = document.createElement('div'); base.innerHTML = `<h3>Técnicas do Desperto</h3>` + [['Série de golpes', 'Ataca várias vezes seguidas: o último golpe da série é mais forte.'], ['Golpe para cima / para baixo', 'Segura cima ou baixo ao atacar. Para baixo, no ar, ressaltas em inimigos e espinhos.'], ['Dash e esquiva', 'O dash torna-te invulnerável por um instante. Esquivar mesmo em cima de um golpe abranda o tempo.'], ['Investida', 'Ataca durante o dash para uma estocada longa.'], ['Golpe forte e Grande Golpe', 'Toca no golpe forte para um corte pesado. Segura (ou segura o ataque) para carregar o Grande Golpe.']].map(([a, b]) => `<div class="stat"><span>${a}</span></div><div class="dd" style="font-size:14px;margin:0 4px 6px">${b}</div>`).join(''); left.appendChild(base);
  if (ids.length) { const first = ids.includes(UI.sel) ? UI.sel : ids[0]; UI.sel = first; showDet(first); } else right.innerHTML = '<div class="det"><div class="dd">Cada área de Vesperal esconde uma habilidade. Procura-as.</div></div>';
  paintIcons(left);
}
function pageMap(page) {
  page.classList.add('one'); const left = document.createElement('div'); left.className = 'left'; page.appendChild(left);
  const cv = document.createElement('canvas'); cv.id = 'mapc'; left.appendChild(cv); left.style.minHeight = '200px';
  requestAnimationFrame(() => drawMap(cv));
}
function drawMap(cv) {
  const r = cv.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(10, r.width * dpr); cv.height = Math.max(10, r.height * dpr); const x = cv.getContext('2d');
  const seen = Object.keys(ROOMS).filter(id => PROG.map[id] && ROOMS[id].pos); if (!seen.length) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const id of seen) { const d = ROOMS[id], w = d.map[0].length, h = d.map.length; x0 = Math.min(x0, d.pos[0]); y0 = Math.min(y0, d.pos[1]); x1 = Math.max(x1, d.pos[0] + w); y1 = Math.max(y1, d.pos[1] + h); }
  const s = Math.min(cv.width / (x1 - x0 + 20), cv.height / (y1 - y0 + 16)); const ox = (cv.width - (x1 - x0) * s) / 2 - x0 * s, oy = (cv.height - (y1 - y0) * s) / 2 - y0 * s;
  for (const id of seen) {
    const d = ROOMS[id], w = d.map[0].length, h = d.map.length, X = ox + d.pos[0] * s, Y = oy + d.pos[1] * s; const th = THEMES[d.theme || d.area];
    x.fillStyle = rgba(th.mid, .55); x.strokeStyle = 'rgba(230,220,200,.55)'; x.lineWidth = 1;
    // desenha as células vazias (forma da sala)
    for (let ty = 0; ty < h; ty += 2) for (let tx = 0; tx < w; tx += 2) { const ch = d.map[ty][tx]; if (ch !== '#' && ch !== '%' && ch !== '&' && ch !== undefined) x.fillRect(X + tx * s, Y + ty * s, s * 2 + .5, s * 2 + .5); }
    x.strokeRect(X, Y, w * s, h * s);
    if (ROOM.cur && ROOM.cur.id === id && PLAYER) { x.fillStyle = '#ffb060'; x.beginPath(); x.arc(X + PLAYER.x / T * s, Y + PLAYER.y / T * s, 4 * dpr, 0, TAU); x.fill(); }
    for (const bid in BONFIRE_LIST) if (BONFIRE_LIST[bid].room === id && PROG.bonfires[bid]) { const b = BONFIRE_LIST[bid]; x.fillStyle = '#ff8a3a'; x.fillRect(X + b.tx * s - 3, Y + b.ty * s - 3, 6, 6); }
  }
  x.font = `${12 * dpr}px "EB Garamond",serif`; x.fillStyle = 'rgba(230,220,200,.7)'; x.textAlign = 'center';
  const areas = {}; for (const id of seen) { const d = ROOMS[id]; (areas[d.area] = areas[d.area] || []).push(d); }
  for (const a in areas) { let sx = 0, sy = 0, n = 0; for (const d of areas[a]) { sx += d.pos[0] + d.map[0].length / 2; sy += d.pos[1]; n++; } x.fillText(AREA_NAMES[a], ox + sx / n * s, oy + sy / n * s - 6 * dpr); }
}
function pageJr(page) {
  const left = document.createElement('div'), right = document.createElement('div'); left.className = 'left list'; right.className = 'right'; page.append(left, right);
  const add = (title, entries) => { const h = document.createElement('h3'); h.textContent = title; left.appendChild(h); if (!entries.length) { const p = document.createElement('div'); p.className = 'dd'; p.style.cssText = 'font-size:14px;color:var(--dim);margin:4px'; p.textContent = 'Nada ainda.'; left.appendChild(p); } for (const [id, name, txtv, right2] of entries) { const b = document.createElement('button'); b.className = 'li' + (UI.sel === id ? ' sel' : ''); b.innerHTML = `<span>${name}</span><span class="r">${right2 || ''}</span>`; const show = () => { UI.sel = id; left.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x === b)); right.innerHTML = `<div class="det"><div class="dn">${name}</div><div class="dd">${esc(txtv).replace(/\n/g, '<br>')}</div></div>`; }; b.onclick = show; b.onfocus = show; left.appendChild(b); } };
  add('Crónicas', Object.keys(LORE).filter(k => PROG.lore[k]).map(k => [k, LORE[k].t, LORE[k].x]));
  add('Chefes', Object.keys(BOSS_LORE).filter(k => PROG.bossDown[k]).map(k => [k, BOSSDEF[k] ? BOSSDEF[k].name : k, BOSS_LORE[k], 'vencido']));
  add('Bestiário', Object.keys(BESTIARY).filter(k => PROG.bestiary[k]).map(k => [k, EDEF[k] ? EDEF[k].name : k, BESTIARY[k], PROG.bestiary[k] + ' abatidos']));
  const first = left.querySelector('.li'); if (first) first.click(); else right.innerHTML = '<div class="det"><div class="dd">O diário enche-se à medida que lês inscrições, derrotas inimigos e vences chefes.</div></div>';
}
function pageSt(page) {
  page.classList.add('one'); const left = document.createElement('div'); left.className = 'left'; page.appendChild(left);
  const br = Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'brasas' && PROG.items[k]).length;
  const rows = [['Nível', PROG.level], ['Vigor', PROG.vig], ['Força', PROG.str], ['Fé', PROG.fai], ['Vida', STATS.maxHp()], ['Dano da arma', Math.round(STATS.wDmg())], ['Poder das habilidades', '×' + STATS.fai().toFixed(2)], ['Frascos de Lume', PROG.flaskMax], ['Brasas', br + ' / 6'], ['Cinzas', PROG.cinzas], ['Mortes', PROG.deaths], ['Tempo de jogo', fmtTime(PROG.time)], ['Área', AREA_NAMES[ROOM.cur ? ROOM.cur.area : 'crypt']]];
  left.innerHTML = '<h3>O Desperto</h3>' + rows.map(([a, b]) => `<div class="stat"><span>${a}</span><span class="r">${b}</span></div>`).join('');
}
function pageSys(page) {
  page.classList.add('one'); const left = document.createElement('div'); left.className = 'left'; page.appendChild(left);
  const items = [['Continuar', () => UI.closeMenus()], ['Definições', () => UI.menu(settingsMenu())], ['Controlos', () => UI.menu(controlsMenu())], ['Créditos', () => UI.menu(creditsMenu())], ['Guardar e sair', () => { GAME.save(); UI.closeMenus(); GAME.toTitle(); }]];
  for (const [l, f] of items) { const b = document.createElement('button'); b.className = 'mbtn'; b.innerHTML = `<span>${l}</span>`; b.onclick = () => { synth('uiok'); f(); }; left.appendChild(b); }
}
// ---------- fogueira ----------
function bonfireMenu(bf) {
  return {
    noBack: false, onBack: () => GAME.leaveBonfire(), onClose: () => GAME.leaveBonfire(), build: () => ({
      title: BONFIRE_LIST[bf.id] ? BONFIRE_LIST[bf.id].name : 'Fogueira', sub: 'Descansaste. A vida e os frascos voltaram, e os mortos também.', items: [
        { label: 'Subir de nível', right: 'Nível ' + PROG.level, fn: () => UI.menu(levelMenu()) },
        { label: 'Viajar', fn: () => UI.menu(travelMenu()), off: Object.keys(PROG.bonfires).length < 2 },
        { label: 'Equipamento e inventário', fn: () => { UI.tab = 'eq'; UI.menu({ build: pauseBuild }); } },
        { label: 'Partir', fn: () => UI.back() },
      ]
    })
  };
}
const STAT_INFO = { vig: ['Vigor', 'Mais vida.'], str: ['Força', 'Mais dano com as armas.'], fai: ['Fé', 'Habilidades mais fortes.'] };
function levelMenu() {
  return { build: () => { const c = STATS.levelCost(), ok = PROG.cinzas >= c; return { title: 'Subir de nível', sub: `Nível ${PROG.level} · Cinzas ${PROG.cinzas} · Custo ${c}`, items: Object.entries(STAT_INFO).map(([k, [n, d]]) => ({ label: n, desc: d, right: PROG[k], off: !ok, fn: () => { PROG.cinzas -= c; PROG[k]++; PROG.level++; sfx('levelup', { vol: .6 }); if (PLAYER) { PLAYER.maxHp = STATS.maxHp(); PLAYER.hp = PLAYER.maxHp; } GAME.save(); UI.rerender(); } })).concat([{ label: 'Voltar', fn: UI.back }]) }; } };
}
function travelMenu() { return { build: () => { const list = Object.entries(BONFIRE_LIST).filter(([id]) => PROG.bonfires[id]); return { title: 'Viajar', sub: 'Fogueiras acesas', items: list.map(([id, b]) => ({ label: b.name, right: AREA_NAMES[ROOMS[b.room].area], fn: () => { UI.closeMenus(); GAME.warpTo(id); } })).concat([{ label: 'Voltar', fn: UI.back }]) }; } }; }
function smithMenu() {
  return { build: () => { const w = PROG.weapon, lv = PROG.wLvl[w] || 0, cost = 1 + Math.floor(lv / 2), have = PROG.items.fragmento || 0; return { title: 'Hrolf, o ferreiro', sub: `${WEAPONS[w].name} +${lv} · Fragmentos: ${have}`, items: [{ label: lv >= 8 ? 'Já não dá para melhorar' : `Reforçar para +${lv + 1}`, right: lv >= 8 ? '' : cost + ' fragmentos', off: lv >= 8 || have < cost, fn: () => { PROG.items.fragmento -= cost; if (PROG.items.fragmento <= 0) delete PROG.items.fragmento; PROG.wLvl[w] = lv + 1; sfx('metal1', { vol: .8 }); sfx('metal2', { vol: .6, delay: .25 }); UI.toast('A lâmina está mais afiada.'); GAME.save(); UI.rerender(); } }, { label: 'Conversar', fn: () => { UI.closeMenus(); const h = ENTS.find(e => e.id === 'hrolf'); h && h.talk(); } }, { label: 'Sair', fn: UI.back }] }; } };
}
function settingsMenu() {
  const qn = { baixa: 'baixa', media: 'média', alta: 'alta' };
  const vol = v => Math.round(v * 100) + '%'; const step = v => v >= .99 ? 0 : Math.round((v + .25) * 4) / 4;
  return { build: () => ({ title: 'Definições', items: [
    { label: 'Qualidade gráfica', right: qn[SET.quality], desc: 'Baixa é mais leve para telemóveis mais antigos.', fn: () => { SET.quality = SET.quality === 'baixa' ? 'media' : SET.quality === 'media' ? 'alta' : 'baixa'; SET.qLocked = true; saveSettings(); resizeGfx(); ROOM.chunks.clear(); if (BG.kind) bgMake(BG.kind); UI.rerender(); } },
    { label: 'Música', right: vol(SET.music), fn: () => { SET.music = step(SET.music); saveSettings(); applyVolumes(); UI.rerender(); } },
    { label: 'Efeitos sonoros', right: vol(SET.sfx), fn: () => { SET.sfx = step(SET.sfx); saveSettings(); applyVolumes(); UI.rerender(); } },
    { label: 'Vozes das personagens', right: SET.voices ? 'sim' : 'não', desc: 'Balbucio em língua inventada, como em Hollow Knight.', fn: () => { SET.voices = !SET.voices; saveSettings(); applyVolumes(); if (SET.voices) voxSay('ione', 4); UI.rerender(); } },
    { label: 'Legendas dos chefes', right: SET.subtitles ? 'sim' : 'não', fn: () => { SET.subtitles = !SET.subtitles; saveSettings(); UI.rerender(); } },
    { label: 'Números de dano', right: SET.dmgNumbers ? 'sim' : 'não', fn: () => { SET.dmgNumbers = !SET.dmgNumbers; saveSettings(); UI.rerender(); } },
    { label: 'Tremor do ecrã', right: SET.shake ? 'sim' : 'não', fn: () => { SET.shake = !SET.shake; saveSettings(); UI.rerender(); } },
    { label: 'Vibração', right: SET.vibrate ? 'sim' : 'não', fn: () => { SET.vibrate = !SET.vibrate; saveSettings(); UI.rerender(); } },
    { label: 'Voltar', fn: UI.back },
  ] }) };
}
function controlsMenu() {
  const rows = IN.touch ? [['Andar e apontar', 'Arrasta no lado esquerdo do ecrã'], ['Atacar', 'Botão da espada (cima/baixo no comando para golpes verticais)'], ['Saltar', 'Seta para cima (segura para saltar mais alto)'], ['Dash / esquiva', 'Botão da seta com barra'], ['Golpe forte', 'Botão do martelo (segura para o Grande Golpe)'], ['Habilidade', 'Botão da chama · toca no nome para trocar'], ['Frasco', 'Botão do frasco'], ['Interagir', 'Toca no aviso que aparece'], ['Inventário / pausa', 'Botões no canto']]
    : IN.lastDevice === 'pad' ? [['Andar', 'Analógico esquerdo'], ['Atacar', 'X / □'], ['Saltar', 'A / ✕'], ['Dash / esquiva', 'B / ○ ou RB'], ['Golpe forte', 'RT (segura para carregar)'], ['Habilidade', 'Y / △ · LB troca'], ['Frasco', 'LT'], ['Interagir', 'Y / △ ou cima'], ['Inventário', 'Select'], ['Pausa', 'Start']]
      : [['Andar', 'A / D ou setas'], ['Olhar para cima / baixo', 'W / S'], ['Atacar', 'J, X ou clique'], ['Saltar', 'Espaço ou Z'], ['Dash / esquiva', 'K, C, Shift ou clique direito'], ['Golpe forte', 'L ou V (segura para carregar)'], ['Habilidade', 'F · Q ou Tab troca'], ['Frasco', 'R'], ['Interagir', 'E (ou W junto ao objeto)'], ['Inventário', 'I'], ['Pausa', 'Esc']];
  return { build: () => ({ title: 'Controlos', wide: true, html: rows.map(([a, b]) => `<div class="stat"><span>${a}</span><span class="r" style="color:var(--bone)">${b}</span></div>`).join(''), items: [{ label: 'Voltar', fn: UI.back }] }) };
}
function creditsMenu() {
  return { build: () => ({ title: 'Créditos', wide: true, html: `<p>Último Lume: jogo, história, personagens e cenários desenhados por código.</p>
    <h3>Música</h3><p>Battle for Wesnoth (GPL v2+ / CC BY-SA 4.0): Jeremy Nicoll, Aleksi Aubry-Carlson, Doug Kaufman, Timothy Pinkham, Gianmarco Leone, Mattias Westlund, Tyler Johnson, Tomek Szczęsny, Stephen Rozanc, Ryan Reilly e outros. Flare (CC BY-SA 3.0 / CC BY 3.0): remaxim, Brandon Morris.</p>
    <h3>Sons</h3><p>Battle for Wesnoth (GPL v2+) e Flare (CC0, CC BY, CC BY-SA): Lari Nieminen, remaxim, Brandon Morris, Bart K, Iwan Gabovitch e outros. As vozes das personagens são sintetizadas pelo jogo. Lista completa por ficheiro em CREDITS.md.</p>`, items: [{ label: 'Voltar', fn: UI.back }] }) };
}
function fmtTime(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + 'h ' : '') + m + 'min'; }
