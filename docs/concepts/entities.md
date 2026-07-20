Entities map

<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: lock explicit Place references, sparse truth, trusted child-operator writes, and Kitchen directory publication. -->
<!-- Concurrent edit — 2026-07-20 22:21 CEST — Both-Entity Authority: map canonical roots, app support records, and child-owned relationships. -->

<!-- Concurrent edit — 2026-07-19 17:52 CEST — Directory Publication Scaffold: map dormant publication support records and enablement gate. -->
<!-- Concurrent edit — 2026-07-19 22:15 CEST — Directory Publication Rules Pass: map isolated support databases and deterministic blocker decisions. -->
<!-- Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: separate public profiles from app-private Customer and Driver operations. -->
<!-- Concurrent edit — 2026-07-20 12:27 CEST — Directory Live Pass: record provisioned support databases and verified one-time remediation. -->
<!-- Concurrent edit — 2026-07-20 13:12 CEST — Driver authority: map server-owned Kitchen grants and non-PII dispatch beacons. -->
<!-- Concurrent edit — 2026-07-20 13:19 CEST — Profile overlay follow-up: map delta-only app records and independent public/app profile indexes. -->
<!-- Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: make User the sole public identity joined by profile uid. -->
<!-- Concurrent edit — 2026-07-20 20:12 CEST — Repo Efficiency Pass 2 of 6: map projected public profile reads and owner-only raw authority. -->

Updated: 2026-07-20
Ref: 4c0a1c7ad
Role: map, not canon

Purpose:
Map the FireUX meaning of entity markers.

Vertical links:

- Parent: fireux.md
- Child: firestore-entity.md
- Child: family-console-entity.md
- Child: family-menu.md

Horizontal links:

- console.md
- app-config.md
- pages.md

Type source:

- `packages/core/fireux-core/src/runtime/models/core/entity.model.ts`

Working language:

- FireUX defines entities.
- Firestore is one storage/access family for an entity.
- A thing can have a model or an id without being a FireUX entity.
- Entity-ness is discussed while a concept is being designed; do not set a new thing in stone just because it has a file, route, or collection.

Top hierarchy:

- Project, Ecosystem, and App are root entities related by child-owned ids;
  hierarchy does not require nested Firestore storage.
- `Ecosystem.project_id` points to Project. `App.project_id` points to Project.
  `App.ecosystem_id` is present only for an Ecosystem App. Project and Ecosystem
  store no inverse child-id arrays.
- The current App is the root `apps/{appId}` entity selected by
  `FireUXConfig.appId`, not a separate App kind or storage scope.
- A direct Project App and an App related through an Ecosystem are
  ordinary root App entities too.
- Project is private FireUX control-plane truth. Its collection is read through
  an authenticated FireUX App-admin server boundary; there is no Project
  membership/team model.
- `FireUXConfig.ecosystem` selects infrastructure/package binding;
  `projectId` and optional `ecosystemId` express entity relationships.

Kinds:

- `entity`: domain thing FireUX tracks as a first-class concept over time.
- `record`: stored support record owned by an entity.
- `shape`: embedded or transport shape.
- `primitive`: reusable low-level value type.
- `bucket`: organizational folder, not domain truth.

Thinking aid:

- Entity is class-like: identity matters over time, fields can change, references point to the same thing, and lifecycle/authority/public surfaces may belong to it.
- Shape or record is struct-like: value/context matters more than independent identity, and it is usually replaced, copied, or deleted with its parent.
- This is only an analogy. Do not import class inheritance thinking into the model system.

Entity-ness checkpoint:

- What is the concept called in plain human language?
- Does it still mean something if its parent is deleted?
- Does it need its own lifecycle, permissions, public route, console surface, or collection stack?
- Is it referenced by multiple parents?
- Is it a wrapper around another entity, or the thing itself?
- Can it start as a `record` or `shape` until the lifecycle proves it needs promotion?

Storage scopes:

- `root`: canonical top-level identity. It may be public, private control-plane,
  or system truth; root is not a synonym for public-readable.
