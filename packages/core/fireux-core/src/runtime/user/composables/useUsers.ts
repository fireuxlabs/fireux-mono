import { useFetch } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import type { CollectionResponse } from '../../models/utils/directory.ts'
import type { User } from '../models/user.model.ts'
import { isUserDirectoryEligible, normalizeUser } from '../utils/normalize-user'
import { useUser } from './useUser'

type UserDirectoryResponse = CollectionResponse<User>

/** Acquire the canonical User directory and reconcile the signed-in User. */
export function useUsers() {
  const { appId, isTenant } = useFireUXConfig()
  const fetched = useFetch<UserDirectoryResponse>('/api/users', {
    key: `users-directory-${isTenant ? appId : 'global'}`,
    query: { limit: 200 },
  })
  const { user: currentUser, appUser, appOutcome } = useUserSession()

  const liveSelfUser = computed<User | null>(() => {
    const user = currentUser.value
    if (!user) return null
    if (isTenant && (appOutcome.value !== 'ready' || !appUser.value)) {
      return null
    }

    const normalized = normalizeUser(user.id, user)
    return normalized && isUserDirectoryEligible(normalized) ? normalized : null
  })
  const fetchedUsers = computed<User[]>(() => {
    const payload = fetched.data.value
    return Array.isArray(payload?.items) ? payload.items : []
  })
  const users = computed<User[]>(() => {
    const merged = [...fetchedUsers.value]
    const live = liveSelfUser.value
    if (!live) return merged

    const index = merged.findIndex(
      (entry) => entry.id === live.id || entry.handle === live.handle
    )
    if (index >= 0) {
      merged[index] = { ...merged[index], ...live }
      return merged
    }

    return [live, ...merged]
  })

  return { users }
}
