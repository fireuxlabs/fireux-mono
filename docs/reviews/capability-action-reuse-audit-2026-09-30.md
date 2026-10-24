# Capability, action and reuse audit

Date: 2026-09-30
Baseline: b3f81af15 plus preserved uncommitted Ordering repairs.
Role: source audit and proposed repair sequence, not new architecture authority.
Owner: Misebox / FireUX Coordinator.

## Conclusion

The simple responsibility model fits the inspected systems: a surface exposes a
capability, a named action executes domain rules, and existing shared mechanics
provide transport, persistence and presentation state. There is no evidence for
a universal workflow/transition engine or identical entity file scaffolds.

Most opportunities are either better use of existing Core mechanics or moving
execution back to its actual domain owner. Share mechanics; keep authority,
business invariants and meaningful lifecycle differences explicit.

## Parallel coverage and limits

Three independent read-only partitions compared:

1. Property, Portfolio, Reservations, Marketplace, Products and Suppliers with
   BuenoHost, Bringli, Interlaken and principal Product consumers.
2. Core User/App/Project/Workspace, Project creation/Team/Test, membership,
   FireUX ecosystem/App execution, and all eight ecosystem registration consumers.
3. Blogs, Jobs, Companies, Documents, Tasks, Compliance, Finance, AI,
   Translation, Places and Go QR, with Werkbox, Granite and Sharer consumers.

Coordinator compared the current Kitchen Ordering action/publication boundaries
and reran focused shared-mechanic tests. Package inventories and representative
action chains were inspected; not every endpoint, UI, mutation branch or Core
utility was deeply audited. This is a broad cross-system source comparison,
not complete runtime/security certification. No live data/provider actions,
application edits, commits or deployments were made for this audit.

## System comparison

| System | Current shape | Benefit from alignment | Preserve |
| --- | --- | --- | --- |
| Kitchen Ordering | Named UI actions → thin API → Order execution/rules | Current local pass gives a useful reference; full isolated journey proof remains | Confirmation/payment/fulfilment and Sale invariants |
| Menu publication | Named domain command with transactional directory updates | Reference for domain-owned publication | Menu publication prerequisites and identity |
| Property/Portfolio | Domain onboarding and Team commands reuse Core mechanics | Use as comparison for other member capabilities | Parent access, capacity, guest differences |
| Reservations | Property-scoped commands and atomic night locks | Unconditional validation; authority and dependent writes in same transaction | Night allocation, cancellation and channel provenance |
| Marketplace | Thin APIs and Store/Offer/Order commands | Recheck dependent Store/Offer policy in mutation transaction | Seller/buyer authority and fulfilment |
| Products | Browser coordinates Stripe, Product and prices | Trusted recoverable create action; truthful mutation ownership | Product pricing and external Stripe lifecycle |
| Suppliers | Named item commands and shared Team primitives | Validate item values; keep UI capability readiness distinct from command existence | Product/Ingredient references, packaging and commercial terms |
| Project | Domain split across Core, ecosystem and concrete App | Choose one domain owner; migrate one capability end to end | Guest resume, membership, capacity and App-definition semantics |
| App/User | Named membership/bootstrap commands plus identity primitives | Reference for exact authority; avoid flattening different actions into CRUD | Stored self-join policy and reconciliation |
| Jobs/Companies/Places | Domain server commands with transactional checks | Useful working comparisons | Hiring capacity, Company/Place identity, external enrichment |
| Blog | Publication execution state shared; write still browser-owned | Enforce actual editorial prerequisites at publication boundary | Editorial rules differ from Menu/Product |
| Documents/Tasks/Compliance | Portfolio pages and browser mutation helpers | Repair imports; coherent action failure/retry; bounded trusted-command migration | Blob lifecycle, links, tasks and obligations are distinct |
| Finance | Money and deterministic fact primitives | Reuse existing primitives | Domain decides when financial facts are warranted |
| QR/Sharer | Shared provider transport with consumer-owned payload meaning | Keep current boundary | Sharing meaning and persistence |
| AI/Translation | Provider/generation and translation support | Candidate workload-specific improvements only | Provider authorization does not replace domain authority |

