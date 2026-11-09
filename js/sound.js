// Tiny WebAudio synth: soft piano-like notes and glass chimes, with a generated reverb,
// and Chopin's Ballade No. 1 streaming underneath. Nothing plays until the visitor turns sound on.

let ac = null;
let master = null;
let enabled = false;

// Background music: Frédéric Chopin, Ballade No. 1 in G minor, Op. 23 — Frank Lévy for Musopen, CC BY 4.0
// (Wikimedia Commons), trimmed to start on the first note.
const MUSIC_SRC = 'assets/audio/chopin-ballade-1.mp3';
const MUSIC_LEVEL = 0.75;
let music = null;
let musicGain = null;
let pauseTimer = 0;

function bootMusic() {
  if (music || !ac) return;
  music = new Audio(MUSIC_SRC);
  music.loop = true;
  music.preload = 'auto';
  try {
    musicGain = ac.createGain();
    musicGain.gain.value = 0;
    ac.createMediaElementSource(music).connect(musicGain).connect(ac.destination);
  } catch {
    musicGain = null; // fall back to the element's own volume
    music.volume = 0;
  }
  document.addEventListener('visibilitychange', () => {
    if (!enabled) return;
    if (document.hidden) music.pause();
    else music.play().catch(() => {});
  });
}

function fadeMusic(to, seconds) {
  if (musicGain) {
    const t = ac.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(musicGain.gain.value, t);
    musicGain.gain.linearRampToValueAtTime(to, t + seconds);
  } else if (music) {
    music.volume = to;
  }
}

export const musicPlaying = () => !!music && !music.paused;
export const musicTime = () => music?.currentTime ?? 0;

function impulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function boot() {
  if (ac) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  ac = new Ctx();
  master = ac.createGain();
  master.gain.value = 0.2;
  const verb = ac.createConvolver();
  verb.buffer = impulse(ac, 3.2, 2.6);
  const wet = ac.createGain();
  wet.gain.value = 0.5;
  master.connect(ac.destination);
  master.connect(verb);
  verb.connect(wet);
  wet.connect(ac.destination);
}

export function setSound(on) {
  enabled = on;
  if (on) boot();
  if (!ac) return;
  clearTimeout(pauseTimer);
  if (on) {
    ac.resume();
    bootMusic();
    music.play().catch(() => {});
    fadeMusic(MUSIC_LEVEL, 2.5);
  } else {
    fadeMusic(0, 0.6);
    pauseTimer = setTimeout(() => { music?.pause(); ac.suspend(); }, 700);
  }
}

export function note(midi, vel = 0.6, delay = 0) {
  if (!enabled || !ac) return;
  const t = ac.currentTime + delay;
  const f = 440 * Math.pow(2, (midi - 69) / 12);
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(vel * 0.6, t + 0.006);
  env.gain.exponentialRampToValueAtTime(vel * 0.16, t + 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(Math.min(12000, f * 9), t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 2), t + 1.6);
  const partials = [[1, 1], [2, 0.32], [3, 0.1], [4.01, 0.05]];
  for (const [mult, amp] of partials) {
    const o = ac.createOscillator();
    o.type = mult === 1 ? 'triangle' : 'sine';
    o.frequency.value = f * mult;
    o.detune.value = (Math.random() - 0.5) * 6;
    const g = ac.createGain();
    g.gain.value = amp;
    o.connect(g).connect(lp);
    o.start(t);
    o.stop(t + 3.3);
  }
  lp.connect(env).connect(master);
}

// The room chords would fight the Ballade, so they only sound when the music is not playing.
export function chord(notes, vel = 0.32) {
  if (musicPlaying()) return;
  notes.forEach((n, i) => note(n, vel, i * 0.07));
}

export function chime(pitch = 96) {
  if (!enabled || !ac) return;
  const t = ac.currentTime;
  [1, 2.76, 5.4].forEach((m, i) => {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = 440 * Math.pow(2, (pitch - 69) / 12) * m;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime((musicPlaying() ? 0.07 : 0.12) / (i + 1), t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4 / (i + 1));
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 2.5);
  });
}

// One voicing per room, played when the visitor arrives.
export const ROOM_CHORDS = [
  [48, 55, 64, 71, 74], // Cmaj9
  [45, 52, 60, 67, 71], // Am9
  [41, 48, 57, 64, 71], // Fmaj7#11
  [50, 57, 65, 72, 76], // Dm9
  [43, 50, 60, 65, 69], // G9sus
  [40, 47, 55, 62, 66], // Em9
  [45, 52, 59, 64, 71], // Asus2 add9
  [41, 48, 57, 62, 67], // Fmaj7/6
  [48, 55, 62, 67, 76], // Csus2
];

// ---- the minigame: a gunshot, glass cracking, glass giving way
let noiseBuf = null;
function noise() {
  if (!noiseBuf) {
    const len = Math.floor(ac.sampleRate * 0.6);
    noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  return src;
}

function burstOf(filterType, freq, q, gain, decay) {
  const t = ac.currentTime;
  const src = noise();
  const f = ac.createBiquadFilter();
  f.type = filterType; f.frequency.value = freq; f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.3, decay + 0.05);
}

export function shot() {
  if (!enabled || !ac) return;
  burstOf('bandpass', 1900, 0.8, 0.55, 0.16);
  const t = ac.currentTime;
  const o = ac.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.55, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.16);
}

export function tink() {
  if (!enabled || !ac) return;
  burstOf('highpass', 5200, 0.7, 0.25, 0.08);
  chime(100 + Math.floor(Math.random() * 4));
}

export function shatter() {
  if (!enabled || !ac) return;
  burstOf('highpass', 3200, 0.5, 0.6, 0.45);
  burstOf('bandpass', 7000, 1.2, 0.3, 0.3);
  const scale = [91, 94, 96, 98, 101, 103];
  for (let i = 0; i < 3; i++) setTimeout(() => chime(scale[Math.floor(Math.random() * scale.length)]), i * 45);
}

// sliding, on the floor or down a wall: a loop of filtered noise that swells while it lasts (level 0 to 1)
let scraper = null;
export function scrape(level) {
  if (!ac) return;
  if (!scraper) {
    if (!enabled || level <= 0) return;
    const src = noise();
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.9;
    const g = ac.createGain();
    g.gain.value = 0;
    src.connect(f).connect(g).connect(master);
    src.start();
    scraper = { g, f };
  }
  const v = enabled ? level : 0;
  scraper.g.gain.setTargetAtTime(v * 0.09, ac.currentTime, 0.06);
  scraper.f.frequency.setTargetAtTime(2200 + v * 900, ac.currentTime, 0.1);
}

// a bullet landing: a ringing knock on steel, a little crack in the glass wall
export function impact(kind) {
  if (!enabled || !ac) return;
  if (kind === 'steel') {
    burstOf('bandpass', 3600, 2.5, 0.35, 0.08);
    const t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(2300 + Math.random() * 500, t);
    o.frequency.exponentialRampToValueAtTime(1500, t + 0.25);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.32);
  } else {
    burstOf('highpass', 4200, 0.8, 0.28, 0.09);
    const t = ac.currentTime; // a short glassy ping, short enough not to pile up under a burst of fire
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(3200 + Math.random() * 900, t);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.2);
  }
}
