// 〈불멍(火멍) v2 : 테마별 실시간 번뇌 소각장 & 스와이프 한지 투척 UI/UX〉
// 100% Procedural Canvas Physics, Volumetric Flame & Ember System, Hanji Flick-to-Burn & Web Audio ASMR.

import { t, tl, lang, LOCALE, setLang, applyDom } from './i18n.mjs';

applyDom();

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

// ── Themed Campfire Rooms & Live Burned Word Rankings (100% Real Server Counts) ──
const ROOMS = Object.fromEntries(['work', 'stock', 'relation', 'zen'].map(id => [id, {
  id,
  title: t(`room.${id}.name`),
  caption: t(`room.${id}.caption`),
  stamp: t(`room.${id}.stamp`),
  rankings: tl(`room.${id}.rankings`).map((word, i) => ({ rk: `${id}.${i}`, word, count: 0 })),
  chips: tl(`room.${id}.chips`),
  oracles: tl(`room.${id}.oracles`)
}]));

// ── State & Persistence (100% Real Server Metrics, Migrating Only Unlocks) ──
const STORAGE_KEY = 'bulmeong:lounge:v8_real';
let saved = {};
try {
  const rawNew = localStorage.getItem(STORAGE_KEY);
  if (rawNew) {
    saved = JSON.parse(rawNew);
  } else {
    const legacy = JSON.parse(localStorage.getItem('bulmeong:lounge:v2') || '{}');
    saved = {
      space: legacy.space,
      discovererName: legacy.discovererName,
      goldUnlocked: legacy.goldUnlocked,
      eggAlbum: legacy.eggAlbum,
      burnedCount: 0,
      globalBurnTotal: 0
    };
  }
} catch {}

const urlParams = new URLSearchParams(window.location.search);
const querySpace = urlParams.get('space');

const state = {
  space: (querySpace && ['camp', 'temple', 'snow', 'cosmos'].includes(querySpace)) ? querySpace : (saved.space || 'camp'),
  seconds: Number(saved.seconds) || 0,
  burnedCount: Number(saved.burnedCount) || 0,
  warmthCount: Number(saved.warmthCount) || 0,
  lastBurnedText: saved.lastBurnedText || '',
  lastOracle: saved.lastOracle || tl('room.work.oracles')[1] || '',
  // v8 pre-filled the owner's nickname for every visitor; treat that saved default as no name.
  discovererName: saved.discovererName && saved.discovererName !== '시루아빠' ? saved.discovererName : '',
  tossLink: saved.tossLink || '',
  goldUnlocked: Boolean(saved.goldUnlocked),
  goldMode: Boolean(saved.goldUnlocked),
  cosmosOpen: Boolean(saved.cosmosOpen),
  day: saved.day || '',
  burnedToday: Number(saved.burnedToday) || 0,
  maxTempToday: Number(saved.maxTempToday) || 0,
  eggAlbum: (saved.eggAlbum && typeof saved.eggAlbum === 'object') ? saved.eggAlbum : {},
  albumFilter: 'all',
  heat: 36.5,
  stoking: 0.25,
  paletteIndex: 0,
  audioEnabled: false,
  volFire: 0.75,
  volRain: 0.55,
  volChime: 0.70
};

const todayKey = () => new Date().toLocaleDateString('en-CA');
function rollDay() {
  if (state.day !== todayKey()) {
    state.day = todayKey();
    state.burnedToday = 0;
    state.maxTempToday = 0;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      space: state.space,
      seconds: state.seconds,
      burnedCount: state.burnedCount,
      warmthCount: state.warmthCount,
      tempC: state.tempC,
      fatiguePct: state.fatiguePct,
      globalBurnTotal: state.globalBurnTotal,
      lastBurnedText: state.lastBurnedText,
      lastOracle: state.lastOracle,
      discovererName: state.discovererName,
      tossLink: state.tossLink,
      goldUnlocked: state.goldUnlocked,
      cosmosOpen: state.cosmosOpen,
      day: state.day,
      burnedToday: state.burnedToday,
      maxTempToday: state.maxTempToday,
      eggAlbum: state.eggAlbum
    }));
  } catch {}
}

const SPACES = {
  camp: { id: 'camp', name: t('space.camp'), desc: t('space.camp.desc') },
  temple: { id: 'temple', name: t('space.temple'), desc: t('space.temple.desc') },
  snow: { id: 'snow', name: t('space.snow'), desc: t('space.snow.desc') },
  cosmos: { id: 'cosmos', name: t('space.cosmos'), desc: t('space.cosmos.desc') }
};

const PALETTES = [
  { name: t('palette.0'), core: [255, 248, 215], mid: [255, 148, 48], outer: [218, 48, 18], smoke: [55, 48, 58], glow: '255, 128, 42' },
  { name: t('palette.1'), core: [225, 255, 248], mid: [46, 224, 186], outer: [18, 112, 168], smoke: [38, 62, 70], glow: '46, 218, 186' },
  { name: t('palette.2'), core: [252, 232, 255], mid: [192, 94, 255], outer: [112, 28, 188], smoke: [58, 42, 72], glow: '186, 88, 255' },
  { name: t('palette.3'), core: [255, 252, 230], mid: [255, 200, 68], outer: [214, 118, 18], smoke: [68, 58, 44], glow: '255, 196, 68' },
  { name: t('palette.4'), core: [255, 210, 245], mid: [235, 38, 115], outer: [52, 12, 98], smoke: [22, 10, 35], glow: '235, 38, 115' },
  { name: t('palette.5'), core: [255, 255, 255], mid: [255, 232, 130], outer: [255, 122, 24], smoke: [90, 75, 45], glow: '255, 228, 120' },
  { name: t('palette.6'), core: [230, 255, 255], mid: [0, 245, 255], outer: [255, 0, 168], smoke: [30, 50, 65], glow: '0, 240, 255' },
  { name: t('palette.7'), core: [255, 255, 255], mid: [168, 255, 120], outer: [118, 68, 255], smoke: [55, 45, 80], glow: '175, 135, 255' }
];

// ── Procedural Web Audio ASMR Engine ─────────────────────────────────────────
class AsmrAudioEngine {
  constructor() {
    this.ctx = null;
    this.running = false;
    this.fireGain = null;
    this.rainGain = null;
    this.mix = {};
    this.loaded = new Set();
  }

  // Recorded loops (assets/audio, credits in docs/CREDITS.md) replace the synth beds once decoded.
  async loadLoop(file, out, name) {
    if (this.mix[name]) return;
    this.mix[name] = this.ctx.createGain();
    this.mix[name].gain.value = 0;
    this.mix[name].connect(out);
    try {
      const buf = await this.ctx.decodeAudioData(await (await fetch(`./assets/audio/${file}`)).arrayBuffer());
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      // skip the AAC encoder padding at both ends so the loop seam stays silent-free
      src.loopStart = 0.05;
      src.loopEnd = buf.duration - 0.05;
      src.connect(this.mix[name]);
      src.start(0, 0.05);
      this.loaded.add(name);
      this.applyScene();
    } catch {}
  }

  // Fire everywhere; recorded rain in the forest and temple, synth wind in the snow; chimes only at the temple.
  applyScene() {
    if (!this.ctx) return;
    const snow = state.space === 'snow', temple = state.space === 'temple';
    if (temple) this.loadLoop('chime.m4a', this.chimeGain, 'recChime');
    const set = (name, v) => this.mix[name]?.gain.setTargetAtTime(v, this.ctx.currentTime, 0.6);
    set('synthFire', this.loaded.has('recFire') ? 0 : 1);
    set('recFire', 2.5);
    set('synthRain', this.loaded.has('recRain') && !snow ? 0 : 1);
    set('recRain', snow ? 0 : 2.5);
    set('recChime', temple ? 1 : 0);
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      out[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = out[i];
      out[i] *= 3.2;
    }
    const fireSource = this.ctx.createBufferSource();
    fireSource.buffer = noiseBuffer;
    fireSource.loop = true;

    const fireFilter = this.ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 210;

    this.fireGain = this.ctx.createGain();
    this.fireGain.gain.value = state.volFire * 0.32;
    this.mix.synthFire = this.ctx.createGain();
    fireSource.connect(fireFilter).connect(this.mix.synthFire).connect(this.fireGain).connect(this.ctx.destination);
    fireSource.start();

    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const rainOut = rainBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      rainOut[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.035;
      b6 = w * 0.115926;
    }
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1150;
    rainFilter.Q.value = 0.7;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = state.volRain * 0.22;
    this.mix.synthRain = this.ctx.createGain();
    rainSource.connect(rainFilter).connect(this.mix.synthRain).connect(this.rainGain).connect(this.ctx.destination);
    rainSource.start();

    this.chimeGain = this.ctx.createGain();
    this.chimeGain.gain.value = 0;
    this.chimeGain.connect(this.ctx.destination);
    this.loadLoop('fire.m4a', this.fireGain, 'recFire');
    this.loadLoop('rain.m4a', this.rainGain, 'recRain');

    setInterval(() => {
      if (!this.running || !this.ctx || state.volFire <= 0.01) return;
      if (!this.loaded.has('recFire') && Math.random() < 0.65) this.triggerCrackle();
    }, 180);
  }

  triggerCrackle() {
    if (!this.ctx || !this.running) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600 + Math.random() * 2400;
    filter.Q.value = 4.0;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180 + Math.random() * 420, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

    const amp = (0.015 + Math.random() * 0.035) * state.volFire;
    gain.gain.setValueAtTime(amp, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(filter).connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playWhooshAndBowl() {
    if (!this.ctx || !this.running || state.volChime <= 0.01) return;
    const now = this.ctx.currentTime;
    [370.0, 740.0, 1118.0].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      const peak = (0.11 / (idx + 1)) * state.volChime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6 - idx * 0.6);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.7);
    });
  }

  playWindChime() {
    if (!this.ctx || !this.running || state.volChime <= 0.01) return;
    const now = this.ctx.currentTime;
    const base = [1046.5, 1318.5, 1567.98, 2093.0][Math.floor(Math.random() * 4)];
    [base, base * 1.5].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      const peak = (0.045 / (idx + 1)) * state.volChime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.3);
    });
  }

  setRunning(flag) {
    this.init();
    this.running = flag;
    if (flag) {
      this.ctx.resume();
      this.updateVolumes();
    } else if (this.ctx) {
      this.fireGain.gain.value = 0;
      this.rainGain.gain.value = 0;
      this.chimeGain.gain.value = 0;
    }
  }

  updateVolumes() {
    if (!this.ctx || !this.running) return;
    this.fireGain.gain.setTargetAtTime(state.volFire * 0.32, this.ctx.currentTime, 0.08);
    this.rainGain.gain.setTargetAtTime(state.volRain * 0.22, this.ctx.currentTime, 0.08);
    this.chimeGain.gain.setTargetAtTime(state.volChime * 0.6, this.ctx.currentTime, 0.08);
  }
}

const audio = new AsmrAudioEngine();

// ── Scene Geometry & Particle Pools ──────────────────────────────────────────
let W = window.innerWidth, H = window.innerHeight, DPR = Math.min(2, window.devicePixelRatio || 1);
let fireX = W * 0.5, fireY = H * 0.64;

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  fireX = W * 0.5;
  fireY = H * 0.63;
}
window.addEventListener('resize', resize);
resize();

const flames = [];
const sparks = [];
const smokes = [];
const raindrops = [];
const snowflakes = [];
const stars = [];
const meteors = [];
const ripples = [];
const fireflies = [];
const warmthArcs = [];
const ghostNotes = [];
const risingEmberTexts = [];
const risingClickPopups = [];
let activeNote = null;
let activeGiftLog = null;

// ── Hand-Painted Indie Game Art Assets (4 Bespoke Space Illustrations) ──────
// v9 scenes: an unlit and a lit plate per orientation; the pit is a separate layer set on the plate's empty patch,
// and the flames are drawn between the pit and its front stones. Anchors come from tools/optimize_art.py.
const SCENE_ART = {
  camp: { scene: 'forest', pit: 'stone', anchor: { land: [0.513, 0.681], port: [0.508, 0.637] } },
  temple: { scene: 'temple', pit: 'brazier', anchor: { land: [0.486, 0.693], port: [0.5, 0.685] } },
  snow: { scene: 'snow', pit: 'snow', anchor: { land: [0.47, 0.63], port: [0.476, 0.611] } }
};
// ground: pit-image height that sits on the anchor; base: where the flames start; front: band where the front stones fade in over the flames.
const PIT_ART = {
  stone: { ground: 0.6, base: 0.5, front: [0.52, 0.66], width: 0.95 },
  snow: { ground: 0.6, base: 0.5, front: [0.52, 0.66], width: 0.95 },
  brazier: { ground: 0.8, base: 0.36, front: [0.36, 0.48], width: 0.8 }
};
const artCache = {};
function art(path) {
  if (!artCache[path]) {
    artCache[path] = new Image();
    artCache[path].src = `./assets/${path}.webp`;
  }
  return artCache[path];
}
const ready = im => im && im.complete && im.naturalWidth > 0;
const frontCache = new Map();
function pitFront(im, band) {
  if (!ready(im)) return null;
  if (!frontCache.has(im)) {
    const c = document.createElement('canvas');
    c.width = im.naturalWidth;
    c.height = im.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    g.globalCompositeOperation = 'destination-in';
    const fade = g.createLinearGradient(0, band[0] * c.height, 0, band[1] * c.height);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = fade;
    g.fillRect(0, 0, c.width, c.height);
    frontCache.set(im, c);
  }
  return frontCache.get(im);
}
let cosmosImg = null; // the v8 painting stays for the hidden cosmos scene until it gets its own plates
let fireUnit = 1;

function drawPlate(key, alpha, litAlpha) {
  const a = SCENE_ART[key];
  if (!a) {
    cosmosImg = cosmosImg || Object.assign(new Image(), { src: './bg-cosmos.jpg' });
    drawSpaceCoverImage(cosmosImg, alpha);
    if (key === state.space) { fireX = W * 0.5; fireY = H * 0.63; fireUnit = 1; }
    return null;
  }
  const o = H > W ? 'port' : 'land';
  const unlit = art(`scenes/${a.scene}-${o}-unlit`);
  const lit = art(`scenes/${a.scene}-${o}-lit`);
  if (!ready(unlit)) return null;
  const s = Math.max(W / unlit.naturalWidth, H / unlit.naturalHeight);
  const dw = unlit.naturalWidth * s, dh = unlit.naturalHeight * s;
  const [ax, ay] = a.anchor[o];
  // keep the fire near the middle and a little low, never past the plate edges
  const dx = Math.min(0, Math.max(W - dw, W * 0.5 - ax * dw));
  const dy = Math.min(0, Math.max(H - dh, H * 0.6 - ay * dh));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(unlit, dx, dy, dw, dh);
  if (ready(lit)) {
    ctx.globalAlpha = alpha * litAlpha;
    ctx.drawImage(lit, dx, dy, dw, dh);
  }
  ctx.restore();
  const p = PIT_ART[a.pit];
  const pu = art(`pit/${a.pit}-unlit`), pl = art(`pit/${a.pit}-lit`);
  if (!ready(pu)) return null;
  const pw = dw * (o === 'land' ? 0.3 : 0.58) * p.width;
  const ph = pw * pu.naturalHeight / pu.naturalWidth;
  const place = { alpha, litAlpha, pu, pl, band: p.front, x: dx + ax * dw - pw / 2, y: dy + ay * dh - ph * p.ground, w: pw, h: ph };
  drawPit(place, false);
  if (key === state.space) {
    fireX = place.x + pw / 2;
    fireY = place.y + ph * p.base;
    fireUnit = Math.max(0.8, Math.min(1.6, pw / 320));
  }
  return place;
}

