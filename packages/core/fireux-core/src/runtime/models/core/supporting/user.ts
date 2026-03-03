// FILE: packages/core/fireux-core/src/runtime/models/core/supporting/user.ts

import type { FirebaseTimestamp } from '../../../../types/firebase'

export type NotificationScope = 'ecosystem' | 'app'

export interface UserNotification {
  message: string
  scope: NotificationScope
  created: {
    at: FirebaseTimestamp
    app_id: string
  }
  read: boolean
}
