import { useRoute } from '#imports'
import { computed } from 'vue'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleDish() {
  const route = useRoute()
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    dishes,
    pending,
  } = useKitchenConsoleDishes({ resolveMenuSections: false })

  const dishId = computed(() => {
    const raw = route.params.dishId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const dish = computed(
    () =>
      dishes.value.find((item) => normalizeString(item?.id) === dishId.value) ??
      null
  )

  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    dishId: dishId.value,
    hasDish: Boolean(dish.value),
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    dishes,
    pending,
    dishId,
    dish,
    debug,
  }
}
