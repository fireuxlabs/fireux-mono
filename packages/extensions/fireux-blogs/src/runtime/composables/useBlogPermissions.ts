import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

import '../models/core/user.ext'

export function useBlogPermissions() {
  const { isAdmin } = useUser()

  const canPublishBlog = computed(() => isAdmin.value === true)

  return { canPublishBlog }
}
