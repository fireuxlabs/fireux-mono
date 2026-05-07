import { useRecipeFetch } from './fetch/useRecipeFetch'
import { useRecipeCollection } from './fetch/useRecipeCollection'
import { useRecipeCreate } from './mutations/useRecipeCreate'
import { useRecipeUpdate } from './mutations/useRecipeUpdate'
import { useRecipeDelete } from './mutations/useRecipeDelete'
import { useRecipeInterface } from './utils/view/useRecipeInterface'

export {
  useRecipeFetch,
  useRecipeCollection,
  useRecipeCreate,
  useRecipeUpdate,
  useRecipeDelete,
  useRecipeInterface,
}

export function useRecipe() {
  return {
    ...useRecipeCreate(),
    ...useRecipeUpdate(),
    ...useRecipeDelete(),
    ...useRecipeInterface(),
  }
}
