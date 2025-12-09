import { computed } from 'vue'
import { useUser } from '#fireux-core-composables/fireux/firestore/core/user/useUser'

export function useProductPermissions() {
  const { isAdmin } = useUser()
  const canManageProducts = computed(() => isAdmin.value)
  return { canManageProducts }
}
