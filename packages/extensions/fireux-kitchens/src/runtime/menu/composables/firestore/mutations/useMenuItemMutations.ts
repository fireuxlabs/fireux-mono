import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeMenuItemPatch } from '../../../utils/menu-item-patch'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { doc, getDoc } from 'firebase/firestore'
import { unref, type Ref } from 'vue'
import { MenuItemDefaults, type MenuItem } from '../../../utils/menu-item.ts'
import { DishStorage } from '../../../../kitchen/utils/dish.ts'
import { resolveKitchenScopeCollectionPath } from '../../../../kitchen/utils/kitchen-collection-path'
import { menuItemsPath } from '../utils/paths'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const optionPath = (value: Options['kitchenCollectionPath']) =>
  clean(unref(value))

export function useMenuItemMutations(options: Options = {}) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { createDocument: create } = useFirestoreCreate({
    databaseId: options.databaseId,
  })
  const db = useFirestore(options.databaseId)
  const { appId } = useFireUXConfig()

  const path = (kitchenId: string, menuId: string, sectionId: string) =>
    menuItemsPath({
      kitchenCollectionPath: optionPath(options.kitchenCollectionPath),
      kitchenId,
      menuId,
      sectionId,
      appId,
    })

  const createItem = async (input: {
    kitchenId: string
    menuId: string
    sectionId: string
    dishId: string
    price?: number
    sort_order?: number
  }) => {
    requireWritableData()
    const collectionPath = path(input.kitchenId, input.menuId, input.sectionId)
    const dishId = clean(input.dishId)
    if (!collectionPath) throw new Error('Missing section')
    if (!dishId) throw new Error('Menu item requires a dish')

    const kitchenCollectionPath =
      optionPath(options.kitchenCollectionPath) ||
      resolveKitchenScopeCollectionPath(appId)
    const dishSnap = await getDoc(
      doc(
        db,
        `${kitchenCollectionPath}/${clean(input.kitchenId)}/${DishStorage.collection}`,
        dishId
      )
    )
    if (!dishSnap.exists()) throw new Error('Select a Dish from this Kitchen.')

    return create(
      collectionPath,
      {
        ...MenuItemDefaults,
        kitchen_id: clean(input.kitchenId),
        menu_id: clean(input.menuId),
        section_id: clean(input.sectionId),
        dish_id: dishId,
        price: Math.max(0, Number(input.price || 0)),
        sort_order: Number(input.sort_order || 0),
      },
      { app: true, creator: true }
    )
  }

  const updateItem = async (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    itemId: string,
    patch: Partial<MenuItem>
  ) => {
    requireWritableData()
    const collectionPath = path(kitchenId, menuId, sectionId)
    const id = clean(itemId)
    if (!collectionPath || !id) throw new Error('Missing menu item')
    const user = await useRequireUser()
    await $fetch('/api/workspace/kitchen/menus/item', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: {
        kitchenId,
        menuId,
        sectionId,
        itemId: id,
        changes: normalizeMenuItemPatch(patch),
      },
    })
  }

  const reorderItems = async (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    orderedIds: string[]
  ) => {
    await Promise.all(
      orderedIds
        .map(clean)
        .filter(Boolean)
        .map((id, index) =>
          updateItem(kitchenId, menuId, sectionId, id, { sort_order: index })
        )
    )
  }

  return {
    createItem,
    updateItem,
    archiveItem: (
      kitchenId: string,
      menuId: string,
      sectionId: string,
      itemId: string
    ) =>
      updateItem(kitchenId, menuId, sectionId, itemId, { status: 'archived' }),
    reorderItems,
  }
}