## Shared systems

### Reuse now

- **Live reads and outcomes:** Core binding and read-state precedence. Domain
  readers keep exact scope and projection. The separate record-lookup board
  already tracks adoption; do not duplicate those tasks here.
- **Team member persistence:** Core `runtime/workspace/server/team/members.ts`
  is consumed by Kitchen, Property, Portfolio, Supplier, Project and Blank.
  Member creation, duplicate linked-user checks and enrichment are shared;
  domain authority and capacity are caller-owned.
- **Publication execution state:** Core
  `runtime/composables/fireux/publishing/usePublish.ts` prevents overlapping
  submissions and exposes pending/error. Blog, Job and Product use it while
  retaining their own command and policy. This does not prove all writes safe.
- **Transactions, verified actor mechanics, IDs and audit stamps:** existing
  Core primitives; they do not decide domain eligibility or make external APIs
  part of a database transaction.
- **Finance arithmetic/fact identity:** existing Finance package reused by
  Marketplace and domain financial events.
- **Ecosystem wiring:** Core `src/config/module/ecosystem-wiring.ts` already
  serves all eight ecosystems; keep ecosystem-specific registration explicit.

### Improve an existing shared boundary

Core `runtime/workspace/server/team/roles.ts:26` hardcodes Dev/Operator
and their edit policy for six domains. Separate domain-provided role policy from
shared persistence, using two materially different real consumers to prove it.
Do not confuse organizational labels with access rights.

### Candidate later

Portfolio child authority helpers, request retry/idempotency support and external
effect compensation may become reusable. First repair a concrete action and
compare a materially different second consumer. Similar try/catch blocks or
status strings do not prove a shared contract.

### Keep domain-specific

Order payment/fulfilment, Reservation nights, Job engagement capacity, Product
Stripe provisioning, Supplier commercial terms, Blog approval, Document blob
lifecycle, Company materialization and App infrastructure definitions.

## Proposed bounded tasks

CA-01, CA-02 and CA-06 have since been authorized and locally repaired; all are in
**Review**, with verification limits below. Other tasks remain **Queued proposals
from source evidence**. No implementation was authorized by the audit alone. Findings described as race/partial-failure
risks were not reproduced against live services.

