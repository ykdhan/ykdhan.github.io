/**
 * Integration test: real Postgres, mocked Anthropic (SSE) and Slack.
 * Run with TEST_DATABASE_URL pointing at a throwaway database:
 *   TEST_DATABASE_URL=postgres://postgres@localhost:5433/yk_test npm test -w @yk/server
 */
import assert from "node:assert/strict";
import { createServer, type IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

const DB = process.env.TEST_DATABASE_URL;

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve) => {
    let s = "";
    req.on("data", (d) => (s += d));
    req.on("end", () => resolve(s));
  });

/* ---------- mock Anthropic: scripted replies keyed on the question ---------- */

type Block = { text: string } | { tool: string; input: Record<string, unknown> };
const anthropicRequests: any[] = [];

function script(question: string, hasToolResult: boolean): Block[] {
  if (hasToolResult) return [{ text: "Done." }];
  if (/salary/i.test(question))
    return [
      { text: "That's one I can't answer." },
      { tool: "report_unanswered", input: { question } }
    ];
  if (/collaborat/i.test(question))
    return [
      {
        tool: "leave_message",
        input: { kind: "collaboration", message: "Let's build an AI app", name: "Jane", contact: "jane@acme.com" }
      }
    ];
  if (/mobile/i.test(question))
    return [{ text: "Yes, Plang." }, { tool: "show_panel", input: { panel: "project", slug: "plang" } }];
  return [{ text: "Hello." }];
}

function sse(blocks: Block[]) {
  const ev = (type: string, data: object) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
  let out = ev("message_start", {
    message: {
      id: "msg_1", type: "message", role: "assistant", content: [], model: "mock",
      stop_reason: null, stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 1, cache_read_input_tokens: 80 }
    }
  });
  blocks.forEach((b, index) => {
    if ("text" in b) {
      out += ev("content_block_start", { index, content_block: { type: "text", text: "" } });
      out += ev("content_block_delta", { index, delta: { type: "text_delta", text: b.text } });
    } else {
      out += ev("content_block_start", {
        index, content_block: { type: "tool_use", id: `tu_${index}`, name: b.tool, input: {} }
      });
      out += ev("content_block_delta", {
        index, delta: { type: "input_json_delta", partial_json: JSON.stringify(b.input) }
      });
    }
    out += ev("content_block_stop", { index });
  });
  const tool = blocks.some((b) => "tool" in b);
  out += ev("message_delta", {
    delta: { stop_reason: tool ? "tool_use" : "end_turn", stop_sequence: null },
    usage: { output_tokens: 20 }
  });
  out += ev("message_stop", {});
  return out;
}

const slackPosts: any[] = [];
let server: ReturnType<typeof createServer>;
let app: { fetch: (r: Request) => Promise<Response> | Response };

before(async () => {
  if (!DB) return;
  server = createServer(async (req, res) => {
    const body = await readBody(req);
    if (req.url === "/slack") {
      slackPosts.push(JSON.parse(body));
      res.end("ok");
      return;
    }
    const json = JSON.parse(body);
    anthropicRequests.push(json);
    const last = json.messages[json.messages.length - 1];
    const hasToolResult = Array.isArray(last.content) && last.content.some((b: any) => b.type === "tool_result");
    const question = Array.isArray(last.content)
      ? last.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join(" ")
      : last.content;
    res.writeHead(200, { "content-type": "text/event-stream" });
    res.end(sse(script(question, hasToolResult)));
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as AddressInfo).port;

  Object.assign(process.env, {
    DATABASE_URL: DB,
    ANTHROPIC_API_KEY: "test-key",
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${port}`,
    SLACK_WEBHOOK_URL: `http://127.0.0.1:${port}/slack`,
    ADMIN_PASSWORD: "pw",
    SESSION_SECRET: "x".repeat(40),
    EMBEDDER: "none",
    CHAT_LIMIT_PER_MINUTE: "100",
    CHAT_LIMIT_PER_DAY: "100"
  });
  const db = await import("../src/db.ts");
  await db.pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await db.migrate();
  await (await import("../src/seed.ts")).seedIfEmpty();
  app = (await import("../src/app.ts")).createApp();
});

after(async () => {
  server?.close();
  if (DB) await (await import("../src/db.ts")).pool.end();
});

async function chat(question: string) {
  const res = await app.fetch(
    new Request("http://x/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify({ messages: [{ role: "user", content: question }], locale: "en" })
    })
  );
  const text = await res.text();
  return text
    .split("\n")
    .filter((l) => l.startsWith("data: "))
    .map((l) => JSON.parse(l.slice(6)));
}

