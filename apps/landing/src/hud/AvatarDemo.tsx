import { useEffect, useRef, useState } from "react";
import Avatar, { type AvatarHandle, type AvatarState } from "./avatar/Avatar";
import { synthesizeUtterance } from "./avatar/voice";

const LINE =
  "Hello. I'm Ralph, YK's assistant. YK is a fullstack developer in Seoul who designs systems across web, mobile, and backend.";
const STATES: AvatarState[] = ["idle", "listening", "thinking", "speaking", "offline"];

/** Motion playground for the avatar (open with `?avatar`). */
export default function AvatarDemo() {
  const avatar = useRef<AvatarHandle>(null);
  const [state, setState] = useState<AvatarState>("idle");
  const [caption, setCaption] = useState("");
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const speak = () => {
    cancelAnimationFrame(raf.current);
    setCaption("");
    setState("thinking");
    window.setTimeout(() => {
      setState("speaking");
      const utt = synthesizeUtterance(LINE, 1.15);
      const t0 = performance.now();
      const tick = () => {
        const t = (performance.now() - t0) / 1000;
        avatar.current?.setLevel(utt.levelAt(t));
        setCaption(LINE.slice(0, utt.charsAt(t)));
        if (t < utt.duration) raf.current = requestAnimationFrame(tick);
        else setState("idle");
      };
      tick();
    }, 1200);
  };

  const pick = (s: AvatarState) => {
    cancelAnimationFrame(raf.current);
    if (s === "speaking") return speak();
    setCaption("");
    setState(s);
  };

  return (
    <div className="term crt">
      <header className="term-bar">
        <span>RALPH · MOTION TEST</span>
        <span>{state.toUpperCase()}</span>
      </header>
      <Avatar ref={avatar} state={state} className="avatar" />
      <div className="term-log">
        <p className="line">
          <span className="tag">RALPH&gt;</span> {caption}
          {state === "speaking" && <span className="cursor">█</span>}
        </p>
      </div>
      <div className="term-menu">
        {STATES.map((s, i) => (
          <button key={s} onClick={() => pick(s)}>
            [{i + 1}] {s}
          </button>
        ))}
      </div>
      <div className="term-prompt">
        <span className="prompt">C:\RALPH&gt;</span>
        <input placeholder="type to trigger listening" onChange={() => avatar.current?.pulse()} />
      </div>
    </div>
  );
}