- `scoped`: lives under a parent entity/app.
- `both`: has one canonical root identity plus a scoped app support record.
- `none`: no stored entity shape.
- `to-confirm`: not settled yet.

Both-entity authority boundary:

- Supplier, Portfolio, Property, and Kitchen have one canonical root entity.
  Their matching App document is a support record, not another copy or storage
  scope of the entity.
- The App record may contain access (`operator_ids`, `team_ids`, and
  `join_requests`) plus only an explicitly modelled operational delta. Property
  keeps its guest manual there; it never stores that manual on the root.
- An App support record cannot supply identity or exist as a usable entity
  without its matching root. Joined reads start from the root, allowlist the App
  delta, and report a dangling App record as authority drift.
- Root identity and App operations use separately named, fixed-path mutation
  seams. A caller cannot select a scope or collection path. Types and rereads
  improve correctness; deployed Rules or a trusted server transaction remain
  the security boundary for create, attach, transfer, and access changes.
- Cross-root relationships are child-owned ids. Property owns optional
  `portfolio_id`; Portfolio stores neither an inverse Property array nor nested
  full Property copies. Property also references canonical Place with
  `place_id`; shared address/location truth stays on Place.

Model placement spine:

- Root or root-plus-overlay identity models live on the root model spine as `models/<entity>.model.ts` when the root identity is the primary concept.
- Kitchen-scoped operational models live under `models/kitchen/<operation>.model.ts`.
- Menu-owned support records live under `models/kitchen/menu/<record>.model.ts` while Menu remains a kitchen operation with a public doorway.
- Root/public capability profiles such as Chef and Driver use root model files even if their Firestore composables stay grouped under `firestore/profiles` for now.
- Customer is an app-scoped private ordering record. Its root model placement is organizational only; it has no root profile document or public index.
- Parent-local wrappers such as KitchenIngredient and KitchenSupplierIngredient live under the parent model folder, not beside the root Ingredient model.

Route/index families:

- Root index entity: has or deserves a public/root index route like `/<entities>`.
- Scoped entity/record: only makes sense under a parent route or console context.
- A root index entity may still have scoped operational records, but its public index should start from the root/public collection doorway.
- A scoped entity/record should not be forced into root index ceremony just to reuse a collection manager.

Root index classes:

- Root Simple Index: root/public index entity whose index can render its own collection without linked document hydration.
- Root Synced Snapshot Index: root/public index entity whose rows carry copied public card/list fields from a source entity.
- Root Projected Index: root/public index entity whose raw root rows are too sensitive or broad, so a safe server projection powers browse UI.
- Scoped/Overlay Access: root entity with app-scoped access/delta records used by console or operator filters.
- Detail Hydration: detail surfaces may enrich a single entity with linked truth; this is not a collection-manager class.
- Scoped Surface: parent-scoped route or console surface that should not use root collection-manager ceremony.

Root Simple Index members:

- Menu.
- Place.
- Blog.
- Product.
- Ingredient.

Root Synced Snapshot Index members:

- Company carries public Place snapshot fields; Place stays ignorant of Companies.
- Job carries public workplace snapshot fields; the jobs/workplace domain owns the cascade.

Place authority boundary:

- Place owns facts shared by every role at one physical location: address,
  coordinates, timezone, public contact/media, currency, and business hours
  when known. Unknown optional truth is absent, never an empty stored string,
  array, or object.
- Kitchen, Property, and future location-role entities reference Place and own
  only their domain delta. A denormalized public card projection is a read
  optimization, not a second editor or source of truth.
- Their relationship is an explicit child `place_id`. Runtime code does not
  infer that a Kitchen or Property id is also a Place id; a missing reference
  fails closed and is repaired by a deliberate migration or onboarding step.
- Supplier already references Company and can cover several delivery areas. A
  single Supplier-to-Place edge remains `to-confirm`; do not invent or infer it
  until the product decides whether Supplier identity is company- or site-level.
