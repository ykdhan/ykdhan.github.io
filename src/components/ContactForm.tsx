import { useState, type FormEvent } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";

type Status = "idle" | "sending" | "sent" | "error";

const WEBHOOK = import.meta.env.VITE_SLACK_WEBHOOK_URL as string | undefined;

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 2 11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2 15 22l-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Single-line message field that fires a Slack incoming webhook (no-cors). */
export default function ContactForm() {
  const { locale } = useLocale();
  const t = useT(locale);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const message = value.trim();
    if (!message || status === "sending") return;

    if (!WEBHOOK) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      // no-cors + text/plain body avoids the CORS preflight that Slack rejects.
      // The response is opaque, so a resolved fetch is treated as delivered.
      await fetch(WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          text: `:envelope_with_arrow: *New message · ykdhan.github.io*\n${message}`
        })
      });
      setStatus("sent");
      setValue("");
    } catch {
      setStatus("error");
    }
  };

  const statusText =
    status === "sending"
      ? t("contactSending")
      : status === "sent"
        ? t("contactSent")
        : status === "error"
          ? t("contactError")
          : "";

  return (
    <div className="contact">
      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <input
          className="contact-input"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder={t("contactPlaceholder")}
          aria-label={t("contactPlaceholder")}
          maxLength={500}
          autoComplete="off"
        />
        <button
          className="contact-send"
          type="submit"
          disabled={!value.trim() || status === "sending"}
          aria-label={t("contactSend")}
          title={t("contactSend")}
        >
          {status === "sending" ? <span className="spinner" /> : <SendIcon />}
        </button>
      </form>
      <p
        className={`contact-status ${status === "sent" ? "ok" : status === "error" ? "err" : ""}`}
        role="status"
        aria-live="polite"
      >
        {statusText}
      </p>
    </div>
  );
}