| ID | Priority | Repair and evidence | Acceptance |
| --- | --- | --- | --- |
| CA-01 | First: broken composition | Portfolio Tasks/Compliance/Documents pages import paths missing the current `operations` segment; Document linker imports old Task paths. See Tasks `pages/workspace/portfolio/tasks.vue:147`, Compliance `.../compliance.vue:105`, Documents `.../documents.vue:182`, Document `linkDocumentToEntity.ts:8`. | Update actual consumers directly; no aliases; Granite prepare/typecheck and page loading prove all three capabilities resolve. |
| CA-02 | Correctness | Reservation `property/server/operations/reservations/command.ts:26,76` only calls date-range validation for active statuses. Cancelled invalid ranges can reach persistence before canonical response validation fails. | Validate merged record before writes regardless of status; cancelled invalid create/update tests prove zero writes; occupancy remains status-dependent. |
| CA-03 | Correctness | Reservation `access.ts:25` authorizes separately from mutation; Marketplace `marketplace-store/server/stores/commands.ts:87–105` dependent Offer/Store checks precede mutation transaction. | Recheck mutable authority/invariants in write transaction; test revocation/concurrent Offer changes, not only happy-path status tables. |
| CA-04 | Correctness | Supplier `supplier/server/operations/items/item.ts:47–59` checks allowed keys but returns unchecked values. | Domain validation rejects invalid costs, quantities, currencies and availability; references remain transactionally checked. |
| CA-05 | Honest results | Core Team `members.ts:76–110` skips linked-user name writes but returns all requested updates; Project update reports requested name. | Preserve User-owned identity; explicit unchanged/rejected result; unlinked rename still applies. |
| CA-06 | Shared boundary | Core Team role catalogue/policy is hardcoded in shared executor. | Two domain owners provide explicit policy; Core contains no domain branches; existing supported behavior preserved. |
| CA-07 | Recoverable action | Document page uploads blob then metadata; linker creates link then optional Task independently. | Separate named upload and link actions; defined compensation/resume, deterministic retry, exact Portfolio ownership; injected failures after each effect. |
| CA-08 | Recoverable action | Product `useProductCreate.ts:219–255` provisions Stripe then Product/prices; Product publication writes from browser. Core target declaration alone does not enforce a server path. | Named trusted create action with atomic local writes and bounded external retry/recovery; preserve existing product/payment behaviour. |
| CA-09 | Ownership decision | Core Project UI/model/CRUD, FireUX ecosystem intent and concrete App server commands split one domain. | Select durable Project owner before movement; migrate creation as one cutover with registration/tests; no new Workspace owner/framework. |
| CA-10 | Remove redundant path | Core `project/composables/workspace/useProjectWorkspace.ts:9–19` constructs primitive creation alongside trusted creation; no `crud.create/delete` consumer found in scoped search. | Confirm all consumers, remove unconsumed aggregate entries; retain supported creation/guest/capacity behaviour. |
| CA-11 | Domain authority migration | Portfolio child browser writes use reactive write gates; Blog approval is checked in creation UI, not publication write. | One capability at a time: exact server-owned authority/fields/storage scope/publication rules; preserve accepted development policy, no unsolicited Rules rollout. |

Task naming is for coordination only, not a new runtime registry. Correctness
repairs precede extraction. CA-09 needs an ownership decision; do not move the
whole Project family speculatively. Bären release relevance still governs which
non-blocking work is scheduled.

## Evidence and verification

Coordinator ran these existing tests on this checkout:

`node --test packages/core/fireux-core/src/test/publishing.test.mjs packages/core/fireux-core/src/test/workspace-team-members.test.mjs packages/core/fireux-core/src/test/read-outcome.test.mjs`

Result: **14/14 passed**. These demonstrate named shared contracts with test
doubles/source-owned checks, not all consumer authority or live integration.
Parallel reviewers inspected relevant tests but did not execute additional suites.

Important source anchors (prefixes are repository-relative):

- Property/Portfolio/Supplier Team: respective `server/team/create.ts` and Core
  `server/utils/workspace-team/members.ts`.
- Reservation validation: `packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations/{command,records,access}.ts`.
- Project creation: Core `project/components/Workspace/Home/CreateForm.vue` →
  `useProjectWorkspaceCreate.ts` → FireUX App `server/project/index/create.ts`.
- App membership: Core `server/api/internal/app/membership.post.ts` →
  `app/server/app-user/command.ts`.
- Portfolio links: `packages/extensions/fireux-documents/src/runtime/portfolio/utils/documents/linkDocumentToEntity.ts`.
- Kitchen baseline: `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/actions.ts`.

## Documentation discrepancies to reconcile with their owners

- `docs/ai/firestore-mutations-context.md` says Test and simulation storage are
  retired; current FireUX App `server/project/test/{create,update,delete,read}.ts`
  and live Project Test routes contradict the blanket Test claim. Narrow it to
  the actually retired family rather than deleting current functionality.
- `family-workspace-entity.md` still references removed scaffold guards.
  Current global guidance explicitly retires the former scripts guard suite.
- Earlier record audit also records a removed guard reference in server-api.md.

These are reported here; durable contexts were not rewritten during the audit.


## CA-01 / CA-02 implementation — 2026-09-30

Both requested repairs are in **Review**, uncommitted. All pre-existing Ordering
and lookup work was preserved. No other CA repair was started.