- Kitchen operation hours are an optional operational override. Without that
  override, runtime resolution reads the linked Place business hours. Menu and
  ordering-surface schedules continue the same single-parent inheritance chain.
- Authenticated Place edits use the trusted `PATCH /api/places/:placeId` seam.
  Place owner, current-App admin, and explicitly linked Kitchen-operator access
  are checked on the server; Kitchen console presentation state never grants a
  direct browser write to the shared Place record.

Root Projected Index members:

- Kitchen public browse reads hydrate bounded Place projection fields through
  `/api/kitchens`; canonical Kitchen records do not copy shared Place configuration.
  Place stays ignorant of Kitchens. The Kitchen identity console owns its
  directory publication control; absence means unpublished, and the public
  projection requires explicit publication, a slug, and an existing linked Place.
- App public browse consumes an allowlisted `AppDirectoryEntry`. Owning
  Ecosystem Apps use `/api/public/apps`; FireUX uses the platform directory.
- Ecosystem public browse exists only as FireUX `EcosystemDirectoryEntry`
  projections; canonical Ecosystem truth remains in the owning database.
- User is public identity at `/users/{userId}`. The public users API still owns
  browse DTO shape and canonical handle routes; it must never read the sibling
  private account record.
- Chef, Driver, Agent, and Professional root documents are domain-only profiles
  keyed by canonical User uid. Their public projections join the schema-valid
  `/users/{userId}` identity; profile documents never copy display name,
  avatar, handle, or another embedded `user` snapshot.
- Root Agent, Chef, and Professional documents store their complete canonical
  model shape. Domain seeds create every field and Firestore Rules reject
  sparse records, removed canonical fields, aliases, and extra fields.
- Their owners can edit only their own root domain fields. Agent, Chef, and
  Professional App overlays are stamps-only; separate root/App mutation seams
  prevent a caller-selected scope from turning an identity edit into an App
  write. There is no admin-on-behalf browser editor.
- Raw Agent, Chef, and Professional root reads are owner-only. Public indexes
  and details use bounded domain API projections; detail pages resolve the
  projected User/profile pair during SSR and preserve truthful outer 404/5xx
  status.
- A Professional owner write changes at most one structured family at a time.
  The Rules validator deeply checks every changed item while retaining the
  aggregate 24-item cap across all structured families.
- Public profile URL fields are empty or valid HTTPS. Professional experience
  stores only a valid `place_id`, canonical collection hint, and experience
  fields; both experience families hydrate the referenced root Place and never
  persist Place snapshots. The editor materializes the Place before assigning
  the reference. Structured experience writes must move to a trusted server
  verifier before the currently blocked client Place root is promoted.
- App profile overlays are delta-only and never copy public User identity.
  Every app-backed profile id belongs to `UserApp.profiles`; root-backed
  profile ids additionally belong to public `User.profiles`.
- Fixed domain endpoints call
  `packages/core/fireux-core/src/runtime/server/utils/profile/provision.ts`.
  Domain models provide exact root/app seeds; the trusted transaction creates
  missing records and updates both profile indexes in canonical order. Browser
  code supplies only its Firebase bearer token and cannot choose ids,
  collections, seeds, stamps,
  or mutate the derived indexes independently. The endpoint provisions only
  the caller and only profile ids declared by the current App's runtime
  `profiles`; disabled handlers fail before Firestore access.

User identity records:

- `User` is the public global entity: handle-slug identity, public presentation,
  `app_ids`, and attached profile ids.
- `User.avatar` stores an explicit user image when one exists; otherwise it uses
  `/img/ecosystem/avatar.png`. Core/FireUX placeholder art is never public User
  identity. The stored value is never blank: it is that canonical fallback or
  a valid HTTPS URL, and every public projection fails closed to the fallback.
- `UserPrivate` is the user-owned private account record at
  `/users/{userId}/private/account`; it contains email, private preferences,
  and versioned terms acceptance evidence.
