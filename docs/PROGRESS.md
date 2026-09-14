# Duodosh MVP progress

## Completed

- Product visual system and responsive application shell
- Uzbek-first copy with English and Russian language switching
- Prayer feed, filters, search, saved list, personal requests, mosque list, notifications, and profile privacy UI
- Contribution gate, emergency override, request composer, anonymous option, and mosque consent
- D1 schema and generated migration for 17 relational tables
- Server validation, deterministic risk screening, fair feed ordering, and unique support endpoint
- Browser-tested support and request-creation flows
- Build, lint, and product-rule tests
- Persisted saves, supportive comments, reports, and in-app notifications
- Role-enforced moderation queue and audited moderation actions
- Consent-enforced mosque referrals and mosque-representative actions
- Protected moderator and mosque dashboard routes
- Production feed hydration with authenticated viewer state

## Pilot follow-up

- Add administrator UI for approving mosque-verification applications and assigning representatives
- Add jurisdiction-reviewed emergency-resource directory
- Add delivery providers for email and push notifications
- Run independent security, religious-advisory, accessibility, and legal reviews
- Add full end-to-end tests against an isolated D1 database

## Product decisions

- No general chat or direct messages in the MVP because they materially expand harassment and safeguarding risk.
- No popularity ranking, paid boosts, or public worship leaderboards.
- Requests with little support receive earlier feed visibility.
- Emergency requests never rely on community prayer as a substitute for immediate professional help.
