import { computed, watchEffect, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreRead } from '../useFirestoreRead'
import { useUserComputed } from './useUserComputed'
import { useUserEnsure } from './useUserEnsure'
import { useUserDelete } from './useUserDelete'
import { useUserState } from '../../state/useUserState'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from '../../../models/core/user.model'

import { useUserUpdate } from './useUserUpdate'

export function useUser() {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const authUser = useCurrentUser() as Ref<{ uid: string } | null | undefined>
  const uid = computed(() => authUser.value?.uid || null)

  // Core user doc
  const coreRef = computed<DocumentReference<CoreUserDoc> | null>(() =>
    uid.value
      ? (doc(db, 'core-users', uid.value) as DocumentReference<CoreUserDoc>)
      : null
  )
  const { data: coreDoc } = useDocument<CoreUserDoc>(coreRef)

  // App user doc
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

  // Unified user (flattened; app > core > base), plus partitioned refs
  const user = computed<User | null>(() => {
    if (!uid.value) return null

    const base = { id: uid.value }
    const core = coreDoc.value ?? null
    const app = isTenant ? (appDoc.value ?? null) : undefined

    const flat = {
      ...base,
      ...(core ?? {}),
      ...(app ?? {}),
    }

    return {
      ...flat,
      core,
      app,
    } as User
  })

  // Mirror into Nuxt state
  const { user: userState } = useUserState()
  watchEffect(() => {
    userState.value = user.value
  })

  // Collections
  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionLocal =
    isTenant && appId ? firestoreFetchCollection(`apps/${appId}/users`) : null

  let collectionGlobal = !isTenant
    ? firestoreFetchCollection('core-users')
    : null

  function fetchGlobal() {
    if (!isTenant) return collectionGlobal
    collectionGlobal ??= firestoreFetchCollection('core-users')
    return collectionGlobal
  }

  return {
    user,
    collection: {
      local: collectionLocal,
      global: collectionGlobal,
      fetchGlobal,
    },
    ...useUserComputed(user),
    ...useUserEnsure(user),
    ...useUserDelete(user),
    ...useUserUpdate(user)
  }
}
