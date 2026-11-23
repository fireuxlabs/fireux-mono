# Independent Kitchen Items lifecycle

Verified locally from `07cc0582d` using the Items-only Nuxt composition and
the named `misebox` database under the local `demo-fireux-live` emulator
project. The pending public Menu edits were outside this check.

- The registered Create and Update endpoints accepted a name and description
  for Margherita Pizza. A name-only Kitchen with no Place had `dishes` as its
  only child collection. An authenticated list and a fresh detail read
  confirmed the changes at `kitchens/{kitchenId}/dishes/{dishId}`. An unrelated
  App member received `403` on update. The [Item model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/items/item.ts)
  and stored paths remain unchanged.
- The [Items-only registration](../../packages/extensions/fireux-kitchens/src/module.ts)
  supplies POST and PATCH. DELETE returned `404` for both users. In a separate
  temporary fixture that enabled only the existing
  [Delete handler](../../packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/dishes/index.delete.ts),
  the unrelated member received `403` and the owner's delete persisted. The
  guard still checks Menu and Promotion references, with neither collection
  needed for a successful delete.
- The [direct editor](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Items/Index.vue)
  exposes name editing. Description was exercised through HTTP and reopen
  through a fresh Firestore read. A browser replay was outside this check.
  The Items-only composition omits the image route. Image scope and attachment
  tests passed, and no Storage upload was attempted.
- [Item actions](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/items/useItemActions.ts)
  filter the cache refresh to existing Menu keys. Nuxt only refreshes matching
  keys, so an Items-only page has no Menu reader to refresh. This does not
  block the lifecycle.

**Checks.** 105 focused tests passed. Package `tsc --noEmit` reported 45
Vue import resolution errors and one Kitchen reader `context` type error.

**Next.** Register the existing guarded DELETE handler in Items-only mode.
Keep the usage guard. Decide separately whether the direct editor needs
description, image and Delete controls before calling its full lifecycle
complete. [Earlier Items checkpoint](../reviews/2026-11-22-kitchen-items-architecture.md#independent-items-local-checkpoint)
