import { useNuxtApp } from '#imports'
import { computed, isRef, onScopeDispose, shallowRef, watch, type Ref } from 'vue'
import {
  UserAppStorage,
  UserStorage,
  type UserApp,
  type User,
} from '../../../../../../models/core/user.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreCollectionState } from '../../../operations/useFirestoreCollection'
import {
  useFirestoreRead,
  type FirestoreReadRef,
} from '../../../operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../../vuefire'

type EnrichedUser = {
  id: string
  display_name: string
  avatar: string
  handle?: string
  profiles?: string[]
  appUser?: UserApp | null
  coreUser?: User | null
}

type AppUserCollectionAppId =
  | string
  | null
  | undefined
  | Ref<string | null | undefined>

/**
 * Streams `/apps/{appId}/users` from the app database and hydrates each
 * membership with `/users/{id}` from the ecosystem identity database.
 * Uses the runtime app by default, but can read an explicit app when needed.
 */
export function useAppUserCollection(appId?: AppUserCollectionAppId) {
  const { appId: runtimeAppId } = useFireUXConfig()
  const appRead = useFirestoreRead()
  const identityRead = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const nuxtApp = useNuxtApp()

  const resolvedAppId = computed(() => {
    const value = isRef(appId) ? appId.value : appId
    return String(value ?? runtimeAppId ?? '').trim()
  })

  const membershipPath = computed(() =>
    resolvedAppId.value
      ? `${AppStorage.collection}/${resolvedAppId.value}/${UserAppStorage.collection}`
      : ''
  )
  const membershipSource = appRead.firestoreFetchCollection<UserApp>(
    membershipPath
  )

  const memberships = computed<UserApp[]>(() => membershipSource.value ?? [])
  const membershipIds = computed(() =>
    Array.from(
      new Set(
        memberships.value
          .map((member) => String(member?.id ?? '').trim())
          .filter(Boolean)
      )
    )
  )

  const userCache = shallowRef(new Map<string, FirestoreReadRef<User>>())

  const stopUserRead = (source: FirestoreReadRef<User>) => {
    source.stop(() => undefined)
  }

  const reconcileUserCache = (ids: string[]) => {
    const current = userCache.value
    const next = new Map<string, FirestoreReadRef<User>>()
    const activeIds = new Set(ids)

    for (const [id, source] of current) {
      if (!activeIds.has(id)) stopUserRead(source)
    }

    for (const id of ids) {
      const existing = current.get(id)
      const source = existing ?? nuxtApp.runWithContext(() =>
        identityRead.firestoreFetchDoc<User>(UserStorage.rootCollection, id)
      )
      next.set(id, source)
    }

    userCache.value = next
  }

  watch(
    membershipIds,
    reconcileUserCache,
    { immediate: true, flush: 'sync' }
  )

  onScopeDispose(() => {
    for (const source of userCache.value.values()) stopUserRead(source)
    userCache.value.clear()
  })

  const fulfilled = computed<EnrichedUser[]>(() => {
    const entries = memberships.value
    if (!entries.length) return []

    const enriched: EnrichedUser[] = []
    for (const member of entries) {
      const memberId = String(member?.id ?? '').trim()
      if (!memberId) continue

      const record = userCache.value.get(memberId)?.value
      if (!record) continue
      const recordId = String((record as any).id ?? memberId).trim() || memberId

      const coreUser = { ...(record as any), id: recordId } as User

      enriched.push({
        id: recordId,
        display_name: record.display_name ?? recordId,
        avatar: record.avatar ?? '',
        handle: record.handle,
        profiles: [...(record.profiles ?? [])],
        appUser: member,
        coreUser,
      })
    }

    return enriched
  })

  const count = computed(() => fulfilled.value.length)
  const pending = computed(() => {
    if (membershipSource.pending.value) return true
    return membershipIds.value.some((id) => {
      const source = userCache.value.get(id)
      return !source || source.pending.value
    })
  })
  const error = computed<unknown | undefined>(() => {
    if (membershipSource.error.value) return membershipSource.error.value
    for (const id of membershipIds.value) {
      const failure = userCache.value.get(id)?.error.value
      if (failure) return failure
    }
    return undefined
  })
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => Boolean(resolvedAppId.value)),
    count,
    error,
    pending,
  })

  return {
    appId: resolvedAppId,
    memberships,
    users: fulfilled,
    fulfilled,
    pending,
    error,
    outcome,
    count,
  }
}
