import type {
  Entry,
  EntryInput,
  InboxItem,
  InboxType,
  ChatMessage,
  Memory,
  MemoryInput,
  Profile,
  UsageDay
} from "@yk/shared";
import { one, query } from "./db.ts";

/* ---------- settings (profile, github, ...) ---------- */

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await one<{ value: T }>("SELECT value FROM settings WHERE key = $1", [key]);
  return row ? row.value : fallback;
}

export async function setSetting(key: string, value: unknown) {
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
}

export const DEFAULT_PROFILE: Profile = {
  name: "",
  alias: "",
  role: { en: "", ko: "" },
  location: { en: "", ko: "" },
  summary: { en: "", ko: "" },
  email: "",
  links: [],
  assistantName: "Ralph",
  greeting: { en: "", ko: "" },
  suggestions: { en: [], ko: [] },
  persona: ""
};

export const getProfile = async () => ({
  ...DEFAULT_PROFILE,
  ...(await getSetting<Partial<Profile>>("profile", {}))
});

/* ---------- entries ---------- */

type EntryRow = {
  id: string;
  kind: Entry["kind"];
  slug: string;
  title: string;
  subtitle: string;
  period: string;
  body: string;
  tags: string[];
  links: Entry["links"];
  visible: boolean;
  sort: number;
  source: Entry["source"];
  source_ref: string | null;
  created_at: Date;
  updated_at: Date;
};

const toEntry = (r: EntryRow): Entry => ({
  id: r.id,
  kind: r.kind,
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  period: r.period,
  body: r.body,
  tags: r.tags,
  links: r.links,
  visible: r.visible,
  sort: r.sort,
  source: r.source,
  sourceRef: r.source_ref,
  createdAt: r.created_at.toISOString(),
  updatedAt: r.updated_at.toISOString()
});

export async function listEntries(opts: { visibleOnly?: boolean } = {}) {
  const rows = await query<EntryRow>(
    `SELECT * FROM entries ${opts.visibleOnly ? "WHERE visible" : ""}
     ORDER BY kind, sort, created_at`
  );
  return rows.map(toEntry);
}

export async function getEntry(id: string) {
  const r = await one<EntryRow>("SELECT * FROM entries WHERE id = $1", [id]);
  return r ? toEntry(r) : null;
}

export async function findEntryBySourceRef(ref: string) {
  const r = await one<EntryRow>("SELECT * FROM entries WHERE source_ref = $1", [ref]);
  return r ? toEntry(r) : null;
}

/** Makes a slug unique by appending -2, -3, ... when needed. */
async function uniqueSlug(slug: string, excludeId?: string) {
  let candidate = slug;
  for (let i = 2; ; i++) {
    const hit = await one("SELECT id FROM entries WHERE slug = $1 AND id IS DISTINCT FROM $2", [
      candidate,
      excludeId ?? null
    ]);
    if (!hit) return candidate;
    candidate = `${slug}-${i}`;
  }
}

export async function createEntry(e: EntryInput) {
  const slug = await uniqueSlug(e.slug);
  const r = await one<EntryRow>(
    `INSERT INTO entries (kind, slug, title, subtitle, period, body, tags, links, visible, sort, source, source_ref)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      e.kind,
      slug,
      e.title,
      e.subtitle,
      e.period,
      e.body,
      e.tags,
      JSON.stringify(e.links),
      e.visible,
      e.sort,
      e.source ?? "manual",
      e.sourceRef ?? null
    ]
  );
  return toEntry(r!);
}

export async function updateEntry(id: string, e: EntryInput) {
  const slug = await uniqueSlug(e.slug, id);
  const r = await one<EntryRow>(
    `UPDATE entries SET kind=$2, slug=$3, title=$4, subtitle=$5, period=$6, body=$7, tags=$8,
       links=$9, visible=$10, sort=$11, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [id, e.kind, slug, e.title, e.subtitle, e.period, e.body, e.tags, JSON.stringify(e.links), e.visible, e.sort]
  );
  return r ? toEntry(r) : null;
}

export async function deleteEntry(id: string) {
  await query("DELETE FROM entries WHERE id = $1", [id]);
}

/* ---------- memories ---------- */

type MemoryRow = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: Memory["source"];
  source_ref: string | null;
  created_at: Date;
  updated_at: Date;
};

const toMemory = (r: MemoryRow): Memory => ({
  id: r.id,
  title: r.title,
  content: r.content,
  tags: r.tags,
  source: r.source,
  sourceRef: r.source_ref,
  createdAt: r.created_at.toISOString(),
  updatedAt: r.updated_at.toISOString()
});

