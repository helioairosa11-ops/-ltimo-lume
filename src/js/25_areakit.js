// ===================== KIT DE CONSTRUÇÃO DE ÁREAS =====================
const BREAKABLES = [];
// ruído de mundo (não periódico) para terrenos
function vnoise(x, z, seed = 0) { const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz; const h = (a, b) => { const n = Math.sin((a + seed * 31.7) * 127.1 + (b - seed * 13.3) * 311.7) * 43758.5453; return n - Math.floor(n); }; const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz); return lerp(lerp(h(ix, iz), h(ix + 1, iz), u), lerp(h(ix, iz + 1), h(ix + 1, iz + 1), u), v); }
function wfbm(x, z, oct = 3, seed = 0) { let s = 0, a = .5, n = 0; for (let i = 0; i < oct; i++) { s += a * vnoise(x, z, seed + i); n += a; a *= .5; x *= 2.03; z *= 2.03; } return s / n; }
function smooth(a, b, x) { return sstep(clamp((x - a) / (b - a), 0, 1)); }
class AreaKit {
  constructor(group, area) { this.g = group; this.area = area; this.sb = new SB(); this.inst = new Map(); this.spawnPts = {}; this.lvl = area.lvl || 1; }
  I(key, geoFn, mat, cast = true) { let i = this.inst.get(key); if (!i) { i = new Inst(geoFn(), mat, cast, true); this.inst.set(key, i); } return i; }
  // ---------- estrutura ----------
  floor(x0, z0, x1, z1, y, mat, o = {}) { return this.sb.floor(Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1), y, o.t || .5, mat, o); }
  ceil(x0, z0, x1, z1, y, mat, t = .6) { const g = new THREE.BoxGeometry(Math.abs(x1 - x0), t, Math.abs(z1 - z0)); xform(g, (x0 + x1) / 2, y + t / 2, (z0 + z1) / 2); this.sb.push(mat, g, { cast: false }); }
  wall(x0, z0, x1, z1, h, mat, o = {}) { return this.sb.wall(x0, z0, x1, z1, h, o.t || .8, mat, o); }
  box(x, y, z, w, h, d, mat, o = {}) { return this.sb.box(x, y, z, w, h, d, o.rot || 0, mat, o); }
  stairs(x, z, w, len, rot, y0, y1, mat, o = {}) { return this.sb.stairs(x, z, w, len, rot, y0, y1, mat, o); }
  pillar(x, z, r, h, mat, o = {}) { return this.sb.pillar(x, z, r, h, mat, o); }
  arch(x, z, w, h, rot, mat, o = {}) { return this.sb.arch(x, z, w, h, rot, o.t || .9, mat, o); }
  // sala: paredes com aberturas. doors: [{side:'n'|'s'|'e'|'w', at: posição ao longo do lado, w: largura, h: altura}]
  room(x0, z0, x1, z1, h, wallMat, floorMat, o = {}) {
    const y = o.y || 0, t = o.t || .8;
    if (floorMat) this.floor(x0, z0, x1, z1, y, floorMat);
    if (o.ceil) this.ceil(x0 - t, z0 - t, x1 + t, z1 + t, y + h, o.ceil);
    const sides = { s: [x0, z0, x1, z0], n: [x0, z1, x1, z1], w: [x0, z0, x0, z1], e: [x1, z0, x1, z1] };
    for (const k in sides) {
      if (o.skip && o.skip.includes(k)) continue;
      const [ax, az, bx, bz] = sides[k]; const horiz = az === bz; const L = horiz ? bx - ax : bz - az;
      const ds = (o.doors || []).filter(d => d.side === k).sort((a, b) => a.at - b.at);
      let cur = 0;
      const seg = (s0, s1) => { if (s1 - s0 < .05) return; if (horiz) this.wall(ax + s0, az, ax + s1, az, h, wallMat, { y0: y, t, ext: 0 }); else this.wall(ax, az + s0, ax, az + s1, h, wallMat, { y0: y, t, ext: 0 }); };
      for (const d of ds) {
        const c = d.at, hw = (d.w || 2.4) / 2; seg(cur, c - hw);
        const dh = d.h || 3.2; if (dh < h) { if (horiz) this.box(ax + c, y + dh, az, hw * 2, h - dh, t, wallMat, { walk: false }); else this.box(ax, y + dh, az + c, t, h - dh, hw * 2, wallMat, { walk: false }); }
        cur = c + hw;
      }
      seg(cur, L);
      // cantos
      if (k === 's' || k === 'n') { this.box(ax, y, az, t, h, t, wallMat, { walk: false }); this.box(bx, y, bz, t, h, t, wallMat, { walk: false }); }
    }
  }
  // corredor reto ao longo de z ou x
  corridorZ(x, z0, z1, w, h, wallMat, floorMat, o = {}) { const y = o.y || 0; this.floor(x - w / 2, z0, x + w / 2, z1, y, floorMat); this.wall(x - w / 2, z0, x - w / 2, z1, h, wallMat, { y0: y, ext: 0 }); this.wall(x + w / 2, z0, x + w / 2, z1, h, wallMat, { y0: y, ext: 0 }); if (o.ceil) this.ceil(x - w / 2 - .5, z0, x + w / 2 + .5, z1, y + h, o.ceil); }
  corridorX(z, x0, x1, w, h, wallMat, floorMat, o = {}) { const y = o.y || 0; this.floor(x0, z - w / 2, x1, z + w / 2, y, floorMat); this.wall(x0, z - w / 2, x1, z - w / 2, h, wallMat, { y0: y, ext: 0 }); this.wall(x0, z + w / 2, x1, z + w / 2, h, wallMat, { y0: y, ext: 0 }); if (o.ceil) this.ceil(x0, z - w / 2 - .5, x1, z + w / 2 + .5, y + h, o.ceil); }
  // ---------- props ----------
  torch(x, y, z, yaw = 0) {
    const br = this.I('torchbr', () => { const g = cleanGeo(new THREE.CylinderGeometry(.04, .03, .55, 5)); g.rotateX(.5); g.translate(0, 0, .15); return g; }, MAT('iron'));
    br.add(x, y, z, yaw);
    const fx = x + Math.sin(yaw) * .3, fz = z + Math.cos(yaw) * .3;
    flame(this.g, fx, y + .2, fz, .55); addLight(fx, y + .5, fz, 0xff8a3a, 2.2, 9, .25); EMIT.torch(fx, y + .45, fz);
  }
  brazier(x, z, y = 0, s = 1) {
    this.sb.cyl(x, y, z, .12 * s, .18 * s, 1.0 * s, 'iron', { seg: 6 }); this.sb.cyl(x, y + 1.0 * s, z, .45 * s, .25 * s, .25 * s, 'iron', { seg: 10, solid: false });
    flame(this.g, x, y + 1.15 * s, z, 1.1 * s); addLight(x, y + 1.8 * s, z, 0xff8a3a, 3.2 * s, 12 * s, .2); EMIT.fire(x, y + 1.2 * s, z, .5 * s);
  }
  candles(x, z, n = 5, sp = .5, y = 0, light = true) {
    const ins = this.I('candle', candleGeo, MAT('candle'), false); const r = mulberry((x * 73 + z * 31) | 0);
    let cx = 0, cz = 0;
    for (let i = 0; i < n; i++) { const a = r() * TAU, d = r() * sp, h = .12 + r() * .3; const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; ins.add(px, y, pz, 0, 1, h); const f = glowSprite(this.g, px, y + h + .05, pz, .18, 0xffb060, .9); cx += px; cz += pz; if (i < 3) EMIT.candle(px, y + h + .05, pz); }
    if (light) addLight(cx / n, y + .6, cz / n, 0xffa050, 1.1, 5, .2);
  }
  coffin(x, z, yaw = 0, y = 0, open = false) {
    this.sb.box(x, y, z, .9, .55, 2.1, yaw, 'coffin'); this.sb.box(x + (open ? .5 : 0), y + .55, z, .95, .12, 2.15, yaw + (open ? .25 : 0), 'coffin', { solid: false });
  }
  sarcophagus(x, z, yaw = 0, y = 0) { this.sb.box(x, y, z, 1.2, .9, 2.4, yaw, 'stone_statue'); this.sb.box(x, y + .9, z, 1.3, .2, 2.5, yaw, 'stone_statue', { walk: true }); }
  grave(x, z, yaw = 0, y = 0, kind = 0) {
    const g = this.I('grave' + kind, () => { let gg; if (kind === 1) { const a = cleanGeo(new THREE.BoxGeometry(.12, 1.3, .12)); a.translate(0, .65, 0); const b = cleanGeo(new THREE.BoxGeometry(.7, .12, .12)); b.translate(0, .95, 0); gg = mergeGeometries([a, b]); } else { gg = cleanGeo(new THREE.BoxGeometry(.7, 1.0, .2)); gg.translate(0, .45, 0); } return gg; }, MAT('stone_statue'));
    g.add(x, y, z, yaw + rnd(-.15, .15)); addSolidBox(x, z, .35, .12, yaw, y, y + 1, { walk: false });
  }
  bones(x, z, y = 0) { const g = this.I('bone', () => { const a = cleanGeo(new THREE.CylinderGeometry(.03, .03, .45, 4)); a.rotateZ(HPI); return a; }, MAT('bone'), false); for (let i = 0; i < 4; i++) g.add(x + rnd(-.4, .4), y + .03, z + rnd(-.4, .4), rnd(0, TAU)); const sk = this.I('skull', () => cleanGeo(new THREE.SphereGeometry(.1, 6, 5)), MAT('bone'), false); sk.add(x + rnd(-.2, .2), y + .08, z + rnd(-.2, .2), 0); }
  rock(x, z, s = 1, y = null, kind = 0, solid = true) {
    const gy = y ?? (PHYS.terrain ? terrainAt(x, z) : 0); const i = this.I('rock' + kind, () => rockGeo(kind), MAT('rock'));
    i.add(x, gy - s * .25, z, rnd(0, TAU), s); if (solid && s > .5) addSolidCyl(x, z, s * .85, gy - 1, gy + s * .6, { walk: true });
  }
  tree(x, z, s = 1, kind = 'dead', y = null, solid = true) {
    const gy = y ?? (PHYS.terrain ? terrainAt(x, z) : 0); const v = (Math.abs(x * 7 + z * 13) | 0) % 4;
    const i = this.I('tree' + kind + v, () => treeGeo(v + 1, kind), kind === 'ash' ? MAT('bark', { color: 0xbab4aa }) : kind === 'swamp' ? MAT('bark', { color: 0x5a5a48 }) : MAT('bark'));
    i.add(x, gy, z, rnd(0, TAU), s); if (solid) addSolidCyl(x, z, .3 * s, gy - 1, gy + 4 * s, { walk: false });
  }
  banner(x, y, z, yaw, mat = 'cloth_red', w = 1, h = 2.6) { const g = new THREE.PlaneGeometry(w, h, 1, 4); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i); p.setZ(i, Math.sin(yy * 2) * .06); if (yy < -h * .45) p.setX(i, p.getX(i) * (Math.abs(p.getX(i)) > .1 ? 1 : .5)); } g.computeVertexNormals(); xform(g, x, y - h / 2, z, yaw); this.sb.push(mat, g, { uv: 'native', cast: false }); this.sb.box(x, y, z, w + .2, .08, .08, yaw, 'wood_dark', { solid: false }); }
  chainHang(x, y, z, len = 3) { const g = this.I('chain', () => { const c = cleanGeo(new THREE.CylinderGeometry(.025, .025, 1, 4)); c.translate(0, -.5, 0); return c; }, MAT('iron'), false); g.add(x, y, z, 0, 1, len); }
  // estátua (humanoide de pedra em pose)
  statue(x, z, yaw, pose = 'pray', s = 1.6, y = 0, o = {}) {
    const rig = buildHumanoid({ s, female: o.female ?? true, mats: { skin: MAT('stone_statue'), body: MAT('stone_statue'), arms: MAT('stone_statue'), legs: MAT('stone_statue'), boots: MAT('stone_statue'), accent: MAT('stone_statue'), veil: MAT('stone_statue'), hair: MAT('stone_statue') }, head: o.head || 'veil', skirt: { len: 1, r1: .55, mat: MAT('stone_statue') } });
    const P = { pray: { armL: [-1.6, .5, -.5], foreL: [-1.6, 0, 0], armR: [-1.6, -.5, .5], foreR: [-1.6, 0, 0], head: [.4, 0, 0] }, sword: { armR: [-3, 0, -.1], foreR: [-.2, 0, 0], armL: [-1.2, 0, .3], foreL: [-1.4, 0, 0], head: [-.2, 0, 0] }, weep: { armL: [-2.2, .4, -.6], foreL: [-2, 0, 0], armR: [-2.2, -.4, .6], foreR: [-2, 0, 0], head: [.7, 0, 0], spine: [.3, 0, 0] }, kneel: CLIP.kneel.keys[2][1] }[pose] || {};
    applyPose(rig, Object.assign({}, BASE_POSE, P)); if (pose === 'sword') { const w = weaponMesh('greatsword', s); rig.J.handR.add(w); w.rotation.x = PI; }
    rig.root.position.set(x, y + (o.base ?? .6), z); rig.root.rotation.y = yaw; rig.root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); this.g.add(rig.root);
    if (o.base !== 0) this.sb.box(x, y, z, 1.4 * s / 1.6, o.base ?? .6, 1.4 * s / 1.6, yaw, 'stone_statue');
    addSolidCyl(x, z, .55 * s / 1.6, y, y + 3 * s / 1.6, { walk: false });
  }
  window(x, y, z, yaw, w = 2, h = 5, color = 0xffd090, shaft = true) {
    const c = _mkCanvas(64), cx = c.getContext('2d'); const cols = ['#a83a2a', '#3a5aa8', '#c8a040', '#6a3a8a', '#2a7a5a'];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 12; j++) { cx.fillStyle = cols[(i * 3 + j * 7) % 5]; cx.fillRect(i * 11, j * 5.4, 11, 5.4); }
    cx.strokeStyle = '#111'; cx.lineWidth = 2; for (let i = 0; i <= 6; i++) { cx.beginPath(); cx.moveTo(i * 11, 0); cx.lineTo(i * 11, 64); cx.stroke(); } for (let j = 0; j <= 12; j++) { cx.beginPath(); cx.moveTo(0, j * 5.4); cx.lineTo(64, j * 5.4); cx.stroke(); }
    cx.beginPath(); cx.arc(32, 14, 12, 0, TAU); cx.stroke();
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, color: 0xcccccc, fog: false })); m.position.set(x, y, z); m.rotation.y = yaw; this.g.add(m);
    if (shaft) {
      const L = 14; const g = new THREE.CylinderGeometry(w * .45, w * 1.1, L, 4, 1, true); g.rotateY(PI / 4); g.translate(0, -L / 2, 0);
      const sm = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true }));
      sm.position.set(x, y + h * .3, z); sm.rotation.set(0, yaw, 0); sm.rotateX(-.75); this.g.add(sm);
      const dx = Math.sin(yaw), dz = Math.cos(yaw); addLight(x + dx * 5, y - 3, z + dz * 5, color, 1.6, 9, 0);
    }
  }
  // ---------- terreno, água, lava ----------
  terrain(x0, z0, x1, z1, fn, mat, res = 1.5) {
    const w = x1 - x0, d = z1 - z0, nx = Math.ceil(w / res), nz = Math.ceil(d / res);
    const g = new THREE.PlaneGeometry(w, d, nx, nz); g.rotateX(-HPI); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, fn(p.getX(i), p.getZ(i)));
    g.computeVertexNormals(); const uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), p.getZ(i));
    const m = new THREE.Mesh(g, MAT(mat)); m.receiveShadow = true; this.g.add(m); setTerrain(fn, x0, z0, x1, z1); return m;
  }
  water(x0, z0, x1, z1, y, color = 0x1a2a28, o = {}) {
    if (!TEX.waterN) TEX.waterN = genTex('waterN', (u, v, out) => { const n = fbm(u, v, 4, 6, 77); setc(out, [.5, .5, 1], n); }, { size: 256, bump: 3 });
    const n = TEX.waterN.normal.clone(); n.repeat.set((x1 - x0) / 6, (z1 - z0) / 6); n.needsUpdate = true;
    const mat = Q().std ? new THREE.MeshStandardMaterial({ color, roughness: .08, metalness: .4, normalMap: n, normalScale: new THREE.Vector2(.5, .5), transparent: true, opacity: o.opacity ?? .85, depthWrite: false }) : new THREE.MeshLambertMaterial({ color, transparent: true, opacity: .8 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat); m.rotation.x = -HPI; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; m.renderOrder = 2; this.g.add(m);
    FX.list.push({ update: (dt, t) => { n.offset.x = t * .02; n.offset.y = t * .013; } });
    addWaterZone(x0, z0, x1, z1, y);
    if (o.poison) addHazardZone(x0, z0, x1, z1, y, 'poison', o.poison);
    return m;
  }
  lava(x0, z0, x1, z1, y, o = {}) {
    const mat = MAT('lava', { tile: 5 }); const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat); m.rotation.x = -HPI; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); this.g.add(m);
    const g = m.geometry, uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) + (x0 + x1) / 2, -p.getY(i) + (z0 + z1) / 2);
    FX.list.push({ update: (dt, t) => { if (mat.map) { mat.map.offset.x = t * .01; mat.emissiveMap && (mat.emissiveMap.offset.x = t * .01); } mat.emissiveIntensity = 2 + Math.sin(t * 1.3) * .4; } });
    addHazardZone(x0, z0, x1, z1, y + .2, 'lava', o.dps ?? 900);
    if (o.floor !== false) addFloor((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2, 0, y - .3, .3, { cam: false });
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ww = (x1 - x0) / 2, dd = (z1 - z0) / 2;
    EMIT.lava(cx, y, cz, ww, dd);
    const nl = Math.max(1, Math.round(Math.max(ww, dd) / 9)); for (let i = 0; i < nl; i++) addLight(cx + (ww > dd ? (i / Math.max(1, nl - 1) - .5) * ww * 1.6 : 0), y + 1.5, cz + (dd >= ww ? (i / Math.max(1, nl - 1) - .5) * dd * 1.6 : 0), 0xff5a1a, 3.5, 14, .15);
    return m;
  }
  sky(o = {}) {
    const g = new THREE.SphereGeometry(300, 24, 12); const m = new THREE.ShaderMaterial({ uniforms: { top: { value: new COL(o.top || 0x0a0a14) }, bot: { value: new COL(o.bot || 0x2a2018) }, moon: { value: new V3(...(o.moonDir || [-.4, .5, .6])).normalize() }, mc: { value: new COL(o.moonC || 0xd8d8e8) }, stars: { value: o.stars ?? 1 } }, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform vec3 top,bot,moon,mc; uniform float stars; varying vec3 vP; float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);} void main(){ float y=vP.y; vec3 c=mix(bot,top,smoothstep(-.1,.6,y)); float md=dot(vP,moon); c+=mc*smoothstep(.9985,.999,md)*1.2+mc*pow(max(md,0.),60.)*.25; vec3 q=floor(vP*220.); float s=step(.997,h(q))*smoothstep(.0,.3,y)*stars; c+=vec3(s*.7); gl_FragColor=vec4(c,1.);}' });
    const sky = new THREE.Mesh(g, m); sky.renderOrder = -1; sky.frustumCulled = false; this.g.add(sky); this.skyMesh = sky;
    FX.list.push({ update: () => { sky.position.copy(R.camera.position); } });
  }
  // ---------- entidades ----------
  bonfire(id, x, y, z, o = {}) { const b = new Bonfire({ id, x, y, z, name: (BONFIRE_LIST[id] || {}).name }); const sy = o.spawnYaw ?? 0; this.spawnPts['bf_' + id] = o.spawn ? [o.spawn[0], y, o.spawn[1], sy] : [x + Math.sin(sy + PI) * 1.7, y, z + Math.cos(sy + PI) * 1.7, sy]; if (o.after) b.hideUntilBoss(o.after); return b; }
  enemy(type, x, y, z, yaw = 0, opt = {}) { WORLD.spawns.push({ type, x, y: y ?? (PHYS.terrain ? terrainAt(x, z) : 0), z, yaw, opt }); }
  boss(id, x, y, z, yaw, arena) { WORLD.bossSpawns[id] = { id, x, y, z, yaw, arena }; BOSSDEF[id].arena = arena; }
  fog(boss, x, y, z, yaw, w = 4.5, h = 5, inside = 1) { return new FogWall({ boss, x, y, z, yaw, w, h, inside }); }
  item(id, item, x, y, z, n = 1) { return new Pickup({ id, item, x, y, z, n }); }
  chest(id, item, x, y, z, yaw = 0, n = 1) { return new Chest({ id, item, x, y, z, yaw, n }); }
  door(id, x, y, z, yaw, o = {}) { return new Door(Object.assign({ id, x, y, z, yaw }, o)); }
  gate(id, x, y, z, yaw, o = {}) { return new Gate(Object.assign({ id, x, y, z, yaw }, o)); }
  lever(gate, x, y, z, yaw = 0, o = {}) { return new Lever(Object.assign({ gate, x, y, z, yaw }, o)); }
  elevator(id, x, z, y0, y1, w = 3) { return new Elevator({ id, x, y: y0, z, y0, y1, w }); }
  msg(x, y, z, text) { return new Message({ x, y, z, text }); }
  exit(x, y, z, to, spawn, label, o = {}) { return new Exit(Object.assign({ x, y, z, to, spawn, label }, o)); }
  zone(x0, z0, x1, z1, y, fn, o = {}) { return new Zone(Object.assign({ x0, z0, x1, z1, y, fn }, o)); }
  spawn(name, x, y, z, yaw = 0) { this.spawnPts[name] = [x, y, z, yaw]; }
  breakable(x, y, z, w, h, d, rot, mat, onBreak) {
    const g = new THREE.BoxGeometry(w, h, d); const m = new THREE.Mesh(g, MAT(mat)); m.position.set(x, y + h / 2, z); m.rotation.y = rot; m.castShadow = true; m.receiveShadow = true; this.g.add(m);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 3, uv.getY(i) * h / 3);
    const col = addSolidBox(x, z, w / 2, d / 2, rot, y, y + h, { walk: false }); const id = 'brk_' + Math.round(x) + '_' + Math.round(z);
    const b = { m, col, x, y, z, w, h, d, rot, id, broken: false, onBreak };
    if (PROG.flags[id]) { b.broken = true; m.visible = false; col.enabled = false; } else BREAKABLES.push(b);
    return b;
  }
  finish() { this.sb.build(this.g); for (const [k, i] of this.inst) i.build(this.g); }
}
// paredes falsas: a lâmina do jogador quebra-as
function checkBreakables(p) {
  if (!p.atk || p.atk.phase !== 'act' || !BREAKABLES.length) return;
  for (const b of BREAKABLES) {
    if (b.broken) continue; const c = p.curT;
    const dx = c.x - b.x, dz = c.z - b.z, cs = Math.cos(b.rot), sn = Math.sin(b.rot); const lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
    if (Math.abs(lx) < b.w / 2 + .3 && Math.abs(lz) < b.d / 2 + .3 && c.y > b.y && c.y < b.y + b.h) {
      b.broken = true; PROG.flags[b.id] = 1; b.col.enabled = false; b.m.visible = false;
      burst(b.x, b.y + b.h / 2, b.z, 60, { add: false, color: 0x6b6458, smin: 1, smax: 6, lmin: .5, lmax: 1.2, szmin: .15, szmax: .4, jit: b.w / 2, jy: b.h / 2, grav: 8, alpha: .8 });
      sfx('cavein', { pos: new V3(b.x, b.y, b.z), vol: .9 }); shake(.3); UI.toast('A parede era ilusória.'); b.onBreak && b.onBreak();
    }
  }
}
