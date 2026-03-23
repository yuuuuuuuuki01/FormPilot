# FormPilot

FormPilot is an MVP for outbound-sales automation focused on:

- automated lead collection from public web sources
- website and form discovery from company URLs
- guarded form outreach with compliance and send-window checks
- reply classification and meeting scheduling handoff
- review queues and lightweight analytics for small sales teams

## Included in this scaffold

- Next.js App Router UI for collection, replies, reviews, and settings
- typed demo domain models for the MVP entities
- server-side selectors and policy logic
- minimal JSON APIs for dashboard, collection rules, and review queue data

## Not yet wired to live providers

This scaffold models the integration points for:

- Gmail sync
- Google Calendar booking
- Playwright-based form parsing and sending
- persistent multi-tenant storage

Those integrations are represented as typed workflow states and service boundaries so the next iteration can replace demo data with real providers.

## Run

```bash
npm install
npm run dev
```
