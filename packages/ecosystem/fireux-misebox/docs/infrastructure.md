# Misebox infrastructure

Owner: `fireux-misebox` for Apps inheriting its Firebase binding.
Binding source: [ecosystem.config.ts](../src/config/firebase/ecosystem.config.ts).

## Verified Firestore binding

| Firebase project ID | Database ID | Edition    | Mode               | Location | Verified at |
| ------------------- | ----------- | ---------- | ------------------ | -------- | ----------- |
| `misebox-78f9c`     | `misebox`   | `STANDARD` | `FIRESTORE_NATIVE` | `eur3`   | 2026-11-15  |

Read-only evidence:

```sh
gcloud firestore databases describe --project=misebox-78f9c --database=misebox --format='json(name,type,databaseEdition,locationId)' --quiet
```

This records the inspected named database. Other databases and App-specific
binding overrides need their own metadata verification. Read the current binding
and these notes before asking an operator to identify the edition. Recheck the
resource metadata and update this document when a binding changes or infrastructure
is deliberately changed. Missing access is a verification gap; it does not justify
guessing an edition. Keep credentials out of infrastructure notes.