- `UserApp` is the app-owned membership record at
  `/apps/{appId}/users/{userId}`; app role, entitlement, console access, and
  profile membership belong here. Owner delivery/read state lives at
  `/users/{userId}/notifications/{notificationId}`, including notifications
  produced from app events. Every profile with an App overlay records its id
  on UserApp, whether or not that profile also has a public root record.
- Notification producers are trusted server pipelines. Owners may read and
  acknowledge their records, but browser code does not publish notifications.
- App authorization is never mirrored onto public `User`.

Profile privacy boundaries:

- Customer exists only at `/apps/{appId}/customers/{userId}`. Ordering name,
  phone, allergy notes, saved addresses, and order history are app-private.
- Customer-owned order link records may remain at
  `/customers/{userId}/orders/{orderId}` as server-only support records; that
  parent path does not restore a root Customer profile.
- Driver root records contain public capability/presentation fields. Driver
  phone, tender preferences, and kitchen links exist only in the app overlay.
- `AppDriver.kitchen_links` and its derived `active_kitchen_ids` authorization
  index are server-owned. Runtime App admins or current Kitchen operators may
  grant/revoke links only for App members with an AppDriver record. Drivers see
  open work through minimal server-projected dispatch beacons; full Kitchen
  Orders remain operator-only until a separate assigned-driver detail contract
  is deliberately introduced.
- Agent contact email, phone, and website are deliberately public business
  contacts when the Agent profile is public.

App event records:

- `AppEvent` is an append-only support record under
  `/apps/{appId}/events/{eventId}`; it is not a standalone entity.
- User membership materializes `app.user.joined` as an app-owned fact. The
  event targets the App, not a hard-coded admin or delivery channel.
- Notification, email, push, audit, and ecosystem consumers subscribe to App
  events and own their own delivery/read state.

Directory projection records:

- `AppDirectoryEntry` and `EcosystemDirectoryEntry` are copied public transport
  records, not entities, storage scopes, or competing canonical truth.
- Directory fields are allowlisted. Access, moderation, build metadata,
  inverse relationships, and Project control data stay out.
- An App is canonical in its resolved runtime database: explicit app
  `databaseId`, otherwise its Ecosystem binding database. An Ecosystem is
  canonical in the owning Ecosystem identity database, never an app override.
- FireUX still reads existing central App/Ecosystem rows as legacy projection
  input. Those rows are not authority. A default-off receiver, dormant owner
  trigger/outbox factory, and guarded tools prove the intended boundary without
  switching live reads or activating publication.
- The locked one-time remediation has repaired five App relationships across
  nine physical documents and created two missing App plus four missing
  Ecosystem owner roots. Independent reconciliation now reports zero
  `MISSING_OWNER` and zero `RELATION_DRIFT`; the `niederhorn` and `qrdoc`
  exclusions remain untouched. Remaining public/directory drift belongs to a
  later publication cutover, not canonical owner repair.
- Canonical entity databases hold no delivery state. Six Standard,
  delete-protected support databases are live: FireUX `directory-outbox` and
  `platform-directory`, plus `directory-outbox` for Bringli, Cleanbox, Granite,
  and Misebox. Their client rules deny all access. Slap `directory-outbox`
  remains uncreated because the Slap project has no billing; do not imply that
  the seven-database topology is complete.
- Each ready project has a dedicated publisher identity and a conditional
  database-only custom role with get/create/update but no list/delete; FireUX
  also has the isolated receiver identity for `platform-directory`. Slap
  publisher identity and source authorization remain pending. No publisher or
  receiver is deployed or enabled.
- One publisher service account may cover several canonical database scopes.
  Its source authorization id digests the OIDC subject and exact source tuple,
  so one source cannot borrow another source's allowlist.
- Publication uses versioned owner `upsert` and `retire` records. Only active
  payloads can be public; retirement persists a payload-free tombstone so a
  stale replay cannot resurrect a listing. A strictly newer active revision may
  republish it.
- Projection rows, retirement tombstones, publication receipts, source
  authorizations, and FireUX curation are support records, not entities.
  FireUX-owned `launch_order` stays separate from owner-published data;
  Ecosystem `app_count` derives centrally from active App projections.
