import { refreshNuxtData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { IngredientUpdateInput } from '../../../utils/ingredient.ts'
import type { IngredientDetailResponse } from '../../../models/ingredient-directory.model.ts'

export function useIngredientUpdate() {
  const { currentUser } = useAuth()

  const updateIngredient = async (input: {
    ingredientId: string
    changes: IngredientUpdateInput
  }) => {
    const resolvedIngredientId = String(input.ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const user = currentUser.value
    if (!user) throw new Error('Sign in to curate Ingredients')
    const token = await user.getIdToken()
    const response = await $fetch<IngredientDetailResponse>(
      `/api/internal/ingredients/${encodeURIComponent(resolvedIngredientId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: input.changes,
      }
    )
    await refreshNuxtData([
      `ingredient-${resolvedIngredientId}`,
      'ingredient-collection-v2',
      'curator-ingredient-library-v2',
    ])
    return response.ingredient
  }

  return { updateIngredient }
}
