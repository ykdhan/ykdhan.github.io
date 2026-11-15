/**
 * Ralph: a little spider robot drawn in ASCII, animated like a CLI program.
 *
 *   idle      breathes, blinks, shifts a leg now and then
 *   listening eyes wide, legs tense, a leg taps with each keystroke
 *   thinking  legs drum one after another, a spinner above the shell
 *   speaking  scuttles side to side; eyes and mouth follow the voice
 *   offline   legs folded, eyes x x, zZ
 *
 * Pure function of (state, time, level) -> lines, so it is easy to test and
 * to render anywhere (DOM <pre>, a real terminal, a test snapshot).
 */

export type AvatarState = "idle" | "listening" | "thinking" | "speaking" | "offline";

export const COLS = 64;
export const ROWS = 17;

export interface Pose {
  state: AvatarState;
  time: number; // seconds
  level: number; // 0..1 voice amplitude
  blink: boolean;
  tapLeg: number; // -1 none, else 0..5
  energy: number; // 0..1
}

/*
 * Shell sprite. `E` marks eye centers, `M` the mouth, `S` the back stripe.
 * Hips (where legs attach) are found from the outline at rows 2, 4, 6.
 */
const SHELL = [
  "      .--------.      ",
  "    .'  SSSSSS  '.    ",
  "   /    SSSSSS    \\   ",
  "  ;     SSSSSS     ;  ",
  "  |  .----------.  |  ",
  "   \\ | (E)  (E) | /   ",
  "    '|    MMMM  |'    ",
  "      '--------'      "
];
const SHELL_W = SHELL[0].length;
const HIP_ROWS = [2, 4, 6];

type Grid = string[][];

const blank = (): Grid => Array.from({ length: ROWS }, () => Array(COLS).fill(" "));

function put(g: Grid, x: number, y: number, ch: string) {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (yi >= 0 && yi < ROWS && xi >= 0 && xi < COLS) g[yi][xi] = ch;
}

/**
 * Draws a leg segment with one character per row (cells are ~2x taller than
 * wide, so this keeps strokes thin instead of doubling up like "//").
 */
function line(g: Grid, x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  if (dy === 0) {
    for (let x = Math.min(x0, x1) + 1; x < Math.max(x0, x1); x++) put(g, x, y0, "=");
    return;
  }
  const ratio = Math.abs(dx / dy);
  const ch = ratio < 0.4 ? "|" : dx * dy < 0 ? "/" : "\\";
  const rows = Math.abs(dy);
  for (let i = 1; i < rows; i++) {
    const t = i / rows;
    put(g, x0 + dx * t, y0 + dy * t, ch);
  }
  // Shallow segments get a joining stroke so they don't look dotted.
  if (ratio > 1.6) put(g, x0 + Math.sign(dx), y0, "=");
}

const EYES: Record<string, string> = {
  open: "(O)",
  wide: "(@)",
  small: "(o)",
  blink: "(-)",
  off: "(x)",
  think: "(.)"
};

function eyes(p: Pose) {
  if (p.state === "offline") return EYES.off;
  if (p.blink) return EYES.blink;
  if (p.state === "speaking") return p.level > 0.6 ? EYES.wide : p.level > 0.25 ? EYES.open : EYES.small;
  if (p.state === "listening") return EYES.wide;
  if (p.state === "thinking") return EYES.think;
  return EYES.open;
}

function mouth(p: Pose) {
  if (p.state === "offline") return "____";
  if (p.state !== "speaking") return p.state === "thinking" ? " ~~ " : "----";
  if (p.level > 0.65) return "<==>";
  if (p.level > 0.3) return "-==-";
  return "-..-";
}

