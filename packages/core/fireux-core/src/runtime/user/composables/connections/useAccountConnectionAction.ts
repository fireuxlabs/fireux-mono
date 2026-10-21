import { $fetch } from '#imports'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'

export type ConfirmedAccount = { uid: string; token: string }
export function connectionFeedback(error: unknown) {
  return String(
    (error as { data?: { statusMessage?: string } })?.data?.statusMessage ||
      (error as Error)?.message ||
      'Please try again.'
  ).slice(0, 300)
}
/** Scope client continuations; the server owns linking and sign-in authority. */
export function useAccountConnectionAction(endpoint: string) {
  const { currentUser } = useAuth()
  const route = useRoute()
  const capture = useCommandScope([
    () => currentUser.value?.uid,
    () => route.fullPath,
  ])
  const busy = ref(false)
  const error = ref('')
  watch(
    [() => currentUser.value?.uid, () => route.fullPath],
    () => {
      busy.value = false
      error.value = ''
    },
    { flush: 'sync' }
  )
  async function run<T extends { uid?: string }>(
    body: Record<string, unknown>,
    confirmed?: ConfirmedAccount
  ) {
    if (busy.value) return null
    const input = structuredClone(body)
    const user = currentUser.value
    const isCurrent = capture()
    busy.value = true
    error.value = ''
    try {
      if (
        !user ||
        user.isAnonymous ||
        (confirmed && confirmed.uid !== user.uid)
      )
        throw new Error('Your account changed. Please confirm it again.')
      const token = confirmed?.token || (await user.getIdToken())
      if (!isCurrent()) return null
      const response = await $fetch<T, string, 'POST'>(endpoint, {
        method: 'POST',
        body: input,
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.uid && response.uid !== user.uid)
        throw new Error(
          'The account response did not match. Please start again.'
        )
      return isCurrent() ? response : null
    } catch (failure) {
      if (isCurrent()) error.value = connectionFeedback(failure)
      return null
    } finally {
      if (isCurrent()) busy.value = false
    }
  }
  return { run, busy, error, currentUser }
}
