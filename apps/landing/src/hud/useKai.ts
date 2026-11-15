import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { ChatMessage, Locale, PanelName, PublicData } from "@yk/shared";
import { streamChat } from "../lib/api";
import { Speaker } from "../lib/speaker";
import { t } from "../i18n/strings";
import type { CoreHandle, CoreState } from "./core/Core";

export interface PanelRequest {
  key: string;
  panel: PanelName;
  slug?: string;
}

export interface Notice {
  key: number;
  text: string;
}

const MAX_HISTORY = 12;
const MAX_PANELS = 2;

/**
 * The assistant's brain on the client: sends questions, streams answers into
 * the speaker (which animates the core), collects panels and notices, and
 * falls back gracefully when the server is unreachable.
 */
export function useKai(core: RefObject<CoreHandle>, locale: Locale, data: PublicData) {
  const [state, setState] = useState<CoreState>("idle");
  const [caption, setCaption] = useState("");
  const [question, setQuestion] = useState("");
  const [panels, setPanels] = useState<PanelRequest[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [voice, setVoice] = useState(false);
  const history = useRef<ChatMessage[]>([]);
  const abort = useRef<AbortController | null>(null);
  const busy = useRef(false);

  const speaker = useMemo(
    () =>
      new Speaker({
        onLevel: (l) => core.current?.setLevel(l),
        onCaption: setCaption,
        onStart: () => setState("speaking"),
        onIdle: () => {
          busy.current = false;
          setState((s) => (s === "offline" ? s : "idle"));
        }
      }),
    [core]
  );

  useEffect(() => {
    speaker.voice = voice;
  }, [speaker, voice]);

  useEffect(() => () => speaker.reset(), [speaker]);

  const showPanel = useCallback((panel: PanelName, slug?: string) => {
    const key = `${panel}:${slug ?? ""}`;
    setPanels((cur) => [...cur.filter((p) => p.key !== key), { key, panel, slug }].slice(-MAX_PANELS));
  }, []);

  const closePanel = useCallback((key: string) => {
    setPanels((cur) => cur.filter((p) => p.key !== key));
  }, []);

  const flash = useCallback((text: string) => setNotice({ key: Date.now(), text }), []);

  /** Speaks a local line (greeting, errors) without calling the server. */
  const say = useCallback(
    (text: string) => {
      setQuestion("");
      speaker.say(text);
    },
    [speaker]
  );

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, 1500);
      if (!q) return;
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      busy.current = true;

      speaker.reset();
      setQuestion(q);
      setPanels([]);
      setState("thinking");

      history.current = [...history.current, { role: "user" as const, content: q }].slice(-MAX_HISTORY);
      let answer = "";
      let failed: "offline" | "rate" | null = null;

      try {
        for await (const ev of streamChat({ messages: history.current, locale }, ctrl.signal)) {
          if (ev.type === "text") {
            answer += ev.delta;
            speaker.write(ev.delta);
          } else if (ev.type === "panel") {
            showPanel(ev.panel, ev.slug);
          } else if (ev.type === "notice") {
            flash(t(locale, ev.kind === "message_sent" ? "sent" : "forwarded"));
          } else if (ev.type === "error") {
            failed = ev.code === "rate_limited" ? "rate" : "offline";
          }
        }
      } catch {
        if (ctrl.signal.aborted) return;
        failed = "offline";
      }

      if (failed && !answer) {
        history.current = history.current.slice(0, -1);
        if (failed === "offline") {
          setState("offline");
          showPanel("contact");
        }
        speaker.write(t(locale, failed === "rate" ? "rateLimited" : "offline"));
      } else {
        history.current = [...history.current, { role: "assistant" as const, content: answer }].slice(
          -MAX_HISTORY
        );
      }
      speaker.end();
    },
    [flash, locale, showPanel, speaker]
  );

  /** Keystrokes make the core lean in. */
  const onTyping = useCallback(() => {
    if (busy.current) return;
    setState((s) => (s === "idle" || s === "offline" ? "listening" : s));
    core.current?.pulse(0.1);
  }, [core]);

  const onBlur = useCallback(() => {
    setState((s) => (s === "listening" ? "idle" : s));
  }, []);

  // Clear notices after a moment.
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(id);
  }, [notice]);

  return {
    state,
    caption,
    question,
    panels,
    notice,
    voice,
    setVoice,
    ask,
    say,
    showPanel,
    closePanel,
    onTyping,
    onBlur,
    data
  };
}
