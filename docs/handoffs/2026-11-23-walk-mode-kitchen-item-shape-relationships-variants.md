# Walking-mode handoff — Kitchen Item contract, relationships, variants and allergens

Date: 2026-11-23
Project: FireUX / Misebox
Status: **Architecture direction for Codex review; no migration or broad implementation authorised**
Priority: **Items are next now**. The user explicitly reprioritised from finishing the entire cross-Workspace Identity programme before Items. Preserve the Identity handoffs, but do not make them a blocker for this focused Item design/audit.

## Intent established in the walking conversation

We are designing the **target** system, not making permanent concessions for old Firestore shapes. Migration will be planned and verified separately. Keep it simple: one authoritative owner for each fact and no redundant relationships.

Use the domain term **Kitchen Item** (a Kitchen-owned record), not **Product** (a separate commerce/payment vocabulary) or **Menu Item** (which suggests ownership by the Menu). An Item exists even if not placed on a Menu. Avoid coupling the culinary model to Stripe products/prices.

### Ownership and relationships — accepted direction

- **Kitchen owns Items and Menus** as independent child capabilities.
- **Item owns its identity, food/drink kind and ordinary selling terms**. It need not have a price or any Menu placement to exist. Its canonical identity includes a stable ID, name, optional description/image and provenance.
- **Menu owns Sections**, and **Section owns MenuEntry placements**. A placement references an Item ID; it controls the local ordering and active/archived state. An Item may appear on multiple Menus and has **no menuIds reverse array**.
- **MenuEntry is not merely an array element or copied Item**. Keep the existing scoped entry shape and guard cross-Kitchen references. Removing a placement never removes the Item.
- **ItemOffer is the Item's normal selling contract**, not a separate independent offer document and not a Menu-owned price. It may be a separate TypeScript composition/projection, but the authoritative default selling fields belong to the same Kitchen Item record.
- **Promotion** owns explicitly promotional terms and may override the normal offer. **Services** own Menu access/eligibility/fulfilment. Neither owns Item identity or default pricing.
- Reverse usage lookup for deletion or operator display is allowed as a derived query across Menu and Promotion references; it is **not** a persisted reverse relationship on Item. Keep deletion reference guards.

### Variants and choices — accepted experience, exact schema to review

One Margherita Pizza Item with Size choices (12-inch CHF 18, 16-inch CHF 25), not two duplicate Items and not an explosion of WooCommerce-style variant combinations. A size group requires one choice with each option carrying its complete selling price (`pricing: 'full'`). Optional extras, e.g. mozzarella, can form an independent additional-charge group (`pricing: 'additional'`). Reuse/refine existing `ItemChoiceGroup` with stable option IDs, selection `min/max`, and validation. Keep the customer selection in order/request state, not on the Item.

Design the smallest intuitive authoring interface for a restaurant: create Item, add Size choices, optional Extras, set prices. Do not generate combinatorial SKU/product records or matrix editors. Preserve standalone base-price Items and zero-priced choices where valid. Define a consistent rule for an optional base price when full-price size choices exist; do not infer or silently reinterpret it.

**Currency**: existing `ItemOffer` has no denomination; `docs/concepts/family-menu.md#item-offer-denomination` already calls for explicit `currency_code` on priced Item terms, covering base and choices. Do not assume linked Place currency is authoritative, or re-label historical bare amounts from a newly selected default. Audit the approved denomination direction and plan separately.

### Food/drink kind and allergens — direction, not completed design

The user correctly distinguished the Kitchen Item record from a generic Item: it may be **food** or **drink**. Legacy reader code already recognises `item_kind`, but the clean canonical `Item` type currently does not. Propose one simple explicit kind contract aligned with the current Food & Drinks UI. Do not conflate kind with Menu Section, imported category or Ingredient taxonomy.

Food-specific **allergens/dietary details** are a desired extension. A base pizza may contain wheat and milk, but a gluten-free base or added topping may change the final allergen information. Audit the existing Ingredient, Recipe, Prep and Item relationships first; determine the authoritative and editable source, and whether variant options can affect a reviewed final declaration. Do not copy an unverified Ingredient-derived inference directly to public food-safety statements. Keep public declarations accurate per selectable configuration. The conversation **did not** settle an allergen storage schema or whether composition can reliably calculate them; return options and minimal recommendation for review.

### Current repo evidence to reconcile

