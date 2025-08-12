import { useObjectCreate } from 'fireux-core/src/runtime/composables/firestore/objects/useObjectCreate'

export function useRecipeCreate() {
  return useObjectCreate()
}
