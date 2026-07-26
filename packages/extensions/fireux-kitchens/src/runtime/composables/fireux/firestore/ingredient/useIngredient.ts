import type { Ingredient } from '../../../../models/ingredient.model'
import { useIngredientCollection } from './fetch/useIngredientCollection'
import { useIngredientFetch } from './fetch/useIngredientFetch'
import { useIngredientCreate } from './mutations/useIngredientCreate'
import { useIngredientUpdate } from './mutations/useIngredientUpdate'
import { useIngredientSeo } from './utils/useIngredientSeo'
import { useIngredientComputed } from './utils/view/useIngredientComputed'
import { useIngredientInterface } from './utils/view/useIngredientInterface'

export type { Ingredient }

export {
  useIngredientCollection,
  useIngredientFetch,
  useIngredientCreate,
  useIngredientUpdate,
  useIngredientSeo,
  useIngredientComputed,
  useIngredientInterface,
}

export type UseIngredientResult = ReturnType<typeof useIngredientCollection> &
  ReturnType<typeof useIngredientFetch> &
  ReturnType<typeof useIngredientCreate> &
  ReturnType<typeof useIngredientUpdate> &
  ReturnType<typeof useIngredientComputed> &
  ReturnType<typeof useIngredientInterface> & {
    useIngredientSeo: typeof useIngredientSeo
  }

export function useIngredient(): UseIngredientResult {
  return {
    ...useIngredientCollection(),
    ...useIngredientFetch(),
    ...useIngredientCreate(),
    ...useIngredientUpdate(),
    ...useIngredientComputed(),
    ...useIngredientInterface(),
    useIngredientSeo,
  }
}
