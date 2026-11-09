import type { NavItem, NavPosition } from '../../models/navigation'
import { useMounted } from '@vueuse/core'
import { useUserSession } from '../../user/composables/session/useUserSession'
import { useDeveloperAccess } from '../../app/composables/useDeveloperAccess'
import { useWorkspaceEntryCta } from '../../workspace/composables/useWorkspaceEntryCta'
import { useNav } from './useNav'
import { useDashboardProfiles } from './useDashboardProfiles'

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
  const mounted = useMounted()
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
      mounted.value && isAdmin.value,
      mounted.value && isDeveloper.value,
      mounted.value && hasWorkspaceEntry.value
    )

  const resolveItemPosition = (item: NavItem): NavPosition => {
    if (item.position) return item.position

    if (item.group === 'profiles' || item.profileId) {
      return 'middle'
    }

    return item.key && topPriorityKeys.has(item.key) ? 'top' : 'bottom'
  }

  const { profileEntries, availableProfileEntries } = useDashboardProfiles(
    nav.desktop
  )

  return {
    ...nav,
    baseNavFilter,
    resolveItemPosition,
    profileEntries,
    availableProfileEntries,
  }
}
