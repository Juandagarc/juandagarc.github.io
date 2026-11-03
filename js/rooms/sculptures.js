// The permanent collection around the tour: classical sculptures recast in faceted iridescent glass.
// Geometry: museum scans reduced to a low-poly shell (see the credit line in the contact panel).
import * as THREE from 'three';
import { solidGlass } from '../materials.js';
import { spill } from '../fx.js';
import { T } from '../content.js';

export const SCULPTURE_FILES = {
  venus: 'assets/sculptures/venus.json',
  doryphoros: 'assets/sculptures/doryphoros.json',
  david: 'assets/sculptures/david-head.json',
};

// Where each cast stands: in the dark between the rooms, beside the single works and behind the far end of each row
// of laptops (never beside the name, never in a camera's way).
// `yaw` turns the figure towards the path; `face` corrects each scan's own forward direction.
const FACE = { venus: 0, doryphoros: 0, david: Math.PI / 2 };
const PLACES = [
  { model: 'david', pos: [11.5, 0, -37], h: 2.5, yaw: -0.75 },
  { model: 'venus', pos: [13, 0, -86], h: 3.9, yaw: -0.8 },
  { model: 'doryphoros', pos: [-9, 0, -107], h: 3.9, faces: [-3.8, -93] },
  { model: 'venus', pos: [-7.2, 0, -156.3], h: 3.6, faces: [-1.5, -145.5] },
  { model: 'doryphoros', pos: [-6.2, 0, -204.3], h: 3.8, faces: [-0.5, -193.5] },
  { model: 'venus', pos: [-8.9, 0, -251], h: 3.7, faces: [-3.5, -236] },
];

// Rebuild a scan from its compact JSON (base64 positions + indices, already centred and one unit tall).
export function decodeScan(json) {
  const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bytes(json.position)), 3));
  geo.setIndex(new THREE.BufferAttribute(json.wide ? new Uint32Array(bytes(json.index)) : new Uint16Array(bytes(json.index)), 1));
  geo.computeVertexNormals();
  return geo;
}

export function buildSculptures(ctx) {
  const { scene } = ctx;
  const root = new THREE.Group();
  root.name = 'sculptures';
  scene.add(root);
  const geos = ctx.scans;

  PLACES.forEach((p, i) => {
    if (!geos[p.model]) return;
    const g = new THREE.Group();
    g.position.set(...p.pos);
    const yaw = p.faces ? Math.atan2(p.faces[0] - p.pos[0], p.faces[1] - p.pos[2]) + 0.35 : p.yaw;
    g.rotation.y = yaw + FACE[p.model];
    root.add(g);
    const figure = solidGlass(geos[p.model], { facet: 1, opacity: 0.4, glow: 1.05, hue: i * 0.13, inner: 0, base: 0.22, fog: p.fog ?? 1 });
    figure.scale.setScalar(p.h);
    g.add(figure);
    const pool = spill({ width: p.h * 1.5, depth: p.h * 1.2, intensity: 0.4, seed: i * 1.9 });
    g.add(pool);
    ctx.addInteractive(figure, {
      label: () => T[ctx.lang()].sculptures[p.model],
      onEnter: () => figure.userData.setHover(1),
      onLeave: () => figure.userData.setHover(0),
    });
  });

  return { root };
}
