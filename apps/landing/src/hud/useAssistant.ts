import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { ChatMessage, Locale, PanelName } from "@yk/shared";
import { streamChat } from "../lib/api";
import { Speaker } from "../lib/speaker";
import { t } from "../i18n/strings";
import type { AvatarHandle, AvatarState } from "./avatar/Avatar";

export interface PanelRequest {
  key: string;
  panel: PanelName;
  slug?: string;
}

/** One block in the terminal log. */
export interface Turn {
  id: number;
  kind: "system" | "chat";
  question?: string;
  answer: string;
  panels: PanelRequest[];
  notices: string[];
  error?: boolean;
}

const MAX_HISTORY = 12;

const HANGUL = /[\uac00-\ud7a3]/;

/**
 * English by default. A visitor who writes in Korean or asks for Korean gets
 * the whole UI and the answers in Korean; asking for English switches back.
 */
export function pickLocale(question: string, current: Locale): Locale {
  if (/영어로|\b(in|speak|use) english\b/i.test(question)) return "en";
  if (HANGUL.test(question) || /\b(korean|hangul)\b/i.test(question)) return "ko";
  return current;
}
const MAX_TURNS = 30;

/**
 * The assistant on the client: sends questions, streams answers through the
 * speaker (which drives the Ralph animation and the typing), and keeps the
 * terminal log. Falls back gracefully when the server is unreachable.
 */
export function useAssistant(
  avatar: RefObject<AvatarHandle>,
  locale: Locale,
  setLocale: (l: Locale) => void
) {
  const [state, setState] = useState<AvatarState>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [voice, setVoice] = useState(false);
  const history = useRef<ChatMessage[]>([]);
  const abort = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const nextId = useRef(1);

  /** Updates the newest turn. */
  const patchLast = useCallback((fn: (t: Turn) => Turn) => {
    setTurns((cur) => (cur.length ? [...cur.slice(0, -1), fn(cur[cur.length - 1])] : cur));
  }, []);

  const pushTurn = useCallback((turn: Omit<Turn, "id">) => {
    setTurns((cur) => [...cur, { ...turn, id: nextId.current++ }].slice(-MAX_TURNS));
  }, []);

  const speaker = useMemo(
    () =>
      new Speaker({
        onLevel: (l) => avatar.current?.setLevel(l),
        onCaption: (text) => patchLast((turn) => ({ ...turn, answer: text })),
        onStart: () => setState("speaking"),
        onIdle: () => {
          busy.current = false;
          setState((s) => (s === "offline" ? s : "idle"));
        }
      }),
    [avatar, patchLast]
  );

  useEffect(() => {
    speaker.voice = voice;
  }, [speaker, voice]);

  useEffect(() => () => speaker.reset(), [speaker]);

  const addPanel = useCallback(
    (panel: PanelName, slug?: string) =>
      patchLast((turn) => {
        const key = `${panel}:${slug ?? ""}`;
        return turn.panels.some((p) => p.key === key) ? turn : { ...turn, panels: [...turn.panels, { key, panel, slug }] };
      }),
    [patchLast]
  );

  /** Prints a system line instantly (boot messages). */
  const print = useCallback(
    (text: string) => pushTurn({ kind: "system", answer: text, panels: [], notices: [] }),
    [pushTurn]
  );

  /** Speaks a local line (greeting, errors) without calling the server. */
  const say = useCallback(
    (text: string) => {
      speaker.reset();
      pushTurn({ kind: "chat", answer: "", panels: [], notices: [] });
      speaker.write(text);
      speaker.end();
    },
    [pushTurn, speaker]
  );

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, 1500);
      if (!q) return;
      const lang = pickLocale(q, locale);
      if (lang !== locale) setLocale(lang);
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      busy.current = true;

      speaker.reset();
      pushTurn({ kind: "chat", question: q, answer: "", panels: [], notices: [] });
      setState("thinking");

      history.current = [...history.current, { role: "user" as const, content: q }].slice(-MAX_HISTORY);
      let answer = "";
      let failed: "offline" | "rate" | null = null;

      try {
        for await (const ev of streamChat({ messages: history.current, locale: lang }, ctrl.signal)) {
          if (ev.type === "text") {
            answer += ev.delta;
            speaker.write(ev.delta);
          } else if (ev.type === "panel") {
            addPanel(ev.panel, ev.slug);
          } else if (ev.type === "notice") {
            const note = t(lang, ev.kind === "message_sent" ? "sent" : "forwarded");
            patchLast((turn) => ({ ...turn, notices: [...turn.notices, note] }));
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
        patchLast((turn) => ({ ...turn, error: true }));
        if (failed === "offline") {
          setState("offline");
          addPanel("contact");
        }
        speaker.write(t(lang, failed === "rate" ? "rateLimited" : "offline"));
      } else {
        history.current = [...history.current, { role: "assistant" as const, content: answer }].slice(-MAX_HISTORY);
      }
      speaker.end();
    },
    [addPanel, locale, patchLast, pushTurn, setLocale, speaker]
  );

  /** Keystrokes make Ralph lean in and tap a leg. */
  const onTyping = useCallback(() => {
    if (busy.current) return;
    setState((s) => (s === "idle" || s === "offline" ? "listening" : s));
    avatar.current?.pulse();
  }, [avatar]);

  const onBlur = useCallback(() => {
    setState((s) => (s === "listening" ? "idle" : s));
  }, []);

  return { state, turns, voice, setVoice, ask, say, print, onTyping, onBlur };
}
