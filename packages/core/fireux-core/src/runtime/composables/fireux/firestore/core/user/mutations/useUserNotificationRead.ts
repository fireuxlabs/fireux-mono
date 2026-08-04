// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: add the owner-only notification read mutation.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: resolve the owner notification writer only when mark-read runs.
import { doc, updateDoc } from 'firebase/firestore'
import { UserStorage } from '../../../../../../models/core/user.model'
import { UserNotificationStorage } from '../../../../../../models/operations/user-notification.model'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import {
  readRuntimeFirestoreDatabaseId,
  useFirestore,
} from '../../../vuefire'

function requireNotificationId(value: unknown) {
  const id = String(value ?? '').trim()
  if (!id || id.includes('/')) {
    throw new Error('Notification id is invalid.')
  }
  return id
}

export function useUserNotificationRead() {
  const appDatabaseId = readRuntimeFirestoreDatabaseId()

  const markRead = async (notificationId: string) => {
    const appDb = useFirestore(appDatabaseId)
    const user = await useRequireUser()
    if (user.isAnonymous) {
      throw new Error('Sign in to update notifications.')
    }

    await updateDoc(
      doc(
        appDb,
        UserStorage.collection,
        user.uid,
        UserNotificationStorage.collection,
        requireNotificationId(notificationId)
      ),
      { read: true }
    )
  }

  return { markRead }
}
