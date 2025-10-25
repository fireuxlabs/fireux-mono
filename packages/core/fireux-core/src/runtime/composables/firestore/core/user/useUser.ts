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
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from 'fireux-core/runtime/models/core/user.model.ts'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

function resolveCurrentUser(): Ref<import('firebase/auth').User | null> {
  if (!import.meta.client) return shallowRef(null)
  try {
    return useCurrentUser() as Ref<import('firebase/auth').User | null>
  } catch {
    return shallowRef(null)
  }
}

export function useUser() {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const authUser = resolveCurrentUser()
  const uid = computed(() => authUser.value?.uid ?? null)

  // core-users/{uid}
  const coreRef = computed<DocumentReference<CoreUserDoc> | null>(() =>
    uid.value ? (doc(db, 'core-users', uid.value) as DocumentReference<CoreUserDoc>) : null
  )
  const { data: coreDoc } = useDocument<CoreUserDoc>(coreRef)

  // apps/{appId}/users/{uid} (tenant only)
  const appRef = computed<DocumentReference<AppUserDoc> | null>(() =>
    uid.value && isTenant && appId
      ? (doc(db, `apps/${appId}/users`, uid.value) as DocumentReference<AppUserDoc>)
      : null
  )
  const { data: appDoc } = useDocument<AppUserDoc>(appRef)

  /**
   * Final shape:
   * - Spread core into top-level
   * - Overlay app fields (role, avatar, etc.)
   * - Keep app nested for reference
   * - Drop `core`
   */
  const user = computed<User | null>(() => {
    const id = uid.value
    const core = coreDoc.value
    if (!id || !core) return null

    const app = isTenant ? appDoc.value ?? undefined : undefined

    return {
      id,
      ...core,        // 🔹 flatten all core fields
      app,            // 🔹 keep app nested for reference only
    }
  })

  // Collections
  const collection = {
    local: isTenant && appId ? firestoreFetchCollection<AppUserDoc>(`apps/${appId}/users`) : null,
    global: !isTenant ? firestoreFetchCollection<CoreUserDoc>('core-users') : null,
  } as const

  return {
    user,
    collection,
    ...useUserComputed(user),
    ...useUserEnsure(user),
    ...useUserDelete(user),
    ...useUserUpdate(user),
  }
}