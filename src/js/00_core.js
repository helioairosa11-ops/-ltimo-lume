// ===================== NÚCLEO =====================
'use strict';
const PI = Math.PI, TAU = PI * 2, HPI = PI / 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, v) => (v - a) / (b - a);
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const sstep = t => t * t * (3 - 2 * t);
const smooth = (a, b, x) => sstep(clamp((x - a) / (b - a), 0, 1));
const easeOut = t => 1 - (1 - t) * (1 - t);
const easeIn = t => t * t;
const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutBack = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const approach = (v, t, d) => v < t ? Math.min(v + d, t) : Math.max(v - d, t);
const sign = v => v < 0 ? -1 : 1;
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; if (d < -PI) d += TAU; return d; };
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function vnoise(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash2(i, seed), hash2(i + 1, seed), u); }
function vnoise2(x, y, seed = 0) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); const a = hash2(ix + seed * 131, iy), b = hash2(ix + 1 + seed * 131, iy), c = hash2(ix + seed * 131, iy + 1), d = hash2(ix + 1 + seed * 131, iy + 1); return lerp(lerp(a, b, u), lerp(c, d, u), v); }
function fbm2(x, y, oct = 4, seed = 0) { let s = 0, a = .5, n = 0; for (let i = 0; i < oct; i++) { s += a * vnoise2(x, y, seed + i * 7); n += a; a *= .5; x *= 2.03; y *= 2.03; } return s / n; }
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const txt = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  json(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
};
const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);
const IS_MOBILE = IS_TOUCH && Math.min(screen.width, screen.height) < 820;
// tempo
const TIME = { now: 0, real: 0, dt: 0, dtReal: 0, hitstop: 0, slowT: 0, slowScale: 1 };
function hitStop(s) { TIME.hitstop = Math.max(TIME.hitstop, s); }
function slowMo(scale, dur) { TIME.slowScale = scale; TIME.slowT = dur; }
// temporizadores no tempo de jogo
const TIMERS = [];
function after(t, fn) { const o = { t, fn }; TIMERS.push(o); return o; }
function cancelTimer(o) { const i = TIMERS.indexOf(o); if (i >= 0) TIMERS.splice(i, 1); }
function updTimers(dt) { for (let i = TIMERS.length - 1; i >= 0; i--) { const x = TIMERS[i]; if (!x) continue; x.t -= dt; if (x.t <= 0) { TIMERS.splice(i, 1); try { x.fn(); } catch (e) { console.error(e); } } } }
// cores
function hexRGB(h) { return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; }
function rgba(h, a = 1) { const [r, g, b] = hexRGB(h); return `rgba(${r},${g},${b},${a})`; }
function mixHex(a, b, t) { const A = hexRGB(a), B = hexRGB(b); return (Math.round(lerp(A[0], B[0], t)) << 16) | (Math.round(lerp(A[1], B[1], t)) << 8) | Math.round(lerp(A[2], B[2], t)); }
function shade(h, k) { const [r, g, b] = hexRGB(h); const f = v => clamp(Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)), 0, 255); return (f(r) << 16) | (f(g) << 8) | f(b); }
const css = h => '#' + h.toString(16).padStart(6, '0');
