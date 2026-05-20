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

  if (item.key === 'dashboard-console') {
    return hasConsoleEntry
  }

  return true
}

export const useDashboardNav = () => {
  const nav = useNav(['dashboard'])
  const { isAdmin, user } = useUser()
  const { isDeveloper } = useDeveloperAccess()
  const { hasConsoleEntry } = useConsoleEntryCta()

  const topPriorityKeys = new Set([
    'dashboard-home',
    'dashboard-user-profile',
    'dashboard-admin',
    'dashboard-developer',
    'dashboard-console',
  ])

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

    return item.key && topPriorityKeys.has(item.key) ? 'top' : 'bottom'
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
    item.to.endsWith('/profile')

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
    baseNavFilter,
    resolveItemPosition,
    profileEntries,
    activeProfileEntries,
    availableProfileEntries,
  }
}
