/**
 * K.A.I. reactor core — a canvas renderer that reacts to the assistant's state.
 *
 * Two inputs drive everything:
 *   - `energy` (0..1): how "awake" the core is. Eased toward a per-state target,
 *     so state changes never snap.
 *   - `level`  (0..1): instantaneous voice amplitude while speaking. Fed every
 *     frame from outside (a simulated envelope today, real audio later).
 *
 * Idle is deliberately calm: slow rotation and a soft breath. Speaking turns on
 * the voice waveform, radial spectrum, shockwaves on syllable onsets, particle
 * bursts and ring "kicks", so the core looks alive while it talks.
 */

export type CoreState = "idle" | "listening" | "thinking" | "speaking" | "offline";

interface StateProfile {
  energy: number;
  tint: number; // 0 = cyan, 1 = violet
  dim: number; // 0 = full color, 1 = desaturated grey
  sweep: number; // radar sweep visibility
}

const PROFILES: Record<CoreState, StateProfile> = {
  idle: { energy: 0.1, tint: 0, dim: 0, sweep: 0 },
  listening: { energy: 0.3, tint: 0, dim: 0, sweep: 0 },
  thinking: { energy: 0.5, tint: 0.85, dim: 0, sweep: 1 },
  speaking: { energy: 1, tint: 0.12, dim: 0, sweep: 0 },
  offline: { energy: 0.03, tint: 0, dim: 1, sweep: 0 }
};

const CYAN = [155, 231, 255];
const VIOLET = [179, 166, 255];
const GREY = [96, 104, 118];
const TAU = Math.PI * 2;

/* ---------- small math helpers ---------- */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Frame-rate independent easing factor. */
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/** Smooth 1D value noise in [0, 1]. */
function noise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u);
}

/* ---------- scene elements ---------- */

interface Ring {
  r: number; // radius as a fraction of R
  width: number; // fraction of R
  arcs: [number, number][]; // [start, length] in radians; empty = full circle
  speed: number; // rad/s at energy 1
  rot: number;
  spin: number; // extra angular velocity from kicks
  alpha: number;
  ends: boolean; // draw dots at arc ends
}

interface Particle {
  orbit: number; // fraction of R
  angle: number;
  speed: number;
  size: number;
  phase: number;
  push: number; // radial displacement in px
  vel: number; // radial velocity px/s
}

/** Groups many small strokes/fills by alpha bucket to cut draw calls. */
class Batch {
  paths: Path2D[];
  constructor(public levels = 6) {
    this.paths = Array.from({ length: levels }, () => new Path2D());
  }
  at(alpha: number) {
    const i = Math.min(this.levels - 1, Math.floor(clamp01(alpha) * this.levels));
    return this.paths[i];
  }
  alphaOf(i: number) {
    return (i + 0.75) / this.levels;
  }
}

interface Bolt {
  points: [number, number][];
  life: number;
}

interface Wave {
  r: number; // px
  life: number; // 0..1
  strength: number;
}

function buildRings(rand: () => number): Ring[] {
  const arcs = (count: number, fill: number): [number, number][] => {
    const out: [number, number][] = [];
    const slot = TAU / count;
    for (let i = 0; i < count; i++) {
      const len = slot * fill * (0.45 + rand() * 0.55);
      out.push([i * slot + rand() * (slot - len), len]);
    }
    return out;
  };
  const ring = (
    r: number,
    width: number,
    a: [number, number][],
    speed: number,
    alpha: number,
    ends = false
  ): Ring => ({ r, width, arcs: a, speed, rot: rand() * TAU, spin: 0, alpha, ends });

  return [
    ring(0.47, 0.035, arcs(3, 0.92), 0.55, 0.55),
    ring(0.53, 0.004, [], 0, 0.22),
    ring(0.6, 0.012, arcs(18, 0.5), -0.35, 0.45),
    ring(0.78, 0.02, arcs(5, 0.8), 0.22, 0.4, true),
    ring(0.85, 0.003, [], 0, 0.18),
    ring(0.93, 0.006, arcs(7, 0.55), -0.15, 0.35, true),
    ring(1.06, 0.003, arcs(2, 0.95), 0.08, 0.2)
  ];
}

