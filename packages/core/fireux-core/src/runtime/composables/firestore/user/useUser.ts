import { computed, shallowRef, watchEffect, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreRead } from '../useFirestoreRead'
import { useUserComputed } from './useUserComputed'
import { useUserEnsure } from './useUserEnsure'
import { useUserDelete } from './useUserDelete'
import { useUserState } from '../../state/useUserState'
import {
  toUser,
  type User,
  type CoreUserDoc,
  type AppUserDoc,
} from '../../../models/core/user.model'
import type { User as FirebaseUser } from 'firebase/auth'
import { useUserUpdate } from './useUserUpdate'
import { useUserFormattingAndValidation } from './useUserFormattingAndValidation'

export function useUser() {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  // Auth user (SSR-safe: null ref on server)
  const authUser: Ref<FirebaseUser | null> = import.meta.client
    ? (useCurrentUser() as Ref<FirebaseUser | null>)
    : shallowRef<FirebaseUser | null>(null)

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

  // Flattened current user (app > core > base)
  const user = computed<User | null>(() => {
    if (!uid.value) return null
    const core = coreDoc.value ?? null
    const app = isTenant && appId ? appDoc.value ?? null : null
    return toUser(core, app, uid.value)
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

  let collectionGlobal = isTenant
    ? null
    : firestoreFetchCollection('core-users')

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
    ...useUserUpdate(user),
    ...useUserFormattingAndValidation(),
  }
}
