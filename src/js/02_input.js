// ===================== ENTRADA (teclado, comando, toque) =====================
// Ações: left right up down jump attack dash heavy spell next heal interact pause inv ok back
const IN = { held: {}, buf: {}, holdStart: {}, ax: 0, ay: 0, touch: IS_TOUCH, lastDevice: IS_TOUCH ? 'touch' : 'kb', pad: null, padPrev: [], stick: { id: null, ox: 0, oy: 0, x: 0, y: 0 } };
function inPress(a) { if (!IN.held[a]) { IN.buf[a] = TIME.real; IN.holdStart[a] = TIME.real; } IN.held[a] = true; }
function inRelease(a) { if (IN.held[a]) IN.buf[a + '_up'] = TIME.real; IN.held[a] = false; }
function inConsume(a, w = 0.16) { const t = IN.buf[a]; if (t !== undefined && TIME.real - t <= w) { delete IN.buf[a]; return true; } return false; }
function inPeek(a, w = 0.16) { const t = IN.buf[a]; return t !== undefined && TIME.real - t <= w; }
function inHeld(a) { return !!IN.held[a]; }
function inHeldTime(a) { return IN.held[a] ? TIME.real - (IN.holdStart[a] || TIME.real) : 0; }
function inClear() { for (const k in IN.buf) delete IN.buf[k]; }
function inReleaseAll() { for (const k in IN.held) IN.held[k] = false; IN.stick.id = null; IN.ax = IN.ay = 0; }
const KEYMAP = {
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  Space: 'jump', KeyZ: 'jump', KeyJ: 'attack', KeyX: 'attack', KeyK: 'dash', KeyC: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash',
  KeyL: 'heavy', KeyV: 'heavy', KeyF: 'spell', KeyU: 'spell', KeyQ: 'next', Tab: 'next', KeyR: 'heal', KeyH: 'heal',
  KeyE: 'interact', KeyI: 'inv', Escape: 'pause', KeyP: 'pause', Enter: 'ok', Backspace: 'back'
};
function setDevice(d) { if (IN.lastDevice === d) return; IN.lastDevice = d; IN.touch = d === 'touch'; document.body.classList.toggle('touch', IN.touch); BUS.emit && BUS.emit('device', d); }
function initInput() {
  document.body.classList.toggle('touch', IN.touch);
  addEventListener('keydown', e => {
    if (e.repeat) { if (KEYMAP[e.code] && GAME.mode === 'play') e.preventDefault(); return; }
    setDevice('kb'); audioUnlock();
    const a = KEYMAP[e.code]; if (!a) return;
    if (GAME.mode === 'play' || ['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    inPress(a);
    if (a === 'jump' || a === 'attack') inPress('ok');
    if (a === 'pause' || a === 'dash') inPress('back');
    if (e.code === 'Escape') inPress('back');
  });
  addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (!a) return; inRelease(a); if (a === 'jump' || a === 'attack') inRelease('ok'); if (a === 'pause' || a === 'dash' || e.code === 'Escape') inRelease('back'); });
  addEventListener('blur', inReleaseAll);
  // rato
  const cv = $('#cv');
  cv.addEventListener('mousedown', e => { if (IN.touch) return; setDevice('kb'); audioUnlock(); if (GAME.mode !== 'play') return; if (e.button === 0) inPress('attack'); if (e.button === 2) inPress('dash'); });
  addEventListener('mouseup', e => { if (e.button === 0) inRelease('attack'); if (e.button === 2) inRelease('dash'); });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  initTouch();
}
// ---------- toque ----------
function initTouch() {
  const tl = $('#touch'), stick = $('#stick'), knob = $('#knob');
  const onDown = e => {
    if (GAME.mode !== 'play') return;
    for (const t of e.changedTouches) {
      if (t.target.closest && t.target.closest('.tb,#prompt,.ib,#spell')) continue;
      if (t.clientX < innerWidth * .46 && IN.stick.id === null) {
        IN.stick.id = t.identifier; IN.stick.ox = t.clientX; IN.stick.oy = t.clientY; IN.stick.x = IN.stick.y = 0;
        stick.style.left = t.clientX + 'px'; stick.style.top = t.clientY + 'px'; stick.classList.add('on'); knob.style.transform = '';
      }
    }
  };
  const onMove = e => {
    for (const t of e.changedTouches) if (t.identifier === IN.stick.id) {
      let dx = t.clientX - IN.stick.ox, dy = t.clientY - IN.stick.oy; const L = Math.hypot(dx, dy), R = 50;
      if (L > R * 1.6) { IN.stick.ox = t.clientX - dx / L * R * 1.6; IN.stick.oy = t.clientY - dy / L * R * 1.6; stick.style.left = IN.stick.ox + 'px'; stick.style.top = IN.stick.oy + 'px'; dx = t.clientX - IN.stick.ox; dy = t.clientY - IN.stick.oy; }
      const k = Math.min(1, Math.hypot(dx, dy) / R); IN.stick.x = dx / Math.max(1, Math.hypot(dx, dy)) * k; IN.stick.y = dy / Math.max(1, Math.hypot(dx, dy)) * k;
      knob.style.transform = `translate(${IN.stick.x * R}px,${IN.stick.y * R}px)`;
      if (IN.stick.y < -.62 && !IN._stickUp) { IN._stickUp = 1; inPress('up'); } else if (IN.stick.y > -.42 && IN._stickUp) { IN._stickUp = 0; inRelease('up'); }
    }
  };
  const onUp = e => { for (const t of e.changedTouches) if (t.identifier === IN.stick.id) { IN.stick.id = null; IN.stick.x = IN.stick.y = 0; stick.classList.remove('on'); knob.style.transform = ''; if (IN._stickUp) { IN._stickUp = 0; inRelease('up'); } } };
  addEventListener('touchstart', e => { setDevice('touch'); audioUnlock(); onDown(e); }, { passive: true });
  addEventListener('touchmove', e => { onMove(e); if (GAME.mode === 'play') e.preventDefault(); }, { passive: false });
  addEventListener('touchend', onUp); addEventListener('touchcancel', onUp);
  for (const b of $$('.tb[data-a]')) {
    const a = b.dataset.a;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); setDevice('touch'); audioUnlock(); inPress(a); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (_) { } vibrate(8); });
    const up = e => { inRelease(a); b.classList.remove('on'); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  }
}
// ---------- comando ----------
const PADMAP = { 0: 'jump', 1: 'dash', 2: 'attack', 3: 'spell', 4: 'next', 5: 'dash', 6: 'heal', 7: 'heavy', 8: 'inv', 9: 'pause', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
function pollPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : []; let p = null; for (const g of pads) if (g && g.connected) { p = g; break; }
  IN.pad = p; if (!p) return;
  for (let i = 0; i < p.buttons.length; i++) {
    const v = p.buttons[i].pressed, was = IN.padPrev[i]; IN.padPrev[i] = v; const a = PADMAP[i]; if (!a) continue;
    if (v && !was) { setDevice('pad'); audioUnlock(); inPress(a); if (i === 0 || i === 2) inPress('ok'); if (i === 1 || i === 9) inPress('back'); if (i === 3) inPress('interact'); }
    if (!v && was) { inRelease(a); if (i === 0 || i === 2) inRelease('ok'); if (i === 1 || i === 9) inRelease('back'); if (i === 3) inRelease('interact'); }
  }
  const ax = p.axes[0] || 0, ay = p.axes[1] || 0; IN.ax = Math.abs(ax) > .25 ? ax : 0; IN.ay = Math.abs(ay) > .3 ? ay : 0;
  if (Math.abs(ax) > .3 || Math.abs(ay) > .3) setDevice('pad');
  // eixos como direções para menus
  const dirs = [['left', ax < -.6], ['right', ax > .6], ['up', ay < -.6], ['down', ay > .6]];
  for (const [a, on] of dirs) { const k = '_ax_' + a; if (on && !IN[k]) { IN[k] = 1; inPress(a); } else if (!on && IN[k]) { IN[k] = 0; inRelease(a); } }
}
// eixo horizontal/vertical combinado
function axisX() { let x = 0; if (IN.held.left) x -= 1; if (IN.held.right) x += 1; if (IN.stick.id !== null) x += Math.abs(IN.stick.x) > .22 ? Math.sign(IN.stick.x) * Math.min(1, Math.abs(IN.stick.x) * 1.4) : 0; x += IN.ax; return clamp(x, -1, 1); }
function axisY() { let y = 0; if (IN.held.up) y -= 1; if (IN.held.down) y += 1; if (IN.stick.id !== null) y += IN.stick.y < -.55 ? -1 : IN.stick.y > .55 ? 1 : 0; y += IN.ay > .5 ? 1 : IN.ay < -.5 ? -1 : 0; return clamp(y, -1, 1); }
function vibrate(ms) { if (SET.vibrate && navigator.vibrate && IN.touch) try { navigator.vibrate(ms); } catch (e) { } }
// barramento de eventos simples
const BUS = { h: {}, on(n, f) { (this.h[n] = this.h[n] || []).push(f); }, emit(n, ...a) { (this.h[n] || []).forEach(f => f(...a)); } };
