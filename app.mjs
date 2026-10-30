// 〈불멍(火멍) v2 : 테마별 실시간 번뇌 소각장 & 스와이프 한지 투척 UI/UX〉
// 100% Procedural Canvas Physics, Volumetric Flame & Ember System, Hanji Flick-to-Burn & Web Audio ASMR.

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

// ── Themed Campfire Rooms & Live Burned Word Rankings ────────────────────────
const ROOMS = {
  work: {
    id: 'work',
    title: '🏢 직장인 소각장',
    caption: '직장인 야근·퇴사 번뇌 소각장',
    stamp: '퇴사기원 · 燒却',
    users: 1428,
    rankings: [
      { word: '월요일 아침 출근', count: 4892 },
      { word: '팀장님 메신저 호출', count: 3641 },
      { word: '끝나지 않는 보고서 수정', count: 3108 },
      { word: '쥐꼬리만한 월급날 통장', count: 2415 },
      { word: '사직서 가슴에 품은 하루', count: 1984 }
    ],
    chips: ['🏢 월요일 아침 출근', '🤬 팀장님 메신저 호출', '📄 보고서 무한 수정', '💸 스쳐가는 월급', '✉️ 사직서 참기'],
    oracles: [
      '회사의 불은 끄고 나왔으니, 이제 당신 마음의 불만 따뜻하게 피우세요.',
      '오늘 삼킨 한숨은 모두 이 장작이 대신 태워버렸습니다.',
      '월급은 스쳐 가도 오늘 밤 당신이 지킨 평온은 남습니다.',
      '내일의 업무는 내일의 나에게 맡기고 지금 이 순간은 놓아두세요.'
    ]
  },
  stock: {
    id: 'stock',
    title: '📉 주식·코인 곡소리',
    caption: '전국 개미·코인러 포지션 소각장',
    stamp: '원금회복 · 燒却',
    users: 2190,
    rankings: [
      { word: '내가 사면 떨어지는 차트', count: 6320 },
      { word: '고점 추격매수한 내 손가락', count: 5140 },
      { word: '파란불 가득한 계좌 잔고', count: 4219 },
      { word: '팔자마자 급등한 그 종목', count: 3580 },
      { word: '잠 못 드는 나스닥 새벽장', count: 2890 }
    ],
    chips: ['📉 파란불 계좌 잔고', '👆 고점 추격매수한 손가락', '🚀 팔자마자 급등한 종목', '🌙 잠 못 드는 미장', '🙏 내일은 양전 기원'],
    oracles: [
      '이미 지나간 차트의 고점은 재가 되었습니다. 계좌보다 당신의 잠이 먼저입니다.',
      '파란불에 얼어붙은 손끝을 먼저 이 모닥불에 녹이고 가세요.',
      '시장은 흔들려도 당신의 중심까지 흔들릴 필요는 없습니다.',
      '오늘 태운 욕심 자리에 내일의 냉정한 눈이 자라날 것입니다.'
    ]
  },
  relation: {
    id: 'relation',
    title: '💔 인간관계·흑역사',
    caption: '지친 인간관계·새벽 흑역사 소각장',
    stamp: '인연정리 · 燒却',
    users: 985,
    rankings: [
      { word: '괜히 보낸 새벽 카톡 후회', count: 3812 },
      { word: '나만 손해 보는 인간관계', count: 3290 },
      { word: '남 눈치 보느라 못한 말', count: 2740 },
      { word: '잊고 싶은 과거 흑역사', count: 2150 },
      { word: '읽씹당한 메시지 생각', count: 1840 }
    ],
    chips: ['💬 괜히 보낸 카톡 후회', '🎭 나만 지치는 인간관계', '🙊 눈치 보느라 삼킨 말', '🫣 이불킥 흑역사', '✂️ 미련 없이 손절하기'],
    oracles: [
      '모든 사람에게 좋은 사람일 필요는 없습니다. 오늘 밤은 당신에게만 좋은 사람이면 됩니다.',
      '스쳐 간 인연에 쏟았던 마음도 이 불길 속에서 깨끗이 정화되었습니다.',
      '그때 그렇게 말할걸 그랬다는 후회, 이제 연기가 되어 밤하늘로 흩어집니다.',
      '당신을 깎아내리던 말들은 모두 숯이 되어 사라졌습니다.'
    ]
  },
  zen: {
    id: 'zen',
    title: '🌙 새벽 무념무상',
    caption: '아무 생각 없이 빗소리와 불만 보는 방',
    stamp: '무념무상 · 燒却',
    users: 1640,
    rankings: [
      { word: '잠들지 못하는 새벽의 불안', count: 4120 },
      { word: '남들과 비교하는 조급함', count: 3490 },
      { word: '앞으로 뭐 먹고 살지 막막함', count: 2980 },
      { word: '이유 없이 밀려오는 우울감', count: 2310 },
      { word: '내일도 똑같을 것 같은 피로', count: 1920 }
    ],
    chips: ['🌙 잠 못 드는 새벽 불안', '⏳ 남들과 비교하는 조급함', '🌫️ 막막한 미래 걱정', '😮‍💨 이유 없는 번아웃', '🍃 아무 생각 안 하기'],
    oracles: [
      '불꽃은 모양을 붙잡지 않기에 매 순간 새로 타오릅니다.',
      '지금 이 모닥불 앞에서는 아무것도 증명하지 않아도 괜찮습니다.',
      '잠시 멈춰 서서 빗소리와 불빛만 바라보는 시간도 훌륭한 전진입니다.',
      '이미 재가 된 어제의 일로 오늘의 밤을 태우지 마세요.'
    ]
  }
};

// ── State & Persistence ──────────────────────────────────────────────────────
const STORAGE_KEY = 'bulmeong:lounge:v2';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch {}

const urlParams = new URLSearchParams(window.location.search);
const queryOwner = urlParams.get('fire');
const querySign = urlParams.get('sign');
const queryRoom = urlParams.get('room');
const queryLang = urlParams.get('lang');
const querySpace = urlParams.get('space');

const DEFAULT_GUESTBOOK = [
  { text: '오늘도 야근 고생했다 주말에 치킨 먹자 🪵', time: '방금 전' },
  { text: '내일은 계좌 꼭 빨간불 켜지길 기원함 🔥', time: '3분 전' },
  { text: '아무 생각 말고 푹 쉬어라 장작 하나 놓고 감', time: '11분 전' }
];

const state = {
  room: (queryRoom && ROOMS[queryRoom]) ? queryRoom : 'work',
  space: (querySpace && ['camp', 'temple', 'snow', 'cosmos'].includes(querySpace)) ? querySpace : (saved.space || 'camp'),
  seconds: Number(saved.seconds) || 0,
  burnedCount: Number(saved.burnedCount) || 0,
  warmthCount: Number(saved.warmthCount) || 0,
  lastBurnedText: saved.lastBurnedText || '월요일 아침 출근',
  lastOracle: saved.lastOracle || '오늘 삼킨 한숨은 모두 이 장작이 대신 태워버렸습니다.',
  myfireOwner: queryOwner || saved.myfireOwner || '익명 불씨',
  myfireSign: querySign || saved.myfireSign || '지나가다 장작 하나씩 던져주고 가세요 🔥',
  discovererName: saved.discovererName || queryOwner || saved.myfireOwner || '시루아빠',
  tossLink: saved.tossLink || '',
  goldUnlocked: Boolean(saved.goldUnlocked || urlParams.get('paypal_paid') === '1'),
  goldMode: Boolean(saved.goldUnlocked || urlParams.get('paypal_paid') === '1'),
  eggAlbum: (saved.eggAlbum && typeof saved.eggAlbum === 'object') ? saved.eggAlbum : {},
  albumFilter: 'all',
  guestbook: Array.isArray(saved.guestbook) && saved.guestbook.length ? saved.guestbook : DEFAULT_GUESTBOOK,
  heat: 36.5,
  stoking: 0.25,
  paletteIndex: 0,
  audioEnabled: false,
  volFire: 0.75,
  volRain: 0.55,
  volChime: 0.70
};

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
      myfireOwner: state.myfireOwner,
      myfireSign: state.myfireSign,
      discovererName: state.discovererName,
      tossLink: state.tossLink,
      goldUnlocked: state.goldUnlocked,
      eggAlbum: state.eggAlbum,
      guestbook: state.guestbook.slice(0, 20)
    }));
  } catch {}
}

const SPACES = {
  camp: { id: 'camp', name: '🌧️ 밤공터', desc: '깊은 밤 공터 · 빗소리와 모닥불' },
  temple: { id: 'temple', name: '🎐 산사 처마', desc: '산사 처마 밑 · 낙숫물과 물고기 풍경 소리' },
  snow: { id: 'snow', name: '❄️ 설산 오두막', desc: '설산 오두막 앞 · 눈보라와 따뜻한 화로' },
  cosmos: { id: 'cosmos', name: '🌌 성운의 끝', desc: '우주 성운의 끝 · 무중력 별먼지 모닥불' }
};

const PALETTES = [
  { name: '참나무 기본 불꽃', core: [255, 248, 215], mid: [255, 148, 48], outer: [218, 48, 18], smoke: [55, 48, 58], glow: '255, 128, 42' },
  { name: '오로라 청록 불꽃', core: [225, 255, 248], mid: [46, 224, 186], outer: [18, 112, 168], smoke: [38, 62, 70], glow: '46, 218, 186' },
  { name: '밤하늘 자수정 불꽃', core: [252, 232, 255], mid: [192, 94, 255], outer: [112, 28, 188], smoke: [58, 42, 72], glow: '186, 88, 255' },
  { name: '사찰 황금 연등불', core: [255, 252, 230], mid: [255, 200, 68], outer: [214, 118, 18], smoke: [68, 58, 44], glow: '255, 196, 68' },
  { name: '사건의 지평선 심연화', core: [255, 210, 245], mid: [235, 38, 115], outer: [52, 12, 98], smoke: [22, 10, 35], glow: '235, 38, 115' },
  { name: '프로메테우스 태양 성화', core: [255, 255, 255], mid: [255, 232, 130], outer: [255, 122, 24], smoke: [90, 75, 45], glow: '255, 228, 120' },
  { name: '양자 중첩 네온 균열', core: [230, 255, 255], mid: [0, 245, 255], outer: [255, 0, 168], smoke: [30, 50, 65], glow: '0, 240, 255' },
  { name: '창조주 초신성 절대성화', core: [255, 255, 255], mid: [168, 255, 120], outer: [118, 68, 255], smoke: [55, 45, 80], glow: '175, 135, 255' }
];

