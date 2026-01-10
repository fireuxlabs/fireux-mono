// FILE: packages/core/fireux-core/src/runtime/models/core/user.supporting.ts

import type { FirebaseTimestamp } from '../../../types/firebase'

export type NotificationScope = 'ecosystem' | 'app'

export interface UserNotification {
  message: string
  scope: NotificationScope
  created_at: FirebaseTimestamp
  read: boolean
  app_id: string
}
