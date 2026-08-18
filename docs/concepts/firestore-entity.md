# Firestore entity stack family

Updated: 2026-08-18
Ref: e23268507
Role: map, not canon

## Purpose

Map the stored access/composable shape for FireUX entities.

The Firestore stack is one storage slice of the wider entity capability family.
The entity family also owns route identity, bounded server projections,
lifecycle policy, events, interface projection, and its page, Console, Tool,
and operator adapters. It is not merely a CRUD wrapper around a collection.

## Vertical links

- Parent: entities.md
- Parent: composables.md
- Child: family-console-entity.md
- Child: family-menu.md

## Horizontal links

- console.md
- server-api.md
- runtime-filesystem.md

## Allowed entity stack

- `runtime/<entity>/composables/firestore`
- `fetch`
- `mutations`
- `seo`
- `utils`

The root `runtime/composables` spine owns only proven cross-entity Firestore
primitives. Declared Entity adapters now live under
`runtime/<entity>/composables/firestore`, including Core User, App, and
Ecosystem. Completed legacy directories are guarded against returning, and no
aliases remain at both paths. Confirmed User-backed profile/record adapters use
the User scope in their owning extension package; to-confirm concepts stay on
the package spine until their classification changes.

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

## Similarities

- Stored entity stacks should be boring and predictable.
- Fetch and collection concerns belong in `fetch`.
- Writes belong in `mutations`.
- Firestore normalization and storage-specific validation belong in `utils`.
- Entity-facing computed state, permissions, interfaces, and profile views
  belong in `runtime/<entity>/composables`. Older `utils/view` and
  `composables/fireux/<entity>` locations are migration debt, not the target
  for new families.
- A bounded route reader belongs in `runtime/<entity>/composables` as
  `useXDetail`; it does not move the public DTO into the Firestore stack.
- An entity exposes only supported capabilities. Read-only or server-owned
  entities do not receive placeholder client mutations for structural parity.

## Mutation lanes

- Firestore has Client, Server, and MCP/Skill mutation lanes. Each lane exposes
  only Create, Update, and Delete through typed mutation targets.
- The lane selects transport and authority; the entity owns payload validation,
  permissions, lifecycle transitions, transactions, and resulting events.
- MCP/Skill is the operator lane used by Tools, agents, scripts, and CLI. It
  consumes the same typed target and entity command contracts instead of
  accepting arbitrary databases, collection paths, or raw writes.
- A page, Console, Tool, or operator adapter orchestrates entity capabilities;
  it does not become another storage or mutation lane.
- Current authority: `docs/ai/firestore-mutations-context.md` and
  `scripts/guards/firestore-mutations.mjs`.

## Update command grammar

- An ordinary entity `useXUpdate(options?)` exposes one `updateX(input)`
  command. The input contains named identity and a `changes` object; identity
  is never positional and is never mixed into the changed fields.
- Root example: `{ kitchenId, changes }`. Unbound child example:
  `{ kitchenId, memberId, changes }`. A Console child already bound to its
  selected parent runtime uses `{ childId, changes }`.
- The mutation lane still selects transport and authority. This grammar does
  not grant a client raw Firestore access or move server policy into a
  composable.
- Field workflows, transitions, media, membership, and compound relationship
  writes are named capabilities rather than artificial generic patches.
- Current executable shape guard:
  `scripts/guards/entity-update-contract.mjs`.

## Read-state contract

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
- Dynamic-cardinality keyed reads are the narrow exception. Their reconciliation
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

## Accepted storage deltas

- Some entities are canonical roots; public readability is a separate contract.
- Some entities and records have `parent-scoped` identity.
- Some root entities have a separate App support record. That support record is
  not another entity scope or fallback identity.
- An app-private profile record uses only the app-scoped path, records its id on
  `AppUser.profiles`, and must not acquire a root collection or public index.
- Every root profile record is domain-only and uses its document id as the
  canonical `/users/{uid}` join key. Public presentation joins or projects
  that User; root profile documents never embed a User summary.
- Every App profile delta record is non-identity support: it does not duplicate
  public User identity, and successful create/repair records the profile id on
  `AppUser.profiles`. Root-backed profiles separately retain their public root
  record and `User.profiles` id.
- Model placement and Firestore composable placement are related but not identical.
- Root profile models with App delta records keep raw reads, writes, and config
  under `firestore/profiles/<Profile>`. Chef and Driver prove the aligned
  consumer seam: state, interface, and SEO live under
  `composables/fireux/<profile>`.
- Project/Ecosystem/App hierarchy uses root documents plus child-owned relation
  ids, not nested storage: `Ecosystem.project_id`, `App.project_id`, and optional
  `App.ecosystem_id`.
- Public directory DTOs are support projections outside Firestore entity stacks;
  they do not create another storage scope or another entity.
- Root profile directories use bounded domain-owned projections that join the
  profile document to canonical User by uid; raw profile collection listeners
  are reserved for neither public browse nor identity resolution.
- Private Project control-plane reads do not expose a client Firestore
  collection binding; the FireUX admin server boundary owns that read.
- Deployed Firestore rules must independently deny unauthorized direct Project
  reads; this repository does not currently carry or test that remote ruleset.

## Root plus App support contract

- Supplier, Portfolio, Property, and Kitchen declare `identity: 'root'` plus
  `appSupport: 'access-record'`: one root entity plus a same-id App support
  document. App support is a separate relationship/access record, not a storage
  scope of entity identity.
