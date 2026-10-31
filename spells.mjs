// Secret-word effects. Each effect is a closure that draws one frame and returns false once it is finished.
// app.mjs calls spawnSpell() when a word is found and drawSpells(env) every frame after the pit's front stones.
// env: { ctx, W, H, fx, fy, top, spark(x, y, burst), fonts: { title, serif, mono } }; fy is the fire base, top the flame tip.

const live = [];
const clamp01 = k => Math.max(0, Math.min(1, k));
const ease = k => 1 - Math.pow(1 - k, 3);
const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const pick = s => s[Math.floor(Math.random() * s.length)];

export function drawSpells(env) {
  let n = 0;
  for (const fx of live) if (fx(env) !== false) live[n++] = fx;
  live.length = n;
}

// Whole-screen tint that fades out: lightning, or a locked word that refuses to light.
export function screenFlash(col = [215, 225, 255], strength = 0.45, frames = 22) {
  let f = 0;
  live.push(({ ctx, W, H }) => {
    ctx.fillStyle = rgba(col, strength * Math.pow(1 - f / frames, 2));
    ctx.fillRect(0, 0, W, H);
    return ++f < frames;
  });
}

// Light bursting out of the fire in the new flame colour.
function bloom(col, strength) {
  let f = 0;
  return ({ ctx, W, H, fx, fy, top }) => {
    const cy = (fy + top) / 2, a = strength * 0.42 * Math.pow(1 - f / 30, 2);
    const g = ctx.createRadialGradient(fx, cy, 0, fx, cy, Math.max(W, H) * 0.75);
    g.addColorStop(0, rgba(col, a));
    g.addColorStop(0.35, rgba(col, a * 0.35));
    g.addColorStop(1, rgba(col, 0));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    return ++f < 30;
  };
}

// Heat wave rolling out over the ground from the pit.
function shockwave(col, rings) {
  let f = 0;
  const dur = 84;
  return ({ ctx, W, H, fx, fy }) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let r = 0; r < rings; r++) {
      const k = (f - r * 14) / dur;
      if (k <= 0 || k >= 1) continue;
      const rad = 40 + ease(k) * Math.min(W, H) * 0.5, a = (1 - k) * (1 - k);
      ctx.beginPath();
      ctx.ellipse(fx, fy + 8, rad, rad * 0.24, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(col, a * 0.18);
      ctx.lineWidth = 2 + 18 * (1 - k);
      ctx.stroke();
      ctx.strokeStyle = rgba(col, a * 0.75);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
    return ++f < dur + rings * 14;
  };
}

// The found word's name, set once above the flame.
function titleCard({ title, sub, col }) {
  let f = 0;
  const dur = 260;
  return ({ ctx, W, H, fx, top, fonts }) => {
    const k = f / dur, a = Math.min(clamp01(k / 0.08), clamp01((1 - k) / 0.18));
    const y = Math.max(132, Math.min(H * 0.36, top - 92)) + (1 - ease(clamp01(k / 0.14))) * 12;
    const size = Math.round(Math.max(24, Math.min(36, W * 0.068)));
    ctx.save();
    // emoji ignore the fill colour's alpha, so the fade goes through globalAlpha
    ctx.globalAlpha = a;
    ctx.translate(fx, y);
    // dark wash behind the words so they read over the fire glow
    ctx.save();
    ctx.scale(1, 0.32);
    const wash = ctx.createRadialGradient(0, -size * 1.2, 0, 0, -size * 1.2, Math.min(W * 0.55, 300));
    wash.addColorStop(0, 'rgba(10, 6, 3, 0.55)');
    wash.addColorStop(1, 'rgba(10, 6, 3, 0)');
    ctx.fillStyle = wash;
    ctx.fillRect(-W, -size * 8, W * 2, size * 12);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${size}px ${fonts.title}`;
    const maxW = W - 40;
    ctx.shadowColor = rgba(col, 0.9);
    ctx.shadowBlur = 22;
    const g = ctx.createLinearGradient(0, -size, 0, 0);
    g.addColorStop(0, '#fff9ec');
    g.addColorStop(1, '#ffd696');
    ctx.fillStyle = g;
    ctx.fillText(title, 0, 0, maxW);
    ctx.shadowBlur = 0;

    // small line underneath with hairlines that draw outwards
    ctx.font = `600 12px ${fonts.serif}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
    const sw = Math.min(ctx.measureText(sub).width, maxW - 90);
    ctx.fillStyle = 'rgba(255, 222, 170, 0.85)';
    ctx.fillText(sub, 0, 24, maxW - 90);
    const line = 34 * ease(clamp01((f - 8) / 40));
    ctx.strokeStyle = 'rgba(255, 210, 140, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-sw / 2 - 10, 20);
    ctx.lineTo(-sw / 2 - 10 - line, 20);
    ctx.moveTo(sw / 2 + 10, 20);
    ctx.lineTo(sw / 2 + 10 + line, 20);
    ctx.stroke();
    ctx.restore();
    return ++f < dur;
  };
}

