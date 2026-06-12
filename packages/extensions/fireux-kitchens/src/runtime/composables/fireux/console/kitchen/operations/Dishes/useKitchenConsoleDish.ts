import { useRoute } from '#imports'
import { computed } from 'vue'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleDish() {
  const route = useRoute()
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    canWrite,
    dishes,
    pending,
    getMenuUsageForDish,
  } = useKitchenConsoleDishes()

  const dishId = computed(() => {
    const raw = route.params.dishId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

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
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    canWrite,
    dishes,
    pending,
    dishId,
    dish,
    menuUsage,
    debug,
  }
}
