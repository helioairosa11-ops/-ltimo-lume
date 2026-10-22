// ===================== NÚCLEO =====================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const V3 = THREE.Vector3, QT = THREE.Quaternion, EU = THREE.Euler, M4 = THREE.Matrix4, COL = THREE.Color;
const PI = Math.PI, TAU = Math.PI * 2, HPI = Math.PI / 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[(Math.random() * arr.length) | 0];
const sstep = t => t * t * (3 - 2 * t);
const easeOut = t => 1 - (1 - t) * (1 - t);
const easeIn = t => t * t;
const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
function angDiff(a, b) { let d = (b - a) % TAU; if (d > PI) d -= TAU; if (d < -PI) d += TAU; return d; }
function turnTo(cur, target, maxStep) { const d = angDiff(cur, target); return cur + clamp(d, -maxStep, maxStep); }
function dampAngle(a, b, lambda, dt) { return a + angDiff(a, b) * (1 - Math.exp(-lambda * dt)); }
const dist2 = (ax, az, bx, bz) => Math.hypot(bx - ax, bz - az);
const yawTo = (ax, az, bx, bz) => Math.atan2(bx - ax, bz - az); // yaw 0 = +Z
function hash2(x, y) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  json(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
};
const IS_TOUCH = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window);
const IS_MOBILE = IS_TOUCH && Math.min(screen.width, screen.height) < 820;
const _v1 = new V3(), _v2 = new V3(), _v3 = new V3(), _q1 = new QT(), _q2 = new QT(), _e1 = new EU(), _m1 = new M4();
const UP = new V3(0, 1, 0);

// Relógio de jogo (com câmera lenta / hitstop)
const TIME = { now: 0, real: 0, scale: 1, hitstop: 0, slowT: 0, slowScale: 1 };
function hitStop(s) { TIME.hitstop = Math.max(TIME.hitstop, s); }
function slowMo(scale, dur) { TIME.slowScale = scale; TIME.slowT = dur; }

// Agendador simples (em tempo de jogo)
const TIMERS = [];
function after(t, fn) { const o = { t, fn }; TIMERS.push(o); return o; }
function cancelTimer(o) { const i = TIMERS.indexOf(o); if (i >= 0) TIMERS.splice(i, 1); }
function updTimers(dt) { for (let i = TIMERS.length - 1; i >= 0; i--) { const x = TIMERS[i]; x.t -= dt; if (x.t <= 0) { TIMERS.splice(i, 1); try { x.fn(); } catch (e) { console.error(e); } } } }

// Eventos
const BUS = { h: {}, on(n, f) { (this.h[n] = this.h[n] || []).push(f); }, emit(n, ...a) { (this.h[n] || []).forEach(f => f(...a)); } };
