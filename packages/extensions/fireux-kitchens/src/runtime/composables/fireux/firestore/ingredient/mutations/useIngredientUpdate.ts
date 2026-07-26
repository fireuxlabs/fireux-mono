import { refreshNuxtData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { IngredientUpdateInput } from '../../../../../models/ingredient.model'
import type { PublicIngredientDetailResponse } from '../../../../../models/ingredient-public.model'

export function useIngredientUpdate() {
  const { currentUser } = useAuth()

  const updateIngredient = async (
    ingredientId: string,
    patch: IngredientUpdateInput
  ) => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const user = currentUser.value
    if (!user) throw new Error('Sign in to curate Ingredients')
    const token = await user.getIdToken()
    const response = await $fetch<PublicIngredientDetailResponse>(
      `/api/internal/ingredients/${encodeURIComponent(resolvedIngredientId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: patch,
      }
    )
    await refreshNuxtData([
      `public-ingredient-${resolvedIngredientId}`,
      'public-ingredient-library-v2',
      'curator-ingredient-library-v2',
    ])
    return response.item
  }

  return { updateIngredient }
}
