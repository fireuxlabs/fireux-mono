import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type {
  PublicIngredient,
  PublicIngredientDetailResponse,
} from '../../../models/ingredient-public.model'

export type IngredientDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type IngredientDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseIngredientDetailReturn = IngredientDetailControls & {
  ingredient: ComputedRef<PublicIngredient | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<IngredientDetailOutcome>
}

function readStatusCode(error: unknown): number {
  if (!error || typeof error !== 'object') return 0
  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  return Number(
    candidate.statusCode ?? candidate.status ?? candidate.response?.status ?? 0
  )
}

export function useIngredientDetail(
  ingredientId: MaybeRef<string | null | undefined>
): UseIngredientDetailReturn {
  const id = computed(() => String(unref(ingredientId) ?? '').trim())
  const state = useAsyncData<PublicIngredientDetailResponse | null>(
    () => `ingredient-detail|${id.value || 'none'}`,
    async () => {
      if (!id.value) return null
      return $fetch<PublicIngredientDetailResponse>(
        `/api/ingredients/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const ingredient = computed<PublicIngredient | null>(() => {
    const item = state.data.value?.item
    return item && item.id === id.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !ingredient.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<IngredientDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    ingredient,
    ready: state.then(() => undefined),
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    statusCode,
    missing,
    failed,
    outcome,
  }
}
