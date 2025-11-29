import { computed } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

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

  const global = computed(() => globalSource?.value ?? [])

  const users = computed(() => {
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

  return computed(() => {
    const members = local.value ?? []
    if (!members.length) return []

    return members.map((member) => {
      const coreUser = getCoreUser(member.id)
      const coreSnapshot = coreUser.value ?? null

      const fallbackUser: User = {
        id: member.id,
        display_name: member.id,
        avatar: '',
        created_at: member.created_at,
        updated_at: member.updated_at,
      } as User

      const base = coreSnapshot ? { ...coreSnapshot } : fallbackUser

      return {
        ...base,
        avatar: base.avatar || '',
        display_name: base.display_name || member.id,
        role: member.role ?? base.role,
        appUser: member,
        coreUser: coreSnapshot,
      }
    })
  })
}
