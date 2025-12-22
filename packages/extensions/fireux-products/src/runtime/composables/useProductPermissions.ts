import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

export function useProductPermissions() {
  const { isAdmin, appUser, pending } = useUser()

  // Allow global/tenant admin or appUser flag
  const canManageProducts = computed(() => {
    return isAdmin.value === true || appUser.value?.canManageProducts === true
  })

  // Alias to mirror blog permissions shape
  const canPublishProduct = computed(() => canManageProducts.value)

  // Expose pending to match the blog permissions chain
  return { canManageProducts, canPublishProduct, pending }
}
