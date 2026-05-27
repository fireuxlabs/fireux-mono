import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    increment,
} from 'firebase/firestore'
import {
    readRuntimeIdentityFirestoreDatabaseId,
    useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { UserNotification } from '../../../../../../../models/core/supporting/user'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { useFirestoreDelete } from '../../../../operations/useFirestoreDelete'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import type { UserRefs } from '../../fetch/useUserFetch'
import { createUserNotification } from '../createHelpers'

type AppMembershipActions = {
  /** Single, canonical role toggle (admin <-> user). */
  setAdmin: (makeAdmin: boolean) => Promise<void>

  /** App-scoped premium entitlement. */
  setPremium: (isPremium: boolean) => Promise<void>

  /** Leaves the current app (removes membership overlay + mirrors). */
  leave: () => Promise<void>
}

type AppNotificationActions = {
  /** Writes non-membership notifications. */
  push: (message: string) => Promise<UserNotification>
}

export function useAppUserUpdate(user: UserRefs) {
  const cfg = useFireUXConfig()
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const appDb = useFirestore()
  const identityDb = useFirestore(identityDatabaseId)
  const appUpdate = useFirestoreUpdate()
  const identityUpdate = useFirestoreUpdate({ databaseId: identityDatabaseId })
  const { deleteDocument } = useFirestoreDelete()

  const requireContext = () => {
    const uid = user.coreUser?.value?.id ?? user.user?.value?.id
    if (!uid) throw new Error('[useAppUserUpdate] Missing core user uid')

    const appId = cfg.appId
    if (!appId) throw new Error('[useAppUserUpdate] Missing appId')

    return { uid, appId }
  }

  const membership: AppMembershipActions = {
    setAdmin: async (makeAdmin) => {
      const { uid, appId } = requireContext()
      const role = makeAdmin ? 'admin' : 'user'

      await appUpdate.updateDocument(`apps/${appId}/users`, uid, { role })

      await appUpdate.updateDocument('apps', appId, {
        admin_ids: makeAdmin
          ? (arrayUnion(uid) as unknown as string[])
          : (arrayRemove(uid) as unknown as string[]),
      })

      await identityUpdate.updateDocument('users', uid, {
        userOf: arrayUnion(appId) as unknown as string[],
        adminOf: makeAdmin
          ? (arrayUnion(appId) as unknown as string[])
          : (arrayRemove(appId) as unknown as string[]),
      })
    },
    setPremium: async (isPremium) => {
      const { uid, appId } = requireContext()
      await appUpdate.updateDocument(`apps/${appId}/users`, uid, {
        is_premium: Boolean(isPremium),
      })
    },
    leave: async () => {
      const { uid, appId } = requireContext()

      const appUserRef = doc(appDb, 'apps', appId, 'users', uid)
      const appUserSnap = await getDoc(appUserRef)
      const existed = appUserSnap.exists()

      await deleteDocument(`apps/${appId}/users`, uid)

      await appUpdate.updateDocument('apps', appId, {
        admin_ids: arrayRemove(uid) as unknown as string[],
        ...(existed ? { 'derived.user_count': increment(-1) } : {}),
      })

      await identityUpdate.updateDocument('users', uid, {
        userOf: arrayRemove(appId) as unknown as string[],
        adminOf: arrayRemove(appId) as unknown as string[],
      })
    },
  }

  const notifications: AppNotificationActions = {
    push: async (message) => {
      const { uid, appId } = requireContext()

      const notification: UserNotification = createUserNotification({
        message,
        scope: 'app',
        appId,
      })

      await addDoc(collection(identityDb, 'users', uid, 'notifications'), notification)

      return notification
    },
  }

  return {
    membership,
    notifications,
  }
}
