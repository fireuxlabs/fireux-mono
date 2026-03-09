import { computed } from 'vue'
import type { NavItem } from '../../../../../types/nav'
import { useUser } from '../../firestore/core/user/useUser'
import { getConsoleScopeFromPath } from './consoleRoutes'
import { useConsoleAccess } from './useConsoleAccess'
import { useNav } from '../ui/nav/useNav'

export const useDefaultNav = () => useNav(['default'])
export const useLandingNav = () => useNav(['landing'])

const canShowDashboardItem = (item: NavItem, isAdmin: boolean, isDev: boolean) => {
  if (item.key === 'admin' || item.to === '/dashboard/admin') {
    return isAdmin
  }

  if (item.key === 'console-developer' || item.to === '/dashboard/developer') {
    return isDev
  }

  return true
}

export const useDashboardNav = () => {
  const nav = useNav(['dashboard'])
  const { isAdmin } = useUser()
  const isDev = computed(() => import.meta.dev)

  const topPriority = [
    { key: 'console-developer', to: '/dashboard/developer' },
    { key: 'admin', to: '/dashboard/admin' },
    { key: 'console-home', to: '/dashboard' },
    { key: 'console-user-profile', to: '/dashboard/user-profile' },
  ]

  const baseNavFilter = (item: NavItem) =>
    item.group !== 'profiles' &&
    !item.profileId &&
    canShowDashboardItem(item, isAdmin.value, isDev.value)

  return {
    ...nav,
    topPriority,
    baseNavFilter,
  }
}

export const useConsoleNav = () => {
  const nav = useNav(['console'])
  const { canAccessScope, consoleEnabled } = useConsoleAccess()

  return {
    ...nav,
    baseNavFilter: (item: NavItem) => {
      if (!item.to?.startsWith('/console')) return true

      const scope = getConsoleScopeFromPath(item.to)
      if (!scope) return consoleEnabled.value
      return canAccessScope(scope)
    },
  }
}

export const useDevNav = () => useNav(['dev'])
