import type { WatchSource } from 'vue'
import { useRecipeMutation } from './useRecipeMutation'

export function useRecipeDelete(ownerSources: WatchSource[] = []) {
  const { mutate } = useRecipeMutation(ownerSources)
  const deleteRecipe = (
    recipeId: string,
    overrides: { kitchenId?: string } = {}
  ) => mutate('DELETE', { recipeId }, overrides.kitchenId)
  return { deleteRecipe }
}
