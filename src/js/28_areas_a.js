// ===================== ÁREAS I: CRIPTA E SANTUÁRIO =====================
Object.assign(BONFIRE_LIST, {
  crypt_galeria: { area: 'crypt', name: 'Galeria dos Votos' },
  crypt_odile: { area: 'crypt', name: 'Capela do Lamento' },
  hub: { area: 'hub', name: 'A Última Chama' },
  walls_patio: { area: 'walls', name: 'Pátio dos Besteiros' },
  walls_portao: { area: 'walls', name: 'Portão Interior' },
  swamp_cais: { area: 'swamp', name: 'Cais Afogado' },
  swamp_vesper: { area: 'swamp', name: 'Capela do Véu' },
  forest_clareira: { area: 'forest', name: 'Clareira dos Caçadores' },
  forest_selene: { area: 'forest', name: 'Trono da Lua Morta' },
  forge_bigorna: { area: 'forge', name: 'Grande Bigorna' },
  forge_hilde: { area: 'forge', name: 'Coração da Forja' },
  cath_nave: { area: 'cathedral', name: 'Nave Apagada' },
  cath_trono: { area: 'cathedral', name: 'Sala do Trono' },
  heart_limiar: { area: 'heart', name: 'Limiar do Lume' },
});
// rótulos de controlo para as dicas, por dispositivo
function ctl(a) {
  const d = IN.touch ? 't' : IN.lastDevice === 'pad' ? 'p' : 'k';
  const M = { atk: ['botão da espada', 'RB', 'clique esquerdo / J'], heavy: ['botão do martelo', 'RT', 'clique direito / K'], roll: ['botão de rolar', 'B', 'Espaço'], jump: ['botão de saltar', 'A', 'F'], lock: ['botão do olho', 'R3', 'Q'], flask: ['botão do frasco', 'X', 'R'], skill: ['botão de habilidade', 'LB', 'C'], next: ['botão ⟳', 'LT', 'Tab / roda do rato'], use: ['botão que aparece', 'Y', 'E'] };
  return '<b>' + M[a][{ t: 0, p: 1, k: 2 }[d]] + '</b>';
}
// helpers de construção partilhados
function torchRow(k, x0, z0, x1, z1, y, n, yaw) { for (let i = 0; i < n; i++) { const t = n === 1 ? .5 : i / (n - 1); k.torch(lerp(x0, x1, t), y, lerp(z0, z1, t), yaw); } }
function nunLook() { return buildHumanoid({ s: .95, female: true, mats: { skin: MAT('skin_pale'), body: MAT('cloth_white'), legs: MAT('cloth_white'), arms: MAT('cloth_white'), boots: MAT('leather'), accent: MAT('gold'), veil: MAT('cloth_white'), hair: MAT('cloth_grey') }, head: 'veil', skirt: { len: 1, r1: .55, mat: MAT('cloth_white') } }); }

