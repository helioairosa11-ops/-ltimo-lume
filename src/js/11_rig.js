// ===================== ESQUELETOS E ANIMAÇÃO =====================
// Convenções: personagem olha para +Z, esquerda = +X. Membros pendem em -Y.
// Rotação X negativa num braço/coxa = para a frente. Rotação X positiva na canela = joelho dobra.
const JOINTS = ['hips', 'spine', 'chest', 'neck', 'head', 'armL', 'foreL', 'handL', 'armR', 'foreR', 'handR', 'legL', 'shinL', 'footL', 'legR', 'shinR', 'footR'];
function rimify(mat, color, power = 2.5, str = 1) {
  if (!mat.isMeshStandardMaterial) return mat;
  const m = mat.clone();
  m.onBeforeCompile = sh => {
    sh.uniforms.rimC = { value: new COL(color).multiplyScalar(str) }; sh.uniforms.rimP = { value: power };
    sh.fragmentShader = 'uniform vec3 rimC; uniform float rimP;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += rimC * pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), rimP);');
  };
  m.customProgramCacheKey = () => 'rim' + color + power + str;
  return m;
}
function capsule(r, len, mat, seg = 8) { const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len), 3, seg); g.translate(0, -len / 2, 0); const m = new THREE.Mesh(g, mat); m.castShadow = true; return m; }
function meshOf(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); m.castShadow = true; return m; }
// Perfil de torso (lathe): largura por altura
function torsoGeo(w, h, d, female) {
  const pts = []; const prof = female ? [[.62, 0], [.7, .12], [.6, .38], [.72, .62], [.95, .82], [1, .92], [.6, 1]] : [[.7, 0], [.78, .15], [.8, .4], [.92, .62], [1.0, .85], [.95, .95], [.55, 1]];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r * w, y * h));
  const g = new THREE.LatheGeometry(pts, 12); g.scale(1, 1, d / w); return g;
}
function skirtGeo(r0, r1, h, seg = 14, flare = 0) {
  const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push(new THREE.Vector2(lerp(r0, r1, Math.pow(t, .8)) + Math.sin(t * PI) * flare, -t * h)); }
  return new THREE.LatheGeometry(pts.reverse(), seg);
}
// ---------- humanoide ----------
// o: {s escala, female, mats:{skin,body,legs,arms,boots,accent}, head:'bare'|'hood'|'helm'|'crown'|'veil'|'hair'|'none', skirt:{len,r1,mat}, cape:{mat,len}, pauldrons:mat, bulk}
// ---------- skinify: junta as peças rígidas de um boneco em poucas SkinnedMesh (uma por material) ----------
// cada peça fica presa ao seu nó pai (que passa a ser um "osso"); as animações continuam a rodar os nós.
function skinify(root) {
  root.updateMatrixWorld(true);
  const inv = new M4().copy(root.matrixWorld).invert();
  const groups = new Map(), bones = [], boneIdx = new Map(), dead = [];
  root.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh || o.userData.noMerge) return;
    const m = o.material; if (!m || Array.isArray(m) || m.transparent || m.blending !== THREE.NormalBlending || !(m.isMeshStandardMaterial || m.isMeshLambertMaterial)) return;
    const b = o.parent; if (!boneIdx.has(b)) { boneIdx.set(b, bones.length); bones.push(b); }
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.morphAttributes = {}; g.clearGroups();
    g.applyMatrix4(new M4().multiplyMatrices(inv, o.matrixWorld));
    const n = g.attributes.position.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), bi = boneIdx.get(b);
    for (let i = 0; i < n; i++) { si[i * 4] = bi; sw[i * 4] = 1; }
    g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    if (!groups.has(m)) groups.set(m, []); groups.get(m).push(g); dead.push(o);
  });
  if (!dead.length) return root;
  for (const o of dead) { o.parent.remove(o); o.geometry.dispose && !o.geometry.userData.shared && o.geometry.dispose(); }
  const skel = new THREE.Skeleton(bones);
  const out = [];
  for (const [m, gs] of groups) {
    const geo = gs.length > 1 ? mergeGeometries(gs) : gs[0]; gs.forEach(x => x !== geo && x.dispose());
    geo.computeBoundingSphere(); geo.boundingSphere.radius *= 1.6;
    const sm = new THREE.SkinnedMesh(geo, m); sm.castShadow = true; sm.receiveShadow = true; sm.frustumCulled = true;
    root.add(sm); sm.updateMatrixWorld(true); sm.bind(skel, sm.matrixWorld); sm.boundingSphere = geo.boundingSphere.clone(); out.push(sm);
  }
  root.userData.skins = out;
  return root;
}
function buildHumanoid(o = {}) {
  const s = o.s || 1, bulk = o.bulk || 1, fem = !!o.female;
  const L = { hipH: .95 * s, thigh: .46 * s, shin: .45 * s, spine: .2 * s, chest: .34 * s, neck: .09 * s, headR: .118 * s * (o.headScale || 1), shW: (fem ? .17 : .2) * s * bulk, ua: .3 * s, fa: .27 * s, hipW: (fem ? .11 : .1) * s * bulk };
  const M = Object.assign({ skin: MAT('skin_pale'), body: MAT('cloth_dark'), legs: MAT('leather'), arms: MAT('cloth_dark'), boots: MAT('leather'), accent: MAT('steel') }, o.mats || {});
  const root = new THREE.Group(); const J = {};
  const mk = (name, parent, x, y, z) => { const j = new THREE.Group(); j.name = name; j.position.set(x, y, z); parent.add(j); J[name] = j; return j; };
  mk('hips', root, 0, L.hipH, 0); mk('spine', J.hips, 0, .02 * s, 0); mk('chest', J.spine, 0, L.spine, 0);
  mk('neck', J.chest, 0, L.chest, 0); mk('head', J.neck, 0, L.neck, 0);
  mk('armL', J.chest, L.shW, L.chest * .86, 0); mk('foreL', J.armL, 0, -L.ua, 0); mk('handL', J.foreL, 0, -L.fa, 0);
  mk('armR', J.chest, -L.shW, L.chest * .86, 0); mk('foreR', J.armR, 0, -L.ua, 0); mk('handR', J.foreR, 0, -L.fa, 0);
  mk('legL', J.hips, L.hipW, 0, 0); mk('shinL', J.legL, 0, -L.thigh, 0); mk('footL', J.shinL, 0, -L.shin, 0);
  mk('legR', J.hips, -L.hipW, 0, 0); mk('shinR', J.legR, 0, -L.thigh, 0); mk('footR', J.shinR, 0, -L.shin, 0);
  // malhas
  const pel = meshOf(new THREE.SphereGeometry(.16 * s * bulk, 10, 8), M.legs, 0, -.02 * s, 0, 0, 0, 0, 1.05, .7, .8); J.hips.add(pel);
  const abd = capsule(.115 * s * bulk, L.spine * .7, M.body); abd.position.y = L.spine * .85; J.spine.add(abd);
  const tor = meshOf(torsoGeo(.2 * s * bulk, L.chest, .13 * s * bulk, fem), M.body, 0, -.02 * s, 0); J.chest.add(tor);
  const nk = capsule(.045 * s, L.neck, M.skin); nk.position.y = L.neck; J.neck.add(nk);
  const hd = meshOf(new THREE.SphereGeometry(L.headR, 12, 10), M.skin, 0, L.headR * .9, .01 * s, 0, 0, 0, .9, 1.08, 1); J.head.add(hd);
  for (const side of ['L', 'R']) {
    const ua = capsule(.056 * s * bulk, L.ua - .05 * s, M.arms); ua.position.y = -.02 * s; J['arm' + side].add(ua);
    const fa = capsule(.047 * s * bulk, L.fa - .05 * s, M.arms); fa.position.y = -.02 * s; J['fore' + side].add(fa);
    const hn = meshOf(new THREE.BoxGeometry(.06 * s, .1 * s, .07 * s), M.skin, 0, -.05 * s, 0); J['hand' + side].add(hn);
    const th = capsule(.078 * s * bulk, L.thigh - .06 * s, M.legs); th.position.y = -.03 * s; J['leg' + side].add(th);
    const sh = capsule(.062 * s * bulk, L.shin - .06 * s, M.boots); sh.position.y = -.03 * s; J['shin' + side].add(sh);
    const ft = meshOf(new THREE.BoxGeometry(.09 * s, .07 * s, .22 * s), M.boots, 0, -.02 * s, .05 * s); J['foot' + side].add(ft);
  }
  // cabeça
  const hk = o.head || 'bare';
  if (hk === 'hood' || hk === 'veil') {
    const hood = meshOf(new THREE.SphereGeometry(L.headR * 1.32, 12, 10, 0, TAU, 0, PI * .62), hk === 'veil' ? (o.mats && o.mats.veil || MAT('cloth_white')) : M.body, 0, L.headR * .95, -.015 * s, -.25, 0, 0, 1, 1.15, 1.1);
    J.head.add(hood);
    const back = meshOf(new THREE.ConeGeometry(L.headR * 1.2, L.headR * 3.2, 10, 1, true), hood.material, 0, L.headR * .2, -.07 * s, -.35, 0, 0); J.head.add(back);
    hd.material = MAT('black');
  } else if (hk === 'helm') {
    const hm = meshOf(new THREE.CylinderGeometry(L.headR * 1.08, L.headR * 1.12, L.headR * 2.2, 12), M.accent, 0, L.headR * .95, 0); J.head.add(hm);
    const top = meshOf(new THREE.SphereGeometry(L.headR * 1.08, 12, 6, 0, TAU, 0, HPI), M.accent, 0, L.headR * 2.05, 0); J.head.add(top);
    const slit = meshOf(new THREE.BoxGeometry(L.headR * 1.4, L.headR * .14, .02 * s), MAT('black'), 0, L.headR * 1.15, L.headR * 1.08); J.head.add(slit);
    if (o.plume) { const pl = meshOf(new THREE.ConeGeometry(.05 * s, .4 * s, 6), o.plume, 0, L.headR * 2.6, -.05 * s, -.6); J.head.add(pl); }
  } else if (hk === 'crown') {
    const cr = new THREE.Group(); cr.position.y = L.headR * 1.75;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; cr.add(meshOf(new THREE.ConeGeometry(.022 * s, .11 * s * (i % 2 ? .7 : 1.2), 4), MAT('gold'), Math.sin(a) * L.headR * .85, .04 * s, Math.cos(a) * L.headR * .85)); }
    cr.add(meshOf(new THREE.TorusGeometry(L.headR * .88, .018 * s, 4, 16), MAT('gold'), 0, 0, 0, HPI)); J.head.add(cr); J.crown = cr;
  } else if (hk === 'hair') {
    const hair = meshOf(new THREE.SphereGeometry(L.headR * 1.08, 12, 10, 0, TAU, 0, PI * .6), o.mats && o.mats.hair || MAT('black'), 0, L.headR * 1.0, -.01 * s, -.2); J.head.add(hair);
    const tail = meshOf(new THREE.ConeGeometry(L.headR * .7, L.headR * 4.5, 8), hair.material, 0, -L.headR * .6, -L.headR * .9, .25); J.head.add(tail);
  }
  if (o.mask) { const mk2 = meshOf(new THREE.SphereGeometry(L.headR * 1.02, 10, 8, -1.1, 2.2, .5, 1.6), o.mask, 0, L.headR * .9, .02 * s); J.head.add(mk2); }
  if (o.pauldrons) for (const side of [1, -1]) { const p = meshOf(new THREE.SphereGeometry(.1 * s * bulk, 10, 8, 0, TAU, 0, PI * .55), o.pauldrons, side * L.shW * 1.02, L.chest * .9, 0, 0, 0, side * .5, 1.15, 1, 1); J.chest.add(p); }
  // saia / manto longo (balança com o movimento)
  let skirt = null;
  if (o.skirt) {
    skirt = new THREE.Group(); skirt.position.y = .06 * s; J.hips.add(skirt);
    const sk = meshOf(skirtGeo(.17 * s * bulk, o.skirt.r1 * s, o.skirt.len * s, 16, o.skirt.flare || 0), o.skirt.mat || M.body); sk.material = sk.material.clone ? (o.skirt.mat || M.body) : sk.material; sk.material.side = THREE.DoubleSide; skirt.add(sk);
  }
  let cape = null;
  if (o.cape) {
    cape = new THREE.Group(); cape.position.set(0, L.chest * .92, -.12 * s * bulk); J.chest.add(cape);
    const segs = 4, cl = (o.cape.len || 1.1) * s, cw = (o.cape.w || .46) * s;
    // corrente simples de segmentos
    let parent = cape; const chain = [];
    for (let i = 0; i < segs; i++) { const seg = new THREE.Group(); seg.position.y = i ? -cl / segs : 0; parent.add(seg); const pl = meshOf(new THREE.PlaneGeometry(cw * (1 + i * .12), cl / segs * 1.04), o.cape.mat, 0, -cl / segs / 2, 0); pl.material.side = THREE.DoubleSide; seg.add(pl); chain.push(seg); parent = seg; }
    cape.userData.chain = chain;
  }
  root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = false; } });
  if (!o.noSkin) skinify(root);
  return { root, J, L, s, skirt, cape, kind: 'human', female: fem };
}
// ---------- quadrúpede ----------
// o: {s, mats:{body, belly, eye}, len, legLen, neck, tail, snout, kind:'wolf'|'lizard'|'dog'}
function buildQuad(o = {}) {
  const s = o.s || 1, M = Object.assign({ body: MAT('cloth_grey'), dark: MAT('black'), eye: MAT('ember') }, o.mats || {});
  const root = new THREE.Group(), J = {};
  const mk = (n, p, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); p.add(j); J[n] = j; return j; };
  const lizard = o.kind === 'lizard';
  const hip = (lizard ? .35 : .6) * s, bl = (o.len || .9) * s, ll = (lizard ? .3 : .55) * s;
  mk('body', root, 0, hip, 0); mk('chest', J.body, 0, 0, bl / 2); mk('rear', J.body, 0, 0, -bl / 2);
  mk('neck', J.chest, 0, .05 * s, .1 * s); mk('head', J.neck, 0, (lizard ? .02 : .16) * s, (lizard ? .15 : .18) * s); mk('jaw', J.head, 0, -.04 * s, .05 * s);
  mk('tail', J.rear, 0, .04 * s, -.05 * s);
  for (const [n, p, x] of [['fl', 'chest', 1], ['fr', 'chest', -1], ['bl', 'rear', 1], ['br', 'rear', -1]]) { mk(n, J[p], x * (lizard ? .2 : .13) * s, -.02 * s, 0); mk(n + '2', J[n], 0, -ll * .5, 0); }
  const bodyM = meshOf(new THREE.CapsuleGeometry((lizard ? .2 : .2) * s, bl, 4, 10), M.body, 0, 0, 0, HPI, 0, 0, lizard ? 1.3 : 1, 1, lizard ? .7 : 1.05); J.body.add(bodyM);
  const chestM = meshOf(new THREE.SphereGeometry(.25 * s, 10, 8), M.body, 0, .03 * s, 0, 0, 0, 0, 1, lizard ? .7 : 1.05, 1.1); J.chest.add(chestM);
  const neckM = capsule(.11 * s, .2 * s, M.body); neckM.rotation.x = lizard ? -1.5 : -.8; neckM.position.set(0, 0, 0); J.neck.add(neckM);
  const headM = meshOf(new THREE.BoxGeometry(.2 * s, .17 * s, .22 * s), M.body, 0, 0, 0); J.head.add(headM);
  const snout = meshOf(new THREE.BoxGeometry(.12 * s, .09 * s, (lizard ? .26 : .2) * s), M.body, 0, -.02 * s, .18 * s); J.head.add(snout);
  const jawM = meshOf(new THREE.BoxGeometry(.1 * s, .04 * s, .22 * s), M.dark, 0, -.02 * s, .1 * s); J.jaw.add(jawM);
  for (const x of [1, -1]) { J.head.add(meshOf(new THREE.SphereGeometry(.022 * s, 6, 4), M.eye, x * .06 * s, .04 * s, .1 * s)); if (!lizard) J.head.add(meshOf(new THREE.ConeGeometry(.045 * s, .12 * s, 4), M.body, x * .07 * s, .12 * s, -.03 * s, -.2)); }
  for (const n of ['fl', 'fr', 'bl', 'br']) { const u = capsule(.065 * s, ll * .5, M.body); J[n].add(u); const l = capsule(.045 * s, ll * .45, M.body); J[n + '2'].add(l); l.add(meshOf(new THREE.BoxGeometry(.08 * s, .04 * s, .1 * s), M.dark, 0, -ll * .5, .02 * s)); }
  let tp = J.tail; const tails = [];
  for (let i = 0; i < (lizard ? 5 : 3); i++) { const seg = new THREE.Group(); seg.position.z = i ? -.18 * s : 0; tp.add(seg); const tm = meshOf(new THREE.ConeGeometry((lizard ? .12 : .07) * s * (1 - i * .16), .22 * s, 6), M.body, 0, 0, -.1 * s, -HPI); seg.add(tm); tails.push(seg); tp = seg; }
  root.traverse(m => { if (m.isMesh) m.castShadow = true; });
  if (!o.noSkin) skinify(root);
  return { root, J, s, tails, kind: 'quad', lizard, hip, bl, ll };
}
// ---------- poses ----------
// pose = { joint: [rx,ry,rz], _y: deslocamento do quadril, _lean }
const P0 = {};
function poseLerp(a, b, t, out = {}) {
  for (const k in a) if (!(k in b)) out[k] = Array.isArray(a[k]) ? a[k].map(v => v * (1 - t)) : a[k] * (1 - t);
  for (const k in b) { const av = a[k], bv = b[k]; if (Array.isArray(bv)) { const x = av || [0, 0, 0]; out[k] = [x[0] + (bv[0] - x[0]) * t, x[1] + (bv[1] - x[1]) * t, x[2] + (bv[2] - x[2]) * t]; } else out[k] = (av || 0) + (bv - (av || 0)) * t; }
  return out;
}
function poseAdd(a, b, w = 1) { const o = Object.assign({}, a); for (const k in b) { const bv = b[k]; if (Array.isArray(bv)) { const x = o[k] || [0, 0, 0]; o[k] = [x[0] + bv[0] * w, x[1] + bv[1] * w, x[2] + bv[2] * w]; } else o[k] = (o[k] || 0) + bv * w; } return o; }
const BASE_POSE = { armL: [.05, 0, .1], armR: [.05, 0, -.1], foreL: [-.2, 0, 0], foreR: [-.2, 0, 0], legL: [0, 0, .02], legR: [0, 0, -.02], shinL: [.04, 0, 0], shinR: [.04, 0, 0] };
// locomoção humana: fase φ, quantidade (0 parado .. 1 caminhar .. 2 correr .. 3 sprint), direção local (fx, sx)
function locoPose(ph, amt, fx = 1, sx = 0, armed = true) {
  const p = Object.assign({}, BASE_POSE);
  const breathe = Math.sin(TIME.now * 1.8) * .02;
  p.chest = [breathe, 0, 0]; p.spine = [0, 0, 0];
  if (amt < .02) { p._y = -0.01 + breathe * .2; return p; }
  const run = clamp(amt - 1, 0, 1), spr = clamp(amt - 2, 0, 1), wk = clamp(amt, 0, 1);
  const A = (.42 + run * .38 + spr * .15) * wk, K = (.5 + run * .7 + spr * .2) * wk;
  const sn = Math.sin(ph), cs = Math.cos(ph);
  const f = fx, sd = sx * .7;
  p.legL = [-sn * A * f, 0, .02 - sn * A * sd]; p.legR = [sn * A * f, 0, -.02 + sn * A * sd];
  p.shinL = [.05 + Math.max(0, Math.sin(ph + 1.9)) * K, 0, 0]; p.shinR = [.05 + Math.max(0, Math.sin(ph + 1.9 + PI)) * K, 0, 0];
  p.footL = [Math.max(0, -Math.sin(ph + .4)) * .3 * wk, 0, 0]; p.footR = [Math.max(0, Math.sin(ph + .4)) * .3 * wk, 0, 0];
  const aA = (.35 + run * .45 + spr * .2) * wk;
  p.armL = [sn * aA, 0, .12]; p.armR = [-sn * aA, 0, -.12];
  p.foreL = [-.25 - run * .9 - spr * .2, 0, 0]; p.foreR = [-.25 - run * .9 - spr * .2, 0, 0];
  p.spine = [(.06 + run * .12 + spr * .12) * f, sn * .06 * wk, 0]; p.chest = [breathe + run * .06, sn * .1 * wk, 0];
  p._y = -Math.abs(cs) * (.03 + run * .05) - run * .04;
  return p;
}
// animador: combina locomoção + ação (pose-clip ou função)
class Animator {
  constructor(rig) { this.rig = rig; this.ph = 0; this.amt = 0; this.fx = 1; this.sx = 0; this.act = null; this.w = 0; this.prev = null; this.pose = Object.assign({}, BASE_POSE); this.hold = null; this.holdT = 0; }
  // clip: {dur, keys:[[t, pose, ease?]...], fadeIn, fadeOut, loop, mask:[joints]}
  play(clip, o = {}) { this.act = { clip, t: o.t || 0, speed: o.speed || 1, fadeIn: clip.fadeIn ?? .06, fadeOut: clip.fadeOut ?? .12, done: false, hold: !!o.hold }; return this.act; }
  stop(fade = .12) { if (this.act) { this.act.done = true; this.act.fadeOut = fade; this.act.stopT = 0; } }
  sample(clip, t) {
    const K = clip.keys; if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) { if (t <= K[i][0]) { const a = K[i - 1], b = K[i]; let u = (t - a[0]) / Math.max(1e-4, b[0] - a[0]); const e = b[2]; u = e === 'in' ? easeIn(u) : e === 'out' ? easeOut(u) : e === 'lin' ? u : sstep(u); return poseLerp(a[1], b[1], u); } }
    return K[K.length - 1][1];
  }
  update(dt, extra) {
    const rig = this.rig;
    let base = locoPose(this.ph, this.amt, this.fx, this.sx);
    if (this.act) {
      const a = this.act; a.t += dt * a.speed;
      let w;
      if (a.done) { a.stopT += dt; w = Math.max(0, 1 - a.stopT / a.fadeOut) * (a.wAtStop ?? 1); if (a.wAtStop === undefined) a.wAtStop = this.w; if (w <= 0) this.act = null; }
      else { w = Math.min(1, a.t / Math.max(1e-3, a.fadeIn)); if (!a.clip.loop && !a.hold && a.t >= a.clip.dur) { a.done = true; a.stopT = 0; a.wAtStop = 1; } }
      if (this.act) {
        const ct = a.clip.loop ? a.t % a.clip.dur : Math.min(a.t, a.clip.dur);
        const ap = typeof a.clip.fn === 'function' ? a.clip.fn(ct, a) : this.sample(a.clip, ct);
        if (a.clip.mask) { const mp = Object.assign({}, base); for (const k of a.clip.mask) if (ap[k]) mp[k] = ap[k]; base = poseLerp(base, mp, w); }
        else base = poseLerp(base, Object.assign({}, BASE_POSE, ap), w);
        this.w = w;
      }
    }
    if (extra) base = poseAdd(base, extra);
    this.pose = base;
    applyPose(rig, base);
  }
}
function applyPose(rig, p) {
  const J = rig.J;
  for (const k of JOINTS) { const j = J[k]; if (!j) continue; const v = p[k]; if (v) j.rotation.set(v[0], v[1], v[2]); else j.rotation.set(0, 0, 0); }
  if (J.hips) { J.hips.position.y = rig.L.hipH + (p._y || 0) * rig.s; J.hips.rotation.set(p.hips ? p.hips[0] : 0, p.hips ? p.hips[1] : 0, p.hips ? p.hips[2] : 0); }
}
// ---------- IK de dois ossos (braço) ----------
const _ikS = new V3(), _ikT = new V3(), _ikP = new V3(), _ikE = new V3(), _ikU = new V3(), _ikD = new V3(), _ikQ = new QT(), _ikQ2 = new QT(), _ikM = new M4(), _down = new V3(0, -1, 0);
// alvo e polo em coordenadas do mundo
function armIK(rig, side, target, pole) {
  const J = rig.J, arm = J['arm' + side], fore = J['fore' + side], chest = J.chest;
  chest.updateWorldMatrix(true, false);
  _ikM.copy(chest.matrixWorld).invert();
  _ikS.copy(arm.position); _ikT.copy(target).applyMatrix4(_ikM); _ikP.copy(pole).applyMatrix4(_ikM).sub(_ikS);
  const l1 = rig.L.ua, l2 = rig.L.fa;
  _ikD.subVectors(_ikT, _ikS); let d = _ikD.length(); if (d < 1e-4) return; _ikD.multiplyScalar(1 / d);
  d = clamp(d, Math.abs(l1 - l2) + .01, l1 + l2 - .002);
  _ikU.copy(_ikP).addScaledVector(_ikD, -_ikP.dot(_ikD)); if (_ikU.lengthSq() < 1e-6) _ikU.set(0, 0, -1); _ikU.normalize();
  const ca = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), sa = Math.sqrt(1 - ca * ca);
  _ikE.copy(_ikS).addScaledVector(_ikD, ca * l1).addScaledVector(_ikU, sa * l1);
  // braço
  _v2.subVectors(_ikE, _ikS).normalize(); arm.quaternion.setFromUnitVectors(_down, _v2);
  // antebraço (no espaço do braço)
  _v3.copy(_ikS).addScaledVector(_ikD, d).sub(_ikE).normalize();
  _ikQ.copy(arm.quaternion).invert(); _v3.applyQuaternion(_ikQ); fore.quaternion.setFromUnitVectors(_down, _v3);
}
// orienta a mão (e a arma presa nela): eixo +Y da mão = direção da lâmina, +Z = "fio"
const _hx = new V3(), _hy = new V3(), _hz = new V3();
function handAim(rig, side, bladeDir, edgeUp) {
  const hand = rig.J['hand' + side];
  _hy.copy(bladeDir).normalize(); _hz.copy(edgeUp).addScaledVector(_hy, -edgeUp.dot(_hy)); if (_hz.lengthSq() < 1e-6) _hz.set(0, 0, 1); _hz.normalize(); _hx.crossVectors(_hy, _hz);
  _ikM.makeBasis(_hx, _hy, _hz); _ikQ.setFromRotationMatrix(_ikM);
  hand.parent.updateWorldMatrix(true, false); hand.parent.getWorldQuaternion(_ikQ2); _ikQ2.invert();
  hand.quaternion.copy(_ikQ2.multiply(_ikQ));
}
// ---------- verlet (correntes, incensário) ----------
class Chain {
  constructor(n, segLen, damp = .985) { this.n = n; this.L = segLen; this.p = []; this.o = []; this.damp = damp; for (let i = 0; i < n; i++) { this.p.push(new V3()); this.o.push(new V3()); } }
  reset(a) { for (let i = 0; i < this.n; i++) { this.p[i].set(a.x, a.y - i * this.L, a.z); this.o[i].copy(this.p[i]); } }
  step(anchor, dt, grav = 9.8) {
    const p = this.p, o = this.o; p[0].copy(anchor); o[0].copy(anchor);
    for (let i = 1; i < this.n; i++) { const vx = (p[i].x - o[i].x) * this.damp, vy = (p[i].y - o[i].y) * this.damp, vz = (p[i].z - o[i].z) * this.damp; o[i].copy(p[i]); p[i].x += vx; p[i].y += vy - grav * dt * dt; p[i].z += vz; }
    for (let it = 0; it < 4; it++) for (let i = 1; i < this.n; i++) {
      const a = p[i - 1], b = p[i]; _v1.subVectors(b, a); const d = _v1.length() || 1e-4, diff = (d - this.L) / d;
      if (i === 1) b.addScaledVector(_v1, -diff); else { a.addScaledVector(_v1, diff * .5); b.addScaledVector(_v1, -diff * .5); }
      const gy = groundAt(b.x, b.z, b.y + .3) + .1; if (b.y < gy) b.y = gy;
    }
  }
}
