import { computed } from 'vue'
import type { NavItem } from '../nav.types'
import { useUser } from '../../firestore/core/user/useUser'
import { useNav } from '../ui/nav/useNav'

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