/* ---------- renderer ---------- */

export class CoreRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private time = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private reduced: boolean;
  private ro: ResizeObserver;

  private state: CoreState = "idle";
  private energy = PROFILES.idle.energy;
  private tint = 0;
  private dim = 0;
  private sweep = 0;
  private sweepRot = 0;

  private levelTarget = 0;
  private level = 0;
  private armed = true;
  private lastOnset = 0;
  private kick = 0; // short-lived scale/brightness boost

  private rings: Ring[];
  private particles: Particle[] = [];
  private waves: Wave[] = [];
  private bolts: Bolt[] = [];
  private bars: Float32Array;
  private rand = mulberry32(7);
  /** Smoothed CPU time per frame in ms (for perf checks). */
  frameCost = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas not supported");
    this.ctx = ctx;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.rings = buildRings(this.rand);
    this.bars = new Float32Array(120);
    for (let i = 0; i < 170; i++) {
      this.particles.push({
        orbit: 0.36 + Math.pow(this.rand(), 0.7) * 0.9,
        angle: this.rand() * TAU,
        speed: (0.08 + this.rand() * 0.35) * (this.rand() < 0.5 ? -1 : 1),
        size: 0.6 + this.rand() * 1.6,
        phase: this.rand() * TAU,
        push: 0,
        vel: 0
      });
    }

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

  /** Voice amplitude, 0..1. Only has an effect while speaking. */
  setLevel(level: number) {
    if (this.state === "speaking") this.levelTarget = clamp01(level);
  }

  /** A momentary nudge (keystroke, panel opening, word boundary). */
  pulse(strength = 0.4) {
    this.kick = Math.min(1, this.kick + strength);
    for (const ring of this.rings) {
      ring.spin += (ring.speed >= 0 ? 1 : -1) * strength * 0.6;
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  /* ----- lifecycle ----- */

  private start() {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(this.raf);
    else this.start();
  };

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
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
    const motion = this.reduced ? 0.15 : 1;
    this.time += dt * motion;

    this.energy = lerp(this.energy, p.energy, ease(2.2, dt));
    this.tint = lerp(this.tint, p.tint, ease(3, dt));
    this.dim = lerp(this.dim, p.dim, ease(2, dt));
    this.sweep = lerp(this.sweep, p.sweep, ease(3, dt));
    this.sweepRot += dt * motion * (1.2 + this.sweep * 2.4);

    // Fast attack, slower release — reads like a VU meter.
    const rising = this.levelTarget > this.level;
    this.level = lerp(this.level, this.levelTarget, ease(rising ? 30 : 9, dt));
    this.kick = Math.max(0, this.kick - dt * 2.4);

    // Syllable onsets trigger shockwaves, bursts and ring kicks.
    if (this.armed && this.level > 0.55 && this.time - this.lastOnset > 0.09) {
      this.armed = false;
      this.lastOnset = this.time;
      this.onset(this.level);
    } else if (this.level < 0.32) {
      this.armed = true;
    }

    const R = this.radius();
    const spinRate = (0.2 + this.energy * 2.4 + this.level * 1.5) * motion;
    for (const ring of this.rings) {
      ring.rot += (ring.speed * spinRate + ring.spin) * dt;
      ring.spin *= Math.exp(-3 * dt);
    }

    for (const pt of this.particles) {
      pt.angle += pt.speed * dt * (0.25 + this.energy * 2.2) * motion;
      pt.vel -= pt.push * 9 * dt; // spring back to the orbit
      pt.vel *= Math.exp(-2.5 * dt);
      pt.push += pt.vel * dt;
    }

    for (const wave of this.waves) {
      wave.life += dt * 1.05;
      wave.r += dt * R * (1.6 - wave.life * 0.8);
    }
    this.waves = this.waves.filter((w) => w.life < 1);
    for (const bolt of this.bolts) bolt.life += dt * 5.5;
    this.bolts = this.bolts.filter((b) => b.life < 1);

    // Radial spectrum: symmetric, noise-driven, eased per bar.
    const n = this.bars.length;
    for (let i = 0; i < n; i++) {
      const j = Math.min(i, n - i);
      const spec = Math.pow(noise(j * 0.31 + this.time * 3.2), 1.6);
      const low = 1 - j / (n / 2); // lows a bit louder
      const target = this.level * (0.25 + spec * 0.9) * (0.55 + low * 0.45);
      this.bars[i] = lerp(this.bars[i], target, ease(target > this.bars[i] ? 24 : 7, dt));
    }
  }

  private onset(strength: number) {
    if (this.reduced) return;
    const R = this.radius();
    this.waves.push({ r: R * 0.32, life: 0, strength });
    if (this.waves.length > 7) this.waves.shift();
    this.pulse(0.35 * strength);
    if (strength > 0.72) {
      const count = 1 + Math.floor(this.rand() * 3);
      for (let k = 0; k < count; k++) this.bolts.push(this.makeBolt(R));
    }
    for (const pt of this.particles) {
      if (this.rand() < 0.28) pt.vel += R * (0.5 + this.rand() * 1.1) * strength;
    }
  }

  /** A jagged filament from the core out to the inner ring. */
  private makeBolt(R: number): Bolt {
    const a = this.rand() * TAU;
    const r0 = R * 0.2;
    const r1 = R * (0.42 + this.rand() * 0.12);
    const steps = 7;
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const r = lerp(r0, r1, f);
      const da = i === 0 || i === steps ? 0 : (this.rand() - 0.5) * 0.22;
      points.push([Math.cos(a + da) * r, Math.sin(a + da) * r]);
    }
    return { points, life: 0 };
  }

  private radius() {
    return Math.min(this.w * 0.36, this.h * 0.3);
  }

  /** Vertical center: a bit above the middle, leaving room for the caption. */
  private centerY() {
    return this.h * 0.43;
  }

  /* ----- drawing ----- */

  /** Current palette color as "r, g, b", optionally pushed toward white. */
  private rgb(white = 0) {
    const out = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      let c = lerp(CYAN[i], VIOLET[i], this.tint);
      c = lerp(c, GREY[i], this.dim);
      out[i] = Math.round(lerp(c, 255, white * (1 - this.dim * 0.8)));
    }
    return `${out[0]}, ${out[1]}, ${out[2]}`;
  }

  private draw() {
    const { ctx, w, h, dpr } = this;
    const R = this.radius();
    if (R <= 0) return;
    const cx = w / 2;
    const cy = this.centerY();
    const e = this.energy;
    const lv = this.level;
    const t = this.time;
    const col = this.rgb();
    const hot = this.rgb(0.15 + lv * 0.45 + this.kick * 0.2);
    const breath = 1 + Math.sin(t * 1.1) * 0.012;
    const scale = breath + lv * 0.035 + this.kick * 0.025;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);

    // Halo.
    const haloA = 0.06 + e * 0.1 + lv * 0.18 + this.kick * 0.08;
    const halo = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.7);
    halo.addColorStop(0, `rgba(${col}, ${haloA})`);
    halo.addColorStop(0.45, `rgba(${col}, ${haloA * 0.35})`);
    halo.addColorStop(1, `rgba(${col}, 0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.7, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    this.drawWaves(R);
    this.drawSweep(R, col);
    this.drawTicks(R * scale, col, hot);
    this.drawRings(R * scale, col, hot);
    this.drawParticles(R, col, hot);
    this.drawSpectrum(R * scale, col, hot);
    this.drawBolts(R);
    this.drawVoice(R * scale, t);
    this.drawCore(R, t, col, hot);
    this.drawTelemetry(R, t);

    ctx.restore();
  }

  private drawWaves(R: number) {
    const { ctx } = this;
    for (const wave of this.waves) {
      const a = (1 - wave.life) * 0.45 * wave.strength;
      ctx.strokeStyle = `rgba(${this.rgb(0.3)}, ${a})`;
      ctx.lineWidth = 1 + (1 - wave.life) * R * 0.012;
      ctx.beginPath();
      ctx.arc(0, 0, wave.r, 0, TAU);
      ctx.stroke();
    }
  }

  private drawBolts(R: number) {
    const { ctx } = this;
    if (!this.bolts.length) return;
    const hot = this.rgb(0.7);
    for (const bolt of this.bolts) {
      const a = 1 - bolt.life;
      ctx.beginPath();
      bolt.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = `rgba(${this.rgb()}, ${a * 0.35})`;
      ctx.lineWidth = Math.max(2, R * 0.016);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${hot}, ${a})`;
      ctx.lineWidth = Math.max(1, R * 0.004);
      ctx.stroke();
    }
  }

  private drawSweep(R: number, col: string) {
    const { ctx } = this;
    if (this.sweep < 0.02 || !("createConicGradient" in ctx)) return;
    // Conic gradients run clockwise; put the bright edge at the end so the
    // fade trails behind the direction of rotation.
    const g = ctx.createConicGradient(this.sweepRot, 0, 0);
    const a = 0.26 * this.sweep;
    g.addColorStop(0, `rgba(${col}, 0)`);
    g.addColorStop(0.84, `rgba(${col}, 0)`);
    g.addColorStop(0.995, `rgba(${col}, ${a})`);
    g.addColorStop(1, `rgba(${col}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.98, 0, TAU);
    ctx.arc(0, 0, R * 0.5, 0, TAU, true);
    ctx.fill();
  }

  private drawTicks(R: number, col: string, hot: string) {
    const { ctx } = this;
    const count = 144;
    const r = R * 0.7;
    const rot = this.rings[2].rot * -0.35;
    const dim = new Batch();
    const lit = new Batch(3);
    for (let i = 0; i < count; i++) {
      const a = rot + (i / count) * TAU;
      const major = i % 12 === 0;
      // A bright "scanner" travels around the ticks; faster when awake.
      const scan = Math.pow(
        0.5 + 0.5 * Math.cos(a - this.time * (0.6 + this.energy * 2.5)),
        12
      );
      const len = R * (major ? 0.05 : 0.022) * (1 + scan * this.energy * 0.8);
      const alpha = (major ? 0.5 : 0.22) + scan * (0.25 + this.energy * 0.5);
      const path = scan > 0.4 ? lit.at(alpha) : dim.at(alpha);
      const c = Math.cos(a);
      const s = Math.sin(a);
      path.moveTo(c * r, s * r);
      path.lineTo(c * (r + len), s * (r + len));
    }
    ctx.lineWidth = 1;
    this.strokeBatch(dim, col);
    this.strokeBatch(lit, hot);
  }

  private strokeBatch(batch: Batch, color: string) {
    batch.paths.forEach((path, i) => {
      this.ctx.strokeStyle = `rgba(${color}, ${batch.alphaOf(i)})`;
      this.ctx.stroke(path);
    });
  }

  private fillBatch(batch: Batch, color: string) {
    batch.paths.forEach((path, i) => {
      this.ctx.fillStyle = `rgba(${color}, ${batch.alphaOf(i)})`;
      this.ctx.fill(path);
    });
  }

  private drawRings(R: number, col: string, hot: string) {
    const { ctx } = this;
    const glow = 0.6 + this.energy * 0.4 + this.level * 0.6 + this.kick * 0.5;
    for (const ring of this.rings) {
      const r = R * ring.r;
      const lw = Math.max(1, R * ring.width);
      const a = Math.min(1, ring.alpha * glow);
      const paths: [number, number][] = ring.arcs.length ? ring.arcs : [[0, TAU]];

      for (const [start, len] of paths) {
        const s = ring.rot + start;
        // Wide, faint pass + thin, bright pass = cheap glow.
        ctx.strokeStyle = `rgba(${col}, ${a * 0.25})`;
        ctx.lineWidth = lw * 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, r, s, s + len);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${hot}, ${a})`;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(0, 0, r, s, s + len);
        ctx.stroke();

        if (ring.ends) {
          ctx.fillStyle = `rgba(${hot}, ${Math.min(1, a * 1.6)})`;
          for (const ang of [s, s + len]) {
            ctx.beginPath();
            ctx.arc(Math.cos(ang) * r, Math.sin(ang) * r, lw * 1.3 + 1, 0, TAU);
            ctx.fill();
          }
        }
      }
    }
  }

  private drawParticles(R: number, col: string, hot: string) {
    const { ctx } = this;
    const awake = 0.35 + this.energy * 0.65;
    const dots = new Batch();
    const sparks = new Batch(3);
    const streaks = new Batch(4);
    const grow = 0.7 + this.energy * 0.5;
    for (const pt of this.particles) {
      const r = R * pt.orbit + pt.push;
      const x = Math.cos(pt.angle) * r;
      const y = Math.sin(pt.angle) * r;
      const tw = 0.5 + 0.5 * Math.sin(this.time * 2 + pt.phase);
      const fast = Math.min(1, Math.abs(pt.vel) / (R * 0.8));
      const a = (0.15 + tw * 0.45) * awake + fast * 0.5;

      if (fast > 0.08) {
        // Streak along the direction of travel during bursts.
        const k = (pt.vel / R) * 0.12;
        const path = streaks.at(a);
        path.moveTo(x, y);
        path.lineTo(x - Math.cos(pt.angle) * R * k, y - Math.sin(pt.angle) * R * k);
      } else {
        const path = tw > 0.85 ? sparks.at(a) : dots.at(a);
        const rr = pt.size * grow;
        path.moveTo(x + rr, y);
        path.arc(x, y, rr, 0, TAU);
      }
    }
    this.fillBatch(dots, col);
    this.fillBatch(sparks, hot);
    ctx.lineWidth = 1.6;
    this.strokeBatch(streaks, hot);
  }

  private drawSpectrum(R: number, col: string, hot: string) {
    const { ctx, bars } = this;
    const n = bars.length;
    const base = R * 0.36;
    const rot = this.rings[0].rot * 0.2;
    const low = new Batch();
    const high = new Batch(4);
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * TAU;
      const len = R * (0.008 + bars[i] * 0.2);
      const c = Math.cos(a);
      const s = Math.sin(a);
      const alpha = 0.18 + bars[i] * 0.85;
      const path = bars[i] > 0.45 ? high.at(alpha) : low.at(alpha);
      path.moveTo(c * base, s * base);
      path.lineTo(c * (base + len), s * (base + len));
    }
    ctx.lineWidth = Math.max(1.2, R * 0.009);
    this.strokeBatch(low, col);
    this.strokeBatch(high, hot);
  }

  /** Three interfering closed waveforms around the core. */
  private drawVoice(R: number, t: number) {
    const { ctx } = this;
    const lv = this.level;
    const e = this.energy;
    const layers = [
      { white: 0.7, phase: 0, alpha: 0.9, k: 1 },
      { white: 0, phase: 2.1, alpha: 0.55, k: 0.8 },
      { white: 0.2, phase: 4.2, alpha: 0.4, k: 0.65 }
    ];
    const base = R * 0.28;
    const steps = 160;

    for (const layer of layers) {
      const amp = R * (0.004 + e * 0.008 + lv * 0.085) * layer.k;
      const tint = layer === layers[1] ? 1 : this.tint; // keep one violet layer
      const saved = this.tint;
      this.tint = tint;
      const c = this.rgb(layer.white);
      this.tint = saved;

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * TAU;
        const p = layer.phase;
        const m1 = noise(t * 1.7 + p);
        const m2 = noise(t * 2.3 + p + 10);
        const off =
          Math.sin(a * 3 + t * 2.4 + p) * (0.5 + m1) +
          Math.sin(a * 7 - t * 3.6 + p) * 0.6 * m2 +
          Math.sin(a * 13 + t * 6.1 + p) * 0.35 * lv;
        const r = base + amp * off;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${c}, ${layer.alpha * (0.2 + lv * 0.8)})`;
      ctx.lineWidth = Math.max(1, R * 0.012) * 2.6;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${c}, ${layer.alpha * (0.45 + lv * 0.55)})`;
      ctx.lineWidth = Math.max(1, R * 0.005);
      ctx.stroke();
    }
  }

  private drawCore(R: number, t: number, col: string, hot: string) {
    const { ctx } = this;
    const lv = this.level;
    const e = this.energy;
    const rc =
      R * 0.12 * (1 + Math.sin(t * 1.4) * 0.04 + e * 0.06 + lv * 0.32 + this.kick * 0.12);
    const bright = 0.55 + e * 0.25 + lv * 0.4;

    // Glow body.
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rc * 2.6);
    g.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, bright)})`);
    g.addColorStop(0.18, `rgba(${hot}, ${Math.min(1, bright * 0.9)})`);
    g.addColorStop(0.42, `rgba(${col}, ${bright * 0.35})`);
    g.addColorStop(1, `rgba(${col}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rc * 2.6, 0, TAU);
    ctx.fill();

    // Segmented inner collar, counter-rotating.
    const segs = 10;
    const rot = -this.rings[0].rot * 1.4;
    ctx.lineWidth = rc * 0.28;
    ctx.lineCap = "butt";
    for (let i = 0; i < segs; i++) {
      const s = rot + (i / segs) * TAU;
      const flick = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.7);
      ctx.strokeStyle = `rgba(${hot}, ${0.25 + e * 0.25 + lv * flick * 0.5})`;
      ctx.beginPath();
      ctx.arc(0, 0, rc * 1.25, s, s + (TAU / segs) * 0.62);
      ctx.stroke();
    }
    ctx.lineCap = "round";

    // Thin outer edge.
    ctx.strokeStyle = `rgba(${hot}, ${0.4 + lv * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, rc * 1.55, 0, TAU);
    ctx.stroke();
  }

  /** Tiny HUD readouts around the outer ring (large screens only). */
  private drawTelemetry(R: number, t: number) {
    const { ctx } = this;
    if (R < 170) return;
    const size = Math.round(Math.max(9, R * 0.032));
    ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "middle";
    const lv = this.level;
    const e = this.energy;
    const jitter = (k: number) => noise(t * 4 + k) * lv;

    const labels: [number, string][] = [
      [-2.35, `CORE  ${(92 + e * 6 + jitter(1) * 2).toFixed(1)}%`],
      [-0.78, `FREQ  ${(1.2 + e * 2.4 + jitter(2) * 3).toFixed(2)} kHz`],
      [0.78, `SYNC  ${this.state.toUpperCase()}`],
      [2.35, `GAIN  ${(lv * 100).toFixed(0).padStart(3, "0")}`]
    ];
    const alpha = 0.32 + e * 0.25;
    for (const [ang, text] of labels) {
      const r = R * 1.16;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      ctx.textAlign = x < 0 ? "right" : "left";
      ctx.fillStyle = `rgba(${this.rgb(0.2)}, ${alpha})`;
      ctx.fillText(text, x, y);
      // Leader line back toward the ring.
      ctx.strokeStyle = `rgba(${this.rgb()}, ${alpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * R * 1.08, Math.sin(ang) * R * 1.08);
      ctx.lineTo(x + (x < 0 ? 6 : -6), y);
      ctx.stroke();
    }
  }
}
