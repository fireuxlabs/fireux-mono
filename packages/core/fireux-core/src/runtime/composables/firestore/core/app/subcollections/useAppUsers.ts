// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts
import { computed, reactive, watch, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'

import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

type CoreUserRecord = Omit<User, 'appUser'>

/**
 * Returns `users` merged from:
 * - apps/{appId}/users/{uid}
 * - users/{uid}
 *
 * App fields override core fields.
 */
export function useAppUsers() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  // Fetch app-level users
  const appUsers = firestoreFetchCollection<AppUser>(`apps/${appId}/users`)

  // Map of core user subscriptions
  const coreMap = reactive(
    new Map<string, Ref<CoreUserRecord | null | undefined>>()
  )

  function syncCoreRefs(list: AppUser[] | undefined | null) {
    const ids = new Set((list ?? []).map((u) => u.id).filter(Boolean))

    for (const uid of ids) {
      if (!coreMap.has(uid)) {
        const ref = doc(db, 'users', uid)
        const { data } = useDocument<CoreUserRecord>(ref)
        coreMap.set(uid, data)
      }
    }

    for (const key of Array.from(coreMap.keys())) {
      if (!ids.has(key)) coreMap.delete(key)
    }
  }

  // Watch for ids and subscribe to each matching core user doc
  watch(appUsers, (list) => syncCoreRefs(list), { immediate: true })

  function fetchAll() {
    syncCoreRefs(appUsers.value)
    return appUsers.value
  }

  // Merge core + app users (app overrides)
  const users = computed<User[]>(() => {
    const list = appUsers.value ?? []
    return list
      .map((appUser) => {
        const core = coreMap.get(appUser.id)?.value ?? null
        if (!core) return null
        return {
          ...core,
          role: appUser.role ?? core.role,
          appUser,
        } as User
      })
      .filter((entry): entry is User => entry !== null)
  })

  return { users, fetchAll }
}
