# FireUX priorities

Reviewed: 2026-10-25
Source baseline: `4a06df9ef`, with concurrent Kitchen/Workspace work preserved
Role: consolidated priority list; recommendations, not release commitments

## How to use this list

Keep one implementation task active: **Audit FireUX progress**. The cleanup
chat handles organisation only. Promote a parked item deliberately when it
unblocks the current outcome or becomes the chosen next outcome; do not reopen
old chat checklists just because they contain unchecked boxes.

This roadmap owns priority and preserved intent. [AGENTS.md](../../AGENTS.md),
[global context](../ai/gpt-context.md), current source and the relevant scoped
contexts own working rules and behaviour. Historical chat claims require
fresh source verification before implementation.

## Now — 1. Finish the active shared Workspace slice

**Outcome:** familiar Identity framing, states and editing conventions across
the real reference Workspaces, with justified domain differences visible.

Continue the current Project/Kitchen comparison and existing uncommitted work.
Reuse Nuxt UI and Core fundamentals; keep Kitchen/Place facts, Project fields,
authority and commands with their domain owners. Inspect the other reference
Workspaces through representative data when needed. Sample data creation is a
separate concrete action, not already completed by this plan.

**Finish when:** the bounded comparison has explained shared versus domain
differences, selected controls and states work in the browser, affected checks
pass or have explicit existing limits, and the relevant maps match source.
Then save the accepted slice through the normal requested Git-save flow.

Entry points: [Workspace family map](../concepts/family-workspace-entity.md),
[components](../concepts/components.md), and the active chat. The
[old Identity roadmap](../archive/2026-10-workspace-cleanup/roadmaps/identity-and-workspaces.md)
is historical acceptance evidence, not a fresh implementation order.

## Next — 2. Prove one real Ignition creation journey

**Outcome:** a creator can move from a reviewed App idea and Project to a real
initialised App with a usable preview/deployment result and clear ownership.

Combine the Lovable-alternative idea, capability-library work, Nuxt UI reuse
and Bike Tours learning under this one task. Start by reconciling current
App-record creation, brief/review flow and deployment tooling. The last chat
request to build automatic creation/deployment failed before implementation;
a brief or App record is not that proof. The FireUX App manifest still names
removed root `scripts/` helpers for deployment, so revalidate that execution
path before extending it.

Bike Tours supplies a concrete branded consumer. Its next small UI improvement
was the enquiry form: reuse existing controls/states while preserving tour
questions and email/WhatsApp draft behaviour. Its historical PWA/SEO work is
completed evidence, not another open foundation project. Preserve the intended
preview `noindex` policy until a deliberate launch decision.

**Finish when:** one bounded creation journey exercises the actual framework,
documents manual steps and missing automation, handles failure/retry, verifies
its intended hosting result and makes no stronger generation claim than proved.
Agree the concrete infrastructure/release action separately before performing it.

Entry points: [Ignite context](../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md),
[FireUX intake context](../../projects/fireux/fireux-app/docs/ai/ignition-intake-context.md),
[Bike Tours brief](../../projects/slap/interlaken-bike-tours/app/ignition/brief.ts),
and [parked capability-library plan](../archive/2026-10-workspace-cleanup/roadmaps/business-capability-library.md).

## Later — 3. Resume Misebox delivery when promoted

**Status:** parked; the latest carried-forward direction paused Misebox while
the shared foundation was being clarified. This cleanup does not resume it.

Preserve the sequence: Food & drink (Items → Menus → Promotions → Services),
then one complete Collection order and Kitchen fulfilment journey; then Delivery
with assignment/handover/delivered states; then Kiosk, table/room entry and
pre-order. Existing Workspace pages, meaningful index controls, child tools and
their Free/Plus policy remain part of the eventual completion review.

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
