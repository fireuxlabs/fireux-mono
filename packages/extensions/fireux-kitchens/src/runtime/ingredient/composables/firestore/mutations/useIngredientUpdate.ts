import { ref, watch, type WatchSource } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { IngredientUpdateInput } from '../../../utils/ingredient.ts'
import type { IngredientDetailResponse } from '../../../models/ingredient-directory.model.ts'

export function useIngredientUpdate(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth(),
    config = useFireUXConfig(),
    route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const sources = [
    () => currentUser.value?.uid,
    () => config.appId,
    appUser,
    appPending,
    appError,
    appOutcome,
    () => route.fullPath,
    ...ownerSources,
  ]
  const captureIntent = useCommandScope(sources),
    scopeEpoch = ref(0)
  watch(
    sources,
    () => {
      scopeEpoch.value += 1
    },
    { flush: 'sync' }
  )

  const updateIngredient = async (input: {
    ingredientId: string
    changes: IngredientUpdateInput
  }) => {
    const resolvedIngredientId = String(input.ingredientId || '').trim()
    if (!resolvedIngredientId) throw new Error('Ingredient id is required')

    const isCurrent = captureIntent()
    const body = JSON.parse(JSON.stringify(input.changes))
    const user = currentUser.value
    if (!user) throw new Error('Sign in to curate Ingredients')
    const token = await user.getIdToken()
    if (!isCurrent())
      throw new Error(
        'The Ingredient curation context changed. Reopen this action.'
      )
    const response = await $fetch<IngredientDetailResponse>(
      `/api/internal/ingredients/${encodeURIComponent(resolvedIngredientId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body,
      }
    )
    if (
      !response?.ingredient?.id ||
      response.ingredient.id !== resolvedIngredientId
    )
      throw new Error('Ingredient response did not match this command.')
    return response.ingredient
  }

  return { updateIngredient, captureIntent, scopeEpoch }
}
