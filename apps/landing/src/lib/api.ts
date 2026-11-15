import type { ChatEvent, ChatRequest, PublicData } from "@yk/shared";

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8787";

/** Shown when the server can't be reached, so the page still works. */
export const FALLBACK: PublicData = {
  profile: {
    name: "Youngkwang Han",
    alias: "YK",
    role: { en: "Fullstack Developer", ko: "풀스택 개발자" },
    location: { en: "Seoul, South Korea", ko: "대한민국 서울" },
    summary: { en: "", ko: "" },
    email: "ykdhan@gmail.com",
    links: [
      { label: "GitHub", url: "https://github.com/ykdhan" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/ykdhan" }
    ],
    assistantName: "Ralph",
    greeting: {
      en: "Ralph online. I'm YK's assistant. Ask me anything about YK, or pick a number below.",
      ko: "Ralph 접속 완료. YK의 비서 랄프입니다. YK에 대해 무엇이든 물어보시거나, 아래 번호를 골라주세요."
    },
    suggestions: { en: [], ko: [] }
  },
  entries: []
};

export async function fetchPublic(): Promise<PublicData> {
  const res = await fetch(`${API_URL}/api/public`);
  if (!res.ok) throw new Error(`public ${res.status}`);
  return res.json();
}

/** POSTs a chat turn and yields server-sent events as they arrive. */
export async function* streamChat(body: ChatRequest, signal: AbortSignal): AsyncGenerator<ChatEvent> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal
  });
  if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (line.startsWith("data:")) {
          try {
            yield JSON.parse(line.slice(5).trim()) as ChatEvent;
          } catch {
            /* ignore malformed frame */
          }
        }
      }
    }
  }
}
