// ===================== ÁREAS II: MURALHAS, PÂNTANO, BOSQUE =====================
function marenLook() { return buildHumanoid({ s: .97, female: true, mats: { skin: MAT('skin_ash'), body: MAT('leather'), legs: MAT('cloth_green'), arms: MAT('cloth_green'), boots: MAT('leather'), accent: MAT('bronze') }, head: 'hood', cape: { mat: MAT('cloth_green'), len: 1, w: .44 } }); }
function maren(id, x, y, z, yaw, dialog) { return new NPC({ id, dialog, name: 'Maren', x, y, z, yaw, build: marenLook, idleClip: CLIP.sit, look: true, light: 0xffa060, voice: { sex: 'f', pitch: 1.0, rate: .95 } }); }
// paredes em polígono (arena)
function ringWalls(k, cx, cz, r, n, h, mat, gaps = [], o = {}) {
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
    if (gaps.some(g => Math.abs(angDiff(am, g)) < PI / n)) continue;
    k.wall(cx + Math.sin(a0) * r, cz + Math.cos(a0) * r, cx + Math.sin(a1) * r, cz + Math.cos(a1) * r, h, mat, Object.assign({ t: 1 }, o));
  }
}
function invisRect(x0, z0, x1, z1, y0 = -20, y1 = 30) { const t = .5; addSolidBox((x0 + x1) / 2, z0 - t, (x1 - x0) / 2 + 1, t, 0, y0, y1, { walk: false, cam: false }); addSolidBox((x0 + x1) / 2, z1 + t, (x1 - x0) / 2 + 1, t, 0, y0, y1, { walk: false, cam: false }); addSolidBox(x0 - t, (z0 + z1) / 2, t, (z1 - z0) / 2 + 1, 0, y0, y1, { walk: false, cam: false }); addSolidBox(x1 + t, (z0 + z1) / 2, t, (z1 - z0) / 2 + 1, 0, y0, y1, { walk: false, cam: false }); }
// distância de um ponto a uma polilinha
function distPath(x, z, pts) { let b = 1e9; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1]; const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz; let t = L ? ((x - ax) * dx + (z - az) * dz) / L : 0; t = clamp(t, 0, 1); b = Math.min(b, Math.hypot(x - ax - dx * t, z - az - dz * t)); } return b; }

