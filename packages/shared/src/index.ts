/**
 * Types shared by landing, admin and server. Keep this file dependency-free.
 */

export type Locale = "en" | "ko";
export type L10n = Record<Locale, string>;

export interface Link {
  label: string;
  url: string;
}

/** The owner's core identity. One row, edited in the admin panel. */
export interface Profile {
  name: string;
  alias: string;
  role: L10n;
  location: L10n;
  summary: L10n;
  email: string;
  links: Link[];
  assistantName: string;
  greeting: L10n;
  suggestions: Record<Locale, string[]>;
  /** Extra instructions for the assistant (tone, things to emphasise). Never sent to visitors. */
  persona: string;
}

export type PublicProfileInfo = Omit<Profile, "persona">;

export const ENTRY_KINDS = [
  "experience",
  "project",
  "skill",
  "education",
  "award",
  "faq"
] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

/** Structured facts: shown as panels on the landing page and indexed for retrieval. */
export interface Entry {
  id: string;
  kind: EntryKind;
  slug: string;
  title: string;
  subtitle: string;
  period: string;
  body: string;
  tags: string[];
  links: Link[];
  visible: boolean;
  sort: number;
  source: "manual" | "github" | "seed";
  sourceRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt" | "source" | "sourceRef"> &
  Partial<Pick<Entry, "source" | "sourceRef">>;

/** Free-form knowledge used only for retrieval (never rendered as a panel). */
export interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: "manual" | "github" | "inbox";
  sourceRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MemoryInput = Pick<Memory, "title" | "content" | "tags"> &
  Partial<Pick<Memory, "source" | "sourceRef">>;

export type InboxType = "unanswered" | "contact" | "collaboration";

export interface InboxItem {
  id: string;
  type: InboxType;
  message: string;
  name: string | null;
  contact: string | null;
  transcript: ChatMessage[];
  status: "new" | "done";
  slackOk: boolean;
  createdAt: string;
}

/** What the landing page needs to render panels and the offline mode. */
export interface PublicData {
  profile: PublicProfileInfo;
  entries: Pick<Entry, "kind" | "slug" | "title" | "subtitle" | "period" | "body" | "tags" | "links">[];
}

/* ---------- chat ---------- */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  locale: Locale;
}

export type PanelName = "project" | "experience" | "stack" | "contact";

/** Server-sent events emitted by POST /api/chat (one JSON object per `data:` line). */
export type ChatEvent =
  | { type: "text"; delta: string }
  | { type: "panel"; panel: PanelName; slug?: string }
  | { type: "notice"; kind: "message_sent" | "question_forwarded" }
  | { type: "error"; code: "rate_limited" | "unavailable" | "bad_request"; message: string }
  | { type: "done" };

/* ---------- admin ---------- */

export interface SearchHit {
  ownerType: "entry" | "memory" | "profile";
  ownerId: string;
  title: string;
  content: string;
  score: number;
  via: "vector" | "keyword" | "both";
}

export interface UsageDay {
  day: string;
  requests: number;
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
}

export interface GithubRepo {
  fullName: string;
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  url: string;
  homepage: string | null;
  pushedAt: string;
  fork: boolean;
  imported: boolean;
}

export interface AdminStats {
  entries: number;
  memories: number;
  chunks: number;
  embeddedChunks: number;
  embedder: string;
  inboxNew: number;
  usage: UsageDay[];
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "item";
