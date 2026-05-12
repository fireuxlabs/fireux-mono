import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

import '../models/core/user.ext'

export function useBlogPermissions() {
  const { isAdmin, appUser } = useUser()

  // Allow global/tenant admin only.
  const canPublishBlog = computed(() => {
    const blogAccess = appUser.value as { canPost?: boolean } | null
    return isAdmin.value === true || blogAccess?.canPost === true
  })

  return { canPublishBlog }
}