function drawPit(place, front) {
  if (!place) return;
  const u = front ? pitFront(place.pu, place.band) : place.pu;
  const l = front ? pitFront(place.pl, place.band) : place.pl;
  ctx.save();
  ctx.globalAlpha = place.alpha;
  if (u) ctx.drawImage(u, place.x, place.y, place.w, place.h);
  if (l && ready(place.pl)) {
    ctx.globalAlpha = place.alpha * place.litAlpha;
    ctx.drawImage(l, place.x, place.y, place.w, place.h);
  }
  ctx.restore();
}

let prevSpaceKey = state.space;
let spaceFadeAlpha = 1;

state.globalBurnTotal = Math.max(0, Number(saved.globalBurnTotal) || 0);
state.tempC = Math.max(440, Number(saved.tempC) || 0); // a visit starts at a campfire, never at dying embers
state.fatiguePct = Number(saved.fatiguePct) || 46;
state.idleSeconds = 0;
state.lastInteractMs = Date.now();
state.clickCombo = 0;
state.lastClickMs = 0;
state.forcedLv0Until = 0;

const FIRE_STAGES = [
  { lv: 0, minTemp: 0,    minPct: 0,  scale: 0.24, logs: 2, name: `Lv.0 ${t('stage.0')}`, desc: t('stage.0.desc') },
  { lv: 1, minTemp: 180,  minPct: 16, scale: 0.65, logs: 2, name: `Lv.1 ${t('stage.1')}`, desc: t('stage.1.desc') },
  { lv: 2, minTemp: 350,  minPct: 32, scale: 1.00, logs: 3, name: `Lv.2 ${t('stage.2')}`, desc: t('stage.2.desc') },
  { lv: 3, minTemp: 680,  minPct: 54, scale: 1.40, logs: 5, name: `Lv.3 ${t('stage.3')}`, desc: t('stage.3.desc') },
  { lv: 4, minTemp: 1200, minPct: 76, scale: 1.82, logs: 6, name: `Lv.4 ${t('stage.4')}`, desc: t('stage.4.desc') },
  { lv: 5, minTemp: 2000, minPct: 92, scale: 2.30, logs: 8, name: `Lv.5 ${t('stage.5')}`, desc: t('stage.5.desc') }
];

function syncFatigueFromTemp() {
  if (state.tempC < 180) {
    state.fatiguePct = Math.max(3, Math.min(15, Math.round(((state.tempC - 80) / 100) * 15)));
  } else {
    state.fatiguePct = Math.min(100, Math.max(16, Math.round(16 + ((state.tempC - 180) / 2100) * 84)));
  }
}
syncFatigueFromTemp();

function getFireStage() {
  let stage = FIRE_STAGES[0];
  for (const s of FIRE_STAGES) {
    if (state.tempC >= s.minTemp) stage = s;
  }
  return stage;
}

// Continuous Dynamic Fire Scale: grows on EVERY single click/tap without a low hard cap!
function getDynamicFireScale() {
  const t = Math.max(80, state.tempC);
  let base;
  if (t < 180) {
    base = 0.22 + ((t - 80) / 100) * 0.34;
  } else if (t < 680) {
    base = 0.56 + ((t - 180) / 500) * 0.72;
  } else if (t < 2000) {
    base = 1.28 + ((t - 680) / 1320) * 0.92;
  } else {
    // Above 2000°C: continuous logarithmic expansion so clicking always grows the fire!
    base = 2.20 + Math.log10(1 + (t - 2000) / 900) * 0.85;
  }
  return Math.min(3.55, base + state.stoking * 0.16);
}

function updateFireStageUI() {
  syncFatigueFromTemp();
  const stage = getFireStage();
  const badge = document.getElementById('fire-stage-badge');
  const bar = document.getElementById('fatigue-bar-fill');
  const dyingAlert = document.getElementById('dying-fire-alert');
  if (badge) {
    badge.textContent = stage.lv === 0
      ? `${stage.name} (${Math.round(state.tempC)}°C)`
      : t('stage.badge', { name: stage.name, pct: Math.min(999, Math.round((state.tempC / 2000) * 100)) });
  }
  const barPct = Math.min(100, Math.max(4, ((state.tempC - 80) / 2120) * 100));
  if (bar) bar.style.width = `${barPct.toFixed(1)}%`;
  if (dyingAlert) dyingAlert.classList.toggle('show', stage.lv === 0);
}

function addTemperature(baseDelta = 15, popupX = fireX, popupY = fireY - 40, showPopup = true) {
  const prevLv = getFireStage().lv;
  const now = Date.now();
  state.lastInteractMs = now;
  state.idleSeconds = 0;

  if (showPopup) {
    if (now - state.lastClickMs < 1900) {
      state.clickCombo = Math.min(99, state.clickCombo + 1);
    } else {
      state.clickCombo = 1;
    }
    state.lastClickMs = now;
  }

  // Global co-op diminishing curve: fast early climb, balanced steady climb at thousands of degrees
  const damp = 1 / (1 + Math.max(0, state.tempC - 550) / 1600);
  const comboMult = showPopup ? (1 + Math.min(1.4, (state.clickCombo - 1) * 0.05)) : 1;
  const actualDelta = Math.max(2, Math.round(baseDelta * damp * comboMult));

  state.tempC = +(state.tempC + actualDelta).toFixed(1);
  rollDay();
  state.maxTempToday = Math.max(state.maxTempToday, Math.round(state.tempC));
  syncFatigueFromTemp();

  const nextStage = getFireStage();
  if (nextStage.lv > prevLv && prevLv > 0) {
    showOracle(nextStage.desc, t('stage.upTag', { name: nextStage.name }));
  } else if (prevLv === 0 && nextStage.lv >= 1) {
    showOracle(t('stage.revive'), t('stage.reviveTag'));
  }

  if (showPopup) {
    risingClickPopups.push({
      text: state.clickCombo >= 3 ? `+${actualDelta}°C ×${state.clickCombo}` : `+${actualDelta}°C`,
      x: popupX + (Math.random() - 0.5) * 34,
      y: popupY + (Math.random() - 0.5) * 14,
      vy: -1.55 - Math.min(1.0, state.clickCombo * 0.04),
      scale: Math.min(1.45, 1 + state.clickCombo * 0.025),
      life: 0,
      maxLife: 54
    });

    const comboEl = document.getElementById('combo-pill');
    if (comboEl) {
      if (state.clickCombo >= 2) {
        comboEl.textContent = `×${state.clickCombo}`;
        comboEl.classList.add('show');
      } else {
        comboEl.classList.remove('show');
      }
    }
  }

  const heatEl = document.getElementById('stat-heat');
  if (heatEl) {
    heatEl.classList.add('bump');
    setTimeout(() => heatEl.classList.remove('bump'), 150);
  }

  updateFireStageUI();
  updateStatsUI();
}

function updateGlobalBurnUI() {
  const el = document.getElementById('global-burn-total');
  if (!el) return;
  el.textContent = state.globalBurnTotal.toLocaleString(LOCALE);
}

function bumpGlobalBurnCounter(amount = 1, fatigueDelta = 2.5) {
  state.globalBurnTotal = Math.max(0, state.globalBurnTotal + amount);
  saveState();
  if (Date.now() > state.forcedLv0Until && fatigueDelta > 0) {
    addTemperature(fatigueDelta * 9, fireX, fireY - 50, false);
  } else {
    updateFireStageUI();
  }

  const el = document.getElementById('global-burn-total');
  if (!el) return;
  el.textContent = state.globalBurnTotal.toLocaleString(LOCALE);
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 220);
}
updateGlobalBurnUI();

for (let i = 0; i < 95; i++) {
  raindrops.push({
    x: Math.random() * W,
    y: Math.random() * H,
    len: 14 + Math.random() * 18,
    speed: 9 + Math.random() * 6
  });
}

for (let i = 0; i < 110; i++) {
  snowflakes.push({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1.1 + Math.random() * 2.8,
    vy: 0.7 + Math.random() * 1.4,
    vx: (Math.random() - 0.5) * 0.5,
    phase: Math.random() * Math.PI * 2
  });
}

for (let i = 0; i < 120; i++) {
  stars.push({
    rx: Math.random(),
    ry: Math.random() * 0.68,
    size: 0.7 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2
  });
}

for (let i = 0; i < 10; i++) {
  const angle = (Math.PI * 0.08) + (i / 9) * (Math.PI * 0.84);
  const rx = 148 + (i % 3) * 26;
  const ry = 54 + (i % 2) * 22;
  fireflies.push({
    angle,
    rx,
    ry,
    phase: Math.random() * Math.PI * 2,
    size: 2.8 + Math.random() * 2.2
  });
}

function spawnFlameParticle(boost = 1) {
  const fScale = getDynamicFireScale();
  const spread = (34 + state.stoking * 16) * Math.pow(fScale, 0.82);
  flames.push({
    x: fireX + (Math.random() - 0.5) * spread,
    y: fireY - 4 + (Math.random() - 0.5) * 10,
    vx: (Math.random() - 0.5) * 0.65 * fScale,
    vy: -(1.6 + Math.random() * 2.3) * (0.85 + state.stoking * 0.28) * Math.pow(fScale, 0.88) * boost,
    radius: (18 + Math.random() * 21) * (0.88 + state.stoking * 0.22) * Math.pow(fScale, 0.85),
    life: 0,
    maxLife: (32 + Math.random() * 24) * Math.pow(fScale, 0.35),
    seed: Math.random() * 100
  });
}

function spawnSpark(x = fireX, y = fireY - 12, burst = false) {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (burst ? 1.55 : 0.85);
  const speed = (burst ? 2.4 : 1.1) + Math.random() * (burst ? 4.2 : 2.2);
  sparks.push({
    x: x + (Math.random() - 0.5) * 28,
    y: y + (Math.random() - 0.5) * 12,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 1.2 + Math.random() * 2.4,
    life: 0,
    maxLife: 45 + Math.random() * 65,
    wobble: Math.random() * Math.PI * 2
  });
}

function spawnSmoke(x = fireX, y = fireY - 75) {
  smokes.push({
    x: x + (Math.random() - 0.5) * 20,
    y,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -(0.55 + Math.random() * 0.65),
    radius: 14 + Math.random() * 14,
    life: 0,
    maxLife: 90 + Math.random() * 50
  });
}

// Remote ntfy events are attacker-controlled: escape before any innerHTML.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeImg = s => (typeof s === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s) ? s : '');

// ── Rankings and suggestion chips (one pool from all four topics) ───────────
const ALL_RANKINGS = Object.values(ROOMS).flatMap(r => r.rankings);
const ALL_CHIPS = Object.values(ROOMS).flatMap(r => r.chips);
const ALL_ORACLES = Object.values(ROOMS).flatMap(r => r.oracles);

function renderRoomUI() {
  const ranked = [...ALL_RANKINGS].sort((a, b) => b.count - a.count);
  const top = ranked[0];
  const drawerOpen = document.getElementById('rank-drawer').classList.contains('open');
  document.getElementById('top-rank-word').textContent = top && top.count > 0 ? top.word : t('rank.empty');
  document.getElementById('top-rank-count').textContent = `${t('rank.count', { n: (top ? top.count : 0).toLocaleString(LOCALE) })} ${drawerOpen ? '▴' : '▾'}`;

  const listEl = document.getElementById('rank-list');
  listEl.innerHTML = ranked.slice(0, 5).map((item, idx) => `
    <div class="rank-item" data-rank-word="${esc(item.word)}">
      <span class="rank-no">${t('rank.no', { n: idx + 1 })}</span>
      <span class="rank-item-word">${esc(item.word)}</span>
      <span class="rank-item-fires">${t('rank.count', { n: (Number(item.count) || 0).toLocaleString(LOCALE) })}</span>
      <span class="rank-item-burn-btn">${t('rank.burn')}</span>
    </div>
  `).join('');

  listEl.querySelectorAll('.rank-item').forEach(row => {
    row.addEventListener('click', () => {
      document.getElementById('world-drawer').classList.remove('open');
      burnWorry(row.getAttribute('data-rank-word'));
    });
  });
}

// Six suggestions from the whole pool plus three secret-word samples, reshuffled each time the sheet opens.
function renderChips() {
  const pick = [...ALL_CHIPS].sort(() => Math.random() - 0.5).slice(0, 6);
  const secrets = ['egg_matrix', 'egg_bull', 'egg_fireworks', 'egg_lightning', 'egg_sakura']
    .sort(() => Math.random() - 0.5).slice(0, 3)
    .map(id => EASTER_EGG_DEX.find(e => e.id === id));
  const chipsEl = document.getElementById('hanji-chips');
  chipsEl.innerHTML =
    pick.map(c => `<button type="button" class="hanji-chip" data-chip="${esc(c)}">${esc(c)}</button>`).join('') +
    secrets.map(e => `<button type="button" class="hanji-chip" style="border-color:#b84318;background:rgba(184,67,24,0.12);color:#7c240c;" data-chip="${esc(e.sampleTrigger)}">${esc(e.title)}</button>`).join('');
  chipsEl.querySelectorAll('.hanji-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('burn-input');
      input.value = chip.getAttribute('data-chip');
      input.focus();
    });
  });
}

document.getElementById('btn-rank-toggle').addEventListener('click', () => {
  const drawer = document.getElementById('rank-drawer');
  const open = drawer.classList.toggle('open');
  document.getElementById('btn-rank-toggle').setAttribute('aria-expanded', String(open));
  renderRoomUI();
});

