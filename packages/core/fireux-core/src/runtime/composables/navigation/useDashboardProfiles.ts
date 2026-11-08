import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { NavItem } from './types'

/** Profile navigation projects route metadata without acquiring account readers. */
export function useDashboardProfiles(
  items: MaybeRefOrGetter<readonly NavItem[]>
) {
  const isProfileEntry = (item: NavItem) =>
    item.group === 'profiles' && Boolean(item.profileId)

  const isPreferredProfileEntry = (item: NavItem) =>
    item.to.endsWith('/profile')

  const profileEntries = computed(() => {
    const byProfileId = new Map<string, NavItem>()

    for (const item of toValue(items)) {
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
  const availableProfileEntries = computed(() => profileEntries.value)

  return { profileEntries, availableProfileEntries }
}
