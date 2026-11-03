// Room 02 — the artist: a grand piano in faceted glass, lid open. Its keys play.
import * as THREE from 'three';
import { crystal, crystalMaterial } from '../materials.js';
import { spill, motes } from '../fx.js';
import { makeLabel, placard } from '../labels.js';
import { T } from '../content.js';
import { EXHIBITS } from '../world.js';
import { note } from '../sound.js';

// Top view of a grand piano: straight bass side, curved bentside, rounded tail. Metres.
function pianoOutline() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(1.5, 0);
  s.lineTo(1.5, 0.32);
  s.bezierCurveTo(1.5, 0.95, 0.86, 0.9, 0.76, 1.48);
  s.bezierCurveTo(0.68, 1.9, 0.48, 2.08, 0.24, 2.08);
  s.quadraticCurveTo(0, 2.08, 0, 1.8);
  s.lineTo(0, 0);
  return s;
}

// Extrude in the XY plane, then lay it down: shape y becomes depth (-z), extrusion becomes height (+y).
function slab(shape, thickness, bevel = 0.012) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, curveSegments: 14, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 });
  g.rotateX(-Math.PI / 2);
  return g;
}

export function buildAbout(ctx) {
  const { scene } = ctx;
  const root = new THREE.Group();
  root.name = 'about';
  root.position.copy(EXHIBITS.piano);
  root.rotation.y = -1.3;
  scene.add(root);
  const piano = new THREE.Group();
  piano.position.set(0, 0, 0.95); // centre the instrument over its pool of light
  root.add(piano);

  const outline = pianoOutline();
  const bodyY = 0.62;
  const bodyH = 0.3;

  const body = crystal(slab(outline, bodyH), { facet: 1, opacity: 0.3, glow: 0.8 });
  body.position.set(-0.75, bodyY, 0);
  piano.add(body);

  // lid, hinged on the straight bass side and propped open
  const lidPivot = new THREE.Group();
  lidPivot.position.set(-0.75, bodyY + bodyH + 0.02, 0);
  lidPivot.rotation.z = 0.62;
  piano.add(lidPivot);
  const lid = crystal(slab(outline, 0.025, 0.006), { facet: 1, opacity: 0.2, glow: 0.85, hue: 0.2 });
  lidPivot.add(lid);
  const prop = crystal(new THREE.CylinderGeometry(0.012, 0.012, 0.86, 6), { facet: 1, opacity: 0.5 });
  prop.position.set(0.02, bodyY + bodyH + 0.42, -0.95);
  prop.rotation.z = -0.1;
  piano.add(prop);

  // legs
  const legGeo = new THREE.CylinderGeometry(0.06, 0.042, bodyY, 8);
  for (const [x, z] of [[-0.62, -0.22], [0.62, -0.22], [-0.42, -1.86]]) {
    const leg = crystal(legGeo, { facet: 1, opacity: 0.4 });
    leg.position.set(x, bodyY / 2, z);
    piano.add(leg);
  }

  // music desk
  const desk = crystal(new THREE.BoxGeometry(0.9, 0.34, 0.02), { facet: 1, opacity: 0.25, glow: 1.1 });
  desk.position.set(0, bodyY + bodyH + 0.18, -0.34);
  desk.rotation.x = -0.28;
  piano.add(desk);

  // keybed and keys (three octaves, C3–B5)
  const keybed = crystal(new THREE.BoxGeometry(1.5, 0.07, 0.32), { facet: 1, opacity: 0.3 });
  keybed.position.set(0, bodyY + 0.04, 0.1);
  piano.add(keybed);
  const whites = [];
  for (let o = 0; o < 3; o++) for (const n of [0, 2, 4, 5, 7, 9, 11]) whites.push(48 + o * 12 + n);
  const kw = 1.38 / whites.length;
  const keyTop = bodyY + 0.1;
  const keys = [];
  const whiteGeo = new THREE.BoxGeometry(kw * 0.9, 0.035, 0.26);
  whites.forEach((midi, i) => {
    const k = new THREE.Mesh(whiteGeo, crystalMaterial({ facet: 1, opacity: 0.55, glow: 0.95, hue: i * 0.015 }));
    k.renderOrder = 2;
    k.position.set(-0.69 + kw / 2 + i * kw, keyTop, 0.13);
    piano.add(k);
    keys.push({ mesh: k, midi, rest: keyTop, press: 0 });
  });
  const blackGeo = new THREE.BoxGeometry(kw * 0.55, 0.05, 0.16);
  whites.forEach((midi, i) => {
    const n = midi % 12;
    if (![0, 2, 5, 7, 9].includes(n) || i === whites.length - 1) return;
    const k = new THREE.Mesh(blackGeo, crystalMaterial({ facet: 1, opacity: 0.85, glow: 0.3 }));
    k.renderOrder = 2;
    k.position.set(-0.69 + (i + 1) * kw, keyTop + 0.03, 0.08);
    piano.add(k);
    keys.push({ mesh: k, midi: midi + 1, rest: keyTop + 0.03, press: 0 });
  });
  for (const key of keys) {
    ctx.addInteractive(key.mesh, {
      label: () => T[ctx.lang()].ui.tryKeys,
      trigger: () => { key.press = 1; note(key.midi, 0.55); },
      cooldown: 0.3,
    });
  }

  // bench
  const bench = crystal(new THREE.BoxGeometry(0.86, 0.07, 0.34), { facet: 1, opacity: 0.32 });
  bench.position.set(0, 0.48, 0.82);
  piano.add(bench);
  const benchLegGeo = new THREE.BoxGeometry(0.04, 0.45, 0.04);
  for (const [x, z] of [[-0.38, 0.68], [0.38, 0.68], [-0.38, 0.96], [0.38, 0.96]]) {
    const l = crystal(benchLegGeo, { facet: 1, opacity: 0.4 });
    l.position.set(x, 0.225, z);
    piano.add(l);
  }

  const pool = spill({ width: 6.5, depth: 6.5, intensity: 0.5 });
  pool.position.z = 0.1;
  root.add(pool);
  root.add(motes({ count: 55, radius: 2.6, height: 2.8 }));

  const plaque = makeLabel({
    width: 1.1, height: 0.33, px: 720,
    draw: (c, W, H, lang) => placard(c, W, H, { inv: 'JDG-A01', title: T[lang].about.piece, sub: T[lang].about.pieceSub, room: '02' }),
  });
  plaque.mesh.rotation.order = 'YXZ';
  plaque.mesh.rotation.set(-1.1, 1.0, 0);
  plaque.mesh.position.set(1.55, 0.16, 1.9);
  root.add(plaque.mesh);

  ctx.onUpdate((t, dt) => {
    for (const k of keys) {
      k.press = Math.max(0, k.press - dt * 2.6);
      const p = Math.sin(Math.min(1, k.press) * Math.PI * 0.5);
      k.mesh.position.y = k.rest - p * 0.018;
      k.mesh.material.uniforms.uHover.value = p;
    }
    if (!ctx.reduced) piano.position.y = Math.sin(t * 0.5) * 0.015;
  });

  return { root };
}
