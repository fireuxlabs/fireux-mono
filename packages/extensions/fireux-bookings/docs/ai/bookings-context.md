# FireUX Bookings context

Updated: 2026-11-06
Ref: 614700fd9
Role: living context
Scope: reusable booking lifecycle and calendar integrations

## Inheritance

This context inherits repository rules from `AGENTS.md` and
`docs/ai/gpt-context.md`. The platform ownership, runtime placement, mutation
authority, and documentation rules in those sources remain authoritative.

## Purpose and ownership

`fireux-bookings` is an optional Extension owning a provider-independent customer booking presentation, reservation-to-confirmation lifecycle, and provider integrations. `BookingsCustomerForm` owns shared customer fields and the presentation of availability, errors and confirmation; Apps provide reservation inputs through slots and own the service catalogue, schedules, prices, booking commands, and confirmation content. The component and its Docs placeholder must remain ignorant of any named business. Its provider-independent `confirmBooking` command coordinates atomic reservation, availability revalidation, external effects, confirmation and safe cleanup through consumer-owned adapters. It also owns Google Calendar OAuth refresh transport, provider requests and response validation. Its optional Business Workspace owns Business-scoped availability settings, booking records and exclusive allocation locks. These are Business-owned child records, not a universal Booking Entity. Timezone, allocation-key policy, payments, cancellation and notification remain with their named consumers.

Outside the optional Business integration, the consuming domain or App owns its records and authority. All consumers retain service-specific time-slot rules,
calendar connection lifecycle, confirmation policy, durable reconciliation and storage adapters. The shared lifecycle retains capacity after an external effect starts if completion is uncertain; consumers must resolve that held state before retrying. A FreeBusy response is a
calendar projection, not proof that a domain can accept a booking. Firestore
locks cannot atomically reserve Google Calendar time; consumers must state and
verify how external conflicts and failed event writes affect their own workflow.

## Scope and source map

- Architecture and ownership maps: `docs/concepts/fireux-mono.md`,
  `docs/concepts/runtime-package.md`, `docs/concepts/server-api.md`, and
  `docs/concepts/entities.md`. Firestore write authority is governed by
  `docs/ai/firestore-mutations-context.md` when a consumer persists records.
- Package identity, exports, and commands: `package.json`.
- Nuxt registration of `BookingsCustomerForm`, server imports, and optional `businessWorkspace` module option: `src/module.ts`; explicit native layer `src/runtime/nuxt.config.ts`.
- Shared customer form and display contracts: `src/runtime/components/Customer/Form.vue` and `src/runtime/types/customer-booking-form.ts`. The form presents customer fields and supplied view state; consumer pages own domain inputs, availability queries and booking submissions.
- Generic library preview: `packages/extensions/fireux-docs/src/runtime/pages/docs/components/bookings.vue`; its sample data must remain business-neutral. Blank's configurable simulator is `projects/fireux/fireux-blank/app/pages/sandbox/bookings.vue`.
- Business management: `src/runtime/server/business/management.ts`, `store.ts` and `targets.ts`. Settings, records and locks live beneath `businesses/{id}` and protected management reuses Business membership-bound authority.
- Schedule validation: `src/runtime/utils/availability.ts`. Revision checks reject stale operator saves and schedule changes during reservation. Existing reservations are preserved when closing days.
- Business Workspace route and focused UI: `src/runtime/pages/workspace/business/bookings.vue` and `business/components/Workspace`. Private list reads use bounded cursor pages with explicit refresh.
- Source-owned Business policy/authority tests: `src/test/business-management.test.mjs`.
- Provider-independent lifecycle: `src/runtime/server/booking.ts`, with behavioral checks in `src/test/booking.test.mjs`.
- Google Calendar request and response boundary:
  `src/runtime/server/google-calendar.ts`.
- Provider contract checks: `src/test/google-calendar.test.mjs`.
- First App Calendar adapter and private credentials boundary:
  `projects/slap/interlaken-bike-tours/server/utils/tour-calendar.ts`.
- First App booking workflow and Business-scoped storage adapter:
  `projects/slap/interlaken-bike-tours/server/utils/tour-booking.ts`,
  `tour-booking-store.ts`, and `server/api/bookings/`.
- Local provider and lifecycle sandbox: `projects/fireux/fireux-blank/app/pages/sandbox/bookings.vue`,
  `server/utils/booking-sandbox.ts`, `server/utils/booking-sandbox-calendar.ts`,
  and `test/booking-sandbox.test.mjs`. It is development-only and uses an
  in-memory fake Calendar; it is not an App domain or persistence example.
- App registration and direct dependency:
  `projects/slap/interlaken-bike-tours/app/ignition/brief.ts`,
  `projects/slap/interlaken-bike-tours/package.json`, and
  `projects/slap/interlaken-bike-tours/nuxt.config.ts`.

Property Reservation records and night locks remain in
`fireux-reservations`; Kitchen table service and order records remain in
`fireux-kitchens`; Job employment schedule terms remain in `fireux-jobs`.
Those models are not interchangeable booking records. The Business store accepts a consumer-selected exclusive allocation key; the Interlaken App uses the local date for one tour per day. New tour records are stored under the server-configured `BOOKINGS_BUSINESS_ID`, never a browser-selected owner. Calendar credentials remain server-only. Legacy global Interlaken booking records are not automatically assigned to a Business. Consumers compose the lifecycle and provider APIs while keeping their own record and command authority. Public product packaging, onboarding, commercial terms and deployment belong above the Extension. Core remains independent of this optional product.

## Authority and connection lifecycle

Google Calendar access tokens or OAuth refresh credentials and calendar ids are
supplied by server-side callers. The package can exchange a refresh token for a
short-lived access token, but never accepts credentials from a browser payload,
persists them, chooses a user/team owner, or logs provider responses. Connection
ownership may vary by App and domain; each consumer must enforce its own account,
Team, and user membership policy before requesting Calendar access.

The transport provides OAuth token refresh, FreeBusy reads and event insertion.
It does not perform OAuth consent/token storage, decide slot availability,
synchronize external edits, or remove events. Add those behaviors only at a
named owner and after a stable consumer contract exists.

## Refresh process

Refresh this context when package exports, provider capabilities, connection
authority, or the shared boundary with consuming domains changes. Inspect the
current package source, real consumers, and any affected domain records and
commands first. Keep conversation history, unconfirmed product choices, rollout
status, and speculative integration plans out of this file.

## Verification expectations

- Run `pnpm --filter fireux-bookings test` for the provider boundary.
- Run `pnpm --filter fireux-bookings build` and focused type checks after package
  changes.
- Run the consuming App's typecheck and source-owned tests when its adapter or
  registration changes.
- For shared-form changes, verify the generic Docs preview, Blank sandbox, and
  Interlaken Bike Tours customer flow compile and retain their distinct
  App-owned rules.
- Verify registration and the route-to-command path for any future UI/API
  consumer; the package build alone does not prove a booking workflow or live
  Calendar connection.
- Run `git diff --check` before handoff.

## Living-context maintenance

Keep this file pointed at current source and checks. Update it when stable
package ownership or integration contracts change, and update the repository
context only when the same boundary becomes repo-wide. Do not copy implementation
details, maintain a second package inventory, or record temporary task state.
