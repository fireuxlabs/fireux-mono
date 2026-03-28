# Runtime Changelog
Authority: Tier2 (Operational history)
Updated: 2026-03-28

Tracks meaningful changes in the runtime branch system, especially when behavior shifts across pages, components, composables, models, and server seams.

Use this together with:
- `packages/core/fireux-docs/src/runtime/README.md`
- sibling runtime branch READMEs under `packages/core/fireux-docs/src/runtime/*/README.md`

## 2026-03-12 - Runtime Firestore DB selection became explicit

Previous:
- runtime database selection was less explicit in shared flows.

Now:
- runtime uses a clearer named-DB selection model and console discovery pipeline.

Why:
- support multi-app and multi-ecosystem scaling without hidden assumptions

Affected:
- firestore operations
- runtime project and server utilities
- console discovery behavior

## 2026-03-11 - Console routing simplified after Stitch removal

Previous:
- console routing still carried extra branch complexity from Stitch-era surfaces.

Now:
- console routing is simpler and better aligned with the active runtime families.

Why:
- reduce dead-path complexity
- keep current runtime behavior easier to explain and maintain

Affected:
- runtime routing composables
- console layouts
- runtime docs that describe console entry and page ownership

## 2026-03-10 - Runtime project entry became a clearer cross-surface concept

Previous:
- project runtime entry was split across CTAs, route assumptions, and console-specific flow logic.

Now:
- runtime project entry is treated as a clearer shared concept across CTA, create, and console flows.

Why:
- make runtime entry behavior easier to align across pages and composables
- reduce route-first reasoning where behavior is actually cross-cutting

Affected:
- runtime project composables
- CTA families
- console overview flow
