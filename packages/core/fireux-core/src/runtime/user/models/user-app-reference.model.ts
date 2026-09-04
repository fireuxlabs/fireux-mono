import type { FirebaseTimestamp } from '../../../types/firebase'

export const USER_APP_REFERENCE_PATH = 'users/{userId}/apps/{appId}' as const

/** Minimal locator for an AppUser relationship stored in another database. */
export type UserAppReference = {
  app_id: string
  database_id: string
  created: { at: FirebaseTimestamp }
  updated: { at: FirebaseTimestamp }
}
