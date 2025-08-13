// Use workspace package alias instead of brittle deep relative path
// Import from source via workspace alias; fireux-core exports only root so use relative alias path
import { useFirestoreRead } from 'fireux-core/composables/firestore/useFirestoreRead'
// If running unbuilt source during dev with module-builder providing alias resolution, the above should work.
// (If not, consider adjusting fireux-core exports map to expose composables directly.)
import { useIngredientCreate } from './useIngredientCreate'

// Fetch-all + isolated create. Keep it tiny.
export async function useIngredient() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const all = await firestoreFetchCollection('ingredients')
  const create = useIngredientCreate()

  return { all, ...create }
}
