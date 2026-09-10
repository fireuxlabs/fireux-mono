import type { AppUserSummary, AppUserJoinRequestSummary } from './app-user-summary'

/** Administrative projection of apps/{appId}/users; this is not a Project Team. */
export type AppUsersResponse = {
  ok: true
  appId: string
  appUsers: AppUserSummary[]
  joinRequests: AppUserJoinRequestSummary[]
  truncated: boolean
}
