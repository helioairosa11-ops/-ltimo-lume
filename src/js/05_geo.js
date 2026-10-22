// ===================== GEOMETRIA ESTÁTICA =====================
function cleanGeo(g) {
  if (g.index) g = g.toNonIndexed();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
  if (!g.attributes.uv) { const n = g.attributes.position.count; g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2)); }
  return g;
}
// UV em metros pelo eixo dominante da normal (mapeamento "caixa")
function worldUV(g) {
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (ay >= ax && ay >= az) uv.setXY(i, p.getX(i), p.getZ(i));
    else if (ax >= az) uv.setXY(i, p.getZ(i), p.getY(i));
    else uv.setXY(i, p.getX(i), p.getY(i));
  }
  uv.needsUpdate = true; return g;
}
const _mt = new M4(), _mq = new QT(), _ms = new V3(), _mp = new V3();
function xform(g, x, y, z, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _mq.setFromEuler(_e1.set(rx, ry, rz, 'YXZ')); _mt.compose(_mp.set(x, y, z), _mq, _ms.set(sx, sy, sz)); g.applyMatrix4(_mt); return g;
}
class SB {
  constructor() { this.parts = new Map(); }
  push(mk, g, o = {}) {
    g = cleanGeo(g); if (o.uv !== 'native') worldUV(g);
    const key = mk + '|' + (o.cast === false ? 0 : 1) + (o.recv === false ? 0 : 1);
    let a = this.parts.get(key); if (!a) this.parts.set(key, a = []); a.push(g); return g;
  }
  // caixa: (x,z) centro, y base
  box(x, y, z, w, h, d, rot, mk, o = {}) {
    const g = new THREE.BoxGeometry(w, h, d); xform(g, x, y + h / 2, z, rot); this.push(mk, g, o);
    if (o.solid !== false) addSolidBox(x, z, w / 2, d / 2, rot, y, y + h, { walk: o.walk !== false, cam: o.cam, tag: o.tag });
    return g;
  }
  cyl(x, y, z, rt, rb, h, mk, o = {}) {
    const g = new THREE.CylinderGeometry(rt, rb, h, o.seg || 12, 1, !!o.open); xform(g, x, y + h / 2, z, o.rot || 0);
    if (o.uvScale) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * o.uvScale[0], uv.getY(i) * o.uvScale[1]); }
    this.push(mk, g, Object.assign({ uv: o.uvScale ? 'native' : 'world' }, o));
    if (o.solid !== false) addSolidCyl(x, z, Math.max(rt, rb) * (o.colScale || 1), y, y + h, { walk: o.walk !== false, cam: o.cam });
    return g;
  }
  // parede de (x0,z0) a (x1,z1)
  wall(x0, z0, x1, z1, h, t, mk, o = {}) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), rot = Math.atan2(dx, dz) + HPI;
    return this.box((x0 + x1) / 2, o.y0 || 0, (z0 + z1) / 2, L + (o.ext ?? t), h, t, rot, mk, Object.assign({ walk: false }, o));
  }
  // laje retangular alinhada (topo em y)
  floor(x0, z0, x1, z1, y, t, mk, o = {}) {
    const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const g = new THREE.BoxGeometry(w, t, d); xform(g, cx, y - t / 2, cz); this.push(mk, g, Object.assign({ cast: false }, o));
    if (o.walk !== false) addFloor(cx, cz, w / 2, d / 2, 0, y, t, { cam: o.cam });
    return g;
  }
  slab(x, z, w, d, rot, y, t, mk, o = {}) {
    const g = new THREE.BoxGeometry(w, t, d); xform(g, x, y - t / 2, z, rot); this.push(mk, g, Object.assign({ cast: o.cast ?? false }, o));
    addFloor(x, z, w / 2, d / 2, rot, y, t, { cam: o.cam }); return g;
  }
  // escada ao longo do eixo local +z, centrada em (x,z), comprimento len, de y0 a y1
  stairs(x, z, w, len, rot, y0, y1, mk, o = {}) {
    const n = Math.max(2, Math.round(Math.abs(y1 - y0) / 0.28)), sd = len / n, c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const lz = -len / 2 + sd * (i + .5), top = y0 + (y1 - y0) * (i + 1) / n, base = Math.min(y0, y1) - 0.2;
      const g = new THREE.BoxGeometry(w, top - base, sd);
      xform(g, x + lz * s, base + (top - base) / 2, z + lz * c, rot); this.push(mk, g, Object.assign({ cast: false }, o));
    }
    addRamp(x, z, w / 2, len / 2, rot, y0, y1);
    if (o.sides) { // paredes laterais
      const h = Math.max(y0, y1) + (o.sideH || 1);
      for (const sx of [-1, 1]) { const lx = sx * (w / 2 + 0.2); this.box(x + lx * c, Math.min(y0, y1) - .2, z - lx * s, 0.4, h - Math.min(y0, y1) + .2, len, rot, mk, { walk: false }); }
    }
  }
  pillar(x, z, r, h, mk, o = {}) {
    const y = o.y || 0, cap = mk + (o.capMat ? '' : '');
    this.box(x, y, z, r * 2.6, 0.35, r * 2.6, o.rot || 0, o.capMat || mk, { solid: false });
    this.cyl(x, y + 0.35, z, r * .92, r, h - 0.75, mk, { seg: o.seg || 10, uvScale: [r * 6, h / 2], colScale: 1.15 });
    this.box(x, y + h - 0.4, z, r * 2.5, 0.4, r * 2.5, o.rot || 0, o.capMat || mk, { solid: false });
  }
  // arco em semicírculo (pedras), no plano local x, centro (x,z), largura interna w, altura dos pés h
  arch(x, z, w, h, rot, t, mk, o = {}) {
    const R = w / 2, n = 9, c = Math.cos(rot), s = Math.sin(rot), y = o.y || 0;
    for (const sx of [-1, 1]) { const lx = sx * (R + 0.35); this.box(x + lx * c, y, z - lx * s, 0.7, h, t, rot, mk); }
    for (let i = 0; i < n; i++) {
      const a0 = PI - i / n * PI, a1 = PI - (i + 1) / n * PI, am = (a0 + a1) / 2;
      const lx = Math.cos(am) * (R + 0.35), ly = h + Math.sin(am) * (R + .1);
      const g = new THREE.BoxGeometry(0.72, (R + .5) * PI / n + .06, t);
      xform(g, x + lx * c, y + ly, z - lx * s, rot, 0, am - HPI);
      this.push(mk, g, o);
    }
    if (o.top) this.box(x, y + h + R + .2, z, w + 1.4, o.top, t, rot, mk, { solid: o.topSolid !== false, walk: false });
  }
  build(parent) {
    const out = [];
    for (const [key, list] of this.parts) {
      const [mk, flags] = key.split('|');
      const g = mergeGeometries(list, false); list.forEach(x => x.dispose());
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, MAT(mk)); m.castShadow = flags[0] === '1'; m.receiveShadow = flags[1] === '1';
      m.matrixAutoUpdate = false; m.updateMatrix(); parent.add(m); out.push(m);
    }
    this.parts.clear(); return out;
  }
}
// Instâncias (props repetidos)
class Inst {
  constructor(geo, mat, cast = true, recv = true) { this.geo = geo; this.mat = mat; this.m = []; this.cast = cast; this.recv = recv; }
  add(x, y, z, ry = 0, s = 1, sy) { const M = new M4(); _mq.setFromEuler(_e1.set(0, ry, 0)); M.compose(new V3(x, y, z), _mq.clone(), new V3(s, sy ?? s, s)); this.m.push(M); return M; }
  addM(M) { this.m.push(M); }
  build(parent) {
    if (!this.m.length) return null;
    const im = new THREE.InstancedMesh(this.geo, this.mat, this.m.length);
    this.m.forEach((M, i) => im.setMatrixAt(i, M)); im.castShadow = this.cast; im.receiveShadow = this.recv;
    im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); parent.add(im); return im;
  }
}
// ---------- geometrias de props ----------
const PROPGEO = {};
function rockGeo(seed) {
  const k = 'rock' + seed; if (PROPGEO[k]) return PROPGEO[k];
  let g = new THREE.IcosahedronGeometry(1, 1); const p = g.attributes.position, r = mulberry(seed * 977 + 3);
  const off = []; for (let i = 0; i < 6; i++) off.push([r() * 10, r() * 10, r() * 10]);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let d = 1; for (const o of off) d += Math.sin(x * 2.1 + o[0]) * Math.sin(y * 1.9 + o[1]) * Math.sin(z * 2.3 + o[2]) * 0.09;
    p.setXYZ(i, x * d * 1.15, y * d * (0.65 + r() * .03), z * d);
  }
  g.computeVertexNormals(); g = cleanGeo(g);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) + p.getZ(i), p.getY(i));
  PROPGEO[k] = g; return g;
}
// árvore morta procedural (galhos recursivos)
function treeGeo(seed, kind = 'dead') {
  const k = 'tree' + kind + seed; if (PROPGEO[k]) return PROPGEO[k];
  const r = mulberry(seed * 31 + 7), parts = [];
  function branch(px, py, pz, dir, len, rad, depth) {
    const g = new THREE.CylinderGeometry(rad * 0.62, rad, len, depth > 1 ? 7 : 5, 1, true);
    g.translate(0, len / 2, 0);
    const q = new QT().setFromUnitVectors(UP, dir); g.applyQuaternion(q); g.translate(px, py, pz);
    parts.push(cleanGeo(g));
    const ex = px + dir.x * len, ey = py + dir.y * len, ez = pz + dir.z * len;
    if (depth <= 0 || rad < 0.04) return;
    const n = depth > 2 ? 2 + (r() * 2 | 0) : 2;
    for (let i = 0; i < n; i++) {
      const nd = dir.clone(); const ax = new V3(r() - .5, 0, r() - .5).normalize();
      nd.applyAxisAngle(ax, (kind === 'swamp' ? .9 : .6) + r() * .5); nd.y = Math.max(nd.y, kind === 'swamp' ? -0.2 : 0.15); nd.normalize();
      const t = 0.55 + r() * 0.45;
      branch(px + dir.x * len * t, py + dir.y * len * t, pz + dir.z * len * t, nd, len * (0.55 + r() * .2), rad * 0.6, depth - 1);
    }
    if (kind !== 'swamp' && r() < .5) branch(ex, ey, ez, dir.clone().add(new V3((r() - .5) * .4, 0, (r() - .5) * .4)).normalize(), len * .6, rad * .6, depth - 1);
  }
  const H = kind === 'ash' ? 5.5 : kind === 'swamp' ? 3.4 : 4.2;
  branch(0, -0.3, 0, new V3((r() - .5) * .15, 1, (r() - .5) * .15).normalize(), H, kind === 'ash' ? .38 : .32, kind === 'ash' ? 4 : 3);
  // raízes
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + r(); const g = new THREE.ConeGeometry(.22, 1.1, 5, 1, true); g.rotateZ(HPI + .5); g.rotateY(-a); g.translate(Math.cos(a) * .35, .1, Math.sin(a) * .35); parts.push(cleanGeo(g)); }
  const g = mergeGeometries(parts, false); parts.forEach(p => p.dispose());
  const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, Math.atan2(p.getX(i), p.getZ(i)) * .5, p.getY(i) * .5);
  g.computeBoundingSphere(); PROPGEO[k] = g; return g;
}
function candleGeo() {
  if (PROPGEO.candle) return PROPGEO.candle;
  const g = cleanGeo(new THREE.CylinderGeometry(0.035, 0.04, 1, 6)); g.translate(0, .5, 0); PROPGEO.candle = g; return g;
}