// ---------------------------------------------------------------- MURALHAS DE VESPERAL
AREAS.walls = {
  lvl: 1.15, music: 'walls', killY: -14,
  env: { fog: 0x161820, fogD: .03, bg: 0x0b0c12, sky: 0x8090c0, ground: 0x2a241c, hemi: .5, moonC: 0xaab8f0, moonI: 1.15, moonDir: [.35, .75, -.5], exposure: 1.1, bloomStr: .55, bloomTh: .8 },
  amb: { l_wind: .55, l_raven: .2, l_night: .15 }, weather: 'ash',
  build(k) {
    k.sky({ top: 0x080a18, bot: 0x2a2630, moonDir: [.35, .75, -.5], moonC: 0xe8ecff });
    const CW = 'castle_wall', CF = 'castle_floor', CB = 'cobble';
    // estrada de entrada
    k.floor(-4, -3.5, 8, 3.5, 0, CB); k.wall(-4, -3.5, 8, -3.5, 7, CW); k.wall(-4, 3.5, 8, 3.5, 7, CW); k.wall(-4, -3.5, -4, 3.5, 7, CW);
    k.spawn('start', 1.5, 0, 0, HPI); k.spawn('from_swamp', 1.5, 0, 0, HPI);
    k.exit(-2.2, 0, 0, 'hub', 'from_walls', 'Voltar ao Santuário', { r: 2.2 });
    k.torch(-3.6, 2.4, 2.2, HPI);
    // ---- Pátio Exterior ----
    k.floor(8, -16, 36, 16, 0, CB);
    k.wall(8, -16, 36, -16, 9, CW); k.wall(8, -16, 8, -3.5, 9, CW); k.wall(8, 3.5, 8, 16, 9, CW); k.arch(8, 0, 6.2, 5.5, HPI, CW);
    k.wall(36, -16, 36, -2.6, 9, CW); k.wall(36, 2.6, 36, 16, 9, CW); k.box(36, 4.4, 0, 1, 4.6, 5.2, CW, { walk: false });
    // muralha norte (adarve) — sobe-se pelas escadas
    k.box(27, 0, 18, 38, 5, 4, CW); k.wall(8, 20.2, 46, 20.2, 1.3, CW, { y0: 5, t: .5 }); k.wall(18.5, 15.8, 36, 15.8, 1.1, CW, { y0: 5, t: .4 });
    k.stairs(13.2, 14.6, 2.4, 10, HPI, 0, 5, CF);
    for (let x = 10; x < 46; x += 2.2) k.box(x, 6.3, 20.2, .9, .6, .55, CW, { walk: false });
    k.torch(20, 6.6, 19.6, PI); k.torch(32, 6.6, 19.6, PI);
    // decoração
    k.box(16, 0, -9, 2.2, 1.2, 3.6, 'wood', { rot: .4 }); k.box(29, 0, -11, 1.6, 1, 1.6, 'wood_dark'); k.box(30.6, 0, -11.5, 1.2, .8, 1.2, 'wood_dark', { rot: .5 });
    k.brazier(12, -12.5, 0, 1); k.brazier(32, 10, 0, 1); k.banner(35.4, 7.5, -8, -HPI, 'cloth_blue', 1.4, 4); k.banner(8.6, 7.5, -8, HPI, 'cloth_blue', 1.4, 4);
    for (let i = 0; i < 5; i++) k.bones(rnd(12, 34), rnd(-14, 12));
    maren('maren_w', 10.6, 0, -13.4, .6, 'maren_walls');
    k.msg(14, 0, 2, 'Besteiros nas ameias. Corre para as sombras.');
    k.enemy('soldado', 22, 0, -4, -HPI); k.enemy('soldado', 30, 0, 6, -HPI); k.enemy('oco', 19, 0, 8, PI); k.enemy('oco', 27, 0, -12, -1);
    k.enemy('cao', 31, 0, -2, -HPI); k.enemy('cao', 33, 0, 1.5, -HPI);
    k.enemy('besteiro', 26, 5, 18, PI); k.enemy('besteiro', 40, 5, 18, PI);
    k.item('wa_cinz1', 'cinzas_pequenas', 31, 0, -13.5);
    // portão para o pátio interior (abre pelo outro lado)
    k.gate('walls_g1', 36, 0, 0, HPI, { w: 5, h: 4.4 });
    // ---- descida do adarve para o pátio interior ----
    k.stairs(44, 11, 2.6, 10, PI, 5, 0, CF); k.wall(45.5, 6, 45.5, 16, 5.6, CW, { t: .5 }); k.wall(42.5, 6, 42.5, 16, 1.2, CW, { t: .3, y0: 0 });
    // ---- Pátio Interior ----
    k.floor(36, -22, 80, 22, 0, CB);
    k.wall(36, 16, 36, 22, 9, CW); k.wall(36, 22, 80, 22, 9, CW); k.wall(36, -22, 36, -16, 9, CW); k.wall(36, -22, 68, -22, 9, CW);
    k.wall(80, 22, 80, 3, 9, CW); k.wall(80, -3, 80, -22, 9, CW); k.arch(80, 0, 5.4, 5.5, HPI, CW);
    k.lever('walls_g1', 37.6, 0, 4, HPI);
    k.bonfire('walls_patio', 40, 0, -5, { spawnYaw: HPI });
    k.zone(37, -9, 44, 2, 0, () => UI.tut('Usa a alavanca para abrir o portão. Atalhos tornam o caminho de volta mais curto.', 7));
    // caserna
    k.room(52, 8, 68, 21.2, 6, CW, CF, { ceil: 'wood_dark', doors: [{ side: 's', at: 8, w: 2.6, h: 3.4 }], skip: ['n'] });
    for (let x = 54; x < 67; x += 3) { k.box(x, 0, 19.5, 1.2, .6, 2.4, 'wood'); k.box(x, 0, 10, 1.2, .6, 2.4, 'wood'); }
    k.box(60, 0, 15, 4, .9, 1.6, 'wood_dark'); k.candles(60, 15, 4, .9, .9); k.torch(52.6, 2.6, 15, HPI);
    k.enemy('soldado', 57, 0, 14, PI); k.enemy('soldado', 64, 0, 16, PI);
    k.enemy('besteiro', 60, 0, 19, PI, { lvl: 1.5, drop: { id: 'wa_chave', item: 'chave_torre' } });
    k.item('wa_frag', 'fragmento', 66.5, 0, 19.5);
    // torre de vigia (trancada)
    k.room(52, -22, 64, -12, 9, CW, CF, { ceil: CW, doors: [{ side: 'n', at: 6, w: 2.4, h: 3.4 }], skip: ['s'] });
    k.door('walls_torre', 58, 0, -12, 0, { key: 'chave_torre', w: 2.4, h: 3.4 });
    k.box(58, 0, -18.5, 3, .9, 1.4, 'wood_dark'); k.item('wa_arco', 'sk_arco', 58, .9, -18.5);
    k.chest('wa_chest', 'tal_pena', 54, 0, -20.4, 0); k.torch(63.4, 2.6, -17, -HPI); k.candles(61, -21, 5, .5);
    for (let i = 0; i < 4; i++) k.box(53 + i * .01, 0, -14, .1, .1, .1, 'wood', { solid: false });
    // plataforma de besteiros
    k.box(75, 0, 9, 8, 3, 6, CW); k.stairs(75, 3.5, 2.4, 5, PI, 3, 0, CF); k.wall(71, 12, 79, 12, 1.1, CW, { y0: 3, t: .4 });
    k.enemy('besteiro', 74, 3, 10, PI); k.enemy('besteiro', 77.5, 3, 9, PI + .4);
    k.enemy('soldado', 50, 0, -3, HPI); k.enemy('soldado', 66, 0, 2, HPI, { lvl: 1.3 }); k.enemy('oco', 47, 0, 12, PI);
    k.enemy('cao', 63, 0, -6, HPI); k.enemy('cao', 65, 0, -8, HPI); k.enemy('cao', 66, 0, -4, HPI);
    // estátuas da guarda
    k.statue(44, -20, 0, 'sword', 2, 0, { head: 'helm' }); k.statue(48, -20, 0, 'sword', 2, 0, { head: 'helm' });
    k.brazier(46, 6, 0, 1.1); k.brazier(70, -14, 0, 1.1); k.torch(79.4, 3, 4, -HPI); k.torch(79.4, 3, -4, -HPI);
    for (const z of [-10, 10]) k.banner(79.4, 8, z, -HPI, 'cloth_blue', 1.6, 5);
    k.msg(70, 0, 0, 'O Portão à frente. Ela bloqueia o que vem de frente.');
    // ---- pátio das execuções (opcional) ----
    k.floor(66, -44, 98, -22, 0, CB); k.wall(66, -22, 66, -44, 9, CW); k.wall(66, -44, 98, -44, 9, CW); k.wall(98, -44, 98, -22, 9, CW); k.wall(80, -22, 98, -22, 9, CW);
    for (const x of [78, 86]) { k.box(x, 0, -40, .3, 4.5, .3, 'wood_dark'); k.box(x + 3, 0, -40, .3, 4.5, .3, 'wood_dark'); k.box(x + 1.5, 4.3, -40, 3.4, .25, .3, 'wood_dark', { solid: false }); k.chainHang(x + 1.5, 4.3, -40, 1.6); }
    k.box(82, 0, -32, 5, .8, 5, 'wood'); k.brazier(70, -40, 0, 1.2); k.brazier(94, -26, 0, 1.2);
    k.enemy('carrasco', 83, .8, -31, 0, { noLeash: true });
    k.item('wa_cinzS', 'cinzas_soldado', 96, 0, -42);
    k.zone(68, -30, 80, -23, 0, () => { if (!PROG.flags.carrasco) UI.toast('Uma figura enorme afia um machado.', 3); });
    // ---- ponte e Portão Interior (arena de Brigid) ----
    k.floor(80, -3, 94, 3, 0, CF); k.wall(80, -3, 94, -3, 1.2, CW, { t: .4 }); k.wall(80, 3, 94, 3, 1.2, CW, { t: .4 });
    k.water(60, -60, 140, 60, -7, 0x0e1416, { opacity: .9 });
    k.floor(93, -17, 127, 17, 0, CF);
    ringWalls(k, 110, 0, 17, 16, 10, CW, [-HPI, 0, PI]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + PI / 8; k.pillar(110 + Math.sin(a) * 14, Math.cos(a) * 14, .6, 10, CW); }
    for (const [x, z] of [[100, 9], [120, 9], [100, -9], [120, -9]]) k.brazier(x, z, 0, 1.3);
    k.statue(126, 0, -HPI, 'sword', 3, 0, { head: 'crown' });
    k.fog('brigid', 93.5, 0, 0, HPI, 5, 5.5, 1);
    k.boss('brigid', 117, 0, 0, -HPI, { x: 110, z: 0, r: 15 });
    k.bonfire('walls_portao', 110, 0, 0, { after: 'brigid', spawnYaw: -HPI });
    if (PROG.bossDown.brigid) { PROG.flags.gate_walls_n = 1; PROG.flags.gate_walls_s = 1; }
    k.gate('walls_n', 110, 0, 16.6, 0, { w: 5, h: 5 }); k.gate('walls_s', 110, 0, -16.6, 0, { w: 5, h: 5 });
    k.floor(107, 17, 113, 24, 0, CF); k.floor(107, -24, 113, -17, 0, CF);
    k.spawn('from_forest', 110, 0, 19, PI); k.spawn('from_swamp', 110, 0, -19, 0);
    k.exit(110, 0, 22.5, 'forest', 'start', 'Seguir para o Bosque de Cinza', { cond: () => PROG.bossDown.brigid });
    k.exit(110, 0, -22.5, 'swamp', 'start', 'Descer ao Pântano das Velas', { cond: () => PROG.bossDown.brigid });
    invisRect(-5, -45, 128, 25, -10, 40);
  },
};

