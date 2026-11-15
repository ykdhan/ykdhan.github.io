import type { ChatMessage, InboxType } from "@yk/shared";
import { env } from "./env.ts";

const HEADERS: Record<InboxType, string> = {
  unanswered: "❓ 답하지 못한 질문",
  collaboration: "🤝 협업 제안",
  contact: "✉️ 연락 요청"
};

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Slack mrkdwn needs &, <, > escaped. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildSlackPayload(item: {
  type: InboxType;
  message: string;
  name?: string | null;
  contact?: string | null;
  transcript: ChatMessage[];
}) {
  const fields = [
    item.name && `*이름*\n${esc(item.name)}`,
    item.contact && `*연락처*\n${esc(item.contact)}`
  ].filter(Boolean) as string[];

  const recent = item.transcript
    .slice(-6)
    .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${esc(clip(m.content.replace(/\s+/g, " "), 280))}`)
    .join("\n");

  return {
    text: `${HEADERS[item.type]}: ${clip(item.message, 140)}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: HEADERS[item.type] } },
      { type: "section", text: { type: "mrkdwn", text: `>${esc(item.message).replace(/\n/g, "\n>")}` } },
      ...(fields.length ? [{ type: "section", fields: fields.map((t) => ({ type: "mrkdwn", text: t })) }] : []),
      ...(recent
        ? [
            { type: "divider" },
            { type: "context", elements: [{ type: "mrkdwn", text: `*최근 대화*\n${recent}` }] }
          ]
        : [])
    ]
  };
}

/** Returns true when Slack accepted the message. Never throws. */
export async function notifySlack(item: Parameters<typeof buildSlackPayload>[0]) {
  if (!env.slackWebhookUrl) return false;
  try {
    const res = await fetch(env.slackWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildSlackPayload(item))
    });
    if (!res.ok) console.warn(`[slack] ${res.status} ${await res.text()}`);
    return res.ok;
  } catch (err) {
    console.warn("[slack] failed:", (err as Error).message);
    return false;
  }
}
