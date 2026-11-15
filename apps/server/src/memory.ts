import type { Entry, Memory, Profile, SearchHit } from "@yk/shared";
import { query } from "./db.ts";
import { embedder, toVectorLiteral, tryEmbed } from "./embed.ts";
import { getProfile, listEntries, listMemories } from "./repo.ts";

/**
 * The assistant's long-term memory: every entry, memory note and the profile
 * is split into chunks, embedded (when an embedder is available) and searched
 * with a hybrid of vector similarity and fuzzy keyword matching.
 */

type OwnerType = "entry" | "memory" | "profile";

const CHUNK = 1100;
const OVERLAP = 150;

/** Splits on paragraph boundaries, falling back to hard cuts for long paragraphs. */
export function chunkText(text: string): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (clean.length <= CHUNK) return clean ? [clean] : [];
  const paras = clean.split(/\n{2,}/);
  const out: string[] = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) out.push(cur.trim());
    cur = "";
  };
  for (const p of paras) {
    if (p.length > CHUNK) {
      push();
      for (let i = 0; i < p.length; i += CHUNK - OVERLAP) out.push(p.slice(i, i + CHUNK));
    } else if (cur.length + p.length + 2 > CHUNK) {
      const tail = cur.slice(-OVERLAP);
      push();
      cur = `${tail}\n\n${p}`;
    } else {
      cur = cur ? `${cur}\n\n${p}` : p;
    }
  }
  push();
  return out;
}

export function entryText(e: Entry) {
  return [
    `[${e.kind}] ${e.title}`,
    e.subtitle,
    e.period && `Period: ${e.period}`,
    e.tags.length ? `Tags: ${e.tags.join(", ")}` : "",
    e.links.length ? `Links: ${e.links.map((l) => `${l.label} ${l.url}`).join(" · ")}` : "",
    e.body
  ]
    .filter(Boolean)
    .join("\n");
}

export const memoryText = (m: Memory) =>
  [m.title, m.tags.length ? `Tags: ${m.tags.join(", ")}` : "", m.content].filter(Boolean).join("\n");

export const profileText = (p: Profile) =>
  [
    `${p.name} (${p.alias})`,
    `Role: ${p.role.en} / ${p.role.ko}`,
    `Location: ${p.location.en} / ${p.location.ko}`,
    p.summary.en,
    p.summary.ko,
    `Email: ${p.email}`,
    ...p.links.map((l) => `${l.label}: ${l.url}`)
  ]
    .filter(Boolean)
    .join("\n");

/** Rebuilds the chunks for one owner. Embedding failures still store the text. */
export async function indexOwner(ownerType: OwnerType, ownerId: string, title: string, text: string) {
  const parts = chunkText(text);
  const vectors = await tryEmbed(parts, "passage");
  await query("DELETE FROM chunks WHERE owner_type = $1 AND owner_id = $2", [ownerType, ownerId]);
  for (let i = 0; i < parts.length; i++) {
    const v = vectors?.[i];
    await query(
      `INSERT INTO chunks (owner_type, owner_id, title, content, embedding, embedding_model)
       VALUES ($1, $2, $3, $4, $5::vector, $6)`,
      [ownerType, ownerId, title, parts[i], v ? toVectorLiteral(v) : null, v ? embedder!.name : null]
    );
  }
  return parts.length;
}

export const removeOwner = (ownerType: OwnerType, ownerId: string) =>
  query("DELETE FROM chunks WHERE owner_type = $1 AND owner_id = $2", [ownerType, ownerId]);

export const indexEntry = (e: Entry) => indexOwner("entry", e.id, e.title, entryText(e));
export const indexMemory = (m: Memory) => indexOwner("memory", m.id, m.title || "Memory", memoryText(m));
export const indexProfile = (p: Profile) => indexOwner("profile", "profile", "Profile", profileText(p));

/** Rebuilds everything (admin "Reindex" button, or after switching embedders). */
export async function reindexAll() {
  await query("DELETE FROM chunks");
  let n = await indexProfile(await getProfile());
  for (const e of await listEntries()) n += await indexEntry(e);
  for (const m of await listMemories()) n += await indexMemory(m);
  return n;
}

