
# EMESRT L7/L8/L9 Tracker — Netlify Package

A lightweight, serverless web app that **extracts and summarizes the latest public information** about jurisdictions implementing or guiding EMESRT Levels **L7/L8/L9** for collision avoidance / vehicle interaction controls. It exposes a JSON/CSV API via Netlify Functions and a simple UI that looks like the screenshot you provided.

## What it includes
- **Two Netlify Functions**
  - `emesrt` — on-demand API. Returns JSON or CSV. Optional caching using Netlify Blobs.
  - `refresh` — scheduled weekly job (Mon 00:00 UTC) to pre-generate and cache a snapshot and write a compact changelog.
- **Static UI** (`site/`): checkboxes for categories, `Load` + `Download CSV`, per‑jurisdiction notes and a small changelog.
- **Data logic**
  - Sources are fetched at runtime (HTTP `GET`) and normalized into a dataset with fields: `jurisdiction`, `country`, `category` (government mandate / sub‑national guidance / industry framework), `level` (7|8|9 or ranges), `year`, `vehicles` (light vehicles / mining machines / both), `doc`, `source` (URL), and `notes`.
  - A weekly scheduled run stores the dataset into Netlify **Blobs** so your site can serve the cached copy quickly.

> **Important**: This tracker does not create new legal interpretations. It extracts public, citable facts (e.g., the gazette date, that a document is a guideline, etc.) from official or reputable industry sources. Always read the source before relying on any entry.

## Deploy (GitHub → Netlify)
1. Create an empty GitHub repo and upload this folder (so repo root contains `site/`, `netlify/`, `netlify.toml`, `package.json`).
2. In Netlify: **Add new site** → **Import from GitHub** → choose your repo.
3. Build settings:
   - Publish directory: `site`
   - Functions directory: `netlify/functions`
   - Build command: _(leave empty)_
4. After deploy, check **Site → Functions**; you should see `emesrt` and `refresh`.
5. (Optional) The scheduled function runs weekly. To seed the cache immediately, open:
   - `/.netlify/functions/refresh` in your browser once.

## Endpoints
- Live JSON: `/.netlify/functions/emesrt?cached=1&mandates=1&subnational=1&frameworks=1`
- Live CSV: `/.netlify/functions/emesrt?format=csv&cached=1&mandates=1&subnational=1&frameworks=1`
- Force fresh scrape: set `cached=0` (default is `1`).
- Filter categories: pass `mandates=0|1`, `subnational=0|1`, `frameworks=0|1`.

## Local development (optional)
Netlify CLI is optional, but if you want to test functions locally:
```bash
npm i -g netlify-cli
netlify dev
```

## Notes on scope
- **Government mandates**: clear, current legal requirements (e.g., South Africa DMRE Level 9 vehicle intervention for Trackless Mobile Machinery).
- **Sub‑national guidance**: state/provincial guidance and discussion papers (e.g., Queensland QGN 27 (2024), NSW MDG 2007 (2014), NSW discussion paper (2023)).
- **Industry frameworks**: EMESRT and ICMM guides that define/organize L7/L8/L9.

Contributions welcome via pull request.
