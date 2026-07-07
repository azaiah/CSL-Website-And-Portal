# START HERE — CSL Website + Phase 1 Portal build

Everything Claude Code needs is in this folder.

## Files
- **CLAUDE_CODE_ONESHOT_Website_and_Portal.md** — the one-shot build prompt. Open it, copy everything below its `---` line, and paste it into Claude Code (in this folder). It builds the full marketing website + the Phase 1 lead-gen portal (agents explained, not yet wired) in one pass.
- **HIGGSFIELD_PROMPTS.md** — prompts for the hero video + logo page-loader animation (Azaiah is generating these now).
- **logo.png** — the CSL logo. After Claude Code scaffolds the project, it goes to `public/logo.png` (the build prompt already says this).
- **media-drop-here/** — put the finished Higgsfield exports here, then move them into the project's `public/` folder.

## Steps
1. In Claude Code (this folder), paste the one-shot prompt from `CLAUDE_CODE_ONESHOT_Website_and_Portal.md`.
2. Let it scaffold and build (Next.js + Tailwind + shadcn/ui). It pauses with a summary after each step.
3. Move `logo.png` → `public/logo.png`.
4. When the Higgsfield videos finish, drop them in `public/` as:
   - `hero.mp4` (16:9), `hero-mobile.mp4` (9:16), `hero-poster.jpg`, `loader.mp4` (1:1 loop).
   The site is built to fall back gracefully if any are missing, so you can build first and add media after.
5. `npm run dev` to preview, then deploy to Netlify or Vercel (README steps included by the build).

## Notes
- Phase 1 portal = full UI + each AI agent explained and previewed with mock data, badged "Coming online." No live AI yet — structured so real agents drop in later.
- No emojis anywhere; navy `#0E2440`/`#16365C` + gold `#C19A3E`; healthcare-grade, accessible, fast.
- Portal login is a simple front gate for now; real auth is a later phase.