- Contract source: `models/core/supporting/directory-publication.ts`. Receiver,
  reducer, transaction, and dormant owner seams:
  `server/utils/directory-publication/*`. Read-only tools:
  `scripts/reconcile-platform-directory.mjs` and
  `scripts/plan-platform-directory-backfill.mjs`. The planner still has no
  mutation mode. `scripts/remediate-platform-directory.mjs` is the separate,
  hash-locked one-time executor: it applied 15 conditional writes in ten
  journaled database batches with a private preimage backup and no document
  deletion. Publisher scope and rule deployment inputs live under
  `scripts/_lib/directory-publication-targets.mjs` and
  `scripts/firebase/directory-publication`. Guards:
  `scripts/guards/directory-reconciliation.mjs` and
  `scripts/guards/directory-publication.mjs`.

Scoped/Overlay Access members:

- Supplier and Portfolio App records are access-only support records.
- Property App records contain access plus the exact operational guest manual.
- Kitchen App records carry access; Kitchen-owned operational child records stay
  under the selected App Kitchen path.
- Public browse is a separate read/projection decision for every family; root
  placement alone never authorizes a raw public collection read.

Root entity/index examples:

- App: `/apps`.
- Ecosystem: `/ecosystems`.
- User: `/users`.
- Kitchen: `/kitchens`.
- Menu: `/menus`, currently to-confirm because it bridges quick uploads and kitchen-owned menus.
- Ingredient: `/ingredients`.
- Recipe: no root public index for now. Current model/composable is kitchen-scoped; public recipe projection is future/deferred.
- Chef: `/chefs`, profile-root index.
- Supplier: `/suppliers`.
- Portfolio: `/portfolios`.
- Property: `/properties`.
- Place: `/places`.
- Blog: `/blog`.
- Company: `/companies`.
- Job: `/jobs`.
- Agent: `/agents`, profile-root index.
- Professional: `/professionals`, profile-root index.
- Product: `/products`.

Private control-plane root examples:

- Project: no public route; `/console/project` is FireUX-admin-only and
  currently read-only.

Scoped-only examples:

- Dish: kitchen-scoped today.
- Station: kitchen-scoped today.
- Order: kitchen-scoped today.
- Team: console/access/member scoped today.
- Task: portfolio-scoped today.
- MenuSection/MenuItem: records under Menu.
- MenuSourceUpload: support record under Kitchen.

First confirmed markers:

- App: entity, root, core/system.
- Ecosystem: entity, root, system.
- Project: entity, private control-plane root, console-entity.
- Kitchen: entity, both, console-entity.
- Supplier: entity, both, console-entity.
- Portfolio: entity, both, console-entity.
- Property: entity, both, console-entity.

First confirmed bridge marker:

- Menu: entity, storage both/bridge in behavior, because public menu doorways manifest kitchen-owned scoped menus.

Confirmed support records:

- MenuSection: record under Menu.
- MenuItem: record under MenuSection.
- MenuSourceUpload: record under Kitchen.
- KitchenIngredient: kitchen-local wrapper around ingredient usage.
- KitchenSupplierIngredient: kitchen-local supplier ingredient wrapper.

Confirmed means:

- Confirmed for the current implementation.
- Not eternal.
- If the product concept changes, discuss the entity-ness again before moving files or adding ceremony.

To-confirm examples:

- Recipe, Kitchen-scoped today; may grow public/root later only after a fresh entity/index decision.
- Product, likely root plus supplier/kitchen wrappers.

Not entity by default:

- Kitchen team join request.
- Document link.

Rule of thumb:
If deleting the parent makes the thing meaningless, start as a record or shape.
Promote it to entity only when it needs its own identity, route, collection stack,
console/public surface, or cross-parent lifecycle.

Default process:

- New concept starts as `to-confirm`.
- Discuss entity-ness before creating a full model/composable/page/console family.
- Prefer the smallest useful shape first.
- Promote later when repeated behavior proves the concept deserves entity status.
