import { resolveReadOutcome } from '../../../utils/read-outcome'
import { computed } from 'vue'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useUserSession } from '../session/useUserSession'
import { isUserDirectoryEligible } from '../../utils/normalize-user'
import { useUserCollection } from '../useUserCollection'
import { useUserDirectoryCollection } from './useUserDirectoryCollection'

/** Live User directory with App-owned eligibility on tenant surfaces. */
export function useUserDirectory() {
  const { appId, isTenant } = useFireUXConfig()
  const source = isTenant
    ? useUserDirectoryCollection(appId)
    : useUserCollection()
  const { user: currentUser, appUser, appOutcome } = useUserSession()
  const users = computed(() => {
    if (source.pending.value || source.error.value) return []
    const visible = source.users.value.filter(isUserDirectoryEligible)
    const self = currentUser.value
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
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: source.outcome.value !== 'idle',
      pending: source.pending.value,
      failed: Boolean(source.error.value),
      present: users.value.length > 0,
    })
  )
  return {
    users,
    hasMore: source.hasMore,
    loadMore: source.loadMore,
    pending: source.pending,
    error: source.error,
    outcome,
    appId,
  }
}