const skip = !DB && "set TEST_DATABASE_URL to run";

test("public data comes from the seeded database", { skip }, async () => {
  const data = await (await app.fetch(new Request("http://x/api/public"))).json();
  assert.equal(data.profile.alias, "YK");
  assert.equal("persona" in data.profile, false);
  assert.ok(data.entries.some((e: any) => e.slug === "plang"));
});

test("retrieval context and cached system prompt are sent", { skip }, async () => {
  const events = await chat("Has YK built a mobile app?");
  assert.deepEqual(events.find((e) => e.type === "panel"), { type: "panel", panel: "project", slug: "plang" });
  const req = anthropicRequests[0];
  assert.equal(req.system[0].cache_control.type, "ephemeral");
  assert.equal(req.output_config.effort, "low");
  const context = req.messages.at(-1).content[0].text;
  assert.match(context, /<context>/);
  assert.match(context, /Plang/, "keyword retrieval should surface the Plang project");
  assert.equal(events.at(-1).type, "done");
});

test("unanswered questions go to the inbox and Slack", { skip }, async () => {
  slackPosts.length = 0;
  const events = await chat("What is YK's salary?");
  assert.ok(events.some((e) => e.type === "notice" && e.kind === "question_forwarded"));
  assert.equal(slackPosts.length, 1);
  assert.match(slackPosts[0].text, /답하지 못한 질문/);
  const { query } = await import("../src/db.ts");
  const rows = await query("SELECT type, slack_ok FROM inbox WHERE type = 'unanswered'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].slack_ok, true);
});

test("collaboration proposals reach Slack with contact details", { skip }, async () => {
  slackPosts.length = 0;
  const events = await chat("I want to collaborate with YK");
  assert.ok(events.some((e) => e.type === "notice" && e.kind === "message_sent"));
  assert.match(slackPosts[0].text, /협업 제안/);
  assert.match(JSON.stringify(slackPosts[0].blocks), /jane@acme\.com/);
});

test("admin endpoints require a valid token", { skip }, async () => {
  assert.equal((await app.fetch(new Request("http://x/api/admin/entries"))).status, 401);
  const bad = await app.fetch(
    new Request("http://x/api/admin/login", { method: "POST", body: JSON.stringify({ password: "nope" }) })
  );
  assert.equal(bad.status, 401);
  const { token } = await (
    await app.fetch(new Request("http://x/api/admin/login", { method: "POST", body: JSON.stringify({ password: "pw" }) }))
  ).json();
  const auth = { authorization: `Bearer ${token}`, "content-type": "application/json" };

  // Answering an unanswered question creates a searchable FAQ entry.
  const inbox = await (await app.fetch(new Request("http://x/api/admin/inbox", { headers: auth }))).json();
  const item = inbox.find((i: any) => i.type === "unanswered");
  const created = await app.fetch(
    new Request(`http://x/api/admin/inbox/${item.id}/answer`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ question: "What is YK's salary range?", answer: "YK prefers to discuss compensation directly." })
    })
  );
  assert.equal(created.status, 201);
  const hits = await (
    await app.fetch(new Request(`http://x/api/admin/search?q=${encodeURIComponent("salary")}`, { headers: auth }))
  ).json();
  assert.match(hits[0].content, /compensation/);
});

test("Korean queries match through particle stripping", { skip }, async () => {
  const { terms } = await import("../src/memory.ts");
  assert.deepEqual(terms("모바일앱은 플러터로 만들었나요?").includes("모바일앱"), true);
});
