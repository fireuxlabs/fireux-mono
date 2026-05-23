import { computed } from '#imports'
import type { AppUser } from '../../../../../../../models/core/user.model'
import type { UserRefs } from '../../fetch/useUserFetch'

export function useUserPermissions(user: UserRefs) {
  const appUser = user.appUser as { value: AppUser | null | undefined }

  const isAdmin = computed(() => {
    return appUser.value?.role === 'admin'
  })

  const isPremium = computed(() => appUser.value?.is_premium === true)
  const canOwnMultipleConsoles = computed(() => isPremium.value)

  return {
    isAdmin,
    isPremium,
    canOwnMultipleConsoles,
  }
}
