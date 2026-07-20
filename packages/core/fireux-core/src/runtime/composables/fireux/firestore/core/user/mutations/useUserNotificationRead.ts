// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: add the owner-only notification read mutation.
import { doc, updateDoc } from 'firebase/firestore'
import {
  UserNotificationStorage,
  UserStorage,
} from '../../../../../../models/core/user.model'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import {
  readRuntimeIdentityFirestoreDatabaseId,
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
  const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())

  const markRead = async (notificationId: string) => {
    const user = await useRequireUser()
    if (user.isAnonymous) {
      throw new Error('Sign in to update notifications.')
    }

    await updateDoc(
      doc(
        identityDb,
        UserStorage.rootCollection,
        user.uid,
        UserNotificationStorage.collection,
        requireNotificationId(notificationId)
      ),
      { read: true }
    )
  }

  return { markRead }
}
