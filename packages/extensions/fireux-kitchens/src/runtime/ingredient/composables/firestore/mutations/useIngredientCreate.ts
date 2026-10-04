import { ref, watch, type WatchSource } from 'vue'
import { refreshNuxtData, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
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

export function useIngredientCreate(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth(), config = useFireUXConfig(), route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const sources = [() => currentUser.value?.uid, () => config.appId, appUser, appPending, appError, appOutcome, () => route.fullPath, ...ownerSources]
  const captureIntent = useCommandScope(sources), scopeEpoch = ref(0)
  watch(sources, () => { scopeEpoch.value += 1 }, { flush: 'sync' })

  const createIngredient = async (
    draft: IngredientCreateDraft
  ): Promise<IngredientCreateResult> => {
    const name = normalizeString(draft.name)
    if (!name) throw new Error('Ingredient name is required')

    const isCurrent = captureIntent()
    const body = JSON.parse(JSON.stringify({ ...draft, name }))
    const user = currentUser.value
    if (!user) throw new Error('Sign in to curate Ingredients')
    const token = await user.getIdToken()
    if (!isCurrent()) throw new Error('The Ingredient curation context changed. Reopen this action.')
    const response = await $fetch<IngredientDetailResponse>(
      '/api/internal/ingredients',
      {
        method: 'POST',
        timeout: 240_000,
        retry: 0,
        headers: { Authorization: `Bearer ${token}` },
        body,
      }
    )

    if (response?.ingredient?.id !== normalizeSlug(name, { maxLength: 120 })) throw new Error('Ingredient response did not match this command.')
    if (isCurrent()) await refreshNuxtData([
      'ingredient-collection-v2',
      'curator-ingredient-library-v2',
    ])
    return {
      id: response.ingredient.id,
      ingredient: response.ingredient,
    }
  }

  return { createIngredient, captureIntent, scopeEpoch }
}
