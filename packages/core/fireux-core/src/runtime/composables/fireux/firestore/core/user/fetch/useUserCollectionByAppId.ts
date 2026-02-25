import { computed, watch, isRef, type Ref } from 'vue'
import { useNuxtApp } from '#imports'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useAppUsersByAppId } from '../../app/fetch/useAppUsersByAppId'
import type { User, AppUser } from '../../../../../../models/core/user.model'

type EnrichedUser = {
  id: string
  coreUser?: User | null
  appUser?: AppUser | null
}

/**
 * Hydrates `/apps/{appId}/users` entries with their `/users/{id}` records.
 * This version is route/app-driven (not bound to FireUXConfig.appId).
 */
export function useUserCollectionByAppId(
  appId: string | null | undefined | Ref<string | null | undefined>
) {
  const resolvedAppId = computed(() => (isRef(appId) ? appId.value : appId) ?? null)

  const { firestoreFetchDoc } = useFirestoreRead()

  const { users: appUsers, pending } = useAppUsersByAppId(resolvedAppId.value)

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
        coreUser,
        appUser: member,
      })
    }

    return enriched
  })

  return {
    users: fulfilled,
    fulfilled,
    pending,
  }
}
