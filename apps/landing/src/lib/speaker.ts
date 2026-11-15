import { synthesizeUtterance, type Utterance } from "../hud/core/voice";

/**
 * Plays streamed text as "speech": a queue of sentence-sized segments, each
 * turned into an amplitude envelope that drives the core and reveals the
 * caption in sync. Optionally speaks aloud with the browser's TTS.
 */

interface Callbacks {
  onLevel(level: number): void;
  onCaption(text: string): void;
  onStart(): void;
  onIdle(): void;
}

const hasHangul = (s: string) => /[가-힣]/.test(s);

export class Speaker {
  voice = false;
  private cb: Callbacks;
  private queue: string[] = [];
  private spoken = "";
  private buffer = "";
  private playing = false;
  private ended = true;
  private raf = 0;
  private run = 0;

  constructor(cb: Callbacks) {
    this.cb = cb;
  }

  /** Stops everything and clears the caption. */
  reset() {
    this.run++;
    cancelAnimationFrame(this.raf);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    this.queue = [];
    this.spoken = "";
    this.buffer = "";
    this.playing = false;
    this.ended = false;
    this.cb.onLevel(0);
    this.cb.onCaption("");
  }

  /** Feed streamed text; complete sentences are queued as they arrive. */
  write(delta: string) {
    this.buffer += delta;
    const re = /[.!?。…]+["')\]]?\s+|\n+|[,;:]\s+(?=\S)/g;
    let cut = -1;
    let m: RegExpExecArray | null;
    while ((m = re.exec(this.buffer))) {
      const end = m.index + m[0].length;
      // Commas only split long runs, so short clauses stay together.
      if (/[,;:]/.test(m[0]) && end < 70) continue;
      cut = end;
    }
    if (cut > 0) {
      this.enqueue(this.buffer.slice(0, cut));
      this.buffer = this.buffer.slice(cut);
    }
  }

  /** No more text is coming; finish what's queued, then go idle. */
  end() {
    if (this.buffer.trim()) this.enqueue(this.buffer);
    this.buffer = "";
    this.ended = true;
    if (!this.playing) this.finish();
  }

  /** Speaks a complete text right away (greetings, local messages). */
  say(text: string) {
    this.reset();
    this.write(text);
    this.end();
  }

  private enqueue(seg: string) {
    this.queue.push(seg);
    if (!this.playing) this.next();
  }

  private finish() {
    this.cb.onLevel(0);
    this.cb.onCaption(this.spoken.trim());
    this.cb.onIdle();
  }

  private next() {
    const seg = this.queue.shift();
    if (seg === undefined) {
      this.playing = false;
      if (this.ended) this.finish();
      return;
    }
    if (!this.playing) this.cb.onStart();
    this.playing = true;
    const id = this.run;
    const done = () => {
      if (id !== this.run) return;
      this.spoken += seg;
      this.next();
    };
    if (this.voice && "speechSynthesis" in window) this.speakAloud(seg, id, done);
    else this.simulate(seg, id, done);
  }

  private simulate(seg: string, id: number, done: () => void) {
    const utt = synthesizeUtterance(seg, 1.15);
    const t0 = performance.now();
    const tick = () => {
      if (id !== this.run) return;
      const t = (performance.now() - t0) / 1000;
      this.cb.onLevel(utt.levelAt(t));
      this.cb.onCaption(this.spoken + seg.slice(0, utt.charsAt(t)));
      if (t < utt.duration) this.raf = requestAnimationFrame(tick);
      else done();
    };
    tick();
  }

  /** Browser TTS: each word boundary starts a fresh per-word envelope. */
  private speakAloud(seg: string, id: number, done: () => void) {
    const u = new SpeechSynthesisUtterance(seg);
    u.lang = hasHangul(seg) ? "ko-KR" : "en-US";
    u.rate = 1.05;
    let word: Utterance | null = null;
    let wordStart = 0;
    let active = true;
    const finish = () => {
      if (!active) return;
      active = false;
      clearTimeout(guard);
      done();
    };
    // Some browsers never fire onend; don't hang the queue.
    const guard = window.setTimeout(finish, 2000 + seg.length * 120);

    u.onboundary = (ev) => {
      if (ev.name && ev.name !== "word") return;
      const w = seg.slice(ev.charIndex).match(/^\S+/)?.[0] ?? "";
      word = synthesizeUtterance(w, 1.2);
      wordStart = performance.now();
      this.cb.onCaption(this.spoken + seg.slice(0, ev.charIndex + w.length));
    };
    u.onend = u.onerror = finish;

    const tick = () => {
      if (id !== this.run || !active) return;
      const t = (performance.now() - wordStart) / 1000;
      this.cb.onLevel(word && t < word.duration ? word.levelAt(t) : 0.08);
      this.raf = requestAnimationFrame(tick);
    };
    window.speechSynthesis.speak(u);
    tick();
  }
}
