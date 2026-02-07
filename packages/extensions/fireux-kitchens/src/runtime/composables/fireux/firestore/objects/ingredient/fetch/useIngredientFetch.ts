import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Ingredient } from '../../../../../../models/objects/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'

export function useIngredientFetch() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const ingredients = firestoreFetchCollection<Ingredient>(GLOBAL_COLLECTION_PATH)
  const count = computed(() => ingredients.value?.length ?? 0)

  return {
    ingredients,
    count,
  }
}
