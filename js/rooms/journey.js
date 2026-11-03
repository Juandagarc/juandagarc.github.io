// Room 03 — journey.
// Education: the years themselves in blown glass, set on a line at 2 m per year; 2027 is still only a rim of light.
// Experience: a cluster of quartz points, each exactly as tall as the time in the role (1 month = 20 cm).
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { crystal, solidGlass } from '../materials.js';
import { spill, motes } from '../fx.js';
import { makeLabel, placard, text, FONT_MONO } from '../labels.js';
import { T, EDU, WORK } from '../content.js';
import { EXHIBITS, yearPos } from '../world.js';
import { chime } from '../sound.js';

const M = 0.2; // metres per month

function quartz(height, radius) {
  const tip = radius * 1.7;
  const shaft = Math.max(0.05, height - tip);
  const g = new THREE.CylinderGeometry(radius, radius * 1.06, shaft, 6, 1);
  g.translate(0, shaft / 2, 0);
  const cap = new THREE.ConeGeometry(radius, tip, 6, 1);
  cap.translate(0, shaft + tip / 2, 0);
  const parts = [g.toNonIndexed(), cap.toNonIndexed()];
  const merged = new THREE.BufferGeometry();
  const pos = [];
  for (const p of parts) pos.push(...p.attributes.position.array);
  merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  merged.computeVertexNormals();
  return merged;
}

