// ===================== ÁREAS III: FORJA, CATEDRAL, CORAÇÃO =====================
// ---------------------------------------------------------------- FORJA PROFUNDA
AREAS.forge = {
  lvl: 1.55, music: 'forge', killY: -24,
  env: { fog: 0x1a0c06, fogD: .035, bg: 0x0a0402, sky: 0x8a5a40, ground: 0x2a1008, hemi: .45, moonC: 0xff9a5a, moonI: .25, moonDir: [.1, 1, .2], exposure: 1.05, bloomStr: .75, bloomTh: .72 },
  amb: { l_fire: .5, l_cavewind: .3, l_drums: .12 }, weather: 'embers',
  build(k) {
    const W = 'forge_wall', F = 'forge_floor', RK = 'rock';
    // poço do elevador
    k.room(-6, -6, 6, 6, 18, W, F, { doors: [{ side: 'n', at: 6, w: 3.2, h: 4 }] });
    k.floor(-2, -2, 2, 2, .12, 'wood'); for (const [x, z] of [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]]) k.chainHang(x, 18, z, 17.5);
    k.spawn('start', 0, .12, 0, 0); k.exit(0, .12, -1, 'hub', 'from_forge', 'Subir ao Santuário', { r: 1.8 });
    k.torch(-5.6, 2.6, 2, HPI); k.torch(5.6, 2.6, 2, -HPI);
    k.corridorZ(0, 6, 14, 3.2, 5, W, F, { ceil: RK });
    // ---- Salão das Bigornas ----
    k.wall(-24, 14, -1.6, 14, 16, W); k.wall(1.6, 14, 24, 14, 16, W); k.wall(-24, 50, 11.5, 50, 16, W); k.wall(16.5, 50, 24, 50, 16, W);
    k.wall(-24, 14, -24, 23, 16, W); k.wall(-24, 29, -24, 50, 16, W); k.wall(24, 14, 24, 50, 16, W); k.ceil(-25, 13, 25, 51, 16, RK);
    k.floor(-24, 14, -4, 50, 0, F); k.floor(4, 14, 24, 50, 0, F);
    k.lava(-4, 14, 4, 50, -.7); k.floor(-4, 20.5, 4, 23.5, 0, F); k.floor(-4, 40.5, 4, 43.5, 0, F);
    for (const z of [20.5, 23.5, 40.5, 43.5]) k.wall(-4, z, 4, z, .9, 'iron', { t: .15 });
    k.box(-18, 0, 18.5, 3.4, 1.4, 1.8, 'iron'); k.bonfire('forge_bigorna', -14.5, 0, 18, { spawnYaw: 0 });
    // bigornas e fornalhas
    for (const [x, z] of [[-14, 30], [-10, 44], [12, 26], [18, 38]]) { k.box(x, 0, z, 1.6, .9, .8, 'iron'); k.brazier(x + 2.4, z + 1.5, 0, 1.2); }
    for (const z of [17, 33, 47]) { k.box(-23.2, 0, z, 1.6, 4, 3, 'forge_wall', { walk: false }); k.lava(-23, z - 1, -22.4, z + 1, 1.4, { floor: false, dps: 0 }); }
    for (const x of [-12, 12]) for (const z of [26, 38]) k.pillar(x, z, .7, 16, W);
    k.enemy('ferreiro', -9, 0, 28, PI); k.enemy('ferreiro', 14, 0, 30, PI); k.enemy('ferreiro', 10, 0, 45, PI, { lvl: 1.7 });
    k.enemy('salamandra', -6, 0, 36, HPI); k.enemy('salamandra', 7, 0, 22, -HPI);
    k.enemy('chama', 0, .5, 32, PI); k.enemy('chama', -18, .5, 40, 0);
    k.msg(-8, 0, 21, 'O ferro nunca arrefece aqui. Nem a raiva.');
    k.item('fg_frag1', 'fragmento', 22.5, 0, 16);
    // oficina da mestra (oeste) — Salto da Bigorna
    k.room(-40, 21, -24, 37, 8, W, F, { ceil: RK, skip: ['e'] }); k.wall(-24, 23, -24, 21, 16, W);
    k.box(-36, 0, 29, 3, 1, 1.6, 'iron'); k.item('fg_salto', 'sk_salto', -36, 1, 29); k.brazier(-38, 23.5, 0, 1); k.brazier(-38, 34.5, 0, 1);
    k.enemy('ferreiro', -30, 0, 26, HPI, { lvl: 1.7 }); k.enemy('golem', -31, 0, 33, HPI, { lvl: 1.3 });
    k.chest('fg_chest', 'cinzas_heroi', -39, 0, 33, HPI);
    // ---- descida à forja inferior ----
    k.stairs(14, 54, 5, 8, 0, 0, -6, F); k.wall(11.5, 50, 11.5, 58, 22, W, { y0: -6 }); k.wall(16.5, 50, 16.5, 58, 22, W, { y0: -6 });
    // Forja Inferior
    k.wall(-2, 58, 11.5, 58, 22, W, { y0: -6 }); k.wall(16.5, 58, 40, 58, 22, W, { y0: -6 }); k.wall(-2, 58, -2, 92, 22, W, { y0: -6 }); k.wall(40, 58, 40, 92, 22, W, { y0: -6 });
    k.wall(-2, 92, 17, 92, 22, W, { y0: -6 }); k.wall(23, 92, 40, 92, 22, W, { y0: -6 }); k.ceil(-3, 57, 41, 93, 16, RK);
    k.floor(-2, 58, 40, 92, -6, F);
    k.lava(4, 66, 14, 76, -5.95, { floor: false }); k.lava(26, 64, 36, 72, -5.95, { floor: false }); k.lava(22, 80, 34, 88, -5.95, { floor: false });
    k.enemy('golem', 20, -6, 72, PI); k.enemy('golem', 8, -6, 86, PI, { lvl: 1.2 });
    k.enemy('chama', 10, -5.5, 63, PI); k.enemy('chama', 30, -5.5, 76, PI); k.enemy('chama', 2, -5.5, 80, HPI); k.enemy('chama', 36, -5.5, 88, -HPI);
    k.enemy('salamandra', 30, -6, 62, PI); k.enemy('ferreiro', 18, -6, 84, PI, { lvl: 1.8 });
    k.item('fg_lagrima', 'lagrima', 38, -6, 90); k.item('fg_frag2', 'fragmento', 0, -6, 90); k.item('fg_frag3', 'fragmento', 38.5, -6, 60);
    for (const [x, z] of [[2, 60], [38, 75], [12, 90], [28, 60]]) k.brazier(x, z, -6, 1.2);
    // Coração da Forja (arena de Hilde)
    const cx = 20, cz = 115, cy = -6;
    k.floor(17, 92, 23, 97, cy, F); k.fog('hilde', 20, cy, 92.5, 0, 6, 6, 1); k.wall(17, 92, 17, 98, 10, W, { y0: cy - 2 }); k.wall(23, 92, 23, 98, 10, W, { y0: cy - 2 });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 1, 40), MAT(F)); disc.position.set(cx, cy - .5, cz); disc.receiveShadow = true; WORLD.group.add(disc); addFloor(cx, cz, 18, 18, 0, cy, 1);
    k.floor(17, 96, 23, 98, cy, F);
    ringWalls(k, cx, cz, 18.2, 24, 1.3, 'iron', [PI], { y0: cy });
    k.lava(cx - 28, cz - 28, cx + 28, cz + 28, cy - 1.6, { floor: false, dps: 0 });
    ringWalls(k, cx, cz, 27, 18, 24, W, [PI], { y0: cy - 2 }); k.ceil(cx - 28, cz - 28, cx + 28, cz + 28, cy + 22, RK);
    k.box(cx, cy, cz + 6, 4.5, 1.6, 2.4, 'iron'); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; k.pillar(cx + Math.sin(a) * 14, cz + Math.cos(a) * 14, .8, 22, W, { y: cy }); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + PI / 6; if (Math.abs(angDiff(a, PI)) < .6) continue; k.brazier(cx + Math.sin(a) * 16.6, cz + Math.cos(a) * 16.6, cy, 1.4); }
    addLight(cx, cy + 9, cz, 0xff7a3a, 3, 26, .1);
    k.boss('hilde', cx, cy, cz + 2, PI, { x: cx, z: cz, r: 16.5 });
    k.bonfire('forge_hilde', cx, cy, cz - 6, { after: 'hilde', spawnYaw: 0 });
    k.spawn('arena', cx, cy, cz - 10, 0);
  },
};

