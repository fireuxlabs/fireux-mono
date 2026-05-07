import {
    useRecipeUpdate as useCanonicalRecipeUpdate,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/recipe/mutations/useRecipeUpdate'

export function useRecipeUpdate() {
  return useCanonicalRecipeUpdate()
}
