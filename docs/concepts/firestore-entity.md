Firestore entity spine map
<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: record the app-only profile storage delta. -->
<!-- Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: bind domain-only root profiles to canonical User by uid. -->
<!-- Concurrent edit — 2026-07-20 13:19 CEST — Profile overlay follow-up: record the shared delta-only overlay and membership mirror. -->
<!-- Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: keep raw profile lists behind domain APIs. -->
<!-- Concurrent edit — 2026-07-20 23:03 CEST — Both-Entity Authority: record fail-closed App joins/queries, explicit Property publication, truthful validator limits, and Kitchen migration input. -->
<!-- Concurrent edit — 2026-07-20 23:33 CEST — Entity Vocabulary + Matrix Pass: replace combined storage language with explicit classification axes. -->
Updated: 2026-07-20
Ref: a4d382c1d
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
- Construct each fixed-cardinality live read once during setup and pass reactive
  collection-path, document-path, document-id, or query inputs into that read.
  The shared read owns source replacement and scope disposal; do not create live
  reads inside a `computed` or render-time factory.
- Dynamic-cardinality keyed hydration is the narrow exception. Its reconciliation
  watcher must normalize and deduplicate active IDs, reuse surviving bindings,
  stop bindings as IDs leave the set, and stop every remaining binding on scope
  disposal. Derived/computed mapping only reads the reconciled cache.
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
- Some entities are canonical roots; public readability is a separate contract.
- Some entities and records have `parent-scoped` identity.
- Some root entities have a separate App support record. That support record is
  not another entity scope or fallback identity.
- An app-private profile record uses only the app-scoped path, records its id on
  `UserApp.profiles`, and must not acquire a root collection or public index.
- Every root profile record is domain-only and uses its document id as the
  canonical `/users/{uid}` join key. Public presentation hydrates or projects
  that User; root profile documents never embed a User summary.
- Every App profile delta record is non-identity support: it does not duplicate
  public User identity, and successful create/repair records the profile id on
  `UserApp.profiles`. Root-backed profiles separately retain their public root
  record and `User.profiles` id.
- Model placement and Firestore composable placement are related but not identical.
- Root profile models with App delta records can live on the root model spine
  while current Firestore composables remain grouped under
  `firestore/profiles/<Profile>` until that stack is deliberately realigned.
- Project/Ecosystem/App hierarchy uses root documents plus child-owned relation
  ids, not nested storage: `Ecosystem.project_id`, `App.project_id`, and optional
  `App.ecosystem_id`.
- Public directory DTOs are support projections outside Firestore entity stacks;
  they do not create another storage scope or another entity.
- Root profile directories use bounded domain-owned projections that join the
  profile document to canonical User by uid; raw profile collection listeners
  are reserved for neither public browse nor identity hydration.
- Private Project control-plane reads do not expose a client Firestore
  collection binding; the FireUX admin server boundary owns that read.
- Deployed Firestore rules must independently deny unauthorized direct Project
  reads; this repository does not currently carry or test that remote ruleset.

Root plus App support contract:

- Supplier, Portfolio, Property, and Kitchen declare `identity: 'root'` plus
  `appSupport: 'access-record'`: one root entity plus a same-id App support
  document. App support is a separate relationship/access record, not a storage
  scope of entity identity.
- The root owns identity, lifecycle, domain truth, and child-owned relationship
  ids. It does not contain App access arrays. Property root also excludes its
  guest manual and references Place and optional Portfolio by id.
- The App document owns bounded access and only its declared non-secret delta.
  Collection adapters type it as the named `App<Entity>` record, require the
  root, and project allowlisted fields instead of spreading it over identity.
  Supplier, Portfolio, and Property enforce that join now. Kitchen's access-only
  App model is current, but its legacy composer and stored duplicate identity
  remain migration input and are not a reference implementation.
- Property manual credentials live separately at
  `apps/{appId}/properties/{propertyId}/private/manual`; collection access
  queries never download that private support record.
- ID-targeted Supplier, Portfolio, and Property joins exact-load requested App
  documents by id before composing the root surface. They do not list every App
  record and filter in browser memory. The root must name the current App scope;
  only complete, same-id root/App pairs enter the target collection.
- A missing pair half, dangling App document, or root/App scope mismatch is an
  error outcome, not a support-only entity, selectable stale row, or empty
  collection result.
- A physically present but schema-invalid Property root is also an error in
  collection, single-document, and Portfolio-membership reads; it is never
  translated to `empty`, `missing`, or a valid existing root.
- Supplier and Portfolio do not yet exact-validate every root field. Reconcile
  their live shapes before adding strict validators and the corresponding
  migration; do not describe their present pair/scope checks as exact schema
  validation.
- Root and App create/read seams have fixed paths and one shared id. Independent
  root/App deletes and generic App access mutation helpers are withheld until a
  trusted lifecycle can maintain root scope, access records, and UserApp target
  indexes together.
- Shared console attachment re-reads the root returned by an idempotent create
  before it checks App ownership. This closes accidental slug-collision attach
  drift but is not a security or transaction boundary.
- Property-to-Portfolio membership is `Property.portfolio_id`. The former
  nested full-Property reader under an App Portfolio is retired. The client
  query activates only after the selected Portfolio has been resolved through
  its App access record, constrains `app_scope_app_id` to that App, and then
  exact-validates the returned scope state; owner-database Rules still have to
  enforce that inheritance contract.
- Public Property browse uses the bounded server `/api/properties` projection;
  the browser never binds raw Property roots. Creation defaults publication to
  `draft`, and the projection emits only active, explicitly `published` roots.
  Browse cards stay unlinked until a bounded public detail read exists.
- Current source: Supplier, Portfolio, and Property model/fetch/mutation stacks.
  Shape guard: `scripts/guards/both-entity-authority.mjs`.

Do not:
- Put console operation folders inside Firestore stacks.
- Add architecture buckets such as `facade`, `stack`, `manager`, `processor`, or `handler`.
- Create fake compatibility branches without an explicit user request.
- Infer loading from `collection.value === undefined`; VueFire collections begin
  as arrays, so use the shared `pending` ref.
- Treat read errors as empty or missing records.
- Let an App support record overwrite root identity, stamps, or relationships.
- Fabricate a root entity from an App record when root hydration fails.
- Accept caller-selected `scope`, `shape`, or `collectionPath` in a root-with-App-support
  mutation helper.

Open questions:
- Menu content synchronization still needs cleanup, but identity is settled:
  root `Menu` and scoped `KitchenMenu` are distinct entities.
