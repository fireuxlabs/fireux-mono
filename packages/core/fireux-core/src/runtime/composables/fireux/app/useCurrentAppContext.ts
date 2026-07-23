import { computed, useAsyncData } from '#imports'
import type { CurrentAppContextResponse } from '../../../server/utils/public-projection/public-dto.types'
import { useAuth } from '../firebase/useAuth'

export function useCurrentAppContext() {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const state = useAsyncData(
    () => 'current-app-context',
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (
        !import.meta.client ||
        !hasAuthState.value ||
        !user ||
        user.uid !== requestUid
      ) {
        return null
      }
      const token = await user.getIdToken()
      const response = await $fetch<CurrentAppContextResponse>(
        '/api/internal/app/context',
        {
          headers: { authorization: `Bearer ${token}` },
        }
      )
      return { requestUid, response }
    },
    {
      server: false,
      lazy: true,
      watch: [hasAuthState, uid],
    }
  )

  const response = computed(() =>
    state.data.value?.requestUid === uid.value
      ? state.data.value?.response ?? null
      : null
  )
  const app = computed(() => response.value?.app ?? null)
  const membership = computed(() => response.value?.membership ?? null)
  const pending = computed(() => !hasAuthState.value || state.pending.value)

  return {
    app,
    membership,
    pending,
    error: state.error,
    refresh: state.refresh,
  }
}
