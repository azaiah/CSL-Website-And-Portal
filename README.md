# Capital Solutions & Logistics — Website + Phase 1 Portal

Production marketing website and gated **Phase 1 lead-generation portal** for
**Capital Solutions & Logistics (CSL)** — a HIPAA-compliant medical &
pharmaceutical courier in Greater Richmond, Virginia.

- **Marketing site:** home, services hub + 5 service pages, compliance wall,
  about, careers, contact (multi-step quote form), and legal pages — with SEO,
  Open Graph, sitemap, robots, and JSON-LD LocalBusiness schema.
- **Portal (`/portal`):** a full lead-gen engine UI/UX built with **mock data**.
  The five AI agents are described and previewed, each badged
  **"Coming online — Phase 1 build."** No live AI, scraping, or external calls —
  structured so real agents drop in later without restructuring.

---

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS with CSL brand tokens
- `lucide-react` icons (no emojis anywhere), `framer-motion` animation
- No paid services required to run

---

## Quick start

```bash
npm install      # install dependencies
npm run dev      # start the dev server → http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build locally
npm run lint     # eslint
```

> Requires Node.js 18.17+ (Node 20+ recommended).

---

## Media assets (Higgsfield exports)

The site works **without** any media (it falls back to the poster image and a
navy gradient, and animates the logo for the loader). To add the finished
Higgsfield videos, drop these files into **`public/`**:

| File | Purpose | Ratio |
| ---- | ------- | ----- |
| `public/hero.mp4` | Hero background video (desktop) | 16:9 |
| `public/hero-mobile.mp4` | Hero background video (mobile) | 9:16 |
| `public/hero-poster.jpg` | Hero poster / fallback still | 16:9 |
| `public/loader.mp4` | Branded page-loader loop | 1:1 |

- The hero autoplays muted, loops, and is `playsInline`; the poster shows first.
- If `hero.mp4` is missing, the hero shows `hero-poster.jpg` (if present) over a
  navy gradient. If both are missing, the navy gradient alone still looks clean.
- If `loader.mp4` is missing, the loader animates the logo via framer-motion.

`public/logo.png` is already in place (the CSL globe + gold arrow).

---

## Project structure

```
app/
  (site)/              # marketing pages (shared header/footer)
    page.tsx           # home
    services/          # hub + 5 service pages (medical-courier is the flagship)
    compliance/  about/  careers/  contact/
    privacy/  terms/  hipaa-notice/
  portal/              # gated Phase 1 portal (own layout, noindex)
    page.tsx           # dashboard
    ai-team/  opportunities/  pipeline/
    company-brain/  weekly-report/  settings/
  layout.tsx           # root: fonts, metadata, JSON-LD, page loader
  sitemap.ts  robots.ts
components/            # UI + portal components
lib/
  company-brain.ts     # single source of truth for CSL facts (site + portal + SEO)
  agents.ts            # the 5 AI agents as typed objects
  mock/                # sample opportunities, pipeline, weekly report (clearly labeled)
  portal-context.tsx   # Phase 1 front-gate state (no real auth)
```

### Where real agents slot in later

- **`lib/agents.ts`** — typed `Agent` registry. Add implementations without
  changing the AI Team UI.
- **`lib/company-brain.ts`** — the shared knowledge base every agent reads.
- **`lib/mock/*`** — replace mock arrays with live data behind the same types
  (`Opportunity`, `PipelineCard`, `WeeklyReport`) and the pages just work.
- **Portal auth** — `lib/portal-context.tsx` is a non-secure front gate.
  Search for `TODO: replace with real auth`.
- **Form submission** — the contact and careers forms validate client-side and
  show success. Search for `TODO:` to find where to POST to email/CRM.

---

## Deploy

### Vercel (recommended for Next.js)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset auto-detects **Next.js** — no config needed. Deploy.

Or via CLI:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

### Netlify

`netlify.toml` is included and uses the official Next.js plugin.

1. Push the repo to your Git provider.
2. "Add new site" → import the repo at [app.netlify.com](https://app.netlify.com).
3. Build command `npm run build`, and the `@netlify/plugin-nextjs` plugin
   handles the rest. Deploy.

Or via CLI:

```bash
npm i -g netlify-cli
netlify deploy            # preview
netlify deploy --prod     # production
```

### Custom domain

Point `trustcsl.com` at your Vercel/Netlify project per their DNS instructions.
`lib/company-brain.ts` (`company.url`) already uses `https://trustcsl.com` for
canonical/OG/sitemap URLs — update it there if the domain changes.

---

## Notes

- **No emojis** — all icons are `lucide-react` or inline SVG.
- **Accessible & responsive** — semantic landmarks, skip link, focus rings,
  labeled controls, `prefers-reduced-motion` respected, WCAG-AA-minded contrast.
- **Honest credentials** — designations still pending are labeled "in progress";
  active/registered ones are labeled accordingly (see `lib/company-brain.ts`).
- **Legal pages** are starter content and note that CSL's counsel should review.
- The pinned Next.js version is for a reproducible Phase 1 build; run
  `npm outdated` / bump `next` when you take the site to production.

© 2023–2026 Capital Solutions & Logistics.