### CA-01 — Portfolio imports

17 import references repaired directly in four files:

- `packages/extensions/fireux-tasks/src/runtime/pages/workspace/portfolio/tasks.vue`
- `packages/extensions/fireux-compliance/src/runtime/pages/workspace/portfolio/compliance.vue`
- `packages/extensions/fireux-documents/src/runtime/pages/workspace/portfolio/documents.vue`
- `packages/extensions/fireux-documents/src/runtime/portfolio/utils/documents/linkDocumentToEntity.ts`

Mutation/presentation helpers now resolve to their existing
`portfolio/composables/workspace/operations/<Capability>` owners. The Task and
Compliance collection readers instead resolve to their actual direct
`portfolio/composables/usePortfolio*Collection.ts` sources. No aliases, moves,
registration changes or directory redesign. All 38 Portfolio composable imports
across these three extensions resolve to existing source files; targeted search
finds no remaining old workspace/Tasks, workspace/Documents or
workspace/Compliance imports in packages/projects.

Granite `nuxi prepare` passes. Typechecks finish with no missing-import TS2307
errors, but remain non-green: Documents 5, Tasks 4, Compliance 4, Granite 52.
The four shared failures are in unchanged Properties useActivePortfolio.ts:
missing PortfolioWorkspaceEntity export and obsolete portfolios/selection/runtime
properties. Documents additionally lacks required portfolio_id in its create
form payload. Granite also has existing Core/UI typing failures. Logs:
`/private/tmp/ca01-{documents,tasks,compliance,granite}-types.log`.

Read-only browser verification at localhost:3007 loaded tasks, compliance and
documents routes. Each displays the existing fireux-properties placeholder
("tools are coming next"), rather than the extension-owned implementation.
Source is `fireux-properties/src/runtime/pages/workspace/portfolio/{tasks,compliance,documents}.vue`;
Granite installs all three capability extensions, which supply competing paths.
Therefore browser loading does not verify functional capability composition.
This route/Portfolio dependency conflict remains outside the requested direct
import repair; no authority or route precedence was silently changed.

### CA-02 — Reservation date validity before persistence

Changed `packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations/command.ts`:
create validates the complete input date range before opening its transaction;
update validates merged existing+patch dates before writes. Both reuse existing
occupiedDates validation (valid ordered dates, maximum 366 nights). Allocating,
checking and releasing occupied-night locks remains status-dependent. Existing
authority, routes, response shapes and payment fields are unchanged.

Added `packages/extensions/fireux-reservations/src/test/reservation-command.test.mjs`.
7 new command tests plus 3 existing detail tests pass (10/10). They execute actual
command/record/date code with an isolated in-memory transaction double: cancelled
reversed/equal/overlong creation and merged update reject with zero write calls;
valid cancelled create/update allocate no nights; cancellation releases only owned
locks; reactivation respects conflicts; active date edits replace locks and
conflicting creation writes nothing. This is not emulator or live concurrency
proof. Reservation package vue-tsc passes (`/private/tmp/ca02-reservation-types.log`).
BuenoHost context now records the unconditional validation/status-dependent lock
boundary. Existing Portfolio context ownership remains accurate; no new context
was needed for import spelling fixes.

`git diff --check` passes. No commits, pushes, Rules changes, deployments, live
Reservation/Order writes or payments. CA-01's full functional UI acceptance remains
limited by the separate placeholder-route and Portfolio API conflicts above.


## CA-06 implementation — explicit domain Team-role policy

State: Review. Core retains catalogue assembly, custom-role persistence,
fixed-role rename enforcement, duplicate-name validation, assignment validation
and current 100-role / 200-member / 20-assignment / 80-character bounds.
A required TeamRolePolicy replaces the unused actor-id argument: fixedRoles and
fixedRoleRenameMessage are authored by the calling domain, never request input.
Core no longer contains Dev/Operator IDs or copy. All six callers migrated
in the same patch; no old signature wrapper remains.

