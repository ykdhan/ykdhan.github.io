import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import type { AdminStats, ChatEvent, PublicData } from "@yk/shared";
import { ENTRY_KINDS, slugify } from "@yk/shared";
import { checkPassword, issueToken, requireAdmin } from "./auth.ts";
import { runChat } from "./chat.ts";
import { one } from "./db.ts";
import { embedderStatus } from "./embed.ts";
import { env } from "./env.ts";
import { githubSettings, importRepos, listRepos } from "./github.ts";
import { indexEntry, indexMemory, indexProfile, reindexAll, removeOwner, search } from "./memory.ts";
import { allowChat, allowLogin } from "./ratelimit.ts";
import * as repo from "./repo.ts";
import { notifySlack } from "./slack.ts";

/* ---------- validation ---------- */

const l10n = z.object({ en: z.string().max(2000), ko: z.string().max(2000) });
const link = z.object({ label: z.string().max(80), url: z.string().url().max(500) });

const profileSchema = z.object({
  name: z.string().max(120),
  alias: z.string().max(40),
  role: l10n,
  location: l10n,
  summary: l10n,
  email: z.string().max(200),
  links: z.array(link).max(12),
  assistantName: z.string().min(1).max(40),
  greeting: l10n,
  suggestions: z.object({ en: z.array(z.string().max(120)).max(6), ko: z.array(z.string().max(120)).max(6) }),
  persona: z.string().max(4000)
});

const entrySchema = z.object({
  kind: z.enum(ENTRY_KINDS),
  slug: z.string().max(80).optional().default(""),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).default(""),
  period: z.string().max(80).default(""),
  body: z.string().max(20000).default(""),
  tags: z.array(z.string().max(60)).max(30).default([]),
  links: z.array(link).max(10).default([]),
  visible: z.boolean().default(true),
  sort: z.number().int().default(0)
});

const memorySchema = z.object({
  title: z.string().max(200).default(""),
  content: z.string().min(1).max(20000),
  tags: z.array(z.string().max(60)).max(30).default([])
});

const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1500) }))
    .min(1)
    .max(16)
    .refine((m) => m[m.length - 1].role === "user", "last message must be from the user"),
  locale: z.enum(["en", "ko"]).default("en")
});

const clientIp = (c: { req: { header(n: string): string | undefined } }) =>
  c.req.header("x-forwarded-for")?.split(",")[0].trim() || c.req.header("x-real-ip") || "unknown";

/* ---------- app ---------- */

