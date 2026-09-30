# BuenoHost GPT Context

Updated: 2026-09-11
Ref: 53fa40ee6
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
- `fireux-properties` owns reusable Property models, Workspace surfaces, and
  property behavior.
- `fireux-reservations` owns Property-scoped reservation truth, channel
  provenance, availability presentation, and the Property Workspace booking
  operations. Reservations are canonical children of Property so the global
  app and branded tenant apps do not create competing stay records.
- Reservation detail consumes the existing exact authorized live GET through
  `usePropertyReservation`; the collection reader remains for lists and summaries.
  Detail availability does not depend on the list's 500-record bound. Account,
  Property and record identity are part of the live request scope; obsolete or
  failed detail data is hidden. Verify with the Reservation-owned
  `src/test/reservation-detail.test.mjs`.
- Reservation handlers validate
  the current App membership, root management, and Property association;
  Team role labels do not grant or restrict development access. Active stays claim one
  deterministic Property-scoped night document per occupied date in the same
  transaction as Reservation creation or lifecycle changes. Date ranges are
  validated before writes for every status, including cancelled creation and
  merged updates; cancellation suppresses night allocation, not date validity.
  Verify with `fireux-reservations/src/test/reservation-command.test.mjs`.
- The BuenoHost global app owns ecosystem-level product-collection and management
  composition.
- The BuenoHost global App opens its Property Workspace at `/`; its product
  landing remains intact at `/about`. The index reads the current AppUser Property associations through the
  Property-owned Workspace index and keeps one selected Property.
- The shared `/workspace/property` entry is available to guests, matching the
  global App entry. Personal Property associations require a signed-in account;
  individual capabilities retain their own authentication requirements.
- Tenant apps own their property-specific presentation, copy, and
  contact/booking-channel configuration. Each root Property owns
  `team/{memberId}`, Team requests, Reservations, Calendar records, and protected
  support; root management plus AppUser membership and explicit Property association bound tenant targets.
  Property and Portfolio Team use the shared `name`, `user_id`, `role_ids`
  record and shared Team commands, with named domain entrypoints. Onboarding
  records the AppUser relationship atomically; index discovery does not use
  Team records or retired App-support arrays. Nuxt
  config does not pin target IDs.
- Apps that expose the Property Reservation Workspace use the shared SSR
  Functions deployment shape; static-only hosting cannot provide its trusted
  authenticated server boundary.
- A BuenoHost App declares the Property Workspace and its App policy;
  `fireux-buenohost` installs the Property and Reservation extensions required
  by that Workspace. Apps do not repeat those module selections, while direct
  App imports still require direct package dependencies.
- Project apps do not own a competing `.firebaserc` or duplicate the ecosystem
  Firebase config.
- BuenoHost Workspace surfaces consume the shared Workspace–Entity family
  proved by the Project and Kitchen siblings. Property and Portfolio packages
  retain their Entity data and actions; BuenoHost Apps compose them and must
  not introduce a parallel Workspace selection, Team, landing, or Test system.

## Authority and current sources

Use current source and available tests above this document:

- Ecosystem package: `packages/ecosystem/fireux-buenohost`
- Canonical brand family:
  `packages/ecosystem/fireux-buenohost/src/runtime/public/img/ecosystem/brand`
- Firebase project: `buenohost-ecosystem`; named identity/runtime database:
  `buenohost`
- Global app config: `projects/buenohost/buenohost-app/nuxt.config.ts`
- Tenant reference: `projects/buenohost/book-with-nats/nuxt.config.ts`
- Second tenant reference:
  `projects/buenohost/ausfinn-apartments/nuxt.config.ts`
- Property package: `packages/extensions/fireux-properties`
- Reservation package: `packages/extensions/fireux-reservations`
- Reservation command boundary:
  `packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations`
- BuenoHost development Rules target:
  `packages/ecosystem/fireux-buenohost/src/config/firebase/firestore.template.rules`
  selects the shared Core open-development fragment. The adjacent
  `rules/reservation-authority.rules` is retained inactive policy, not deployed
  privacy protection.
- Relevant maps: `docs/concepts/app-config.md`,
  `docs/concepts/runtime-package.md`, and `docs/concepts/layouts.md`

## Refresh and verification

When the ecosystem binding, Firebase project/database, global/tenant roles,
shared media, brand projections, Property ownership, Reservation authority,
or availability locking changes, refresh this file against current source.
Verify direct App dependencies, module/layer registration, brand assets,
Reservation command authority and availability locking through source review
and relevant tests, plus affected App preparation/build and route checks.
The brand renderer, guard suite, Rules renderer and release tools are removed;
there is no supported repository replacement for those rendering/release
commands. Before an authorized deployment, establish the exact Firebase target,
compile/test the intended Rules, retain the current release and source, and
read back the deployed source as required by the mutation context. The current
Rules deliberately allow public reads and writes for development; Reservation data is therefore not protected from direct clients.
Follow `docs/ai/firestore-mutations-context.md` for the shared development policy
and replace it with verified product permissions before shipping.

## Living-context maintenance

Keep stable BuenoHost ownership and working conventions here. Do not add
temporary task state, apartment listings, deployment history, chat notes, or
speculative booking plans. Update repo-wide context only when the change also
alters the repository-wide contract.
