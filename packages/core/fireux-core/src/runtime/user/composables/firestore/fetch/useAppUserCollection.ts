// Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: fail closed when hydrating App member avatars.
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: replace raw cross-user reads with the bounded App-admin API.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import type {
  AppAdminJoinRequest,
  AppAdminMember,
  AppAdminPeopleResponse,
} from '../../../../app/models/app-context.model.ts'
import type { UserIdentitySummary } from '../../../models/user-directory.model.ts'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'

type AppAdminPeopleState = {
  requestUid: string
  response: AppAdminPeopleResponse
}

type AppUserCollectionControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error'
>

export type EnrichedAppUser = UserIdentitySummary & {
  appUser: AppAdminMember
  coreUser: UserIdentitySummary
}

export type UseAppUserCollectionReturn = AppUserCollectionControls & {
  appId: ComputedRef<string>
  memberships: ComputedRef<AppAdminMember[]>
  users: ComputedRef<EnrichedAppUser[]>
  fulfilled: ComputedRef<EnrichedAppUser[]>
  usersById: ComputedRef<Map<string, UserIdentitySummary>>
  userById: (id: string | null | undefined) => UserIdentitySummary | undefined
  joinRequests: ComputedRef<AppAdminJoinRequest[]>
  count: ComputedRef<number>
  outcome: ComputedRef<'idle' | 'pending' | 'error' | 'empty' | 'ready'>
  truncated: ComputedRef<boolean>
  refresh: () => Promise<void>
}

/**
 * Loads the current runtime App's members and join requests through the
 * authenticated App-admin projection. The server fixes both App and database
 * scope; callers cannot select another App or read raw User documents.
 */
export function useAppUserCollection(
  options: { enabled?: ComputedRef<boolean> } = {}
): UseAppUserCollectionReturn {
  const { appId: configuredAppId } = useFireUXConfig()
  const appId = computed(() => configuredAppId)
  const enabled = computed(() => options.enabled?.value ?? true)
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())

  const state = useAsyncData(
    () => `app-admin-people-${appId.value}`,
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (
        !enabled.value ||
        !import.meta.client ||
        !hasAuthState.value ||
        !user ||
        user.uid !== requestUid
      ) {
        return null
      }

      const token = await user.getIdToken()
      const response = await $fetch<AppAdminPeopleResponse>(
        '/api/internal/app/people',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return { requestUid, response } satisfies AppAdminPeopleState
    },
    {
      server: false,
      lazy: true,
      watch: [enabled, hasAuthState, uid],
    }
  )

  const response = computed<AppAdminPeopleResponse | null>(() => {
    const value = state.data.value
    if (
      !value ||
      value.requestUid !== uid.value ||
      value.response.appId !== appId.value
    ) {
      return null
    }
    return value.response
  })
  const memberships = computed(() => response.value?.members ?? [])
  const joinRequests = computed(() => response.value?.joinRequests ?? [])
  const fulfilled = computed<EnrichedAppUser[]>(() =>
    memberships.value.flatMap((member) =>
      member.user
        ? [
            {
              ...member.user,
              appUser: member,
              coreUser: member.user,
            },
          ]
        : []
    )
  )
  const usersById = computed(
    () => new Map(fulfilled.value.map((user) => [user.id, user.coreUser]))
  )
  const userById = (id: string | null | undefined) =>
    id ? usersById.value.get(id) : undefined
  const count = computed(() => memberships.value.length)
  const pending = computed(
    () => enabled.value && (!hasAuthState.value || state.pending.value)
  )
  const error = state.error
  const outcome = computed(() => {
    if (!enabled.value) return 'idle' as const
    if (!uid.value)
      return hasAuthState.value ? ('idle' as const) : ('pending' as const)
    if (pending.value) return 'pending' as const
    if (error.value) return 'error' as const
    return count.value ? ('ready' as const) : ('empty' as const)
  })
  const truncated = computed(() => response.value?.truncated === true)

  return {
    appId,
    memberships,
    users: fulfilled,
    fulfilled,
    usersById,
    userById,
    joinRequests,
    pending,
    error,
    outcome,
    count,
    truncated,
    refresh: async () => {
      await state.refresh()
    },
  }
}
