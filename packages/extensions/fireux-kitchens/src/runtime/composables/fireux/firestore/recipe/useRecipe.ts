import { useRecipeFetch } from './fetch/useRecipeFetch'
import { useRecipeCollection } from './fetch/useRecipeCollection'
import { useRecipeCreate } from './mutations/useRecipeCreate'
import { useRecipeUpdate } from './mutations/useRecipeUpdate'
import { useRecipeDelete } from './mutations/useRecipeDelete'
import { useRecipeComputed } from './utils/view/useRecipeComputed'
import { useRecipeInterface } from './utils/view/useRecipeInterface'

export {
  useRecipeFetch,
  useRecipeCollection,
  useRecipeCreate,
  useRecipeUpdate,
  useRecipeDelete,
  useRecipeComputed,
  useRecipeInterface,
}

export function useRecipe() {
  return {
    ...useRecipeCollection(),
    ...useRecipeFetch(),
    ...useRecipeCreate(),
    ...useRecipeUpdate(),
    ...useRecipeDelete(),
    ...useRecipeComputed(),
    ...useRecipeInterface(),
  }
}
