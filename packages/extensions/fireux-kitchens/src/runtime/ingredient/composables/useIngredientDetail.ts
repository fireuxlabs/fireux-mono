import { useAsyncData } from 'nuxt/app'
import { resolveHttpDocumentOutcome } from 'fireux-core/runtime/utils/http-document-outcome'

import { type ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type { IngredientDetailResponse } from '../models/ingredient-directory.model'
import type { Ingredient } from '../models/ingredient.model'

export type IngredientDetailOutcome = ReadOutcome
type IngredientDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>
export type UseIngredientDetailReturn = IngredientDetailControls & {
  ingredient: ComputedRef<Ingredient | null>
  ready: Promise<void>
  outcome: ComputedRef<IngredientDetailOutcome>
}

export function useIngredientDetail(
  ingredientId: MaybeRef<string | null | undefined>
): UseIngredientDetailReturn {
  const id = computed(() => String(unref(ingredientId) ?? '').trim())
  const state = useAsyncData<IngredientDetailResponse | null>(
    () => `ingredient-detail|${id.value || 'none'}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      if (!id.value) return null
      return fetchRead<IngredientDetailResponse>(
        `/api/ingredients/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const outcome = computed(() => {
    if (!id.value) return 'idle'
    if (
      state.data.value?.ingredient &&
      state.data.value.ingredient.id !== id.value
    )
      return 'pending'
    return resolveHttpDocumentOutcome({
      enabled: Boolean(id.value),
      pending: state.pending.value,
      error: state.error.value,
      present: Boolean(state.data.value?.ingredient),
    })
  })
  const ingredient = computed(() =>
    outcome.value === 'ready' ? (state.data.value?.ingredient ?? null) : null
  )
  return {
    ingredient,
    ready: state.then(() => undefined),
    pending: computed(() => outcome.value === 'pending'),
    error: state.error,
    refresh: state.refresh,
    outcome,
  }
}
