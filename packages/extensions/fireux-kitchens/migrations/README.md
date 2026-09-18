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

## Named Kitchen services

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
packages/extensions/fireux-kitchens/migrations -p 'test_*.py'` from the repo root.