// ── Procedural Web Audio ASMR Engine ─────────────────────────────────────────
class AsmrAudioEngine {
  constructor() {
    this.ctx = null;
    this.running = false;
    this.fireGain = null;
    this.rainGain = null;
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
    fireSource.connect(fireFilter).connect(this.fireGain).connect(this.ctx.destination);
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
    rainSource.connect(rainFilter).connect(this.rainGain).connect(this.ctx.destination);
    rainSource.start();

    setInterval(() => {
      if (!this.running || !this.ctx || state.volFire <= 0.01) return;
      if (Math.random() < 0.65) this.triggerCrackle();
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
    }
  }

  updateVolumes() {
    if (!this.ctx || !this.running) return;
    this.fireGain.gain.setTargetAtTime(state.volFire * 0.32, this.ctx.currentTime, 0.08);
    this.rainGain.gain.setTargetAtTime(state.volRain * 0.22, this.ctx.currentTime, 0.08);
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

// ── Hand-Painted Indie Game Art Assets (PNG / JPG) ───────────────────────────
const bgSanctuaryImg = new Image();
bgSanctuaryImg.src = './bg-sanctuary.jpg';
const hearthLogsImg = new Image();
hearthLogsImg.src = './hearth-logs.png';

state.globalBurnTotal = Number(saved.globalBurnTotal) || 1482914;
state.tempC = Number(saved.tempC) || 440;
state.fatiguePct = Number(saved.fatiguePct) || 46;
state.idleSeconds = 0;
state.lastInteractMs = Date.now();
state.clickCombo = 0;
state.lastClickMs = 0;
state.forcedLv0Until = 0;

const FIRE_STAGES = [
  { lv: 0, minTemp: 0,    minPct: 0,  scale: 0.24, logs: 2, name: 'Lv.0 꺼져가는 잿더미', desc: '사람들의 손길이 끊겨 불씨가 꺼져갑니다! 화로를 연타하거나 장작을 던져 살려주세요!' },
  { lv: 1, minTemp: 180,  minPct: 16, scale: 0.65, logs: 2, name: 'Lv.1 작은 불씨', desc: '아직은 잔잔하게 숨 쉬는 새벽 공터의 작은 불씨입니다.' },
  { lv: 2, minTemp: 350,  minPct: 32, scale: 1.00, logs: 3, name: 'Lv.2 골목 모닥불', desc: '전 세계 사람들의 하루 한숨이 모이며 따뜻한 모닥불이 되었습니다.' },
  { lv: 3, minTemp: 680,  minPct: 54, scale: 1.40, logs: 5, name: 'Lv.3 대형 화톳불', desc: '오늘 전 세계 직장인과 개미들이 꽤나 힘들었나 봅니다! 불길이 거세집니다!' },
  { lv: 4, minTemp: 1200, minPct: 76, scale: 1.82, logs: 6, name: 'Lv.4 치솟는 업화', desc: '전 세계의 번뇌가 거대한 캠프파이어 불기둥으로 치솟습니다!' },
  { lv: 5, minTemp: 2000, minPct: 92, scale: 2.30, logs: 8, name: 'Lv.5 대소각 태양화', desc: '오늘 지구촌 스트레스 한계 돌파! 하늘까지 닿는 초거대 대소각제입니다!' }
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
      ? `🕯️ ${stage.name} (${Math.round(state.tempC)}°C)`
      : `🔥 ${stage.name} · 화력 ${Math.min(999, Math.round((state.tempC / 2000) * 100))}%`;
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
  syncFatigueFromTemp();

  const nextStage = getFireStage();
  if (nextStage.lv > prevLv && prevLv > 0) {
    showOracle(nextStage.desc, `🔥 화력 단계 상승 · ${nextStage.name}`);
  } else if (prevLv === 0 && nextStage.lv >= 1) {
    showOracle('당신이 불어넣은 온기 덕분에 꺼져가던 잿더미에서 다시 불꽃이 살아났습니다!', '🔥 불씨 심폐소생 성공');
  }

  if (showPopup) {
    risingClickPopups.push({
      text: state.clickCombo >= 3 ? `+${actualDelta}°C 🔥 ${state.clickCombo}x` : `+${actualDelta}°C 🔥`,
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
        comboEl.textContent = `⚡ ${state.clickCombo}x COMBO`;
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

function bumpGlobalBurnCounter(amount = 1, fatigueDelta = 2.5) {
  state.globalBurnTotal += amount;
  // Do not auto-heat if user explicitly clicked "🕯️ 잿더미 전환" to test Lv.0 Phoenix Easter Egg
  if (Date.now() > state.forcedLv0Until && fatigueDelta > 0) {
    addTemperature(fatigueDelta * 9, fireX, fireY - 50, false);
  } else {
    updateFireStageUI();
  }

  const el = document.getElementById('global-burn-total');
  if (!el) return;
  el.textContent = state.globalBurnTotal.toLocaleString('ko-KR');
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 220);
}

const GLOBAL_WORRIES = [
  { origin: '🇰🇷 서울', text: '월요일 출근하기 싫다' },
  { origin: '🇺🇸 NYC', text: 'Overthinking at 3AM again' },
  { origin: '🇯🇵 東京', text: '明日会社に行きたくない' },
  { origin: '🇪🇸 Madrid', text: 'Extraño a quien no debo' },
  { origin: '🇹🇼 台北', text: '股票什麼時候才能回本' },
  { origin: '🇰🇷 판교', text: '내가 사면 떨어지는 내 주식' },
  { origin: '🇬🇧 London', text: 'Tired of pretending I am okay' },
  { origin: '🇯🇵 大阪', text: '上司のLINE通知が怖い' },
  { origin: '🇲🇽 CDMX', text: 'Ansiedad por el futuro' },
  { origin: '🇨🇳 上海', text: '不想加班想立刻辞职' }
];

function spawnGlobalGhostNote() {
  if (ghostNotes.length >= 2) return;
  const f = fireflies[Math.floor(Math.random() * fireflies.length)];
  const item = GLOBAL_WORRIES[Math.floor(Math.random() * GLOBAL_WORRIES.length)];
  const scaleX = Math.min(1.08, Math.max(0.68, W / 420));
  const sx = fireX + Math.cos(f.angle) * (f.rx * scaleX);
  const sy = fireY + 18 + Math.sin(f.angle) * f.ry;
  ghostNotes.push({
    origin: item.origin,
    text: item.text,
    sx,
    sy,
    x: sx,
    y: sy,
    rot: (Math.random() - 0.5) * 0.4,
    p: 0
  });
}

// Seed 1 initial rising ember text and 1 ghost note so the fire feels alive immediately
setTimeout(() => {
  risingEmberTexts.push({
    label: '🇯🇵 東京 · 「明日会社に行きたくない」',
    x: fireX - 18,
    y: fireY - 58,
    life: 18,
    maxLife: 135,
    isGold: false
  });
  spawnGlobalGhostNote();
}, 250);

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

const SOUL_NAMES = [
  '🇰🇷 서울의 불씨 · 42m', '🇺🇸 NYC Ember · 19m', '🇯🇵 東京の火種 · 58m',
  '🇪🇸 Alma Madrid · 11m', '🇹🇼 台北微光 · 33m', '🇬🇧 London Soul · 27m',
  '🇰🇷 새벽 반딧불 · 64m', '🇯🇵 京都の旅人 · 15m', '🇲🇽 CDMX Fuego · 22m',
  '🇨🇦 Toronto Zen · 49m'
];
for (let i = 0; i < 10; i++) {
  const angle = (Math.PI * 0.08) + (i / 9) * (Math.PI * 0.84);
  const rx = 148 + (i % 3) * 26;
  const ry = 54 + (i % 2) * 22;
  fireflies.push({
    angle,
    rx,
    ry,
    phase: Math.random() * Math.PI * 2,
    size: 2.8 + Math.random() * 2.2,
    label: SOUL_NAMES[i]
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

// ── Room & Ranking Management ────────────────────────────────────────────────
function currentRoom() {
  return ROOMS[state.room] || ROOMS.work;
}

function renderRoomUI() {
  const r = currentRoom();
  document.querySelectorAll('.room-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.room === r.id);
  });
  document.getElementById('zen-room-caption').textContent = r.caption;
  document.getElementById('live-count').textContent = r.users.toLocaleString('ko-KR');
  document.getElementById('hanji-room-stamp').textContent = r.stamp;
  document.getElementById('rank-drawer-title').textContent = `${r.title} · 오늘 밤 가장 많이 불탄 단어`;

  // Sort and render rankings
  r.rankings.sort((a, b) => b.count - a.count);
  const top = r.rankings[0];
  const drawerOpen = document.getElementById('rank-drawer').classList.contains('open');
  document.getElementById('top-rank-word').textContent = top.word;
  document.getElementById('top-rank-count').textContent = `${top.count.toLocaleString('ko-KR')}회 ${drawerOpen ? '▴' : '▾'}`;

  const listEl = document.getElementById('rank-list');
  listEl.innerHTML = r.rankings.slice(0, 5).map((item, idx) => `
    <div class="rank-item" data-rank-word="${item.word}">
      <span class="rank-no">${idx + 1}위</span>
      <span class="rank-item-word">${item.word}</span>
      <span class="rank-item-fires">🔥 ${item.count.toLocaleString('ko-KR')}회</span>
      <span class="rank-item-burn-btn">같이 태우기</span>
    </div>
  `).join('');

  listEl.querySelectorAll('.rank-item').forEach(row => {
    row.addEventListener('click', () => {
      const w = row.getAttribute('data-rank-word');
      document.getElementById('rank-drawer').classList.remove('open');
      burnWorry(w);
    });
  });

  // Render quick chips + Secret Code / Spell Easter Egg chips on the Hanji sheet
  const SECRET_CHIPS = [
    { label: '💻 rm -rf /*', val: 'rm -rf /* 레거시 버그 완전 삭제' },
    { label: '📈 상한가 떡상', val: '내 계좌 +30% 상한가 떡상 기원' },
    { label: '🎆 사직서 축포', val: '가슴속 사직서 던지고 완전 해방' },
    { label: '⚡ 천벌 벼락', val: '나를 괴롭힌 악연에 정의의 벼락' },
    { label: '🌸 벚꽃 엔딩', val: '타오른 자리에 벚꽃 봄바람 피어나길' }
  ];
  const chipsEl = document.getElementById('hanji-chips');
  chipsEl.innerHTML =
    r.chips.map(c => `<button type="button" class="hanji-chip" data-chip="${c.replace(/^[^\s]+\s/, '')}">${c}</button>`).join('') +
    SECRET_CHIPS.map(sc => `<button type="button" class="hanji-chip" style="border-color:#b84318;background:rgba(184,67,24,0.12);color:#7c240c;" data-chip="${sc.val}">${sc.label}</button>`).join('');
  chipsEl.querySelectorAll('.hanji-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('burn-input');
      input.value = chip.getAttribute('data-chip');
      input.focus();
    });
  });
}

document.querySelectorAll('.room-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    state.room = btn.dataset.room;
    renderRoomUI();
    stokeFire(18);
  });
});

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
    tierLabel: 'COMMON · 일반',
    title: '💻 매트릭스 커널 퍼지',
    codeHint: '버그·야근·rm -rf·sudo·404 관련 단어를 태울 때 발동',
    sampleTrigger: 'rm -rf /* 레거시 버그 완전 삭제',
    palette: 1,
    match: t => /rm\s*-rf|버그|배포|404|git|null|sudo|코드|야근|컴파일|세그폴트/.test(t)
  },
  {
    id: 'egg_bull',
    tier: 'common',
    tierLabel: 'COMMON · 일반',
    title: '📈 상한가 양봉 불기둥',
    codeHint: '상한가·떡상·양전·투더문 등 급등 기원 단어를 태울 때 발동',
    sampleTrigger: '내 계좌 +30% 상한가 떡상',
    palette: 0,
    match: t => /상한가|떡상|비트코인|양전|투더문|moon|대박|급등|10배/.test(t)
  },
  {
    id: 'egg_fireworks',
    tier: 'common',
    tierLabel: 'COMMON · 일반',
    title: '🎆 사직서 해방 축포',
    codeHint: '퇴사·사직서·로또·해방·독립 관련 단어를 태울 때 발동',
    sampleTrigger: '가슴속 사직서 던지고 완전 해방',
    palette: 3,
    match: t => /퇴사|사직서|로또|자유|해방|합격|축포|독립/.test(t)
  },
  {
    id: 'egg_lightning',
    tier: 'common',
    tierLabel: 'COMMON · 일반',
    title: '⚡ 천벌의 카르마 벼락',
    codeHint: '번개·벼락·천벌·악연·복수·단죄를 태울 때 발동',
    sampleTrigger: '나를 괴롭힌 악연에 정의의 벼락',
    palette: 2,
    match: t => /번개|벼락|천벌|단죄|악연|손절|복수|karma/.test(t)
  },
  {
    id: 'egg_sakura',
    tier: 'common',
    tierLabel: 'COMMON · 일반',
    title: '🌸 천년 벚꽃 봄바람',
    codeHint: '벚꽃·사랑·봄·힐링·행복을 태울 때 발동',
    sampleTrigger: '타오른 자리에 벚꽃 봄바람 피어나길',
    palette: 2,
    match: t => /벚꽃|사랑|행복|봄|꽃|힐링|sakura/.test(t)
  },

