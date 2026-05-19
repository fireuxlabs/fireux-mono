import type { NavItem, NavPosition } from '../../nav.types'
import { useUser } from '../../../firestore/core/user/useUser'
import { useDeveloperAccess } from '../../useDeveloperAccess'
import { useConsoleEntryCta } from './useConsoleEntryCta'
import { useNav } from './useNav'

const canShowDashboardItem = (
  item: NavItem,
  isAdmin: boolean,
  isDev: boolean,
  hasConsoleEntry: boolean
) => {
  if (item.roles?.includes('admin') && !isAdmin) return false
  if (item.roles?.includes('developer') && !isDev) return false

  if (item.key === 'dashboard-admin' || item.to === '/dashboard/admin') {
    return isAdmin
  }

  if (
    item.key === 'dashboard-developer' ||
    item.to === '/dashboard/developer'
  ) {
    return isDev
  }

  if (item.key === 'dashboard-console' || item.to === '/dashboard/console') {
    return hasConsoleEntry
  }

  return true
}

export const useDashboardNav = () => {
  const nav = useNav(['dashboard'])
  const { isAdmin } = useUser()
  const { isDeveloper } = useDeveloperAccess()
  const { hasConsoleEntry } = useConsoleEntryCta()

  const topPriority = [
    { key: 'dashboard-home', to: '/dashboard' },
    { key: 'dashboard-chat', to: '/dashboard/chat' },
    { key: 'dashboard-user-profile', to: '/dashboard/user-profile' },
    { key: 'dashboard-admin', to: '/dashboard/admin' },
    { key: 'dashboard-developer', to: '/dashboard/developer' },
    { key: 'dashboard-console', to: '/dashboard/console' },
  ]

  const baseNavFilter = (item: NavItem) =>
    item.group !== 'profiles' &&
    !item.profileId &&
    canShowDashboardItem(
      item,
      isAdmin.value,
      isDeveloper.value,
      hasConsoleEntry.value
    )

  const resolveItemPosition = (item: NavItem): NavPosition => {
    if (item.position) return item.position

    if (item.group === 'profiles' || item.profileId) {
      return 'middle'
    }

    return topPriority.some(
      (priority) =>
        (priority.key && item.key === priority.key) ||
        (priority.to && item.to === priority.to)
    )
      ? 'top'
      : 'bottom'
  }

  return {
    ...nav,
    topPriority,
    baseNavFilter,
    resolveItemPosition,
  }
}