Source files:
- Core `runtime/workspace/server/team/roles.ts`
- Kitchen `kitchen/server/team/roles.ts`
- Supplier `supplier/server/team/roles.ts`
- Property and Portfolio `<entity>/server/team/roles.ts`
- FireUX App `server/project/team/roles.ts`
- Blank App `server/utils/blank/team/roles.ts`

Policies remain adjacent to each real caller; no extra policy-file scaffold,
domain branch, registry or workflow category. Kitchen (hospitality operations)
and Property (stays/night occupancy) are materially different consumers, but
both currently have the identical organizational role policy. No differing
product policy was invented to justify a wider abstraction. All six retain
fixed IDs dev/operator, labels Dev/Operator, exact rename message and assignability.
Custom IDs/names, role_ids-only member writes, authority calls and their placement,
capacity and database targets are unchanged. Project ownership is not migrated.

Core `team-role-policy.test.mjs` executes all six actual owner functions with
isolated transaction/authority doubles and actual shared mechanics. Each checks
fixed-role precedence over stored labels, rename rejection, duplicate names,
custom create/rename, deduplicated assignments, foreign/non-string/oversized role
sets, missing members, untouched member identity and denied domain access before
writes. A clearly synthetic policy verifies Core does not silently insert Dev;
it is not a new production role. Existing role persistence/member capacity tests
remain intact. Focused tests: 12/12 pass (`/private/tmp/ca06-team-tests.log`).
Broader Team suite: 20/21 pass (`/private/tmp/ca06-all-team-tests.log`); unchanged
team-dialog-intent.test.mjs fails with ReferenceError: watch is not defined in
its existing Vue test harness. Neither that test nor its component was edited.

Stable boundary documented in family-workspace-entity.md. No Rules, live data,
UI roles, role permissions, deployment, commit or push changes. Prior uncommitted
Ordering, lookup and CA-01/CA-02 work is preserved.

CA-06 final check: targeted TypeScript compilation of Core roles plus all six
domain role callers and their transitive imports passes
(`/private/tmp/ca06-types.log`, temporary config `/private/tmp/ca06-tsconfig.json`).
An additional limit regression test covers 100 stored roles, 200 members and
80-character names without writes; focused total is 12/12. The broader 20/21
result above predates this additional passing test and is not a full-suite green
claim. `git diff --check` passes. No connected database writes were needed.

## Coordinator review of the shared checkout — 2026-09-30

Baseline remains `b3f81af15`; the focused record-reader repairs are already in
that commit, not a new uncommitted reader migration. Reviewed the outstanding
Order API-to-action extraction, customer/operator request-scope guards,
Reservation validation, six Team-role callers and Portfolio import repairs.
The extraction preserves the existing transaction and post-commit notification
behavior. No new blocking defect identified in this bounded diff review.
This is not a repository-wide correctness or live-journey certification.

Fresh checks on this checkout:
- `pnpm --filter fireux-kitchens test:commerce`: 144/144 passed.
- `pnpm --filter fireux-kitchens check:commerce`: passed.
- Core `team-roles`, `team-role-policy`, `workspace-team-members` plus Reservation
  `reservation-command` Node tests: 19/19 passed.
- `git diff --check`: passed.

Remaining limits are unchanged: Portfolio placeholder route collisions and
existing Portfolio typing failures prevent full capability acceptance; the
previous broader Team harness failure is outside these focused checks. The
connected Bären confirmation/payment-choice/preparation/completion/Sale journey
and physical printing remain unproved by these tests. Notification failure
recovery is not durable merely because execution now has one owner.

The bounded repairs are ready for Daniel's review, not committed, pushed or
deployed by this pass. FireUX Patterns content is owned by its separate chat
and excluded from this review. Next delivery step is the labelled Bären order
lifecycle proof; unrelated architectural repairs stay queued.
