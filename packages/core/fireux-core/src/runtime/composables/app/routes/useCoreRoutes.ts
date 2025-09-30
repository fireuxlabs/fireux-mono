// packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts
import { computed } from 'vue'
import { useUserRoutes } from './useUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useUser } from '../../firestore/user/useUser'

export function useCoreRoutes() {
  const systemRoutes = useSystemRoutes()
  const { hasCoreProfile, isAdmin } = useUser()

  const links = computed(() => [
    ...systemRoutes,
    ...(hasCoreProfile.value ? useUserRoutes() : []),
    ...(isAdmin.value ? useAdminRoutes() : []),
  ])

  return { links }
}
