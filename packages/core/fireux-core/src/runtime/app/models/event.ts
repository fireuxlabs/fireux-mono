import type { FirebaseTimestamp } from '../../../types/firebase'
import type { AppUserRole } from './app-user.model.ts'

export const AppEventStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/events/{eventId}',
  collection: 'events',
  parent: 'app',
  idParam: 'eventId',
} as const

export const AppEventNames = {
  userJoined: 'app.user.joined',
} as const

export type AppEventName =
  (typeof AppEventNames)[keyof typeof AppEventNames]

export interface AppEvent {
  id: string
  name: AppEventName
  version: 1
  app_id: string
  ecosystem_id: string
  source: 'identity'
  subject: {
    kind: 'user'
    id: string
  }
  actor: {
    kind: 'user'
    id: string
  }
  payload: {
    user_id: string
    membership_role: AppUserRole
  }
  occurred_at: FirebaseTimestamp
  published_at: FirebaseTimestamp
}

export function appUserJoinedEventId(
  userId: string,
  occurrenceKey = 'initial'
): string {
  const normalizedOccurrence = occurrenceKey.replaceAll(/[^a-zA-Z0-9_-]/g, '')
  return `user-joined-${userId}-${normalizedOccurrence || 'initial'}`
}
