// The minigame's runner: a real classical sculpture brought to life. The body is a museum scan of the Doryphoros
// (Polykleitos' spear-bearer, the canon of the athletic nude), its plinth and marble strut cut away; on it sits
// the head of Michelangelo's David. A skeleton with automatic skin weights lets it run, jump and aim, and at rest
// it stands exactly as it was carved.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { skinnedGlass, solidGlass, metalMaterial } from './materials.js';

const FLOOR = 0.07; // top of the scan's plinth
export const STATUE_SCALE = 1.2; // scan units (one unit tall with the plinth) → metres

// Joint centres in the scan (x: the statue's left, y: up, z: forward), read off the mesh. The shoulders sit at the
// centre of the joint, inside the deltoid, so a raised arm turns about the right point and keeps its shoulder.
const J = {
  pelvis: [0, 0.52, 0.045], spine: [0, 0.6, 0.045], spineTop: [0, 0.8, 0.02], neck: [0.005, 0.822, 0.018], skull: [0.008, 0.9, 0.04],
  shR: [-0.122, 0.768, 0.022], elR: [-0.128, 0.637, 0.035], wrR: [-0.138, 0.505, 0.105], handR: [-0.141, 0.445, 0.13],
  shL: [0.128, 0.768, -0.015], elL: [0.143, 0.652, -0.05], wrL: [0.146, 0.682, 0.11], handL: [0.145, 0.682, 0.17],
  hipR: [-0.052, 0.5, 0.045], knR: [-0.064, 0.285, -0.012], anR: [-0.05, 0.112, -0.025], toeR: [-0.04, 0.078, 0.1],
  hipL: [0.052, 0.5, 0.045], knL: [0.052, 0.282, 0.042], anL: [0.07, 0.128, -0.125], toeL: [0.08, 0.075, -0.06],
};
const V = (a) => new THREE.Vector3(a[0], a[1] - FLOOR, a[2]);

// pitch of a segment away from straight down (about x, + swings it back), and its sideways lean (+ towards +x)
const pitch = (a, b) => Math.atan2(-(b[2] - a[2]), -(b[1] - a[1]));
const roll = (a, b) => Math.atan2(b[0] - a[0], -(b[1] - a[1]));

// The carved pose, as joint angles in the same convention the animation uses (straight limbs = 0, feet flat = 0).
export const REST = {
  hipR: pitch(J.hipR, J.knR), kneeR: pitch(J.knR, J.anR) - pitch(J.hipR, J.knR), ankleR: pitch(J.anR, J.toeR) - pitch(J.knR, J.anR) + Math.PI / 2,
  hipL: pitch(J.hipL, J.knL), kneeL: pitch(J.knL, J.anL) - pitch(J.hipL, J.knL), ankleL: pitch(J.anL, J.toeL) - pitch(J.knL, J.anL) + Math.PI / 2,
  shR: pitch(J.shR, J.elR), elR: pitch(J.elR, J.wrR) - pitch(J.shR, J.elR), shRz: -roll(J.shR, J.elR),
  shL: pitch(J.shL, J.elL), elL: pitch(J.elL, J.wrL) - pitch(J.shL, J.elL), shLz: roll(J.shL, J.elL),
};

function segDist(p, a, b) {
  const ab = b.clone().sub(a);
  const t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
  return p.distanceTo(a.clone().addScaledVector(ab, t));
}

// Which part of the body each vertex belongs to. The arms go by their own shape: a vertex is an arm's if it lies
// within reach of the arm's axis and its surface faces away from that axis. Where an arm hangs against the body,
// its inner face looks at the torso and the torso's flank looks back at it, so the two never get mixed up.
const ARMS = {
  armR: [[J.shR, J.elR, 0.034], [J.elR, J.wrR, 0.029], [J.wrR, J.handR, 0.042]], // the fist is wider than the wrist
  armL: [[J.shL, J.elL, 0.034], [J.elL, J.wrL, 0.029], [J.wrL, J.handL, 0.042]],
};
function onArm(segs, x, y, z, nx, ny, nz) {
  let best = null, hand = false;
  for (const [a, b, r] of segs) {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const t = THREE.MathUtils.clamp(((x - a[0]) * ab[0] + (y - a[1]) * ab[1] + (z - a[2]) * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2), 0, 1);
    const d = [x - a[0] - ab[0] * t, y - a[1] - ab[1] * t, z - a[2] - ab[2] * t], len = Math.hypot(...d);
    if (!best || len < best.len) { best = { len, d, r }; hand = r > 0.04; }
  }
  if (best.len >= best.r + 0.012) return false;
  // the fist's curled fingers face every way: there only the side towards the thigh has to face out
  if (hand && Math.abs(x) > 0.125) return true;
  return (best.d[0] * nx + best.d[1] * ny + best.d[2] * nz) / best.len > 0.25;
}
function classify(x, y, z, nx, ny, nz) {
  if (y > 0.857) return 'head';
  if (y > 0.4 && y < 0.8) for (const side of ['armR', 'armL']) if (onArm(ARMS[side], x, y, z, nx, ny, nz)) return side;
  if (y < 0.47) return x < 0.004 ? 'legR' : 'legL';
  return 'torso';
}
// The marble strut that props the right leg stands behind it as its own column, joined to the leg only by a
// bridge at the knee and by the plinth. At every height a plane between the centre of the leg and the centre of
// the strut (measured from cross-sections of the scan: y, x, z) tells them apart.
const LEG_C = [[0.07, -0.032, 0.02], [0.14, -0.035, 0.018], [0.2, -0.045, 0.022], [0.24, -0.05, 0.027], [0.28, -0.055, 0.033], [0.32, -0.05, 0.05], [0.36, -0.055, 0.057], [0.4, -0.057, 0.056], [0.44, -0.055, 0.06]];
const STRUT_C = [[0.07, -0.1, -0.08], [0.32, -0.1, -0.08], [0.36, -0.09, -0.06], [0.4, -0.088, -0.04], [0.44, -0.09, -0.02]];
const at = (table, y) => {
  if (y <= table[0][0]) return table[0].slice(1);
  for (let i = 1; i < table.length; i++) if (y <= table[i][0]) {
    const [y0, x0, z0] = table[i - 1], [y1, x1, z1] = table[i], t = (y - y0) / (y1 - y0);
    return [x0 + (x1 - x0) * t, z0 + (z1 - z0) * t];
  }
  return table[table.length - 1].slice(1);
};
function isStrut(p) {
  if (p.y > 0.44 || p.x > -0.005) return false;
  const [lx, lz] = at(LEG_C, p.y), [sx, sz] = at(STRUT_C, p.y);
  const dx = sx - lx, dz = sz - lz;
  const mx = lx + dx * 0.45, mz = lz + dz * 0.45; // a little nearer the leg than halfway
  return (p.x - mx) * dx + (p.z - mz) * dz > 0;
}
// a triangle that ties two parts which must move apart (arm to hip, hand to thigh, thigh to thigh) is cut
function ties(a, b, y) {
  if (a === b) return false;
  const arm = (c) => c === 'armR' || c === 'armL';
  if (arm(a) && b === 'torso' || arm(b) && a === 'torso') return y < 0.72;
  if (arm(a) || arm(b)) return true;
  return (a === 'legR' && b === 'legL') || (a === 'legL' && b === 'legR');
}

