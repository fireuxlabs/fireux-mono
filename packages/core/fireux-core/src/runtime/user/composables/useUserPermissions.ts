// Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: derive one highest current-App tier without duplicating stored authority.
import { computed } from '#imports'
import {
  resolveAppUserAccess,
  type AppUserAccessTier,
} from '../../app/utils/app-user-access'
import type { CurrentAppMembershipDto } from '../../server/utils/public-projection/public-dto.types.ts'
import { useDeveloperAccess } from './useDeveloperAccess'
import type { UserRefs } from './firestore/fetch/useUserFetch'

export type UserAccessTier = AppUserAccessTier

export function useUserPermissions(user: UserRefs) {
  const appUser = user.appUser as {
    value: CurrentAppMembershipDto | null | undefined
  }
  const { isDeveloper } = useDeveloperAccess()

  const access = computed(() =>
    resolveAppUserAccess({
      membership: appUser.value,
      isConfiguredDeveloper: isDeveloper.value,
    })
  )
  const isAdmin = computed(() => access.value.hasAdminAuthority)
  const isPremiumEntitlement = computed(
    () => access.value.hasExplicitPremiumEntitlement
  )
  const hasPremiumAccess = computed(() => access.value.hasPremiumAccess)
  // Compatibility alias: callers historically consumed `isPremium`.
  // It now means effective Premium-or-higher capability, not the raw grant.
  const isPremium = hasPremiumAccess
  const accessTier = computed<UserAccessTier | null>(() => access.value.tier)
  const canOwnMultipleWorkspaces = hasPremiumAccess

  return {
    isAdmin,
    isPremium,
    isPremiumEntitlement,
    hasPremiumAccess,
    isDeveloper,
    accessTier,
    canOwnMultipleWorkspaces,
  }
}
