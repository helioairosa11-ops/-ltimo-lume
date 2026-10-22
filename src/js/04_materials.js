// ===================== MATERIAIS =====================
const MATS = {};
// def: {tex:[recipeName, ...args] | null, tile: metros por repetição, color, rough, metal, emissive, emissiveInt, bump, transparent, opacity, side, flat}
const MATDEF = {
  crypt_wall: { tex: ['stone', 0x4a4540, 0x26231f, 6, 3, 1], tile: 3, rough: .92 },
  crypt_floor: { tex: ['flag', 0x4f4a43, 0x2a2622, 4, 2], tile: 4, rough: .9 },
  castle_wall: { tex: ['stone', 0x5c5850, 0x34312c, 5, 2, 4], tile: 3.5, rough: .9 },
  castle_floor: { tex: ['cobble', 0x57524b, 0x2b2825, 7, 6], tile: 3, rough: .88 },
  cath_wall: { tex: ['plaster', 0x6c645a, 8], tile: 6, rough: .85 },
  cobble: { tex: ['cobble', 0x4e4a44, 0x24211e, 6, 12], tile: 2.4, rough: .9 },
  tiles: { tex: ['tiles', 0x2a2522, 0x4e4741, 8, 9], tile: 5, rough: .5 },
  cath_floor: { tex: ['tiles', 0x2a2522, 0x4e4741, 8, 9], tile: 5, rough: .55 },
  marble: { tex: ['marble', 0xb6ae9f, 0x645e57, 10], tile: 4, rough: .4 },
  ground: { tex: ['ground', 0x3a3126, 0x1f1912, 11], tile: 6, rough: 1 },
  grass: { tex: ['grass', 13], tile: 5, rough: 1 },
  mud: { tex: ['ground', 0x2f2c22, 0x15140f, 14, 0x55603a, .02], tile: 5, rough: .7 },
  ash: { tex: ['ground', 0x5b5853, 0x2c2a28, 15, 0x9a958c, .03], tile: 6, rough: 1 },
  forge_floor: { tex: ['rock', 0x3a302b, 0x161210, 33], tile: 5, rough: .95 },
  forge_wall: { tex: ['stone', 0x3d3530, 0x1d1815, 4, 2, 6], tile: 3, rough: .9 },
  rock: { tex: ['rock', 0x4f4a44, 0x221f1c, 31], tile: 6, rough: 1 },
  wood: { tex: ['wood', 0x4a3524, 0x2a1c12, 4, 17], tile: 2, rough: .85 },
  wood_dark: { tex: ['wood', 0x2e2219, 0x160f0a, 3, 18], tile: 2, rough: .85 },
  bark: { tex: ['bark', 19], tile: 2, rough: 1 },
  metal: { tex: ['metal', 0x5b5f66, 23], tile: 1.5, rough: .45, metal: .75 },
  iron: { tex: ['metal', 0x3a3c40, 24], tile: 1.5, rough: .55, metal: .7 },
  lava: { tex: ['lava', 37], tile: 6, rough: .9, emissive: 0xff5a1a, emissiveInt: 2.2 },
  heart_floor: { tex: ['marble', 0x8d8478, 0x3a332c, 44], tile: 5, rough: .5 },
  heart_wall: { tex: ['stone', 0x6a6055, 0x3a332c, 4, 2, 45], tile: 4, rough: .8 },
  // personagens e objetos sem textura grande
  skin_pale: { color: 0xb8a998, rough: .8 },
  skin_ash: { color: 0x7a746c, rough: .95 },
  skin_dead: { color: 0x6e6a5c, rough: .95 },
  bone: { color: 0xc9bfa7, rough: .8 },
  cloth_dark: { tex: ['cloth', 0x2a2422, 29], tile: .6, rough: .95 },
  cloth_red: { tex: ['cloth', 0x5a1a17, 30], tile: .6, rough: .9 },
  cloth_grey: { tex: ['cloth', 0x5b5650, 31], tile: .6, rough: .95 },
  cloth_white: { tex: ['cloth', 0xbdb5a5, 32], tile: .6, rough: .9 },
  cloth_purple: { tex: ['cloth', 0x3a2a48, 33], tile: .6, rough: .9 },
  cloth_green: { tex: ['cloth', 0x2b3524, 34], tile: .6, rough: .95 },
  cloth_blue: { tex: ['cloth', 0x22304a, 35], tile: .6, rough: .9 },
  leather: { color: 0x3b2a1e, rough: .8 },
  steel: { color: 0x8a8e96, rough: .35, metal: .9 },
  dark_steel: { color: 0x3c3f46, rough: .45, metal: .85 },
  gold: { color: 0xc9a14a, rough: .35, metal: 1 },
  bronze: { color: 0x8a6438, rough: .45, metal: .9 },
  candle: { color: 0xd8ccb0, rough: .7 },
  stone_statue: { tex: ['rock', 0x77726a, 0x3d3a35, 51], tile: 2, rough: .9 },
  coffin: { tex: ['wood', 0x3a2a1c, 0x1c130c, 2, 52], tile: 1.5, rough: .8 },
  ember: { color: 0x221008, emissive: 0xff6a1a, emissiveInt: 3, rough: 1 },
  glow_blue: { color: 0x0a1020, emissive: 0x8ab4ff, emissiveInt: 3, rough: 1 },
  glow_white: { color: 0x202020, emissive: 0xfff2d8, emissiveInt: 3, rough: 1 },
  fire_core: { color: 0x000000, emissive: 0xffb050, emissiveInt: 4, rough: 1 },
  shadow_body: { color: 0x0c0a12, rough: 1, emissive: 0x2a1840, emissiveInt: .6 },
  black: { color: 0x0b0a0a, rough: 1 },
};
function makeMat(key, override) {
  const d = Object.assign({}, MATDEF[key] || {}, override || {});
  const std = Q().std;
  const p = { color: d.color !== undefined ? d.color : 0xffffff };
  if (d.tex) {
    const [rec, ...args] = d.tex; const name = d.tex.join('_');
    const T = genTex(name, TEXGEN[rec](...args), { emissive: rec === 'lava', bump: d.bump || 2.5 });
    const rep = 1 / (d.tile || 2);
    const map = T.map.clone(); map.repeat.set(rep, rep); map.needsUpdate = true; p.map = map;
    if (T.normal && std) { const n = T.normal.clone(); n.repeat.set(rep, rep); n.needsUpdate = true; p.normalMap = n; p.normalScale = new THREE.Vector2(1, 1); }
    if (T.emissive) { const e = T.emissive.clone(); e.repeat.set(rep, rep); e.needsUpdate = true; p.emissiveMap = e; }
  }
  if (d.emissive !== undefined) { p.emissive = d.emissive; p.emissiveIntensity = d.emissiveInt || 1; }
  if (d.transparent) { p.transparent = true; p.opacity = d.opacity ?? 1; p.depthWrite = d.depthWrite ?? false; }
  if (d.side) p.side = d.side;
  let m;
  if (std) { p.roughness = d.rough ?? .9; p.metalness = d.metal ?? 0; m = new THREE.MeshStandardMaterial(p); }
  else m = new THREE.MeshLambertMaterial(p);
  if (d.flat) m.flatShading = true;
  return m;
}
function MAT(key, override) {
  if (override) return makeMat(key, override);
  if (!MATS[key]) MATS[key] = makeMat(key);
  return MATS[key];
}
// Materiais aditivos para efeitos
const FXMAT = {};
function fxMat(name, color, opacity = 1, tex = 'glow') {
  const k = name + color + opacity + tex;
  if (FXMAT[k]) return FXMAT[k];
  const m = new THREE.MeshBasicMaterial({ color, map: tex ? spriteTex(tex) : null, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true });
  FXMAT[k] = m; return m;
}
function disposeMats() { for (const k in MATS) { MATS[k].dispose(); delete MATS[k]; } }
