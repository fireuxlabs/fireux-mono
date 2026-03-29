import { computed } from '#imports'
import type {
  AppUser,
  User,
} from '../../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import type { UserRefs } from '../../fetch/useUserFetch'

export function useUserPermissions(user: UserRefs) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }
  const { appId } = useFireUXConfig()

  const isAdmin = computed(() => {
    if (appUser.value?.role === 'admin') return true

    const activeAppId = appId?.trim()
    if (!activeAppId) return false

    return Boolean(coreUser.value?.adminOf?.some((id) => id === activeAppId))
  })

  const isPremium = computed(() => appUser.value?.is_premium === true)
  const canOwnMultipleConsoles = computed(() => isPremium.value)

  return {
    isAdmin,
    isPremium,
    canOwnMultipleConsoles,
  }
}
