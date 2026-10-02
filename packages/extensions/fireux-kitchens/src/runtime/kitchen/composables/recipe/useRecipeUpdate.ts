import type { RecipeUpdateInput } from '../../utils/recipe'
import { useRecipeMutation } from './useRecipeMutation'

export function useRecipeUpdate() {
  const { mutate } = useRecipeMutation()
  const updateRecipe = (recipeId: string, changes: Partial<RecipeUpdateInput> & Record<string, unknown>, overrides: { kitchenId?: string } = {}) =>
    mutate('PATCH', { recipeId, changes }, overrides.kitchenId)
  return { updateRecipe }
}