// ---------------------------------------------------------------- CRIPTA
AREAS.crypt = {
  lvl: 1, music: 'crypt', killY: -20,
  env: { fog: 0x07060a, fogD: .04, bg: 0x040306, sky: 0x6a6a90, ground: 0x2a2018, hemi: .5, moonI: .12, moonDir: [-.3, 1, .2], exposure: 1.15, bloomStr: .6, bloomTh: .78 },
  amb: { l_cavewind: .45, l_drops: .35 }, weather: 'motes',
  build(k) {
    const W = 'crypt_wall', F = 'crypt_floor';
    // A: Câmara do Despertar
    k.room(-5, -6, 5, 6, 5, W, F, { ceil: W, doors: [{ side: 'n', at: 5, w: 2.6, h: 3.4 }] });
    k.coffin(0, -4.6, HPI, 0, true); k.coffin(-3.7, -3, 0); k.coffin(3.7, -3, 0); k.coffin(-3.7, 2, 0, 0, true); k.coffin(3.7, 2, 0);
    k.candles(-4, -5.2, 6, .5); k.candles(4, -5.2, 5, .5); k.candles(0, 5, 4, .4); k.torch(-4.6, 2.2, -.5, HPI); k.torch(4.6, 2.2, -.5, -HPI);
    k.bones(2, 3.8); k.bones(-1.5, 4.2);
    k.spawn('start', 0, 0, -2.6, 0);
    k.msg(-1.4, 0, -1.6, 'Não és o primeiro a acordar aqui. Sê o último a cair.');
    // corredor 1
    k.corridorZ(0, 6, 18, 3.2, 4.2, W, F, { ceil: W });
    k.torch(1.3, 2.3, 9.5, -HPI); k.torch(-1.3, 2.3, 14.5, HPI);
    k.zone(-2, 6.5, 2, 9, 0, () => UI.tut('Há algo à frente. Usa ' + ctl('lock') + ' para travar a mira e ' + ctl('atk') + ' para atacar. ' + ctl('heavy') + ' faz um golpe forte.', 9));
    k.enemy('oco', 0, 0, 13, PI, { sleep: true });
    k.enemy('oco', .6, 0, 16.8, PI);
    // B: Galeria dos Votos
    k.room(-10, 18, 10, 38, 8, W, F, { ceil: W, doors: [{ side: 's', at: 10, w: 3.2, h: 4.2 }, { side: 'n', at: 10, w: 2.6, h: 3.4 }, { side: 'w', at: 10, w: 2.6, h: 3.4 }, { side: 'e', at: 10, w: 2.6, h: 3.4 }] });
    for (const x of [-5, 5]) for (const z of [22, 28, 34]) k.pillar(x, z, .5, 8, W);
    k.sarcophagus(-7.6, 25); k.sarcophagus(7.6, 24); k.sarcophagus(-7.6, 33); k.sarcophagus(7.6, 32);
    k.statue(-3, 36.6, PI, 'weep'); k.statue(3, 36.6, PI, 'pray');
    k.candles(-3, 35.2, 6, .6); k.candles(3, 35.2, 6, .6); k.brazier(-2.6, 19.6); k.brazier(2.6, 19.6);
    for (const z of [24, 31]) k.chainHang(rnd(-2, 2), 8, z, rnd(2, 4));
    k.banner(-9.5, 6.5, 30, HPI, 'cloth_red', 1.2, 3); k.banner(9.5, 6.5, 30, -HPI, 'cloth_red', 1.2, 3);
    k.bonfire('crypt_galeria', -7.4, 0, 20.6, { spawn: [-6, 21.4], spawnYaw: -2.2 });
    k.item('cr_cinz1', 'cinzas_pequenas', 7.6, 1.1, 32);
    k.enemy('oco', -2.4, 0, 33.5, PI); k.enemy('oco', 2.6, 0, 34.5, PI, { lvl: 1.1 });
    k.enemy('oco', 0, 0, 27, PI, { patrol: [[-2.5, 26], [2.5, 30]] });
    k.enemy('rastejante', 8.4, 0, 28.5, -HPI);
    k.zone(-9, 19, -4, 23, 0, () => UI.tut('Fogueira. Usa ' + ctl('use') + ' para a acender. Descansar cura-te e enche os frascos, mas os mortos voltam.', 8));
    // C: Capela Lateral (oeste)
    k.room(-22, 22, -10, 34, 5.5, W, F, { ceil: W, skip: ['e'], doors: [{ side: 'w', at: 6, w: 2.4, h: 3.2 }] });
    k.box(-16, 0, 33.3, 3, 1.1, .9, W); k.candles(-16, 33.2, 7, .9, 1.1); k.statue(-16, 33.4, PI, 'kneel', 1.4, 1.1, { base: 0 });
    k.chest('cr_chest1', 'tal_vigor', -20.4, 0, 24, HPI);
    k.torch(-11, 2.3, 23.2, 0); k.bones(-14, 31); k.bones(-20, 31);
    k.enemy('rastejante', -14, 0, 25, HPI); k.enemy('rastejante', -18.5, 0, 31, 2); k.enemy('rastejante', -19.5, 0, 26.5, 1.4); k.enemy('oco', -16.5, 0, 28.5, HPI, { sleep: true });
    k.msg(-20.6, 0, 28, 'Parede ilusória à frente... ou talvez não.');
    k.breakable(-22, 0, 28, .9, 3.2, 2.4, 0, W);
    // sala secreta
    k.room(-28, 25, -22, 31, 4, W, F, { ceil: W, skip: ['e'] });
    k.item('cr_carta1', 'carta1', -26.6, 0, 28); k.candles(-27.2, 26, 4, .3); k.candles(-27.2, 30, 3, .3); k.bones(-25, 26.5);
    // ponte para o ossário (leste) + escadas
    k.corridorX(28, 10, 15, 2.6, 4, W, F, { ceil: W });
    k.stairs(19, 28, 2.6, 8, HPI, 0, -4, F);
    k.wall(15, 26.7, 23, 26.7, 8.4, W, { y0: -4.2 }); k.wall(15, 29.3, 23, 29.3, 8.4, W, { y0: -4.2 }); k.ceil(15, 26.2, 23, 29.8, 4, W);
    k.torch(17, 1.5, 27, 0);
    // D: Ossário (inferior)
    k.room(23, 10, 45, 34, 9, W, F, { y: -4, ceil: W, skip: [], doors: [{ side: 'w', at: 18, w: 2.6, h: 3.4 }, { side: 'n', at: 7, w: 2.6, h: 3.4 }] });
    for (const x of [29, 39]) for (const z of [15, 22, 29]) k.pillar(x, z, .55, 9, W, { y: -4 });
    // nichos de ossos (prateleiras)
    for (let z = 12; z < 33; z += 3.2) { k.box(44.2, -4, z, .9, 2.6, 2.4, W, { walk: false }); k.bones(43.4, z, -4); }
    for (let x = 26; x < 44; x += 4) { if (Math.abs(x - 30) < 2) continue; k.box(x, -4, 33.2, 2.6, 2.4, .9, W, { walk: false }); k.bones(x, 32.3, -4); }
    k.box(34, -4, 21.5, 4, .9, 2, 'stone_statue'); k.candles(34, 21.5, 8, 1.4, -3.1); // altar central
    k.brazier(26, 12.5, -4); k.brazier(42, 12.5, -4); k.torch(23.4, -1.6, 20, HPI); k.torch(23.4, -1.6, 33, HPI);
    k.enemy('oco', 31, -4, 18, -1, { lvl: 1.1 }); k.enemy('oco', 37, -4, 26, -2); k.enemy('oco', 41, -4, 15, -2.4, { sleep: true }); k.enemy('oco', 27, -4, 31, 2.4);
    k.enemy('rastejante', 36, -4, 13, 0); k.enemy('rastejante', 43, -4, 30, -2); k.enemy('rastejante', 25, -4, 13, .5);
    k.enemy('oco', 34, -4, 30, PI, { lvl: 1.6, noLeash: true }); // guarda da chave
    k.item('cr_chave', 'chave_cripta', 34, -3.1, 21.5);
    k.item('cr_frag1', 'fragmento', 43.5, -4, 11.5);
    k.msg(26, -4, 26, 'Morto a dormir à esquerda');
    // escadas de volta (norte) e corredor de tumbas
    k.stairs(30, 38, 2.6, 8, 0, -4, 0, F);
    k.wall(28.7, 34, 28.7, 42, 8.4, W, { y0: -4.2 }); k.wall(31.3, 34, 31.3, 42, 8.4, W, { y0: -4.2 }); k.ceil(28.2, 34, 31.8, 42, 4.2, W);
    k.room(6, 42, 34, 50, 5, W, F, { ceil: W, skip: ['w'], doors: [{ side: 's', at: 24, w: 2.6, h: 3.4 }] });
    for (let x = 10; x < 28; x += 4.5) { k.grave(x, 49, PI); k.grave(x + 2, 43, 0, 0, 1); }
    k.enemy('rastejante', 18, 0, 46, -HPI); k.enemy('rastejante', 23, 0, 45, -HPI); k.enemy('oco', 12, 0, 46.5, HPI, { lvl: 1.2 });
    torchRow(k, 10, 49.5, 26, 49.5, 2.4, 3, PI);
    k.item('cr_cinz2', 'cinzas_pequenas', 32.5, 0, 48.5);
    // E: Vestíbulo — atalho para a galeria (porta só abre deste lado)
    k.room(-6, 38, 6, 50, 6, W, F, { ceil: W, skip: ['s'], doors: [{ side: 'e', at: 8, w: 2.6, h: 3.4 }, { side: 'n', at: 6, w: 3, h: 3.6 }] });
    k.door('cr_atalho', 0, 0, 38, 0, { oneWay: 1, w: 2.6, h: 3.4 });
    k.statue(-4.4, 48.6, PI, 'sword', 1.7, 0, { female: true, head: 'helm' }); k.statue(4.4, 48.6, PI, 'sword', 1.7, 0, { female: true, head: 'helm' });
    k.torch(-5.6, 2.4, 42, HPI); k.torch(5.6, 2.4, 40.5, -HPI);
    k.door('cr_funeraria', 0, 0, 50, 0, { key: 'chave_cripta', w: 3, h: 3.6 });
    // G: Galeria Funerária
    k.corridorZ(0, 50, 62, 4, 6, W, F, { ceil: W });
    for (const z of [53, 57, 61]) { k.candles(-1.5, z, 3, .3); k.candles(1.5, z, 3, .3); }
    k.msg(0, 0, 58, 'Ela ainda canta. Não lhe respondas.');
    k.zone(-2, 52, 2, 56, 0, () => { sfx('wail_long', { vol: .35, rate: .8 }); UI.toast('Ouve-se um cântico ao longe...', 3); });
    // Capela do Lamento (arena da Irmã Odile)
    k.room(-15, 62, 15, 92, 13, W, F, { ceil: W, doors: [{ side: 's', at: 15, w: 4, h: 5 }, { side: 'n', at: 15, w: 3.2, h: 4.4 }] });
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + PI / 8; const x = Math.sin(a) * 11.5, z = 77 + Math.cos(a) * 11.5; k.pillar(x, z, .7, 13, W); k.candles(x * .82, 77 + (z - 77) * .82, 5, .5, 0, i % 2 === 0); }
    k.statue(-7, 90.4, PI, 'pray', 2.4); k.statue(7, 90.4, PI, 'weep', 2.4);
    for (const x of [-3.4, 3.4]) k.brazier(x, 89.6, 0, 1.2);
    // escadaria para o Santuário
    k.stairs(0, 96, 3.2, 8, 0, 0, 4, F); k.wall(-1.6, 92, -1.6, 100, 9, W); k.wall(1.6, 92, 1.6, 100, 9, W); k.floor(-1.6, 100, 1.6, 103, 4, F); k.wall(-1.6, 103, 1.6, 103, 6, W, { y0: 4 });
    addLight(0, 7, 101, 0xb8c4f0, 2.5, 10, 0);
    k.banner(-14.5, 10, 77, HPI, 'cloth_white', 2, 6); k.banner(14.5, 10, 77, -HPI, 'cloth_white', 2, 6);
    k.fog('odile', 0, 0, 62, 0, 4.2, 5, 1);
    k.boss('odile', 0, 0, 82, PI, { x: 0, z: 77, r: 12.5 });
    k.bonfire('crypt_odile', 0, 0, 77, { after: 'odile', spawnYaw: 0 });
    k.spawn('from_hub', 0, 0, 89, PI);
    k.exit(0, 4, 101.5, 'hub', 'from_crypt', 'Subir ao Santuário', { r: 2.6 });
    // céu fechado
    R.scene.background = new COL(0x040306);
  },
};

