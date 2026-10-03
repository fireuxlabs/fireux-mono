import { getRouterParam, setResponseHeaders, type H3Event } from 'h3'
import { UserNotificationStorage } from '../../models/user-notification.model'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requirePathSegment } from '../../../server/utils/ids/path'

export async function markUserNotificationRead(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const notificationId = requirePathSegment(
    getRouterParam(event, 'notificationId'),
    'Notification id'
  )

  await getRuntimeFirestore()
    .collection('users')
    .doc(uid)
    .collection(UserNotificationStorage.collection)
    .doc(notificationId)
    .update({ read: true })

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return { ok: true as const, uid, notificationId, read: true }
}
