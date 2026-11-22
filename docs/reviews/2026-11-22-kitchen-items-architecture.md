# Kitchen and Items architecture audit

Reviewed November 22, 2026 against `7ce5946f5`. This is a source audit and proposed
sequence for review. Existing Firestore contents and deployed Rules were outside
the verification scope.

## Current ownership and execution

| Owner    | Stored contract                                                                                                                                                                                                              | Current behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kitchen  | `kitchens/{kitchenId}`. `identity` carries source, optional local name, slug, status and visibility. The root also admits stamps, context, guidance IDs, theme, and optional `orders`, `services`, and `tables` settings.    | The [Kitchen model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/model.ts) and [stored reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/read-kitchen-document.ts) own the Workspace record. The full App can hydrate a same-ID [Place](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenRead.ts) for venue identity.                                                                                                                                                                                                                                         |
| Access   | AppUser at `apps/{appId}/users/{uid}` and Kitchen grants at `kitchen_access/{uid}`. Grants are scoped to the App and current membership lifetime.                                                                            | The [read gate](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenAccess.ts) and [trusted command authority](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/core/mutation-authority.ts) verify the same boundary. Workspace selection is local state.                                                                                                                                                                                                                                                                                                                                      |
| Item     | `kitchens/{kitchenId}/dishes/{dishId}`. The [Item model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/items/item.ts) projects path ID, name, optional description/image and available stamps. | The [exact reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/items/useKitchenItemRead.ts) shares one listener for identity and [selling defaults](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/items/item-offer.ts). [Create](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/create.ts) and [update](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/update.ts) use Kitchen record authority. Name-only creation requires no Place, Menu, price, or Prep record. Prep reference checks apply when their fields are supplied. |
| Menu     | `kitchens/{kitchenId}/menus/{menuId}`. Its `sections/{sectionId}/items/{entryId}` children are placements.                                                                                                                   | The [placement command](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/items/write.ts) verifies the Menu, Section and source Item under the same Kitchen, then writes a `dish_id` reference or a `promotion_id`. The [guest reader](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/manifest/sections.ts) resolves Item content from the Kitchen's `dishes`.                                                                                                                                                                                                                                                  |
| Services | `kitchens/{kitchenId}/offerings/{offeringId}`.                                                                                                                                                                               | The [Service command](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/offerings/update.ts) validates selected Menu IDs. Service and Menu publication determine availability in their own contexts.                                                                                                                                                                                                                                                                                                                                                                                                                            |

The ordinary [Kitchen shell command](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/create-shell.ts)
atomically creates the Kitchen and its grant. The full path still creates a
same-ID non-physical Place for a name-only start. The opt-in `workspaceOnly`
[registration](../../packages/extensions/fireux-kitchens/src/module.ts) instead
creates a hidden Kitchen with its own name and no Place read or write.
The [Workspace route](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/pages/workspace.vue)
reuses Core sign-in and Workspace selection, reads the Kitchen without Place
hydration, and uses the [canonical update command](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/update.ts)
for rename. The full [Misebox composition](../../projects/misebox/misebox-app/nuxt.config.ts)
still installs the downstream capabilities. Guest Menu Hosting can provision
starter Menus through its own [guest workflow](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/guest.ts).

## Where the boundaries hold and where they leak

- **Storage already fits.** Items and Menus are sibling Kitchen collections. A
  Section placement does not own the Item. Removing a placement leaves the Item
  intact. The same Item can appear in multiple Menus.
- **Navigation is a grouping.** The [Items route](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menu/items/index.vue)
  appears under Menus. Its components are under `Workspace/Menu/Items`, and its
  record definitions are under `kitchen/records/menus/items`. These paths imply
  Menu ownership even though the reader uses the selected Kitchen's `dishes`.
  An Items-only App can be given its own entrance without moving any data.
