# Dog grooming booking pilot

> Archived / parked on 2026-10-25. Preserved planning and evidence; this file is not the active task list. See [current FireUX priorities](../../../roadmaps/fireux-priorities.md) before resuming work.

Reviewed: 2026-10-23
Source baseline: `95cc3aabb`
Role: proposed delivery scope and readiness backlog, not a release claim

## Outcome and boundary

A dog owner books a suitable treatment at one salon, receives a durable
confirmation, and brings the dog for a service the operator can manage through
pickup. Cancellation and rescheduling preserve correct availability.

Proposed pilot defaults require operator review before implementation:

- One salon, one location and one declared local timezone; one dog and one
  treatment per appointment. Start with a small operator-reviewed treatment list.
- Each treatment reserves one eligible groomer and one suitable tub for its full
  duration, including a configured cleanup buffer. This deliberately conservative
  allocation avoids inventing staged capacity before operator evidence exists.
- A treatment has explicit supported dog attributes, duration and price rules.
  Unsupported cases lead to a contact request, not an invented quote or booking.
- Visitors can browse without signing in. Saving a booking requires a restored,
  authenticated customer identity; customer access does not grant operator access.
- Payment happens at the salon. Show the agreed price and payment arrangement;
  online payments, deposits, refunds and accounting are outside this pilot.
- Confirmation and current status are available in the authenticated app.
  Operators handle phone contact and pickup calls manually during the pilot.
  Do not advertise SMS, email delivery or reminders as implemented.
- Pet details are scoped to this salon's booking purpose. Portable pet profiles,
  cross-salon history and cross-ecosystem account linking are deferred explicitly.

These are a bounded pilot proposal, not a replacement for the broader grooming
comparison. No operator interview, demand validation or willingness to pay is
claimed. Brand, external repository, canonical ecosystem identity, infrastructure
and pilot operator are not yet selected.

## Complete journey

| Step | Customer result | Operator/system responsibility | Acceptance |
| --- | --- | --- | --- |
| Discover | Understand the salon, treatment, suitability and payment arrangement | Publish reviewed facts and supported treatments | Unsupported dogs/treatments cannot enter instant booking |
| Describe | Enter only required contact and dog information | Validate eligibility on the server; keep private information out of public projections | Modified browser payloads cannot bypass eligibility |
| Choose | See available times in salon local time | Resolve hours, closures, skills, duration, buffer and both resources | No slot overlaps a resource commitment or closure |
| Review | See exact time, duration, price and cancellation terms | Create a short server-timed hold on both resources; snapshot reviewed policy | Hold countdown reflects server expiry; abandoned holds become reclaimable |
| Confirm | Receive one persistent appointment and reference | Atomically validate hold, authority and policy, then confirm idempotently | Retry after timeout returns the same appointment; expired holds cannot confirm |
| Manage | Reopen the booking, cancel or request a new available time | Check customer ownership; change allocations atomically | Failed reschedule preserves original booking; cancellation releases only owned capacity |
| Fulfil | Bring dog, receive pickup call and collect dog | Operator sees live agenda and records arrival, service, ready and collected | Customer sees permitted status; completed appointment remains in history |

Proposed lifecycle: `held → confirmed → arrived → in_service → ready → collected`.
`held → expired`; `confirmed → cancelled` or `no_show`. Operator refusal before
service has an explicit cancelled outcome and reason. No silent status jumps,
backdating or reopening completed bookings. A reschedule changes a confirmed
appointment with revision/conflict protection; it is not a second booking.
Future capacity remains reserved through the scheduled end/buffer; overruns must
be visible and affected bookings handled explicitly, never silently overlapped.

## Evidence ledger

Paths below are repository-relative. Existing source means a reuse candidate,
not an accepted external consumer or production-ready booking implementation.

