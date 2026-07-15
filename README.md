# YK — Portfolio

Personal portfolio of **YK (Youngkwang Han)**, an AI-native fullstack developer.
Live at **https://ykdhan.github.io**.

Dark, minimal, AI × cryptography aesthetic: fine grid, drifting aurora glows,
and decrypt-style text scrambles.
Fully bilingual (English default / 한국어) with a one-click toggle.

## Stack

- **React 18 + TypeScript** (Vite) — no animation libraries, just CSS +
  IntersectionObserver
- Plain CSS design system with custom properties
- Fonts: Space Grotesk (display) · JetBrains Mono (labels) · Pretendard (Korean)

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → ./docs
npm run preview  # preview the production build
```

## Content

Copy lives in [`src/i18n/strings.ts`](./src/i18n/strings.ts) and work/stack
data in [`src/data/experience.ts`](./src/data/experience.ts), both as
`{ en, ko }` pairs so the site stays in sync across languages.

## Contact form

The footer form posts to a Slack incoming webhook. Set `VITE_SLACK_WEBHOOK_URL`
(see [`.env.example`](./.env.example)) — locally via `.env.local`, in production
via the `SLACK_WEBHOOK_URL` repository secret used by the deploy workflow.

## SEO

- Language-aware `<title>` / meta description, `hreflang` alternates
  (`/` = en, `/?lang=ko` = ko), `robots.txt`, `sitemap.xml`
- JSON-LD (`Person` + `WebSite`) structured data
- Generated brand assets: `favicon.svg` / `favicon-32.png` /
  `apple-touch-icon.png` and the OG thumbnail `images/og.png`

## Deploy

Pushing to `master` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml),
which runs `npm ci && npm run build` and publishes `./docs` to GitHub Pages.
