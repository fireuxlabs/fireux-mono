import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { AppUserJoinedSource } from 'fireux-core/runtime/app/models/user-joined-publication'
import type { AppUserRole } from 'fireux-core/runtime/app/models/app-user.model'

export const ProjectUserJoinStorage = {
  database: 'platform-directory',
  collection: 'project-user-monitor',
  document: 'current',
  maxItems: 200,
} as const

export type ProjectUserJoinRecord = {
  id: string
  version: 1
  event_id: string
  source: AppUserJoinedSource
  user_id: string
  membership_role: AppUserRole
  occurred_at: FirebaseTimestamp
  received_at: FirebaseTimestamp
}

export type ProjectUserJoinMonitor = {
  version: 1
  items: ProjectUserJoinRecord[]
  updated_at: FirebaseTimestamp
}

export type ProjectUserJoinFeedItem = {
  id: string
  event_id: string
  firebase_project_id: string
  database_id: string
  project_id: string
  ecosystem_id: string
  app_id: string
  user_id: string
  membership_role: AppUserRole
  occurred_at: string
}

export type ProjectUserJoinFeedResponse = {
  ok: true
  items: ProjectUserJoinFeedItem[]
  count: number
}
