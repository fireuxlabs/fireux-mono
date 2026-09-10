import { computed, type ComputedRef } from 'vue'
import type {
  AppUserJoinRequestSummary,
  AppUserSummary,
} from '../models/app-user-summary.ts'
import type { AppUserWithId } from '../models/app-user.model.ts'
import { useFireUXConfig } from './config/FireUXConfig'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { useUserHydration } from '../../user/composables/useUserHydration'

type JoinRequestDocument = { id: string; user_id?: string }
/** Live AppUser and join-request collections with exact User hydration. */
export function useAppUsers(options: { enabled?: ComputedRef<boolean> } = {}) {
  const { appId: configuredAppId } = useFireUXConfig()
  const appId = computed(() => configuredAppId)
  const enabled = computed(() => options.enabled?.value ?? true)
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const active = computed(
    () =>
      enabled.value && hasAuthState.value && Boolean(uid.value && appId.value)
  )
  const appUsersPath = computed(() =>
    active.value ? `apps/${appId.value}/users` : ''
  )
  const joinRequestsPath = computed(() =>
    active.value ? `apps/${appId.value}/join-requests` : ''
  )
  const { firestoreFetchCollection } = useFirestoreRead()
  const appUsers = firestoreFetchCollection<AppUserWithId>(appUsersPath)
  const requests =
    firestoreFetchCollection<JoinRequestDocument>(joinRequestsPath)
  const identityIds = computed(() => [
    ...(appUsers.value ?? []).map((member) => member.id),
    ...(requests.value ?? []).map((request) => request.user_id || request.id),
  ])
  const identities = useUserHydration(identityIds)
  const memberships = computed<AppUserSummary[]>(() =>
    (appUsers.value ?? []).map((member) => ({
      id: member.id,
      role: member.role,
      subscription: member.subscription,
      user: identities.userById(member.id) ?? null,
    }))
  )
  const joinRequests = computed<AppUserJoinRequestSummary[]>(() =>
    (requests.value ?? []).map((request) => {
      const id = request.user_id || request.id
      return { id, user: identities.userById(id) ?? null }
    })
  )
  const usersById = computed(
    () => new Map(memberships.value.flatMap(member => member.user ? [[member.id, member.user] as const] : []))
  )
  const userById = (id: string | null | undefined) =>
    id ? usersById.value.get(id) : undefined
  const count = computed(() => memberships.value.length)
  const pending = computed(
    () =>
      active.value &&
      (appUsers.pending.value ||
        requests.pending.value ||
        identities.pending.value)
  )
  const error = computed<unknown>(
    () =>
      appUsers.error.value ||
      requests.error.value ||
      identities.error.value ||
      null
  )
  const outcome = computed(() => {
    if (!active.value) return 'idle' as const
    if (pending.value) return 'pending' as const
    if (error.value) return 'error' as const
    return count.value ? ('ready' as const) : ('empty' as const)
  })
  return {
    appId,
    memberships,
    usersById,
    userById,
    joinRequests,
    count,
    pending,
    error,
    outcome,
    truncated: computed(() => false),
  }
}
