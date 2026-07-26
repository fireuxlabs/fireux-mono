import { useAsyncData } from '#imports'
import { computed, type ComputedRef } from 'vue'
import type {
  PublicIngredient,
  PublicIngredientDetailResponse,
} from '../../../../../models/ingredient-public.model'

export type IngredientFetchState = {
  ingredient: ComputedRef<PublicIngredient | null | undefined>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refresh: () => Promise<void>
}

export type UseIngredientFetchResult = {
  fetchIngredient: (ingredientId: string) => IngredientFetchState
}

export function useIngredientFetch(): UseIngredientFetchResult {
  const fetchIngredient = (ingredientId: string): IngredientFetchState => {
    const resolvedIngredientId = String(ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const state = useAsyncData<PublicIngredient | null>(
      `public-ingredient-${resolvedIngredientId}`,
      async () => {
        try {
          const response = await $fetch<PublicIngredientDetailResponse>(
            `/api/ingredients/${encodeURIComponent(resolvedIngredientId)}`
          )
          return response.item
        } catch (error: any) {
          if (Number(error?.statusCode || error?.status) === 404) return null
          throw error
        }
      },
      { dedupe: 'defer' }
    )
    return {
      ingredient: computed(() => state.data.value),
      pending: computed(() => state.pending.value),
      error: computed(() => state.error.value ?? undefined),
      refresh: async () => {
        await state.refresh()
      },
    }
  }

  return {
    fetchIngredient,
  }
}
