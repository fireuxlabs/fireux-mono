import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { doc, getDoc } from 'firebase/firestore'
import { unref, type Ref } from 'vue'
import {
  MenuItemDefaults,
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
  type MenuItem,
} from '../../../models/menu-item.model.ts'
import { DishStorage } from '../../../../kitchen/models/dish.model.ts'
import { resolveKitchenScopeCollectionPath } from '../../../../kitchen/composables/firestore/utils/paths/useKitchenChildCollection'
import { menuItemsPath } from '../utils/paths'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const optionPath = (value: Options['kitchenCollectionPath']) => clean(unref(value))
const unique = (values: string[]) => new Set(values).size === values.length
const optionKey = (value: unknown) => normalizeSlug(value)

const normalizeItemPatch = (patch: Partial<MenuItem>): Partial<MenuItem> => {
  const immutable = ['id', 'kitchen_id', 'menu_id', 'section_id', 'dish_id', 'created']
  if (immutable.some(key => Object.hasOwn(patch, key))) {
    throw new Error('Menu Item identity and relationships cannot be changed.')
  }
  if (
    'image' in patch ||
    'image_url' in patch ||
    'item_kind' in patch ||
    'is_deal' in patch
  ) {
    throw new Error(
      'Dish owns food identity and media; MenuItem owns menu pricing and options.'
    )
  }
  const normalized = { ...patch }

  if (Object.hasOwn(patch, 'price_options')) {
    const input = Array.isArray(patch.price_options) ? patch.price_options : []
    const options = normalizeMenuItemPriceOptions(input)
    if (
      options.length !== input.length ||
      !unique(options.map((option) => optionKey(option.label)))
    ) {
      throw new Error('Variants require unique labels and full prices greater than zero.')
    }
    normalized.price_options = options
  }

  if (Object.hasOwn(patch, 'add_ons')) {
    const input = Array.isArray(patch.add_ons) ? patch.add_ons : []
    const addOns = normalizeMenuItemAddOns(input)
    if (
      addOns.length !== input.length ||
      !unique(addOns.map((addOn) => optionKey(addOn.id))) ||
      !unique(addOns.map((addOn) => optionKey(addOn.label)))
    ) {
      throw new Error('Add-ons require unique labels and identifiers and a non-negative price.')
    }
    normalized.add_ons = addOns
  }

  return normalized
}

export function useMenuItemMutations(options: Options = {}) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const create = useFirestoreClientCreate()
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
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

    const kitchenCollectionPath = optionPath(options.kitchenCollectionPath) ||
      resolveKitchenScopeCollectionPath(appId)
    const dishSnap = await getDoc(doc(
      db,
      `${kitchenCollectionPath}/${clean(input.kitchenId)}/${DishStorage.collection}`,
      dishId
    ))
    if (!dishSnap.exists()) throw new Error('Select a Dish from this Kitchen.')

    return create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-menu-items',
        collectionPath
      ),
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
    await updateDocument<MenuItem>(collectionPath, id, normalizeItemPatch(patch))
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
