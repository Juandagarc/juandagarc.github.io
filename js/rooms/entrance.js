// Room 01 — the name, in clear iridescent glass.
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { solidGlass } from '../materials.js';
import { spill, halo, motes } from '../fx.js';
import { EXHIBITS } from '../world.js';
import { note } from '../sound.js';

const PENTA = [62, 64, 67, 69, 72, 74, 76, 79, 81, 84];
const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

export function buildEntrance(ctx) {
  const { scene, font } = ctx;
  const root = new THREE.Group();
  root.name = 'entrance';
  root.position.copy(EXHIBITS.name);
  scene.add(root);

  const size = 1.9;
  const depth = 0.24;
  const res = font.data.resolution;
  const capBox = new TextGeometry('H', { font, size, depth: 0.01, curveSegments: 2 });
  capBox.computeBoundingBox();
  const capMid = (capBox.boundingBox.max.y + capBox.boundingBox.min.y) / 2;
  capBox.dispose();

  const letters = [...'JUANDAGARC'].map((ch, i) => {
    const geo = new TextGeometry(ch, {
      font, size, depth, curveSegments: ctx.tier === 'low' ? 10 : 18,
      bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.06, bevelOffset: 0, bevelSegments: ctx.tier === 'low' ? 5 : 10,
    });
    geo.computeBoundingBox();
    const cx = (geo.boundingBox.max.x + geo.boundingBox.min.x) / 2;
    geo.translate(-cx, -capMid, -depth / 2);
    // the name is seen from far back; keep it out of most of the fog
    const mesh = solidGlass(geo, { opacity: 0.42, glow: 1.6, hue: i * 0.07, inner: 0, base: 0.42, fog: 0.2 });
    root.add(mesh);
    const L = {
      mesh, i,
      adv: (font.data.glyphs[ch].ha / res) * size,
      base: new THREE.Vector3(),
      from: new THREE.Vector3((Math.random() - 0.5) * 18, 2 + Math.random() * 8, 4 + Math.random() * 10),
      fromRot: new THREE.Euler((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 3),
      spin: 0, spinTarget: 0, hover: 0, hovered: false,
    };
    ctx.addInteractive(mesh, {
      label: () => '',
      onEnter: () => { L.hovered = true; },
      trigger: () => { if (Math.abs(L.spinTarget - L.spin) < 0.6) L.spinTarget += Math.PI * 2; note(PENTA[i], 0.45); },
      cooldown: 2,
      onLeave: () => { L.hovered = false; },
    });
    return L;
  });

  const rays = halo({ width: 22, height: 7, intensity: 0.26, rays: 22, rayAmount: 0.1 });
  root.add(rays);
  const pool = spill({ width: 20, depth: 8, intensity: 0.5 });
  pool.position.z = 0.6;
  root.add(pool);
  root.add(motes({ count: ctx.tier === 'low' ? 60 : 130, radius: 9, height: 4.8 }));

  function layout(portrait) {
    const rows = portrait ? ['JUANDA', 'GARC'] : ['JUANDAGARC'];
    const rowYs = portrait ? [4.1, 2.25] : [2.3];
    const track = -0.02 * size;
    let idx = 0;
    let maxW = 0;
    rows.forEach((row, r) => {
      const ls = letters.slice(idx, idx + row.length);
      const w = ls.reduce((s, l) => s + l.adv, 0) + track * (ls.length - 1);
      maxW = Math.max(maxW, w);
      let x = -w / 2;
      for (const l of ls) { l.base.set(x + l.adv / 2, rowYs[r], 0); x += l.adv + track; }
      idx += row.length;
    });
    const midY = rowYs.reduce((a, b) => a + b, 0) / rowYs.length;
    rays.position.set(0, midY, -1.4);
    rays.scale.set(portrait ? 0.55 : 1, portrait ? 1.3 : 1, 1);
    pool.scale.set(portrait ? 0.5 : 1, 1, 1);
    return { width: maxW, midY };
  }

  const tmp = new THREE.Vector3();
  ctx.onUpdate((t, dt) => {
    const it = ctx.reduced ? 10 : t - ctx.introAt();
    for (const L of letters) {
      const p = Math.min(1, Math.max(0, (it - 0.3 - L.i * 0.08) / 1.8));
      const e = easeOutExpo(p);
      tmp.lerpVectors(L.from, L.base, e);
      const bob = ctx.reduced ? 0 : Math.sin(t * 0.7 + L.i * 0.55) * 0.05 * e;
      L.mesh.position.set(tmp.x, tmp.y + bob, tmp.z);
      L.spin += (L.spinTarget - L.spin) * (1 - Math.exp(-dt * 3));
      L.hover += ((L.hovered ? 1 : 0) - L.hover) * (1 - Math.exp(-dt * 6));
      L.mesh.userData.setHover(L.hover);
      const k = 1 - e;
      L.mesh.rotation.set(L.fromRot.x * k, L.fromRot.y * k + L.spin + (ctx.reduced ? 0 : Math.sin(t * 0.45 + L.i) * 0.07), L.fromRot.z * k);
    }
  });

  return { root, layout };
}
