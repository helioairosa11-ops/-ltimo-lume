// ===================== ENTRADA =====================
const IN = { mx: 0, my: 0, lookX: 0, lookY: 0, held: {}, buf: {}, holdStart: {}, touch: IS_TOUCH, plock: false, padOn: false, lastDevice: IS_TOUCH ? 'touch' : 'kb', stick: { id: null, ox: 0, oy: 0, x: 0, y: 0 }, cam: { id: null, x: 0, y: 0, sx: 0, sy: 0, t: 0 }, swipe: 0 };
function inPress(a) { IN.buf[a] = TIME.real; IN.held[a] = true; IN.holdStart[a] = TIME.real; }
function inRelease(a) { IN.held[a] = false; IN.buf[a + '_up'] = TIME.real; }
function inConsume(a, w = 0.22) { const t = IN.buf[a]; if (t !== undefined && TIME.real - t <= w) { delete IN.buf[a]; return true; } return false; }
function inPeek(a, w = 0.22) { const t = IN.buf[a]; return t !== undefined && TIME.real - t <= w; }
function inHeld(a) { return !!IN.held[a]; }
function inHeldTime(a) { return IN.held[a] ? TIME.real - (IN.holdStart[a] || TIME.real) : 0; }
function inClear() { for (const k in IN.buf) delete IN.buf[k]; }
const KEYMAP = {
  KeyJ: 'atk', KeyK: 'heavy', Space: 'roll', ShiftLeft: 'roll', ShiftRight: 'roll', KeyF: 'jump', KeyE: 'interact', KeyR: 'flask', KeyQ: 'lock', KeyL: 'lock',
  KeyC: 'skill', KeyU: 'skill', Tab: 'skillNext', KeyV: 'skillNext', Escape: 'pause', KeyP: 'pause', Enter: 'ok', KeyZ: 'lockL', KeyX: 'lockR'
};
const KEYS = {};
function setDevice(d) { if (IN.lastDevice === d) return; IN.lastDevice = d; IN.touch = d === 'touch'; document.body.classList.toggle('touch', IN.touch); BUS.emit('device', d); }
function initInput() {
  document.body.classList.toggle('touch', IN.touch);
  addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (!e.repeat) setDevice('kb');
    const a = KEYMAP[e.code];
    if (a || e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Tab') e.preventDefault();
    if (e.repeat) return;
    KEYS[e.code] = true;
    if (a) inPress(a);
    if (e.code === 'ArrowUp' || e.code === 'KeyW') inPress('up');
    if (e.code === 'ArrowDown' || e.code === 'KeyS') inPress('down');
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') inPress('left');
    if (e.code === 'ArrowRight' || e.code === 'KeyD') inPress('right');
    if (e.code === 'Escape' || e.code === 'Backspace') inPress('back');
    if (e.code === 'Space' || e.code === 'Enter') inPress('ok');
  });
  addEventListener('keyup', e => { KEYS[e.code] = false; const a = KEYMAP[e.code]; if (a) inRelease(a); });
  addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; for (const k in IN.held) IN.held[k] = false; });
  const cv = $('#cv');
  cv.addEventListener('mousedown', e => {
    if (IN.touch && e.pointerType === 'touch') return;
    setDevice('kb');
    if (GAME.mode === 'play' && !IN.plock && !IS_TOUCH) { try { cv.requestPointerLock(); } catch (er) { } return; }
    if (e.button === 0) inPress('atk'); else if (e.button === 2) inPress('heavy'); else if (e.button === 1) { e.preventDefault(); inPress('lock'); }
  });
  addEventListener('mouseup', e => { if (e.button === 0) inRelease('atk'); else if (e.button === 2) inRelease('heavy'); });
  addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('wheel', e => { if (GAME.mode === 'play') { inPress(e.deltaY > 0 ? 'skillNext' : 'skillPrev'); } }, { passive: true });
  addEventListener('mousemove', e => {
    if (IN.plock) { IN.lookX += e.movementX * 0.0024 * SET.camSens; IN.lookY += e.movementY * 0.0024 * SET.camSens * (SET.invertY ? -1 : 1); }
  });
  document.addEventListener('pointerlockchange', () => {
    IN.plock = document.pointerLockElement === cv;
    if (!IN.plock && GAME.mode === 'play' && !IS_TOUCH) openPause();
  });
  initTouch();
}
// ---------- toque ----------
function initTouch() {
  const layer = $('#tlayer'), stickEl = $('#stick'), knob = $('#knob');
  const placeStick = (x, y) => { stickEl.style.left = x + 'px'; stickEl.style.top = y + 'px'; };
  IN.resetStick = () => { if (IN.stick.id === null) placeStick(Math.max(90, R.w * .13), R.h - Math.max(100, R.h * .27)); };
  IN.resetStick();
  addEventListener('resize', () => IN.resetStick());
  layer.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault(); setDevice('touch'); audioUnlock();
    if (e.clientX < R.w * 0.42 && IN.stick.id === null) {
      IN.stick.id = e.pointerId; IN.stick.ox = e.clientX; IN.stick.oy = e.clientY; placeStick(e.clientX, e.clientY); stickEl.classList.add('on');
    } else if (IN.cam.id === null) {
      IN.cam.id = e.pointerId; IN.cam.x = e.clientX; IN.cam.y = e.clientY; IN.cam.sx = e.clientX; IN.cam.sy = e.clientY; IN.cam.t = TIME.real; IN.swipe = 0;
    }
    try { layer.setPointerCapture(e.pointerId); } catch (er) { }
  });
  layer.addEventListener('pointermove', e => {
    if (e.pointerId === IN.stick.id) {
      const Rr = 46; let dx = e.clientX - IN.stick.ox, dy = e.clientY - IN.stick.oy; const l = Math.hypot(dx, dy);
      if (l > Rr) { IN.stick.ox += dx / l * (l - Rr); IN.stick.oy += dy / l * (l - Rr); dx = e.clientX - IN.stick.ox; dy = e.clientY - IN.stick.oy; placeStick(IN.stick.ox, IN.stick.oy); }
      const m = Math.hypot(dx, dy) / Rr; IN.stick.x = m > .15 ? dx / Rr : 0; IN.stick.y = m > .15 ? dy / Rr : 0;
      knob.style.transform = `translate(${dx}px,${dy}px)`;
    } else if (e.pointerId === IN.cam.id) {
      const dx = e.clientX - IN.cam.x, dy = e.clientY - IN.cam.y; IN.cam.x = e.clientX; IN.cam.y = e.clientY;
      const k = 0.0062 * SET.camSens;
      if (PLAYER && PLAYER.lock) { IN.swipe += dx; if (Math.abs(IN.swipe) > 55 && TIME.real - IN.cam.t < 0.6) { inPress(IN.swipe > 0 ? 'lockR' : 'lockL'); IN.swipe = 0; IN.cam.t = -9; } }
      else { IN.lookX += dx * k; IN.lookY += dy * k * (SET.invertY ? -1 : 1); }
    }
  });
  const end = e => {
    if (e.pointerId === IN.stick.id) { IN.stick.id = null; IN.stick.x = IN.stick.y = 0; knob.style.transform = ''; stickEl.classList.remove('on'); IN.resetStick(); }
    if (e.pointerId === IN.cam.id) { IN.cam.id = null; }
  };
  layer.addEventListener('pointerup', end); layer.addEventListener('pointercancel', end);
  // botões
  for (const el of $$('.tb[data-a]')) {
    const a = el.dataset.a;
    el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); setDevice('touch'); audioUnlock(); inPress(a); el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (er) { } if (SET.vibrate && navigator.vibrate) try { navigator.vibrate(8); } catch (er) { } });
    const off = e => { el.classList.remove('on'); inRelease(a); };
    el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off);
  }
}
// ---------- comando ----------
const PAD = { prev: [], ax: [0, 0, 0, 0] };
function pollPad() {
  let g = null;
  try { const gp = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of gp) if (p && p.connected) { g = p; break; } } catch (e) { }
  if (!g) { PAD.ax = [0, 0, 0, 0]; return; }
  const dz = v => Math.abs(v) < 0.18 ? 0 : v;
  PAD.ax = [dz(g.axes[0] || 0), dz(g.axes[1] || 0), dz(g.axes[2] || 0), dz(g.axes[3] || 0)];
  const b = g.buttons.map(x => x.pressed || x.value > 0.5);
  const map = { 0: 'jump', 1: 'roll', 2: 'flask', 3: 'interact', 4: 'skill', 5: 'atk', 6: 'skillNext', 7: 'heavy', 9: 'pause', 11: 'lock', 14: 'lockL', 15: 'lockR' };
  const menuMap = { 0: 'ok', 1: 'back', 12: 'up', 13: 'down', 14: 'left', 15: 'right', 9: 'pause' };
  let any = false;
  b.forEach((p, i) => {
    if (p && !PAD.prev[i]) { any = true; if (map[i]) inPress(map[i]); if (menuMap[i]) inPress(menuMap[i]); }
    if (!p && PAD.prev[i]) { if (map[i]) inRelease(map[i]); }
  });
  if (any || PAD.ax.some(v => v)) setDevice('pad');
  PAD.prev = b;
  if (PAD.ax[2] || PAD.ax[3]) { IN.lookX += PAD.ax[2] * 2.6 * SET.camSens * TIME.dtReal; IN.lookY += PAD.ax[3] * 1.8 * SET.camSens * TIME.dtReal * (SET.invertY ? -1 : 1); }
  // navegação por analógico nos menus
  const ly = PAD.ax[1];
  if (Math.abs(ly) > .6) { if (!PAD.navT || TIME.real - PAD.navT > .25) { inPress(ly > 0 ? 'down' : 'up'); PAD.navT = TIME.real; } } else PAD.navT = 0;
}
// vetor de movimento (x: direita, y: frente)
function moveInput() {
  let x = 0, y = 0;
  if (KEYS.KeyA) x--; if (KEYS.KeyD) x++; if (KEYS.KeyW) y++; if (KEYS.KeyS) y--;
  const l = Math.hypot(x, y); if (l > 0) { x /= l; y /= l; }
  x += IN.stick.x + PAD.ax[0]; y += -IN.stick.y - PAD.ax[1];
  const L = Math.hypot(x, y); if (L > 1) { x /= L; y /= L; }
  return { x, y, l: Math.min(1, L) };
}
function lookInput(dt) {
  // setas do teclado giram a câmera
  if (KEYS.ArrowLeft) IN.lookX -= 2.2 * dt * SET.camSens; if (KEYS.ArrowRight) IN.lookX += 2.2 * dt * SET.camSens;
  if (KEYS.ArrowUp) IN.lookY -= 1.4 * dt * SET.camSens; if (KEYS.ArrowDown) IN.lookY += 1.4 * dt * SET.camSens;
  const r = [IN.lookX, IN.lookY]; IN.lookX = 0; IN.lookY = 0; return r;
}
function vibrate(ms) { if (SET.vibrate && IN.touch && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } }
