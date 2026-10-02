# Entity canonical migration

Updated: 2026-10-01
Ref: 2807ceca9
Role: map, not canon

## Purpose

Prevent a cleaned TypeScript model from being mistaken for a completed Entity
migration. This map exists because repeated partial migrations aligned a root
type while leaving old consumers, authority paths, stored shapes, projections,
or guards in service.

Implementation truth remains current source, executable guards, tests, and
verified Firestore evidence. This document defines the review route and the
evidence required before an Entity may be described as aligned.

## Links

- Parent: [Spine](spine.md)
- Horizontal: [Entities](entities.md), [Entity Detail](family-entity-detail.md),
  [Entity Collection Page](family-entity-collection-page.md), [Debug](debug.md), and
  [Runtime filesystem](runtime-filesystem.md)
- Firestore mutation authority:
  [`docs/ai/firestore-mutations-context.md`](../ai/firestore-mutations-context.md)
- Verification: current owning source, source-owned tests and affected
  package/App checks. The former Entity and Workspace guards were removed.

## Completion rule

An Entity is canonically aligned only when its model, consumers, authority,
stored data, projections, Directory, Detail, Workspace adapters, debug
surfaces, fixtures, tests, and guards agree on one ownership tree.

A passing model check is not completion. A passing guard is not evidence when
the guard preserves the mechanism being retired.

Incomplete onboarding may leave a canonical optional or empty value when the
model permits it. It does not justify retaining another field name, document
shape, reader, writer, or authority path.

## Hard-cutover sequence

Each Entity passes these gates in order. Stop when a gate exposes an unresolved
authority or product decision.

1. **Model** — define one plain singular root-document type containing the
   canonical stored data and document identity. Keep infrastructure, related
   Entities, operational children, presentation, and derived facts outside it.
2. **Consumers** — align every reader, writer, command, normalizer, composable,
   response, fixture, and page. Remove aliases, fallback field names,
   `Partial<Entity>` authority, and replacement DTOs that masquerade as the
   Entity.
3. **Authority** — establish one owner for identity and one explicit access
   path. Remove parallel authority, compatibility reads, and dual writes.
4. **Data audit** — inspect every relevant database and classify missing
   canonical fields, fields outside the model, duplicate roots, and misplaced
   child or projection data.
5. **Protected migration** — retain an export or exact preimage, produce a
   deterministic reviewed plan and hash, apply through the guarded mutation
   lane, and verify the written values and Firestore value types.
6. **Retirement** — delete superseded fields and documents, then remove their
   readers, writers, aliases, fallbacks, mutation targets, and guards. Do not
   leave dormant compatibility code.
7. **Surfaces** — prove Directory, Detail, and Workspace consumers from the
   remaining canonical data. Debug places canonical records under `objects`
   and relationships, source, route, counts, and presentation under `derived`.
8. **Guards** — make executable checks reject the retired shape and parallel
   authority. Run focused checks during the pass and the complete repository
   guard before handoff.

## Projections and child records

A projection may remain only when a current product or transport requirement
independently needs it. It must:

- have an explicit projection name;
- derive from validated canonical authority;
- contain only the bounded fields its consumer needs;
- never be accepted as the canonical Entity or as access authority; and
- have a rebuild, verification, and retirement story appropriate to its job.

Existing consumers, migration inconvenience, or an old guard are not evidence
that a projection is required.

An Entity-owned child collection is not legacy merely because it is absent
from the root type. Team, Finance, operational records, and other children may
remain beneath the Entity when their ownership is genuine. The failure to
remove is duplicated identity or authority elsewhere in the hierarchy.

## Failure pattern

The recurring incomplete loop is:

```text
legacy consumer uses duplicate data
→ migration preserves duplicate data
→ dual writer keeps it current
→ guard requires the old consumer
→ the legacy hierarchy appears canonical
```

Break the loop by moving consumers to canonical authority before retiring the
stored duplicate, then make guards reject its return.

## Handoff evidence

For every gate, record:

- exact files and databases inspected;
- matching source and identified drift;
- files or records changed;
- migration plan, hash, retained recovery evidence, and verification when data
  changed;
- focused checks and complete guard result; and
- any remaining difference classified as `accepted`, `drift`, or
  `to-confirm`.

Do not use `migration` as a completion state. Migration debt means the Entity
is not yet complete.
