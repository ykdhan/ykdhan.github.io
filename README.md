# YK — K.A.I.

Personal site of **YK (Youngkwang Han)**, rebuilt as a conversation: visitors talk
to **K.A.I.**, an AI assistant that answers from YK's own data, opens panels for
projects and skills, and forwards anything it can't answer, plus contact and
collaboration requests, to Slack.

```
apps/
  landing/   Vite + React · the one-screen site with the WebGL light core   → Vercel
  admin/     Vite + React · manage profile, entries, memory, GitHub, inbox → Vercel
  server/    Node + Hono · chat (Claude), RAG memory, Slack, admin API     → Railway
packages/
  shared/    TypeScript types shared by all three
```

## How it works

- **Chat**: `POST /api/chat` streams Server-Sent Events. Each question is matched
  against memory (hybrid search: pgvector similarity plus fuzzy keyword search),
  the hits are attached as context, and **Claude Haiku 5.5** answers. The system
  prompt (persona, profile, entry index) is prompt-cached.
- **Tools the model can call**
  - `show_panel`: project, experience, stack, or contact panel next to the answer
  - `report_unanswered`: when the data doesn't answer the question, K.A.I. says
    so and the question goes to the inbox and Slack
  - `leave_message`: contact or collaboration proposals, with name and contact,
    to the inbox and Slack
- **Memory**: entries (structured: experience, projects, skills, FAQ…), free-form
  memories, and the profile are chunked and embedded. Embeddings run in-process
  with `multilingual-e5-small` by default (free, Korean + English); Voyage AI is
  optional. If embeddings are unavailable, search falls back to keywords.
- **Closing the loop**: in the admin inbox, answering an unanswered question saves
  it as an FAQ entry, so the assistant knows it next time.
- **Core animation**: a fragment shader (domain-warped plasma, soft rays, ripples
  on syllables). The text stream is turned into a speech-like amplitude envelope
  that drives the light and the caption in sync. Optional browser TTS.

## Develop

Requirements: Node 20+, Postgres 16 with `pgvector`.

```bash
npm install
cp apps/server/.env.example apps/server/.env   # fill in the values
npm run dev:server    # http://localhost:8787  (migrates + seeds on first boot)
npm run dev:landing   # http://localhost:5173  (/?core = motion playground)
npm run dev:admin     # http://localhost:5174
```

```bash
npm run typecheck
npm run build
TEST_DATABASE_URL=postgres://… npm test -w @yk/server   # integration tests (mocked Claude + Slack)
```

## Deploy

**Server → Railway**
1. Create a project with a **pgvector** Postgres (Railway template "pgvector").
2. Add a service from this repo. In *Settings → Config-as-code*, point it to
   `apps/server/railway.json` (it builds `apps/server/Dockerfile` from the repo root).
3. Variables: `DATABASE_URL` (reference the Postgres service), `ANTHROPIC_API_KEY`,
   `SLACK_WEBHOOK_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` (`openssl rand -hex 32`),
   `CORS_ORIGINS` (the two Vercel URLs, comma separated). Optional: `GITHUB_TOKEN`,
   `EMBEDDER`, `VOYAGE_API_KEY`.
4. Optional: mount a volume at `/data` so the embedding model isn't re-downloaded on each deploy.

**Landing and admin → Vercel** (two projects, same repo)
- Root directory `apps/landing` or `apps/admin`; framework Vite (from `vercel.json`).
- Environment variable `VITE_API_URL` = the Railway service URL.

CI (`.github/workflows/ci.yml`) typechecks, builds, and runs the server tests
against a pgvector service container on every push and PR.