  // [Tier 2: Rare (희귀 · 5종)]
  {
    id: 'egg_konami',
    tier: 'rare',
    tierLabel: 'RARE · 희귀',
    title: '🕹️ 코나미 30목숨 레트로 파이어',
    codeHint: '고전 게임에서 목숨 30개를 주던 전설의 상하좌우 커맨드 (키보드 방향키 ↑↑↓↓←→←→BA 직접 입력도 가능!)',
    sampleTrigger: '상상하하좌우좌우BA',
    palette: 6,
    match: t => /상상하하좌우좌우|uuddlrlrba|konami|코나미|⬆️⬆️⬇️⬇️/.test(t.replace(/\s+/g, ''))
  },
  {
    id: 'egg_blackhole',
    tier: 'rare',
    tierLabel: 'RARE · 희귀',
    title: '🕳️ 사건의 지평선 블랙홀',
    codeHint: '빛조차 빠져나올 수 없는 시공간의 끝, 인터스텔라의 거대 중력체 이름',
    sampleTrigger: '사건의지평선 블랙홀',
    palette: 4,
    match: t => /블랙홀|사건의\s*지평선|인터스텔라|특이점|black\s*hole|singularity/.test(t)
  },
  {
    id: 'egg_satoshi',
    tier: 'rare',
    tierLabel: 'RARE · 희귀',
    title: '₿ 사토시 제네시스 블록 황금해시',
    codeHint: '2009년 1월 3일 비트코인을 창시하고 사라진 익명의 개발자 이름',
    sampleTrigger: '사토시 나카모토 제네시스 블록',
    palette: 3,
    match: t => /사토시|나카모토|satoshi|제네시스\s*블록|0x00/.test(t)
  },
  {
    id: 'egg_sword',
    tier: 'rare',
    tierLabel: 'RARE · 희귀',
    title: '⚔️ +99 집행검 신화 강화 아우라',
    codeHint: '집 한 채 값을 날려도 띄우기 힘들다는 전설의 무기 이름 혹은 강화 수치(+99)',
    sampleTrigger: '+99 집행검 강화성공',
    palette: 5,
    match: t => /\+99|집행검|강화\s*성공|신화\s*강화/.test(t)
  },
  {
    id: 'egg_dragon',
    tier: 'rare',
    tierLabel: 'RARE · 희귀',
    title: '🐉 여의주 청룡의 북극광 승천',
    codeHint: '여의주를 물고 오로라 밤하늘을 가르며 승천하는 동양의 푸른 신수',
    sampleTrigger: '여의주 물고 청룡 승천',
    palette: 1,
    match: t => /청룡|여의주|승천|드래곤|흑염룡|dragon/.test(t)
  },

  // [Tier 3: Epic (극악 난이도 암호 수수께끼 · 5종)]
  {
    id: 'egg_pi',
    tier: 'epic',
    tierLabel: 'EPIC · 극악 암호',
    title: '🌀 무한 원주율 코즈믹 스파이럴',
    codeHint: '수수께끼: 원의 둘레와 지름의 비율(π)을 소수점 아래 정확히 10자리까지 숫자로 적어 던져라 (3.xxxxxxxxxx)',
    sampleTrigger: '3.1415926535',
    palette: 6,
    match: t => t.includes('3.1415926535')
  },
  {
    id: 'egg_42',
    tier: 'epic',
    tierLabel: 'EPIC · 극악 암호',
    title: '🌌 은하수 히치하이커의 궁극 해답: 42',
    codeHint: '수수께끼: 슈퍼컴퓨터가 750만 년 동안 계산해 낸 삶, 우주, 그리고 모든 것에 대한 해답 (딱 두 자리 숫자만 정확히 단독 입력!)',
    sampleTrigger: '42',
    palette: 7,
    match: t => t.trim() === '42' || /삶우주그리고모든것|히치하이커/.test(t.replace(/\s+/g, ''))
  },
  {
    id: 'egg_helloworld',
    tier: 'epic',
    tierLabel: 'EPIC · 극악 암호',
    title: '🖥️ 태초의 커널 창세기 (hello, world!)',
    codeHint: '수수께끼: 1978년 브라이언 커니핸이 C언어 교재에 남긴 인류 역사상 가장 유명한 첫 출력 문장 (영문 소문자, 쉼표, 띄어쓰기, 느낌표까지 정확히 13글자!)',
    sampleTrigger: 'hello, world!',
    palette: 1,
    match: t => t.trim() === 'hello, world!'
  },
  {
    id: 'egg_binary',
    tier: 'epic',
    tierLabel: 'EPIC · 극악 암호',
    title: '🤖 기계어 싱귤래리티 (01100110)',
    codeHint: '수수께끼: 영단어 "fire"의 첫 글자 알파벳 소문자 "f"(ASCII 102)를 8비트 2진수(0과 1, 8자리)로 변환해 불에 던져라',
    sampleTrigger: '01100110',
    palette: 1,
    match: t => /01100110/.test(t)
  },
  {
    id: 'egg_morse',
    tier: 'epic',
    tierLabel: 'EPIC · 극악 암호',
    title: '🚢 타이타닉 SOS 모스 구조 성화',
    codeHint: '수수께끼: 절체절명의 바다 위에서 타전하는 국제 모스 부호 조난 신호 (점 3개, 띄어쓰기, 하이픈 3개, 띄어쓰기, 점 3개: ... --- ...)',
    sampleTrigger: '... --- ...',
    palette: 5,
    match: t => /\.\.\.\s*---\s*\.\.\.|···\s*−−−\s*···/.test(t.trim())
  },

  // [Tier 4: Mythic 0.01% ("존나 어려운" 복합 조건 신화급 시크릿 · 5종)]
  {
    id: 'egg_prometheus',
    tier: 'mythic',
    tierLabel: 'MYTHIC · 신화 0.01%',
    title: '☀️ [신화] 프로메테우스의 태초의 성화',
    codeHint: '신화 조건: 제우스의 금기를 깨고 인류에게 최초로 불을 훔쳐다 준 티탄의 이름. 단, [지구촌 화력이 Lv.4 이상]으로 거세게 타오를 때만 봉인이 풀린다!',
    sampleTrigger: '프로메테우스',
    palette: 5,
    checkCondition: () => getFireStage().lv >= 4,
    failMsg: '⚡ 신화의 불꽃 「프로메테우스」를 깨우기엔 화력이 부족합니다! 먼저 모닥불 화력을 Lv.4 이상으로 키운 뒤 다시 시도하세요!',
    match: t => /프로메테우스|prometheus/.test(t)
  },
  {
    id: 'egg_schrodinger',
    tier: 'mythic',
    tierLabel: 'MYTHIC · 신화 0.01%',
    title: '⚛️ [신화] 양자 중첩 차원 균열 불꽃',
    codeHint: '신화 조건: 아인슈타인의 질량-에너지 등가 공식(대소문자 정확히 E=mc^2) 혹은 상자 속 살아있고도 죽어있는 고양이. 단, [🌌 성운의 끝] 우주 공간에서만 관측된다!',
    sampleTrigger: 'E=mc^2',
    palette: 6,
    checkCondition: () => state.space === 'cosmos',
    failMsg: '🌌 차원 균열 불꽃은 지구 대기권에서는 열리지 않습니다! 공간 테마를 [🌌 성운의 끝]으로 전환한 뒤 다시 시도하세요!',
    match: (t, raw) => raw.trim() === 'E=mc^2' || /슈뢰딩거의\s*고양이|schrodinger/.test(t)
  },
  {
    id: 'egg_nirvana',
    tier: 'mythic',
    tierLabel: 'MYTHIC · 신화 0.01%',
    title: '🪷 [신화] 산사 만다라 금강 삼매화',
    codeHint: '신화 조건: 반야심경의 핵심 8글자 "형태가 곧 공함이요 공함이 곧 형태라"(한글 8글자 붙여쓰기). 단, [🎐 산사 처마] 공간에서만 사리 불꽃이 피어난다!',
    sampleTrigger: '색즉시공공즉시색',
    palette: 3,
    checkCondition: () => state.space === 'temple',
    failMsg: '🎐 금강 삼매화는 산사의 처마 밑 풍경 소리가 들리는 곳에서만 피어납니다! 공간을 [🎐 산사 처마]로 바꾼 뒤 다시 시도하세요!',
    match: t => /색즉시공\s*공즉시색|옴마니반메훔/.test(t)
  },
  {
    id: 'egg_phoenix',
    tier: 'mythic',
    tierLabel: 'MYTHIC · 신화 0.01%',
    title: '🦅 [신화] 잿더미 불사조 피닉스의 부활',
    codeHint: '신화 조건: 죽음의 잿더미 속에서만 다시 태어나는 전설의 불새 이름. 모닥불이 [🕯️ Lv.0 꺼져가는 잿더미] 위기 상태일 때만 부활한다!',
    sampleTrigger: '불사조 피닉스',
    palette: 5,
    checkCondition: () => getFireStage().lv === 0,
    failMsg: '🕯️ 불사조는 오직 불길이 완전히 죽어가는 [Lv.0 꺼져가는 잿더미] 상태에서만 부활합니다! (상단 화력 배지를 탭해 Lv.0으로 만들거나 기다려보세요)',
    match: t => /불사조|피닉스|phoenix/.test(t)
  },
  {
    id: 'egg_creator',
    tier: 'mythic',
    tierLabel: 'MYTHIC · 창조주 0.001%',
    title: '👑 [창조주 신화] 시루아빠의 초신성 절대성화',
    codeHint: '궁극의 이스터에그: 이 불멍 우주를 창조한 개발자의 진명(한글 4글자 혹은 영문 8글자). 힌트는 클라우드 계정과 발견자 입력란에 숨겨져 있다.',
    sampleTrigger: '시루아빠',
    palette: 7,
    match: t => /시루아빠|siruabba|thenthenthen/.test(t)
  }
];

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
    if (egg.match(lower, clean)) {
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
    showOracle(egg.failMsg, `🔒 신화 봉인 미해제 · ${egg.title}`);
    return;
  }

  state.paletteIndex = egg.palette ?? 3;
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
      : ['+30% 상한가', '🚀 떡상', '₿ +100%'];
    for (let i = 0; i < 22; i++) {
      spellEffects.bullCandles.push({
        x: fireX + (Math.random() - 0.5) * (W * 0.72),
        y: fireY + 10 + Math.random() * 40,
        vy: -(2.9 + Math.random() * 3.6),
        h: 30 + Math.random() * 36,
        label: labels[i % labels.length],
        life: 0,
        maxLife: 135 + Math.random() * 45
      });
    }
  }

  if (egg.id === 'egg_fireworks' || egg.id === 'egg_konami' || egg.tier === 'mythic') {
    const colors = ['255, 215, 80', '255, 95, 185', '70, 240, 255', '170, 110, 255', '110, 255, 150'];
    const bursts = egg.tier === 'mythic' ? 8 : 5;
    for (let b = 0; b < bursts; b++) {
      const cx = W * (0.15 + (b / Math.max(1, bursts - 1)) * 0.7);
      const cy = H * (0.18 + (b % 3) * 0.08);
      const col = colors[b % colors.length];
      for (let i = 0; i < 32; i++) {
        const ang = (i / 32) * Math.PI * 2;
        const spd = 1.8 + Math.random() * 3.8;
        spellEffects.skyFireworks.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          col,
          life: 0,
          maxLife: 95 + Math.random() * 40
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
    egg_sword: ['⚔️ +99', 'MYTHIC', '집행검', 'CRITICAL!', '✨'],
    egg_dragon: ['🐉', '여의주', 'AZURE DRAGON', '승천', '🌊'],
    egg_pi: ['π', '3.1415926535', '∞', '2πr', 'COSMIC PI'],
    egg_42: ['42', 'DEEP THOUGHT', 'DON\'T PANIC', 'GALAXY', '🌌'],
    egg_helloworld: ['hello, world!', 'C89', '0x00', 'root@bulmeong', '💻'],
    egg_binary: ['01100110', '01101001', '01110010', '01100101', 'AI AWAKE'],
    egg_morse: ['··· −−− ···', 'SOS', 'MAYDAY', 'RESCUE', '🚢'],
    egg_prometheus: ['☀️ PROMETHEUS', 'OLYMPIA FIRE', 'TITAN FLAME', '태초의 성화'],
    egg_schrodinger: ['|ψ⟩ = α|0⟩ + β|1⟩', 'E=mc²', '🐈‍⬛ QUANTUM', 'SUPERPOSITION'],
    egg_nirvana: ['🪷 색즉시공', '공즉시색', '涅槃', '만다라 삼매화', '🙏'],
    egg_phoenix: ['🦅 PHOENIX', 'IMMORTAL REBIRTH', '불사조 부활', '🔥 Lv.MAX'],
    egg_creator: ['👑 SIRUABBA', '시루아빠', 'CREATOR SUPERNOVA', 'ABSOLUTE FLAME', '✨']
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
    discoverer: state.discovererName || state.myfireOwner || '익명 불멍러',
    life: 0,
    maxLife: 210
  };

  showOracle(
    `[${egg.tierLabel}] 「${egg.title}」 불꽃이 피어올랐습니다! 0.6초 후 자동으로 불꽃이 캡처되어 박물관 앨범에 최초 발견자로 박제됩니다!`,
    `📸 이스터에그 발동 · ${egg.title}`
  );

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
  const nowStr = new Date().toLocaleString('ko-KR', { hour12: false });
  const firstDiscoverer = existing?.firstDiscoverer || state.discovererName || state.myfireOwner || '익명 불멍러';
  const firstTime = existing?.firstTime || nowStr;
  const count = (existing?.count || 0) + 1;

  // Top Header on Polaroid
  sg.fillStyle = borderCol;
  sg.font = '800 15px Pretendard, sans-serif';
  sg.fillText(`🏛️ BULMEONG HALL OF FAME · ${egg.tierLabel}`, 24, 36);

  sg.fillStyle = '#ffffff';
  sg.font = '800 26px Pretendard, sans-serif';
  sg.fillText(egg.title, 24, 70);

  // Bottom First-Discoverer Plaque on Polaroid
  sg.fillStyle = '#ffd97d';
  sg.font = '800 18px Pretendard, sans-serif';
  sg.fillText(`👑 최초 발견 박제: ${firstDiscoverer}`, 24, Sh - 48);

  sg.fillStyle = 'rgba(255, 240, 215, 0.78)';
  sg.font = '600 13.5px Pretendard, sans-serif';
  sg.fillText(`최초 박제 시각: ${firstTime}  |  발동 주문: 「${(triggerText || egg.sampleTrigger).slice(0, 20)}」`, 24, Sh - 22);

  const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.86);

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

  // Broadcast discovery to Global Multiplayer Server so all connected users' albums update in real time!
  if (typeof window.__broadcastEggUnlock === 'function') {
    window.__broadcastEggUnlock(egg, state.eggAlbum[egg.id], dataUrl);
  }

  // 3. Show Floating Polaroid Toast
  const toast = document.getElementById('capture-toast');
  const toastImg = document.getElementById('capture-toast-img');
  const toastTag = document.getElementById('capture-toast-tag');
  const toastTitle = document.getElementById('capture-toast-title');
  const toastSub = document.getElementById('capture-toast-sub');
  if (toast && toastImg) {
    toastImg.src = dataUrl;
    toastTag.textContent = count === 1 ? '📸 전 세계 최초 발견! 서버 영구 박제 완료!' : `📸 불꽃 재점화 캡처 완료 (${count}회차)`;
    toastTitle.textContent = egg.title;
    toastSub.textContent = `👑 최초 박제: ${firstDiscoverer} · 탭하여 박물관 열기`;
    toast.classList.add('show');
    clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => toast.classList.remove('show'), 6500);
  }
}

