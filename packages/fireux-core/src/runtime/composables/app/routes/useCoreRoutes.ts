// Export for core routes with user state handling
import { useAppUserRoutes } from './useAppUserRoutes'
import { useAdminRoutes } from './useAdminRoutes'
import { useSystemRoutes } from './useSystemRoutes'

interface CoreRoutesResult {
  menuBarLinks: any[]
  mobileLinks: any[]
}

export async function getCoreRoutes(): Promise<CoreRoutesResult> {
  // Default values for SSR
  let menuBarLinks: any[] = []
  let mobileLinks: any[] = []

  // Core routes are always available
  const systemRoutes = useSystemRoutes() || []
  menuBarLinks = [...systemRoutes]
  mobileLinks = [...systemRoutes]

  // Only call on client side to avoid SSR errors
  if (import.meta.client) {
    const { isAppUser, isAdmin } = await import(
      '../../firestore/AppUser/useAppUser'
    ).then((m) => m.useAppUser())
    if (isAppUser.value) {
      const userRoutes = useAppUserRoutes() || []
      mobileLinks.push(...userRoutes)
    }
    if (isAdmin.value) {
      const adminRoutes = useAdminRoutes() || []
      mobileLinks.push(...adminRoutes)
    }
  }

  return {
    menuBarLinks,
    mobileLinks,
  }
}
