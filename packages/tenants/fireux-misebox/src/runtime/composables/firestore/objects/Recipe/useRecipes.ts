import { useObject } from 'fireux-core/src/runtime/composables/firestore/objects/useObject'
import { useRecipeCreate } from './useRecipeCreate'
import { useRecipeUpdate } from './useRecipeUpdate'
import { useRecipeDelete } from './useRecipeDelete'

export async function useRecipes() {
  return await useObject({
    collectionName: 'recipes',
    objectType: 'Recipe',
    createComposable: useRecipeCreate,
    updateComposable: useRecipeUpdate,
    deleteComposable: useRecipeDelete,
  })
}
