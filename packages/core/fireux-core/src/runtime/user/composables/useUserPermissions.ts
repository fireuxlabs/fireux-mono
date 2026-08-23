// Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: derive one highest current-App tier without duplicating stored authority.
import { computed } from '#imports'
import { resolveAppUserAccess } from '../../app/utils/app-user-access'
import type { AppUserSubscription } from '../../app/models/app-user.model.ts'
import type { CurrentAppMembership } from '../../app/models/app-context.model.ts'
import type { UserRefs } from './firestore/fetch/useUserFetch'

export type UserSubscription = AppUserSubscription

export function useUserPermissions(user: UserRefs) {
  const appUser = user.appUser as {
    value: CurrentAppMembership | null | undefined
  }
  const access = computed(() => resolveAppUserAccess(appUser.value))
  const isAdmin = computed(() => access.value.hasAdminAuthority)
  const isDeveloper = computed(() => access.value.hasDeveloperAuthority)
  const subscription = computed<UserSubscription>(
    () => access.value.subscription
  )
  const hasPremiumSubscription = computed(
    () => access.value.hasPremiumSubscription
  )
  const hasBusinessSubscription = computed(
    () => access.value.hasBusinessSubscription
  )
  const canOwnMultipleWorkspaces = hasBusinessSubscription

  return {
    isAdmin,
    isDeveloper,
    subscription,
    hasPremiumSubscription,
    hasBusinessSubscription,
    canOwnMultipleWorkspaces,
  }
}
