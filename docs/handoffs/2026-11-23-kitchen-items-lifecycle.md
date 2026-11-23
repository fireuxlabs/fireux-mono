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
  now includes the existing [Delete handler](../../packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/dishes/index.delete.ts)
  alongside POST and PATCH. In the standard Items-only fixture, an unrelated
  App member received `403`, the owner deleted the Item, and a fresh
  authenticated detail read returned `404`. The Kitchen remained intact.
  Generated routes contained none of the Menu, Order, Service or Table
  endpoints. The existing Delete guard still checks Menu and Promotion
  references. Empty collections allow deletion.
- The [direct editor](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Items/Index.vue)
  exposes name editing. Description was exercised through HTTP and reopen
  through a fresh Firestore read. A browser replay was outside this check.
  The Items-only composition omits the image route. Image scope and attachment
  tests passed, and no Storage upload was attempted.
- [Item actions](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/items/useItemActions.ts)
  filter the cache refresh to existing Menu keys. Nuxt only refreshes matching
  keys, so an Items-only page has no Menu reader to refresh. This does not
  block the lifecycle.

**Checks.** The Delete checkpoint passed 153 focused tests, including reference
protection and Menu publication. Full Misebox Nuxt prepare passed and generated
its existing Item and Menu publication handlers. The lifecycle ran through
HTTP commands and authorized Firestore reads. Browser and Storage checks were
outside this checkpoint. The earlier package typecheck reported 45 Vue import
resolution errors and one Kitchen reader `context` type error and was not rerun.

**Next.** Continue the [Workspace Entity alignment](2026-11-23-workspace-entity-alignment.md)
with one shared surface at a time. Description, image and Delete controls in
the direct editor remain a separate product decision.
[Earlier Items checkpoint](../reviews/2026-11-22-kitchen-items-architecture.md#independent-items-local-checkpoint)
