import type { Ingredient } from '../../../../models/ingredient.model'
import { useIngredientCollection } from './fetch/useIngredientCollection'
import { useIngredientFetch } from './fetch/useIngredientFetch'
import { useIngredientCreate } from './mutations/useIngredientCreate'
import { useIngredientDelete } from './mutations/useIngredientDelete'
import { useIngredientUpdate } from './mutations/useIngredientUpdate'
import { useIngredientComputed } from './utils/view/useIngredientComputed'
import { useIngredientInterface } from './utils/view/useIngredientInterface'

export type { Ingredient }

export {
  useIngredientCollection,
  useIngredientFetch,
  useIngredientCreate,
  useIngredientUpdate,
  useIngredientDelete,
  useIngredientComputed,
  useIngredientInterface,
}

export function useIngredient() {
  return {
    ...useIngredientCollection(),
    ...useIngredientFetch(),
    ...useIngredientCreate(),
    ...useIngredientUpdate(),
    ...useIngredientDelete(),
    ...useIngredientComputed(),
    ...useIngredientInterface(),
  }
}
