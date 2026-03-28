import { useNuxtApp } from '#imports'
import { computed, isRef, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type { AppUser, CoreUser } from '../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type EnrichedUser = {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  profiles?: string[]
  appUser?: AppUser | null
  coreUser?: CoreUser | null
}

type AppUserCollectionAppId =
  | string
  | null
  | undefined
  | Ref<string | null | undefined>

/**
 * Streams `/apps/{appId}/users` and hydrates each membership with `/users/{id}`.
 * Uses the runtime app by default, but can read an explicit app when needed.
 */
export function useAppUserCollection(appId?: AppUserCollectionAppId) {
  const { appId: runtimeAppId } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()
  const nuxtApp = useNuxtApp()

  const resolvedAppId = computed(() => {
    const value = isRef(appId) ? appId.value : appId
    return String(value ?? runtimeAppId ?? '').trim()
  })

  const membershipsRef = shallowRef(null) as ShallowRef<Ref<AppUser[] | undefined> | null>

  watch(
    resolvedAppId,
    (nextAppId) => {
      membershipsRef.value = nextAppId
        ? firestoreFetchCollection<AppUser>(`apps/${nextAppId}/users`)
        : null
    },
    { immediate: true }
  )

  const memberships = computed<AppUser[]>(() => membershipsRef.value?.value ?? [])
  const pending = computed(
    () => Boolean(resolvedAppId.value) && membershipsRef.value?.value === undefined
  )

  const userCache = new Map<string, Ref<CoreUser | undefined>>()

  const ensureCoreUser = (id?: string | null) => {
    if (!id) return undefined
    if (!userCache.has(id)) {
      const ref = nuxtApp.runWithContext(() =>
        firestoreFetchDoc<CoreUser>('users', id)
      ) as Ref<CoreUser | undefined>
      userCache.set(id, ref)
    }
    return userCache.get(id)
  }

  watch(
    () => memberships.value.map((member) => member?.id).filter(Boolean),
    (ids: string[]) => {
      ids.forEach((id: string) => ensureCoreUser(id))
    },
    { immediate: true }
  )

  const fulfilled = computed<EnrichedUser[]>(() => {
    const entries = memberships.value
    if (!entries.length) return []

    const enriched: EnrichedUser[] = []
    for (const member of entries) {
      const memberId = String(member?.id ?? '').trim()
      if (!memberId) continue

      const record = ensureCoreUser(memberId)?.value
      if (!record) continue
      const recordId = String((record as any).id ?? memberId).trim() || memberId

      const coreUser = { ...(record as any), id: recordId } as CoreUser

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

  const count = computed(() => fulfilled.value.length)

  return {
    appId: resolvedAppId,
    memberships,
    users: fulfilled,
    fulfilled,
    pending,
    count,
  }
}
