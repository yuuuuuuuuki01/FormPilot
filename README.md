# FormPilot

FormPilot is an MVP for outbound-sales automation focused on:

- automated lead collection from public web sources
- website and form discovery from company URLs
- guarded form outreach with compliance and send-window checks
- reply classification and meeting scheduling handoff
- review queues and lightweight analytics for small sales teams

## Included in this scaffold

- Next.js App Router UI for collection, replies, reviews, and settings
- typed MVP domain models for the MVP entities
- file-backed application state in `data/formpilot-state.json`
- server-side selectors and policy logic
- company collection -> website scan -> form discovery flow with review queue branching
- JSON APIs for dashboard, collection rules, company scan, review queue, and send policy updates

## Not yet wired to live providers

This scaffold models the integration points for:

- Gmail sync
- Google Calendar booking
- Playwright-based form parsing and sending
- persistent multi-tenant storage

Those integrations are represented as typed workflow states and service boundaries so the next iteration can replace demo data with real providers.

## Current mutable APIs

- `GET/POST /api/collection-rules`
- `GET /api/dashboard`
- `POST /api/companies/:id/scan`
- `GET /api/reviews`
- `PATCH /api/reviews/:id`
- `GET/PATCH /api/settings`

## Run

```bash
npm install
npm run dev
```

## GitHub Pages

Static demo files live in `docs/` and are deployed by `.github/workflows/deploy-pages.yml`.

This Pages build is a browser-only demo:

- no server API execution
- no file-backed persistence
- edits are stored in browser `localStorage`
- collected companies can be rescanned in-browser to simulate form discovery outcomes
