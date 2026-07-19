Entities map
Updated: 2026-07-19
Ref: a6fb7062d
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
- Project, Ecosystem, and App are root entities related by ids; hierarchy does
  not require nested Firestore storage.
- The current App is the root `apps/{appId}` entity selected by
  `FireUXConfig.appId`, not a separate App kind or storage scope.
- A direct Project App and an App related through the Project's Ecosystem are
  ordinary root App entities too.
- Project access is Project-owned. It is never collected from App, Kitchen, or
  another entity's team.

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
- `root`: standalone/root public or system entity.
- `scoped`: lives under a parent entity/app.
- `both`: has root identity plus scoped/app-operational state.
- `none`: no stored entity shape.
- `to-confirm`: not settled yet.

Model placement spine:
- Root or root-plus-overlay identity models live on the root model spine as `models/<entity>.model.ts` when the root identity is the primary concept.
- Kitchen-scoped operational models live under `models/kitchen/<operation>.model.ts`.
- Menu-owned support records live under `models/kitchen/menu/<record>.model.ts` while Menu remains a kitchen operation with a public doorway.
- Root/public capability profiles such as Chef, Customer, and Driver use root model files even if their Firestore composables stay grouped under `firestore/profiles` for now.
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
- App.
- Ecosystem.
- Project, for public browse and root operator filtering.
- Menu.
- Place.
- Blog.
- Product.
- Ingredient.

Root Synced Snapshot Index members:
- Kitchen carries public Place snapshot fields; Place stays ignorant of Kitchens.
- Company carries public Place snapshot fields; Place stays ignorant of Companies.
- Job carries public workplace snapshot fields; the jobs/workplace domain owns the cascade.
- Chef, Customer, Driver, Agent, and Professional carry public User summary snapshots; User knows its attached profiles.

Root Projected Index members:
- User is public identity at `/users/{userId}`. The public users API still owns
  browse DTO shape and canonical handle routes; it must never read the sibling
  private account record.

User identity records:
- `User` is the public global entity: handle-slug identity, public presentation,
  `app_ids`, and attached profile ids.
- `User.avatar` stores an explicit user image when one exists; otherwise it uses
  `/img/ecosystem/avatar.png`. Core/FireUX placeholder art is never public User
  identity.
- `UserPrivate` is the user-owned private account record at
  `/users/{userId}/private/account`; it contains email and versioned terms
  acceptance evidence.
- `UserApp` is the app-owned membership record at
  `/apps/{appId}/users/{userId}`; app role, entitlement, console access, and
  app notifications belong here.
- App authorization is never mirrored onto public `User`.

App event records:
- `AppEvent` is an append-only support record under
  `/apps/{appId}/events/{eventId}`; it is not a standalone entity.
- User membership materializes `app.user.joined` as an app-owned fact. The
  event targets the App, not a hard-coded admin or delivery channel.
- Notification, email, push, audit, and ecosystem consumers subscribe to App
  events and own their own delivery/read state.

Scoped/Overlay Access members:
- Supplier root browse is simple; operator-filtered access may join app-scoped supplier overlays.
- Portfolio root browse is simple; operator-filtered access may join app-scoped portfolio overlays.
- Property root browse is simple; scoped overlay shape is explicit.

Root index entity examples:
- App: `/apps`.
- Ecosystem: `/ecosystems`.
- Project: `/projects`.
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
- Project: entity, root, console-entity.
- Kitchen: entity, both, console-entity.
- Supplier: entity, both, console-entity.
- Portfolio: entity, both, console-entity.

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