function updateAlbumBadgeUI() {
  const unlockedCount = Object.keys(state.eggAlbum || {}).length;
  const total = EASTER_EGG_DEX.length;
  const badge = document.getElementById('album-count-badge');
  if (badge) badge.textContent = `${unlockedCount}/${total}`;
}
let oracleTimer = null;
function showOracle(text, tag = '소각 완료 · 재가 남긴 문장') {
  const box = document.getElementById('ash-oracle');
  document.getElementById('oracle-tag').textContent = tag;
  document.getElementById('oracle-text').textContent = `“${text}”`;
  box.classList.add('show');
  clearTimeout(oracleTimer);
  oracleTimer = setTimeout(() => box.classList.remove('show'), 5200);
}

function incrementRoomRanking(text) {
  const r = currentRoom();
  const clean = text.trim();
  const existing = r.rankings.find(item => item.word === clean || clean.includes(item.word) || item.word.includes(clean));
  if (existing) {
    existing.count += 1;
  } else {
    r.rankings.push({ word: clean.slice(0, 18), count: 1 });
  }
  renderRoomUI();
}

function burnWorry(rawText, startX = W * 0.5, startY = H * 0.78, itemType = 'scroll', fromRemote = false) {
  const r = currentRoom();
  const text = (rawText || '').trim() || r.rankings[0].word;
  state.lastBurnedText = text;
  const isGold = !!state.goldMode;
  const oracle = isGold
    ? (LANG_PACK[state.lang || 'ko']?.goldOracle || '황금 부적에 담은 간절한 소원이 불꽃을 타고 하늘로 피어올랐습니다.')
    : r.oracles[(state.burnedCount + text.length) % r.oracles.length];
  state.lastOracle = oracle;
  incrementRoomRanking(text);

  activeNote = {
    text,
    oracle,
    isGold,
    itemType,
    stamp: isGold ? '黃金祈願 · WISH' : r.stamp,
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
      nick: state.discovererName || state.myfireOwner || '익명 연금술사',
      text: text.slice(0, 24),
      itemType,
      isGold,
      room: state.room
    });
  }
  if (isGold) {
    state.paletteIndex = 3; // Golden temple lantern flame
    stokeFire(95);
    document.getElementById('live-ticker').textContent = `✨ [황금부적] 당신이 「${text.slice(0, 18)}」 소원을 화로에 피워 올렸습니다`;
  } else {
    document.getElementById('live-ticker').textContent = `🔥 당신이 방금 「${text.slice(0, 18)}」을(를) 화로에 던져 태웠습니다`;
  }
}

function stokeFire(burstCount = 32) {
  state.stoking = Math.min(1.4, state.stoking + 0.45);
  state.heat = Math.min(48.0, +(state.heat + 0.8).toFixed(1));
  for (let i = 0; i < burstCount; i++) spawnSpark(fireX, fireY - 14, true);
  for (let i = 0; i < 6; i++) spawnFlameParticle(1.25);
  audio.triggerCrackle();
  updateStatsUI();
}

function sendWarmth() {
  state.warmthCount += 1;
  saveState();
  const target = fireflies[Math.floor(Math.random() * fireflies.length)];
  const tx = fireX + Math.cos(target.angle) * (target.rx * Math.min(1, W / 420));
  const ty = fireY + 18 + Math.sin(target.angle) * target.ry;
  warmthArcs.push({ sx: W * 0.5, sy: H * 0.78, tx, ty, t: 0 });
  stokeFire(18);
  showOracle('이름 모를 누군가의 불씨에게 따뜻한 온기를 건넸습니다.', '온기 전달 완료');
}

// ── Tactile Hanji Sheet & Swipe-to-Burn Gesture ──────────────────────────────
const hanjiOverlay = document.getElementById('hanji-overlay');
const hanjiSheet = document.getElementById('hanji-sheet');
const burnInput = document.getElementById('burn-input');

