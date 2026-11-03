// "Break the glass": the minigame behind the closing mark. A glass statue with David's head comes to life with a gun,
// crosses steel ledges (run, slide, double jump with a flip, wall jump up a chimney) and shoots down every
// technology I use, each cast as a glass brick. Shots that miss leave holes where they land: in the steel,
// or in the stone wall behind the level.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { crystal, crystalMaterial, metalMaterial, solidGlass } from './materials.js';
import { halo, motes, createPost } from './fx.js';
import { T } from './content.js';
import { shot, shatter, tink, impact } from './sound.js';
import { buildStatue as buildSculpture } from './statue.js';
import { decodeScan } from './rooms/sculptures.js';

const BODY_SCAN = 'assets/sculptures/dory-hi.json';
const HEAD_SCAN = 'assets/sculptures/david-hi.json';

// ---- the level, in metres; the runner's feet start on the left
const STEEL = [ // [x0, y0, x1, y1]
  [-4, -1.2, 14, 0], [17, -1.2, 30, 0], [33, -1.2, 50, 0],
  [-4, 0, -3, 15], [49, 0, 50, 15],
  [5, 2.4, 8, 2.8], [9.6, 4.6, 12.4, 5.0],
  [12, 0.75, 13.6, 1.3], // a low beam: slide under it, or hop on top
  [22, 2.2, 22.6, 7.5], [24.4, 0, 25, 8.0], [25, 7.6, 30, 8.0], // the chimney: in underneath, out over the top
  [34, 3.0, 37.5, 3.4], [40, 5.4, 43, 5.8],
];
const GLASS = [ // [centre x, centre y, w, h, label]
  [3, 0.45, 1.6, 0.9, 'HTML'], [6.5, 3.25, 1.6, 0.9, 'CSS'], [11, 5.45, 1.8, 0.9, 'JavaScript'],
  [8, 6.6, 1.8, 0.9, 'TypeScript'], [11.2, 7.8, 1.6, 0.9, 'React'], [15.5, 2.4, 1.6, 0.9, 'Next.js'],
  [19.5, 0.45, 0.9, 0.9, 'Vue'], [19.5, 1.35, 0.9, 0.9, 'Astro'], [19.5, 2.25, 0.9, 0.9, 'Node'],
  [27, 8.45, 1.6, 0.9, 'NestJS'], [28.8, 8.45, 1.4, 0.9, 'PHP'], [27.6, 10.3, 1.8, 0.9, 'Laravel'],
  [31.5, 2.6, 1.6, 0.9, 'Python'], [35.7, 3.85, 1.6, 0.9, 'FastAPI'],
  [39, 0.45, 0.9, 0.9, 'SQL'], [39, 1.35, 0.9, 0.9, 'MySQL'], [39, 2.25, 0.9, 0.9, 'Docker'], [39, 3.15, 0.9, 0.9, 'AWS'],
  [41.5, 6.25, 1.8, 0.9, 'WordPress'], [44.5, 8.2, 1.4, 0.9, 'Git'],
  [45.4, 0.45, 1.6, 0.9, 'CI/CD'], [47.1, 0.45, 1.6, 0.9, 'Solidity'], [46.25, 1.35, 1.8, 0.9, 'Three.js'],
];
const CHECKPOINTS = [[1, 0], [18, 0], [26, 8], [34, 0]];
const BACK_Z = -2.6; // the stone wall behind everything
const STEEL_D = 0.8, GLASS_D = 0.45; // half depths
const PW = 0.5, PH = 1.1, PH_SLIDE = 0.6, PH_CROUCH = 0.72; // the runner's box: standing, sliding, crouching
const G = 34, RUN = 7.5, RUN_LOW = 2.6; // running and crouch-walking speeds
const BEST_KEY = 'jdg-glass-best';

const store = {
  get() { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } },
  set(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* storage unavailable */ } },
};
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rand = (a, b) => a + Math.random() * (b - a);
function seeded(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

// ---------------------------------------------------------------- textures
function canvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// A bullet hole as it sits in the map: soot, a torn rim (petals of metal, or chips and cracks in stone), a black core.
function holeTexture(kind, seed) {
  const rnd = seeded(seed);
  return canvasTex(256, (g, S) => {
    const cx = S / 2, cy = S / 2;
    const soot = g.createRadialGradient(cx, cy, 0, cx, cy, S * 0.5);
    soot.addColorStop(0, 'rgba(0,0,0,1)'); soot.addColorStop(0.22, 'rgba(0,0,0,.8)');
    soot.addColorStop(0.5, 'rgba(0,0,0,.35)'); soot.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = soot; g.fillRect(0, 0, S, S);
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (kind === 'wall') {
      const n = 6 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        let a = (i / n) * Math.PI * 2 + rnd() * 0.6, r = 30;
        const len = 70 + rnd() * 50;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        while (r < len) { r += 6 + rnd() * 10; a += (rnd() - 0.5) * 0.45; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 4; g.stroke();
        g.strokeStyle = 'rgba(170,230,250,.6)'; g.lineWidth = 1.6; g.stroke();
      }
      for (let i = 0; i < 9; i++) { // chips knocked out of the stone
        const a = rnd() * Math.PI * 2, r = 32 + rnd() * 16, s = 4 + rnd() * 7;
        g.beginPath();
        for (let k = 0; k < 4; k++) { const b = a + k * 1.7 + rnd(); g.lineTo(cx + Math.cos(a) * r + Math.cos(b) * s, cy + Math.sin(a) * r + Math.sin(b) * s); }
        g.fillStyle = 'rgba(140,175,195,.45)'; g.fill();
      }
    } else {
      const n = 9 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) { // petals of torn steel curling out of the hole
        const a = (i / n) * Math.PI * 2 + rnd() * 0.3, w = 0.22 + rnd() * 0.12, r0 = 24, r1 = 38 + rnd() * 16;
        const grd = g.createLinearGradient(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        grd.addColorStop(0, 'rgba(70,74,84,.95)'); grd.addColorStop(0.6, 'rgba(190,196,208,.9)'); grd.addColorStop(1, 'rgba(255,214,170,.85)');
        g.beginPath();
        g.moveTo(cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0);
        g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.lineTo(cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0);
        g.fillStyle = grd; g.fill();
      }
      g.strokeStyle = 'rgba(255,190,130,.35)'; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, 46, 0, Math.PI * 2); g.stroke();
    }
    g.beginPath(); // the hole itself
    for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI * 2, r = (kind === 'wall' ? 28 : 23) + rnd() * 7; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    g.fillStyle = '#000'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.stroke();
  });
}
const softTex = (inner, outer) => canvasTex(128, (g, S) => {
  const r = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  r.addColorStop(0, inner); r.addColorStop(1, outer);
  g.fillStyle = r; g.fillRect(0, 0, S, S);
});

