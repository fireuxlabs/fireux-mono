import type { Ingredient } from '../../../../models/ingredient.model'
import { useIngredientFetch } from './fetch/useIngredientFetch'
import { useIngredientCreate } from './mutations/useIngredientCreate'
import { useIngredientDelete } from './mutations/useIngredientDelete'
import { useIngredientInterface } from './utils/view/useIngredientInterface'

export type { Ingredient }

export function useIngredient() {
  const fetch = useIngredientFetch()
  const create = useIngredientCreate()
  const remove = useIngredientDelete()
  const ui = useIngredientInterface()

  return {
    ...fetch,
    ...create,
    ...remove,
    ...ui,
  }
}
