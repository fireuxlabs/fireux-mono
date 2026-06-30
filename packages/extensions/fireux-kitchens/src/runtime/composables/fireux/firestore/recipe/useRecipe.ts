import { useRecipeFetch } from './fetch/useRecipeFetch'
import { useKitchenRecipeCollection } from './fetch/useKitchenRecipeCollection'
import { useRecipeCreate } from './mutations/useRecipeCreate'
import { useRecipeUpdate } from './mutations/useRecipeUpdate'
import { useRecipeDelete } from './mutations/useRecipeDelete'
import { useRecipeComputed } from './utils/view/useRecipeComputed'
import { useRecipeInterface } from './utils/view/useRecipeInterface'

export {
  useRecipeFetch,
  useKitchenRecipeCollection,
  useRecipeCreate,
  useRecipeUpdate,
  useRecipeDelete,
  useRecipeComputed,
  useRecipeInterface,
}

export function useRecipe() {
  return {
    ...useKitchenRecipeCollection(),
    ...useRecipeFetch(),
    ...useRecipeCreate(),
    ...useRecipeUpdate(),
    ...useRecipeDelete(),
    ...useRecipeComputed(),
    ...useRecipeInterface(),
  }
}
