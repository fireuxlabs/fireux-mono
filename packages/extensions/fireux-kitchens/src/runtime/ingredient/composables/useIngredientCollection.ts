import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed, ref, watch, type ComputedRef } from 'vue'
import type { IngredientDirectoryPage } from '../models/ingredient-directory.model.ts'
import type { Ingredient } from '../utils/ingredient.ts'

export type UseIngredientCollectionResult = {
  ingredients: ComputedRef<Ingredient[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<FirestoreCollectionOutcome>
  refresh: () => Promise<void>
}

export function useIngredientCollection(
  options: { includeInactive?: boolean } = {}
): UseIngredientCollectionResult {
  const includeInactive = options.includeInactive === true
  const { currentUser } = useAuth()
  const session = includeInactive ? useAppSession() : null
  const config = includeInactive ? useFireUXConfig() : null
  const scopeEpoch = ref(0)
  const scope = computed(() =>
    includeInactive
      ? JSON.stringify([
          currentUser.value?.uid,
          config?.appId,
          session?.appUser.value,
          session?.pending.value,
          Boolean(session?.error.value),
        ])
      : ''
  )
  if (includeInactive)
    watch(
      scope,
      () => {
        scopeEpoch.value++
      },
      { flush: 'sync' }
    )
  const active = computed(
    () =>
      !includeInactive ||
      Boolean(
        currentUser.value &&
          config?.role === 'global' &&
          !session?.pending.value &&
          !session?.error.value &&
          (session?.appUser.value?.role === 'admin' ||
            (config.devMode && config.developerId === currentUser.value.uid))
      )
  )
  const state = useLiveAsyncData<IngredientDirectoryPage>(
    () =>
      includeInactive
        ? `curator-ingredient-library-v2|${scopeEpoch.value}`
        : 'ingredient-collection-v2',
    async (liveFetch) => {
      if (!includeInactive) {
        return liveFetch<IngredientDirectoryPage>('/api/ingredients')
      }

      const user = currentUser.value
      const epoch = scopeEpoch.value
      if (!active.value || !user) return { items: [] }
      const token = await user.getIdToken()
      if (epoch !== scopeEpoch.value || !active.value)
        throw new Error('The Ingredient curation context changed.')
      return liveFetch<IngredientDirectoryPage>('/api/internal/ingredients', {
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      dedupe: 'defer',
      server: !includeInactive,
      ...(includeInactive ? { watch: [scope] } : {}),
    }
  )
  const ingredients = computed(() =>
    active.value && !state.pending.value && !state.error.value
      ? (state.data.value?.items ?? [])
      : []
  )
  const count = computed(() => ingredients.value?.length ?? 0)
  const pending = computed(() =>
    includeInactive && session?.error.value
      ? false
      : includeInactive && session?.pending.value
        ? true
        : active.value && !state.error.value && state.pending.value
  )
  const error = computed(() =>
    includeInactive && session?.error.value
      ? session.error.value
      : active.value
        ? (state.error.value ?? undefined)
        : undefined
  )
  const { outcome } = useFirestoreCollectionState({
    active: computed(
      () =>
        active.value ||
        Boolean(
          includeInactive &&
            currentUser.value &&
            config?.role === 'global' &&
            (session?.pending.value || session?.error.value)
        )
    ),
    count,
    error,
    pending,
  })

  return {
    ingredients,
    count,
    pending,
    error,
    outcome,
    refresh: async () => {
      await state.refresh()
    },
  }
}
