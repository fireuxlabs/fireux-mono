import { computed } from 'vue'
import { useUser } from '#fireux-core-composables/fireux/firestore/core/user/useUser'

export function useBlogPermissions() {
  const { isAdmin, appUser } = useUser()

  const canPublishBlog = computed(
    () => isAdmin.value || appUser.value?.canPost === true
  )

  return { canPublishBlog }
}
