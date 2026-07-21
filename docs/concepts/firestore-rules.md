Firestore Rules source map
Updated: 2026-07-21
Ref: b020f805e
Role: map, not canon

<!-- Concurrent edit — 2026-07-21 16:13 CEST — Shared Firestore Rules pass: map source, scoped composition, artifact, and release ownership. -->

Purpose:
Map how FireUX authors and releases main-database Firestore Security Rules.

Vertical links:

- Parent: fireux.md
- Parent: firestore-entity.md
- Parent: pnpm.md

Horizontal links:

- spine.md
- server-api.md
- entities.md

Current source boundary:

- FireUX Core owns reusable, byte-identical Rules fragments and the pure
  composer under `packages/core/fireux-core/src/config/firebase/rules`.
- The Core contract validates fragment order, declaration boundaries,
  contracted lexical frames, wildcard-equivalent literal paths, and helper
  signatures in their owning database frame before it emits an artifact.
- Each opted-in ecosystem owns one `firestore.template.rules` file beside its
  Firebase binding. Its header pins the project, database targets, artifact,
  and ordered Core fragments; its body owns every ecosystem policy delta.
- `scripts/firebase/<ecosystem>/firestore.rules` is the deterministic complete
  artifact reviewed, compiled, hashed, staged, promoted, and rolled back.
- `scripts/render-firestore-rules.mjs` is read-only by default. `--write` is an
  explicit local artifact update, never part of deploy or data migration.
- Operational guards require byte-for-byte template composition and require
  every release or migration-evidence consumer to use the verified artifact.

Current targets:

- Misebox: Firebase project `misebox-78f9c`; databases `misebox` and
  `misebox-simulation`.
- Werkbox: legacy physical Firebase project `cleanbox-f15bc`; databases
  `cleanbox` and `cleanbox-simulation`.
- Directory-publication server-only databases separately reuse the exact
  deny-all `scripts/firebase/directory-publication/server-only.rules` source.

Working rule:

- Share semantics, not similar-looking text. Project/database gates, App ids,
  bootstrap authority, profiles, query limits, domain access, and migration
  exceptions remain explicit ecosystem policy until they are truly identical.
- Preserve the complete artifact across a source-only extraction, then compile
  and rerun adversarial Rules tests before any remote release.
- Do not put main Firestore Rules in ordinary app `firebase.json` files.
- Do not opt another ecosystem in without identifying its concrete database
  edition and auditing stored paths, queries, writes, and trusted server seams.
