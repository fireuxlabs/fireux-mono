import { useNuxtApp } from '#imports'
import { computed, isRef, watch, type Ref } from 'vue'
import type { UserApp, UserCore } from '../../../../../../models/core/user.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useAppUsersByAppId } from '../../app/fetch/useAppUsersByAppId'

type EnrichedUser = {
  id: string
  coreUser?: UserCore | null
  appUser?: UserApp | null
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
  const userCache = new Map<string, Ref<UserCore | undefined>>()

  const ensureCoreUser = (id?: string | null) => {
    if (!id) return undefined
    if (!userCache.has(id)) {
      const ref = nuxtApp.runWithContext(() =>
        firestoreFetchDoc<UserCore>('users', id)
      ) as Ref<UserCore | undefined>
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

      const coreUser = { ...(record as any), id: recordId } as UserCore

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
