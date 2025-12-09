import { arrayUnion, arrayRemove } from 'firebase/firestore'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type {
  AppUser,
  User,
  UserNotification,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from '../fetch/useUserFetch.ts'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { createUserNotification } from '../utils/ensureHelpers.ts'

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
      await updateDocument(`apps/${activeAppId}/users`, appDocId, { role })
    },
    setAdminCascaded: async (makeAdmin) => {
      const { appDocId, appId: activeAppId } = requireAppContext()

      const role: AppUser['role'] = makeAdmin ? 'admin' : 'user'

      // Update app-scoped user role
      await updateDocument(`apps/${activeAppId}/users`, appDocId, { role })

      // Update app admin_ids
      await updateDocument<App>(`apps`, activeAppId, {
        admin_ids: (makeAdmin
          ? arrayUnion(appDocId)
          : arrayRemove(appDocId)) as unknown as App['admin_ids'],
      })

      // Update core user adminOf mirror
      await updateDocument<User>('users', appDocId, {
        adminOf: (makeAdmin
          ? arrayUnion(activeAppId)
          : arrayRemove(activeAppId)) as unknown as string[],
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
