import { COLS, ROWS, renderRalph, type AvatarState } from "./ralph";

export type { AvatarState };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const LINE_HEIGHT = 1.08;

/**
 * Prints Ralph's ASCII frames into a <pre>, like a CLI redrawing its screen.
 * Simulation runs every animation frame (smooth voice level); the text is
 * redrawn at a terminal-ish ~15 fps. Font size is fitted so the fixed
 * COLS x ROWS grid fills the container.
 */
export class AvatarRenderer {
  private pre: HTMLPreElement;
  private ro: ResizeObserver;
  private raf = 0;
  private last = 0;
  private sinceDraw = 0;
  private lastText = "";
  private reduced: boolean;
  private fps: number;

  private state: AvatarState = "idle";
  private time = 0;
  private energy = 0.1;
  private levelTarget = 0;
  private level = 0;
  private blinkUntil = 0;
  private nextBlink = 2.5;
  private tapLeg = -1;
  private tapUntil = 0;

  constructor(pre: HTMLPreElement) {
    this.pre = pre;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.fps = this.reduced ? 4 : 15;
    this.ro = new ResizeObserver(() => this.fit());
    this.ro.observe(pre.parentElement ?? pre);
    document.fonts?.ready.then(() => this.fit());
    this.fit();
    document.addEventListener("visibilitychange", this.onVisibility);
    this.start();
  }

  /* ----- public API ----- */

  setState(state: AvatarState) {
    this.state = state;
    if (state !== "speaking") this.levelTarget = 0;
  }

  setLevel(level: number) {
    if (this.state === "speaking") this.levelTarget = clamp01(level);
  }

  /** A keystroke or event: one leg taps. */
  pulse() {
    this.tapLeg = Math.floor(Math.random() * 6);
    this.tapUntil = this.time + 0.14;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  /* ----- internals ----- */

  private onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(this.raf);
    else this.start();
  };

  private start() {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** Largest whole-pixel font size that fits the grid in the container. */
  private fit() {
    const box = this.pre.parentElement ?? this.pre;
    const { width, height } = box.getBoundingClientRect();
    if (!width || !height) return;
    const probe = document.createElement("span");
    probe.textContent = "M".repeat(20);
    probe.style.cssText = "position:absolute;visibility:hidden;font-size:100px;white-space:pre;";
    this.pre.appendChild(probe);
    const ratio = probe.getBoundingClientRect().width / 20 / 100 || 0.6;
    probe.remove();
    const size = Math.floor(Math.min(width / (COLS * ratio), height / (ROWS * LINE_HEIGHT)));
    this.pre.style.fontSize = `${Math.max(6, Math.min(size, 22))}px`;
    this.pre.style.lineHeight = String(LINE_HEIGHT);
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.sinceDraw += dt;
    if (this.sinceDraw >= 1 / this.fps) {
      this.sinceDraw = 0;
      this.draw();
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number) {
    this.time += dt;
    const target = { idle: 0.1, listening: 0.4, thinking: 0.6, speaking: 1, offline: 0 }[this.state];
    this.energy = lerp(this.energy, target, 1 - Math.exp(-3 * dt));
    const rising = this.levelTarget > this.level;
    this.level = lerp(this.level, this.levelTarget, 1 - Math.exp(-(rising ? 30 : 10) * dt));

    if (this.time > this.nextBlink) {
      this.blinkUntil = this.time + 0.13;
      this.nextBlink = this.time + 2.5 + Math.random() * 4;
    }
    if (this.time > this.tapUntil) this.tapLeg = -1;
  }

  private draw() {
    const text = renderRalph({
      state: this.state,
      time: this.reduced ? 0 : this.time,
      level: this.level,
      blink: this.time < this.blinkUntil,
      tapLeg: this.tapLeg,
      energy: this.energy
    }).join("\n");
    if (text !== this.lastText) {
      this.pre.textContent = text;
      this.lastText = text;
    }
  }
}
