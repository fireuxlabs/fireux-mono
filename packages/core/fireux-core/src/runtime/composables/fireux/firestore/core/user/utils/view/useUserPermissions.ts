// Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: derive one highest current-App tier without duplicating stored authority.
import { computed } from '#imports'
import {
  resolveUserAppAccess,
  type UserAppAccessTier,
} from '../../../../../../../models/core/supporting/user-app-access'
import type { CurrentAppMembershipDto } from '../../../../../../../server/utils/public-projection/public-dto.types'
import { useDeveloperAccess } from '../../../../../app/useDeveloperAccess'
import type { UserRefs } from '../../fetch/useUserFetch'

export type UserAccessTier = UserAppAccessTier

export function useUserPermissions(user: UserRefs) {
  const appUser = user.appUser as {
    value: CurrentAppMembershipDto | null | undefined
  }
  const { isDeveloper } = useDeveloperAccess()

  const access = computed(() =>
    resolveUserAppAccess({
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
  const canOwnMultipleConsoles = hasPremiumAccess

  return {
    isAdmin,
    isPremium,
    isPremiumEntitlement,
    hasPremiumAccess,
    isDeveloper,
    accessTier,
    canOwnMultipleConsoles,
  }
}
