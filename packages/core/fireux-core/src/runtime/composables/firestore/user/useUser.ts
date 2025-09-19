import { computed, watchEffect, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useUserComputed } from './useUserComputed'
import { useUserEnsure } from './useUserEnsure'
import { useUserState } from '../../state/useUserState'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from '../../../models/core/user.model'

export function useUser() {
  const db = useFirestore()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const authUser = useCurrentUser() as Ref<{ uid: string } | null | undefined>

  // Core user doc
  const coreUserRef = computed<DocumentReference<CoreUserDoc> | null>(() => {
    const uid = authUser.value?.uid
    return uid
      ? (doc(db, 'core-users', uid) as DocumentReference<CoreUserDoc>)
      : null
  })
  const { data: coreUserDoc } = useDocument<CoreUserDoc>(coreUserRef)

  // App user doc
  const appUserRef = computed<DocumentReference<AppUserDoc> | null>(() => {
    const uid = authUser.value?.uid
    if (!uid || !isTenant || !appId) return null
    return doc(db, `apps/${appId}/users`, uid) as DocumentReference<AppUserDoc>
  })
  const { data: appUserDoc } = useDocument<AppUserDoc>(appUserRef)

  // Unified user
  const user = computed<User | null>(() => {
    const uid = authUser.value?.uid
    if (!uid) return null
    return {
      id: uid,
      core: coreUserDoc.value ?? null,
      app: isTenant ? (appUserDoc.value ?? null) : undefined,
    }
  })

  // Mirror into global state
  const { user: userState } = useUserState()
  watchEffect(() => {
    userState.value = user.value
  })

  return {
    user,
    ...useUserComputed(user),
    ...useUserEnsure(user), // pass user ref down
  }
}
