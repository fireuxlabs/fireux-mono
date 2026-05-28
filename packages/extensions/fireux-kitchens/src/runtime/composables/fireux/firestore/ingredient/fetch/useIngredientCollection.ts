import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import { IngredientStorage, type Ingredient } from '../../../../../models/ingredient.model'

export function useIngredientCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const ingredients = firestoreFetchCollection<Ingredient>(IngredientStorage.collection)
  const count = computed(() => ingredients.value?.length ?? 0)

  return {
    ingredients,
    count,
  }
}
