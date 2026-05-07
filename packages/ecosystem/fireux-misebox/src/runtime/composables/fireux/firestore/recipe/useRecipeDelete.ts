import {
    useRecipeDelete as useCanonicalRecipeDelete,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/recipe/mutations/useRecipeDelete'

export function useRecipeDelete() {
  return useCanonicalRecipeDelete()
}
