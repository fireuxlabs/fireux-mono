import { ref, watch, type WatchSource } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'

export function useIngredientImageGeneration(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth(), runtime = useFireUXConfig(), route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const sources = [() => currentUser.value?.uid, () => runtime.appId, appUser, appPending, appError, appOutcome, () => route.fullPath, ...ownerSources]
  const captureIntent = useCommandScope(sources), scopeEpoch = ref(0)
  const generating = ref(false), error = ref('')
  watch(sources, () => { scopeEpoch.value += 1; generating.value = false; error.value = '' }, { flush: 'sync' })
  async function generate(ingredientId: string) {
    if (generating.value) return
    const id = String(ingredientId || '').trim(), isCurrent = captureIntent()
    generating.value = true
    error.value = ''
    try {
      const user = currentUser.value
      if (!user || !id) throw new Error('Sign in and choose an Ingredient to generate its image.')
      const token = await user.getIdToken()
      if (!isCurrent()) throw new Error('The Ingredient generation context changed. Reopen this action.')
      const result = await $fetch<{ id: string; image_url: string; generated: boolean }>(`/api/internal/ingredients/${encodeURIComponent(id)}/image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, timeout: 240_000, retry: 0 })
      if (result?.id !== id || !result.image_url || typeof result.generated !== 'boolean') throw new Error('Ingredient image response did not match the requested Ingredient.')
      return result
    } catch (cause: any) {
      if (isCurrent()) error.value = cause?.data?.statusMessage || 'Image generation failed. Please try again.'
      throw cause
    } finally { if (isCurrent()) generating.value = false }
  }
  return { generate, generating, error, captureIntent, scopeEpoch }
}
