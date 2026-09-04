import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'

import '../../user/models/user.ext.ts'

export function useProductPermissions() {
  const { isAdmin, appUser, pending } = useUserSession()

  // Allow global/tenant admin or appUser flag
  const canManageProducts = computed(() => {
    const productAccess = appUser.value as { canManageProducts?: boolean } | null
    return isAdmin.value === true || productAccess?.canManageProducts === true
  })

  // Expose pending to match the blog permissions chain
  return { canManageProducts, pending }
}
