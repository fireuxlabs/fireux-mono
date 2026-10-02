// Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: expose permission hydration before rendering Blog authority.
import { computed } from 'vue'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'

import '../user/models/user.ext.ts'

export function useBlogPermissions() {
  const { isAdmin, pending } = useUserSession()

  const canPublishBlog = computed(() => isAdmin.value === true)

  return { canPublishBlog, pending }
}
