// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts
import { computed, reactive, watch } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'

import type {
  AppUserDoc,
  CoreUserDoc,
} from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Returns `users` merged from:
 * - apps/{appId}/users/{uid}
 * - core-users/{uid}
 *
 * App fields override core fields.
 */
export function useAppUsers() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  // Fetch app-level users
  const appUsers = firestoreFetchCollection<AppUserDoc>(`apps/${appId}/users`)

  // Map of core user subscriptions
  const coreMap = reactive(
    new Map<string, ReturnType<typeof useDocument<CoreUserDoc>>['data']>()
  )

  function syncCoreRefs(list: AppUserDoc[] | undefined | null) {
    const ids = new Set((list ?? []).map((u) => u.id).filter(Boolean))

    for (const uid of ids) {
      if (!coreMap.has(uid)) {
        const ref = doc(db, 'core-users', uid)
        const { data } = useDocument<CoreUserDoc>(ref)
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
  const users = computed(() => {
    const list = appUsers.value ?? []
    return list.map((appUser) => {
      const core = coreMap.get(appUser.id)?.value ?? {}
      return { id: appUser.id, ...core, ...appUser }
    })
  })

  return { users, fetchAll }
}
