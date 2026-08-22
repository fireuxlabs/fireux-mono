import { useAsyncData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { computed, type ComputedRef } from 'vue'
import type { IngredientDirectoryPage } from '../../../models/ingredient-directory.model.ts'
import type { Ingredient } from '../../../utils/ingredient.ts'

export type UseIngredientCollectionResult = {
  ingredients: ComputedRef<Ingredient[] | undefined>
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
  const state = useAsyncData<IngredientDirectoryPage>(
    includeInactive
      ? 'curator-ingredient-library-v2'
      : 'ingredient-directory-v2',
    async () => {
      if (!includeInactive) {
        return $fetch<IngredientDirectoryPage>('/api/ingredients')
      }

      const user = currentUser.value
      if (!user) throw new Error('Sign in to curate Ingredients')
      const token = await user.getIdToken()
      return $fetch<IngredientDirectoryPage>('/api/internal/ingredients', {
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      dedupe: 'defer',
      server: !includeInactive,
      ...(includeInactive ? { watch: [currentUser] } : {}),
    }
  )
  const ingredients = computed(() => state.data.value?.items)
  const count = computed(() => ingredients.value?.length ?? 0)
  const pending = computed(() => state.pending.value)
  const error = computed(() => state.error.value ?? undefined)
  const { outcome } = useFirestoreCollectionState({
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
