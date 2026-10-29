# FireUX priorities

Reviewed: 2026-10-29
Source baseline: `cf2413355`, with concurrent implementation preserved
Role: consolidated priority list; recommendations, not release commitments

## How to use this list

Keep one implementation task active: **Audit FireUX progress**. The cleanup
chat handles organisation only. Promote a parked item deliberately; historical
unchecked boxes are not new assignments. This file owns sequencing, while
[AGENTS.md](../../AGENTS.md), [global context](../ai/gpt-context.md), current
source and scoped contexts own implementation rules and authority.

**Current emphasis:** build and prove the pipelines. Existing real records and
domain demo data are valid test inputs; a new App or a particular venue's opening
window is not required to prove a shared mechanism. Follow the same owning
commands from input to saved result, reload and failure/retry recovery. Keep
pipeline proof distinct from that venue's operational acceptance and deployment.
Read-only demo fixtures remain read-only; any persisted test records use the
normal authorized domain commands, with clear test labels.

## Attack order

| Priority | Work | Finish line |
| --- | --- | --- |
| 1 | Accept the shared shape | Project/Kitchen Identity and the existing Apps collection chain have clear shared/domain owners, readable composition and justified differences |
| 2 | Prove the bounded behaviour | Relevant read/edit, error, scope-change and session checks pass or have explicit remaining limits; the accepted slice is reviewable |
| 3 | Define one creation contract | Codex and the FireUX App are clients of one proposed workflow, with agreed inputs, outputs, authority, step owners and recovery |
| 4 | Prove that shared path | One bounded example exercises the actual mechanics from both entrances; manual intervention and post-creation development are identified |
| 5 | Release a deliberately selected product | Its complete customer journey, access policy, hosting and operator acceptance are verified for the exact release scope |

Priorities 1–2 close the current foundation phase. Priority 3 begins only after
that acceptance. Agreeing the one-path destination does not promote its
implementation ahead of the current work. Demo cleanup and the recently
repaired reader/editing mechanics are retained evidence, not automatic new
audit projects.

## Accepted locally — 1. Bounded shared-foundation slice

**Status:** locally accepted on 2026-10-28 within the boundary and limits in the
[acceptance evidence](../reviews/shared-foundation-acceptance-2026-10-28.md).
The focused 185-test suite and both App typechecks passed. This closes the
bounded foundation phase; it does not certify every Entity or a live release.

Core owns the persistent Workspace frame and shared profile layout. Project and
Kitchen keep their domain identity editors; the two Apps indexes keep their
actual scope and SEO differences. Current maps and focused checks cover that
bounded slice. Earlier real Menu save/reload/restore and session evidence are
retained with explicit limits.

Broader naming, style and family migrations are not an implicit continuation.
Reopen this phase only for a concrete regression, rather than repeating a
platform-wide alignment audit. Git save remains separately authorized.

## Locally proved — 2. One bounded assisted Ignition path

**Status:** steps 3–4 are defined and locally proved for the curated Menu
starting-App case. The [pipeline proof](../reviews/ignition-assisted-preview-2026-10-28.md)
records both entrances, matching artifacts, native startup, authenticated Core
initialization, saved context/membership, reload and the successful native build.

The FireUX App and Codex call one preparation function. Filesystem materialization,
installation, startup and initialization remain explicit operator steps. Identical
outputs resume; stale source and developer edits are not overwritten. The
[operator entrypoint](../../projects/fireux/fireux-app/ignition/README.md) owns
current commands and constraints.

This is a real source-workspace pipeline using existing Kitchen demo data, not
proof of arbitrary industry generation or automated commercial intake. The
industry email enquiry and priced request queue retain their separate policies.
No deployment, customer ownership transfer or production privacy is accepted by
this proof. Reopen only for a concrete gap in the supported pipeline.

The later independent dog App, then separate cat App, remain parked. Do not
expand the recipe into a universal engine or build more libraries to improve
a claim beyond this bounded acceptance.

Entry points: [Ignite context](../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md),
[App intake context](../../projects/fireux/fireux-app/docs/ai/ignition-intake-context.md),
and [original delivery-path audit](../reviews/ignition-delivery-path-2026-10-28.md).

## Selected product proof — 3. Misebox Collection at Bären

