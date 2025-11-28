import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Unified user collection accessor.
 * - Always returns the global `users` collection
 * - In tenant runtimes, also returns a local overlay merged with avatar data
 */
export function useUserCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const { isTenant, appId } = useFireUXConfig()

  const globalUsers = firestoreFetchCollection<User>('users')

  const localOverlay =
    isTenant && appId
      ? firestoreFetchCollection<AppUser>(`apps/${appId}/users`)
      : null

  const localUsers = localOverlay
    ? computed<User[]>(() => {
        const overlayList = localOverlay.value ?? []
        if (!overlayList.length) return []

        const globalList = globalUsers.value ?? []
        const globalById = new Map(globalList.map((entry) => [entry.id, entry]))

        return overlayList
          .map((localUser) => {
            const base = globalById.get(localUser.id)
            if (!base) return null

            return {
              ...base,
              role: localUser.role ?? base.role,
              appUser: localUser,
            }
          })
          .filter((entry): entry is User => entry !== null)
      })
    : null

  const scopedUsers = computed<User[]>(() =>
    localUsers ? localUsers.value : globalUsers.value ?? []
  )

  return {
    users: scopedUsers,
    global: globalUsers,
    local: localUsers,
  }
}
