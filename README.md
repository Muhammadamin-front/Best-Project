# Duodosh

Duodosh is a privacy-first Muslim mutual-support platform for sharing prayer requests, remembering others in prayer, keeping a private prayer list, and referring consented requests to verified mosques.

## What is included

- Mobile-first prayer feed with fair, low-support-first ranking
- “Duo qildim” and private save interactions
- Configurable three-support contribution gate
- Anonymous requests and mosque-referral consent
- Uzbek, English, and Russian UI structure
- Mosque, notification, profile, and privacy surfaces
- Persisted saves, comments, reports, and in-app notifications
- Editable profiles with durable city and language preferences plus live personal statistics
- Owner-controlled request resolution with automatic good-news notifications to supporters
- Protected moderator queue with audited actions
- Consent-enforced mosque referral workflow and representative dashboard
- High-risk and personal-information moderation fallback
- Cloudflare D1 schema for users, requests, moderation, notifications, and mosque referrals
- ChatGPT/Sites authentication helper for hosted protected flows
- Responsive PWA-ready interface

General chat, private messages, fundraising, paid boosting, and public religious leaderboards are deliberately outside the MVP.

## Local setup

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open the local URL printed by the development server. Local preview uses safe demo data and a local demo identity. Hosted write endpoints require platform authentication.

## Quality checks

```bash
npm run lint
npm test
```

## Database

The durable product schema lives in `db/schema.ts`. D1 is declared as `DB` in `.openai/hosting.json`. Generate SQL after changing the schema:

```bash
npm run db:generate
```

Generated migrations are stored in `drizzle/` and should be inspected before deployment.

## Architecture

- `app/components/DuodoshApp.tsx` — multilingual interactive product shell
- `app/api/requests` — authenticated request creation and fair public retrieval
- `app/api/requests/[id]/support` — unique, reversible support action
- `app/api/moderation/queue` — role-enforced safety review workflow
- `app/api/mosques/[id]/referrals` — consent and mosque-membership enforcement
- `lib/product.ts` — shared validation and deterministic safety checks
- `db/schema.ts` — relational D1 model
- `drizzle/` — generated migrations

The UI starts with realistic demo requests so the product is useful during design review without production credentials. Durable API calls are isolated behind route handlers.

## Privacy and safety decisions

- Anonymous API responses replace the author with a generic community identity.
- Public response projections do not return author email or user ID.
- A database uniqueness constraint prevents duplicate support actions.
- Emergency requests bypass the contribution gate but enter priority human moderation.
- Likely self-harm language and personally identifying numbers are not auto-published.
- Mosque referrals require explicit consent and are designed for audited access.
- Analytics must never contain request text.
- Duodosh is not an emergency, medical, counseling, or law-enforcement service.

Before a public pilot, add country-specific emergency resources, complete moderator and mosque API authorization routes, run an independent security review, and publish reviewed legal policies.

## Deployment

The project uses Vinext and the Sites Vite plugin for Cloudflare Worker-compatible output. Build locally with `npm run build`, then publish through Sites so D1 bindings and migrations can be applied by the hosting platform.
