// Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: derive one highest current-App tier without duplicating stored authority.
import { computed } from '#imports'
import { resolveAppUserAccess } from '../../app/utils/app-user-access'
import type { AppUserSubscription } from '../../app/models/app-user.model.ts'
import type { CurrentAppMembership } from '../../app/models/app-context.model.ts'
import type { UserRead } from './firestore/fetch/useUserRead'

export type UserSubscription = AppUserSubscription

export function useUserPermissions(user: UserRead) {
  const appUser = user.appUser as {
    value: CurrentAppMembership | null | undefined
  }
  const appAccess = computed(() => resolveAppUserAccess(appUser.value))
  const appAccessOutcome = user.appOutcome
  const isAdmin = computed(() => appAccess.value.hasAdminAuthority)
  const isDeveloper = computed(() => appAccess.value.hasDeveloperAuthority)
  const subscription = computed<UserSubscription>(
    () => appAccess.value.subscription
  )
  const hasPremiumSubscription = computed(
    () => appAccess.value.hasPremiumSubscription
  )
  const hasBusinessSubscription = computed(
    () => appAccess.value.hasBusinessSubscription
  )
  const canOwnMultipleWorkspaces = hasBusinessSubscription

  return {
    appAccess,
    appAccessOutcome,
    isAdmin,
    isDeveloper,
    subscription,
    hasPremiumSubscription,
    hasBusinessSubscription,
    canOwnMultipleWorkspaces,
  }
}
