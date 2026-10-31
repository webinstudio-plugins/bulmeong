// Campfire flame from a small WebGL fragment shader: rising, domain-warped noise eats into a tapering silhouette, so the
// top splits into separate tongues, and a soft three-band ramp (outer, mid, core) paints it in the palette's colours.
// It renders into its own small canvas, which app.mjs draws onto the 2D stage between the pit and its front stones.
// createFlame() returns null without WebGL; app.mjs then keeps its canvas-path flame.

const VERT = `attribute vec2 p; varying vec2 v;
void main() { v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;
uniform float uTime, uLevel, uStoke, uWind;
uniform vec3 uCore, uMid, uOuter;

vec2 h2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}
float gn(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(h2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(h2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * gn(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; }
  return s;
}

void main() {
  float y = v.y, t = uTime, sp = 1.0 + 0.35 * uStoke;
  float sway = (0.05 * sin(t * 1.3 + y * 2.5) + 0.03 * sin(t * 2.3 + 1.7)) * y + uWind * 0.22 * y * y;
  float x = (v.x - 0.5 - sway) * 2.0;
  // rising noise bends the columns sideways, more towards the top
  x += fbm(vec2(x * 1.5, y * 1.8 - t * 1.4 * sp)) * 0.35 * y;
  // every column reaches its own height; the peaks of this rising noise are the tongues, the dips the gaps between them
  float prof = max(0.0, 1.0 - x * x / 0.5);
  float tall = fbm(vec2(x * 3.0, y * 0.8 - t * 1.9 * sp));
  float top = prof * (0.45 + 1.5 * tall + 0.35 * prof) * (0.86 + 0.1 * uLevel + 0.1 * uStoke);
  float heat = max(-1.0, 1.0 - y / max(top, 0.001)) * (0.35 + 0.65 * prof);
  heat += gn(vec2(x * 6.0, y * 5.0 - t * 4.0 * sp)) * 0.12;
  // the base follows the pit's ellipse: lowest in the middle, so no straight bottom edge shows above the front stones
  heat *= smoothstep(0.0, 0.16, y - 0.14 * x * x);
  heat -= smoothstep(0.85, 1.0, abs(v.x * 2.0 - 1.0)) + smoothstep(0.9, 1.0, y);

  // lower parts lean warmer, so the red edge shows on the tips, not as an outline round the whole flame
  // thin rising streaks give the body some grain instead of one flat fill
  float streak = gn(vec2(x * 9.0, y * 2.4 - t * 3.2 * sp));
  float hc = heat + 0.22 * (1.0 - y) + streak * 0.2;
  vec3 col = mix(uOuter, uMid, smoothstep(0.12, 0.34, hc));
  col = mix(col, uCore, smoothstep(0.7, 0.95, hc));
  col = mix(col, vec3(1.0), 0.3 * smoothstep(1.0, 1.15, hc));
  float a = smoothstep(0.0, 0.14, heat) * mix(0.95, 0.7, smoothstep(0.25, 0.85, y)) * (0.9 + 0.1 * streak);
  gl_FragColor = vec4(col * a, a);
}`;

export function createFlame(width = 256, height = 384) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  let gl, loc;

  function init() {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    if (!gl) return false;
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
    loc = Object.fromEntries(['uTime', 'uLevel', 'uStoke', 'uWind', 'uCore', 'uMid', 'uOuter'].map(n => [n, gl.getUniformLocation(prog, n)]));
    gl.viewport(0, 0, width, height);
    return true;
  }

  try {
    if (!init()) return null;
  } catch (e) {
    console.warn('flame shader unavailable', e);
    return null;
  }

  const api = { canvas, lost: false };
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); api.lost = true; });
  canvas.addEventListener('webglcontextrestored', () => { try { api.lost = !init(); } catch { api.lost = true; } });

  // colours are 0..255 triplets; time in seconds
  api.render = ({ time, level, stoke, wind, core, mid, outer }) => {
    // shortcut: time wraps every 10 minutes so mediump GPUs keep noise precision; the flame jumps once per wrap.
    gl.uniform1f(loc.uTime, time % 600);
    gl.uniform1f(loc.uLevel, level);
    gl.uniform1f(loc.uStoke, stoke);
    gl.uniform1f(loc.uWind, wind);
    gl.uniform3f(loc.uCore, core[0] / 255, core[1] / 255, core[2] / 255);
    gl.uniform3f(loc.uMid, mid[0] / 255, mid[1] / 255, mid[2] / 255);
    gl.uniform3f(loc.uOuter, outer[0] / 255, outer[1] / 255, outer[2] / 255);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  return api;
}