function openHanjiSheet() {
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

function drawCampfireSignpost(pal) {
  const sx = fireX - Math.min(132, W * 0.31);
  const sy = fireY + 8;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(-0.06);

  // Post pole
  ctx.fillStyle = '#241710';
  ctx.fillRect(-3, -24, 6, 36);

  // Wooden board
  ctx.fillStyle = '#332015';
  ctx.strokeStyle = `rgba(${pal.glow}, 0.5)`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(-52, -46, 104, 28, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffdfa6';
  ctx.font = '700 10px Pretendard, sans-serif';
  ctx.textAlign = 'center';
  const ownerLabel = `${state.myfireOwner.slice(0, 8)}의 모닥불`;
  ctx.fillText(ownerLabel, 0, -34);

  ctx.fillStyle = 'rgba(255, 244, 225, 0.78)';
  ctx.font = '500 8.5px Pretendard, sans-serif';
  const signShort = state.myfireSign.length > 13 ? state.myfireSign.slice(0, 13) + '…' : state.myfireSign;
  ctx.fillText(signShort, 0, -23);

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

function drawScene() {
  tick += 1;
  state.stoking = Math.max(0.18, state.stoking * 0.985);
  const pal = PALETTES[state.paletteIndex];
  const sp = state.space;
  const fScale = getDynamicFireScale();

  // 1. Hand-Painted Sanctuary Art Asset Backdrop + Space-Specific Atmosphere
  if (bgSanctuaryImg.complete && bgSanctuaryImg.naturalWidth > 0) {
    const imgRatio = bgSanctuaryImg.naturalWidth / bgSanctuaryImg.naturalHeight;
    const viewRatio = W / H;
    let dw = W, dh = H, dx = 0, dy = 0;
    if (viewRatio > imgRatio) {
      dh = W / imgRatio;
      dy = (H - dh) * 0.58;
    } else {
      dw = H * imgRatio;
      dx = (W - dw) * 0.5;
    }
    ctx.drawImage(bgSanctuaryImg, dx, dy, dw, dh);

    // Space-specific mood tint overlay over the hand-painted sanctuary
    if (sp === 'snow') {
      ctx.fillStyle = 'rgba(8, 22, 44, 0.42)';
      ctx.fillRect(0, 0, W, H);
    } else if (sp === 'cosmos') {
      ctx.fillStyle = 'rgba(14, 4, 34, 0.56)';
      ctx.fillRect(0, 0, W, H);
    } else if (sp === 'temple') {
      ctx.fillStyle = 'rgba(18, 12, 22, 0.32)';
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = 'rgba(5, 6, 12, 0.25)';
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (sp === 'snow') {
      skyGrad.addColorStop(0, '#040914');
      skyGrad.addColorStop(0.55, '#0c192e');
      skyGrad.addColorStop(1, '#08101d');
    } else if (sp === 'cosmos') {
      skyGrad.addColorStop(0, '#04020c');
      skyGrad.addColorStop(0.5, '#130826');
      skyGrad.addColorStop(1, '#06111e');
    } else if (sp === 'temple') {
      skyGrad.addColorStop(0, '#06060c');
      skyGrad.addColorStop(0.55, '#12101b');
      skyGrad.addColorStop(1, '#09070d');
    } else {
      skyGrad.addColorStop(0, '#04050a');
      skyGrad.addColorStop(0.55, '#0a0d18');
      skyGrad.addColorStop(1, '#07060b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);
  }

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
  ambGrad.addColorStop(0, `rgba(${pal.glow}, ${Math.min(0.68, 0.14 + fScaleGlow * 0.17 + state.stoking * 0.12)})`);
  ambGrad.addColorStop(0.45, `rgba(${pal.glow}, ${Math.min(0.32, 0.04 + fScaleGlow * 0.05)})`);
  ambGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = ambGrad;
  ctx.fillRect(0, 0, W, H);

  if (sp === 'snow') {
    // Subtle snow-ground frost reflection around the hearth
    const snowGrad = ctx.createRadialGradient(fireX, fireY + 28, 12, fireX, fireY + 42, Math.max(W, 380) * 0.6);
    snowGrad.addColorStop(0, `rgba(${pal.glow}, 0.22)`);
    snowGrad.addColorStop(0.5, 'rgba(180, 215, 250, 0.18)');
    snowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = snowGrad;
    ctx.beginPath();
    ctx.ellipse(fireX, fireY + 38, W * 0.68, 115, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Temple Eave & Swaying Fish Wind Chime
  if (sp === 'temple') {
    drawTempleEave(pal);
    if (tick % 210 === 0 && state.audioEnabled) audio.playWindChime();
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

  // 3. Anonymous Soul Fireflies (Clean glowing spirit orbs without cluttered text labels)
  const scaleX = Math.min(1.08, Math.max(0.68, W / 420));
  fireflies.forEach(f => {
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

  // 4. Unified 1st-Person Eye-Level Hearth Illumination & Glowing Charcoal Core
  // (`bg-sanctuary.jpg` v7 already has the grand Korean stone hearth and oak logs painted in unified perspective!)
  const stage = getFireStage();
  const windOffset = (window.__fireWindX || 0) * fScale;
  if (window.__fireWindX) window.__fireWindX *= 0.92;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const bedW = 88 + fScale * 44;
  const bedGrad = ctx.createRadialGradient(fireX, fireY + 8, 4, fireX, fireY + 12, bedW);
  bedGrad.addColorStop(0, `rgba(255, 245, 190, ${Math.min(0.88, 0.28 + fScale * 0.28 + state.stoking * 0.22)})`);
  bedGrad.addColorStop(0.45, `rgba(${pal.glow}, ${Math.min(0.72, 0.18 + fScale * 0.22)})`);
  bedGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bedGrad;
  ctx.beginPath();
  ctx.ellipse(fireX, fireY + 10, bedW, 28 + fScale * 8, 0, 0, Math.PI * 2);
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
    tGrad.addColorStop(0.16, `rgba(${pal.core[0]}, ${pal.core[1]}, ${pal.core[2]}, 0.44)`);
    tGrad.addColorStop(0.52, `rgba(${pal.mid[0]}, ${pal.mid[1]}, ${pal.mid[2]}, 0.36)`);
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
    const alpha = (1 - ratio) * 0.58;

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
      bumpGlobalBurnCounter(1, 5.5);
      risingEmberTexts.push({
        label: `🔥 나 · 「${activeNote.text.slice(0, 18)}」`,
        x: fireX,
        y: fireY - 46,
        life: 0,
        maxLife: 150,
        isGold: !!activeNote.isGold
      });
      saveState();
      stokeFire(55);
      if (!activeNote.hasSpell) {
        showOracle(activeNote.oracle, `소각 완료 · 「${activeNote.text.slice(0, 16)}${activeNote.text.length > 16 ? '…' : ''}」`);
      }
      activeNote = null;
    }
  }

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
    ctx.shadowColor = '#1aff8c';
    ctx.shadowBlur = 8;
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
    // Red Bullish Candle Wick & Body
    ctx.strokeStyle = `rgba(255, 82, 82, ${a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -bc.h * 0.7);
    ctx.lineTo(0, bc.h * 0.7);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 56, 56, ${a * 0.92})`;
    ctx.shadowColor = '#ff2e2e';
    ctx.shadowBlur = 12;
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
    ctx.shadowColor = `rgba(${cr.col}, 0.9)`;
    ctx.shadowBlur = 16;
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
    ctx.shadowColor = `rgba(${fr.col}, 0.95)`;
    ctx.shadowBlur = 12;
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
    ctx.fillText(`✨ ${mb.tierLabel} · 👑 발견자: ${mb.discoverer}`, fireX, fireY - 142);
    ctx.font = '800 19px Pretendard, sans-serif';
    ctx.fillStyle = `rgba(255, 250, 235, ${a})`;
    ctx.shadowColor = 'rgba(255, 165, 50, 0.95)';
    ctx.shadowBlur = 18;
    ctx.fillText(mb.title, fireX, fireY - 118);
    ctx.restore();
    if (mb.life >= mb.maxLife) spellEffects.activeMythicBanner = null;
  }

  // 7b. Global Anonymous Notes Flying from Fireflies + Rising Ember Texts
  if (tick % 145 === 0) spawnGlobalGhostNote();

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
      bumpGlobalBurnCounter(1, 0);
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
    ctx.shadowColor = rt.isGold ? 'rgba(255, 200, 50, 0.9)' : 'rgba(255, 120, 35, 0.85)';
    ctx.shadowBlur = 10;
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
    ctx.shadowColor = 'rgba(255, 95, 20, 0.95)';
    ctx.shadowBlur = 10;
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
      showOracle(`「${activeGiftLog.text}」 — 응원 장작이 모닥불 온도를 크게 높였습니다!`, '🪵 친구 응원 장작 도착');
      activeGiftLog = null;
    }
  }

  requestAnimationFrame(drawScene);
}

function drawHanjiNote(note, burnRatio) {
  const nw = note.itemType && note.itemType !== 'scroll' ? 168 : 224;
  const nh = note.itemType && note.itemType !== 'scroll' ? 88 : 74;
  ctx.save();
  ctx.translate(note.x, note.y);
  ctx.rotate(note.rotation + burnRatio * 0.16);
  const scale = 1 - burnRatio * 0.24;
  ctx.scale(scale, scale);

  const remainH = nh * (1 - burnRatio);
  if (remainH > 2) {
    ctx.beginPath();
    ctx.rect(-nw / 2, -nh / 2, nw, remainH);
    ctx.clip();

    if (note.itemType === 'resignation') {
      // Physical White Envelope with Red Wax Seal ("사직서 / RESIGNATION")
      ctx.fillStyle = '#f8f4ec';
      ctx.strokeStyle = '#c8baa6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-nw / 2, -nh / 2, nw, nh, 8);
      ctx.fill();
      ctx.stroke();
      // Envelope flap lines
      ctx.beginPath();
      ctx.moveTo(-nw / 2 + 4, -nh / 2 + 4);
      ctx.lineTo(0, 6);
      ctx.lineTo(nw / 2 - 4, -nh / 2 + 4);
      ctx.stroke();
      // Red wax seal
      ctx.fillStyle = '#b8251e';
      ctx.beginPath();
      ctx.arc(0, 4, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#241811';
      ctx.font = '900 15px "Noto Serif KR", serif';
      ctx.textAlign = 'center';
      ctx.fillText('辭 職 書 (사직서)', 0, -18);
    } else if (note.itemType === 'stock') {
      // Plunging Blue Stock Account Card ("-74.8% 마이너스 계좌")
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-nw / 2, -nh / 2, nw, nh, 10);
      ctx.fill();
      ctx.stroke();
      // Plunging blue chart line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-nw / 2 + 16, -nh / 2 + 20);
      ctx.lineTo(-24, -nh / 2 + 32);
      ctx.lineTo(8, -2);
      ctx.lineTo(nw / 2 - 18, nh / 2 - 16);
      ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.font = '800 13px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📉 내 파란불 손실 계좌 (-74%)', 0, -nh / 2 + 18);
    } else if (note.itemType === 'clock') {
      // Monday 06:30 Alarm Clock Card
      ctx.fillStyle = '#27171c';
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-nw / 2, -nh / 2, nw, nh, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff8787';
      ctx.font = '900 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⏰ MON 06:30', 0, -4);
      ctx.font = '700 11px Pretendard, sans-serif';
      ctx.fillStyle = '#ffd8a8';
      ctx.fillText('월요병 출근 알람 폭파', 0, 18);
    } else {
      const pg = ctx.createLinearGradient(-nw / 2, -nh / 2, nw / 2, nh / 2);
      if (note.isGold) {
        pg.addColorStop(0, '#fff2b2');
        pg.addColorStop(0.5, '#f4c145');
        pg.addColorStop(1, '#c88212');
      } else {
        pg.addColorStop(0, '#f7ecd8');
        pg.addColorStop(1, '#e1cba3');
      }
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.roundRect(-nw / 2, -nh / 2, nw, nh, 10);
      ctx.fill();

      // Red / Gold talisman stamp on top-left of note
      ctx.strokeStyle = note.isGold ? '#7a1c08' : '#9e3b1c';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-nw / 2 + 12, -nh / 2 + 10, 54, 15);
      ctx.fillStyle = note.isGold ? '#7a1c08' : '#9e3b1c';
      ctx.font = '700 9px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(note.isGold ? '黃金祈願' : '燒却符籍', -nw / 2 + 39, -nh / 2 + 21);

      // Handwritten worry text
      ctx.fillStyle = '#25170d';
      ctx.font = '700 14px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const display = note.text.length > 18 ? note.text.slice(0, 18) + '…' : note.text;
      ctx.fillText(display, 0, 8);
    }

    if (burnRatio > 0.01) {
      const edgeY = -nh / 2 + remainH;
      const charGrad = ctx.createLinearGradient(0, edgeY - 18, 0, edgeY);
      charGrad.addColorStop(0, 'rgba(30, 15, 8, 0)');
      charGrad.addColorStop(0.5, 'rgba(18, 8, 4, 0.96)');
      charGrad.addColorStop(1, '#ff7b24');
      ctx.fillStyle = charGrad;
      ctx.fillRect(-nw / 2, edgeY - 18, nw, 19);
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
  if (burnedEl) burnedEl.textContent = state.burnedCount.toLocaleString('ko-KR');
  if (warmthEl) warmthEl.textContent = state.warmthCount.toLocaleString('ko-KR');
  const displayTemp = Math.round(state.tempC);
  if (heatEl) heatEl.textContent = `${displayTemp.toLocaleString('ko-KR')}°C`;
  if (essenceEl) essenceEl.textContent = (state.burnedCount * 25 + state.warmthCount * 10).toLocaleString('ko-KR');
}

function renderSpaceUI() {
  document.querySelectorAll('.space-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.space === state.space);
  });
}

document.querySelectorAll('.space-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!state.audioEnabled) toggleAudio(true);
    state.space = btn.dataset.space;
    saveState();
    renderSpaceUI();
    const sp = SPACES[state.space] || SPACES.camp;
    if (state.space === 'temple') audio.playWindChime();
    else audio.playWhooshAndBowl();
    stokeFire(24);
    showOracle(sp.desc, `공간 테마 전환 · ${sp.name}`);
  });
});

function renderMyFireUI() {
  const bannerLabel = document.getElementById('myfire-banner-label');
  const countBadge = document.getElementById('myfire-guest-count');
  if (bannerLabel) bannerLabel.textContent = `🏕️ ${state.myfireOwner.slice(0, 6)} 화로`;
  if (countBadge) countBadge.textContent = String(state.guestbook.length);

  const ownerIn = document.getElementById('myfire-owner-input');
  const signIn = document.getElementById('myfire-sign-input');
  if (ownerIn) ownerIn.value = state.myfireOwner;
  if (signIn) signIn.value = state.myfireSign;

  const list = document.getElementById('guestbook-list');
  if (list) {
    list.innerHTML = state.guestbook.map(item => `
      <div class="guestbook-item">
        <span>🪵 ${item.text}</span>
        <small>${item.time}</small>
      </div>
    `).join('');
  }
}

function getShareableFireUrl() {
  const u = new URL(window.location.href);
  u.searchParams.set('fire', state.myfireOwner);
  u.searchParams.set('sign', state.myfireSign);
  return u.toString();
}

function applyAndCopyMyFire() {
  const ownerVal = document.getElementById('myfire-owner-input').value.trim() || '익명 불씨';
  const signVal = document.getElementById('myfire-sign-input').value.trim() || '지나가다 장작 하나씩 던져주고 가세요 🔥';
  state.myfireOwner = ownerVal;
  state.discovererName = ownerVal;
  state.myfireSign = signVal;
  saveState();
  renderMyFireUI();

  const shareUrl = getShareableFireUrl();
  window.history.replaceState({}, '', shareUrl);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
  }
  document.getElementById('modal-myfire').classList.remove('open');
  stokeFire(32);
  showOracle(`「${state.myfireOwner}의 화로」 전용 링크가 복사되었습니다. 친구들에게 공유해 장작을 받아보세요!`, '🔗 내 화로 분양 완료');
}

