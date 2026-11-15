import { createHmac, timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { env } from "./env.ts";

/**
 * Single-owner auth: the admin password is exchanged for a signed, expiring
 * bearer token. No user table, no cookies (admin and API live on different domains).
 */

const TTL_MS = 7 * 86_400_000;

const sign = (payload: string) =>
  createHmac("sha256", env.sessionSecret).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(password: string) {
  return !!env.adminPassword && safeEqual(sign(password), sign(env.adminPassword));
}

export function issueToken() {
  const payload = Buffer.from(JSON.stringify({ sub: "owner", exp: Date.now() + TTL_MS })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string) {
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const header = c.req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !verifyToken(token)) return c.json({ error: "unauthorized" }, 401);
  await next();
};
