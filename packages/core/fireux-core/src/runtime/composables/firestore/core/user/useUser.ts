// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUser.ts
import { computed, shallowRef, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from '../../operations/useFirestoreRead.ts'
import { useUserComputed } from './useUserComputed.ts'
import { useUserEnsure } from './useUserEnsure.ts'
import { useUserDelete } from './useUserDelete.ts'
import { useUserUpdate } from './useUserUpdate.ts'
import {
  toUser,
  type User,
  type CoreUserDoc,
  type AppUserDoc,
} from 'fireux-core/runtime/models/core/user.model.ts'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useUser() {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  // Auth user (SSR-safe: null ref on server)
  const authUser: Ref<import('firebase/auth').User | null> = import.meta.client
    ? (useCurrentUser() as Ref<import('firebase/auth').User | null>)
    : shallowRef<import('firebase/auth').User | null>(null)

  const uid = computed(() => authUser.value?.uid ?? null)

  // Core user doc
  const coreRef = computed<DocumentReference<CoreUserDoc> | null>(() =>
    uid.value
      ? (doc(db, 'core-users', uid.value) as DocumentReference<CoreUserDoc>)
      : null
  )
  const { data: coreDoc } = useDocument<CoreUserDoc>(coreRef)

  // App user doc (tenant scope)
  const appRef = computed<DocumentReference<AppUserDoc> | null>(() =>
    uid.value && isTenant && appId
      ? (doc(
          db,
          `apps/${appId}/users`,
          uid.value
        ) as DocumentReference<AppUserDoc>)
      : null
  )
  const { data: appDoc } = useDocument<AppUserDoc>(appRef)

  // Flatten: app overlay > core base
  const user = computed<User | null>(() => {
    if (!uid.value) return null
    const core = coreDoc.value ?? null
    const app = isTenant ? appDoc.value ?? null : null
    return toUser(core, app, uid.value)
  })

  // Collections (aligned naming)
  const collection = {
    local:
      isTenant && appId
        ? firestoreFetchCollection<AppUserDoc>(`apps/${appId}/users`)
        : null,
    global: !isTenant
      ? firestoreFetchCollection<CoreUserDoc>('core-users')
      : null,
    fetchGlobal() {
      // lazy getter pattern preserved (optional)
      return this.global
    },
  } as const

  return {
    user,
    collection,
    // helpers & services
    ...useUserComputed(user),
    ...useUserEnsure(user),
    ...useUserDelete(user),
    ...useUserUpdate(user),
  }
}