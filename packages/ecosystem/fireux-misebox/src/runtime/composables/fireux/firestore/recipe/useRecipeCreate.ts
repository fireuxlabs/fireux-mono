import {
    useRecipeCreate as useCanonicalRecipeCreate,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/runtime-kitchen/recipe/mutations/useRecipeCreate'

export function useRecipeCreate() {
  return useCanonicalRecipeCreate()
}