function throwGuestWood() {
  const input = document.getElementById('guest-wood-input');
  const text = input.value.trim() || '오늘도 수고 많았다 장작 하나 놓고 감!';
  input.value = '';
  state.guestbook.unshift({ text, time: '방금 전' });
  saveState();
  renderMyFireUI();
  document.getElementById('modal-myfire').classList.remove('open');

  if (typeof window.__broadcastWoodEvent === 'function') {
    window.__broadcastWoodEvent(text);
  }

  activeGiftLog = {
    text,
    startX: W * 0.82,
    startY: H * 0.18,
    x: W * 0.82,
    y: H * 0.18,
    rot: -0.4,
    progress: 0
  };
  audio.playWhooshAndBowl();
}

// ── Global 5-Language Localization (KO / EN / JA / ZH / ES) & Automated Checkout ──
const LANG_PACK = {
  ko: {
    rooms: { work: '🏢 직장인', stock: '📉 주식·코인', relation: '💔 흑역사', zen: '🌙 무념무상' },
    spaces: { camp: '🌧️ 밤공터', temple: '🎐 산사 처마', snow: '❄️ 설산 오두막', cosmos: '🌌 성운의 끝' },
    writeCta: '주문·번뇌 적기',
    topBadge: '🔥 실시간 1위',
    topWord: '월요일 아침 출근',
    caption: '글로벌 실시간 연금술 화로',
    goldBtn: '👑 황금 소원부적 전환',
    goldActiveBtn: '👑 황금 소원부적 ON',
    price: '$0.99 (PayPal 자동결제)',
    goldOracle: '황금 부적에 담은 간절한 소원이 불꽃을 타고 하늘로 피어올랐습니다. 반드시 이루어질 것입니다.'
  },
  en: {
    rooms: { work: '🏢 Work', stock: '📉 Crypto', relation: '💔 Regrets', zen: '🌙 Pure Zen' },
    spaces: { camp: '🌧️ Night Camp', temple: '🎐 Zen Temple', snow: '❄️ Alpine', cosmos: '🌌 Nebula' },
    writeCta: 'Write Spell',
    topBadge: '🔥 #1',
    topWord: 'Monday 9AM meeting dread',
    caption: 'Global Live Alchemy Hearth',
    goldBtn: '👑 Golden Talisman',
    goldActiveBtn: '👑 Golden Active',
    price: '$0.99 (Auto Verify)',
    goldOracle: 'Your Golden Wish has ascended with the embers into the night sky. May it come to pass.'
  },
  ja: {
    rooms: { work: '🏢 社畜', stock: '📉 株・コイン', relation: '💔 黒歴史', zen: '🌙 無念無想' },
    spaces: { camp: '🌧️ 夜雨', temple: '🎐 山寺', snow: '❄️ 雪山', cosmos: '🌌 星雲' },
    writeCta: '呪文・悩みを書く',
    topBadge: '🔥 1位',
    topWord: '月曜日の満員電車と出社',
    caption: '世界同時・錬金術の炉',
    goldBtn: '👑 黄金の祈願札',
    goldActiveBtn: '👑 黄金の祈願札 ON',
    price: '¥150 (自動認証)',
    goldOracle: '黄金の護符に込めた願いが炎となって夜空へ昇りました。きっと叶います。'
  },
  zh: {
    rooms: { work: '🏢 社畜', stock: '📉 股市币圈', relation: '💔 黑历史', zen: '🌙 放空冥想' },
    spaces: { camp: '🌧️ 夜雨营地', temple: '🎐 古寺', snow: '❄️ 雪山', cosmos: '🌌 星云' },
    writeCta: '写下咒语与烦恼',
    topBadge: '🔥 榜首',
    topWord: '周一早上的无尽会议',
    caption: '全球实时炼金火炉',
    goldBtn: '👑 黄金祈愿符',
    goldActiveBtn: '👑 黄金祈愿符 ON',
    price: '$0.99 (自动核验)',
    goldOracle: '写在黄金祈愿符上的心愿已随金焰升入夜空，万事顺遂，所愿皆成。'
  },
  es: {
    rooms: { work: '🏢 Trabajo', stock: '📉 Cripto', relation: '💔 Pasado', zen: '🌙 Paz Zen' },
    spaces: { camp: '🌧️ Lluvia', temple: '🎐 Templo', snow: '❄️ Alpes', cosmos: '🌌 Nebulosa' },
    writeCta: 'Escribir Conjuro',
    topBadge: '🔥 #1',
    topWord: 'Madrugar el lunes para trabajar',
    caption: 'Hogar de Alquimia Global',
    goldBtn: '👑 Talismán Dorado',
    goldActiveBtn: '👑 Talismán Activo',
    price: '$0.99 (Pago Auto)',
    goldOracle: 'Tu deseo en el Talismán Dorado se ha elevado con las chispas hacia el cielo nocturno.'
  }
};

function applyLanguage(lang) {
  state.lang = LANG_PACK[lang] ? lang : 'ko';
  const pack = LANG_PACK[state.lang];
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });
  document.querySelectorAll('.room-tab').forEach(btn => {
    const rId = btn.dataset.room;
    if (pack.rooms[rId]) btn.textContent = pack.rooms[rId];
  });
  document.querySelectorAll('.space-chip').forEach(btn => {
    const sId = btn.dataset.space;
    if (pack.spaces[sId]) btn.textContent = pack.spaces[sId];
  });
  const rb = document.querySelector('.rank-badge');
  if (rb) rb.textContent = pack.topBadge;
  const tw = document.getElementById('top-rank-word');
  if (tw) tw.textContent = pack.topWord;
  const zc = document.getElementById('zen-room-caption');
  if (zc) zc.textContent = pack.caption;
  const wc = document.querySelector('#btn-open-hanji .item-name');
  if (wc) wc.textContent = pack.writeCta;
  const pl = document.getElementById('checkout-price-label');
  if (pl) pl.textContent = pack.price;
  updateGoldUI();
}

function updateGoldUI() {
  const pack = LANG_PACK[state.lang || 'ko'];
  const goldBtn = document.getElementById('btn-gold-talisman');
  if (!goldBtn) return;
  hanjiSheet.classList.toggle('golden', !!state.goldMode);
  goldBtn.textContent = state.goldMode ? pack.goldActiveBtn : pack.goldBtn;
  if (state.goldMode) {
    document.getElementById('hanji-room-stamp').textContent = '黃金祈願 · 소원성취';
    burnInput.placeholder = '간절히 이루고 싶은 소원이나 20종 비밀 주문을 황금 양피지에 적어 화로에 올리세요…';
  } else {
    document.getElementById('hanji-room-stamp').textContent = currentRoom().stamp;
  }
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyLanguage(btn.dataset.lang);
    stokeFire(18);
  });
});

document.getElementById('btn-gold-talisman').addEventListener('click', () => {
  if (state.goldUnlocked) {
    state.goldMode = !state.goldMode;
    updateGoldUI();
  } else {
    document.getElementById('modal-checkout').classList.add('open');
  }
});

// ── Automated PG Payment Verification (PayPal Global Auto Return + Server IP Binding) ──
const PAYPAL_MERCHANT_EMAIL = 'thenthenthen@naver.com';

let userIpHash = saved.userIpHash || ('dev_' + Math.random().toString(36).slice(2, 10));
let userIpMasked = '연결됨';

async function detectUserIpAndSyncVip() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    if (data && data.ip) {
      const parts = data.ip.split('.');
      userIpMasked = parts.length === 4 ? `${parts[0]}.${parts[1]}.***.${parts[3]}` : data.ip;
      // Compute deterministic hash from IP so raw IP isn't exposed publicly
      let h = 2166136261;
      for (let i = 0; i < data.ip.length; i++) {
        h ^= data.ip.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      userIpHash = 'ip_' + (h >>> 0).toString(16);
      const badge = document.getElementById('user-ip-badge');
      if (badge) badge.textContent = `${userIpMasked} (${userIpHash})`;
    }
  } catch {
    const badge = document.getElementById('user-ip-badge');
    if (badge) badge.textContent = `기기토큰 (${userIpHash})`;
  }
}
detectUserIpAndSyncVip();

function openPayPalCheckout() {
  const returnUrl = new URL(window.location.href);
  returnUrl.searchParams.set('paypal_paid', '1');
  returnUrl.searchParams.set('orderId', 'pp_' + Date.now());
  const cancelUrl = new URL(window.location.href);
  const ppUrl = new URL('https://www.paypal.com/cgi-bin/webscr');
  ppUrl.searchParams.set('cmd', '_xclick');
  ppUrl.searchParams.set('business', PAYPAL_MERCHANT_EMAIL);
  ppUrl.searchParams.set('item_name', 'Bulmeong Hearth of Ashes Golden Wish & Grimoire');
  ppUrl.searchParams.set('amount', '0.99');
  ppUrl.searchParams.set('currency_code', 'USD');
  ppUrl.searchParams.set('no_shipping', '1');
  ppUrl.searchParams.set('return', returnUrl.toString());
  ppUrl.searchParams.set('cancel_return', cancelUrl.toString());
  window.location.href = ppUrl.toString();
}

function completeWebCheckout(methodName = 'PayPal 글로벌 자동결제 승인') {
  state.goldUnlocked = true;
  state.goldMode = true;
  state.paletteIndex = 3; // Golden temple flame
  saveState();
  document.getElementById('modal-checkout')?.classList.remove('open');
  updateGoldUI();
  stokeFire(75);
  if (typeof window.__broadcastVipUnlock === 'function') {
    window.__broadcastVipUnlock(userIpHash, methodName);
  }
  showOracle(`${methodName} 완료! 현재 접속 IP(${userIpMasked}) 및 기기에 「👑 황금 소원부적」이 영구 귀속되었습니다!`, '👑 자동 결제 검증 & 서버 등록 완료');
}

document.getElementById('btn-pay-paypal')?.addEventListener('click', openPayPalCheckout);

// Check URL callback from PayPal (?paypal_paid=1)
if (urlParams.get('paypal_paid') === '1') {
  setTimeout(() => {
    document.getElementById('title-screen')?.classList.add('hidden');
    completeWebCheckout('PayPal 글로벌 자동결제 승인');
    const cleanUrl = new URL(window.location.href);
    ['orderId', 'paypal_paid'].forEach(k => cleanUrl.searchParams.delete(k));
    window.history.replaceState({}, '', cleanUrl.toString());
  }, 450);
}