export function buildJourney(ctx) {
  const { scene, font } = ctx;
  const root = new THREE.Group();
  root.name = 'journey';
  scene.add(root);

  // ---- education: the years, standing on the floor
  const faceYaw = Math.atan2(0.77, 0.63); // turned towards the visitor, who stands to the right of the line
  const size = 0.8;
  const side = new THREE.Vector3(-0.944, 0, -0.33).multiplyScalar(1.4); // the thread runs behind the years
  EDU.forEach((e, i) => {
    const label = String(e.year);
    const geo = new TextGeometry(label, {
      font, size, depth: 0.22, curveSegments: 16,
      bevelEnabled: true, bevelThickness: 0.11, bevelSize: 0.045, bevelSegments: 8,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const cx = (bb.max.x + bb.min.x) / 2;
    geo.translate(-cx, -bb.min.y, -0.11);
    const g = new THREE.Group();
    g.position.copy(yearPos(e.year)).setY(0.08);
    g.rotation.y = faceYaw;
    root.add(g);
    const piece = solidGlass(geo, { opacity: e.future ? 0.1 : 0.32, glow: e.future ? 0.9 : 0.95, ghost: e.future ? 0.85 : 0, hue: i * 0.18, inner: 0, base: 0.3 });
    g.add(piece);
    ctx.addInteractive(piece, { label: () => label, onEnter: () => piece.userData.setHover(1), onLeave: () => piece.userData.setHover(0), trigger: () => chime(84 + i * 3) });

    const pool = spill({ width: 5.5, depth: 4, intensity: e.future ? 0.2 : 0.45, seed: i * 3.1 });
    pool.position.copy(g.position).setY(0.01);
    root.add(pool);

    const plaque = makeLabel({
      width: 1.2, height: 0.36, px: 720,
      draw: (c, W, H, lang) => placard(c, W, H, { inv: `JDG-E0${i + 1}`, title: T[lang].edu[e.key].name, sub: `${e.year} · ${T[lang].edu[e.key].note}`, room: '03' }),
    });
    plaque.mesh.rotation.order = 'YXZ';
    plaque.mesh.rotation.set(-1.1, faceYaw, 0);
    plaque.mesh.position.copy(g.position).add(new THREE.Vector3(-0.2, 0.06, 0.95).applyAxisAngle(new THREE.Vector3(0, 1, 0), faceYaw));
    root.add(plaque.mesh);
  });

  // the timeline itself: a thread of light on the floor, marked every year
  const a = yearPos(2022.4), b = yearPos(2027.6);
  const thread = new THREE.Mesh(new THREE.PlaneGeometry(0.018, a.distanceTo(b)), new THREE.MeshBasicMaterial({ color: new THREE.Color('#8fe9ff').multiplyScalar(0.9), transparent: true, opacity: 0.55, depthWrite: false }));
  thread.rotation.x = -Math.PI / 2;
  thread.rotation.z = -Math.atan2(b.x - a.x, -(b.z - a.z));
  thread.position.copy(a.clone().add(b).multiplyScalar(0.5)).setY(0.012);
  thread.position.add(side);
  root.add(thread);
  for (let y = 2023; y <= 2027; y++) {
    const yl = makeLabel({
      width: 0.8, height: 0.22, px: 320,
      draw: (c, W, H) => text(c, String(y), W / 2, H * 0.78, { size: H * 0.66, font: FONT_MONO, color: EDU.some((e) => e.year === y) ? 'rgba(200,245,255,.85)' : 'rgba(200,245,255,.35)', align: 'center', spacing: 5 }),
    });
    yl.mesh.rotation.order = 'YXZ';
    yl.mesh.rotation.set(-Math.PI / 2, faceYaw, 0);
    yl.mesh.position.copy(yearPos(y)).add(side).add(new THREE.Vector3(0.5, 0.014, 0.18));
    root.add(yl.mesh);
  }

  // ---- experience: a cluster of quartz points
  const cluster = new THREE.Group();
  cluster.position.copy(EXHIBITS.crystals);
  cluster.rotation.y = -0.35;
  root.add(cluster);
  const spots = [[-1.05, 0.1, -0.05], [-0.3, -0.25, 0.04], [0.45, 0.05, -0.03], [1.1, -0.2, 0.06]];
  WORK.forEach((w, i) => {
    const h = w.months * M;
    const q = crystal(quartz(h, 0.2 + (w.months / 12) * 0.06), { facet: 1, opacity: 0.32, glow: 0.85, hue: i * 0.21 });
    const [x, z, tilt] = spots[i];
    q.position.set(x, 0, z);
    q.rotation.z = tilt;
    q.rotation.y = i * 0.7;
    cluster.add(q);
    ctx.addInteractive(q, {
      label: () => `${T[ctx.lang()].work[w.key]} · ${T[ctx.lang()].months(w.months)}`,
      onEnter: () => q.userData.setHover(1),
      trigger: () => chime(79 + i * 2),
      onLeave: () => q.userData.setHover(0),
    });
  });
  // a rough crystal bed they grow from
  const bed = crystal(new THREE.IcosahedronGeometry(1, 1).scale(1.7, 0.16, 0.7), { facet: 1, opacity: 0.18, glow: 0.55 });
  bed.position.y = 0.02;
  cluster.add(bed);
  const pool = spill({ width: 7, depth: 6, intensity: 0.5, seed: 7.7 });
  cluster.add(pool);
  cluster.add(motes({ count: 55, radius: 2.4, height: 3.2 }));
  const yearMotes = motes({ count: 60, radius: 5, height: 2.4 });
  yearMotes.position.copy(yearPos(2025));
  root.add(yearMotes);

  // the scale on display: a 12-month rule next to the cluster
  const ruleH = 12 * M;
  const ruler = makeLabel({
    width: 0.5, height: ruleH + 0.2, px: 260,
    draw: (c, W, H, lang) => {
      const top = (0.1 / (ruleH + 0.2)) * H;
      const bottom = H - top;
      c.fillStyle = 'rgba(200,245,255,.7)';
      c.fillRect(W * 0.18, top, 2, bottom - top);
      for (let m = 0; m <= 12; m++) {
        const y = bottom - (m / 12) * (bottom - top);
        const major = m % 6 === 0;
        c.fillRect(W * 0.18, y - 1, major ? W * 0.26 : W * 0.12, 2);
        if (major) text(c, T[lang].monthsShort(m), W * 0.5, y + 9, { size: 24, font: FONT_MONO, color: 'rgba(200,245,255,.8)' });
      }
    },
  });
  ruler.mesh.position.set(-1.9, 0.02 + ruleH / 2 + 0.08, 0.3);
  cluster.add(ruler.mesh);

  ctx.onUpdate((t) => {
    if (!ctx.reduced) cluster.children.forEach((q, i) => { if (q.userData.setHover) q.rotation.y += Math.sin(t * 0.3 + i) * 0.0006; });
  });

  return { root };
}
