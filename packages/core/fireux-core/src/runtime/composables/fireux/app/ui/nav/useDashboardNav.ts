import { computed } from 'vue'
import type { NavItem, NavPosition } from '../../nav.types'
import { useUser } from '../../../firestore/core/user/useUser'
import { useNav } from './useNav'

const canShowDashboardItem = (item: NavItem, isAdmin: boolean, isDev: boolean) => {
  if (item.key === 'dashboard-admin' || item.to === '/dashboard/admin') {
    return isAdmin
  }

  if (
    item.key === 'dashboard-developer' ||
    item.to === '/dashboard/developer'
  ) {
    return isDev
  }

  return true
}

export const useDashboardNav = () => {
  const nav = useNav(['dashboard'])
  const { isAdmin } = useUser()
  const isDev = computed(() => import.meta.dev)

  const topPriority = [
    { key: 'dashboard-developer', to: '/dashboard/developer' },
    { key: 'dashboard-admin', to: '/dashboard/admin' },
    { key: 'dashboard-home', to: '/dashboard' },
    { key: 'dashboard-user-profile', to: '/dashboard/user-profile' },
  ]

  const baseNavFilter = (item: NavItem) =>
    item.group !== 'profiles' &&
    !item.profileId &&
    canShowDashboardItem(item, isAdmin.value, isDev.value)

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
