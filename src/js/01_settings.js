// ===================== DEFINIÇÕES =====================
const SET_KEY = 'ultimo-lume-3d-settings';
const SET = Object.assign({
  quality: IS_MOBILE ? 'medium' : 'high', // low | medium | high
  camSens: 1.0,
  invertY: false,
  music: 0.75,
  sfx: 0.9,
  voices: true,      // falas narradas pelo navegador
  subtitles: true,
  dmgNumbers: true,
  vibrate: true,
  autoCam: true,
}, store.json(SET_KEY) || {});
function saveSettings() { store.set(SET_KEY, JSON.stringify(SET)); }
const QUALITY = {
  low: { dpr: 0.8, shadows: false, shadowSize: 512, bloom: false, lights: 4, particles: 0.45, aa: false, tex: 256, drawDist: 70, grass: 0.3, std: false },
  medium: { dpr: 1.3, shadows: true, shadowSize: 1024, bloom: false, lights: 6, particles: 0.75, aa: false, tex: 256, drawDist: 95, grass: 0.6, std: true },
  high: { dpr: 1.6, shadows: true, shadowSize: 2048, bloom: true, lights: 8, particles: 1, aa: true, tex: 512, drawDist: 130, grass: 1, std: true },
};
const Q = () => QUALITY[SET.quality] || QUALITY.medium;
