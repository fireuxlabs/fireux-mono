import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { UserStorage } from '../../../../models/core/user.model'
import { UserNotificationStorage } from '../../../../models/operations/user-notification.model'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'

const MAX_VISIBLE_NOTIFICATIONS = 50

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const snapshot = await getRuntimeFirestore()
    .collection(UserStorage.collection)
    .doc(uid)
    .collection(UserNotificationStorage.collection)
    .orderBy('created.at', 'desc')
    .limit(MAX_VISIBLE_NOTIFICATIONS)
    .get()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true,
    notifications: snapshot.docs.map((document) => {
      const data = document.data()
      const createdAt = data.created?.at
      return {
        id: document.id,
        message: String(data.message ?? ''),
        scope: data.scope === 'ecosystem' ? 'ecosystem' : 'app',
        created: {
          at: {
            seconds: Number(createdAt?.seconds ?? 0),
            nanoseconds: Number(createdAt?.nanoseconds ?? 0),
          },
          app_id: String(data.created?.app_id ?? ''),
        },
        read: data.read === true,
      }
    }),
  }
})
