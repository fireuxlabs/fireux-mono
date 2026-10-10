import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useKitchenDishesContext } from './useKitchenDishesContext'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceDish() {
  const context = useKitchenDishesContext()
  const dishId = useRouteParam('dishId')
  const dish = computed(
    () =>
      context.dishes.value.find((item) => text(item.id) === dishId.value) ??
      null
  )
  const outcome = computed(() => {
    if (!context.storageKitchenId.value) return context.outcome.value
    if (context.outcome.value === 'empty') return 'missing'
    if (context.outcome.value !== 'ready') return context.outcome.value
    return dish.value ? 'ready' : 'missing'
  })
  const pending = computed(() => outcome.value === 'pending')
  const canWrite = computed(
    () => !context.readOnly.value && Boolean(context.storageKitchenId.value)
  )
  const debug = computed(() => ({
    kitchenId: context.kitchenId.value,
    rootCollection: context.rootCollection.value,
    databaseId: context.databaseId.value,
    collectionPath: context.collectionPath.value,
    dishId: dishId.value,
    hasDish: Boolean(dish.value),
    outcome: outcome.value,
    readOnly: context.readOnly.value,
    canWrite: canWrite.value,
  }))
  return {
    selectedKitchen: context.selectedKitchen,
    kitchenId: context.kitchenId,
    storageKitchenId: context.storageKitchenId,
    rootCollection: context.rootCollection,
    databaseId: context.databaseId,
    collectionPath: context.collectionPath,
    readOnly: context.readOnly,
    canWrite,
    dishes: context.dishes,
    error: context.error,
    pending,
    outcome,
    dishId,
    dish,
    debug,
    catalogue: context.catalogue,
  }
}