- The root owns identity, lifecycle, domain truth, and child-owned relationship
  ids. It does not contain App access arrays. Property root also excludes its
  guest manual and references Place and optional Portfolio by id.
- Every Console-capable root declares one exact `management` relationship:
  `{ mode: 'root' }`, `{ mode: 'console' }`, or
  `{ mode: 'app', app_id }`. The ladder is cumulative: Console implies root;
  App implies Console and root. `console` always resolves to the ecosystem App
  (`<ecosystem>-app`); neither configuration nor the root duplicates that id.
  Only a dedicated App relationship stores `app_id`.
- The management relationship selects the App support/operations host. It does
  not relocate root truth, grant access, or replace the same-id App support
  record.

## Model source contract

- Entity model files read in one order: vocabulary and canonical types;
  supporting-record types; one storage declaration per stored record; the
  entity declaration; `*Defaults` runtime seeds; then create/update inputs.
- `*Defaults` means a runtime seed or resolved display default. A stored record
  remains sparse unless its write contract explicitly requires every field.
- Root and App-support records never share a combined storage object. Use
  `XStorage` for the entity root and `AppXStorage` for its App support record.
- Entity-facing composables live at
  `runtime/<entity>/composables/useXDetail.ts` and `useXInterface.ts`.
  Firestore reads and writes remain adapters beneath
  `runtime/<entity>/composables/firestore/`.
- The App document owns bounded access and only its declared non-secret delta.
  Collection adapters type it as the named `App<Entity>` record, require the
  root, and project allowlisted fields instead of spreading it over identity.
  Supplier, Portfolio, Property, and Kitchen enforce that join. Kitchen also
  requires its same-id Place: Place owns physical identity and location media,
  Kitchen owns operational identity/configuration, and AppKitchen owns access
  only.
- Property manual credentials live separately at
  `apps/{appId}/properties/{propertyId}/private/manual`; collection access
  queries never download that private support record.
- ID-targeted Supplier, Portfolio, and Property joins exact-load requested App
  documents by id before composing the root surface. They do not list every App
  record and filter in browser memory. The root management relationship must
  resolve to the current App; only complete, same-id root/App pairs enter the
  target collection.
- A missing pair half, dangling App document, or root/App management mismatch is an
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
  trusted lifecycle can maintain root management and App-support access
  indexes together.
- Console attachment remains domain-owned. Core defines and resolves management
  modes but contains no registry or create factory for Kitchen, Supplier,
  Property, Portfolio, or future Console families.
- Property-to-Portfolio membership is `Property.portfolio_id`. The former
  nested full-Property reader under an App Portfolio is retired. The client
  query activates only after the selected Portfolio has been resolved through
  its App access record and then exact-validates each returned management
  relationship; owner-database Rules still have to enforce that inheritance
  contract.
- Public Property browse uses the bounded server `/api/properties` projection;
  the browser never binds raw Property roots. Creation defaults publication to
  `draft`, and the projection emits only active, explicitly `published` roots.
  Browse cards stay unlinked until a bounded public detail read exists.
- Current source: Supplier, Supplier Item, Product, Ingredient, Portfolio, and
  Property model/fetch/mutation stacks.
  Shape guards: `scripts/guards/root-app-support-authority.mjs` and
  `scripts/guards/entity-management.mjs`.

## Migration and drift register

| Difference                                                                                        | State        | Required direction                                                                                                   |
| ------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| Supplier and Portfolio do not exact-validate every root field                                     | `migration`  | Reconcile live data first, then add validators without relabelling read errors as missing                            |
| Remaining profile consumers below `firestore/profiles/<Profile>` use the old organizational spine | `migration`  | Follow the Chef/Driver split when each complete profile family is aligned; do not move raw adapters out of Firestore |
| Some folders exist because a thing is stored, not because entity-ness was confirmed               | `drift`      | Check `entities.md` and the executable entity matrix before adding root entity ceremony                              |
| Older entity-facing view helpers remain inside Firestore stacks                                   | `migration`  | Move one entity and all of its consumers together; User and App are the proving siblings                             |
| Project direct-read Rules are outside the currently tested repository contract                    | `to-confirm` | Identify and verify the deployed Rules owner before claiming end-to-end control-plane denial                         |

## Do not

- Put console operation folders inside Firestore stacks.
- Add architecture buckets such as `facade`, `stack`, `manager`, `processor`, or `handler`.
- Create fake compatibility branches without an explicit user request.
- Infer loading from `collection.value === undefined`; VueFire collections begin
  as arrays, so use the shared `pending` ref.
- Treat read errors as empty or missing records.
- Let an App support record overwrite root identity, stamps, or relationships.
- Fabricate a root entity from an App record when root resolution fails.
- Accept caller-selected `scope`, `shape`, or `collectionPath` in a root-with-App-support
  mutation helper.

## Alignment roadmap

### Now

- Keep ordinary entity stacks boring: root seam plus `fetch`, `mutations`,
  `seo`, and `utils` only when used.
- Preserve explicit read outcomes and complete root/App-support pairs.

### Next

- Keep Kitchen, required Place, and access-only AppKitchen exact-pair reads
  aligned across Live, Demo, and Test sources.
- Reconcile Supplier and Portfolio roots before introducing strict validators.
- Audit stored folders against confirmed entity/record declarations.

### Later

- Revisit profile composable placement only as one coherent family pass.
- Verify the external Project Rules boundary before documenting it as guarded.
- Follow `family-menu.md` for Menu content migration; Menu/KitchenMenu identity
  is already settled.