- `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts`: currently root `Item` with `id`, `name`, optional `description`, `image`, `created`, `updated`. `ItemStorage` currently declares `kitchens/{kitchenId}/items/{dishId}`.
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/items/item-offer.ts`: `ItemOffer` holds optional `price` and `choice_groups`, but is located under a path that suggests Menu ownership. It is Item-owned selling data.
- `packages/extensions/fireux-kitchens/src/runtime/menu/records/sections/entry.ts`: `MenuEntry` stores scoped placement with `dish_id` or `promotion_id`, `sort_order`, and `status`. Keep that relationship shape; consider any naming change only as part of a reviewed cutover.
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item.ts`: historical collection presentation combines Item with pricing, kind, flagship, groups, prep references and legacy conversion; **this is not a canonical schema**.
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-pricing.ts`: still handles historical `price_options` and `add_ons` alongside `choice_groups`. These should not become permanent parallel canonical systems.
- `docs/concepts/family-menu.md`, `docs/reviews/2026-11-22-kitchen-items-architecture.md`, and `docs/handoffs/2026-11-23-kitchen-items-lifecycle.md`: some guidance/verification still says persisted `dishes`, while new `ItemStorage` declares `items`; **inspect current runtime readers/writers, deployed paths and migration evidence before choosing a physical cutover**. Do not equate a TS declared path to completed migration.
- Separate Item and Menu routing/module registration has already been tested. Do not regress the Items-only Kitchen flow, optional Place independence, grant checks, or Menu reference protections.

## What Codex should do at sit-down

1. **Read the latest local working tree and the related handoffs**, identify any drift from GitHub, and protect concurrently edited files. Note the shifted priority: focused Items audit now; Identity cleanup remains queued independently.
2. Produce a tight dependency/ownership map: Kitchen → Item (+ ItemOffer selling terms); Menu → Section → MenuEntry → Item reference; Services → Menu; Promotions → Item terms. Distinguish canonical TS shape, persisted Firestore document, read projections and editor UI.
3. Propose the smallest final **Kitchen Item** type/composition, including optional base selling terms, choice-group variants and food/drink kind, and a minimal migration plan from legacy pricing/kind paths. State which data stays on the Item document versus referenced owners; **no new offer collection, duplicate Item-per-size, or menuIds**.
4. Explicitly list unsettled decisions requiring review: exact kind field/name, whole Item composition/type naming, price defaults with full-price choices, currency adoption for historical prices, allergen authority/variant impact, and physical `items` vs `dishes` storage cutover.
5. Recommend a simple Workspace Item editing flow and small tests: standalone/unpriced Item; one Item in two Menus; remove one placement; two full-price sizes; optional extra; invalid choices; forbidden access; referenced-Item delete guard; variant-dependent allergen safety once the authority is approved.
6. **Audit and proposal first**. Do not rewrite the Menu family, migrate/deploy Firestore, change stored currency, or introduce broad backwards-compatibility glue. After explicit target approval, implement narrow checkpoints and run focused contract, permission and consumer tests; commit/push via normal Git save and report SHA.

## Other 23 Nov walking handoffs

- `2026-11-23-walk-mode-workspace-identity-boundaries.md`: shared Workspace experience, domain-owned identity, no permanent legacy fallbacks.
- `2026-11-23-walk-mode-workspace-identity-common-contract.md`: potential shared typed Identity interface, domain deltas, deliberate public/private context.
- `2026-11-23-workspace-entity-theme-audit.md`: entity Theme proposal, audit only; avoid a second theme system or theming whole Workspace.
- `2026-11-23-workspace-identity-location-contact-decision.md`: proposed Profile/Brand/Location/Publication navigation, Place-preferred display resolution, no universal required Place shape.

These are distinct handoffs with differing statuses. **Do not treat unimplemented proposals as approved schema migrations.**

## Stage 1 checkpoint

The [canonical Item model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts)
now includes the Item's kind, price, currency and choice groups. One Item read
supplies identity and selling terms. New priced writes require explicit currency.
Full-price groups persist the option prices and derive the starting price.
Existing unpriced and historical records remain readable without a data rewrite.

The isolated named Misebox emulator passed Item create, list, edit, reopen and
delete with Menu, Services, Orders and Tables unregistered. Unauthorized reads,
updates and deletes returned 403. The Margherita's CHF 18 and CHF 24 sizes and
CHF 2.50 extra round-tripped without a separate base price. Focused tests, the
Item TypeScript check, lint and full Misebox preparation passed. The wider
Kitchen contracts check reproduced its 23 baseline diagnostics.

Stage 2 still owns the Menu reference, route and Rules cutover and any eventual
stored-reference migration. Menu publication and ordering still use their
existing currency resolution. Historical denomination and allergen design
remain open. Stage 1 made no live writes or storage-path changes.

## Stage 2 checkpoint and migration plan

Stage 1 is published as [`426219c59`](https://github.com/fireuxlabs/fireux-mono/commit/426219c594d7ca14034b13b0362e3d5a12585cac).
Stage 2 requires a coordinated data and runtime release. The inventory below
records why, and the offline rehearsal records what is now verified.

### Live inventory

Read-only snapshot of `misebox-78f9c/misebox` at 20:09:24 CET on 23 November 2026. The scan covered all 17 Kitchen roots, their immediate child collections,
and the Menu → Section → placement hierarchy. Counts below are field
occurrences where a document can hold more than one reference.

| Stored scope      | Finding                                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kitchen catalogue | 555 documents in `dishes` across seven Kitchens. One Kitchen has 35 documents in `items`. All 35 share IDs and equal stored fields with their corresponding `dishes` documents. The other 520 exist only in `dishes`. |
| Menu placements   | 991 `dish_id` references across 51 Menus and 161 sections. All resolve in `dishes`, but only 35 resolve in `items`. Zero stored placement `item_id` fields were found.                                                |
| Promotions        | 19 `dishes[].dishId` values on one Promotion. All point to `dishes`-only documents.                                                                                                                                   |
| Orders            | 303 `items[].dish_id` occurrences across 88 Order documents scanned. Of these, 66 do not match an existing catalogue document in either collection.                                                                   |
| Sales             | One `lines[].dish_id` occurrence across one Sale document scanned. It points to a `dishes`-only document.                                                                                                             |
| Submitted Orders  | 15 stored `menu.selections[].itemId` occurrences across 21 documents scanned. These do not match either catalogue, so this field needs its own identifier audit before any rewrite.                                   |

There are 407 Kitchen-scoped Item IDs referenced by more than one Menu. A
source-only switch to `items` would lose 956 Menu targets. Switching deletion
guards to query `item_id` ahead of the record rewrite would miss existing
placements. Neither change can ship independently.

### Source cutover scope

- Keep the [Item storage](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts)
  at `kitchens/{kitchenId}/items/{itemId}`. Rename the Item API and route
  parameters and update the corresponding editor, image, usage and delete
  requests. Keep existing image object keys and URLs.
- Keep [MenuEntry](../../packages/extensions/fireux-kitchens/src/runtime/menu/records/sections/entry.ts)
  documents at their existing placement IDs. Use `item_id` for the catalogue
  reference and reserve `itemId` for that same identity in TypeScript and
  request payloads. Use `entryId` for placements currently called `itemId`
  by Menu entry edit/remove requests. Update placement creation, duplicate
  checks, import/draft reconciliation and Section readers together.
- Switch [public manifest](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/manifest/sections.ts),
  [food search](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/index/food-search.ts),
  [draft readback](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/draft/current.ts),
  publication checks and ordering/price lookups to the same Item target.
  Preserve publication policy, Stage 1 prices and existing currency behavior.
- Align the [Promotion reference contract](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/promotions/promotion.ts)
  and [Item usage guard](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/usage.ts)
  with the new field. The guard must continue counting paused Promotions and
  archived placements. Leave legacy Orders, Submitted Orders and Sales unchanged. Preserve the
  version 1 Sale parser and reporting aggregation, order idempotency and
  recorded prices. The historical checkout command resolved
  `menu.selections[].itemId` under the selected Menu Section's placement
  collection. These values identify placements in that snapshot contract.
  [Historical checkout command](https://github.com/fireuxlabs/fireux-mono/blob/330c4384fa/packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering.ts#L117-L139)
- Update the [Rules source](../../packages/ecosystem/fireux-misebox/src/config/firebase/rules/kitchen-operations.rules),
  preserving the same-Kitchen check, immutable placement reference and existing
  authorization. Rehearse the generated policy and verify query/index coverage.
  Update fixtures, tests and active docs. Review one-off migration scripts
  separately so an old tool cannot reintroduce legacy writes.

### Proposed migration and release sequence for approval

1. Exclude historical Orders, Sales and Submitted Orders from the write set.
   The 66 unmatched Order values remain historical facts with unresolved
   catalogue provenance. Do not infer matches. Inventory all deploying Apps
   and background writers that share this named
   database, including importers. Repeat the inventory immediately before
   release and identify any destination conflicts. Stop on an unresolved
   catalogue or placement conflict instead of overwriting a record.
2. Retain restricted preimages of both catalogue paths and every affected
   reference document, with original typed fields, full paths, snapshot time
   and update times. Keep backups out of Git. Retain the deployed app versions
   and active Rules policy. Dry-run a copy and rollback in an isolated named
   emulator, using the same affected shapes and ID map.
3. After separate release approval, quiesce affected writes and old clients.
   Copy missing catalogue documents to `items` with the same IDs using
   existence and update-time preconditions. Verify contents against the source
   and skip identical destinations. Keep `dishes` available for rollback.
4. In the same coordinated release window, replace reference fields in place,
   preserving each MenuEntry ID, order, status and timestamps. Verify every
   placement and Promotion resolves within its Kitchen. Release the complete
   reader/writer and Rules cutover as a unit before reopening writes. Confirm that all 991 placements in the audited
   snapshot, plus any changes in the refreshed inventory, resolve without
   legacy placement fields. Verify Promotions, authorization, public Menu and
   food search, signed-in edit, ordering prices and the two-Menu deletion
   guard. Compare historical Finance output against the baseline.
5. If verification fails, keep writes paused and restore the exact reference
   preimages, prior runtime and prior Rules together. Roll back only verified
   migration-created destinations and only when their versions still match
   the journal. Make the rollback decision while writers are paused.
   Once writes resume, any recovery requires a separate reconciliation plan.
   Resume writes after baseline read and authorization checks pass. Retire legacy catalogue documents only with separate approval after a
   verified release and rollback window.

### Verification at this checkpoint

The existing runtime passed the two-Menu Margherita exercise on the named
emulator. The two guarded placement commands returned distinct IDs. Removing
one placement preserved the Item and its pricing, and Item Delete returned 409
until the second placement was removed. A foreign App member received 403 on
placement removal, Item edit and Item deletion. The full Menu command required
its existing linked Place. The separate Items-only fixture proved name-only
Items without Place or Menu. All 125 focused tests passed again. Focused Item
typecheck and lint passed. The wider Kitchen contracts check reproduced the
same 23 diagnostics. The signed-in browser check of the cutover remains open.
This checkpoint contains no runtime or Rules changes. No live Firestore writes
or deployment were performed.

### Offline implementation and rehearsal

- The Workspace and public readers, Item APIs and route parameters, Menu
  placement commands, Promotion commands, import references and deletion guard
  use the new contract. Firestore stores `item_id` in MenuEntries and in
  Promotion choices. API inputs use `itemId` for the catalogue Item and
  `entryId` for placement edits, moves and removals.
- Menu publication accepts valid full-price groups without a stored base price.
  The Stage 1 Item write rules still require explicit currency for priced Items.
  Existing bare prices were carried forward as-is in the migration rehearsal.
  The reviewed Menu import keeps its existing pricing representation during
  this reference cutover, and no historical currency backfill is part of it.
- The loopback-only [rehearsal](../../tools/misebox-migrations/rehearse-item-reference-cutover.mjs)
  copied a missing Item, skipped an identical destination, rejected a conflicting
  destination, rewrote two placements and both Promotion forms, and restored
  the exact fixtures. It refused rollback after a subsequent write. Legacy
  Order, Submitted Order and version 1 Sale fixture snapshots were unchanged.
- The separate restricted production-candidate Rules suite passed on the named
  `misebox` emulator. The live policy and live records remain untouched.
  Production still needs reviewed migration tooling and a frozen release
  inventory. Keep the local candidate out of the release pipeline until those
  gates and production authorization are satisfied.

The current candidate passed 169 focused tests, 29 named-database Rules tests,
Item and commerce typechecks, lint and full Misebox preparation. The wider
400-test selection passed 397 and reproduced the three baseline presentation
failures. The wider Kitchen contracts typecheck retained 23 diagnostics.
Authenticated HTTP tests passed standalone Item CRUD and the two-Menu placement
and deletion guard. Signed-out HTTP verified public Menu and food search
against an `items`-only catalogue. The Firefox check did not reach signed-in
verification.

### Release readiness review

- Published the offline runtime and Rules candidate on
  [`codex/kitchen-item-reference-cutover`](https://github.com/fireuxlabs/fireux-mono/tree/codex/kitchen-item-reference-cutover).
  Candidate commit `5937d6aeaad4a423fb1cfec7d549b4727068aaf2`. The branch is
  separate from the live release.
- The real FireUX email form completed sign-in in the in-app browser using the
  named emulator. Workspace listed the new name-only Margherita, opened its
  exact detail URL, saved a rename and reopened the renamed Item after a
  hard refresh. The isolated fixture needed the same `FireuxApp` wrapper as
  Misebox. Firefox verification remains open.
- The [emulator rehearsal](../../tools/misebox-migrations/rehearse-item-reference-cutover.mjs)
  now reads an actual version 1 Sale through the existing gross-sales report
  reader. The complete report matched before migration, after migration and
  after rollback. The fixture reconciled one Sale, two Margheritas and CHF 36
  gross. The Finance reader and schema are unchanged. No production report
  comparison has been run.
- Refreshed the read-only production inventory at 20:41:59 CET on 23 November 2026. All previously recorded counts matched, including 520 catalogue
  documents missing from `items`, 991 legacy placements and 19 Promotion
  references. A fresh inventory taken after writers are paused still gates
  the release.

**Release decision: hold.** The helper is deliberately restricted to the demo
emulator and uses one fixture transaction with an in-memory rollback journal.
It cannot apply or safely resume the production-sized change. Use the
[existing migration tooling requirements](../../tools/misebox-migrations/README.md)
as the review baseline. Before approval:

1. Prepare a source-bound production plan and protected typed preimages for
   `misebox-78f9c/misebox`. Require a verified backup receipt, a reviewed plan
   hash and a rehearsal of bounded commits, interrupted-run recovery and
   rollback across the full inventory size. Journal the exact postimage
   version for each successful batch. Keep Orders, Sales and Submitted
   Orders out of the write set.
2. Identify all App versions and manual or automated writers sharing the
   database. Demonstrate how the maintenance window blocks both legacy
   browser writes and trusted server writers, and rehearse the runtime and
   restricted policy sequence. The Main App release workflow alone does not
   deploy the policy or release the tenant Apps.
3. Capture the production Finance baseline and check report parity,
   reference resolution and restricted access before reopening writes.
   Resolve any rollback decision within that window. A separate
   authorization is required for production execution.

### Production migration readiness checkpoint

The [migration runner](../../tools/misebox-migrations/kitchen-item-references.py)
implements the previously missing operational tooling. The default is read-only.
The production preflight at 20:56:24 CET on 23 November 2026 observed 520
missing copies, 991 placement rewrites and one Promotion with 19 references,
in 31 bounded write batches. This
inventory was taken before any writer pause and is evidence only.

The named emulator rehearsal seeded the audited scale of catalogue copies and
Menu placements, plus 19 standalone and meal-deal choice references. It proved
complete copy and rewrite, idempotent repeat, recovery after a lost commit
reply, source-version and destination conflicts, historical document
preservation, exact field rollback, and refusal after a later write even when
the payload was restored. Plan files and journals stay outside Git. See the
[operator instructions](../../tools/misebox-migrations/README.md#kitchen-item-references).

#### Writer inventory and ownership

| Boundary                     | Evidence and release responsibility                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Known App Functions          | Live metadata shows `miseboxApp`, `baerenRinggenberg`, `banginCoffee`, `friiites`, `interlakenEssen` and `laTapBerne` in `europe-west6`, all using the shared Misebox SSR service account. App release operators must cover Hosting, direct Function/Run ingress and old client bundles. Capture the active releases and traffic revisions.                                                                                                                                           |
| Unmapped deployment          | `niederhorn` is an active Function and Hosting site in the same project with a different service account. Its database access and pause owner are unverified. The `la-tap-berne` site also exists alongside the repo-configured `tapberne` target. Verify its active rewrites and legacy ingress.                                                                                                                                                                                     |
| Trusted mutation entrypoints | Inventory Item create/update/delete, image and flagship commands, promotion save, Menu placement create/update/remove/reorder, Menu daily publication and deletion, and import confirmation/draft replacement. These commands use Admin-backed transactions. Browser Rules cannot stop them once invoked. Drain traffic and fence their write identities for the maintenance window.                                                                                                  |
| Direct and manual writers    | The currently documented development policy permits direct writes. The Rules operator must replace the permissive policy during the approved pause and verify denied writes with both cached legacy clients and unauthenticated requests. Freeze local previews and manual migration/import scripts, including `apply-dish-pricing.py`, `retire-baeren-drink-products.py` and older venue tools. Disable any invoker with independent write credentials or prove it is outside scope. |
| Jobs and extensions          | No Cloud Run jobs were listed in `europe-west6`, and the Cloud Scheduler API reports disabled. The listed Stripe extension triggers target Auth and default-database customer paths. Before release, the project operator must confirm IAM principals, other regions, external automation, CI, and any Functions whose trigger or deployment ownership remains unclear.                                                                                                               |

#### Coordinated release sequence for review

1. The project owner maps every active writer to an operator, tests the
   maintenance fence and records the active Hosting, Function, Run and Rules
   versions. The App operators stage compatible builds for every affected
   consumer. The Rules operator prepares the temporary pause policy and the
   final restricted policy. The independent approver verifies the target and
   manages release signatures.
2. After authorization, hold all public and operator traffic that can reach
   the affected writers. Stop or drain in-flight Admin requests and disable
   old write principals. Verify the pause with negative write probes in
   the exact named database. Keep only the migration principal able to
   perform the reviewed catalogue work. Collect the managed export and typed
   preimages, compare the post-pause inventory with expectations, and retain
   the read-only historical Finance baseline. Issue action-specific signed
   approval for the reviewed plan hash and export receipt.
3. The migration operator applies and verifies the approved plan while all
   writers remain paused. On an interruption, reuse the same private plan
   and journal. Confirm every placement and Promotion resolves to the
   intended Item in its Kitchen, and the field counts reconcile.
4. The App and Rules operators activate the compatible runtime and restricted
   policy while the maintenance fence still holds. Read back the restricted
   policy for `misebox`. Check signed-out Menu and search, signed-in owner
   navigation/edit authorization, cross-Kitchen denial, and deletion
   protection for remaining Menu and paused Promotion references.
5. From the same authorized Gross Sales report routes, replay the baseline
   Kitchen IDs, fixed date ranges and timezones. Compare private JSON with
   only `generated_at` removed, including daily and currency totals,
   quantities and historical transaction rows. An empty or failed report
   cannot satisfy a non-empty baseline. Check the original historical
   document versions remain unchanged. Keep source records untouched.
6. Decide whether to reopen or roll back while writers are paused. Obtain
   separate rollback approval if needed, reverse only journaled changes,
   restore the prior runtimes and policy as a unit, and verify the old
   read and authority paths. After reopening, use a new reconciliation
   plan for any recovery.

The migration operator needs read and transaction permissions for the named
database and export-operation read access. The backup operator needs export
and destination access. Deployment, Rules release, and writer fencing require
their own scoped project and App authority. Keeping those roles separate is
an operational prerequisite, even when one person holds multiple roles.

| Gate                             | Result at this checkpoint                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Writer pause                     | **Fail.** Unmapped deployment, legacy ingress, IAM coverage and the maintenance fence remain unproven.                                                                        |
| Fresh post-pause inventory       | **Fail.** Read-only production dry run passed before the pause.                                                                                                               |
| Backup and recoverability        | **Fail for live release.** Guarded restore passed locally. A completed production export and protected preimages are pending.                                                 |
| Migration dry run                | **Pass.** The planner found 520 copies, 991 placements and 19 Promotion references without conflicts.                                                                         |
| Full-size migration rehearsal    | **Pass on the named emulator.** Includes interruption and idempotent resume.                                                                                                  |
| Compatible runtime               | **Pass locally.** Focused tests, Item and commerce typechecks and Misebox preparation passed. All deployed App artifacts still need staging and review.                       |
| Restricted Rules                 | **Pass locally.** 29 named-database tests. Live policy and writer pause remain separate approved steps.                                                                       |
| Reference integrity              | **Pass in the rehearsal.** Production verification requires post-migration readback before reopening.                                                                         |
| Signed-in and signed-out browser | **Pass locally.** Signed-in editing and signed-out Menu passed in the in-app browser. The 16-inch selection showed CHF 24. Firefox and production browser checks remain open. |
| Historical Finance parity        | **Pass in the rehearsal.** Live before/after comparison remains required.                                                                                                     |
| Rollback                         | **Pass in the rehearsal.** Production checkpoint requires an approved export, signatures and old runtime/policy artifacts.                                                    |

**BLOCKED for coordinated production release.** The runner and rehearsal are
ready for independent review. Production still needs a verified writer fence,
named owners for unmapped ingress, a fresh post-pause plan, a managed export
and separate execution approval. Production records, Rules and traffic were
untouched during this preparation.

Verification passed for all 7 migration tests, 169 focused runtime tests,
and 29 restricted Rules tests. Lint, Python compilation, Item and commerce
typechecks, and Misebox Nuxt preparation passed. The wider 400-test run
reproduced the same three presentation failures. The wider Kitchen contracts
check reproduced the same 23 diagnostics.
