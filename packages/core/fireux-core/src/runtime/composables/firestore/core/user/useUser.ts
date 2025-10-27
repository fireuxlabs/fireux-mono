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
import { useScopedCollection } from '../../utils/useScoped.ts'
import { useUserComputed } from './useUserComputed.ts'

import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

type CoreUserRecord = Omit<User, 'appUser'>

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
  const coreDoc = getDocData<CoreUserRecord>(db, () =>
    uid.value ? `users/${uid.value}` : null
  )

  const appDoc = getDocData<AppUser>(db, () =>
    isTenant && appId && uid.value ? `apps/${appId}/users/${uid.value}` : null
  )

  const user = computed<User | null>(() =>
    mergeUser(coreDoc.value, appDoc.value, isTenant)
  )

  // --- collection listing (auto scopes to tenant/global)
  const scopedCollection = useScopedCollection<CoreUserRecord, AppUser>({
    corePath: 'users',
    appPath: (targetAppId: string) => `apps/${targetAppId}/users`,
  })

  const collection = computed<User[]>(() => {
    const list = scopedCollection.collection.value
    if (!Array.isArray(list) || !list.length) return []
    return list as unknown as User[]
  })

  type UserCollectionRef = typeof collection & {
    local: typeof scopedCollection.local
    global: typeof scopedCollection.global
    loading: typeof scopedCollection.loading
    context: typeof scopedCollection.context
  }

  const extendedCollection = Object.assign(collection, {
    local: scopedCollection.local,
    global: scopedCollection.global,
    loading: scopedCollection.loading,
    context: scopedCollection.context,
  }) as UserCollectionRef

  // --- computed helpers (cta, pills, etc.)
  const computedHelpers = useUserComputed(user)

  // --- on-demand fetch by id (same merge rules)
  function fetchedUser(id: string) {
    const idRef = computed(() => id)
    const core = getDocData<CoreUserRecord>(db, () =>
      idRef.value ? `users/${idRef.value}` : null
    )
    const app = getDocData<AppUser>(db, () =>
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
    fetchedUser,
    collection: extendedCollection,
    ...computedHelpers,
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
  core: CoreUserRecord | null | undefined,
  app: AppUser | null | undefined,
  isTenant: boolean
): User | null {
  if (!core) return null
  return {
    ...core,
    role: isTenant ? app?.role ?? core.role : core.role,
    appUser: isTenant ? app ?? null : null,
  }
}
