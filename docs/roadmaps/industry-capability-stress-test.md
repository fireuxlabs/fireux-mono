# Industry capability model: bakery and plumbing

Reviewed: 2026-10-23
Role: hypothetical journey and source stress test, not live acceptance

## Test

Can the same opinionated Workspace and capability vocabulary support two
ordinary businesses without copying a vertical's models into another industry?
Use one bakery taking pickup orders and one plumbing firm doing booked repairs.
These are test assumptions, not operator research or promised package coverage.

| Capability | Bakery | Plumbing business | Decision |
| --- | --- | --- | --- |
| Identity | Shop identity and pickup location | Business identity and service area | Shared presentation; domain facts stay local |
| Team | Bakers and counter staff | Plumbers and dispatcher | Shared people/assignment pattern; domain permissions explicit |
| Customers | Buyer and pickup contact | Customer and visit contact | Same responsibility; distinct purpose/access rules |
| Products/services | Baked items and prices | Repair services, labour and parts | One offering concept; do not force every offering into a stock item |
| Calendar | Opening hours, preorder cutoff and pickup windows | Visit window, worker availability and expected duration | Shared date/time UI; different availability rules |
| Work | Production and pickup preparation | Assigned service visit and completion | Industry-owned operational records |
| Orders | Accepted item quantities and pickup commitment | Accepted service scope/quote | Shared agreement principles; different calculations and transitions |
| Finance | Sales value and recorded receipts | Approved quote, charges and recorded receipts | Shared money/fact primitives; not a complete invoice ledger |
| Documents | Order detail and relevant product information | Quote, customer approval and work record | Shared attachment/read controls; industry purpose and access remain local |
| Notifications | Ready for pickup | Appointment and completion notice | Shared delivery mechanism candidate; triggers and recipients domain-owned |
| Reporting | Sales, unfulfilled orders and production demand | Open work, completed visits and amounts outstanding | Shared presentation; domain metrics and fact owners differ |

## Bakery scenarios

Journey: publish an offering → customer selects quantity/pickup → server accepts
price and capacity → team prepares → mark ready → collect → record payment.

1. Two buyers request the last available quantity. Acceptance must be atomic;
   only supported capacity can be promised. Menu visibility is not stock proof.
2. The pickup cutoff passes during checkout. Revalidate server-side and preserve
   a clear rejected outcome; do not silently move the pickup time.
3. A customer retries after losing the confirmation response. Return one order,
   not duplicate production demand or receipts.
4. Cancellation before preparation releases only the appropriate commitment.
   Do not apply that rule blindly after preparation has begun.
5. Changing tomorrow's prices does not rewrite an accepted order's agreement.

Existing [Kitchen order submission](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/submission.ts)
is a source candidate for strict input, snapshots, transactional authority and
retry handling. [Operating hours](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/operating-hours.ts)
validates schedule shape; [Stations](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/station.model.ts)
defines named work areas. None of those files proves bakery stock, daily batch
capacity or timed oven allocation. Those remain explicit implementation gaps.

## Plumbing scenarios

Journey: customer describes repair → operator scopes and quotes → customer
accepts → assign available plumber → visit and record work → approve any change
→ complete → record payment.

1. Two visits overlap for one worker. No double assignment; also account for the
   operator-approved travel/buffer policy. A calendar view is not enforcement.
2. Extra work is discovered on site. Preserve the accepted quote; record and
   obtain approval for the change rather than silently raising the charge.
3. An unavailable worker is replaced. Reassign atomically and retain the history;
   cancellation of the old assignment must not free someone else's commitment.
4. A customer requests another customer's work details by ID. Deny access on
   reads and commands, not only in the screen.
5. Completion is retried. One completion and one intended financial fact; a
   recorded payment does not imply an external payment was processed.

The existing [Job model](../../packages/extensions/fireux-jobs/src/runtime/job/models/job.model.ts)
has employer, openings, contract type and compensation: it describes hiring,
not a plumbing work order. Do not rename it to manufacture reuse.
[Property reservations](../../packages/extensions/fireux-reservations/src/runtime/property/server/reservations/command.ts)
offer an atomic allocation pattern, but their Property-night units do not model
mobile staff visits. [Finance facts](../../packages/extensions/fireux-finance/src/runtime/models/financial-fact.model.ts)
provide a neutral building block; quote approval, work-order lifecycle and
invoicing require their own supported owners.

## Result

The product model survives both ordinary journeys as a design hypothesis:
Workspace, identity, people, offerings, agreement, work, money and oversight.
The existing library does not yet establish either complete journey.

The failed assumptions are useful:

- A shared capability is not a universal record schema.
- Calendar presentation is not scheduling or capacity authority.
- Team labels are not permission enforcement.
- A menu is not a stock/production commitment system.
- Hiring Jobs are not customer work orders.
- Finance primitives are not payment execution or complete accounting.

Keep the opinion in navigation, composition, lifecycle feedback and supported
creation. Keep availability, pricing, record identity and state transitions with
their domain owners. No new generic scheduling, order or work framework is
justified solely by this paper comparison.

