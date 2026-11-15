import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { PublicData } from "@yk/shared";
import Avatar, { type AvatarHandle } from "./hud/avatar/Avatar";
import Panel from "./hud/Panels";
import { useAssistant } from "./hud/useAssistant";
import { FALLBACK, fetchPublic } from "./lib/api";
import { useLocale } from "./i18n/LocaleContext";
import { t } from "./i18n/strings";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PROMPT = "C:\\YK>";

export default function App() {
  const { locale, setLocale, toggle } = useLocale();
  const avatar = useRef<AvatarHandle>(null);
  const [data, setData] = useState<PublicData>(FALLBACK);
  const [input, setInput] = useState("");
  const assistant = useAssistant(avatar, locale, setLocale);
  const { print, say } = assistant;
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const booted = useRef(false);
  const [cleared, setCleared] = useState(0);

  // Boot sequence: a few BIOS-style lines, then the greeting.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (async () => {
      const step = reduced ? 0 : 260;
      print("RALPH BIOS v1.0  (C) YK");
      await wait(step);
      print(t(locale, "bootMemory"));
      await wait(step);
      let profile = FALLBACK;
      let ok = true;
      try {
        profile = await fetchPublic();
        setData(profile);
      } catch {
        ok = false;
      }
      print(`${t(locale, "bootProfile")} ${t(locale, ok ? "bootOk" : "bootFail")}`);
      await wait(step * 1.5);
      say(profile.profile.greeting[locale]);
    })();
  }, [locale, print, say]);

  // Keep the newest line in view.
  useLayoutEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [assistant.turns]);

  const suggestions = data.profile.suggestions[locale];

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const upper = cmd.toUpperCase();
    const n = Number(cmd);
    if (Number.isInteger(n) && n >= 1 && n <= suggestions.length) return assistant.ask(suggestions[n - 1]);
    if (upper === "CLS" || upper === "CLEAR") return setCleared(assistant.turns.length);
    if (upper === "HELP" || upper === "?") return say(t(locale, "help"));
    if (upper === "VOICE") return assistant.setVoice((v) => !v);
    if (upper === "LANG KO" || upper === "LANG EN") return setLocale(upper.endsWith("KO") ? "ko" : "en");
    assistant.ask(cmd);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(input);
    setInput("");
  };

  const visible = assistant.turns.slice(cleared);

  return (
    <div className="term crt" onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus()}>
      <header className="term-bar">
        <span>
          {data.profile.assistantName.toUpperCase()} v1.0 · {data.profile.alias || data.profile.name}
        </span>
        <nav>
          <button onClick={() => assistant.setVoice((v) => !v)} aria-pressed={assistant.voice}>
            [{t(locale, assistant.voice ? "voiceOn" : "voiceOff")}]
          </button>
          <button onClick={toggle} aria-label="Toggle language">
            [<span className={locale === "en" ? "on" : ""}>EN</span>|
            <span className={locale === "ko" ? "on" : ""}>KO</span>]
          </button>
        </nav>
      </header>

      <Avatar ref={avatar} state={assistant.state} className="avatar" />

      <div className="term-log" ref={logRef} aria-live="polite">
        {visible.map((turn, i) => {
          const live = i === visible.length - 1 && assistant.state === "speaking";
          if (turn.kind === "system") {
            return (
              <p key={turn.id} className="line sys">
                {turn.answer}
              </p>
            );
          }
          return (
            <div key={turn.id} className="turn">
              {turn.question && (
                <p className="line user">
                  <span className="prompt">{PROMPT}</span> {turn.question}
                </p>
              )}
              {(turn.answer || live || (i === visible.length - 1 && assistant.state === "thinking")) && (
                <p className={`line ralph-line${turn.error ? " err" : ""}`}>
                  <span className="tag">{turn.error ? "ERR" : "RALPH"}&gt;</span> {turn.answer}
                  {assistant.state === "thinking" && i === visible.length - 1 && !turn.answer && (
                    <span className="spinner" />
                  )}
                  {live && <span className="cursor">█</span>}
                </p>
              )}
              {turn.panels.map((p) => (
                <Panel key={p.key} req={p} data={data} locale={locale} />
              ))}
              {turn.notices.map((n) => (
                <p key={n} className="line notice">
                  {n}
                </p>
              ))}
            </div>
          );
        })}
      </div>

      {suggestions.length > 0 && (
        <div className="term-menu">
          <span className="dim">{t(locale, "menu")}:</span>
          {suggestions.map((s, i) => (
            <button key={s} onClick={() => assistant.ask(s)}>
              [{i + 1}] {s}
            </button>
          ))}
        </div>
      )}

      <form className="term-prompt" onSubmit={submit}>
        <label htmlFor="cmd" className="prompt">
          {PROMPT}
        </label>
        <input
          id="cmd"
          ref={inputRef}
          value={input}
          maxLength={1500}
          autoComplete="off"
          spellCheck={false}
          placeholder={t(locale, "placeholder")}
          onChange={(e) => {
            setInput(e.target.value);
            assistant.onTyping();
          }}
          onBlur={assistant.onBlur}
        />
      </form>
    </div>
  );
}
