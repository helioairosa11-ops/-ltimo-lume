// ===================== ÁUDIO =====================
const SFX_FILES = /*SFX_LIST*/[];
const AU = { ctx: null, buf: {}, loading: {}, base: 'audio/', unlocked: false };
function audioUnlock() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = new C(); AU.ctx = c;
    AU.master = c.createGain(); AU.master.connect(c.destination);
    AU.comp = c.createDynamicsCompressor(); AU.comp.threshold.value = -10; AU.comp.ratio.value = 4; AU.comp.connect(AU.master);
    AU.music = c.createGain(); AU.music.connect(AU.master);
    AU.sfxBus = c.createGain(); AU.sfxBus.connect(AU.comp);
    AU.voxBus = c.createGain(); AU.voxBus.connect(AU.comp);
    AU.amb = c.createGain(); AU.amb.connect(AU.master);
    // eco suave para vozes etéreas
    AU.echo = c.createDelay(1); AU.echo.delayTime.value = .19; const fb = c.createGain(); fb.gain.value = .32; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    AU.echo.connect(lp); lp.connect(fb); fb.connect(AU.echo); const ew = c.createGain(); ew.gain.value = .55; lp.connect(ew); ew.connect(AU.voxBus);
    applyVolumes();
    const len = c.sampleRate, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; AU.noise = b;
    AU.unlocked = true;
    SFX_FILES.forEach(n => loadBuf('s/' + n));
    MD.retry();
    const t = $('#tsnd'); if (t) t.hidden = true;
  } catch (e) { AU.ctx = null; }
}
function applyVolumes() { if (!AU.ctx) return; const t = AU.ctx.currentTime; AU.music.gain.setTargetAtTime(SET.music * 0.9, t, .05); AU.sfxBus.gain.setTargetAtTime(SET.sfx, t, .05); AU.voxBus.gain.setTargetAtTime(SET.voices ? SET.sfx * 1.1 : 0, t, .05); AU.amb.gain.setTargetAtTime(SET.sfx * 0.8, t, .05); }
function loadBuf(path) {
  if (path in AU.buf) return Promise.resolve(AU.buf[path]);
  if (AU.loading[path]) return AU.loading[path];
  const c = AU.ctx; if (!c) return Promise.resolve(null);
  const p = fetch(AU.base + path + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(ab => new Promise((res, rej) => c.decodeAudioData(ab, res, rej)))
    .then(b => { AU.buf[path] = b; return b; }).catch(() => { AU.buf[path] = null; return null; });
  AU.loading[path] = p; return p;
}
// som com posição no mundo (atenuação e panorâmica pela câmara)
function sfx(name, o = {}) {
  const c = AU.ctx; if (!c) return null; const b = AU.buf['s/' + name]; if (!b) return null;
  let vol = o.vol ?? 1, pan = 0;
  if (o.x !== undefined) {
    const dx = o.x - CAM.x, dy = (o.y ?? CAM.y) - CAM.y, d = Math.hypot(dx, dy * 1.3), hw = CAM.w * .5;
    const mx = o.max || hw * 2.4; if (d > mx) return null;
    vol *= clamp(1 - Math.max(0, d - hw * .7) / (mx - hw * .7), 0, 1); pan = clamp(dx / (hw * 1.3), -1, 1) * .7;
  }
  if (vol < 0.01) return null;
  const s = c.createBufferSource(); s.buffer = b;
  s.playbackRate.value = (o.rate || 1) * (o.jit ? rnd(1 - o.jit, 1 + o.jit) : 1);
  const g = c.createGain(); g.gain.value = vol;
  let node = s; node.connect(g); node = g;
  if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; node.connect(p); node = p; }
  node.connect(o.bus || AU.sfxBus); s.start(c.currentTime + (o.delay || 0)); return s;
}
const SFXCD = {};
function sfxCD(name, cd, o) { const t = SFXCD[name] || 0; if (TIME.real < t) return null; SFXCD[name] = TIME.real + cd; return sfx(name, o); }
function sfxAny(names, o) { return sfx(pick(names), o); }
function at(e, v = 1, extra) { return Object.assign({ x: e.x, y: e.y - (e.h || 0) / 2, vol: v }, extra || {}); }
// síntese
function tone(o) {
  const c = AU.ctx; if (!c) return; const t0 = c.currentTime + (o.delay || 0); const osc = c.createOscillator(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t0); if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t0 + o.dur);
  const g = c.createGain(); const v = Math.max(.0002, o.vol || .2); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + (o.a || .005)); g.gain.exponentialRampToValueAtTime(.0001, t0 + o.dur);
  let n = osc; if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; osc.connect(f); n = f; } n.connect(g); g.connect(o.dest || AU.sfxBus); osc.start(t0); osc.stop(t0 + o.dur + .05);
}
function noise(o) {
  const c = AU.ctx; if (!c) return; const t0 = c.currentTime + (o.delay || 0); const s = c.createBufferSource(); s.buffer = AU.noise; const f = c.createBiquadFilter(); f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f || 1000, t0); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur); f.Q.value = o.q || .7;
  const g = c.createGain(); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, o.vol || .2), t0 + (o.a || .005)); g.gain.exponentialRampToValueAtTime(.0001, t0 + o.dur);
  s.connect(f); f.connect(g); g.connect(o.dest || AU.sfxBus); s.start(t0, Math.random() * .5); s.stop(t0 + o.dur + .05);
}
function synth(n, v = 1) {
  if (!AU.ctx) return;
  switch (n) {
    case 'dash': noise({ ft: 'bandpass', f: 2400, f2: 500, q: 1.2, dur: .22, vol: .22 * v, a: .01 }); break;
    case 'jump': noise({ ft: 'bandpass', f: 900, f2: 1600, q: 1, dur: .1, vol: .07 * v }); break;
    case 'land': noise({ f: 300, f2: 100, dur: .14, vol: .22 * v }); tone({ f: 90, f2: 50, dur: .1, vol: .14 * v }); break;
    case 'boom': tone({ f: 70, f2: 28, dur: .6, vol: .55 * v }); noise({ f: 500, f2: 70, dur: .5, vol: .35 * v }); break;
    case 'whoosh': noise({ ft: 'bandpass', f: 1800, f2: 400, q: 1.1, dur: .2, vol: .2 * v, a: .03 }); break;
    case 'charge': tone({ type: 'triangle', f: 300, f2: 900, dur: .5, vol: .06 * v, a: .1 }); break;
    case 'charged': tone({ type: 'triangle', f: 1200, dur: .25, vol: .09 * v }); tone({ f: 1800, dur: .3, vol: .05 * v, delay: .04 }); break;
    case 'ui': tone({ f: 520, dur: .06, vol: .05 }); break;
    case 'uiok': tone({ f: 660, dur: .08, vol: .06 }); tone({ f: 990, dur: .1, vol: .05, delay: .05 }); break;
    case 'bonfire': noise({ f: 200, f2: 1400, dur: 1.1, vol: .28, a: .2 }); [220, 277, 330].forEach((f, i) => tone({ type: 'triangle', f, dur: 2.2, vol: .06, a: .4, delay: .1 * i })); break;
    case 'death': tone({ type: 'sawtooth', f: 98, f2: 32, dur: 2.6, vol: .2, lp: 500, a: .05 }); tone({ f: 55, f2: 30, dur: 2, vol: .4 }); break;
    case 'victory': [[220, 0], [277, .05], [330, .1], [440, .2], [554, .35]].forEach(([f, d]) => tone({ type: 'triangle', f, dur: 3.8, vol: .08, a: .5, delay: d })); noise({ f: 300, f2: 2000, dur: 2.5, vol: .12, a: .8 }); break;
    case 'item': tone({ f: 880, dur: .3, vol: .07 }); tone({ f: 1320, dur: .45, vol: .06, delay: .08 }); break;
    case 'parry': tone({ type: 'square', f: 1800, f2: 900, dur: .12, vol: .08, lp: 4000 }); noise({ ft: 'highpass', f: 3000, dur: .1, vol: .2 }); break;
    case 'perfect': tone({ type: 'sine', f: 1400, f2: 2200, dur: .35, vol: .08 }); noise({ ft: 'highpass', f: 5000, dur: .25, vol: .08, a: .02 }); break;
    case 'heartbeat': tone({ f: 60, f2: 40, dur: .15, vol: .3 }); tone({ f: 55, f2: 38, dur: .15, vol: .25, delay: .22 }); break;
    case 'fog': noise({ f: 300, f2: 1200, dur: .9, vol: .15, a: .3 }); break;
    case 'clang': tone({ type: 'square', f: 2200, f2: 1300, dur: .14, vol: .06, lp: 5000 }); tone({ type: 'triangle', f: 3300, dur: .25, vol: .04 }); break;
    case 'pogo': tone({ type: 'triangle', f: 500, f2: 900, dur: .08, vol: .06 }); break;
  }
}
// ---------- música ----------
const MD = { want: undefined, cur: null, vol: { title: .9, hub: .6, crypt: .6, walls: .55, swamp: .55, forest: .55, forge: .5, cathedral: .55, heart: .6, b_odile: .8, b_tobias: .8, b_brigid: .8, b_vesper: .8, b_orin: .8, b_selene: .8, b_hilde: .75, b_ozias: .8, b_aldric: .8, b_sera1: .85, b_sera2: .85, b_sera3: .9, end_lume: .85, end_cinza: .85, end_filha: .85 } };
function music(name, fade = 1.8) {
  if (MD.want === name) return; MD.want = name; if (!AU.ctx) return;
  if (!name) { mdFade(fade); return; }
  loadBuf('m/' + name).then(b => { if (MD.want !== name) return; mdFade(fade * .8); if (b) mdStart(name, b, fade); });
}
MD.retry = () => { const w = MD.want; MD.want = undefined; if (w) music(w); };
function mdStart(name, b, fi) {
  const c = AU.ctx, t = c.currentTime, g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(MD.vol[name] || .6, t + fi); g.connect(AU.music);
  const s = c.createBufferSource(); s.buffer = b; s.connect(g); s.start(t); MD.cur = { name, b, s, g, t0: t };
}
function mdFade(d) { const c = AU.ctx; if (!c || !MD.cur) return; const { s, g } = MD.cur, t = c.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(.0001, g.gain.value), t); g.gain.linearRampToValueAtTime(.0001, t + d); try { s.stop(t + d + .1); } catch (e) { } MD.cur = null; }
function musicTick() { const c = AU.ctx, m = MD.cur; if (!c || !m) return; if (c.currentTime > m.t0 + m.b.duration - 3.2) { mdFade(3); mdStart(m.name, m.b, 3); } }
function musicPrefetch(names) { if (!AU.ctx) return; names.forEach(n => n && loadBuf('m/' + n)); }
// ---------- ambiente (loops) ----------
const AMB = {};
function _trim(b) { const d = b.getChannelData(0); let i = 0, j = d.length - 1; while (i < d.length && Math.abs(d[i]) < 1e-4) i++; while (j > i && Math.abs(d[j]) < 1e-4) j--; return [i / b.sampleRate, (j + 1) / b.sampleRate]; }
function ambSet(targets) {
  const c = AU.ctx; if (!c) return;
  const all = new Set([...Object.keys(AMB), ...Object.keys(targets)]);
  for (const name of all) {
    const v = targets[name] || 0; let a = AMB[name];
    if (!a) { if (v <= 0) continue; const b = AU.buf['s/' + name]; if (!b) continue; const g = c.createGain(); g.gain.value = 0; g.connect(AU.amb); const s = c.createBufferSource(); s.buffer = b; s.loop = true; const [a0, a1] = _trim(b); s.loopStart = a0; s.loopEnd = a1; s.connect(g); s.start(c.currentTime, a0); a = AMB[name] = { s, g, v: -1 }; }
    if (Math.abs(a.v - v) > .01) { a.v = v; a.g.gain.setTargetAtTime(v, c.currentTime, .7); }
  }
}
// ===================== VOZES (balbucio sintetizado, como em Hollow Knight) =====================
// Cada personagem fala uma língua inventada: sílabas curtas com formantes de vogais, timbre e tom próprios.
const VOWELS = { a: [730, 1090, 2440], e: [530, 1840, 2480], i: [300, 2200, 2950], o: [570, 840, 2410], u: [320, 870, 2240], ə: [500, 1500, 2500] };
const VOICES = {
  ione: { f0: 290, fs: 1.18, rate: 1.05, breath: .35, vib: 4, vibD: .015, vowels: 'aeiəo', soft: 1 },
  hrolf: { f0: 92, fs: .88, rate: .85, breath: .12, vib: 3, vibD: .01, vowels: 'oauə', growl: .5 },
  maren: { f0: 215, fs: 1.1, rate: 1.15, breath: .2, vib: 5, vibD: .012, vowels: 'aeoə' },
  odile: { f0: 330, fs: 1.15, rate: .7, breath: .4, vib: 6, vibD: .045, vowels: 'aoəu', echo: .6, wail: 1 },
  tobias: { f0: 78, fs: .82, rate: .75, breath: .15, vib: 2, vibD: .01, vowels: 'ouə', growl: .9 },
  brigid: { f0: 190, fs: 1.02, rate: 1.0, breath: .1, vib: 4, vibD: .01, vowels: 'aeə' },
  vesper: { f0: 240, fs: 1.12, rate: .8, breath: .6, vib: 5, vibD: .03, vowels: 'iəeu', echo: .8 },
  orin: { f0: 105, fs: .9, rate: .95, breath: .3, vib: 3, vibD: .012, vowels: 'aoə', growl: .35 },
  selene: { f0: 245, fs: 1.16, rate: 1.1, breath: .22, vib: 5, vibD: .012, vowels: 'eaiə' },
  hilde: { f0: 150, fs: .98, rate: .85, breath: .15, vib: 3, vibD: .01, vowels: 'aoə', growl: .3 },
  ozias: { f0: 130, fs: 1.0, rate: .9, breath: .2, vib: 6, vibD: .02, vowels: 'oiəa', nasal: 1, echo: .4 },
  aldric: { f0: 98, fs: .9, rate: .8, breath: .1, vib: 3, vibD: .012, vowels: 'oaə', growl: .25, echo: .3 },
  seraphine: { f0: 262, fs: 1.15, rate: .78, breath: .25, vib: 5, vibD: .02, vowels: 'aeio', choir: 1, echo: .7 },
  hollow: { f0: 120, fs: .95, rate: .9, breath: .5, vib: 7, vibD: .04, vowels: 'uoə', growl: .4 },
};
function _syl(c, v, t, dur, f0, vowel, cons, gain, dest) {
  const F = VOWELS[vowel]; const fs = v.fs;
  const out = c.createGain(); out.gain.setValueAtTime(.0001, t); out.gain.exponentialRampToValueAtTime(gain, t + Math.min(.04, dur * .3)); out.gain.setValueAtTime(gain * .85, t + dur * .7); out.gain.exponentialRampToValueAtTime(.0001, t + dur);
  out.connect(dest);
  const srcs = [];
  const mk = (mul, detune) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * mul, t); o.frequency.linearRampToValueAtTime(f0 * mul * rnd(.92, 1.06), t + dur); o.detune.value = detune; srcs.push(o); return o; };
  const lfo = c.createOscillator(); lfo.frequency.value = v.vib; const lg = c.createGain(); lg.gain.value = f0 * v.vibD; lfo.connect(lg);
  const voices = v.choir ? [mk(1, -9), mk(1, 9), mk(2, 0)] : [mk(1, 0)];
  const pre = c.createGain(); pre.gain.value = v.choir ? .45 : 1;
  for (const o of voices) { lg.connect(o.frequency); o.connect(pre); }
  if (v.growl) { const g2 = c.createOscillator(); g2.type = 'square'; g2.frequency.value = f0 * .5; const gg = c.createGain(); gg.gain.value = v.growl * .25; g2.connect(gg); gg.connect(pre); srcs.push(g2); }
  // sopro
  const ns = c.createBufferSource(); ns.buffer = AU.noise; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = F[1] * fs; nf.Q.value = 1.2; const ng = c.createGain(); ng.gain.value = v.breath * .5; ns.connect(nf); nf.connect(ng); ng.connect(pre);
  // formantes
  const gains = [1, .55, .22];
  for (let k = 0; k < 3; k++) { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = F[k] * fs * (v.nasal && k === 1 ? 1.12 : 1); bp.Q.value = k ? 11 : 7; const g = c.createGain(); g.gain.value = gains[k] * (v.soft ? .8 : 1); pre.connect(bp); bp.connect(g); g.connect(out); }
  if (v.nasal) { const n = c.createBiquadFilter(); n.type = 'peaking'; n.frequency.value = 1000; n.gain.value = 9; }
  // consoante (ruído curto antes da vogal)
  if (cons) { const cs = c.createBufferSource(); cs.buffer = AU.noise; const cf = c.createBiquadFilter(); cf.type = cons === 's' ? 'highpass' : 'bandpass'; cf.frequency.value = cons === 's' ? 4200 : cons === 'k' ? 1800 : 2800; cf.Q.value = 2; const cg = c.createGain(); cg.gain.setValueAtTime(.0001, t - .045); cg.gain.exponentialRampToValueAtTime(gain * (cons === 's' ? .5 : .9), t - .03); cg.gain.exponentialRampToValueAtTime(.0001, t + .01); cs.connect(cf); cf.connect(cg); cg.connect(dest); cs.start(t - .05, rnd(0, .5)); cs.stop(t + .03); }
  const end = t + dur + .05;
  for (const o of srcs) { o.start(t); o.stop(end); } lfo.start(t); lfo.stop(end); ns.start(t, rnd(0, .4)); ns.stop(end);
}
const VOX = { busyUntil: 0 };
// fala uma frase de balbucio (n sílabas) com a voz indicada
function voxSay(who, nSyl = 5, o = {}) {
  const c = AU.ctx; if (!c || !SET.voices || !AU.noise) return; const v = VOICES[who] || VOICES.hollow;
  let t = Math.max(c.currentTime + .02, o.queue ? VOX.busyUntil : 0); const dest = c.createGain(); dest.gain.value = (o.vol ?? .9) * .5; dest.connect(AU.voxBus); if (v.echo && AU.echo) { const eg = c.createGain(); eg.gain.value = v.echo; dest.connect(eg); eg.connect(AU.echo); }
  const rise = o.ask ? 1.25 : o.shout ? 1.15 : 1;
  for (let i = 0; i < nSyl; i++) {
    const k = i / Math.max(1, nSyl - 1), dur = (o.shout ? .16 : rnd(.1, .17)) / v.rate * (i === nSyl - 1 ? 1.6 : 1);
    const contour = o.shout ? 1.2 - k * .25 : (1.05 + Math.sin(k * PI) * .1 - k * .14) * (i === nSyl - 1 ? rise : 1);
    const f0 = v.f0 * contour * rnd(.95, 1.06) * (o.pitch || 1) * (v.wail ? 1 + Math.sin(i * 1.7) * .08 : 1);
    const vow = v.vowels[Math.floor(Math.random() * v.vowels.length)]; const cons = Math.random() < .55 ? pick(['k', 't', 's', 'p', 'k', 't']) : null;
    _syl(c, v, t + (cons ? .04 : 0), dur, f0, vow, cons, o.shout ? .5 : .32, dest);
    t += dur + (cons ? .05 : .015) + (Math.random() < .18 ? .06 : 0);
  }
  VOX.busyUntil = t;
}
// gritos e gemidos curtos (ataque, dor, morte)
function voxCry(who, kind = 'atk', o = {}) {
  const c = AU.ctx; if (!c || !SET.voices || !AU.noise) return; const v = VOICES[who] || VOICES.hollow; const t = c.currentTime + .01;
  const dest = c.createGain(); dest.gain.value = (o.vol ?? 1) * .5; dest.connect(AU.voxBus); if (v.echo && AU.echo) { const eg = c.createGain(); eg.gain.value = v.echo * .6; dest.connect(eg); eg.connect(AU.echo); }
  if (kind === 'atk') _syl(c, v, t + .03, .16 / v.rate, v.f0 * rnd(1.15, 1.35), pick(['a', 'ə', 'e']), Math.random() < .5 ? 'k' : 't', .5, dest);
  else if (kind === 'big') { _syl(c, v, t + .03, .12, v.f0 * 1.1, 'ə', 'k', .45, dest); _syl(c, v, t + .17, .34 / v.rate, v.f0 * 1.45, 'a', null, .55, dest); }
  else if (kind === 'hurt') _syl(c, v, t, .2 / v.rate, v.f0 * rnd(1.3, 1.5), pick(['u', 'ə', 'a']), null, .45, dest);
  else if (kind === 'die') { _syl(c, v, t, .5 / v.rate, v.f0 * 1.4, 'a', null, .5, dest); _syl(c, v, t + .45 / v.rate, .9 / v.rate, v.f0 * .85, 'o', null, .35, dest); }
  else if (kind === 'laugh') { for (let i = 0; i < 4; i++) _syl(c, v, t + i * .13 + .03, .09, v.f0 * (1.3 - i * .05), 'a', 'k', .38, dest); }
}
