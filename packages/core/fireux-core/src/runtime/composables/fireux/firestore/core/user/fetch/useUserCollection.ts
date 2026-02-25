import { computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useNuxtApp } from '#imports'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useAppUsers } from '../../app/fetch/useAppUsers'
import type {
  User,
  AppUser,
} from '../../../../../../models/core/user.model'

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

  const nuxtApp = useNuxtApp()
  const userCache = new Map<string, Ref<User | undefined>>()
  const ensureCoreUser = (id?: string | null) => {
    if (!id) return undefined
    if (!userCache.has(id)) {
      const ref = nuxtApp.runWithContext(() =>
        firestoreFetchDoc<User>('users', id)
      ) as Ref<User | undefined>
      userCache.set(id, ref)
    }
    return userCache.get(id)
  }

  watch(
    () => (appUsers.value ?? []).map((member) => member?.id).filter(Boolean),
    (ids: string[]) => {
      ids.forEach((id: string) => ensureCoreUser(id))
    },
    { immediate: true }
  )

  const fulfilled = computed<EnrichedUser[]>(() => {
    const members = appUsers.value ?? []
    if (!members.length) return []

    const enriched: EnrichedUser[] = []
    for (const member of members) {
      const memberId = String(member?.id ?? '').trim()
      if (!memberId) continue

      const record = ensureCoreUser(memberId)?.value
      if (!record) continue
      const recordId = String((record as any).id ?? memberId).trim() || memberId

      const coreUser = { ...(record as any), id: recordId } as User

      enriched.push({
        id: recordId,
        display_name: record.display_name ?? recordId,
        avatar: record.avatar ?? '',
        handle: record.handle,
        email: record.email,
        profiles: [...(record.profiles ?? [])],
        appUser: member,
        coreUser,
      })
    }
    return enriched
  })

  return {
    fulfilled,
    users: fulfilled,
    pending,
  }
}
