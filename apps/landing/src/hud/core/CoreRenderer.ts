import { FRAGMENT, VERTEX } from "./shader";

/**
 * K.A.I. core: a WebGL body of light that reacts to the assistant's state.
 *
 * Two inputs drive everything:
 *   - `energy` (0..1): how awake the core is, eased toward a per-state target.
 *   - `level`  (0..1): live voice amplitude while speaking (simulated envelope
 *     today, a real audio analyser later).
 * Idle only breathes and drifts. Speaking swells the body, speeds up the flow,
 * lights diffuse rays and sends soft ripples out on every syllable.
 */

export type CoreState = "idle" | "listening" | "thinking" | "speaking" | "offline";

interface StateProfile {
  energy: number;
  tint: number;
  dim: number;
  swirl: number;
}

const PROFILES: Record<CoreState, StateProfile> = {
  idle: { energy: 0.08, tint: 0, dim: 0, swirl: 0 },
  listening: { energy: 0.3, tint: 0, dim: 0, swirl: 0 },
  thinking: { energy: 0.45, tint: 0.75, dim: 0, swirl: 1 },
  speaking: { energy: 1, tint: 0.1, dim: 0, swirl: 0 },
  offline: { energy: 0.02, tint: 0, dim: 1, swirl: 0 }
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

interface Wave {
  r: number;
  s: number;
}

const UNIFORMS = [
  "uCenter",
  "uR",
  "uTime",
  "uEnergy",
  "uLevel",
  "uKick",
  "uTint",
  "uDim",
  "uSwirl",
  "uSwirlRot",
  "uWaves"
] as const;

export class CoreRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private loc = {} as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
  private ro: ResizeObserver;
  private raf = 0;
  private last = 0;
  private reduced: boolean;

  private w = 0;
  private h = 0;
  private scale = 1;

  private state: CoreState = "idle";
  private time = Math.random() * 100;
  private energy = PROFILES.idle.energy;
  private tint = 0;
  private dim = 0;
  private swirl = 0;
  private swirlRot = 0;
  private levelTarget = 0;
  private level = 0;
  private kick = 0;
  private armed = true;
  private lastOnset = 0;
  private waves: Wave[] = [];

  /** Smoothed CPU time per frame in ms (for perf checks). */
  frameCost = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) throw new Error("WebGL unavailable");
    this.gl = gl;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.init();

    canvas.addEventListener("webglcontextlost", this.onLost);
    canvas.addEventListener("webglcontextrestored", this.onRestored);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    document.addEventListener("visibilitychange", this.onVisibility);
    this.start();
  }

  /* ----- public API ----- */

  setState(state: CoreState) {
    this.state = state;
    if (state !== "speaking") this.levelTarget = 0;
  }

  setLevel(level: number) {
    if (this.state === "speaking") this.levelTarget = clamp01(level);
  }

  pulse(strength = 0.4) {
    this.kick = Math.min(1, this.kick + strength);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
  }

  /* ----- GL setup ----- */

  private init() {
    const { gl } = this;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    for (const name of UNIFORMS) this.loc[name] = gl.getUniformLocation(prog, name);
  }

  private onLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.raf);
  };

  private onRestored = () => {
    this.init();
    this.resize();
    this.start();
  };

  private onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(this.raf);
    else this.start();
  };

  private start() {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** The look is diffuse, so rendering below native resolution is invisible and much cheaper. */
  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.scale = Math.min(dpr, 1.5) * 0.7;
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.max(1, Math.round(rect.width * this.scale));
    this.canvas.height = Math.max(1, Math.round(rect.height * this.scale));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const t0 = performance.now();
    this.update(dt);
    this.draw();
    this.frameCost = lerp(this.frameCost, performance.now() - t0, 0.1);
    this.raf = requestAnimationFrame(this.frame);
  };

  /* ----- simulation ----- */

  private update(dt: number) {
    const p = PROFILES[this.state];
    const motion = this.reduced ? 0.2 : 1;
    this.time += dt * motion;

    this.energy = lerp(this.energy, p.energy, ease(2, dt));
    this.tint = lerp(this.tint, p.tint, ease(2.5, dt));
    this.dim = lerp(this.dim, p.dim, ease(2, dt));
    this.swirl = lerp(this.swirl, p.swirl, ease(2.5, dt));
    this.swirlRot += dt * motion * (0.8 + this.swirl * 1.6);

    const rising = this.levelTarget > this.level;
    this.level = lerp(this.level, this.levelTarget, ease(rising ? 26 : 8, dt));
    this.kick = Math.max(0, this.kick - dt * 2);

    if (this.armed && this.level > 0.55 && this.time - this.lastOnset > 0.1) {
      this.armed = false;
      this.lastOnset = this.time;
      if (!this.reduced) {
        this.waves.push({ r: 0.18, s: 0.5 + this.level * 0.6 });
        if (this.waves.length > 4) this.waves.shift();
        this.kick = Math.min(1, this.kick + 0.25 * this.level);
      }
    } else if (this.level < 0.3) {
      this.armed = true;
    }

    for (const w of this.waves) {
      w.r += dt * (1.1 - Math.min(w.r, 1.2) * 0.4);
      w.s *= Math.exp(-1.6 * dt);
    }
    this.waves = this.waves.filter((w) => w.s > 0.02 && w.r < 2.4);
  }

  private draw() {
    const { gl, loc, scale } = this;
    const R = Math.min(this.w * 0.36, this.h * 0.3) * scale;
    const cx = (this.w / 2) * scale;
    const cy = this.canvas.height - this.h * 0.43 * scale;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.uCenter, cx, cy);
    gl.uniform1f(loc.uR, R);
    gl.uniform1f(loc.uTime, this.time);
    gl.uniform1f(loc.uEnergy, this.energy);
    gl.uniform1f(loc.uLevel, this.level);
    gl.uniform1f(loc.uKick, this.kick);
    gl.uniform1f(loc.uTint, this.tint);
    gl.uniform1f(loc.uDim, this.dim);
    gl.uniform1f(loc.uSwirl, this.swirl);
    gl.uniform1f(loc.uSwirlRot, this.swirlRot);
    const waves = new Float32Array(16);
    this.waves.forEach((w, i) => {
      waves[i * 4] = w.r;
      waves[i * 4 + 1] = w.s;
    });
    gl.uniform4fv(loc.uWaves, waves);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