// ---------------------------------------------------------------- PÂNTANO DAS VELAS
AREAS.swamp = {
  lvl: 1.35, music: 'swamp', killY: -14,
  env: { fog: 0x1a2420, fogD: .042, bg: 0x0a100e, sky: 0x6a8a80, ground: 0x1a1a10, hemi: .5, moonC: 0x9ac8b0, moonI: .7, moonDir: [-.2, .7, .6], exposure: 1.15, bloomStr: .7, bloomTh: .75 },
  amb: { l_night: .5, l_drops: .25, l_owl: .2 }, weather: 'fireflies',
  build(k) {
    k.sky({ top: 0x08100e, bot: 0x2a3a30, moonDir: [-.2, .7, .6], moonC: 0xd8f0e0, stars: .5 });
    const path = [[0, -66], [0, -40], [-4, -22], [6, -6], [0, 12], [-2, 30], [0, 52]];
    const isl = [[-30, 2, 9], [30, 12, 9], [-44, 46, 7], [0, -30, 8], [0, 74, 16], [18, 38, 6]];
    const hf = (x, z) => {
      let h = -.95 + wfbm(x * .07, z * .07, 3, 11) * .9;
      const dp = distPath(x, z, path); h = Math.max(h, lerp(.05, -.5, smooth(1.5, 4.5, dp)));
      for (const [ix, iz, r] of isl) h = Math.max(h, lerp(.25, -.9, smooth(r * .7, r * 1.2, Math.hypot(x - ix, z - iz))));
      return h;
    };
    k.terrain(-70, -75, 70, 100, hf, 'mud', 2);
    k.water(-70, -75, 70, 100, -.3, 0x14221c, { opacity: .82 });
    // poças venenosas (mais fundas e verdes)
    for (const [x0, z0, x1, z1] of [[14, -24, 30, -10], [-26, 20, -12, 34], [20, 50, 40, 64]]) { k.water(x0, z0, x1, z1, -.26, 0x3a5a10, { opacity: .7, poison: 14 }); }
    // entrada
    k.spawn('start', 0, 0, -63, 0);
    k.floor(-2, -72, 2, -64, .3, 'wood'); k.exit(0, .3, -67.5, 'walls', 'from_swamp', 'Subir às Muralhas', { r: 2.2 });
    // cais e fogueira
    k.floor(-5, -34, 5, -26, .3, 'wood'); for (const [x, z] of [[-4.6, -33.6], [4.6, -33.6], [-4.6, -26.4], [4.6, -26.4]]) k.box(x, -1.5, z, .3, 1.8, .3, 'wood_dark', { walk: false });
    k.bonfire('swamp_cais', 0, .3, -30, { spawnYaw: 0 });
    // passadiços (tábuas)
    const walk = (x0, z0, x1, z1) => { const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), r = Math.atan2(dx, dz); k.box((x0 + x1) / 2, -.2, (z0 + z1) / 2, 2.2, .45, L, 'wood', { rot: r }); };
    walk(0, -26, -4, -12); walk(-4, -12, 6, 2); walk(6, 2, 0, 18);
    // velas por todo o lado (luz!)
    const candleSpots = [[-2, -20], [5, -4], [-3, 10], [2, 26], [-1, 44], [-28, -2], [-33, 6], [27, 8], [34, 16], [-44, 44], [16, 36], [-6, 64], [6, 64]];
    for (const [x, z] of candleSpots) k.candles(x, z, 6, .6, hf(x, z) + .02);
    // árvores do pântano
    for (let i = 0; i < 46; i++) { const x = rnd(-66, 66), z = rnd(-70, 95); if (distPath(x, z, path) < 4 || isl.some(([a, b, r]) => Math.hypot(x - a, z - b) < r)) continue; k.tree(x, z, rnd(1, 1.7), 'swamp'); }
    // ilha oeste: cabana das bruxas
    const hx = -30, hz = 2;
    k.room(hx - 4, hz - 3, hx + 4, hz + 3, 3.4, 'wood_dark', 'wood', { y: .25, ceil: 'wood', doors: [{ side: 'e', at: 3, w: 1.8, h: 2.6 }] });
    k.candles(hx - 2, hz, 7, .8, .25); k.item('sw_chave', 'chave_capela', hx - 3, .25, hz + 2);
    k.enemy('bruxa', hx - 1, .25, hz - 1, HPI); k.enemy('bruxa', hx + 6, hf(hx + 6, hz + 4), hz + 4, HPI);
    // ilha leste: capela afogada (trancada) com o Livro das Velas
    const cx = 30, cz = 12;
    k.room(cx - 5, cz - 4, cx + 5, cz + 6, 7, 'cath_wall', 'marble', { y: .25, ceil: 'cath_wall', doors: [{ side: 'w', at: 4, w: 2.2, h: 3.2 }] });
    k.door('sw_capela', cx - 5, .25, cz, HPI, { key: 'chave_capela', w: 2.2, h: 3.2 });
    k.box(cx + 3, .25, cz + 1, 1.2, 1, 2.4, 'stone_statue'); k.item('sw_fogo', 'sk_fogo', cx + 3, 1.25, cz + 1); k.candles(cx + 3, cz + 1, 9, 1.4, .25);
    k.window(cx + 4.6, 4, cz + 1, -HPI, 1.4, 3, 0x90ffb0, false); k.enemy('afogado', cx - 7, -.3, cz + 2, HPI);
    // ilha secreta (noroeste)
    k.item('sw_carta2', 'carta2', -45, hf(-45, 47) + .02, 47); k.item('sw_lagrima', 'lagrima', -41, hf(-41, 44) + .02, 44);
    k.enemy('inchado', -42, hf(-42, 41), 41, 0); k.enemy('inchado', -47, hf(-47, 43), 43, 1); k.statue(-46, 50, PI, 'weep', 1.5, hf(-46, 50));
    k.msg(-38, hf(-38, 36), 36, 'Uma carta perdida aguarda quem se perde.');
    // inimigos do caminho
    k.enemy('afogado', 2, -.3, -18, PI, { trigger: 4.5 }); k.enemy('afogado', -6, -.3, -8, PI); k.enemy('afogado', 8, -.3, 8, PI); k.enemy('afogado', -4, -.3, 22, PI, { trigger: 4 });
    k.enemy('inchado', 3, hf(3, -2), -2, PI); k.enemy('inchado', -3, hf(-3, 36), 36, PI);
    k.enemy('bruxa', 6, hf(6, 26), 26, PI); k.enemy('bruxa', -5, hf(-5, 48), 48, PI);
    k.enemy('oco', -2, hf(-2, 14), 14, PI, { lvl: 1.3 }); k.enemy('oco', 1, hf(1, 31), 31, PI, { lvl: 1.3 }); k.enemy('oco', 17, hf(17, 38), 38, -HPI);
    k.enemy('afogado', 16, -.3, 32, PI); k.enemy('afogado', -8, -.3, 56, PI);
    k.item('sw_frag', 'fragmento', 18, hf(18, 40) + .02, 40); k.item('sw_cinz', 'cinzas_soldado', 3, hf(3, -40) + .02, -40);
    // calçada para a capela do véu
    k.floor(-2.5, 52, 2.5, 60, .25, 'castle_floor');
    k.fog('vesper', 0, .25, 59.5, 0, 5, 5, 1);
    k.floor(-15, 60, 15, 90, .3, 'marble');
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; const x = Math.sin(a) * 13.5, z = 75 + Math.cos(a) * 13.5; if (Math.abs(x) < 3 && z < 70) continue; k.pillar(x, z, .55, 9 + (i % 3) * 2, 'cath_wall', { y: .3 }); if (i % 2) k.banner(x, 8, z, a + PI, 'cloth_purple', 1, 5); }
    k.statue(0, 88, PI, 'pray', 2.6, .3); k.candles(-3, 86, 8, 1, .3); k.candles(3, 86, 8, 1, .3);
    k.boss('vesper', 0, .3, 80, PI, { x: 0, z: 75, r: 13 });
    k.bonfire('swamp_vesper', 0, .3, 72, { after: 'vesper', spawnYaw: 0 });
    addLight(0, 6, 75, 0xb8a0ff, 2, 18, .1);
    invisRect(-60, -70, 60, 92, -10, 30);
  },
};

