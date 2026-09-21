import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useKitchenDishesContext } from './useKitchenDishesContext'

const normalizeString = (value: unknown) => String(value ?? '').trim()
type ProductionAmount = {
  quantity: number
  unit: string
}

const formatProductionAmount = (
  amount: ProductionAmount | null | undefined
) => {
  const quantity = Number(amount?.quantity)
  const unit = normalizeString(amount?.unit)
  if (!Number.isFinite(quantity) || !unit) return ''

  const quantityLabel = new Intl.NumberFormat('en-CH', {
    maximumFractionDigits: 2,
  }).format(quantity)
  const unitLabel = unit === 'portion' && quantity !== 1 ? 'portions' : unit

  return `${quantityLabel} ${unitLabel}`
}

export function useKitchenWorkspaceDish() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    databaseId,
    collectionPath,
    readOnly,
    dishes,
    pending,
    getMenuUsageForDish,
    catalogue,
  } = useKitchenDishesContext()

  const canWrite = computed(() => !readOnly.value && Boolean(kitchenId.value))
  const dishId = useRouteParam('dishId')

  const dish = computed(
    () =>
      dishes.value.find((item) => normalizeString(item?.id) === dishId.value) ??
      null
  )
  const menuUsage = computed(() => getMenuUsageForDish(dishId.value))
  const dishSpec = computed(() => null)
  const getIngredientName = (ingredientId: string) =>
    normalizeString(ingredientId)
  const getStationName = (stationId: string) => normalizeString(stationId)
  const componentViews = computed(() => [])
  const prepItems = computed(() => [])
  const recipes = computed(() => [])
  const finance = computed(() => null)
  const financeError = computed(() => null)

  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    dishId: dishId.value,
    hasDish: Boolean(dish.value),
    menuUsageCount: menuUsage.value.length,
    hasSpec: Boolean(dishSpec.value),
    componentCount: componentViews.value.length,
    prepItemCount: prepItems.value.length,
    recipeCount: recipes.value.length,
    hasFinanceEstimate: Boolean(finance.value),
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
    dishSpec,
    componentViews,
    prepItems,
    recipes,
    formatProductionAmount,
    getIngredientName,
    getStationName,
    menuUsage,
    finance,
    financePending: pending,
    financeError,
    debug,
    catalogue,
  }
}