// ── 20 Secret Easter Egg Encyclopedia (Common -> Rare -> Epic -> Mythic 0.01%) & Auto-Capture Hall of Fame ──
const EASTER_EGG_DEX = [
  // [Tier 1: Common (일반 · 5종)]
  {
    id: 'egg_matrix',
    tier: 'common',
    palette: 1,
    match: t => /rm\s*-rf|버그|배포|\b404\b|\bgit\b|\bnull\b|\bsudo\b|코드|야근|컴파일|세그폴트/.test(t)
  },
  {
    id: 'egg_bull',
    tier: 'common',
    palette: 0,
    match: t => /상한가|떡상|비트코인|양전|투더문|\bmoon\b|대박|급등|10배/.test(t)
  },
  {
    id: 'egg_fireworks',
    tier: 'common',
    palette: 3,
    match: t => /퇴사|사직서|로또|자유|해방|합격|축포|독립/.test(t)
  },
  {
    id: 'egg_lightning',
    tier: 'common',
    palette: 2,
    match: t => /번개|벼락|천벌|단죄|악연|손절|복수|karma/.test(t)
  },
  {
    id: 'egg_sakura',
    tier: 'common',
    palette: 2,
    match: t => /벚꽃|사랑|행복|봄|꽃잎|꽃길|힐링|sakura/.test(t)
  },

  // [Tier 2: Rare (희귀 · 5종)]
  {
    id: 'egg_konami',
    tier: 'rare',
    palette: 6,
    match: t => /상상하하좌우좌우|uuddlrlrba|konami|코나미|⬆️⬆️⬇️⬇️/.test(t.replace(/\s+/g, ''))
  },
  {
    id: 'egg_blackhole',
    tier: 'rare',
    palette: 4,
    match: t => /블랙홀|사건의\s*지평선|인터스텔라|특이점|black\s*hole|singularity/.test(t)
  },
  {
    id: 'egg_satoshi',
    tier: 'rare',
    palette: 3,
    match: t => /사토시|나카모토|satoshi|제네시스\s*블록|0x00/.test(t)
  },
  {
    id: 'egg_sword',
    tier: 'rare',
    palette: 5,
    match: t => /\+99|집행검|강화\s*성공|신화\s*강화/.test(t)
  },
  {
    id: 'egg_dragon',
    tier: 'rare',
    palette: 1,
    match: t => /청룡|여의주|승천|드래곤|흑염룡|dragon/.test(t)
  },

  // [Tier 3: Epic (극악 난이도 암호 수수께끼 · 5종)]
  {
    id: 'egg_pi',
    tier: 'epic',
    palette: 6,
    match: t => t.includes('3.1415926535')
  },
  {
    id: 'egg_42',
    tier: 'epic',
    palette: 7,
    match: t => t.trim() === '42' || /삶우주그리고모든것|히치하이커/.test(t.replace(/\s+/g, ''))
  },
  {
    id: 'egg_helloworld',
    tier: 'epic',
    palette: 1,
    match: t => t.trim() === 'hello, world!'
  },
  {
    id: 'egg_binary',
    tier: 'epic',
    palette: 1,
    match: t => /01100110/.test(t)
  },
  {
    id: 'egg_morse',
    tier: 'epic',
    palette: 5,
    match: t => /\.\.\.\s*---\s*\.\.\.|···\s*−−−\s*···/.test(t.trim())
  },

  // [Tier 4: Mythic 0.01% ("존나 어려운" 복합 조건 신화급 시크릿 · 5종)]
  {
    id: 'egg_prometheus',
    tier: 'mythic',
    palette: 5,
    checkCondition: () => getFireStage().lv >= 4,
    failMsg: true,
    match: t => /프로메테우스|prometheus/.test(t)
  },
  {
    id: 'egg_schrodinger',
    tier: 'mythic',
    palette: 6,
    checkCondition: () => state.space === 'cosmos',
    failMsg: true,
    match: (t, raw) => raw.trim() === 'E=mc^2' || /슈뢰딩거의\s*고양이|schrodinger/.test(t)
  },
  {
    id: 'egg_nirvana',
    tier: 'mythic',
    palette: 3,
    checkCondition: () => state.space === 'temple',
    failMsg: true,
    match: t => /색즉시공\s*공즉시색|옴마니반메훔/.test(t)
  },
  {
    id: 'egg_phoenix',
    tier: 'mythic',
    palette: 5,
    checkCondition: () => getFireStage().lv === 0,
    failMsg: true,
    match: t => /불사조|피닉스|phoenix/.test(t)
  },
  {
    id: 'egg_creator',
    tier: 'mythic',
    palette: 7,
    match: t => /시루아빠|siruabba/.test(t)
  }
];

// Display text and extra trigger words per language; the regexes above stay as the Korean/English base.
for (const egg of EASTER_EGG_DEX) {
  egg.tierLabel = t(egg.id === 'egg_creator' ? 'tier.creator' : `tier.${egg.tier}`);
  egg.title = t(`egg.${egg.id}.title`);
  egg.codeHint = t(`egg.${egg.id}.codeHint`);
  egg.sampleTrigger = t(`egg.${egg.id}.sampleTrigger`);
  if (egg.failMsg) egg.failMsg = t(`egg.${egg.id}.failMsg`);
  egg.aliases = tl(`egg.${egg.id}.alias`).map(a => a.toLowerCase());
}

const spellEffects = {
  matrixTimer: 0,
  matrixDrops: [],
  bullCandles: [],
  skyFireworks: [],
  lightningBolts: [],
  lightningFlash: 0,
  sakuraPetals: [],
  cosmicRings: [],
  floatingRunes: [],
  activeMythicBanner: null
};

function detectSecretSpell(rawText) {
  const clean = (rawText || '').trim();
  const lower = clean.toLowerCase();
  // Check Mythic -> Epic -> Rare -> Common in order so harder spells take priority
  const ordered = [
    ...EASTER_EGG_DEX.filter(e => e.tier === 'mythic'),
    ...EASTER_EGG_DEX.filter(e => e.tier === 'epic'),
    ...EASTER_EGG_DEX.filter(e => e.tier === 'rare'),
    ...EASTER_EGG_DEX.filter(e => e.tier === 'common')
  ];
  for (const egg of ordered) {
    if (egg.match(lower, clean) || egg.aliases.some(a => lower.includes(a))) {
      return egg;
    }
  }
  return null;
}

function triggerSecretSpell(egg, rawText) {
  if (!egg) return;

  // Check if a Mythic egg has a special environmental condition!
  if (egg.checkCondition && !egg.checkCondition()) {
    spellEffects.lightningFlash = 0.45;
    showOracle(egg.failMsg, t('egg.lockedTag', { title: egg.title }));
    return;
  }

  state.paletteIndex = egg.palette ?? 3;
  if (egg.id === 'egg_blackhole' && !state.cosmosOpen) {
    state.cosmosOpen = true;
    saveState();
    renderSpaceUI();
  }
  stokeFire(egg.tier === 'mythic' ? 140 : egg.tier === 'epic' ? 95 : 65);

  if (egg.id === 'egg_phoenix') {
    // Phoenix rebirth instantly surges fire from Lv.0 to Lv.5!
    state.forcedLv0Until = 0;
    state.tempC = 2850;
    state.fatiguePct = 99;
    state.heat = 77.7;
    updateFireStageUI();
    updateStatsUI();
  } else {
    addTemperature(egg.tier === 'mythic' ? 320 : egg.tier === 'epic' ? 180 : 95, fireX, fireY - 56, true);
  }

  // Spawn visual effects based on egg id & tier
  if (egg.id === 'egg_matrix' || egg.id === 'egg_helloworld' || egg.id === 'egg_binary') {
    spellEffects.matrixTimer = 420;
    const tokens = egg.id === 'egg_helloworld'
      ? ['hello, world!', '#include <stdio.h>', 'main()', 'printf()', 'return 0;', 'KERNEL_GENESIS']
      : egg.id === 'egg_binary'
      ? ['01100110', '01101001', '01110010', '01100101', 'SINGULARITY', '101010']
      : ['0101', 'rm -rf', '404', 'NULL', '0x00', 'git push -f', 'SEGFAULT', 'FREE()', '{}', 'sudo'];
    for (let i = 0; i < 56; i++) {
      spellEffects.matrixDrops.push({
        x: Math.random() * W,
        y: -Math.random() * H * 0.8,
        vy: 3.2 + Math.random() * 4.5,
        token: tokens[i % tokens.length],
        life: 0,
        maxLife: 200 + Math.random() * 90
      });
    }
  }

  if (egg.id === 'egg_bull' || egg.id === 'egg_satoshi') {
    const labels = egg.id === 'egg_satoshi'
      ? ['₿ GENESIS 2009', '0x00000000', 'SATOSHI', '+10,000%']
      : ['+30%', '🚀 TO THE MOON', '₿ +100%'];
    for (let i = 0; i < 14; i++) {
      spellEffects.bullCandles.push({
        x: fireX + (Math.random() - 0.5) * (W * 0.72),
        y: fireY + 10 + Math.random() * 40,
        vy: -(2.9 + Math.random() * 3.6),
        h: 30 + Math.random() * 36,
        label: labels[i % labels.length],
        life: 0,
        maxLife: 110 + Math.random() * 35
      });
    }
  }

  if (egg.id === 'egg_fireworks' || egg.id === 'egg_konami' || egg.tier === 'mythic') {
    const colors = ['255, 215, 80', '255, 95, 185', '70, 240, 255', '170, 110, 255', '110, 255, 150'];
    const bursts = egg.tier === 'mythic' ? 5 : 4;
    for (let b = 0; b < bursts; b++) {
      const cx = W * (0.18 + (b / Math.max(1, bursts - 1)) * 0.64);
      const cy = H * (0.18 + (b % 3) * 0.08);
      const col = colors[b % colors.length];
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2;
        const spd = 1.8 + Math.random() * 3.6;
        spellEffects.skyFireworks.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          col,
          life: 0,
          maxLife: 80 + Math.random() * 30
        });
      }
    }
  }

  if (egg.id === 'egg_lightning' || egg.id === 'egg_sword' || egg.id === 'egg_prometheus' || egg.id === 'egg_creator') {
    spellEffects.lightningFlash = 1.0;
    const bolts = egg.tier === 'mythic' ? 6 : 3;
    for (let b = 0; b < bolts; b++) {
      const pts = [];
      let lx = fireX + (b - (bolts - 1) / 2) * 44;
      let ly = 0;
      pts.push({ x: lx, y: ly });
      while (ly < fireY) {
        ly += 24 + Math.random() * 24;
        lx += (Math.random() - 0.5) * 52;
        pts.push({ x: lx, y: Math.min(fireY, ly) });
      }
      spellEffects.lightningBolts.push({ pts, life: 0, maxLife: 52 });
    }
  }

  if (egg.id === 'egg_sakura' || egg.id === 'egg_nirvana') {
    for (let i = 0; i < 75; i++) {
      spellEffects.sakuraPetals.push({
        x: fireX + (Math.random() - 0.5) * 180,
        y: fireY - Math.random() * 50,
        vx: (Math.random() - 0.3) * 1.9,
        vy: -(1.3 + Math.random() * 2.5),
        rot: Math.random() * Math.PI * 2,
        size: 4.5 + Math.random() * 5,
        life: 0,
        maxLife: 165 + Math.random() * 60
      });
    }
  }

  // Spawn expanding cosmic / mythic shockwave rings & floating mystic runes for Rare/Epic/Mythic eggs
  const ringColor = egg.tier === 'mythic' ? '255, 218, 95' : egg.tier === 'epic' ? '255, 105, 180' : '90, 230, 255';
  for (let r = 0; r < (egg.tier === 'mythic' ? 5 : 3); r++) {
    spellEffects.cosmicRings.push({
      x: fireX,
      y: fireY - 24,
      rad: 12 + r * 22,
      maxRad: Math.min(W, H) * (0.42 + r * 0.12),
      col: ringColor,
      life: 0,
      maxLife: 95 + r * 18
    });
  }

  const runePool = {
    egg_konami: ['⬆️', '⬇️', '⬅️', '➡️', '🅱️', '🅰️', '30 LIVES', '1UP'],
    egg_blackhole: ['🕳️', 'EVENT HORIZON', 'SINGULARITY', 'G-FORCE', '∞'],
    egg_satoshi: ['₿', 'SHA-256', 'GENESIS', '21,000,000', 'BLOCK #0'],
    egg_sword: ['⚔️ +99', 'MYTHIC', 'LEGEND', 'CRITICAL!', '✨'],
    egg_dragon: ['🐉', '🔮', 'AZURE DRAGON', 'ASCEND', '🌊'],
    egg_pi: ['π', '3.1415926535', '∞', '2πr', 'COSMIC PI'],
    egg_42: ['42', 'DEEP THOUGHT', 'DON\'T PANIC', 'GALAXY', '🌌'],
    egg_helloworld: ['hello, world!', 'C89', '0x00', 'root@bulmeong', '💻'],
    egg_binary: ['01100110', '01101001', '01110010', '01100101', 'AI AWAKE'],
    egg_morse: ['··· −−− ···', 'SOS', 'MAYDAY', 'RESCUE', '🚢'],
    egg_prometheus: ['☀️ PROMETHEUS', 'OLYMPIA FIRE', 'TITAN FLAME', 'FIRST FIRE'],
    egg_schrodinger: ['|ψ⟩ = α|0⟩ + β|1⟩', 'E=mc²', '🐈‍⬛ QUANTUM', 'SUPERPOSITION'],
    egg_nirvana: ['🪷 色即是空', '空即是色', '涅槃', 'MANDALA', '🙏'],
    egg_phoenix: ['🦅 PHOENIX', 'IMMORTAL REBIRTH', 'REBIRTH', '🔥 Lv.MAX'],
    egg_creator: ['👑 SIRUABBA', '👨‍👧', 'CREATOR SUPERNOVA', 'ABSOLUTE FLAME', '✨']
  }[egg.id] || ['✨', egg.title];

  for (let i = 0; i < 16; i++) {
    const ang = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
    const spd = 1.4 + Math.random() * 2.6;
    spellEffects.floatingRunes.push({
      x: fireX + (Math.random() - 0.5) * 90,
      y: fireY - 20 - Math.random() * 30,
      vx: Math.cos(ang) * spd * 0.7,
      vy: -1.6 - Math.random() * 2.2,
      text: runePool[i % runePool.length],
      col: ringColor,
      life: 0,
      maxLife: 135 + Math.random() * 45
    });
  }

  spellEffects.activeMythicBanner = {
    title: egg.title,
    tierLabel: egg.tierLabel,
    discoverer: state.discovererName || t('common.anon'),
    life: 0,
    maxLife: 210
  };

  showOracle(t('egg.found', { title: egg.title }), t('egg.foundTag', { title: egg.title }));

  // Auto-capture snapshot at peak visual glory (600ms after trigger)!
  setTimeout(() => {
    captureAndImmortalizeEgg(egg, rawText);
  }, 600);
}

// Listen for real Keyboard Konami Code (ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, B, A)
const KONAMI_SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIdx = 0;
window.addEventListener('keydown', e => {
  if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === KONAMI_SEQ[konamiIdx]) {
    konamiIdx += 1;
    if (konamiIdx === KONAMI_SEQ.length) {
      konamiIdx = 0;
      const konamiEgg = EASTER_EGG_DEX.find(x => x.id === 'egg_konami');
      triggerSecretSpell(konamiEgg, '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA');
    }
  } else {
    konamiIdx = key === KONAMI_SEQ[0] ? 1 : 0;
  }
});

// ── Automatic Flame Snapshot & First-Discoverer Hall of Fame Enshrinement ────
let toastHideTimer = null;

