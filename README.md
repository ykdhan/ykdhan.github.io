# YK — Portfolio

Personal portfolio of **Youngkwang Han (YK)**, a fullstack developer.
Live at **https://ykdhan.github.io**.

A back-alley / zine–inspired single page: gritty concrete textures, film grain,
neon accents, condensed poster typography, and a wall of work pinned up like
flyers. Fully bilingual (한국어 / English), buttery momentum scrolling, and
responsive down to mobile.

## Stack

- **React 18 + TypeScript** (Vite)
- **Framer Motion** — scroll-reveal, staggered & masked text animations
- **Lenis** — smooth momentum scrolling
- Plain CSS design system (no UI framework) with CSS custom properties
- Fonts: Anton (display) · Space Mono (labels) · Pretendard (body / Korean)

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → ./docs
npm run preview  # preview the production build
```

## Content

All copy and project data live in [`DATA.json`](./DATA.json) as `{ ko, en }`
pairs, so the whole site stays in sync across both languages from one source.
Images and videos are served from [`public/`](./public).

## Deploy

Pushing to `master` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml),
which runs `npm ci && npm run build` and publishes `./docs` to GitHub Pages.
