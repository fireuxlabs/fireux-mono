import { computed } from 'vue'
import type { Item } from '../../utils/item.ts'
import { useKitchenItemCollection } from '../useKitchenItemCollection'
import { useMenuSectionCollection } from '../../../menu/composables/useMenuSectionCollection'
import { useKitchenMenuItems } from './useKitchenMenuItems'
import { useKitchenMenuRows } from './useKitchenMenuRows'
import { useKitchenMenuScope } from './useKitchenMenuScope'

const text = (value: unknown) => String(value ?? '').trim()

function useKitchenMenuDetailFromScope(
  state: ReturnType<typeof useKitchenMenuScope>
) {
  const kitchenId = computed(() => text(state.kitchen.value?.id))
  const resolvedMenuId = computed(() => text(state.menu.value?.id))
  const collectionOptions = {
    kitchenCollectionPath: state.kitchenCollectionPath,
  }
  const sectionState = useMenuSectionCollection(
    kitchenId,
    resolvedMenuId,
    collectionOptions
  )
  const itemState = useKitchenMenuItems(
    sectionState.collectionPath,
    sectionState.sections
  )
  const catalogueState = useKitchenItemCollection(kitchenId, collectionOptions)
  const dishesById = computed(() => {
    const map = new Map<string, Item>()
    for (const dish of catalogueState.dishes.value) {
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
      catalogueState.pending.value
  )
  const rows = useKitchenMenuRows({
    sections: sectionState.sections,
    items: itemState.items,
    dishesById,
  })
  const structuredItemsCount = computed(() =>
    rows.sectionRows.value.reduce(
      (count, section) =>
        count + section.items.filter((item) => Boolean(item.dish)).length,
      0
    )
  )
  const debug = computed(() => ({
    ...state.debug.value,
    detail: {
      kitchenId: kitchenId.value,
      kitchenCollectionPath: state.kitchenCollectionPath.value,
      menuId: resolvedMenuId.value,
      sectionsPath: sectionState.collectionPath.value,
      dishesPath: catalogueState.collectionPath.value,
      sectionsCount: sectionState.sections.value.length,
      itemsCount: itemState.items.value.length,
      dishesCount: catalogueState.dishes.value.length,
      sectionRowsCount: rows.sectionRows.value.length,
      structuredItemsCount: structuredItemsCount.value,
      pending: detailPending.value,
    },
  }))

  return {
    ...state,
    sections: sectionState.sections,
    items: itemState.items,
    dishes: catalogueState.dishes,
    sectionRows: rows.sectionRows,
    detailPending,
    debug,
  }
}

export function useKitchenMenuDetail() {
  return useKitchenMenuDetailFromScope(useKitchenMenuScope())
}
