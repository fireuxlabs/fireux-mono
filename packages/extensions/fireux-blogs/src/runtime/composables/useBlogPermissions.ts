import { computed } from 'vue'
import { useUser } from '#fireux-core-composables/fireux/firestore/core/user/useUser'

export function useBlogPermissions() {
  const { isAdmin, appUser } = useUser()

  // Allow global/tenant admin only.
  const canPublishBlog = computed(() => {
    return isAdmin.value === true || appUser.value?.canPost === true
  })

  return { canPublishBlog }
}
