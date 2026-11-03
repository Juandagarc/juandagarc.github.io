// The laptop each work is shown on: aluminium unibody, a full key layout with printed legends and a backlight,
// speaker grilles, a hinge, and a lid that stays shut until the visitor comes close.
// Built once at unit width and scaled per pedestal, so every laptop shares the same geometry and textures.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { metalMaterial, keycapMaterial, deckMaterial } from '../materials.js';

export const LID_OPEN = -0.24; // radians past vertical
const LID_SHUT = Math.PI / 2; // lying on the keys

// Unit laptop: 1 wide. Heights and depths as fractions of the width.
const BASE_H = 0.022, DEPTH = 0.69, LID_H = 0.66, LID_T = 0.012;
const KEY_H = 0.0035; // how far the caps stand above the deck
const PIVOT_Y = BASE_H + KEY_H + 0.0045; // shut, the screen rests just above the caps
const KB = { w: 0.8, x0: -0.4, z0: -0.3 }; // keyboard footprint (depth follows from the rows)
const PAD = { w: 0.46, d: 0.255, z: 0.19 }; // trackpad

// ---- the key layout, in key units (1u = one letter key)
const SHIFTED = { '`': '~', 1: '!', 2: '@', 3: '#', 4: '$', 5: '%', 6: '^', 7: '&', 8: '*', 9: '(', 0: ')', '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?' };
const chars = (s) => [...s].map((c) => [c, 1]);
const ROWS = [
  { h: 0.62, keys: [['esc', 1.25], ...Array.from({ length: 12 }, (_, i) => [`F${i + 1}`, 12.25 / 12]), ['touchid', 1]] },
  { h: 1, keys: [...chars('`1234567890-='), ['delete', 1.5]] },
  { h: 1, keys: [['tab', 1.5], ...chars('QWERTYUIOP[]\\')] },
  { h: 1, keys: [['caps lock', 1.75], ...chars("ASDFGHJKL;'"), ['return', 1.75]] },
  { h: 1, keys: [['shift', 2.25], ...chars('ZXCVBNM,./'), ['shift ', 2.25]] },
  { h: 1, keys: [['fn', 1], ['control', 1], ['option', 1], ['command', 1.25], ['space', 5], ['command ', 1.25], ['option ', 1], ['arrows', 3]] },
];
const UNITS = 14.5;
const PITCH = KB.w / UNITS;
const GAP = PITCH * 0.16;
KB.d = ROWS.reduce((a, r) => a + r.h, 0) * PITCH;

// Every cap as a rectangle on the deck (x, z in laptop units) plus its legend.
function layout() {
  const caps = [];
  let z = KB.z0;
  for (const row of ROWS) {
    const d = row.h * PITCH;
    let x = KB.x0;
    for (const [label, u] of row.keys) {
      const w = u * PITCH;
      if (label === 'arrows') {
        // inverted T: ← and → are half height, ↑ and ↓ share one slot
        const half = d / 2;
        caps.push({ label: '◀', x, z: z + half, w: PITCH, d: half, small: true });
        caps.push({ label: '▲', x: x + PITCH, z, w: PITCH, d: half, small: true });
        caps.push({ label: '▼', x: x + PITCH, z: z + half, w: PITCH, d: half, small: true });
        caps.push({ label: '▶', x: x + 2 * PITCH, z: z + half, w: PITCH, d: half, small: true });
      } else {
        caps.push({ label, x, z, w, d });
      }
      x += w;
    }
    z += d;
  }
  return caps;
}

