# BuenoHost GPT Context

Updated: 2026-07-26
Role: living context
Scope: BuenoHost ecosystem and its property-hosting apps

This context inherits the root `AGENTS.md` and `docs/ai/gpt-context.md`.

## Purpose and scope

BuenoHost is an ecosystem, not a standalone FireUX product exception.
`packages/ecosystem/fireux-buenohost` owns its ecosystem identity, Firebase
binding, and shared ecosystem media. `projects/buenohost/buenohost-app` is the
global ecosystem app. Tenant apps such as
`projects/buenohost/book-with-nats` and
`projects/buenohost/ausfinn-apartments` belong to the same ecosystem and
select their own bounded property targets.

## Ownership boundaries

- The ecosystem package owns Firebase identity/config and shared brand assets.
- `fireux-properties` owns reusable Property models, Console surfaces, and
  property behavior.
- `fireux-reservations` owns Property-scoped reservation truth, channel
  provenance, availability presentation, and the Property Console booking
  operations. Reservations are canonical children of Property so the global
  app and branded tenant apps do not create competing stay records.
- The BuenoHost global app owns ecosystem-level public product and management
  composition.
- Tenant apps own their property-specific presentation, copy, target IDs, and
  contact/booking-channel configuration.
- Project apps do not own a competing `.firebaserc` or duplicate the ecosystem
  Firebase config.

## Authority and current sources

Use current source and guards above this document:

- Ecosystem package: `packages/ecosystem/fireux-buenohost`
- Canonical brand family:
  `packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/brand`
- Brand renderer and guard: `scripts/render-buenohost-brand-assets.mjs` and
  `scripts/guards/buenohost-brand-assets.mjs`
- Firebase project: `buenohost-ecosystem`; named identity/runtime database:
  `buenohost`
- Global app config: `projects/buenohost/buenohost-app/nuxt.config.ts`
- Tenant reference: `projects/buenohost/book-with-nats/nuxt.config.ts`
- Second tenant reference:
  `projects/buenohost/ausfinn-apartments/nuxt.config.ts`
- Property package: `packages/extensions/fireux-properties`
- Reservation package: `packages/extensions/fireux-reservations`
- App registry: `scripts/_lib/app-registry.mjs`
- Ecosystem and dependency guards:
  `scripts/guards/ecosystem.mjs` and
  `scripts/guards/dependency-ownership.mjs`
- Relevant maps: `docs/concepts/app-config.md`,
  `docs/concepts/runtime-package.md`, and `docs/concepts/layouts.md`

## Refresh and verification

When the ecosystem binding, Firebase project/database, global/tenant roles,
shared media, guarded brand projections, or Property ownership changes, refresh
this file against current source and guards. Verify the ecosystem package
shape, direct app dependencies, brand render check, Nuxt preparation/build, app
smoke routes, and the exact Firebase target before deployment.

## Living-context maintenance

Keep stable BuenoHost ownership and working conventions here. Do not add
temporary task state, apartment listings, deployment history, chat notes, or
speculative booking plans. Update repo-wide context only when the change also
alters the repository-wide contract.
