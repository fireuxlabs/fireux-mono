import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { IngredientInterfaceItem } from '../../../../ingredient/useIngredientInterface'
import { useKitchenConsoleIngredients } from './useKitchenConsoleIngredients'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleIngredient() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    ingredients,
    pending,
    loadError,
  } = useKitchenConsoleIngredients()

  const ingredientId = useRouteParam('ingredientId')

  const ingredient = computed<IngredientInterfaceItem | null>(
    () =>
      ingredients.value.find((item) => {
        const id = normalizeString(item?.id)
        const ingredientRef = normalizeString(
          (item as { ingredient_id?: unknown })?.ingredient_id
        )
        return id === ingredientId.value || ingredientRef === ingredientId.value
      }) ?? null
  )

  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    ingredientId: ingredientId.value,
    hasIngredient: Boolean(ingredient.value),
    pending: pending.value,
    loadError: Boolean(loadError.value),
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    readOnly,
    canWrite,
    ingredients,
    pending,
    loadError,
    ingredientId,
    ingredient,
    debug,
  }
}
