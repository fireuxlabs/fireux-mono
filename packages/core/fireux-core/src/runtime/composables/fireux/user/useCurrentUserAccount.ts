import { computed, useAsyncData } from '#imports'
import type { ComputedRef } from 'vue'
import type { UserAccount } from '../../../models/operations/user-account.model'
import { useAuth } from '../firebase/useAuth'
import {
  CURRENT_USER_ACCOUNT_ASYNC_DATA_KEY,
  fetchCurrentUserAccount,
} from './currentUserAccount'

type CurrentUserAccountState = {
  requestUid: string
  account: UserAccount | null
}

export type UseCurrentUserAccountReturn = {
  account: ComputedRef<UserAccount | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refresh: () => Promise<void>
}

/** Resolve the signed-in User's owner-only account through the server boundary. */
export function useCurrentUserAccount(): UseCurrentUserAccountReturn {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const state = useAsyncData<CurrentUserAccountState | null>(
    CURRENT_USER_ACCOUNT_ASYNC_DATA_KEY,
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
      const response = await fetchCurrentUserAccount(user)
      return { requestUid, account: response.account }
    },
    {
      server: false,
      lazy: true,
      watch: [hasAuthState, uid],
    }
  )

  const account = computed(() =>
    state.data.value?.requestUid === uid.value
      ? (state.data.value?.account ?? null)
      : null
  )

  return {
    account,
    pending: computed(() => !hasAuthState.value || state.pending.value),
    error: computed(() => state.error.value),
    refresh: async () => {
      await state.refresh()
    },
  }
}
