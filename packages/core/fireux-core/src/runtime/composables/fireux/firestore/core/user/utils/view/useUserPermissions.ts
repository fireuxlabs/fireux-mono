// Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: derive one highest current-App tier without duplicating stored authority.
import { computed } from '#imports'
import type { UserApp } from '../../../../../../../models/core/user.model'
import { useDeveloperAccess } from '../../../../../app/useDeveloperAccess'
import type { UserRefs } from '../../fetch/useUserFetch'

export type UserAccessTier = 'free' | 'premium' | 'admin' | 'dev'

export function useUserPermissions(user: UserRefs) {
  const appUser = user.appUser as { value: UserApp | null | undefined }
  const { isDeveloper } = useDeveloperAccess()

  const isAdmin = computed(() => {
    return appUser.value?.role === 'admin'
  })

  const isPremium = computed(() => appUser.value?.is_premium === true)
  const accessTier = computed<UserAccessTier | null>(() => {
    if (isDeveloper.value) return 'dev'
    if (!appUser.value) return null
    if (isAdmin.value) return 'admin'
    if (isPremium.value) return 'premium'
    return 'free'
  })
  const canOwnMultipleConsoles = computed(() => isPremium.value)

  return {
    isAdmin,
    isPremium,
    isDeveloper,
    accessTier,
    canOwnMultipleConsoles,
  }
}
