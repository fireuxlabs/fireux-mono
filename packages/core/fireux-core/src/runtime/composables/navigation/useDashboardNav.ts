import type { NavItem, NavPosition } from './types'
import { computed } from 'vue'
import { useUserSession } from '../../user/composables/session/useUserSession'
import { useDeveloperAccess } from '../../app/composables/useDeveloperAccess'
import { useWorkspaceEntryCta } from '../fireux/workspace/useWorkspaceEntryCta'
import { useNav } from './useNav'

const canShowDashboardItem = (
  item: NavItem,
  isAdmin: boolean,
  isDev: boolean,
  hasWorkspaceEntry: boolean
) => {
  if (item.roles?.includes('admin') && !isAdmin) return false
  if (item.roles?.includes('developer') && !isDev) return false

  if (item.key === 'dashboard-workspace') {
    return hasWorkspaceEntry
  }

  return true
}

export const useDashboardNav = () => {
  const nav = useNav(['dashboard'])
  const { isAdmin } = useUserSession()
  const { isDeveloper } = useDeveloperAccess()
  const { hasWorkspaceEntry } = useWorkspaceEntryCta()

  const topPriorityKeys = new Set([
    'dashboard-home',
    'dashboard-user-profile',
    'dashboard-admin',
    'dashboard-developer',
    'dashboard-workspace',
  ])

  const baseNavFilter = (item: NavItem) =>
    item.group !== 'profiles' &&
    !item.profileId &&
    canShowDashboardItem(
      item,
      isAdmin.value,
      isDeveloper.value,
      hasWorkspaceEntry.value
    )

  const resolveItemPosition = (item: NavItem): NavPosition => {
    if (item.position) return item.position

    if (item.group === 'profiles' || item.profileId) {
      return 'middle'
    }

    return item.key && topPriorityKeys.has(item.key) ? 'top' : 'bottom'
  }

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
      const currentPreferred = current
        ? isPreferredProfileEntry(current)
        : false

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

  // Profile records are owned by their profile Entities, not AppUser.
  // Until those readers provide presence, every configured profile is available.
  const activeProfileEntries = computed<NavItem[]>(() => [])
  const availableProfileEntries = computed(() => profileEntries.value)

  return {
    ...nav,
    baseNavFilter,
    resolveItemPosition,
    profileEntries,
    activeProfileEntries,
    availableProfileEntries,
  }
}
