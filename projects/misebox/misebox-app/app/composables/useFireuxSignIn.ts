import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from '#imports'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { connectionFeedback } from 'fireux-core/runtime/user/composables/connections/useAccountConnectionAction'
export function useFireuxSignIn() {
  const busy = ref(false)
  const error = ref('')
  const route = useRoute()
  const { currentUser } = useAuth()
  const capture = useCommandScope([
    () => currentUser.value?.uid,
    () => route.fullPath,
  ])
  watch(
    [() => currentUser.value?.uid, () => route.fullPath],
    () => {
      busy.value = false
      error.value = ''
    },
    { flush: 'sync' }
  )
  async function start() {
    if (busy.value) return
    const isCurrent = capture()
    busy.value = true
    error.value = ''
    try {
      const result = await $fetch<{ destination: string }>(
        '/api/account/fireux',
        {
          method: 'POST',
          body: { action: 'prepare', returnTo: route.query.redirect },
        }
      )
      if (isCurrent()) await navigateTo(result.destination, { external: true })
    } catch (failure) {
      if (isCurrent()) error.value = connectionFeedback(failure)
    } finally {
      if (isCurrent()) busy.value = false
    }
  }
  return { start, busy, error }
}
