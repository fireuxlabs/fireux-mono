import { useRoute } from '#imports'
import { computed } from 'vue'
import type { IngredientInterfaceItem } from '../../../../firestore/ingredient/utils/view/useIngredientInterface'
import { useKitchenConsoleIngredients } from './useKitchenConsoleIngredients'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleIngredient() {
  const route = useRoute()
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    ingredients,
    pending,
  } = useKitchenConsoleIngredients()

  const ingredientId = computed(() => {
    const raw = route.params.ingredientId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

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
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    canWrite,
    ingredients,
    pending,
    ingredientId,
    ingredient,
    debug,
  }
}
