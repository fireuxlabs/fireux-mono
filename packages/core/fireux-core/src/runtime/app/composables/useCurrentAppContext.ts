import { computed, useAsyncData } from '#imports'
import type { ComputedRef } from 'vue'
import type {
  CurrentAppContextResponse,
  CurrentAppMembership,
} from '../models/app-context.model.ts'
import type { App } from '../models/app.model.ts'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import {
  CURRENT_APP_CONTEXT_ASYNC_DATA_KEY,
  fetchCurrentAppContext,
} from './currentAppContext'

export type UseCurrentAppContextReturn = {
  uid: ComputedRef<string>
  app: ComputedRef<App | null>
  membership: ComputedRef<CurrentAppMembership | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  applyCommittedWorkspaceMembership: (
    patch: CommittedWorkspaceMembershipPatch
  ) => boolean
  refresh: () => Promise<void>
}

export type CommittedWorkspaceMembershipPatch = {
  id: string
  kitchens: string[]
  primary_kitchen: string
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
  const applyCommittedWorkspaceMembership = (
    patch: CommittedWorkspaceMembershipPatch
  ) => {
    const current = state.data.value
    const membership = current?.response.membership
    if (
      !current ||
      current.requestUid !== uid.value ||
      !membership ||
      membership.id !== patch.id
    ) {
      return false
    }
    state.data.value = {
      ...current,
      response: {
        ...current.response,
        membership: {
          ...membership,
          kitchens: [...patch.kitchens],
          primary_kitchen: patch.primary_kitchen,
        },
      },
    }
    return true
  }
  const refresh = async () => {
    await state.refresh()
  }

  return {
    uid,
    app,
    membership,
    pending,
    error,
    applyCommittedWorkspaceMembership,
    refresh,
  }
}