// ---------------------------------------------------------------- BOSQUE DE CINZA
AREAS.forest = {
  lvl: 1.35, music: 'forest', killY: -20,
  env: { fog: 0x2a2630, fogD: .028, bg: 0x14121a, sky: 0xa0a0c8, ground: 0x2a2420, hemi: .55, moonC: 0xc8d4ff, moonI: 1.25, moonDir: [.2, .55, .8], exposure: 1.1, bloomStr: .6, bloomTh: .78 },
  amb: { l_wind: .45, l_owl: .3, l_night: .35 }, weather: 'embers',
  build(k) {
    k.sky({ top: 0x0a0a1a, bot: 0x3a3040, moonDir: [.2, .55, .8], moonC: 0xf0f0ff });
    const path = [[0, -78], [2, -55], [-6, -35], [0, -18], [8, 0], [2, 18], [-4, 30], [0, 44]];
    const flat = [[0, -18, 12, .2], [0, 62, 19, 1.2], [-30, 6, 9, 1.8], [32, 26, 6, 6.5], [38, -40, 7, 1]];
    const hf = (x, z) => {
      let h = wfbm(x * .045, z * .045, 4, 21) * 7 - 2.5;
      const dp = distPath(x, z, path); h = lerp(h, lerp(0, h, .25), 1 - smooth(3, 9, dp));
      for (const [fx, fz, r, fy] of flat) h = lerp(fy, h, smooth(r, r * 1.5, Math.hypot(x - fx, z - fz)));
      h += smooth(40, 52, Math.abs(x)) * 18;
      return h;
    };
    // a encosta até ao penhasco (talismã)
    k.terrain(-56, -85, 56, 85, hf, 'ash', 2);
    const T = (x, z) => hf(x, z);
    k.spawn('start', 0, T(0, -76), -76, 0);
    k.exit(0, T(0, -80), -80.5, 'walls', 'from_forest', 'Voltar às Muralhas', { r: 2.4 });
    // floresta de cinza
    const r = mulberry(77);
    for (let i = 0; i < 120; i++) { const x = (r() - .5) * 100, z = -82 + r() * 165; if (distPath(x, z, path) < 4.5 || flat.some(([a, b, rr]) => Math.hypot(x - a, z - b) < rr + 1) || Math.abs(x) > 48) continue; k.tree(x, z, .9 + r() * .9, i % 5 ? 'ash' : 'dead', T(x, z)); }
    for (let i = 0; i < 40; i++) { const x = (r() - .5) * 96, z = -80 + r() * 160; if (distPath(x, z, path) < 3) continue; k.rock(x, z, .5 + r() * 1.6, T(x, z), i % 4); }
    // clareira dos caçadores (fogueira + Maren)
    k.bonfire('forest_clareira', 0, T(0, -18), -18, { spawnYaw: 0 });
    maren('maren_f', -3.4, T(-3.4, -16.2), -16.2, 2.2, 'maren_forest');
    for (const [x, z] of [[6, -22], [-6, -24]]) k.box(x, T(x, z) - .2, z, 1, .9, 2.6, 'wood', { rot: .6 });
    k.enemy('lobo', 2, T(2, -50), -50, PI); k.enemy('lobo', -3, T(-3, -53), -53, PI); k.enemy('lobo', 4, T(4, -55), -55, PI);
    k.enemy('cacador', -12, T(-12, -38), -38, HPI); k.enemy('cacador', 12, T(12, -30), -30, -HPI);
    k.msg(1, T(1, -64), -64, 'Ouve os lobos. Eles caçam em matilha.');
    // cabana dos caçadores (oeste) — Giro do Lobo
    const lx = -30, lz = 6, ly = 1.8;
    k.room(lx - 5, lz - 4, lx + 5, lz + 4, 3.6, 'wood_dark', 'wood', { y: ly, ceil: 'wood', doors: [{ side: 'e', at: 4, w: 2, h: 2.8 }] });
    k.box(lx - 2, ly, lz, 2, .9, 1.2, 'wood'); k.item('fo_giro', 'sk_giro', lx - 2, ly + .9, lz); k.candles(lx - 3.5, lz + 3, 4, .3, ly); k.brazier(lx + 7, lz + 3, T(lx + 7, lz + 3), .9);
    k.enemy('cacador', lx + 7, T(lx + 7, lz - 3), lz - 3, HPI, { lvl: 1.5 }); k.enemy('lobo', lx + 9, T(lx + 9, lz + 1), lz + 1, HPI); k.enemy('lobo', lx + 10, T(lx + 10, lz + 4), lz + 4, HPI);
    // ent no oco da árvore (talismã da lua morta)
    k.enemy('ent', 34, T(34, -36), -36, -2.4); k.tree(40, -42, 2.6, 'dead', T(40, -42)); k.item('fo_lua', 'tal_lua', 38.5, T(38.5, -40) + .05, -40);
    // penhasco do talismã do fôlego
    k.item('fo_folego', 'tal_folego', 33, T(33, 27) + .05, 27); k.enemy('cacador', 30, T(30, 24), 24, -2.5, { lvl: 1.4 });
    // caminho central
    k.enemy('lobo', 9, T(9, 2), 2, PI); k.enemy('lobo', 6, T(6, 5), 5, PI); k.enemy('ent', -2, T(-2, 22), 22, PI);
    k.enemy('cacador', 14, T(14, 12), 12, -HPI); k.enemy('cacador', -12, T(-12, 26), 26, HPI); k.enemy('lobo', -6, T(-6, 36), 36, PI); k.enemy('lobo', 4, T(4, 38), 38, PI);
    k.item('fo_frag', 'fragmento', -14, T(-14, 30) + .05, 30); k.item('fo_cinz', 'cinzas_soldado', 18, T(18, 14) + .05, 14);
    for (const [x, z] of [[-1, -34], [7, 2], [-4, 31]]) k.brazier(x + 3, z, T(x + 3, z), .9);
    // Trono da Lua Morta (arena de Selene)
    const ay = 1.2;
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) k.rock(s * (4 + i * 1.6), 44 + i * .6, 2.4 + rnd(0, 1), T(s * (4 + i * 1.6), 44) - .5, i % 4);
    k.fog('selene', 0, T(0, 44), 44, 0, 6, 6, 1);
    k.tree(0, 79, 4.5, 'dead', ay); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; if (Math.abs(angDiff(a, PI)) < .4) continue; k.rock(Math.sin(a) * 19.5, 62 + Math.cos(a) * 19.5, 2.5 + rnd(0, 1.5), ay - .5, i % 4); }
    for (const [x, z] of [[-12, 54], [12, 54], [-12, 70], [12, 70]]) k.brazier(x, z, ay, 1.1);
    k.boss('selene', 0, ay, 70, PI, { x: 0, z: 62, r: 16 });
    k.bonfire('forest_selene', 0, ay, 58, { after: 'selene', spawnYaw: 0 });
    addLight(0, 14, 62, 0xc8d8ff, 2.5, 26, 0);
    invisRect(-48, -82, 48, 82, -10, 40);
    const ring = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; ring.push([Math.sin(a) * 20, 62 + Math.cos(a) * 20]); }
    for (let i = 0; i < ring.length; i++) { const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length]; const am = Math.atan2((ax + bx) / 2, (az + bz) / 2 - 62); if (Math.abs(angDiff(am, PI)) < .3) continue; addSolidBox((ax + bx) / 2, (az + bz) / 2, Math.hypot(bx - ax, bz - az) / 2 + .3, .5, Math.atan2(bx - ax, bz - az) + HPI, -5, 30, { walk: false, cam: false }); }
  },
};
