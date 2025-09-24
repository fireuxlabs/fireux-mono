// Local type to avoid deep imports
export interface RouteLink {
  id: string
  label: string
  icon: string
  to: string
  children?: RouteLink[]
}

/**
 * Public header routes the tenant wants to add on top of core system routes.
 * Keep it tiny: Products + Blog (Home/Users already come from core system routes).
 */
export function getFireuxDefaultRoutes() {
  const menuBarLinks: RouteLink[] = [
    {
      id: 'products',
      label: 'Products',
      icon: 'i-lucide-box',
      to: '/products',
    },
    { id: 'blog', label: 'Blog', icon: 'i-lucide-book', to: '/blog' },
  ]

  // We don’t add dashboard/user/admin here—CoreDefault will already merge core’s mobile links.
  const mobileLinks: RouteLink[] = []

  return { menuBarLinks, mobileLinks }
}
