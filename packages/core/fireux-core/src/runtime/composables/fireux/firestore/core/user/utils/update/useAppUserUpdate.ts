import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    increment,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { UserNotification } from '../../../../../../../models/core/supporting/user'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { useFirestoreDelete } from '../../../../operations/useFirestoreDelete'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import type { UserRefs } from '../../fetch/useUserFetch'
import { createUserNotification } from '../ensureHelpers'

type AppMembershipActions = {
  /** Single, canonical role toggle (admin <-> user). */
  setAdmin: (makeAdmin: boolean) => Promise<void>

  /** Leaves the current app (removes membership overlay + mirrors). */
  leave: () => Promise<void>
}

type AppNotificationActions = {
  /** Writes non-membership notifications. */
  push: (message: string) => Promise<UserNotification>
}

export function useAppUserUpdate(user: UserRefs) {
  const cfg = useFireUXConfig()
  const db = useFirestore()
  const { updateDocument } = useFirestoreUpdate()
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

      await updateDocument(`apps/${appId}/users`, uid, { role })

      await updateDocument('apps', appId, {
        admin_ids: makeAdmin
          ? (arrayUnion(uid) as unknown as string[])
          : (arrayRemove(uid) as unknown as string[]),
      })

      await updateDocument('users', uid, {
        userOf: arrayUnion(appId) as unknown as string[],
        adminOf: makeAdmin
          ? (arrayUnion(appId) as unknown as string[])
          : (arrayRemove(appId) as unknown as string[]),
      })
    },
    leave: async () => {
      const { uid, appId } = requireContext()

      const appUserRef = doc(db, 'apps', appId, 'users', uid)
      const appUserSnap = await getDoc(appUserRef)
      const existed = appUserSnap.exists()

      await deleteDocument(`apps/${appId}/users`, uid)

      await updateDocument('apps', appId, {
        admin_ids: arrayRemove(uid) as unknown as string[],
        ...(existed ? { 'derived.user_count': increment(-1) } : {}),
      })

      await updateDocument('users', uid, {
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

      await addDoc(collection(db, 'users', uid, 'notifications'), notification)

      return notification
    },
  }

  return {
    membership,
    notifications,
  }
}
