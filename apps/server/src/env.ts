/** Runtime configuration. Everything comes from environment variables. */

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const env = {
  port: num(process.env.PORT, 8787),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://localhost:5432/yk",

  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || undefined,
  model: process.env.CHAT_MODEL ?? "claude-haiku-5-5",

  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL ?? "",

  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",

  /** Origins allowed to call the API (landing + admin), comma separated. */
  corsOrigins: list(process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:5174"),

  githubToken: process.env.GITHUB_TOKEN ?? "",

  /** "local" (free, runs in-process), "voyage", or "none" (keyword search only). */
  embedder: (process.env.EMBEDDER ?? "local") as "local" | "voyage" | "none",
  voyageKey: process.env.VOYAGE_API_KEY ?? "",

  limits: {
    perMinute: num(process.env.CHAT_LIMIT_PER_MINUTE, 6),
    perDay: num(process.env.CHAT_LIMIT_PER_DAY, 60),
    globalPerDay: num(process.env.CHAT_LIMIT_GLOBAL_PER_DAY, 3000),
    messagesPerDay: num(process.env.MESSAGE_LIMIT_PER_DAY, 5)
  }
};

export function assertProductionEnv() {
  const missing: string[] = [];
  if (!env.adminPassword) missing.push("ADMIN_PASSWORD");
  if (env.sessionSecret.length < 32) missing.push("SESSION_SECRET (32+ chars)");
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (!env.anthropicKey) console.warn("[env] ANTHROPIC_API_KEY is not set: chat will return 'unavailable'.");
  if (!env.slackWebhookUrl) console.warn("[env] SLACK_WEBHOOK_URL is not set: messages are saved to the inbox only.");
}
