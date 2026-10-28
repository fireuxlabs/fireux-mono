import { useAsyncData } from 'nuxt/app'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

export function useUserConnections() {
  const { currentUser } = useAuth()
  const active = computed(() =>
    Boolean(currentUser.value && !currentUser.value.isAnonymous)
  )
  const state = useAsyncData<{
    uid: string
    connected: boolean
    localLabel: string
    connectedAt: number | null
    miseboxOrigin: string
  }>(
    computed(() => `user-connections:${currentUser.value?.uid || ''}`),
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const user = currentUser.value
      if (!user || !active.value)
        throw new Error('Sign in to view connected accounts.')
      const token = await user.getIdToken()
      if (currentUser.value?.uid !== user.uid)
        throw new Error('Your account changed.')
      return fetchRead('/api/account/connections', {
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    { server: false }
  )
  const connection = computed(() =>
    active.value &&
    !state.error.value &&
    state.data.value?.uid === currentUser.value?.uid
      ? state.data.value
      : null
  )
  return { connection, pending: state.pending, error: state.error }
}
