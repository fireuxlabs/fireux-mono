import { setResponseHeaders, type H3Event } from 'h3'
import { UserNotificationStorage } from '../../models/user-notification.model'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'

const MAX_VISIBLE_NOTIFICATIONS = 50

export async function readUserNotifications(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const collection = getRuntimeFirestore()
    .collection('users')
    .doc(uid)
    .collection(UserNotificationStorage.collection)
  const [snapshot, unread] = await Promise.all([
    collection
      .orderBy('created.at', 'desc')
      .limit(MAX_VISIBLE_NOTIFICATIONS)
      .get(),
    collection.where('read', '==', false).count().get(),
  ])

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true,
    unreadCount: unread.data().count,
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
}