- **Item Detail reaches into Menu.** It reads the [Item once](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menu/items/%5BdishId%5D.vue),
  then [mounts Menu presentation](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Index.vue),
  which can look up a public placement. In the Lasagne direction, an App with
  Menu enabled can compose that preview around the Item-owned detail.
- **Deletion has a deliberate reverse check.** [Item delete](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/delete.ts)
  and the [usage scan](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/usage.ts)
  protect Menu and Promotion references, including archived placements and
  historical IDs. Unregistered capabilities may still have saved references.
- **Kitchen-only registration is narrower than the root contract.** The
  canonical reader still validates `orders.operation_hours`, `orders.printing`,
  `services.title`, `services.item_images`, and `tables.count`. Invalid optional
  settings can fail the entire read. The root update surface still accepts
  selected Service and Tables settings. `services.item_images` is consumed as
  presentation policy. These are active dependencies, not fields to drop on
  sight. See the [root update input](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/update-input.ts)
  and [presentation reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-presentation.ts).

## Recommended minimum

- **Kitchen:** One root with path-derived `id`, identity and audit stamps. A
  standalone Kitchen owns its name. An attached Place supplies venue facts
  under an explicit name-ownership rule. Keep the existing slug, status and
  visibility contract for compatibility. Treat context, guidance, theme and
  operational settings as optional, with their readers owned by the capabilities
  that consume them. Keep access grants separate from the root.
- **Item:** One Kitchen child with path-derived `id`, a name, optional description
  and image, and audit stamps on new writes. Keep optional selling defaults on
  the same document as a separate projection. The Kitchen path supplies
  ownership. The Menu placement supplies its own display order and availability,
  and a Service supplies its own eligibility. No Menu ID is needed on an Item.

## Proposed sequence and compatibility

