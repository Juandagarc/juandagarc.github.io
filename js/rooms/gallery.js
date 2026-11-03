// Rooms 04 and 05 — the works and the developments, each shown live on a laptop standing on a dark pedestal.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { metalMaterial } from '../materials.js';
import { spill } from '../fx.js';
import { laptop } from './laptop.js';
import { makeLabel, placard } from '../labels.js';
import { T, PROJECTS, SHOWCASES, projectName, projectIndex } from '../content.js';
import { showcaseLayout, PEDESTAL_H } from '../world.js';
import { chime } from '../sound.js';

// A title card for pieces without a public capture (private or still in development).
function cardTexture(p) {
  const c = document.createElement('canvas');
  c.width = 1280; c.height = 800;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 1280, 800);
  bg.addColorStop(0, '#0c0f1c'); bg.addColorStop(1, '#1a0f24');
  g.fillStyle = bg; g.fillRect(0, 0, 1280, 800);
  g.fillStyle = '#ECEEF2';
  g.font = '800 120px "Plus Jakarta Sans", system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText(p.name, 640, 410);
  g.font = '500 30px "JetBrains Mono", ui-monospace, monospace';
  g.fillStyle = 'rgba(236,238,242,.6)';
  g.fillText((p.url ? p.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : p.tech).toUpperCase(), 640, 480);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function buildGallery(ctx) {
  const { scene } = ctx;
  const root = new THREE.Group();
  root.name = 'works';
  scene.add(root);
  const shell = metalMaterial({ color: '#5b5e66', rough: 0.32, rim: 0.14 });
  const plinthMat = metalMaterial({ color: '#0d0e12', rough: 0.7, rim: 0.05 });
  const pieces = [];

  SHOWCASES.forEach((sc, k) => {
    const lay = showcaseLayout(k);
    for (const item of lay.items) {
      const pi = projectIndex(item.id);
      const p = PROJECTS[pi];
      const W = item.W;
      const g = new THREE.Group();
      g.position.copy(item.pos);
      g.rotation.y = item.yaw;
      root.add(g);

      const plinth = new THREE.Mesh(new RoundedBoxGeometry(W * 0.86, PEDESTAL_H, W * 0.66, 2, 0.02), plinthMat);
      plinth.position.y = PEDESTAL_H / 2;
      g.add(plinth);
      const tex = ctx.tex.projects[pi] || cardTexture(p);
      const lap = laptop(W, tex, shell);
      lap.group.position.y = PEDESTAL_H;
      g.add(lap.group);

      const pool = spill({ width: W * 3.4, depth: W * 2.6, intensity: 0.28, seed: pi * 2.3 });
      pool.position.z = 0.3;
      g.add(pool);

      const plaque = makeLabel({
        width: 0.95, height: 0.29, px: 640,
        draw: (c, w, h, lang) => placard(c, w, h, { inv: p.inv, title: projectName(p, lang), sub: sc.featured ? T[lang].showcase.featured : p.founder ? `${T[lang].showcase.founder} · ${T[lang].showcase.live}` : p.social ? `${T[lang].showcase.socialBadge} · ${p.tech}` : T[lang].showcase.madeWith(p.tech), room: String(sc.room + 1).padStart(2, '0') }),
      });
      plaque.mesh.position.set(0, PEDESTAL_H * 0.55, W * 0.33 + 0.002);
      g.add(plaque.mesh);

      const hit = new THREE.Mesh(new THREE.BoxGeometry(W * 1.05, PEDESTAL_H + lap.lidH + 0.1, W * 0.8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.y = (PEDESTAL_H + lap.lidH) / 2;
      g.add(hit);
      const piece = { pi, lap, pos: item.pos, open: 0, hover: 0, hovered: false };
      ctx.addInteractive(hit, {
        label: () => T[ctx.lang()].ui.viewPiece,
        onEnter: () => { piece.hovered = true; },
        onLeave: () => { piece.hovered = false; },
        trigger: () => chime(86 + (pi % 6) * 2),
        onClick: () => ctx.openProject(pi),
      });
      pieces.push(piece);
    }
  });

  // Lids stay shut from afar and open as the visitor walks up (fully open within OPEN_NEAR metres).
  const OPEN_NEAR = 11, OPEN_FAR = 18;
  ctx.onUpdate((t, dt) => {
    const cam = ctx.camera.position;
    for (const q of pieces) {
      const focused = ctx.focused() === q.pi;
      const target = q.hovered || focused ? 1 : 0;
      q.hover += (target - q.hover) * (1 - Math.exp(-dt * 6));
      const d = Math.hypot(cam.x - q.pos.x, cam.z - q.pos.z);
      const near = focused ? 1 : THREE.MathUtils.smoothstep(OPEN_FAR - d, 0, OPEN_FAR - OPEN_NEAR);
      q.open = ctx.reduced ? near : q.open + (near - q.open) * (1 - Math.exp(-dt * 2.6));
      q.lap.setOpen(q.open, q.hover);
    }
  });

  return { root, pieces };
}

// Where to stand to look closely at one piece (used by the tour when its sheet opens).
export function piecePose(pi) {
  const id = PROJECTS[pi].id;
  const k = SHOWCASES.findIndex((sc) => sc.items.includes(id));
  const item = showcaseLayout(k).items.find((it) => it.id === id);
  const facing = new THREE.Vector3(Math.sin(item.yaw), 0, Math.cos(item.yaw));
  const screen = item.pos.clone().setY(PEDESTAL_H + 0.36 * item.W).addScaledVector(facing, -0.05 * item.W);
  return { pos: item.pos, facing, screen, W: item.W };
}
