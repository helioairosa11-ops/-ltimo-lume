// ===================== INIMIGOS =====================
const ENEMIES = [];
// ---------- construtores de visual ----------
const ELOOK = {
  oco: () => buildHumanoid({ s: .98, bulk: .9, mats: { skin: MAT('skin_dead'), body: MAT('cloth_grey'), arms: MAT('skin_dead'), legs: MAT('cloth_dark'), boots: MAT('skin_dead') }, head: 'bare', skirt: { len: .35, r1: .26, mat: MAT('cloth_grey') } }),
  rastejante: () => buildHumanoid({ s: .9, bulk: .8, mats: { skin: MAT('skin_ash'), body: MAT('skin_ash'), arms: MAT('skin_ash'), legs: MAT('skin_ash'), boots: MAT('skin_ash') }, head: 'bare' }),
  soldado: () => buildHumanoid({ s: 1.02, bulk: 1.05, mats: { skin: MAT('skin_dead'), body: MAT('dark_steel'), arms: MAT('cloth_red'), legs: MAT('cloth_dark'), boots: MAT('iron'), accent: MAT('dark_steel') }, head: 'helm', pauldrons: MAT('dark_steel'), skirt: { len: .4, r1: .3, mat: MAT('cloth_red') } }),
  besteiro: () => buildHumanoid({ s: 1, mats: { skin: MAT('skin_dead'), body: MAT('leather'), arms: MAT('cloth_red'), legs: MAT('cloth_dark'), boots: MAT('leather'), accent: MAT('iron') }, head: 'helm' }),
  carrasco: () => buildHumanoid({ s: 1.45, bulk: 1.35, mats: { skin: MAT('skin_dead'), body: MAT('leather'), arms: MAT('skin_dead'), legs: MAT('cloth_dark'), boots: MAT('leather') }, head: 'hood', skirt: { len: .55, r1: .45, mat: MAT('leather') } }),
  afogado: () => buildHumanoid({ s: 1.05, bulk: .9, mats: { skin: MAT('skin_ash', { color: 0x4f5a4a }), body: MAT('cloth_green'), arms: MAT('skin_ash', { color: 0x4f5a4a }), legs: MAT('cloth_green'), boots: MAT('skin_ash', { color: 0x4f5a4a }) }, head: 'hair', skirt: { len: .6, r1: .32, mat: MAT('cloth_green'), flare: .05 } }),
  bruxa: () => buildHumanoid({ s: .95, female: true, mats: { skin: MAT('skin_pale', { color: 0x9a9080 }), body: MAT('cloth_purple'), arms: MAT('cloth_purple'), legs: MAT('cloth_purple') }, head: 'veil', skirt: { len: .85, r1: .45, mat: MAT('cloth_purple'), flare: .03 } }),
  inchado: () => buildHumanoid({ s: 1.05, bulk: 1.9, mats: { skin: MAT('skin_ash', { color: 0x6a704e }), body: MAT('skin_ash', { color: 0x6a704e }), arms: MAT('skin_ash', { color: 0x6a704e }), legs: MAT('cloth_green'), boots: MAT('skin_ash', { color: 0x6a704e }) }, head: 'bare' }),
  cacador: () => buildHumanoid({ s: 1, mats: { skin: MAT('skin_dead'), body: MAT('leather'), arms: MAT('cloth_green'), legs: MAT('leather'), boots: MAT('leather') }, head: 'hood', cape: { mat: MAT('cloth_green'), len: .9, w: .4 } }),
  ent: () => buildHumanoid({ s: 1.9, bulk: 1.3, mats: { skin: MAT('bark'), body: MAT('bark'), arms: MAT('bark'), legs: MAT('bark'), boots: MAT('bark') }, head: 'bare' }),
  ferreiro: () => buildHumanoid({ s: 1.12, bulk: 1.3, mats: { skin: MAT('skin_ash', { color: 0x5a4a40 }), body: MAT('leather'), arms: MAT('skin_ash', { color: 0x5a4a40 }), legs: MAT('cloth_dark'), boots: MAT('iron') }, head: 'bare', skirt: { len: .55, r1: .34, mat: MAT('leather') } }),
  golem: () => buildHumanoid({ s: 1.75, bulk: 1.5, mats: { skin: MAT('forge_floor'), body: MAT('forge_floor'), arms: MAT('forge_floor'), legs: MAT('forge_floor'), boots: MAT('forge_floor') }, head: 'bare', headScale: .8 }),
  cavaleiro: () => buildHumanoid({ s: 1.12, bulk: 1.15, mats: { skin: MAT('skin_dead'), body: MAT('steel'), arms: MAT('steel'), legs: MAT('dark_steel'), boots: MAT('steel'), accent: MAT('steel') }, head: 'helm', plume: MAT('cloth_white'), pauldrons: MAT('steel'), cape: { mat: MAT('cloth_white'), len: 1.2, w: .5 }, skirt: { len: .45, r1: .34, mat: MAT('cloth_white') } }),
  clerigo: () => buildHumanoid({ s: 1, mats: { skin: MAT('skin_pale'), body: MAT('cloth_white'), arms: MAT('cloth_white'), legs: MAT('cloth_white') }, head: 'hood', skirt: { len: .9, r1: .48, mat: MAT('cloth_white') }, mask: MAT('gold') }),
  gargula: () => buildHumanoid({ s: 1.2, bulk: 1.1, mats: { skin: MAT('stone_statue'), body: MAT('stone_statue'), arms: MAT('stone_statue'), legs: MAT('stone_statue'), boots: MAT('stone_statue') }, head: 'bare' }),
  eco: () => buildHumanoid({ s: 1, mats: { skin: MAT('shadow_body'), body: MAT('shadow_body'), arms: MAT('shadow_body'), legs: MAT('shadow_body'), boots: MAT('shadow_body') }, head: 'hood', cape: { mat: MAT('shadow_body'), len: 1.1 } }),
  vigia: () => buildHumanoid({ s: 1.3, bulk: 1.2, mats: { skin: MAT('ember'), body: MAT('gold'), arms: MAT('dark_steel'), legs: MAT('dark_steel'), boots: MAT('gold'), accent: MAT('gold') }, head: 'helm', pauldrons: MAT('gold'), cape: { mat: MAT('cloth_red'), len: 1.3 } }),
};
// ---------- golpes padrão ----------
const EATK = {
  slashR: (o = {}) => Object.assign({ wind: .55, act: .16, rec: .55, psi: -10, th0: -120, th1: 70, mvA: 2.5, track: 5, poise: 25, body: { twist: .6, lean: .25 } }, o),
  slashL: (o = {}) => Object.assign({ wind: .45, act: .16, rec: .55, psi: 15, th0: 85, th1: -110, mvA: 2.5, track: 5, poise: 25, body: { twist: .6, lean: .25 } }, o),
  over: (o = {}) => Object.assign({ wind: .7, act: .18, rec: .7, psi: 90, th0: 135, th1: -40, mvA: 2.5, track: 4, poise: 40, body: { twist: .15, lean: .5, lunge: .9, rear: 1 } }, o),
  thrust: (o = {}) => Object.assign({ kind: 'thrust', wind: .55, act: .16, rec: .55, from: [-.15, 1.25, -.1], to: [-.1, 1.3, .85], mvA: 5, track: 5, poise: 30, body: { twist: .3, lean: .35, lunge: 1 } }, o),
  sweep: (o = {}) => Object.assign({ wind: .75, act: .25, rec: .6, psi: 0, th0: -170, th1: 170, lin: true, mvA: 1, track: 3, poise: 40, body: { twist: 1, lean: .2, spin: 1 } }, o),
  claw: (o = {}) => Object.assign({ wind: .4, act: .14, rec: .45, psi: 60, th0: -100, th1: 60, r: .55, mvA: 3, track: 6, poise: 15, body: { twist: .5, lean: .5 }, noBlade: true, sphere: [0, 1.1, .7, .5] }, o),
};
// tipos: hp e dano base (multiplicados pelo nível da área)
const ETYPE = {
  oco: { name: 'Oco', look: 'oco', weapon: 'sword', wscale: .8, hp: 120, poise: 20, dmg: 52, run: 3.4, walk: 1.4, aggro: 11, cinzas: 30, hit: 'flesh', voice: { aggro: 'moan', hurt: ['z_hit1', 'z_hit2'], die: 'crumble', atk: 'z_attack' },
    atks: [{ d: EATK.slashR(), w: 3, rng: [0, 2.2] }, { d: EATK.over({ wind: .8 }), w: 2, rng: [0, 2.3], mul: 1.3 }, { d: EATK.slashR({ wind: .6, mvW: 2, mvA: 5, gapClose: true }), w: 1.5, rng: [2.2, 5], mul: 1.1 }] },
  rastejante: { name: 'Oco Rastejante', look: 'rastejante', weapon: null, hp: 70, poise: 10, dmg: 40, run: 4.6, walk: 2, aggro: 9, cinzas: 22, hit: 'flesh', crawl: true, voice: { aggro: 'groan', hurt: ['ghoul'], die: 'crumble' },
    atks: [{ d: EATK.claw({ wind: .35, mvW: 1, mvA: 7, gapClose: true }), w: 3, rng: [0, 3.5] }] },
  soldado: { name: 'Soldado Juramentado', look: 'soldado', weapon: 'sword', offhand: 'shield', hp: 210, poise: 40, dmg: 70, run: 3.3, walk: 1.4, aggro: 13, cinzas: 70, hit: 'armor', shield: true, voice: { aggro: 'orc_hit', hurt: ['m_hit1', 'm_hit2'], die: 'm_die' },
    atks: [{ d: EATK.slashR({ wind: .5 }), w: 3, rng: [0, 2.4] }, { d: EATK.thrust({ wind: .6 }), w: 2, rng: [1.5, 3.5], mul: 1.15 }, { d: EATK.slashL({ wind: .42 }), w: 2, rng: [0, 2.3], chain: true }] },
  besteiro: { name: 'Besteiro', look: 'besteiro', weapon: 'crossbow', hold: { hand: [-.05, 1.3, .35], blade: [0, 0, 1], edge: [0, 1, 0] }, hp: 130, poise: 18, dmg: 58, run: 3, walk: 1.3, aggro: 22, cinzas: 55, hit: 'flesh', ranged: 'bolt', keep: [9, 18], voice: { aggro: 'orc_hit', hurt: ['m_hit1'], die: 'm_die' },
    atks: [{ d: EATK.slashR({ wind: .5, noBlade: true, sphere: [0, 1.2, .6, .6] }), w: 1, rng: [0, 2] }] },
  cao: { quad: 'dog', name: 'Cão de Guerra', hp: 95, poise: 12, dmg: 46, run: 6.8, walk: 2.5, aggro: 14, cinzas: 40, hit: 'flesh', voice: { aggro: 'wolf_growl1', hurt: ['wolf_hit'], die: 'wolf_die' } },
  carrasco: { name: 'Carrasco Oco', look: 'carrasco', weapon: 'axe', twoHand: true, wscale: 1.25, hold: { hand: [-.1, 1.0, .35], blade: [.1, .9, .4], edge: [0, 0, 1] }, hp: 1100, poise: 120, dmg: 120, run: 3.4, walk: 1.5, aggro: 14, cinzas: 900, hit: 'flesh', mini: true, hyperAll: true, voice: { aggro: 'ogre_hit', hurt: ['ogre_hit'], die: 'ogre_die' }, musicMini: true,
    atks: [{ d: EATK.slashR({ wind: .85, act: .22, rec: .8, r: .8, psi: 40 }), w: 3, rng: [0, 3.4], mul: 1 }, { d: EATK.over({ wind: 1.1, act: .22, rec: 1, r: .8 }), w: 2.5, rng: [0, 3.5], mul: 1.4, shock: 3.2 }, { d: EATK.sweep({ wind: .95, act: .4, rec: .9, r: .85 }), w: 1.5, rng: [0, 3.2], mul: 1.1 }, { d: EATK.over({ wind: .7, act: .25, rec: 1, mvW: 4, mvA: 7, jumpV: 5, gapClose: true, body: { twist: .1, lean: .6, lunge: 1, jump: 1 } }), w: 2, rng: [4, 10], mul: 1.5, shock: 3.5 }] },
  afogado: { name: 'Afogado', look: 'afogado', weapon: null, hp: 170, poise: 25, dmg: 62, run: 3.1, walk: 1.3, aggro: 7, cinzas: 75, hit: 'flesh', ambush: 'water', voice: { aggro: 'mermaid_hit', hurt: ['mermaid_hit'], die: 'mermaid_die' },
    atks: [{ d: EATK.claw({ wind: .55 }), w: 3, rng: [0, 2.2] }, { d: EATK.claw({ wind: .8, mvA: 6, gapClose: true, psi: 90, th0: 120, th1: -40, sphere: [0, 1, .9, .7] }), w: 2, rng: [1.5, 4.5], mul: 1.4, status: { poison: 5 } }] },
  bruxa: { name: 'Bruxa das Velas', look: 'bruxa', weapon: 'staff', hold: { hand: [-.22, 1.0, .25], blade: [0, 1, .15], edge: [0, 0, 1] }, hp: 150, poise: 15, dmg: 70, run: 3, walk: 1.2, aggro: 18, cinzas: 95, hit: 'flesh', caster: true, keep: [7, 14], female: true, candle: true, voice: { aggro: 'hiss', hurt: ['f_hit1', 'f_hit2'], die: 'f_die1' },
    atks: [{ d: EATK.slashR({ wind: .5 }), w: 1, rng: [0, 2.2] }] },
  inchado: { name: 'Inchado', look: 'inchado', weapon: null, hp: 160, poise: 50, dmg: 50, run: 2.2, walk: 1, aggro: 9, cinzas: 70, hit: 'flesh', bloat: true, voice: { aggro: 'groan', hurt: ['squish'], die: 'squish' },
    atks: [{ d: EATK.claw({ wind: .7, sphere: [0, 1.1, .8, .8], psi: 90, th0: 120, th1: -30 }), w: 2, rng: [0, 2.4], mul: 1.2, status: { poison: 6 } }] },
  lobo: { quad: 'wolf', name: 'Lobo Cinzento', hp: 140, poise: 16, dmg: 58, run: 7.5, walk: 2.8, aggro: 16, cinzas: 70, hit: 'flesh', pack: true, voice: { aggro: 'wolf_growl2', hurt: ['wolf_hit'], die: 'wolf_die' } },
  cacador: { name: 'Caçador Oco', look: 'cacador', weapon: 'dagger', offhand: 'bow', hp: 150, poise: 18, dmg: 62, run: 4.4, walk: 1.6, aggro: 20, cinzas: 85, hit: 'flesh', ranged: 'arrow', keep: [8, 16], voice: { aggro: 'orc_hit', hurt: ['m_hit1'], die: 'm_die' },
    atks: [{ d: EATK.slashR({ wind: .35, r: .55 }), w: 2, rng: [0, 2] }, { d: EATK.thrust({ wind: .35, mvA: 6 }), w: 1, rng: [1, 3] }] },
  ent: { name: 'Ent de Cinza', look: 'ent', weapon: null, hp: 520, poise: 90, dmg: 95, run: 2.2, walk: 1.1, aggro: 12, cinzas: 260, hit: 'wood', hyperAll: true, resist: { fire: -0.5 }, roots: true, voice: { aggro: 'wose_attack', hurt: ['wose_hit'], die: 'wose_die' },
    atks: [{ d: EATK.claw({ wind: .9, act: .22, rec: .8, r: .9, sphere: [0, 2, 1.3, 1], psi: 50 }), w: 3, rng: [0, 3.6], mul: 1 }, { d: EATK.claw({ wind: 1.1, act: .22, rec: 1, psi: 90, th0: 130, th1: -40, sphere: [0, 1.2, 1.6, 1.2] }), w: 2, rng: [0, 3.8], mul: 1.4, shock: 3 }] },
  ferreiro: { name: 'Ferreiro Oco', look: 'ferreiro', weapon: 'hammer', twoHand: true, wscale: .85, hold: { hand: [-.1, 1.0, .3], blade: [.1, .9, .4], edge: [0, 0, 1] }, hp: 300, poise: 60, dmg: 105, run: 3, walk: 1.3, aggro: 12, cinzas: 180, hit: 'flesh', hyperAll: true, voice: { aggro: 'dwarf_hit', hurt: ['dwarf_hit'], die: 'm_die' },
    atks: [{ d: EATK.over({ wind: .85, act: .2, rec: .8 }), w: 3, rng: [0, 2.8], mul: 1.2, shock: 2.6 }, { d: EATK.slashR({ wind: .7, act: .2, rec: .7, r: .7 }), w: 2, rng: [0, 2.8] }] },
  salamandra: { quad: 'lizard', name: 'Salamandra', hp: 240, poise: 40, dmg: 70, run: 4.2, walk: 1.6, aggro: 13, cinzas: 160, hit: 'flesh', breath: true, resist: { fire: .7 }, voice: { aggro: 'drake_hit', hurt: ['drake_hit'], die: 'drake_die' } },
  golem: { name: 'Golem de Escória', look: 'golem', weapon: null, hp: 650, poise: 150, dmg: 120, run: 2.4, walk: 1.1, aggro: 11, cinzas: 380, hit: 'stone', hyperAll: true, explode: true, resist: { fire: .6, phys: .1 }, voice: { aggro: 'troll_hit', hurt: ['troll_hit'], die: 'troll_die' },
    atks: [{ d: EATK.claw({ wind: 1, act: .22, rec: .9, r: .9, sphere: [0, 1.8, 1.2, 1], psi: 40 }), w: 3, rng: [0, 3.3] }, { d: EATK.claw({ wind: 1.2, act: .22, rec: 1.1, psi: 90, th0: 130, th1: -45, sphere: [0, 1.0, 1.4, 1.2] }), w: 2, rng: [0, 3.5], mul: 1.5, shock: 3.4 }] },
  cavaleiro: { name: 'Cavaleiro da Catedral', look: 'cavaleiro', weapon: 'greatsword', twoHand: true, wscale: .9, hold: { hand: [-.1, 1.05, .34], blade: [.05, .95, .4], edge: [0, 0, 1] }, hp: 480, poise: 80, dmg: 128, run: 3.6, walk: 1.5, aggro: 14, cinzas: 420, hit: 'armor', voice: { aggro: 'm_hit2', hurt: ['m_hit1', 'm_hit2'], die: 'm_die' },
    atks: [{ d: EATK.slashR({ wind: .7, act: .2, rec: .6, r: .75 }), w: 3, rng: [0, 3.3], combo: [EATK.slashL({ wind: .35, act: .2, rec: .7, r: .75 })] }, { d: EATK.thrust({ wind: .75, act: .2, rec: .7, mvA: 6 }), w: 2, rng: [2, 5], mul: 1.2 }, { d: EATK.over({ wind: 1.0, act: .2, rec: .8, r: .75 }), w: 2, rng: [0, 3.2], mul: 1.4, delayed: true }] },
  clerigo: { name: 'Clérigo do Lume', look: 'clerigo', weapon: 'scepter', hold: { hand: [-.22, 1.0, .25], blade: [0, 1, .15], edge: [0, 0, 1] }, hp: 220, poise: 20, dmg: 90, run: 2.6, walk: 1.2, aggro: 18, cinzas: 300, hit: 'flesh', caster: true, healer: true, keep: [8, 14], voice: { aggro: 'holy2', hurt: ['m_hit1'], die: 'm_die' },
    atks: [{ d: EATK.slashR({ wind: .5 }), w: 1, rng: [0, 2.2] }] },
  gargula: { name: 'Gárgula', look: 'gargula', weapon: 'spear', wscale: .8, hold: { hand: [-.2, 1.1, .2], blade: [0, .3, 1], edge: [0, 1, 0] }, hp: 330, poise: 60, dmg: 105, run: 4.5, walk: 2, aggro: 15, cinzas: 380, hit: 'stone', wings: true, statue: true, resist: { phys: .15 }, voice: { aggro: 'shriek2', hurt: ['gryphon_hit'], die: 'gryphon_die' },
    atks: [{ d: EATK.thrust({ wind: .6, mvA: 6, to: [-.1, 1.3, 1.2] }), w: 3, rng: [0, 4] }, { d: EATK.over({ wind: .6, act: .3, rec: .7, mvW: 5, mvA: 8, jumpV: 7, gapClose: true, body: { twist: .1, lean: .6, lunge: 1, jump: 1 } }), w: 2, rng: [4, 11], mul: 1.3 }] },
  eco: { name: 'Eco do Desperto', look: 'eco', weapon: 'sword', hp: 380, poise: 35, dmg: 115, run: 4.6, walk: 1.8, aggro: 15, cinzas: 520, hit: 'shadow', dodger: true, trail: 0x8a6aff, voice: { aggro: 'dark', hurt: ['p_hurt1', 'p_hurt2'], die: 'dark_big' },
    atks: [{ d: EATK.slashR({ wind: .35, act: .13, rec: .4 }), w: 3, rng: [0, 2.3], combo: [EATK.slashL({ wind: .2, act: .13, rec: .4 }), EATK.over({ wind: .3, act: .15, rec: .5 })] }, { d: EATK.thrust({ wind: .3, mvW: 5, mvA: 7, gapClose: true }), w: 2, rng: [2.5, 7], mul: 1.2 }] },
  vigia: { name: 'Vigia do Lume', look: 'vigia', weapon: 'lance', twoHand: true, wscale: 1.1, hold: { hand: [-.12, 1.1, .3], blade: [0, .35, 1], edge: [0, 1, 0] }, hp: 560, poise: 90, dmg: 135, run: 3.4, walk: 1.5, aggro: 15, cinzas: 640, hit: 'armor', fireTrail: true, resist: { fire: .6 }, voice: { aggro: 'warcry', hurt: ['m_hit2'], die: 'm_die' },
    atks: [{ d: EATK.thrust({ wind: .65, act: .2, mvA: 6, to: [-.1, 1.3, 1.3] }), w: 3, rng: [0, 4.5], combo: [EATK.thrust({ wind: .3, act: .18, mvA: 6, to: [-.1, 1.3, 1.3] })] }, { d: EATK.sweep({ wind: .8, act: .35, rec: .7, r: .9 }), w: 2, rng: [0, 3.8], mul: 1.2, fire: true }, { d: EATK.over({ wind: .9, act: .22, rec: .8, r: .8 }), w: 2, rng: [0, 4], mul: 1.3, shock: 3, fire: true }] },
  chama: { wisp: true, name: 'Chama Errante', hp: 60, poise: 5, dmg: 95, run: 4, walk: 2, aggro: 14, cinzas: 120, hit: 'fire', resist: { fire: 1 }, voice: { aggro: 'fire', hurt: ['fire'], die: 'explosion' } },
};
// ---------- classe inimigo humanoide ----------
class Enemy extends Fighter {
  constructor(type, x, y, z, yaw, lvl = 1, opt = {}) {
    const T = ETYPE[type];
    const rig = ELOOK[T.look]();
    super({ rig, team: 'enemy', r: .38 * rig.s * (T.r || 1), h: 1.8 * rig.s, hp: Math.round(T.hp * lvl), poise: T.poise, mass: rig.s * rig.s * (T.hyperAll ? 3 : 1), weapon: T.weapon, twoHand: T.twoHand, hold: T.hold, offhand: T.offhand, wscale: T.wscale, trail: T.trail ?? 0xd8d0c0, resist: T.resist, name: T.name });
    this.type = type; this.T = T; this.lvl = lvl; this.opt = opt;
    this.home = new V3(x, y, z); this.homeYaw = yaw; this.pos.set(x, y, z); this.yaw = yaw;
    this.state = opt.sleep ? 'sleep' : T.ambush ? 'hidden' : T.statue ? 'statue' : 'idle';
    this.cd = rnd(.4, 1); this.strafeDir = Math.random() < .5 ? 1 : -1; this.strafeT = 0; this.lastSeen = 0; this.aggroed = false;
    this.cinzas = Math.round(T.cinzas * (lvl > 1 ? 1 + (lvl - 1) * .6 : 1));
    this.guard = T.shield ? 100 : 0;
    if (T.crawl) { this.crawl = true; }
    if (T.candle) { this.candle = flame(rig.J.head, 0, rig.L.headR * 2.4, 0, .35); const c = new THREE.Mesh(new THREE.CylinderGeometry(.04, .045, .18, 6), MAT('candle')); c.position.y = rig.L.headR * 2.1; rig.J.head.add(c); this.light = addLight(0, 0, 0, 0xffa050, 1.4, 5); }
    if (T.wings) this.addWings();
    if (T.look === 'golem' || T.look === 'ent') this.addBulk();
    if (T.fireTrail) { this.light = addLight(0, 0, 0, 0xff7a2a, 1.5, 5); }
    if (T.look === 'eco') { this.root.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = .85; } }); this.light = addLight(0, 0, 0, 0x8a6aff, 1.2, 4); }
    if (this.state === 'hidden') { this.root.visible = false; this.ghost = true; }
    if (this.state === 'statue') { this.root.traverse(o => { if (o.isMesh) o.material = MAT('stone_statue'); }); }
    this.rimFix();
    ENEMIES.push(this); this.sync();
  }
  rimFix() { this.rig.root.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !o.material.userData.rim) { const m = rimify(o.material, 0x9aa0c0, 3, .18); m.userData.rim = 1; o.material = m; } }); }
  addWings() {
    const mat = MAT('stone_statue'); this.wings = [];
    for (const s of [1, -1]) { const w = new THREE.Group(); w.position.set(s * .12, this.rig.L.chest * .8, -.12); this.rig.J.chest.add(w); const g = new THREE.Shape(); g.moveTo(0, 0); g.lineTo(s * 1.3, .5); g.lineTo(s * 1.5, -.2); g.lineTo(s * 1.0, -.5); g.lineTo(s * .5, -.6); g.lineTo(0, -.2); const m = new THREE.Mesh(new THREE.ShapeGeometry(g), mat); m.material.side = THREE.DoubleSide; m.castShadow = true; m.rotation.y = s * .4; w.add(m); this.wings.push(w); }
  }
  addBulk() {
    const J = this.rig.J, mat = this.T.look === 'ent' ? MAT('bark') : MAT('forge_floor');
    for (let i = 0; i < 7; i++) { const g = this.T.look === 'ent' ? new THREE.ConeGeometry(.05, .7, 5) : new THREE.DodecahedronGeometry(.18, 0); const m = new THREE.Mesh(g, mat); m.castShadow = true; m.position.set(rnd(-.18, .18), rnd(.05, .35), rnd(-.12, .05)); m.rotation.set(rnd(-1, 1), rnd(0, 3), rnd(-1, 1)); (this.T.look === 'ent' ? J.head : J.chest).add(m); }
    if (this.T.look === 'golem') { const core = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), MAT('lava')); core.position.set(0, .2, .14); J.chest.add(core); this.light = addLight(0, 0, 0, 0xff5a1a, 1.6, 5); }
  }
  get aggroR() { return this.T.aggro; }
  see(p) {
    const d = this.dist(p); if (d > this.aggroR || Math.abs(p.pos.y - this.pos.y) > 6) return false;
    const front = Math.abs(angDiff(this.yaw, this.yawTo(p))) < 1.2 || d < 4 || (p.sprinting && d < 9) || (p.atk && d < 7);
    if (!front) return false;
    return losClear(this.pos.x, this.pos.y + this.h * .85, this.pos.z, p.pos.x, p.pos.y + 1.4, p.pos.z);
  }
  aggro(p) {
    if (this.aggroed) return; this.aggroed = true; this.state = 'alert'; this.stT = 0; this.cd = rnd(.3, .8);
    const v = this.T.voice; if (v && v.aggro) sfxCD('ag_' + this.type, .6, v.aggro, { pos: this.pos, vol: .7, jit: .1, rate: this.rig.s > 1.4 ? .75 : 1 });
    for (const e of ENEMIES) if (e !== this && e.alive && !e.aggroed && e.state !== 'hidden' && e.state !== 'statue' && e.dist(this) < (this.T.pack ? 14 : 7)) { e.aggroed = false; after(rnd(.2, .6), () => e.alive && e.aggro(p)); }
  }
  update(dt) {
    this.stT += dt; this.flash = Math.max(0, this.flash - dt); this.iframe = Math.max(0, this.iframe - dt);
    if (this.poiseT > 0) this.poiseT -= dt; else this.poise = Math.min(this.maxPoise, this.poise + this.maxPoise * .5 * dt);
    const p = PLAYER; const S = this.state;
    this.speedMul = 1; this.ikBlend = 1;
    if (!this.alive) { this.vel.set(0, 0, 0); this.deadUpd(dt); return; }
    switch (S) {
      case 'idle': this.stIdle(dt, p); break;
      case 'sleep': this.vel.set(0, 0, 0); if (p.alive && this.dist(p) < 3.2) this.aggro(p); break;
      case 'hidden': this.vel.set(0, 0, 0); if (p.alive && this.dist(p) < (this.opt.trigger || 5) && Math.abs(p.pos.y - this.pos.y) < 3) this.emerge(); break;
      case 'statue': this.vel.set(0, 0, 0); if (p.alive && this.dist(p) < (this.opt.trigger || 6) && Math.abs(p.pos.y - this.pos.y) < 4) this.awaken(); break;
      case 'emerge': this.vel.set(0, 0, 0); if (this.stT > 1) { this.state = 'chase'; this.stT = 0; } break;
      case 'alert': this.vel.set(0, 0, 0); this.turn(this.yawTo(p), 6, dt); if (this.stT > .45) { this.state = 'chase'; this.stT = 0; } break;
      case 'chase': this.stChase(dt, p); break;
      case 'attack': this.stAttack(dt, p); break;
      case 'cast': this.stCast(dt, p); break;
      case 'hurt': this.vel.set(0, 0, 0); if (this.stT > .4) { this.state = 'chase'; this.stT = 0; } break;
      case 'stagger': this.vel.set(0, 0, 0); if (this.stT > this.stagT) { this.state = 'chase'; this.stT = 0; this.cd = .3; } break;
      case 'return': this.stReturn(dt, p); break;
      case 'dodge': this.stDodge(dt); break;
      case 'guard': this.stGuard(dt, p); break;
    }
    this.physics(dt, { ledge: true });
    const ex = this.rig.J.chest; if (this.wings) { const f = Math.sin(TIME.now * (this.state === 'statue' ? 0 : 6)) * .4; this.wings[0].rotation.y = .3 + f; this.wings[1].rotation.y = -.3 - f; }
    this.anim.update(dt, this.crawl ? { spine: [.9, 0, 0], chest: [.4, 0, 0], head: [-.8, 0, 0], legL: [-.9, 0, 0], shinL: [1.6, 0, 0], legR: [-.9, 0, 0], shinR: [1.6, 0, 0], armL: [-1.2, 0, 0], armR: [-1.2, 0, 0], _y: -.5 } : null);
    this.sync(); this.weaponIK(dt); this.checkHits(); this.updTrail(); this.updCloth(dt);
    if (this.light) { this.light.x = this.pos.x; this.light.y = this.pos.y + this.h + .2; this.light.z = this.pos.z; }
    if (this.T.fireTrail && this.atk && this.atk.phase === 'act' && Math.random() < dt * 40) burst(this.curT.x, this.curT.y, this.curT.z, 1, { color: 0xff7a2a, smin: .2, smax: 1, lmin: .3, lmax: .6, szmin: .1, szmax: .2 });
    if (this.T.wisp) { }
    if (this.flash > 0) this.flashMat();
  }
  flashMat() { }
  stIdle(dt, p) {
    this.vel.set(0, 0, 0); this.anim.amt = damp(this.anim.amt, 0, 6, dt);
    if (this.opt.patrol) { const pt = this.opt.patrol, i = this.patI || 0, tx = pt[i][0], tz = pt[i][1], d = Math.hypot(tx - this.pos.x, tz - this.pos.z); if (d < .5) this.patI = (i + 1) % pt.length; else { this.turn(yawTo(this.pos.x, this.pos.z, tx, tz), 3, dt); this.move(this.T.walk * .8, dt); } }
    if (p.alive && this.see(p)) this.aggro(p);
  }
  move(sp, dt) {
    this.vel.set(Math.sin(this.yaw) * sp, 0, Math.cos(this.yaw) * sp);
    this.anim.amt = damp(this.anim.amt, sp < 2.3 ? sp / 1.6 : 1 + (sp - 1.8) / 2.5, 8, dt); this.anim.ph += dt * sp / (sp < 2.3 ? 1.35 : 2.1) * PI;
    this._fp = this._fp || 0; const fp = Math.floor(this.anim.ph / PI); if (fp !== this._fp && sp > 1) { this._fp = fp; if (this.dist(PLAYER) < 14) sfx(this.T.hit === 'armor' ? 'metal' + rndi(1, 2) : 'step' + rndi(1, 4), { pos: this.pos, vol: .25 * Math.min(1.5, this.rig.s), rate: 1 / Math.sqrt(this.rig.s), jit: .08 }); }
  }
  stChase(dt, p) {
    if (!p.alive) { this.state = 'return'; return; }
    const d = this.dist(p), hd = this.pos.distanceTo(this.home);
    if (hd > 34 || (d > this.aggroR * 2.4 && !this.opt.noLeash)) { this.state = 'return'; this.stT = 0; return; }
    this.cd -= dt; this.strafeT -= dt;
    const T = this.T; const ty = this.yawTo(p);
    // à distância
    if (T.ranged || T.caster) {
      const [kmin, kmax] = T.keep; this.turn(ty, 6, dt);
      if (d < kmin * .5 && T.atks) { if (this.cd <= 0) { this.startAtk(T.atks[0], p); return; } this.move(-T.walk, dt); this.vel.multiplyScalar(-1); this.vel.set(-Math.sin(this.yaw) * T.walk, 0, -Math.cos(this.yaw) * T.walk); }
      else if (d > kmax) this.move(T.run * .7, dt);
      else { this.vel.set(Math.cos(this.yaw) * this.strafeDir * T.walk, 0, -Math.sin(this.yaw) * this.strafeDir * T.walk); this.anim.amt = damp(this.anim.amt, .8, 6, dt); this.anim.ph += dt * 2.5; this.anim.sx = this.strafeDir; this.anim.fx = 0; if (this.strafeT <= 0) { this.strafeT = rnd(1, 2.5); if (Math.random() < .5) this.strafeDir *= -1; } }
      const los = losClear(this.pos.x, this.pos.y + this.h * .8, this.pos.z, p.pos.x, p.pos.y + 1.3, p.pos.z);
      if (this.cd <= 0 && d < kmax * 1.3 && los) { this.state = 'cast'; this.stT = 0; this.castKind = T.ranged || (T.healer && this.woundedAlly() ? 'heal' : pick(T.healer ? ['beam', 'beam', 'orbs'] : ['fireball', 'fireball', 'volley', 'blink'])); this.startCast(p); }
      return;
    }
    if (T.quad || T.wisp) return; // tratados em subclasses
    // corpo a corpo
    const inRange = T.atks.filter(a => d >= a.rng[0] && d <= a.rng[1]);
    if (this.cd <= 0 && inRange.length && Math.abs(angDiff(this.yaw, ty)) < 1.2) { this.startAtk(wpick(inRange), p); return; }
    this.turn(ty, T.shield ? 4 : 7, dt);
    if (T.shield && d < 6 && this.guard > 20 && Math.random() < dt * .8) { this.state = 'guard'; this.stT = 0; return; }
    const close = T.atks.reduce((m, a) => Math.min(m, a.rng[1]), 9) * .75;
    if (d > close + .3) { this.anim.fx = 1; this.anim.sx = 0; this.move(d > 6 ? T.run : Math.max(T.walk, T.run * .6), dt); }
    else { // circular
      const sp = T.walk * .9; this.vel.set(Math.cos(this.yaw) * this.strafeDir * sp, 0, -Math.sin(this.yaw) * this.strafeDir * sp);
      this.anim.amt = damp(this.anim.amt, .7, 6, dt); this.anim.ph += dt * 2.4; this.anim.fx = 0; this.anim.sx = this.strafeDir;
      if (this.strafeT <= 0) { this.strafeT = rnd(.8, 2); if (Math.random() < .5) this.strafeDir *= -1; }
    }
    if (T.dodger && p.atk && p.atk.phase === 'wind' && d < 3.5 && Math.random() < dt * 3) this.startDodge(p);
  }
  startAtk(a, p) {
    this.state = 'attack'; this.stT = 0; this.curA = a; this.comboI = 0; this.anim.fx = 1; this.anim.sx = 0;
    this.attack(a.d, p); this.atk.mul = a.mul || 1;
    this.hyper = !!(this.T.hyperAll || a.hyper);
    if (this.T.voice && this.T.voice.atk && Math.random() < .5) sfx(this.T.voice.atk, { pos: this.pos, vol: .45, jit: .1 });
    if (a.delayed) this.atk.t = -.35; // golpe atrasado: segura o preparo
  }
  stAttack(dt, p) {
    const a = this.atk;
    const r = this.updAttack(dt * (a && a.t < 0 ? 1 : 1));
    if (a && a.phase === 'act' && this.curA.shock && !a.shocked && a.t > a.def.wind + a.def.act * .7) { a.shocked = true; this.slam(this.curA.shock, this.curA.mul); }
    if (a && a.phase === 'act' && this.curA.fire && !a.fired) { a.fired = true; burst(this.curT.x, this.curT.y, this.curT.z, 12, { color: 0xff7a2a, smin: .5, smax: 2, lmin: .3, lmax: .6 }); }
    if (r === 'done') {
      const combo = this.curA.combo;
      if (combo && this.comboI < combo.length && this.dist(p) < 4.5 && Math.random() < .8) { const d = combo[this.comboI++]; this.attack(d, p); this.atk.mul = this.curA.mul || 1; return; }
      this.state = 'chase'; this.stT = 0; this.cd = rnd(.6, 1.6) * (this.T.mini ? .6 : 1); this.hyper = false;
    }
  }
  slam(r, mul = 1) {
    const x = this.pos.x + Math.sin(this.yaw) * 1.2 * this.rig.s, z = this.pos.z + Math.cos(this.yaw) * 1.2 * this.rig.s;
    aoe({ x, y: this.pos.y, z, r, dmg: Math.round(this.T.dmg * this.lvl * mul * .55), poiseDmg: 40, team: 'enemy', owner: this, kb: 6, dur: .12, type: this.curA.fire ? 'fire' : 'phys' });
    ringFx(x, this.pos.y, z, .3, r * 1.25, .5, this.curA.fire ? 0xff7a2a : 0xd8c8a8, .8);
    burst(x, this.pos.y + .1, z, 22, { add: false, color: 0x6b6458, smin: 1, smax: 5, lmin: .4, lmax: .9, szmin: .15, szmax: .4, upBias: .7, alpha: .5, grav: 5 });
    sfx('quake', { pos: this.pos, vol: .6 }); synth('boom', .5); if (this.dist(PLAYER) < 10) shake(.25);
  }
  dmgFor(d) { return Math.round(this.T.dmg * this.lvl * (this.atk && this.atk.mul || 1) * rnd(.95, 1.05)); }
  onBladeHit(t, a) { const r = super.onBladeHit(t, a); if (r && r !== 'dodge') sfxAny(['hit_sword', 'hit_club'].concat(this.weaponKind === 'axe' || this.weaponKind === 'hammer' ? ['hit_axe', 'hit_mace'] : []), { pos: t.pos, vol: .6, jit: .08 }); return r; }
  // ---- conjuração / tiro ----
  startCast(p) {
    const k = this.castKind; this.anim.play(k === 'bolt' || k === 'arrow' ? CLIP.bowdraw : CLIP.cast, { hold: k === 'bolt' || k === 'arrow' });
    if (k === 'blink') { sfx('tele', { pos: this.pos, vol: .4 }); }
    if (k === 'beam') { this.beamTele = telegraph(p.pos.x, p.pos.y, p.pos.z, 1.6, 1.1, 0xfff0b0); this.beamAt = p.pos.clone(); sfx('holy1', { pos: this.pos, vol: .5 }); }
    if (k === 'heal') sfx('holy2', { pos: this.pos, vol: .5 });
  }
  stCast(dt, p) {
    this.vel.set(0, 0, 0); this.turn(this.yawTo(p), 6, dt); const k = this.castKind, t = this.stT;
    const fire = (at) => !this['_c' + at] && t >= at && (this['_c' + at] = true);
    const handW = () => { this.rig.J.handL.getWorldPosition(_v3); return _v3.clone(); };
    if (k === 'bolt' || k === 'arrow') {
      if (fire(.75)) { const from = this.center(new V3()); from.y += .25; const tgt = p.center(new V3()); tgt.x += p.vel.x * .25; tgt.z += p.vel.z * .25; const d = tgt.sub(from).normalize(); new Projectile({ pos: from, vel: d.multiplyScalar(k === 'bolt' ? 30 : 34), r: .12, dmg: Math.round(this.T.dmg * this.lvl), poiseDmg: 15, team: 'enemy', owner: this, mesh: arrowMesh(k === 'bolt' ? .5 : .8), orient: true, life: 2, kb: 2, grav: 1 }); sfx(k === 'bolt' ? 'crossbow' : 'bow', { pos: this.pos, vol: .6 }); }
      if (t > 1.3) this.endCast(1.6);
    } else if (k === 'fireball') {
      if (fire(.5)) { const from = handW(); const d = p.center(new V3()).sub(from).normalize(); new Projectile({ pos: from, vel: d.multiplyScalar(13), r: .2, dmg: Math.round(this.T.dmg * this.lvl), poiseDmg: 20, type: 'fire', team: 'enemy', owner: this, mesh: orbMesh(.18, 0xff6a1a, 0xffe0a0), light: 2.5, lightR: 6, color: 0xff7a2a, trailRate: 30, life: 3, homing: .6, target: p, status: { burn: 2.5 }, onExplode: pos => { burst(pos.x, pos.y, pos.z, 18, { color: 0xff8a2a, smin: 1.5, smax: 4, lmin: .3, lmax: .6 }); flashLight(pos.x, pos.y, pos.z, 0xff7020, 4, 6, .4); sfx('fire', { pos, vol: .5 }); } }); sfx('cast_fire', { pos: this.pos, vol: .5 }); }
      if (t > 1.1) this.endCast(1.8);
    } else if (k === 'volley') {
      for (const at of [.45, .7, .95]) if (fire(at)) { const from = handW(); const d = p.center(new V3()).sub(from).normalize(); d.x += rnd(-.1, .1); new Projectile({ pos: from, vel: d.multiplyScalar(15), r: .15, dmg: Math.round(this.T.dmg * this.lvl * .6), poiseDmg: 10, type: 'fire', team: 'enemy', owner: this, mesh: orbMesh(.13, 0xff6a1a, 0xffe0a0), light: 1.5, color: 0xff7a2a, trailRate: 20, life: 3 }); sfx('cast_fire', { pos: this.pos, vol: .35, rate: 1.2 }); }
      if (t > 1.4) this.endCast(2.2);
    } else if (k === 'blink') {
      if (fire(.4)) { burst(this.pos.x, this.pos.y + 1, this.pos.z, 20, { color: 0xb080ff, smin: 1, smax: 3 }); for (let i = 0; i < 10; i++) { const a = rnd(0, TAU), r = rnd(6, 10), nx = p.pos.x + Math.sin(a) * r, nz = p.pos.z + Math.cos(a) * r; if (validSpot(nx, this.pos.y, nz) && this.home.distanceTo(_v1.set(nx, this.pos.y, nz)) < 16) { this.pos.set(nx, groundAt(nx, nz, this.pos.y + 2), nz); break; } } burst(this.pos.x, this.pos.y + 1, this.pos.z, 20, { color: 0xb080ff, smin: 1, smax: 3 }); }
      if (t > .9) this.endCast(.6);
    } else if (k === 'beam') {
      if (fire(1.1)) { const b = this.beamAt; aoe({ x: b.x, y: b.y, z: b.z, r: 1.6, dmg: Math.round(this.T.dmg * this.lvl * 1.1), poiseDmg: 40, type: 'holy', team: 'enemy', owner: this, dur: .2, kb: 5, maxH: 6 }); pillarFx(b.x, b.y, b.z, 1.2, 9, .6, 0xfff0b0); flashLight(b.x, b.y + 2, b.z, 0xfff0c0, 7, 9, .5); sfx('holy3', { pos: b, vol: .8 }); }
      if (t > 1.6) this.endCast(2);
    } else if (k === 'orbs') {
      for (const at of [.5, .8]) if (fire(at)) { const from = handW(); const d = p.center(new V3()).sub(from).normalize(); new Projectile({ pos: from, vel: d.multiplyScalar(11), r: .2, dmg: Math.round(this.T.dmg * this.lvl * .7), type: 'holy', team: 'enemy', owner: this, mesh: orbMesh(.16, 0xffe8a0, 0xffffff), light: 2, color: 0xfff0b0, trailRate: 20, life: 3.5, homing: 1, target: p }); sfx('holy2', { pos: this.pos, vol: .4 }); }
      if (t > 1.3) this.endCast(1.8);
    } else if (k === 'heal') {
      if (fire(.8)) { const w = this.woundedAlly(); if (w) { w.hp = Math.min(w.maxHp, w.hp + w.maxHp * .4); burst(w.pos.x, w.pos.y + 1, w.pos.z, 24, { color: 0xffe8a0, smin: .5, smax: 2, upBias: 1, lmin: .5, lmax: 1 }); flashLight(w.pos.x, w.pos.y + 1.5, w.pos.z, 0xffe8a0, 4, 6, .6); } }
      if (t > 1.4) this.endCast(3);
    }
  }
  woundedAlly() { let best = null; for (const e of ENEMIES) if (e !== this && e.alive && e.hp < e.maxHp * .6 && e.dist(this) < 14) best = e; return best; }
  endCast(cd) { this.state = 'chase'; this.stT = 0; this.cd = cd * rnd(.8, 1.3); this.anim.stop(.2); for (const k in this) if (k.startsWith('_c')) delete this[k]; }
  startDodge(p) { this.state = 'dodge'; this.stT = 0; this.dodgeDir = Math.random() < .5 ? 1 : -1; this.anim.play(CLIP.roll); this.iframe = .4; }
  stDodge(dt) { const sp = this.stT < .4 ? 6 : 0; const a = this.yaw + this.dodgeDir * HPI; this.vel.set(Math.sin(a) * sp, 0, Math.cos(a) * sp); if (this.stT > .55) { this.state = 'chase'; this.cd = 0; } }
  stGuard(dt, p) {
    this.turn(this.yawTo(p), 5, dt); const T = this.T; const d = this.dist(p);
    this.vel.set(Math.cos(this.yaw) * this.strafeDir * T.walk * .7, 0, -Math.sin(this.yaw) * this.strafeDir * T.walk * .7); this.anim.amt = damp(this.anim.amt, .5, 6, dt); this.anim.ph += dt * 2; this.anim.sx = this.strafeDir; this.anim.fx = 0;
    this.guard = Math.min(100, this.guard + 10 * dt);
    if (this.stT > rnd(1.5, 3) || d > 7) { this.state = 'chase'; this.stT = 0; }
    if (d < 2.4 && this.stT > .6 && Math.random() < dt * 2) { this.startAtk(T.atks[0], p); }
  }
  stReturn(dt, p) {
    const d = this.pos.distanceTo(this.home); this.aggroed = false;
    if (d < .6) { this.state = 'idle'; this.yaw = this.homeYaw; this.hp = Math.min(this.maxHp, this.hp + this.maxHp * .5); return; }
    this.turn(yawTo(this.pos.x, this.pos.z, this.home.x, this.home.z), 5, dt); this.move(this.T.walk * 1.3, dt);
    if (p.alive && this.dist(p) < this.aggroR * .6 && this.see(p)) this.aggro(p);
    if (this.stT > 12) { this.pos.copy(this.home); }
  }
  emerge() {
    this.state = 'emerge'; this.stT = 0; this.root.visible = true; this.ghost = false; this.aggroed = true;
    burst(this.pos.x, this.pos.y + .2, this.pos.z, 30, { add: false, color: 0x4a5a48, smin: 1, smax: 4, upBias: 1, lmin: .5, lmax: 1, szmin: .1, szmax: .3, grav: 6, alpha: .6 });
    sfx('water', { pos: this.pos, vol: .8, rate: .7 }); if (this.T.voice.aggro) sfx(this.T.voice.aggro, { pos: this.pos, vol: .8 });
    this.anim.play({ dur: 1, keys: [[0, { _y: -1.6, spine: [.6, 0, 0], armL: [-2.6, 0, .3], armR: [-2.6, 0, -.3] }], [.7, { _y: -.2, spine: [.3, 0, 0], armL: [-1.8, 0, .4], armR: [-1.8, 0, -.4] }, 'out'], [1, {}]] });
  }
  awaken() {
    this.state = 'emerge'; this.stT = 0; this.aggroed = true; const ml = ELOOK[this.T.look]();
    // a pedra racha: troca materiais de volta
    const src = []; ml.root.traverse(o => { if (o.isMesh) src.push(o.material); }); let i = 0; this.rig.root.traverse(o => { if (o.isMesh && src[i]) { o.material = src[i]; } i++; }); this.rimFix();
    burst(this.pos.x, this.pos.y + 1.5, this.pos.z, 34, { add: false, color: 0x8a857c, smin: 1, smax: 4, lmin: .5, lmax: 1.2, szmin: .1, szmax: .3, grav: 8, alpha: .8 });
    sfx('petrified', { pos: this.pos, vol: .7 }); sfx(this.T.voice.aggro, { pos: this.pos, vol: .8 });
    this.anim.play(CLIP.roar);
  }
  // ---- dano ----
  takeHit(h) {
    if (!this.alive || this.ghost || this.state === 'hidden' || this.state === 'statue') return false;
    if (this.iframe > 0) return 'dodge';
    const p = h.from;
    let dmg = dmgAfterResist(this, h), crit = false;
    // golpe crítico pelas costas
    if (p && p.isPlayer && !h.proj && !h.aoe && this.state !== 'attack' && Math.abs(angDiff(this.yaw, this.yawTo(p))) > 2.3 && !this.boss) { dmg = Math.round(dmg * 2.2); crit = true; }
    // escudo
    if (this.state === 'guard' && p && Math.abs(angDiff(this.yaw, this.yawTo(p))) < 1.1 && !h.proj && h.type === 'phys') {
      this.guard -= h.poiseDmg * 1.6; dmg = Math.round(dmg * .12); sfx('hit_flail', { pos: this.pos, vol: .8, rate: 1.3 }); burst(this.curB.x, this.pos.y + 1.2, this.curB.z, 8, { color: 0xffe0a0, smin: 2, smax: 5, lmin: .1, lmax: .3 });
      if (this.guard <= 0) { this.state = 'stagger'; this.stT = 0; this.stagT = 1.4; this.anim.play(CLIP.stagger); this.guard = 0; UI.toast('Guarda quebrada!'); }
      else { if (p.isPlayer) { p.useStam(8); p.kb.set(Math.sin(p.yaw) * -3, 0, Math.cos(p.yaw) * -3); } this.applyDmg(dmg, h, false); return true; }
    }
    this.applyDmg(dmg, h, crit);
    if (!this.alive) return true;
    if (!this.aggroed && PLAYER) this.aggro(PLAYER);
    // postura
    this.poise -= h.poiseDmg || 10; this.poiseT = 2.5;
    if (this.poise <= 0) { this.poise = this.maxPoise; this.atk = null; this.state = 'stagger'; this.stT = 0; this.stagT = this.T.mini ? 1.4 : .9; this.anim.play(CLIP.stagger); this.kb.set(Math.sin(this.yawTo(p || this) + PI) * 3, 0, Math.cos(this.yawTo(p || this) + PI) * 3); }
    else if (!this.hyper && !this.T.hyperAll && (h.poiseDmg || 0) >= 10 && this.state !== 'stagger') { this.atk = null; this.state = 'hurt'; this.stT = 0; this.anim.play(CLIP.hurt); if (h.src) { const k = (h.kb || 2) * .8 / Math.max(1, this.mass); this.kb.set((this.pos.x - h.src.x), 0, (this.pos.z - h.src.z)).normalize().multiplyScalar(k); } }
    return true;
  }
  applyDmg(dmg, h, crit) {
    this.hp -= dmg; this.flash = .1;
    const c = this.center(_v3);
    dmgNumber(c.x, c.y + this.h * .3, c.z, dmg, crit ? 'crit' : h.type !== 'phys' ? h.type : '');
    hitFx(this, h, crit);
    if (crit) { UI.toast('Golpe crítico!'); hitStop(.12); }
    const v = this.T.voice; if (v && v.hurt) sfxCD('hu_' + this.type, .25, pick(v.hurt), { pos: this.pos, vol: .55, jit: .08, rate: this.rig.s > 1.4 ? .8 : 1 });
    if (this.hp <= 0) this.die(h);
  }
  die(h) {
    this.hp = 0; this.alive = false; this.state = 'dead'; this.stT = 0; this.atk = null; this.ghost = true;
    this.anim.play(CLIP.die, { hold: true }); const v = this.T.voice; if (v && v.die) sfx(v.die, { pos: this.pos, vol: .7 });
    GAME.onEnemyKilled(this);
    if (this.T.bloat || this.T.explode) this.deathBlast();
  }
  deathBlast() {
    const x = this.pos.x, y = this.pos.y, z = this.pos.z, poison = this.T.bloat;
    telegraph(x, y, z, poison ? 3 : 3.6, .9, poison ? 0x8ac040 : 0xff6a1a);
    aoe({ x, y, z, r: poison ? 3 : 3.6, delay: .9, dur: poison ? 3 : .15, tick: poison ? .5 : 0, dmg: Math.round(this.T.dmg * this.lvl * (poison ? .25 : 1.1)), poiseDmg: poison ? 0 : 50, type: poison ? 'poison' : 'fire', team: 'enemy', owner: this, kb: poison ? 0 : 8, status: poison ? { poison: 6 } : { burn: 3 },
      onFire: () => { if (poison) { for (let i = 0; i < 40; i++) after(i * .07, () => burst(x + rnd(-2, 2), y + .4, z + rnd(-2, 2), 2, { add: false, color: 0x7a9a40, smin: .2, smax: .8, upBias: .5, lmin: 1, lmax: 2, szmin: .4, szmax: .9, alpha: .35, drag: 1 })); sfx('poison', { pos: this.pos, vol: .8 }); } else { burst(x, y + 1, z, 50, { color: 0xff8a2a, color2: 0xffe0a0, smin: 3, smax: 9, lmin: .4, lmax: .9, szmin: .15, szmax: .4 }); flashLight(x, y + 1, z, 0xff6a1a, 10, 12, .6); sfx('explosion', { pos: this.pos, vol: 1 }); shake(.4); } } });
  }
  deadUpd(dt) {
    this.anim.update(dt); this.sync();
    if (this.stT > 1.7 && !this.dissolved) {
      this.dissolved = true; const c = this.center(new V3());
      burst(c.x, c.y - .3, c.z, Math.round(40 * this.rig.s), { add: false, color: 0x8a847a, color2: 0x4a4640, smin: .3, smax: 1.5, upBias: 1.2, lmin: .8, lmax: 1.8, szmin: .06, szmax: .16, jit: .4 * this.rig.s, jy: 1.5, alpha: .8, drag: 1 });
      burst(c.x, c.y - .3, c.z, Math.round(12 * this.rig.s), { color: 0xff8a3a, smin: .3, smax: 1.2, upBias: 1.5, lmin: .6, lmax: 1.4, szmin: .04, szmax: .08, jit: .3 });
      this.root.visible = false; if (this.light) { removeLight(this.light); this.light = null; } if (this.candle) this.candle.on = false;
    }
  }
  remove() { super.remove(); const i = ENEMIES.indexOf(this); if (i >= 0) ENEMIES.splice(i, 1); if (this.light) removeLight(this.light); }
}
function wpick(list) { let s = 0; for (const a of list) s += a.w || 1; let r = Math.random() * s; for (const a of list) { r -= a.w || 1; if (r <= 0) return a; } return list[0]; }
// efeitos de impacto por material
function hitFx(t, h, crit) {
  const c = t.center(_v3), mat = t.T ? t.T.hit : t.hitMat || 'flesh', src = h.src || c;
  const x = lerp(c.x, src.x, .35), y = clamp(src.y, t.pos.y + .3, t.pos.y + t.h), z = lerp(c.z, src.z, .35);
  if (mat === 'armor' || mat === 'stone') { burst(x, y, z, crit ? 22 : 12, { color: 0xffd890, color2: 0xffffff, smin: 3, smax: 8, lmin: .1, lmax: .3, szmin: .03, szmax: .06, grav: 9 }); sfx(mat === 'armor' ? 'hit_flail' : 'crunch', { pos: c, vol: .55, jit: .1 }); }
  else if (mat === 'wood') { burst(x, y, z, 12, { add: false, color: 0x4a3a2a, smin: 1, smax: 4, lmin: .3, lmax: .6, szmin: .05, szmax: .12, grav: 8, alpha: .9 }); sfx('hit_club', { pos: c, vol: .5 }); }
  else if (mat === 'shadow') burst(x, y, z, 14, { color: 0x8a6aff, smin: 1, smax: 4, lmin: .2, lmax: .5 });
  else if (mat === 'fire') burst(x, y, z, 14, { color: 0xff8a2a, smin: 1, smax: 4, lmin: .2, lmax: .5 });
  else { burst(x, y, z, crit ? 22 : 12, { add: false, color: 0x3a0e0c, color2: 0x6a6258, smin: 1, smax: 4, lmin: .3, lmax: .6, szmin: .04, szmax: .1, grav: 8, alpha: .9 }); }
  if (h.from && h.from.isPlayer && h.from.w && !h.proj && !h.aoe) sfxAny(h.from.w.hitSfx, { pos: c, vol: .7, jit: .08 });
  if (h.type === 'fire') burst(x, y, z, 8, { color: 0xff7a2a, smin: 1, smax: 3, lmin: .2, lmax: .5 });
  if (h.from && h.from.isPlayer) { shake(crit ? .3 : .08); h.from.fp = Math.min(STATS.maxFp(), h.from.fp + 1.5); }
}
