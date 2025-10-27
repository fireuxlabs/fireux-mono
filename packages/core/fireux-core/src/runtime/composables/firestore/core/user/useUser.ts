// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUser.ts
import { computed, type Ref } from 'vue'
import {
  doc,
  type DocumentReference,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'

import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from 'fireux-core/runtime/models/core/user.model.ts'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

/**
 * Core user composable.
 * Returns only:
 * - `user`: current runtime user (core flattened, app nested)
 * - `fetchedUser(id)`: fetch by ID on demand
 */
export function useUser() {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const { uid } = useAuth()

  // --- current user (core + optional app)
  const coreDoc = getDocData<CoreUserDoc>(db, () =>
    uid.value ? `core-users/${uid.value}` : null
  )

  const appDoc = getDocData<AppUserDoc>(db, () =>
    isTenant && appId && uid.value ? `apps/${appId}/users/${uid.value}` : null
  )

  const user = computed<User | null>(() =>
    mergeUser(coreDoc.value, appDoc.value, isTenant)
  )

  // --- on-demand fetch by id (same merge rules)
  function fetchedUser(id: string) {
    const idRef = computed(() => id)
    const core = getDocData<CoreUserDoc>(db, () =>
      idRef.value ? `core-users/${idRef.value}` : null
    )
    const app = getDocData<AppUserDoc>(db, () =>
      isTenant && appId && idRef.value
        ? `apps/${appId}/users/${idRef.value}`
        : null
    )
    const value = computed<User | null>(() =>
      mergeUser(core.value, app.value, isTenant)
    )
    return { user: value }
  }

  return { 
    user, 
    fetchedUser 
  }
}

/* --------------------------------- helpers -------------------------------- */

/** Generic “path → doc data” reader. Returns Ref<T | null | undefined> */
function getDocData<T>(db: Firestore, pathResolver: () => string | null) {
  const ref = computed(() => {
    const path = pathResolver()
    return path ? (doc(db, path) as DocumentReference<T>) : null
  })
  const { data } = useDocument<T>(
    ref as unknown as Ref<DocumentReference<DocumentData> | null>
  )
  return data // undefined while loading, null if missing, T when present
}

/**
 * Merge rule:
 * - Always flatten core fields into the User.
 * - In tenant mode, include `app` nested (role/overrides).
 * - If no core → return null.
 */
function mergeUser(
  core: CoreUserDoc | null | undefined,
  app: AppUserDoc | null | undefined,
  isTenant: boolean
): User | null {
  if (!core) return null
  return {
    ...core,
    app: isTenant ? app ?? undefined : undefined,
  }
}