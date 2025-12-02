import { computed } from 'vue'
import type { Ref } from 'vue'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import { useAppUsers } from 'fireux-core/runtime/composables/firestore/core/app/subcollections/users.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

type EnrichedUser = {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  profiles?: string[]
  appUser?: AppUser | null
  coreUser?: User | null
}

/**
 * Hydrates `/apps/{appId}/users` entries with their `/users/{id}` records.
 */
export function useUserCollection() {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { users: appUsers, pending } = useAppUsers()

  const userCache = new Map<string, Ref<User | undefined>>()
  const getCoreUser = (id: string) => {
    if (!userCache.has(id)) {
      userCache.set(id, firestoreFetchDoc<User>('users', id))
    }
    return userCache.get(id)!
  }

  const fulfilled = computed<EnrichedUser[]>(() => {
    const members = appUsers.value ?? []
    if (!members.length) return []

    return members
      .map((member) => {
        const record = getCoreUser(member.id).value
        if (!record?.id) return null

        return {
          id: record.id,
          display_name: record.display_name ?? record.id,
          avatar: record.avatar ?? '',
          handle: record.handle,
          email: record.email,
          profiles: record.profiles ?? [],
          appUser: member,
          coreUser: record,
        }
      })
      .filter((entry): entry is EnrichedUser => Boolean(entry?.id))
  })

  return {
    fulfilled,
    users: fulfilled,
    pending,
  }
}
