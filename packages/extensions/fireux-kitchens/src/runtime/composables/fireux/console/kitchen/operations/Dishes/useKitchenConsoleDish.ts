import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useKitchenConsoleDishFinance } from './useKitchenConsoleDishFinance'
import { useKitchenConsoleDishes } from './useKitchenConsoleDishes'

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
  const unitLabel = unit === 'portion' && quantity !== 1
    ? 'portions'
    : unit

  return `${quantityLabel} ${unitLabel}`
}

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
    demoScenario,
    getMenuUsageForDish,
  } = useKitchenConsoleDishes()

  const dishId = useRouteParam('dishId')

  const dish = computed(
    () =>
      dishes.value.find((item) => normalizeString(item?.id) === dishId.value) ??
      null
  )
  const menuUsage = computed(() => getMenuUsageForDish(dishId.value))
  const dishSpec = computed(() =>
    demoScenario.value?.dishSpecs?.find(
      spec => normalizeString(spec.dishId) === dishId.value
    ) ?? null
  )
  const ingredientNameById = computed(() =>
    new Map(
      (demoScenario.value?.ingredients ?? []).map(ingredient => [
        normalizeString(ingredient.id),
        normalizeString(ingredient.name),
      ])
    )
  )
  const getIngredientName = (ingredientId: string) =>
    ingredientNameById.value.get(normalizeString(ingredientId)) ||
    normalizeString(ingredientId)
  const prepItemById = computed(() =>
    new Map(
      (demoScenario.value?.prepItems ?? []).map(prepItem => [
        normalizeString(prepItem.id),
        prepItem,
      ])
    )
  )
  const recipeById = computed(() =>
    new Map(
      (demoScenario.value?.recipes ?? []).map(recipe => [
        normalizeString(recipe.id),
        recipe,
      ])
    )
  )
  const componentViews = computed(() =>
    (dishSpec.value?.components ?? []).map((component) => {
      if (component.source === 'ingredient') {
        const ingredientId = normalizeString(component.ingredientId)
        return {
          id: normalizeString(component.id),
          name: getIngredientName(ingredientId),
          amount: formatProductionAmount(component),
          sourceLabel: 'Ingredient',
        }
      }

      if (component.source === 'prep_item') {
        const prepItemId = normalizeString(component.prepItemId)
        return {
          id: normalizeString(component.id),
          name:
            normalizeString(prepItemById.value.get(prepItemId)?.name) ||
            prepItemId,
          amount: formatProductionAmount(component),
          sourceLabel: 'Prep item',
        }
      }

      const recipeId = normalizeString(component.recipeId)
      return {
        id: normalizeString(component.id),
        name:
          normalizeString(recipeById.value.get(recipeId)?.name) ||
          recipeId,
        amount: formatProductionAmount(component),
        sourceLabel: 'Recipe',
      }
    })
  )
  const prepItems = computed(() => {
    const prepItemIds = new Set(
      (dishSpec.value?.components ?? [])
        .filter(component => component.source === 'prep_item')
        .map(component => normalizeString(component.prepItemId))
    )
    return (demoScenario.value?.prepItems ?? []).filter(
      prepItem => prepItemIds.has(normalizeString(prepItem.id))
    )
  })
  const recipes = computed(() => {
    const recipeIds = new Set(
      (dishSpec.value?.components ?? [])
        .filter(component => component.source === 'recipe')
        .map(component => normalizeString(component.recipeId))
    )
    return (demoScenario.value?.recipes ?? []).filter(
      recipe => recipeIds.has(normalizeString(recipe.id))
    )
  })
  const componentSourceKeys = computed(() =>
    new Set(
      (dishSpec.value?.components ?? []).flatMap((component) => {
        if (component.source === 'prep_item') {
          return [`prep_item:${normalizeString(component.prepItemId)}`]
        }
        if (component.source === 'recipe') {
          return [`recipe:${normalizeString(component.recipeId)}`]
        }
        return []
      })
    )
  )
  const miseRequirements = computed(() =>
    demoScenario.value?.miseRequirements?.filter((requirement) => {
      const sourceKey = requirement.source.kind === 'prep_item'
        ? `prep_item:${normalizeString(requirement.source.prepItemId)}`
        : `recipe:${normalizeString(requirement.source.recipeId)}`
      return componentSourceKeys.value.has(sourceKey)
    }) ?? []
  )
  const dishFinance = useKitchenConsoleDishFinance({
    dishSpec,
    menuUsage,
    scenario: demoScenario,
  })

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
    miseRequirementCount: miseRequirements.value.length,
    hasFinanceEstimate: Boolean(dishFinance.estimate.value),
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
    miseRequirements,
    menuUsage,
    finance: dishFinance.estimate,
    financePending: dishFinance.pending,
    financeError: dishFinance.error,
    debug,
  }
}
