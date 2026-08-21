# Firestore Rules source map

Updated: 2026-08-21
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map how FireUX authors and releases main-database Firestore Security Rules.

## Vertical links

- Parent: fireux.md
- Parent: firestore-entity.md
- Parent: pnpm.md

## Horizontal links

- spine.md
- server-api.md
- entities.md

## Current source boundary

- FireUX Core owns reusable, byte-identical Rules fragments and the pure
  composer under `packages/core/fireux-core/src/config/firebase/rules`.
- The Core contract validates fragment order, declaration boundaries,
  contracted lexical frames, wildcard-equivalent literal paths, and helper
  signatures in their owning database frame before it emits an artifact.
- Each opted-in ecosystem owns one `firestore.template.rules` manifest beside its
  named ecosystem policy fragments under `rules/`. The manifest declares their
  order; Core expands them before inserting and validating shared fragments.
  Firebase binding. Its header pins the project, database targets, artifact,
  and ordered Core fragments; its body owns every ecosystem policy delta.
- `scripts/firebase/<ecosystem>/firestore.rules` is the deterministic complete
  artifact reviewed, compiled, hashed, staged, promoted, and rolled back.
- `scripts/deploy-workspace-firestore-rules.mjs` owns the smaller FireUX,
  Granite, and BuenoHost named-database releases. Promotion requires fresh
  Entity migration evidence, the retained export URI, an exact source-hash
  confirmation, and a protected release preimage.
- `scripts/render-firestore-rules.mjs` is read-only by default. `--write` is an
  explicit local artifact update, never part of deploy or data migration.
- Operational guards require byte-for-byte template composition and require
  every release or migration-evidence consumer to use the verified artifact.

## Current targets

- Misebox: Firebase project `misebox-78f9c`; database `misebox`. Workspace
  roots own `team/{uid}` records with bounded roles, permissions, status, and
  audit stamps. Exact active Team membership grants target/read access;
  permissions grant mutations. Current App admins are the explicit override
  only for roots whose management names that App. Team requests never grant
  authority. Root-owned operation Rules start with an explicit child
  collection/document pair before a recursive tail, because a Rules v2
  recursive wildcard also matches zero segments and must not bypass the Team
  or operation validator.
  Canonical `/ingredients/{ingredientId}` roots are server-only and reach
  clients through the bounded Ingredient projection API. A Kitchen may store
  only an exact stamped `ingredient_id` reference whose canonical root is
  active; generic Kitchen-child branches explicitly exclude Ingredients.
  Stale Kitchen references remain deletable after a root is deprecated or
  merged.
- Werkbox: legacy physical Firebase project `cleanbox-f15bc`; database
  `cleanbox`.
- FireUX: Firebase project `fireux-2005`; database `fireux`; Client access is
  deny-all and trusted servers own canonical Project reads and writes.
- Granite: Firebase project `granite-ecosystem`; database `granite`; Client
  access is deny-all and trusted servers own canonical Portfolio reads and
  writes.
- BuenoHost: Firebase project `buenohost-ecosystem`; database `buenohost`;
  Property reservations and availability remain trusted-server-only beneath
  the root Property.

The owner-first Workspace rule described above is the deployed Rules boundary.
Old App-nested records remain migration sources only until the corresponding
runtime release is deployed and representative authenticated surfaces verify
the canonical roots.

## Working rule

- Share semantics, not similar-looking text. Project/database gates, App ids,
  bootstrap authority, profiles, query limits, domain access, and migration
  exceptions remain explicit ecosystem policy until they are truly identical.
- Preserve the complete artifact across a source-only extraction, then compile
  and rerun adversarial Rules tests before any remote release.
- Do not put main Firestore Rules in ordinary app `firebase.json` files.
- Do not opt another ecosystem in without identifying its concrete database
  edition and auditing stored paths, queries, writes, and trusted server seams.
