import type { AppUserRole } from './app-user.model'

export type AppUserJoinedSource = {
  firebase_project_id: string
  database_id: string
  project_id: string
  ecosystem_id: string
  app_id: string
}

export type AppUserJoinedPublicationV1 = {
  version: 1
  event_id: string
  source: AppUserJoinedSource
  user_id: string
  membership_role: AppUserRole
  occurred_at: string
}

