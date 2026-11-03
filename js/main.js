// Juandagarc portfolio — bootstrap: renderer, quality tiers, loading, interaction, frame loop, minigame.
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createUI } from './ui.js';
import { PROJECTS } from './content.js';
import { FOG, COLORS } from './materials.js';
import { createFloor, createVoid, createDust, createPost, time } from './fx.js';
import { redrawLabels } from './labels.js';
import { buildEntrance } from './rooms/entrance.js';
import { buildAbout } from './rooms/about.js';
import { buildJourney } from './rooms/journey.js';
import { buildGallery } from './rooms/gallery.js';
import { buildContact } from './rooms/contact.js';
import { buildSculptures, decodeScan, SCULPTURE_FILES } from './rooms/sculptures.js';
import { createTour } from './tour.js';
import { setSound, chord, chime, ROOM_CHORDS } from './sound.js';
import { createGame } from './game.js';

const ui = createUI();
let currentRoom = 0;
ui.on('sound', (on) => { setSound(on); if (on) chord(ROOM_CHORDS[currentRoom]); });

function hasWebGL2() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}

function fallback(err) {
  if (err) console.error(err);
  document.documentElement.classList.add('no-webgl');
  ui.finishLoading();
}

function pickTier() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 700;
  const mem = navigator.deviceMemory || 8;
  if (coarse || small || mem <= 4) return 'low';
  return 'high';
}

const PIXEL_RATIO = { high: 1.75, medium: 1.35, low: 1.5, min: 1 };
const NEXT_TIER = { high: 'medium', medium: 'low', low: 'min' };

if (!hasWebGL2()) fallback();
else start().catch(fallback);