// Cuts leave ragged openings. Shave off the slivers along their edges, then zip each opening shut,
// so a freed limb or the back of the calf reads as carved, not broken.
function closeOpenings(tris, pos, fill, part) {
  const key = (a, b) => (a < b ? a * 65536 + b : b * 65536 + a);
  const count = (list) => {
    const m = new Map();
    for (let i = 0; i < list.length; i += 3) for (const [a, b] of [[list[i], list[i + 1]], [list[i + 1], list[i + 2]], [list[i + 2], list[i]]]) m.set(key(a, b), (m.get(key(a, b)) || 0) + 1);
    return m;
  };
  for (let pass = 0; pass < 3; pass++) {
    const m = count(tris);
    const next = [];
    for (let i = 0; i < tris.length; i += 3) {
      const [a, b, c] = [tris[i], tris[i + 1], tris[i + 2]];
      const open = (m.get(key(a, b)) === 1) + (m.get(key(b, c)) === 1) + (m.get(key(c, a)) === 1);
      if (open < 2) next.push(a, b, c);
    }
    tris = next;
  }
  const m = count(tris);
  const own = [];
  const back = new Map(); // walking each opening against the direction of its edges
  for (let i = 0; i < tris.length; i += 3) {
    for (const [u, v] of [[tris[i], tris[i + 1]], [tris[i + 1], tris[i + 2]], [tris[i + 2], tris[i]]]) if (m.get(key(u, v)) === 1) back.set(v, u);
  }
  const seen = new Set();
  for (const start of back.keys()) {
    if (seen.has(start)) continue;
    const loop = [start];
    seen.add(start);
    let cur = back.get(start);
    while (cur !== undefined && cur !== start && !seen.has(cur) && loop.length < 1500) { loop.push(cur); seen.add(cur); cur = back.get(cur); }
    if (cur !== start || loop.length < 3) continue;
    // an opening that runs along two parts (an arm and the flank it hung against) is closed part by part, so no
    // patch ties them together; only the short gaps where the parts meet are bridged
    const turns = part ? loop.map((v, i) => part(v) !== part(loop[(i + 1) % loop.length])) : [];
    const first = turns.indexOf(true);
    if (first < 0) { close(loop); continue; }
    const ring = [...loop.slice(first + 1), ...loop.slice(0, first + 1)]; // starts where a part begins
    const runs = [];
    for (const v of ring) { if (!runs.length || part(runs[runs.length - 1][0]) !== part(v)) runs.push([]); runs[runs.length - 1].push(v); }
    for (const run of runs) if (run.length >= 3) close(run.slice());
    const gaps = runs.flatMap((run) => (run.length >= 3 ? [run[0], run[run.length - 1]] : run));
    if (gaps.length >= 3) close(gaps);
  }
  return { tris, own };

  function close(loop) {
    const custom = fill && fill(loop);
    if (custom) { own.push({ ...custom, loop, from: tris.length / 3, to: tris.length / 3 + custom.tris.length / 3 }); tris.push(...custom.tris); return; }
    // zip it shut: always clip the corner whose closing edge is shortest, so long narrow openings close
    // across their width and the patch bends with the limb around it
    const d2 = (u, v) => (pos[u * 3] - pos[v * 3]) ** 2 + (pos[u * 3 + 1] - pos[v * 3 + 1]) ** 2 + (pos[u * 3 + 2] - pos[v * 3 + 2]) ** 2;
    own.push({ loop: loop.slice(), from: tris.length / 3, to: tris.length / 3 + loop.length - 2, fair: true });
    while (loop.length > 3) {
      let best = 0, bestD = Infinity;
      for (let i = 0; i < loop.length; i++) {
        const d = d2(loop[(i - 1 + loop.length) % loop.length], loop[(i + 1) % loop.length]);
        if (d < bestD) { bestD = d; best = i; }
      }
      const a = loop[(best - 1 + loop.length) % loop.length], b = loop[best], c = loop[(best + 1) % loop.length];
      tris.push(a, b, c);
      loop.splice(best, 1);
    }
    tris.push(loop[0], loop[1], loop[2]);
  }
}

