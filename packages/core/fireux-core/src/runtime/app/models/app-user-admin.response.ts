import type { UserIdentitySummary } from '../../user/models/user-directory.model.ts'
import type { AppUserRole, AppUserSubscription } from './app-user.model.ts'

/** One AppUser enriched with the bounded User identity an administrator may see. */
export type AppUserAdminSummary = {
  id: string
  role: AppUserRole
  subscription: AppUserSubscription
  user: UserIdentitySummary | null
}

export type AppUserJoinRequestSummary = {
  id: string
  user: UserIdentitySummary | null
}

/** Administrative projection of apps/{appId}/users; this is not a Project Team. */
export type AppUserAdminResponse = {
  ok: true
  appId: string
  appUsers: AppUserAdminSummary[]
  joinRequests: AppUserJoinRequestSummary[]
  truncated: boolean
}
