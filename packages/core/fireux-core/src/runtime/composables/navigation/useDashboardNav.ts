// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: include app-private profile ids in dashboard navigation.
import type { NavItem, NavPosition } from './types'
import { computed } from 'vue'
import { useUser } from '../../user/composables/useUser'
import { useDeveloperAccess } from '../../user/composables/useDeveloperAccess'
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
  const { appUser, isAdmin } = useUserSession()
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

  const activeProfileIds = computed(
    () =>
      new Set(
        [...(appUser.value?.profiles ?? [])].filter(
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
