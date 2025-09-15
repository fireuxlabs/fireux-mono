import { useAppUser } from '../../firestore/AppUser/useAppUser'
import { useAppUserRoutes } from './useAppUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useSystemRoutes } from './useSystemRoutes'
import { computed } from 'vue'

export function useCoreRoutes() {
  // Always available
  const menuBarLinks = useSystemRoutes()

  // User state (synchronous composable returns computed refs)
  const { isAppUser, isAdmin } = useAppUser()

  // Computed mobile links
  const mobileLinks = computed(() => {
    let links = [...menuBarLinks]
    if (isAppUser.value) {
      links.push(...useAppUserRoutes())
    }
    if (isAdmin.value) {
      links.push(...useAdminRoutes())
    }
    return links
  })

  return {
    menuBarLinks,
    mobileLinks: mobileLinks.value,
  }
}
