import { defineEventHandler, getRouterParam, setResponseHeaders, type H3Event, } from 'h3'
import { UserNotificationStorage } from '../../../../../user/models/user-notification.model.ts'
import { requireFirebaseBearerUser } from '../../../../utils/auth/bearer'
import { getRuntimeFirestore } from '../../../../utils/getRuntimeFirestore'
import { requirePathSegment } from '../../../../utils/ids/path'

export default defineEventHandler(async (event: H3Event) => {
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
  return { ok: true, notificationId, read: true }
})
