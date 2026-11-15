/**
 * Turns a sentence into a speech-like amplitude envelope, so the avatar can
 * "talk" before any real audio exists. Each syllable becomes a short bump;
 * punctuation becomes a pause. Later, a real audio analyser can replace this
 * without touching the renderer: both just produce a 0..1 level per frame.
 */

interface Segment {
  start: number;
  end: number;
  peak: number;
  charStart: number;
  charEnd: number;
}

export interface Utterance {
  duration: number;
  /** Amplitude 0..1 at time t (seconds). */
  levelAt(t: number): number;
  /** How many characters of the text should be visible at time t. */
  charsAt(t: number): number;
}

const HANGUL = /[가-힣]/g;
const VOWEL_GROUPS = /[aeiouy]+/gi;

function syllables(word: string) {
  const ko = word.match(HANGUL)?.length ?? 0;
  const en = word.replace(HANGUL, "").match(VOWEL_GROUPS)?.length ?? 0;
  return Math.max(1, ko + en);
}

export function synthesizeUtterance(text: string, rate = 1): Utterance {
  const segments: Segment[] = [];
  let t = 0.08;
  let seed = 1;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const re = /(\S+)(\s*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const word = m[1];
    const charStart = m.index;
    const n = syllables(word);
    const isKo = HANGUL.test(word);
    HANGUL.lastIndex = 0;
    const sylDur = (isKo ? 0.12 : 0.15) / rate;

    for (let i = 0; i < n; i++) {
      const dur = sylDur * (0.75 + rand() * 0.5);
      segments.push({
        start: t,
        end: t + dur,
        peak: 0.55 + rand() * 0.45 - (i === n - 1 ? 0.1 : 0),
        charStart: charStart + Math.floor((word.length * i) / n),
        charEnd: charStart + Math.floor((word.length * (i + 1)) / n)
      });
      t += dur + 0.012 / rate;
    }

    t += 0.05 / rate;
    if (/[,;:]$/.test(word)) t += 0.18 / rate;
    if (/[.!?…]$/.test(word)) t += 0.38 / rate;
  }

  const duration = t + 0.2;

  return {
    duration,
    levelAt(time) {
      for (const s of segments) {
        if (time < s.start) break;
        if (time <= s.end) {
          const x = (time - s.start) / (s.end - s.start);
          const shape = Math.pow(Math.sin(Math.PI * x), 0.7);
          const texture = 0.88 + 0.12 * Math.sin(time * 47);
          return s.peak * shape * texture;
        }
      }
      return 0;
    },
    charsAt(time) {
      if (time >= duration - 0.2) return text.length;
      let chars = 0;
      for (const s of segments) {
        if (time < s.start) break;
        const x = Math.min(1, (time - s.start) / (s.end - s.start));
        chars = s.charStart + Math.round((s.charEnd - s.charStart) * x);
      }
      // Reveal trailing punctuation/spaces together with the word.
      while (chars < text.length && /[\s.,!?…;:]/.test(text[chars])) chars++;
      return chars;
    }
  };
}