// A few words for the egg, one at a time, rising beside the flame in alternating lanes.
function glyphs(words, col) {
  const items = words.slice(0, 5).map((w, i) => ({ w, d: 10 + i * 18, side: i % 2 ? 1 : -1, off: 0.55 + Math.random() * 0.35, seed: Math.random() * 9 }));
  let f = 0;
  return ({ ctx, W, fx, fy, top, fonts }) => {
    let alive = false;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const g of items) {
      const k = (f - g.d) / 120;
      if (k >= 1) continue;
      alive = true;
      if (k < 0) continue;
      ctx.font = /[぀-鿿가-힯]/.test(g.w) ? `700 16px ${fonts.serif}` : `600 14px ${fonts.mono}`;
      const half = ctx.measureText(g.w).width / 2;
      const x = Math.max(half + 10, Math.min(W - half - 10, fx + g.side * Math.min(W * 0.36, 150) * g.off + Math.sin(f * 0.04 + g.seed) * 6));
      const y = fy - 30 - ease(k) * Math.max(80, (fy - top) * 0.9);
      ctx.globalAlpha = Math.min(clamp01(k / 0.15), clamp01((1 - k) / 0.4));
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 6;
      ctx.strokeStyle = rgba(col, 0.22);
      ctx.strokeText(g.w, x, y);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff4e0';
      ctx.fillText(g.w, x, y);
    }
    ctx.restore();
    f += 1;
    return alive;
  };
}