// Around the right thigh: polar coordinates about its axis (a straight line fitted through the leg's centres from
// the knee to the buttock, so the frame has no kinks to print on the surface), the angle measured from the side
// where the strut stood.
const AXIS = (y) => [-0.05425 - 0.0425 * (y - 0.38), 0.05575 + 0.0725 * (y - 0.38)];
const STRUT_DIR = -1.885;
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
function polar(x, y, z) {
  const [lx, lz] = AXIS(y);
  return [wrapAngle(Math.atan2(z - lz, x - lx) - STRUT_DIR), Math.hypot(x - lx, z - lz)];
}
// the thigh's radius at each height, read off its sound side
function thighRadius(P, cls) {
  const bands = [];
  for (let k = 0; k <= 18; k++) {
    const yc = 0.3 + k * 0.01, rs = [];
    for (let v = 0; v < P.count; v++) {
      const y = P.getY(v);
      if (cls[v] !== 'legR' || Math.abs(y - yc) > 0.008) continue;
      const [phi, r] = polar(P.getX(v), y, P.getZ(v));
      if (Math.abs(phi) > 1.75 && r < 0.07) rs.push(r);
    }
    rs.sort((a, b) => a - b);
    if (rs.length > 8) bands.push([yc - 0.38, rs[Math.floor(rs.length / 2)]]);
  }
  // a parabola through the medians: smooth, so it prints no bands either
  const S = [0, 1, 2, 3, 4].map((p) => bands.reduce((s, [t]) => s + t ** p, 0));
  const B = [0, 1, 2].map((p) => bands.reduce((s, [t, r]) => s + r * t ** p, 0));
  const m = new THREE.Matrix3().set(S[0], S[1], S[2], S[1], S[2], S[3], S[2], S[3], S[4]).invert();
  const [c0, c1, c2] = new THREE.Vector3(...B).applyMatrix3(m).toArray();
  return (y) => { const t = THREE.MathUtils.clamp(y, 0.3, 0.48) - 0.38; return c0 + c1 * t + c2 * t * t; };
}
// the stump of the strut's bridge, standing out of the back of the thigh
function isBridge(c, corners, radius) {
  if (c.y < 0.335 || c.y > 0.447 || c.x > 0 || Math.abs(polar(c.x, c.y, c.z)[0]) > 1.5) return false;
  return corners.some((p) => { const r = polar(p.x, p.y, p.z)[1]; return r > radius(p.y) + 0.004 && r < 0.09; });
}

