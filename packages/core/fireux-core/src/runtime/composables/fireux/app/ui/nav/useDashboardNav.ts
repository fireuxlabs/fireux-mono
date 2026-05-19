import type { NavItem, NavPosition } from '../../nav.types'
import { computed } from 'vue'
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
  const { isAdmin, user } = useUser()
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

  const activeProfileIds = computed(
    () =>
      new Set(
        (user.value?.profiles ?? []).filter(
          (profileId): profileId is string =>
            typeof profileId === 'string' && profileId.length > 0
        )
      )
  )

  const isProfileEntry = (item: NavItem) =>
    item.group === 'profiles' && Boolean(item.profileId)

  const isPreferredProfileEntry = (item: NavItem) =>
    item.to.endsWith('/profile') || item.key?.endsWith('-profile')

  const profileEntries = computed(() => {
    const byProfileId = new Map<string, NavItem>()

    for (const item of nav.desktop.value) {
      if (!isProfileEntry(item) || !item.profileId) continue

      const current = byProfileId.get(item.profileId)
      const itemPreferred = isPreferredProfileEntry(item)
      const currentPreferred = current ? isPreferredProfileEntry(current) : false

      if (
        !current ||
        (itemPreferred && !currentPreferred) ||
        (itemPreferred === currentPreferred && item.order < current.order)
      ) {
        byProfileId.set(item.profileId, item)
      }
    }

    return [...byProfileId.values()].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.label.localeCompare(b.label)
    })
  })

  const activeProfileEntries = computed(() =>
    profileEntries.value.filter(
      (item) => item.profileId && activeProfileIds.value.has(item.profileId)
    )
  )

  const availableProfileEntries = computed(() =>
    profileEntries.value.filter(
      (item) => item.profileId && !activeProfileIds.value.has(item.profileId)
    )
  )

  return {
    ...nav,
    topPriority,
    baseNavFilter,
    resolveItemPosition,
    profileEntries,
    activeProfileEntries,
    availableProfileEntries,
  }
}
