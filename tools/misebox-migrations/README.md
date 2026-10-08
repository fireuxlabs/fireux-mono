# Misebox operational migration tools

These tools own explicit Misebox database cutovers and reviewed client inputs.
They are not reusable Kitchen runtime or automatically executed package hooks.
Relocation does not authorise running a plan/apply against live data. Existing
protected plans remain source-bound; retain their original source and receipts.

# Kitchen/Menu shape migration

`kitchen-menu-cleanup.py` is the bounded migration for the Kitchen currency and
Menu record cutover. It targets only `misebox-78f9c/misebox`, reads Kitchens,
same-id Places and Kitchen-owned Menus, and never edits standalone root Menus,
sections or items. Run with existing gcloud credentials and a trusted system CA.

1. Create a managed Firestore export containing `kitchens`, `menus`, and `places`
   in the existing `misebox-78f9c-firestore-migrations` bucket. Retain its operation
   name and output URI.
2. Run `python3 kitchen-menu-cleanup.py plan --directory <protected-directory>`.
   The new directory receives complete preimages and a source-bound plan.
   Review the reported issues and exact field changes. Do not overwrite an old
   plan directory.
3. Ensure the matching runtime is running. Apply with `apply --directory ...
   --confirm <plan-sha256> --export-operation <full-operation-name>`.
   The command checks the completed export, source hash and every record version
   before one atomic commit. Repeating the same apply skips exact postimages.
4. Run `verify --directory ...` to compare every complete postimage. Retain the
   preimages, plan, export receipt and verification report securely.

Missing currency is reported, not guessed. Conflicting currency retains the
Kitchen value. Incomplete/conflicting document metadata remains flagged for
correction. Existing Kitchen palettes are preserved; absent palettes receive the
current default from Menu rendering. Existing ordering/audit/translation data is
preserved. Missing Menu sort order becomes zero.

The scoped public directory requires a COLLECTION composite index on `menus`:
`status ASCENDING`, `sort_order ASCENDING`, `__name__ ASCENDING`. Create it through
`gcloud firestore indexes composite create` for the exact named database and
verify READY before checking directory pagination.

Local transformation checks:
`python3 -m unittest discover -s . -p 'test_*.py'`

## Explicit Menu slugs

`menu-slugs.py` adds slugs to Kitchen-owned Menu records without moving document
IDs or children. Its bounded cutover maps La Tapberne Food to `comida-casera` and
preserves every other existing URL token. Standalone Menus are excluded.

Capture an inventory with the shape migration's reader, then run `plan --inventory
<inventory.json> --directory <fresh-protected-directory>`. Review the plan and
retain its hash. Create a managed `menus` export in the approved migration bucket
before `apply --directory ... --confirm <hash> --export-operation <operation>`.
Apply verifies the export, source hash, preimages and record versions, writes only
`slug`, then verifies full postimages. Repeating apply skips exact postimages.
Keep the protected plan, preimages and verification receipt with the export.

## Kitchen Offering child-record proposal

`kitchen-offerings.py` reads an explicitly supplied ordinary JSON inventory of
Kitchen roots and their Offering children for
`projects/misebox-78f9c/databases/misebox`. It writes a review-only proposal to a
new protected file; it makes no network calls and has no apply mode. Run it with
`--input <inventory.json> --output <fresh-plan.json>`.

The plan retains complete preimages, hashes and update times. Missing child
records are create-only proposals, conflicting children block all proposals for
their Kitchen, and root retirement is proposed only alongside the complete child
set. Proposals require current canonical Offering validation and an independently
proved complete inventory before any future application. Structural planning
alone does not establish domain validity or authorize root retirement.
`test_kitchen_offerings.py` and Kitchen's `kitchen-offering-storage.test.mjs`
cover the offline proposal and actual reader integration.

## Historical named Kitchen services

The tools below target the retired root-array intermediate shape. They do not
convert to the current Offering children and must not be applied to the current
runtime as its migration procedure.


`named-services.py` replaces exactly one Kitchen's old `ordering.services` with
the root `services` array. The historical `kitchen-ordering.py` remains a separate
Menu-to-Kitchen migration; it is not a prerequisite runner for this cutover.

Each old mode becomes one independently named service (`service-pre-order`,
`Pre-order`, for example), with the original enabled state, exact Menu membership,
an enabled browse interaction, and its original ordering interaction and policy.
Both the service and its ordering interaction retain the old enabled state.
Disabled services do not become active through browse; ordinary published Menu
browsing remains independent. Existing operational Order `service_id` numbering,
all child records, other Kitchen fields and audit/provenance remain untouched.

Hours become an explicit snapshot on the service: custom service hours first;
otherwise effective custom Kitchen `orders.operation_hours`; otherwise the
same-id Place's business hours and timezone, matching the old runtime resolver.
The reader fetches only that Place when needed, never lists Places, Menus or
Orders. Invalid timezones, malformed schedules, duplicate IDs/modes and conflicting
old/new shapes block apply. Enabled ordering requires resolved hours. Disabled
or browse-only services can have no hours. Already migrated valid records skip
unchanged; exact postimage replay also skips unchanged.

1. Run `python3 named-services.py plan --kitchen-id <exact-id> --directory
   <fresh-private-directory>`. The directory must be mode `0700`. Review the
   protected complete preimages, exact changes, issue list and printed plan hash.
2. Before apply, retain a successfully completed managed export of `kitchens`
   (also `places` when used by this plan) to
   `gs://misebox-78f9c-firestore-migrations/named-services-20260918`.
   This tool does not create exports or choose a different backup destination.
