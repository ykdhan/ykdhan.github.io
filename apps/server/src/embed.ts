import { env } from "./env.ts";

/**
 * Text embeddings for retrieval. Pluggable so the project can run for free:
 *   - "local":  multilingual-e5-small inside this process (Korean + English,
 *               ~120 MB model downloaded once on first use). No API key.
 *   - "voyage": Voyage AI API (VOYAGE_API_KEY), better quality, paid.
 *   - "none":   keyword search only.
 * If the embedder fails to load, retrieval silently falls back to keywords.
 */
export interface Embedder {
  name: string;
  embed(texts: string[], kind: "query" | "passage"): Promise<number[][]>;
}

type FeatureExtractor = (
  texts: string[],
  opts: { pooling: "mean"; normalize: boolean }
) => Promise<{ tolist(): number[][] }>;

function localEmbedder(): Embedder {
  const MODEL = "Xenova/multilingual-e5-small";
  let extractor: Promise<FeatureExtractor> | null = null;
  const load = () => {
    if (!extractor) {
      extractor = import("@huggingface/transformers").then(
        (t) =>
          t.pipeline("feature-extraction", MODEL, { dtype: "q8" }) as unknown as Promise<FeatureExtractor>
      );
      extractor.catch(() => (extractor = null));
    }
    return extractor;
  };
  return {
    name: `local:${MODEL}`,
    async embed(texts, kind) {
      const fx = await load();
      // e5 models expect these prefixes.
      const prefixed = texts.map((t) => `${kind}: ${t}`);
      const out = await fx(prefixed, { pooling: "mean", normalize: true });
      return out.tolist();
    }
  };
}

function voyageEmbedder(): Embedder {
  const MODEL = "voyage-3.5-lite";
  return {
    name: `voyage:${MODEL}`,
    async embed(texts, kind) {
      const res = await fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.voyageKey}`
        },
        body: JSON.stringify({
          input: texts,
          model: MODEL,
          input_type: kind === "query" ? "query" : "document"
        })
      });
      if (!res.ok) throw new Error(`voyage ${res.status}: ${await res.text()}`);
      const json = (await res.json()) as { data: { embedding: number[] }[] };
      return json.data.map((d) => d.embedding);
    }
  };
}

export const embedder: Embedder | null =
  env.embedder === "voyage" && env.voyageKey
    ? voyageEmbedder()
    : env.embedder === "local"
      ? localEmbedder()
      : null;

let healthy = true;

/** Embeds, or returns null when the embedder is off or broken. */
export async function tryEmbed(texts: string[], kind: "query" | "passage") {
  if (!embedder || texts.length === 0) return null;
  try {
    const vectors = await embedder.embed(texts, kind);
    if (!healthy) console.info("[embed] recovered");
    healthy = true;
    return vectors;
  } catch (err) {
    if (healthy) console.warn(`[embed] ${embedder.name} unavailable, using keyword search:`, (err as Error).message);
    healthy = false;
    return null;
  }
}

export const embedderStatus = () =>
  embedder ? `${embedder.name}${healthy ? "" : " (unavailable)"}` : "none (keyword only)";

export const toVectorLiteral = (v: number[]) => `[${v.join(",")}]`;