// Limit-up chart: candles climb out of the fire one by one, a trend line follows them, a price tag pops at the top,
// then the candles burn away left to right into sparks.
function candleChart({ up, down, tag }) {
  const N = 11, gap = 6, grow = 10, tagAt = 4 + N * gap + grow, hold = tagAt + 64;
  const closes = [];
  let v = 0;
  for (let i = 0; i < N; i++) {
    v += i === 3 || i === 7 ? -0.3 - Math.random() * 0.2 : 0.45 + i * 0.13 + Math.random() * 0.25;
    closes.push(v);
  }
  const lo = -0.5, hi = v + 0.35;
  const wicks = closes.map(() => [0.05 + Math.random() * 0.22, 0.05 + Math.random() * 0.22]);
  let f = 0;
  return ({ ctx, W, fx, fy, top, spark, fonts }) => {
    const cw = Math.min(W * 0.78, 440), left = fx - cw / 2, step = cw / (N - 1), bw = Math.max(6, step * 0.52);
    const y0 = fy - 26, y1 = Math.min(fy - 130, top - 10);
    const Y = val => y0 + (y1 - y0) * (val - lo) / (hi - lo);
    ctx.save();

    ctx.globalAlpha = 0.14 * clamp01(f / 20) * clamp01(1 - (f - hold) / 30);
    ctx.strokeStyle = '#ffe9c8';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    for (let g = 0; g < 4; g++) {
      const gy = y0 + (y1 - y0) * g / 3;
      ctx.beginPath();
      ctx.moveTo(left - 14, gy);
      ctx.lineTo(left + cw + 14, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const pts = [];
    let alive = false;
    for (let i = 0; i < N; i++) {
      const born = 4 + i * gap;
      if (f < born) { alive = true; break; }
      const x = left + i * step, open = i ? closes[i - 1] : 0;
      const close = open + (closes[i] - open) * ease(clamp01((f - born) / grow));
      const burnAt = hold + i * 3, a = 1 - clamp01((f - burnAt) / 16);
      if (f === born) for (let s = 0; s < 3; s++) spark(x, Y(closes[i]), true);
      if (f === burnAt) for (let s = 0; s < 4; s++) spark(x, Y(closes[i]), true);
      if (a <= 0) continue;
      alive = true;
      const col = closes[i] >= open ? up : down;
      const yt = Y(Math.max(open, close)), yb = Y(Math.min(open, close)), h = Math.max(2, yb - yt);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgba(col, 0.22 * a);
      ctx.fillRect(x - bw / 2 - 4, yt - 4, bw + 8, h + 8);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = rgba(col, a);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, Y(Math.max(open, close) + wicks[i][0]));
      ctx.lineTo(x, Y(Math.min(open, close) - wicks[i][1]));
      ctx.stroke();
      ctx.fillStyle = rgba(col, 0.95 * a);
      ctx.fillRect(x - bw / 2, yt, bw, h);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * a})`;
      ctx.fillRect(x - bw / 2, yt, bw, 1.5);
      pts.push([x, Y(close), a]);
    }

    if (pts.length > 1) {
      ctx.globalCompositeOperation = 'lighter';
      for (const [w, al] of [[6, 0.16], [1.6, 0.85]]) {
        ctx.lineWidth = w;
        ctx.strokeStyle = `rgba(255, 238, 205, ${al * pts[pts.length - 1][2]})`;
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      const [hx, hy, ha] = pts[pts.length - 1];
      const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 18);
      hg.addColorStop(0, `rgba(255, 250, 230, ${ha})`);
      hg.addColorStop(1, 'rgba(255, 250, 230, 0)');
      ctx.fillStyle = hg;
      ctx.fillRect(hx - 18, hy - 18, 36, 36);
      ctx.globalCompositeOperation = 'source-over';
    }

    const tk = clamp01((f - tagAt) / 14), ta = 1 - clamp01((f - hold - N * 3) / 16);
    if (tk > 0 && ta > 0) {
      const s = 1 + 2.7 * Math.pow(tk - 1, 3) + 1.7 * Math.pow(tk - 1, 2);
      ctx.font = `700 14px ${fonts.mono}`;
      const tw = ctx.measureText(tag).width + 20, th = 26;
      const tx = Math.min(W - tw / 2 - 8, left + cw), ty = Y(closes[N - 1] + wicks[N - 1][0]) - 22;
      ctx.translate(tx, ty);
      ctx.scale(s, s);
      ctx.globalAlpha = ta;
      ctx.fillStyle = rgba(up, 1);
      ctx.beginPath();
      ctx.roundRect(-tw / 2, -th / 2, tw, th, 5);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tag, 0, 1);
      alive = true;
    }
    ctx.restore();
    f += 1;
    return alive;
  };
}

// Columns of code falling into the fire; each glyph turns to an ember as it reaches the flame and the column ends in sparks.
function codeRain(chars, env) {
  const n = Math.max(10, Math.min(22, Math.round(env.W * 0.72 / 22)));
  const span = Math.min(env.W * 0.44, 280);
  const cols = Array.from({ length: n }, (_, i) => {
    const len = 8 + Math.floor(Math.random() * 9);
    return {
      dx: -span + (2 * span * (i + 0.5)) / n + (Math.random() - 0.5) * 8,
      delay: Math.floor(Math.random() * 90),
      speed: 4.5 + Math.random() * 3.5,
      len,
      head: -Math.random() * 120,
      g: Array.from({ length: len }, () => pick(chars)),
      hit: false
    };
  });
  const ember = [255, 150, 60];
  let f = 0;
  return ({ ctx, fx, fy, top, spark, fonts }) => {
    let alive = false;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.font = `600 15px ${fonts.mono}`;
    ctx.textAlign = 'center';
    for (const c of cols) {
      if (f < c.delay) { alive = true; continue; }
      const x = fx + c.dx;
      const end = top + (fy - top) * (0.35 + 0.3 * Math.abs(c.dx) / span);
      c.head += c.speed;
      if (c.head - c.len * 17 > end) continue;
      alive = true;
      if (!c.hit && c.head >= end) {
        c.hit = true;
        spark(x, end, true);
        spark(x, end, true);
      }
      if (Math.random() < 0.12) c.g[Math.floor(Math.random() * c.len)] = pick(chars);
      for (let k = 0; k < c.len; k++) {
        const y = c.head - k * 17;
        if (y > end || y < -20) continue;
        const burn = clamp01((y - (end - 70)) / 70);
        const base = k === 0 ? [225, 255, 235] : [70, 255, 150];
        ctx.fillStyle = rgba(mix(base, ember, burn), (1 - k / c.len) * (1 - burn * 0.6) * (k === 0 ? 1 : 0.8));
        ctx.fillText(c.g[k], x, y);
      }
    }
    ctx.restore();
    f += 1;
    return alive;
  };
}

// Shells launched out of the fire burst into streaking stars; some of them twinkle as they fade.
function fireworks(count) {
  const palette = [[255, 206, 110], [255, 124, 150], [255, 150, 70], [170, 215, 255], [205, 165, 255]];
  const shells = Array.from({ length: count }, (_, i) => ({
    born: i * 16,
    // alternate sides so the bursts frame the title card instead of covering it
    tx: (i % 2 ? 1 : -1) * (0.2 + Math.random() * 0.16),
    ty: 0.1 + Math.random() * 0.18,
    col: palette[i % palette.length],
    trail: [],
    stars: null,
    t: 0
  }));
  let f = 0;
  return ({ ctx, W, H, fx, top }) => {
    let alive = false;
    const scale = Math.max(0.7, Math.min(1.4, Math.min(W, H) / 640));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const s of shells) {
      s.t = f - s.born;
      if (s.t < 0) { alive = true; continue; }
      const x1 = fx + s.tx * W, y1 = Math.max(110, H * s.ty + 50);
      if (s.t < 34) {
        alive = true;
        const k = ease(s.t / 34), x = fx + (x1 - fx) * k, y = top + (y1 - top) * k;
        s.trail.push([x, y]);
        if (s.trail.length > 8) s.trail.shift();
        ctx.strokeStyle = 'rgba(255, 214, 160, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        s.trail.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
        continue;
      }
      if (!s.stars) {
        s.stars = Array.from({ length: 80 }, (_, i) => {
          const ang = (i / 80) * Math.PI * 2 + Math.random() * 0.1, sp = (2 + Math.random() * 3) * scale;
          return { x: x1, y: y1, px: x1, py: y1, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: 60 + Math.random() * 40, tw: Math.random() < 0.35, seed: Math.random() * 6 };
        });
      }
      const bt = s.t - 34;
      if (bt < 14) {
        const g = ctx.createRadialGradient(x1, y1, 0, x1, y1, 90 * scale);
        g.addColorStop(0, rgba(s.col, 0.5 * (1 - bt / 14)));
        g.addColorStop(1, rgba(s.col, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x1 - 90 * scale, y1 - 90 * scale, 180 * scale, 180 * scale);
      }
      for (const p of s.stars) {
        if (p.life >= p.max) continue;
        alive = true;
        p.life += 1;
        p.px = p.x;
        p.py = p.y;
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 + 0.035;
        p.x += p.vx;
        p.y += p.vy;
        const k = p.life / p.max;
        let a = Math.pow(1 - k, 1.4);
        if (p.tw && k > 0.45) a *= Math.sin(p.life * 0.9 + p.seed) > 0 ? 1 : 0.15;
        ctx.strokeStyle = rgba(k < 0.1 ? mix([255, 250, 235], s.col, k / 0.1) : s.col, a);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(p.px - p.vx * 1.5, p.py - p.vy * 1.5);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
    ctx.restore();
    f += 1;
    return alive;
  };
}

function jag(x0, y0, x1, y1, depth, out) {
  if (depth === 0) {
    out.push([x1, y1]);
    return;
  }
  const len = Math.hypot(x1 - x0, y1 - y0);
  const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * len * 0.3, my = (y0 + y1) / 2 + (Math.random() - 0.5) * len * 0.06;
  jag(x0, y0, mx, my, depth - 1, out);
  jag(mx, my, x1, y1, depth - 1, out);
}

// Forked bolts strike the fire one after another, flicker twice and fade; each strike flashes the sky.
function lightning(count, env) {
  const bolts = Array.from({ length: count }, (_, i) => {
    const sx = env.fx + (Math.random() - 0.5) * env.W * 0.5, ex = env.fx + (Math.random() - 0.5) * 16, ey = env.top + 20;
    const main = [[sx, -10]];
    jag(sx, -10, ex, ey, 7, main);
    const forks = [0.25, 0.5].map(at => {
      const [bx, by] = main[Math.floor(main.length * (at + Math.random() * 0.15))];
      const pts = [[bx, by]];
      jag(bx, by, bx + (Math.random() < 0.5 ? -1 : 1) * (50 + Math.random() * 80), by + 60 + Math.random() * 90, 5, pts);
      return pts;
    });
    return { born: i * 10, paths: [main, ...forks] };
  });
  let f = 0;
  return ({ ctx, fx, top, spark }) => {
    let alive = false;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round';
    for (const b of bolts) {
      const t = f - b.born;
      if (t < 0) { alive = true; continue; }
      if (t >= 36) continue;
      alive = true;
      if (t === 0) {
        screenFlash([205, 218, 255], 0.5, 18);
        for (let s = 0; s < 12; s++) spark(fx, top + 20, true);
      }
      if (t === 4 || t === 5) continue;
      const a = t < 10 ? 1 : 1 - (t - 10) / 26;
      b.paths.forEach((pts, pi) => {
        const thin = pi ? 0.55 : 1;
        for (const [w, al, c] of [[12, 0.1, '150, 170, 255'], [4.5, 0.35, '185, 200, 255'], [1.6, 1, '255, 255, 255']]) {
          ctx.lineWidth = w * thin;
          ctx.strokeStyle = `rgba(${c}, ${al * a})`;
          ctx.beginPath();
          pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
        }
      });
    }
    ctx.restore();
    f += 1;
    return alive;
  };
}

// Embers leave the fire and turn into petals on the way up, then drift down across the scene.
function petals(tint, deep, env) {
  const unit = Math.max(0.8, Math.min(1.3, Math.min(env.W, env.H) / 700));
  const ps = Array.from({ length: 70 }, (_, i) => ({
    born: Math.floor(i * 0.8),
    x: 0, y: 0, started: false,
    vx: (Math.random() - 0.5) * 2.6,
    vy: -(2.6 + Math.random() * 2.4),
    s: (5 + Math.random() * 4) * unit,
    rot: Math.random() * Math.PI * 2,
    vr: 0.01 + Math.random() * 0.025,
    flip: Math.random() * Math.PI * 2,
    vf: 0.06 + Math.random() * 0.08,
    seed: Math.random() * 9,
    life: 0,
    max: 260 + Math.random() * 90
  }));
  const ember = [255, 160, 70];
  let f = 0;
  return ({ ctx, fx, top }) => {
    let alive = false;
    for (const p of ps) {
      if (f < p.born) { alive = true; continue; }
      if (!p.started) {
        p.started = true;
        p.x = fx + (Math.random() - 0.5) * 50;
        p.y = top + 20 + Math.random() * 40;
      }
      if (p.life >= p.max) continue;
      alive = true;
      p.life += 1;
      p.vx *= 0.99;
      p.vy = Math.min(0.85, p.vy + 0.04);
      p.x += p.vx + Math.sin(f * 0.03 + p.seed) * 0.7;
      p.y += p.vy;
      p.rot += p.vr;
      p.flip += p.vf;
      const k = p.life / p.max, warm = 1 - clamp01(p.life / 45);
      const a = Math.min(clamp01(p.life / 8), clamp01((1 - k) / 0.25));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.cos(p.flip), 1);
      const s = p.s;
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.bezierCurveTo(-s * 0.8, s * 0.5, -s * 0.85, -s * 0.55, -s * 0.22, -s);
      ctx.lineTo(0, -s * 0.78);
      ctx.lineTo(s * 0.22, -s);
      ctx.bezierCurveTo(s * 0.85, -s * 0.55, s * 0.8, s * 0.5, 0, s);
      ctx.fillStyle = rgba(mix(tint, ember, warm), a * 0.92);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, s * 0.45, s * 0.22, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(mix(deep, ember, warm), a * 0.5);
      ctx.fill();
      ctx.restore();
    }
    f += 1;
    return alive;
  };
}

// Streaks spiral into a dark core above the fire, which flares once and closes.
function vortex(env) {
  const R = Math.min(env.W, env.H) * 0.48;
  const ps = Array.from({ length: 150 }, () => ({ r0: 50 + Math.random() * R, a: Math.random() * Math.PI * 2, d: Math.floor(Math.random() * 40), px: null, py: null }));
  let f = 0;
  const dur = 150;
  return ({ ctx, fx, fy, top }) => {
    const cx = fx, cy = top + (fy - top) * 0.3;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const p of ps) {
      const k = clamp01((f - p.d) / (dur - 40));
      if (k <= 0 || k >= 1) continue;
      const r = p.r0 * (1 - ease(k));
      p.a += 0.035 + 2.2 / (r + 30);
      const x = cx + Math.cos(p.a) * r, y = cy + Math.sin(p.a) * r * 0.42;
      if (p.px !== null) {
        ctx.strokeStyle = rgba(mix([190, 150, 255], [255, 240, 220], k), (1 - k * 0.4) * 0.8);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      p.px = x;
      p.py = y;
    }
    const core = Math.sin(clamp01(f / dur) * Math.PI) * 22;
    ctx.globalCompositeOperation = 'source-over';
    if (core > 0.5) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, core, core * 0.9, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(4, 2, 10, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 220, 180, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
    if (f === dur - 10) screenFlash([210, 190, 255], 0.35, 20);
    return ++f < dur;
  };
}

// words for eggs whose main effect has no words of its own (the chart and the code rain already carry theirs)
const GLYPHS = {
  egg_konami: ['↑ ↑ ↓ ↓', '← → ← →', 'B  A', '30 LIVES', '1UP'],
  egg_blackhole: ['EVENT HORIZON', 'SINGULARITY', '∞'],
  egg_sword: ['+99', 'CRITICAL!', 'LEGEND'],
  egg_dragon: ['🐉', '🔮', '🌊', '靑龍'],
  egg_pi: ['π', '3.14159 26535', '2πr', '∞'],
  egg_42: ['42', 'DEEP THOUGHT', "DON'T PANIC", '🌌'],
  egg_morse: ['··· −−− ···', 'SOS', 'MAYDAY', '🚢'],
  egg_prometheus: ['FIRST FIRE', 'TITAN FLAME', '☀️'],
  egg_schrodinger: ['|ψ⟩ = α|0⟩ + β|1⟩', 'E = mc²', '🐈‍⬛', 'SUPERPOSITION'],
  egg_nirvana: ['色卽是空', '空卽是色', '涅槃', '🪷'],
  egg_phoenix: ['🦅', 'REBIRTH', 'Lv.MAX'],
  egg_creator: ['👑', 'ABSOLUTE FLAME', '✨']
};
const CODE = {
  egg_matrix: '01{}[]<>/*#$%=+;rmfNUL0x404ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ',
  egg_helloworld: 'helowrd,!(){};#<>.stdiprntf0',
  egg_binary: '01'
};

// opts: { title, sub, col (palette glow as [r, g, b]), upRed (true where rising prices are red) }
export function spawnSpell(egg, env, { title, sub, col, upRed }) {
  const id = egg.id, mythic = egg.tier === 'mythic';
  live.push(bloom(col, mythic ? 1.3 : 1));
  live.push(shockwave(col, mythic ? 3 : egg.tier === 'epic' ? 2 : 1));
  if (CODE[id]) live.push(codeRain(CODE[id], env));
  if (id === 'egg_bull' || id === 'egg_satoshi') {
    live.push(candleChart(id === 'egg_satoshi'
      ? { up: [255, 196, 70], down: [170, 140, 110], tag: '₿ +10,000%' }
      : upRed ? { up: [255, 72, 72], down: [80, 150, 255], tag: '▲ +30.00%' } : { up: [46, 210, 125], down: [255, 84, 84], tag: '▲ +30.00%' }));
  }
  if (id === 'egg_fireworks' || id === 'egg_konami' || mythic) live.push(fireworks(mythic ? 5 : 4));
  if (['egg_lightning', 'egg_sword', 'egg_prometheus', 'egg_creator'].includes(id)) live.push(lightning(mythic ? 4 : 2, env));
  if (id === 'egg_sakura') live.push(petals([255, 190, 210], [236, 120, 160], env));
  if (id === 'egg_nirvana') live.push(petals([255, 230, 165], [240, 175, 95], env));
  if (id === 'egg_blackhole') live.push(vortex(env));
  if (GLYPHS[id]) live.push(glyphs(GLYPHS[id], col));
  live.push(titleCard({ title, sub, col }));
}
