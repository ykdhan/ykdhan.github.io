import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PublicData } from "@yk/shared";
import Background from "./components/Background";
import Core, { type CoreHandle } from "./hud/core/Core";
import Panels from "./hud/Panels";
import { useKai } from "./hud/useKai";
import { FALLBACK, fetchPublic } from "./lib/api";
import { useLocale } from "./i18n/LocaleContext";
import { t } from "./i18n/strings";

export default function App() {
  const { locale, toggle } = useLocale();
  const core = useRef<CoreHandle>(null);
  const [data, setData] = useState<PublicData>(FALLBACK);
  const [online, setOnline] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const kai = useKai(core, locale, data);
  const greeted = useRef(false);
  const { say } = kai;

  useEffect(() => {
    fetchPublic()
      .then((d) => {
        setData(d);
        setOnline(true);
      })
      .catch(() => setOnline(false));
  }, []);

  // Greet once the profile is known (or the server turned out to be down).
  useEffect(() => {
    if (online === null || greeted.current) return;
    greeted.current = true;
    const greeting = data.profile.greeting[locale];
    window.setTimeout(() => say(greeting), 700);
  }, [online, data, locale, say]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    kai.ask(input);
    setInput("");
  };

  const { profile } = data;
  const suggestions = profile.suggestions[locale];

  return (
    <div className="kai">
      <Background />
      <Core ref={core} state={kai.state} className="kai-core" />

      <header className="kai-status">
        <div className="kai-id mono">
          <span className={`kai-dot kai-dot-${kai.state}`} />
          {profile.assistantName}
          <span className="kai-dim">
            {" · "}
            {profile.alias || profile.name}
          </span>
        </div>
        <nav className="kai-actions mono">
          <button onClick={() => kai.setVoice((v) => !v)} aria-pressed={kai.voice}>
            {t(locale, kai.voice ? "voiceOn" : "voiceOff")}
          </button>
          <button onClick={toggle} aria-label="Toggle language">
            <span className={locale === "en" ? "is-on" : ""}>EN</span>/
            <span className={locale === "ko" ? "is-on" : ""}>KO</span>
          </button>
        </nav>
      </header>

      <Panels panels={kai.panels} data={data} locale={locale} onClose={kai.closePanel} />

      <div className="kai-transcript" aria-live="polite">
        {kai.question && <p className="kai-question">{kai.question}</p>}
        <p className="kai-caption">
          {kai.caption}
          {kai.state === "speaking" && <span className="kai-cursor" />}
        </p>
      </div>

      {kai.notice && (
        <div key={kai.notice.key} className="kai-notice mono" role="status">
          {kai.notice.text}
        </div>
      )}

      <form className="kai-dock" onSubmit={submit}>
        {suggestions.length > 0 && (
          <div className="kai-chips">
            {suggestions.map((s) => (
              <button type="button" key={s} className="kai-chip" onClick={() => kai.ask(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="kai-field">
          <input
            className="kai-input"
            value={input}
            maxLength={1500}
            placeholder={t(locale, "placeholder")}
            aria-label={t(locale, "placeholder")}
            onChange={(e) => {
              setInput(e.target.value);
              kai.onTyping();
            }}
            onBlur={kai.onBlur}
          />
          <button className="kai-send" type="submit" disabled={!input.trim()} aria-label={t(locale, "send")}>
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
