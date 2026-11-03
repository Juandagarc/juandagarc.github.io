// Camera choreography: scroll position → a spline from piece to piece through the dark,
// plus the fly-in to a work while its sheet is open.
import * as THREE from 'three';
import { STOPS, KEYS } from './content.js';
import { EXHIBITS, yearPos, showcaseLayout } from './world.js';
import { piecePose } from './rooms/gallery.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const dwell = (f) => f * f * (3 - 2 * f);

export function createTour({ camera, ui, entrance }) {
  let posCurve, tgtCurve;
  let stopParam = [];
  let offsets = [];
  let W = window.innerWidth, H = window.innerHeight;
  let mobile = W < 760;
  let portrait = W / H < 0.9;

  const state = {
    s: 0, focus: 0, focusIdx: -1,
    focusPos: new THREE.Vector3(), focusTgt: new THREE.Vector3(),
    offX: 0, offY: 0, px: 0, py: 0, targetDist: 20,
    introStart: -1, introDur: ui.reduced ? 0 : 3.8,
  };

  function build() {
    W = window.innerWidth; H = window.innerHeight;
    mobile = W < 760;
    portrait = W / H < 0.9;
    camera.fov = portrait ? 55 : 40;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const { width, midY } = entrance.layout(portrait);
    const far = portrait ? 1.45 : 1;

    const pts = [];
    const tgts = [];
    // a stop = what the camera looks at + where it stands relative to that; stretched on tall screens
    const add = (target, offset, tall = far) => { pts.push(target.clone().add(offset.clone().multiplyScalar(portrait ? tall : 1))); tgts.push(target); };

    // 01 the name
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const half = width / 2 + (portrait ? 0.5 : 1.8);
    const d = THREE.MathUtils.clamp(half / (Math.tan(vfov / 2) * camera.aspect), 9, 30);
    pts.push(V(0, 1.7, d));
    tgts.push(V(0, midY - 0.25, 0));
    // 02 the piano
    add(EXHIBITS.piano.clone().setY(0.85), V(-2.3, 0.95, 5.3));
    // 03 the years, seen from the left of their line; then the quartz
    if (portrait) add(yearPos(2025.0).setY(0.5), V(3.4, 1.5, 12.5), 1);
    else add(yearPos(2025.1).setY(0.6), V(9.2, 2.2, 13.9));
    add(EXHIBITS.crystals.clone().setY(1.0), V(-1.7, 0.6, 5.6));
    // 04 the works, laptop by laptop
    EXHIBITS.showcases.forEach((_, k) => { for (const key of showcaseLayout(k).keys) add(key.target, key.cam.clone().sub(key.target)); });
    // 05 the mark
    add(EXHIBITS.mark.clone().setY(1.8), V(0, -0.1, 7.2));

    posCurve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    tgtCurve = new THREE.CatmullRomCurve3(tgts, false, 'centripetal');
    stopParam = pts.map((_, k) => k / (pts.length - 1));

    // frame each piece in the free part of the screen: right of the text on desktop, above it on phones
    const gutter = Math.min(96, Math.max(16, W * 0.06));
    const plan = W >= 900 ? 96 : 0;
    const panel = Math.min(440, W - 2 * gutter);
    offsets = KEYS.map((key) => {
      const s = STOPS[key.stop];
      if (mobile) return { x: 0, y: H * (s.side === 'hero' ? 0.16 : 0.2) };
      if (s.side === 'hero') return { x: 0, y: H * 0.12 };
      return { x: -Math.min(W * (s.shift || 0.2), Math.max((gutter + panel - plan) / 2, W * (s.shift || 0))), y: 0 };
    });
  }

  function focus(i) {
    const { facing, screen, W } = piecePose(i);
    state.focusIdx = i;
    state.focusPos.copy(screen).addScaledVector(facing, W * (portrait ? 2.9 : 1.95)).setY(screen.y + 0.25);
    state.focusTgt.copy(screen);
  }
  function unfocus() { state.focusIdx = -1; }

  const pos = new THREE.Vector3();
  const tgt = new THREE.Vector3();
  const right = new THREE.Vector3();
  const introFrom = V(0, 7.5, 40);
  const introTgt = V(0, 1.6, 0);

  function update(dt, t) {
    const target = ui.stopFloat();
    state.s = ui.reduced ? target : damp(state.s, target, 3.2, dt);
    const n = KEYS.length - 1;
    const s = Math.min(n, Math.max(0, state.s));
    const i = Math.min(n - 1, Math.floor(s));
    const f = dwell(s - i);
    const u = stopParam[i] + (stopParam[i + 1] - stopParam[i]) * f;
    posCurve.getPoint(u, pos);
    tgtCurve.getPoint(u, tgt);

    if (state.introStart >= 0 && state.introDur > 0) {
      const k = easeInOut(Math.min(1, (t - state.introStart) / state.introDur));
      if (k < 1) { pos.lerpVectors(introFrom, pos, k); tgt.lerpVectors(introTgt, tgt, k); }
    }

    state.focus = ui.reduced ? (state.focusIdx >= 0 ? 1 : 0) : damp(state.focus, state.focusIdx >= 0 ? 1 : 0, 2.6, dt);
    if (state.focus > 0.001) {
      const k = easeInOut(Math.min(1, state.focus));
      pos.lerp(state.focusPos, k);
      tgt.lerp(state.focusTgt, k);
    }

    const pn = ui.pointer;
    state.px = damp(state.px, ui.reduced || mobile ? 0 : pn.nx, 2.2, dt);
    state.py = damp(state.py, ui.reduced || mobile ? 0 : pn.ny, 2.2, dt);
    right.subVectors(tgt, pos).cross(camera.up).normalize();
    const amt = 0.3 * (1 - state.focus * 0.6);
    pos.addScaledVector(right, state.px * amt);
    pos.y += state.py * amt * 0.5;

    camera.position.copy(pos);
    camera.lookAt(tgt);
    state.targetDist = pos.distanceTo(tgt);

    const o0 = offsets[i], o1 = offsets[i + 1];
    let ox = o0.x + (o1.x - o0.x) * f;
    let oy = o0.y + (o1.y - o0.y) * f;
    const fo = mobile ? { x: 0, y: H * 0.26 } : { x: Math.min(W * 0.25, 250), y: 0 };
    ox += (fo.x - ox) * state.focus;
    oy += (fo.y - oy) * state.focus;
    state.offX = ui.reduced ? ox : damp(state.offX, ox, 5, dt);
    state.offY = ui.reduced ? oy : damp(state.offY, oy, 5, dt);
    camera.setViewOffset(W, H, state.offX, state.offY, W, H);
  }

  build();

  return {
    state, update, resize: build, focus, unfocus,
    startIntro(t) { state.introStart = t; },
    introDone(t) { return state.introStart >= 0 && t - state.introStart >= state.introDur; },
  };
}
