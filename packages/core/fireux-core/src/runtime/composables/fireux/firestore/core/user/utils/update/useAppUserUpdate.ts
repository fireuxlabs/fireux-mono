import { arrayUnion, arrayRemove } from 'firebase/firestore'
import type { App } from '../../../../../../../models/core/app.model'
import type {
  AppUser,
  User,
  UserNotification,
} from '../../../../../../../models/core/user.model'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useFirestoreUpdate } from '../../../../operations/useFirestoreUpdate'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { createUserNotification, ensureUserAppMembership } from '../ensureHelpers'

type AppMembershipActions = {
  setRole: (role: 'user' | 'admin') => Promise<void>
  setAdminCascaded: (makeAdmin: boolean) => Promise<void>
}

type AppNotificationActions = {
  push: (message: string) => Promise<UserNotification>
}

export function useAppUserUpdate(user: UserRefs) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()
  const app = user.appUser as { value: AppUser | undefined }

  const requireAppContext = () => {
    const id = app.value?.id
    if (!appId || !id)
      throw new Error('[useAppUserUpdate] Missing appId or app user id')
    return { appDocId: id, appId }
  }

  const membership: AppMembershipActions = {
    setRole: async (role) => {
      const { appDocId, appId: activeAppId } = requireAppContext()
      await ensureUserAppMembership(activeAppId, appDocId, role, {
        appName: activeAppId,
      })
    },
    setAdminCascaded: async (makeAdmin) => {
      const { appDocId, appId: activeAppId } = requireAppContext()
      const role: AppUser['role'] = makeAdmin ? 'admin' : 'user'
      await ensureUserAppMembership(activeAppId, appDocId, role, {
        appName: activeAppId,
      })
    },
  }

  const notifications: AppNotificationActions = {
    push: async (message) => {
      const { appDocId, appId: activeAppId } = requireAppContext()
      const notification = createUserNotification({
        message,
        scope: 'app',
        appId: activeAppId,
      })
      await updateDocument<AppUser>(`apps/${activeAppId}/users`, appDocId, {
        notifications: arrayUnion(
          notification
        ) as unknown as UserNotification[],
      })
      return notification
    },
  }

  return {
    membership,
    notifications,
  }
}
