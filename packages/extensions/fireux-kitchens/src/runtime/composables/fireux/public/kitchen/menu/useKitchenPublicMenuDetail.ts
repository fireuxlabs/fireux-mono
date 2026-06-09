import { computed } from 'vue'
import type { Dish } from '../../../../../models/dish.model'
import { useDishCollection } from '../../../firestore/dish/fetch/useDishCollection'
import { useMenuSectionCollection } from '../../../firestore/menu/fetch/useMenuSectionCollection'
import { useKitchenPublicMenuItems } from './useKitchenPublicMenuItems'
import { useKitchenPublicMenuRows } from './useKitchenPublicMenuRows'
import { useKitchenPublicMenuScope } from './useKitchenPublicMenuScope'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenPublicMenuDetail() {
  const state = useKitchenPublicMenuScope()
  const kitchenId = computed(() => text(state.kitchen.value?.id))
  const resolvedMenuId = computed(() => text(state.menu.value?.id))
  const sectionState = useMenuSectionCollection(kitchenId, resolvedMenuId)
  const itemState = useKitchenPublicMenuItems(
    sectionState.collectionPath,
    sectionState.sections
  )
  const dishState = useDishCollection(kitchenId)
  const dishesById = computed(() => {
    const map = new Map<string, Dish>()
    for (const dish of dishState.dishes.value) {
      const id = text(dish.id)
      if (id) map.set(id, dish)
    }
    return map
  })
  const detailPending = computed(
    () =>
      state.pending.value ||
      sectionState.pending.value ||
      itemState.pending.value ||
      dishState.pending.value
  )
  const rows = useKitchenPublicMenuRows({
    sections: sectionState.sections,
    items: itemState.items,
    dishesById,
  })
  const debug = computed(() => ({
    ...state.debug.value,
    detail: {
      kitchenId: kitchenId.value,
      menuId: resolvedMenuId.value,
      sectionsPath: sectionState.collectionPath.value,
      dishesPath: dishState.collectionPath.value,
      sectionsCount: sectionState.sections.value.length,
      itemsCount: itemState.items.value.length,
      dishesCount: dishState.dishes.value.length,
      sectionRowsCount: rows.sectionRows.value.length,
      pending: detailPending.value,
    },
  }))

  return {
    ...state,
    sections: sectionState.sections,
    items: itemState.items,
    dishes: dishState.dishes,
    sectionRows: rows.sectionRows,
    detailPending,
    debug,
  }
}
