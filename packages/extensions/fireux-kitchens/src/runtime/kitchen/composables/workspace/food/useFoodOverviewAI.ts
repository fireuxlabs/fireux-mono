import { ref, watch, toValue, type MaybeRefOrGetter } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'

export function useFoodOverviewAI(input: {
  kitchenId: MaybeRefOrGetter<string>
  ready: MaybeRefOrGetter<boolean>
  overview: MaybeRefOrGetter<Record<string, unknown>>
}) {
  const prompt = ref(''),
    message = ref(''),
    error = ref(''),
    submitting = ref(false)
  const { currentUser } = useAuth()
  const { appUser } = useUserSession()
  const config = useFireUXConfig()
  const route = useRoute()
  const sources = [
    () => currentUser.value?.uid,
    appUser,
    () => config.appId,
    () => route.fullPath,
    () => toValue(input.kitchenId),
    () => toValue(input.ready),
    () => JSON.stringify(toValue(input.overview)),
  ]
  const capture = useCommandScope(sources)
  watch(
    sources,
    () => {
      message.value = ''
      error.value = ''
      submitting.value = false
    },
    { flush: 'sync' }
  )
  async function ask() {
    if (!toValue(input.ready) || !prompt.value.trim() || submitting.value)
      return
    const isCurrent = capture()
    const uid = currentUser.value?.uid
    const body = {
      kitchenId: toValue(input.kitchenId),
      prompt: prompt.value.trim(),
      overview: JSON.parse(JSON.stringify(toValue(input.overview))),
    }
    submitting.value = true
    message.value = ''
    error.value = ''
    try {
      const user = await useRequireUser()
      if (!isCurrent() || user.uid !== uid) return
      const token = await user.getIdToken()
      if (!isCurrent()) return
      const result = await $fetch<{ message: string }>(
        '/api/workspace/kitchen/food-and-drink/answer',
        {
          method: 'POST',
          timeout: 65000,
          retry: 0,
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      )
      if (isCurrent()) message.value = result.message
    } catch (cause) {
      if (isCurrent())
        error.value =
          cause instanceof Error
            ? cause.message
            : 'KitchenAI could not answer. Please try again.'
    } finally {
      if (isCurrent()) submitting.value = false
    }
  }
  return { prompt, message, error, submitting, ask }
}
