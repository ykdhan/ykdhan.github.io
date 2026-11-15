import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { migrate } from "./db.ts";
import { assertProductionEnv, env } from "./env.ts";
import { backfillEmbeddings } from "./memory.ts";
import { seedIfEmpty } from "./seed.ts";

assertProductionEnv();
await migrate();
await seedIfEmpty();

serve({ fetch: createApp().fetch, port: env.port }, (info) => {
  console.info(`[server] listening on :${info.port}`);
});

// Embed anything indexed while the embedder was unavailable (or after switching models).
backfillEmbeddings()
  .then((n) => n && console.info(`[embed] backfilled ${n} chunks`))
  .catch((err) => console.warn("[embed] backfill failed:", err.message));
