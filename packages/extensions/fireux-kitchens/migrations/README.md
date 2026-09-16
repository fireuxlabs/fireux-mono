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