**Status:** promoted as the final product acceptance target on 2026-10-28.
Use labelled test records in Restaurant Bären's existing Kitchen. Live release
remains separate from preparing and verifying the release candidate.

The [pilot checkpoint](../reviews/baeren-collection-pilot-2026-10-28.md) records
fresh customer test order #21 through its receipt, operator completion and reload,
with no duplicate and unchanged venue prices/hours. The local production policy
candidate now follows the existing trusted Kitchen command ownership. The shared queue is saved in `77faf3e16`. The [completed access review](../reviews/misebox-production-access-2026-10-29.json)
found two remaining release blockers: protected media/Storage access and raw
public Product metadata exposure. Close those boundaries next, then repeat
release checks and obtain production-access and venue/operator acceptance.
No live policy or application was deployed.

Start with one existing Collection configuration and follow the complete guest
and operator journey. Fix only the Item, Menu, Offering or fulfilment gaps that
block that bounded outcome. Preserve venue prices and hours. Delivery, Kiosk,
table/room entry, pre-order and wider capability completion remain later work.

**Finish when:** each promoted slice has current source and command checks plus
customer/operator acceptance, followed by a separately reviewed release decision.
Old browser checks and test counts do not establish today's release readiness.
Keep existing operational orders and catalogue prices outside cleanup activity.

Entry points: [Misebox context](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md),
[Menu map](../concepts/family-menu.md), and
[historical Menu capability audit](../archive/2026-10-workspace-cleanup/reviews/kitchen-menus-capability-audit-2026-09-14.md).

### Preserved Misebox Business direction

**Product decision:** keep Free and Professional (CHF 20/month) accessible to
independent, single-Kitchen owners. Retain the current Business proposal of
CHF 100/month plus CHF 20/month per Kitchen; no pricing change is authorised
by this handoff.

Business should justify its premium through useful management across multiple
Kitchens. An estate overview should show all locations, performance and what
needs attention. Discussed coordination tools include:

- sharing staff and arranging cover between restaurants;
- requesting, dispatching and receiving ingredient/stock transfers;
- publishing menus, prices and promotions to selected locations.

Estate overview plus group publishing is a suggested first slice, not an
approved implementation order. These are future product capabilities, not
claims of delivered functionality or a new active implementation task.

The user's current cycle is cleanup, source/asset assessment, then revenue
planning. Cleanup remains in progress; the assessment and revenue direction
are provisional until another cycle after cleanup. Preserve this intent for
Codex continuation and promote a bounded Business slice deliberately.

### Menu Express quick-buy pilot

**Preserved direction:** offer a one-off Menu Express purchase through the
proposed `misebox.app/products` catalogue and `/products/menu-express` page.
The buyer receives a prepared, checked, published Menu and a downloadable QR;
a Workspace or subscription is optional. Free self-service tools remain.
Source was checked at `cf2413355d1ae138d7c061a1621cc29f3ef7b59d` on 2026-10-26.

This continues the existing demand-to-tools-to-capabilities process:
[the Misebox demand brief](../../projects/misebox/misebox-app/app/search-demand.ts)
already prioritises Menu digitisation. The particular service package, price
and paid conversion still need validation. This handoff preserves the proposed
next revenue slice; finish/review the current cleanup and Git changes before
promoting implementation. It does not silently replace the active task.

**Buyer journey:**

1. Choose Menu Express; see the scope, one-off price, turnaround and hosting terms.
2. Supply restaurant name/location, email and a menu PDF/photos or source link,
   with optional correction notes. A submitted URL may need manual processing.
3. Review the order and pay. Show success only after verified payment.
4. Follow a secure order link: preparing, ready for review, then published.
5. Preview the Menu, request corrections or approve it before publication.
6. Receive the public link and downloadable QR. Offer optional access to manage
   the same Kitchen later, after verifying the appropriate authority.

**Data and onboarding:** create or reuse the appropriate Place and Kitchen
through their owning commands; retain their stable ids on the order and attach
the reviewed Menu to that Kitchen. Venue matching or purchasing alone grants no
Kitchen access. Set the linked Place currency before Menu import. The operator
needs legitimate membership, access and entitlement; the buyer need not enter
the Workspace. Collect delivery essentials first, reuse them for later
onboarding, and use purchases/requested extras as evidence for future offers.
Avoid duplicate venues and repeat setup; preserve existing records and access.

