// The last room — contact: the closing piece is the studio's own mark, "</>", in blown glass; a click on it opens the minigame.
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { solidGlass } from '../materials.js';
import { spill, halo, motes } from '../fx.js';
import { makeLabel, placard } from '../labels.js';
import { T } from '../content.js';
import { EXHIBITS } from '../world.js';
import { chime } from '../sound.js';

export function buildContact(ctx) {
  const { scene, font } = ctx;
  const root = new THREE.Group();
  root.name = 'contact';
  root.position.copy(EXHIBITS.mark);
  scene.add(root);

  const size = 2.1;
  const geo = new TextGeometry('</>', {
    font, size, depth: 0.3, curveSegments: 18,
    bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.07, bevelSegments: ctx.tier === 'low' ? 5 : 10,
  });
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const cx = (bb.max.x + bb.min.x) / 2;
  const cy = (bb.max.y + bb.min.y) / 2;
  geo.translate(-cx, -cy, -0.15);
  const mark = solidGlass(geo, { opacity: 0.34, glow: 1.1, hue: 0.4, inner: 0, base: 0.32 });
  mark.position.y = 1.9;
  root.add(mark);

  const rays = halo({ width: 11, height: 6.5, intensity: 0.15, rays: 20, rayAmount: 0.12 });
  rays.position.set(0, 1.9, -1.2);
  root.add(rays);
  const pool = spill({ width: 10, depth: 7, intensity: 0.5, seed: 4.2 });
  root.add(pool);
  root.add(motes({ count: 80, radius: 4.2, height: 4 }));

  const plaque = makeLabel({
    width: 1.2, height: 0.36, px: 720,
    draw: (c, W, H, lang) => placard(c, W, H, { inv: 'JDG-C01', title: T[lang].contact.piece, sub: T[lang].contact.pieceSub, room: '05' }),
  });
  plaque.mesh.rotation.x = -1.1;
  plaque.mesh.position.set(1.7, 0.14, 1.6);
  root.add(plaque.mesh);

  let spin = 0, target = 0, hover = 0, hovered = false;
  ctx.addInteractive(mark, {
    label: () => T[ctx.lang()].game.play,
    onClick: () => ctx.openGame(),
    onEnter: () => { hovered = true; },
    trigger: () => { if (Math.abs(target - spin) < 0.6) target += Math.PI * 2; chime(91); },
    cooldown: 2.5,
    onLeave: () => { hovered = false; },
  });

  ctx.onUpdate((t, dt) => {
    const m = ctx.reduced ? 0 : 1;
    spin += (target - spin) * (1 - Math.exp(-dt * 2.6));
    hover += ((hovered ? 1 : 0) - hover) * (1 - Math.exp(-dt * 6));
    mark.userData.setHover(hover);
    mark.rotation.y = spin + Math.sin(t * 0.35) * 0.25 * m;
    mark.position.y = 1.9 + Math.sin(t * 0.6) * 0.08 * m;
  });

  return { root };
}