function captureAndImmortalizeEgg(egg, triggerText = '') {
  // 1. Camera Shutter Flash Effect
  const flashEl = document.getElementById('camera-flash');
  if (flashEl) {
    flashEl.classList.add('flash');
    setTimeout(() => flashEl.classList.remove('flash'), 90);
  }
  audio.playWindChime();

  // 2. Render Commemorative Polaroid Frame from Live #stage Canvas
  const snapCanvas = document.createElement('canvas');
  const Sw = 640, Sh = 400;
  snapCanvas.width = Sw;
  snapCanvas.height = Sh;
  const sg = snapCanvas.getContext('2d');

  // Crop center region around the campfire from the live WebGL/2D stage canvas
  const srcW = Math.min(canvas.width, canvas.height * 1.45);
  const srcH = srcW * (Sh / Sw);
  const sx = Math.max(0, (canvas.width - srcW) * 0.5);
  const sy = Math.max(0, (fireY * DPR) - srcH * 0.62);
  sg.drawImage(canvas, sx, sy, srcW, srcH, 0, 0, Sw, Sh);

  // Dark gradient vignette at top & bottom for crisp badge typography
  const topGrad = sg.createLinearGradient(0, 0, 0, 95);
  topGrad.addColorStop(0, 'rgba(6, 5, 12, 0.86)');
  topGrad.addColorStop(1, 'rgba(6, 5, 12, 0)');
  sg.fillStyle = topGrad;
  sg.fillRect(0, 0, Sw, 95);

  const botGrad = sg.createLinearGradient(0, Sh - 115, 0, Sh);
  botGrad.addColorStop(0, 'rgba(6, 5, 12, 0)');
  botGrad.addColorStop(1, 'rgba(6, 5, 12, 0.92)');
  sg.fillStyle = botGrad;
  sg.fillRect(0, Sh - 115, Sw, 115);

  // Frame border by Tier
  const borderCol = egg.tier === 'mythic' ? '#ffd768' : egg.tier === 'epic' ? '#ff7eb6' : egg.tier === 'rare' ? '#c58aff' : '#7ac4ff';
  sg.strokeStyle = borderCol;
  sg.lineWidth = 5;
  sg.strokeRect(6, 6, Sw - 12, Sh - 12);

  // Existing record preserves the VERY FIRST discoverer!
  const existing = state.eggAlbum[egg.id];
  const nowStr = new Date().toISOString();
  const firstDiscoverer = existing?.firstDiscoverer || state.discovererName || t('common.anon');
  const firstTime = existing?.firstTime || nowStr;
  const count = (existing?.count || 0) + 1;

  // Top Header on Polaroid
  sg.fillStyle = borderCol;
  sg.font = '800 15px Pretendard, sans-serif';
  sg.fillText(t('polaroid.head', { tier: egg.tierLabel }), 24, 36);

  sg.fillStyle = '#ffffff';
  sg.font = '800 26px Pretendard, sans-serif';
  sg.fillText(egg.title, 24, 70);

  // Bottom First-Discoverer Plaque on Polaroid
  sg.fillStyle = '#ffd97d';
  sg.font = '800 18px Pretendard, sans-serif';
  sg.fillText(`👑 ${t('polaroid.first', { name: firstDiscoverer })}`, 24, Sh - 48);

  sg.fillStyle = 'rgba(255, 240, 215, 0.78)';
  sg.font = '600 13.5px Pretendard, sans-serif';
  sg.fillText(t('polaroid.meta', { time: showTime(firstTime), text: (triggerText || egg.sampleTrigger).slice(0, 20) }), 24, Sh - 22);

      // Non-blocking async JPEG encoding (prevents 80ms synchronous CPU frame hitch on toDataURL!)
      snapCanvas.toBlob(blob => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          const existing = state.eggAlbum[egg.id];
          const firstDiscoverer = existing?.firstDiscoverer || state.discovererName || t('common.anon');
          const firstTime = existing?.firstTime || nowStr;
          const count = (existing?.count || 0) + 1;

          state.eggAlbum[egg.id] = {
            id: egg.id,
            firstDiscoverer,
            firstTime,
            lastImage: dataUrl,
            imageKey: existing?.imageKey || '',
            triggerText: (triggerText || egg.sampleTrigger).slice(0, 24),
            count
          };
          saveState();
          updateAlbumBadgeUI();
          if (document.getElementById('modal-album')?.classList.contains('open')) {
            renderAlbumModal();
          }

          if (typeof window.__broadcastEggUnlock === 'function') {
            window.__broadcastEggUnlock(egg, state.eggAlbum[egg.id]);
          }

          const toast = document.getElementById('capture-toast');
          const toastImg = document.getElementById('capture-toast-img');
          const toastTag = document.getElementById('capture-toast-tag');
          const toastTitle = document.getElementById('capture-toast-title');
          const toastSub = document.getElementById('capture-toast-sub');
          if (toast && toastImg) {
            toastImg.src = dataUrl;
            toastTag.textContent = count === 1 ? `📸 ${t('toast.first')}` : `📸 ${t('toast.again', { n: count })}`;
            toastTitle.textContent = egg.title;
            toastSub.textContent = t('toast.sub', { name: firstDiscoverer });
            toast.classList.add('show');
            clearTimeout(toastHideTimer);
            toastHideTimer = setTimeout(() => toast.classList.remove('show'), 6500);
          }
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.82);
}

function updateAlbumBadgeUI() {
  const unlockedCount = Object.keys(state.eggAlbum || {}).length;
  const total = EASTER_EGG_DEX.length;
  const badge = document.getElementById('album-count-badge');
  if (badge) badge.textContent = `${unlockedCount}/${total}`;
}
let oracleTimer = null;
function showOracle(text, tag = t('oracle.tag')) {
  const box = document.getElementById('ash-oracle');
  document.getElementById('oracle-tag').textContent = tag;
  document.getElementById('oracle-text').textContent = `“${text}”`;
  box.classList.add('show');
  clearTimeout(oracleTimer);
  oracleTimer = setTimeout(() => box.classList.remove('show'), 5200);
}

// Only preset words are ranked and shared; whatever people type stays on their device.
function findRanking(text) {
  const clean = (text || '').trim();
  return clean ? ALL_RANKINGS.find(item => clean === item.word || clean.includes(item.word)) || null : null;
}

function incrementRanking(item) {
  if (!item) return;
  item.count += 1;
  renderRoomUI();
}

const showTime = v => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v || '') : d.toLocaleString(LOCALE, { dateStyle: 'medium', timeStyle: 'short' });
};

function burnWorry(rawText, startX = W * 0.5, startY = H * 0.78, itemType = 'scroll', fromRemote = false) {
  const text = (rawText || '').trim() || ALL_RANKINGS[0].word;
  state.lastBurnedText = text;
  const isGold = !!state.goldMode;
  const oracle = isGold ? t('gold.oracle') : ALL_ORACLES[(state.burnedCount + text.length) % ALL_ORACLES.length];
  state.lastOracle = oracle;
  const ranked = findRanking(text);
  incrementRanking(ranked);

  const burnId = 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  if (!fromRemote) {
    bumpGlobalBurnCounter(1, 5.5);
  }

  activeNote = {
    burnId,
    text,
    oracle,
    isGold,
    itemType,
    stamp: isGold ? t('sheet.goldStamp') : t('sheet.stamp'),
    startX,
    startY,
    x: startX,
    y: startY,
    progress: 0,
    rotation: (Math.random() - 0.5) * 0.24
  };
  audio.playWhooshAndBowl();
  if (!fromRemote && typeof window.__broadcastBurnEvent === 'function') {
    window.__broadcastBurnEvent({
      burnId,
      totalAfter: state.globalBurnTotal,
      nick: state.discovererName || '',
      rk: ranked ? ranked.rk : '',
      itemType
    });
  }
  if (isGold) {
    state.paletteIndex = 3; // Golden temple lantern flame
    stokeFire(95);
    document.getElementById('live-ticker').textContent = t('ticker.burnedGold');
  } else {
    document.getElementById('live-ticker').textContent = t('ticker.burned', { text: text.slice(0, 18) });
  }
}

function stokeFire(burstCount = 24) {
  state.stoking = Math.min(1.4, state.stoking + 0.45);
  state.heat = Math.min(48.0, +(state.heat + 0.8).toFixed(1));
  const capped = Math.min(36, burstCount);
  for (let i = 0; i < capped && sparks.length < 180; i++) spawnSpark(fireX, fireY - 14, true);
  for (let i = 0; i < 4 && flames.length < 110; i++) spawnFlameParticle(1.25);
  audio.triggerCrackle();
  updateStatsUI();
}

// ── Tactile Hanji Sheet & Swipe-to-Burn Gesture ──────────────────────────────
const hanjiOverlay = document.getElementById('hanji-overlay');
const hanjiSheet = document.getElementById('hanji-sheet');
const burnInput = document.getElementById('burn-input');

function openHanjiSheet() {
  renderChips();
  if (!state.audioEnabled) toggleAudio(true);
  hanjiSheet.style.transform = '';
  hanjiSheet.style.opacity = '1';
  hanjiOverlay.classList.add('open');
  setTimeout(() => burnInput.focus(), 80);
}

function closeHanjiSheet() {
  hanjiOverlay.classList.remove('open');
  hanjiSheet.style.transform = '';
  hanjiSheet.style.opacity = '1';
  burnInput.blur();
}

function submitHanjiBurn(launchX = W * 0.5, launchY = H * 0.72) {
  const val = burnInput.value;
  burnInput.value = '';
  closeHanjiSheet();
  burnWorry(val, launchX, launchY);
}

document.getElementById('btn-open-hanji').addEventListener('click', openHanjiSheet);
document.getElementById('btn-close-hanji').addEventListener('click', closeHanjiSheet);
document.getElementById('burn-btn').addEventListener('click', () => submitHanjiBurn());

// Drag / Flick upward on Hanji sheet to throw it into the fire!
let dragStartY = null, dragStartX = null, currentDY = 0, currentDX = 0;
hanjiSheet.addEventListener('pointerdown', e => {
  if (e.target.closest('button, .hanji-chip')) return;
  dragStartY = e.clientY;
  dragStartX = e.clientX;
  currentDY = 0;
  currentDX = 0;
  hanjiSheet.classList.add('dragging');
});

window.addEventListener('pointermove', e => {
  if (dragStartY === null) return;
  currentDY = Math.min(40, e.clientY - dragStartY);
  currentDX = (e.clientX - dragStartX) * 0.35;
  if (currentDY < -8) {
    const scale = Math.max(0.75, 1 + currentDY / 520);
    hanjiSheet.style.transform = `translate(${currentDX}px, ${currentDY}px) scale(${scale}) rotate(${currentDX * 0.08}deg)`;
  }
});

window.addEventListener('pointerup', e => {
  if (dragStartY === null) return;
  hanjiSheet.classList.remove('dragging');
  if (currentDY < -65) {
    // Flicked upward into the fire!
    const rect = hanjiSheet.getBoundingClientRect();
    submitHanjiBurn(rect.left + rect.width / 2, rect.top + rect.height / 2);
  } else {
    hanjiSheet.style.transform = '';
  }
  dragStartY = null;
});

// ── Render Loop ──────────────────────────────────────────────────────────────
let tick = 0;