export async function listMemories() {
  return (await query<MemoryRow>("SELECT * FROM memories ORDER BY updated_at DESC")).map(toMemory);
}

export async function getMemory(id: string) {
  const r = await one<MemoryRow>("SELECT * FROM memories WHERE id = $1", [id]);
  return r ? toMemory(r) : null;
}

export async function findMemoryBySourceRef(ref: string) {
  const r = await one<MemoryRow>("SELECT * FROM memories WHERE source_ref = $1", [ref]);
  return r ? toMemory(r) : null;
}

export async function createMemory(m: MemoryInput) {
  const r = await one<MemoryRow>(
    `INSERT INTO memories (title, content, tags, source, source_ref) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [m.title, m.content, m.tags, m.source ?? "manual", m.sourceRef ?? null]
  );
  return toMemory(r!);
}

export async function updateMemory(id: string, m: MemoryInput) {
  const r = await one<MemoryRow>(
    `UPDATE memories SET title=$2, content=$3, tags=$4, updated_at=now() WHERE id=$1 RETURNING *`,
    [id, m.title, m.content, m.tags]
  );
  return r ? toMemory(r) : null;
}

export async function deleteMemory(id: string) {
  await query("DELETE FROM memories WHERE id = $1", [id]);
}

/* ---------- inbox ---------- */

type InboxRow = {
  id: string;
  type: InboxType;
  message: string;
  name: string | null;
  contact: string | null;
  transcript: ChatMessage[];
  status: "new" | "done";
  slack_ok: boolean;
  created_at: Date;
};

const toInbox = (r: InboxRow): InboxItem => ({
  id: r.id,
  type: r.type,
  message: r.message,
  name: r.name,
  contact: r.contact,
  transcript: r.transcript,
  status: r.status,
  slackOk: r.slack_ok,
  createdAt: r.created_at.toISOString()
});

export async function createInbox(item: {
  type: InboxType;
  message: string;
  name?: string | null;
  contact?: string | null;
  transcript: ChatMessage[];
}) {
  const r = await one<InboxRow>(
    `INSERT INTO inbox (type, message, name, contact, transcript) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [item.type, item.message, item.name ?? null, item.contact ?? null, JSON.stringify(item.transcript)]
  );
  return toInbox(r!);
}

export async function markInboxSlack(id: string, ok: boolean) {
  await query("UPDATE inbox SET slack_ok = $2 WHERE id = $1", [id, ok]);
}

export async function listInbox() {
  return (await query<InboxRow>("SELECT * FROM inbox ORDER BY created_at DESC LIMIT 300")).map(toInbox);
}

export async function setInboxStatus(id: string, status: "new" | "done") {
  await query("UPDATE inbox SET status = $2 WHERE id = $1", [id, status]);
}

export async function deleteInbox(id: string) {
  await query("DELETE FROM inbox WHERE id = $1", [id]);
}

/* ---------- usage ---------- */

export async function recordUsage(u: { input: number; cached: number; output: number }) {
  await query(
    `INSERT INTO usage_daily (day, requests, input_tokens, cached_tokens, output_tokens)
     VALUES (current_date, 1, $1, $2, $3)
     ON CONFLICT (day) DO UPDATE SET
       requests = usage_daily.requests + 1,
       input_tokens = usage_daily.input_tokens + EXCLUDED.input_tokens,
       cached_tokens = usage_daily.cached_tokens + EXCLUDED.cached_tokens,
       output_tokens = usage_daily.output_tokens + EXCLUDED.output_tokens`,
    [u.input, u.cached, u.output]
  );
}

export async function requestsToday() {
  const r = await one<{ requests: number }>("SELECT requests FROM usage_daily WHERE day = current_date");
  return r?.requests ?? 0;
}

export async function listUsage(days = 30): Promise<UsageDay[]> {
  const rows = await query<{
    day: Date;
    requests: number;
    input_tokens: string;
    cached_tokens: string;
    output_tokens: string;
  }>("SELECT * FROM usage_daily WHERE day > current_date - $1::int ORDER BY day", [days]);
  return rows.map((r) => ({
    day: r.day.toISOString().slice(0, 10),
    requests: r.requests,
    inputTokens: Number(r.input_tokens),
    cachedTokens: Number(r.cached_tokens),
    outputTokens: Number(r.output_tokens)
  }));
}