export function createApp() {
  const app = new Hono();

  app.use(
    "/api/*",
    cors({
      origin: (origin) => (env.corsOrigins.includes(origin) ? origin : null),
      allowHeaders: ["content-type", "authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      maxAge: 86400
    })
  );

  app.onError((err, c) => {
    if (err instanceof z.ZodError) return c.json({ error: "invalid input", issues: err.issues }, 400);
    console.error("[http]", err);
    return c.json({ error: err.message || "internal error" }, 500);
  });

  app.get("/api/health", (c) => c.json({ ok: true }));

  /* ----- public ----- */

  app.get("/api/public", async (c) => {
    const [{ persona: _persona, ...profile }, entries] = await Promise.all([
      repo.getProfile(),
      repo.listEntries({ visibleOnly: true })
    ]);
    const data: PublicData = {
      profile,
      entries: entries.map(({ kind, slug, title, subtitle, period, body, tags, links }) => ({
        kind,
        slug,
        title,
        subtitle,
        period,
        body,
        tags,
        links
      }))
    };
    c.header("cache-control", "public, max-age=60");
    return c.json(data);
  });

  app.post("/api/chat", async (c) => {
    const body = chatSchema.safeParse(await c.req.json().catch(() => null));
    const ip = clientIp(c);

    const reject = (event: ChatEvent) =>
      streamSSE(c, async (s) => {
        await s.writeSSE({ data: JSON.stringify(event) });
      });

    if (!body.success) return reject({ type: "error", code: "bad_request", message: "Invalid request." });
    if (!allowChat(ip) || (await repo.requestsToday()) >= env.limits.globalPerDay) {
      return reject({ type: "error", code: "rate_limited", message: "Too many requests. Try again later." });
    }

    const abort = new AbortController();
    return streamSSE(c, async (s) => {
      s.onAbort(() => abort.abort());
      for await (const event of runChat({ ...body.data, ip, signal: abort.signal })) {
        await s.writeSSE({ data: JSON.stringify(event) });
      }
    });
  });

  /* ----- admin auth ----- */

  app.post("/api/admin/login", async (c) => {
    if (!allowLogin(clientIp(c))) return c.json({ error: "too many attempts" }, 429);
    const { password } = z.object({ password: z.string().max(200) }).parse(await c.req.json());
    if (!checkPassword(password)) return c.json({ error: "wrong password" }, 401);
    return c.json({ token: issueToken() });
  });

  const admin = new Hono();
  admin.use("*", requireAdmin);

  admin.get("/stats", async (c) => {
    const count = async (sql: string) => Number((await one<{ n: string }>(sql))?.n ?? 0);
    const stats: AdminStats = {
      entries: await count("SELECT count(*) n FROM entries"),
      memories: await count("SELECT count(*) n FROM memories"),
      chunks: await count("SELECT count(*) n FROM chunks"),
      embeddedChunks: await count("SELECT count(*) n FROM chunks WHERE embedding IS NOT NULL"),
      embedder: embedderStatus(),
      inboxNew: await count("SELECT count(*) n FROM inbox WHERE status = 'new'"),
      usage: await repo.listUsage(30)
    };
    return c.json(stats);
  });

  /* profile */
  admin.get("/profile", async (c) => c.json(await repo.getProfile()));
  admin.put("/profile", async (c) => {
    const profile = profileSchema.parse(await c.req.json());
    await repo.setSetting("profile", profile);
    await indexProfile(profile);
    return c.json(profile);
  });

  /* entries */
  admin.get("/entries", async (c) => c.json(await repo.listEntries()));
  admin.post("/entries", async (c) => {
    const input = entrySchema.parse(await c.req.json());
    const entry = await repo.createEntry({ ...input, slug: slugify(input.slug || input.title) });
    await indexEntry(entry);
    return c.json(entry, 201);
  });
  admin.put("/entries/:id", async (c) => {
    const input = entrySchema.parse(await c.req.json());
    const entry = await repo.updateEntry(c.req.param("id"), {
      ...input,
      slug: slugify(input.slug || input.title)
    });
    if (!entry) return c.json({ error: "not found" }, 404);
    await indexEntry(entry);
    return c.json(entry);
  });
  admin.delete("/entries/:id", async (c) => {
    await repo.deleteEntry(c.req.param("id"));
    await removeOwner("entry", c.req.param("id"));
    return c.json({ ok: true });
  });

  /* memories */
  admin.get("/memories", async (c) => c.json(await repo.listMemories()));
  admin.post("/memories", async (c) => {
    const memory = await repo.createMemory(memorySchema.parse(await c.req.json()));
    await indexMemory(memory);
    return c.json(memory, 201);
  });
  admin.put("/memories/:id", async (c) => {
    const memory = await repo.updateMemory(c.req.param("id"), memorySchema.parse(await c.req.json()));
    if (!memory) return c.json({ error: "not found" }, 404);
    await indexMemory(memory);
    return c.json(memory);
  });
  admin.delete("/memories/:id", async (c) => {
    await repo.deleteMemory(c.req.param("id"));
    await removeOwner("memory", c.req.param("id"));
    return c.json({ ok: true });
  });

  /* retrieval tools */
  admin.get("/search", async (c) => c.json(await search(c.req.query("q") ?? "", 8)));
  admin.post("/reindex", async (c) => c.json({ chunks: await reindexAll() }));

  /* inbox */
  admin.get("/inbox", async (c) => c.json(await repo.listInbox()));
  admin.patch("/inbox/:id", async (c) => {
    const { status } = z.object({ status: z.enum(["new", "done"]) }).parse(await c.req.json());
    await repo.setInboxStatus(c.req.param("id"), status);
    return c.json({ ok: true });
  });
  admin.delete("/inbox/:id", async (c) => {
    await repo.deleteInbox(c.req.param("id"));
    return c.json({ ok: true });
  });
  /** Turns an unanswered question into an FAQ entry so the assistant can answer it next time. */
  admin.post("/inbox/:id/answer", async (c) => {
    const { question, answer } = z
      .object({ question: z.string().min(1).max(500), answer: z.string().min(1).max(5000) })
      .parse(await c.req.json());
    const entry = await repo.createEntry({
      kind: "faq",
      slug: slugify(question),
      title: question,
      subtitle: "",
      period: "",
      body: answer,
      tags: [],
      links: [],
      visible: true,
      sort: 0
    });
    await indexEntry(entry);
    await repo.setInboxStatus(c.req.param("id"), "done");
    return c.json(entry, 201);
  });

  /* github */
  admin.get("/github", async (c) => c.json(await githubSettings()));
  admin.put("/github", async (c) => {
    const value = z.object({ username: z.string().max(39) }).parse(await c.req.json());
    await repo.setSetting("github", value);
    return c.json(value);
  });
  admin.get("/github/repos", async (c) => c.json(await listRepos()));
  admin.post("/github/import", async (c) => {
    const { repos, as } = z
      .object({ repos: z.array(z.string().regex(/^[\w.-]+\/[\w.-]+$/)).min(1).max(30), as: z.enum(["project", "memory"]) })
      .parse(await c.req.json());
    return c.json(await importRepos(repos, as));
  });

  /* slack */
  admin.post("/slack/test", async (c) =>
    c.json({
      ok: await notifySlack({
        type: "contact",
        message: "Test message from the admin panel. If you can read this, notifications work.",
        name: "Admin",
        transcript: []
      })
    })
  );

  app.route("/api/admin", admin);
  return app;
}
