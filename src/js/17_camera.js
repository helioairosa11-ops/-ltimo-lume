// ===================== CÂMERA =====================
const CAM = { yaw: 0, pitch: .3, dist: 5.3, curDist: 5.3, pivot: new V3(), pos: new V3(), look: new V3(), recenter: 0, idleT: 0, override: null, fovK: 1 };
function camReset(p) { CAM.yaw = p.yaw; CAM.pitch = .3; CAM.pivot.set(p.pos.x, p.pos.y + 1.55, p.pos.z); CAM.curDist = CAM.dist; }
function updCamera(dt) {
  const cam = R.camera, p = PLAYER;
  const [lx, ly] = lookInput(dt);
  if (CAM.override) { // câmera cinematográfica
    const o = CAM.override; o.t = (o.t || 0) + dt; const k = o.dur ? sstep(Math.min(1, o.t / o.dur)) : 1;
    const from = o.from || CAM.pos, to = o.to;
    cam.position.lerpVectors(from, to, k); const lk = _v1.lerpVectors(o.lookFrom || o.look, o.look, k); cam.lookAt(lk);
    if (o.shakeV) { cam.position.x += rnd(-1, 1) * o.shakeV; cam.position.y += rnd(-1, 1) * o.shakeV; }
    CAM.pos.copy(cam.position); return;
  }
  if (!p) return;
  const tgt = p.lock && p.lock.alive ? p.lock : null;
  const piv = _v2.set(p.pos.x, p.pos.y + 1.55, p.pos.z);
  CAM.pivot.x = damp(CAM.pivot.x, piv.x, 18, dt); CAM.pivot.z = damp(CAM.pivot.z, piv.z, 18, dt); CAM.pivot.y = damp(CAM.pivot.y, piv.y, p.onGround ? 10 : 5, dt);
  if (tgt) {
    const ty = yawTo(p.pos.x, p.pos.z, tgt.pos.x, tgt.pos.z), d = p.dist(tgt);
    CAM.yaw = dampAngle(CAM.yaw, ty, d < 2 ? 3 : 7, dt);
    const dh = (tgt.pos.y + tgt.h * .55) - (p.pos.y + 1.4);
    const want = clamp(.26 - Math.atan2(dh, Math.max(2, d)) * .7 + (tgt.h > 3 ? .1 : 0), -.2, .7);
    CAM.pitch = damp(CAM.pitch, want, 4, dt);
    CAM.idleT = 0;
  } else {
    CAM.yaw += lx; CAM.pitch = clamp(CAM.pitch + ly, -.55, 1.15);
    if (Math.abs(lx) + Math.abs(ly) > 1e-4) CAM.idleT = 0; else CAM.idleT += dt;
    if (CAM.recenter > 0) { CAM.recenter -= dt; CAM.yaw = dampAngle(CAM.yaw, p.yaw, 12, dt); CAM.pitch = damp(CAM.pitch, .28, 8, dt); }
    else if (SET.autoCam && CAM.idleT > 1.2 && p.speed > 2.5 && p.state === 'move') {
      const d = angDiff(CAM.yaw, p.yaw); if (Math.abs(d) < 2.4) CAM.yaw += d * Math.min(1, dt * .9);
    }
  }
  // distância e colisão
  const want = CAM.dist * (tgt && tgt.boss && tgt.h > 3 ? 1.25 : 1) * (IS_MOBILE && R.w < R.h ? 1.15 : 1);
  const cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
  const dx = -Math.sin(CAM.yaw) * cp, dy = sp, dz = -Math.cos(CAM.yaw) * cp;
  const side = .32;
  const ox = CAM.pivot.x + Math.cos(CAM.yaw) * -side * 0, oz = CAM.pivot.z;
  const ex = ox + dx * want, ey = CAM.pivot.y + dy * want, ez = oz + dz * want;
  const fr = rayFrac(ox, CAM.pivot.y, oz, ex, ey, ez, .2, true);
  const dd = Math.max(.6, want * fr - .25);
  CAM.curDist = dd < CAM.curDist ? dd : damp(CAM.curDist, dd, 3, dt);
  let cx = ox + dx * CAM.curDist, cy = CAM.pivot.y + dy * CAM.curDist, cz = oz + dz * CAM.curDist;
  const g = groundAt(cx, cz, cy + 1, 1); if (cy < g + .35) cy = g + .35;
  if (SHAKE.v > 0) { cx += rnd(-1, 1) * SHAKE.v * .35; cy += rnd(-1, 1) * SHAKE.v * .35; cz += rnd(-1, 1) * SHAKE.v * .35; SHAKE.v = Math.max(0, SHAKE.v - dt * 1.8); }
  cam.position.set(cx, cy, cz); CAM.pos.copy(cam.position);
  if (tgt) { const tc = tgt.center(_v3); CAM.look.set(lerp(CAM.pivot.x, tc.x, .42), lerp(CAM.pivot.y + .2, Math.min(tc.y, CAM.pivot.y + 3), .3), lerp(CAM.pivot.z, tc.z, .42)); }
  else CAM.look.set(CAM.pivot.x + Math.sin(CAM.yaw) * 1.6, CAM.pivot.y + .25, CAM.pivot.z + Math.cos(CAM.yaw) * 1.6);
  cam.lookAt(CAM.look);
}
// cinemática simples: move a câmera de A para B olhando para L
function camCine(o) { CAM.override = Object.assign({ t: 0, from: CAM.pos.clone(), lookFrom: CAM.look.clone() }, o); }
function camRelease() { CAM.override = null; }