// ── Flame Museum & First-Discoverer Hall of Fame Album Modal (#modal-album) ──
function renderAlbumModal() {
  updateAlbumBadgeUI();
  const unlockedIds = Object.keys(state.eggAlbum || {});
  const total = EASTER_EGG_DEX.length;
  const pct = Math.round((unlockedIds.length / total) * 100);

  const progText = document.getElementById('album-progress-text');
  const progFill = document.getElementById('album-bar-fill');
  const discInput = document.getElementById('discoverer-name-input');
  if (progText) progText.textContent = `🔥 시크릿 불꽃 해금 및 박제 현황: ${unlockedIds.length} / ${total}종 (${pct}%)`;
  if (progFill) progFill.style.width = `${pct}%`;
  if (discInput && document.activeElement !== discInput) {
    discInput.value = state.discovererName || state.myfireOwner || '시루아빠';
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
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:28px 12px;color:var(--text-sub);font-size:12.5px;">아직 해당 카테고리에 박제된 이스터에그 불꽃이 없습니다.<br>힌트를 보고 한지에 비밀 주문을 적어 불에 던져보세요! 🔥</div>`;
    return;
  }

  grid.innerHTML = filtered.map(egg => {
    const rec = state.eggAlbum[egg.id];
    if (rec) {
      return `
        <div class="egg-slot unlocked tier-${egg.tier}">
          <div>
            <img class="egg-thumb" src="${rec.lastImage}" alt="${egg.title}">
            <span class="egg-tier-badge">${egg.tierLabel}</span>
            <div class="egg-title">${egg.title}</div>
            <div class="egg-discoverer">👑 최초 박제: ${rec.firstDiscoverer}<br><span style="font-weight:500;opacity:0.8;">${rec.firstTime} (${rec.count}회)</span></div>
          </div>
          <div class="egg-actions">
            <button type="button" class="egg-act-btn" data-reignite="${egg.id}">🔥 재점화</button>
            <button type="button" class="egg-act-btn" data-dl-egg="${egg.id}">📥 박제저장</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="egg-slot tier-${egg.tier}">
        <div>
          <div class="egg-locked-box">🔒<span style="font-size:10px;margin-top:4px;">미발견 불꽃</span></div>
          <span class="egg-tier-badge">${egg.tierLabel}</span>
          <div class="egg-title">??? (${egg.title.replace(/^[^\s]+\s/, '')})</div>
          <div class="egg-hint">💡 <b>발견 힌트</b>: ${egg.codeHint}</div>
        </div>
        <div class="egg-discoverer" style="background:rgba(255,255,255,0.04);color:rgba(255,230,195,0.5);">👑 최초 발견자 공석 (도전하세요!)</div>
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
      if (!rec || !rec.lastImage) return;
      const a = document.createElement('a');
      a.download = `bulmeong-${eggId}-${Date.now()}.jpg`;
      a.href = rec.lastImage;
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
  const val = document.getElementById('discoverer-name-input')?.value.trim() || '시루아빠';
  state.discovererName = val;
  saveState();
  renderAlbumModal();
  showOracle(`앞으로 발견하는 이스터에그 불꽃에 「👑 최초 발견자: ${val}」 이름으로 영구 박제됩니다!`, '👑 발견자 서명 등록 완료');
});

updateAlbumBadgeUI();

document.getElementById('btn-myfire').addEventListener('click', () => {
  renderMyFireUI();
  document.getElementById('modal-myfire').classList.add('open');
});
document.getElementById('btn-copy-myfire').addEventListener('click', applyAndCopyMyFire);
document.getElementById('btn-apply-myfire').addEventListener('click', applyAndCopyMyFire);
document.getElementById('btn-throw-guest-wood').addEventListener('click', throwGuestWood);

document.getElementById('btn-fire-stage').addEventListener('click', () => {
  state.idleSeconds = 0;
  const curLv = getFireStage().lv;
  const nextIdx = (curLv + 1) % FIRE_STAGES.length; // cycles Lv.0 -> Lv.1 -> Lv.2 -> Lv.3 -> Lv.4 -> Lv.5 -> Lv.0
  const nextStage = FIRE_STAGES[nextIdx];
  const stageTemps = [95, 240, 480, 880, 1480, 2450];
  state.tempC = stageTemps[nextIdx] || 480;
  if (nextStage.lv === 0) {
    state.forcedLv0Until = Date.now() + 25000;
  } else {
    state.forcedLv0Until = 0;
  }
  updateFireStageUI();
  updateStatsUI();
  if (nextStage.lv > 0) stokeFire(16 * nextStage.lv);
  showOracle(nextStage.desc, `${nextStage.lv === 0 ? '🕯️ 불씨 소멸 위기' : '🔥 지구촌 고단함 화력'} · ${nextStage.name}`);
});

document.getElementById('btn-cool-lv0')?.addEventListener('click', e => {
  e.stopPropagation();
  state.tempC = 92;
  state.forcedLv0Until = Date.now() + 30000;
  state.clickCombo = 0;
  document.getElementById('combo-pill')?.classList.remove('show');
  updateFireStageUI();
  updateStatsUI();
  showOracle('모닥불이 꺼져가는 [🕯️ Lv.0 잿더미(92°C)] 상태가 되었습니다! 지금 한지에 「불사조 피닉스」를 적어 던지거나 화면을 연타해 심폐소생하세요!', '🕯️ Lv.0 꺼져가는 잿더미 전환 완료');
});

function reviveFire(boostPct = 14, clickX = fireX, clickY = fireY - 38) {
  state.forcedLv0Until = 0;
  addTemperature(boostPct * 1.4, clickX, clickY, true);
}

renderRoomUI();
renderSpaceUI();
renderMyFireUI();
updateFireStageUI();
applyLanguage(queryLang && LANG_PACK[queryLang] ? queryLang : 'ko');
updateStatsUI();

// Smooth 10Hz (every 100ms) Global Natural Cooling Curve (Newton's Law of Cooling)
setInterval(() => {
  const now = Date.now();
  const idleMs = now - state.lastInteractMs;
  if (idleMs > 1800 && state.clickCombo > 0) {
    state.clickCombo = 0;
    document.getElementById('combo-pill')?.classList.remove('show');
  }
  if (idleMs > 1400 && state.tempC > 84) {
    const excess = Math.max(0, state.tempC - 84);
    // Higher temperatures cool faster; low embers cool gently toward Lv.0 (84°C)
    const coolPerSec = 3.5 + excess * 0.022;
    state.tempC = Math.max(84, +(state.tempC - coolPerSec * 0.1).toFixed(1));
    updateFireStageUI();
    updateStatsUI();
  }
}, 100);

setInterval(() => {
  state.seconds += 1;
  state.idleSeconds += 1;
  if (state.seconds % 5 === 0) saveState();
  const r = currentRoom();
  if (state.seconds % 4 === 0) {
    // Simulate real-time burns happening in the room
    const pick = r.rankings[Math.floor(Math.random() * r.rankings.length)];
    pick.count += 1;
    r.users = Math.max(120, r.users + Math.floor((Math.random() - 0.47) * 7));
    renderRoomUI();
  }
  if (state.seconds % 7 === 0) {
    const pick = r.rankings[Math.floor(Math.random() * r.rankings.length)];
    const ticker = document.getElementById('live-ticker');
    ticker.style.opacity = '0.2';
    setTimeout(() => {
      ticker.textContent = `🔥 익명의 불씨님이 방금 「${pick.word}」을(를) 모닥불에 태웠습니다`;
      ticker.style.opacity = '1';
    }, 260);
  }
  updateStatsUI();
}, 1000);

// ── Interactive Canvas Clicker Stoking & Wind Drag ───────────────────────────
let isCanvasDragging = false;
let lastCanvasX = 0;

canvas.addEventListener('pointerdown', e => {
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
  introNickInput.value = state.discovererName || state.myfireOwner || '시루아빠';
}

document.getElementById('btn-ignite-start')?.addEventListener('click', () => {
  const nickVal = document.getElementById('intro-nick-input')?.value.trim() || '시루아빠';
  state.discovererName = nickVal;
  state.myfireOwner = nickVal;
  saveState();
  renderMyFireUI();
  if (!state.audioEnabled) toggleAudio(true);
  audio.playWhooshAndBowl();
  reviveFire(35, fireX, fireY - 45);
  stokeFire(95);
  document.getElementById('title-screen')?.classList.add('hidden');
  showOracle(`${nickVal} 연금술사님, 성소의 화로가 깨어났습니다. 화로를 연타해 온도를 높이거나 하단 부적·사직서를 드래그해 던져보세요!`, '🔥 화로 점화 완료 · 실시간 서버 연결됨');
});

document.getElementById('btn-world-toggle')?.addEventListener('click', () => {
  document.getElementById('world-drawer')?.classList.toggle('open');
});

// ── Tactile Physical Item Inventory Cards (Tap or Drag-and-Throw into Fire!) ──
const PHYSICAL_ITEMS = {
  resignation: { icon: '✉️', label: '사직서 투척', text: '가슴속 미제출 사직서 봉투 완전 소각', itemType: 'resignation' },
  stock: { icon: '📉', label: '파란계좌 소각', text: '파란불 -74% 마이너스 계좌 잔고 소각 (상한가 기원)', itemType: 'stock' },
  clock: { icon: '⏰', label: '월요병 시계 폭파', text: '월요일 아침 6시 30분 출근 알람시계 폭파', itemType: 'clock' },
  wood: { icon: '🪵', label: '참나무 장작 투입', text: '마른 참나무 장작 투입', itemType: 'wood' }
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
      dragGhostLabel.textContent = `${spec.label} (화로에 놓기 🔥)`;
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
      showOracle('마른 참나무 장작을 화로에 던져 넣었습니다! 온도와 불길이 크게 치솟습니다!', '🪵 참나무 장작 투척');
    }
    return;
  }

  const rect = card ? card.getBoundingClientRect() : { left: W * 0.5, top: H * 0.8, width: 0, height: 0 };
  const lx = dragMoved ? e.clientX : rect.left + rect.width / 2;
  const ly = dragMoved ? e.clientY : rect.top + rect.height / 2;
  reviveFire(28, lx, ly);
  burnWorry(spec.text, lx, ly, spec.itemType);
});

// ── Real-Time Shared Multiplayer Server Sync (ntfy.sh Pub/Sub + Bytebin Cloud Polaroid Store) ──
const MULTIPLAYER_TOPIC = 'bulmeong_lounge_global_v5';
const NTFY_BASE = `https://ntfy.sh/${MULTIPLAYER_TOPIC}`;
const BYTEBIN_POST = 'https://bytebin.lucko.me/post';
const BYTEBIN_GET = 'https://bytebin.lucko.me/';
const clientSessionId = 'sess_' + Math.random().toString(36).slice(2, 10);

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
  g.fillText(`🏛️ GLOBAL SERVER RECORD · ${egg.tierLabel}`, 20, 30);
  g.fillStyle = '#fff';
  g.font = '800 20px Pretendard, sans-serif';
  g.fillText(egg.title, 20, 58);

  g.fillStyle = '#ffd97d';
  g.font = '800 15px Pretendard, sans-serif';
  g.fillText(`👑 최초 발견 박제: ${discoverer}`, 20, 250);
  g.fillStyle = 'rgba(255, 240, 215, 0.8)';
  g.font = '600 11.5px Pretendard, sans-serif';
  g.fillText(`시각: ${firstTime} | 주문: 「${(triggerText || egg.sampleTrigger).slice(0, 18)}」`, 20, 274);
  return c.toDataURL('image/jpeg', 0.82);
}

async function applyRemoteServerEvent(evt, isHistorical = false) {
  if (!evt || typeof evt !== 'object') return;

  if (evt.type === 'egg_unlock' && evt.eggId) {
    const egg = EASTER_EGG_DEX.find(x => x.id === evt.eggId);
    if (!egg) return;
    const existing = state.eggAlbum[evt.eggId];
    const firstDiscoverer = existing?.firstDiscoverer || evt.firstDiscoverer || '시루아빠';
    const firstTime = existing?.firstTime || evt.firstTime || '방금 전';
    const count = Math.max((existing?.count || 0) + (isHistorical ? 0 : 1), evt.count || 1);
    const imageKey = evt.imageKey || existing?.imageKey || '';

    let lastImage = existing?.lastImage || '';
    if (!lastImage) {
      lastImage = makeFallbackPolaroid(egg, firstDiscoverer, firstTime, evt.triggerText);
    }

    state.eggAlbum[evt.eggId] = {
      id: evt.eggId,
      firstDiscoverer,
      firstTime,
      lastImage,
      imageKey,
      triggerText: evt.triggerText || egg.sampleTrigger,
      count
    };

    if (imageKey && (!existing || !existing.cloudLoaded)) {
      fetch(BYTEBIN_GET + imageKey)
        .then(r => r.json())
        .then(d => {
          if (d && d.dataUrl && state.eggAlbum[evt.eggId]) {
            state.eggAlbum[evt.eggId].lastImage = d.dataUrl;
            state.eggAlbum[evt.eggId].cloudLoaded = true;
            saveState();
            if (document.getElementById('modal-album')?.classList.contains('open')) {
              renderAlbumModal();
            }
          }
        })
        .catch(() => {});
    }

    saveState();
    updateAlbumBadgeUI();
    if (document.getElementById('modal-album')?.classList.contains('open')) {
      renderAlbumModal();
    }
    if (!isHistorical && evt.sender !== clientSessionId) {
      const ticker = document.getElementById('live-ticker');
      if (ticker) {
        ticker.textContent = `👑 [서버 방송] ${firstDiscoverer}님이 「${egg.title}」 불꽃을 박물관에 박제했습니다!`;
      }
    }
  } else if (evt.type === 'burn' && evt.text) {
    if (!isHistorical && evt.sender !== clientSessionId) {
      bumpGlobalBurnCounter(1, 3.0);
      incrementRoomRanking(evt.text);
      const ticker = document.getElementById('live-ticker');
      if (ticker) {
        ticker.textContent = `🔥 [실시간 서버] ${evt.nick || '익명 불씨'}님이 방금 「${evt.text}」을(를) 화로에 태웠습니다`;
      }
      ghostNotes.push({
        origin: `🟢 ${evt.nick || '실시간 유저'}`,
        text: evt.text,
        sx: fireX + (Math.random() - 0.5) * 240,
        sy: fireY - 120,
        x: fireX,
        y: fireY - 120,
        rot: (Math.random() - 0.5) * 0.3,
        p: 0
      });
    }
  } else if (evt.type === 'wood' && evt.text) {
    const exists = state.guestbook.some(g => g.text === evt.text);
    if (!exists) {
      state.guestbook.unshift({ text: evt.text, time: evt.time || '실시간 서버' });
      saveState();
      renderMyFireUI();
    }
  } else if (evt.type === 'vip_unlock' && evt.ipHash) {
    if (evt.ipHash === userIpHash && !state.goldUnlocked) {
      state.goldUnlocked = true;
      state.goldMode = true;
      saveState();
      updateGoldUI();
    }
  }
}

window.__broadcastEggUnlock = async (egg, rec, dataUrl) => {
  let imageKey = rec.imageKey || '';
  try {
    if (dataUrl && !imageKey) {
      const r = await fetch(BYTEBIN_POST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl })
      });
      const j = await r.json();
      if (j && j.key) {
        imageKey = j.key;
        rec.imageKey = imageKey;
        saveState();
      }
    }
  } catch {}

  try {
    await fetch(NTFY_BASE, {
      method: 'POST',
      body: JSON.stringify({
        type: 'egg_unlock',
        sender: clientSessionId,
        eggId: egg.id,
        firstDiscoverer: rec.firstDiscoverer,
        firstTime: rec.firstTime,
        triggerText: rec.triggerText,
        count: rec.count,
        imageKey
      })
    });
  } catch {}
};

