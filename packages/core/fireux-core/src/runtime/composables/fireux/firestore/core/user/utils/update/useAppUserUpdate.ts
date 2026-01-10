import { addDoc, collection } from 'firebase/firestore'
import type { UserNotification } from '../../../../../../../models/core/user.supporting'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import {
  createUserNotification,
  ensureUserAppMembership,
  removeUserAppMembership,
} from '../ensureHelpers'
import { useFirestore } from 'vuefire'

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
      await ensureUserAppMembership(appId, uid, makeAdmin ? 'admin' : 'user')
    },
    leave: async () => {
      const { uid, appId } = requireContext()
      await removeUserAppMembership(appId, uid)
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
