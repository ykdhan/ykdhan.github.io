import { env } from "./env.ts";

/**
 * In-memory sliding windows keyed by IP. Fine for a single instance; the
 * global daily cap is enforced against the database (see routes/chat.ts).
 */
const hits = new Map<string, number[]>();

function check(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  return true;
}

const DAY = 86_400_000;

export const allowChat = (ip: string) =>
  check(`m:${ip}`, env.limits.perMinute, 60_000) && check(`d:${ip}`, env.limits.perDay, DAY);

export const allowMessage = (ip: string) => check(`msg:${ip}`, env.limits.messagesPerDay, DAY);

export const allowLogin = (ip: string) => check(`login:${ip}`, 10, 15 * 60_000);

// Keep the map from growing forever.
setInterval(() => {
  const now = Date.now();
  for (const [k, list] of hits) {
    if (list.every((t) => now - t > DAY)) hits.delete(k);
  }
}, 3_600_000).unref();
