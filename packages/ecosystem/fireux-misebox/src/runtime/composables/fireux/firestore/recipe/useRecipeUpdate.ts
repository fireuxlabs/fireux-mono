import {
  useRecipeUpdate as useCanonicalRecipeUpdate,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/runtime-kitchen/recipe/mutations/useRecipeUpdate'

export function useRecipeUpdate() {
  return useCanonicalRecipeUpdate()
}
