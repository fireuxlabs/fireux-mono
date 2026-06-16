import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { unref, type Ref } from 'vue'
import { MenuItemModel, type MenuItem } from '../../../../../models/menu/menu-item.model'
import { menuItemsPath } from '../utils/paths'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const optionPath = (value: Options['kitchenCollectionPath']) => clean(unref(value))

export function useMenuItemMutations(options: Options = {}) {
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
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
    const collectionPath = path(input.kitchenId, input.menuId, input.sectionId)
    const dishId = clean(input.dishId)
    if (!collectionPath) throw new Error('Missing section')
    if (!dishId) throw new Error('Menu item requires a dish')

    return createDocument(
      collectionPath,
      {
        ...MenuItemModel,
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
    const collectionPath = path(kitchenId, menuId, sectionId)
    const id = clean(itemId)
    if (!collectionPath || !id) throw new Error('Missing menu item')
    await updateDocument<MenuItem>(collectionPath, id, patch)
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
    ) => updateItem(kitchenId, menuId, sectionId, itemId, { status: 'archived' }),
    reorderItems,
  }
}