// One frustum per cap (sloped sides, flat top), merged into a single geometry.
function capsGeometry(caps) {
  const pos = [], nor = [], uv = [], top = [], hh = [], idx = [];
  const y0 = BASE_H - 0.001, y1 = BASE_H + KEY_H;
  const toUv = (x, z) => [(x - KB.x0) / KB.w, 1 - (z - KB.z0) / KB.d];
  const face = (pts, isTop) => {
    const a = new THREE.Vector3(...pts[0]), b = new THREE.Vector3(...pts[1]), c = new THREE.Vector3(...pts[2]);
    const n = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    const base = pos.length / 3;
    for (const p of pts) {
      pos.push(...p);
      nor.push(n.x, n.y, n.z);
      uv.push(...toUv(p[0], p[2]));
      top.push(isTop ? 1 : 0);
      hh.push((p[1] - y0) / (y1 - y0));
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  for (const k of caps) {
    const g = GAP / 2, b = PITCH * 0.05;
    const X0 = k.x + g, X1 = k.x + k.w - g, Z0 = k.z + g, Z1 = k.z + k.d - g;
    const x0 = X0 + b, x1 = X1 - b, z0 = Z0 + b, z1 = Z1 - b;
    face([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], true);
    face([[X0, y0, Z1], [X1, y0, Z1], [x1, y1, z1], [x0, y1, z1]]); // front
    face([[X1, y0, Z0], [X0, y0, Z0], [x0, y1, z0], [x1, y1, z0]]); // back
    face([[X1, y0, Z1], [X1, y0, Z0], [x1, y1, z0], [x1, y1, z1]]); // right
    face([[X0, y0, Z0], [X0, y0, Z1], [x0, y1, z1], [x0, y1, z0]]); // left
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('aTop', new THREE.Float32BufferAttribute(top, 1));
  geo.setAttribute('aH', new THREE.Float32BufferAttribute(hh, 1));
  geo.setIndex(idx);
  return geo;
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

// The printed legends, laid out exactly over the caps.
function legendTexture(caps) {
  const S = 2560; // px per laptop unit
  return canvasTexture(Math.round(KB.w * S), Math.round(KB.d * S), (g) => {
    const font = (px, w = 500) => `${w} ${px}px -apple-system, "Helvetica Neue", "Plus Jakarta Sans", system-ui, sans-serif`;
    g.fillStyle = '#fff';
    g.strokeStyle = '#fff';
    const P = PITCH * S;
    for (const k of caps) {
      const x = (k.x - KB.x0) * S, y = (k.z - KB.z0) * S, w = k.w * S, h = k.d * S;
      const pad = P * 0.17;
      const l = k.label.trim();
      if (l === 'space') continue;
      if (l === 'touchid') {
        g.lineWidth = P * 0.025;
        g.beginPath();
        g.arc(x + w / 2, y + h / 2, h * 0.26, 0, Math.PI * 2);
        g.stroke();
        continue;
      }
      if (k.small) {
        g.font = font(P * 0.2);
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(l, x + w / 2, y + h / 2);
        continue;
      }
      if (/^F\d+$/.test(l) || l === 'esc') {
        g.font = font(P * 0.17);
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(l, x + w / 2, y + h * 0.56);
        continue;
      }
      if (l.length === 1) {
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        if (SHIFTED[l]) {
          g.font = font(P * 0.24);
          g.fillText(SHIFTED[l], x + w / 2, y + h * 0.33);
          g.fillText(l, x + w / 2, y + h * 0.7);
        } else {
          g.font = font(P * 0.32);
          g.fillText(l, x + w / 2, y + h / 2 + P * 0.02);
        }
        continue;
      }
      // modifiers: a word along the bottom, plus their symbol for the Mac ones
      const right = k.label.endsWith(' ') || l === 'delete' || l === 'return';
      g.font = font(P * 0.15);
      g.textBaseline = 'alphabetic';
      g.textAlign = right ? 'right' : 'left';
      g.fillText(l, right ? x + w - pad : x + pad, y + h - pad);
      const sym = { command: '⌘', option: '⌥', control: '⌃', shift: '⇧', 'caps lock': '⇪', tab: '⇥', delete: '⌫', return: '↩', fn: '' }[l];
      if (sym) {
        g.font = font(P * 0.2);
        g.textBaseline = 'top';
        g.textAlign = right ? 'left' : 'right';
        g.fillText(sym, right ? x + pad : x + w - pad, y + pad);
      }
    }
  });
}

// The deck print: keyboard well, speaker grilles and the trackpad seam (alpha = how much darker),
// and a second map with the backlight halo around every cap.
function deckTextures(caps) {
  const S = 1400;
  const W = S, H = Math.round(DEPTH * S);
  const X = (x) => (x + 0.5) * S, Z = (z) => (z + DEPTH / 2) * S;
  const round = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); };
  const shade = canvasTexture(W, H, (g) => {
    const m = 0.006;
    g.fillStyle = 'rgba(0,0,0,0.82)';
    round(g, X(KB.x0 - m), Z(KB.z0 - m), (KB.w + 2 * m) * S, (KB.d + 2 * m) * S, 0.008 * S);
    g.fill();
    // speaker grilles either side of the keys
    g.fillStyle = 'rgba(0,0,0,0.9)';
    const step = 0.0052 * S, r = 0.0011 * S;
    for (const side of [-1, 1]) {
      const cx = side * (KB.w / 2 + 0.046);
      for (let z = Z(KB.z0 + 0.004); z < Z(KB.z0 + KB.d - 0.004); z += step) {
        for (let i = -4; i <= 4; i++) {
          g.beginPath();
          g.arc(X(cx) + i * step + (Math.round(z / step) % 2 ? step / 2 : 0), z, r, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    // the trackpad seam
    g.strokeStyle = 'rgba(0,0,0,0.6)';
    g.lineWidth = 0.0018 * S;
    round(g, X(-PAD.w / 2) - 1, Z(PAD.z - PAD.d / 2) - 1, PAD.w * S + 2, PAD.d * S + 2, 0.012 * S);
    g.stroke();
  });
  const glow = canvasTexture(W, H, (g) => {
    g.fillStyle = '#fff';
    g.shadowColor = '#fff';
    g.shadowBlur = 0.004 * S;
    for (const k of caps) g.fillRect(X(k.x + GAP * 0.3), Z(k.z + GAP * 0.3), (k.w - GAP * 0.6) * S, (k.d - GAP * 0.6) * S);
  });
  return { shade, glow };
}

// The lid's back: the museum's mark, faintly etched.
function emblemTexture() {
  return canvasTexture(512, 512, (g) => {
    const grad = g.createLinearGradient(80, 0, 432, 0);
    grad.addColorStop(0, '#5FE8FF');
    grad.addColorStop(0.5, '#8C7BFF');
    grad.addColorStop(1, '#F27BFF');
    g.fillStyle = grad;
    g.font = '800 230px "Plus Jakarta Sans", system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('</>', 256, 270);
  });
}

let shared = null;
function sharedParts() {
  if (shared) return shared;
  const caps = layout();
  const deck = deckTextures(caps);
  const emblem = emblemTexture();
  emblem.colorSpace = THREE.SRGBColorSpace;
  shared = {
    base: new RoundedBoxGeometry(1, BASE_H, DEPTH, 3, BASE_H * 0.45),
    lid: new RoundedBoxGeometry(1, LID_H, LID_T, 3, LID_T * 0.45),
    caps: capsGeometry(caps),
    legend: legendTexture(caps),
    deck,
    deckGeo: new THREE.PlaneGeometry(1, DEPTH),
    pad: new THREE.PlaneGeometry(PAD.w, PAD.d).rotateX(-Math.PI / 2), // flat in xz so the metal grain reads as grain, not stripes
    hinge: new THREE.CylinderGeometry(0.0085, 0.0085, 0.84, 16, 1),
    emblemMat: new THREE.MeshBasicMaterial({ map: emblem, transparent: true, opacity: 0.5, depthWrite: false }),
    padMat: metalMaterial({ color: '#575a62', rough: 0.45, rim: 0 }),
    hingeMat: metalMaterial({ color: '#16171b', rough: 0.5, rim: 0.04 }),
    black: new THREE.MeshBasicMaterial({ color: '#020203' }),
    lens: new THREE.MeshBasicMaterial({ color: '#0b1626' }),
  };
  return shared;
}

// A laptop W metres wide, base on y = 0, keyboard towards +z. Call setOpen(0..1) every frame.
export function laptop(W, screenTex, shell) {
  const S = sharedParts();
  const g = new THREE.Group();
  g.scale.setScalar(W);

  const base = new THREE.Mesh(S.base, shell);
  base.position.y = BASE_H / 2;
  g.add(base);
  const deckMat = deckMaterial(S.deck.shade, S.deck.glow);
  const deck = new THREE.Mesh(S.deckGeo, deckMat);
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = BASE_H + 0.0002;
  deck.renderOrder = 1;
  g.add(deck);
  const capMat = keycapMaterial(S.legend);
  g.add(new THREE.Mesh(S.caps, capMat));
  const pad = new THREE.Mesh(S.pad, S.padMat);
  pad.position.set(0, BASE_H + 0.0004, PAD.z);
  g.add(pad);
  const barrel = new THREE.Mesh(S.hinge, S.hingeMat);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(0, BASE_H + 0.004, -DEPTH / 2 + 0.012);
  g.add(barrel);

  // the lid pivots on the back edge
  const hinge = new THREE.Group();
  hinge.position.set(0, PIVOT_Y, -DEPTH / 2 + 0.012);
  hinge.rotation.x = LID_SHUT;
  g.add(hinge);
  const lid = new THREE.Mesh(S.lid, shell);
  lid.position.set(0, LID_H / 2, -LID_T / 2);
  hinge.add(lid);
  const emblem = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.13), S.emblemMat);
  emblem.rotation.y = Math.PI;
  emblem.position.set(0, LID_H / 2, -LID_T - 0.0006);
  hinge.add(emblem);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.985, LID_H * 0.975), S.black);
  bezel.position.set(0, LID_H / 2, 0.0015);
  hinge.add(bezel);
  const sw = 0.93, sh = sw / 1.6;
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, color: 0x000000 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screenMat);
  screen.position.set(0, LID_H / 2 - 0.006, 0.003);
  hinge.add(screen);
  const notchY = LID_H / 2 - 0.006 + sh / 2 - 0.008;
  const notch = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.016), S.black);
  notch.position.set(0, notchY, 0.0036);
  hinge.add(notch);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.0032, 16), S.lens);
  lens.position.set(0, notchY, 0.0039);
  hinge.add(lens);

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  return {
    group: g,
    screen,
    lidH: LID_H * W,
    // open: 0 shut … 1 open; lift: a little extra tilt on hover
    setOpen(open, lift = 0) {
      hinge.rotation.x = LID_SHUT + (LID_OPEN - LID_SHUT) * open - lift * 0.06;
      const wake = smooth(0.55, 0.95, open);
      screenMat.color.setScalar((0.82 + lift * 0.12) * wake);
      capMat.uniforms.uBack.value = deckMat.uniforms.uBack.value = smooth(0.7, 1, open) * 0.8;
    },
  };
}
