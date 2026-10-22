// ===================== DEFINIÇÕES =====================
const SET_KEY = 'ultimo-lume-2d-settings';
const SET = Object.assign({
  quality: IS_MOBILE ? 'media' : 'alta', // baixa | media | alta
  music: 0.75, sfx: 0.9,
  voices: true,      // vozes das personagens (balbucio sintetizado)
  subtitles: true,
  dmgNumbers: true,
  shake: true,
  vibrate: true,
}, store.json(SET_KEY) || {});
function saveSettings() { store.set(SET_KEY, JSON.stringify(SET)); }
const QUALITY = {
  baixa: { dpr: 1, light: 4, particles: .45, bloom: false, parallax: 2 },
  media: { dpr: 1.5, light: 3, particles: .75, bloom: true, parallax: 3 },
  alta: { dpr: 2, light: 2, particles: 1, bloom: true, parallax: 3 },
};
const Q = () => QUALITY[SET.quality] || QUALITY.media;
