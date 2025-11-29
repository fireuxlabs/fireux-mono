import { computed } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
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

type CollectionRef<T> = Ref<T[] | null> | Ref<T[] | undefined>

/**
 * Scoped user collections for runtime contexts.
 * - fetchAppUsers: returns raw tenant memberships only when applicable
 * - fulfillAppUsers: lazily enriches memberships with core profile data
 */
export function useUserCollection() {
  const fireUXConfig = useFireUXConfig()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const local = fetchAppUsers(fireUXConfig.appId, fireUXConfig.isTenant, () =>
    firestoreFetchCollection<AppUser>(`apps/${fireUXConfig.appId}/users`)
  )
  const fulfilled = fulfillAppUsers(local, (id: string) =>
    firestoreFetchDoc<User>('users', id)
  )

  let globalSource: Ref<User[] | undefined> | null = null
  const loadGlobalUsers = () => {
    if (!globalSource) {
      globalSource = firestoreFetchCollection<User>('users')
    }
    return globalSource
  }

  // Non-tenant runtimes rely entirely on global users
  if (!fireUXConfig.isTenant) {
    loadGlobalUsers()
  }

  const global = computed<EnrichedUser[]>(() =>
    normalizeUsers(globalSource?.value)
  )

  const users = computed<EnrichedUser[]>(() => {
    if (fulfilled) {
      const scoped = fulfilled.value ?? []
      if (scoped.length) return scoped
    }
    if (!fireUXConfig.isTenant) {
      return global.value
    }
    return []
  })

  return {
    local,
    fulfilled,
    global,
    loadGlobalUsers,
    users,
  }
}

function fetchAppUsers(
  appId: string | null,
  isTenant: boolean,
  makeFetcher: () => CollectionRef<AppUser>
) {
  if (!isTenant || !appId) return null
  return makeFetcher()
}

function fulfillAppUsers(
  local: CollectionRef<AppUser> | null,
  fetchUser: (id: string) => Ref<User | undefined>
) {
  if (!local) return null

  const userCache = new Map<string, Ref<User | null | undefined>>()

  const getCoreUser = (id: string) => {
    if (!userCache.has(id)) {
      userCache.set(id, fetchUser(id))
    }
    return userCache.get(id)!
  }

  return computed<EnrichedUser[]>(() => {
    const members = local.value ?? []
    if (!members.length) return []

    return members
      .map((member) => {
        const coreUser = getCoreUser(member.id)
        const record = coreUser.value
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
}

function normalizeUsers(source?: User[] | null): EnrichedUser[] {
  if (!source?.length) return []
  return source
    .filter((entry): entry is User => Boolean(entry?.id))
    .map((entry) => ({
      id: entry.id,
      display_name: entry.display_name ?? entry.id,
      avatar: entry.avatar ?? '',
      handle: entry.handle,
      email: entry.email,
      profiles: entry.profiles ?? [],
      coreUser: entry,
      appUser: null,
    }))
}
