import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppUser } from '../firestore/AppUser/useAppUser'
import { useFireUXConfig } from '../FireUXConfig'

// Define a type for our route links.
interface RouteLink {
  label: string
  icon: string
  to?: string
  children?: RouteLink[]
}

// Function to generate route links, using runtime config for appName.
export function getRouteLinks() {
  const { appIcon, appName } = useFireUXConfig()
  return {
    app: [
      {
        label: typeof appName === 'string' ? appName : 'App',
        icon: typeof appIcon === 'string' && appIcon ? appIcon : 'i-lucide-app',
        to: '/content',
      },
      { label: 'Products', icon: 'i-lucide-box', to: '/products' },
      { label: 'Blog', icon: 'i-lucide-book', to: '/blog' },
    ],
    dashboard: [
      {
        label: 'User',
        icon: 'i-lucide-user-circle',
        children: [
          {
            label: 'Overview',
            icon: 'i-lucide-layout-dashboard',
            to: '/dashboard',
          },
          { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/profile' },
          {
            label: 'Account',
            icon: 'i-lucide-settings',
            to: '/dashboard/account',
          },
          {
            label: 'Orders',
            icon: 'i-lucide-shopping-cart',
            to: '/dashboard/orders',
          },
          {
            label: 'Subscriptions',
            icon: 'i-lucide-credit-card',
            to: '/dashboard/subscriptions',
          },
          {
            label: 'Favorites',
            icon: 'i-lucide-heart',
            to: '/dashboard/favorites',
          },
        ],
      },
    ],
    admin: [
      {
        label: 'Admin',
        icon: 'i-lucide-shield-check',
        children: [
          {
            label: 'Overview',
            icon: 'i-lucide-layout-dashboard',
            to: '/admin',
          },
          { label: 'Users', icon: 'i-lucide-users', to: '/admin/users' },
          { label: 'Products', icon: 'i-lucide-box', to: '/admin/products' },
          { label: 'Blog', icon: 'i-lucide-book', to: '/admin/blog' },
          {
            label: 'Settings',
            icon: 'i-lucide-sliders',
            to: '/admin/settings',
          },
        ],
      },
    ],
  }
}

// Recursive function to search through route links.
function findLink(path: string, links: RouteLink[]): RouteLink | null {
  for (const link of links) {
    if (link.to === path) return link
    if (link.children) {
      const found = findLink(path, link.children)
      if (found) return found
    }
  }
  return null
}

// Returns route meta data (label and icon) for a given path.
export function getRouteMetaForPath(
  path: string,
  ROUTE_LINKS?: { app: RouteLink[]; dashboard: RouteLink[]; admin: RouteLink[] }
): { label: string; icon: string } {
  if (!ROUTE_LINKS) return { label: '', icon: '' }
  const match =
    findLink(path, ROUTE_LINKS.admin) ||
    findLink(path, ROUTE_LINKS.dashboard) ||
    findLink(path, ROUTE_LINKS.app)
  if (!match) return { label: '', icon: '' }
  return { label: match.label, icon: match.icon }
}

/**
 * useRoutes
 *
 * Returns:
 * - appLinks: Public routes (e.g. Products, Blog).
 * - dashboardLinks: Flat array of dashboard routes; if isAdmin then also include admin routes.
 * - mobileLinks: Groups all links (app, dashboard, and admin if isAdmin) into nested arrays.
 * - subHeader: Computed subheader for the current route.
 */
export async function useRoutes() {
  const { isAdmin } = useAppUser()
  const route = useRoute()
  const ROUTE_LINKS = getRouteLinks()

  // Public app links.
  const appLinks = computed<RouteLink[]>(() => ROUTE_LINKS.app)

  // Dashboard routes for desktop navigation (combined if admin).
  const dashboardLinks = computed<RouteLink[]>(() => {
    const dashboardParent = ROUTE_LINKS.dashboard[0]
    const dashboardChildren: RouteLink[] =
      dashboardParent && dashboardParent.children
        ? dashboardParent.children
        : []
    return isAdmin.value
      ? [...dashboardChildren, ...ROUTE_LINKS.admin]
      : dashboardChildren
  })

  // Mobile: group everything into nested arrays.
  const mobileLinks = computed<RouteLink[][]>(() => {
    const groups: RouteLink[][] = []
    groups.push(ROUTE_LINKS.app)
    groups.push(ROUTE_LINKS.dashboard)
    if (isAdmin.value) {
      groups.push(ROUTE_LINKS.admin)
    }
    return groups
  })

  const subHeader = computed(() => {
    const title = route.meta?.title
    const icon = route.meta?.icon
    return {
      label: typeof title === 'string' ? title : 'Dashboard',
      icon: typeof icon === 'string',
    }
  })

  return { appLinks, dashboardLinks, mobileLinks, subHeader }
}