// The opening left there is closed as part of the thigh: unrolled around the thigh's axis it is a flat polygon,
// clipped into triangles in that plane (so none can fold over), refined, relaxed, and given radii that carry the
// thigh's own profile across from the rim; rolled back up, its seam is smoothed into the marble around it.
const UNROLL = 0.04; // about the thigh's radius, to unroll angles into lengths
const unroll = (pos, v) => { const y = pos[v * 3 + 1]; return [polar(pos[v * 3], y, pos[v * 3 + 2])[0] * UNROLL, y]; };
const area2 = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function isThighOpening(loop, pos) {
  let x = 0, y = 0, phi = 0;
  for (const v of loop) { x += pos[v * 3]; y += pos[v * 3 + 1]; phi += Math.abs(polar(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])[0]); }
  return x / loop.length < -0.02 && y / loop.length > 0.3 && y / loop.length < 0.47 && phi / loop.length < 1.6;
}
// Ear clipping in a plane: only convex corners with nothing inside are cut, the shortest first, so the
// triangles neither fold over nor overlap. null if the outline crosses itself there.
function earClip(loop, uv) {
  const sgn = Math.sign(uv.reduce((s, p, i) => { const q = uv[(i + 1) % uv.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0));
  const turn = (a, b, c) => area2(uv[a], uv[b], uv[c]) * sgn;
  const L = loop.map((_, i) => i), out = [];
  while (L.length > 3) {
    let best = -1, bestD = Infinity;
    for (let i = 0; i < L.length; i++) {
      const a = L[(i - 1 + L.length) % L.length], b = L[i], c = L[(i + 1) % L.length];
      if (turn(a, b, c) <= 1e-12) continue; // a reflex corner is no ear
      if (L.some((j) => j !== a && j !== b && j !== c && turn(a, b, j) >= 0 && turn(b, c, j) >= 0 && turn(c, a, j) >= 0)) continue;
      const d = (uv[a][0] - uv[c][0]) ** 2 + (uv[a][1] - uv[c][1]) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best < 0) return null;
    out.push(loop[L[(best - 1 + L.length) % L.length]], loop[L[best]], loop[L[(best + 1) % L.length]]);
    L.splice(best, 1);
  }
  out.push(loop[L[0]], loop[L[1]], loop[L[2]]);
  return out;
}
// any other opening, laid flat on its own plane (Newell's normal) when it is flat enough to be
function clipPlanar(loop, pos) {
  const P3 = (v) => new THREE.Vector3(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
  const pts = loop.map(P3), c = pts.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  const n = new THREE.Vector3();
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; n.x += (p.y - q.y) * (p.z + q.z); n.y += (p.z - q.z) * (p.x + q.x); n.z += (p.x - q.x) * (p.y + q.y); });
  if (n.lengthSq() < 1e-14) return null;
  n.normalize();
  let size = 0, bend = 0;
  for (const p of pts) { size = Math.max(size, p.distanceTo(c)); bend = Math.max(bend, Math.abs(p.clone().sub(c).dot(n))); }
  if (bend > size * 0.6) return null;
  const u = new THREE.Vector3().crossVectors(n, Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize();
  const w = new THREE.Vector3().crossVectors(n, u);
  const flat = (v) => { const d = P3(v).sub(c); return [d.dot(u), d.dot(w)]; };
  const tris = earClip(loop, loop.map(flat));
  return tris && { tris, flat, fair: Math.abs(n.y) < 0.8 }; // a sole stays flat
}
// Every opening closed by clipping is then refined to the scan's own density: its long edges are split (and the
// neighbours' shared ones, so no cracks open), with Delaunay flips in its own plane between rounds so the triangles
// stay even. The one on the back of the thigh is then carved again as part of the thigh; the others, but for the
// flat soles, are faired into a biharmonic surface that carries the curvature of the marble around across them.
function rebuildOpenings(tris, openings, pos, cls, radius) {
  if (!openings.length) return tris;
  const key = (a, b) => (a < b ? a * 65536 + b : b * 65536 + a);
  for (const o of openings) {
    if (!o.flat) continue; // zipped shut: refined, but not flipped
    const uv = o.loop.map(o.flat);
    o.sgn = Math.sign(uv.reduce((s, p, i) => { const q = uv[(i + 1) % uv.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0));
  }
  let flags = Array.from({ length: tris.length / 3 }, (_, t) => openings.findIndex((o) => t >= o.from && t < o.to));
  const rim = new Set(openings.flatMap(({ loop }) => loop.map((v, i) => key(v, loop[(i + 1) % loop.length]))));
  const fixed = new Set(openings.flatMap((o) => o.loop));
  const len = (a, b) => Math.hypot(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1], pos[a * 3 + 2] - pos[b * 3 + 2]);
  const ang = (p, q, r) => {
    const u = [q[0] - p[0], q[1] - p[1]], w = [r[0] - p[0], r[1] - p[1]];
    return Math.acos(THREE.MathUtils.clamp((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w) || 1), -1, 1));
  };
  const flip = () => {
    for (let pass = 0; pass < 12; pass++) {
      const owner = new Map(); // directed edge → its triangle
      flags.forEach((f, t) => { if (f >= 0) for (let k = 0; k < 3; k++) owner.set(tris[t * 3 + k] * 65536 + tris[t * 3 + (k + 1) % 3], t); });
      const done = new Set();
      flags.forEach((f, t1) => {
        if (f < 0 || done.has(t1) || !openings[f].flat) return;
        const { flat, sgn } = openings[f];
        for (let k = 0; k < 3; k++) {
          const a = tris[t1 * 3 + k], b = tris[t1 * 3 + (k + 1) % 3], c = tris[t1 * 3 + (k + 2) % 3];
          const t2 = owner.get(b * 65536 + a);
          if (rim.has(key(a, b)) || t2 === undefined || flags[t2] !== f || done.has(t2)) continue;
          const d = [0, 1, 2].map((j) => tris[t2 * 3 + j]).find((x) => x !== a && x !== b);
          const [A, B, C, D] = [a, b, c, d].map(flat);
          if (ang(C, A, B) + ang(D, B, A) <= Math.PI + 1e-9) continue;
          if (area2(A, D, C) * sgn <= 0 || area2(D, B, C) * sgn <= 0) continue;
          tris.splice(t1 * 3, 3, a, d, c);
          tris.splice(t2 * 3, 3, d, b, c);
          done.add(t1); done.add(t2);
          break;
        }
      });
      if (!done.size) break;
    }
  };
  const TARGET = 0.0075; // about the scan's own edge length there
  flip();
  for (let round = 0; round < 6; round++) {
    const split = new Map();
    flags.forEach((f, t) => {
      if (f >= 0) for (const [a, b] of [[tris[t * 3], tris[t * 3 + 1]], [tris[t * 3 + 1], tris[t * 3 + 2]], [tris[t * 3 + 2], tris[t * 3]]]) if (len(a, b) > TARGET * 1.4) split.set(key(a, b), -1);
    });
    if (!split.size) break;
    const mid = (a, b) => {
      const k = key(a, b);
      let m = split.get(k);
      if (m === -1) {
        m = pos.length / 3;
        for (let c = 0; c < 3; c++) pos.push((pos[a * 3 + c] + pos[b * 3 + c]) / 2);
        cls.push(cls[a]);
        split.set(k, m);
        if (rim.has(k)) { fixed.add(m); rim.add(key(a, m)); rim.add(key(m, b)); }
      }
      return m;
    };
    const nt = [], nf = [];
    const add = (f, ...v) => { for (let i = 0; i < v.length; i += 3) { nt.push(v[i], v[i + 1], v[i + 2]); nf.push(f); } };
    flags.forEach((f, t) => {
      let [a, b, c] = [tris[t * 3], tris[t * 3 + 1], tris[t * 3 + 2]];
      const s = (u, v) => split.has(key(u, v));
      const cnt = s(a, b) + s(b, c) + s(c, a);
      if (cnt === 0) return add(f, a, b, c);
      if (cnt === 3) { const m1 = mid(a, b), m2 = mid(b, c), m3 = mid(c, a); return add(f, a, m1, m3, m1, b, m2, m3, m2, c, m1, m2, m3); }
      for (let r = 0; r < 3; r++) { // turn the triangle so the pattern starts at a→b
        if ((cnt === 1 && s(a, b)) || (cnt === 2 && !s(c, a))) break;
        [a, b, c] = [b, c, a];
      }
      if (cnt === 1) { const m = mid(a, b); return add(f, a, m, c, m, b, c); }
      const m1 = mid(a, b), m2 = mid(b, c);
      return add(f, m1, b, m2, a, m1, m2, a, m2, c);
    });
    tris = nt; flags = nf;
    flip();
  }
  const n = pos.length / 3;
  const nb = Array.from({ length: n }, () => new Set());
  for (let i = 0; i < tris.length; i += 3) for (const [a, b] of [[tris[i], tris[i + 1]], [tris[i + 1], tris[i + 2]], [tris[i + 2], tris[i]]]) { nb[a].add(b); nb[b].add(a); }
  const patchOf = openings.map(() => new Set());
  flags.forEach((f, t) => { if (f >= 0) for (let k = 0; k < 3; k++) patchOf[f].add(tris[t * 3 + k]); });
  openings.forEach((o, i) => { if (o.fair) fair([...new Set([...patchOf[i]].flatMap((v) => [v, ...nb[v]]))], nb, pos); });
  // and any fin still folded back on itself there is relaxed flat
  const repaired = new Set(patchOf.flatMap((p) => [...p]));
  for (let k = 0; k < 2; k++) for (const v of [...repaired]) for (const q of nb[v]) repaired.add(q);
  despike(tris, repaired, nb, pos);
  const thigh = openings.findIndex((o) => o.thigh);
  if (thigh < 0) return tris;
  const sgn = openings[thigh].sgn;
  const patch = new Set(openings.flatMap((o, i) => (o.thigh ? [...patchOf[i]] : [])));
  const free = [...patch].filter((v) => !fixed.has(v));

  // 2 · the rim, ragged where the bridge was cut, is carved again with the patch: the whole back of the thigh,
  // from the hollow of the knee to the fold of the buttock, is worked as one surface (the fold holds still)
  const ny = new Float32Array(n), nl = new Float32Array(n); // how much each vertex faces down (the fold's underside)
  for (let i = 0; i < tris.length; i += 3) {
    const [a, b, c] = [tris[i], tris[i + 1], tris[i + 2]];
    const u = [0, 1, 2].map((k) => pos[b * 3 + k] - pos[a * 3 + k]), w = [0, 1, 2].map((k) => pos[c * 3 + k] - pos[a * 3 + k]);
    const fn = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    for (const v of [a, b, c]) { ny[v] += fn[1]; nl[v] += Math.hypot(...fn); }
  }
  const zone = new Set(patch);
  for (let v = 0; v < n; v++) {
    const [x, y, z] = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
    if (cls[v] !== 'legR' || x > -0.005 || y < 0.31 || y > 0.449 || (y > 0.44 && ny[v] < -0.45 * nl[v])) continue;
    if (Math.abs(polar(x, y, z)[0]) < 1.9) zone.add(v);
  }
  const inner = [...zone].filter((v) => pos[v * 3 + 1] > 0.438 || [...nb[v]].every((q) => zone.has(q)));
  const isInner = new Set(inner);

  // 3 · unrolled, the patch relaxes into even triangles, an iteration at a time, never folding one more over
  const uv = new Map([...zone].map((v) => [v, unroll(pos, v)]));
  for (const v of inner) for (const q of nb[v]) if (!uv.has(q)) uv.set(q, unroll(pos, q));
  const near = [];
  for (let t = 0; t < tris.length / 3; t++) if ([0, 1, 2].some((k) => isInner.has(tris[t * 3 + k]))) near.push(t);
  for (const t of near) for (let k = 0; k < 3; k++) if (!uv.has(tris[t * 3 + k])) uv.set(tris[t * 3 + k], unroll(pos, tris[t * 3 + k]));
  const folds = () => near.reduce((s, t) => s + (area2(uv.get(tris[t * 3]), uv.get(tris[t * 3 + 1]), uv.get(tris[t * 3 + 2])) * sgn <= 0), 0);
  let worst = folds();
  for (let it = 0; it < 80; it++) {
    const keep = inner.map((v) => uv.get(v).slice());
    for (const v of inner) {
      let u = 0, w = 0;
      for (const q of nb[v]) { u += uv.get(q)[0]; w += uv.get(q)[1]; }
      const p = uv.get(v);
      p[0] += (u / nb[v].size - p[0]) * 0.5;
      p[1] += (w / nb[v].size - p[1]) * 0.5;
    }
    const now = folds();
    if (now > worst) { inner.forEach((v, i) => uv.set(v, keep[i])); break; }
    worst = now;
  }

  // 4 · radii: the thigh's profile plus an offset. Where the bridge stood (the patch, and a couple of rings of
  // stump around it) the offset is lost: it is grown in from the sound marble all around (biharmonic, so it meets
  // it with the same slope, not just at the same height); then the whole zone is evened out a little the same way
  const offOf = (v) => polar(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])[1] - radius(pos[v * 3 + 1]);
  const ring1 = new Set(inner.flatMap((v) => [...nb[v]]));
  const off = new Map();
  for (const v of ring1) { off.set(v, offOf(v)); for (const q of nb[v]) if (!off.has(q)) off.set(q, offOf(q)); }
  const lost = new Set(patch);
  let front = [...fixed];
  for (let k = 0; k < 2; k++) {
    const next = [];
    for (const v of front) for (const q of nb[v]) if (!lost.has(q) && isInner.has(q)) { lost.add(q); next.push(q); }
    front = next;
  }
  const unknown = [...lost].filter((v) => isInner.has(v));
  let sum = 0, cnt = 0;
  for (const v of unknown) for (const q of nb[v]) if (!lost.has(q)) { sum += off.get(q); cnt++; }
  for (const v of unknown) off.set(v, sum / Math.max(1, cnt));
  for (let it = 0; it < 300; it++) for (const v of unknown) { let s = 0; for (const q of nb[v]) s += off.get(q); off.set(v, s / nb[v].size); }
  const nu = new Map(inner.map((v) => [v, 1 + [...nb[v]].reduce((s, q) => s + 1 / nb[q].size, 0) / nb[v].size]));
  const lap = new Map();
  const biharmonic = (list, iterations, step) => {
    const around = new Set(list.flatMap((v) => [v, ...nb[v]]));
    for (let it = 0; it < iterations; it++) {
      for (const v of around) { let s = 0; for (const q of nb[v]) s += off.get(q); lap.set(v, s / nb[v].size - off.get(v)); }
      for (const v of list) {
        let s = 0;
        for (const q of nb[v]) s += lap.get(q);
        off.set(v, off.get(v) - ((s / nb[v].size - lap.get(v)) / nu.get(v)) * step);
      }
    }
  };
  biharmonic(unknown, 4000, 0.8);
  biharmonic(inner, 60, 0.5);
  for (const v of inner) {
    const [u, y] = uv.get(v);
    const [lx, lz] = AXIS(y), t = u / UNROLL + STRUT_DIR, r = radius(y) + off.get(v);
    pos[v * 3] = lx + Math.cos(t) * r; pos[v * 3 + 1] = y; pos[v * 3 + 2] = lz + Math.sin(t) * r;
  }

  // 5 · and the edge of the worked zone is smoothed into the thigh around it (Taubin λ|μ, so nothing shrinks)
  const weight = new Map(inner.map((v) => [v, 0.5]));
  for (const v of zone) if (!isInner.has(v)) weight.set(v, 0.35);
  for (const v of [...weight.keys()]) for (const q of nb[v]) if (!weight.has(q) && cls[q] === 'legR' && pos[q * 3 + 1] < 0.455) weight.set(q, 0.25);
  const moving = [...weight.keys()];
  for (let it = 0; it < 6; it++) {
    for (const lambda of [0.5, -0.53]) {
      const next = moving.map((v) => {
        const c = [0, 0, 0];
        for (const q of nb[v]) for (let k = 0; k < 3; k++) c[k] += pos[q * 3 + k] / nb[v].size;
        return c.map((ck, k) => pos[v * 3 + k] + (ck - pos[v * 3 + k]) * lambda * weight.get(v) * 2);
      });
      moving.forEach((v, i) => { for (let k = 0; k < 3; k++) pos[v * 3 + k] = next[i][k]; });
    }
  }
  return tris;
}

// a vertex whose faces fold back over each other (a fin) moves to the middle of its neighbours, until none do
function despike(tris, region, nb, pos) {
  const key = (a, b) => (a < b ? a * 65536 + b : b * 65536 + a);
  const faces = [];
  for (let t = 0; t < tris.length / 3; t++) if (region.has(tris[t * 3]) || region.has(tris[t * 3 + 1]) || region.has(tris[t * 3 + 2])) faces.push(t);
  for (let it = 0; it < 20; it++) {
    const normal = new Map(), byEdge = new Map();
    for (const t of faces) {
      const [a, b, c] = [tris[t * 3], tris[t * 3 + 1], tris[t * 3 + 2]];
      const u = [0, 1, 2].map((k) => pos[b * 3 + k] - pos[a * 3 + k]), w = [0, 1, 2].map((k) => pos[c * 3 + k] - pos[a * 3 + k]);
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], l = Math.hypot(...n) || 1;
      normal.set(t, n.map((x) => x / l));
      for (const [p, q] of [[a, b], [b, c], [c, a]]) { const k = key(p, q); (byEdge.get(k) || byEdge.set(k, []).get(k)).push(t); }
    }
    const spiky = new Set();
    for (const [, ts] of byEdge) {
      if (ts.length !== 2) continue;
      const [n1, n2] = ts.map((t) => normal.get(t));
      if (n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2] < -0.3) for (const t of ts) for (let k = 0; k < 3; k++) if (region.has(tris[t * 3 + k])) spiky.add(tris[t * 3 + k]);
    }
    if (!spiky.size) break;
    for (const v of spiky) {
      const c = [0, 0, 0];
      for (const q of nb[v]) for (let k = 0; k < 3; k++) c[k] += pos[q * 3 + k] / nb[v].size;
      for (let k = 0; k < 3; k++) pos[v * 3 + k] = c[k];
    }
  }
}