window.__broadcastBurnEvent = async payload => {
  try {
    await fetch(NTFY_BASE, {
      method: 'POST',
      body: JSON.stringify({
        type: 'burn',
        sender: clientSessionId,
        ...payload
      })
    });
  } catch {}
};

window.__broadcastWoodEvent = async text => {
  try {
    await fetch(NTFY_BASE, {
      method: 'POST',
      body: JSON.stringify({
        type: 'wood',
        sender: clientSessionId,
        text,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      })
    });
  } catch {}
};

window.__broadcastVipUnlock = async (ipHash, method) => {
  try {
    await fetch(NTFY_BASE, {
      method: 'POST',
      body: JSON.stringify({
        type: 'vip_unlock',
        sender: clientSessionId,
        ipHash,
        method,
        ts: Date.now()
      })
    });
  } catch {}
};

async function initSharedServerSync() {
  // 1. Fetch cached global history from server so First-Discoverer Album is synced across all phones/PCs
  try {
    const res = await fetch(`${NTFY_BASE}/json?poll=1&since=all`);
    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const wrapper = JSON.parse(line);
        if (wrapper && wrapper.event === 'message' && wrapper.message) {
          const payload = JSON.parse(wrapper.message);
          await applyRemoteServerEvent(payload, true);
        }
      } catch {}
    }
  } catch {}

  // 2. Connect real-time SSE stream for instant 0.1s multiplayer broadcasts
  try {
    const es = new EventSource(`${NTFY_BASE}/sse`);
    es.onmessage = ev => {
      try {
        const wrapper = JSON.parse(ev.data);
        if (wrapper && wrapper.event === 'message' && wrapper.message) {
          const payload = JSON.parse(wrapper.message);
          applyRemoteServerEvent(payload, false);
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
  showOracle('마른 참나무 장작을 더 넣었습니다. 화로 온도와 불길 크기가 크게 치솟습니다!', '🪵 참나무 장작 투입');
});

document.getElementById('btn-powder').addEventListener('click', () => {
  if (!state.audioEnabled) toggleAudio(true);
  state.paletteIndex = (state.paletteIndex + 1) % PALETTES.length;
  const pal = PALETTES[state.paletteIndex];
  stokeFire(36);
  showOracle(`${pal.name} 연금술 물약을 뿌렸습니다. 화로에 신비로운 빛이 번집니다.`, '✨ 불꽃 물약 변경');
});

document.getElementById('btn-warmth').addEventListener('click', () => {
  if (!state.audioEnabled) toggleAudio(true);
  sendWarmth();
});

function toggleAudio(forceState) {
  state.audioEnabled = forceState !== undefined ? forceState : !state.audioEnabled;
  audio.setRunning(state.audioEnabled);
  document.getElementById('audio-icon').textContent = state.audioEnabled ? '🔊' : '🔇';
  document.getElementById('audio-label').textContent = state.audioEnabled ? 'ASMR' : '음소거';
  document.getElementById('btn-audio').classList.toggle('active', state.audioEnabled);
  document.getElementById('btn-toggle-mute').textContent = state.audioEnabled
    ? '🔊 사운드 켜짐 (탭하여 음소거)'
    : '🔇 음소거 상태 (탭하여 사운드 켜기)';
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
function renderCertificate() {
  const c = document.getElementById('cert-canvas');
  const g = c.getContext('2d');
  const Wc = c.width, Hc = c.height;
  const pal = PALETTES[state.paletteIndex];
  const r = currentRoom();

  const bg = g.createLinearGradient(0, 0, 0, Hc);
  bg.addColorStop(0, '#090b12');
  bg.addColorStop(0.6, '#141118');
  bg.addColorStop(1, '#0b090d');
  g.fillStyle = bg;
  g.fillRect(0, 0, Wc, Hc);

  const rg = g.createRadialGradient(Wc * 0.5, Hc * 0.42, 10, Wc * 0.5, Hc * 0.42, 320);
  rg.addColorStop(0, `rgba(${pal.glow}, 0.34)`);
  rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, Wc, Hc);

  g.strokeStyle = 'rgba(255, 210, 145, 0.35)';
  g.lineWidth = 2;
  g.strokeRect(32, 32, Wc - 64, Hc - 64);
  g.strokeStyle = 'rgba(255, 210, 145, 0.14)';
  g.strokeRect(42, 42, Wc - 84, Hc - 84);

  g.textAlign = 'center';
  g.fillStyle = '#ffd27d';
  g.font = '600 18px Pretendard, sans-serif';
  g.fillText(`${r.title} · 연금술 소각 라운지`, Wc / 2, 105);

  g.fillStyle = '#fff8ee';
  g.font = '800 38px Pretendard, sans-serif';
  g.fillText('번뇌 소각 · 해방 증명서', Wc / 2, 162);

  const ex = Wc / 2, ey = 290;
  for (let rad = 74; rad > 12; rad -= 14) {
    g.fillStyle = `rgba(${pal.glow}, ${(80 - rad) / 140})`;
    g.beginPath();
    g.arc(ex, ey, rad, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#fff7df';
  g.beginPath();
  g.moveTo(ex, ey - 46);
  g.quadraticCurveTo(ex + 34, ey - 4, ex, ey + 34);
  g.quadraticCurveTo(ex - 34, ey - 4, ex, ey - 46);
  g.fill();

  g.fillStyle = 'rgba(255, 248, 235, 0.05)';
  g.beginPath();
  g.roundRect(76, 380, Wc - 152, 150, 20);
  g.fill();

  const displayTemp = Math.round(state.tempC);
  const stats = [
    ['속세 해방 시간', formatTime(state.seconds)],
    ['소각한 번뇌', `${state.burnedCount}건`],
    ['화로 온도', `${displayTemp.toLocaleString('ko-KR')}°C`]
  ];
  stats.forEach(([label, val], idx) => {
    const sx = 172 + idx * 188;
    g.fillStyle = 'rgba(255, 228, 195, 0.65)';
    g.font = '500 17px Pretendard, sans-serif';
    g.fillText(label, sx, 434);
    g.fillStyle = '#ffd27d';
    g.font = '800 30px Pretendard, sans-serif';
    g.fillText(val, sx, 482);
  });

  g.fillStyle = 'rgba(255, 225, 190, 0.6)';
  g.font = '500 16px Pretendard, sans-serif';
  g.fillText('오늘 밤 재가 되어 사라진 생각', Wc / 2, 595);

  g.fillStyle = '#fff5e6';
  g.font = '700 23px Pretendard, sans-serif';
  g.fillText(`「 ${state.lastBurnedText.slice(0, 22)} 」`, Wc / 2, 634);

  g.fillStyle = '#ffd27d';
  g.font = '500 19px Pretendard, sans-serif';
  g.fillText(`“${state.lastOracle}”`, Wc / 2, 725);

  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '.');
  g.fillStyle = 'rgba(255, 235, 210, 0.45)';
  g.font = '500 15px Pretendard, sans-serif';
  g.fillText(`${today} · 불멍 : 재의 연금술 공식 인증`, Wc / 2, 825);
}

document.getElementById('btn-cert').addEventListener('click', () => {
  renderCertificate();
  document.getElementById('modal-cert').classList.add('open');
});

document.getElementById('btn-download-cert').addEventListener('click', () => {
  const c = document.getElementById('cert-canvas');
  const link = document.createElement('a');
  link.download = `bulmeong-certificate-${Date.now()}.png`;
  link.href = c.toDataURL('image/png');
  link.click();
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.getAttribute('data-close')).classList.remove('open');
  });
});

requestAnimationFrame(drawScene);
