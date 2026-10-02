import { useRecipeMutation } from './useRecipeMutation'

export function useRecipeDelete() {
  const { mutate } = useRecipeMutation()
  const deleteRecipe = (recipeId: string, overrides: { kitchenId?: string } = {}) =>
    mutate('DELETE', { recipeId }, overrides.kitchenId)
  return { deleteRecipe }
}