// The wall behind the level: dark stone panels in a running bond, bevels catching a little cyan.
function backdropMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */`
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
    `,
    fragmentShader: /* glsl */`
      varying vec3 vW;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      void main() {
        vec2 size = vec2(2.4, 1.6);
        vec2 c = vW.xy / size;
        c.x += step(1.0, mod(floor(c.y), 2.0)) * 0.5;
        vec2 id = floor(c), f = fract(c);
        float e = min(min(f.x, 1.0 - f.x) * size.x, min(f.y, 1.0 - f.y) * size.y);
        float seam = 1.0 - smoothstep(0.0, 0.022, e);
        float bevel = smoothstep(0.022, 0.05, e) * (1.0 - smoothstep(0.05, 0.11, e));
        float h = hash(id);
        vec3 col = mix(vec3(0.018, 0.02, 0.03), vec3(0.036, 0.038, 0.056), h);
        col *= 0.65 + 0.35 * smoothstep(-1.0, 10.0, vW.y);
        col += vec3(0.022, 0.055, 0.075) * bevel * (0.35 + 0.65 * step(0.5, f.y));
        col += (hash(floor(vW.xy * 70.0)) - 0.5) * 0.012;
        col = mix(col, vec3(0.004), seam);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

// ---------------------------------------------------------------- the runner
// A classical statue in faceted glass: Michelangelo's David's head on a sculpted, jointed body, with glowing joint
// rings, David's sling across the back, and a pistol in the right hand.
// Local space: feet on y = 0, facing +z, the right hand on -x.
function buildSimpleStatue(scans) {
  const glass = (geo, hue = 0, opacity = 0.42) => solidGlass(geo, { facet: 1, opacity, glow: 1.08, hue, inner: 0, base: 0.26, fog: 0.25 });
  const joint = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  // a tapered limb hanging down from its joint: radius at the top, a muscle bulge, radius at the end
  const limb = (len, r0, bulge, at, r1, hue) => {
    const pts = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const u = i / n; // 0 bottom .. 1 top
      const fromTop = 1 - u;
      let r = fromTop < at ? THREE.MathUtils.lerp(r0, bulge, Math.sin((fromTop / at) * Math.PI / 2)) : THREE.MathUtils.lerp(bulge, r1, (fromTop - at) / (1 - at));
      if (i === 0 || i === n) r *= 0.55;
      pts.push(new THREE.Vector2(r, -len + u * len));
    }
    pts.unshift(new THREE.Vector2(0, -len - 0.004));
    pts.push(new THREE.Vector2(0, 0.004));
    return glass(new THREE.LatheGeometry(pts, 7), hue);
  };
  const ringMat = new THREE.MeshBasicMaterial({ color: '#7ff0ff', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const rings = [];
  const ring = (parent, r, y = 0) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.005, 5, 18), ringMat);
    m.rotation.x = Math.PI / 2;
    m.position.y = y;
    parent.add(m);
    rings.push(m);
    return m;
  };

  const root = new THREE.Group();
  const turn = joint(root);
  const flip = joint(turn, 0, 0.55, 0); // somersaults spin about the waist
  const body = joint(flip, 0, -0.55, 0);
  const pelvis = joint(body, 0, 0.54, 0);
  const hips = glass(new THREE.SphereGeometry(0.095, 9, 6));
  hips.scale.set(1.08, 0.72, 0.78);
  pelvis.add(hips);

  const leg = (side) => {
    const hip = joint(pelvis, 0.07 * side, -0.02, 0);
    ring(hip, 0.06, -0.01);
    hip.add(limb(0.27, 0.064, 0.07, 0.3, 0.043, 0.05));
    const knee = joint(hip, 0, -0.27, 0);
    const cap = glass(new THREE.SphereGeometry(0.03, 6, 4), 0.07);
    cap.position.set(0, 0, 0.028);
    knee.add(cap);
    ring(knee, 0.047);
    knee.add(limb(0.255, 0.046, 0.053, 0.3, 0.03, 0.1));
    const ankle = joint(knee, 0, -0.255, 0);
    ring(ankle, 0.033);
    const foot = glass(new RoundedBoxGeometry(0.068, 0.042, 0.15, 2, 0.015), 0.12);
    foot.position.set(0, -0.025, 0.04);
    ankle.add(foot);
    return { hip, knee, ankle };
  };
  const L = leg(1), R = leg(-1);

  const spine = joint(pelvis, 0, 0.02, 0);
  const torso = [[0, 0], [0.09, 0.006], [0.094, 0.06], [0.1, 0.12], [0.118, 0.19], [0.132, 0.245], [0.126, 0.285], [0.098, 0.318], [0.046, 0.338], [0, 0.342]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const chest = glass(new THREE.LatheGeometry(torso, 10), 0.02);
  chest.scale.z = 0.62;
  spine.add(chest);
  for (const s of [-1, 1]) { // pectorals
    const pec = glass(new THREE.SphereGeometry(0.06, 8, 5), 0.04);
    pec.scale.set(1, 0.68, 0.42);
    pec.position.set(0.052 * s, 0.245, 0.058);
    spine.add(pec);
  }
  const neckJ = joint(spine, 0, 0.33, 0.004);
  const neckMesh = glass(new THREE.CylinderGeometry(0.034, 0.04, 0.07, 7), 0.25);
  neckMesh.position.y = 0.025;
  neckJ.add(neckMesh);
  ring(neckJ, 0.042, 0.0);
  let head;
  if (scans?.david) {
    head = glass(scans.david, 0.3, 0.46);
    head.scale.setScalar(0.25);
    head.rotation.y = Math.PI / 2; // the scan's own forward
  } else {
    head = glass(new THREE.SphereGeometry(0.1, 8, 6), 0.3);
    head.position.y = 0.13;
  }
  neckJ.add(head);

  const arm = (side) => {
    const shoulder = joint(spine, 0.14 * side, 0.29, 0);
    const delt = glass(new THREE.SphereGeometry(0.052, 8, 5), 0.06);
    delt.scale.set(1, 0.9, 0.85);
    shoulder.add(delt);
    ring(shoulder, 0.05, -0.03);
    shoulder.add(limb(0.2, 0.046, 0.05, 0.35, 0.035, 0.08));
    const elbow = joint(shoulder, 0, -0.2, 0);
    ring(elbow, 0.037);
    elbow.add(limb(0.185, 0.039, 0.042, 0.25, 0.027, 0.14));
    const wrist = joint(elbow, 0, -0.185, 0);
    const hand = glass(new RoundedBoxGeometry(0.05, 0.065, 0.045, 2, 0.015), 0.16);
    hand.position.y = -0.035;
    wrist.add(hand);
    return { shoulder, elbow, wrist };
  };
  const AL = arm(1), AR = arm(-1);

  // David's sling, over the left shoulder and down across the back
  const sling = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.07, 0.3, 0.07), new THREE.Vector3(0.13, 0.35, 0.0), new THREE.Vector3(0.09, 0.3, -0.07),
    new THREE.Vector3(0.0, 0.17, -0.085), new THREE.Vector3(-0.09, 0.04, -0.07), new THREE.Vector3(-0.12, -0.03, 0.0),
  ]);
  const slingMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffcf7a').multiplyScalar(0.75), toneMapped: false });
  spine.add(new THREE.Mesh(new THREE.TubeGeometry(sling, 40, 0.007, 5, false), slingMat));

  // the pistol: frame, slide with a glowing cell, sights, trigger guard; it points down the forearm (-y), top towards +z
  const dark = metalMaterial({ color: '#2b2e36', rough: 0.3, rim: 0.35 });
  const light = metalMaterial({ color: '#9aa0ad', rough: 0.25, rim: 0.3 });
  const glowMat = new THREE.MeshBasicMaterial({ color: '#7ff0ff', toneMapped: false });
  const gun = joint(AR.wrist, 0, -0.04, 0.0);
  const part = (obj, x, y, z) => { obj.position.set(x, y, z); gun.add(obj); return obj; };
  const mesh = (geo, mat) => new THREE.Mesh(geo, mat);
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

  return { root, turn, flip, body, pelvis, spine, neck: neckJ, L, R, AL, AR, tip, flash, ejector, rings, ringMat, pelvisY: 0.54, scale: 1, rest: null };
}

// ---------------------------------------------------------------- the game
export function createGame({ renderer, usePost, pixelRatio, lang, reduced, scans }) {
  const root = $('#game');
  const cross = $('#g-cross');
  let built = null;
  let assets = null, loading = null;
  let active = false;
  let state = 'intro';
  let post = null;

  const input = { left: false, right: false, down: false, crouch: false, jumpHeld: false, jumpBuf: 0, firing: false, aimX: 0, aimY: 0, aimed: false, forward: false };
  const runner = {
    x: 1, y: 0, vx: 0, vy: 0, h: PH, onGround: false, wall: 0, coyote: 0, airJumps: 1, lock: 0, face: 1, turnV: 1, phase: 0, checkpoint: 0,
    slide: 0, flip: 0, land: 0, stretch: 0, recoil: 0, idle: 0, dustT: 0, crouch: false, wallSlide: false,
  };
  const run = { time: 0, started: false, broken: 0, best: store.get(), cooldown: 0, shake: 0, flash: 0 };

  // ---- building the scene, once, on first play
  function build() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);

    const back = new THREE.Mesh(new THREE.PlaneGeometry(70, 30), backdropMaterial());
    back.position.set(23, 6, BACK_Z);
    scene.add(back);
    for (let i = 0; i < 4; i++) {
      const glow = halo({ width: 30, height: 14, intensity: 0.14, rays: 18, rayAmount: 0.08 });
      glow.position.set(-2 + i * 15, 6, BACK_Z + 0.15);
      scene.add(glow);
      const dust = motes({ count: 40, radius: 8, height: 12 });
      dust.position.set(4 + i * 13, -1, -1.2);
      scene.add(dust);
    }

    const steelMat = metalMaterial({ color: '#2a2d35', rough: 0.42, rim: 0.22 });
    const edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#5FE8FF').multiplyScalar(0.7), toneMapped: false });
    const steel = STEEL.map(([x0, y0, x1, y1]) => {
      const w = x1 - x0, h = y1 - y0;
      const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, STEEL_D * 2, 2, Math.min(0.06, h / 3)), steelMat);
      m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
      scene.add(m);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, 0.025), edgeMat);
      edge.position.set((x0 + x1) / 2, y1, STEEL_D);
      scene.add(edge);
      return { mesh: m, box: new THREE.Box3(new THREE.Vector3(x0, y0, -STEEL_D), new THREE.Vector3(x1, y1, STEEL_D)) };
    });

    const bricks = GLASS.map(([x, y, w, h, label], i) => {
      const mesh = crystal(new RoundedBoxGeometry(w, h, GLASS_D * 2, 2, 0.08), { facet: 0.7, opacity: 0.36, glow: 1.05, hue: i * 0.11, inner: 0.7, base: 0.24, fog: 0.25 });
      mesh.position.set(x, y, 0);
      scene.add(mesh);
      const cv = document.createElement('canvas');
      cv.width = 512; cv.height = Math.round((512 * h) / w);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      const tag = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
      tag.position.z = GLASS_D + 0.01;
      tag.renderOrder = 4;
      mesh.add(tag);
      const b = { x, y, w, h, label, mesh, cv, tex, hp: 2, alive: true, kick: 0, box: new THREE.Box3(new THREE.Vector3(x - w / 2, y - h / 2, -GLASS_D), new THREE.Vector3(x + w / 2, y + h / 2, GLASS_D)) };
      drawTag(b, false);
      return b;
    });

    const statue = assets?.body ? buildSculpture({ body: assets.body, head: assets.head }) : buildSimpleStatue(scans);
    scene.add(statue.root);

    // pools: tracers, glass shards, sparks, puffs of dust, brass casings, holes in the map
    const add = (m) => { m.visible = false; scene.add(m); return m; };
    const tracerMat = new THREE.MeshBasicMaterial({ color: '#b8f6ff', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const tracerGeo = new THREE.BoxGeometry(0.55, 0.035, 0.035).translate(-0.27, 0, 0);
    const bullets = Array.from({ length: 24 }, () => ({ m: add(new THREE.Mesh(tracerGeo, tracerMat)), from: new THREE.Vector3(), dir: new THREE.Vector3(), len: 0, dist: 0, live: false, hit: null }));
    const shardGeo = new THREE.TetrahedronGeometry(0.13);
    const shardMat = crystalMaterial({ facet: 1, opacity: 0.55, glow: 1.25, inner: 0, base: 0.35, fog: 0.2 });
    const shards = Array.from({ length: 220 }, () => ({ m: add(new THREE.Mesh(shardGeo, shardMat)), v: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0 }));
    const sparkGeo = new THREE.BoxGeometry(1, 0.012, 0.012);
    const sparkMats = {
      hot: new THREE.MeshBasicMaterial({ color: '#ffb066', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      cold: new THREE.MeshBasicMaterial({ color: '#9ff3ff', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    };
    const sparks = Array.from({ length: 120 }, () => ({ m: add(new THREE.Mesh(sparkGeo, sparkMats.hot)), v: new THREE.Vector3(), life: 0 }));
    const puffTex = softTex('rgba(255,255,255,.55)', 'rgba(255,255,255,0)');
    const puffGeo = new THREE.PlaneGeometry(1, 1);
    const puffs = Array.from({ length: 48 }, () => ({ m: add(new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0, color: '#9aa4b8' }))), v: new THREE.Vector3(), life: 0, max: 1, size: 1 }));
    const brass = metalMaterial({ color: '#c9a25a', rough: 0.25, rim: 0.2 });
    const casingGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8);
    const casings = Array.from({ length: 16 }, () => ({ m: add(new THREE.Mesh(casingGeo, brass)), v: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0 }));
    const holeTex = { steel: [1, 2, 3].map((s) => holeTexture('steel', s)), wall: [4, 5, 6].map((s) => holeTexture('wall', s)) };
    const holeMats = Object.fromEntries(Object.entries(holeTex).map(([k, list]) => [k, list.map((t) => new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }))]));
    const heatTex = softTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
    const holeGeo = new THREE.PlaneGeometry(0.9, 0.9);
    const heatGeo = new THREE.PlaneGeometry(0.42, 0.42);
    const holes = Array.from({ length: 70 }, () => {
      const g = add(new THREE.Group());
      const hole = new THREE.Mesh(holeGeo, holeMats.steel[0]);
      hole.renderOrder = 1;
      const heat = new THREE.Mesh(heatGeo, new THREE.MeshBasicMaterial({ map: heatTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 }));
      heat.position.z = 0.002;
      heat.renderOrder = 2;
      g.add(hole, heat);
      return { g, hole, heat, t: 0 };
    });

    post = usePost() ? createPost(renderer, scene, camera, { msaa: 0 }) : null;
    if (post) post.setSize(window.innerWidth, window.innerHeight, pixelRatio());
    return {
      scene, camera, back, steel, bricks, statue, bullets, shards, sparks, sparkMats, puffs, casings, holes, holeMats, holeNext: 0,
      raycaster: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    };
  }

  function drawTag(b, cracked) {
    const g = b.cv.getContext('2d'), W = b.cv.width, H = b.cv.height;
    g.clearRect(0, 0, W, H);
    let size = H * 0.42;
    g.font = `800 ${size}px "Plus Jakarta Sans", system-ui, sans-serif`;
    const tw = g.measureText(b.label).width;
    if (tw > W * 0.86) { size *= (W * 0.86) / tw; g.font = `800 ${size}px "Plus Jakarta Sans", system-ui, sans-serif`; }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(95,232,255,.8)'; g.shadowBlur = 18;
    g.fillStyle = 'rgba(240,248,255,.95)';
    g.fillText(b.label, W / 2, H / 2 + size * 0.04);
    g.shadowBlur = 0;
    if (cracked) {
      g.strokeStyle = 'rgba(235,248,255,.85)'; g.lineWidth = 3;
      const cx = W * (0.3 + Math.random() * 0.4), cy = H * (0.3 + Math.random() * 0.4);
      for (let i = 0; i < 7; i++) {
        let a = (i / 7) * Math.PI * 2 + Math.random() * 0.5, x = cx, y = cy;
        g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s < 5; s++) { a += (Math.random() - 0.5) * 0.6; x += Math.cos(a) * W * 0.07; y += Math.sin(a) * W * 0.07; g.lineTo(x, y); }
        g.stroke();
      }
    }
    b.tex.needsUpdate = true;
  }

  // ---- DOM: cards and HUD in the visitor's language
  function renderText() {
    const t = T[lang()].game;
    $('#g-name').textContent = t.title;
    $('#g-l-bricks').textContent = t.bricks;
    $('#g-l-time').textContent = t.time;
    $('#g-l-best').textContent = t.best;
    $('#g-exit').textContent = `${t.exit} · Esc`;
    $('#g-intro').innerHTML = `
      <p class="g-kicker">${esc(t.kicker)}</p>
      <h2>${esc(t.title)}</h2>
      <p>${esc(t.intro)}</p>
      <dl class="g-keys">${t.controls.map(([k, d]) => `<dt><kbd>${esc(k)}</kbd></dt><dd>${esc(d)}</dd>`).join('')}</dl>
      <p class="g-touchnote">${esc(t.touch)}</p>
      <div class="actions"><button type="button" class="btn primary" data-g="start">${esc(t.start)}</button><button type="button" class="btn" data-g="exit">${esc(t.exit)}</button></div>`;
  }
  function showEnd(newBest) {
    const t = T[lang()].game;
    const end = $('#g-end');
    end.innerHTML = `
      <p class="g-kicker">${esc(newBest ? t.newBest : t.done)}</p>
      <h2>${esc(t.done)}</h2>
      <p class="g-result">${fmt(run.time)}</p>
      <p>${esc(t.best)} · ${run.best ? fmt(run.best) : '—'}</p>
      <div class="actions"><button type="button" class="btn primary" data-g="again">${esc(t.again)}</button><button type="button" class="btn" data-g="exit">${esc(t.exit)}</button></div>`;
    end.hidden = false;
  }
  function hud() {
    $('#g-bricks').textContent = `${String(run.broken).padStart(2, '0')}/${GLASS.length}`;
    $('#g-time').textContent = fmt(run.time);
    $('#g-best').textContent = run.best ? fmt(run.best) : '—';
  }

  // ---- round control
  function reset() {
    const B = built;
    for (const b of B.bricks) { b.alive = true; b.hp = 2; b.kick = 0; b.mesh.visible = true; b.mesh.userData.setHover(0); drawTag(b, false); }
    for (const list of [B.shards, B.sparks, B.puffs, B.casings]) for (const p of list) { p.life = 0; p.m.visible = false; }
    for (const b of B.bullets) { b.live = false; b.m.visible = false; }
    for (const h of B.holes) h.g.visible = false;
    Object.assign(runner, { x: 1, y: 0, vx: 0, vy: 0, h: PH, onGround: true, wall: 0, coyote: 0, airJumps: 1, lock: 0, face: 1, turnV: 1, phase: 0, checkpoint: 0, slide: 0, flip: 0, land: 0, stretch: 0, recoil: 0, idle: 0, crouch: false, wallSlide: false });
    Object.assign(run, { time: 0, started: false, broken: 0, cooldown: 0, shake: 0, flash: 0 });
    $('#g-end').hidden = true;
    hud();
  }
  function begin() {
    if (!built) return;
    state = 'play';
    $('#g-intro').hidden = true;
    $('#g-end').hidden = true;
  }
  // the sculpture's scans are only fetched when the game is first wanted
  const fetchScan = (url) => fetch(url).then((r) => r.json()).then(decodeScan);
  function preload() {
    if (!loading) loading = Promise.all([fetchScan(BODY_SCAN), fetchScan(HEAD_SCAN)])
      .then(([body, head]) => { assets = { body, head }; })
      .catch((err) => { console.warn('runner scans skipped', err); assets = {}; });
    return loading;
  }
  async function open() {
    if (active) return;
    active = true;
    state = 'intro';
    renderText();
    root.hidden = false;
    document.documentElement.classList.add('playing');
    $('#g-intro').hidden = false;
    const start = $('#g-intro [data-g="start"]');
    if (!built) {
      start.disabled = true;
      start.textContent = T[lang()].game.loading;
      await preload();
      if (!active) return;
      built = build();
      start.disabled = false;
      start.textContent = T[lang()].game.start;
    }
    reset();
    resize();
    root.focus({ preventScroll: true });
  }
  function close() {
    if (!active) return;
    active = false;
    root.hidden = true;
    document.documentElement.classList.remove('playing');
    Object.assign(input, { left: false, right: false, down: false, jumpHeld: false, firing: false, forward: false });
  }

  // ---------------------------------------------------------------- effects
  function spark(p, dir, n, kind, speed = 5) {
    let k = 0;
    for (const s of built.sparks) {
      if (s.life > 0) continue;
      s.m.material = built.sparkMats[kind];
      s.m.visible = true;
      s.m.position.copy(p);
      s.v.set(dir.x + rand(-0.8, 0.8), dir.y + rand(-0.6, 0.9), dir.z + rand(-0.5, 0.5)).normalize().multiplyScalar(speed * rand(0.5, 1.4));
      s.life = rand(0.18, 0.45);
      if (++k >= n) break;
    }
  }
  function puff(p, n, size = 0.4, rise = 0.6, color = '#9aa4b8', spread = 0.1) {
    let k = 0;
    for (const s of built.puffs) {
      if (s.life > 0) continue;
      s.m.visible = true;
      s.m.material.color.set(color);
      s.m.position.set(p.x + rand(-spread, spread), p.y + rand(-spread, spread) * 0.5, p.z + rand(-0.1, 0.1));
      s.v.set(rand(-0.6, 0.6), rand(0.2, 1) * rise, rand(-0.2, 0.2));
      s.max = s.life = rand(0.45, 0.8);
      s.size = size * rand(0.7, 1.3);
      if (++k >= n) break;
    }
  }
  function burst(x, y, n, spread, big) {
    let k = 0;
    for (const s of built.shards) {
      if (s.life > 0) continue;
      s.m.visible = true;
      s.m.position.set(x + rand(-0.5, 0.5) * spread, y + rand(-0.25, 0.25) * spread, rand(-0.3, 0.3));
      const a = Math.random() * Math.PI * 2, sp = (big ? 4 : 2) + Math.random() * (big ? 7 : 3);
      s.v.set(Math.cos(a) * sp, Math.abs(Math.sin(a)) * sp + (big ? 3 : 1), rand(-0.3, 1) * sp);
      s.spin.set(rand(0, 10), rand(0, 10), rand(0, 10));
      s.life = rand(1.1, big ? 2.3 : 1.5);
      s.m.scale.setScalar(big ? rand(0.7, 2) : rand(0.4, 0.8));
      if (++k >= n) break;
    }
  }
  function casing() {
    const B = built;
    const c = B.casings.find((q) => q.life <= 0) || B.casings[0];
    B.statue.ejector.getWorldPosition(c.m.position);
    c.m.visible = true;
    c.m.scale.setScalar(1);
    c.v.set(-runner.face * rand(1.2, 2.4), rand(2.5, 4), rand(0.5, 1.5));
    c.spin.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
    c.life = 2.4;
  }
  function hole(kind, p, n) {
    const B = built;
    const h = B.holes[B.holeNext++ % B.holes.length];
    h.hole.material = B.holeMats[kind][Math.floor(Math.random() * 3)];
    h.heat.material.color.set(kind === 'steel' ? '#ffb070' : '#9ff3ff');
    h.g.position.copy(p).addScaledVector(n, 0.004 + (B.holeNext % 12) * 0.0005);
    h.g.lookAt(v3.copy(p).add(n));
    h.g.rotateZ(Math.random() * Math.PI * 2);
    h.g.scale.setScalar(rand(0.8, 1.15));
    h.g.visible = true;
    h.t = 1;
  }

  // ---------------------------------------------------------------- shooting
  const v3 = new THREE.Vector3(), ndc = new THREE.Vector2(), ray = new THREE.Ray(), hitP = new THREE.Vector3(), X = new THREE.Vector3(1, 0, 0);
  function aimPoint(clientX, clientY) { // where the cursor meets the plane the runner lives in
    const B = built;
    ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    B.raycaster.setFromCamera(ndc, B.camera);
    return B.raycaster.ray.intersectPlane(B.plane, v3) ? v3 : null;
  }
  function screenTarget(clientX, clientY) { // what is under the cursor: a brick, the steel, or the wall behind
    const B = built;
    ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    B.raycaster.setFromCamera(ndc, B.camera);
    const list = [...B.bricks.filter((b) => b.alive).map((b) => b.mesh), ...B.steel.map((s) => s.mesh), B.back];
    const hit = B.raycaster.intersectObjects(list, false)[0];
    return hit ? hit.point.clone() : null;
  }
  const faceNormal = (box, p) => {
    const d = [[p.x - box.min.x, -1, 0, 0], [box.max.x - p.x, 1, 0, 0], [p.y - box.min.y, 0, -1, 0], [box.max.y - p.y, 0, 1, 0], [box.max.z - p.z, 0, 0, 1]];
    d.sort((a, b) => a[0] - b[0]);
    return new THREE.Vector3(d[0][1], d[0][2], d[0][3]);
  };
  // the first thing a straight shot from → to runs into
  function trace(from, to, toWall) {
    const B = built;
    const dir = to.clone().sub(from);
    const len = dir.length();
    dir.normalize();
    ray.set(from, dir);
    let best = len, hit = { kind: toWall ? 'wall' : 'none' };
    const test = (box, h) => {
      if (box.containsPoint(from)) { best = 0; hit = h; return; }
      if (!ray.intersectBox(box, hitP)) return;
      const d = from.distanceTo(hitP);
      if (d < best) { best = d; hit = h; }
    };
    for (const s of B.steel) test(s.box, { kind: 'steel', box: s.box });
    for (const b of B.bricks) if (b.alive) test(b.box, { kind: 'brick', brick: b, box: b.box });
    const point = from.clone().addScaledVector(dir, best);
    hit.point = point;
    hit.normal = hit.box ? faceNormal(hit.box, point) : new THREE.Vector3(0, 0, 1);
    return { dir, len: best, hit };
  }

  function fire() {
    const B = built, r = runner;
    B.statue.root.updateMatrixWorld(true);
    const from = B.statue.tip.getWorldPosition(new THREE.Vector3());
    let to, toWall = false;
    if (input.forward || !input.aimed) {
      to = from.clone().add(new THREE.Vector3(r.face * 30, 0, 0));
    } else {
      to = screenTarget(input.aimX, input.aimY);
      if (!to) return;
      toWall = Math.abs(to.z - BACK_Z) < 0.05;
    }
    const tr = trace(from, to, toWall);
    const b = B.bullets.find((q) => !q.live);
    if (!b) return;
    b.from.copy(from); b.dir.copy(tr.dir); b.len = tr.len; b.dist = 0; b.hit = tr.hit; b.live = true;
    b.m.visible = true;
    b.m.quaternion.setFromUnitVectors(X, tr.dir);
    b.m.position.copy(from);
    run.flash = 0.06;
    r.recoil = 1;
    run.shake = Math.max(run.shake, 0.06);
    puff(from, 2, 0.18, 0.4, '#c8d2e0', 0.02);
    casing();
    shot();
    if (!run.started && state === 'play') run.started = true;
  }

  function land(hit) {
    const p = hit.point, n = hit.normal;
    if (hit.kind === 'brick') {
      if (hit.brick.alive) hitBrick(hit.brick, p, n);
    } else if (hit.kind === 'steel') {
      hole('steel', p, n);
      spark(p, n, 12, 'hot', 6);
      puff(p, 2, 0.3, 0.5, '#8a93a6');
      impact('steel');
    } else if (hit.kind === 'wall') {
      hole('wall', p, n);
      spark(p, n, 7, 'cold', 4);
      puff(p, 3, 0.45, 0.4, '#6f7a90');
      impact('wall');
    }
  }

  function hitBrick(b, p, n) {
    b.hp--;
    b.kick = 1;
    spark(p, n, 8, 'cold', 5);
    if (b.hp > 0) {
      drawTag(b, true);
      b.mesh.userData.setHover(0.7);
      burst(p.x, p.y, 5, 0.2, false);
      tink();
      return;
    }
    b.alive = false;
    b.mesh.visible = false;
    burst(b.x, b.y, 24, Math.max(b.w, b.h), true);
    puff(new THREE.Vector3(b.x, b.y, 0.2), 5, 0.8, 0.5, '#b9c6ff', 0.4);
    shatter();
    run.broken++;
    run.shake = Math.max(run.shake, 0.22);
    if (run.broken === GLASS.length) finish();
  }

  function finish() {
    state = 'end';
    const newBest = !run.best || run.time < run.best;
    if (newBest) { run.best = run.time; store.set(run.time); }
    hud();
    showEnd(newBest);
  }

  // ---------------------------------------------------------------- physics
  const rects = () => {
    const out = STEEL.slice();
    for (const b of built.bricks) if (b.alive) out.push([b.x - b.w / 2, b.y - b.h / 2, b.x + b.w / 2, b.y + b.h / 2]);
    return out;
  };
  const hits = (x, y, h, solids) => solids.some((s) => x - PW / 2 < s[2] && x + PW / 2 > s[0] && y < s[3] && y + h > s[1]);

  function step(dt, solids) {
    const r = runner;
    const low = input.down || input.crouch;
    const ax = r.slide > 0 ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    // the figure always faces the way it runs (aiming never turns it round)
    if (r.slide <= 0 && !r.wallSlide && r.lock <= 0 && ax) r.face = ax;
    // down while running: a slide; otherwise down crouches
    if (low && r.onGround && r.slide <= 0 && !r.crouch && Math.abs(r.vx) > 4.5) {
      r.slide = 0.62;
      r.vx = Math.sign(r.vx) * Math.max(Math.abs(r.vx), 9.5);
      r.face = Math.sign(r.vx);
      puff(new THREE.Vector3(r.x, r.y + 0.05, 0.2), 4, 0.4, 0.35);
    }
    if (r.slide > 0) {
      r.slide -= dt;
      r.vx *= Math.exp(-dt * 1.4);
      if (r.slide <= 0 && hits(r.x, r.y, PH_CROUCH, solids)) r.slide = 0.02; // no headroom even to crouch: stay down
      if (!r.onGround) r.slide = 0;
      r.dustT -= dt;
      if (r.dustT <= 0) { r.dustT = 0.04; puff(new THREE.Vector3(r.x + r.face * 0.35, r.y + 0.04, 0.25), 1, 0.32, 0.35); }
    }
    const headroom = !hits(r.x, r.y, PH, solids);
    r.crouch = r.onGround && r.slide <= 0 && (low || !headroom); // and it stays low while there is no room to stand
    r.h = r.slide > 0 ? PH_SLIDE : r.crouch ? PH_CROUCH : PH;

    const cap = r.crouch ? RUN_LOW : RUN;
    if (r.lock > 0) r.lock -= dt;
    else if (ax) {
      const before = Math.abs(r.vx);
      r.vx += ax * (r.onGround ? 70 : 42) * dt;
      if (before <= cap) r.vx = THREE.MathUtils.clamp(r.vx, -cap, cap);
    } else if (r.slide <= 0) r.vx *= Math.exp(-dt * (r.onGround ? 16 : 2.5));
    if (r.lock <= 0 && r.slide <= 0 && Math.abs(r.vx) > cap) r.vx = Math.sign(r.vx) * Math.max(cap, Math.abs(r.vx) * Math.exp(-dt * 9));
    r.vy -= G * dt * (!input.jumpHeld && r.vy > 0 ? 2.1 : 1);

    r.wall = !r.onGround ? (hits(r.x - 0.06, r.y, r.h, solids) ? -1 : hits(r.x + 0.06, r.y, r.h, solids) ? 1 : 0) : 0;
    r.wallSlide = !!r.wall && ax === r.wall && r.vy < 0.5;
    if (r.wallSlide) {
      r.face = r.wall; // pressed against it, facing it
      if (r.vy < 0) {
        r.vy = Math.max(r.vy, -3.2);
        r.dustT -= dt;
        if (r.dustT <= 0) {
          r.dustT = 0.06;
          puff(new THREE.Vector3(r.x + r.wall * 0.3, r.y + 1.05, 0.2), 1, 0.2, -0.25); // under the hands
          puff(new THREE.Vector3(r.x + r.wall * 0.3, r.y + 0.3, 0.2), 1, 0.24, -0.2); // and the foot
        }
      }
    }
    r.vy = Math.max(r.vy, -20);

    r.coyote = r.onGround ? 0.1 : r.coyote - dt;
    if (input.jumpBuf > 0) {
      if (r.coyote > 0 && !headroom) input.jumpBuf = 0; // crouched under something: no room to jump
      else if (r.coyote > 0) {
        r.vy = 12.5; r.coyote = 0; input.jumpBuf = 0; r.stretch = 1; r.slide = 0; r.crouch = false; r.h = PH;
        puff(new THREE.Vector3(r.x, r.y + 0.03, 0.2), 3, 0.35, 0.4);
      } else if (r.wall) {
        r.vy = 11.8; r.vx = -r.wall * 8.6; r.lock = 0.17; input.jumpBuf = 0; r.airJumps = 1; r.face = -r.wall; r.stretch = 1;
        puff(new THREE.Vector3(r.x + r.wall * 0.3, r.y + 0.4, 0.2), 4, 0.35, 0.2);
      } else if (r.airJumps > 0) {
        r.vy = 11; r.airJumps--; input.jumpBuf = 0; r.flip = 0.0001;
        puff(new THREE.Vector3(r.x, r.y, 0.2), 4, 0.4, -0.3, '#b9c6ff');
      }
    }

    r.x += r.vx * dt;
    for (const s of solids) if (r.x - PW / 2 < s[2] && r.x + PW / 2 > s[0] && r.y < s[3] && r.y + r.h > s[1]) {
      r.x = r.vx > 0 ? s[0] - PW / 2 - 1e-4 : s[2] + PW / 2 + 1e-4;
      if (r.lock <= 0) r.vx = 0;
    }
    const was = r.onGround, vyIn = r.vy;
    r.y += r.vy * dt;
    r.onGround = false;
    for (const s of solids) if (r.x - PW / 2 < s[2] && r.x + PW / 2 > s[0] && r.y < s[3] && r.y + r.h > s[1]) {
      if (r.vy > 0) { r.y = s[1] - r.h - 1e-4; } else { r.y = s[3] + 1e-4; r.onGround = true; }
      r.vy = 0;
    }
    if (r.onGround) {
      r.airJumps = 1;
      if (!was && vyIn < -6) { // landing: crouch into it, kick up dust
        r.land = THREE.MathUtils.clamp(-vyIn / 16, 0.35, 1);
        r.flip = 0;
        puff(new THREE.Vector3(r.x, r.y + 0.04, 0.2), 2 + Math.round(r.land * 4), 0.45, 0.35, '#9aa4b8', 0.3);
        if (vyIn < -14) run.shake = Math.max(run.shake, 0.08);
      }
    }

    CHECKPOINTS.forEach(([cx], i) => { if (r.x > cx && i > r.checkpoint) r.checkpoint = i; });
    if (r.y < -9) {
      const [cx, cy] = CHECKPOINTS[r.checkpoint];
      Object.assign(r, { x: cx, y: cy + 0.1, vx: 0, vy: 0, flip: 0, slide: 0 });
      if (run.started) run.time += 2;
    }
  }

  // ---------------------------------------------------------------- per frame
  function update(dt, t) {
    if (!active || !built) return;
    const B = built, r = runner;
    dt = Math.min(dt, 1 / 30);
    input.jumpBuf -= dt;
    if (state === 'play') {
      const solids = rects();
      step(dt / 2, solids); step(dt / 2, solids);
      if (input.jumpBuf > 0 || input.left || input.right) run.started = true;
      if (run.started) run.time += dt;
      run.cooldown -= dt;
      if ((input.firing || input.forward) && run.cooldown <= 0) { fire(); run.cooldown = 0.14; }
      hud();
    }

    // tracers fly to where they will land
    for (const b of B.bullets) {
      if (!b.live) continue;
      b.dist += 60 * dt;
      if (b.dist >= b.len) { b.live = false; b.m.visible = false; land(b.hit); continue; }
      b.m.position.copy(b.from).addScaledVector(b.dir, b.dist);
    }
    // glass shards
    for (const s of B.shards) {
      if (s.life <= 0) continue;
      s.life -= dt;
      s.v.y -= 20 * dt;
      s.m.position.addScaledVector(s.v, dt);
      const px = s.m.position.x;
      const overFloor = px > -3 && !(px > 14 && px < 17) && !(px > 30 && px < 33);
      if (overFloor && s.m.position.y < 0.05 && s.v.y < 0) { s.m.position.y = 0.05; s.v.y *= -0.3; s.v.x *= 0.6; s.v.z *= 0.6; }
      s.m.rotation.x += s.spin.x * dt; s.m.rotation.y += s.spin.y * dt; s.m.rotation.z += s.spin.z * dt;
      if (s.life < 0.4) s.m.scale.multiplyScalar(0.9);
      if (s.life <= 0) s.m.visible = false;
    }
    // sparks
    for (const s of B.sparks) {
      if (s.life <= 0) continue;
      s.life -= dt;
      s.v.y -= 14 * dt;
      s.m.position.addScaledVector(s.v, dt);
      const sp = s.v.length();
      s.m.quaternion.setFromUnitVectors(X, v3.copy(s.v).divideScalar(sp || 1));
      s.m.scale.x = 0.03 + sp * 0.02;
      if (s.life <= 0) s.m.visible = false;
    }
    // dust
    for (const s of B.puffs) {
      if (s.life <= 0) continue;
      s.life -= dt;
      const k = 1 - s.life / s.max;
      s.m.position.addScaledVector(s.v, dt);
      s.m.quaternion.copy(B.camera.quaternion);
      s.m.scale.setScalar(s.size * (0.4 + k * 0.9));
      s.m.material.opacity = Math.sin(Math.min(1, k * 3) * Math.PI / 2) * (1 - k) * 0.55;
      if (s.life <= 0) s.m.visible = false;
    }
    // brass
    for (const c of B.casings) {
      if (c.life <= 0) continue;
      c.life -= dt;
      c.v.y -= 22 * dt;
      c.m.position.addScaledVector(c.v, dt);
      c.m.rotation.x += c.spin.x * dt; c.m.rotation.y += c.spin.y * dt; c.m.rotation.z += c.spin.z * dt;
      const p = c.m.position;
      for (const s of STEEL) {
        if (p.x > s[0] && p.x < s[2] && p.y < s[3] + 0.012 && p.y > s[3] - 0.25 && c.v.y < 0) {
          p.y = s[3] + 0.012; c.v.y *= -0.35; c.v.x *= 0.6; c.spin.multiplyScalar(0.6);
        }
      }
      if (c.life < 0.4) c.m.scale.setScalar(Math.max(0.01, c.life / 0.4));
      if (c.life <= 0) c.m.visible = false;
    }
    // the holes cool down
    for (const h of B.holes) {
      if (h.t <= 0) continue;
      h.t = Math.max(0, h.t - dt * 0.8);
      h.heat.material.opacity = h.t * h.t;
      h.heat.scale.setScalar(0.7 + h.t * 0.6);
    }
    for (const b of B.bricks) {
      if (!b.alive || b.kick <= 0) continue;
      b.kick = Math.max(0, b.kick - dt * 3);
      b.mesh.rotation.z = Math.sin(t * 60) * 0.06 * b.kick;
    }

    pose(dt, t);
    run.flash -= dt;
    B.statue.flash.material.opacity = run.flash > 0 ? 0.95 : 0;

    // camera: follows with a little look-ahead, shakes on breaks
    const cam = B.camera;
    const tx = THREE.MathUtils.clamp(r.x + r.face * 1.3, 1.2, 47.8);
    const ty = THREE.MathUtils.clamp(r.y, 0, 11) * 0.9 + 1.25;
    cam.userData.x = cam.userData.x === undefined ? tx : cam.userData.x + (tx - cam.userData.x) * (1 - Math.exp(-dt * 4));
    cam.userData.y = cam.userData.y === undefined ? ty : cam.userData.y + (ty - cam.userData.y) * (1 - Math.exp(-dt * 3));
    run.shake = Math.max(0, run.shake - dt * 1.4);
    const sh = reduced ? 0 : run.shake;
    // close enough to read the sculpture: about 5 m of level across the screen, more on a tall phone
    const dist = THREE.MathUtils.clamp(2.5 / (Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect), 5.4, 15);
    cam.position.set(cam.userData.x + (Math.random() - 0.5) * sh, cam.userData.y + 0.75 + (Math.random() - 0.5) * sh, dist);
    cam.lookAt(cam.userData.x, cam.userData.y + 0.15, 0);
  }

  // ---------------------------------------------------------------- animation
  // Every joint eases towards a target pose built from layers: the base (rest, run, crouch, slide, wall, air, flip),
  // then landing squash, take-off stretch and the gun's recoil. The figure faces the way it runs; the gun arm
  // points at the cursor wherever it is, behind included, the chest and head turning with it.
  const AIM_TURN = 0.45; // how far the figure turns towards the camera
  const tA = new THREE.Vector3(), tB = new THREE.Vector3(), tM = new THREE.Matrix4(), tQ = new THREE.Quaternion();
  const smooth = (a, b, x) => { const u = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  function pose(dt, t) {
    const r = runner, S = built.statue;
    const speed = Math.abs(r.vx);
    const stepping = r.onGround && speed > 0.3 && r.slide <= 0;
    const moving = stepping && !r.crouch;
    const prevS = Math.sin(r.phase);
    r.phase += dt * (stepping ? (r.crouch ? 4.2 + speed * 1.8 : 2.3 + speed * 1.45) : 0);
    const s = Math.sin(r.phase), c = Math.cos(r.phase);
    if (moving && Math.sign(s) !== Math.sign(prevS)) puff(new THREE.Vector3(r.x - r.face * 0.12, r.y + 0.03, 0.15), 1, 0.22, 0.25); // a footfall
    r.idle = moving || !r.onGround || input.firing || r.slide > 0 ? 0 : r.idle + dt;
    r.land = Math.max(0, r.land - dt * 2.8);
    r.stretch = Math.max(0, r.stretch - dt * 7);
    r.recoil = Math.max(0, r.recoil - dt * 10);
    if (r.flip > 0) { r.flip += dt / 0.42; if (r.flip >= 1 || r.onGround) r.flip = 0; }

    const breath = Math.sin(t * 1.7);
    const R0 = S.rest || { hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, ankleL: 0, ankleR: 0, shL: 0, shLz: 0, elL: 0, shR: 0, shRz: 0, elR: 0 };
    // rest: the pose it was carved in, breathing, the head turning slowly
    const q = {
      hipL: R0.hipL, hipR: R0.hipR, kneeL: R0.kneeL, kneeR: R0.kneeR, ankleL: R0.ankleL, ankleR: R0.ankleR,
      shL: R0.shL, shLz: R0.shLz, elL: R0.elL, shR: R0.shR, shRz: R0.shRz, elR: R0.elR,
      pelY: 0.535 + 0.003 * breath, pelYaw: 0, pelZ: 0, spX: 0.012 * breath, spYaw: 0, spZ: 0,
      nkX: 0.03, nkY: 0.25 * Math.sin(t * 0.33),
    };
    let tilt = 0; // the whole figure leaning (towards the wall it clings to)

    if (moving) {
      Object.assign(q, {
        hipL: -s * 0.95, hipR: s * 0.95,
        kneeL: 0.18 + Math.max(0, Math.sin(r.phase - 1.4)) * 1.35, kneeR: 0.18 + Math.max(0, -Math.sin(r.phase - 1.4)) * 1.35,
        ankleL: 0.45 * Math.max(0, -s) - 0.12, ankleR: 0.45 * Math.max(0, s) - 0.12,
        shL: s * 0.85, shR: -s * 0.85, shLz: 0.1, shRz: 0.1, elL: -1.15 - 0.3 * Math.max(0, s), elR: -1.15 - 0.3 * Math.max(0, -s),
        pelY: 0.515 + Math.abs(c) * 0.045, pelYaw: s * 0.18, pelZ: c * 0.04,
        spX: 0.14 + speed * 0.014, spYaw: -s * 0.26, spZ: 0, nkX: -0.12, nkY: s * 0.08,
      });
      if (Math.sign(r.vx) !== r.face && speed > 2) q.spX = -0.25; // skidding round
    }
    if (r.crouch) {
      // down on the haunches, feet flat, leaning over the knees; crouch-walking, short low steps
      const w = stepping ? 1 : 0;
      Object.assign(q, {
        hipL: -1.3 - 0.32 * s * w, hipR: -1.05 + 0.32 * s * w,
        kneeL: 2.05 - 0.25 * Math.max(0, s) * w, kneeR: 1.85 - 0.25 * Math.max(0, -s) * w,
        ankleL: -0.72, ankleR: -0.62,
        shL: -0.55 + 0.2 * s * w, shLz: 0.25, elL: -1.05, shR: -0.75, shRz: 0.15, elR: -0.9,
        pelY: 0.315 + 0.012 * Math.abs(c) * w + 0.003 * breath, pelYaw: 0.12 * s * w, pelZ: 0,
        spX: 0.42, spYaw: 0, spZ: 0, nkX: -0.4, nkY: 0,
      });
    } else if (r.slide > 0) {
      // a runner's slide: the lead leg straight out along the floor, the other folded under, leaning back,
      // one hand trailing on the floor, rattling a little over the ground
      const rattle = Math.sin(t * 57) * 0.5 + Math.sin(t * 83) * 0.5;
      Object.assign(q, {
        hipL: -1.42, kneeL: 0.06, ankleL: 0.3, hipR: -0.32, kneeR: 2.3, ankleR: 0.75,
        shL: 1.05, shLz: 0.55, elL: -0.1, shR: -0.95, shRz: 0.2, elR: -0.5,
        pelY: 0.205 + rattle * 0.004, pelYaw: 0, pelZ: 0.05,
        spX: -0.62, spYaw: 0.12, spZ: rattle * 0.015, nkX: 0.62, nkY: 0,
      });
    } else if (!r.onGround && r.wallSlide) {
      // sliding down a wall: both hands pressed to it, one foot braced against it, looking back over the shoulder
      const slip = r.vy < -0.5 ? 1 : 0;
      const j = (o) => Math.sin(t * 24 + o) * 0.045 * slip;
      Object.assign(q, {
        hipL: -1.0 + j(0), kneeL: 1.55, ankleL: -0.45, hipR: -0.2, kneeR: 0.55 + j(2), ankleR: 0.15,
        shL: -2.35 + j(1), shLz: 0.3, elL: -0.35, shR: -2.0 + j(2.5), shRz: 0.25, elR: -0.4,
        pelY: 0.525, pelYaw: 0, pelZ: 0, spX: 0.08, spYaw: 0, spZ: 0, nkX: 0.25, nkY: -0.55,
      });
      tilt = -r.wall * 0.07;
    } else if (!r.onGround) {
      if (r.vy > 1.5) Object.assign(q, {
        hipL: -1.2, kneeL: 1.5, ankleL: 0.2, hipR: 0.4, kneeR: 0.45, ankleR: 0.45,
        shL: -0.75, shLz: 0.2, elL: -0.9, shR: 0.45, shRz: 0.22, elR: -0.45,
        pelYaw: 0, pelZ: 0, spX: 0.12, spYaw: 0.1, spZ: 0, nkX: -0.15, nkY: 0,
      });
      else Object.assign(q, {
        hipL: -0.6, kneeL: 0.55, ankleL: 0.25, hipR: -0.15, kneeR: 0.35, ankleR: 0.3,
        shL: -0.3, shLz: 0.55, elL: -0.5, shR: -0.15, shRz: 0.55, elR: -0.45,
        pelYaw: 0, pelZ: 0, spX: 0.04, spYaw: 0, spZ: 0, nkX: 0.1, nkY: 0,
      });
      if (r.flip > 0) Object.assign(q, { hipL: -1.8, hipR: -1.7, kneeL: 2.35, kneeR: 2.3, shL: -0.95, shR: -0.95, shLz: 0.15, shRz: 0.15, elL: -1.7, elR: -1.7, spX: 0.45, nkX: 0.45 });
    }
    // landing squash, take-off stretch
    if (r.land > 0) {
      const l = r.land;
      q.kneeL += 1.1 * l; q.kneeR += 1.1 * l; q.hipL -= 0.75 * l; q.hipR -= 0.75 * l;
      q.ankleL -= 0.4 * l; q.ankleR -= 0.4 * l; q.pelY -= 0.13 * l; q.spX += 0.35 * l; q.shLz += 0.35 * l; q.shRz += 0.35 * l;
    }
    if (r.stretch > 0) {
      const st = r.stretch;
      q.kneeL *= 1 - st; q.kneeR *= 1 - st; q.ankleL += 0.5 * st; q.ankleR += 0.5 * st; q.shL -= 0.9 * st;
    }

    // aiming: where the gun should point (a point under the cursor, or straight ahead), and how far behind that is
    let aimAt = null, ahead = false;
    if (input.aimed && !input.forward) { const p = aimPoint(input.aimX, input.aimY); if (p) aimAt = p.clone(); }
    else if (input.forward || input.firing) ahead = true;
    const aiming = (aimAt || ahead) && r.flip <= 0;
    if (aiming) {
      const dx = ahead ? r.face : aimAt.x - r.x, dy = ahead ? 0 : aimAt.y - (r.y + r.h * 0.78);
      const back = smooth(-0.15, 0.75, -(dx * r.face) / (Math.hypot(dx, dy) || 1));
      const lift = Math.atan2(dy, Math.abs(dx));
      // shooting behind: the chest twists the gun shoulder back and the head looks over it
      q.spYaw = -0.6 * back; q.pelYaw -= 0.12 * back;
      q.nkX = -lift * 0.45 * (1 - back); q.nkY = -0.95 * back;
      q.spX -= r.recoil * 0.05;
    }

    const k = 1 - Math.exp(-dt * (r.flip > 0 ? 26 : 17));
    const kAim = 1 - Math.exp(-dt * 34);
    const e = (o, key, v, kk = k) => { o[key] += (v - o[key]) * kk; };
    // joints turn by the difference between the wanted angle and the carved one
    e(S.L.hip.rotation, 'x', q.hipL - R0.hipL); e(S.R.hip.rotation, 'x', q.hipR - R0.hipR);
    e(S.L.knee.rotation, 'x', q.kneeL - R0.kneeL); e(S.R.knee.rotation, 'x', q.kneeR - R0.kneeR);
    e(S.L.ankle.rotation, 'x', q.ankleL - R0.ankleL); e(S.R.ankle.rotation, 'x', q.ankleR - R0.ankleR);
    e(S.AL.shoulder.rotation, 'x', q.shL - R0.shL); e(S.AL.shoulder.rotation, 'z', q.shLz - R0.shLz); e(S.AL.elbow.rotation, 'x', q.elL - R0.elL);
    e(S.pelvis.position, 'y', S.pelvisY + (q.pelY - 0.535) / S.scale); e(S.pelvis.rotation, 'y', q.pelYaw); e(S.pelvis.rotation, 'z', q.pelZ);
    e(S.spine.rotation, 'x', q.spX); e(S.spine.rotation, 'y', q.spYaw); e(S.spine.rotation, 'z', q.spZ);
    e(S.neck.rotation, 'x', q.nkX); e(S.neck.rotation, 'y', q.nkY);
    S.flip.rotation.x = r.flip > 0 ? r.flip * Math.PI * 2 : 0;

    // turning round: swing through facing the camera, mirrored so the gun hand stays on the camera's side
    r.turnV += (r.face - r.turnV) * (1 - Math.exp(-dt * 16));
    S.turn.rotation.y = r.turnV * (Math.PI / 2 - AIM_TURN);
    S.turn.scale.x = r.turnV >= 0 ? 1 : -1;
    S.root.position.set(r.x, r.y, 0);
    S.root.rotation.z += (tilt - S.root.rotation.z) * k;

    // the gun arm: aimed, it turns straight at the target from wherever the chest has got to (so behind works
    // too), held out nearly straight, kicking up with each shot; otherwise it swings with the pose
    const sh = S.AR.shoulder;
    if (aiming) {
      S.root.updateMatrixWorld(true);
      const from = sh.getWorldPosition(tA);
      const dir = ahead ? tB.set(r.face, 0, 0) : tB.copy(aimAt).sub(from).normalize();
      dir.y += r.recoil * 0.22;
      dir.transformDirection(tM.copy(sh.parent.matrixWorld).invert());
      tQ.setFromUnitVectors(tA.copy(S.AR.elbow.position).normalize(), dir);
      sh.quaternion.slerp(tQ, kAim);
      e(S.AR.elbow.rotation, 'x', -0.12 - r.recoil * 0.3 - R0.elR, kAim);
    } else {
      e(sh.rotation, 'x', q.shR - R0.shR); e(sh.rotation, 'y', 0); e(sh.rotation, 'z', -(q.shRz - R0.shRz)); e(S.AR.elbow.rotation, 'x', q.elR - R0.elR);
    }

    // the joints glow brighter the harder the statue moves
    if (S.ringMat) S.ringMat.opacity = 0.35 + Math.min(0.55, speed * 0.05 + (r.onGround ? 0 : 0.25) + r.recoil * 0.3) + 0.08 * Math.sin(t * 3);
  }

  function render(t) {
    if (!active || !built) return;
    if (post) post.render(t);
    else renderer.render(built.scene, built.camera);
  }

  function resize() {
    if (!built) return;
    built.camera.aspect = window.innerWidth / window.innerHeight;
    built.camera.updateProjectionMatrix();
    if (post) post.setSize(window.innerWidth, window.innerHeight, pixelRatio());
  }

  // ---------------------------------------------------------------- input
  const KEYS = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowDown: 'down', KeyS: 'down',
    KeyC: 'crouch', Space: 'jump', KeyW: 'jump', ArrowUp: 'jump', KeyF: 'forward', KeyJ: 'forward',
  };
  window.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.code === 'Escape') { e.preventDefault(); close(); return; }
    if (!built) return;
    if (e.code === 'KeyR') { reset(); begin(); return; }
    const k = KEYS[e.code];
    if (!k) return;
    e.preventDefault();
    if (state === 'intro') begin();
    if (k === 'jump') { if (!e.repeat) input.jumpBuf = 0.13; input.jumpHeld = true; }
    else if (k === 'forward') input.forward = true;
    else input[k] = true;
  });
  window.addEventListener('keyup', (e) => {
    if (!active) return;
    const k = KEYS[e.code];
    if (k === 'jump') input.jumpHeld = false;
    else if (k === 'forward') input.forward = false;
    else if (k) input[k] = false;
  });
  const onUI = (e) => !!e.target.closest('.g-hud, .g-card, .g-touch');
  root.addEventListener('pointermove', (e) => {
    cross.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    if (e.pointerType === 'mouse') { input.aimX = e.clientX; input.aimY = e.clientY; input.aimed = true; }
  });
  root.addEventListener('pointerdown', (e) => {
    if (onUI(e) || state !== 'play') return;
    input.aimX = e.clientX; input.aimY = e.clientY; input.aimed = true;
    if (e.pointerType === 'mouse') { if (e.button === 0) input.firing = true; }
    else if (run.cooldown <= 0) { fire(); run.cooldown = 0.14; }
  });
  window.addEventListener('pointerup', () => { input.firing = false; });
  root.addEventListener('contextmenu', (e) => e.preventDefault());
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-g]');
    if (!b) return;
    const what = b.dataset.g;
    if (what === 'exit') close();
    else if (what === 'start') begin();
    else if (what === 'again') { reset(); begin(); }
  });
  $('#g-exit').addEventListener('click', close);
  root.querySelectorAll('.g-touch [data-k]').forEach((btn) => {
    const k = btn.dataset.k;
    const down = (e) => { e.preventDefault(); if (state === 'intro') begin(); if (k === 'jump') { input.jumpBuf = 0.13; input.jumpHeld = true; } else input[k] = true; };
    const up = () => { if (k === 'jump') input.jumpHeld = false; else input[k] = false; };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  });

  return {
    open, close, update, render, resize,
    get active() { return active; },
    // local checks only
    debug: { runner, input, run, get state() { return state; }, begin, get built() { return built; } },
  };
}
