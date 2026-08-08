import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'

import '../models/core/user.ext'

export function useProductPermissions() {
  const { isAdmin, appUser, pending } = useUser()

  // Allow global/tenant admin or appUser flag
  const canManageProducts = computed(() => {
    const productAccess = appUser.value as { canManageProducts?: boolean } | null
    return isAdmin.value === true || productAccess?.canManageProducts === true
  })

  // Expose pending to match the blog permissions chain
  return { canManageProducts, pending }
}