// ---------------------------------------------------------------- CATEDRAL APAGADA
AREAS.cathedral = {
  lvl: 1.75, music: 'cathedral', killY: -20,
  env: { fog: 0x14121a, fogD: .026, bg: 0x0a0910, sky: 0x9a9ac8, ground: 0x2a2420, hemi: .55, moonC: 0xc0c8ff, moonI: .9, moonDir: [-.5, .7, .3], exposure: 1.1, bloomStr: .65, bloomTh: .75 },
  amb: { l_wind: .3, l_cavewind: .25 }, weather: 'motes',
  build(k) {
    k.sky({ top: 0x0a0a18, bot: 0x2e2a36, moonDir: [-.5, .7, .3] });
    const W = 'cath_wall', F = 'marble', T = 'tiles';
    // chegada pela ponte e escadaria
    k.floor(-3, -6, 3, 8, 0, 'castle_floor'); k.wall(-3, -6, -3, 8, 1.1, 'castle_wall', { t: .4 }); k.wall(3, -6, 3, 8, 1.1, 'castle_wall', { t: .4 });
    k.spawn('start', 0, 0, -3, 0); k.exit(0, 0, -5.5, 'hub', 'from_cathedral', 'Voltar ao Santuário', { r: 2.2 });
    k.floor(-14, 8, 14, 14, 0, F); k.stairs(0, 17, 12, 6, 0, 0, 2, F); k.floor(-14, 20, 14, 24, 2, F);
    for (const x of [-10, 10]) k.statue(x, 11, 0, 'sword', 2.2, 0, { head: 'helm' });
    k.water(-60, -30, 60, 20, -18, 0x0a0c12, { opacity: .95 });
    // ---- nave ----
    const y = 2;
    k.room(-13, 24, 13, 86, 20, W, T, { y, ceil: W, doors: [{ side: 's', at: 13, w: 5, h: 7 }, { side: 'n', at: 13, w: 5, h: 7 }, { side: 'w', at: 54, w: 4, h: 5 }, { side: 'e', at: 54, w: 4, h: 5 }, { side: 'e', at: 8, w: 2.4, h: 3.4 }] });
    k.door('cath_portal', 0, y, 24, 0, { w: 5, h: 7, startOpen: true });
    for (const s of [-1, 1]) for (let z = 30; z < 84; z += 8) { k.pillar(s * 7, z, .75, 20, W, { y }); if (z < 80) k.window(s * 12.55, y + 9, z + 4, s < 0 ? HPI : -HPI, 2.2, 6, [0xffd090, 0xa0c0ff, 0xff9080][(z / 8 | 0) % 3], true); }
    for (let z = 34; z < 70; z += 3.2) for (const s of [-1, 1]) k.box(s * 3.6, y, z, 4.2, .9, .7, 'wood_dark');
    k.bonfire('cath_nave', 0, y, 28.5, { spawnYaw: 0 });
    for (const s of [-1, 1]) for (const z of [32, 56, 80]) k.candles(s * 10.5, z, 6, .7, y);
    k.enemy('cavaleiro', 0, y, 48, PI); k.enemy('cavaleiro', 0, y, 74, PI, { lvl: 1.9 });
    k.enemy('clerigo', -10, y, 64, HPI); k.enemy('clerigo', 10, y, 70, -HPI);
    k.enemy('gargula', -10, y, 44, HPI, { trigger: 5 }); k.enemy('gargula', 10, y, 52, -HPI, { trigger: 5 });
    k.enemy('oco', -4, y, 38, PI, { lvl: 1.6 }); k.enemy('oco', 4, y, 60, PI, { lvl: 1.6 });
    k.msg(0, y, 33, 'Cuidado com as estátuas que respiram.');
    // Maren (corredor oeste)
    maren('maren_c', -10.8, y, 76, HPI, 'maren_cath');
    // porta lateral (atalho de volta à entrada) — só abre por dentro
    k.door('cath_lateral', 13, y, 32, HPI, { oneWay: -1, w: 2.4, h: 3.4 });
    k.floor(13, 30, 18, 34, y, F); k.stairs(15.5, 27, 2.4, 6, PI, y, 0, F); k.floor(14, 14, 17, 24, 0, F);
    // confessionário (parede ilusória) com a terceira carta
    k.room(13, 44, 18, 50, 4, W, F, { y, ceil: W, skip: ['w'] }); k.breakable(13, y, 47, .9, 3.4, 2.4, 0, W); k.item('ca_carta3', 'carta3', 16.5, y, 47); k.candles(17, 45, 3, .3, y);
    // ---- transepto ----
    k.room(-34, 70, -13, 86, 16, W, T, { y, ceil: W, skip: ['e'], doors: [{ side: 'w', at: 8, w: 2.6, h: 3.6 }] });
    k.room(13, 70, 34, 86, 16, W, T, { y, ceil: W, skip: ['w'] });
    // sacristia (oeste, trancada) — Passo Sombrio
    k.room(-46, 72, -34, 84, 6, W, F, { y, ceil: W, skip: ['e'] }); k.door('ca_sacristia', -34, y, 78, HPI, { key: 'chave_sacristia', w: 2.6, h: 3.6 });
    k.box(-43, y, 78, 1.6, 1, 3, 'gold'); k.item('ca_passo', 'sk_passo', -43, y + 1, 78); k.candles(-44.5, 74, 5, .4, y); k.candles(-44.5, 82, 5, .4, y);
    // transepto leste: clérigo-mor com a chave + varanda com talismã
    k.enemy('clerigo', 28, y, 78, -HPI, { lvl: 2.1, drop: { id: 'ca_chave', item: 'chave_sacristia' } }); k.enemy('cavaleiro', 22, y, 74, -HPI);
    k.stairs(31, 79, 2.6, 10, PI, y + 6, y, F); k.floor(28.5, 70, 33.5, 74, y + 6, F); k.wall(28.5, 74, 28.5, 70, 1.1, W, { y0: y + 6, t: .3 });
    k.chest('ca_furia', 'tal_furia', 31, y + 6, 71.2, 0); k.enemy('gargula', 30, y + 6, 72.5, PI, { trigger: 4 });
    k.enemy('gargula', -24, y, 78, HPI, { trigger: 6 }); k.enemy('cavaleiro', -28, y, 74, HPI);
    k.item('ca_frag', 'fragmento', -32, y, 84); k.item('ca_cinz', 'cinzas_heroi', 33, y, 84.5);
    for (const x of [-24, 24]) { k.window(x, y + 9, 85.6, PI, 3, 7, 0xffc080, true); k.candles(x, 72, 6, .7, y); }
    // ---- abside e sala do trono ----
    k.room(-10, 86, 10, 100, 20, W, T, { y, ceil: W, skip: ['s'], doors: [{ side: 'n', at: 10, w: 4, h: 5.5 }] });
    k.box(0, y, 95, 6, 1.2, 2.4, 'marble'); k.candles(-2, 95, 6, 1, y + 1.2); k.candles(2, 95, 6, 1, y + 1.2); k.window(0, y + 10, 99.6, PI, 4, 8, 0xffe0a0, true);
    k.corridorZ(0, 100, 112, 4, 6, W, F, { y, ceil: W }); torchRow(k, -1.7, 102, -1.7, 110, y + 2.4, 2, HPI);
    k.fog('aldric', 0, y, 111.5, 0, 4, 5.5, 1);
    k.room(-17, 112, 17, 150, 18, W, T, { y, ceil: W, doors: [{ side: 's', at: 17, w: 4, h: 5.5 }] });
    for (const s of [-1, 1]) for (const z of [118, 128, 138]) k.pillar(s * 13, z, .9, 18, W, { y });
    for (const s of [-1, 1]) k.banner(s * 16.4, y + 14, 132, s < 0 ? HPI : -HPI, 'cloth_red', 2.4, 9);
    k.stairs(0, 145.5, 8, 3, 0, y, y + 1.2, F); k.box(0, y + 1.2, 148, 2.4, 3, 1.2, 'gold'); k.box(0, y + 1.2, 147, 1.6, 1, 1.2, 'cloth_red');
    for (const [x, z] of [[-9, 120], [9, 120], [-9, 142], [9, 142]]) k.brazier(x, z, y, 1.4);
    k.boss('aldric', 0, y + 1.2, 146, PI, { x: 0, z: 132, r: 14 });
    k.bonfire('cath_trono', 0, y, 124, { after: 'aldric', spawnYaw: 0 });
    invisRect(-48, -8, 36, 152, -15, 40);
  },
};