// ---------------------------------------------------------------- SANTUÁRIO (zona central)
AREAS.hub = {
  lvl: 1, music: 'hub', killY: -25,
  env: { fog: 0x1a1820, fogD: .022, bg: 0x0d0c14, sky: 0x8088b0, ground: 0x2a2018, hemi: .55, moonC: 0xb8c4f0, moonI: 1.1, moonDir: [-.5, .8, .45], exposure: 1.1, bloomStr: .55, bloomTh: .8 },
  amb: { l_wind: .4, l_night: .3, l_raven: .15 }, weather: 'ash',
  build(k) {
    k.sky({ top: 0x0a0c1c, bot: 0x3a2e2a, moonDir: [-.5, .8, .45], moonC: 0xe0e4ff });
    // terreno: planalto com encostas
    const hf = (x, z) => { const d = Math.hypot(x, z); return -.15 + (wfbm(x * .06, z * .06, 3, 5) - .3) * 2.2 * smooth(14, 26, d) - smooth(40, 50, d) * 30; };
    k.terrain(-80, -80, 80, 80, hf, 'ground', 2);
    // praça
    k.floor(-13, -13, 13, 13, .02, 'castle_floor');
    for (let i = 0; i < 4; i++) k.stairs([0, 14.5, 0, -14.5][i], [14.5, 0, -14.5, 0][i], 6, 3, [0, HPI, PI, -HPI][i], .02, -.4, 'castle_floor');
    // capela arruinada atrás da chama
    const CW = 'cath_wall';
    k.wall(-9, 9, -9, 18, 7, CW); k.wall(9, 9, 9, 15, 5.5, CW); k.wall(-9, 18, -3, 18, 8, CW); k.wall(3, 18, 9, 16, 4, CW);
    k.arch(0, 18, 4.4, 5.2, 0, CW); k.floor(-9, 9, 9, 18, .05, 'marble');
    for (const x of [-6, 6]) k.pillar(x, 12, .45, x < 0 ? 6.5 : 3.2, 'marble');
    k.window(-8.6, 4.2, 13.5, HPI, 1.8, 4, 0xa0b8ff, false);
    // selo do Coração do Lume (no chão da capela)
    const seal = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), new THREE.MeshBasicMaterial({ map: spriteTex('rune'), color: PROG.bossDown.aldric ? 0xffc070 : 0x5a4a3a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); seal.rotation.x = -HPI; seal.position.set(0, .08, 13); WORLD.group.add(seal);
    if (PROG.bossDown.aldric) { addLight(0, 1.5, 13, 0xffb060, 3, 8, .2); EMIT.wisp && EMIT.wisp(0, .3, 13); }
    k.exit(0, .05, 13, 'heart', 'start', 'Descer ao Coração do Lume', { cond: () => PROG.bossDown.aldric, lockedLabel: 'Selo do Lume', lockedMsg: 'Um selo antigo, morno ao toque. Seis brasas o abririam.', r: 2.2 });
    // a última chama e Ione
    k.bonfire('hub', 0, .02, 3, { spawn: [0, -.4], spawnYaw: 0 });
    new NPC({ id: 'ione', name: 'Ione', x: 1.6, y: .02, z: 4.4, yaw: -2.4, build: nunLook, idleClip: CLIP.sit, look: true, voice: { sex: 'f', pitch: 1.15, rate: .92 } });
    k.candles(-1.6, 4.6, 6, .5, .02); k.candles(2.6, 2, 4, .4, .02, false);
    // ferreiro Hrolf
    k.box(-9.5, .02, -5, 1.4, .8, .7, 'iron'); k.brazier(-11.5, -7, .02, 1.1); k.box(-12, .02, -3, 2, 2.4, 1.2, 'wood_dark');
    new NPC({ id: 'hrolf', name: 'Hrolf', x: -8.2, y: .02, z: -6.2, yaw: .9, build: () => buildHumanoid({ s: 1.05, bulk: 1.3, female: false, mats: { skin: MAT('skin_ash'), body: MAT('leather'), legs: MAT('cloth_dark'), arms: MAT('skin_ash'), boots: MAT('leather'), accent: MAT('iron'), hair: MAT('cloth_grey') }, head: 'bare' }), idleClip: CLIP.sit, look: true, voice: { sex: 'm', pitch: .6, rate: .9 } });
    WORLD.npcs.hrolf.afterTalk = () => { if (PROG.flags.hrolf1) UI.menu(smithMenu()); };
    // escadas para a cripta (sul)
    k.floor(-2.5, -24, 2.5, -19, -.35, 'castle_floor'); k.box(-2.8, -.4, -21.5, .4, 1.4, 5, 'castle_wall'); k.box(2.8, -.4, -21.5, .4, 1.4, 5, 'castle_wall');
    k.spawn('from_crypt', 0, -.3, -18.5, 0);
    k.exit(0, -.35, -23, 'crypt', 'from_hub', 'Descer à Cripta', { r: 2.4 });
    glowSprite(WORLD.group, 0, .2, -23.5, 2.2, 0xffa050, .4);
    // estrada para as muralhas (leste)
    k.floor(13, -2.5, 40, 2.5, .04, 'cobble');
    k.arch(40, 0, 4.4, 5, HPI, 'castle_wall');
    k.torch(39.4, 2.6, -3.1, -HPI); k.torch(39.4, 2.6, 3.1, -HPI);
    k.spawn('from_walls', 37, 0, 0, -HPI);
    k.exit(41, 0, 0, 'walls', 'start', 'Seguir para as Muralhas', { r: 2.6 });
    // elevador da forja (oeste)
    k.floor(-40, -3, -13, 3, .04, 'cobble');
    k.box(-42, 0, 0, .6, 8, 5, 'iron', { walk: false }); k.box(-40, 0, -2.7, 4, 8, .5, 'iron', { walk: false }); k.box(-40, 0, 2.7, 4, 8, .5, 'iron', { walk: false }); k.box(-40, 7.6, 0, 4, .5, 5.8, 'iron', { walk: false });
    k.floor(-41.6, -2.4, -38.4, 2.4, .1, 'wood'); k.brazier(-36.5, -4, .04); k.brazier(-36.5, 4, .04);
    k.spawn('from_forge', -36, 0, 0, HPI);
    k.exit(-40, .1, 0, 'forge', 'start', 'Descer à Forja', { cond: () => PROG.bossDown.vesper && PROG.bossDown.selene, lockedLabel: 'Elevador parado', lockedMsg: 'As correntes estão presas por um selo de luz e lua. Dois sinos têm de calar.', r: 2.6 });
    // ponte da catedral (norte, para lá da capela)
    k.floor(-2.5, 19, 2.5, 46, .04, 'cobble'); k.floor(-3, 46, 3, 70, .2, 'castle_floor');
    k.wall(-3, 46, -3, 70, 1.1, 'castle_wall', { t: .4 }); k.wall(3, 46, 3, 70, 1.1, 'castle_wall', { t: .4 });
    if (PROG.bossDown.hilde) PROG.flags.gate_hub_ponte = 1; k.gate('hub_ponte', 0, .2, 46, 0, { w: 6, h: 5 });
    for (const z of [50, 58, 66]) k.box(0, -32, z, 5.6, 32, 1.6, 'castle_wall', { walk: false });
    k.spawn('from_cathedral', 0, .2, 66, PI);
    k.exit(0, .2, 69, 'cathedral', 'start', 'Atravessar para a Catedral', { cond: () => PROG.bossDown.hilde, r: 2.6 });
    for (const z of [50, 58, 66]) { k.torch(-2.7, 1.8, z, HPI); }
    // ruínas e exploração
    const ruins = [[-22, -18, .3], [24, -20, -.6], [-26, 16, 1.1], [26, 18, -1.3]];
    for (const [x, z, r] of ruins) { const y = hf(x, z); k.box(x, y - .3, z, 6, 3 + rnd(0, 2), .8, 'castle_wall', { rot: r }); k.box(x + Math.cos(r) * 3, y - .3, z - Math.sin(r) * 3, .8, 2.2, 4, 'castle_wall', { rot: r }); }
    // cemitério a sudeste com um item
    for (let i = 0; i < 14; i++) { const x = 18 + (i % 5) * 2.4 + rnd(-.3, .3), z = -10 - Math.floor(i / 5) * 2.6; k.grave(x, z, rnd(-.2, .2), hf(x, z), i % 3 === 0 ? 1 : 0); }
    k.item('hub_cinz', 'cinzas_pequenas', 28.5, hf(28.5, -15) + .05, -15);
    k.msg(17, hf(17, -9), -9, 'Aqui jaz alguém que desistiu. Tu não.');
    // árvores mortas e rochas
    for (let i = 0; i < 26; i++) { const a = rnd(0, TAU), d = rnd(20, 40); const x = Math.cos(a) * d, z = Math.sin(a) * d; if (Math.abs(z) < 5 || Math.abs(x) < 5) continue; if (i % 3) k.tree(x, z, rnd(.9, 1.5), 'dead'); else k.rock(x, z, rnd(.7, 1.8)); }
    const gap = a => Math.min(...[0, HPI, PI].map(g => Math.abs(angDiff(a, g)))) < .16;
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; if (gap(a)) continue; const x = Math.cos(a) * 41.5, z = Math.sin(a) * 41.5; k.rock(x, z, rnd(1.1, 2.2), hf(x, z), i % 4); }
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU + rnd(-.1, .1), d = rnd(100, 140); k.rock(Math.cos(a) * d, Math.sin(a) * d, rnd(14, 30), -34, i % 4, false); }
    // limite invisível (com aberturas nas três saídas)
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; if (gap(a)) continue; addSolidBox(Math.cos(a) * 41, Math.sin(a) * 41, 5.6, .5, -a + HPI, -10, 20, { walk: false, cam: false }); }
    k.wall(40, -14, 40, -2.6, 7, 'castle_wall'); k.wall(40, 2.6, 40, 14, 7, 'castle_wall');
    // iluminação: braseiros na praça
    for (const [x, z] of [[-11, 11], [11, 11], [-11, -11], [11, -11]]) k.brazier(x, z, .02, 1.1);
    k.spawn('start', 0, .02, -1, 0); k.spawn('from_heart', 0, .05, 10.5, PI);
  },
  onEnter() { if (!PROG.flags.hubIntro) { PROG.flags.hubIntro = 1; after(2, () => UI.tut('No Santuário estás a salvo. Fala com quem encontrares com ' + ctl('use') + '.', 7)); } },
};