async function start() {
  let tier = pickTier();
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier === 'low', powerPreference: 'high-performance' });
  renderer.setClearColor(COLORS.void, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.92;
  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, PIXEL_RATIO[tier]);
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(FOG.color.value, FOG.density.value);
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 900);
  camera.position.set(0, 13, 38);

  // ---- assets
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => ui.setLoad((loaded / total) * 0.85);
  const texLoader = new THREE.TextureLoader(manager);
  const loadTex = (url) => new Promise((res, rej) => texLoader.load(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    res(t);
  }, undefined, rej));
  const fontsReady = Promise.race([
    Promise.all([
      document.fonts.load('800 40px "Plus Jakarta Sans"'),
      document.fonts.load('italic 800 40px "Plus Jakarta Sans"'),
      document.fonts.load('500 40px "JetBrains Mono"'),
    ]),
    new Promise((r) => setTimeout(r, 3500)),
  ]);
  const scanLoader = new THREE.FileLoader(manager).setResponseType('json');
  const loadScan = (url) => new Promise((res) => scanLoader.load(url, (j) => res(decodeScan(j)), undefined, (err) => { console.warn('sculpture skipped', url, err); res(null); }));
  const scanKeys = Object.keys(SCULPTURE_FILES);
  const [font, portrait, projectTex, scanList] = await Promise.all([
    new Promise((res, rej) => new FontLoader(manager).load('assets/jakarta-800.typeface.json', res, undefined, rej)),
    loadTex('assets/portrait.webp'),
    Promise.all(PROJECTS.map((p) => (p.img ? loadTex(p.img) : Promise.resolve(null)))),
    Promise.all(scanKeys.map((k) => loadScan(SCULPTURE_FILES[k]))),
    fontsReady,
  ]);
  const scans = Object.fromEntries(scanKeys.map((k, i) => [k, scanList[i]]));
  ui.setLoad(0.9);

  // ---- world
  const updaters = [];
  const interactives = [];
  let introAt = Infinity;
  let focused = -1;
  const ctx = {
    scene, camera, font, tier, time,
    tex: { portrait, projects: projectTex },
    scans,
    reduced: ui.reduced,
    lang: () => ui.lang,
    onUpdate: (fn) => updaters.push(fn),
    addInteractive: (obj, h) => { obj.userData.ix = h; interactives.push(obj); },
    introAt: () => introAt,
    focused: () => focused,
    openProject: (i) => ui.requestProject(i),
    openLink: (name) => ui.clickLink(name),
    openGame: () => game?.open(),
  };

  scene.add(createVoid());
  const floor = createFloor({ reflect: tier === 'high' });
  scene.add(floor.group);
  const entrance = buildEntrance(ctx);
  buildAbout(ctx);
  buildJourney(ctx);
  buildGallery(ctx);
  buildContact(ctx);
  buildSculptures(ctx);
  const dust = createDust(tier === 'low' ? 350 : 1100, [14, -320]);
  scene.add(dust);
  dust.material.uniforms.uPR.value = pixelRatio();
  if (ui.reduced) dust.material.uniforms.uMotion.value = 0.15;

  redrawLabels(ui.lang);
  ui.on('lang', (l) => redrawLabels(l));

  const tour = createTour({ camera, ui, entrance });

  // Render the reflection once per frame, for the main camera only (it is also reached from the transmission pass).
  let frameId = 0;
  if (floor.mirror) {
    const original = floor.mirror.onBeforeRender;
    let last = -1;
    floor.mirror.onBeforeRender = function (r, s, cam, ...rest) {
      if (cam !== camera || last === frameId) return;
      last = frameId;
      original.call(this, r, s, cam, ...rest);
    };
  }

  let post = createPost(renderer, scene, camera, { msaa: tier === 'high' ? 4 : 0 });
  if (post) post.setSize(window.innerWidth, window.innerHeight, pixelRatio());

  // ---- the minigame behind the closing mark: its own scene, drawn instead of the tour while it is open
  const game = createGame({ renderer, scans, reduced: ui.reduced, lang: () => ui.lang, pixelRatio, usePost: () => !!post });
  ui.on('game', () => game.open());

  // ---- quality tiers
  function applyTier(next) {
    tier = next;
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    floor.setReflect(tier === 'high');
    if (tier === 'min' && post) { post.composer.dispose(); post = null; }
    if (post) post.setSize(window.innerWidth, window.innerHeight, pixelRatio());
  }
  const perf = { acc: 0, frames: 0, checks: 0 };
  function watchPerformance(dt, t) {
    if (!tour.introDone(t) || perf.checks >= 4 || document.hidden) return;
    perf.acc += dt; perf.frames++;
    if (perf.acc < 2.5) return;
    const avg = perf.acc / perf.frames;
    perf.acc = 0; perf.frames = 0; perf.checks++;
    if (avg > 1 / 36 && NEXT_TIER[tier]) applyTier(NEXT_TIER[tier]);
  }

  // ---- interaction
  let t = 0;
  const clockTime = () => t;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pointerDirty = false;
  let pointerOverUI = false;
  let hovered = null;
  const findHandler = (o) => { while (o) { if (o.userData.ix) return o; o = o.parent; } return null; };
  function pick(x, y) {
    ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    // only the piece on show (and what stands right around it) answers the pointer, never what glows in the distance
    raycaster.far = tour.state.targetDist + 6;
    const hit = raycaster.intersectObjects(interactives, false)[0];
    return hit ? findHandler(hit.object) : null;
  }
  // A spinning letter slips in and out from under a still cursor; a short grace period and a per-piece
  // cooldown keep one hover = one turn, one note.
  let lostAt = -1;
  function trigger(obj) {
    const ix = obj.userData.ix;
    if (!ix.trigger) return;
    if (clockTime() - (ix.lastTrigger ?? -99) < (ix.cooldown ?? 1.4)) return;
    ix.lastTrigger = clockTime();
    ix.trigger();
  }
  function setHovered(obj, immediate = false) {
    if (obj === hovered) { lostAt = -1; return; }
    if (!obj && hovered && !immediate) {
      if (lostAt < 0) lostAt = clockTime();
      if (clockTime() - lostAt < 0.22) return;
    }
    lostAt = -1;
    hovered?.userData.ix.onLeave?.();
    hovered = obj;
    if (hovered) { hovered.userData.ix.onEnter?.(); trigger(hovered); }
    ui.setHover(hovered ? hovered.userData.ix.label() : null);
  }
  let lastPointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    lastPointer = { x: e.clientX, y: e.clientY };
    pointerOverUI = ui.isUIEvent(e);
    pointerDirty = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => setHovered(null, true));
  let down = null;
  window.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });
  window.addEventListener('pointerup', (e) => {
    if (!down || game.active || ui.isUIEvent(e) || ui.isOpen()) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved > 8 || performance.now() - down.t > 600) return;
    const obj = pick(e.clientX, e.clientY);
    if (!obj) return;
    if (e.pointerType !== 'mouse') { obj.userData.ix.onEnter?.(); trigger(obj); setTimeout(() => obj.userData.ix.onLeave?.(), 600); }
    obj.userData.ix.onClick?.();
  });

  ui.on('open', (i) => { focused = i; tour.focus(i); chime(96); setHovered(null, true); });
  ui.on('close', () => { focused = -1; tour.unfocus(); });

  // ---- resize
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    tour.resize();
    if (post) post.setSize(window.innerWidth, window.innerHeight, pixelRatio());
    game.resize();
    ui.measure();
  }
  window.addEventListener('resize', resize);

  // ---- warm up shaders before revealing, then start the intro
  camera.position.set(0, 7.5, 40);
  camera.lookAt(0, 1.6, 0);
  renderer.compile(scene, camera);
  ui.setLoad(1);

  const clock = new THREE.Clock();
  let started = false;

  function frame(forcedDt) {
    const dt = forcedDt ?? Math.min(clock.getDelta(), 1 / 20);
    t += dt;
    frameId++;
    time.value = t;
    if (!started) {
      started = true;
      introAt = t;
      tour.startIntro(t);
      requestAnimationFrame(() => ui.finishLoading());
    }
    if (game.active) {
      game.update(dt, t);
      game.render(t);
      ui.tickCursor();
      return;
    }
    for (const fn of updaters) fn(t, dt);
    tour.update(dt, t);
    const room = ui.frame(tour.state.s);
    if (room !== currentRoom) { currentRoom = room; chord(ROOM_CHORDS[room]); }

    if (pointerDirty || lostAt >= 0 || tour.state.focus > 0.001 || Math.abs(ui.stopFloat() - tour.state.s) > 0.002) {
      pointerDirty = false;
      setHovered(pointerOverUI || ui.isOpen() ? null : pick(lastPointer.x, lastPointer.y), pointerOverUI || ui.isOpen());
    }

    if (post) post.render(t);
    else renderer.render(scene, camera);
    ui.tickCursor();
    watchPerformance(dt, t);
  }
  renderer.setAnimationLoop(() => frame());

  // Local debugging only: drive frames by hand when the tab is in the background.
  if (location.hostname === 'localhost') {
    window.__museo = {
      camera, tour, renderer, scene, game, applyTier, tier: () => tier,
      step(n = 1, dt = 0.1) { for (let i = 0; i < n; i++) frame(dt); },
      // render one frame from an arbitrary viewpoint (close-up inspection)
      peek(p, q) {
        frameId++;
        camera.clearViewOffset();
        camera.position.set(...p);
        camera.lookAt(...q);
        if (post) post.render(t);
        else renderer.render(scene, camera);
      },
    };
  }
}
