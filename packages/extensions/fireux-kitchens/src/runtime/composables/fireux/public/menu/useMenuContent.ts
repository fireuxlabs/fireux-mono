import { computed, type Ref } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import { useDishCollection } from '../../firestore/dish/fetch/useDishCollection'
import { useMenuSectionCollection } from '../../firestore/menu/fetch/useMenuSectionCollection'
import { useKitchenPublicMenuItems } from '../kitchen/menu/useKitchenPublicMenuItems'
import { useKitchenPublicMenuRows } from '../kitchen/menu/useKitchenPublicMenuRows'
import type { PublicMenu } from './useMenuFetch'

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuContent(menu: Ref<PublicMenu | null | undefined>) {
  const isStructured = computed(() => text(menu.value?.kind) === 'menu')
  const kitchenId = computed(() =>
    isStructured.value ? text(menu.value?.kitchen_id) : ''
  )
  const menuId = computed(() =>
    isStructured.value
      ? text(menu.value?.kitchen_menu_id) || text(menu.value?.id)
      : ''
  )
  const kitchenCollectionPath = computed(() => {
    const appId = text(menu.value?.kitchen_app_id)

    return isStructured.value && appId ? `apps/${appId}/kitchens` : ''
  })
  const sectionState = useMenuSectionCollection(kitchenId, menuId, {
    kitchenCollectionPath,
  })
  const itemState = useKitchenPublicMenuItems(
    sectionState.collectionPath,
    sectionState.sections
  )
  const dishState = useDishCollection(kitchenId, {
    kitchenCollectionPath,
  })
  const dishesById = computed(() => {
    const map = new Map<string, Dish>()

    for (const dish of dishState.dishes.value) {
      const id = text(dish.id)
      if (id) map.set(id, dish)
    }

    return map
  })
  const rows = useKitchenPublicMenuRows({
    sections: sectionState.sections,
    items: itemState.items,
    dishesById,
  })
  const pending = computed(
    () =>
      isStructured.value &&
      (sectionState.pending.value ||
        itemState.pending.value ||
        dishState.pending.value)
  )
  const counts = computed(() => ({
    sections: sectionState.sections.value.length,
    items: itemState.items.value.length,
    dishes: dishState.dishes.value.length,
    rows: rows.sectionRows.value.length,
  }))

  return {
    isStructured,
    kitchenId,
    menuId,
    kitchenCollectionPath,
    sections: sectionState.sections,
    items: itemState.items,
    dishes: dishState.dishes,
    sectionRows: rows.sectionRows,
    pending,
    counts,
  }
}
