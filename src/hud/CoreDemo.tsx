import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Background from "../components/Background";
import Core, { type CoreHandle, type CoreState } from "./core/Core";
import { synthesizeUtterance, type Utterance } from "./core/voice";

const LINES = {
  en: "Good evening. I'm K.A.I., YK's personal assistant. YK is a fullstack developer in Seoul who designs systems across web, mobile, and backend, and ships them fast. What would you like to know?",
  ko: "안녕하세요. YK의 개인 비서 K.A.I.입니다. YK는 웹, 모바일, 백엔드를 아우르는 풀스택 개발자예요. 설계부터 구현까지 빠르게 해냅니다. 무엇이 궁금하신가요?"
};

const STATES: CoreState[] = ["idle", "listening", "thinking", "speaking", "offline"];
const hasHangul = (s: string) => /[가-힣]/.test(s);

/**
 * Motion prototype for the K.A.I. core (open with `?core`).
 * Type and press Enter, or use the buttons, to see every state.
 */
export default function CoreDemo() {
  const core = useRef<CoreHandle>(null);
  const [state, setState] = useState<CoreState>("idle");
  const [caption, setCaption] = useState("");
  const [input, setInput] = useState("");
  const [voice, setVoice] = useState(false);
  const run = useRef(0); // invalidates stale speech loops
  const raf = useRef(0);

  const stop = () => {
    run.current++;
    cancelAnimationFrame(raf.current);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  useEffect(() => stop, []);

  /** Simulated speech: the envelope drives both the core and the caption. */
  const speakSimulated = (text: string, id: number) => {
    const utt = synthesizeUtterance(text);
    const t0 = performance.now();
    const tick = () => {
      if (id !== run.current) return;
      const t = (performance.now() - t0) / 1000;
      core.current?.setLevel(utt.levelAt(t));
      setCaption(text.slice(0, utt.charsAt(t)));
      if (t < utt.duration) raf.current = requestAnimationFrame(tick);
      else setState("idle");
    };
    tick();
  };

  /** Browser TTS: each word boundary restarts a per-word envelope. */
  const speakVoice = (text: string, id: number) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = hasHangul(text) ? "ko-KR" : "en-US";
    u.rate = 1.02;
    let word: Utterance | null = null;
    let wordStart = 0;
    let speaking = true;

    u.onboundary = (ev) => {
      if (ev.name && ev.name !== "word") return;
      const rest = text.slice(ev.charIndex);
      const w = rest.match(/^\S+/)?.[0] ?? "";
      word = synthesizeUtterance(w, 1.15);
      wordStart = performance.now();
      setCaption(text.slice(0, ev.charIndex + w.length));
      core.current?.pulse(0.15);
    };
    u.onend = u.onerror = () => {
      speaking = false;
      if (id !== run.current) return;
      setCaption(text);
      setState("idle");
    };

    const tick = () => {
      if (id !== run.current || !speaking) return;
      const t = (performance.now() - wordStart) / 1000;
      const lv = word && t < word.duration ? word.levelAt(t) : 0.08;
      core.current?.setLevel(lv);
      raf.current = requestAnimationFrame(tick);
    };
    window.speechSynthesis.speak(u);
    tick();
  };

  const say = (text: string) => {
    stop();
    const id = run.current;
    setCaption("");
    setState("thinking");
    window.setTimeout(() => {
      if (id !== run.current) return;
      setState("speaking");
      if (voice && "speechSynthesis" in window) speakVoice(text, id);
      else speakSimulated(text, id);
    }, 900);
  };

  const pick = (s: CoreState) => {
    if (s === "speaking") return say(LINES.en);
    stop();
    setCaption("");
    setState(s);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      say(hasHangul(input) ? LINES.ko : LINES.en);
      setInput("");
      return;
    }
    if (state === "idle" || state === "listening") {
      setState("listening");
      core.current?.pulse(0.12);
    }
  };

  return (
    <div className="kai">
      <Background />
      <Core ref={core} state={state} className="kai-core" />

      <header className="kai-status mono">
        <span>
          K.A.I. <span className="kai-dim">v0.1</span>
        </span>
        <span className={`kai-state kai-state-${state}`}>● {state}</span>
      </header>

      <p className="kai-caption" aria-live="polite">
        {caption}
        {state === "speaking" && <span className="kai-cursor" />}
      </p>

      <div className="kai-dock">
        <div className="kai-chips">
          {STATES.map((s) => (
            <button
              key={s}
              className={`kai-chip mono${state === s ? " is-on" : ""}`}
              onClick={() => pick(s)}
            >
              {s}
            </button>
          ))}
          <button className="kai-chip mono" onClick={() => say(LINES.ko)}>
            speak · ko
          </button>
          <button
            className={`kai-chip mono${voice ? " is-on" : ""}`}
            onClick={() => setVoice((v) => !v)}
            aria-pressed={voice}
          >
            voice {voice ? "on" : "off"}
          </button>
        </div>
        <input
          className="kai-input"
          value={input}
          placeholder="Ask me anything about YK…  (Enter)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => state === "listening" && setState("idle")}
        />
      </div>
    </div>
  );
}