| ID | Inspected source | What it establishes | Limit |
| --- | --- | --- | --- |
| S1 | [Industry comparison](../../../../projects/fireux/fireux-app/app/ignition/industry-comparisons.ts) | Grooming is a proposal; simultaneous resources, pet ownership, pricing and SMS are explicit gaps | No implemented grooming App |
| S2 | [Reservation model](../../../../packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts), [commands](../../../../packages/extensions/fireux-reservations/src/runtime/property/server/reservations/command.ts), [tests](../../../../packages/extensions/fireux-reservations/src/test/reservation-command.test.mjs) | Property-night transactional allocation, conflict checks, cancellation release and transaction-time authority pattern | Date-only Property model; tests use a harness, not simultaneous real database clients; no groomer/tub timed holds |
| S3 | [Reservation access](../../../../packages/extensions/fireux-reservations/src/runtime/property/server/reservations/access.ts), [module](../../../../packages/extensions/fireux-reservations/src/module.ts), [manifest](../../../../packages/extensions/fireux-reservations/package.json) | Reservation extension is coupled to Property authority and runtime | Not a generic customer booking engine; package is private |
| S4 | [Order submission](../../../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/submission.ts) | Strict input, server resolution, caller/fingerprint retry and transaction patterns | Kitchen/Menu meaning must remain there; not grooming commands |
| S5 | [Ignition contracts](../../../../packages/extensions/fireux-ignite/src/runtime/models/ignition.ts), [reconciliation](../../../../packages/extensions/fireux-ignite/src/runtime/utils/reconcile-ignition.ts), [manifest](../../../../packages/extensions/fireux-ignite/package.json) | Brief/assembly/evidence contracts and structural checks | Package is private; declared coverage is not generated or live acceptance |
| S6 | [External-build direction](../../../../projects/fireux/fireux-app/docs/ai/ignition-intake-context.md), [Ignite context](../../../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md) | Dog first, separate cat second, compare before extracting; native FireUX integration required | App identities, delivery and publication remain explicit work |
| S7 | [Independent-shaped prototype brief](../../../../projects/slap/interlaken-bike-tours/app/ignition/brief.ts), [manifest](../../../../projects/slap/interlaken-bike-tours/package.json) | Concrete brief/assembly and App checks are a useful composition reference | Still an in-workspace consumer; explicitly no booking persistence |
| S8 | [Global data/access boundary](../../../ai/gpt-context.md#data-and-mutations) | Open-development policies are distinct from production authorization; public projections omit private records | Live deployment policy was not inspected |
| S9 | [Core live-read checks](../../../../packages/core/fireux-core/src/test/live-client-read.test.mjs), [auth scope checks](../../../../packages/core/fireux-core/src/test/app-native-auth-scope.test.mjs) | Shared mechanics and existing regression entrypoints | Grooming/customer authority still needs its own proof |
| S10 | [Platform footer](../../../../packages/core/fireux-core/src/runtime/components/layouts/shared/PlatformFooter.vue), [SEO](../../../../packages/core/fireux-core/src/runtime/composables/fireux/seo/useSeo.ts), [manifest](../../../../packages/core/fireux-core/src/runtime/server/manifest.webmanifest.get.ts) | Existing shared presentation/metadata owners | Hosting, production identity and rendered acceptance remain unverified |

## Now: establish the delivery contract

All backlog items are open. Priority is dependency order, not an effort estimate.
Product owner means the human founder with the pilot operator; implementation
owner means the external dog App team unless a lower FireUX responsibility is
explicitly identified. No external App is created by this plan.

| ID | Work and owner | Evidence/status | Depends on | Completion evidence |
| --- | --- | --- | --- | --- |
| D01 | Validate pilot rules with one operator; product owner | S1, S6; needs operator evidence | — | Review real example bookings: supported dog attributes, treatment durations/prices, staff skills, hours, buffer, cancellation cutoff, no-show and overrun policy. Record unresolved facts; decline unsupported instant bookings |
| D02 | Establish external consumer and canonical App/Ecosystem/database identity; external App + FireUX package owners | S5–S7; partial foundation | D01 | Install pinned package artifacts without workspace links or monorepo aliases; verify required exports/dependencies, native layers, `defineFireuxConfig`, AppShell and clean-install prepare/typecheck/build. Record artifact versions and interventions; public package publication is a separate choice |
| D03 | Define minimal records, ownership and lifecycle; external App | S1–S4, S8; new behavior | D01 | Review salon-owned settings, customer access, private dog/contact details, immutable quote/policy snapshot, appointments and allocations. Explicitly decide record scope and retention without inventing a universal Pet/Salon schema or Tenant Entity |

## Next: implement and prove the booking journey

| ID | Work and owner | Evidence/status | Depends on | Completion evidence |
| --- | --- | --- | --- | --- |
| D04 | Treatment eligibility and quote; external App | S1, S4; new rules, reusable validation principles | D03 | Server calculates duration, buffer, currency and price from reviewed inputs; tampering fails. A changed price or duration requires renewed customer review; saved bookings retain agreed snapshots |
| D05 | Availability and atomic holds; external App | S2–S3; partial pattern, missing timed multi-resource behavior | D03–D04 | Both resources allocated together; overlap, closures, skills and buffer checked. Use server time and a bounded hold duration. Expiry is enforced by commands even if cleanup is delayed; no reliance on deletion timing. Prove concurrent contenders, exact boundaries, timezone/DST cases and reclaim vs confirm races |
| D06 | Confirm/cancel/reschedule commands; external App | S2, S4; patterns only | D05 | Idempotency key is bound to actor and payload; a retry cannot duplicate booking. Cancellation releases only owned allocations. Reschedule acquires replacement and releases old capacity atomically; conflict leaves original unchanged. Recheck authority in committing transaction; reject stale revisions |
| D07 | Customer booking composition and private booking view; external App using Core | S7, S9; shared mechanics, new journey | D04–D06 | Thin routes compose treatment/dog, slot, review and confirmation responsibilities with one workflow coordinator. Reuse native controls and Core auth/errors. Restore auth without losing valid draft; show pending/empty/conflict/error states; refresh/reconnect never exposes another customer's booking |
| D08 | Operator agenda and fulfilment; external App using Core | S1, S9; new domain behavior | D06 | Live day agenda, appointment detail and Overview summary share owned reads; permitted lifecycle transitions are audited. Cancellation, no-show, refusal, readiness and pickup are explicit. Two operator tabs see updates; stale actions fail safely; manual contact action has a clear recipient |
| D09 | Production authority and privacy; external App, security reviewer | S3, S8–S9; release gap | D02–D03, completed D06–D08 for final proof | Test unrelated customer, unrelated salon/operator, revoked membership, signed-out caller and forged IDs directly against reads/commands. Restrict database and Storage policy for chosen target; public availability reveals no contacts or dog notes. Verify deployed policy separately; development templates remain unchanged |
| D10 | Deployment and operating readiness; external App + operator | S6, S8, S10; unverified | D02, D09 | Dedicated preview/production configuration, no secrets in client, production origin/metadata, recovery and rollback exercised, sanitized errors/logs and cost limits. Preview stays noindex. Define support owner, manual contact fallback, backup/restore and retention procedure; verify actual hosted endpoints |
| D11 | Independent journey acceptance; operator + external App team | S5–S10; not yet proved | D07–D10 | Execute acceptance scenarios below on the deployed pilot, record versions/results/manual interventions and operator sign-off. Update assembly evidence only to the level actually demonstrated |

Critical sequence: D01 → D02/D03 → D04 → D05 → D06 → D07/D08 →
D09/D10 → D11. Design D09 alongside D03; do not bolt authority on after UI.

## Release acceptance scenarios

1. A customer books a supported treatment, reloads/re-authenticates, and sees the
   same confirmed appointment. An operator fulfils it through collected.
2. Two independent clients compete for overlapping groomer/tub time: only one
   succeeds, with no partial allocation. Test different start times and durations,
   not only identical slots. Use emulator/integration concurrency in addition to
   unit tests; the Property test harness alone cannot establish this invariant.
3. Hold expiry races confirmation and another claim; at most one valid claimant
   owns each resource interval. Abandonment does not permanently block capacity.
4. A lost confirmation response and repeated request return the same booking.
   Reusing the key with changed input is rejected.
5. Cancellation frees only its own future commitments; a conflicting or stale
   reschedule changes nothing. A successful reschedule moves both resources.
6. Server rejects altered price, eligibility, duration, salon, customer and status.
   A price/policy change during review requires renewed agreement.
7. Timezone display, closing boundaries, cleanup buffers and supported daylight
   transitions agree between customer, operator and server.
8. Revoked operators and unrelated customers cannot read or mutate private
   records. Availability, errors, logs and public HTML disclose no private data.
9. Live updates, network interruption, account switching and two tabs preserve
   correct authority and outcomes. Unknown completion shows recovery, not a new
   submission with an unrelated idempotency key.
10. Operator records cancellation/no-show/refusal and pickup; customer sees only
    permitted information. Service overrun has a visible manual recovery path.
11. Exercise deployment rollback and restoration of representative pilot data;
    verify the hosted app's origin, sign-in, metadata and release access policy.

## Later: evidence-dependent expansion

- D12: Separate cat App and source/behavior comparison (S6). Preserve meaningful
  treatment, eligibility, handling and resource differences. Extract only a shared
  contract proved by both external consumers; rerun both after migration.
- D13: Portable pet profile and consented cross-salon history (S1). Requires its
  own identity/disclosure design; salon-local details are not portability proof.
- D14: Automated reminders/pickup notifications (S1). Provider, consent, recipient
  policy, deduplication, retries and delivery evidence are separate work.
- D15: Deposits/online payment, multiple dogs/services, multiple locations,
  resource-stage scheduling, calendar sync and broader staff roles. Re-scope only
  after pilot evidence; none is implied by the first release.

## Review and maintenance

Planning-only composition check: external App owns new grooming behavior;
Core retains shared shell/auth/live mechanics; Property and Kitchen remain
reference patterns, not renamed grooming owners. Parent surfaces compose named
responsibilities; trusted commands retain state, allocation and authority.
Implementation must inspect current controls/consumers before selecting them.

This review inspected source and test definitions, not live databases, deployed
rules, authenticated journeys or external installs. Tests were not executed for
this prose-only plan. No stable ownership rule changes, so existing living
contexts remain applicable; broader comparison scope is preserved explicitly.
Refresh evidence links and classifications when source changes. Record pilot
execution evidence with its eventual external App, not in a new global context.
