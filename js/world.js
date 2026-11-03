// Where each piece stands in the dark, and where the visitor stands to look at it.
// No walls: the rooms are pools of light about 22 m apart, and the fog hides the rest.
import * as THREE from 'three';
import { SHOWCASES } from './content.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

export const EXHIBITS = {
  name: V(0, 0, 0),
  piano: V(6.2, 0, -26),
  years: V(-6, 0, -50),
  yearsDir: V(0.33, 0, -0.944).normalize(), // the timeline recedes along this line, 2 m per year
  crystals: V(6, 0, -74),
  // one spot per showcase: the featured piece, work, freelance, ventures, social work
  showcases: [V(-4.5, 0, -98), V(5, 0, -122), V(-5, 0, -146), V(5, 0, -170), V(-4, 0, -194), V(4.5, 0, -218), V(-4, 0, -240), V(4.5, 0, -262)],
  mark: V(0, 0, -288),
};

export const PEDESTAL_H = 0.95;

export function yearPos(year) {
  return EXHIBITS.years.clone().addScaledVector(EXHIBITS.yearsDir, (year - 2023) * 2);
}

// Laptops of one showcase: a single one seen up close, or a diagonal row receding to the right into the dark.
// A row is first framed whole from afar; then the camera walks the diagonal too, turning a little more at
// every laptop so each one is met face on while the next already shows at the edge of the frame.
export function showcaseLayout(k) {
  const sc = SHOWCASES[k];
  const n = sc.items.length;
  const center = EXHIBITS.showcases[k];
  const W = sc.featured ? 1.9 : n === 1 ? 1.5 : 1.4;
  const screenY = PEDESTAL_H + 0.36 * W;
  const toVisitor = V(0.17, 0, 0.985).normalize();
  const right = V(toVisitor.z, 0, -toVisitor.x);
  const rowDir = right.clone().multiplyScalar(0.6).addScaledVector(toVisitor, -0.8).normalize();
  const spacing = 2.6;
  const positions = sc.items.map((_, j) => center.clone().addScaledVector(rowDir, (j - (n - 1) / 2) * spacing));
  const swing = (j) => THREE.MathUtils.degToRad(n > 1 ? 8 + 22 * (j / (n - 1)) : 0);
  const keys = positions.map((p, j) => {
    const facing = toVisitor.clone().applyAxisAngle(V(0, 1, 0), swing(j));
    return {
      cam: p.clone().addScaledVector(facing, 2.6 * W).setY(screenY + 0.25 * W),
      target: p.clone().setY(screenY),
    };
  });
  // a row is first seen whole, straight on and from further back, before the walk along it begins
  if (n > 1) {
    const target = positions[0].clone().lerp(positions[n - 1], 0.45).setY(screenY - 0.1);
    keys.unshift({
      cam: positions[0].clone().addScaledVector(toVisitor, 6.2).addScaledVector(right, -0.7).setY(screenY + 1.0),
      target,
    });
  }
  const items = sc.items.map((id, j) => {
    const pos = positions[j];
    const cam = keys[n > 1 ? j + 1 : j].cam;
    return { id, pos, yaw: Math.atan2(cam.x - pos.x, cam.z - pos.z), W };
  });
  return { center, keys, items, W };
}
