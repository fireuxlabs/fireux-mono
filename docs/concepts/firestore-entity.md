Firestore entity spine map
Updated: 2026-07-18
Ref: 1fabff8be
Role: map, not canon

Purpose:
Map the stored access/composable shape for FireUX entities.

Vertical links:
- Parent: entities.md
- Parent: composables.md
- Child: family-console-entity.md
- Child: family-menu.md

Horizontal links:
- console.md
- server-api.md

Allowed entity stack:
- `composables/fireux/firestore/<entity>`
- `fetch`
- `mutations`
- `seo`
- `utils`

Example Firestore stack names, not automatic entity proof:
- `kitchen`
- `supplier`
- `product`
- `place`
- `company`
- `blog`
- `property`
- `portfolio`
- `ingredient`
- `recipe`
- `dish`
- `menu`
- `translation`
- `job`
- `task`

Similarities:
- Stored entity stacks should be boring and predictable.
- Fetch and collection concerns belong in `fetch`.
- Writes belong in `mutations`.
- UI mapping belongs in `utils/view` when present.

Read-state contract:
- `useFirestoreRead` is the shared reactive read authority. Its collection and
  document refs preserve normal `.value` access while also exposing `data`,
  `pending`, `error`, `outcome`, `promise`, and `stop`.
- An inactive path/query is `idle`; an active unresolved read is `pending`; a
  failed read is `error`. Only a successful settled read may become `empty` or
  `missing`; successful data is `ready`.
- Reactive source changes reset stale rows. Exact-id batches expose the same
  pending/error/outcome distinction and do not turn failures into empty arrays.
- Construct each live read once during setup and pass reactive collection-path,
  document-path, document-id, or query inputs into that read. The shared read
  owns source replacement and scope disposal; do not create live reads inside a
  `computed`, `watch`, or render-time factory.
- When a document combines authoritative data with optional enrichment, its
  public pending/error/outcome state follows the authoritative source. Optional
  enrichment may improve a ready record but must not turn it into a false error
  or missing result.
- Collection-family composables derive their public outcome after normalization
  and access filtering, then return `count`, `pending`, `error`, and `outcome`
  alongside the collection.
- Existence checks and other one-shot operations use `firestoreGetDoc`; do not
  `await firestoreFetchDoc`, because the latter returns a live Ref.
- Current source: `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts`.
- Current collection-state seam: `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCollection.ts`.

Differences:
- Some entities are root/public.
- Some entities are scoped to a console or parent.
- Some entities are both, but that must be explicit in the model and route behavior.
- Model placement and Firestore composable placement are related but not identical.
- Root/both profile models can live on the root model spine while current Firestore composables remain grouped under `firestore/profiles/<Profile>` until that stack is deliberately realigned.

Do not:
- Put console operation folders inside Firestore stacks.
- Add architecture buckets such as `facade`, `stack`, `manager`, `processor`, or `handler`.
- Create fake compatibility branches without an explicit user request.
- Infer loading from `collection.value === undefined`; VueFire collections begin
  as arrays, so use the shared `pending` ref.
- Treat read errors as empty or missing records.

Open questions:
- Menu needs continued cleanup because root menus and kitchen menus currently overlap conceptually.
