import { resolveReadOutcome } from '../../../utils/read-outcome'
import { computed, type ComputedRef } from 'vue'
import { where } from 'firebase/firestore'
import type { AppUserSummary } from '../types.ts'
import type { AppUserWithId } from '../types.ts'
import { readAppUserSubscription } from '../utils/validation.ts'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import { useUserHydration } from '../../../user/composables/useUserHydration'

/** Live AppUser collections with exact User hydration. */
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
  const { firestoreCollectionPage } = useFirestoreRead()
  const appUsers = firestoreCollectionPage<AppUserWithId>(appUsersPath, {
    scope: uid,
  })
  const admins = firestoreCollectionPage<AppUserWithId>(appUsersPath, {
    scope: uid,
    constraints: [where('role', 'in', ['admin', 'dev'])],
  })
  const identityIds = computed(() => [
    ...(appUsers.data.value ?? []).map((member) => member.id),
    ...(admins.data.value ?? []).map((member) => member.id),
  ])
  const identities = useUserHydration(identityIds)
  const summarize = (member: AppUserWithId): AppUserSummary => ({
    id: member.id,
    role: member.role,
    subscription: readAppUserSubscription(member.subscription) ?? 'free',
    user: identities.userById(member.id) ?? null,
  })
  const memberships = computed(() => (appUsers.data.value ?? []).map(summarize))
  const administrators = computed(() =>
    (admins.data.value ?? []).map(summarize)
  )
  const usersById = computed(
    () =>
      new Map(
        [...memberships.value, ...administrators.value].flatMap((member) =>
          member.user ? [[member.id, member.user] as const] : []
        )
      )
  )
  const userById = (id: string | null | undefined) =>
    id ? usersById.value.get(id) : undefined
  const count = computed(() => memberships.value.length)
  const pending = computed(
    () =>
      active.value &&
      (appUsers.pending.value ||
        admins.pending.value ||
        identities.pending.value)
  )
  const error = computed<unknown>(
    () =>
      appUsers.error.value ||
      admins.error.value ||
      identities.error.value ||
      null
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: active.value,
      pending: pending.value,
      failed: Boolean(error.value),
      present: count.value > 0,
    })
  )
  return {
    appId,
    memberships,
    administrators,
    usersById,
    userById,
    count,
    pending,
    error,
    outcome,
    membersHasMore: appUsers.hasMore,
    loadMoreMembers: appUsers.loadMore,
    adminsHasMore: admins.hasMore,
    loadMoreAdmins: admins.loadMore,
  }
}
