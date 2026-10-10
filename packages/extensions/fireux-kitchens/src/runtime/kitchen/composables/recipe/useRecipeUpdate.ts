import type { WatchSource } from 'vue'
import type { RecipeUpdateInput } from '../../utils/recipe'
import { useRecipeMutation } from './useRecipeMutation'

export function useRecipeUpdate(ownerSources: WatchSource[] = []) {
  const { mutate } = useRecipeMutation(ownerSources)
  const updateRecipe = (
    recipeId: string,
    changes: Partial<RecipeUpdateInput> & Record<string, unknown>,
    overrides: { kitchenId?: string } = {}
  ) => mutate('PATCH', { recipeId, changes }, overrides.kitchenId)
  return { updateRecipe }
}
