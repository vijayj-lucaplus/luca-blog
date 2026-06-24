# LucaPlus Auto-Blog

A fully-automated, SEO-first blog for **LucaPlus** and **LucaPay** users, built with
**Next.js 16 (App Router)**, **TypeScript**, **Tailwind v4** and **MongoDB**. Posts are
written, validated, scored and published automatically by **NVIDIA NIM** (free LLMs),
on a schedule driven by an in-process **node-cron** scheduler. Includes a branded admin
dashboard, a newsletter with double opt-in, and email **campaigns** (manual, post digests,
or AI-drafted).

The theme (colours + fonts) matches the live LucaPlus brand: teal `#1CBD99`, navy `#203060`,
gold `#FEC257`, with **Montserrat** headings and **Hind** body type.

---

## Features

- **Fully automated generation** — a scheduled job picks the next topic, calls NVIDIA NIM
  (`meta/llama-3.3-70b-instruct`), validates the draft, runs a second-LLM editor score, and
  **auto-publishes** only if it passes validation *and* the quality threshold. Otherwise it is
  saved as a draft (kept out of the index).
- **Four content verticals** — invoicing & e-invoicing, B2B credit & cashflow, accounting &
  bookkeeping, small business & fintech — each with a curated topic backlog.
- **SEO** — ISR static pages, per-post metadata, canonical URLs, JSON-LD (`BlogPosting`,
  `FAQPage`, `BreadcrumbList`, `Organization`), `sitemap.xml`, `robots.txt`, RSS feed, and
  dynamic Open Graph cards via `next/og`.
- **Free images, no APIs** — deterministic on-brand SVG cover graphics generated per post
  (`/api/cover`); drop your own royalty-free photos in later if you wish.
- **Admin dashboard** (`/admin`) — stats, "Generate now", recent jobs/posts, and campaign
  management. Protected by `proxy.ts` + a signed JWT session cookie.
- **Newsletter + campaigns** — double opt-in subscribe, one-click unsubscribe with
  `List-Unsubscribe`, and campaigns that can be manual, an auto-digest of recent posts, or
  AI-drafted promos. Sends via SMTP (dry-run when SMTP is not configured).

---

## Prerequisites

- **Node.js 20+**
- **MongoDB** (local `mongodb://127.0.0.1:27017` or a connection string)
- A free **NVIDIA NIM** API key from <https://build.nvidia.com> (click *Get API Key* → `nvapi-...`)

---

## Setup

```bash
npm install
cp .env.example .env.local   # then edit values
```

Edit `.env.local`:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NVIDIA_API_KEY` | Your `nvapi-...` key (generation is skipped until set) |
| `NIM_MODEL` | Default writer model (swap to `nvidia/llama-3.1-nemotron-70b-instruct`, `qwen/qwen2.5-72b-instruct`, …) |
| `CRON_SCHEDULE` | node-cron expression for generation (default: weekdays 09:00) |
| `BLOG_AUTOPUBLISH_MIN_SCORE` | Editor score (0–100) required to auto-publish |
| `BLOG_GENERATION_ENABLED` | Kill-switch (`true`/`false`) |
| `CRON_SECRET` | Bearer secret for the external `/api/cron/generate` trigger |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login credentials |
| `SESSION_SECRET` | Secret used to sign the admin session JWT |
| `SITE_URL` | Public base URL (used for canonicals, OG, RSS) |
| `SMTP_*`, `MAIL_FROM` | Email sending (optional — dry-run if unset) |
| `CAMPAIGN_SCHEDULE` | How often to check for due scheduled campaigns |

> **Security:** `.env.local` is gitignored. Rotate `SESSION_SECRET`, `CRON_SECRET` and the
> admin password before deploying. Secrets are never hardcoded in source.

---

## Running

```bash
npm run dev      # development
npm run build    # production build
npm run start    # production server (starts the in-process scheduler)
```

The scheduler runs inside the Node server (via `src/instrumentation.ts`), so it only runs
with `npm run dev` / `npm run start` on a long-lived Node process — **not** on serverless.

---

## How auto-generation works

```
node-cron (CRON_SCHEDULE)  ─┐
external scheduler / curl ──┼─▶ generation pipeline
  POST /api/cron/generate   │     1. pick next backlog topic (skip already-published)
  (Bearer CRON_SECRET)      │     2. NVIDIA NIM writes the article (JSON, validated by Zod)
admin "Generate now" ───────┘     3. guardrail validators (length, links, disclaimer, …)
                                  4. second-LLM editor quality score
                                  5. publish if valid AND score ≥ threshold, else draft
                                  6. revalidate affected pages
```

Trigger manually from another scheduler or for testing:

```bash
curl -X POST "http://localhost:3000/api/cron/generate" -H "Authorization: Bearer $CRON_SECRET"
```

---

## Admin

Visit `/admin` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`.

- **Dashboard** — counts, last job, recent jobs/posts, and **Generate now** (optionally per category).
- **Campaigns** — create manual / digest / AI-drafted campaigns, target confirmed subscribers,
  send now or schedule. Without SMTP configured, sends are logged (dry-run).

---

## Customisation

- **Topics**: `src/config/constants.ts` → `TOPIC_BACKLOG`.
- **Product links / CTAs**: `src/config/constants.ts` → `PRODUCTS`, `ALLOWED_LINK_HOSTS`.
  > Update `PRODUCTS.lucapay.url` to the real LucaPay URL when confirmed.
- **Colours / fonts**: `src/app/globals.css` (`@theme`) and `src/app/layout.tsx` (next/font).
- **Categories**: `src/config/constants.ts` → `CATEGORIES`.

---

## Project structure

```
src/
  app/
    (public)/        home, blog, blog/[slug], category/[slug]
    admin/           login, dashboard, campaigns
    api/             cron, admin, newsletter, og, cover
    sitemap.ts · robots.ts · rss.xml/
  components/        layout, blog, common, admin
  lib/               ai (NIM), blog (pipeline/validators), email, seo, auth, scheduler, db
  models/            post, generation-job, subscriber, campaign
  services/          post, subscriber, campaign, admin data access
  config/            env (zod), constants
  proxy.ts           admin route protection (Next 16 middleware)
  instrumentation.ts starts node-cron
```

---

## Deployment notes

- Designed for a **long-lived Node server** (Docker / PM2 / a VM) so the in-process scheduler
  runs. Build with `npm run build`, serve with `npm run start`.
- If you deploy somewhere without a persistent process, disable the in-process scheduler and
  instead hit `POST /api/cron/generate` from an external scheduler (system cron, GitHub Actions)
  using the `CRON_SECRET`.

---

## Notes & disclaimers

- Generated articles are **general information only**, not financial/tax/legal advice — every
  post carries a disclaimer, and prompts forbid inventing statistics.
- The NVIDIA NIM **free tier** is prototype-grade (limited credits / ~40 req/min). For
  production volume, self-host the NIM container or use a paid endpoint, and keep generation
  cadence modest to respect search-engine content-quality policies.
