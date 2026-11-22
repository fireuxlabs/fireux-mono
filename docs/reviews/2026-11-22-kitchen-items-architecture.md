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
   existing Place-backed flow. The name-only command and rename already passed
   locally, but the signed-in reopen/refresh check is open.
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
