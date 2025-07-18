// Export for core routes with user state handling
import { useAppUser } from '../../firestore/AppUser/useAppUser'
import { useAppUserRoutes } from './useAppUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useSystemRoutes } from './useSystemRoutes'

interface CoreRoutesResult {
  coreRoutes: any[]
  appUserRoutes: any[]
  adminRoutes: any[]
}

export async function getCoreRoutes(): Promise<CoreRoutesResult> {
  // Default values for SSR
  let coreRoutes: any[] = []
  let appUserRoutes: any[] = []
  let adminRoutes: any[] = []

  // Core routes are always available
  coreRoutes = useSystemRoutes() || []

  // Only call on client side to avoid SSR errors
  if (import.meta.client) {
    const { isAppUser, isAdmin } = await useAppUser()

    // Get routes based on user state
    if (isAppUser.value) {
      appUserRoutes = useAppUserRoutes() || []
    }
    if (isAdmin.value) {
      adminRoutes = useAdminRoutes() || []
    }
  }

  return {
    coreRoutes,
    appUserRoutes,
    adminRoutes,
  }
}
