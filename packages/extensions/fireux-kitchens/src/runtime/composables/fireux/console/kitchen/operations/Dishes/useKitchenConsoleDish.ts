import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleDish() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    readOnly,
    canWrite,
    dishes,
    pending,
    getMenuUsageForDish,
  } = useKitchenConsoleDishes()

  const dishId = useRouteParam('dishId')

  const dish = computed(
    () =>
      dishes.value.find((item) => normalizeString(item?.id) === dishId.value) ??
      null
  )
  const menuUsage = computed(() => getMenuUsageForDish(dishId.value))

  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    dishId: dishId.value,
    hasDish: Boolean(dish.value),
    menuUsageCount: menuUsage.value.length,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    readOnly,
    canWrite,
    dishes,
    pending,
    dishId,
    dish,
    menuUsage,
    debug,
  }
}