1. **Close Kitchen-only acceptance.** Use normal Core sign-in to create, open,
   rename and refresh a name-only Kitchen. Verify no Place document, child
   collections or downstream registration. Retest access revocation and the
   existing Place-backed flow. See the [local checkpoint](#kitchen-only-local-checkpoint).
2. **Enable Items on their own.** Prove create, list, detail and edit with Menu
   and Services absent. Keep the full App's existing route and contextual preview.
   Move source placement only where it clarifies Kitchen ownership. Preserve
   `dishes`, `dishId`, Item IDs, links and existing mutation authority.
3. **Add Menu, then Services.** Verify that a Menu adds references to existing
   Items and that a Service can select which Menu it offers. The current
   [Menu creation command](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/records/create.ts)
   requires Place currency even for a draft. Settle currency ownership before
   attempting a Menu on a Place-free Kitchen. Preserve publication checks.
4. **Consider stored-data changes only after a consumer audit.** Preserve root
   `currency`, `management` and `integrations` where present. The Workspace
   reader omits them, which is no evidence of safe deletion. Check root fields
   against their current Place and fixed-child owners before retiring copies.
   Preserve old Item category and `kitchen_id` data, and missing historical stamps.
   [Pricing](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-pricing.ts)
   still accepts legacy `price_options` and `add_ons` alongside `choice_groups`.
   Preserve their precedence and the distinction between unset and zero price.
   If storage really must change, scope an inventory, backup, compatibility
   read and rollback plan to the exact database before applying it.

## Decisions for approval

- Whether attaching a Place replaces the Kitchen's display-name authority or
  leaves the Kitchen name independently editable. Existing Place-backed names
  should keep their current behaviour while this is open.
- Whether to give Items a separate visible navigation entry in full Misebox, or
  keep the Menus grouping there and only give Items-only Apps a direct entrance.
- Whether to move active root settings at all, and which capability owns each.
  Decide separately where a Place-free Kitchen gets selling currency.
- Whether Item Delete should stay unavailable in an Items-only App until it can
  run the existing reference checks, or retain those checks as a trusted shared
  dependency. Do not weaken protection based on which routes are installed.

**Evidence.** 111 focused Kitchen access, root read/update, Item command/read,
and Menu placement cases passed. They establish source behaviour for the cases
exercised. This audit made no code, Rules, or data changes.

## Vertical canon consistency

**Verdict:** FireUX's ownership rules remain coherent down to Kitchen Items.
The stored relationship already follows them. The remaining conflicts concern
what the base code must load and validate, who composes the Item screen, and
how the narrow installation is documented.

### What aligns

| Step             | Canon applied to the source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FireUX → Entity  | [FireUX package ownership](../concepts/fireux.md#package-and-data-ownership) and [Lasagne](../concepts/lasagne.md) put neutral mechanics in Core, domain truth in Extensions, and product composition above them. [Workspace](../concepts/workspace.md) supplies selection and framing. The Kitchen reader and commands still check current App membership and the Kitchen grant. Entity ignorance does not remove those authorization inputs.                                                                                                                                                                                                                                                                                                                          |
| Entity → Kitchen | [Entity classification](../concepts/entities.md#kitchen-owned-menu-identity) allows Menu to be a distinct Entity with a Kitchen-scoped document and a sibling source root. The narrow Kitchen mode uses the same canonical Kitchen root, with name-only creation and rename functioning locally without Place or operational child records.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Kitchen → Items  | Item is a Kitchen-owned Record with its own child document and stable ID. It can be acquired once and reused by both Workspace detail and Menu consumers. [Firestore ownership](../concepts/firestore-entity.md#choose-the-document-shape-by-ownership) supports sibling `dishes` and `menus` collections and nested Menu placements. The [runtime convention](../concepts/runtime-filesystem.md#domain-component-surfaces) explicitly lets Workspace component folders follow navigation, so `Workspace/Menu/Items` can be correct for the full App. `records/menus/items` is less clear for a Kitchen-owned definition, but [the Entity map](../concepts/entities.md#parent-owned-records) already identifies it correctly. Neither folder requires a Firestore move. |

### Contradictions and implementation gaps

- **A lower read can fail because of an optional capability.** The
  [Firestore map](../concepts/firestore-entity.md#choose-the-document-shape-by-ownership)
  permits small Kitchen-owned settings on the root. The conflict is the
  [canonical reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/read-kitchen-document.ts)
  rejecting Kitchen identity when the Service, Order, or Tables configuration
  is invalid. Keep strict identity and access validation. Let each capability
  validate and report its own configuration failures. The Kitchen-only mode
  also registers the existing [update endpoint](../../packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/update.patch.ts),
  whose [accepted fields](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/update-input.ts)
  include Service and Tables settings. Narrow its write surface if this mode
  is intended to exclude those capabilities completely.
- **Item identity is independent, but the screen imports Menu.** The
  [Item detail](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Index.vue)
  uses one owning Item read, in line with Lasagne. It also mounts a Menu-owned
  preview directly. Prove the baseline with that preview absent and compose
  it above the Item surface in the full App. The deletion reference check
  protects existing downstream data and should remain intact while this is done.
- **The narrow Workspace previously left saved selection unreconciled.**
  [The page](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/pages/workspace.vue)
  now reuses settled-grant reconciliation, matching the
  [full Kitchen controller](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenWorkspace.ts).
  See the [local checkpoint](#kitchen-only-local-checkpoint).
- **Currency ownership is already established.** The earlier audit treated
  ownership as open. [Finance](../../packages/extensions/fireux-finance/README.md#operational-default-currency)
  assigns the optional default to the operating Entity and lets Place suggest
  a value. The [Menu family](../concepts/family-menu.md#item-offer-denomination)
  already calls for denomination on priced Item terms. The Menu command still
  reads Place currency and ItemOffer lacks the denomination field. What needs
  approval is the transition, including the denomination of existing bare
  prices and whether an unpriced private Menu draft can precede configuration.

### What the docs leave unresolved

- The [Kitchens README](../../packages/extensions/fireux-kitchens/README.md#kitchen-only-workspace)
  now explains the opt-in mode and points to `models/model.ts`. The
  [Misebox onboarding guide](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#kitchen-onboarding)
  describes the Place-writing path used by full Misebox.
- The [package contract](../concepts/runtime-package.md#registration-steps)
  distinguishes native discovery from explicit module registration. It does
  not explain how to graduate the present Kitchen-only module route into a
  maintained capability composition. The branch is a bounded proof and does
  not establish a new discovery convention or package split.

### Decisions still needed

- Keep one Kitchen model. Approve where optional settings are validated and
  which writes belong to the base installation before choosing any storage
  changes. Preserve the current Place-backed name behaviour until the name
  ownership policy for attachment is agreed.
- Approve the Items-only entrance and the owner that composes the full App's
  Menu preview. The existing Menus grouping may remain. Decide how Items-only
  installation handles deletion while enforcing every saved reference.
- Approve a currency adoption plan before any write or change to publication
  requirements. Items-only follows the Kitchen-only checkpoint. Keep existing
  document paths and IDs in both.

### Kitchen-only local checkpoint

The browser signed in through the standard Core email form using a prepared
local account. The Kitchen-only App created a Kitchen from a name, opened it,
renamed it and reopened the same selection after a full refresh. Removing its
grant cleared the selection cookie and hid the name and rename action both
immediately and after reload. The named emulator database confirmed no Place
or child collections. The Rules candidate denied the revoked account's read,
and the trusted rename command rejected it. Generated Nuxt registration
contained the Kitchen operations without Items, Menus, Services or Orders.
All 91 focused tests passed, including existing Place-backed command coverage.

### Independent Items local checkpoint

With `workspaceOnly: true` and `workspaceItems: true`, normal Core email
sign-in opened the Kitchen's direct Items list. A name-only create appeared in
the alphabetical list. Opening its exact detail and renaming it persisted
across refresh at the same URL. Readback in the named emulator database
confirmed `kitchens/{kitchenId}/dishes/{dishId}` was the only child storage used
and the Item had no price. Generated Nuxt routes and handlers confirmed that
Menus, Services and Orders were unregistered. An unrelated App member and the
revoked Kitchen owner both received `403` on update. Opening the detail after
revocation showed no Item. The in-app browser stalled during the live
revocation check, so that transition remains unverified.

## Vertical consistency follow-up (2026-11-23)

This follow-up compares the canon with the Kitchen-only, independent Items and
private draft checkpoints through `690d329f0`. The public Menu changes present
in the working tree are considered separately. The audit uses source inspection
and the recorded local checkpoints.

### Where the boundaries hold

- **FireUX → Entity.** The [platform ownership map](../concepts/fireux.md#package-and-data-ownership)
  and [Workspace contract](../concepts/workspace.md#ownership) put selection
  and framing in Workspace, and record authority in the domain. The
  [Kitchen-only controller](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenOnlyWorkspace.ts)
  uses shared selection and waits for settled Kitchen grants. App membership
  and the Kitchen grant are valid inputs to authority. They remain separate
  from identity and from the saved selection.
- **Entity → Kitchen.** One [canonical Kitchen model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/model.ts)
  serves the full App and the narrow mode. The latter proved a name-only
  Kitchen with no Place or capability records. The minimum creation input
  can be smaller than the readable record, which also includes identity,
  lifecycle, exposure, and provenance. The permission to keep small owned
  maps on that document comes from the [Firestore ownership rule](../concepts/firestore-entity.md#choose-the-document-shape-by-ownership).
- **Kitchen → Items.** The [Entity map](../concepts/entities.md#parent-owned-records)
  calls Item a Kitchen-owned Record. Its stable child document and exact
  detail URL are consistent with that classification. The
  [direct Items page](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/pages/items.vue)
  gates the editor on the selected Kitchen. The tested name-only create,
  list, detail and rename work without Menu registration. A Menu placement
  [references the existing Item](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/items/write.ts).
  Both the Items route and the Menus grouping can use the same `dishes` path.
  The [runtime filesystem map](../concepts/runtime-filesystem.md#domain-component-surfaces)
  allows operator component directories to follow navigation.

### Contradictions and avoidable dependencies

- **Base reads can fail on optional capability settings.** The
  [canonical reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/read-kitchen-document.ts)
  still rejects the whole Kitchen on malformed Orders, Services or Tables
  fields, even with Place hydration disabled. The
  [root update input](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/update-input.ts)
  also accepts Services and Tables changes through the base route. The failure
  and write boundaries are the concern. The storage rule already permits
  root maps, so changing those boundaries need not start with a data move.
- **Item code still knows its Menu consumer.** The full App
  [Item detail](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Items/Detail/Index.vue)
  includes a Menu preview, and the shared
  [Item actions](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/items/useItemActions.ts)
  explicitly refresh Menu payload keys after writes, even when called by the
  direct Items editor. [Lasagne](../concepts/lasagne.md) puts these consumer
  effects in the Menu-aware composition. Preserve actual preview freshness
  when changing the owner. The [Item deletion check](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/items/delete.ts)
  serves a different purpose. It protects stored references even when the
  Menu routes are absent.
- **The Item editor opens a broader session than it uses.** Its
  [scope guard](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/items/useItemEditorScope.ts)
  reads only the membership portion of the
  [User session](../../packages/core/fireux-core/src/runtime/user/composables/session/useUserSession.ts),
  which also starts the canonical User reader. The editor also consumes
  [Kitchen access](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenAccess.ts),
  which already resolves App membership. A future cleanup can remove the
  unrelated identity read and check whether the existing membership
  acquisition can serve both. Keep account, membership and grant invalidation.

### Documentation gaps and decisions

1. **Define what optional registration guarantees.** The
   [Kitchens module](../../packages/extensions/fireux-kitchens/src/module.ts)
   gates pages and handlers, while the same
   [package manifest](../../packages/extensions/fireux-kitchens/package.json)
   retains full dependencies, including Place and Finance. The local results
   establish registration and exercised behavior. They give no evidence of
   installing Kitchens with those dependencies unavailable. Decide whether
   registration-only composition is the maintained contract before growing
   the option list or changing package boundaries. In that contract, specify
   which root errors can block identity and which writes the base exposes.
2. **Name the owner of the full Item screen and its reverse checks.** The
   [Entity map](../concepts/entities.md#parent-owned-records) classifies Item
   correctly but points to its definition under `records/menus/items`.
   Document the difference between Kitchen record ownership, the full App's
   Menus navigation, and the direct Items entrance. Approve the composition
   owner for preview and refresh, and decide when Items-only can expose Delete
   with reference checks intact. None of these decisions requires a path
   migration.
3. **Separate Place attachment and currency from base creation.** The
   [Misebox onboarding context](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#kitchen-onboarding)
   describes the full Place-writing flow. The [operational currency rule](../../packages/extensions/fireux-finance/README.md#operational-default-currency)
   already assigns the optional default to the operating Entity, while
   [draft creation](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/records/create.ts)
   still requires a Place with a currency. Approve the name authority when a
   Place is attached, the denomination of existing bare prices, and whether
   unpriced private drafts can precede currency setup. Keep the publication
   readiness gate.

The uncommitted public Menu slice adds a browse-only branch to the existing
projection. That branch suppresses Service reads, and the recorded check
shows signed-out browsing after publish and refresh. The new guest page at
`menu/pages/browse.vue` uses `useFetch`. The
[server API contract](../concepts/server-api.md#api-reads-and-refresh)
calls for the owning live reader for mutable projections, as used by
[the existing Menu reader](../../packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenu.ts).
Continuous guest
updates or clearing an already-open Menu after unpublication remain outside
the recorded proof. Review that acquisition before accepting it as a
maintained public surface. The Items checkpoint likewise leaves live
revocation in the open Item editor unverified.
