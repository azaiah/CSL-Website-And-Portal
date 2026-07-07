# One-Shot Claude Code Prompt — Capital Solutions & Logistics: Full Website + Phase 1 Lead-Gen Portal

> Paste EVERYTHING below the line into Claude Code (in a fresh, empty project folder). It builds the complete marketing website **and** the Phase 1 lead-generation portal in one project. Phase 1 portal ships as a polished UI with every AI agent explained and previewed — but the AI is NOT wired up yet (clearly labeled "coming online"). Build it so the real agents drop in later without a rewrite.

---

You are building a production web app for **Capital Solutions & Logistics (CSL)** — a Richmond, Virginia medical & pharmaceutical courier. Build a complete, beautiful, fast marketing website plus a gated **Phase 1 lead-generation portal**. Work end-to-end, don't stop until it runs, and give me a test checklist at the end.

## Company facts (use as real content — no lorem ipsum)
- **Name:** Capital Solutions & Logistics ("CSL"). Site: trustcsl.com. Founded 2023.
- **What they do:** professional medical & pharmaceutical courier — HIPAA-compliant transport of medications, lab specimens, and medical supplies for pharmacies, clinical labs, hospitals, and healthcare facilities. Plus four supporting lines: Freight & Delivery, Facilities Management, Workforce Solutions, Secure Warehouse Storage.
- **Service area:** Greater Richmond, VA (currently ~25-mile radius; built to expand).
- **Positioning / promise:** "On-time, every time." Reliable, compliant, professional — a trusted extension of the client's team.
- **Tagline:** "Let's work together to deliver better care — together."
- **Contact:** Darren Lewis, Managing Member & Director of Operations · m. (917) 627-3265 · capitalsolutionslogistics@gmail.com · trustcsl.com
- **Credentials / registrations:** CAGE Code (SAM.gov), UEI, eVA registered (Virginia), USDOT / MC authority, TSA PreCheck®, TWIC®, Chesterfield PInG, SWaM (Small/Women/Minority — Virginia SBSD), Service-Disabled Veteran-Owned & Minority-Owned (label as "certified/registered" only where confirmed — otherwise "in progress").
- **Certifications / training:** HIPAA / HITECH, OSHA Bloodborne Pathogens (29 CFR 1910.1030), DOT HazMat (49 CFR 171–180), Specimen Integrity & Transportation, Exposure Control, Spill & Incident Reporting, Chemotherapy & Hazardous-Drug Safe Handling.
- **Insurance:** commercial auto liability + cargo coverage (Lloyd's of London).
- **NAICS:** 492110 (Couriers & Express Delivery), 485991 (Special-Needs / NEMT). **NIGP:** 962-86 (Transportation of Goods), 948-55 (Medical Transportation Services).

## Brand system
- Colors: deep navy `#0E2440`, navy `#16365C`, gold `#C19A3E`, light gold `#E4C97E`, light bg `#F4F6F9`, ink `#1A1F2B`, success `#1E8E5A`.
- Logo: place the provided `Van Decal Logo 1.png` (globe + gold arrow) at `public/logo.png`. Use a white/knockout version on dark sections.
- Type: clean modern sans (Inter or similar). Generous spacing, rounded cards, subtle shadows. **No emojis — use inline SVG or lucide-react icons.** Professional, healthcare-grade, trustworthy. Fully mobile-responsive and accessible (WCAG AA), fast (great Core Web Vitals).

## Tech stack
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, `lucide-react` for icons, `shadcn/ui` for components, `framer-motion` for tasteful animation.
- Deployable to **Netlify or Vercel**. No paid services required to run. Use static/mock data for the portal (no backend, no auth provider yet — see Phase 1 note).
- Include a clean `README.md` with setup, dev, build, and deploy steps.

## Media assets (Higgsfield — I will provide the files)
- **Hero video:** `public/hero.mp4` (16:9) + `public/hero-mobile.mp4` (9:16) + poster `public/hero-poster.jpg`. Autoplay, muted, loop, `playsInline`; poster shows first. Dark navy gradient overlay so headline text stays readable. If the video files are missing at build time, gracefully fall back to the poster image (and a navy gradient) so the site never looks broken.
- **Page loader:** `public/loader.mp4` (1:1, looping) OR animate the logo with framer-motion as a fallback. Show a branded full-screen loader (navy bg + the animated logo/loader) on first load, then fade into the site.

## WEBSITE — pages & real content

Build a shared responsive header (logo left; nav: Services ▾, Medical Courier, Compliance, About, Careers, Contact; a gold "Request a Pickup / Get a Quote" button; and a "Portal Login" link to `/portal`) and a footer (contact, quick links, credentials strip, legal links, © Capital Solutions & Logistics).

1. **Home (`/`)** — Full-bleed hero using `hero.mp4` with headline "Medical delivery Richmond trusts — on time, every time." subhead about HIPAA-compliant pharmacy & specimen transport, and two CTAs ("Request a Pickup" → /contact, "Our Services" → /services). Below: a trust-badges strip (HIPAA, OSHA BBP, DOT HazMat, TWIC, TSA PreCheck, SAM/CAGE, eVA, SWaM), a services overview (5 cards), a "Why CSL" section (on-time, safe & confidential, reliable, professional partnership), a service-area note (Greater Richmond), and a strong closing CTA band.
2. **Services hub (`/services`)** — overview + cards linking to each line.
3. **Medical Courier (`/services/medical-courier`)** — the flagship page. HIPAA-compliant specimen & pharmacy transport, chain-of-custody, temperature-controlled & HazMat handling, STAT/on-demand & scheduled routes, proof-of-delivery, on-time guarantee. Emphasize compliance and trust.
4. **Freight & Delivery (`/services/freight-delivery`)**, **Facilities Management (`/services/facilities-management`)**, **Workforce Solutions (`/services/workforce-solutions`)**, **Warehouse Storage (`/services/warehouse-storage`)** — one solid page each from the company facts.
5. **Compliance & Credentials (`/compliance`)** — display all credentials, certifications, insurance, and codes as a credibility wall (badge grid + explanations). This is a key sales asset.
6. **About (`/about`)** — story (founded 2023), mission, service-integrity positioning, leadership (Darren Lewis), service area.
7. **Careers / "Drive for CSL" (`/careers`)** — recruit independent-contractor drivers; short application form; note the compliance onboarding they'll complete.
8. **Contact / Request Service (`/contact`)** — smart multi-step quote/pickup request form (service type, pickup & drop-off, urgency: STAT / same-day / scheduled, contact info). Client-side validation; on submit, show success + (TODO comment) where to POST to email/CRM later. Include phone, email, hours, and a Richmond map embed.
9. **Legal:** `/privacy`, `/terms`, `/hipaa-notice` — sensible starter content with a note that CSL's counsel should review.
10. **SEO:** per-page metadata, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD LocalBusiness schema (name, area served = Richmond VA, services). Copy written keyword-smart for "medical courier Richmond VA", "HIPAA specimen transport", "pharmacy delivery Richmond".

## PHASE 1 PORTAL — `/portal` (lead-generation engine)

This is the client's product: an AI engine that finds and pursues medical-delivery contracts. **Phase 1 = build the full UI/UX with realistic mock data, and EXPLAIN each AI agent — but do NOT implement live AI, scraping, or external calls.** Every agent card shows a status badge **"Coming online — Phase 1 build"** and a clear plain-English description of what it will do. Architect the code (typed data models, a `lib/agents.ts` registry, mock data in `lib/mock/`) so real agents can be dropped in later without restructuring.

Access: for now NO real auth — put the portal behind a simple front gate (a "Sign in" screen with a non-secure "Enter portal" button, and a role selector: Owner / Admin / Viewer that only changes labels). Add a `TODO: replace with real auth` note. Keep it visually consistent with the site (navy/gold, no emojis).

Portal layout: left sidebar (Dashboard, Opportunities, Pipeline, AI Team, Company Brain, Weekly Report, Settings) + topbar with the CSL logo and the role selector.

Portal pages:
- **Dashboard** — summary cards (Open opportunities, Qualified leads, Outreach drafted, Est. contract value in pipeline), a "Phase 1 status" banner explaining the engine is being activated, and the latest weekly-report highlights. Mock numbers.
- **AI Team (`/portal/ai-team`)** — the centerpiece. A card per agent with name, one-line purpose, a "what it does in Phase 1" paragraph, the inputs it uses (the Company Brain), the output it produces, and a **"Coming online — Phase 1 build"** badge. The five agents:
  1. **Opportunity Finder** — continuously scans SAM.gov, Virginia eVA, Virginia Medicaid/DMAS (NEMT), VA medical centers & clinics, and regional hospital systems and independent labs for medical-courier / NEMT / transportation opportunities that match CSL's codes and set-asides.
  2. **Lead Qualifier** — scores every opportunity by real win-probability using CSL's advantages (SDVOSB/SWaM preference, local, HIPAA/BBP), surfaces best-fit targets, and filters out low-odds ones (in-house fleets, ambulance/ALS, national carriers).
  3. **Outreach Writer** — drafts tailored intro emails and capability-statement pitches to the right decision-makers (procurement category managers, VA transportation supervisors), ready for human approval before sending.
  4. **Application Assistant** — pre-fills vendor registrations and applications (eVA, VA Vendor ID requests, Medicaid/DMAS enrollment, SAM renewals) and generates a reusable capability statement.
  5. **Weekly Briefing** — compiles a weekly digest with key data-tracking reports: new opportunities found, top-scored leads, outreach sent & response rates, pipeline progress, upcoming deadlines, and recommended next moves.
  Also show the **Company Brain** as the shared foundation (not an agent): a secure profile of CSL's credentials & codes that every agent reads from.
- **Opportunities (`/portal/opportunities`)** — a filterable/sortable table of mock opportunities (title, source e.g. SAM.gov/eVA/DMAS, NAICS, location, due date, fit score, status) with a "sample data — engine activating" ribbon. Clicking a row opens a detail drawer (description, why-it-fits, suggested next action).
- **Pipeline (`/portal/pipeline`)** — a kanban board (Found → Qualified → Contacted → Meeting → Bid → Won/Lost) with draggable mock cards.
- **Company Brain (`/portal/company-brain`)** — a structured, editable-looking profile of CSL's credentials, codes, service area, insurance, and capability-statement content (from the company facts above). This is what powers the agents.
- **Weekly Report (`/portal/weekly-report`)** — a nicely formatted sample weekly briefing with the data-tracking sections above.
- **Settings (`/portal/settings`)** — placeholder for notifications, sources, and (future) integrations; role selector.

## Data & architecture notes
- `lib/company-brain.ts` — typed CSL profile (single source of truth for portal + used in schema/SEO where relevant).
- `lib/agents.ts` — the 5 agents as typed objects `{ id, name, purpose, phase1Description, inputs, outputs, status: 'coming-online' }`, rendered on the AI Team page and Dashboard.
- `lib/mock/` — mock opportunities, pipeline cards, weekly report. Clearly namespaced and labeled as sample data.
- Everything typed; components in `components/`; brand tokens in Tailwind config + a `globals.css`.

## Build order (pause with a short summary after each)
1. Scaffold Next.js + Tailwind + shadcn/ui + framer-motion; add brand tokens, logo, fonts, layout (header/footer), and the branded page loader.
2. Home page with hero video (+ poster fallback) and all sections.
3. Services hub + 5 service pages (Medical Courier first, richest).
4. Compliance, About, Careers, Contact (with the quote form), and legal pages.
5. SEO (metadata, OG, sitemap, robots, JSON-LD) + accessibility pass.
6. Portal shell (front gate + sidebar/topbar) and Dashboard.
7. AI Team page (agent cards + Company Brain) — this is the showcase; make it excellent.
8. Opportunities, Pipeline, Company Brain, Weekly Report, Settings (all mock data, clearly labeled).
9. README with dev/build/deploy (Netlify + Vercel) and where to drop the Higgsfield media files.
10. Final: run it, fix any errors, and give me a test checklist.

## Guardrails
- Real, specific content everywhere (use the company facts) — no placeholder lorem ipsum.
- No functional AI, scraping, or external API calls in Phase 1 — only mock data + clear "coming online" labeling. Structure so real agents slot in later.
- No emojis anywhere. Accessible, responsive, fast. Graceful fallback if media files are absent.
- Do not invent credentials CSL doesn't have; where a designation may still be pending, label it "in progress."

Start now: scaffold the project, then build in the order above, pausing after each step with a brief summary and how to test it.
