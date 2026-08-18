import { refreshNuxtData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { type IngredientCreateInput } from '../../../models/ingredient.model.ts'
import type {
  PublicIngredient,
  PublicIngredientDetailResponse,
} from '../../../models/ingredient-public.model.ts'

type IngredientCreateDraft = Partial<IngredientCreateInput>

export type IngredientCreateResult = {
  id: string
  ingredient: PublicIngredient
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
    const response = await $fetch<PublicIngredientDetailResponse>(
      '/api/internal/ingredients',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          ...draft,
          name,
        },
      }
    )

    await refreshNuxtData([
      'public-ingredient-library-v2',
      'curator-ingredient-library-v2',
    ])
    return { id: response.item.id, ingredient: response.item }
  }

  return { createIngredient }
}