// umbrella-squared fairing (Kobbelt): the patch, its rim included, settles into the smoothest surface the marble
// around it allows, matching it in position and slope
function fair(list, nb, pos) {
  const around = new Set(list.flatMap((v) => [v, ...nb[v]]));
  const nu = new Map(list.map((v) => [v, 1 + [...nb[v]].reduce((s, q) => s + 1 / nb[q].size, 0) / nb[v].size]));
  const lap = new Map();
  for (let it = 0; it < 1500; it++) {
    for (const v of around) {
      const l = [0, 0, 0];
      for (const q of nb[v]) for (let k = 0; k < 3; k++) l[k] += pos[q * 3 + k] / nb[v].size;
      lap.set(v, l.map((c, k) => c - pos[v * 3 + k]));
    }
    for (const v of list) {
      const s = [0, 0, 0];
      for (const q of nb[v]) { const l = lap.get(q); for (let k = 0; k < 3; k++) s[k] += l[k] / nb[v].size; }
      const lv = lap.get(v);
      for (let k = 0; k < 3; k++) pos[v * 3 + k] -= ((s[k] - lv[k]) / nu.get(v)) * 0.8;
    }
  }
}

export function buildStatue({ body, head }) {
  // ---- the mesh: drop the plinth and the strut beside the right leg, cut the ties, stand it on y = 0
  const src = body;
  const P = src.attributes.position;
  const idx = src.index.array;
  src.computeVertexNormals();
  const N = src.attributes.normal;
  const cls = Array.from({ length: P.count }, (_, i) => classify(P.getX(i), P.getY(i), P.getZ(i), N.getX(i), N.getY(i), N.getZ(i)));
  const radius = thighRadius(P, cls);
  const keep = [];
  const c = new THREE.Vector3();
  for (let i = 0; i < idx.length; i += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.add(new THREE.Vector3().fromBufferAttribute(P, idx[i + k]));
    c.multiplyScalar(1 / 3);
    if (c.y < FLOOR + 0.002) continue; // the plinth
    if (cls[idx[i]] !== 'armR' && cls[idx[i + 1]] !== 'armR' && cls[idx[i + 2]] !== 'armR' && isStrut(c)) continue; // the marble strut (never the hand hanging beside it)
    if (isBridge(c, [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(P, idx[i + k])), radius)) continue;
    const [a, b, d] = [cls[idx[i]], cls[idx[i + 1]], cls[idx[i + 2]]];
    if (ties(a, b, c.y) || ties(b, d, c.y) || ties(a, d, c.y)) continue;
    keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  // crumbs left by the cuts (bits of strut, slivers between parts) are dropped: only sizeable pieces stay
  const link = new Int32Array(P.count).map((_, i) => i);
  const find = (v) => { while (link[v] !== v) { link[v] = link[link[v]]; v = link[v]; } return v; };
  for (let i = 0; i < keep.length; i += 3) { link[find(keep[i])] = find(keep[i + 1]); link[find(keep[i + 1])] = find(keep[i + 2]); }
  const size = new Map();
  for (let i = 0; i < keep.length; i += 3) { const r = find(keep[i]); size.set(r, (size.get(r) || 0) + 1); }
  const solid = [];
  for (let i = 0; i < keep.length; i += 3) if (size.get(find(keep[i])) >= 150) solid.push(keep[i], keep[i + 1], keep[i + 2]);

  const posList = Array.from(P.array);
  const fill = (loop) => {
    if (!isThighOpening(loop, posList)) return clipPlanar(loop, posList);
    const flat = (v) => unroll(posList, v), tris = earClip(loop, loop.map(flat));
    return tris && { tris, flat, thigh: true };
  };
  // only an arm is told apart from what it hung against; elsewhere (between the thighs) one patch closes best
  const { tris: closedTris, own } = closeOpenings(solid, posList, fill, (v) => (cls[v] === 'armR' || cls[v] === 'armL' ? cls[v] : 'body'));
  const closed = rebuildOpenings(closedTris, own, posList, cls, radius);
  // the Doryphoros' own head never shows (David's sits there), so its triangles go; until now they only vanished
  // because its weights came out NaN. Then only the vertices a triangle still uses go on: the plinth, strut and bridges
  // leave thousands behind, some of them NaN after the fairing (a NaN bounding sphere and a console error otherwise)
  const body3 = [];
  for (let t = 0; t < closed.length; t += 3) if (cls[closed[t]] !== 'head' && cls[closed[t + 1]] !== 'head' && cls[closed[t + 2]] !== 'head') body3.push(closed[t], closed[t + 1], closed[t + 2]);
  const used = new Uint8Array(cls.length);
  for (const v of body3) used[v] = 1;
  const remap = new Int32Array(cls.length), region = [], kept = [];
  for (let v = 0; v < cls.length; v++) if (used[v]) { remap[v] = region.length; region.push(cls[v]); kept.push(posList[3 * v], posList[3 * v + 1], posList[3 * v + 2]); }
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(kept);
  for (let i = 1; i < pos.length; i += 3) pos[i] -= FLOOR;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(body3.map((v) => remap[v]));
  geo.computeVertexNormals();

  // ---- the skeleton, bones axis-aligned at rest
  const bones = {};
  const bone = (name, at, parent) => {
    const b = new THREE.Bone();
    b.name = name;
    const p = V(at);
    if (parent) p.sub(parent.userData.at);
    b.position.copy(p);
    b.userData.at = V(at);
    if (parent) parent.add(b);
    bones[name] = b;
    return b;
  };
  const pelvis = bone('pelvis', J.pelvis);
  const spine = bone('spine', J.spine, pelvis);
  const neck = bone('neck', J.neck, spine);
  const hide = bone('hide', J.skull, neck);
  for (const s of ['R', 'L']) {
    const sh = bone('sh' + s, J['sh' + s], spine);
    const el = bone('el' + s, J['el' + s], sh);
    bone('wr' + s, J['wr' + s], el);
    const hip = bone('hip' + s, J['hip' + s], pelvis);
    const kn = bone('kn' + s, J['kn' + s], hip);
    bone('an' + s, J['an' + s], kn);
  }
  const order = ['pelvis', 'spine', 'neck', 'hide', 'shR', 'elR', 'wrR', 'shL', 'elL', 'wrL', 'hipR', 'knR', 'anR', 'hipL', 'knL', 'anL'];
  const index = Object.fromEntries(order.map((n, i) => [n, i]));
  const seg = {
    pelvis: [[0, 0.44, 0.045], J.spine], spine: [J.spine, J.spineTop], neck: [J.neck, [0.008, 0.86, 0.025]],
    shR: [J.shR, J.elR], elR: [J.elR, J.wrR], wrR: [J.wrR, J.handR],
    shL: [J.shL, J.elL], elL: [J.elL, J.wrL], wrL: [J.wrL, J.handL],
    hipR: [J.hipR, J.knR], knR: [J.knR, J.anR], anR: [J.anR, J.toeR],
    hipL: [J.hipL, J.knL], knL: [J.knL, J.anL], anL: [J.anL, J.toeL],
  };
  const segV = Object.fromEntries(Object.entries(seg).map(([k, [a, b]]) => [k, [V(a), V(b)]]));

  // ---- skin weights: each vertex to its two nearest bones within its own region of the body
  const n = pos.length / 3;
  const skinIndex = new Uint16Array(n * 4);
  const skinWeight = new Float32Array(n * 4);
  const p = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(geo.attributes.position, i);
    const x = p.x, y = p.y + FLOOR; // region tests in scan heights
    const part = region[i];
    let cands;
    if (part === 'head') cands = ['hide'];
    else if (part === 'armR') cands = y > 0.72 ? ['spine', 'shR', 'elR', 'wrR'] : ['shR', 'elR', 'wrR'];
    else if (part === 'armL') cands = y > 0.72 ? ['spine', 'shL', 'elL', 'wrL'] : ['shL', 'elL', 'wrL'];
    else if (part === 'legR') cands = y > 0.42 ? ['pelvis', 'hipR', 'knR', 'anR'] : ['hipR', 'knR', 'anR'];
    else if (part === 'legL') cands = y > 0.42 ? ['pelvis', 'hipL', 'knL', 'anL'] : ['hipL', 'knL', 'anL'];
    else {
      cands = ['pelvis', 'spine', 'neck'];
      if (y < 0.54) cands.push(x < 0 ? 'hipR' : 'hipL');
    }
    const falloff = part === 'torso' ? 4 : 6; // the torso bends over a wider band at the shoulders and hips
    const scored = cands.map((name) => {
      const [a, b] = segV[name] || [bones[name].userData.at, bones[name].userData.at];
      return [name, 1 / Math.pow(segDist(p, a, b) + 0.006, falloff)];
    }).sort((u, v) => v[1] - u[1]).slice(0, 2);
    const sum = scored.reduce((s, q) => s + q[1], 0);
    let ws = scored.map(([name, w]) => [name, w / sum]);
    // the torso follows a shoulder only over the top of it (deltoid, collarbone), never down the flank: so a raised
    // arm opens the armpit instead of dragging the side of the chest along
    if (part === 'torso') {
      const share = 0.8 * THREE.MathUtils.smoothstep(y, 0.735, 0.8) * THREE.MathUtils.smoothstep(Math.abs(x), 0.07, 0.115);
      if (share > 0.01) ws = [[ws[0][0], 1 - share], [x < 0 ? 'shR' : 'shL', share]];
    }
    ws.forEach(([name, w], k) => { skinIndex[i * 4 + k] = index[name]; skinWeight[i * 4 + k] = w; });
  }
  // the armpits: the chest and back blend into the arm over a few rings of the mesh round each shoulder, so a raised
  // arm stretches the skin there evenly instead of pulling one row of triangles into a web or a ridge
  const nbr = Array.from({ length: n }, () => []);
  const ix = geo.index.array;
  for (let t = 0; t < ix.length; t += 3) for (const [a, b] of [[ix[t], ix[t + 1]], [ix[t + 1], ix[t + 2]], [ix[t + 2], ix[t]]]) { nbr[a].push(b); nbr[b].push(a); }
  for (const side of ['R', 'L']) {
    const joint = V(J['sh' + side]);
    const arm = new Set(['sh', 'el', 'wr'].map((b) => index[b + side]));
    const share = new Float32Array(n);
    for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) if (arm.has(skinIndex[i * 4 + k])) share[i] += skinWeight[i * 4 + k];
    const zone = []; // the chest, back and top of the shoulder round the joint; the arm, deltoid and all, moves whole
    for (let i = 0; i < n; i++) if (region[i] === 'torso' && p.fromBufferAttribute(geo.attributes.position, i).distanceTo(joint) < 0.075) zone.push(i);
    for (let it = 0; it < 16; it++) {
      const next = zone.map((i) => { let s = 0; for (const q of nbr[i]) s += share[q]; return 0.5 * share[i] + (0.5 * s) / (nbr[i].length || 1); });
      zone.forEach((i, k) => { share[i] = next[k]; });
    }
    for (const i of zone) {
      const s = THREE.MathUtils.clamp(share[i], 0, 1);
      let armBone = index['sh' + side], best = -1;
      for (let k = 0; k < 4; k++) if (arm.has(skinIndex[i * 4 + k]) && skinWeight[i * 4 + k] > best) { best = skinWeight[i * 4 + k]; armBone = skinIndex[i * 4 + k]; }
      skinIndex.set([armBone, index.spine, 0, 0], i * 4);
      skinWeight.set([s, 1 - s, 0, 0], i * 4);
    }
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));

  const { pre, skin } = skinnedGlass(geo, { facet: 0.3, opacity: 0.42, glow: 1.1, hue: 0.05, inner: 0.25, base: 0.24, fog: 0.25 });
  const rig = new THREE.Group();
  rig.scale.setScalar(STATUE_SCALE);
  rig.add(skin, pre);
  skin.add(pelvis);
  rig.updateMatrixWorld(true); // the bind pose: bones where the sculptor left them
  const skeleton = new THREE.Skeleton(order.map((name) => bones[name]));
  skin.bind(skeleton);
  pre.bind(skeleton, skin.bindMatrix);
  hide.scale.setScalar(0.0001); // after binding: the Doryphoros' own head folds away inside David's

  // ---- David's head on the neck
  if (head) {
    const david = solidGlass(head, { facet: 0.3, opacity: 0.46, glow: 1.12, hue: 0.3, inner: 0.25, base: 0.26, fog: 0.25 });
    david.scale.setScalar(0.205);
    david.rotation.y = Math.PI / 2; // the scan's own forward
    david.position.set(0.004, -0.03, 0.012);
    neck.add(david);
  }

  // ---- the pistol, in the right hand, lying along the forearm (-y of its pivot), its top towards +z
  const dark = metalMaterial({ color: '#2b2e36', rough: 0.3, rim: 0.35 });
  const light = metalMaterial({ color: '#9aa0ad', rough: 0.25, rim: 0.3 });
  const glowMat = new THREE.MeshBasicMaterial({ color: '#7ff0ff', toneMapped: false });
  const pivot = new THREE.Group();
  pivot.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), V(J.wrR).sub(V(J.elR)).normalize());
  pivot.position.set(0, -0.02, 0.012);
  bones.wrR.add(pivot);
  const gun = new THREE.Group();
  gun.scale.setScalar(1 / STATUE_SCALE);
  pivot.add(gun);
  const part = (obj, x, y, z) => { obj.position.set(x, y, z); gun.add(obj); return obj; };
  const mesh = (g, m) => new THREE.Mesh(g, m);
  part(mesh(new RoundedBoxGeometry(0.036, 0.05, 0.085, 2, 0.01), dark), 0, 0.0, -0.035).rotation.x = -0.25; // grip
  part(mesh(new RoundedBoxGeometry(0.044, 0.2, 0.05, 2, 0.012), dark), 0, -0.075, 0.022); // frame
  part(mesh(new RoundedBoxGeometry(0.04, 0.19, 0.022, 2, 0.008), light), 0, -0.08, 0.052); // slide
  part(mesh(new THREE.BoxGeometry(0.046, 0.1, 0.006), glowMat), 0, -0.085, 0.064); // energy cell along the top
  part(mesh(new THREE.BoxGeometry(0.008, 0.012, 0.016), glowMat), 0, -0.165, 0.07); // front sight
  part(mesh(new THREE.BoxGeometry(0.02, 0.01, 0.014), light), 0, 0.0, 0.07); // rear sight
  part(mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.04, 10), light), 0, -0.19, 0.03); // barrel
  part(mesh(new THREE.TorusGeometry(0.02, 0.004, 5, 12, Math.PI), dark), 0, -0.03, -0.012).rotation.set(0, Math.PI / 2, Math.PI / 2); // trigger guard
  const tip = part(mesh(new THREE.SphereGeometry(0.008, 6, 4), glowMat), 0, -0.215, 0.03);
  const flash = part(mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: '#bff8ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false })), 0, -0.27, 0.03);
  flash.scale.set(0.7, 1.4, 0.7);
  const ejector = part(new THREE.Object3D(), 0.03, -0.05, 0.05);

  // ---- the groups the game drives: turn (facing), flip (somersaults about the waist), the rig
  const root = new THREE.Group();
  const turn = new THREE.Group();
  root.add(turn);
  const waist = V(J.pelvis).y * STATUE_SCALE;
  const flip = new THREE.Group();
  flip.position.y = waist;
  turn.add(flip);
  rig.position.y = -waist;
  flip.add(rig);

  return {
    root, turn, flip, rig, skin,
    pelvis, spine, neck,
    L: { hip: bones.hipL, knee: bones.knL, ankle: bones.anL },
    R: { hip: bones.hipR, knee: bones.knR, ankle: bones.anR },
    AL: { shoulder: bones.shL, elbow: bones.elL, wrist: bones.wrL },
    AR: { shoulder: bones.shR, elbow: bones.elR, wrist: bones.wrR },
    pelvisY: pelvis.position.y, scale: STATUE_SCALE, rest: REST,
    tip, flash, ejector,
  };
}
