// Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: expose permission hydration before rendering Blog authority.
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

import '../models/core/user.ext'

export function useBlogPermissions() {
  const { isAdmin, pending } = useUser()

  const canPublishBlog = computed(() => isAdmin.value === true)

  return { canPublishBlog, pending }
}
