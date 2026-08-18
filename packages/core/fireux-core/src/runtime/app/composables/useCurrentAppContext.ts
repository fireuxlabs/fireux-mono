import { computed, useAsyncData } from '#imports'
import type { ComputedRef } from 'vue'
import type {
  CurrentAppDto,
  CurrentAppContextResponse,
  CurrentAppMembershipDto,
} from '../../server/utils/public-projection/public-dto.types.ts'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import {
  CURRENT_APP_CONTEXT_ASYNC_DATA_KEY,
  fetchCurrentAppContext,
} from './currentAppContext'

export type UseCurrentAppContextReturn = {
  uid: ComputedRef<string>
  app: ComputedRef<CurrentAppDto | null>
  membership: ComputedRef<CurrentAppMembershipDto | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refresh: () => Promise<void>
}

type CurrentAppContextState = {
  requestUid: string
  response: CurrentAppContextResponse
}

export function useCurrentAppContext(): UseCurrentAppContextReturn {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const state = useAsyncData<CurrentAppContextState | null>(
    CURRENT_APP_CONTEXT_ASYNC_DATA_KEY,
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
      const response = await fetchCurrentAppContext(user)
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
      ? (state.data.value?.response ?? null)
      : null
  )
  const app = computed(() => response.value?.app ?? null)
  const membership = computed(() => response.value?.membership ?? null)
  const pending = computed(() => !hasAuthState.value || state.pending.value)
  const error = computed<unknown | undefined>(() => state.error.value)
  const refresh = async () => {
    await state.refresh()
  }

  return {
    uid,
    app,
    membership,
    pending,
    error,
    refresh,
  }
}