/** Renders one frame as an array of strings. */
export function renderRalph(p: Pose): string[] {
  const g = blank();
  const t = p.time;

  // Body placement: centered, sways while speaking, sinks when offline.
  const sway = p.state === "speaking" ? Math.round(Math.sin(t * 1.6) * 6) : 0;
  const bob = p.state === "speaking" ? (Math.sin(t * 9) > 0.3 ? -1 : 0) : 0;
  const sink = p.state === "offline" ? 2 : 0;
  const left = Math.floor((COLS - SHELL_W) / 2) + sway;
  const top = 5 + bob + sink;

  // Legs: 3 per side, drawn first so the shell sits on top of them.
  for (const side of [-1, 1]) {
    HIP_ROWS.forEach((r, k) => {
      const legIndex = (side < 0 ? 0 : 3) + k;
      const row = SHELL[r];
      const edge = side < 0 ? row.search(/\S/) : row.length - 1 - [...row].reverse().join("").search(/\S/);
      const hx = left + edge + side;
      const hy = top + r;

      // Tripod gait while speaking; drumming while thinking; a tap on keystrokes.
      let lift = 0;
      let reach = 0;
      if (p.state === "speaking") {
        const phase = t * 7 + (legIndex % 2 === k % 2 ? 0 : Math.PI);
        lift = Math.sin(phase) > 0.2 ? 1 : 0;
        reach = Math.round(Math.cos(phase));
      } else if (p.state === "thinking") {
        lift = Math.floor(t * 8) % 6 === legIndex ? 1 : 0;
      } else if (p.state === "idle") {
        // Every few seconds one leg shifts its weight.
        const which = Math.floor(t / 2.7) % 6;
        lift = which === legIndex && t % 2.7 < 0.35 ? 1 : 0;
      }
      if (p.tapLeg === legIndex) lift = 1;

      const folded = p.state === "offline";
      const tense = p.state === "listening" ? 1 : 0;
      // Seen from above: front legs fan up, middle legs out, back legs down,
      // so the six legs never cross.
      const knee = folded ? [2, k - 1] : [[4, -2], [5, 0], [4, 2]][k];
      const foot = folded ? [3, 1] : [[3, -2], [4, 2], [3, 3]][k];
      const kx = hx + side * (knee[0] + tense);
      const ky = hy + knee[1] - lift;
      const fx = kx + side * (foot[0] + reach + tense);
      const fy = ky + foot[1] - (k === 0 ? tense : 0);

      line(g, hx, hy, kx, ky);
      line(g, kx, ky, fx, fy);
      put(g, kx, ky, "o");
      put(g, fx, fy, lift ? "'" : "v");
    });
  }

  // Shell with live eyes, mouth and a pulsing back stripe.
  const eye = eyes(p);
  const mo = mouth(p);
  const stripeLit = p.state === "speaking" ? Math.floor(t * 12) % 6 : -1;
  SHELL.forEach((row, r) => {
    let mouthIdx = 0;
    let stripeIdx = 0;
    for (let c = 0; c < row.length; c++) {
      let ch = row[c];
      if (ch === "E") {
        // "(E)" -> eye glyph; the parens around it are already in the sprite.
        ch = eye[1];
      } else if (ch === "M") {
        ch = mo[mouthIdx++] ?? " ";
      } else if (ch === "S") {
        ch = stripeIdx++ === stripeLit ? "#" : "|";
      }
      if (ch !== " ") put(g, left + c, top + r, ch);
      // Eye brackets change with the expression.
      if (row[c] === "E") {
        put(g, left + c - 1, top + r, eye[0]);
        put(g, left + c + 1, top + r, eye[2]);
      }
    }
  });

  // Thought spinner / sleep marks above the shell.
  const cx = left + Math.floor(SHELL_W / 2);
  if (p.state === "thinking") {
    const frames = ["[    ]", "[.   ]", "[..  ]", "[... ]", "[....]", "[ ...]", "[  ..]", "[   .]"];
    const f = frames[Math.floor(t * 10) % frames.length];
    [...f].forEach((ch, i) => put(g, cx - 3 + i, top - 2, ch));
  } else if (p.state === "offline") {
    const z = Math.floor(t * 1.5) % 3;
    put(g, cx + 6 + z, top - 1 - z, z === 2 ? "Z" : "z");
  } else if (p.state === "speaking" && p.level > 0.45) {
    // Little sound marks beside the head.
    put(g, left - 1, top + 5, "(");
    put(g, left + SHELL_W, top + 5, ")");
    if (p.level > 0.7) {
      put(g, left - 3, top + 5, "(");
      put(g, left + SHELL_W + 2, top + 5, ")");
    }
  }

  // Ground line with dust kicked up while scuttling.
  const ground = ROWS - 1;
  for (let x = 4; x < COLS - 4; x++) {
    const dust = p.state === "speaking" && Math.abs(x - (left + SHELL_W / 2)) < 16 && ((x * 7 + Math.floor(t * 12)) % 9 === 0);
    put(g, x, ground, dust ? "." : x % 2 ? "_" : " ");
  }

  return g.map((row) => row.join("").replace(/\s+$/, ""));
}
