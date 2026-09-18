import { ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

export function useIngredientImageGeneration() {
  const { currentUser } = useAuth()
  const generating = ref(false)
  const error = ref('')
  async function generate(ingredientId: string) {
    if (generating.value) return
    generating.value = true
    error.value = ''
    try {
      const user = currentUser.value
      if (!user) throw new Error('Sign in to generate an ingredient image.')
      const token = await user.getIdToken()
      return await $fetch<{ image_url: string; generated: boolean }>(
        `/api/internal/ingredients/${encodeURIComponent(ingredientId)}/image`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          timeout: 240_000,
          retry: 0,
        }
      )
    } catch (cause: any) {
      error.value =
        cause?.data?.statusMessage ||
        'Image generation failed. Please try again.'
    } finally {
      generating.value = false
    }
  }
  return { generate, generating, error }
}
