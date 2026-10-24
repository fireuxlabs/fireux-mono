import type { WatchSource } from 'vue'
import { useRecipeMutation } from './useRecipeMutation'

export function useRecipeDelete(ownerSources: WatchSource[] = []) {
  const { mutate } = useRecipeMutation(ownerSources)
  const deleteRecipe = (recipeId: string, target: { kitchenId: string }) =>
    mutate('DELETE', { recipeId }, target.kitchenId)
  return { deleteRecipe }
}
