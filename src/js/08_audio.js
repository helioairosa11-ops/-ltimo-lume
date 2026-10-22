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
    AU.amb = c.createGain(); AU.amb.connect(AU.master);
    applyVolumes();
    const len = c.sampleRate, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; AU.noise = b;
    AU.unlocked = true;
    SFX_FILES.forEach(n => loadBuf('s/' + n));
    MD.retry();
  } catch (e) { AU.ctx = null; }
  try { if (window.speechSynthesis && !AU.speechInit) { AU.speechInit = true; const u = new SpeechSynthesisUtterance(''); u.volume = 0; speechSynthesis.speak(u); } } catch (e) { }
}
function applyVolumes() { if (!AU.ctx) return; const t = AU.ctx.currentTime; AU.music.gain.setTargetAtTime(SET.music * 0.9, t, .05); AU.sfxBus.gain.setTargetAtTime(SET.sfx, t, .05); AU.amb.gain.setTargetAtTime(SET.sfx * 0.8, t, .05); }
function loadBuf(path) {
  if (path in AU.buf) return Promise.resolve(AU.buf[path]);
  if (AU.loading[path]) return AU.loading[path];
  const c = AU.ctx; if (!c) return Promise.resolve(null);
  const p = fetch(AU.base + path + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(ab => new Promise((res, rej) => c.decodeAudioData(ab, res, rej)))
    .then(b => { AU.buf[path] = b; return b; }).catch(() => { AU.buf[path] = null; return null; });
  AU.loading[path] = p; return p;
}
// som (com posição opcional)
function sfx(name, o = {}) {
  const c = AU.ctx; if (!c) return null; const b = AU.buf['s/' + name]; if (!b) return null;
  let vol = o.vol ?? 1, pan = 0;
  if (o.pos) {
    const cam = R.camera, dx = o.pos.x - cam.position.x, dy = o.pos.y - cam.position.y, dz = o.pos.z - cam.position.z, d = Math.hypot(dx, dy, dz);
    const ref = o.ref || 6, mx = o.max || 45; if (d > mx) return null;
    vol *= clamp(ref / Math.max(ref, d), 0, 1) * (1 - Math.max(0, (d - mx * .6) / (mx * .4)));
    const right = _v1.set(1, 0, 0).applyQuaternion(cam.quaternion); pan = clamp((dx * right.x + dz * right.z) / Math.max(1, d), -1, 1) * .75;
  }
  if (vol < 0.01) return null;
  const s = c.createBufferSource(); s.buffer = b;
  s.playbackRate.value = (o.rate || 1) * (o.jit ? rnd(1 - o.jit, 1 + o.jit) : 1);
  const g = c.createGain(); g.gain.value = vol;
  let node = s; node.connect(g); node = g;
  if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; node.connect(p); node = p; }
  node.connect(AU.sfxBus); s.start(c.currentTime + (o.delay || 0)); return s;
}
const SFXCD = {};
function sfxCD(name, cd, o) { const t = SFXCD[name] || 0; if (TIME.real < t) return null; SFXCD[name] = TIME.real + cd; return sfx(name, o); }
function sfxAny(names, o) { return sfx(pick(names), o); }
// síntese (quando não há arquivo)
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
    case 'roll': noise({ f: 600, f2: 180, dur: .26, vol: .18 * v, a: .03 }); break;
    case 'land': noise({ f: 300, f2: 100, dur: .16, vol: .25 * v }); tone({ f: 90, f2: 50, dur: .12, vol: .2 * v }); break;
    case 'boom': tone({ f: 70, f2: 28, dur: .6, vol: .55 * v }); noise({ f: 500, f2: 70, dur: .5, vol: .35 * v }); break;
    case 'whoosh': noise({ ft: 'bandpass', f: 1800, f2: 400, q: 1.1, dur: .2, vol: .2 * v, a: .03 }); break;
    case 'ui': tone({ f: 520, dur: .06, vol: .05 }); break;
    case 'uiok': tone({ f: 660, dur: .08, vol: .06 }); tone({ f: 990, dur: .1, vol: .05, delay: .05 }); break;
    case 'bonfire': noise({ f: 200, f2: 1400, dur: 1.1, vol: .28, a: .2 }); [220, 277, 330].forEach((f, i) => tone({ type: 'triangle', f, dur: 2.2, vol: .06, a: .4, delay: .1 * i })); break;
    case 'death': tone({ type: 'sawtooth', f: 98, f2: 32, dur: 2.6, vol: .2, lp: 500, a: .05 }); tone({ f: 55, f2: 30, dur: 2, vol: .4 }); break;
    case 'victory': [[220, 0], [277, .05], [330, .1], [440, .2], [554, .35]].forEach(([f, d]) => tone({ type: 'triangle', f, dur: 3.8, vol: .08, a: .5, delay: d })); noise({ f: 300, f2: 2000, dur: 2.5, vol: .12, a: .8 }); break;
    case 'item': tone({ f: 880, dur: .3, vol: .07 }); tone({ f: 1320, dur: .45, vol: .06, delay: .08 }); break;
    case 'parry': tone({ type: 'square', f: 1800, f2: 900, dur: .12, vol: .08, lp: 4000 }); noise({ ft: 'highpass', f: 3000, dur: .1, vol: .2 }); break;
    case 'heartbeat': tone({ f: 60, f2: 40, dur: .15, vol: .3 }); tone({ f: 55, f2: 38, dur: .15, vol: .25, delay: .22 }); break;
    case 'fog': noise({ f: 300, f2: 1200, dur: .9, vol: .15, a: .3 }); break;
  }
}
// ---------- música ----------
const MD = { want: undefined, cur: null, vol: { title: .9, hub: .6, crypt: .6, walls: .55, swamp: .55, forest: .55, forge: .5, cathedral: .55, heart: .6, b_odile: .8, b_brigid: .8, b_vesper: .8, b_selene: .8, b_hilde: .75, b_aldric: .8, b_sera1: .85, b_sera2: .85, b_sera3: .9, miniboss: .75, end_lume: .85, end_cinza: .85, end_filha: .85 } };
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
// ---------- vozes (síntese de fala do navegador) ----------
const VOICE = { list: [], ready: false };
function _loadVoices() { try { VOICE.list = (speechSynthesis.getVoices() || []).filter(v => /^pt/i.test(v.lang)); VOICE.ready = true; } catch (e) { } }
if (window.speechSynthesis) { _loadVoices(); try { speechSynthesis.onvoiceschanged = _loadVoices; } catch (e) { } }
const FEM = /(joana|luciana|catarina|francisca|fernanda|raquel|helena|maria|female|feminina|leila|ines|inês|camila|vitoria|vitória|thalita|brenda|giovanna|yara|manuela)/i;
const MASC = /(felipe|daniel|duarte|ricardo|male|masculino|antonio|antónio|cristiano|julio|júlio|fabio|fábio|humberto|donato|valerio|nicolau)/i;
function speak(text, who = 'f', o = {}) {
  if (!SET.voices || !window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const prefer = VOICE.list.filter(v => /pt-PT/i.test(v.lang)).concat(VOICE.list.filter(v => !/pt-PT/i.test(v.lang)));
    let v = prefer.find(v => (who === 'm' ? MASC : FEM).test(v.name)) || prefer[0];
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'pt-PT';
    u.pitch = o.pitch ?? (who === 'm' ? 0.55 : 0.85); u.rate = o.rate ?? 0.86; u.volume = clamp((o.vol ?? 1) * SET.sfx, 0, 1);
    speechSynthesis.speak(u);
  } catch (e) { }
}
function stopSpeech() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } }
