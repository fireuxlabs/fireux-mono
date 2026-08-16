import { computed, useAsyncData } from '#imports'
import type { ComputedRef } from 'vue'
import type { UserContext } from '../../../models/operations/user-context.model'
import { useAuth } from '../firebase/useAuth'
import {
  CURRENT_USER_CONTEXT_ASYNC_DATA_KEY,
  fetchCurrentUserContext,
  updateCurrentUserContext,
} from './currentUserContext'

type CurrentUserContextState = {
  requestUid: string
  userContext: UserContext | null
}

export type UseCurrentUserContextReturn = {
  userContext: ComputedRef<UserContext | null>
  context: ComputedRef<string>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  updateContext: (context: string) => Promise<void>
  refresh: () => Promise<void>
}

/** Read and update the signed-in User's private ecosystem-scoped AI memory. */
export function useCurrentUserContext(): UseCurrentUserContextReturn {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const state = useAsyncData<CurrentUserContextState | null>(
    CURRENT_USER_CONTEXT_ASYNC_DATA_KEY,
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
      const response = await fetchCurrentUserContext(user)
      return { requestUid, userContext: response.userContext }
    },
    {
      server: false,
      lazy: true,
      watch: [hasAuthState, uid],
    }
  )

  const userContext = computed(() =>
    state.data.value?.requestUid === uid.value
      ? (state.data.value?.userContext ?? null)
      : null
  )

  return {
    userContext,
    context: computed(() => userContext.value?.context ?? ''),
    pending: computed(() => !hasAuthState.value || state.pending.value),
    error: computed(() => state.error.value),
    updateContext: async (context) => {
      const user = currentUser.value
      if (!user) throw new Error('A signed-in User is required.')
      await updateCurrentUserContext(user, context)
      await state.refresh()
    },
    refresh: async () => {
      await state.refresh()
    },
  }
}