function drawTempleEave(pal) {
  ctx.save();
  // Curved Hanok / Buddhist Temple Roof Eave on middle-right sky
  const eaveTipX = W * 0.67;
  const eaveTipY = H * 0.345;

  ctx.fillStyle = '#07080d';
  ctx.beginPath();
  ctx.moveTo(W, H * 0.22);
  ctx.quadraticCurveTo(W * 0.84, H * 0.31, eaveTipX, eaveTipY);
  ctx.lineTo(eaveTipX + 18, eaveTipY + 15);
  ctx.quadraticCurveTo(W * 0.86, H * 0.345, W, H * 0.30);
  ctx.closePath();
  ctx.fill();

  // Warm firelight rim on underside of temple eave & rafters (서까래)
  ctx.strokeStyle = `rgba(${pal.glow}, 0.42)`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(eaveTipX, eaveTipY);
  ctx.quadraticCurveTo(W * 0.84, H * 0.31, W, H * 0.22);
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const rx = eaveTipX + 26 + i * 28;
    const ry = eaveTipY + 10 - i * 4;
    ctx.fillStyle = `rgba(${pal.glow}, 0.26)`;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 7, 4, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hanging Brass Wind Chime (산사 풍경 & 물고기)
  const sway = Math.sin(tick * 0.032) * 0.14;
  const chimeX = eaveTipX + 14;
  const chimeY = eaveTipY + 12;
  ctx.translate(chimeX, chimeY);
  ctx.rotate(sway);

  // String
  ctx.strokeStyle = 'rgba(255, 220, 165, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 26);
  ctx.stroke();

  // Bell body
  const bellGrad = ctx.createLinearGradient(-10, 26, 10, 46);
  bellGrad.addColorStop(0, '#ffd98a');
  bellGrad.addColorStop(1, '#9c6523');
  ctx.fillStyle = bellGrad;
  ctx.beginPath();
  ctx.moveTo(-7, 26);
  ctx.lineTo(7, 26);
  ctx.lineTo(11, 44);
  ctx.lineTo(-11, 44);
  ctx.closePath();
  ctx.fill();

  // Lower string + fish silhouette (물고기 풍경)
  ctx.beginPath();
  ctx.moveTo(0, 44);
  ctx.lineTo(0, 66);
  ctx.stroke();

  ctx.save();
  ctx.translate(0, 68);
  ctx.rotate(sway * 0.9);
  ctx.fillStyle = '#ffcf78';
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.quadraticCurveTo(-2, -6, 9, 0);
  ctx.lineTo(16, -5);
  ctx.lineTo(14, 0);
  ctx.lineTo(16, 5);
  ctx.lineTo(9, 0);
  ctx.quadraticCurveTo(-2, 6, -13, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawGiftLog(log) {
  ctx.save();
  ctx.translate(log.x, log.y);
  ctx.rotate(log.rot);

  const lg = ctx.createLinearGradient(-86, -14, 86, 14);
  lg.addColorStop(0, '#5a351c');
  lg.addColorStop(0.5, '#7c4b27');
  lg.addColorStop(1, '#3d2211');
  ctx.fillStyle = lg;
  ctx.strokeStyle = '#ffbe6b';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-86, -14, 172, 28, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff7e8';
  ctx.font = '700 11.5px Pretendard, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const msg = log.text.length > 14 ? log.text.slice(0, 14) + '…' : log.text;
  ctx.fillText(`🪵 ${msg}`, 0, 0);
  ctx.restore();
}

function drawSpaceCoverImage(img, alpha = 1) {
  if (!img || !img.complete || img.naturalWidth <= 0 || alpha <= 0.005) return false;
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const viewRatio = W / H;
  let dw = W, dh = H, dx = 0, dy = 0;
  if (viewRatio > imgRatio) {
    dh = W / imgRatio;
    dy = (H - dh) * 0.58;
  } else {
    dw = H * imgRatio;
    dx = (W - dw) * 0.5;
  }
  if (alpha < 0.999) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  return true;
}

function drawScene() {
  tick += 1;
  state.stoking = Math.max(0.18, state.stoking * 0.985);
  const pal = PALETTES[state.paletteIndex];
  const sp = state.space;
  const baseScale = getDynamicFireScale();

  // 1. Bespoke 4-Space Hand-Painted Backdrop with Smooth Cross-Fade
  if (spaceFadeAlpha < 1) {
    spaceFadeAlpha = Math.min(1, spaceFadeAlpha + 0.035);
  }
  // The lit plate follows the fire: bigger fire, brighter surroundings, plus a slow two-speed flicker.
  const flicker = 0.06 * Math.sin(tick * 0.83) + 0.04 * Math.sin(tick * 0.31 + 1.7) + 0.03 * Math.sin(tick * 1.9);
  const litAlpha = Math.max(0, Math.min(1, 0.3 + baseScale * 0.3 + state.stoking * 0.15 + flicker));
  ctx.fillStyle = '#0b0d14';
  ctx.fillRect(0, 0, W, H);
  const fading = spaceFadeAlpha < 1 && prevSpaceKey !== sp;
  if (fading) drawPlate(prevSpaceKey, 1, litAlpha);
  const pitPlace = drawPlate(sp, fading ? spaceFadeAlpha : 1, litAlpha);
  const fScale = baseScale * fireUnit;

  // Cosmos Nebula & Twinkling Starfield
  if (sp === 'cosmos') {
    const neb1 = ctx.createRadialGradient(W * 0.3, H * 0.28, 10, W * 0.3, H * 0.28, W * 0.65);
    neb1.addColorStop(0, 'rgba(138, 58, 255, 0.28)');
    neb1.addColorStop(0.5, 'rgba(32, 188, 210, 0.10)');
    neb1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = neb1;
    ctx.fillRect(0, 0, W, H);

    for (const st of stars) {
      const a = 0.35 + Math.sin(tick * 0.05 + st.phase) * 0.35;
      ctx.fillStyle = `rgba(240, 232, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(st.rx * W, st.ry * H, st.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (Math.random() < 0.018) {
      meteors.push({ x: Math.random() * W, y: Math.random() * H * 0.35, vx: -6 - Math.random() * 4, vy: 3 + Math.random() * 2, life: 0 });
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life += 1;
      ctx.strokeStyle = `rgba(220, 245, 255, ${1 - m.life / 28})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 4, m.y - m.vy * 4);
      ctx.stroke();
      if (m.life >= 28) meteors.splice(i, 1);
    }
  }

  const fScaleGlow = fScale;
  const pulse = Math.sin(tick * 0.07) * 8 + Math.cos(tick * 0.13) * 5;
  const glowRadius = Math.min(W, H) * (0.22 + fScaleGlow * 0.34 + state.stoking * 0.14) + pulse;
  const ambGrad = ctx.createRadialGradient(fireX, fireY - 10, 8, fireX, fireY, glowRadius);
  ambGrad.addColorStop(0, `rgba(${pal.glow}, ${Math.min(0.4, 0.06 + fScaleGlow * 0.09 + state.stoking * 0.08)})`);
  ambGrad.addColorStop(0.45, `rgba(${pal.glow}, ${Math.min(0.28, 0.04 + fScaleGlow * 0.04)})`);
  ambGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = ambGrad;
  ctx.fillRect(0, 0, W, H);

  // Temple Wind Chime Ambient Audio (`bg-temple.jpg` already has the hand-painted temple eave & brass fish chime)
  if (sp === 'temple' && tick % 210 === 0 && state.audioEnabled && !audio.loaded.has('recChime')) {
    audio.playWindChime();
  }

  // 2. Weather Particles (Rain / Snow / Cosmic Stardust)
  if (sp === 'snow') {
    for (const sf of snowflakes) {
      sf.phase += 0.025;
      sf.x += sf.vx + Math.sin(sf.phase) * 0.45;
      sf.y += sf.vy;
      if (sf.y > fireY + 95) {
        sf.y = -10;
        sf.x = Math.random() * W;
      }
      ctx.fillStyle = 'rgba(230, 244, 255, 0.68)';
      ctx.beginPath();
      ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (sp === 'cosmos') {
    // Anti-gravity upward stardust rings
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = `rgba(180, 140, 255, ${0.12 + i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(fireX, fireY + 22, 110 + i * 42 + Math.sin(tick * 0.03) * 6, 22 + i * 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = 'rgba(185, 205, 235, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const r of raindrops) {
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 2.5, r.y + r.len);
      r.x -= 0.45;
      r.y += r.speed;
      if (r.y > fireY + 95) {
        if (Math.random() < 0.22) {
          ripples.push({ x: r.x, y: fireY + 12 + Math.random() * 82, rad: 1, maxRad: 12 + Math.random() * 14 });
        }
        r.y = -20;
        r.x = Math.random() * (W + 40);
      }
    }
    ctx.stroke();

    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.rad += 0.35;
      const a = (1 - rp.rad / rp.maxRad) * 0.22;
      ctx.strokeStyle = `rgba(255, 210, 160, ${a})`;
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, rp.rad, rp.rad * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (rp.rad >= rp.maxRad) ripples.splice(i, 1);
    }
  }

  // 3. Connected Soul Fireflies (Number of glowing spirit orbs matches REAL connected users!)
  const scaleX = Math.min(1.08, Math.max(0.68, W / 420));
  const realOnlineCount = Math.min(fireflies.length, Math.max(1, window.__liveOnlineCount || 1));
  fireflies.slice(0, realOnlineCount).forEach(f => {
    f.phase += 0.032;
    const fx = fireX + Math.cos(f.angle) * (f.rx * scaleX) + Math.sin(f.phase) * 3;
    const fy = fireY - 12 + Math.sin(f.angle) * f.ry + Math.cos(f.phase * 0.8) * 2.5;
    const glow = 0.58 + Math.sin(f.phase * 1.5) * 0.25;

    const fg = ctx.createRadialGradient(fx, fy, 0.5, fx, fy, f.size * 5.2);
    fg.addColorStop(0, `rgba(255, 244, 200, ${glow})`);
    fg.addColorStop(0.4, `rgba(${pal.glow}, ${glow * 0.45})`);
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(fx, fy, f.size * 5.2, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = warmthArcs.length - 1; i >= 0; i--) {
    const a = warmthArcs[i];
    a.t += 0.035;
    const t = a.t;
    const cx = (a.sx + a.tx) * 0.5;
    const cy = Math.min(a.sy, a.ty) - 90;
    const x = (1 - t) * (1 - t) * a.sx + 2 * (1 - t) * t * cx + t * t * a.tx;
    const y = (1 - t) * (1 - t) * a.sy + 2 * (1 - t) * t * cy + t * t * a.ty;

    const wg = ctx.createRadialGradient(x, y, 1, x, y, 16);
    wg.addColorStop(0, '#fff8dc');
    wg.addColorStop(0.5, 'rgba(255, 168, 75, 0.65)');
    wg.addColorStop(1, 'rgba(255, 168, 75, 0)');
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    if (a.t >= 1) warmthArcs.splice(i, 1);
  }

  // 4. Glowing charcoal bed under the flames
  const stage = getFireStage();
  const windOffset = (window.__fireWindX || 0) * fScale;
  if (window.__fireWindX) window.__fireWindX *= 0.92;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const bedW = 88 + fScale * 44;
  ctx.translate(fireX, fireY + 10);
  ctx.scale(1, 0.34);
  const bedGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, bedW);
  bedGrad.addColorStop(0, `rgba(255, 245, 190, ${Math.min(0.5, 0.14 + fScale * 0.14 + state.stoking * 0.12)})`);
  bedGrad.addColorStop(0.45, `rgba(${pal.glow}, ${Math.min(0.54, 0.14 + fScale * 0.16)})`);
  bedGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bedGrad;
  ctx.beginPath();
  ctx.arc(0, 0, bedW, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Smoke Plumes
  if (tick % 4 === 0) spawnSmoke();
  for (let i = smokes.length - 1; i >= 0; i--) {
    const s = smokes[i];
    s.life += 1;
    s.x += s.vx + Math.sin(tick * 0.03 + s.life * 0.08) * 0.35 + windOffset * 0.015;
    s.y += s.vy;
    s.radius += 0.28;
    const ratio = s.life / s.maxLife;
    const alpha = Math.sin(ratio * Math.PI) * 0.14;
    const [sr, sg, sb] = pal.smoke;
    const grad = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, s.radius);
    grad.addColorStop(0, `rgba(${sr}, ${sg}, ${sb}, ${alpha})`);
    grad.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    if (s.life >= s.maxLife) smokes.splice(i, 1);
  }

  // 6. Volumetric Waving Flame Tongues & Plasma Particles (Continuously scaled with fScale!)
  const flameCount = Math.min(6, Math.max(1, Math.floor(fScale * 1.8)));
  for (let k = 0; k < flameCount; k++) spawnFlameParticle();
  if (Math.random() < 0.65 + state.stoking * 0.5) spawnFlameParticle();
  if (Math.random() < (0.45 + state.stoking * 0.6) * fScale) spawnSpark();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // 6a. Procedural Waving Flame Tongues (Little Inferno / Cozy Grove style organic ribbons)
  const tongueCount = stage.lv === 0 ? 2 : Math.min(11, Math.max(4, Math.round(3 + fScale * 2.8)));
  for (let t = 0; t < tongueCount; t++) {
    const norm = (t / Math.max(1, tongueCount - 1)) - 0.5;
    const baseX = fireX + norm * (48 * Math.pow(fScale, 0.8));
    const baseY = fireY + 6;
    const h = (52 + (1 - Math.abs(norm) * 1.15) * 68) * fScale * (0.9 + Math.sin(tick * 0.11 + t * 1.7) * 0.14 + state.stoking * 0.22);
    const tipSway = Math.sin(tick * 0.09 + t * 2.1) * (14 * fScale) + windOffset * 0.9;
    const midSway = Math.cos(tick * 0.07 + t * 1.4) * (9 * fScale) + windOffset * 0.45;
    const halfW = (16 + (1 - Math.abs(norm)) * 14) * Math.pow(fScale, 0.75);

    const tGrad = ctx.createLinearGradient(baseX, baseY + 14, baseX + tipSway, baseY - h);
    tGrad.addColorStop(0, `rgba(${pal.mid[0]}, ${pal.mid[1]}, ${pal.mid[2]}, 0)`);
    tGrad.addColorStop(0.16, `rgba(${pal.core[0]}, ${pal.core[1]}, ${pal.core[2]}, 0.3)`);
    tGrad.addColorStop(0.52, `rgba(${pal.mid[0]}, ${pal.mid[1]}, ${pal.mid[2]}, 0.3)`);
    tGrad.addColorStop(1, `rgba(${pal.outer[0]}, ${pal.outer[1]}, ${pal.outer[2]}, 0)`);

    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.moveTo(baseX - halfW, baseY);
    ctx.quadraticCurveTo(baseX - halfW * 0.55 + midSway, baseY - h * 0.52, baseX + tipSway, baseY - h);
    ctx.quadraticCurveTo(baseX + halfW * 0.55 + midSway, baseY - h * 0.52, baseX + halfW, baseY);
    ctx.quadraticCurveTo(baseX, baseY + 18, baseX - halfW, baseY);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = flames.length - 1; i >= 0; i--) {
    const f = flames[i];
    f.life += 1;
    const ratio = f.life / f.maxLife;
    f.x += f.vx + Math.sin(tick * 0.08 + f.seed + ratio * 4) * 0.85 + (fireX - f.x) * 0.025 + windOffset * 0.04;
    f.y += f.vy;
    const r = f.radius * (1 - ratio * 0.72);
    const alpha = (1 - ratio) * 0.4;

    const c = ratio < 0.28 ? pal.core : ratio < 0.65 ? pal.mid : pal.outer;
    const fg = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, Math.max(2, r));
    fg.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`);
    fg.addColorStop(0.55, `rgba(${pal.mid[0]}, ${pal.mid[1]}, ${pal.mid[2]}, ${alpha * 0.45})`);
    fg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(f.x, f.y, Math.max(2, r), 0, Math.PI * 2);
    ctx.fill();

    if (f.life >= f.maxLife) flames.splice(i, 1);
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const sp = sparks[i];
    sp.life += 1;
    const ratio = sp.life / sp.maxLife;
    sp.x += sp.vx + Math.sin(tick * 0.1 + sp.wobble) * 0.65 + windOffset * 0.03;
    sp.y += sp.vy;
    sp.vy -= 0.015;
    const alpha = Math.max(0, 1 - ratio);

    ctx.fillStyle = `rgba(${pal.core[0]}, ${pal.core[1]}, ${pal.core[2]}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.size * (1 - ratio * 0.4), 0, Math.PI * 2);
    ctx.fill();

    if (sp.life >= sp.maxLife) sparks.splice(i, 1);
  }
  ctx.restore();

  // 7. Active Burning Hanji Note
  if (activeNote) {
    activeNote.progress += 0.011;
    const p = activeNote.progress;
    if (p < 0.30) {
      const t = p / 0.30;
      const ease = 1 - Math.pow(1 - t, 3);
      activeNote.x = activeNote.startX + (fireX - activeNote.startX) * ease + Math.sin(t * Math.PI) * 16;
      activeNote.y = activeNote.startY + (fireY - 18 - activeNote.startY) * ease;
      drawHanjiNote(activeNote, 0);
    } else if (p < 1.0) {
      if (!activeNote.spellTriggered) {
        activeNote.spellTriggered = true;
        const sp = detectSecretSpell(activeNote.text);
        if (sp) {
          activeNote.hasSpell = true;
          triggerSecretSpell(sp, activeNote.text);
        }
      }
      const burnRatio = (p - 0.30) / 0.70;
      activeNote.x = fireX + Math.sin(tick * 0.2) * 2.5;
      activeNote.y = fireY - 18 - burnRatio * 14;
      drawHanjiNote(activeNote, burnRatio);
      if (tick % 2 === 0) {
        spawnSpark(activeNote.x + (Math.random() - 0.5) * 90, activeNote.y, true);
        spawnFlameParticle(1.3);
      }
    } else {
      state.burnedCount += 1;
      rollDay();
      state.burnedToday += 1;
      risingEmberTexts.push({
        label: `${t('note.me')} 🔥`,
        x: fireX,
        y: fireY - 46,
        life: 0,
        maxLife: 150,
        isGold: !!activeNote.isGold
      });
      saveState();
      stokeFire(55);
      if (!activeNote.hasSpell) {
        showOracle(activeNote.oracle, t('oracle.burnTag', { text: activeNote.text.slice(0, 16) + (activeNote.text.length > 16 ? '…' : '') }));
      }
      activeNote = null;
    }
  }

  // Front stones go over the flame base and the burning note, so both sit inside the pit.
  drawPit(pitPlace, true);

  // 7c. Secret Code / Easter Egg Spell Particle Effects
  if (spellEffects.lightningFlash > 0.01) {
    ctx.fillStyle = `rgba(215, 225, 255, ${spellEffects.lightningFlash * 0.42})`;
    ctx.fillRect(0, 0, W, H);
    spellEffects.lightningFlash *= 0.86;
  }

  for (let i = spellEffects.lightningBolts.length - 1; i >= 0; i--) {
    const lb = spellEffects.lightningBolts[i];
    lb.life += 1;
    const a = 1 - lb.life / lb.maxLife;
    ctx.save();
    ctx.strokeStyle = `rgba(225, 240, 255, ${a})`;
    ctx.shadowColor = '#9370ff';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 3 * a;
    ctx.beginPath();
    lb.pts.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.restore();
    if (lb.life >= lb.maxLife) spellEffects.lightningBolts.splice(i, 1);
  }

  for (let i = spellEffects.matrixDrops.length - 1; i >= 0; i--) {
    const md = spellEffects.matrixDrops[i];
    md.life += 1;
    md.y += md.vy;
    const a = Math.max(0, 1 - md.life / md.maxLife);
    ctx.save();
    ctx.font = '700 12px monospace';
    ctx.fillStyle = `rgba(46, 255, 148, ${a * 0.9})`;
    ctx.fillText(md.token, md.x, md.y);
    ctx.restore();
    if (md.life >= md.maxLife || md.y > fireY + 60) spellEffects.matrixDrops.splice(i, 1);
  }

  for (let i = spellEffects.bullCandles.length - 1; i >= 0; i--) {
    const bc = spellEffects.bullCandles[i];
    bc.life += 1;
    bc.y += bc.vy;
    const a = Math.max(0, 1 - bc.life / bc.maxLife);
    ctx.save();
    ctx.translate(bc.x, bc.y);
    // Red Bullish Candle Wick & Body (Zero shadowBlur for 60FPS smooth rendering!)
    ctx.strokeStyle = `rgba(255, 82, 82, ${a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -bc.h * 0.7);
    ctx.lineTo(0, bc.h * 0.7);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 56, 56, ${a * 0.92})`;
    ctx.fillRect(-7, -bc.h * 0.45, 14, bc.h * 0.9);
    ctx.font = '800 10.5px Pretendard, sans-serif';
    ctx.fillStyle = `rgba(255, 232, 165, ${a})`;
    ctx.textAlign = 'center';
    ctx.fillText(bc.label, 0, -bc.h * 0.78);
    ctx.restore();
    if (bc.life >= bc.maxLife) spellEffects.bullCandles.splice(i, 1);
  }

  for (let i = spellEffects.skyFireworks.length - 1; i >= 0; i--) {
    const fw = spellEffects.skyFireworks[i];
    fw.life += 1;
    fw.x += fw.vx;
    fw.y += fw.vy;
    fw.vy += 0.035;
    const a = Math.max(0, 1 - fw.life / fw.maxLife);
    ctx.fillStyle = `rgba(${fw.col}, ${a})`;
    ctx.beginPath();
    ctx.arc(fw.x, fw.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    if (fw.life >= fw.maxLife) spellEffects.skyFireworks.splice(i, 1);
  }

  for (let i = spellEffects.sakuraPetals.length - 1; i >= 0; i--) {
    const sk = spellEffects.sakuraPetals[i];
    sk.life += 1;
    sk.x += sk.vx + Math.sin(tick * 0.06 + i) * 0.6;
    sk.y += sk.vy;
    sk.rot += 0.04;
    const a = Math.max(0, 1 - sk.life / sk.maxLife);
    ctx.save();
    ctx.translate(sk.x, sk.y);
    ctx.rotate(sk.rot);
    ctx.fillStyle = `rgba(255, 182, 205, ${a * 0.9})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, sk.size, sk.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (sk.life >= sk.maxLife) spellEffects.sakuraPetals.splice(i, 1);
  }

  for (let i = spellEffects.cosmicRings.length - 1; i >= 0; i--) {
    const cr = spellEffects.cosmicRings[i];
    cr.life += 1;
    const ratio = cr.life / cr.maxLife;
    const rad = cr.rad + (cr.maxRad - cr.rad) * (1 - Math.pow(1 - ratio, 2));
    const a = Math.max(0, (1 - ratio) * 0.78);
    ctx.save();
    ctx.strokeStyle = `rgba(${cr.col}, ${a})`;
    ctx.lineWidth = 2.6 * (1 - ratio * 0.5);
    ctx.beginPath();
    ctx.ellipse(cr.x, cr.y, rad, rad * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    if (cr.life >= cr.maxLife) spellEffects.cosmicRings.splice(i, 1);
  }

  for (let i = spellEffects.floatingRunes.length - 1; i >= 0; i--) {
    const fr = spellEffects.floatingRunes[i];
    fr.life += 1;
    fr.x += fr.vx + Math.sin(tick * 0.08 + i) * 0.4;
    fr.y += fr.vy;
    const a = Math.max(0, 1 - fr.life / fr.maxLife);
    ctx.save();
    ctx.font = '800 13px Pretendard, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${fr.col}, ${a})`;
    ctx.fillText(fr.text, fr.x, fr.y);
    ctx.restore();
    if (fr.life >= fr.maxLife) spellEffects.floatingRunes.splice(i, 1);
  }

  if (spellEffects.activeMythicBanner) {
    const mb = spellEffects.activeMythicBanner;
    mb.life += 1;
    const ratio = mb.life / mb.maxLife;
    const a = ratio < 0.12 ? ratio / 0.12 : ratio > 0.8 ? (1 - ratio) / 0.2 : 1;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '800 12px Pretendard, sans-serif';
    ctx.fillStyle = `rgba(255, 218, 105, ${a * 0.95})`;
    ctx.fillText(`✨ ${t('banner.found', { tier: mb.tierLabel, name: mb.discoverer })}`, fireX, fireY - 142);
    ctx.font = '800 19px Pretendard, sans-serif';
    ctx.fillStyle = `rgba(255, 250, 235, ${a})`;
    ctx.shadowColor = 'rgba(255, 165, 50, 0.95)';
    ctx.shadowBlur = 18;
    ctx.fillText(mb.title, fireX, fireY - 118);
    ctx.restore();
    if (mb.life >= mb.maxLife) spellEffects.activeMythicBanner = null;
  }

  // 7b. Real-Time Multiplayer Notes Flying from Other Connected Users + Rising Ember Texts
  for (let i = ghostNotes.length - 1; i >= 0; i--) {
    const gn = ghostNotes[i];
    gn.p += 0.016;
    if (gn.p < 1) {
      const ease = 1 - Math.pow(1 - gn.p, 2);
      gn.x = gn.sx + (fireX - gn.sx) * ease;
      gn.y = gn.sy + (fireY - 12 - gn.sy) * ease - Math.sin(gn.p * Math.PI) * 34;

      ctx.save();
      ctx.translate(gn.x, gn.y);
      ctx.rotate(gn.rot + gn.p * 0.25);
      const s = 1 - gn.p * 0.35;
      ctx.scale(s, s);
      ctx.fillStyle = 'rgba(248, 236, 212, 0.88)';
      ctx.strokeStyle = 'rgba(255, 148, 66, 0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-68, -14, 136, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2b1a0e';
      ctx.font = '700 10.5px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortTxt = gn.text.length > 14 ? gn.text.slice(0, 14) + '…' : gn.text;
      ctx.fillText(`${gn.origin} · ${shortTxt}`, 0, 0);
      ctx.restore();
    } else {
      for (let k = 0; k < 14; k++) spawnSpark(fireX, fireY - 14, true);
      risingEmberTexts.push({
        label: `${gn.origin} · 「${gn.text.slice(0, 18)}」`,
        x: fireX + (Math.random() - 0.5) * 36,
        y: fireY - 42,
        life: 0,
        maxLife: 140,
        isGold: false
      });
      ghostNotes.splice(i, 1);
    }
  }

  for (let i = risingEmberTexts.length - 1; i >= 0; i--) {
    const rt = risingEmberTexts[i];
    rt.life += 1;
    rt.y -= 0.55;
    rt.x += Math.sin(tick * 0.05 + i) * 0.25;
    const ratio = rt.life / rt.maxLife;
    const alpha = ratio < 0.2 ? ratio / 0.2 : Math.max(0, 1 - (ratio - 0.2) / 0.8);

    ctx.save();
    ctx.font = rt.isGold ? '800 13px Pretendard, sans-serif' : '600 11.5px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = rt.isGold
      ? `rgba(255, 232, 135, ${alpha})`
      : `rgba(255, 224, 185, ${alpha * 0.92})`;
    ctx.fillText(rt.label, rt.x, rt.y);
    ctx.restore();

    if (rt.life >= rt.maxLife) risingEmberTexts.splice(i, 1);
  }

  // 7d. Floating Clicker Temperature Popups (+°C 🔥 COMBO)
  for (let i = risingClickPopups.length - 1; i >= 0; i--) {
    const cp = risingClickPopups[i];
    cp.life += 1;
    cp.y += cp.vy;
    const ratio = cp.life / cp.maxLife;
    const alpha = ratio < 0.15 ? ratio / 0.15 : Math.max(0, 1 - (ratio - 0.15) / 0.85);
    ctx.save();
    ctx.translate(cp.x, cp.y);
    ctx.scale(cp.scale || 1, cp.scale || 1);
    ctx.font = '800 13.5px "JetBrains Mono", "Pretendard Variable", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(16, 7, 3, ${alpha * 0.88})`;
    ctx.lineWidth = 3.5;
    ctx.strokeText(cp.text, 0, 0);
    ctx.fillStyle = `rgba(255, 236, 155, ${alpha})`;
    ctx.fillText(cp.text, 0, 0);
    ctx.restore();
    if (cp.life >= cp.maxLife) risingClickPopups.splice(i, 1);
  }

  // 8. Active Friend Cheer Firewood Log (Flying into the fire)
  if (activeGiftLog) {
    activeGiftLog.progress += 0.022;
    const p = activeGiftLog.progress;
    if (p < 1.0) {
      const ease = 1 - Math.pow(1 - p, 2);
      activeGiftLog.x = activeGiftLog.startX + (fireX - activeGiftLog.startX) * ease;
      activeGiftLog.y = activeGiftLog.startY + (fireY + 6 - activeGiftLog.startY) * ease - Math.sin(p * Math.PI) * 95;
      activeGiftLog.rot = (1 - p) * -0.45 + p * 0.12;
      drawGiftLog(activeGiftLog);
    } else {
      addTemperature(55, fireX, fireY - 50, true);
      stokeFire(65);
      updateStatsUI();
      showOracle(t('wood.thrown'), t('wood.tag'));
      activeGiftLog = null;
    }
  }

  requestAnimationFrame(drawScene);
}

const ITEM_ART = { resignation: 'resignation', stock: 'stock-chart', clock: 'alarm-clock', wood: 'firewood', scroll: 'note', gold: 'wish-gold' };
const noteBuf = document.createElement('canvas');
function drawHanjiNote(note, burnRatio) {
  const img = art(`objects/${ITEM_ART[note.isGold ? 'gold' : note.itemType] || ITEM_ART.scroll}`);
  if (!ready(img)) return;
  const size = Math.min(170, W * 0.36) * fireUnit * (1 - burnRatio * 0.3);
  const k = size / Math.max(img.naturalWidth, img.naturalHeight);
  const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
  noteBuf.width = w;
  noteBuf.height = h;
  const g = noteBuf.getContext('2d');
  g.drawImage(img, 0, 0, w, h);
  const label = note.itemType === 'scroll' || note.isGold ? note.text : note.itemType === 'resignation' ? t('note.resign') : '';
  if (label) {
    g.fillStyle = '#2a1a0e';
    g.font = `700 ${Math.round(h * 0.16)}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-hand') || 'serif'}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label.length > 14 ? label.slice(0, 14) + '…' : label, w / 2, note.itemType === 'resignation' ? h * 0.3 : h * 0.55, w * 0.8);
  }
  if (burnRatio > 0) {
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = `rgba(22, 10, 4, ${Math.min(0.9, burnRatio * 1.3)})`;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.translate(note.x, note.y);
  ctx.rotate(note.rotation + burnRatio * 0.16);
  const remainH = h * (1 - burnRatio);
  if (remainH > 2) {
    ctx.drawImage(noteBuf, 0, 0, w, remainH, -w / 2, -h / 2, w, remainH);
    if (burnRatio > 0.01) {
      const edgeY = -h / 2 + remainH;
      const charGrad = ctx.createLinearGradient(0, edgeY - 14, 0, edgeY);
      charGrad.addColorStop(0, 'rgba(30, 15, 8, 0)');
      charGrad.addColorStop(1, 'rgba(255, 123, 36, 0.9)');
      ctx.fillStyle = charGrad;
      ctx.fillRect(-w / 2, edgeY - 14, w, 15);
    }
  }
  ctx.restore();
}

// ── Timers & UI Wiring ───────────────────────────────────────────────────────
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateStatsUI() {
  const timerEl = document.getElementById('zen-timer');
  const burnedEl = document.getElementById('stat-burned');
  const warmthEl = document.getElementById('stat-warmth');
  const heatEl = document.getElementById('stat-heat');
  const essenceEl = document.getElementById('essence-count');
  if (timerEl) timerEl.textContent = formatTime(state.seconds);
  if (burnedEl) burnedEl.textContent = state.burnedCount.toLocaleString(LOCALE);
  if (warmthEl) warmthEl.textContent = state.warmthCount.toLocaleString(LOCALE);
  const displayTemp = Math.round(state.tempC);
  if (heatEl) heatEl.textContent = `${displayTemp.toLocaleString(LOCALE)}°C`;
  if (essenceEl) essenceEl.textContent = (state.burnedCount * 25 + state.warmthCount * 10).toLocaleString(LOCALE);
}

function renderSpaceUI() {
  if (state.space === 'cosmos' && !state.cosmosOpen) state.space = 'camp';
  document.querySelectorAll('.space-chip').forEach(btn => {
    btn.hidden = btn.dataset.space === 'cosmos' && !state.cosmosOpen;
    btn.classList.toggle('active', btn.dataset.space === state.space);
  });
}

document.querySelectorAll('.space-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!state.audioEnabled) toggleAudio(true);
    const nextSp = btn.dataset.space;
    if (nextSp !== state.space) {
      prevSpaceKey = state.space;
      spaceFadeAlpha = 0;
      state.space = nextSp;
    }
    saveState();
    renderSpaceUI();
    const sp = SPACES[state.space] || SPACES.camp;
    audio.applyScene();
    if (state.space === 'temple') audio.playWindChime();
    else audio.playWhooshAndBowl();
    stokeFire(24);
    showOracle(sp.desc, t('space.tag', { name: sp.name }));
  });
});

function updateGoldUI() {
  const goldBtn = document.getElementById('btn-gold-talisman');
  // Paid unlocks are closed until payments are verified server-side (plan stage 4); earlier unlocks keep the sheet.
  goldBtn.hidden = !state.goldUnlocked;
  hanjiSheet.classList.toggle('golden', !!state.goldMode);
  goldBtn.textContent = t(state.goldMode ? 'sheet.goldOn' : 'sheet.gold');
  document.getElementById('hanji-room-stamp').textContent = state.goldMode ? t('sheet.goldStamp') : t('sheet.stamp');
  burnInput.placeholder = t(state.goldMode ? 'sheet.phGold' : 'sheet.ph');
}

document.getElementById('btn-gold-talisman').addEventListener('click', () => {
  if (!state.goldUnlocked) return;
  state.goldMode = !state.goldMode;
  updateGoldUI();
});

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.classList.toggle('active', btn.dataset.lang === lang);
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});
const titleLangSelect = document.getElementById('title-lang-select');
titleLangSelect.value = lang;
titleLangSelect.addEventListener('change', () => setLang(titleLangSelect.value));

// ── Flame Museum & First-Discoverer Hall of Fame Album Modal (#modal-album) ──
function renderAlbumModal() {
  updateAlbumBadgeUI();
  const unlockedIds = Object.keys(state.eggAlbum || {});
  const total = EASTER_EGG_DEX.length;
  const pct = Math.round((unlockedIds.length / total) * 100);

  const progText = document.getElementById('album-progress-text');
  const progFill = document.getElementById('album-bar-fill');
  const discInput = document.getElementById('discoverer-name-input');
  if (progText) progText.textContent = t('album.progress', { n: unlockedIds.length, total, pct });
  document.querySelector('.album-filter-btn[data-filter="all"]').textContent = t('album.all', { n: total });
  if (progFill) progFill.style.width = `${pct}%`;
  if (discInput && document.activeElement !== discInput) {
    discInput.value = state.discovererName || '';
  }

  document.querySelectorAll('.album-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === state.albumFilter);
  });

  const filtered = EASTER_EGG_DEX.filter(egg => {
    const isUnlocked = Boolean(state.eggAlbum[egg.id]);
    if (state.albumFilter === 'unlocked') return isUnlocked;
    if (state.albumFilter === 'locked') return !isUnlocked;
    if (state.albumFilter === 'mythic') return egg.tier === 'mythic' || egg.tier === 'epic';
    return true;
  });

  const grid = document.getElementById('album-grid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:28px 12px;color:var(--text-sub);font-size:12.5px;">${t('album.empty')}</div>`;
    return;
  }

  grid.innerHTML = filtered.map(egg => {
    const rec = state.eggAlbum[egg.id];
    if (rec) {
      return `
        <div class="egg-slot unlocked tier-${egg.tier}">
          <div>
            <img class="egg-thumb" src="${safeImg(rec.lastImage)}" alt="${esc(egg.title)}">
            <span class="egg-tier-badge">${egg.tierLabel}</span>
            <div class="egg-title">${egg.title}</div>
            <div class="egg-discoverer">👑 ${esc(t('album.first', { name: rec.firstDiscoverer }))}<br><span style="font-weight:500;opacity:0.8;">${esc(t('album.times', { time: showTime(rec.firstTime), n: Number(rec.count) || 0 }))}</span></div>
          </div>
          <div class="egg-actions">
            <button type="button" class="egg-act-btn" data-reignite="${egg.id}">🔥 ${t('album.reignite')}</button>
            <button type="button" class="egg-act-btn" data-dl-egg="${egg.id}">📥 ${t('album.save')}</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="egg-slot tier-${egg.tier}">
        <div>
          <div class="egg-locked-box">🔒<span style="font-size:11px;margin-top:4px;">${t('album.lockedBox')}</span></div>
          <span class="egg-tier-badge">${egg.tierLabel}</span>
          <div class="egg-title">??? (${egg.title.replace(/^[^\s]+\s/, '')})</div>
          <div class="egg-hint">💡 <b>${t('album.hint')}</b>: ${egg.codeHint}</div>
        </div>
        <div class="egg-discoverer" style="background:rgba(255,255,255,0.04);color:rgba(255,230,195,0.5);">👑 ${t('album.noFirst')}</div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('[data-reignite]').forEach(btn => {
    btn.addEventListener('click', () => {
      const eggId = btn.getAttribute('data-reignite');
      const egg = EASTER_EGG_DEX.find(x => x.id === eggId);
      if (!egg) return;
      document.getElementById('modal-album').classList.remove('open');
      triggerSecretSpell(egg, egg.sampleTrigger);
    });
  });

  grid.querySelectorAll('[data-dl-egg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const eggId = btn.getAttribute('data-dl-egg');
      const rec = state.eggAlbum[eggId];
      if (!rec || !safeImg(rec.lastImage)) return;
      const a = document.createElement('a');
      a.download = `bulmeong-${eggId}-${Date.now()}.jpg`;
      a.href = safeImg(rec.lastImage);
      a.click();
    });
  });
}

document.getElementById('btn-open-album')?.addEventListener('click', () => {
  renderAlbumModal();
  document.getElementById('modal-album').classList.add('open');
});

document.getElementById('capture-toast')?.addEventListener('click', () => {
  document.getElementById('capture-toast').classList.remove('show');
  renderAlbumModal();
  document.getElementById('modal-album').classList.add('open');
});

document.querySelectorAll('.album-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.albumFilter = btn.dataset.filter;
    renderAlbumModal();
  });
});

document.getElementById('btn-save-discoverer')?.addEventListener('click', () => {
  const val = document.getElementById('discoverer-name-input')?.value.trim() || '';
  state.discovererName = val;
  saveState();
  renderAlbumModal();
  showOracle(t('album.nickSaved', { name: val || t('common.anon') }), t('album.nickTag'));
});

updateAlbumBadgeUI();

document.getElementById('btn-fire-stage').addEventListener('click', () => {
  const stage = getFireStage();
  showOracle(stage.desc, t('stage.tag', { name: stage.name }));
});

function reviveFire(boostPct = 14, clickX = fireX, clickY = fireY - 38) {
  state.forcedLv0Until = 0;
  addTemperature(boostPct * 1.4, clickX, clickY, true);
}

renderRoomUI();
renderSpaceUI();
updateGoldUI();
updateFireStageUI();
updateStatsUI();

// Smooth 10Hz (every 100ms) Global Natural Cooling Curve (Newton's Law of Cooling)
setInterval(() => {
  const now = Date.now();
  const idleMs = now - state.lastInteractMs;
  if (idleMs > 1800 && state.clickCombo > 0) {
    state.clickCombo = 0;
    document.getElementById('combo-pill')?.classList.remove('show');
  }
  // While someone tends it the fire rests at a campfire; left alone 3 minutes it sinks to Lv.0 embers (the phoenix needs that).
  const floor = isIdle() ? 480 : idleMs > 180000 ? 84 : 360;
  if (idleMs > 1400 && state.tempC > floor) {
    const excess = Math.max(0, state.tempC - 84);
    const coolPerSec = 3.5 + excess * 0.022;
    state.tempC = Math.max(floor, +(state.tempC - coolPerSec * 0.1).toFixed(1));
    updateFireStageUI();
    updateStatsUI();
  }
}, 100);

setInterval(() => {
  state.seconds += 1;
  state.idleSeconds += 1;
  if (state.seconds % 5 === 0) saveState();
  updateStatsUI();
}, 1000);

// ── Interactive Canvas Clicker Stoking & Wind Drag ───────────────────────────
let isCanvasDragging = false;
let lastCanvasX = 0;

canvas.addEventListener('pointerdown', e => {
  if (isIdle()) {
    showIdleBar();
    return;
  }
  if (!state.audioEnabled) toggleAudio(true);
  isCanvasDragging = true;
  lastCanvasX = e.clientX;
  document.getElementById('world-drawer')?.classList.remove('open');
  reviveFire(13, e.clientX, e.clientY - 18);
  stokeFire(26);
});

window.addEventListener('pointermove', e => {
  if (!isCanvasDragging) return;
  const dx = e.clientX - lastCanvasX;
  lastCanvasX = e.clientX;
  window.__fireWindX = Math.max(-45, Math.min(45, (window.__fireWindX || 0) + dx * 0.45));
  if (Math.abs(dx) > 6 && Math.random() < 0.65) {
    spawnSpark(fireX + (Math.random() - 0.5) * 40, fireY - 12, true);
  }
});

window.addEventListener('pointerup', () => {
  isCanvasDragging = false;
});

// ── Cinematic Title Screen Ignition & World Drawer ───────────────────────────
const introNickInput = document.getElementById('intro-nick-input');
if (introNickInput) {
  introNickInput.value = state.discovererName || '';
}

document.getElementById('btn-ignite-start')?.addEventListener('click', () => {
  const nickVal = document.getElementById('intro-nick-input')?.value.trim() || '';
  state.discovererName = nickVal;
  saveState();
  if (!state.audioEnabled) toggleAudio(true);
  audio.playWhooshAndBowl();
  reviveFire(35, fireX, fireY - 45);
  stokeFire(95);
  document.getElementById('title-screen')?.classList.add('hidden');
  showOracle(t('start.msg'), t('start.tag'));
});

document.getElementById('btn-world-toggle')?.addEventListener('click', () => {
  const open = document.getElementById('world-drawer').classList.toggle('open');
  document.getElementById('btn-world-toggle').setAttribute('aria-expanded', String(open));
  if (open) document.getElementById('ash-oracle').classList.remove('show');
});

// ── Leave-it-on mode: no UI, fullscreen, screen kept awake, optional sleep timer ──
let wakeLock = null;
let idleOffTimer = 0;
let idleBarTimer = 0;
const isIdle = () => document.body.classList.contains('idle');
async function keepAwake() {
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
}
function showIdleBar() {
  document.body.classList.add('idle-bar-on');
  clearTimeout(idleBarTimer);
  idleBarTimer = setTimeout(() => document.body.classList.remove('idle-bar-on'), 4000);
}
async function enterIdle() {
  document.getElementById('world-drawer').classList.remove('open');
  document.body.classList.add('idle');
  if (!state.audioEnabled) toggleAudio(true);
  try { await document.documentElement.requestFullscreen?.(); } catch {}
  keepAwake();
  showIdleBar();
}
function exitIdle() {
  document.body.classList.remove('idle', 'idle-bar-on');
  clearTimeout(idleOffTimer);
  wakeLock?.release?.().catch(() => {});
  wakeLock = null;
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}
const idleTimer = document.getElementById('idle-timer');
idleTimer.innerHTML = [0, 30, 60, 90].map(n => `<option value="${n}">${esc(n ? t('idle.min', { n }) : t('idle.never'))}</option>`).join('');
idleTimer.addEventListener('change', () => {
  clearTimeout(idleOffTimer);
  const minutes = Number(idleTimer.value);
  if (minutes) {
    idleOffTimer = setTimeout(() => {
      toggleAudio(false);
      exitIdle();
      showOracle(t('idle.ended'), t('idle.timer'));
    }, minutes * 60000);
  }
  showIdleBar();
});
document.getElementById('btn-idle').addEventListener('click', enterIdle);
document.getElementById('btn-idle-exit').addEventListener('click', exitIdle);
// the browser drops the wake lock whenever the tab is hidden
document.addEventListener('visibilitychange', () => {
  if (isIdle() && document.visibilityState === 'visible') keepAwake();
});

// ── Tactile Physical Item Inventory Cards (Tap or Drag-and-Throw into Fire!) ──
const PHYSICAL_ITEMS = {
  resignation: { icon: '✉️', label: t('card.resign'), text: t('item.resign'), itemType: 'resignation' },
  stock: { icon: '📉', label: t('card.stock'), text: t('item.stock'), itemType: 'stock' },
  clock: { icon: '⏰', label: t('card.clock'), text: t('item.clock'), itemType: 'clock' },
  wood: { icon: '🪵', label: t('card.wood'), text: t('item.wood'), itemType: 'wood' }
};

const dragGhost = document.getElementById('drag-ghost');
const dragGhostIcon = document.getElementById('drag-ghost-icon');
const dragGhostLabel = document.getElementById('drag-ghost-label');
let activeDragSpec = null;
let activeDragCard = null;
let dragCardStartX = 0;
let dragCardStartY = 0;
let dragMoved = false;

document.querySelectorAll('[data-throw-item]').forEach(card => {
  const key = card.getAttribute('data-throw-item');
  const spec = PHYSICAL_ITEMS[key];
  if (!spec) return;

  card.addEventListener('pointerdown', e => {
    if (!state.audioEnabled) toggleAudio(true);
    activeDragSpec = spec;
    activeDragCard = card;
    dragCardStartX = e.clientX;
    dragCardStartY = e.clientY;
    dragMoved = false;
    if (dragGhost && dragGhostIcon && dragGhostLabel) {
      dragGhostIcon.textContent = spec.icon;
      dragGhostLabel.textContent = t('drag.label', { item: spec.label });
      dragGhost.style.left = `${e.clientX}px`;
      dragGhost.style.top = `${e.clientY}px`;
    }
  });
});

window.addEventListener('pointermove', e => {
  if (!activeDragSpec) return;
  const dist = Math.hypot(e.clientX - dragCardStartX, e.clientY - dragCardStartY);
  if (dist > 8) {
    dragMoved = true;
    if (dragGhost) {
      dragGhost.classList.add('active');
      dragGhost.style.left = `${e.clientX}px`;
      dragGhost.style.top = `${e.clientY}px`;
    }
  }
});

window.addEventListener('pointerup', e => {
  if (!activeDragSpec) return;
  const spec = activeDragSpec;
  const card = activeDragCard;
  activeDragSpec = null;
  activeDragCard = null;
  if (dragGhost) dragGhost.classList.remove('active');

  if (spec.itemType === 'wood') {
    // If dragged and released, or if tapped (handled by click listener if not dragged, so only trigger here on drag!)
    if (dragMoved) {
      reviveFire(36, e.clientX, e.clientY - 20);
      stokeFire(55);
      showOracle(t('wood.thrown'), t('wood.tag'));
    }
    return;
  }

  const rect = card ? card.getBoundingClientRect() : { left: W * 0.5, top: H * 0.8, width: 0, height: 0 };
  const lx = dragMoved ? e.clientX : rect.left + rect.width / 2;
  const ly = dragMoved ? e.clientY : rect.top + rect.height / 2;
  reviveFire(28, lx, ly);
  burnWorry(spec.text, lx, ly, spec.itemType);
});

// ── Real-Time Shared Multiplayer Server Sync (100% Real Concurrent Presence & Real Cumulative Burns) ──
const MULTIPLAYER_TOPIC = 'bulmeong_lounge_global_v8_real';
const LEGACY_EGG_TOPIC = 'bulmeong_lounge_global_v5';
const NTFY_BASE = `https://ntfy.sh/${MULTIPLAYER_TOPIC}`;

let clientSessionId = '';
try {
  clientSessionId = sessionStorage.getItem('bulmeong:session_id') || '';
  if (!clientSessionId) {
    clientSessionId = 'sess_' + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('bulmeong:session_id', clientSessionId);
  }
} catch {
  clientSessionId = 'sess_' + Math.random().toString(36).slice(2, 10);
}

const activePeers = new Map([[clientSessionId, Date.now()]]);
const seenBurnIds = new Set();
const REMOTE_ITEM_KEYS = { resignation: 'item.resign', stock: 'item.stock', clock: 'item.clock', wood: 'item.wood' };

function updateLiveConcurrentUI() {
  const now = Date.now();
  activePeers.set(clientSessionId, now);
  for (const [peerId, lastTs] of activePeers.entries()) {
    if (peerId !== clientSessionId && now - lastTs > 300000) {
      activePeers.delete(peerId);
    }
  }
  const onlineCount = Math.max(1, activePeers.size);
  window.__liveOnlineCount = onlineCount;
  const el = document.getElementById('live-count');
  if (el) el.textContent = onlineCount.toLocaleString(LOCALE);
}
updateLiveConcurrentUI();
setInterval(updateLiveConcurrentUI, 5000);

function makeFallbackPolaroid(egg, discoverer, firstTime, triggerText) {
  const c = document.createElement('canvas');
  c.width = 480;
  c.height = 300;
  const g = c.getContext('2d');
  const pal = PALETTES[egg.palette ?? 3] || PALETTES[0];
  const bg = g.createRadialGradient(240, 170, 12, 240, 160, 240);
  bg.addColorStop(0, `rgb(${pal.core.join(',')})`);
  bg.addColorStop(0.4, `rgb(${pal.mid.join(',')})`);
  bg.addColorStop(1, '#08060c');
  g.fillStyle = bg;
  g.fillRect(0, 0, 480, 300);

  const borderCol = egg.tier === 'mythic' ? '#ffd768' : egg.tier === 'epic' ? '#ff7eb6' : egg.tier === 'rare' ? '#c58aff' : '#7ac4ff';
  g.strokeStyle = borderCol;
  g.lineWidth = 4;
  g.strokeRect(6, 6, 468, 288);

  g.fillStyle = 'rgba(6, 5, 12, 0.78)';
  g.fillRect(8, 8, 464, 68);
  g.fillRect(8, 222, 464, 70);

  g.fillStyle = borderCol;
  g.font = '800 12px Pretendard, sans-serif';
  g.fillText(t('polaroid.head', { tier: egg.tierLabel }), 20, 30);
  g.fillStyle = '#fff';
  g.font = '800 20px Pretendard, sans-serif';
  g.fillText(egg.title, 20, 58);

  g.fillStyle = '#ffd97d';
  g.font = '800 15px Pretendard, sans-serif';
  g.fillText(`👑 ${t('polaroid.first', { name: discoverer })}`, 20, 250);
  g.fillStyle = 'rgba(255, 240, 215, 0.8)';
  g.font = '600 11.5px Pretendard, sans-serif';
  g.fillText(t('polaroid.meta', { time: showTime(firstTime), text: egg.sampleTrigger.slice(0, 18) }), 20, 274);
  return c.toDataURL('image/jpeg', 0.82);
}

async function applyRemoteServerEvent(evt, isHistorical = false, msgTimeSec = 0) {
  if (!evt || typeof evt !== 'object') return;

  // 1. Track real-time concurrent session presence
  const eventMs = msgTimeSec ? msgTimeSec * 1000 : (evt.ts || Date.now());
  if (evt.sender) {
    if (evt.type === 'leave') {
      if (evt.sender !== clientSessionId) {
        activePeers.delete(evt.sender);
        updateLiveConcurrentUI();
      }
      return;
    } else if (Date.now() - eventMs <= 300000) {
      activePeers.set(evt.sender, eventMs);
      updateLiveConcurrentUI();
    }
  }

  if (evt.type === 'presence') return;

  if (evt.type === 'egg_unlock' && evt.eggId) {
    const egg = EASTER_EGG_DEX.find(x => x.id === evt.eggId);
    if (!egg) return;
    const existing = state.eggAlbum[evt.eggId];
    const firstDiscoverer = existing?.firstDiscoverer || String(evt.firstDiscoverer || '').slice(0, 14) || t('common.anon');
    const firstTime = existing?.firstTime || evt.firstTime || new Date(eventMs).toISOString();
    const count = Math.max((existing?.count || 0) + (isHistorical ? 0 : 1), Number(evt.count) || 1);

    let lastImage = existing?.lastImage || '';
    if (!lastImage) {
      lastImage = makeFallbackPolaroid(egg, firstDiscoverer, firstTime);
    }

    state.eggAlbum[evt.eggId] = {
      id: evt.eggId,
      firstDiscoverer,
      firstTime,
      lastImage,
      triggerText: egg.sampleTrigger,
      count
    };

    saveState();
    updateAlbumBadgeUI();
    if (document.getElementById('modal-album')?.classList.contains('open')) {
      renderAlbumModal();
    }
    if (!isHistorical && evt.sender !== clientSessionId) {
      const ticker = document.getElementById('live-ticker');
      if (ticker) {
        ticker.textContent = t('ticker.remoteEgg', { nick: firstDiscoverer, title: egg.title });
      }
    }
  } else if (evt.type === 'burn') {
    const bId = evt.burnId || `${evt.sender || 'anon'}_${msgTimeSec}`;
    if (seenBurnIds.has(bId)) return;
    seenBurnIds.add(bId);
    const ranked = typeof evt.rk === 'string' ? (ROOMS[evt.rk.split('.')[0]]?.rankings.find(x => x.rk === evt.rk) || null) : null;
    const nick = String(evt.nick || '').slice(0, 14) || t('common.anon');
    const what = ranked ? ranked.word : t(REMOTE_ITEM_KEYS[evt.itemType] || 'item.note');

    if (isHistorical) {
      incrementRanking(ranked);
    } else if (evt.sender !== clientSessionId) {
      bumpGlobalBurnCounter(1, 3.0);
      if (typeof evt.totalAfter === 'number' && evt.totalAfter > state.globalBurnTotal) {
        state.globalBurnTotal = evt.totalAfter;
        updateGlobalBurnUI();
      }
      incrementRanking(ranked);
      const ticker = document.getElementById('live-ticker');
      if (ticker) {
        ticker.textContent = t('ticker.remote', { nick, what });
      }
      ghostNotes.push({
        origin: nick,
        text: what,
        sx: fireX + (Math.random() - 0.5) * 240,
        sy: fireY - 120,
        x: fireX,
        y: fireY - 120,
        rot: (Math.random() - 0.5) * 0.3,
        p: 0
      });
    }
  }
}

window.__broadcastEggUnlock = async (egg, rec) => {
  try {
    await fetch(NTFY_BASE, {
      method: 'POST',
      body: JSON.stringify({
        type: 'egg_unlock',
        sender: clientSessionId,
        eggId: egg.id,
        firstDiscoverer: rec.firstDiscoverer,
        firstTime: rec.firstTime,
        count: rec.count,
        ts: Date.now()
      })
    });
  } catch {}
};

window.__broadcastBurnEvent = async payload => {
  if (payload && payload.burnId) {
    seenBurnIds.add(payload.burnId);
  }
  try {
    await fetch(NTFY_BASE, {
      method: 'POST',
      body: JSON.stringify({
        type: 'burn',
        sender: clientSessionId,
        ts: Date.now(),
        ...payload
      })
    });
  } catch {}
};

function sendPresenceHeartbeat() {
  activePeers.set(clientSessionId, Date.now());
  updateLiveConcurrentUI();
  fetch(NTFY_BASE, {
    method: 'POST',
    body: JSON.stringify({
      type: 'presence',
      sender: clientSessionId,
      ts: Date.now()
    })
  }).catch(() => {});
}

window.addEventListener('pagehide', () => {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(NTFY_BASE, JSON.stringify({
        type: 'leave',
        sender: clientSessionId,
        ts: Date.now()
      }));
    }
  } catch {}
});

async function initSharedServerSync() {
  // 0. Restore legacy First-Discoverer Easter Egg records from v5 topic
  try {
    const resV5 = await fetch(`https://ntfy.sh/${LEGACY_EGG_TOPIC}/json?poll=1&since=all`);
    const txtV5 = await resV5.text();
    for (const line of txtV5.trim().split('\n').filter(Boolean)) {
      try {
        const w = JSON.parse(line);
        if (w && w.event === 'message' && w.message) {
          const p = JSON.parse(w.message);
          if (p.type === 'egg_unlock' || p.type === 'vip_unlock') {
            await applyRemoteServerEvent(p, true, w.time || 0);
          }
        }
      } catch {}
    }
  } catch {}

  // 1. Fetch real server history from v8_real topic for accurate cumulative burns & active presence
  try {
    const res = await fetch(`${NTFY_BASE}/json?poll=1&since=all`);
    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    let maxReportedTotal = 0;
    for (const line of lines) {
      try {
        const wrapper = JSON.parse(line);
        if (wrapper && wrapper.event === 'message' && wrapper.message) {
          const payload = JSON.parse(wrapper.message);
          if (payload.type === 'burn' && typeof payload.totalAfter === 'number') {
            maxReportedTotal = Math.max(maxReportedTotal, payload.totalAfter);
          }
          await applyRemoteServerEvent(payload, true, wrapper.time || 0);
        }
      } catch {}
    }
    state.globalBurnTotal = Math.max(seenBurnIds.size, maxReportedTotal, state.burnedCount);
    updateGlobalBurnUI();
    saveState();
  } catch {}

  // 2. Announce our own presence and repeat every 25s
  sendPresenceHeartbeat();
  setInterval(sendPresenceHeartbeat, 120000); // ntfy.sh allows 250 messages per visitor IP a day

  // 3. Connect real-time SSE stream for instant 0.1s multiplayer broadcasts
  try {
    const es = new EventSource(`${NTFY_BASE}/sse`);
    es.onmessage = ev => {
      try {
        const wrapper = JSON.parse(ev.data);
        if (wrapper && wrapper.event === 'message' && wrapper.message) {
          const payload = JSON.parse(wrapper.message);
          applyRemoteServerEvent(payload, false, wrapper.time || 0);
        }
      } catch {}
    };
  } catch {}
}
initSharedServerSync();

document.getElementById('btn-wood').addEventListener('click', () => {
  if (!state.audioEnabled) toggleAudio(true);
  reviveFire(36, fireX, fireY - 40);
  stokeFire(52);
  showOracle(t('wood.thrown'), t('wood.tag'));
});

document.getElementById('btn-powder').addEventListener('click', () => {
  if (!state.audioEnabled) toggleAudio(true);
  state.paletteIndex = (state.paletteIndex + 1) % PALETTES.length;
  const pal = PALETTES[state.paletteIndex];
  stokeFire(36);
  showOracle(t('palette.changed', { name: pal.name }), t('palette.tag'));
});

function toggleAudio(forceState) {
  state.audioEnabled = forceState !== undefined ? forceState : !state.audioEnabled;
  audio.setRunning(state.audioEnabled);
  const audioIcon = document.getElementById('audio-icon');
  if (audioIcon) audioIcon.style.opacity = state.audioEnabled ? '1' : '0.45';
  const audioLabel = document.getElementById('audio-label');
  if (audioLabel) audioLabel.textContent = t(state.audioEnabled ? 'hud.sound' : 'hud.mute');
  document.getElementById('btn-audio')?.classList.toggle('active', state.audioEnabled);
  const muteBtn = document.getElementById('btn-toggle-mute');
  if (muteBtn) {
    muteBtn.textContent = t(state.audioEnabled ? 'audio.on' : 'audio.off');
  }
}

document.getElementById('btn-audio').addEventListener('click', () => {
  if (!state.audioEnabled) toggleAudio(true);
  document.getElementById('modal-audio').classList.add('open');
});
document.getElementById('btn-toggle-mute').addEventListener('click', () => toggleAudio());

['fire', 'rain', 'chime'].forEach(kind => {
  const slider = document.getElementById(`vol-${kind}`);
  const label = document.getElementById(`val-${kind}`);
  slider.addEventListener('input', () => {
    const v = Number(slider.value) / 100;
    label.textContent = `${slider.value}%`;
    if (kind === 'fire') state.volFire = v;
    if (kind === 'rain') state.volRain = v;
    if (kind === 'chime') state.volChime = v;
    audio.updateVolumes();
  });
});

// ── Viral Liberation Certificate Generator (#cert-canvas) ────────────────────
const SHARE_URL = 'https://bulmeong.netlify.app/';
function renderCertificate() {
  // the card is a snapshot of the stage; wait until a written note has burned away
  if (activeNote) {
    setTimeout(renderCertificate, 250);
    return;
  }
  rollDay();
  const c = document.getElementById('cert-canvas');
  const g = c.getContext('2d');
  const Wc = c.width, Hc = c.height;
  // the live scene around the fire, cropped to 4:5
  const sw = Math.min(canvas.width, canvas.height * 0.8);
  const sh = Math.min(canvas.height, sw * 1.25);
  const sx = Math.max(0, Math.min(canvas.width - sw, fireX * DPR - sw / 2));
  const sy = Math.max(0, Math.min(canvas.height - sh, fireY * DPR - sh * 0.6));
  g.fillStyle = '#0b0d14';
  g.fillRect(0, 0, Wc, Hc);
  g.drawImage(canvas, sx, sy, sw, sh, 0, 0, Wc, Hc);

  const shade = (y0, y1, a0, a1) => {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, `rgba(8, 7, 12, ${a0})`);
    gr.addColorStop(1, `rgba(8, 7, 12, ${a1})`);
    g.fillStyle = gr;
    g.fillRect(0, y0, Wc, y1 - y0);
  };
  shade(0, 330, 0.85, 0);
  shade(Hc - 380, Hc, 0, 0.9);

  const css = getComputedStyle(document.documentElement);
  const titleFont = css.getPropertyValue('--font-title').trim() || 'serif';
  const bodyFont = css.getPropertyValue('--font-serif').trim() || 'serif';
  g.textAlign = 'center';
  g.fillStyle = '#fff4e0';
  g.font = `400 92px ${titleFont}`;
  g.fillText(t('title.name'), Wc / 2, 150);
  g.fillStyle = 'rgba(240, 200, 140, 0.9)';
  g.font = `700 34px ${bodyFont}`;
  g.fillText(t('title.tagline'), Wc / 2, 210, Wc - 120);

  const found = Object.keys(state.eggAlbum || {}).length;
  g.fillStyle = '#ffe3b0';
  g.font = `700 40px ${bodyFont}`;
  g.fillText(t('share.stats', { n: state.burnedToday, temp: state.maxTempToday.toLocaleString(LOCALE), found }), Wc / 2, Hc - 170, Wc - 100);
  g.fillStyle = 'rgba(255, 235, 210, 0.7)';
  g.font = `500 30px ${bodyFont}`;
  g.fillText(`${new Date().toLocaleDateString(LOCALE)} · ${SHARE_URL.replace('https://', '').replace(/\/$/, '')}`, Wc / 2, Hc - 100);
}

document.getElementById('btn-share-card').addEventListener('click', async () => {
  const text = `${t('share.text', { n: state.burnedToday })} ${SHARE_URL}`;
  try {
    const blob = await new Promise(r => document.getElementById('cert-canvas').toBlob(r, 'image/jpeg', 0.9));
    const file = new File([blob], 'bulmeong.jpg', { type: 'image/jpeg' });
    if (navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text });
    if (navigator.share) return await navigator.share({ text });
  } catch (e) {
    if (e.name === 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showOracle(t('share.copied'), t('share.btn'));
  } catch {}
});

document.getElementById('btn-cert').addEventListener('click', () => {
  renderCertificate();
  document.getElementById('modal-cert').classList.add('open');
});

document.getElementById('btn-download-cert').addEventListener('click', () => {
  const c = document.getElementById('cert-canvas');
  const link = document.createElement('a');
  link.download = `bulmeong-${Date.now()}.jpg`;
  link.href = c.toDataURL('image/jpeg', 0.9);
  link.click();
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.getAttribute('data-close')).classList.remove('open');
  });
});

requestAnimationFrame(drawScene);