**Small delivery sequence:**

1. **Prove one manual delivery.** Rehearse authorised setup, import, correction,
   customer approval, publication and public mobile/QR access. Menu QR printing
   exists; downloadable SVG is available separately in Go QR and needs joining
   to delivery. Confirm the actual deployed environment is suitable before
   accepting customer information. No live journey or deployment was verified
   by this source review.
2. **Connect the public purchase.** Reuse Products in Misebox; persist a bounded
   customer order and menu intake, correlate verified payment, and provide
   buyer-scoped order/review access with truthful pending/failed/paid states.
   The reviewed checkout creates a Stripe session but no service order. Its
   success page announces confirmation before verification, while the session
   lookup requires service/admin access. Preserve that boundary when adding
   buyer access. Repeated callbacks or refreshes must not duplicate orders,
   Kitchens or fulfilment. Keep preparation and delivery manual initially.
3. **Run one paid pilot.** Verify purchase through approved Menu and downloadable
   QR delivery without customer Workspace entry. Record fulfilment time,
   corrections, delivery cost and feedback; automate only the next proved need.

**Offer decisions before sale:** confirm price, turnaround, hosting/update terms
and correction allowance. One Menu, one language and one correction round is a
proposed starting scope. The earlier CHF 390, CHF 29/month, two-language and
48-hour examples are not approved commitments or new subscription tiers.

**Acceptance:** one complete buyer/operator journey; protected order/source
access; no publication before approval; honest failed/pending payment states;
safe retry without duplicate records; final public link and QR work on mobile.
The product purchase is not an automatic Kitchen ownership claim. Existing
Workspace pricing and the preserved Business direction above are unchanged.

Source entry points: [Misebox configuration](../../projects/misebox/misebox-app/nuxt.config.ts),
[Products checkout](../../packages/extensions/fireux-products/src/runtime/server/api/stripe/create-checkout-session.post.ts),
[payment return page](../../packages/extensions/fireux-products/src/runtime/pages/products/success.vue),
[session authority](../../packages/extensions/fireux-products/src/runtime/server/api/stripe/checkout-session.get.ts),
[Kitchen creation](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/create-shell.ts),
[Menu import](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/source/uploads.ts),
[Menu publication](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/publish.ts),
and [QR download tool](../../projects/fireux/go-qr/app/components/GoQr/Provider/Tools/Url.vue).

## Parked ideas — no separate active tasks

| Idea | Reopen only when |
| --- | --- |
| External dog App, then separate cat App; extract only proved shared behaviour | The independent industry proof is explicitly promoted under task 2. Preserve the [pilot](../archive/2026-10-workspace-cleanup/roadmaps/dog-grooming-booking-pilot.md) and [bakery/plumbing comparison](../archive/2026-10-workspace-cleanup/roadmaps/industry-capability-stress-test.md); neither is implemented proof. |
| Neutral business loop and wider capability catalogue | A concrete consumer needs the next missing capability; avoid a second universal business framework. |
| More narrative context fields and Ecosystem editing/AI use | An actual editor or AI consumer needs them. Reuse the existing owning-document/private-User contract. |
| Cross-ecosystem account connections | A real cross-App journey needs them; follow the existing [context](../ai/account-connections-context.md). |
| Further client Apps, ecosystem expansion and Werkbox migration | A client/product outcome is deliberately selected. Refresh old billing, infrastructure and migration evidence first. |
| Bike Tours production domain, indexing and search measurement | The client approves a launch scope. Keep Ben/Interlaken Bike Tours distinct from Yellow Velo; see [client notes](../notes/interlaken-bike-client-discussions.md). |
| Service-layer article and other learning posts | Source claims are refreshed and the draft receives editorial review; see [recovered draft](../archive/2026-10-workspace-cleanup/drafts/service-layer/article.md). |
| Old audit findings, naming questions and uninitialised roots | Current source reproduces a relevant gap. Historical inventories are leads, not newly assigned jobs. |

## Maintenance

Update this list when the chosen outcome or ordering changes. Keep detailed
delivery specifications in their owner or the archive until promoted. Record
stable architecture decisions in existing contexts/maps, not this task list.
The [cleanup index](../reviews/codex-workspace-cleanup-2026-10-25.md) preserves
chat provenance and recovery information without expanding the active queue.