3. Ensure the matching named-services runtime is running and old writers have
   stopped. Apply with `python3 named-services.py apply --directory <directory>
   --confirm <plan-sha256> --export-operation <full-operation-name>`.
   Source and plan hashes, a reconstruction from protected preimages, export
   completion/destination/scope, full preimages and update times must match.
   The existing guarded writer performs one atomic root update; linked Place
   reads share its transaction so concurrent source changes prevent commit.
4. Apply reads back and compares the complete postimage. Rerun independently with
   `python3 named-services.py verify --directory <directory>`. Retain preimages,
   plan, export receipt and verification report securely. There are no marker
   collections or old-shape runtime readers.

Run the local checks with `python3 -m unittest discover -s
tools/misebox-migrations -p 'test_*.py'` from the repo root.

## Ingredient catalogue and Bären inputs

`ingredient-catalogue.py` targets only `misebox-78f9c/misebox/ingredients` and
`kitchens/ChIJE-GP3-Kjj0cRzAv0WviwcsY/ingredients`. Its reviewed JSON maps existing
IDs to culinary categories and lists food inputs with menu evidence or explicit
working assumptions. No existing ingredient is renamed, merged or deleted;
legacy hierarchy/lifecycle fields remain stored. Supplier offers are not seeded.

Run `plan --directory <fresh-private-directory>` and inspect the complete plan,
preimages and confirmation hash. Retain a completed managed export of the
`ingredients` collection group to
`gs://misebox-78f9c-firestore-migrations/ingredient-catalogue-20260918` before
`apply --directory ... --confirm <hash> --export-operation <full-operation-name>`.
Apply requires unchanged source and protected plan, uses update-time and
create-only preconditions in one bounded atomic commit, then verifies complete
postimages. `verify --directory ...` repeats the read-only check. Source changes
require a fresh plan; old artifacts must be retained. No retirement is included.
Use the system CA bundle where the Python installation lacks trusted roots.

## Bären provisional Gourmador sourcing

`baren-gourmador.py` creates the reviewed Gourmador Unterseen Place/Company/Supplier
identity in `bringli-b0517/bringli`, and the Bären supplier connection and 66
sourcing links in `misebox-78f9c/misebox` from
`ingredient-catalogue.json`. `baren-gourmador.json` records the exact Google Place
identity and public source evidence. This is a Kitchen sourcing choice; no
Supplier ingredient coverage, products, prices, availability or access grants
are created. Existing records are preserved; conflicting identities block apply.

Run `plan --directory <fresh-private-directory>` and review its hash, preimages
and issues. Apply requires a completed managed export of `places`, `companies`,
`suppliers`, `supplier-ingredients` and `ingredients` to
`gs://misebox-78f9c-firestore-migrations/baren-gourmador-20260918`, using
`apply --directory ... --confirm <hash> --export-operation <full-operation-name>`.
Also supply `--supplier-export-operation <full-operation-name>` for a completed
Bringli `places`, `companies`, `suppliers` export to
`gs://bringli-b0517-migrations-20260918-7c41/gourmador-identity`.
Source and plan are bound together; all creates use `exists: false`. Supplier
identity is committed first, followed by Kitchen references. Cross-project writes
are not atomic; a partial apply can be replayed against exact postimages.
Postimages are verified automatically and by the independent
`verify --directory ...` mode. Replanning an unchanged result creates nothing.
Run `test_baren_gourmador.py` with unittest discovery for the bounded migration
checks. Runtime readers and their public/workspace behavior are unchanged.

## Nested Kitchen Identity and shared Place currency

`kitchen-identity.py` is the additive copy for canonical Kitchen roots in
`misebox-78f9c/misebox`. It copies stored slug/status/visibility and a known
onboarding source into `identity`, preserving every existing field and child.
Absent historical source remains absent. Same-id Places are exact dependencies;
conflicting currency blocks the plan. Place `default_currency_code` remains the
authoritative currency and is not changed by this tool.

Run `plan --directory <fresh-private-directory>` and review the exact changes
and confirmation hash. Retain the complete preimages and a completed managed
export of `kitchens` and `places` at
`gs://misebox-78f9c-firestore-migrations/place-kitchen-identity-20261005`.
Apply with `apply --directory ... --confirm <hash> --export-operation <operation>`.
Source/preimage reconstruction, target, export scope, every document version and
Place dependency are verified; the additive Identity maps commit in one bounded
transaction. `verify --directory ...` compares complete postimages and unchanged
Places. No marker collection, fallback reader, Place write or retirement is added.

Old flat fields are retained preimages, not active runtime authority. Retiring
them needs a separate reviewed plan after the matching runtime is released.
Local transformation checks are in `test_kitchen_identity.py`.
