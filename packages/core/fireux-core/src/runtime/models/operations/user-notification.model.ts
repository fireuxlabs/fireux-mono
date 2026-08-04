import type { FirebaseTimestamp } from '../../../types/firebase'

export type UserNotificationScope = 'ecosystem' | 'app'

export interface UserNotification {
  message: string
  scope: UserNotificationScope
  created: {
    at: FirebaseTimestamp
    app_id: string
  }
  read: boolean
}

export const UserNotificationStorage = {
  shape: 'scoped',
  path: 'users/{userId}/notifications/{notificationId}',
  collection: 'notifications',
  parent: 'user',
  idParam: 'notificationId',
} as const
