// ===================== COLISÃO 2.5D =====================
// Sólidos (caixas orientadas / cilindros com faixa de altura), superfícies de chão (lajes, rampas, topo de caixas) e terreno.
const PHYS = { shapes: [], grid: new Map(), cell: 6, terrain: null, tb: null, killY: -30, hazards: [], water: [] };
let _shapeId = 0;
function physClear() { PHYS.shapes.length = 0; PHYS.grid.clear(); PHYS.terrain = null; PHYS.tb = null; PHYS.killY = -30; PHYS.hazards.length = 0; PHYS.water.length = 0; }
function _gkey(cx, cz) { return cx * 73856093 ^ cz * 19349663; }
function _insert(s) {
  const c = PHYS.cell, x0 = Math.floor((s.minx) / c), x1 = Math.floor((s.maxx) / c), z0 = Math.floor((s.minz) / c), z1 = Math.floor((s.maxz) / c);
  for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) { const k = _gkey(i, j); let a = PHYS.grid.get(k); if (!a) PHYS.grid.set(k, a = []); a.push(s); }
}
function _aabb(s) {
  if (s.k === 'cyl') { s.minx = s.x - s.r; s.maxx = s.x + s.r; s.minz = s.z - s.r; s.maxz = s.z + s.r; return; }
  const ex = Math.abs(s.c * s.hx) + Math.abs(s.s * s.hz), ez = Math.abs(s.s * s.hx) + Math.abs(s.c * s.hz);
  s.minx = s.x - ex; s.maxx = s.x + ex; s.minz = s.z - ez; s.maxz = s.z + ez;
}
// rot: igual a mesh.rotation.y
function addSolidBox(x, z, hx, hz, rot, y0, y1, o = {}) {
  const s = { id: ++_shapeId, k: 'box', x, z, hx, hz, rot, c: Math.cos(rot), s: Math.sin(rot), y0, y1, solid: o.solid !== false, walk: o.walk !== false, tag: o.tag || null, cam: o.cam !== false, enabled: true };
  _aabb(s); PHYS.shapes.push(s); _insert(s); return s;
}
function addSolidCyl(x, z, r, y0, y1, o = {}) {
  const s = { id: ++_shapeId, k: 'cyl', x, z, r, y0, y1, solid: o.solid !== false, walk: o.walk !== false, tag: o.tag || null, cam: o.cam !== false, enabled: true };
  _aabb(s); PHYS.shapes.push(s); _insert(s); return s;
}
// laje de chão (superfície caminhável, com espessura para a câmera)
function addFloor(x, z, hx, hz, rot, y, thick = 0.3, o = {}) {
  const s = { id: ++_shapeId, k: 'floor', x, z, hx, hz, rot, c: Math.cos(rot), s: Math.sin(rot), y0: y - thick, y1: y, solid: false, walk: true, tag: o.tag || null, cam: o.cam !== false, enabled: true };
  _aabb(s); PHYS.shapes.push(s); _insert(s); return s;
}
// rampa ao longo do eixo local z: de -hz (yA) a +hz (yB)
function addRamp(x, z, hx, hz, rot, yA, yB, o = {}) {
  const s = { id: ++_shapeId, k: 'ramp', x, z, hx, hz, rot, c: Math.cos(rot), s: Math.sin(rot), yA, yB, y0: Math.min(yA, yB) - 0.4, y1: Math.max(yA, yB), solid: false, walk: true, tag: o.tag || null, cam: false, enabled: true };
  _aabb(s); PHYS.shapes.push(s); _insert(s); return s;
}
function setTerrain(fn, x0, z0, x1, z1) { PHYS.terrain = fn; PHYS.tb = [x0, z0, x1, z1]; }
function _local(s, x, z) { const dx = x - s.x, dz = z - s.z; return [dx * s.c - dz * s.s, dx * s.s + dz * s.c]; }
function _near(x, z, r) {
  const c = PHYS.cell, x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c), z0 = Math.floor((z - r) / c), z1 = Math.floor((z + r) / c);
  if (x0 === x1 && z0 === z1) return PHYS.grid.get(_gkey(x0, z0)) || [];
  const out = new Set();
  for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) { const a = PHYS.grid.get(_gkey(i, j)); if (a) for (const s of a) out.add(s); }
  return out;
}
function terrainAt(x, z) { if (!PHYS.terrain) return -Infinity; const b = PHYS.tb; if (x < b[0] || x > b[2] || z < b[1] || z > b[3]) return -Infinity; return PHYS.terrain(x, z); }
// altura do chão sob (x,z) que seja <= yRef+step
function groundAt(x, z, yRef = 1e9, step = 0.55) {
  let best = -Infinity; const lim = yRef + step;
  const t = terrainAt(x, z); if (t <= lim) best = t;
  for (const s of _near(x, z, 0)) {
    if (!s.enabled || !s.walk) continue;
    let y;
    if (s.k === 'cyl') { if (Math.hypot(x - s.x, z - s.z) > s.r) continue; y = s.y1; }
    else {
      const [lx, lz] = _local(s, x, z); if (Math.abs(lx) > s.hx || Math.abs(lz) > s.hz) continue;
      y = s.k === 'ramp' ? lerp(s.yA, s.yB, (lz + s.hz) / (2 * s.hz)) : s.y1;
    }
    if (y <= lim && y > best) best = y;
  }
  return best;
}
// teto (para saltos) — menor fundo de sólido acima
function ceilingAt(x, z, yFrom) {
  let best = Infinity;
  for (const s of _near(x, z, 0)) {
    if (!s.enabled || (!s.solid && s.k !== 'floor')) continue;
    if (s.k === 'cyl') { if (Math.hypot(x - s.x, z - s.z) > s.r) continue; }
    else { const [lx, lz] = _local(s, x, z); if (Math.abs(lx) > s.hx || Math.abs(lz) > s.hz) continue; }
    if (s.y0 >= yFrom && s.y0 < best) best = s.y0;
  }
  return best;
}
// empurra um círculo (ent.x, ent.z, ent.r) para fora dos sólidos que se sobrepõem verticalmente
function resolveCircle(e, step = 0.55) {
  const r = e.r, y = e.y, top = e.y + (e.h || 1.8);
  let hit = false;
  for (let iter = 0; iter < 2; iter++) {
    for (const s of _near(e.x, e.z, r + 0.1)) {
      if (!s.enabled || !s.solid) continue;
      if (top <= s.y0 + 0.02 || y >= s.y1 - 0.02) continue;
      if (s.walk && s.y1 <= y + step) continue; // degrau: pode subir
      if (s.k === 'cyl') {
        const dx = e.x - s.x, dz = e.z - s.z, d = Math.hypot(dx, dz), m = r + s.r;
        if (d < m) { hit = true; if (d < 1e-4) { e.x += m; continue; } e.x = s.x + dx / d * m; e.z = s.z + dz / d * m; }
      } else {
        const [lx, lz] = _local(s, e.x, e.z);
        const cx = clamp(lx, -s.hx, s.hx), cz = clamp(lz, -s.hz, s.hz);
        let dx = lx - cx, dz = lz - cz; const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        hit = true;
        let nlx, nlz;
        if (d2 > 1e-8) { const d = Math.sqrt(d2); nlx = cx + dx / d * r; nlz = cz + dz / d * r; }
        else { // centro dentro da caixa: sai pelo lado mais próximo
          const px = s.hx - Math.abs(lx), pz = s.hz - Math.abs(lz);
          if (px < pz) { nlx = Math.sign(lx || 1) * (s.hx + r); nlz = lz; } else { nlx = lx; nlz = Math.sign(lz || 1) * (s.hz + r); }
        }
        // local -> mundo
        e.x = s.x + nlx * s.c + nlz * s.s; e.z = s.z - nlx * s.s + nlz * s.c;
      }
    }
  }
  return hit;
}
// ponto dentro de algum sólido (para câmera / projéteis)
function pointBlocked(x, y, z, camOnly = false) {
  for (const s of _near(x, z, 0)) {
    if (!s.enabled) continue; if (camOnly && !s.cam) continue;
    if (!s.solid && s.k !== 'floor') continue;
    if (y < s.y0 || y > s.y1) continue;
    if (s.k === 'cyl') { if (Math.hypot(x - s.x, z - s.z) <= s.r) return true; continue; }
    const [lx, lz] = _local(s, x, z); if (Math.abs(lx) <= s.hx && Math.abs(lz) <= s.hz) return true;
  }
  const t = terrainAt(x, z); if (t > y) return true;
  return false;
}
// raio por amostragem: devolve fração [0..1] até ao primeiro bloqueio
function rayFrac(ax, ay, az, bx, by, bz, stepLen = 0.25, camOnly = true) {
  const L = Math.hypot(bx - ax, by - ay, bz - az), n = Math.max(1, Math.ceil(L / stepLen));
  for (let i = 1; i <= n; i++) { const t = i / n; if (pointBlocked(ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t, camOnly)) return (i - 1) / n; }
  return 1;
}
function losClear(ax, ay, az, bx, by, bz) { return rayFrac(ax, ay, az, bx, by, bz, 0.5, false) >= 0.999; }
// zonas de perigo (lava, veneno) e água
function addHazardZone(x0, z0, x1, z1, y, kind, dps) { PHYS.hazards.push({ x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), y, kind, dps }); }
function hazardAt(x, y, z) { for (const h of PHYS.hazards) if (x >= h.x0 && x <= h.x1 && z >= h.z0 && z <= h.z1 && y <= h.y + 0.15) return h; return null; }
function addWaterZone(x0, z0, x1, z1, y) { PHYS.water.push({ x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), y }); }
function waterAt(x, y, z) { for (const w of PHYS.water) if (x >= w.x0 && x <= w.x1 && z >= w.z0 && z <= w.z1 && y < w.y - 0.05) return w; return null; }
