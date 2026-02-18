# Migrations

Purpose: keep Firestore/data migrations repeatable across all FireUX ecosystems.

## Scope

- This folder is the **operating guide** for migrations.
- Migration scripts currently live in [scripts/](../scripts/) and should follow the conventions below.
- Every migration must support **dry-run first**, then explicit apply.

## Ecosystem matrix

| Ecosystem | Project ID | Service account path |
| --- | --- | --- |
| Misebox | `misebox-78f9c` | `packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json` |
| Cleanbox | `cleanbox-f15bc` | `packages/ecosystem/fireux-cleanbox/src/config/firebase/service-account.json` |
| FireUX | `fireux-2005` | `packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json` |
| Bringli | `bringli-b0517` | `packages/ecosystem/fireux-bringli/src/config/firebase/service-account.json` |

## Standard migration workflow

1. Confirm target ecosystem + project ID.
2. Run migration in **dry-run** mode.
3. Review summary and sampled document changes.
4. Run with `--commit`.
5. Verify via MCP and app JSON views.
6. Record result in PR/notes.

## Command template

```bash
# Dry-run
GOOGLE_APPLICATION_CREDENTIALS=<service-account-path> \
node scripts/<migration-file> --project <project-id>

# Commit
GOOGLE_APPLICATION_CREDENTIALS=<service-account-path> \
node scripts/<migration-file> --project <project-id> --commit
```

Example (Misebox):

```bash
GOOGLE_APPLICATION_CREDENTIALS=packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json \
node scripts/migrate-kitchen-thin-overlay.mjs --project misebox-78f9c
```

## Script conventions

All migration scripts should:

- Accept `--project` and optional `--limit`, `--pageSize`.
- Default to dry-run, require explicit `--commit`.
- Use one auth resolver path in this order:
  1. `FIREBASE_SERVICE_ACCOUNT` (JSON string)
  2. `GOOGLE_APPLICATION_CREDENTIALS` (JSON file path)
  3. ADC (`applicationDefault()`)
- Process documents in pages and batch writes (<= 450 ops per commit).
- Print start/progress/done summary with counters.
- Exit non-zero when invariants fail.

## Invariant-first policy

When a migration touches relational contracts (example: kitchens ↔ places):

- Validate invariants during run (dry-run and commit), not after.
- Skip or fail unsafe writes loudly.
- Report violating IDs in output.

## Verification checklist

After commit:

- Re-dump affected collections through MCP.
- Confirm expected field shape only.
- Confirm no missing referenced docs (foreign-key style checks).
- Confirm UI JSON panels match expected shape.

## Current canon (kitchens/place)

- `places/{id}` owns identity/location/media.
- `kitchens/{id}` is a thin marker (`id`, `is_test_kitchen`, timestamps, kitchen-scoped state only).
- Live kitchens must reference existing `places/{id}`.