/** Fills in embeddings for chunks that have none or came from another model. */
export async function backfillEmbeddings() {
  if (!embedder) return 0;
  const rows = await query<{ id: string; content: string }>(
    "SELECT id, content FROM chunks WHERE embedding_model IS DISTINCT FROM $1",
    [embedder.name]
  );
  let done = 0;
  for (let i = 0; i < rows.length; i += 16) {
    const batch = rows.slice(i, i + 16);
    const vectors = await tryEmbed(
      batch.map((r) => r.content),
      "passage"
    );
    if (!vectors) break;
    for (let j = 0; j < batch.length; j++) {
      await query("UPDATE chunks SET embedding = $2::vector, embedding_model = $3 WHERE id = $1", [
        batch[j].id,
        toVectorLiteral(vectors[j]),
        embedder.name
      ]);
    }
    done += batch.length;
  }
  return done;
}

/* ---------- search ---------- */

const STOP = new Set(
  (
    "a an the is are was were be been do does did what who whom which when where why how " +
    "about tell me you your yk's yk he his him she her they their it its of in on at to for " +
    "with and or any have has had can could would should i we our this that there 뭐 어떤 무엇 " +
    "알려줘 알려주세요 있어 있나요 있어요 대해 대해서 좀 해줘 했어 했나요 그"
  ).split(" ")
);

/** Query terms for keyword search; strips common Korean particles. */
export function terms(q: string) {
  return Array.from(
    new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}+#.]+/u)
        .map((t) => t.replace(/(은|는|이|가|을|를|에|에서|의|로|으로|와|과|도|만|이에요|예요|인가요|이랑|랑)$/u, ""))
        .map((t) => t.replace(/^[.]+|[.]+$/g, ""))
        .filter((t) => t.length >= 2 && !STOP.has(t))
    )
  ).slice(0, 12);
}

type Row = { id: string; owner_type: OwnerType; owner_id: string; title: string; content: string; s: number };

export async function search(q: string, k = 6): Promise<SearchHit[]> {
  const ts = terms(q);
  const [vector, keyword] = await Promise.all([vectorSearch(q), keywordSearch(ts)]);

  // Reciprocal rank fusion: robust without tuning score scales.
  const fused = new Map<string, { row: Row; score: number; v: boolean; kw: boolean }>();
  const add = (rows: Row[], kind: "v" | "kw") =>
    rows.forEach((row, rank) => {
      const cur = fused.get(row.id) ?? { row, score: 0, v: false, kw: false };
      cur.score += 1 / (60 + rank);
      cur[kind] = true;
      fused.set(row.id, cur);
    });
  add(vector, "v");
  add(keyword, "kw");

  return [...fused.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ row, score, v, kw }) => ({
      ownerType: row.owner_type,
      ownerId: row.owner_id,
      title: row.title,
      content: row.content,
      score: Number(score.toFixed(4)),
      via: v && kw ? "both" : v ? "vector" : "keyword"
    }));
}

async function vectorSearch(q: string): Promise<Row[]> {
  const v = await tryEmbed([q], "query");
  if (!v) return [];
  return query<Row>(
    `SELECT id, owner_type, owner_id, title, content, 1 - (embedding <=> $1::vector) AS s
     FROM chunks WHERE embedding_model = $2
     ORDER BY embedding <=> $1::vector LIMIT 10`,
    [toVectorLiteral(v[0]), embedder!.name]
  ).then((rows) => rows.filter((r) => r.s > 0.72));
}

async function keywordSearch(ts: string[]): Promise<Row[]> {
  if (ts.length === 0) return [];
  // Per term: exact substring hit = 1, otherwise fuzzy trigram similarity.
  return query<Row>(
    `SELECT c.id, c.owner_type, c.owner_id, c.title, c.content,
       (SELECT avg(GREATEST(
           CASE WHEN c.content ILIKE '%' || t || '%' OR c.title ILIKE '%' || t || '%' THEN 1 ELSE 0 END,
           word_similarity(t, c.content)))
        FROM unnest($1::text[]) t) AS s
     FROM chunks c
     ORDER BY s DESC LIMIT 10`,
    [ts]
  ).then((rows) => rows.filter((r) => r.s >= 0.34));
}