Next implementation proof: choose one bounded journey, record the missing
owners, then test its commands, concurrency and authenticated screens. Repeat
with a materially different industry before extracting the surviving contract.
This comparison does not replace the agreed external dog/cat Ignition sequence.

## Ignition-to-launch stress test

Test the proposed managed-preview/customer-owned-production journey as well as
the business capabilities. This is a scenario review against current source,
not execution of provisioning or live booking. Infrastructure defaults below
are recommendations pending product acceptance, not existing automation.

### Ownership correction

Distinguish the industry founder operating a SaaS platform from the businesses
using that platform. The founder connects production infrastructure once for
the ecosystem. Individual salons, bakeries or plumbing firms do not ordinarily
need Firebase accounts or separate projects. Dedicated deployments are an
explicit product/isolation choice; an App identity alone does not require one.
Logical Ecosystem, App and Entity ownership remain separate from infrastructure.

| Scenario | Expected outcome | Failure exposed / required decision |
| --- | --- | --- |
| Founder has an idea but no Firebase account or domain | Prepare a brief and inspect a sample-data preview | Infrastructure must not gate discovery; managed preview provisioning is missing |
| Founder says "grooming software" | Ask whether they run one salon or sell software to many salons | Industry SaaS, one-business App and branded App are distinct offers |
| Founder knows treatments but not software features | Derive proposed capabilities and show one concrete booking-to-pickup journey for review | A list of selected capabilities is not an assembly specification |
| Founder already has Firebase with operational data | Inspect ownership and compatibility; prefer a separate agreed environment | Never adopt credentials as authority to overwrite data, Rules or existing deployments |
| One platform has twenty salon customers | Onboard each business into its authorised scope with its own team | Do not require twenty Firebase projects; exact isolation and access must be proved |
| Customer previews another business's record ID | Deny private reads and commands | Shared hosting or login never grants cross-business access |
| Founder wants to launch but has no domain | Offer the supported hosting address; add a domain separately | A custom domain should not block a technical release; brand/domain choice stays explicit |
| Founder connects production billing | Show resource owners, expected cost categories and spending controls before provisioning | No automatic billing commitment; budget alerts are not hard spend caps |
| Connection is interrupted halfway through setup | Show completed/pending resources and resume safely | Idempotent provisioning, durable progress and cleanup decisions are missing |
| Preview contains sample customers | Launch without copying sample operational data or private credentials | Environment separation and reviewed configuration promotion are required |
| Founder leaves FireUX | Retain agreed ownership and export/handover route | Source, data, infrastructure, domain and service access need explicit handover terms |

### Industry acceptance matrix

| Industry | Ordinary first journey | Concurrency/failure test | Readiness result |
| --- | --- | --- | --- |
| Dog grooming | Treatment → groomer/tub slot → confirmation → service → pickup | Two customers compete for overlapping resources; retry/expired hold cannot double book | Common operating model fits; timed multi-resource commands and complete external App remain missing |
| Bakery | Item quantity → pickup window → accepted order → prepare → collect | Last quantity and cutoff are rechecked atomically; retry never duplicates demand | Existing Kitchen submission patterns help; stock/production commitments require explicit proof |
| Plumbing | Request → quote → customer acceptance → assigned visit → completion | Worker overlap is rejected; extra work requires explicit approval; retry cannot duplicate receipt | Shared people are suitable; work-order and visit models cannot be replaced with hiring Job records |

People remain Users with profiles and business-scoped Team membership. A
professional working across businesses does not require duplicate human identity;
each membership still grants only its own scope. This agrees with the shared
Team opinion and is separate from the meaning of a hiring Job or work order.

### Current executable boundary

The [Ignition page](../../projects/fireux/fireux-app/app/pages/ignite.vue)
prepares an in-memory brief and an email draft. It has no infrastructure
connection, provisioning executor, managed preview or deployment state machine.
[Ignition contracts](../../packages/extensions/fireux-ignite/src/runtime/models/ignition.ts)
cover requirements, assembly, evidence and search policy; they do not establish
an executable infrastructure plan. The [FireUX Hosting configuration](../../projects/fireux/fireux-app/firebase.json)
demonstrates one configured Hosting/SSR deployment, not a self-service provisioner.

### Ordered response

1. Resolve creator type and product scope in the brief: industry platform or
   one-business App, actors, first journey and isolation requirements.
2. Produce a reviewed assembly proposal with existing owners, missing behavior
   and acceptance tests. Keep source/evidence separate from desired behavior.
3. Assemble one sample-data preview with explicit environment ownership, access
   and expiry; no customer infrastructure or real customer data is required.
4. Add guided production connection for the founder's agreed infrastructure,
   showing billing owner, permissions, resource plan and deployment destination.
5. Persist resumable progress, verify the full journey and isolation, then launch.
   Business onboarding reuses that platform unless dedicated deployment is agreed.

Result: the business model is coherent under these scenarios, but the complete
brief-to-preview-to-production workflow is not yet implemented. The next useful
build is a reviewed assembly proposal for the dog pilot, not a generic
"connect Firebase" screen without a provisioning and ownership contract.