// ---------------------------------------------------------------- CORAÇÃO DO LUME
AREAS.heart = {
  lvl: 1.95, music: 'heart', killY: -30,
  env: { fog: 0x2a1a10, fogD: .02, bg: 0x1a0e08, sky: 0xffd0a0, ground: 0x3a1a08, hemi: .7, moonC: 0xffd8a0, moonI: 1.1, moonDir: [0, 1, .2], exposure: 1.0, bloomStr: .85, bloomTh: .7 },
  amb: { l_fire: .35, l_heart: .25, l_wind: .2 }, weather: 'embers',
  build(k) {
    k.sky({ top: 0x2a1408, bot: 0xff9a40, moonDir: [0, .2, 1], moonC: 0xfff0c0, stars: 0 });
    const M = 'heart_floor', HW = 'heart_wall';
    const plat = (x, z, r, y = 0, h = 6) => { k.sb.cyl(x, y - h, z, r, r * .55, h, M, { seg: 24 }); };
    const bridge = (x0, z0, x1, z1, y = 0, w = 3) => {
      const L = Math.hypot(x1 - x0, z1 - z0), rot = Math.atan2(x1 - x0, z1 - z0); k.box((x0 + x1) / 2, y - .6, (z0 + z1) / 2, w, .6, L, M, { rot });
      const nx = Math.cos(rot) * (w / 2 - .12), nz = -Math.sin(rot) * (w / 2 - .12); for (const sd of [-1, 1]) k.box((x0 + x1) / 2 + nx * sd, y, (z0 + z1) / 2 + nz * sd, .22, .85, L - 1.2, HW, { rot, walk: false });
    };
    // plataforma inicial — Lança de Luz
    plat(0, 0, 8); k.spawn('start', 0, 0, -4, 0); k.exit(0, 0, -6.2, 'hub', 'from_heart', 'Subir ao Santuário', { r: 2 });
    k.box(0, 0, 4, 1.4, 1.1, 1.4, HW); k.item('he_luz', 'sk_luz', 0, 1.1, 4);
    k.zone(-6, -5, 6, 3, 0, () => { if (PROG.skills.includes('luz')) return; UI.toast('Uma luz pura chama por ti.', 3); });
    // ponte para o norte
    bridge(0, 7, 0, 25); plat(0, 32, 9);
    k.enemy('eco', 0, 0, 34, PI); k.enemy('chama', -4, .5, 30, PI); k.enemy('chama', 4, .5, 30, PI);
    for (const [x, z] of [[-6, 34], [6, 34]]) k.brazier(x, z, 0, 1.2);
    // ramo oeste (tesouro)
    bridge(-8, 33, -28, 40); plat(-34, 42, 7, 1); k.stairs(-25.5, 39, 3, 3, -1.9, 0, 1, M);
    k.enemy('vigia', -34, 1, 44, HPI); k.item('he_cinz', 'cinzas_heroi', -37, 1, 46); k.item('he_frag', 'fragmento', -31, 1, 38);
    // ramo leste
    bridge(8, 34, 26, 48); plat(32, 52, 8);
    k.enemy('eco', 30, 0, 52, -HPI); k.enemy('eco', 35, 0, 49, -HPI); k.enemy('chama', 33, .5, 57, PI);
    k.item('he_lagrima', 'lagrima', 36, 0, 56);
    // central → limiar
    bridge(0, 41, 0, 60); plat(0, 67, 9); bridge(26, 54, 8, 64);
    k.enemy('vigia', 0, 0, 70, PI, { lvl: 2.1 }); k.enemy('chama', -5, .5, 63, PI); k.enemy('chama', 5, .5, 63, PI);
    k.bonfire('heart_limiar', 0, 0, 62, { spawnYaw: 0 });
    for (const s of [-1, 1]) k.statue(s * 6, 71, PI, s < 0 ? 'pray' : 'weep', 2.2, 0);
    k.msg(0, 0, 73, 'Aqui jaz a luz. E ela não quer ser acordada.');
    // ponte final e arena
    bridge(0, 75, 0, 90, 0, 4); k.fog('seraphine', 0, 0, 89.5, 0, 4, 5, 1);
    plat(0, 110, 20, 0, 8);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; if (Math.abs(angDiff(a, PI)) < .3) continue; k.pillar(Math.sin(a) * 18.5, 110 + Math.cos(a) * 18.5, .7, 7 + (i % 3) * 3, HW); }
    k.box(0, 0, 124, 5, 1, 3, HW); k.statue(0, 125, PI, 'pray', 3.2, 1, { base: 0 });
    k.boss('seraphine', 0, 0, 118, PI, { x: 0, z: 110, r: 17.5 });
    // barreira da arena (não deixa cair da plataforma durante o combate)
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; if (Math.abs(angDiff(a, PI)) < .14) continue; addSolidBox(Math.sin(a) * 20.3, 110 + Math.cos(a) * 20.3, 2.4, .4, a + HPI, -2, 20, { walk: false, cam: false }); }
    // luzes flutuantes
    for (let i = 0; i < 14; i++) { const x = rnd(-60, 60), z = rnd(-20, 140), yy = rnd(-20, 25); glowSprite(WORLD.group, x, yy, z, rnd(4, 10), 0xffb060, .35); }
    for (let i = 0; i < 18; i++) { const a = rnd(0, TAU), d = rnd(70, 120); k.rock(Math.sin(a) * d, 60 + Math.cos(a) * d, rnd(6, 16), rnd(-40, -16), i % 4, false); }
  },
  onEnter() { if (!PROG.flags.heartIntro) { PROG.flags.heartIntro = 1; after(1.5, () => UI.subtitle('Ione', 'Desperto... estou aqui contigo. Sinto o calor dela daqui.', 5)); } },
};
