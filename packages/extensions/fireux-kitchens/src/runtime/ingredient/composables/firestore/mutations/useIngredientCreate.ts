import { refreshNuxtData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { IngredientDetailResponse } from '../../../models/ingredient-directory.model.ts'
import type {
  Ingredient,
  IngredientCreateInput,
} from '../../../utils/ingredient.ts'

type IngredientCreateDraft = Partial<IngredientCreateInput>

export type IngredientCreateResult = {
  id: string
  ingredient: Ingredient
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useIngredientCreate() {
  const { currentUser } = useAuth()

  const createIngredient = async (
    draft: IngredientCreateDraft
  ): Promise<IngredientCreateResult> => {
    const name = normalizeString(draft.name)
    if (!name) throw new Error('Ingredient name is required')

    const user = currentUser.value
    if (!user) throw new Error('Sign in to curate Ingredients')
    const token = await user.getIdToken()
    const response = await $fetch<IngredientDetailResponse>(
      '/api/internal/ingredients',
      {
        method: 'POST',
        timeout: 240_000,
        retry: 0,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          ...draft,
          name,
        },
      }
    )

    await refreshNuxtData([
      'ingredient-collection-v2',
      'curator-ingredient-library-v2',
    ])
    return {
      id: response.ingredient.id,
      ingredient: response.ingredient,
    }
  }

  return { createIngredient }
}
