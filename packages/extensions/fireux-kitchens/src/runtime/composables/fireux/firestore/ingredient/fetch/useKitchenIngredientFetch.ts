import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Ref, ShallowRef } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import type {
  Ingredient,
  KitchenIngredient,
  KitchenIngredientResolved,
} from '../../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'
const resolveKitchenCollectionPath = (kitchenId: string) =>
  `kitchens/${kitchenId}/ingredients`

export function useKitchenIngredientFetch(kitchenId: Ref<string> | string) {
  const { firestoreFetchCollection } = useFirestoreRead()

  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const collectionPath = computed(() =>
    resolvedKitchenId.value ? resolveKitchenCollectionPath(resolvedKitchenId.value) : ''
  )

  const kitchenCollectionRef = shallowRef(null) as ShallowRef<
    Ref<KitchenIngredient[] | undefined> | null
  >

  watch(
    collectionPath,
    (nextPath) => {
      kitchenCollectionRef.value = nextPath
        ? firestoreFetchCollection<KitchenIngredient>(nextPath)
        : null
    },
    { immediate: true }
  )

  const globalIngredients = firestoreFetchCollection<Ingredient>(GLOBAL_COLLECTION_PATH)

  const ingredientById = computed(() => {
    const map = new Map<string, Ingredient>()
    for (const ingredient of globalIngredients.value ?? []) {
      const id = String(ingredient.id || '').trim()
      if (!id) continue
      map.set(id, ingredient)
    }
    return map
  })

  const ingredients = computed<KitchenIngredientResolved[]>(() => {
    const kitchenItems = kitchenCollectionRef.value?.value ?? []

    return kitchenItems.map((entry) => {
      const linkId = String(entry.id || '').trim()
      const ingredientId = String(entry.ingredient_id || linkId).trim()
      const global = ingredientById.value.get(ingredientId)

      return {
        ...(global ?? {}),
        ...entry,
        id: linkId || ingredientId,
        ingredient_id: ingredientId,
      }
    })
  })

  const count = computed(() => ingredients.value.length)

  return {
    kitchenId: resolvedKitchenId,
    collectionPath,
    ingredients,
    count,
  }
}
