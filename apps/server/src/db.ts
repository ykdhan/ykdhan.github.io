import pg from "pg";
import { env } from "./env.ts";

const needsSsl =
  /sslmode=require/.test(env.databaseUrl) || process.env.DATABASE_SSL === "true";

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 8,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  const res = await pool.query<T>(text, params);
  return res.rows;
}

export async function one<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Idempotent schema. Each statement is safe to re-run on every boot, so there
 * is no migration table to keep in sync for a project this size.
 */
const SCHEMA = `
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  title      text NOT NULL,
  subtitle   text NOT NULL DEFAULT '',
  period     text NOT NULL DEFAULT '',
  body       text NOT NULL DEFAULT '',
  tags       text[] NOT NULL DEFAULT '{}',
  links      jsonb NOT NULL DEFAULT '[]',
  visible    boolean NOT NULL DEFAULT true,
  sort       int NOT NULL DEFAULT 0,
  source     text NOT NULL DEFAULT 'manual',
  source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL DEFAULT '',
  content    text NOT NULL,
  tags       text[] NOT NULL DEFAULT '{}',
  source     text NOT NULL DEFAULT 'manual',
  source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Retrieval units derived from entries, memories and the profile.
-- Embedding dimensions depend on the embedder, so the column is untyped and
-- each row records which model produced it.
CREATE TABLE IF NOT EXISTS chunks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type      text NOT NULL,
  owner_id        text NOT NULL,
  title           text NOT NULL DEFAULT '',
  content         text NOT NULL,
  embedding       vector,
  embedding_model text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chunks_owner_idx ON chunks (owner_type, owner_id);
CREATE INDEX IF NOT EXISTS chunks_trgm_idx ON chunks USING gin (content gin_trgm_ops);

CREATE TABLE IF NOT EXISTS inbox (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text NOT NULL,
  message    text NOT NULL,
  name       text,
  contact    text,
  transcript jsonb NOT NULL DEFAULT '[]',
  status     text NOT NULL DEFAULT 'new',
  slack_ok   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_daily (
  day           date PRIMARY KEY,
  requests      int NOT NULL DEFAULT 0,
  input_tokens  bigint NOT NULL DEFAULT 0,
  cached_tokens bigint NOT NULL DEFAULT 0,
  output_tokens bigint NOT NULL DEFAULT 0
);
`;

export async function migrate() {
  await pool.query(SCHEMA);
}
