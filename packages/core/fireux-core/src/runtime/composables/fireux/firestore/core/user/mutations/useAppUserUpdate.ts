import { arrayUnion } from 'firebase/firestore'
import type {
  AppUser,
  UserNotification,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from '../main/useUserFetch.ts'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { createUserNotification } from '../utils/ensureHelpers.ts'

type AppMembershipActions = {
  setRole: (role: 'user' | 'admin') => Promise<void>
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
      await updateDocument(`apps/${activeAppId}/users`, appDocId, { role })
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
