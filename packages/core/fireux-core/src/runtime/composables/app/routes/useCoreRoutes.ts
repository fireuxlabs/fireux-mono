import { useAppUser } from '../../firestore/AppUser/useAppUser'
import { useAppUserRoutes } from './useAppUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useSystemRoutes } from './useSystemRoutes'
import { computed } from 'vue'

export async function useCoreRoutes() {
  // Always available
  const menuBarLinks = useSystemRoutes()

  // Await user state
  const { isAppUser, isAdmin } = await useAppUser()

  // Computed mobile links
  const mobileLinks = computed(() => {
    let links = [...menuBarLinks]
    if (isAppUser) {
      links.push(...useAppUserRoutes())
    }
    if (isAdmin) {
      links.push(...useAdminRoutes())
    }
    return links
  })

  return {
    menuBarLinks,
    mobileLinks,
  }
}
