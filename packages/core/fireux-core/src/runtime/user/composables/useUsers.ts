import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useUserSession } from './useUserSession'
import { isUserDirectoryEligible, normalizeUser } from '../utils/normalize-user'
import type { User } from '../models/user.model'
import { useUserCollection } from './firestore/fetch/useUserCollection'

/** Live canonical User directory. */
export function useUsers() {
  const { appId, isTenant } = useFireUXConfig()
  const source = useUserCollection()
  const { user: currentUser, appUser, appOutcome } = useUserSession()
  const users = computed(() => {
    const visible = source.users.value
      .map((entry) => normalizeUser(entry.id, entry))
      .filter(
        (entry): entry is User =>
          Boolean(entry) && isUserDirectoryEligible(entry as User)
      )
    const self = currentUser.value
      ? normalizeUser(currentUser.value.id, currentUser.value)
      : null
    const canShowSelf =
      self &&
      isUserDirectoryEligible(self) &&
      (!isTenant || (appOutcome.value === 'ready' && appUser.value))
    if (!canShowSelf) return visible
    const index = visible.findIndex(
      (entry) => entry.id === self.id || entry.handle === self.handle
    )
    if (index < 0) return [self, ...visible]
    return visible.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, ...self } : entry
    )
  })
  const outcome = computed(() => {
    if (source.pending.value) return 'pending' as const
    if (source.error.value) return 'error' as const
    return users.value.length ? ('ready' as const) : ('empty' as const)
  })
  return {
    users,
    pending: source.pending,
    error: source.error,
    outcome,
    appId,
  }
}
