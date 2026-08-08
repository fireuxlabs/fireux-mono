// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: add the owner-only notification read mutation.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: resolve the owner notification writer only when mark-read runs.
import { UserStorage } from '../../../../../../models/core/user.model'
import { UserNotificationStorage } from '../../../../../../models/operations/user-notification.model'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import { readRuntimeFirestoreDatabaseId } from '../../../vuefire'
import { useFirestoreClientUpdate } from '../../../operations/useFirestoreClientUpdate'
import { defineFirestoreMutationTarget } from '../../../../../../utils/firestore-mutations/targets'

function requireNotificationId(value: unknown) {
  const id = String(value ?? '').trim()
  if (!id || id.includes('/')) {
    throw new Error('Notification id is invalid.')
  }
  return id
}

export function useUserNotificationRead() {
  const appDatabaseId = readRuntimeFirestoreDatabaseId()
  const { updateDocument } = useFirestoreClientUpdate()

  const resolveDatabase = () =>
    appDatabaseId
      ? ({ kind: 'named', databaseId: appDatabaseId } as const)
      : ({ kind: 'runtime' } as const)

  const markRead = async (notificationId: string) => {
    const user = await useRequireUser()
    if (user.isAnonymous) {
      throw new Error('Sign in to update notifications.')
    }

    const target = defineFirestoreMutationTarget({
      key: 'runtime.user-notification',
      lane: 'client',
      verbs: ['update'],
      database: resolveDatabase(),
      collectionPath: `${UserStorage.collection}/${user.uid}/${UserNotificationStorage.collection}`,
    })

    await updateDocument(target, requireNotificationId(notificationId), {
      read: true,
    })
  }

  return { markRead }
}
